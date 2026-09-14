import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
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

test("server-renders the one-screen manual live cinema desk", async () => {
  const response = await render("/live");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Code the frame\./i);
  assert.match(html, /performance\.live\.ts/i);
  assert.match(html, /CINEMATIC OUTPUT/i);
  assert.match(html, /RUN LINE/i);
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

  await Promise.all([
    "scene-3-small-stone.png",
    "scene-3-wildflower.png",
  ].map((filename) => access(
    new URL(`../public/images/props/${filename}`, import.meta.url),
  )));
});

test("builds the complete 14-minute animatic as five operator chapters", async () => {
  const config = await readFile(
    new URL("../app/config/playerConfig.ts", import.meta.url),
    "utf8",
  );

  assert.match(config, /export const LATER_STORY_TIMING/);
  assert.match(config, /end:\s*840/);
  assert.match(config, /durationSeconds:\s*LATER_STORY_TIMING\.end/);
  assert.match(config, /export const FIVE_CHAPTER_MARKERS/);
  for (const start of [0, 168, 336, 504, 672]) {
    assert.match(config, new RegExp(`timeSeconds:\\s*${start}\\b`));
  }
  assert.match(config, /III · THE SHADOW/);
  assert.match(config, /IV · THE PRICE/);
  assert.match(config, /V · THE RETURN/);
  assert.match(config, /Bring me the cat\./);
  assert.match(config, /You don't lead me\./);
});

test("ships every replaceable plate used by the five-chapter continuation", async () => {
  await Promise.all([
    "chapter-3-mirror-normal.png",
    "chapter-3-mirror-shadow.png",
    "chapter-3-bedroom-shadow.png",
    "chapter-3-school-shadow.png",
    "chapter-4-road-car-grounded.png",
    "chapter-4-road-car-lifted.png",
    "chapter-4-refusal.png",
    "chapter-5-void-resistance.png",
  ].map((filename) => access(
    new URL(`../public/images/backgrounds/${filename}`, import.meta.url),
  )));
});

test("ships the seekable 22-shot Chapter 3 motion edit", async () => {
  const config = await readFile(
    new URL("../app/config/playerConfig.ts", import.meta.url),
    "utf8",
  );
  const renderScript = await readFile(
    new URL("../scripts/render-chapter-3.mjs", import.meta.url),
    "utf8",
  );

  assert.match(config, /chapter-3-shadow-motion-pass/);
  assert.match(config, /startSeconds:\s*336/);
  assert.match(config, /endSeconds:\s*504/);
  assert.match(renderScript, /shots\.length/);
  assert.match(renderScript, /totalDuration !== 168/);

  await access(new URL(
    "../public/video/chapter-3/the-shadow-motion-pass.mp4",
    import.meta.url,
  ));

  await Promise.all([
    "chapter-3-mirror-sink-insert.png",
    "chapter-3-bedroom-curtain-insert.png",
    "chapter-3-bedroom-doorway-insert.png",
    "chapter-3-school-empty-insert.png",
    "chapter-3-school-feet-insert.png",
  ].map((filename) => access(
    new URL(`../public/images/backgrounds/${filename}`, import.meta.url),
  )));
});
