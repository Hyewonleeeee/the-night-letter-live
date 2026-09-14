"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { PLAYER_CONFIG } from "../config/playerConfig";
import { CinematicCanvas } from "./CinematicCanvas";
import { LiveVisualStage } from "./LiveVisualStage";
import { TimelineAudioLayers } from "./TimelineAudioLayers";

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const formatTime = (seconds: number) => {
  const safeSeconds = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = Math.floor(safeSeconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
};

export function CinematicPlayer() {
  const isVideoMode = PLAYER_CONFIG.renderMode === "video";
  const shellRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLMediaElement>(null);
  const currentTimeRef = useRef(0);
  const anchorRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const lastPaintRef = useRef(0);
  const controlsTimerRef = useRef<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(PLAYER_CONFIG.durationSeconds);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.78);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);

  const soundtrackLevel = useMemo(() => {
    const finalLetter = clamp((currentTime - 68.4) / 1.2, 0, 1) *
      clamp((72.2 - currentTime) / 0.8, 0, 1);
    const ritualSilence = clamp((currentTime - 153) / 6, 0, 1);
    const scene2SilenceIn = clamp((currentTime - 159.4) / 1.4, 0, 1);
    const scene2SilenceOut = clamp((currentTime - 202) / 3, 0, 1);
    const scene2Silence = scene2SilenceIn * (1 - scene2SilenceOut);
    const baseLevel = Math.max(0.56, 1 - finalLetter * 0.2 - ritualSilence * 0.32);
    return baseLevel * (1 - scene2Silence);
  }, [currentTime]);

  const syncMediaTime = useCallback((timeSeconds: number) => {
    const media = mediaRef.current;
    if (!media || !Number.isFinite(media.duration)) return;
    try {
      media.currentTime = clamp(timeSeconds, 0, media.duration || timeSeconds);
    } catch {
      // Placeholder audio/video may not be seekable until a real file is supplied.
    }
  }, []);

  const seekTo = useCallback(
    (timeSeconds: number) => {
      const nextTime = clamp(timeSeconds, 0, duration);
      currentTimeRef.current = nextTime;
      setCurrentTime(nextTime);
      anchorRef.current = performance.now() - nextTime * 1000;
      syncMediaTime(nextTime);
    },
    [duration, syncMediaTime],
  );

  const pause = useCallback(() => {
    mediaRef.current?.pause();
    setPlaying(false);
    setControlsVisible(true);
    if (controlsTimerRef.current !== null) {
      window.clearTimeout(controlsTimerRef.current);
      controlsTimerRef.current = null;
    }
  }, []);

  const play = useCallback(() => {
    let startTime = currentTimeRef.current;
    if (startTime >= duration - 0.02) {
      startTime = 0;
      seekTo(0);
    }
    anchorRef.current = performance.now() - startTime * 1000;
    mediaRef.current?.play().catch(() => {
      // Canvas playback remains available while placeholder media is absent.
    });
    setPlaying(true);
    setControlsVisible(true);
    if (controlsTimerRef.current !== null) {
      window.clearTimeout(controlsTimerRef.current);
    }
    controlsTimerRef.current = window.setTimeout(() => {
      setControlsVisible(false);
    }, 2_600);
  }, [duration, seekTo]);

  const togglePlayback = useCallback(() => {
    if (playing) pause();
    else play();
  }, [pause, play, playing]);

  const stop = useCallback(() => {
    pause();
    seekTo(0);
  }, [pause, seekTo]);

  const seekBy = useCallback(
    (seconds: number) => seekTo(currentTimeRef.current + seconds),
    [seekTo],
  );

  const showControls = useCallback(() => {
    setControlsVisible(true);
    if (controlsTimerRef.current !== null) {
      window.clearTimeout(controlsTimerRef.current);
    }
    if (playing) {
      controlsTimerRef.current = window.setTimeout(() => {
        setControlsVisible(false);
      }, 2_600);
    }
  }, [playing]);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    } else {
      shellRef.current?.requestFullscreen?.().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;
    media.volume = volume * soundtrackLevel;
    media.muted = muted;
  }, [muted, soundtrackLevel, volume]);

  useEffect(() => {
    if (isVideoMode || !playing) return;
    anchorRef.current = performance.now() - currentTimeRef.current * 1000;

    const tick = (now: number) => {
      const media = mediaRef.current;
      const mediaClockAvailable = Boolean(
        media && !media.paused && media.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA,
      );
      const nextTime = Math.min(
        duration,
        mediaClockAvailable && media
          ? media.currentTime
          : (now - anchorRef.current) / 1000,
      );
      currentTimeRef.current = nextTime;
      if (now - lastPaintRef.current > 15 || nextTime >= duration) {
        lastPaintRef.current = now;
        setCurrentTime(nextTime);
      }
      if (nextTime >= duration) {
        mediaRef.current?.pause();
        frameRef.current = null;
        setPlaying(false);
        setControlsVisible(true);
        return;
      }
      frameRef.current = window.requestAnimationFrame(tick);
    };

    frameRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [duration, isVideoMode, playing]);

  useEffect(() => {
    const timerRef = controlsTimerRef;
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      const target = event.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLButtonElement ||
        target instanceof HTMLSelectElement ||
        target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (event.code === "Space") {
        event.preventDefault();
        togglePlayback();
      } else if (event.code === "ArrowLeft") {
        event.preventDefault();
        seekBy(-5);
      } else if (event.code === "ArrowRight") {
        event.preventDefault();
        seekBy(5);
      } else if (/^Digit[0-9]$/.test(event.code)) {
        const digit = Number(event.code.slice(-1));
        const markerIndex = digit === 0 ? 9 : digit - 1;
        const marker = PLAYER_CONFIG.sceneMarkers[markerIndex];
        if (marker) {
          event.preventDefault();
          seekTo(marker.timeSeconds);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [seekBy, seekTo, togglePlayback]);

  const currentTextCue = PLAYER_CONFIG.textCues.find(
    (cue) => currentTime >= cue.startSeconds && currentTime < cue.endSeconds,
  );
  const currentScene = PLAYER_CONFIG.timeline.find(
    (scene) => currentTime >= scene.startSeconds && currentTime < scene.endSeconds,
  ) ?? PLAYER_CONFIG.timeline.at(-1)!;
  const displayTextCue = currentScene.textPosition === "paper-camera"
    ? undefined
    : currentTextCue;
  const textOpacity = useMemo(() => {
    if (!currentTextCue) return 0;
    const fadeDuration = currentTextCue.group === "dialogue" ? 0.22 : 0.7;
    const fadeIn = clamp((currentTime - currentTextCue.startSeconds) / fadeDuration, 0, 1);
    const fadeOut = clamp((currentTextCue.endSeconds - currentTime) / fadeDuration, 0, 1);
    return Math.min(fadeIn, fadeOut);
  }, [currentTextCue, currentTime]);

  const activeSceneIndex = PLAYER_CONFIG.sceneMarkers.reduce(
    (activeIndex, marker, index) =>
      currentTime >= marker.timeSeconds ? index : activeIndex,
    0,
  );
  const timelineProgress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <main className="player-page">
      <section
        ref={shellRef}
        className={`cinematic-player ${playing ? "is-playing" : "is-paused"} ${controlsVisible ? "controls-visible" : "controls-hidden"}`}
        onPointerMove={showControls}
        onPointerDown={showControls}
        onMouseLeave={() => playing && setControlsVisible(false)}
        aria-label="공연용 시네마틱 웹 플레이어"
      >
        <div className="player-viewport" onDoubleClick={toggleFullscreen}>
          <LiveVisualStage>
            {isVideoMode ? (
              <video
                ref={mediaRef as React.RefObject<HTMLVideoElement>}
                className="player-video"
                src={PLAYER_CONFIG.videoSource}
                preload="metadata"
                playsInline
                onLoadedMetadata={(event) => {
                  const mediaDuration = event.currentTarget.duration;
                  if (Number.isFinite(mediaDuration)) setDuration(mediaDuration);
                }}
                onTimeUpdate={(event) => {
                  const nextTime = event.currentTarget.currentTime;
                  currentTimeRef.current = nextTime;
                  setCurrentTime(nextTime);
                }}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onEnded={() => {
                  setPlaying(false);
                  setControlsVisible(true);
                }}
              />
            ) : (
              <CinematicCanvas timeSeconds={currentTime} playing={playing} />
            )}
          </LiveVisualStage>

          {!isVideoMode ? (
            <>
              <audio
                ref={mediaRef as React.RefObject<HTMLAudioElement>}
                src={PLAYER_CONFIG.animationAudioSource}
                preload="auto"
              />
              <TimelineAudioLayers
                currentTime={currentTime}
                playing={playing}
                muted={muted}
                masterVolume={volume}
              />
            </>
          ) : null}

          <div className="player-film" aria-hidden="true" />
          <div className="player-vignette" aria-hidden="true" />

          {displayTextCue ? (
            <p
              className={`film-text position-${currentScene.textPosition} ${displayTextCue.emphasis ? "is-emphasis" : ""}`}
              style={{
                opacity: textOpacity,
                color: currentScene.textStyle.color,
                fontSize: `${currentScene.textStyle.fontSizeVh}vh`,
                letterSpacing: `${currentScene.textStyle.letterSpacingEm}em`,
                maxWidth: `${currentScene.textStyle.maxWidthVw}vw`,
                textAlign: currentScene.textStyle.align,
              }}
              aria-live="polite"
            >
              {displayTextCue.text}
            </p>
          ) : null}

          <div className="player-title-strip" aria-hidden="true">
            <span>{PLAYER_CONFIG.title}</span>
            <span>{isVideoMode ? "MP4" : `HYBRID FILM CUT / ${formatTime(duration)}`}</span>
          </div>
        </div>

        <div className="player-controls" onFocus={showControls}>
          <nav className="scene-shortcuts" aria-label="장면 바로가기">
            {PLAYER_CONFIG.sceneMarkers.map((marker, index) => (
              <button
                key={marker.id}
                type="button"
                className={index === activeSceneIndex ? "is-active" : ""}
                onClick={() => seekTo(marker.timeSeconds)}
                title={`${formatTime(marker.timeSeconds)}로 이동`}
              >
                <kbd>{index + 1}</kbd>
                <span>{marker.label}</span>
                <time>{formatTime(marker.timeSeconds)}</time>
              </button>
            ))}
          </nav>

          <div className="timeline-control">
            <input
              type="range"
              min={0}
              max={duration}
              step={0.01}
              value={currentTime}
              onChange={(event) => seekTo(Number(event.target.value))}
              aria-label="재생 위치"
              style={{ "--timeline-progress": `${timelineProgress}%` } as React.CSSProperties}
            />
            <div className="timeline-markers" aria-hidden="true">
              {PLAYER_CONFIG.sceneMarkers.map((marker) => (
                <i
                  key={marker.id}
                  style={{ left: `${(marker.timeSeconds / duration) * 100}%` }}
                />
              ))}
            </div>
          </div>

          <div className="transport-controls">
            <div className="transport-main">
              <button type="button" onClick={togglePlayback} aria-label={playing ? "일시정지" : "재생"}>
                {playing ? "Ⅱ" : "▶"}
              </button>
              <button type="button" onClick={stop} aria-label="정지">
                ■
              </button>
              <button type="button" onClick={() => seekTo(0)} aria-label="처음으로 이동">
                ↤
              </button>
              <button type="button" onClick={() => seekBy(-10)} aria-label="10초 뒤로">
                −10
              </button>
              <button type="button" onClick={() => seekBy(10)} aria-label="10초 앞으로">
                +10
              </button>
            </div>

            <div className="time-display" aria-label="현재 재생 시간과 전체 시간">
              <strong>{formatTime(currentTime)}</strong>
              <span>/</span>
              <time>{formatTime(duration)}</time>
            </div>

            <div className="transport-options">
              <button
                type="button"
                onClick={() => setMuted((value) => !value)}
                aria-label={muted ? "음소거 해제" : "음소거"}
              >
                {muted || volume === 0 ? "MUTE" : "VOL"}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(event) => {
                  const nextVolume = Number(event.target.value);
                  setVolume(nextVolume);
                  if (nextVolume > 0) setMuted(false);
                }}
                aria-label="볼륨"
              />
              <button type="button" onClick={toggleFullscreen} aria-label="전체 화면">
                {fullscreen ? "EXIT" : "FULL"}
              </button>
            </div>
          </div>

          <p className="player-key-help">
            SPACE 재생·일시정지 · ← → 5초 이동 · 숫자키 1–5 챕터 이동 · 더블클릭 전체 화면
          </p>
        </div>
      </section>
    </main>
  );
}
