import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(import.meta.dirname, "..");
const fps = 24;
const output = join(root, "public/video/chapter-3/the-shadow-motion-pass.mp4");
const work = mkdtempSync(join(tmpdir(), "night-letter-ch3-"));

const assets = {
  mirrorNormal: "public/images/backgrounds/chapter-3-mirror-normal.png",
  mirrorShadow: "public/images/backgrounds/chapter-3-mirror-shadow.png",
  mirrorSink: "public/images/backgrounds/chapter-3-mirror-sink-insert.png",
  bedroom: "public/images/backgrounds/chapter-3-bedroom-shadow.png",
  bedroomCurtain: "public/images/backgrounds/chapter-3-bedroom-curtain-insert.png",
  bedroomDoor: "public/images/backgrounds/chapter-3-bedroom-doorway-insert.png",
  school: "public/images/backgrounds/chapter-3-school-shadow.png",
  schoolFeet: "public/images/backgrounds/chapter-3-school-feet-insert.png",
  schoolEmpty: "public/images/backgrounds/chapter-3-school-empty-insert.png",
};

/**
 * 05:36–08:24 / 168 seconds. Wide, medium, close and insert framings are
 * intentionally intercut; no single composition remains longer than ten seconds.
 */
const shots = [
  { label: "mirror-wide", source: assets.mirrorShadow, duration: 8, z: [1.01, 1.055], anchor: [0.5, 0.5], pan: [-5, -2] },
  { label: "reflection-medium", source: assets.mirrorShadow, duration: 7, z: [1.28, 1.34], anchor: [0.59, 0.43], pan: [5, -3] },
  { label: "sink-insert", source: assets.mirrorSink, duration: 7, z: [1.08, 1.16], anchor: [0.61, 0.62], pan: [-8, 1] },
  { label: "reflection-mismatch", source: assets.mirrorNormal, blendWith: assets.mirrorShadow, duration: 8, z: [1.46, 1.52], anchor: [0.51, 0.43], pan: [2, -2], blend: [1.7, 5.7], fadeOut: 0.8 },

  { label: "bedroom-wide", source: assets.bedroom, duration: 8, z: [1.01, 1.045], anchor: [0.5, 0.5], pan: [-4, 0], fadeIn: 0.8 },
  { label: "sleeping-close", source: assets.bedroom, duration: 8, z: [1.72, 1.79], anchor: [0.24, 0.49], pan: [3, -1] },
  { label: "curtain-insert", source: assets.bedroomCurtain, duration: 8, z: [1.05, 1.12], anchor: [0.48, 0.47], pan: [8, -2] },
  { label: "doorway-floor", source: assets.bedroomDoor, duration: 8, z: [1.06, 1.13], anchor: [0.67, 0.58], pan: [-7, -1] },
  { label: "room-from-door", source: assets.bedroom, duration: 8, z: [1.22, 1.29], anchor: [0.67, 0.52], pan: [-9, -2], darken: 0.018 },
  { label: "breath-close", source: assets.bedroom, duration: 8, z: [1.92, 1.99], anchor: [0.2, 0.45], pan: [2, 1] },
  { label: "threshold-return", source: assets.bedroomDoor, duration: 8, z: [1.28, 1.36], anchor: [0.69, 0.52], pan: [-4, -1], darken: 0.026 },
  { label: "bedside-medium", source: assets.bedroom, duration: 8, z: [1.38, 1.46], anchor: [0.39, 0.49], pan: [4, -2], darken: 0.032 },
  { label: "rain-listens", source: assets.bedroomCurtain, duration: 8, z: [1.22, 1.3], anchor: [0.44, 0.45], pan: [-4, 0], darken: 0.025 },
  { label: "shadow-crosses-bed", source: assets.bedroom, duration: 8, z: [1.52, 1.6], anchor: [0.38, 0.5], pan: [-4, -2], darken: 0.05 },
  { label: "voice-hold", source: assets.bedroom, duration: 4, z: [2.04, 2.08], anchor: [0.2, 0.44], pan: [0, 0], darken: 0.042, fadeOut: 0.75 },

  { label: "school-empty", source: assets.schoolEmpty, duration: 8, z: [1.01, 1.055], anchor: [0.51, 0.5], pan: [6, -1], fadeIn: 0.75 },
  { label: "school-wide", source: assets.school, duration: 8, z: [1.02, 1.075], anchor: [0.49, 0.51], pan: [-4, -1] },
  { label: "school-medium", source: assets.school, duration: 8, z: [1.35, 1.42], anchor: [0.47, 0.43], pan: [5, -2] },
  { label: "footfall-insert", source: assets.schoolFeet, duration: 8, z: [1.04, 1.12], anchor: [0.5, 0.58], pan: [-5, 0] },
  { label: "borrowed-confidence", source: assets.school, duration: 8, z: [1.56, 1.63], anchor: [0.46, 0.36], pan: [-2, -1] },
  { label: "wrong-shadow-detail", source: assets.schoolFeet, duration: 8, z: [1.2, 1.28], anchor: [0.55, 0.68], pan: [5, -1], darken: 0.014 },
  { label: "attached-shadow-wide", source: assets.school, duration: 6, z: [1.08, 1.13], anchor: [0.51, 0.52], pan: [4, -1], darken: 0.022, fadeOut: 0.65 },
];

const totalDuration = shots.reduce((sum, shot) => sum + shot.duration, 0);
if (totalDuration !== 168) {
  throw new Error(`Chapter 3 must be exactly 168 seconds; received ${totalDuration}.`);
}

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
    `zoompan=z='${zoom}':x='${x}':y='${y}':d=1:s=1280x720:fps=${fps}`,
  ].join(",");
}

function finishFilter(shot) {
  const brightness = -(shot.darken ?? 0);
  const filters = [
    `eq=contrast=1.035:brightness=${brightness}:saturation=0.82`,
    "noise=alls=1.2:allf=t+u",
  ];
  if (shot.fadeIn) filters.push(`fade=t=in:st=0:d=${shot.fadeIn}:color=black`);
  if (shot.fadeOut) {
    filters.push(`fade=t=out:st=${shot.duration - shot.fadeOut}:d=${shot.fadeOut}:color=black`);
  }
  filters.push("setsar=1", "format=yuv420p");
  return filters.join(",");
}

mkdirSync(dirname(output), { recursive: true });

try {
  const renderedShots = [];
  shots.forEach((shot, index) => {
    const shotOutput = join(work, `${String(index + 1).padStart(2, "0")}-${shot.label}.mp4`);
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
      "-preset", "fast",
      "-crf", "19",
      "-pix_fmt", "yuv420p",
      shotOutput,
    ]);
    renderedShots.push(shotOutput);
  });

  const concatList = join(work, "concat.txt");
  writeFileSync(concatList, renderedShots.map((file) => `file '${file}'`).join("\n"));
  run([
    "-y",
    "-f", "concat",
    "-safe", "0",
    "-i", concatList,
    "-c", "copy",
    "-movflags", "+faststart",
    output,
  ]);

  console.log(`Rendered ${shots.length} shots / ${totalDuration}s → ${output}`);
  console.log(`Output file: ${basename(output)}`);
} finally {
  rmSync(work, { recursive: true, force: true });
}
