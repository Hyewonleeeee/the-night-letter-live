import type { ReactNode } from "react";
import type { LiveChapterScore, LiveChapterTypingPlan } from "../config/liveChapterScore";

type ChapterCodeBlockProps = {
  score: LiveChapterScore;
  plan: LiveChapterTypingPlan;
  revealedCharacters: number;
  showCursor?: boolean;
  compact?: boolean;
};

const tokenPattern = /(\/\/.*|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\b(?:const|await|false|true)\b|\b\d+(?:\.\d+)?\b|\b(?:chapter|score|camera|light|fog|wind|grain)\b)/g;

function highlightCode(code: string): ReactNode[] {
  const result: ReactNode[] = [];
  let cursor = 0;
  for (const match of code.matchAll(tokenPattern)) {
    const index = match.index ?? 0;
    if (index > cursor) result.push(code.slice(cursor, index));
    const token = match[0];
    const className = token.startsWith("//")
      ? "is-comment"
      : token.startsWith('"') || token.startsWith("'")
        ? "is-string"
        : /^(?:const|await|false|true)$/.test(token)
          ? "is-keyword"
          : /^\d/.test(token)
            ? "is-number"
            : "is-object";
    result.push(<span className={className} key={`${index}-${token}`}>{token}</span>);
    cursor = index + token.length;
  }
  if (cursor < code.length) result.push(code.slice(cursor));
  return result;
}

export function ChapterCodeBlock({
  score,
  plan,
  revealedCharacters,
  showCursor = false,
  compact = false,
}: ChapterCodeBlockProps) {
  const activeLineIndex = plan.lineRanges.findIndex(
    ({ end }) => revealedCharacters <= end,
  );
  const safeActiveLine = activeLineIndex === -1 ? score.lines.length - 1 : activeLineIndex;
  const lastVisibleLine = Math.min(score.lines.length - 1, safeActiveLine + (compact ? 0 : 1));

  return (
    <div className={`chapter-code-block ${compact ? "is-compact" : ""}`} aria-label="자동 작성되는 챕터 코드">
      {score.lines.slice(0, lastVisibleLine + 1).map((line, index) => {
        const range = plan.lineRanges[index];
        const visibleCount = Math.max(0, Math.min(line.code.length, revealedCharacters - range.start));
        const visibleCode = line.code.slice(0, visibleCount);
        const cursorVisible = showCursor && index === safeActiveLine;
        return (
          <div className={`chapter-code-line ${index === safeActiveLine ? "is-active" : ""}`} key={`${index}-${line.code}`}>
            <span className="chapter-code-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            <code>
              {highlightCode(visibleCode)}
              {cursorVisible ? <i className="chapter-code-cursor" aria-hidden="true" /> : null}
            </code>
          </div>
        );
      })}
    </div>
  );
}
