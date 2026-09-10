"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
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

const INITIAL_SOURCE = `// type a cue, then press ⌘ + Enter

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

const createRunId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `live-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const getLineNumber = (source: string, offset: number) =>
  source.slice(0, offset).split("\n").length;

export function LiveCodingConsole() {
  const channelRef = useRef<BroadcastChannel | null>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const deskRef = useRef<HTMLElement>(null);
  const [source, setSource] = useState(INITIAL_SOURCE);
  const [values, setValues] = useState<LiveVisualValues>({ ...LIVE_VISUAL_DEFAULTS });
  const [history, setHistory] = useState<ExecutionEntry[]>([]);
  const [lastSignalAt, setLastSignalAt] = useState(0);
  const [clock, setClock] = useState(() => Date.now());
  const [message, setMessage] = useState("코드를 직접 입력하세요. 실행한 줄만 영상에 반영됩니다.");
  const [error, setError] = useState<string | null>(null);
  const [editorScrollTop, setEditorScrollTop] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const connected = clock - lastSignalAt < 3_500;
  const lineCount = useMemo(
    () => Math.max(18, source.split("\n").length),
    [source],
  );

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
      }
    };

    channel.postMessage({ kind: "live-visual:hello", version: 1, at: Date.now() });
    const clockTimer = window.setInterval(() => setClock(Date.now()), 1_000);
    return () => {
      window.clearInterval(clockTimer);
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

  const runAll = useCallback(() => execute(source, 1), [execute, source]);

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
      if (event.shiftKey) runAll();
      else runCurrent();
    }
  }, [runAll, runCurrent, source]);

  const resetVisuals = useCallback(() => execute("reset(1.8);", 1), [execute]);

  const clearEditor = useCallback(() => {
    setSource("");
    setError(null);
    setMessage("편집기를 비웠습니다. 새 큐를 직접 입력하세요.");
    window.requestAnimationFrame(() => editorRef.current?.focus());
  }, []);

  const toggleDeskFullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    else deskRef.current?.requestFullscreen?.().catch(() => {});
  }, []);

  return (
    <main ref={deskRef} className="live-performance-page">
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
          <span className="live-code-mode"><i /> MANUAL</span>
        </header>

        <section className="live-editor-panel live-manual-editor">
          <div className="live-panel-bar">
            <span>performance.live.ts</span>
            <span>⌘↵ LINE · ⇧⌘↵ ALL</span>
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
                if (error) setError(null);
              }}
              onKeyDown={handleEditorKeyDown}
              onScroll={(event) => setEditorScrollTop(event.currentTarget.scrollTop)}
              aria-label="실시간 공연 코드"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              wrap="off"
            />
          </div>

          <div className="live-command-strip" aria-label="명령어 삽입">
            {COMMAND_REFERENCE.slice(0, 5).map((command) => (
              <button key={command} type="button" onClick={() => insertAtCursor(command)}>
                {command.split("(")[0]}
              </button>
            ))}
          </div>

          <div className="live-editor-actions">
            <button className="live-run-button" type="button" onClick={runCurrent} disabled={!connected}>
              RUN LINE <span>⌘↵</span>
            </button>
            <button type="button" onClick={runAll} disabled={!connected}>RUN ALL</button>
            <button type="button" onClick={resetVisuals} disabled={!connected}>RESET FRAME</button>
            <button type="button" onClick={clearEditor}>CLEAR</button>
          </div>
        </section>

        <section className={`live-console-message live-manual-status ${error ? "is-error" : ""}`} role="status">
          <span>{error ? "ERROR" : connected ? "READY" : "CONNECTING"}</span>
          <p>{error ?? (connected ? message : "왼쪽 시네마틱 플레이어를 준비하고 있습니다.")}</p>
        </section>

        <section className="live-manual-monitor" aria-label="라이브 효과 상태">
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
      </section>
    </main>
  );
}
