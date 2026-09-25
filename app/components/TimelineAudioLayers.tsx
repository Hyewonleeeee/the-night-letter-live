"use client";

import { useEffect, useRef } from "react";
import { PLAYER_CONFIG, type TimelineAudioCue } from "../config/playerConfig";

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

export type LiveAudioMix = Record<string, { gain: number; pan: number }>;

const cueGainAt = (cue: TimelineAudioCue, timeSeconds: number, gain: number) => {
  const fadeIn = cue.fadeInSeconds > 0
    ? clamp((timeSeconds - cue.startSeconds) / cue.fadeInSeconds)
    : 1;
  const fadeOut = cue.fadeOutSeconds > 0
    ? clamp((cue.endSeconds - timeSeconds) / cue.fadeOutSeconds)
    : 1;
  return gain * Math.min(fadeIn, fadeOut);
};

function TimelineAudioTrack({
  cue,
  currentTime,
  playing,
  muted,
  masterVolume,
  mix,
}: {
  cue: TimelineAudioCue;
  currentTime: number;
  playing: boolean;
  muted: boolean;
  masterVolume: number;
  mix?: { gain: number; pan: number };
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const attemptedPlaybackRef = useRef(false);
  const audioGraphRef = useRef<{
    context: AudioContext;
    source: MediaElementAudioSourceNode;
    panner: StereoPannerNode;
  } | null>(null);

  useEffect(() => {
    audioGraphRef.current?.panner.pan.setTargetAtTime(
      clamp(mix?.pan ?? 0, -1, 1),
      audioGraphRef.current.context.currentTime,
      0.08,
    );
  }, [mix?.pan]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const active = currentTime >= cue.startSeconds && currentTime < cue.endSeconds;
    audio.muted = muted;
    audio.volume = clamp(masterVolume * cueGainAt(cue, currentTime, mix?.gain ?? cue.gain));

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
      if (!audioGraphRef.current && "AudioContext" in window) {
        const context = new AudioContext();
        context.resume().then(() => {
          if (context.state !== "running" || !audioRef.current || audioGraphRef.current) {
            context.close().catch(() => {});
            return;
          }
          const source = context.createMediaElementSource(audioRef.current);
          const panner = context.createStereoPanner();
          panner.pan.value = clamp(mix?.pan ?? 0, -1, 1);
          source.connect(panner).connect(context.destination);
          audioGraphRef.current = { context, source, panner };
        }).catch(() => context.close().catch(() => {}));
      }
      audio.play().catch(() => {
        // Missing placeholder files never block the visual timeline.
      });
    }
  }, [cue, currentTime, masterVolume, mix?.gain, mix?.pan, muted, playing]);

  useEffect(() => () => {
    const graph = audioGraphRef.current;
    audioGraphRef.current = null;
    graph?.source.disconnect();
    graph?.panner.disconnect();
    graph?.context.close().catch(() => {});
  }, []);

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
  liveMix = {},
  cues = PLAYER_CONFIG.audioCues,
}: {
  currentTime: number;
  playing: boolean;
  muted: boolean;
  masterVolume: number;
  liveMix?: LiveAudioMix;
  cues?: TimelineAudioCue[];
}) {
  const nearbyCues = cues.filter(
    (cue) => currentTime >= cue.startSeconds - 8 && currentTime <= cue.endSeconds + 2,
  );

  return nearbyCues.map((cue) => (
    <TimelineAudioTrack
      key={cue.id}
      cue={cue}
      currentTime={currentTime}
      playing={playing}
      muted={muted}
      masterVolume={masterVolume}
      mix={liveMix[cue.id]}
    />
  ));
}
