import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(import.meta.dirname, "..");
const fps = 24;
const size = "1280x720";
const work = mkdtempSync(join(tmpdir(), "night-letter-story-recut-"));

const images = {
  ritual: "public/images/backgrounds/scene-2-ritual-room-cloth.png",
  familyEvening: "public/images/backgrounds/chapter-2-family-evening.png",
  morningRoom: "public/images/backgrounds/scene-3-morning-room.png",
  handleIntact: "public/images/backgrounds/scene-3-door-handle-intact.png",
  handleApproach: "public/images/backgrounds/scene-3-handle-hand-01-approach.png",
  handleContact: "public/images/backgrounds/scene-3-handle-hand-02-contact.png",
  handleGrip: "public/images/backgrounds/scene-3-handle-hand-03-grip.png",
  handlePress: "public/images/backgrounds/scene-3-handle-hand-04-press.png",
  handleRecoil: "public/images/backgrounds/scene-3-handle-hand-05-recoil.png",
  handleBroken: "public/images/backgrounds/scene-3-door-handle-broken.png",
  anxiousBoy: "public/images/backgrounds/scene-3-boy-anxious.png",
  roadGrounded: "public/images/backgrounds/chapter-4-road-car-grounded.png",
  roadLifted: "public/images/backgrounds/chapter-4-road-car-lifted.png",
  garden: "public/images/backgrounds/scene-3-morning-garden.png",
  gardenScorched: "public/images/backgrounds/scene-3-morning-garden-scorched.png",
  mirrorNormal: "public/images/backgrounds/chapter-3-mirror-normal.png",
  mirrorShadow: "public/images/backgrounds/chapter-3-mirror-shadow-black.png",
  mirrorSink: "public/images/backgrounds/chapter-3-mirror-sink-insert.png",
  schoolWalk: "public/images/backgrounds/chapter-3-school-shadow.png",
  schoolFeet: "public/images/backgrounds/chapter-3-school-feet-insert.png",
  schoolEmpty: "public/images/backgrounds/chapter-3-school-empty-insert.png",
  bedroom: "public/images/backgrounds/chapter-3-bedroom-shadow.png",
  bedroomCurtain: "public/images/backgrounds/chapter-3-bedroom-curtain-insert.png",
  bedroomDoor: "public/images/backgrounds/chapter-3-bedroom-doorway-insert.png",
  snail: "public/images/backgrounds/chapter-3-snail-offering.png",
  snailShadow: "public/images/backgrounds/chapter-3-snail-shadow.png",
  thumb: "public/images/backgrounds/chapter-3-thumb-payment.png",
  confrontation: "public/images/backgrounds/chapter-4-refusal.png",
  dogBed: "public/images/backgrounds/chapter-4-empty-dog-bed.png",
  familyThreat: "public/images/backgrounds/chapter-4-family-threat.png",
  void: "public/images/backgrounds/chapter-5-void-resistance.png",
  finalSpell: "public/images/backgrounds/chapter-5-final-spell.png",
  serpentPov: "public/images/backgrounds/chapter-5-serpent-pov.png",
  dawnRoom: "public/images/backgrounds/scene-3-morning-room.png",
  dawnFace: "public/images/backgrounds/scene-3-boy-anxious.png",
  breakfastLetter: "public/images/backgrounds/chapter-5-breakfast-letter.png",
};

const s = (label, source, duration, options = {}) => ({
  label,
  source,
  duration,
  z: options.z ?? [1.01, 1.025],
  anchor: options.anchor ?? [0.5, 0.5],
  pan: options.pan ?? [0, 0],
  ...options,
});

const chapters = [
  {
    id: "chapter-2",
    output: "public/video/chapter-2/the-first-sign-recut.mp4",
    duration: 134,
    startSeconds: 202,
    shots: [
      s("family-wide", images.familyEvening, 6, { z: [1.01, 1.025], fadeIn: 0.8 }),
      s("family-table", images.familyEvening, 4, { z: [1.3, 1.31], anchor: [0.58, 0.64] }),
      s("family-window", images.familyEvening, 4, { z: [1.22, 1.23], anchor: [0.78, 0.25], fadeOut: 0.7 }),
      s("morning-room", images.morningRoom, 6, { z: [1.01, 1.02], fadeIn: 0.8 }),
      s("door-wide", images.morningRoom, 4, { z: [1.2, 1.21], anchor: [0.72, 0.52] }),
      s("handle-approach", images.handleApproach, 4, { z: [1.02, 1.035], anchor: [0.56, 0.52] }),
      s("handle-contact", images.handleContact, 4, { z: [1.04, 1.055], anchor: [0.56, 0.52] }),
      s("handle-grip", images.handleGrip, 3, { z: [1.07, 1.085], anchor: [0.55, 0.5] }),
      s("handle-strain", images.handlePress, 3, { z: [1.1, 1.115], anchor: [0.54, 0.5] }),
      s("handle-snap", images.handleRecoil, 3, { z: [1.12, 1.125], anchor: [0.53, 0.5] }),
      s("broken-handle", images.handleBroken, 5, { z: [1.06, 1.075], anchor: [0.55, 0.52] }),
      s("shock-reaction", images.anxiousBoy, 6, { z: [1.44, 1.46], anchor: [0.5, 0.34], fadeOut: 0.5 }),
      s("school-empty", images.schoolEmpty, 6, { z: [1.01, 1.02], fadeIn: 0.55 }),
      s("school-confidence", images.schoolWalk, 6, { z: [1.18, 1.2], anchor: [0.48, 0.48] }),
      s("attached-shadow", images.schoolFeet, 6, { z: [1.22, 1.24], anchor: [0.54, 0.68], fadeOut: 0.45 }),
      s("road-wide", images.roadGrounded, 4, { z: [1.01, 1.02], fadeIn: 0.45 }),
      s("car-still", images.roadGrounded, 3, { z: [1.27, 1.285], anchor: [0.72, 0.55] }),
      s("car-rises", images.roadGrounded, 7, { blendWith: images.roadLifted, blend: [1.2, 5.8], z: [1.08, 1.1], anchor: [0.65, 0.55] }),
      s("boy-sees-car", images.roadLifted, 4, { z: [1.45, 1.47], anchor: [0.22, 0.48], fadeOut: 0.4 }),
      s("garden-wide", images.garden, 4, { z: [1.01, 1.02], fadeIn: 0.45 }),
      s("flowers-before", images.garden, 4, { z: [1.62, 1.64], anchor: [0.22, 0.58] }),
      s("flowers-scorch", images.garden, 6, { blendWith: images.gardenScorched, blend: [1.2, 4.9], z: [1.58, 1.6], anchor: [0.23, 0.56] }),
      s("uneasy-reaction", images.anxiousBoy, 4, { z: [1.48, 1.5], anchor: [0.49, 0.35], darken: 0.025 }),
      s("first-sleepless-night", images.bedroom, 4, { z: [1.01, 1.02], fadeIn: 0.45, darken: 0.03 }),
      s("rain-counts-nights", images.bedroomCurtain, 4, { z: [1.12, 1.13], anchor: [0.48, 0.46], fadeOut: 0.55, darken: 0.035 }),
      s("mirror-normal-wide", images.mirrorNormal, 5, { z: [1.01, 1.02], fadeIn: 0.5 }),
      s("mirror-normal-medium", images.mirrorNormal, 4, { z: [1.34, 1.355], anchor: [0.5, 0.42] }),
      s("reflection-arrives", images.mirrorNormal, 5, { blendWith: images.mirrorShadow, blend: [1.4, 4.1], z: [1.42, 1.44], anchor: [0.54, 0.42] }),
      s("hes-back", images.mirrorShadow, 6, { z: [1.58, 1.6], anchor: [0.54, 0.4], fadeOut: 0.8 }),
    ],
  },
  {
    id: "chapter-3",
    output: "public/video/chapter-3/the-contract-recut.mp4",
    duration: 168,
    startSeconds: 336,
    shots: [
      s("sleeping-wide", images.bedroom, 8, { z: [1.01, 1.025], fadeIn: 0.8 }),
      s("curtain-listens", images.bedroomCurtain, 6, { z: [1.08, 1.095], anchor: [0.46, 0.45] }),
      s("doorway-low", images.bedroomDoor, 6, { z: [1.08, 1.1], anchor: [0.68, 0.58] }),
      s("sleeping-close", images.bedroom, 6, { z: [1.78, 1.8], anchor: [0.22, 0.46] }),
      s("voice-wide", images.bedroom, 8, { z: [1.16, 1.18], anchor: [0.64, 0.52], darken: 0.035 }),
      s("voice-threshold", images.bedroomDoor, 6, { z: [1.32, 1.34], anchor: [0.7, 0.55], darken: 0.045 }),
      s("boy-hears", images.bedroom, 6, { z: [1.9, 1.92], anchor: [0.22, 0.45] }),
      s("rain-under-voice", images.bedroomCurtain, 6, { z: [1.24, 1.26], anchor: [0.44, 0.44], fadeOut: 0.8, darken: 0.04 }),
      s("snail-offering-wide", images.snail, 8, { z: [1.01, 1.025], fadeIn: 0.8 }),
      s("snail-close", images.snail, 6, { z: [1.52, 1.54], anchor: [0.54, 0.57] }),
      s("shadow-reaches-snail", images.snail, 8, { blendWith: images.snailShadow, blend: [2.2, 6.5], z: [1.18, 1.2], anchor: [0.55, 0.56], darken: 0.025 }),
      s("shell-cold-light", images.snailShadow, 6, { z: [1.7, 1.72], anchor: [0.53, 0.55], fadeOut: 0.6 }),
      s("payment-reveal", images.thumb, 8, { z: [1.01, 1.02], fadeIn: 0.6 }),
      s("bandaged-thumb", images.thumb, 8, { z: [1.55, 1.57], anchor: [0.48, 0.53] }),
      s("triangle-remains", images.thumb, 6, { z: [1.48, 1.5], anchor: [0.78, 0.58], fadeOut: 0.55 }),
      s("larger-price-wide", images.confrontation, 8, { z: [1.01, 1.025], fadeIn: 0.55 }),
      s("collar-insert", images.confrontation, 6, { z: [2.05, 2.07], anchor: [0.75, 0.77] }),
      s("boy-understands", images.confrontation, 7, { z: [1.55, 1.57], anchor: [0.42, 0.42] }),
      s("doorway-demand", images.confrontation, 7, { z: [1.55, 1.57], anchor: [0.8, 0.46], darken: 0.035 }),
      s("snail-is-too-small", images.snailShadow, 8, { z: [1.38, 1.4], anchor: [0.54, 0.56], darken: 0.04 }),
      s("demand-medium", images.confrontation, 8, { z: [1.3, 1.32], anchor: [0.52, 0.47] }),
      s("refusal-close", images.confrontation, 8, { z: [1.8, 1.82], anchor: [0.43, 0.35] }),
      s("unanswered-door", images.bedroomDoor, 7, { z: [1.18, 1.2], anchor: [0.68, 0.54], darken: 0.05 }),
      s("boy-turns-away", images.confrontation, 7, { z: [1.4, 1.42], anchor: [0.4, 0.45], fadeOut: 0.9 }),
    ],
  },
  {
    id: "chapter-4",
    output: "public/video/chapter-4/the-price-recut.mp4",
    duration: 168,
    startSeconds: 504,
    shots: [
      s("collar-ordinary", images.confrontation, 8, { z: [1.55, 1.57], anchor: [0.72, 0.76], fadeIn: 0.7 }),
      s("collar-detail", images.confrontation, 6, { z: [2.15, 2.17], anchor: [0.75, 0.77] }),
      s("empty-bed-wide", images.dogBed, 8, { z: [1.01, 1.025] }),
      s("empty-collar-close", images.dogBed, 7, { z: [1.55, 1.57], anchor: [0.36, 0.63] }),
      s("hallway-after", images.dogBed, 7, { z: [1.35, 1.37], anchor: [0.68, 0.48], fadeOut: 0.65 }),
      s("grief-reaction", images.anxiousBoy, 7, { z: [1.62, 1.64], anchor: [0.49, 0.34], fadeIn: 0.65, darken: 0.025 }),
      s("contract-ends-wide", images.confrontation, 8, { z: [1.01, 1.025] }),
      s("anger-medium", images.confrontation, 7, { z: [1.45, 1.47], anchor: [0.42, 0.42] }),
      s("triangle-rejected", images.snailShadow, 6, { z: [1.28, 1.3], anchor: [0.54, 0.56], fadeOut: 0.6, darken: 0.045 }),
      s("family-distant", images.familyThreat, 8, { z: [1.01, 1.025], fadeIn: 0.65 }),
      s("warm-room-unaware", images.familyThreat, 7, { z: [1.5, 1.52], anchor: [0.72, 0.38] }),
      s("shadow-on-wall", images.familyThreat, 7, { z: [1.45, 1.47], anchor: [0.24, 0.5], darken: 0.025 }),
      s("boy-sees-threat", images.anxiousBoy, 7, { z: [1.72, 1.74], anchor: [0.5, 0.34] }),
      s("hallway-between", images.familyThreat, 7, { z: [1.22, 1.24], anchor: [0.55, 0.49], fadeOut: 0.65 }),
      s("boy-stands-ground", images.confrontation, 8, { z: [1.14, 1.16], fadeIn: 0.65 }),
      s("room-loses-depth", images.confrontation, 8, { blendWith: images.void, blend: [1.5, 6.7], z: [1.14, 1.16], anchor: [0.52, 0.49], darken: 0.035 }),
      s("void-arrives-wide", images.void, 8, { z: [1.01, 1.025] }),
      s("first-resistance", images.void, 8, { z: [1.42, 1.44], anchor: [0.42, 0.45] }),
      s("family-at-stake", images.familyThreat, 8, { z: [1.26, 1.28], anchor: [0.68, 0.42], darken: 0.04 }),
      s("darkness-closes", images.void, 8, { z: [1.62, 1.64], anchor: [0.46, 0.43], darken: 0.045 }),
      s("battle-begins", images.void, 8, { z: [1.2, 1.22], anchor: [0.5, 0.5] }),
      s("black-hold", images.void, 12, { z: [1.82, 1.84], anchor: [0.48, 0.42], fadeOut: 1.2, darken: 0.075 }),
    ],
  },
  {
    id: "chapter-5",
    output: "public/video/chapter-5/the-return-recut.mp4",
    duration: 168,
    startSeconds: 672,
    shots: [
      s("battle-wide", images.void, 8, { z: [1.01, 1.025], fadeIn: 0.7 }),
      s("battle-medium", images.void, 8, { z: [1.38, 1.4], anchor: [0.42, 0.44] }),
      s("exhaustion-close", images.void, 7, { z: [1.78, 1.8], anchor: [0.4, 0.34] }),
      s("family-memory", images.familyThreat, 7, { z: [1.5, 1.52], anchor: [0.72, 0.4], darken: 0.04 }),
      s("last-resistance", images.void, 8, { z: [1.5, 1.52], anchor: [0.43, 0.43] }),
      s("spell-ignites", images.void, 8, { blendWith: images.finalSpell, blend: [2.2, 6.2], z: [1.17, 1.19], anchor: [0.52, 0.49] }),
      s("final-spell-wide", images.finalSpell, 8, { z: [1.01, 1.025] }),
      s("final-spell-close", images.finalSpell, 8, { z: [1.42, 1.44], anchor: [0.55, 0.42] }),
      s("darkness-breaks", images.finalSpell, 8, { blendWith: images.confrontation, blend: [2.4, 6.8], z: [1.15, 1.17], anchor: [0.52, 0.48], fadeOut: 0.55 }),
      s("after-battle-room", images.confrontation, 6, { z: [1.01, 1.02], fadeIn: 0.55 }),
      s("relief-is-brief", images.anxiousBoy, 6, { z: [1.52, 1.54], anchor: [0.5, 0.35] }),
      s("hallway-home", images.dogBed, 6, { z: [1.16, 1.18], anchor: [0.67, 0.48], fadeOut: 0.6 }),
      s("serpent-pov-wide", images.serpentPov, 8, { z: [1.01, 1.025], fadeIn: 0.55 }),
      s("serpent-glides", images.serpentPov, 8, { z: [1.2, 1.23], anchor: [0.62, 0.53], pan: [2, 0] }),
      s("envelope-in-path", images.serpentPov, 8, { z: [1.68, 1.71], anchor: [0.7, 0.54] }),
      s("tunnel-closes", images.serpentPov, 6, { z: [2.05, 2.08], anchor: [0.61, 0.5], fadeOut: 0.25, darken: 0.08 }),
      s("wake", images.bedroom, 4, { z: [1.72, 1.74], anchor: [0.22, 0.45], fadeIn: 0.18 }),
      s("dawn-relief", images.dawnFace, 7, { z: [1.45, 1.47], anchor: [0.5, 0.35] }),
      s("ordinary-morning", images.dawnRoom, 6, { z: [1.01, 1.02], fadeOut: 0.6 }),
      s("breakfast-wide", images.breakfastLetter, 8, { z: [1.01, 1.02], anchor: [0.65, 0.45], fadeIn: 0.6 }),
      s("telling-the-dream", images.breakfastLetter, 6, { z: [1.28, 1.3], anchor: [0.76, 0.28] }),
      s("mother-reaches", images.breakfastLetter, 7, { z: [1.34, 1.36], anchor: [0.46, 0.55] }),
      s("same-triangle", images.breakfastLetter, 7, { z: [1.72, 1.74], anchor: [0.55, 0.61] }),
      s("ambiguous-look", images.dawnFace, 5, { z: [1.58, 1.6], anchor: [0.5, 0.34], fadeOut: 1.3 }),
    ],
  },
];

function run(args) {
  const result = spawnSync("ffmpeg", args, { cwd: root, stdio: "inherit" });
  if (result.status !== 0) throw new Error(`ffmpeg failed with status ${result.status}`);
}

function cameraFilter(shot) {
  const frames = Math.round(shot.duration * fps);
  const [z0, z1] = shot.z;
  const [anchorX, anchorY] = shot.anchor;
  const [panX, panY] = shot.pan;
  const zoom = `${z0}+(${z1 - z0})*on/${Math.max(1, frames - 1)}`;
  const x = `clip(iw*${anchorX}-iw/zoom/2+(${panX})*on/${Math.max(1, frames - 1)},0,iw-iw/zoom)`;
  const y = `clip(ih*${anchorY}-ih/zoom/2+(${panY})*on/${Math.max(1, frames - 1)},0,ih-ih/zoom)`;
  return [
    "scale=1920:1080:force_original_aspect_ratio=increase",
    "crop=1920:1080",
    `zoompan=z='${zoom}':x='${x}':y='${y}':d=1:s=${size}:fps=${fps}`,
  ].join(",");
}

function finishFilter(shot) {
  const brightness = -(shot.darken ?? 0);
  const filters = [`eq=contrast=1.025:brightness=${brightness}:saturation=0.84`];
  if (shot.fadeIn) filters.push(`fade=t=in:st=0:d=${shot.fadeIn}:color=black`);
  if (shot.fadeOut) filters.push(`fade=t=out:st=${shot.duration - shot.fadeOut}:d=${shot.fadeOut}:color=black`);
  filters.push("setsar=1", "format=yuv420p");
  return filters.join(",");
}

function renderShot(shot, chapterWork, index) {
  const shotOutput = join(chapterWork, `${String(index + 1).padStart(2, "0")}-${shot.label}.mp4`);
  const inputArgs = ["-y", "-loop", "1", "-framerate", String(fps), "-i", shot.source];
  let filter;

  if (shot.blendWith) {
    inputArgs.push("-loop", "1", "-framerate", String(fps), "-i", shot.blendWith);
    const [blendStart, blendEnd] = shot.blend;
    const blendWeight = `min(max((T-${blendStart})/${blendEnd - blendStart},0),1)`;
    const camera = cameraFilter(shot);
    filter = `[0:v]${camera}[a];[1:v]${camera}[b];[a][b]blend=all_expr='A*(1-${blendWeight})+B*${blendWeight}',${finishFilter(shot)}[v]`;
  } else {
    filter = `[0:v]${cameraFilter(shot)},${finishFilter(shot)}[v]`;
  }

  run([
    ...inputArgs,
    "-filter_complex", filter,
    "-map", "[v]",
    "-frames:v", String(Math.round(shot.duration * fps)),
    "-an",
    "-c:v", "libx264",
    "-preset", "veryfast",
    "-crf", "22",
    "-pix_fmt", "yuv420p",
    shotOutput,
  ]);
  return shotOutput;
}

for (const chapter of chapters) {
  const total = chapter.shots.reduce((sum, shot) => sum + shot.duration, 0);
  if (total !== chapter.duration) {
    throw new Error(`${chapter.id} must be ${chapter.duration}s; received ${total}s.`);
  }
}

const selectedChapter = process.argv[2];
const chaptersToRender = selectedChapter
  ? chapters.filter((chapter) => chapter.id === selectedChapter)
  : chapters;
if (selectedChapter && chaptersToRender.length === 0) {
  throw new Error(`Unknown chapter id: ${selectedChapter}`);
}

try {
  for (const chapter of chaptersToRender) {
    const total = chapter.shots.reduce((sum, shot) => sum + shot.duration, 0);

    const chapterWork = join(work, chapter.id);
    mkdirSync(chapterWork, { recursive: true });
    const output = join(root, chapter.output);
    mkdirSync(dirname(output), { recursive: true });
    const rendered = chapter.shots.map((shot, index) => renderShot(shot, chapterWork, index));
    const concatList = join(chapterWork, "concat.txt");
    writeFileSync(concatList, rendered.map((file) => `file '${file}'`).join("\n"));
    run(["-y", "-f", "concat", "-safe", "0", "-i", concatList, "-c", "copy", "-movflags", "+faststart", output]);
    console.log(`${chapter.id}: ${chapter.shots.length} shots / ${total}s / starts at ${chapter.startSeconds}s → ${chapter.output}`);
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}
