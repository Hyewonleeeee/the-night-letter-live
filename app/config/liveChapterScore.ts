import type { LiveVisualOperation } from "../lib/liveCoding";

export type LiveChapterScoreLine = {
  code: string;
  cueLabel?: string;
  operations?: LiveVisualOperation[];
};

export type LiveChapterScore = {
  id: string;
  title: string;
  trigger: string;
  leadInMs: number;
  lines: LiveChapterScoreLine[];
};

export type LiveChapterTypingPlan = {
  fullText: string;
  characterTimesMs: number[];
  lineRanges: Array<{ start: number; end: number }>;
  cueLines: Array<{
    lineIndex: number;
    endCharacter: number;
    label: string;
    operations: LiveVisualOperation[];
  }>;
  totalMs: number;
};

export const FIRST_SIGN_LIVE_CHAPTER: LiveChapterScore = {
  id: "first_sign",
  title: "THE FIRST SIGN",
  trigger: 'chapter("first_sign").run()',
  leadInMs: 360,
  lines: [
    { code: "// THE NIGHT LETTER / CHAPTER 03" },
    { code: 'const firstSign = chapter("THE_FIRST_SIGN");' },
    { code: "" },
    { code: 'firstSign.begin({ mood: "ordinary", certainty: 0 });' },
    {
      code: "camera.push(0.012, 8);",
      cueLabel: "CAMERA / BREATH",
      operations: [{ kind: "set", property: "cameraPush", value: 0.012, durationSeconds: 8 }],
    },
    { code: 'await firstSign.wait("the_handle");' },
    {
      code: "light.cool(0.028, 6);",
      cueLabel: "LIGHT / COOL",
      operations: [{ kind: "set", property: "coolAmount", value: 0.028, durationSeconds: 6 }],
    },
    {
      code: "grain.amount(0.008, 4);",
      cueLabel: "GRAIN / TENSION",
      operations: [{ kind: "set", property: "grainAmount", value: 0.008, durationSeconds: 4 }],
    },
    { code: "" },
    { code: 'await firstSign.observe("stone", { force: "unknown" });' },
    {
      code: "camera.push(0.024, 9);",
      cueLabel: "CAMERA / FOLLOW",
      operations: [{ kind: "set", property: "cameraPush", value: 0.024, durationSeconds: 9 }],
    },
    {
      code: "fog.opacity(0.040, 7);",
      cueLabel: "AIR / THIN",
      operations: [{ kind: "set", property: "fogOpacity", value: 0.04, durationSeconds: 7 }],
    },
    {
      code: "wind.amount(0.10, 6);",
      cueLabel: "WIND / UNEXPLAINED",
      operations: [{ kind: "set", property: "windAmount", value: 0.1, durationSeconds: 6 }],
    },
    { code: "" },
    { code: 'await firstSign.observe("flower", { wind: false });' },
    {
      code: "light.cool(0.046, 8);",
      cueLabel: "LIGHT / DOUBT",
      operations: [{ kind: "set", property: "coolAmount", value: 0.046, durationSeconds: 8 }],
    },
    {
      code: "fog.opacity(0.062, 8);",
      cueLabel: "AIR / HOLD",
      operations: [{ kind: "set", property: "fogOpacity", value: 0.062, durationSeconds: 8 }],
    },
    { code: "" },
    { code: 'firstSign.end({ answer: "unexplained" });' },
    {
      code: "grain.amount(0.014, 5);",
      cueLabel: "FRAME / REMAIN",
      operations: [{ kind: "set", property: "grainAmount", value: 0.014, durationSeconds: 5 }],
    },
  ],
};

export const LIVE_CHAPTERS: Record<string, LiveChapterScore> = {
  [FIRST_SIGN_LIVE_CHAPTER.id]: FIRST_SIGN_LIVE_CHAPTER,
};

export function buildLiveChapterTypingPlan(score: LiveChapterScore): LiveChapterTypingPlan {
  const fullText = score.lines.map((line) => line.code).join("\n");
  const characterTimesMs: number[] = [];
  const lineRanges: LiveChapterTypingPlan["lineRanges"] = [];
  let elapsedMs = score.leadInMs;
  let cursor = 0;

  for (let index = 0; index < fullText.length; index += 1) {
    const character = fullText[index];
    const jitter = (index * 17 + 11) % 9;
    const delay = character === "\n"
      ? 132
      : /[;{}]/.test(character)
        ? 55
        : /[(),]/.test(character)
          ? 34
          : character === " "
            ? 12
            : 17 + jitter;
    elapsedMs += delay;
    characterTimesMs.push(elapsedMs);
  }

  score.lines.forEach((line, index) => {
    const start = cursor;
    const end = start + line.code.length;
    lineRanges.push({ start, end });
    cursor = end + (index < score.lines.length - 1 ? 1 : 0);
  });

  const cueLines = score.lines.flatMap((line, lineIndex) => {
    if (!line.cueLabel || !line.operations?.length) return [];
    return [{
      lineIndex,
      endCharacter: lineRanges[lineIndex].end,
      label: line.cueLabel,
      operations: line.operations,
    }];
  });

  return {
    fullText,
    characterTimesMs,
    lineRanges,
    cueLines,
    totalMs: characterTimesMs.at(-1) ?? score.leadInMs,
  };
}

export function getRevealedCharacterCount(plan: LiveChapterTypingPlan, elapsedMs: number) {
  let low = 0;
  let high = plan.characterTimesMs.length;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (plan.characterTimesMs[middle] <= elapsedMs) low = middle + 1;
    else high = middle;
  }
  return low;
}

export function isLiveChapterTrigger(value: string) {
  const normalized = value.trim().replace(/;$/, "").replace(/\s+/g, "");
  return [
    'chapter("first_sign").run()',
    "chapter('first_sign').run()",
    "first_sign.run()",
  ].includes(normalized);
}
