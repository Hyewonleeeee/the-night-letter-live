import assert from "node:assert/strict";
import test from "node:test";
import {
  TRAILER_CHAPTERS,
  TRAILER_CHAPTER_SOURCES,
  TRAILER_AUDIO_CUES,
  TRAILER_DURATION_SECONDS,
} from "../app/config/trailerConfig.ts";
import { buildLiveAutoTypingPlan, getAutoTypedCharacterCount } from "../app/lib/liveAutoTyping.ts";
import { parseTrailerProgram } from "../app/lib/trailerDsl.ts";

test("keeps the November cut at 4:50 and divides it into exactly three continuous pastes", () => {
  const chapters = Object.values(TRAILER_CHAPTERS);
  assert.equal(chapters.length, 3);
  assert.equal(chapters[0].startSeconds, 0);
  chapters.slice(1).forEach((chapter, index) => {
    assert.equal(chapter.startSeconds, chapters[index].endSeconds);
  });
  assert.equal(chapters.at(-1)?.endSeconds, TRAILER_DURATION_SECONDS);
  assert.equal(TRAILER_DURATION_SECONDS, 290);
});

test("keeps the November trailer completely silent", () => {
  assert.deepEqual(TRAILER_AUDIO_CUES, []);
});

test("parses and paces all three complete trailer chapter programs", () => {
  Object.entries(TRAILER_CHAPTER_SOURCES).forEach(([chapterId, source]) => {
    const parsed = parseTrailerProgram(source);
    assert.equal(parsed.ok, true, `${chapterId} should parse`);
    if (!parsed.ok) return;
    assert.equal(parsed.chapterId, chapterId);
    assert.ok(parsed.cues.length >= 8);

    const chapter = TRAILER_CHAPTERS[parsed.chapterId];
    const duration = chapter.endSeconds - chapter.startSeconds;
    const plan = buildLiveAutoTypingPlan(source, duration);
    assert.equal(getAutoTypedCharacterCount(plan, 0), 0);
    assert.equal(getAutoTypedCharacterCount(plan, duration * 1000), source.length);
    assert.ok(plan.characterTimesMs.at(-1)! < duration * 1000);
  });
});

test("rejects unknown trailer cues and multiple chapter declarations", () => {
  const unknown = parseTrailerProgram(TRAILER_CHAPTER_SOURCES["01_the_mark"].replace("finger_triangle", "magic_portal"));
  assert.equal(unknown.ok, false);
  if (!unknown.ok) assert.match(unknown.message, /등록되지 않은 큐/);

  const multiple = parseTrailerProgram(`${TRAILER_CHAPTER_SOURCES["01_the_mark"]}\nconst extra = trailerChapter("02_first_sign");`);
  assert.equal(multiple.ok, false);
  if (!multiple.ok) assert.match(multiple.message, /한 번에 한 챕터/);
});
