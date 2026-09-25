"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ClipboardEvent as ReactClipboardEvent,
} from "react";
import {
  TRAILER_CHAPTERS,
  TRAILER_CHAPTER_SOURCES,
  type TrailerChapterId,
} from "../config/trailerConfig";
import { buildLiveAutoTypingPlan, getAutoTypedCharacterCount, type LiveAutoTypingPlan } from "../lib/liveAutoTyping";
import { parseTrailerProgram } from "../lib/trailerDsl";
import {
  TRAILER_CHANNEL,
  isTrailerReadyMessage,
  isTrailerStatusMessage,
  type TrailerStartMessage,
  type TrailerStatusMessage,
} from "../lib/trailerProtocol";

type TypingSession = {
  chapterId: TrailerChapterId;
  program: string;
  plan: LiveAutoTypingPlan;
  startedAt: number;
  pausedAt: number | null;
  lastCount: number;
};

const createRunId = () => typeof crypto !== "undefined" && "randomUUID" in crypto
  ? crypto.randomUUID()
  : `trailer-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const formatTime = (milliseconds: number) => {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
};

const cueName = (command: string, label: string) => `${command.toUpperCase()} / ${label.replaceAll("_", " ")}`;

export function TrailerLiveConsole() {
  const deskRef = useRef<HTMLElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const sessionRef = useRef<TypingSession | null>(null);
  const frameRef = useRef<number | null>(null);
  const [source, setSource] = useState("");
  const [lastSignalAt, setLastSignalAt] = useState(0);
  const [clock, setClock] = useState(() => Date.now());
  const [status, setStatus] = useState<TrailerStatusMessage | null>(null);
  const [active, setActive] = useState(false);
  const [armedChapter, setArmedChapter] = useState<TrailerChapterId | null>(null);
  const [copiedChapter, setCopiedChapter] = useState<TrailerChapterId | null>(null);
  const [completed, setCompleted] = useState<Set<TrailerChapterId>>(() => new Set());
  const [message, setMessage] = useState("COPY 01을 누른 뒤 편집기에 붙여 넣으세요.");
  const [error, setError] = useState<string | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const connected = clock - lastSignalAt < 3_500;
  const lineCount = Math.max(19, source.split("\n").length);

  const cancelTyping = useCallback(() => {
    sessionRef.current = null;
    if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    setActive(false);
  }, []);

  useEffect(() => {
    if (!("BroadcastChannel" in window)) return;
    const channel = new BroadcastChannel(TRAILER_CHANNEL);
    channelRef.current = channel;
    channel.onmessage = (event: MessageEvent<unknown>) => {
      if (isTrailerReadyMessage(event.data)) {
        setLastSignalAt(Date.now());
        return;
      }
      if (!isTrailerStatusMessage(event.data)) return;
      const nextStatus = event.data;
      setStatus(nextStatus);
      setLastSignalAt(Date.now());
      const session = sessionRef.current;
      if (!session || session.chapterId !== nextStatus.chapterId) return;

      const now = performance.now();
      session.startedAt = now - nextStatus.elapsedMs;
      session.pausedAt = nextStatus.phase === "paused" ? now : null;
      if (nextStatus.phase === "complete") {
        setSource(session.program);
        setCompleted((current) => new Set(current).add(nextStatus.chapterId));
        sessionRef.current = null;
        if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
        setActive(false);
        const number = TRAILER_CHAPTERS[nextStatus.chapterId].number;
        setMessage(`CHAPTER ${number} 완료 · 다음 코드를 복사해 붙여 넣으세요.`);
      }
    };

    const timer = window.setInterval(() => setClock(Date.now()), 1_000);
    return () => {
      window.clearInterval(timer);
      channel.close();
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    };
  }, []);

  useEffect(() => {
    if (!active) return;
    const editor = editorRef.current;
    if (!editor) return;
    editor.setSelectionRange(source.length, source.length);
    editor.scrollTop = editor.scrollHeight;
    setScrollTop(editor.scrollTop);
  }, [active, source]);

  useEffect(() => {
    const onFullscreen = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFullscreen);
    return () => document.removeEventListener("fullscreenchange", onFullscreen);
  }, []);

  const perform = useCallback((program: string) => {
    if (!connected || !channelRef.current) {
      setError("왼쪽 예고편 플레이어가 준비될 때까지 잠시 기다려주세요.");
      return;
    }
    const parsed = parseTrailerProgram(program);
    if (!parsed.ok) {
      setError(`${parsed.line}행 — ${parsed.message}`);
      return;
    }

    cancelTyping();
    const chapter = TRAILER_CHAPTERS[parsed.chapterId];
    const duration = chapter.endSeconds - chapter.startSeconds;
    const plan = buildLiveAutoTypingPlan(program, duration);
    const session: TypingSession = {
      chapterId: parsed.chapterId,
      program,
      plan,
      startedAt: performance.now(),
      pausedAt: null,
      lastCount: 0,
    };
    sessionRef.current = session;
    setSource("");
    setArmedChapter(parsed.chapterId);
    setStatus(null);
    setError(null);
    setActive(true);
    setMessage(`${chapter.title} · 영상과 코드 타임라인이 시작됐습니다.`);
    const runId = createRunId();
    const startMessage: TrailerStartMessage = {
      kind: "trailer:start",
      version: 1,
      runId,
      chapterId: parsed.chapterId,
      at: Date.now(),
    };
    channelRef.current.postMessage(startMessage);

    const paint = (now: number) => {
      const current = sessionRef.current;
      if (!current) {
        frameRef.current = null;
        return;
      }
      const elapsed = Math.max(0, (current.pausedAt ?? now) - current.startedAt);
      const count = getAutoTypedCharacterCount(current.plan, elapsed);
      if (count !== current.lastCount) {
        current.lastCount = count;
        setSource(current.program.slice(0, count));
      }
      frameRef.current = window.requestAnimationFrame(paint);
    };
    frameRef.current = window.requestAnimationFrame(paint);
  }, [cancelTyping, connected]);

  const handlePaste = useCallback((event: ReactClipboardEvent<HTMLTextAreaElement>) => {
    if (active) return;
    const program = event.clipboardData.getData("text");
    if (!/trailerChapter\s*\(/.test(program)) return;
    event.preventDefault();
    perform(program);
  }, [active, perform]);

  const copyChapter = useCallback(async (chapterId: TrailerChapterId) => {
    try {
      await navigator.clipboard.writeText(TRAILER_CHAPTER_SOURCES[chapterId]);
      setCopiedChapter(chapterId);
      setError(null);
      setMessage(`CHAPTER ${TRAILER_CHAPTERS[chapterId].number} 복사 완료 · 편집기를 클릭하고 ⌘V 하세요.`);
      editorRef.current?.focus();
    } catch {
      setError("브라우저가 클립보드 복사를 막았습니다. HTTPS 또는 localhost에서 실행해주세요.");
    }
  }, []);

  const monitor = useMemo(() => {
    const chapterId = status?.chapterId ?? armedChapter;
    if (!chapterId) return null;
    const chapter = TRAILER_CHAPTERS[chapterId];
    const parsed = parseTrailerProgram(TRAILER_CHAPTER_SOURCES[chapterId]);
    const cues = parsed.ok ? parsed.cues : [];
    const elapsedMs = status?.elapsedMs ?? 0;
    const elapsedSeconds = elapsedMs / 1000;
    const currentCue = status ? cues.filter((cue) => cue.atSeconds <= elapsedSeconds).at(-1) ?? null : null;
    const nextCue = cues.find((cue) => cue.atSeconds > elapsedSeconds) ?? null;
    const totalMs = (chapter.endSeconds - chapter.startSeconds) * 1000;
    return {
      chapter,
      elapsedMs,
      totalMs,
      currentCue,
      nextCue,
      phase: status?.phase ?? "armed",
      progress: Math.min(100, elapsedMs / totalMs * 100),
    };
  }, [armedChapter, status]);

  return (
    <main ref={deskRef} className="trailer-live-page">
      <section className="trailer-live-stage" aria-label="11월 예고편 출력">
        <header className="trailer-live-bar">
          <div><i>△</i><strong>BLACK MAGIC / NOVEMBER CUT</strong></div>
          <span className={connected ? "is-connected" : ""}>{connected ? "STAGE LIVE" : "STAGE LOADING"}</span>
          <button type="button" onClick={() => {
            if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
            else deskRef.current?.requestFullscreen?.().catch(() => {});
          }}>{fullscreen ? "EXIT DESK" : "FULL DESK"}</button>
        </header>
        <div className="trailer-live-frame">
          <iframe src="/trailer" title="Black Magic November preview player" allow="autoplay; fullscreen" allowFullScreen />
        </div>
        <footer><span>THREE PASTES · THREE CHAPTERS</span><span>04:50 / NEW MUSIC PERFORMANCE</span></footer>
      </section>

      <section className="trailer-live-code" aria-label="예고편 라이브 코드">
        <header className="trailer-code-header">
          <div><p>HYE-JEONG / LIVE VISUAL SCORE</p><h1>Paste the signal.</h1></div>
          <span><i /> AUTO TYPE</span>
        </header>

        <div className="trailer-paste-sequence" aria-label="세 개의 챕터 코드 복사">
          {(Object.keys(TRAILER_CHAPTERS) as TrailerChapterId[]).map((chapterId) => (
            <button
              key={chapterId}
              type="button"
              className={`${copiedChapter === chapterId ? "is-copied" : ""} ${completed.has(chapterId) ? "is-complete" : ""}`}
              onClick={() => copyChapter(chapterId)}
              disabled={active}
            >
              <i>{completed.has(chapterId) ? "✓" : TRAILER_CHAPTERS[chapterId].number}</i>
              <span>COPY CHAPTER</span>
              <strong>{TRAILER_CHAPTERS[chapterId].title.replace(/^.*·\s*/, "")}</strong>
            </button>
          ))}
        </div>

        <section className="trailer-code-editor">
          <div className="trailer-code-tab"><span>november.preview.live.ts</span><span>PASTE → AUTO PERFORM</span></div>
          <div className="trailer-code-shell">
            <pre aria-hidden="true" style={{ transform: `translateY(${-scrollTop}px)` }}>{Array.from({ length: lineCount }, (_, index) => index + 1).join("\n")}</pre>
            <textarea
              ref={editorRef}
              value={source}
              onChange={(event) => setSource(event.target.value)}
              onPaste={handlePaste}
              onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
              readOnly={active}
              className={active ? "is-typing" : ""}
              placeholder="COPY CHAPTER → click here → ⌘V"
              aria-label="11월 예고편 공연 코드"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              wrap="off"
            />
          </div>
          <div className={`trailer-code-message ${error ? "is-error" : ""}`} role="status">
            <span>{error ? "ERROR" : active ? "PERFORMING" : connected ? "READY" : "CONNECTING"}</span>
            <p>{error ?? message}</p>
            <button type="button" onClick={() => { cancelTyping(); setSource(""); setError(null); }}>CLEAR</button>
          </div>
        </section>

        <section className="trailer-cue-monitor" aria-label="예고편 큐 상태">
          <div className="trailer-cue-heading">
            <span>TIMELINE SYNC</span>
            <strong>{monitor?.chapter.title ?? "WAITING FOR CHAPTER 01"}</strong>
            <em className={`is-${monitor?.phase ?? "idle"}`}>{(monitor?.phase ?? "idle").toUpperCase()}</em>
            <time>{formatTime(monitor?.elapsedMs ?? 0)} / {formatTime(monitor?.totalMs ?? 0)}</time>
          </div>
          <div className="trailer-cue-progress"><i style={{ width: `${monitor?.progress ?? 0}%` }} /></div>
          <div className="trailer-cue-pair">
            <div><span>CURRENT</span><code>{monitor?.currentCue ? cueName(monitor.currentCue.command, monitor.currentCue.label) : "WAITING FOR PASTE"}</code></div>
            <div><span>NEXT</span><code>{monitor?.nextCue ? `${formatTime(monitor.nextCue.atSeconds * 1000)} · ${cueName(monitor.nextCue.command, monitor.nextCue.label)}` : monitor?.phase === "complete" ? "CHAPTER COMPLETE" : "—"}</code></div>
          </div>
        </section>
      </section>
    </main>
  );
}
