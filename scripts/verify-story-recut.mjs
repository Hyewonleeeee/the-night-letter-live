import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(import.meta.dirname, "..");
const clips = [
  { path: "public/video/chapter-2/the-first-sign-recut.mp4", duration: 134, start: 202, shots: 29 },
  { path: "public/video/chapter-3/the-contract-recut.mp4", duration: 168, start: 336, shots: 24 },
  { path: "public/video/chapter-4/the-price-recut.mp4", duration: 168, start: 504, shots: 22 },
  { path: "public/video/chapter-5/the-return-recut.mp4", duration: 168, start: 672, shots: 24 },
];

for (const clip of clips) {
  const absolute = resolve(root, clip.path);
  if (!existsSync(absolute) || statSync(absolute).size === 0) {
    throw new Error(`Missing rendered clip: ${clip.path}`);
  }

  const probe = spawnSync("ffprobe", [
    "-v", "error",
    "-select_streams", "v:0",
    "-show_entries", "stream=codec_name,width,height,avg_frame_rate:format=duration",
    "-of", "json",
    absolute,
  ], { encoding: "utf8" });

  if (probe.status !== 0) throw new Error(probe.stderr || `ffprobe failed for ${clip.path}`);
  const data = JSON.parse(probe.stdout);
  const stream = data.streams?.[0];
  const duration = Number(data.format?.duration);
  if (stream?.codec_name !== "h264" || stream?.width !== 1280 || stream?.height !== 720) {
    throw new Error(`Unexpected video format for ${clip.path}: ${JSON.stringify(stream)}`);
  }
  if (stream.avg_frame_rate !== "24/1" || Math.abs(duration - clip.duration) > 0.06) {
    throw new Error(`Timing mismatch for ${clip.path}: ${duration}s at ${stream.avg_frame_rate}`);
  }

  console.log(`${clip.path}: ${duration.toFixed(3)}s, ${stream.width}x${stream.height}, 24fps, ${clip.shots} shots, timeline ${clip.start}s–${clip.start + clip.duration}s`);
}
