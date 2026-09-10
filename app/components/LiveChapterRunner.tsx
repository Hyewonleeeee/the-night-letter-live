"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FIRST_SIGN_LIVE_CHAPTER,
  LIVE_CHAPTERS,
  buildLiveChapterTypingPlan,
  getRevealedCharacterCount,
} from "../config/liveChapterScore";
import { LIVE_VISUAL_CHANNEL, type LiveVisualOperation } from "../lib/liveCoding";
import {
  isLiveChapterControlMessage,
  isLiveChapterStartMessage,
  type LiveChapterPhase,
  type LiveChapterStatusMessage,
} from "../lib/liveChapterProtocol";
import { ChapterCodeBlock } from "./ChapterCodeBlock";

type LiveChapterRunnerProps = {
  onOperations: (operations: LiveVisualOperation[]) => void;
};

type RunnerSession = {
  runId: string;
  chapterId: string;
  phase: LiveChapterPhase;
  elapsedMs: number;
  revision: number;
};

type RunnerFrame = {
  phase: LiveChapterPhase;
  revealedCharacters: number;
  elapsedMs: number;
};

const EMPTY_FRAME: RunnerFrame = {
  phase: "aborted",
  revealedCharacters: 0,
  elapsedMs: 0,
};

export function LiveChapterRunner({ onOperations }: LiveChapterRunnerProps) {
  const channelRef = useRef<BroadcastChannel | null>(null);
  const sessionRef = useRef<RunnerSession | null>(null);
  const elapsedRef = useRef(0);
  const cueIndexRef = useRef(0);
  const [session, setSession] = useState<RunnerSession | null>(null);
  const [frame, setFrame] = useState<RunnerFrame>(EMPTY_FRAME);

  const score = session ? LIVE_CHAPTERS[session.chapterId] : FIRST_SIGN_LIVE_CHAPTER;
  const plan = useMemo(() => buildLiveChapterTypingPlan(score), [score]);

  const updateSession = useCallback((next: RunnerSession | null) => {
    sessionRef.current = next;
    setSession(next);
  }, []);

  const postStatus = useCallback((
    activeSession: RunnerSession,
    activeFrame: RunnerFrame,
    activePlan: typeof plan,
  ) => {
    const message: LiveChapterStatusMessage = {
      kind: "live-chapter:status",
      version: 1,
      runId: activeSession.runId,
      chapterId: activeSession.chapterId,
      phase: activeFrame.phase,
      elapsedMs: activeFrame.elapsedMs,
      totalMs: activePlan.totalMs,
      revealedCharacters: activeFrame.revealedCharacters,
      cueIndex: cueIndexRef.current,
      at: Date.now(),
    };
    channelRef.current?.postMessage(message);
  }, []);

  useEffect(() => {
    if (!("BroadcastChannel" in window)) return;
    const channel = new BroadcastChannel(LIVE_VISUAL_CHANNEL);
    channelRef.current = channel;

    channel.onmessage = (event: MessageEvent<unknown>) => {
      const message = event.data;
      if (isLiveChapterStartMessage(message)) {
        const next: RunnerSession = {
          runId: message.runId,
          chapterId: message.chapterId,
          phase: "running",
          elapsedMs: 0,
          revision: (sessionRef.current?.revision ?? 0) + 1,
        };
        elapsedRef.current = 0;
        cueIndexRef.current = 0;
        setFrame({ phase: "running", revealedCharacters: 0, elapsedMs: 0 });
        onOperations([{ kind: "reset", durationSeconds: 0.8 }]);
        updateSession(next);
        return;
      }

      if (!isLiveChapterControlMessage(message)) return;
      const current = sessionRef.current;
      if (!current || current.runId !== message.runId) return;

      if (message.action === "pause" && current.phase === "running") {
        const next = { ...current, phase: "paused" as const, elapsedMs: elapsedRef.current, revision: current.revision + 1 };
        setFrame((value) => ({ ...value, phase: "paused", elapsedMs: elapsedRef.current }));
        updateSession(next);
      } else if (message.action === "resume" && current.phase === "paused") {
        updateSession({ ...current, phase: "running", elapsedMs: elapsedRef.current, revision: current.revision + 1 });
      } else if (message.action === "abort") {
        const next = { ...current, phase: "aborted" as const, elapsedMs: elapsedRef.current, revision: current.revision + 1 };
        setFrame((value) => ({ ...value, phase: "aborted" }));
        onOperations([{ kind: "reset", durationSeconds: 1.4 }]);
        updateSession(next);
      } else if (message.action === "reset") {
        onOperations([{ kind: "reset", durationSeconds: 1.4 }]);
        setFrame(EMPTY_FRAME);
        elapsedRef.current = 0;
        cueIndexRef.current = 0;
        updateSession(null);
      }
    };

    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, [onOperations, updateSession]);

  useEffect(() => {
    if (!session || session.phase !== "running") return;
    const activeScore = LIVE_CHAPTERS[session.chapterId];
    const activePlan = buildLiveChapterTypingPlan(activeScore);
    const startedAt = performance.now();
    const baseElapsed = session.elapsedMs;
    let animationFrame = 0;
    let lastCharacters = -1;
    let lastStatusAt = 0;

    const tick = (now: number) => {
      const elapsedMs = Math.min(activePlan.totalMs, baseElapsed + now - startedAt);
      elapsedRef.current = elapsedMs;
      const revealedCharacters = getRevealedCharacterCount(activePlan, elapsedMs);

      while (
        cueIndexRef.current < activePlan.cueLines.length &&
        activePlan.cueLines[cueIndexRef.current].endCharacter <= revealedCharacters
      ) {
        onOperations(activePlan.cueLines[cueIndexRef.current].operations);
        cueIndexRef.current += 1;
      }

      const nextFrame: RunnerFrame = {
        phase: elapsedMs >= activePlan.totalMs ? "complete" : "running",
        revealedCharacters,
        elapsedMs,
      };
      if (revealedCharacters !== lastCharacters || nextFrame.phase === "complete") {
        lastCharacters = revealedCharacters;
        setFrame(nextFrame);
      }
      if (now - lastStatusAt > 180 || nextFrame.phase === "complete") {
        lastStatusAt = now;
        postStatus(session, nextFrame, activePlan);
      }

      if (nextFrame.phase === "complete") {
        updateSession({
          ...session,
          phase: "complete",
          elapsedMs: activePlan.totalMs,
          revision: session.revision + 1,
        });
        return;
      }
      animationFrame = window.requestAnimationFrame(tick);
    };

    animationFrame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [onOperations, postStatus, session, updateSession]);

  useEffect(() => {
    if (!session || session.phase === "running") return;
    postStatus(session, frame, plan);
  }, [frame, plan, postStatus, session]);

  if (!session) return null;

  return (
    <div className={`audience-chapter-code is-${frame.phase}`} aria-hidden="true">
      <div className="audience-chapter-shade" />
      <div className="audience-chapter-content">
        <p>{score.title} / LIVE SCORE</p>
        <div className="audience-chapter-trigger">› {score.trigger}</div>
        <ChapterCodeBlock
          score={score}
          plan={plan}
          revealedCharacters={frame.revealedCharacters}
          showCursor={frame.phase === "running" || frame.phase === "paused"}
          compact
        />
      </div>
    </div>
  );
}
