"use client";

/* eslint-disable @next/next/no-img-element -- 공연용 로컬 에셋은 이미지 최적화 서버 없이 원본 경로를 그대로 사용합니다. */

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  PLAYER_CONFIG,
  PROP_ASSETS,
  PROLOGUE_PHOTO_ASSETS,
  SCENE_2_ASSETS,
  SCENE_2_TIMING,
  SCENE_3_ASSETS,
  SCENE_3_TIMING,
  LATER_STORY_TIMING,
  type TimelineSegment,
} from "../config/playerConfig";

type AtmosphereParticle = {
  x: number;
  y: number;
  speed: number;
  length: number;
  alpha: number;
  phase: number;
  layer: 0 | 1 | 2;
};

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const smooth = (start: number, end: number, value: number) => {
  const progress = clamp((value - start) / Math.max(0.0001, end - start));
  return progress * progress * (3 - 2 * progress);
};

const mix = (from: number, to: number, progress: number) =>
  from + (to - from) * progress;

const pulse = (center: number, radius: number, value: number) =>
  clamp(1 - Math.abs(value - center) / radius);

const cubic = (from: number, controlA: number, controlB: number, to: number, progress: number) => {
  const inverse = 1 - progress;
  return inverse ** 3 * from + 3 * inverse ** 2 * progress * controlA +
    3 * inverse * progress ** 2 * controlB + progress ** 3 * to;
};

const makeRandom = (seed: number) => {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let result = state;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
};

const mistHash = (x: number, y: number) => {
  let value = Math.imul(x, 374761393) + Math.imul(y, 668265263);
  value = Math.imul(value ^ (value >>> 13), 1274126177);
  return ((value ^ (value >>> 16)) >>> 0) / 4294967295;
};

const coherentNoise = (x: number, y: number) => {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fractionX = x - x0;
  const fractionY = y - y0;
  const easedX = fractionX * fractionX * (3 - 2 * fractionX);
  const easedY = fractionY * fractionY * (3 - 2 * fractionY);
  const top = mix(mistHash(x0, y0), mistHash(x0 + 1, y0), easedX);
  const bottom = mix(mistHash(x0, y0 + 1), mistHash(x0 + 1, y0 + 1), easedX);
  return mix(top, bottom, easedY);
};

const sceneProgress = (scene: TimelineSegment, timeSeconds: number) =>
  smooth(scene.startSeconds, scene.endSeconds, timeSeconds);

type LightingPreset = "legacy" | "bathroom" | "night" | "neutral" | "dusk" | "cosmic" | "dawn";

const getLightingPreset = (sceneId: string): LightingPreset => {
  if (sceneId.startsWith("mirror-")) return "bathroom";
  if (["sleeping-room", "shadow-approach", "shadow-first-voice"].includes(sceneId)) return "night";
  if (["school-confidence", "school-attached-shadow", "empty-road", "car-lift", "car-unease", "fear-pivot"].includes(sceneId)) return "neutral";
  if (["demand-build", "command-refusal", "attack-begins"].includes(sceneId)) return "dusk";
  if (["void-dissolve", "void-resistance", "mortal-edge"].includes(sceneId)) return "cosmic";
  if (["dream-wake", "dawn-relief", "letter-returns", "ambiguous-ending"].includes(sceneId)) return "dawn";
  return "legacy";
};

const cameraStyle = (
  scene: TimelineSegment,
  timeSeconds: number,
  extraBlur = 0,
): CSSProperties => {
  const progress = sceneProgress(scene, timeSeconds);
  const motion = scene.cameraMotion;
  const scale = mix(motion.scaleFrom, motion.scaleTo, progress);
  const x = mix(motion.xFrom, motion.xTo, progress);
  const y = mix(motion.yFrom, motion.yTo, progress);
  const blur = mix(motion.blurFrom, motion.blurTo, progress) + extraBlur;
  const grade = scene.sceneColorGrade;
  const daylight = scene.id === "time-passage"
    ? Math.pow(Math.sin(clamp((timeSeconds - 95) / 15) * Math.PI), 1.2)
    : 0;
  const timeBrightness = scene.id === "time-passage" ? 0.9 + daylight * 0.54 : 1;

  return {
    transform: `translate3d(${x}%, ${y}%, 0) scale(${scale})`,
    filter: `brightness(${grade.brightness * timeBrightness}) contrast(${grade.contrast}) saturate(${grade.saturation}) blur(${blur}px)`,
  };
};

function AtmosphereCanvas({
  timeSeconds,
  scene,
}: {
  timeSeconds: number;
  scene: TimelineSegment;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sizeRevision, setSizeRevision] = useState(0);
  const particles = useMemo(() => {
    const random = makeRandom(31102013);
    return Array.from({ length: 96 }, (_, index): AtmosphereParticle => {
      const layer = (index % 3) as 0 | 1 | 2;
      return {
        x: random(),
        y: random(),
        speed: (36 + layer * 42) * (0.72 + random() * 0.5),
        length: 5 + layer * 7 + random() * 6,
        alpha: 0.035 + layer * 0.025 + random() * 0.035,
        phase: random() * Math.PI * 2,
        layer,
      };
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(() => setSizeRevision((value) => value + 1));
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const bounds = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const pixelWidth = Math.max(1, Math.round(bounds.width * dpr));
    const pixelHeight = Math.max(1, Math.round(bounds.height * dpr));
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }

    const context = canvas.getContext("2d");
    if (!context) return;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, bounds.width, bounds.height);
    const width = bounds.width;
    const height = bounds.height;

    const rainy = ["house", "boy", "letter-flight", "letter-pickup", "after-reading", "time-passage"].includes(scene.id);
    if (rainy) {
      const timeLapseDrying = scene.id === "time-passage" ? 1 - smooth(95, 107, timeSeconds) : 1;
      const rainStrength = (scene.id === "letter-pickup" ? 0.25
        : scene.id === "house" ? 0.82
        : scene.id === "after-reading" ? 0.22
        : 0.5) * timeLapseDrying;
      particles.forEach((drop) => {
        if (["letter-pickup", "after-reading"].includes(scene.id) && drop.layer > 0) return;
        const travel = timeSeconds * drop.speed;
        const y = (drop.y * height + travel) % (height + 80) - 40;
        const x = (drop.x * width - travel * 0.09 + Math.sin(drop.phase + timeSeconds * 0.16) * 3 + width) % width;
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x - drop.length * 0.14, y + drop.length);
        context.lineWidth = 0.45 + drop.layer * 0.32;
        context.strokeStyle = `rgba(191, 204, 202, ${drop.alpha * rainStrength})`;
        context.stroke();
      });
    }

    const interior = [
      "envelope",
      "letter-text",
      "fade-out",
      "ritual-prep",
      "inside-triangle",
      "threshold-spell",
      "first-sign-morning",
      "first-sign-door-approach",
      "first-sign-handle",
      "first-sign-aftermath",
      "first-sign-anxious",
      "mirror-normal",
      "mirror-shadow",
      "mirror-overlap",
      "sleeping-room",
      "shadow-approach",
      "shadow-first-voice",
      "demand-build",
      "command-refusal",
      "attack-begins",
      "dream-wake",
      "dawn-relief",
      "letter-returns",
      "ambiguous-ending",
    ].includes(scene.id);
    if (interior) {
      particles.slice(0, 25).forEach((dust, index) => {
        const drift = timeSeconds * (2.2 + dust.layer) + dust.phase * 20;
        const x = (dust.x * width + Math.sin(drift * 0.06) * 24 + width) % width;
        const y = (dust.y * height - drift * 0.22 + height) % height;
        context.beginPath();
        context.arc(x, y, 0.35 + (index % 3) * 0.18, 0, Math.PI * 2);
        const coldDust = scene.id === "threshold-spell" || scene.id.startsWith("mirror-") ||
          ["sleeping-room", "shadow-approach", "shadow-first-voice", "demand-build", "command-refusal", "attack-begins"].includes(scene.id);
        context.fillStyle = coldDust
          ? `rgba(151, 172, 179, ${0.016 + dust.alpha * 0.085})`
          : `rgba(207, 190, 157, ${0.024 + dust.alpha * 0.14})`;
        context.fill();
      });
    }

    const fogStrength = scene.id === "house"
      ? 0.09
      : scene.id === "boy"
        ? 0.035
        : scene.id === "threshold-spell"
          ? 0.022
          : ["empty-road", "car-lift", "car-unease", "fear-pivot"].includes(scene.id)
            ? 0.024
            : ["school-confidence", "school-attached-shadow"].includes(scene.id)
              ? 0.012
              : ["void-dissolve", "void-resistance", "mortal-edge"].includes(scene.id)
                ? 0.004
                : 0.014;
    for (let index = 0; index < 3; index += 1) {
      const fogY = height * (0.5 + index * 0.14);
      const drift = Math.sin(timeSeconds * (0.035 + index * 0.008) + index) * width * 0.04;
      const fog = context.createLinearGradient(0, fogY, width, fogY + height * 0.17);
      fog.addColorStop(0, "rgba(118, 132, 133, 0)");
      fog.addColorStop(0.48, `rgba(118, 132, 133, ${fogStrength * (1 - index * 0.18)})`);
      fog.addColorStop(1, "rgba(10, 14, 15, 0)");
      context.fillStyle = fog;
      context.fillRect(-width * 0.08 + drift, fogY, width * 1.16, height * 0.17);
    }
  }, [particles, scene, sizeRevision, timeSeconds]);

  return <canvas ref={canvasRef} className="animatic-layer layer-atmosphere" />;
}

function LivingMistCanvas({ timeSeconds }: { timeSeconds: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageDataRef = useRef<ImageData | null>(null);
  const lastFrameRef = useRef(-1);
  const timing = SCENE_2_TIMING;
  const progress = clamp(
    (timeSeconds - timing.secondFogStart) /
    Math.max(0.001, timing.secondFogEnd - timing.secondFogStart),
  );
  const opacity = smooth(timing.secondFogStart, timing.secondFogStart + 0.62, timeSeconds) *
    (1 - smooth(timing.secondFogEnd - 0.72, timing.secondFogEnd, timeSeconds));
  const x = mix(-24, 42, progress);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    if (timeSeconds < timing.secondFogStart || timeSeconds > timing.secondFogEnd) {
      if (lastFrameRef.current !== -1) context.clearRect(0, 0, canvas.width, canvas.height);
      lastFrameRef.current = -1;
      return;
    }

    const frame = Math.floor(timeSeconds * 24);
    if (lastFrameRef.current === frame) return;
    lastFrameRef.current = frame;

    if (!imageDataRef.current ||
      imageDataRef.current.width !== canvas.width ||
      imageDataRef.current.height !== canvas.height) {
      imageDataRef.current = context.createImageData(canvas.width, canvas.height);
    }

    const imageData = imageDataRef.current;
    const pixels = imageData.data;
    const localTime = timeSeconds - timing.secondFogStart;
    const width = canvas.width;
    const height = canvas.height;

    for (let pixelY = 0; pixelY < height; pixelY += 1) {
      const normalizedY = pixelY / (height - 1);
      for (let pixelX = 0; pixelX < width; pixelX += 1) {
        const normalizedX = pixelX / (width - 1);
        const broadDensity = coherentNoise(
          normalizedX * 1.55 - localTime * 0.09 + 7.4,
          normalizedY * 1.7 + 12.8,
        );
        const secondaryDensity = coherentNoise(
          normalizedX * 2.8 - localTime * 0.12 + 19.3,
          normalizedY * 2.25 + 4.6,
        );
        const densityVariation = broadDensity * 0.72 + secondaryDensity * 0.28;
        const centerY = 0.57 +
          (broadDensity - 0.5) * 0.075 +
          Math.sin(normalizedX * Math.PI * 2 + localTime * 0.18) * 0.01;
        const thickness = 0.225 + (secondaryDensity - 0.5) * 0.04;
        const distanceFromCenter = Math.abs(normalizedY - centerY);
        const mainLayer = 1 - smooth(thickness * 0.2, thickness, distanceFromCenter);
        const lowerLayer = 1 - smooth(
          thickness * 0.45,
          thickness * 1.5,
          Math.abs(normalizedY - (centerY + 0.045)),
        );
        const horizontalFade = smooth(0, 0.14, normalizedX) *
          (1 - smooth(0.83, 1, normalizedX));
        const density = clamp(
          (mainLayer * 0.68 + lowerLayer * 0.2) *
          mix(0.86, 1, densityVariation) *
          horizontalFade,
        );
        const edgeHaze = smooth(0.04, 0.3, density) *
          (1 - smooth(0.42, 0.78, density));
        const tone = mix(90, 9, smooth(0.06, 0.82, density));
        const offset = (pixelY * width + pixelX) * 4;

        pixels[offset] = Math.round(tone);
        pixels[offset + 1] = Math.round(tone + 1);
        pixels[offset + 2] = Math.round(tone + 2);
        pixels[offset + 3] = Math.round(clamp(density * 0.7 + edgeHaze * 0.12) * 255);
      }
    }

    context.clearRect(0, 0, width, height);
    context.putImageData(imageData, 0, 0);
  }, [timeSeconds, timing.secondFogEnd, timing.secondFogStart]);

  return (
    <canvas
      ref={canvasRef}
      className="threshold-living-mist"
      width={320}
      height={112}
      style={{
        opacity: opacity * 0.92,
        transform: `translate3d(${x}%, 0, 0)`,
      }}
    />
  );
}

function getFlightState(timeSeconds: number) {
  if (timeSeconds < 26.4) {
    const arrive = smooth(24.1, 25, timeSeconds);
    const pushedBack = smooth(25, 26.4, timeSeconds);
    return {
      left: mix(mix(-9, 10, arrive), -7, pushedBack),
      top: mix(mix(31, 34, arrive), 29, pushedBack),
      width: mix(5.2, 6.2, arrive),
      rotation: mix(-4, 2.5, arrive) - pushedBack * 3,
      tilt: mix(8, 12, arrive),
      opacity: arrive * mix(1, 0.48, pushedBack),
      bend: Math.sin(timeSeconds * 2.5) * 0.8,
    };
  }

  if (timeSeconds < 31.6) {
    const progress = smooth(26.4, 31.6, timeSeconds);
    return {
      left: cubic(-7, 12, 39, 58, progress),
      top: cubic(31, 22, 55, 47, progress),
      width: mix(5.2, 10.8, progress),
      rotation: Math.sin(progress * Math.PI * 2.4) * 2.4 - 1,
      tilt: mix(11, 17, progress),
      opacity: smooth(26.4, 27.1, timeSeconds),
      bend: Math.sin(timeSeconds * 2.1) * 1.05,
    };
  }

  const settle = smooth(31.6, 34, timeSeconds);
  return {
    left: mix(58, 64, settle),
    top: mix(47, 62.5, settle) - Math.sin(settle * Math.PI) * 1.8,
    width: mix(10.8, 11.9, settle),
    rotation: mix(-1.2, 1.1, settle) + Math.sin(settle * Math.PI) * 0.7,
    tilt: mix(17, 52, settle),
    opacity: 1,
    bend: Math.sin(timeSeconds * 1.7) * (1 - settle) * 0.7,
  };
}

function getPaperFocusY(timeSeconds: number) {
  const cues = PLAYER_CONFIG.textCues.filter((cue) => cue.group === "letter");
  const first = cues[0];
  if (!first || timeSeconds <= first.startSeconds) return first?.paperYPercent ?? 23;

  for (let index = 0; index < cues.length; index += 1) {
    const cue = cues[index];
    const next = cues[index + 1];
    const currentY = cue.paperYPercent ?? 50;
    if (timeSeconds <= cue.endSeconds || !next) return currentY;
    if (timeSeconds < next.startSeconds) {
      return mix(
        currentY,
        next.paperYPercent ?? currentY,
        smooth(cue.endSeconds, next.startSeconds, timeSeconds),
      );
    }
  }

  return cues.at(-1)?.paperYPercent ?? 77;
}

function LetterReadingRig({ timeSeconds, fading = false }: { timeSeconds: number; fading?: boolean }) {
  const readingScale = 4;
  const focusY = getPaperFocusY(timeSeconds);
  const enter = smooth(51.2, 53, timeSeconds);
  const exit = fading ? 1 - smooth(74, 78.8, timeSeconds) : 1;
  const lastLine = smooth(68.6, 71.8, timeSeconds);
  const letterCues = PLAYER_CONFIG.textCues.filter((cue) => cue.group === "letter");

  return (
    <div
      className="letter-reading-rig"
      style={{
        opacity: enter * exit,
        transform: `translate(-50%, -${focusY * readingScale - 1.5}%) rotate(-2.2deg) scale(${readingScale})`,
      }}
    >
      <img className="letter-reading-paper" src={PROP_ASSETS.letterPaper} alt="" />
      <div className="letter-page-copy">
        {letterCues.map((cue) => (
          <p
            key={cue.id}
            className={cue.emphasis ? "is-last-line" : ""}
            style={{ top: `${cue.paperYPercent ?? 50}%` }}
          >
            {cue.text}
          </p>
        ))}
        <img
          className="letter-page-triangle"
          src="/images/props/triangle-ink.svg"
          alt=""
          style={{ opacity: 0.2 + lastLine * 0.12, filter: `blur(${lastLine * 0.55}px)` }}
        />
      </div>
      <div className="paper-edge-darkening" style={{ opacity: lastLine * 0.34 }} />
    </div>
  );
}

function RitualTriangle({ timeSeconds, standing }: { timeSeconds: number; standing: boolean }) {
  const cornerAnomaly = standing ? smooth(154.2, 158.3, timeSeconds) : 0;
  const footEntry = standing ? smooth(146.2, 153.5, timeSeconds) : 0;
  const singleStrip = standing
    ? 0
    : smooth(111.1, 112.8, timeSeconds) * (1 - smooth(119.2, 121.2, timeSeconds));
  const twoSides = standing
    ? 0
    : smooth(119.2, 121.2, timeSeconds) * (1 - smooth(132.1, 134.2, timeSeconds));
  const complete = standing ? 1 : smooth(132.1, 134.2, timeSeconds);
  const preparationPush = smooth(110, 145, timeSeconds);
  const imageTransform = `translate3d(${mix(-1.2, 0, preparationPush)}%, ${mix(1.4, 0, preparationPush)}%, 0) scale(${mix(1.1, 1.015, preparationPush)})`;

  return (
    <div className="ritual-triangle">
      <img
        className="ritual-film-frame"
        src={PROLOGUE_PHOTO_ASSETS.ritualClothSingle}
        alt=""
        style={{ opacity: singleStrip, transform: imageTransform }}
      />
      <img
        className="ritual-film-frame"
        src={PROLOGUE_PHOTO_ASSETS.ritualClothTwoSides}
        alt=""
        style={{ opacity: twoSides, transform: imageTransform }}
      />
      <img
        className="ritual-film-frame"
        src={PROLOGUE_PHOTO_ASSETS.ritualClothComplete}
        alt=""
        style={{
          opacity: complete,
          transform: `${imageTransform} translateY(${cornerAnomaly * -0.08}%)`,
          filter: `brightness(${1 - cornerAnomaly * 0.018})`,
        }}
      />

      {standing ? (
        <div className="feet-shadow" style={{ opacity: footEntry }}>
          <i className="foot-shadow is-left" />
          <i className="foot-shadow is-right" />
          <i className="body-shadow" />
        </div>
      ) : null}
    </div>
  );
}

function ThresholdSpellScene({ timeSeconds }: { timeSeconds: number }) {
  const timing = SCENE_2_TIMING;
  const enter = smooth(timing.start, timing.start + 2.6, timeSeconds);
  const tension = smooth(timing.tensionStart, timing.fistStart, timeSeconds);
  const clench = smooth(timing.fistStart, timing.fistEnd, timeSeconds);
  const inhale = smooth(timing.inhaleStart, timing.inhaleEnd, timeSeconds) *
    (1 - smooth(timing.inhaleEnd, timing.spellStart, timeSeconds));
  const speaking = smooth(timing.spellStart, timing.spellEnd, timeSeconds);
  const responseAttack = smooth(timing.responseStart, timing.responseStart + 0.48, timeSeconds);
  const responseRelease = 1 - smooth(timing.responseEnd, timing.responseEnd + 2.2, timeSeconds);
  const wind = responseAttack * responseRelease;
  const disappointment = smooth(timing.stillnessEnd, timing.asideEnd, timeSeconds);
  const turnAway = smooth(timing.exitStart, timing.exitStart + 1.72, timeSeconds);
  const walkTravel = smooth(timing.exitStart + 0.78, timing.exitEnd, timeSeconds);
  const walkElapsed = Math.max(0, timeSeconds - timing.exitStart - 0.78);
  const halfStepDuration = 0.92;
  const stepPosition = walkElapsed / halfStepDuration;
  const stepIndex = Math.floor(stepPosition);
  const stepPhase = stepPosition - stepIndex;
  const footfallBlend = smooth(0.82, 0.96, stepPhase);
  const stepBWeight = stepIndex % 2 === 0 ? footfallBlend : 1 - footfallBlend;
  const stepRise = Math.sin(stepPhase * Math.PI);
  const weightShift = Math.cos(stepPosition * Math.PI);
  const walkLift = stepRise * -0.19 * mix(1, 0.5, walkTravel);
  const walkSway = weightShift * mix(1, 0.46, walkTravel);
  const standingOpacity = enter *
    (1 - smooth(timing.exitStart + 0.34, timing.exitStart + 1.72, timeSeconds));
  const walkingOpacity = smooth(timing.exitStart + 0.62, timing.exitStart + 1.68, timeSeconds) *
    (1 - smooth(timing.exitEnd - 1.08, timing.exitEnd, timeSeconds));
  const firstMistTravel = smooth(timing.responseStart + 0.1, timing.responseEnd + 0.5, timeSeconds);
  const firstMist = smooth(timing.responseStart + 0.1, timing.responseStart + 0.55, timeSeconds) *
    (1 - smooth(timing.responseEnd - 0.25, timing.responseEnd + 0.5, timeSeconds));
  const hoodGlimpse = pulse(timing.responseStart + 1.05, 0.03, timeSeconds);
  const walkLeft = mix(50, 84.2, walkTravel);
  const walkBottom = mix(8.5, 28.7, walkTravel);
  const walkTopShift = walkLift + disappointment * 0.44;
  const walkTransform = `translate3d(-50%, ${walkTopShift}%, 0) rotate(${mix(0.3, -0.58, walkTravel) + walkSway * 0.2}deg) scale(${mix(1, 0.535, walkTravel)})`;
  const walkFilter = `brightness(${mix(0.56, 0.31, walkTravel)}) contrast(${mix(1.08, 1.16, walkTravel)}) saturate(${mix(0.56, 0.38, walkTravel)}) blur(${mix(0.08, 1.15, walkTravel)}px)`;

  return (
    <div className="threshold-stage" style={{ opacity: enter }}>
      <img
        className="threshold-room-draft"
        src={SCENE_2_ASSETS.backgroundDraft}
        alt=""
        style={{ opacity: wind * 0.78 }}
      />
      <div
        className="threshold-fog-pass is-first"
        style={{
          opacity: firstMist * 0.085,
          transform: `translate3d(${mix(14, 33, firstMistTravel)}%, ${Math.sin(timeSeconds * 0.8) * 0.5}%, 0) scale(${1 + firstMistTravel * 0.05})`,
        }}
      />
      <div
        className="threshold-hood-glimpse"
        style={{
          opacity: hoodGlimpse * 0.052,
          transform: `translate3d(${hoodGlimpse * -0.25}%, 0, 0) scale(${0.98 + hoodGlimpse * 0.02})`,
        }}
      />
      <LivingMistCanvas timeSeconds={timeSeconds} />

      <div
        className="threshold-boy-contact"
        style={{
          opacity: standingOpacity * 0.64,
          transform: `translate(-50%, -50%) scaleX(${1 + inhale * 0.03})`,
        }}
      />
      <img
        className="threshold-boy-standing"
        src={SCENE_2_ASSETS.boyStanding}
        alt=""
        style={{
          opacity: standingOpacity,
          transform: `translate3d(-50%, ${mix(0, 0.75, disappointment) - inhale * 0.24}%, 0) perspective(900px) rotateY(${turnAway * -16}deg) rotate(${speaking * 0.12 + turnAway * -0.8}deg) scaleX(${1 + clench * 0.004 - turnAway * 0.035}) scaleY(${1 + inhale * 0.004 - disappointment * 0.003})`,
          filter: `brightness(${0.64 + tension * 0.035}) contrast(1.08) saturate(0.62)`,
        }}
      />
      <img
        className="threshold-boy-walking is-step-a"
        src={SCENE_2_ASSETS.boyWalking}
        alt=""
        data-walk-pose="left-foot-forward"
        style={{
          left: `${walkLeft}%`,
          bottom: `${walkBottom}vh`,
          opacity: walkingOpacity * (1 - stepBWeight),
          transform: walkTransform,
          filter: walkFilter,
        }}
      />
      <img
        className="threshold-boy-walking is-step-b"
        src={SCENE_2_ASSETS.boyWalkingStepB}
        alt=""
        data-walk-pose="right-foot-forward"
        style={{
          left: `${walkLeft}%`,
          bottom: `${walkBottom}vh`,
          opacity: walkingOpacity * stepBWeight,
          transform: walkTransform,
          filter: walkFilter,
        }}
      />
      <div
        className="threshold-walk-contact"
        style={{
          left: `${walkLeft}%`,
          bottom: `${walkBottom + 0.9}vh`,
          opacity: walkingOpacity * mix(0.46, 0.26, walkTravel),
          transform: `translate(-50%, -50%) scale(${mix(1, 0.42, walkTravel)}, ${mix(0.88, 0.48, walkTravel)})`,
        }}
      />
      <div className="threshold-door-occlusion" style={{ opacity: smooth(timing.exitEnd - 1.7, timing.exitEnd, timeSeconds) }} />
      <div className="threshold-hand-tension is-left" style={{ opacity: clench * standingOpacity * 0.16 }} />
      <div className="threshold-hand-tension is-right" style={{ opacity: clench * standingOpacity * 0.16 }} />
    </div>
  );
}

function FirstSignScene({ timeSeconds, scene }: { timeSeconds: number; scene: TimelineSegment }) {
  const timing = SCENE_3_TIMING;
  const sceneId = scene.id;

  if (sceneId === "first-sign-handle") {
    const frameOpacity = (fadeInStart: number, fadeInEnd: number, fadeOutStart: number, fadeOutEnd: number) =>
      smooth(fadeInStart, fadeInEnd, timeSeconds) * (1 - smooth(fadeOutStart, fadeOutEnd, timeSeconds));
    const approach = frameOpacity(223.92, 224.2, 224.92, 225.22);
    const contact = frameOpacity(224.92, 225.22, 225.88, 226.2);
    const grip = frameOpacity(225.88, 226.2, 227.12, 227.45);
    const press = frameOpacity(227.12, 227.45, timing.handleBreak - 0.08, timing.handleBreak + 0.16);
    const recoil = frameOpacity(timing.handleBreak - 0.08, timing.handleBreak + 0.16, 230.58, 231.12);
    const brokenReveal = smooth(230.58, 231.12, timeSeconds);
    const fractureFocus = smooth(timing.handleBreak, timing.handleBreak + 0.16, timeSeconds) *
      (1 - smooth(timing.handleBreak + 0.18, timing.handleBreak + 0.72, timeSeconds));
    const frames = [
      { source: SCENE_3_ASSETS.doorHandleApproach, opacity: approach },
      { source: SCENE_3_ASSETS.doorHandleContact, opacity: contact },
      { source: SCENE_3_ASSETS.doorHandleGrip, opacity: grip },
      { source: SCENE_3_ASSETS.doorHandlePress, opacity: press },
      { source: SCENE_3_ASSETS.doorHandleRecoil, opacity: recoil },
    ];

    return (
      <div className="first-sign-handle-stage">
        {frames.map((frame) => (
          <img
            key={frame.source}
            className="first-sign-handle-frame"
            src={frame.source}
            alt=""
            style={{
              ...cameraStyle(scene, timeSeconds, fractureFocus * 0.3),
              opacity: frame.opacity,
            }}
          />
        ))}
        <img
          className="first-sign-handle-broken"
          src={SCENE_3_ASSETS.doorHandleBroken}
          alt=""
          style={{
            ...cameraStyle(scene, timeSeconds, fractureFocus * 0.9),
            opacity: brokenReveal,
          }}
        />
      </div>
    );
  }

  if (sceneId === "first-sign-aftermath") {
    const approach = smooth(timing.handleEnd + 1.2, timing.handleEnd + 6.5, timeSeconds);
    const withdraw = smooth(timing.handleEnd + 10.2, timing.aftermathEnd - 1.2, timeSeconds);
    return (
      <div
        className="first-sign-aftermath-shadow"
        style={{
          opacity: approach * (1 - withdraw) * 0.45,
          transform: `translate3d(${mix(-13, 0, approach) - withdraw * 4}%, ${mix(2, 0, approach)}%, 0)`,
        }}
      />
    );
  }

  if (sceneId === "first-sign-stone") {
    const roll = smooth(timing.stoneMoveStart, timing.stoneLiftStart, timeSeconds);
    const lift = smooth(timing.stoneLiftStart, timing.stoneLiftStart + 1.6, timeSeconds);
    const fall = smooth(timing.stoneHoverEnd, timing.stoneDrop, timeSeconds);
    const height = lift * (1 - fall);
    const settle = smooth(timing.stoneDrop, timing.stoneDrop + 0.7, timeSeconds);
    const observer = smooth(timing.stoneStart + 1.6, timing.stoneStart + 5.5, timeSeconds);

    return (
      <div className="first-sign-garden-props">
        <div
          className="first-sign-observer-shadow"
          style={{ opacity: observer * 0.34 }}
        />
        <div
          className="first-sign-stone-shadow"
          style={{
            opacity: mix(0.62, 0.24, height),
            transform: `translate(-50%, -50%) translateX(${roll * 0.9}vw) scale(${mix(1, 0.67, height)}, ${mix(1, 0.72, height)})`,
            filter: `blur(${mix(7, 13, height)}px)`,
          }}
        />
        <img
          className="first-sign-stone"
          src={SCENE_3_ASSETS.smallStone}
          alt=""
          style={{
            transform: `translate(-50%, -50%) translate3d(${roll * 0.75}vw, ${height * -1.25 + (1 - settle) * fall * 0.03}vh, 0) rotate(${roll * 4.8 + height * 0.7}deg)`,
          }}
        />
      </div>
    );
  }

  if (sceneId === "first-sign-flower") {
    const bend = smooth(timing.flowerBendStart, timing.flowerHoldStart, timeSeconds);
    const release = smooth(timing.flowerRelease, timing.flowerEnd - 0.35, timeSeconds);
    const heldBend = bend * (1 - release);
    const observer = smooth(timing.flowerStart + 0.8, timing.flowerStart + 4, timeSeconds);

    return (
      <div className="first-sign-garden-props">
        <div
          className="first-sign-observer-shadow"
          style={{ opacity: observer * 0.31 }}
        />
        <div
          className="first-sign-flower-shadow"
          style={{
            opacity: 0.34,
            transform: `translate(-50%, -50%) rotate(${mix(-7, -10, heldBend)}deg) scaleX(${mix(1, 1.08, heldBend)})`,
          }}
        />
        <img
          className="first-sign-flower"
          src={SCENE_3_ASSETS.wildflower}
          alt=""
          style={{
            transform: `translate(-50%, 0) rotate(${heldBend * -5.4}deg) translateX(${heldBend * -0.22}vw)`,
          }}
        />
      </div>
    );
  }

  return null;
}

/**
 * 후반부의 추가 처리는 인물 동작을 만들지 않고, 이미 촬영된 듯한 플레이트 위에
 * 빛·그림자·초점만 아주 얕게 더합니다. 모든 값은 절대 시간으로 계산되어 탐색 후에도
 * 같은 프레임이 재현됩니다.
 */
function LaterStoryTreatment({ timeSeconds, sceneId }: { timeSeconds: number; sceneId: string }) {
  const timing = LATER_STORY_TIMING;

  if (sceneId === "mirror-shadow" || sceneId === "mirror-overlap") {
    const reveal = smooth(timing.mirrorNormalEnd, timing.mirrorShadowEnd - 2, timeSeconds);
    const overlap = smooth(timing.mirrorShadowEnd, timing.mirrorOverlapEnd - 2.5, timeSeconds);
    return (
      <>
        <div
          className="story-mirror-breath"
          style={{
            opacity: reveal * 0.24,
            transform: `translate3d(${mix(-1.4, 0.5, reveal)}%, ${Math.sin(timeSeconds * 0.23) * 0.18}%, 0) scale(${1 + overlap * 0.035})`,
          }}
        />
        <div className="story-mirror-edge" style={{ opacity: mix(0.08, 0.27, overlap) }} />
      </>
    );
  }

  if (["sleeping-room", "shadow-approach", "shadow-first-voice"].includes(sceneId)) {
    const approach = smooth(timing.sleepingEnd - 2, timing.firstVoiceEnd - 5, timeSeconds);
    const voicePulse = sceneId === "shadow-first-voice"
      ? 0.5 + Math.sin((timeSeconds - timing.shadowApproachEnd) * 0.32) * 0.08
      : 0;
    return (
      <>
        <div
          className="story-bedside-darkness"
          style={{
            opacity: approach * (0.2 + voicePulse * 0.1),
            transform: `translate3d(${mix(-4.5, 1.2, approach)}%, ${Math.sin(timeSeconds * 0.17) * 0.2}%, 0) scale(${mix(0.98, 1.045, approach)})`,
          }}
        />
        <div className="story-night-falloff" style={{ opacity: 0.14 + approach * 0.16 }} />
      </>
    );
  }

  if (sceneId === "school-attached-shadow") {
    const lag = smooth(timing.schoolConfidenceEnd, timing.schoolShadowEnd - 2, timeSeconds);
    return (
      <div
        className="story-impossible-shadow"
        style={{
          opacity: lag * 0.16,
          transform: `translate3d(${mix(-1.2, 0.8, lag)}%, ${Math.sin(timeSeconds * 0.28) * 0.12}%, 0) rotate(${mix(-1.4, 0.6, lag)}deg)`,
        }}
      />
    );
  }

  if (["demand-build", "command-refusal", "attack-begins"].includes(sceneId)) {
    const pressure = smooth(timing.fearPivotEnd, timing.attackStartEnd, timeSeconds);
    return (
      <>
        <div className="story-command-shadow" style={{ opacity: 0.12 + pressure * 0.22 }} />
        <div
          className="story-depth-collapse"
          style={{
            opacity: sceneId === "attack-begins" ? smooth(timing.refusalEnd, timing.attackStartEnd, timeSeconds) * 0.36 : 0,
          }}
        />
      </>
    );
  }

  if (["void-dissolve", "void-resistance", "mortal-edge"].includes(sceneId)) {
    const local = clamp((timeSeconds - timing.attackStartEnd) / (timing.mortalEdgeEnd - timing.attackStartEnd));
    return (
      <>
        <div
          className="story-void-breath"
          style={{
            opacity: mix(0.06, 0.16, local),
            transform: `scale(${1 + Math.sin(timeSeconds * 0.16) * 0.018})`,
          }}
        />
        <div className="story-void-falloff" style={{ opacity: mix(0.06, 0.2, local) }} />
      </>
    );
  }

  if (["dream-wake", "dawn-relief", "letter-returns", "ambiguous-ending"].includes(sceneId)) {
    const settle = smooth(timing.mortalEdgeEnd, timing.reliefEnd, timeSeconds);
    return (
      <div
        className="story-dawn-window"
        style={{
          opacity: mix(0.2, 0.09, settle),
          transform: `translate3d(${Math.sin(timeSeconds * 0.08) * 0.16}%, 0, 0)`,
        }}
      />
    );
  }

  return null;
}

function SceneProps({ timeSeconds, scene }: { timeSeconds: number; scene: TimelineSegment }) {
  if (scene.id === "letter-flight") {
    const flight = getFlightState(timeSeconds);
    return (
      <img
        className="flying-letter"
        src={PROP_ASSETS.envelopeBack}
        alt=""
        style={{
          left: `${flight.left}%`,
          top: `${flight.top}%`,
          width: `${flight.width}vw`,
          opacity: flight.opacity,
          filter: `blur(${mix(1.25, 0.16, smooth(26.4, 33.5, timeSeconds))}px) brightness(0.62) saturate(0.54) contrast(0.96) drop-shadow(0 10px 13px rgb(0 0 0 / 0.62))`,
          transform: `translate(-50%, -50%) perspective(900px) rotateX(${flight.tilt + flight.bend}deg) rotateY(${flight.bend * 1.5}deg) rotateZ(${flight.rotation}deg) skewY(${flight.bend * 0.12}deg)`,
        }}
      />
    );
  }

  if (scene.id === "letter-pickup") {
    const approach = smooth(34.25, 35.1, timeSeconds) *
      (1 - smooth(38.55, 39.25, timeSeconds));
    const lift = smooth(38.55, 39.25, timeSeconds);
    const push = smooth(34, 45, timeSeconds);
    return (
      <div className="pickup-sequence">
        <img
          className="physical-shot-frame"
          src={PROLOGUE_PHOTO_ASSETS.deskEnvelopeApproach}
          alt=""
          style={{
            opacity: approach,
            transform: `scale(${mix(1.04, 1.075, push)}) translate3d(${mix(0.4, -0.35, push)}%, ${mix(0.3, -0.2, push)}%, 0)`,
          }}
        />
        <img
          className="physical-shot-frame"
          src={PROLOGUE_PHOTO_ASSETS.deskEnvelopeLift}
          alt=""
          style={{
            opacity: lift,
            transform: `scale(${mix(1.045, 1.085, push)}) translate3d(${mix(0.2, -0.4, push)}%, ${mix(0.2, -0.25, push)}%, 0)`,
          }}
        />
      </div>
    );
  }

  if (scene.id === "envelope") {
    const previousBeat = smooth(45, 45.35, timeSeconds) *
      (1 - smooth(46.4, 47.15, timeSeconds));
    const opening = smooth(46.4, 47.15, timeSeconds);
    const push = smooth(45, 52, timeSeconds);
    return (
      <div className="envelope-opening-sequence">
        <img
          className="physical-shot-frame"
          src={PROLOGUE_PHOTO_ASSETS.deskEnvelopeLift}
          alt=""
          style={{
            opacity: previousBeat,
            transform: `scale(${mix(1.08, 1.095, push)}) translate3d(-0.35%, -0.25%, 0)`,
          }}
        />
        <img
          className="physical-shot-frame"
          src={PROLOGUE_PHOTO_ASSETS.deskEnvelopeOpen}
          alt=""
          style={{
            opacity: opening,
            transform: `scale(${mix(1.035, 1.085, push)}) translate3d(${mix(0.25, -0.35, push)}%, ${mix(0.2, -0.3, push)}%, 0)`,
          }}
        />
      </div>
    );
  }

  if (scene.id === "letter-text") return <LetterReadingRig timeSeconds={timeSeconds} />;
  if (scene.id === "fade-out") return <LetterReadingRig timeSeconds={timeSeconds} fading />;

  if (scene.id === "after-reading") {
    const lower = smooth(87.2, 89.8, timeSeconds);
    return (
      <div className="after-reading-props">
        <img
          className="physical-shot-frame"
          src={PROLOGUE_PHOTO_ASSETS.rainWindowBoySeated}
          alt=""
          style={{
            opacity: lower,
            transform: `scale(${mix(1.045, 1.075, smooth(80, 95, timeSeconds))}) translate3d(-0.2%, -0.25%, 0)`,
          }}
        />
      </div>
    );
  }

  if (scene.id === "letter-returns") {
    const reveal = smooth(LATER_STORY_TIMING.reliefEnd, LATER_STORY_TIMING.reliefEnd + 2.8, timeSeconds);
    const focus = smooth(LATER_STORY_TIMING.reliefEnd + 1.2, LATER_STORY_TIMING.letterRevealEnd, timeSeconds);
    return (
      <div className="story-returned-letter">
        <div
          className="story-returned-letter-shadow"
          style={{
            opacity: reveal * mix(0.38, 0.5, focus),
            transform: `translate(-50%, -50%) translate3d(${focus * 2.9}vw, ${focus * -2.6}vh, 0) rotate(-7deg)`,
          }}
        />
        <img
          className="story-returned-envelope"
          src={PROP_ASSETS.envelopeFront}
          alt=""
          style={{
            opacity: reveal,
            transform: `translate(-50%, -50%) translate3d(${focus * 2.9}vw, ${focus * -2.6}vh, 0) perspective(950px) rotateX(57deg) rotateZ(-7deg) scale(${mix(0.97, 1.045, focus)})`,
          }}
        />
      </div>
    );
  }

  if (scene.id === "ritual-prep") return <RitualTriangle timeSeconds={timeSeconds} standing={false} />;
  if (scene.id === "inside-triangle") return <RitualTriangle timeSeconds={timeSeconds} standing />;
  if (scene.id === "threshold-spell") return <ThresholdSpellScene timeSeconds={timeSeconds} />;
  if (scene.id.startsWith("first-sign-")) {
    return <FirstSignScene timeSeconds={timeSeconds} scene={scene} />;
  }

  return null;
}

export function CinematicCanvas({ timeSeconds }: { timeSeconds: number }) {
  const matchedIndex = PLAYER_CONFIG.timeline.findIndex(
    (segment) => timeSeconds >= segment.startSeconds && timeSeconds < segment.endSeconds,
  );
  const sceneIndex = matchedIndex === -1 ? PLAYER_CONFIG.timeline.length - 1 : matchedIndex;
  const scene = PLAYER_CONFIG.timeline[sceneIndex];
  const previousScene = sceneIndex > 0 ? PLAYER_CONFIG.timeline[sceneIndex - 1] : null;
  const lightingPreset = getLightingPreset(scene.id);
  const transition = scene.id === "first-sign-aftermath"
    ? 1
    : sceneIndex === 0
      ? smooth(0.15, scene.transitionDuration, timeSeconds)
      : smooth(scene.startSeconds, scene.startSeconds + scene.transitionDuration, timeSeconds);
  const rackBlur = scene.transitionType === "rack-focus" ? (1 - transition) * 4.5 : 0;
  const previousOpacity = previousScene && transition < 1 ? 1 - transition : 0;
  const currentOpacity = scene.id === "fade-out" ? 1 : transition;
  const focusShift = scene.id === "boy" ? smooth(13.2, 19.5, timeSeconds) : 1;
  const foregroundBlur = scene.id === "boy" ? mix(0.15, 2.8, focusShift) : 0.4;
  const timeLapseProgress = scene.id === "time-passage" ? smooth(95, 110, timeSeconds) : 0;
  const foregroundOpacity = scene.id === "time-passage" ? mix(0.24, 0, timeLapseProgress) : 0.26;
  const breathe = Math.sin(timeSeconds * 1.08) * 0.45;
  const afterTilt = scene.id === "after-reading" ? smooth(82.5, 87.5, timeSeconds) * 1.25 : 0;
  const headDip = scene.id === "boy" ? smooth(19, 22.6, timeSeconds) * 1.1 : afterTilt;
  const handEntry = smooth(35.2, 39.2, timeSeconds);
  const handExit = 1 - smooth(39.4, 41.1, timeSeconds);
  const handTurn = smooth(38.2, 39.6, timeSeconds);
  const readingFade = scene.id === "fade-out" ? smooth(72, 79.6, timeSeconds) : 0;
  const afterReadingFade = scene.id === "after-reading" ? smooth(92.3, 95, timeSeconds) : 0;
  const timePassageBlack = scene.id === "time-passage" ? 1 - smooth(95, 98, timeSeconds) : 0;
  const scene3MorningBlack = scene.id === "first-sign-morning"
    ? 1 - smooth(SCENE_3_TIMING.start, SCENE_3_TIMING.start + 3.1, timeSeconds)
    : 0;
  const transitionBlack = scene.transitionType === "fade-black" && scene.id !== "fade-out"
    ? Math.sin(transition * Math.PI) * 0.82
    : 0;
  const blackout = Math.max(
    readingFade,
    afterReadingFade,
    timePassageBlack,
    scene3MorningBlack,
    transitionBlack,
  );
  const daylight = scene.id === "time-passage" ? Math.sin(timeLapseProgress * Math.PI) : 0;
  const grade = scene.sceneColorGrade;
  const thresholdScene = scene.id === "threshold-spell";
  const thresholdPush = thresholdScene
    ? smooth(SCENE_2_TIMING.start, SCENE_2_TIMING.exitStart, timeSeconds)
    : 0;
  const thresholdReaction = thresholdScene
    ? smooth(SCENE_2_TIMING.responseStart, SCENE_2_TIMING.responseStart + 0.35, timeSeconds) *
      (1 - smooth(SCENE_2_TIMING.responseEnd, SCENE_2_TIMING.responseEnd + 1.1, timeSeconds))
    : 0;
  const thresholdCameraX = thresholdScene
    ? Math.sin((timeSeconds - SCENE_2_TIMING.start) * 0.57) * 0.12 +
      Math.sin(timeSeconds * 8.1) * thresholdReaction * 0.26
    : 0;
  const thresholdCameraY = thresholdScene
    ? Math.cos((timeSeconds - SCENE_2_TIMING.start) * 0.43) * 0.09 +
      Math.sin(timeSeconds * 6.7) * thresholdReaction * 0.21
    : 0;
  const handleScene = scene.id === "first-sign-handle";
  const handleSnap = handleScene
    ? smooth(SCENE_3_TIMING.handleBreak, SCENE_3_TIMING.handleBreak + 0.08, timeSeconds) *
      (1 - smooth(SCENE_3_TIMING.handleBreak + 0.12, SCENE_3_TIMING.handleBreak + 0.46, timeSeconds))
    : 0;
  const stageTransform = thresholdScene
    ? `translate3d(${thresholdCameraX}px, ${thresholdCameraY}px, 0) scale(${1 + thresholdPush * 0.038})`
    : handleScene
      ? `translate3d(${handleSnap * -0.55}px, ${handleSnap * 0.36}px, 0) scale(${1 + handleSnap * 0.0008})`
      : undefined;

  return (
    <div
      className={`cinematic-animatic scene-${scene.id} lighting-${lightingPreset}`}
      style={stageTransform ? { transform: stageTransform } : undefined}
      aria-hidden="true"
    >
      <div className="animatic-layer layer-background">
        {previousScene && previousOpacity > 0 ? (
          <img
            src={previousScene.backgroundImage}
            alt=""
            style={{
              ...cameraStyle(previousScene, timeSeconds, transition * 2.2),
              opacity: previousOpacity,
            }}
          />
        ) : null}
        <img
          src={scene.backgroundImage}
          alt=""
          style={{
            ...cameraStyle(scene, timeSeconds, rackBlur),
            opacity: currentOpacity,
          }}
        />
      </div>

      <div className="animatic-layer layer-midground">
        <div
          className="road-reflection"
          style={{
            opacity: scene.id === "house" ? 0.42 : 0,
            transform: `skewX(-8deg) scaleX(${0.92 + Math.sin(timeSeconds * 0.82) * 0.045}) translateY(${Math.sin(timeSeconds * 0.46) * 1.2}px)`,
          }}
        />
        <div
          className="room-shadow"
          style={{
            opacity: lightingPreset === "neutral"
              ? 0
              : lightingPreset === "cosmic"
                ? 0.08
                : lightingPreset === "bathroom"
                  ? 0.12
                  : lightingPreset === "night" || lightingPreset === "dusk"
                    ? 0.2
                    : ["boy", "letter-flight", "after-reading"].includes(scene.id)
                      ? 0.18
                      : scene.id.startsWith("first-sign-")
                        ? 0.12
                        : 0.18,
          }}
        />
        <div
          className="curtain-shadow"
          style={{
            opacity: ["boy", "letter-flight", "after-reading", "time-passage"].includes(scene.id) ? 0.6 : 0,
            transform: `translate3d(${Math.sin(timeSeconds * (scene.id === "time-passage" ? 0.3 : 0.11)) * (scene.id === "time-passage" ? 1.35 : 0.7)}%, 0, 0)`,
          }}
        />
        <LaterStoryTreatment timeSeconds={timeSeconds} sceneId={scene.id} />
      </div>

      {scene.characterImage && !thresholdScene ? (
        <div className={`animatic-layer layer-character character-${scene.id}`}>
          <img
            src={scene.characterImage}
            alt=""
            className={scene.characterImage.includes("boy-") ? "boy-silhouette" : "hand-silhouette"}
            style={scene.characterImage.includes("boy-")
              ? {
                  opacity: transition * (scene.id === "letter-flight" ? 0.62 : 0.94),
                  transform: `translate3d(-50%, ${breathe + headDip}%, 0) rotate(${headDip * 0.42}deg)`,
                  filter: scene.id === "after-reading"
                    ? "blur(0.7px) drop-shadow(-2px 0 1px rgb(143 134 115 / 0.14))"
                    : `blur(${mix(2.2, 0.2, focusShift)}px)`,
                }
              : {
                  opacity: handEntry * handExit * 0.78,
                  transform: `translate3d(${mix(-14, -2, handEntry)}%, ${mix(47, -2, handEntry)}%, 0) rotate(${mix(-5, 1.5 + handTurn * 2, handEntry)}deg)`,
                }}
          />
        </div>
      ) : null}

      <div className="animatic-layer layer-props">
        <SceneProps timeSeconds={timeSeconds} scene={scene} />
      </div>

      {scene.foregroundImage ? (
        <div className="animatic-layer layer-foreground">
          <img
            src={scene.foregroundImage}
            alt=""
            className={scene.foregroundImage.includes("branches") ? "foreground-branches" : "foreground-rain"}
            style={{
              opacity: foregroundOpacity,
              filter: `blur(${scene.id === "house" ? 3.8 : foregroundBlur}px)`,
              transform: scene.id === "house"
                ? `translate3d(${Math.sin(timeSeconds * 0.08) * 0.45}%, 0, 0) scale(1.045)`
                : `translate3d(0, ${Math.sin(timeSeconds * 0.09) * 0.22}%, 0) scale(1.015)`,
            }}
          />
        </div>
      ) : null}

      <AtmosphereCanvas timeSeconds={timeSeconds} scene={scene} />

      <div className="animatic-layer layer-light-shadow">
        <div className="scene-temperature" style={{ background: grade.temperature }} />
        <div className="scene-shadow" style={{ background: grade.shadow }} />
        <div className="lamp-falloff" />
        <div
          className="time-lapse-color"
          style={{
            opacity: scene.id === "time-passage" ? 0.2 + daylight * 0.24 : 0,
            background: timeLapseProgress < 0.5
              ? `rgba(${mix(52, 143, daylight)}, ${mix(66, 151, daylight)}, ${mix(79, 145, daylight)}, 0.72)`
              : `rgba(${mix(143, 30, 1 - daylight)}, ${mix(151, 46, 1 - daylight)}, ${mix(145, 64, 1 - daylight)}, 0.7)`,
          }}
        />
      </div>

      <div className="animatic-layer scene-blackout" style={{ opacity: blackout }} />
    </div>
  );
}
