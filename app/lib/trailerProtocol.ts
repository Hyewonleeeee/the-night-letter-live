import { TRAILER_CHAPTERS, type TrailerChapterId } from "../config/trailerConfig";

export const TRAILER_CHANNEL = "the-night-letter-november-trailer-v1";

export type TrailerStartMessage = {
  kind: "trailer:start";
  version: 1;
  runId: string;
  chapterId: TrailerChapterId;
  at: number;
};

export type TrailerReadyMessage = {
  kind: "trailer:ready";
  version: 1;
  at: number;
};

export type TrailerStatusMessage = {
  kind: "trailer:status";
  version: 1;
  runId: string;
  chapterId: TrailerChapterId;
  phase: "running" | "paused" | "complete";
  elapsedMs: number;
  totalMs: number;
  at: number;
};

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

export function isTrailerStartMessage(value: unknown): value is TrailerStartMessage {
  return isObject(value) && value.kind === "trailer:start" && value.version === 1 &&
    typeof value.runId === "string" && typeof value.chapterId === "string" && value.chapterId in TRAILER_CHAPTERS;
}

export function isTrailerReadyMessage(value: unknown): value is TrailerReadyMessage {
  return isObject(value) && value.kind === "trailer:ready" && value.version === 1 && typeof value.at === "number";
}

export function isTrailerStatusMessage(value: unknown): value is TrailerStatusMessage {
  return isObject(value) && value.kind === "trailer:status" && value.version === 1 &&
    typeof value.runId === "string" && typeof value.chapterId === "string" && value.chapterId in TRAILER_CHAPTERS &&
    ["running", "paused", "complete"].includes(String(value.phase)) &&
    typeof value.elapsedMs === "number" && typeof value.totalMs === "number";
}
