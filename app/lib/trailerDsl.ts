import {
  TRAILER_CHAPTERS,
  TRAILER_KNOWN_CUES,
  type TrailerChapterId,
} from "../config/trailerConfig.ts";

export type TrailerCue = {
  atSeconds: number;
  command: string;
  label: string;
};

export type TrailerProgramResult =
  | { ok: true; chapterId: TrailerChapterId; cues: TrailerCue[] }
  | { ok: false; line: number; message: string };

const declarationPattern = /^const\s+([A-Za-z_$][\w$]*)\s*=\s*trailerChapter\(\s*["']([^"']+)["']\s*\)\s*;?$/;
const cuePattern = /^([A-Za-z_$][\w$]*)\.at\(\s*(\d+(?:\.\d+)?)\s*\)\.([A-Za-z_$][\w$]*)\(\s*["']([^"']+)["']\s*\)\s*;?$/;
const runPattern = /^([A-Za-z_$][\w$]*)\.run\(\s*\)\s*;?$/;

const isTrailerChapterId = (value: string): value is TrailerChapterId => value in TRAILER_CHAPTERS;

export function parseTrailerProgram(source: string): TrailerProgramResult {
  const lines = source.split(/\r?\n/);
  let variableName: string | null = null;
  let chapterId: TrailerChapterId | null = null;
  let hasRun = false;
  const cues: TrailerCue[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const statement = lines[index].replace(/\/\/.*$/, "").trim();
    if (!statement) continue;

    const declaration = statement.match(declarationPattern);
    if (declaration) {
      if (chapterId) return { ok: false, line: index + 1, message: "한 번에 한 챕터만 붙여 넣으세요." };
      if (!isTrailerChapterId(declaration[2])) return { ok: false, line: index + 1, message: `알 수 없는 예고편 챕터입니다: ${declaration[2]}` };
      variableName = declaration[1];
      chapterId = declaration[2];
      continue;
    }

    const run = statement.match(runPattern);
    if (run) {
      if (!variableName || run[1] !== variableName) return { ok: false, line: index + 1, message: "선언한 챕터 변수를 실행하세요." };
      hasRun = true;
      continue;
    }

    const cue = statement.match(cuePattern);
    if (cue) {
      if (!variableName || !chapterId || cue[1] !== variableName) return { ok: false, line: index + 1, message: "먼저 trailerChapter()를 선언하세요." };
      const atSeconds = Number(cue[2]);
      const label = cue[4];
      const duration = TRAILER_CHAPTERS[chapterId].endSeconds - TRAILER_CHAPTERS[chapterId].startSeconds;
      if (atSeconds < 0 || atSeconds >= duration) return { ok: false, line: index + 1, message: "큐 시간이 챕터 범위를 벗어났습니다." };
      if (!TRAILER_KNOWN_CUES[chapterId].has(label)) return { ok: false, line: index + 1, message: `등록되지 않은 큐입니다: ${label}` };
      cues.push({ atSeconds, command: cue[3], label });
      continue;
    }

    return { ok: false, line: index + 1, message: "허용되지 않은 예고편 명령입니다." };
  }

  if (!chapterId) return { ok: false, line: 1, message: "trailerChapter() 선언이 없습니다." };
  if (!hasRun) return { ok: false, line: lines.length, message: `${variableName ?? "chapter"}.run() 명령이 없습니다.` };
  return { ok: true, chapterId, cues: cues.sort((a, b) => a.atSeconds - b.atSeconds) };
}
