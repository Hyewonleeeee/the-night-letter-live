import {
  LIVE_AMBIENCE_CUE_IDS,
  LIVE_PERFORMANCE_CHAPTERS,
  type LivePerformanceChapterId,
} from "../config/livePerformanceChapters.ts";

export type LiveChapterCue = {
  atSeconds: number;
  command: "shot" | "ambience" | "prop" | "transition" | "ritual" | "character" | "speak" | "fade";
  label: string;
  gain?: number;
  pan?: number;
};

export type LiveChapterProgramResult =
  | { ok: true; chapterId: LivePerformanceChapterId; cues: LiveChapterCue[] }
  | { ok: false; line: number; message: string };

const number = "[+-]?(?:\\d+(?:\\.\\d*)?|\\.\\d+)";
const declarationPattern = new RegExp(
  `^const\\s+([A-Za-z_$][\\w$]*)\\s*=\\s*chapter\\(\\s*["']([^"']+)["']\\s*\\)\\s*;?$`,
);
const shortcutPattern = /^chapter\(\s*["']([^"']+)["']\s*\)\.run\(\s*\)\s*;?$/;
const runPattern = /^([A-Za-z_$][\w$]*)\.run\(\s*\)\s*;?$/;
const simpleCuePattern = new RegExp(
  `^([A-Za-z_$][\\w$]*)\\.at\\(\\s*(${number})\\s*\\)\\.(shot|transition|ritual|speak)\\(\\s*"([^"]+)"\\s*\\)\\s*;?$`,
);
const ambiencePattern = new RegExp(
  `^([A-Za-z_$][\\w$]*)\\.at\\(\\s*(${number})\\s*\\)\\.ambience\\(\\s*["']([^"']+)["']\\s*,\\s*(${number})\\s*,\\s*(${number})\\s*\\)\\s*;?$`,
);
const propPattern = new RegExp(
  `^([A-Za-z_$][\\w$]*)\\.at\\(\\s*(${number})\\s*\\)\\.prop\\(\\s*["']([^"']+)["']\\s*\\)\\.enter\\(\\s*["']([^"']+)["']\\s*\\)\\s*;?$`,
);
const characterPattern = new RegExp(
  `^([A-Za-z_$][\\w$]*)\\.at\\(\\s*(${number})\\s*\\)\\.character\\(\\s*["']([^"']+)["']\\s*\\)\\.enterTriangle\\(\\s*\\)\\s*;?$`,
);
const fadePattern = new RegExp(
  `^([A-Za-z_$][\\w$]*)\\.at\\(\\s*(${number})\\s*\\)\\.fade\\(\\s*["']([^"']+)["']\\s*,\\s*(${number})\\s*\\)\\s*;?$`,
);

const KNOWN_CUES = {
  shot: new Set([
    "wellington_house",
    "boy_at_window",
    "letter_open",
    "empty_triangle",
    "family_evening",
    "morning_room",
    "handle_approach",
    "handle_break",
    "school_walk",
    "car_lift",
    "flower_scorch",
    "sleepless_nights",
    "bathroom_mirror",
    "shadow_reflection",
    "sleeping_room",
    "shadow_approach",
    "living_offering",
    "soul_transfer",
    "thumb_payment",
    "larger_price",
    "refusal",
    "empty_dog_bed",
    "loss_reveal",
    "contract_break",
    "family_threat",
    "boy_stands_ground",
    "battle_begins",
    "void_battle",
    "final_spell",
    "darkness_breaks",
    "serpent_approach",
    "dream_wake",
    "breakfast",
    "letter_returns",
    "ambiguous_look",
  ]),
  ambience: new Set(Object.keys(LIVE_AMBIENCE_CUE_IDS)),
  transition: new Set(["next_night", "next_morning", "void", "dream_wake"]),
  ritual: new Set(["white_triangle"]),
  speak: new Set([
    "Alohomora",
    "He's back.",
    "Give me a living vessel.",
    "I can give you power.",
    "The snail is too small.",
    "Bring me something larger.",
    "I won't.",
    "You should have listened.",
    "The contract is over.",
    "They are next.",
    "Stay away from them.",
    "Avada Kedavra.",
    "I had the strangest dream.",
  ]),
  prop: new Set(["letter:wind_curve"]),
  character: new Set(["boy:enterTriangle"]),
  fade: new Set(["black"]),
} as const;

const isChapterId = (value: string): value is LivePerformanceChapterId =>
  value in LIVE_PERFORMANCE_CHAPTERS;

export function parseLiveChapterProgram(source: string): LiveChapterProgramResult {
  const lines = source.split(/\r?\n/);
  let chapterId: LivePerformanceChapterId | null = null;
  let variableName: string | null = null;
  let hasRun = false;
  const cues: LiveChapterCue[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const statement = lines[index].replace(/\/\/.*$/, "").trim();
    if (!statement) continue;

    const shortcut = statement.match(shortcutPattern);
    if (shortcut) {
      if (!isChapterId(shortcut[1])) {
        return { ok: false, line: index + 1, message: `알 수 없는 챕터입니다: ${shortcut[1]}` };
      }
      if (chapterId || hasRun || cues.length) {
        return { ok: false, line: index + 1, message: "단축 실행 명령은 한 줄로만 사용하세요." };
      }
      chapterId = shortcut[1];
      hasRun = true;
      continue;
    }

    const declaration = statement.match(declarationPattern);
    if (declaration) {
      if (chapterId) {
        return { ok: false, line: index + 1, message: "한 번에 하나의 챕터만 선언할 수 있습니다." };
      }
      if (!isChapterId(declaration[2])) {
        return { ok: false, line: index + 1, message: `알 수 없는 챕터입니다: ${declaration[2]}` };
      }
      variableName = declaration[1];
      chapterId = declaration[2];
      continue;
    }

    if (!chapterId || !variableName) {
      return { ok: false, line: index + 1, message: "먼저 const 변수로 chapter()를 선언하세요." };
    }

    const run = statement.match(runPattern);
    if (run) {
      if (run[1] !== variableName) {
        return { ok: false, line: index + 1, message: `선언된 변수 ${variableName}를 실행하세요.` };
      }
      hasRun = true;
      continue;
    }

    const simpleCue = statement.match(simpleCuePattern);
    if (simpleCue) {
      const [, variable, atValue, command, label] = simpleCue;
      if (variable !== variableName) {
        return { ok: false, line: index + 1, message: `선언된 변수 ${variableName}를 사용하세요.` };
      }
      const allowed = KNOWN_CUES[command as "shot" | "transition" | "ritual" | "speak"];
      if (!(allowed as ReadonlySet<string>).has(label)) {
        return { ok: false, line: index + 1, message: `등록되지 않은 ${command} 큐입니다: ${label}` };
      }
      cues.push({ atSeconds: Number(atValue), command: command as LiveChapterCue["command"], label });
      continue;
    }

    const ambience = statement.match(ambiencePattern);
    if (ambience) {
      const [, variable, atValue, label, gainValue, panValue] = ambience;
      if (variable !== variableName) {
        return { ok: false, line: index + 1, message: `선언된 변수 ${variableName}를 사용하세요.` };
      }
      const gain = Number(gainValue);
      const pan = Number(panValue);
      if (!KNOWN_CUES.ambience.has(label)) {
        return { ok: false, line: index + 1, message: `등록되지 않은 ambience 큐입니다: ${label}` };
      }
      if (gain < 0 || gain > 1 || pan < -1 || pan > 1) {
        return { ok: false, line: index + 1, message: "ambience gain은 0–1, pan은 -1–1 범위여야 합니다." };
      }
      cues.push({ atSeconds: Number(atValue), command: "ambience", label, gain, pan });
      continue;
    }

    const prop = statement.match(propPattern);
    if (prop) {
      const [, variable, atValue, propName, motion] = prop;
      if (variable !== variableName || !KNOWN_CUES.prop.has(`${propName}:${motion}`)) {
        return { ok: false, line: index + 1, message: "등록되지 않은 소품 큐입니다." };
      }
      cues.push({ atSeconds: Number(atValue), command: "prop", label: `${propName}:${motion}` });
      continue;
    }

    const character = statement.match(characterPattern);
    if (character) {
      const [, variable, atValue, name] = character;
      if (variable !== variableName || !KNOWN_CUES.character.has(`${name}:enterTriangle`)) {
        return { ok: false, line: index + 1, message: "등록되지 않은 인물 큐입니다." };
      }
      cues.push({ atSeconds: Number(atValue), command: "character", label: `${name}:enterTriangle` });
      continue;
    }

    const fade = statement.match(fadePattern);
    if (fade) {
      const [, variable, atValue, color, durationValue] = fade;
      const duration = Number(durationValue);
      if (variable !== variableName || !KNOWN_CUES.fade.has(color) || duration <= 0 || duration > 15) {
        return { ok: false, line: index + 1, message: "fade 색상 또는 시간이 허용 범위를 벗어났습니다." };
      }
      cues.push({ atSeconds: Number(atValue), command: "fade", label: color });
      continue;
    }

    return { ok: false, line: index + 1, message: "허용되지 않은 챕터 명령입니다." };
  }

  if (!chapterId) return { ok: false, line: 1, message: "chapter() 선언이 없습니다." };
  if (!hasRun) return { ok: false, line: lines.length, message: `${variableName ?? "chapter"}.run() 명령이 없습니다.` };

  const chapter = LIVE_PERFORMANCE_CHAPTERS[chapterId];
  const duration = chapter.endSeconds - chapter.startSeconds;
  const invalidCue = cues.find((cue) => !Number.isFinite(cue.atSeconds) || cue.atSeconds < 0 || cue.atSeconds >= duration);
  if (invalidCue) {
    return { ok: false, line: 1, message: `큐 시간 ${invalidCue.atSeconds}초가 챕터 길이를 벗어났습니다.` };
  }

  return { ok: true, chapterId, cues: cues.sort((a, b) => a.atSeconds - b.atSeconds) };
}
