export const LIVE_VISUAL_CHANNEL = "the-night-letter-live-v1";

export const LIVE_VISUAL_PROPERTIES = [
  "cameraPush",
  "fogOpacity",
  "windAmount",
  "coolAmount",
  "grainAmount",
] as const;

export type LiveVisualProperty = (typeof LIVE_VISUAL_PROPERTIES)[number];

export type LiveVisualValues = Record<LiveVisualProperty, number>;

export type LiveVisualDurations = Record<LiveVisualProperty, number>;

export type LiveVisualSetOperation = {
  kind: "set";
  property: LiveVisualProperty;
  value: number;
  durationSeconds: number;
};

export type LiveVisualResetOperation = {
  kind: "reset";
  durationSeconds: number;
};

export type LiveVisualOperation = LiveVisualSetOperation | LiveVisualResetOperation;

export type LiveVisualRunMessage = {
  kind: "live-visual:run";
  version: 1;
  id: string;
  sentAt: number;
  operations: LiveVisualOperation[];
};

export type LiveVisualStateMessage = {
  kind: "live-visual:state";
  version: 1;
  at: number;
  reason: "ready" | "heartbeat" | "hello";
  values: LiveVisualValues;
};

export type LiveVisualAckMessage = {
  kind: "live-visual:ack";
  version: 1;
  at: number;
  runId: string;
  values: LiveVisualValues;
};

export type LiveVisualHelloMessage = {
  kind: "live-visual:hello";
  version: 1;
  at: number;
};

export type LiveVisualMessage =
  | LiveVisualRunMessage
  | LiveVisualStateMessage
  | LiveVisualAckMessage
  | LiveVisualHelloMessage;

type CommandSpec = {
  property: LiveVisualProperty;
  min: number;
  max: number;
  label: string;
};

export const LIVE_COMMAND_SPECS = {
  "camera.push": {
    property: "cameraPush",
    min: 0,
    max: 0.1,
    label: "카메라 푸시인",
  },
  "fog.opacity": {
    property: "fogOpacity",
    min: 0,
    max: 0.24,
    label: "안개 농도",
  },
  "wind.amount": {
    property: "windAmount",
    min: 0,
    max: 1,
    label: "바람 이동량",
  },
  "light.cool": {
    property: "coolAmount",
    min: 0,
    max: 0.24,
    label: "차가운 색조",
  },
  "grain.amount": {
    property: "grainAmount",
    min: 0,
    max: 0.12,
    label: "추가 필름 그레인",
  },
} as const satisfies Record<string, CommandSpec>;

export type LiveCommandName = keyof typeof LIVE_COMMAND_SPECS;

export const LIVE_VISUAL_DEFAULTS: LiveVisualValues = {
  cameraPush: 0,
  fogOpacity: 0,
  windAmount: 0,
  coolAmount: 0,
  grainAmount: 0,
};

export const LIVE_VISUAL_DEFAULT_DURATIONS: LiveVisualDurations = {
  cameraPush: 1.8,
  fogOpacity: 1.8,
  windAmount: 1.8,
  coolAmount: 1.8,
  grainAmount: 1.8,
};

export type LiveVisualProgramResult =
  | { ok: true; operations: LiveVisualOperation[] }
  | { ok: false; line: number; message: string };

const numberPattern = "[+-]?(?:\\d+(?:\\.\\d*)?|\\.\\d+)";
const commandPattern = new RegExp(
  `^([a-z]+\\.[a-z]+)\\s*\\(\\s*(${numberPattern})\\s*,\\s*(${numberPattern})\\s*\\)\\s*;?$`,
);
const resetPattern = new RegExp(`^reset\\s*\\(\\s*(${numberPattern})?\\s*\\)\\s*;?$`);

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export function parseLiveVisualProgram(source: string): LiveVisualProgramResult {
  const operations: LiveVisualOperation[] = [];
  const lines = source.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const statement = lines[index].replace(/\/\/.*$/, "").trim();
    if (!statement) continue;

    const resetMatch = statement.match(resetPattern);
    if (resetMatch) {
      const durationSeconds = resetMatch[1] === undefined ? 1.8 : Number(resetMatch[1]);
      if (!Number.isFinite(durationSeconds) || durationSeconds < 0.1 || durationSeconds > 30) {
        return {
          ok: false,
          line: index + 1,
          message: "reset 시간은 0.1초에서 30초 사이여야 합니다.",
        };
      }
      operations.push({ kind: "reset", durationSeconds });
      continue;
    }

    const match = statement.match(commandPattern);
    if (!match) {
      return {
        ok: false,
        line: index + 1,
        message: "허용된 함수명과 숫자 2개를 사용하세요. 예: fog.opacity(0.08, 5)",
      };
    }

    const commandName = match[1] as LiveCommandName;
    const spec = LIVE_COMMAND_SPECS[commandName];
    if (!spec) {
      return {
        ok: false,
        line: index + 1,
        message: `허용되지 않은 명령입니다: ${match[1]}`,
      };
    }

    const value = Number(match[2]);
    const durationSeconds = Number(match[3]);
    if (!Number.isFinite(value) || value < spec.min || value > spec.max) {
      return {
        ok: false,
        line: index + 1,
        message: `${spec.label} 값은 ${spec.min}–${spec.max} 범위여야 합니다.`,
      };
    }
    if (!Number.isFinite(durationSeconds) || durationSeconds < 0.1 || durationSeconds > 30) {
      return {
        ok: false,
        line: index + 1,
        message: "전환 시간은 0.1초에서 30초 사이여야 합니다.",
      };
    }

    operations.push({
      kind: "set",
      property: spec.property,
      value,
      durationSeconds,
    });
  }

  if (operations.length === 0) {
    return { ok: false, line: 1, message: "실행할 명령이 없습니다." };
  }

  return { ok: true, operations };
}

export function applyLiveVisualOperations(
  currentValues: LiveVisualValues,
  currentDurations: LiveVisualDurations,
  operations: LiveVisualOperation[],
) {
  const values = { ...currentValues };
  const durations = { ...currentDurations };

  for (const operation of operations) {
    if (operation.kind === "reset") {
      const durationSeconds = Number.isFinite(operation.durationSeconds)
        ? clamp(operation.durationSeconds, 0.1, 30)
        : 1.8;
      for (const property of LIVE_VISUAL_PROPERTIES) {
        values[property] = LIVE_VISUAL_DEFAULTS[property];
        durations[property] = durationSeconds;
      }
      continue;
    }

    const commandSpec = Object.values(LIVE_COMMAND_SPECS).find(
      (spec) => spec.property === operation.property,
    );
    if (!commandSpec || !Number.isFinite(operation.value)) continue;

    values[operation.property] = clamp(operation.value, commandSpec.min, commandSpec.max);
    durations[operation.property] = Number.isFinite(operation.durationSeconds)
      ? clamp(operation.durationSeconds, 0.1, 30)
      : 1.8;
  }

  return { values, durations };
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isLiveVisualProperty = (value: unknown): value is LiveVisualProperty =>
  typeof value === "string" && LIVE_VISUAL_PROPERTIES.includes(value as LiveVisualProperty);

export function isLiveVisualRunMessage(value: unknown): value is LiveVisualRunMessage {
  if (!isObject(value) || value.kind !== "live-visual:run" || value.version !== 1) return false;
  if (typeof value.id !== "string" || !Array.isArray(value.operations)) return false;

  return value.operations.every((operation) => {
    if (
      !isObject(operation) ||
      typeof operation.durationSeconds !== "number" ||
      !Number.isFinite(operation.durationSeconds)
    ) return false;
    if (operation.kind === "reset") return true;
    return operation.kind === "set" &&
      isLiveVisualProperty(operation.property) &&
      typeof operation.value === "number" &&
      Number.isFinite(operation.value);
  });
}

export function isLiveVisualHelloMessage(value: unknown): value is LiveVisualHelloMessage {
  return isObject(value) && value.kind === "live-visual:hello" && value.version === 1;
}

export function isLiveVisualStateMessage(value: unknown): value is LiveVisualStateMessage {
  if (!isObject(value) || value.kind !== "live-visual:state" || value.version !== 1) return false;
  if (!isObject(value.values)) return false;
  const values = value.values;
  return LIVE_VISUAL_PROPERTIES.every(
    (property) => typeof values[property] === "number" && Number.isFinite(values[property]),
  );
}

export function isLiveVisualAckMessage(value: unknown): value is LiveVisualAckMessage {
  if (!isObject(value) || value.kind !== "live-visual:ack" || value.version !== 1) return false;
  if (typeof value.runId !== "string" || !isObject(value.values)) return false;
  const values = value.values;
  return LIVE_VISUAL_PROPERTIES.every(
    (property) => typeof values[property] === "number" && Number.isFinite(values[property]),
  );
}
