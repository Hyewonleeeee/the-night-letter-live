"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  TRAILER_CHAPTERS,
  TRAILER_DURATION_SECONDS,
  type TrailerChapterId,
} from "../config/trailerConfig";
import {
  TRAILER_CHANNEL,
  isTrailerStartMessage,
  type TrailerStatusMessage,
} from "../lib/trailerProtocol";
import { TrailerCanvas } from "./TrailerCanvas";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const formatTime = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;

type ActiveChapter = {
  runId: string;
  chapterId: TrailerChapterId;
  startSeconds: number;
  endSeconds: number;
  phase: "running" | "paused" | "complete";
};

export function TrailerPlayer() {
  const shellRef = useRef<HTMLElement>(null);
  const frameRef = useRef<number | null>(null);
  const currentTimeRef = useRef(0);
  const anchorRef = useRef(0);
  const activeChapterRef = useRef<ActiveChapter | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const lastStatusAtRef = useRef(0);
  const controlsTimerRef = useRef<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);

  const showControls = useCallback(() => {
    setControlsVisible(true);
    if (controlsTimerRef.current !== null) window.clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = window.setTimeout(() => {
      if (currentTimeRef.current > 0) setControlsVisible(false);
    }, 2_400);
  }, []);

  const postStatus = useCallback((active: ActiveChapter, phase: ActiveChapter["phase"], absoluteTime: number) => {
    const elapsedSeconds = phase === "complete"
      ? active.endSeconds - active.startSeconds
      : clamp(absoluteTime - active.startSeconds, 0, active.endSeconds - active.startSeconds);
    const message: TrailerStatusMessage = {
      kind: "trailer:status",
      version: 1,
      runId: active.runId,
      chapterId: active.chapterId,
      phase,
      elapsedMs: elapsedSeconds * 1000,
      totalMs: (active.endSeconds - active.startSeconds) * 1000,
      at: Date.now(),
    };
    channelRef.current?.postMessage(message);
  }, []);

  const seekTo = useCallback((seconds: number) => {
    const next = clamp(seconds, 0, TRAILER_DURATION_SECONDS);
    currentTimeRef.current = next;
    setCurrentTime(next);
    anchorRef.current = performance.now() - next * 1000;
    const active = activeChapterRef.current;
    if (active && (next < active.startSeconds || next > active.endSeconds)) activeChapterRef.current = null;
  }, []);

  const play = useCallback(() => {
    let start = currentTimeRef.current;
    if (start >= TRAILER_DURATION_SECONDS - 0.02) {
      start = 0;
      currentTimeRef.current = 0;
      setCurrentTime(0);
      activeChapterRef.current = null;
    }
    anchorRef.current = performance.now() - start * 1000;
    const active = activeChapterRef.current;
    if (active?.phase === "paused") {
      active.phase = "running";
      postStatus(active, "running", start);
    }
    setPlaying(true);
    showControls();
  }, [postStatus, showControls]);

  const pause = useCallback(() => {
    setPlaying(false);
    if (controlsTimerRef.current !== null) window.clearTimeout(controlsTimerRef.current);
    const active = activeChapterRef.current;
    if (active?.phase === "running") {
      active.phase = "paused";
      postStatus(active, "paused", currentTimeRef.current);
    }
    setControlsVisible(true);
  }, [postStatus]);

  const stop = useCallback(() => {
    setPlaying(false);
    if (controlsTimerRef.current !== null) window.clearTimeout(controlsTimerRef.current);
    setControlsVisible(true);
    activeChapterRef.current = null;
    seekTo(0);
  }, [seekTo]);

  useEffect(() => {
    if (!playing) return;
    anchorRef.current = performance.now() - currentTimeRef.current * 1000;
    const tick = (now: number) => {
      const active = activeChapterRef.current;
      const end = active?.phase === "running" ? active.endSeconds : TRAILER_DURATION_SECONDS;
      const next = Math.min(end, (now - anchorRef.current) / 1000);
      currentTimeRef.current = next;
      setCurrentTime(next);

      if (active?.phase === "running" && now - lastStatusAtRef.current >= 220) {
        lastStatusAtRef.current = now;
        postStatus(active, "running", next);
      }
      if (active?.phase === "running" && next >= active.endSeconds - 0.01) {
        const hold = active.endSeconds - 1 / 24;
        currentTimeRef.current = hold;
        setCurrentTime(hold);
        active.phase = "complete";
        setPlaying(false);
        setControlsVisible(true);
        postStatus(active, "complete", active.endSeconds);
        frameRef.current = null;
        return;
      }
      if (next >= TRAILER_DURATION_SECONDS) {
        setPlaying(false);
        setControlsVisible(true);
        frameRef.current = null;
        return;
      }
      frameRef.current = window.requestAnimationFrame(tick);
    };
    frameRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    };
  }, [playing, postStatus]);

  useEffect(() => {
    if (!("BroadcastChannel" in window)) return;
    const channel = new BroadcastChannel(TRAILER_CHANNEL);
    channelRef.current = channel;
    const postReady = () => channel.postMessage({ kind: "trailer:ready", version: 1, at: Date.now() });
    channel.onmessage = (event: MessageEvent<unknown>) => {
      if (!isTrailerStartMessage(event.data)) return;
      const chapter = TRAILER_CHAPTERS[event.data.chapterId];
      const active: ActiveChapter = {
        runId: event.data.runId,
        chapterId: event.data.chapterId,
        startSeconds: chapter.startSeconds,
        endSeconds: chapter.endSeconds,
        phase: "running",
      };
      activeChapterRef.current = active;
      currentTimeRef.current = chapter.startSeconds;
      setCurrentTime(chapter.startSeconds);
      anchorRef.current = performance.now() - chapter.startSeconds * 1000;
      lastStatusAtRef.current = 0;
      setPlaying(true);
      showControls();
      postStatus(active, "running", chapter.startSeconds);
    };
    postReady();
    const heartbeat = window.setInterval(postReady, 1_000);
    return () => {
      window.clearInterval(heartbeat);
      channel.close();
      if (channelRef.current === channel) channelRef.current = null;
    };
  }, [postStatus, showControls]);

  useEffect(() => () => {
    if (controlsTimerRef.current !== null) window.clearTimeout(controlsTimerRef.current);
  }, []);

  useEffect(() => {
    const onFullscreen = () => setFullscreen(Boolean(document.fullscreenElement));
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) return;
      if (event.code === "Space") {
        event.preventDefault();
        if (playing) pause(); else play();
      } else if (event.key === "ArrowLeft") seekTo(currentTimeRef.current - 5);
      else if (event.key === "ArrowRight") seekTo(currentTimeRef.current + 5);
      else if (["1", "2", "3"].includes(event.key)) {
        const chapter = Object.values(TRAILER_CHAPTERS)[Number(event.key) - 1];
        activeChapterRef.current = null;
        seekTo(chapter.startSeconds);
      }
    };
    document.addEventListener("fullscreenchange", onFullscreen);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreen);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [pause, play, playing, seekTo]);

  return (
    <main
      ref={shellRef}
      className={`trailer-player ${controlsVisible ? "has-controls" : ""}`}
      onMouseMove={showControls}
      onClick={showControls}
      onDoubleClick={() => shellRef.current?.requestFullscreen?.().catch(() => {})}
    >
      <TrailerCanvas timeSeconds={currentTime} />

      <nav className="trailer-chapters" aria-label="예고편 챕터">
        {Object.values(TRAILER_CHAPTERS).map((chapter, index) => (
          <button key={chapter.id} type="button" onClick={(event) => {
            event.stopPropagation();
            activeChapterRef.current = null;
            seekTo(chapter.startSeconds);
          }}>
            <i>{index + 1}</i>
            <span>{chapter.title}</span>
            <time>{formatTime(chapter.startSeconds)}</time>
          </button>
        ))}
      </nav>

      <section className="trailer-controls" aria-label="예고편 재생 컨트롤" onClick={(event) => event.stopPropagation()}>
        <div className="trailer-control-row">
          <button type="button" aria-label={playing ? "일시정지" : "재생"} onClick={playing ? pause : play}>{playing ? "Ⅱ" : "▶"}</button>
          <button type="button" aria-label="정지" onClick={stop}>■</button>
          <button type="button" aria-label="처음으로" onClick={() => { activeChapterRef.current = null; seekTo(0); }}>↤</button>
          <button type="button" onClick={() => seekTo(currentTimeRef.current - 10)}>−10</button>
          <button type="button" onClick={() => seekTo(currentTimeRef.current + 10)}>+10</button>
          <time>{formatTime(currentTime)} / {formatTime(TRAILER_DURATION_SECONDS)}</time>
          <button type="button" onClick={() => {
            if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
            else shellRef.current?.requestFullscreen?.().catch(() => {});
          }}>{fullscreen ? "EXIT" : "FULL"}</button>
        </div>
        <input
          className="trailer-seek"
          aria-label="재생 위치"
          type="range"
          min="0"
          max={TRAILER_DURATION_SECONDS}
          step="0.01"
          value={currentTime}
          onChange={(event) => seekTo(Number(event.target.value))}
        />
      </section>
    </main>
  );
}
