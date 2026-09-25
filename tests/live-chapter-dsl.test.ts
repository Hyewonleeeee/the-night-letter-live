import assert from "node:assert/strict";
import test from "node:test";
import {
  CHAPTER_ONE_LIVE_SOURCE,
  LIVE_CHAPTER_SOURCES,
  LIVE_PERFORMANCE_CHAPTERS,
  getLiveAmbienceCueId,
  getLiveChapterHoldTime,
} from "../app/config/livePerformanceChapters.ts";
import { parseLiveChapterProgram } from "../app/lib/liveChapterDsl.ts";
import {
  buildLiveAutoTypingPlan,
  getAutoTypedCharacterCount,
} from "../app/lib/liveAutoTyping.ts";

test("accepts the complete Chapter 1 performance block", () => {
  const result = parseLiveChapterProgram(CHAPTER_ONE_LIVE_SOURCE);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.chapterId, "01_invitation");
  assert.equal(result.cues.length, 18);
  assert.deepEqual(result.cues.at(0), {
    atSeconds: 0,
    command: "shot",
    label: "wellington_house",
  });
  assert.deepEqual(result.cues.at(-1), {
    atSeconds: 198,
    command: "fade",
    label: "black",
  });
  assert.deepEqual(result.cues.find((cue) => cue.label === "exterior_wind"), {
    atSeconds: 0,
    command: "ambience",
    label: "exterior_wind",
    gain: 0.46,
    pan: -0.12,
  });
  assert.deepEqual(result.cues.find((cue) => cue.label === "letter_whoosh"), {
    atSeconds: 24,
    command: "ambience",
    label: "letter_whoosh",
    gain: 0.72,
    pan: 0,
  });
  assert.deepEqual(result.cues.find((cue) => cue.label === "letter_taps"), {
    atSeconds: 52,
    command: "ambience",
    label: "letter_taps",
    gain: 0.46,
    pan: -0.04,
  });
});

test("accepts the emergency one-line Chapter 1 trigger", () => {
  const result = parseLiveChapterProgram('chapter("01_invitation").run();');
  assert.deepEqual(result, { ok: true, chapterId: "01_invitation", cues: [] });
});

test("accepts all five complete performance blocks", () => {
  const expectedCueCounts = {
    "01_invitation": 18,
    "02_first_sign": 18,
    "03_bargain": 16,
    "04_price": 16,
    "05_return": 17,
  } as const;

  Object.entries(LIVE_CHAPTER_SOURCES).forEach(([chapterId, source]) => {
    const result = parseLiveChapterProgram(source);
    assert.equal(result.ok, true, `${chapterId} should parse`);
    if (!result.ok) return;
    assert.equal(result.chapterId, chapterId);
    assert.equal(result.cues.length, expectedCueCounts[chapterId as keyof typeof expectedCueCounts]);
  });
});

test("maps every live ambience label to a real timeline cue id", () => {
  Object.values(LIVE_CHAPTER_SOURCES).forEach((source) => {
    const result = parseLiveChapterProgram(source);
    assert.equal(result.ok, true);
    if (!result.ok) return;
    result.cues.filter((cue) => cue.command === "ambience").forEach((cue) => {
      assert.match(getLiveAmbienceCueId(cue.label) ?? "", /^chapter-[1-5]-/);
    });
  });
});

test("holds every final chapter frame without entering the next chapter", () => {
  Object.keys(LIVE_PERFORMANCE_CHAPTERS).forEach((chapterId) => {
    const chapter = LIVE_PERFORMANCE_CHAPTERS[chapterId as keyof typeof LIVE_PERFORMANCE_CHAPTERS];
    const holdTime = getLiveChapterHoldTime(chapter.id);
    assert.ok(holdTime < chapter.endSeconds);
    assert.equal(holdTime, chapter.endSeconds - 1 / 24);
  });
});

test("rejects an unknown cue before dispatching playback", () => {
  const result = parseLiveChapterProgram(CHAPTER_ONE_LIVE_SOURCE.replace(
    'shot("boy_at_window")',
    'shot("wrong_window")',
  ));
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.line, 6);
  assert.match(result.message, /등록되지 않은 shot 큐/);
});

test("rejects missing run and out-of-range cue times", () => {
  const missingRun = parseLiveChapterProgram(CHAPTER_ONE_LIVE_SOURCE.replace("invitation.run();", ""));
  assert.equal(missingRun.ok, false);
  if (!missingRun.ok) assert.match(missingRun.message, /run\(\)/);

  const outOfRange = parseLiveChapterProgram(CHAPTER_ONE_LIVE_SOURCE.replace("at(198)", "at(220)"));
  assert.equal(outOfRange.ok, false);
  if (!outOfRange.ok) assert.match(outOfRange.message, /챕터 길이를 벗어났습니다/);
});

test("paces auto typing across each complete chapter timeline", () => {
  Object.entries(LIVE_CHAPTER_SOURCES).forEach(([chapterId, source]) => {
    const chapter = LIVE_PERFORMANCE_CHAPTERS[chapterId as keyof typeof LIVE_PERFORMANCE_CHAPTERS];
    const durationSeconds = chapter.endSeconds - chapter.startSeconds;
    const plan = buildLiveAutoTypingPlan(source, durationSeconds);
    assert.equal(plan.fullSource, source);
    assert.equal(plan.characterTimesMs.length, source.length);
    assert.ok(plan.characterTimesMs.every((time, index) => index === 0 || time > plan.characterTimesMs[index - 1]));
    assert.ok(plan.characterTimesMs.at(-1)! < durationSeconds * 1000);
    assert.equal(getAutoTypedCharacterCount(plan, 0), 0);
    assert.equal(getAutoTypedCharacterCount(plan, durationSeconds * 1000), source.length);

    const middle = Math.floor(source.length / 2);
    assert.ok(getAutoTypedCharacterCount(plan, plan.characterTimesMs[middle]) >= middle + 1);

    for (const match of source.matchAll(/^.*\.at\(\s*(\d+(?:\.\d+)?)\s*\).*$/gm)) {
      const lineEnd = match.index + match[0].length - 1;
      const cueTimeMs = Number(match[1]) * 1000;
      assert.ok(
        plan.characterTimesMs[lineEnd] <= Math.max(cueTimeMs, 6_000),
        `${chapterId} cue at ${match[1]}s should be visible before its scene`,
      );
    }
  });
});
