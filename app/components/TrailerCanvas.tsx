"use client";

/* eslint-disable @next/next/no-img-element -- local performance plates must remain directly seekable and replaceable */

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { TRAILER_SHOTS, type TrailerShot } from "../config/trailerConfig";

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const smooth = (value: number) => {
  const safe = clamp(value);
  return safe * safe * (3 - 2 * safe);
};

const shotStyle = (shot: TrailerShot, timeSeconds: number): CSSProperties => {
  const progress = smooth((timeSeconds - shot.startSeconds) / (shot.endSeconds - shot.startSeconds));
  const scale = shot.scaleFrom + (shot.scaleTo - shot.scaleFrom) * progress;
  const x = (shot.xFrom ?? 0) + ((shot.xTo ?? 0) - (shot.xFrom ?? 0)) * progress;
  const y = (shot.yFrom ?? 0) + ((shot.yTo ?? 0) - (shot.yFrom ?? 0)) * progress;
  const collapse = shot.effect === "collapse"
    ? smooth((timeSeconds - shot.startSeconds) / (shot.endSeconds - shot.startSeconds))
    : 0;
  const hover = shot.effect === "levitate" ? Math.sin(timeSeconds * 1.45) * 0.18 : 0;

  return {
    transform: `translate3d(${x}%, ${y + hover + collapse * 8.5}%, 0) rotate(${collapse * 1.6}deg) scale(${scale})`,
    filter: `brightness(${shot.brightness ?? 0.8}) saturate(${shot.saturation ?? 0.65}) blur(${collapse * 4.8}px)`,
  };
};

function SignalField({ timeSeconds }: { timeSeconds: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(() => setRevision((value) => value + 1));
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const bounds = canvas.getBoundingClientRect();
    const dpr = Math.min(1.5, window.devicePixelRatio || 1);
    canvas.width = Math.max(1, Math.round(bounds.width * dpr));
    canvas.height = Math.max(1, Math.round(bounds.height * dpr));
    const context = canvas.getContext("2d");
    if (!context) return;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, bounds.width, bounds.height);

    const intro = timeSeconds < 8 ? 1 - smooth(timeSeconds / 8) * 0.35 : 0;
    const chapterThree = timeSeconds >= 155 && timeSeconds < 163
      ? Math.sin(((timeSeconds - 155) / 8) * Math.PI)
      : 0;
    const blackout = timeSeconds >= 273 ? smooth((timeSeconds - 273) / 10) : 0;
    const signal = Math.max(intro, chapterThree, blackout * 0.92);
    const subtle = 0.045 + signal * 0.22;
    const centreX = bounds.width * (0.5 + Math.sin(timeSeconds * 0.08) * 0.018);
    const centreY = bounds.height * (0.49 + Math.cos(timeSeconds * 0.07) * 0.012);
    const radius = Math.min(bounds.width, bounds.height) * (0.22 + signal * 0.11);

    context.save();
    context.globalCompositeOperation = "screen";
    for (let ring = 0; ring < 7; ring += 1) {
      const phase = timeSeconds * (0.08 + ring * 0.007) + ring * 0.41;
      const ringRadius = radius * (0.48 + ring * 0.105 + Math.sin(phase) * 0.014);
      context.beginPath();
      for (let point = 0; point <= 3; point += 1) {
        const angle = -Math.PI / 2 + point / 3 * Math.PI * 2 + Math.sin(phase + point) * 0.018;
        const x = centreX + Math.cos(angle) * ringRadius;
        const y = centreY + Math.sin(angle) * ringRadius;
        if (point === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.strokeStyle = `rgba(158, 184, 166, ${subtle * (1 - ring * 0.085)})`;
      context.lineWidth = ring === 0 ? 1.05 : 0.55;
      context.stroke();
    }

    const columns = 28;
    const rows = 15;
    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const wave = Math.sin(column * 1.71 + row * 2.13 + timeSeconds * 0.9);
        if (wave < 0.67) continue;
        const x = (column + 0.5) / columns * bounds.width;
        const y = (row + 0.5) / rows * bounds.height;
        context.fillStyle = `rgba(166, 190, 175, ${subtle * 0.42 * (wave - 0.5)})`;
        context.fillRect(x, y, 1, 1);
      }
    }

    for (let line = 0; line < 4; line += 1) {
      const y = ((timeSeconds * (13 + line * 2.7) + line * 97) % (bounds.height + 80)) - 40;
      const gradient = context.createLinearGradient(0, 0, bounds.width, 0);
      gradient.addColorStop(0, "rgba(120,160,138,0)");
      gradient.addColorStop(0.45, `rgba(142,184,157,${subtle * 0.42})`);
      gradient.addColorStop(1, "rgba(120,160,138,0)");
      context.fillStyle = gradient;
      context.fillRect(0, y, bounds.width, 0.7);
    }
    context.restore();
  }, [revision, timeSeconds]);

  return <canvas ref={canvasRef} className="trailer-signal-field" aria-hidden="true" />;
}

export function TrailerCanvas({ timeSeconds }: { timeSeconds: number }) {
  const activeIndex = TRAILER_SHOTS.findIndex(
    (shot) => timeSeconds >= shot.startSeconds && timeSeconds < shot.endSeconds,
  );
  const activeShot = activeIndex >= 0 ? TRAILER_SHOTS[activeIndex] : null;
  const previousShot = activeIndex > 0 ? TRAILER_SHOTS[activeIndex - 1] : null;
  const transition = activeShot
    ? smooth((timeSeconds - activeShot.startSeconds) / (activeShot.transitionSeconds ?? 0.9))
    : 0;
  const rainVisible = activeShot?.effect === "rain";
  const whisperPressure = timeSeconds >= 194 && timeSeconds < 216
    ? Math.sin(((timeSeconds - 194) / 22) * Math.PI)
    : 0;
  const whisperApproach = smooth((timeSeconds - 197) / 12);
  const whisperFigureOpacity = smooth((timeSeconds - 197) / 2.2)
    * (1 - smooth((timeSeconds - 209) / 3));
  const finalDarkness = smooth((timeSeconds - 268) / 17);
  const collapseBlack = timeSeconds >= 226 && timeSeconds < 235
    ? Math.sin(((timeSeconds - 226) / 9) * Math.PI)
    : 0;

  const intertitle = useMemo(() => {
    if (timeSeconds < 8) return { kicker: "HYE-JEONG / NOVEMBER CUT", title: "BLACK MAGIC", index: "△ 001" };
    if (timeSeconds >= 70 && timeSeconds < 74) return { kicker: "CHAPTER II", title: "THE FIRST SIGN", index: "△ 002" };
    if (timeSeconds >= 155 && timeSeconds < 163) return { kicker: "CHAPTER III", title: "THE RETURN", index: "△ 003" };
    return null;
  }, [timeSeconds]);

  return (
    <div className="trailer-canvas" data-shot={activeShot?.id ?? "signal"}>
      {previousShot && transition < 1 ? (
        <img
          className="trailer-plate is-previous"
          src={previousShot.image}
          alt=""
          style={{ ...shotStyle(previousShot, previousShot.endSeconds), opacity: 1 - transition }}
        />
      ) : null}
      {activeShot ? (
        <img
          key={activeShot.id}
          className={`trailer-plate is-${activeShot.effect ?? "none"}`}
          src={activeShot.image}
          alt=""
          style={{ ...shotStyle(activeShot, timeSeconds), opacity: transition }}
        />
      ) : null}

      {whisperFigureOpacity > 0 ? (
        <img
          className="trailer-whisper-figure"
          src="/images/textures/mirror-apparition-shadow-layer-black.png"
          alt=""
          style={{
            opacity: whisperFigureOpacity * 0.9,
            right: `${-2 + whisperApproach * 30}%`,
            transform: `translate3d(0, ${1.5 - whisperApproach * 1.5}%, 0) scale(${1 + whisperApproach * 0.045})`,
          }}
        />
      ) : null}

      <div className="trailer-grade" aria-hidden="true" />
      <div className={`trailer-rain ${rainVisible ? "is-visible" : ""}`} aria-hidden="true" />
      <div className="trailer-whisper-pressure" style={{ opacity: whisperPressure * 0.72 }} aria-hidden="true" />
      <div className="trailer-black-pressure" style={{ opacity: finalDarkness * 0.94 + collapseBlack * 0.82 }} aria-hidden="true" />
      <SignalField timeSeconds={timeSeconds} />

      {intertitle ? (
        <div className="trailer-intertitle">
          <span>{intertitle.kicker}</span>
          <h2>{intertitle.title}</h2>
          <i>{intertitle.index}</i>
        </div>
      ) : null}

      {timeSeconds >= 285 ? (
        <div className="trailer-credits">
          <span>TO BE CONTINUED</span>
          <strong>IN NEW MUSIC PERFORMANCE</strong>
          <i />
          <small>A PERFORMANCE BY HYE-JEONG</small>
        </div>
      ) : null}

      <div className="trailer-letterbox is-top" aria-hidden="true" />
      <div className="trailer-letterbox is-bottom" aria-hidden="true" />
      <div className="trailer-scanlines" aria-hidden="true" />
      <div className="trailer-vignette" aria-hidden="true" />
    </div>
  );
}
