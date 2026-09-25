import { mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const SAMPLE_RATE = 48_000;
const OUTPUT_DIRECTORY = new URL("../public/audio/chapter-1/", import.meta.url);

mkdirSync(OUTPUT_DIRECTORY, { recursive: true });

const clamp = (value, minimum = -1, maximum = 1) =>
  Math.min(maximum, Math.max(minimum, value));

const smoothstep = (minimum, maximum, value) => {
  const normalized = clamp((value - minimum) / (maximum - minimum), 0, 1);
  return normalized * normalized * (3 - 2 * normalized);
};

const pulse = (time, start, end, attack = 0.2, release = 0.4) => {
  if (time < start || time >= end) return 0;
  return Math.min(
    smoothstep(start, start + attack, time),
    1 - smoothstep(end - release, end, time),
  );
};

const panStereo = (sample, pan) => [
  sample * Math.sqrt((1 - clamp(pan, -1, 1)) * 0.5),
  sample * Math.sqrt((1 + clamp(pan, -1, 1)) * 0.5),
];

const seededRandom = (seed) => {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return ((state >>> 0) / 4_294_967_296) * 2 - 1;
  };
};

const lowPass = (cutoffHz) => {
  const alpha = 1 - Math.exp((-2 * Math.PI * cutoffHz) / SAMPLE_RATE);
  let value = 0;
  return (sample) => {
    value += alpha * (sample - value);
    return value;
  };
};

const highPass = (cutoffHz) => {
  const low = lowPass(cutoffHz);
  return (sample) => sample - low(sample);
};

const bandNoise = (seed, lowCut, highCut) => {
  const random = seededRandom(seed);
  const high = highPass(lowCut);
  const low = lowPass(highCut);
  return () => low(high(random()));
};

const writeWave = (path, durationSeconds, renderSample) => {
  const frameCount = Math.round(durationSeconds * SAMPLE_RATE);
  const dataSize = frameCount * 4;
  const buffer = Buffer.allocUnsafe(44 + dataSize);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(2, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 4, 28);
  buffer.writeUInt16LE(4, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let frame = 0; frame < frameCount; frame += 1) {
    const time = frame / SAMPLE_RATE;
    const [left, right] = renderSample(time, frame);
    buffer.writeInt16LE(Math.round(clamp(left) * 32_767), 44 + frame * 4);
    buffer.writeInt16LE(Math.round(clamp(right) * 32_767), 46 + frame * 4);
  }

  writeFileSync(path, buffer);
};

const encode = (name, duration, renderSample) => {
  const wavPath = join(tmpdir(), `night-letter-${name}.wav`);
  const mp3Path = new URL(`${name}.mp3`, OUTPUT_DIRECTORY);
  writeWave(wavPath, duration, renderSample);
  const result = spawnSync("ffmpeg", [
    "-y",
    "-hide_banner",
    "-loglevel", "error",
    "-i", wavPath,
    "-codec:a", "libmp3lame",
    "-q:a", "2",
    mp3Path.pathname,
  ], { encoding: "utf8" });
  unlinkSync(wavPath);
  if (result.status !== 0) {
    throw new Error(`ffmpeg failed for ${name}: ${result.stderr}`);
  }
  process.stdout.write(`rendered ${name}.mp3 (${duration.toFixed(2)}s)\n`);
};

const makeExteriorWind = () => {
  const airLeft = bandNoise(0x10a1, 55, 1_900);
  const airRight = bandNoise(0x10a2, 55, 1_700);
  const hissLeft = bandNoise(0x10a3, 1_400, 5_600);
  const hissRight = bandNoise(0x10a4, 1_600, 5_200);
  const bells = [7.4, 18.6];
  return (time) => {
    const gust = 0.64
      + 0.2 * Math.sin(time * 0.41 + 0.8)
      + 0.1 * Math.sin(time * 0.93 + 2.1);
    const drift = 0.11 * Math.sin(time * 0.18 - 1.2);
    let left = (airLeft() * 0.2 + hissLeft() * 0.035) * gust * (1 - drift);
    let right = (airRight() * 0.2 + hissRight() * 0.035) * gust * (1 + drift);
    for (const bellTime of bells) {
      const age = time - bellTime;
      if (age >= 0 && age < 4.8) {
        const envelope = (1 - Math.exp(-age * 12)) * Math.exp(-age * 0.82);
        const bell = (
          Math.sin(2 * Math.PI * 523.25 * age)
          + 0.42 * Math.sin(2 * Math.PI * 784.88 * age + 0.2)
        ) * envelope * 0.012;
        left += bell * 0.58;
        right += bell;
      }
    }
    return [left, right];
  };
};

const makeInteriorRoom = () => {
  const roomLeft = bandNoise(0x20b1, 42, 920);
  const roomRight = bandNoise(0x20b2, 45, 840);
  const rain = bandNoise(0x20b3, 1_900, 6_300);
  return (time) => {
    const breath = 0.72 + 0.12 * Math.sin(time * 0.22) + 0.06 * Math.sin(time * 0.61 + 1.4);
    const hum = Math.sin(2 * Math.PI * 49.7 * time) * 0.008;
    const distantRain = rain() * (0.018 + 0.008 * Math.sin(time * 0.37 + 0.6));
    return [
      roomLeft() * 0.105 * breath + hum + distantRain * 0.7,
      roomRight() * 0.105 * breath + hum * 0.83 + distantRain,
    ];
  };
};

const makeLetterWhoosh = () => {
  const paperAir = bandNoise(0x30c1, 260, 4_800);
  const edgeAir = bandNoise(0x30c2, 1_200, 7_200);
  return (time) => {
    const firstGlance = pulse(time, 0.18, 2.55, 0.5, 0.85);
    const returnCurve = pulse(time, 2.9, 7.35, 1.25, 1.15);
    const landing = pulse(time, 6.45, 9.75, 0.85, 1.25);
    const envelope = firstGlance * 0.42 + returnCurve * 0.78 + landing * 0.48;
    const flutter = 0.78
      + 0.14 * Math.sin(time * 2 * Math.PI * 3.1)
      + 0.08 * Math.sin(time * 2 * Math.PI * 7.4 + 0.7);
    const sample = (
      paperAir() * 0.43
      + edgeAir() * 0.13
    ) * envelope * flutter;
    const travel = smoothstep(0.7, 9.1, time);
    const pan = -0.88 + travel * 1.62 + 0.06 * Math.sin(time * 1.7);
    const [left, right] = panStereo(sample, pan);
    const contactAge = time - 8.75;
    const contact = contactAge >= 0 && contactAge < 0.22
      ? Math.sin(2 * Math.PI * 118 * contactAge) * Math.exp(-contactAge * 25) * 0.09
      : 0;
    return [left + contact * 0.7, right + contact];
  };
};

const makePaperClose = () => {
  const fibers = bandNoise(0x40d1, 480, 7_100);
  const body = bandNoise(0x40d2, 90, 1_250);
  const gestures = [
    { at: 1.2, length: 1.45, pan: -0.28, amount: 0.52 },
    { at: 4.9, length: 1.1, pan: 0.18, amount: 0.44 },
    { at: 9.1, length: 1.65, pan: 0.07, amount: 0.61 },
    { at: 13.4, length: 2.25, pan: -0.05, amount: 0.68 },
    { at: 16.3, length: 1.2, pan: 0.12, amount: 0.38 },
  ];
  return (time) => {
    let left = 0;
    let right = 0;
    for (const gesture of gestures) {
      const envelope = pulse(
        time,
        gesture.at,
        gesture.at + gesture.length,
        Math.min(0.25, gesture.length * 0.25),
        Math.min(0.5, gesture.length * 0.4),
      );
      if (envelope <= 0) continue;
      const age = time - gesture.at;
      const rub = (
        fibers() * 0.3
        + body() * 0.2
      ) * envelope * gesture.amount * (0.78 + 0.22 * Math.sin(age * 31));
      const stereo = panStereo(rub, gesture.pan + 0.08 * Math.sin(age * 2.1));
      left += stereo[0];
      right += stereo[1];
    }
    return [left, right];
  };
};

const LETTER_TAP_GROUPS = [
  [0.2, 0.54, 0.91, 1.31, 1.68, 2.09, 2.47, 2.82],
  [4.2, 4.55, 4.89, 5.31, 5.72, 6.13, 6.56, 6.97],
  [8.46, 8.86, 9.27, 9.72, 10.14, 10.55, 10.94],
  [12.46, 12.82, 13.2, 13.57, 14.02, 14.47, 14.86, 15.27, 15.61],
  [16.63, 17.04, 17.45, 17.91, 18.36, 18.79, 19.14],
];

const makeLetterTaps = () => {
  const clickNoise = bandNoise(0x50e1, 1_100, 8_700);
  const taps = LETTER_TAP_GROUPS.flatMap((group, groupIndex) => group.map((at, index) => ({
    at,
    pan: -0.18 + ((index * 0.13 + groupIndex * 0.09) % 0.36),
    pitch: 205 + ((index * 37 + groupIndex * 19) % 130),
    strength: 0.76 + ((index * 17 + groupIndex * 11) % 19) / 100,
  })));
  return (time) => {
    let left = 0;
    let right = 0;
    for (const tap of taps) {
      const age = time - tap.at;
      if (age < 0 || age >= 0.085) continue;
      const envelope = (1 - Math.exp(-age * 950)) * Math.exp(-age * 54);
      const knock = Math.sin(2 * Math.PI * tap.pitch * age) * 0.13;
      const tick = clickNoise() * 0.34;
      const stereo = panStereo((knock + tick) * envelope * tap.strength, tap.pan);
      left += stereo[0];
      right += stereo[1];
    }
    return [left, right];
  };
};

const makeTimeShift = () => {
  const lowAirLeft = bandNoise(0x60f1, 52, 1_050);
  const lowAirRight = bandNoise(0x60f2, 52, 1_120);
  const nightAir = bandNoise(0x60f3, 900, 4_600);
  return (time) => {
    const arc = 0.55 + 0.25 * Math.sin((time / 30) * Math.PI);
    const darken = smoothstep(15, 29, time);
    const left = lowAirLeft() * 0.14 * arc + nightAir() * 0.025 * darken;
    const right = lowAirRight() * 0.14 * arc + nightAir() * 0.032 * darken;
    const distantTone = Math.sin(2 * Math.PI * 73.4 * time) * 0.006 * smoothstep(21, 29, time);
    return [left + distantTone, right + distantTone * 0.9];
  };
};

const makeRitualAir = () => {
  const roomLeft = bandNoise(0x7101, 38, 760);
  const roomRight = bandNoise(0x7102, 38, 720);
  const cloth = bandNoise(0x7103, 350, 5_600);
  const clothMoves = [6.2, 17.4, 29.1, 42.2];
  return (time) => {
    const stillness = 0.74 + 0.08 * Math.sin(time * 0.19);
    let left = roomLeft() * 0.075 * stillness;
    let right = roomRight() * 0.075 * stillness;
    const hum = Math.sin(2 * Math.PI * 41.2 * time) * 0.0075;
    left += hum;
    right += hum * 0.94;
    for (let index = 0; index < clothMoves.length; index += 1) {
      const start = clothMoves[index];
      const envelope = pulse(time, start, start + 1.85, 0.45, 0.8);
      if (envelope <= 0) continue;
      const rustle = cloth() * 0.19 * envelope * (0.78 + 0.22 * Math.sin((time - start) * 23));
      const stereo = panStereo(rustle, [-0.36, 0.28, -0.08, 0.2][index]);
      left += stereo[0];
      right += stereo[1];
    }
    return [left, right];
  };
};

encode("exterior-wind", 24, makeExteriorWind());
encode("interior-room", 72, makeInteriorRoom());
encode("letter-whoosh", 10, makeLetterWhoosh());
encode("paper-close", 18, makePaperClose());
encode("letter-taps", 20, makeLetterTaps());
encode("time-shift", 34, makeTimeShift());
encode("ritual-air", 66.35, makeRitualAir());
