import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the one-screen live cinema desk at the root route", async () => {
  const response = await render("/");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Code the frame\./i);
  assert.match(html, /CINEMATIC OUTPUT/i);
  assert.match(html, /<iframe[^>]+src="\/player"/i);
});

test("server-renders the cinematic player page", async () => {
  const response = await render("/player");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html lang="ko">/i);
  assert.match(html, /The Night Letter — Cinematic Player/i);
  assert.match(html, /cinematic-player/i);
  assert.match(html, /scene-shortcuts/i);
  assert.match(html, /THE NIGHT LETTER/i);
});

test("server-renders the isolated November trailer and its three-paste live desk", async () => {
  const trailerResponse = await render("/trailer");
  assert.equal(trailerResponse.status, 200);
  const trailerHtml = await trailerResponse.text();
  assert.match(trailerHtml, /Black Magic — November Preview/i);
  assert.match(trailerHtml, /trailer-player/i);

  const liveResponse = await render("/live-trailer");
  assert.equal(liveResponse.status, 200);
  const liveHtml = await liveResponse.text();
  assert.match(liveHtml, /Paste the signal\./i);
  assert.match(liveHtml, /COPY CHAPTER/i);
  assert.match(liveHtml, /THREE PASTES · THREE CHAPTERS/i);
  assert.match(liveHtml, /<iframe[^>]+src="\/trailer"/i);

  await Promise.all([
    "chapter-1-finger-triangle.png",
    "chapter-2-waking-hand.png",
    "chapter-2-book-levitation.png",
    "chapter-3-final-fear.png",
  ].map((filename) => access(new URL(`../public/images/trailer/${filename}`, import.meta.url))));
});

test("server-renders the one-screen manual live cinema desk", async () => {
  const response = await render("/live");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Code the frame\./i);
  assert.match(html, /performance\.live\.ts/i);
  assert.match(html, /CINEMATIC OUTPUT/i);
  assert.match(html, /RUN LINE/i);
  assert.match(html, /RUN CHAPTER/i);
  assert.match(html, /AUTO TYPE/i);
  for (const chapter of ["01", "02", "03", "04", "05"]) {
    assert.match(html, new RegExp(`CHAPTER ${chapter}`, "i"));
  }
  assert.match(html, /SAFE COMMANDS/i);
  assert.match(html, /<iframe[^>]+src="\/player"/i);
});

test("keeps live coding commands allowlisted and free of dynamic evaluation", async () => {
  const source = await readFile(
    new URL("../app/lib/liveCoding.ts", import.meta.url),
    "utf8",
  );

  assert.match(source, /camera\.push/);
  assert.match(source, /fog\.opacity/);
  assert.match(source, /wind\.amount/);
  assert.match(source, /light\.cool/);
  assert.doesNotMatch(source, /\beval\s*\(|new\s+Function\s*\(/);

  const consoleSource = await readFile(
    new URL("../app/components/LiveCodingConsole.tsx", import.meta.url),
    "utf8",
  );
  assert.match(consoleSource, /parseLiveVisualProgram/);
  assert.match(consoleSource, /parseLiveChapterProgram/);
  assert.match(consoleSource, /buildLiveAutoTypingPlan/);
  assert.match(consoleSource, /performAutoTyping/);
  assert.match(consoleSource, /handleEditorPaste/);
  assert.match(consoleSource, /editorMode === "manual"/);
  assert.match(consoleSource, /live-auto-monitor/);
  assert.match(consoleSource, /CURRENT CUE/);
  assert.match(consoleSource, /NEXT CUE/);
  assert.match(consoleSource, /live-chapter:start/);
  assert.match(consoleSource, /runCurrent/);
  assert.match(consoleSource, /event\.metaKey \|\| event\.ctrlKey/);
  assert.doesNotMatch(consoleSource, /LiveChapterRunner|isLiveChapterTrigger/);
  assert.doesNotMatch(consoleSource, /\beval\s*\(|new\s+Function\s*\(/);

  const stageSource = await readFile(
    new URL("../app/components/LiveVisualStage.tsx", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(stageSource, /LiveChapterRunner/);
});

test("keeps Scene 3 bounded to The First Sign and ships its replaceable assets", async () => {
  const config = await readFile(
    new URL("../app/config/playerConfig.ts", import.meta.url),
    "utf8",
  );

  assert.match(config, /export const SCENE_3_TIMING/);
  assert.match(config, /start:\s*SCENE_2_TIMING\.end/);
  assert.match(config, /end:\s*292/);
  assert.match(config, /text:\s*"THE FIRST SIGN"/);
  assert.doesNotMatch(config, /first-sign-(voldemort|black-shape|spell)/i);

  await Promise.all([
    "scene-3-morning-room.png",
    "scene-3-door-handle-intact.png",
    "scene-3-door-handle-broken.png",
    "scene-3-morning-garden.png",
    "scene-3-boy-anxious.png",
  ].map((filename) => access(
    new URL(`../public/images/backgrounds/${filename}`, import.meta.url),
  )));

  assert.doesNotMatch(config, /first-sign-stone/);
  assert.match(config, /first-sign-school/);
  assert.match(config, /first-sign-car/);
  assert.match(config, /first-sign-garden-consequence/);
});

test("builds the complete 14-minute animatic as five operator chapters", async () => {
  const config = await readFile(
    new URL("../app/config/playerConfig.ts", import.meta.url),
    "utf8",
  );

  assert.match(config, /export const FULL_STORY_TIMING/);
  assert.match(config, /end:\s*840/);
  assert.match(config, /durationSeconds:\s*FULL_STORY_TIMING\.end/);
  assert.match(config, /export const FIVE_CHAPTER_MARKERS/);
  for (const start of [0, 202, 336, 504, 672]) {
    assert.match(config, new RegExp(`timeSeconds:\\s*${start}\\b`));
  }
  assert.match(config, /III · THE BARGAIN/);
  assert.match(config, /IV · THE PRICE/);
  assert.match(config, /V · THE RETURN/);
  assert.match(config, /Give me a living vessel\./);
  assert.match(config, /The contract is over\./);
  assert.match(config, /Avada Kedavra\./);
  assert.match(config, /I had the strangest dream\./);
});

test("runs all five chapters from pasted allowlisted code and ships audible local ambience", async () => {
  const chapterConfig = await readFile(
    new URL("../app/config/livePerformanceChapters.ts", import.meta.url),
    "utf8",
  );
  const dsl = await readFile(
    new URL("../app/lib/liveChapterDsl.ts", import.meta.url),
    "utf8",
  );
  const player = await readFile(
    new URL("../app/components/CinematicPlayer.tsx", import.meta.url),
    "utf8",
  );

  assert.match(chapterConfig, /"01_invitation"/);
  assert.match(chapterConfig, /"02_first_sign"/);
  assert.match(chapterConfig, /"03_bargain"/);
  assert.match(chapterConfig, /"04_price"/);
  assert.match(chapterConfig, /"05_return"/);
  assert.match(chapterConfig, /startSeconds:\s*0/);
  assert.match(chapterConfig, /endSeconds:\s*202/);
  assert.match(chapterConfig, /invitation\.run\(\)/);
  assert.match(chapterConfig, /firstSign\.run\(\)/);
  assert.match(chapterConfig, /bargain\.run\(\)/);
  assert.match(chapterConfig, /price\.run\(\)/);
  assert.match(chapterConfig, /returnFromDark\.run\(\)/);
  assert.match(dsl, /parseLiveChapterProgram/);
  assert.match(dsl, /KNOWN_CUES/);
  assert.doesNotMatch(dsl, /\beval\s*\(|new\s+Function\s*\(/);
  assert.match(player, /finishLiveChapter/);
  assert.match(player, /getLiveChapterHoldTime/);

  const audioFiles = [
    ["chapter-1/exterior-wind.mp3", 24],
    ["chapter-1/interior-room.mp3", 72],
    ["chapter-1/letter-whoosh.mp3", 10],
    ["chapter-1/paper-close.mp3", 18],
    ["chapter-1/letter-taps.mp3", 20],
    ["chapter-1/time-shift.mp3", 34],
    ["chapter-1/ritual-air.mp3", 66.35],
    ["chapter-1/threshold-drone.mp3", 29.65],
    ["chapter-2/domestic-room.mp3", 52],
    ["chapter-2/handle-metal.mp3", 10],
    ["chapter-2/morning-street.mp3", 66],
    ["chapter-2/night-rain.mp3", 20],
    ["chapter-2/bathroom-hum.mp3", 24],
    ["chapter-3/contract-night.mp3", 168],
    ["chapter-3/shadow-whisper.mp3", 28],
    ["chapter-3/offering-air.mp3", 120],
    ["chapter-4/consequence-room.mp3", 168],
    ["chapter-4/loss-rumble.mp3", 48],
    ["chapter-4/family-shadow.mp3", 108],
    ["chapter-4/shadow-command.mp3", 36],
    ["chapter-5/void-pressure.mp3", 114],
    ["chapter-5/final-spell-surge.mp3", 14],
    ["chapter-5/serpent-floor.mp3", 34],
    ["chapter-5/dawn-room.mp3", 54],
    ["chapter-5/letter-slide.mp3", 11],
  ];
  for (const [filename, expectedDuration] of audioFiles) {
    const url = new URL(`../public/audio/${filename}`, import.meta.url);
    await access(url);
    const path = fileURLToPath(url);
    const probe = spawnSync("ffprobe", [
      "-v", "error",
      "-show_entries", "format=duration",
      "-of", "default=nokey=1:noprint_wrappers=1",
      path,
    ], { encoding: "utf8" });
    assert.equal(probe.status, 0);
    assert.ok(Math.abs(Number(probe.stdout.trim()) - expectedDuration) < 0.05);

    const loudness = spawnSync("ffmpeg", [
      "-i", path,
      "-af", "volumedetect",
      "-f", "null",
      "-",
    ], { encoding: "utf8" });
    const maximum = loudness.stderr.match(/max_volume:\s*(-?[\d.]+) dB/);
    assert.ok(maximum, `${filename} must report measurable audio`);
    assert.ok(Number(maximum[1]) > -60, `${filename} must not be silent`);
  }
});

test("ships every replaceable plate used by the five-chapter continuation", async () => {
  await Promise.all([
    "chapter-3-mirror-normal.png",
    "chapter-3-mirror-shadow-black.png",
    "chapter-3-bedroom-shadow.png",
    "chapter-3-school-shadow.png",
    "chapter-4-road-car-grounded.png",
    "chapter-4-road-car-lifted.png",
    "chapter-4-refusal.png",
    "chapter-5-void-resistance.png",
    "chapter-2-family-evening.png",
    "scene-3-morning-garden-scorched.png",
    "chapter-3-snail-offering.png",
    "chapter-3-snail-shadow.png",
    "chapter-3-thumb-payment.png",
    "chapter-4-empty-dog-bed.png",
    "chapter-4-family-threat.png",
    "chapter-5-final-spell.png",
    "chapter-5-serpent-pov.png",
    "chapter-5-breakfast-letter.png",
  ].map((filename) => access(
    new URL(`../public/images/backgrounds/${filename}`, import.meta.url),
  )));
});

test("ships the seekable 99-shot four-chapter story recut", async () => {
  const config = await readFile(
    new URL("../app/config/playerConfig.ts", import.meta.url),
    "utf8",
  );
  const renderScript = await readFile(
    new URL("../scripts/render-story-recut.mjs", import.meta.url),
    "utf8",
  );

  assert.match(config, /chapter-2-first-sign-recut/);
  assert.match(config, /chapter-3-contract-recut/);
  assert.match(config, /chapter-4-price-recut/);
  assert.match(config, /chapter-5-return-recut/);
  assert.match(renderScript, /chapter\.shots\.reduce/);

  await Promise.all([
    "chapter-2/the-first-sign-recut.mp4",
    "chapter-3/the-contract-recut.mp4",
    "chapter-4/the-price-recut.mp4",
    "chapter-5/the-return-recut.mp4",
  ].map((filename) => access(
    new URL(`../public/video/${filename}`, import.meta.url),
  )));
});
