"use client";

import { useEffect, useRef } from "react";
import { PLAYER_CONFIG, type TimelineAudioCue } from "../config/playerConfig";

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const cueGainAt = (cue: TimelineAudioCue, timeSeconds: number) => {
  const fadeIn = cue.fadeInSeconds > 0
    ? clamp((timeSeconds - cue.startSeconds) / cue.fadeInSeconds)
    : 1;
  const fadeOut = cue.fadeOutSeconds > 0
    ? clamp((cue.endSeconds - timeSeconds) / cue.fadeOutSeconds)
    : 1;
  return cue.gain * Math.min(fadeIn, fadeOut);
};

function TimelineAudioTrack({
  cue,
  currentTime,
  playing,
  muted,
  masterVolume,
}: {
  cue: TimelineAudioCue;
  currentTime: number;
  playing: boolean;
  muted: boolean;
  masterVolume: number;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const attemptedPlaybackRef = useRef(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const active = currentTime >= cue.startSeconds && currentTime < cue.endSeconds;
    audio.muted = muted;
    audio.volume = clamp(masterVolume * cueGainAt(cue, currentTime));

    if (!active) {
      audio.pause();
      attemptedPlaybackRef.current = false;
      return;
    }

    if (audio.readyState > 0 && Number.isFinite(audio.duration) && audio.duration > 0) {
      const localTime = Math.max(0, currentTime - cue.startSeconds);
      const targetTime = cue.loop ? localTime % audio.duration : Math.min(localTime, audio.duration);
      if (Math.abs(audio.currentTime - targetTime) > 0.35) {
        try {
          audio.currentTime = targetTime;
        } catch {
          // A replacement file may not be seekable until its metadata is ready.
        }
      }
    }

    if (!playing) {
      audio.pause();
      attemptedPlaybackRef.current = false;
      return;
    }

    if (audio.paused && !attemptedPlaybackRef.current) {
      attemptedPlaybackRef.current = true;
      audio.play().catch(() => {
        // Missing placeholder files never block the visual timeline.
      });
    }
  }, [cue, currentTime, masterVolume, muted, playing]);

  return (
    <audio
      ref={audioRef}
      src={cue.source}
      preload="none"
      loop={cue.loop}
      aria-hidden="true"
    />
  );
}

export function TimelineAudioLayers({
  currentTime,
  playing,
  muted,
  masterVolume,
}: {
  currentTime: number;
  playing: boolean;
  muted: boolean;
  masterVolume: number;
}) {
  return PLAYER_CONFIG.audioCues.map((cue) => (
    <TimelineAudioTrack
      key={cue.id}
      cue={cue}
      currentTime={currentTime}
      playing={playing}
      muted={muted}
      masterVolume={masterVolume}
    />
  ));
}
