import { mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const SAMPLE_RATE = 48_000;
const OUTPUT_ROOT = new URL("../public/audio/", import.meta.url);

const clamp = (value, minimum = -1, maximum = 1) =>
  Math.min(maximum, Math.max(minimum, value));

const smoothstep = (minimum, maximum, value) => {
  const normalized = clamp((value - minimum) / Math.max(0.0001, maximum - minimum), 0, 1);
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
    const [left, right] = renderSample(frame / SAMPLE_RATE, frame);
    buffer.writeInt16LE(Math.round(clamp(left) * 32_767), 44 + frame * 4);
    buffer.writeInt16LE(Math.round(clamp(right) * 32_767), 46 + frame * 4);
  }
  writeFileSync(path, buffer);
};

const encode = (chapter, name, duration, renderSample) => {
  const outputDirectory = new URL(`${chapter}/`, OUTPUT_ROOT);
  mkdirSync(outputDirectory, { recursive: true });
  const wavPath = join(tmpdir(), `night-letter-${chapter}-${name}.wav`);
  const mp3Path = new URL(`${name}.mp3`, outputDirectory);
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
  if (result.status !== 0) throw new Error(`ffmpeg failed for ${chapter}/${name}: ${result.stderr}`);
  process.stdout.write(`rendered ${chapter}/${name}.mp3 (${duration.toFixed(2)}s)\n`);
};

const makeAtmosphere = ({ seed, low = 45, high = 1_250, level = 0.12, hum = 0, drift = 0.2 }) => {
  const leftNoise = bandNoise(seed, low, high);
  const rightNoise = bandNoise(seed + 1, low * 1.05, high * 0.92);
  const air = bandNoise(seed + 2, Math.max(700, high * 0.7), Math.max(3_200, high * 3.2));
  return (time) => {
    const motion = 0.68
      + 0.16 * Math.sin(time * drift + seed * 0.001)
      + 0.07 * Math.sin(time * drift * 2.9 + 1.7);
    const tone = hum > 0 ? Math.sin(2 * Math.PI * hum * time) * 0.008 : 0;
    const highAir = air() * level * 0.11;
    return [
      leftNoise() * level * motion + tone + highAir * 0.7,
      rightNoise() * level * motion + tone * 0.91 + highAir,
    ];
  };
};

const makeDomesticRoom = () => {
  const room = makeAtmosphere({ seed: 0x2201, low: 55, high: 980, level: 0.09, hum: 49.8, drift: 0.16 });
  const contactNoise = bandNoise(0x2204, 600, 6_400);
  const contacts = [8.2, 12.6, 30.4, 43.8];
  return (time) => {
    const base = room(time);
    let contact = 0;
    contacts.forEach((at, index) => {
      const age = time - at;
      if (age >= 0 && age < 0.12) {
        contact += (contactNoise() * 0.18 + Math.sin(2 * Math.PI * (230 + index * 37) * age) * 0.06)
          * Math.exp(-age * 36);
      }
    });
    return [base[0] + contact * 0.8, base[1] + contact];
  };
};

const makeHandleMetal = () => {
  const scrape = bandNoise(0x2301, 240, 5_800);
  const impactNoise = bandNoise(0x2302, 900, 9_000);
  return (time) => {
    const strain = pulse(time, 0.5, 5.35, 1.1, 0.25);
    const modulation = 0.58 + 0.42 * Math.sin(time * 2 * Math.PI * 7.1);
    let sample = scrape() * 0.25 * strain * modulation;
    const snapAge = time - 5;
    if (snapAge >= 0 && snapAge < 0.75) {
      const snapEnvelope = (1 - Math.exp(-snapAge * 700)) * Math.exp(-snapAge * 15);
      sample += impactNoise() * 0.42 * snapEnvelope;
      sample += Math.sin(2 * Math.PI * 176 * snapAge) * 0.18 * Math.exp(-snapAge * 7.5);
      sample += Math.sin(2 * Math.PI * 431 * snapAge) * 0.08 * Math.exp(-snapAge * 11);
    }
    const settle = pulse(time, 5.15, 8.8, 0.1, 1.5);
    sample += scrape() * 0.09 * settle;
    return panStereo(sample, 0.16);
  };
};

const makeMorningStreet = () => {
  const street = makeAtmosphere({ seed: 0x2401, low: 65, high: 1_850, level: 0.12, drift: 0.13 });
  const traffic = bandNoise(0x2404, 25, 310);
  const chirps = [7.4, 18.8, 34.2, 48.7, 58.4];
  return (time) => {
    const base = street(time);
    const trafficBed = traffic() * (0.055 + 0.02 * Math.sin(time * 0.11));
    let birdLeft = 0;
    let birdRight = 0;
    chirps.forEach((at, index) => {
      const age = time - at;
      if (age < 0 || age >= 0.42) return;
      const envelope = Math.sin(Math.PI * age / 0.42) ** 2;
      const frequency = 1_850 + index * 83 + age * 1_100;
      const chirp = Math.sin(2 * Math.PI * frequency * age) * envelope * 0.012;
      const stereo = panStereo(chirp, index % 2 ? 0.55 : -0.48);
      birdLeft += stereo[0];
      birdRight += stereo[1];
    });
    return [base[0] + trafficBed + birdLeft, base[1] + trafficBed * 0.88 + birdRight];
  };
};

const makeNightRain = () => {
  const rainLeft = bandNoise(0x2501, 1_300, 7_500);
  const rainRight = bandNoise(0x2502, 1_450, 7_200);
  const lowAir = bandNoise(0x2503, 55, 900);
  return (time) => {
    const swell = 0.66 + 0.18 * Math.sin(time * 0.54) + 0.08 * Math.sin(time * 1.31 + 0.6);
    const low = lowAir() * 0.075;
    return [rainLeft() * 0.075 * swell + low, rainRight() * 0.075 * swell + low * 0.86];
  };
};

const makeBathroomHum = () => {
  const room = makeAtmosphere({ seed: 0x2601, low: 70, high: 1_050, level: 0.08, hum: 59.7, drift: 0.1 });
  const pipeNoise = bandNoise(0x2604, 250, 3_500);
  return (time) => {
    const base = room(time);
    const electric = Math.sin(2 * Math.PI * 119.4 * time) * 0.005
      * (0.78 + 0.22 * Math.sin(time * 0.73));
    let pipe = 0;
    [6.8, 15.6].forEach((at) => {
      const age = time - at;
      if (age >= 0 && age < 0.45) {
        pipe += (pipeNoise() * 0.13 + Math.sin(2 * Math.PI * 164 * age) * 0.06) * Math.exp(-age * 11);
      }
    });
    return [base[0] + electric + pipe, base[1] + electric * 0.95 + pipe * 0.72];
  };
};

const makeContractNight = () => {
  const room = makeAtmosphere({ seed: 0x3301, low: 38, high: 820, level: 0.095, hum: 42.4, drift: 0.07 });
  const curtain = bandNoise(0x3304, 420, 4_800);
  return (time) => {
    const base = room(time);
    const curtainMove = (
      pulse(time, 14, 20, 2, 2)
      + pulse(time, 82, 90, 2.5, 2.5)
      + pulse(time, 144, 151, 2, 2.2)
    ) * curtain() * 0.045;
    return [base[0] + curtainMove * 0.7, base[1] + curtainMove];
  };
};

const makeShadowWhisper = () => {
  const breath = bandNoise(0x3401, 180, 3_800);
  const consonants = bandNoise(0x3402, 1_200, 7_500);
  const phrases = [[1, 6], [8.5, 14.5], [17, 23.5], [24.8, 27.8]];
  return (time) => {
    let envelope = 0;
    phrases.forEach(([start, end]) => {
      envelope += pulse(time, start, end, 0.8, 1.1);
    });
    const syllables = 0.58 + 0.23 * Math.sin(time * 2 * Math.PI * 3.3)
      + 0.12 * Math.sin(time * 2 * Math.PI * 6.7 + 0.4);
    const formant = Math.sin(2 * Math.PI * 168 * time) * 0.028
      + Math.sin(2 * Math.PI * 223 * time + 0.7) * 0.018;
    const sample = (breath() * 0.22 + consonants() * 0.055 + formant) * envelope * syllables;
    return panStereo(sample, 0.2 * Math.sin(time * 0.39) + 0.12);
  };
};

const makeOfferingAir = () => {
  const room = makeAtmosphere({ seed: 0x3501, low: 30, high: 680, level: 0.11, hum: 36.5, drift: 0.065 });
  const surface = bandNoise(0x3504, 300, 4_300);
  return (time) => {
    const base = room(time);
    const movements = [7, 21, 35, 56, 82, 105].reduce(
      (sum, at) => sum + pulse(time, at, at + 1.8, 0.45, 0.75),
      0,
    );
    const touch = surface() * 0.1 * movements;
    return [base[0] + touch * 0.82, base[1] + touch];
  };
};

const makeConsequenceRoom = () => {
  const room = makeAtmosphere({ seed: 0x4401, low: 40, high: 760, level: 0.085, hum: 44.8, drift: 0.05 });
  return (time) => {
    const base = room(time);
    const unease = smoothstep(62, 128, time);
    const pressure = Math.sin(2 * Math.PI * 31.4 * time) * 0.008 * unease;
    return [base[0] + pressure, base[1] + pressure * 0.96];
  };
};

const makeLossRumble = () => {
  const noise = bandNoise(0x4501, 18, 240);
  return (time) => {
    const rise = smoothstep(0, 15, time) * (1 - smoothstep(38, 48, time));
    const pulseRate = 0.74 + 0.12 * Math.sin(time * 0.47);
    const sample = (
      Math.sin(2 * Math.PI * 36.2 * time) * 0.038
      + Math.sin(2 * Math.PI * 47.8 * time + 0.5) * 0.022
      + noise() * 0.12
    ) * rise * pulseRate;
    return [sample, sample * 0.94];
  };
};

const makeFamilyShadow = () => {
  const room = makeAtmosphere({ seed: 0x4601, low: 36, high: 980, level: 0.1, hum: 41.3, drift: 0.055 });
  const highAir = bandNoise(0x4604, 1_100, 4_800);
  return (time) => {
    const base = room(time);
    const approach = smoothstep(0, 70, time);
    const shadow = highAir() * 0.025 * approach;
    return [base[0] + shadow, base[1] + shadow * 0.72];
  };
};

const makeShadowCommand = () => {
  const voiceAir = bandNoise(0x4701, 140, 4_500);
  const phrases = [[1, 7], [10, 17], [20, 27], [29, 35.5]];
  return (time) => {
    let envelope = 0;
    phrases.forEach(([start, end]) => {
      envelope += pulse(time, start, end, 0.7, 1.2);
    });
    const carrier = Math.sin(2 * Math.PI * 71 * time) * 0.035
      + Math.sin(2 * Math.PI * 142 * time + 0.3) * 0.018;
    const articulation = 0.62 + 0.23 * Math.sin(time * 2 * Math.PI * 2.6);
    const sample = (voiceAir() * 0.18 + carrier) * envelope * articulation;
    return panStereo(sample, -0.14 + 0.1 * Math.sin(time * 0.27));
  };
};

const makeVoidPressure = () => {
  const lowNoise = bandNoise(0x5501, 15, 310);
  const dust = bandNoise(0x5502, 620, 3_600);
  return (time) => {
    const breath = 0.72 + 0.12 * Math.sin(time * 0.19) + 0.07 * Math.sin(time * 0.51 + 0.8);
    const low = Math.sin(2 * Math.PI * 34.3 * time) * 0.034
      + Math.sin(2 * Math.PI * 45.7 * time + 0.2) * 0.021
      + lowNoise() * 0.11;
    const wide = dust() * 0.022 * (0.75 + 0.25 * Math.sin(time * 0.13));
    return [(low * breath) + wide, (low * breath * 0.95) - wide * 0.75];
  };
};

const makeFinalSpellSurge = () => {
  const energy = bandNoise(0x5601, 90, 5_800);
  const edge = bandNoise(0x5602, 1_500, 9_000);
  return (time) => {
    const rise = smoothstep(0, 9.2, time);
    const release = 1 - smoothstep(10.8, 14, time);
    const envelope = rise * release;
    const harmonic = Math.sin(2 * Math.PI * (74 + time * 2.4) * time) * 0.05;
    const sample = (energy() * 0.2 + edge() * 0.045 + harmonic) * envelope;
    return [sample * (0.92 + 0.08 * Math.sin(time * 0.9)), sample];
  };
};

const makeSerpentFloor = () => {
  const friction = bandNoise(0x5701, 170, 4_200);
  const body = bandNoise(0x5702, 28, 360);
  return (time) => {
    const envelope = pulse(time, 0.3, 33.8, 2.5, 2.4);
    const glide = 0.62 + 0.25 * Math.sin(time * 2 * Math.PI * 0.83)
      + 0.1 * Math.sin(time * 2 * Math.PI * 2.1 + 0.4);
    const sample = (friction() * 0.14 + body() * 0.18) * envelope * glide;
    const pan = -0.72 + smoothstep(1, 32, time) * 1.34 + 0.08 * Math.sin(time * 0.37);
    return panStereo(sample, pan);
  };
};

const makeDawnRoom = () => {
  const room = makeAtmosphere({ seed: 0x5801, low: 55, high: 1_150, level: 0.085, hum: 49.8, drift: 0.1 });
  const chirps = [8.4, 19.7, 35.2, 47.8];
  return (time) => {
    const base = room(time);
    let left = 0;
    let right = 0;
    chirps.forEach((at, index) => {
      const age = time - at;
      if (age < 0 || age > 0.36) return;
      const envelope = Math.sin(Math.PI * age / 0.36) ** 2;
      const chirp = Math.sin(2 * Math.PI * (1_700 + index * 110 + age * 900) * age) * envelope * 0.009;
      const stereo = panStereo(chirp, index % 2 ? 0.58 : -0.52);
      left += stereo[0];
      right += stereo[1];
    });
    return [base[0] + left, base[1] + right];
  };
};

const makeLetterSlide = () => {
  const paper = bandNoise(0x5901, 320, 6_800);
  const surface = bandNoise(0x5902, 80, 1_300);
  return (time) => {
    const first = pulse(time, 0.3, 5.8, 0.9, 1.2);
    const settle = pulse(time, 5.1, 9.8, 0.45, 1.5);
    const sample = (paper() * 0.26 + surface() * 0.15) * (first + settle * 0.42)
      * (0.78 + 0.2 * Math.sin(time * 18));
    return panStereo(sample, -0.5 + smoothstep(0.5, 9.4, time) * 0.82);
  };
};

encode("chapter-2", "domestic-room", 52, makeDomesticRoom());
encode("chapter-2", "handle-metal", 10, makeHandleMetal());
encode("chapter-2", "morning-street", 66, makeMorningStreet());
encode("chapter-2", "night-rain", 20, makeNightRain());
encode("chapter-2", "bathroom-hum", 24, makeBathroomHum());

encode("chapter-3", "contract-night", 168, makeContractNight());
encode("chapter-3", "shadow-whisper", 28, makeShadowWhisper());
encode("chapter-3", "offering-air", 120, makeOfferingAir());

encode("chapter-4", "consequence-room", 168, makeConsequenceRoom());
encode("chapter-4", "loss-rumble", 48, makeLossRumble());
encode("chapter-4", "family-shadow", 108, makeFamilyShadow());
encode("chapter-4", "shadow-command", 36, makeShadowCommand());

encode("chapter-5", "void-pressure", 114, makeVoidPressure());
encode("chapter-5", "final-spell-surge", 14, makeFinalSpellSurge());
encode("chapter-5", "serpent-floor", 34, makeSerpentFloor());
encode("chapter-5", "dawn-room", 54, makeDawnRoom());
encode("chapter-5", "letter-slide", 11, makeLetterSlide());
