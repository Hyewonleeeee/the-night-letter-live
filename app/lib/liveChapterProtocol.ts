import { LIVE_CHAPTERS } from "../config/liveChapterScore";

export type LiveChapterPhase = "running" | "paused" | "complete" | "aborted";

export type LiveChapterStartMessage = {
  kind: "live-chapter:start";
  version: 1;
  runId: string;
  chapterId: string;
  at: number;
};

export type LiveChapterControlMessage = {
  kind: "live-chapter:control";
  version: 1;
  runId: string;
  action: "pause" | "resume" | "abort" | "reset";
  at: number;
};

export type LiveChapterStatusMessage = {
  kind: "live-chapter:status";
  version: 1;
  runId: string;
  chapterId: string;
  phase: LiveChapterPhase;
  elapsedMs: number;
  totalMs: number;
  revealedCharacters: number;
  cueIndex: number;
  at: number;
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export function isLiveChapterStartMessage(value: unknown): value is LiveChapterStartMessage {
  return isObject(value) &&
    value.kind === "live-chapter:start" &&
    value.version === 1 &&
    typeof value.runId === "string" &&
    typeof value.chapterId === "string" &&
    value.chapterId in LIVE_CHAPTERS;
}

export function isLiveChapterControlMessage(value: unknown): value is LiveChapterControlMessage {
  return isObject(value) &&
    value.kind === "live-chapter:control" &&
    value.version === 1 &&
    typeof value.runId === "string" &&
    ["pause", "resume", "abort", "reset"].includes(String(value.action));
}

export function isLiveChapterStatusMessage(value: unknown): value is LiveChapterStatusMessage {
  if (
    !isObject(value) ||
    value.kind !== "live-chapter:status" ||
    value.version !== 1 ||
    typeof value.runId !== "string" ||
    typeof value.chapterId !== "string" ||
    !(value.chapterId in LIVE_CHAPTERS)
  ) return false;

  return ["running", "paused", "complete", "aborted"].includes(String(value.phase)) &&
    typeof value.elapsedMs === "number" && Number.isFinite(value.elapsedMs) &&
    typeof value.totalMs === "number" && Number.isFinite(value.totalMs) &&
    typeof value.revealedCharacters === "number" && Number.isFinite(value.revealedCharacters) &&
    typeof value.cueIndex === "number" && Number.isFinite(value.cueIndex);
}
