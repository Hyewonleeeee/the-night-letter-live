export type LiveAutoTypingPlan = {
  fullSource: string;
  characterTimesMs: number[];
  durationMs: number;
};

type SourceLine = {
  text: string;
  start: number;
  end: number;
  cueAtSeconds: number | null;
  isRun: boolean;
};

type LineGroup = {
  kind: "header" | "cue" | "run";
  cueAtSeconds: number | null;
  lines: SourceLine[];
};

const cuePattern = /\.at\(\s*(\d+(?:\.\d+)?)\s*\)/;
const runPattern = /\.run\(\s*\)\s*;?\s*$/;

const characterDelay = (character: string, index: number) => {
  const jitter = (index * 17 + 13) % 11;
  if (character === "\n") return 145;
  if (/[;{}]/.test(character)) return 58;
  if (/[(),]/.test(character)) return 35;
  if (character === " ") return 13;
  return 20 + jitter;
};

const sourceLines = (source: string): SourceLine[] => {
  const rawLines = source.split("\n");
  let cursor = 0;
  return rawLines.map((line, index) => {
    const text = index < rawLines.length - 1 ? `${line}\n` : line;
    const cueMatch = line.match(cuePattern);
    const entry: SourceLine = {
      text,
      start: cursor,
      end: cursor + text.length,
      cueAtSeconds: cueMatch ? Number(cueMatch[1]) : null,
      isRun: runPattern.test(line),
    };
    cursor = entry.end;
    return entry;
  });
};

const groupLines = (lines: SourceLine[]) => {
  const groups: LineGroup[] = [];
  let reachedCue = false;

  lines.forEach((line) => {
    if (line.isRun) {
      groups.push({ kind: "run", cueAtSeconds: null, lines: [line] });
      return;
    }

    if (line.cueAtSeconds !== null) {
      reachedCue = true;
      const previous = groups.at(-1);
      if (previous?.kind === "cue" && previous.cueAtSeconds === line.cueAtSeconds) {
        previous.lines.push(line);
      } else {
        groups.push({ kind: "cue", cueAtSeconds: line.cueAtSeconds, lines: [line] });
      }
      return;
    }

    if (!reachedCue) {
      const header = groups[0];
      if (header?.kind === "header") header.lines.push(line);
      else groups.unshift({ kind: "header", cueAtSeconds: null, lines: [line] });
      return;
    }

    const previous = groups.at(-1);
    if (previous) previous.lines.push(line);
  });

  return groups;
};

export function buildLiveAutoTypingPlan(
  source: string,
  chapterDurationSeconds: number,
): LiveAutoTypingPlan {
  const durationMs = chapterDurationSeconds * 1000;
  const characterTimesMs = Array.from({ length: source.length }, () => 0);
  const groups = groupLines(sourceLines(source));
  let previousEndMs = 0;

  groups.forEach((group) => {
    const characters = group.lines.flatMap((line) => [...line.text].map((character, localIndex) => ({
      character,
      index: line.start + localIndex,
    })));
    let delays = characters.map(({ character, index }) => characterDelay(character, index));
    let typingDurationMs = delays.reduce((sum, delay) => sum + delay, 0);

    let startMs: number;
    if (group.kind === "header") {
      startMs = 260;
    } else if (group.kind === "run") {
      startMs = Math.max(previousEndMs + 240, durationMs - typingDurationMs - 900);
    } else {
      const cueAtMs = (group.cueAtSeconds ?? 0) * 1000;
      const earliestStartMs = previousEndMs + 140;
      const targetEndMs = cueAtMs - 180;
      const availableMs = targetEndMs - earliestStartMs;
      if (cueAtMs > 1_000 && availableMs > 0 && availableMs < typingDurationMs) {
        const paceScale = Math.max(0.42, availableMs / typingDurationMs);
        delays = delays.map((delay) => delay * paceScale);
        typingDurationMs = delays.reduce((sum, delay) => sum + delay, 0);
      }
      const desiredEndMs = cueAtMs <= 1
        ? previousEndMs + typingDurationMs + 160
        : targetEndMs;
      startMs = Math.max(earliestStartMs, desiredEndMs - typingDurationMs);
    }

    let elapsedMs = startMs;
    characters.forEach(({ index }, characterIndex) => {
      elapsedMs += delays[characterIndex];
      characterTimesMs[index] = Math.min(durationMs - 120, elapsedMs);
    });
    previousEndMs = Math.min(durationMs - 120, elapsedMs);
  });

  for (let index = 1; index < characterTimesMs.length; index += 1) {
    characterTimesMs[index] = Math.max(characterTimesMs[index], characterTimesMs[index - 1] + 1);
  }

  return { fullSource: source, characterTimesMs, durationMs };
}

export function getAutoTypedCharacterCount(plan: LiveAutoTypingPlan, elapsedMs: number) {
  let low = 0;
  let high = plan.characterTimesMs.length;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (plan.characterTimesMs[middle] <= elapsedMs) low = middle + 1;
    else high = middle;
  }
  return low;
}
