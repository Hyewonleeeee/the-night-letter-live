"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ClipboardEvent as ReactClipboardEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import {
  LIVE_COMMAND_SPECS,
  LIVE_VISUAL_CHANNEL,
  LIVE_VISUAL_DEFAULTS,
  LIVE_VISUAL_PROPERTIES,
  isLiveVisualAckMessage,
  isLiveVisualStateMessage,
  parseLiveVisualProgram,
  type LiveVisualRunMessage,
  type LiveVisualValues,
} from "../lib/liveCoding";
import {
  LIVE_CHAPTER_SOURCES,
  LIVE_PERFORMANCE_CHAPTERS,
  type LivePerformanceChapterId,
} from "../config/livePerformanceChapters";
import { parseLiveChapterProgram } from "../lib/liveChapterDsl";
import {
  buildLiveAutoTypingPlan,
  getAutoTypedCharacterCount,
  type LiveAutoTypingPlan,
} from "../lib/liveAutoTyping";
import {
  isLiveChapterStatusMessage,
  type LiveChapterStartMessage,
  type LiveChapterStatusMessage,
} from "../lib/liveChapterProtocol";

const INITIAL_SOURCE = `// paste a chapter, then press ⇧⌘ + Enter

`;

const PROPERTY_LABELS: Record<keyof LiveVisualValues, string> = {
  cameraPush: "CAMERA",
  fogOpacity: "FOG",
  windAmount: "WIND",
  coolAmount: "COOL",
  grainAmount: "GRAIN",
};

const COMMAND_REFERENCE = [
  "camera.push(0.018, 8);",
  "fog.opacity(0.055, 7);",
  "wind.amount(0.12, 5);",
  "light.cool(0.035, 6);",
  "grain.amount(0.012, 4);",
  "reset(1.8);",
] as const;

type ExecutionEntry = {
  id: string;
  source: string;
  status: "sent" | "applied";
};

type EditorMode = "manual" | "auto";

type AutoTypingSession = {
  chapterId: LivePerformanceChapterId;
  program: string;
  plan: LiveAutoTypingPlan;
  startedAt: number;
  pausedAt: number | null;
  lastCharacterCount: number;
  lastPaintAt: number;
};

const createRunId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `live-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const getLineNumber = (source: string, offset: number) =>
  source.slice(0, offset).split("\n").length;

const formatChapterTime = (milliseconds: number) => {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
};

const formatCueName = (command: string, label: string) =>
  `${command.toUpperCase()} / ${label.replaceAll("_", " ").replaceAll(":", " · ")}`;

export function LiveCodingConsole() {
  const channelRef = useRef<BroadcastChannel | null>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const deskRef = useRef<HTMLElement>(null);
  const autoSessionRef = useRef<AutoTypingSession | null>(null);
  const autoFrameRef = useRef<number | null>(null);
  const [source, setSource] = useState(INITIAL_SOURCE);
  const [values, setValues] = useState<LiveVisualValues>({ ...LIVE_VISUAL_DEFAULTS });
  const [history, setHistory] = useState<ExecutionEntry[]>([]);
  const [lastSignalAt, setLastSignalAt] = useState(0);
  const [clock, setClock] = useState(() => Date.now());
  const [message, setMessage] = useState("챕터 코드를 붙여 넣고 RUN CHAPTER를 누르세요.");
  const [error, setError] = useState<string | null>(null);
  const [editorScrollTop, setEditorScrollTop] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [chapterStatus, setChapterStatus] = useState<LiveChapterStatusMessage | null>(null);
  const [loadedChapterId, setLoadedChapterId] = useState<LivePerformanceChapterId | null>(null);
  const [editorMode, setEditorMode] = useState<EditorMode>("manual");
  const [stagedProgram, setStagedProgram] = useState<string | null>(null);
  const [autoTypingActive, setAutoTypingActive] = useState(false);

  const connected = clock - lastSignalAt < 3_500;
  const lineCount = useMemo(
    () => Math.max(18, source.split("\n").length),
    [source],
  );
  const autoMonitor = useMemo(() => {
    const result = parseLiveChapterProgram(stagedProgram ?? source);
    const chapterId = result.ok ? result.chapterId : loadedChapterId;
    if (!chapterId) return null;

    const chapter = LIVE_PERFORMANCE_CHAPTERS[chapterId];
    const status = chapterStatus?.chapterId === chapterId ? chapterStatus : null;
    const elapsedMs = status?.elapsedMs ?? 0;
    const elapsedSeconds = elapsedMs / 1000;
    const cues = result.ok ? result.cues : [];
    const currentCue = status
      ? cues.filter((cue) => cue.atSeconds <= elapsedSeconds).at(-1) ?? null
      : null;
    const nextCue = cues.find((cue) => cue.atSeconds > elapsedSeconds) ?? null;
    const totalMs = (chapter.endSeconds - chapter.startSeconds) * 1000;

    return {
      chapter,
      phase: status?.phase ?? "armed",
      elapsedMs,
      totalMs,
      currentCue,
      nextCue,
      progress: Math.min(100, elapsedMs / totalMs * 100),
    };
  }, [chapterStatus, loadedChapterId, source, stagedProgram]);

  useEffect(() => {
    if (!("BroadcastChannel" in window)) {
      return;
    }

    const channel = new BroadcastChannel(LIVE_VISUAL_CHANNEL);
    channelRef.current = channel;
    channel.onmessage = (event: MessageEvent<unknown>) => {
      if (isLiveVisualStateMessage(event.data)) {
        setValues(event.data.values);
        setLastSignalAt(Date.now());
        return;
      }
      if (isLiveVisualAckMessage(event.data)) {
        setValues(event.data.values);
        setLastSignalAt(Date.now());
        const runId = event.data.runId;
        setHistory((entries) => entries.map((entry) =>
          entry.id === runId ? { ...entry, status: "applied" as const } : entry
        ));
        return;
      }
      if (isLiveChapterStatusMessage(event.data)) {
        const status = event.data;
        const autoSession = autoSessionRef.current;
        if (autoSession?.chapterId === status.chapterId) {
          const now = performance.now();
          autoSession.startedAt = now - status.elapsedMs;
          autoSession.pausedAt = status.phase === "paused" ? now : null;

          if (status.phase === "complete") {
            setSource(autoSession.program);
            autoSessionRef.current = null;
            if (autoFrameRef.current !== null) {
              window.cancelAnimationFrame(autoFrameRef.current);
              autoFrameRef.current = null;
            }
            setAutoTypingActive(false);
          } else if (status.phase === "aborted") {
            autoSessionRef.current = null;
            if (autoFrameRef.current !== null) {
              window.cancelAnimationFrame(autoFrameRef.current);
              autoFrameRef.current = null;
            }
            setAutoTypingActive(false);
          }
        }
        setChapterStatus(status);
        setLastSignalAt(Date.now());
        setHistory((entries) => entries.map((entry) =>
          entry.id === status.runId ? { ...entry, status: "applied" as const } : entry
        ));
        const chapter = LIVE_PERFORMANCE_CHAPTERS[status.chapterId];
        if (status.phase === "complete") {
          setMessage(`${chapter.title} 재생이 끝나 마지막 프레임에서 정지했습니다.`);
        } else if (status.phase === "running") {
          setMessage(`${chapter.title} 재생 중 · ${Math.floor(status.elapsedMs / 1000)}초`);
        }
      }
    };

    channel.postMessage({ kind: "live-visual:hello", version: 1, at: Date.now() });
    const clockTimer = window.setInterval(() => setClock(Date.now()), 1_000);
    return () => {
      window.clearInterval(clockTimer);
      if (autoFrameRef.current !== null) window.cancelAnimationFrame(autoFrameRef.current);
      channel.close();
      channelRef.current = null;
    };
  }, []);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    editor.setSelectionRange(INITIAL_SOURCE.length, INITIAL_SOURCE.length);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const execute = useCallback((program: string, sourceLine: number) => {
    const channel = channelRef.current;
    if (!channel || !connected) {
      setError("왼쪽 영상이 준비될 때까지 잠시 기다려주세요.");
      return;
    }

    if (/\bchapter\s*\(/.test(program)) {
      const result = parseLiveChapterProgram(program);
      if (!result.ok) {
        const absoluteLine = sourceLine + result.line - 1;
        setError(`${absoluteLine}행 — ${result.message}`);
        return;
      }

      const id = createRunId();
      const runMessage: LiveChapterStartMessage = {
        kind: "live-chapter:start",
        version: 1,
        runId: id,
        chapterId: result.chapterId,
        ambienceMix: result.cues
          .filter((cue) => cue.command === "ambience")
          .map((cue) => ({ id: cue.label, gain: cue.gain ?? 0, pan: cue.pan ?? 0 })),
        at: Date.now(),
      };
      channel.postMessage(runMessage);
      setHistory((entries) => [{
        id,
        source: `chapter("${result.chapterId}").run()` ,
        status: "sent" as const,
      }, ...entries].slice(0, 6));
      setChapterStatus(null);
      setError(null);
      setMessage(`${LIVE_PERFORMANCE_CHAPTERS[result.chapterId].title}을 영상으로 보냈습니다.`);
      return;
    }

    const result = parseLiveVisualProgram(program);
    if (!result.ok) {
      const absoluteLine = sourceLine + result.line - 1;
      setError(`${absoluteLine}행 — ${result.message}`);
      return;
    }

    const id = createRunId();
    const runMessage: LiveVisualRunMessage = {
      kind: "live-visual:run",
      version: 1,
      id,
      sentAt: Date.now(),
      operations: result.operations,
    };
    channel.postMessage(runMessage);

    const displaySource = program
      .split(/\r?\n/)
      .map((line) => line.replace(/\/\/.*$/, "").trim())
      .filter(Boolean)
      .join("  ");
    const nextEntry: ExecutionEntry = { id, source: displaySource, status: "sent" };
    setHistory((entries) => [nextEntry, ...entries].slice(0, 6));
    setError(null);
    setMessage(`${result.operations.length}개 명령을 영상으로 보냈습니다.`);
  }, [connected]);

  const stopAutoTyping = useCallback((revealCompleteSource = false) => {
    const activeSession = autoSessionRef.current;
    if (revealCompleteSource && activeSession) setSource(activeSession.program);
    autoSessionRef.current = null;
    if (autoFrameRef.current !== null) {
      window.cancelAnimationFrame(autoFrameRef.current);
      autoFrameRef.current = null;
    }
    setAutoTypingActive(false);
  }, []);

  const performAutoTyping = useCallback((program: string) => {
    if (!connected) {
      setError("왼쪽 영상이 준비될 때까지 잠시 기다려주세요.");
      return;
    }

    const result = parseLiveChapterProgram(program);
    if (!result.ok) {
      setError(`${result.line}행 — ${result.message}`);
      return;
    }

    const chapter = LIVE_PERFORMANCE_CHAPTERS[result.chapterId];
    const durationSeconds = chapter.endSeconds - chapter.startSeconds;
    const plan = buildLiveAutoTypingPlan(program, durationSeconds);
    stopAutoTyping();

    const session: AutoTypingSession = {
      chapterId: result.chapterId,
      program,
      plan,
      startedAt: performance.now(),
      pausedAt: null,
      lastCharacterCount: 0,
      lastPaintAt: 0,
    };
    autoSessionRef.current = session;
    setSource("");
    setStagedProgram(program);
    setLoadedChapterId(result.chapterId);
    setAutoTypingActive(true);
    setError(null);
    execute(program, 1);
    setMessage(`${chapter.title} · 영상 시간에 맞춰 코드가 연주됩니다.`);

    const paint = (now: number) => {
      const activeSession = autoSessionRef.current;
      if (!activeSession) {
        autoFrameRef.current = null;
        return;
      }

      const timelineNow = activeSession.pausedAt ?? now;
      const elapsedMs = Math.max(0, timelineNow - activeSession.startedAt);
      const characterCount = getAutoTypedCharacterCount(activeSession.plan, elapsedMs);
      if (
        characterCount !== activeSession.lastCharacterCount &&
        (now - activeSession.lastPaintAt >= 24 || characterCount === activeSession.program.length)
      ) {
        activeSession.lastCharacterCount = characterCount;
        activeSession.lastPaintAt = now;
        setSource(activeSession.program.slice(0, characterCount));
      }
      autoFrameRef.current = window.requestAnimationFrame(paint);
    };

    autoFrameRef.current = window.requestAnimationFrame(paint);
  }, [connected, execute, stopAutoTyping]);

  const runCurrent = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const selectionStart = editor.selectionStart;
    const selectionEnd = editor.selectionEnd;
    if (selectionEnd > selectionStart) {
      execute(source.slice(selectionStart, selectionEnd), getLineNumber(source, selectionStart));
      return;
    }

    const lineStart = source.lastIndexOf("\n", Math.max(0, selectionStart - 1)) + 1;
    const nextBreak = source.indexOf("\n", selectionStart);
    const lineEnd = nextBreak === -1 ? source.length : nextBreak;
    execute(source.slice(lineStart, lineEnd), getLineNumber(source, lineStart));
  }, [execute, source]);

  const runAll = useCallback(() => {
    if (editorMode === "auto") {
      performAutoTyping(stagedProgram ?? source);
      return;
    }
    execute(source, 1);
  }, [editorMode, execute, performAutoTyping, source, stagedProgram]);

  const insertAtCursor = useCallback((text: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const prefix = start > 0 && source[start - 1] !== "\n" ? "\n" : "";
    const insertion = `${prefix}${text}\n`;
    const next = source.slice(0, start) + insertion + source.slice(end);
    const caret = start + insertion.length;
    setSource(next);
    setError(null);
    window.requestAnimationFrame(() => {
      editor.focus();
      editor.setSelectionRange(caret, caret);
    });
  }, [source]);

  const handleEditorKeyDown = useCallback((event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Tab") {
      event.preventDefault();
      const editor = event.currentTarget;
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      const next = source.slice(0, start) + "  " + source.slice(end);
      setSource(next);
      window.requestAnimationFrame(() => editor.setSelectionRange(start + 2, start + 2));
      return;
    }

    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      if (event.shiftKey || editorMode === "auto") runAll();
      else runCurrent();
    }
  }, [editorMode, runAll, runCurrent, source]);

  const handleEditorPaste = useCallback((event: ReactClipboardEvent<HTMLTextAreaElement>) => {
    if (editorMode !== "auto" || autoTypingActive) return;
    const program = event.clipboardData.getData("text");
    if (!/\bchapter\s*\(/.test(program)) return;
    event.preventDefault();
    setStagedProgram(program);
    performAutoTyping(program);
  }, [autoTypingActive, editorMode, performAutoTyping]);

  const resetVisuals = useCallback(() => execute("reset(1.8);", 1), [execute]);

  const clearEditor = useCallback(() => {
    stopAutoTyping();
    setSource("");
    setStagedProgram(null);
    setLoadedChapterId(null);
    setError(null);
    setMessage("편집기를 비웠습니다. 새 큐를 직접 입력하세요.");
    window.requestAnimationFrame(() => editorRef.current?.focus());
  }, [stopAutoTyping]);

  const loadChapter = useCallback((chapterId: LivePerformanceChapterId) => {
    const chapterNumber = String(Object.keys(LIVE_PERFORMANCE_CHAPTERS).indexOf(chapterId) + 1).padStart(2, "0");
    const program = LIVE_CHAPTER_SOURCES[chapterId];
    setStagedProgram(program);
    setSource(editorMode === "auto" ? "" : program);
    setLoadedChapterId(chapterId);
    setError(null);
    setMessage(editorMode === "auto"
      ? `CHAPTER ${chapterNumber}가 준비됐습니다. PERFORM CHAPTER를 누르면 영상과 코드가 함께 시작됩니다.`
      : `CHAPTER ${chapterNumber} 코드가 준비됐습니다. RUN CHAPTER를 누르세요.`);
    window.requestAnimationFrame(() => {
      const editor = editorRef.current;
      if (!editor) return;
      editor.focus();
      editor.setSelectionRange(0, 0);
      editor.scrollTop = 0;
    });
  }, [editorMode]);

  const selectEditorMode = useCallback((nextMode: EditorMode) => {
    if (nextMode === editorMode || autoTypingActive) return;
    setEditorMode(nextMode);
    setError(null);

    if (nextMode === "auto") {
      const parsed = parseLiveChapterProgram(source);
      if (parsed.ok) {
        setStagedProgram(source);
        setLoadedChapterId(parsed.chapterId);
      }
      setSource("");
      setMessage("AUTO TYPE · 챕터를 선택하거나 전체 코드를 붙여 넣으세요.");
    } else {
      if (stagedProgram) setSource(stagedProgram);
      setMessage("MANUAL · 코드를 직접 편집하고 실행할 수 있습니다.");
    }
    window.requestAnimationFrame(() => editorRef.current?.focus());
  }, [autoTypingActive, editorMode, source, stagedProgram]);

  useEffect(() => {
    if (!autoTypingActive) return;
    const editor = editorRef.current;
    if (!editor) return;
    editor.setSelectionRange(source.length, source.length);
    editor.scrollTop = editor.scrollHeight;
    setEditorScrollTop(editor.scrollTop);
  }, [autoTypingActive, source]);

  const toggleDeskFullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    else deskRef.current?.requestFullscreen?.().catch(() => {});
  }, []);

  return (
    <main ref={deskRef} className={`live-performance-page ${editorMode === "auto" ? "is-auto-mode" : ""}`}>
      <section className="live-performance-stage" aria-label="시네마틱 출력">
        <header className="live-desk-bar">
          <div>
            <span>01</span>
            <strong>CINEMATIC OUTPUT</strong>
          </div>
          <div className="live-stage-actions">
            <span className={`live-connection ${connected ? "is-connected" : ""}`}>
              <i />
              {connected ? "STAGE LIVE" : "STAGE LOADING"}
            </span>
            <button type="button" onClick={toggleDeskFullscreen}>
              {fullscreen ? "EXIT DESK" : "FULL DESK"}
            </button>
          </div>
        </header>

        <div className="live-stage-well">
          <div className="live-stage-frame">
            <iframe
              src="/player"
              title="The Night Letter cinematic player"
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          </div>
        </div>

        <footer className="live-stage-note">
          <span>CLICK LEFT FOR PLAYER KEYS</span>
          <span>SPACE · ← → · 1—0</span>
        </footer>
      </section>

      <section className="live-performance-code" aria-label="실시간 코드 편집기">
        <header className="live-code-header">
          <div>
            <p>THE NIGHT LETTER / LIVE CINEMA</p>
            <h1>Code the frame.</h1>
          </div>
          <div className="live-code-modes" aria-label="코드 공연 방식">
            <button
              type="button"
              className={editorMode === "manual" ? "is-selected" : ""}
              onClick={() => selectEditorMode("manual")}
              disabled={autoTypingActive}
            >
              MANUAL
            </button>
            <button
              type="button"
              className={editorMode === "auto" ? "is-selected" : ""}
              onClick={() => selectEditorMode("auto")}
              disabled={autoTypingActive}
            >
              <i /> AUTO TYPE
            </button>
          </div>
        </header>

        <section className="live-editor-panel live-manual-editor">
          <div className="live-panel-bar">
            <span>performance.live.ts</span>
            <span>{editorMode === "auto" ? "TIMELINE SYNC · PASTE TO PERFORM" : "⌘↵ LINE · ⇧⌘↵ ALL"}</span>
          </div>

          <div className="live-editor-shell">
            <div className="live-line-gutter" aria-hidden="true">
              <pre style={{ transform: `translateY(${-editorScrollTop}px)` }}>
                {Array.from({ length: lineCount }, (_, index) => index + 1).join("\n")}
              </pre>
            </div>
            <textarea
              ref={editorRef}
              value={source}
              onChange={(event) => {
                setSource(event.target.value);
                setLoadedChapterId(null);
                if (editorMode === "auto") setStagedProgram(null);
                if (error) setError(null);
              }}
              onKeyDown={handleEditorKeyDown}
              onPaste={handleEditorPaste}
              onScroll={(event) => setEditorScrollTop(event.currentTarget.scrollTop)}
              className={autoTypingActive ? "is-auto-typing" : ""}
              readOnly={autoTypingActive}
              placeholder={editorMode === "auto" ? "Paste a complete chapter here — performance starts automatically." : undefined}
              aria-label="실시간 공연 코드"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              wrap="off"
            />
          </div>

          <div className="live-command-strip live-chapter-strip" aria-label="챕터 코드 불러오기">
            {(Object.keys(LIVE_PERFORMANCE_CHAPTERS) as LivePerformanceChapterId[]).map((chapterId, index) => (
              <button
                key={chapterId}
                type="button"
                className={loadedChapterId === chapterId ? "is-selected" : ""}
                onClick={() => loadChapter(chapterId)}
                disabled={autoTypingActive}
              >
                {`CHAPTER ${String(index + 1).padStart(2, "0")}`}
              </button>
            ))}
          </div>

          <div className="live-command-strip" aria-label="화면 명령어 삽입">
            {COMMAND_REFERENCE.slice(0, 5).map((command) => (
              <button key={command} type="button" onClick={() => insertAtCursor(command)} disabled={editorMode === "auto"}>
                {command.split("(")[0]}
              </button>
            ))}
          </div>

          <div className="live-editor-actions">
            <button className="live-run-button" type="button" onClick={runCurrent} disabled={!connected || editorMode === "auto"}>
              RUN LINE <span>⌘↵</span>
            </button>
            <button type="button" onClick={runAll} disabled={!connected || autoTypingActive}>
              {editorMode === "auto" ? "PERFORM CHAPTER" : "RUN CHAPTER"} <span>⇧⌘↵</span>
            </button>
            <button type="button" onClick={resetVisuals} disabled={!connected}>RESET FRAME</button>
            <button type="button" onClick={clearEditor}>CLEAR</button>
          </div>
        </section>

        <section className={`live-console-message live-manual-status ${error ? "is-error" : ""}`} role="status">
          <span>{error ? "ERROR" : connected ? "READY" : "CONNECTING"}</span>
          <p>{error ?? (connected ? message : "왼쪽 시네마틱 플레이어를 준비하고 있습니다.")}</p>
        </section>

        {chapterStatus ? (
          <section className="live-chapter-status" aria-label="라이브 챕터 상태">
            <span>{LIVE_PERFORMANCE_CHAPTERS[chapterStatus.chapterId].title}</span>
            <strong>{chapterStatus.phase.toUpperCase()}</strong>
            <time>{String(Math.floor(chapterStatus.elapsedMs / 60000)).padStart(2, "0")}:{String(Math.floor(chapterStatus.elapsedMs / 1000) % 60).padStart(2, "0")}</time>
          </section>
        ) : null}

        {editorMode === "manual" ? (
          <>
            <section className="live-manual-monitor" aria-label="수동 화면 효과 상태">
              <div className="live-value-grid">
                {LIVE_VISUAL_PROPERTIES.map((property) => {
                  const spec = Object.values(LIVE_COMMAND_SPECS).find((item) => item.property === property);
                  const maximum = spec?.max ?? 1;
                  return (
                    <div key={property}>
                      <dt>{PROPERTY_LABELS[property]}</dt>
                      <dd>{values[property].toFixed(3)}</dd>
                      <i style={{ width: `${Math.min(100, values[property] / maximum * 100)}%` }} />
                    </div>
                  );
                })}
              </div>

              <div className="live-execution-log">
                <span>LAST EXECUTIONS</span>
                {history.length ? (
                  <ol>
                    {history.slice(0, 3).map((entry) => (
                      <li key={entry.id} className={entry.status === "applied" ? "is-applied" : ""}>
                        <i>{entry.status === "applied" ? "●" : "○"}</i>
                        <code>{entry.source}</code>
                      </li>
                    ))}
                  </ol>
                ) : <p>No code performed yet.</p>}
              </div>
            </section>

            <footer className="live-command-reference live-manual-reference">
              <span>SAFE COMMANDS</span>
              <code>{COMMAND_REFERENCE.join("   ")}</code>
            </footer>
          </>
        ) : (
          <section className="live-auto-monitor" aria-label="자동 챕터 공연 상태">
            <div className="live-auto-monitor-heading">
              <span>TIMELINE SYNC</span>
              <strong>{autoMonitor?.chapter.title ?? "SELECT A CHAPTER"}</strong>
              <em className={`is-${autoMonitor?.phase ?? "idle"}`}>
                {(autoMonitor?.phase ?? "idle").toUpperCase()}
              </em>
              <time>
                {formatChapterTime(autoMonitor?.elapsedMs ?? 0)} / {formatChapterTime(autoMonitor?.totalMs ?? 0)}
              </time>
            </div>
            <div className="live-auto-progress" aria-hidden="true">
              <i style={{ width: `${autoMonitor?.progress ?? 0}%` }} />
            </div>
            <div className="live-auto-cues">
              <div>
                <span>CURRENT CUE</span>
                <code>{autoMonitor?.currentCue
                  ? formatCueName(autoMonitor.currentCue.command, autoMonitor.currentCue.label)
                  : "WAITING FOR PERFORMANCE"}</code>
              </div>
              <div>
                <span>NEXT CUE</span>
                <code>{autoMonitor?.nextCue
                  ? `${formatChapterTime(autoMonitor.nextCue.atSeconds * 1000)} · ${formatCueName(autoMonitor.nextCue.command, autoMonitor.nextCue.label)}`
                  : autoMonitor?.phase === "complete" ? "CHAPTER COMPLETE" : "—"}</code>
              </div>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
