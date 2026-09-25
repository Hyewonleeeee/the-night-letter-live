import type { TimelineAudioCue } from "./playerConfig.ts";

export const TRAILER_DURATION_SECONDS = 290;

export const TRAILER_CHAPTERS = {
  "01_the_mark": {
    id: "01_the_mark",
    number: "01",
    title: "I · THE MARK",
    startSeconds: 0,
    endSeconds: 70,
  },
  "02_first_sign": {
    id: "02_first_sign",
    number: "02",
    title: "II · THE FIRST SIGN",
    startSeconds: 70,
    endSeconds: 155,
  },
  "03_the_return": {
    id: "03_the_return",
    number: "03",
    title: "III · THE RETURN",
    startSeconds: 155,
    endSeconds: 290,
  },
} as const;

export type TrailerChapterId = keyof typeof TRAILER_CHAPTERS;

export type TrailerShotEffect = "none" | "rain" | "levitate" | "mirror" | "whisper" | "collapse" | "darken";

export type TrailerShot = {
  id: string;
  startSeconds: number;
  endSeconds: number;
  image: string;
  scaleFrom: number;
  scaleTo: number;
  xFrom?: number;
  xTo?: number;
  yFrom?: number;
  yTo?: number;
  brightness?: number;
  saturation?: number;
  effect?: TrailerShotEffect;
  transitionSeconds?: number;
};

export const TRAILER_SHOTS: TrailerShot[] = [
  { id: "house", startSeconds: 8, endSeconds: 16, image: "/images/backgrounds/wellington-exterior.png", scaleFrom: 1.02, scaleTo: 1.055, xFrom: -1, xTo: 0, brightness: 0.55, saturation: 0.62, effect: "rain" },
  { id: "rain-window", startSeconds: 16, endSeconds: 24, image: "/images/backgrounds/rain-window.png", scaleFrom: 1.06, scaleTo: 1.03, xFrom: 1, xTo: 0, brightness: 0.58, saturation: 0.58, effect: "rain" },
  { id: "boy-window", startSeconds: 24, endSeconds: 32, image: "/images/backgrounds/rain-window-boy-seated.png", scaleFrom: 1.025, scaleTo: 1.06, xFrom: -0.4, xTo: 0.4, brightness: 0.62, saturation: 0.67, effect: "rain" },
  { id: "boy-letter", startSeconds: 32, endSeconds: 40, image: "/images/backgrounds/rain-window-boy-letter.png", scaleFrom: 1.04, scaleTo: 1.075, xFrom: 0.5, xTo: -0.3, brightness: 0.66, saturation: 0.7, effect: "rain" },
  { id: "letter-approach", startSeconds: 40, endSeconds: 47, image: "/images/backgrounds/desk-envelope-hand-01-approach.png", scaleFrom: 1.05, scaleTo: 1.085, yFrom: 0.4, yTo: -0.2, brightness: 0.72, saturation: 0.64 },
  { id: "letter-lift", startSeconds: 47, endSeconds: 54, image: "/images/backgrounds/desk-envelope-hand-02-lift.png", scaleFrom: 1.08, scaleTo: 1.12, xFrom: -0.5, xTo: 0.3, brightness: 0.72, saturation: 0.62 },
  { id: "letter-mark", startSeconds: 54, endSeconds: 61, image: "/images/props/envelope-front.png", scaleFrom: 1.18, scaleTo: 1.26, brightness: 0.65, saturation: 0.5 },
  { id: "finger-triangle", startSeconds: 61, endSeconds: 70, image: "/images/trailer/chapter-1-finger-triangle.png", scaleFrom: 1.02, scaleTo: 1.08, yFrom: 0.5, yTo: -0.3, brightness: 0.76, saturation: 0.65 },

  { id: "morning-room", startSeconds: 70, endSeconds: 78, image: "/images/backgrounds/scene-3-morning-room.png", scaleFrom: 1.05, scaleTo: 1.02, xFrom: 0.8, xTo: 0, brightness: 0.96, saturation: 0.72 },
  { id: "waking-hand", startSeconds: 78, endSeconds: 90, image: "/images/trailer/chapter-2-waking-hand.png", scaleFrom: 1.02, scaleTo: 1.07, xFrom: -0.4, xTo: 0.2, brightness: 0.94, saturation: 0.75 },
  { id: "door-intact", startSeconds: 90, endSeconds: 98, image: "/images/backgrounds/scene-3-door-handle-intact.png", scaleFrom: 1.04, scaleTo: 1.08, xFrom: 0.7, xTo: 0, brightness: 0.82, saturation: 0.7 },
  { id: "handle-approach", startSeconds: 98, endSeconds: 105, image: "/images/backgrounds/scene-3-handle-hand-01-approach.png", scaleFrom: 1.04, scaleTo: 1.1, brightness: 0.78, saturation: 0.68 },
  { id: "handle-contact", startSeconds: 105, endSeconds: 111, image: "/images/backgrounds/scene-3-handle-hand-02-contact.png", scaleFrom: 1.07, scaleTo: 1.12, brightness: 0.76, saturation: 0.62 },
  { id: "handle-grip", startSeconds: 111, endSeconds: 117, image: "/images/backgrounds/scene-3-handle-hand-03-grip.png", scaleFrom: 1.09, scaleTo: 1.14, brightness: 0.72, saturation: 0.58 },
  { id: "handle-break", startSeconds: 117, endSeconds: 124, image: "/images/backgrounds/scene-3-door-handle-broken.png", scaleFrom: 1.12, scaleTo: 1.16, xFrom: 0.2, xTo: -0.2, brightness: 0.69, saturation: 0.52 },
  { id: "recoil", startSeconds: 124, endSeconds: 132, image: "/images/backgrounds/scene-3-handle-hand-05-recoil.png", scaleFrom: 1.06, scaleTo: 1.1, brightness: 0.76, saturation: 0.58 },
  { id: "anxious", startSeconds: 132, endSeconds: 140, image: "/images/backgrounds/scene-3-boy-anxious.png", scaleFrom: 1.02, scaleTo: 1.06, xFrom: 0.5, xTo: 0, brightness: 0.82, saturation: 0.64 },
  { id: "desk-hold", startSeconds: 140, endSeconds: 147, image: "/images/backgrounds/writing-desk.png", scaleFrom: 1.04, scaleTo: 1.08, yFrom: 0.5, yTo: -0.2, brightness: 0.72, saturation: 0.58 },
  { id: "book-levitation", startSeconds: 147, endSeconds: 155, image: "/images/trailer/chapter-2-book-levitation.png", scaleFrom: 1.01, scaleTo: 1.055, xFrom: -0.3, xTo: 0.25, brightness: 0.86, saturation: 0.69, effect: "levitate" },

  { id: "mirror-normal", startSeconds: 163, endSeconds: 172, image: "/images/backgrounds/chapter-3-mirror-normal.png", scaleFrom: 1.03, scaleTo: 1.07, xFrom: -0.3, xTo: 0.2, brightness: 0.7, saturation: 0.54, effect: "mirror" },
  { id: "mirror-sink", startSeconds: 172, endSeconds: 179, image: "/images/backgrounds/chapter-3-mirror-sink-insert.png", scaleFrom: 1.06, scaleTo: 1.1, yFrom: 0.5, yTo: -0.3, brightness: 0.67, saturation: 0.48, effect: "mirror" },
  { id: "mirror-shadow", startSeconds: 179, endSeconds: 190, image: "/images/backgrounds/chapter-3-mirror-shadow-black.png", scaleFrom: 1.025, scaleTo: 1.075, xFrom: 0.4, xTo: -0.15, brightness: 0.62, saturation: 0.42, effect: "mirror" },
  { id: "shadow-approach", startSeconds: 190, endSeconds: 199, image: "/images/backgrounds/chapter-3-mirror-shadow-black.png", scaleFrom: 1.08, scaleTo: 1.18, xFrom: 0.2, xTo: -1.2, brightness: 0.57, saturation: 0.34, effect: "mirror" },
  { id: "whisper-at-ear", startSeconds: 199, endSeconds: 209, image: "/images/backgrounds/chapter-3-mirror-normal.png", scaleFrom: 1.24, scaleTo: 1.37, xFrom: -3.8, xTo: -5.4, yFrom: 0.1, yTo: -0.8, brightness: 0.54, saturation: 0.28, effect: "whisper", transitionSeconds: 1.3 },
  { id: "collapse-focus", startSeconds: 209, endSeconds: 216, image: "/images/backgrounds/chapter-3-mirror-normal.png", scaleFrom: 1.36, scaleTo: 1.42, xFrom: -5.4, xTo: -5.1, yFrom: -0.8, yTo: 4.5, brightness: 0.46, saturation: 0.2, effect: "collapse", transitionSeconds: 0.35 },
  { id: "empty-sink", startSeconds: 216, endSeconds: 228, image: "/images/backgrounds/chapter-3-mirror-sink-insert.png", scaleFrom: 1.1, scaleTo: 1.16, yFrom: -0.2, yTo: 0.7, brightness: 0.5, saturation: 0.28, transitionSeconds: 0.35 },
  { id: "sleep-before-morning", startSeconds: 235, endSeconds: 242, image: "/images/backgrounds/chapter-3-bedroom-shadow.png", scaleFrom: 1.02, scaleTo: 1.045, xFrom: 0.25, xTo: 0, brightness: 0.74, saturation: 0.5 },
  { id: "morning-relief", startSeconds: 242, endSeconds: 253, image: "/images/trailer/chapter-3-morning-relief.png", scaleFrom: 1.045, scaleTo: 1.015, xFrom: 0.2, xTo: -0.15, brightness: 0.98, saturation: 0.78, transitionSeconds: 1.4 },
  { id: "breakfast-letter", startSeconds: 253, endSeconds: 261, image: "/images/backgrounds/chapter-5-breakfast-letter.png", scaleFrom: 1.03, scaleTo: 1.075, xFrom: 0.4, xTo: 0, brightness: 1.02, saturation: 0.82 },
  { id: "final-fear", startSeconds: 261, endSeconds: 285, image: "/images/trailer/chapter-3-final-fear.png", scaleFrom: 1.12, scaleTo: 0.97, brightness: 0.92, saturation: 0.68, effect: "darken", transitionSeconds: 1.1 },
];

// The November performance cut is deliberately silent. Music and sound are performed externally.
export const TRAILER_AUDIO_CUES: TimelineAudioCue[] = [];

export const TRAILER_CHAPTER_ONE_SOURCE = `// NOVEMBER PREVIEW / CHAPTER 01 — THE MARK
const mark = trailerChapter("01_the_mark");

mark.at(0).signal("triangle_boot");
mark.at(8).shot("wellington_house");
mark.at(24).shot("boy_at_window");
mark.at(32).ambience("rain_room");
mark.at(40).prop("triangle_letter");
mark.at(54).focus("ink_mark");
mark.at(61).gesture("finger_triangle");
mark.at(68).transition("morning_cut");

mark.run();`;

export const TRAILER_CHAPTER_TWO_SOURCE = `// NOVEMBER PREVIEW / CHAPTER 02 — THE FIRST SIGN
const firstSign = trailerChapter("02_first_sign");

firstSign.at(0).shot("ordinary_morning");
firstSign.at(8).character("waking_hand");
firstSign.at(20).shot("closed_door");
firstSign.at(28).prop("handle_approach");
firstSign.at(41).detail("metal_pressure");
firstSign.at(47).event("handle_break");
firstSign.at(54).reaction("quiet_shock");
firstSign.at(70).prop("floating_book");
firstSign.at(82).transition("cold_room");

firstSign.run();`;

export const TRAILER_CHAPTER_THREE_SOURCE = `// NOVEMBER PREVIEW / CHAPTER 03 — THE RETURN
const theReturn = trailerChapter("03_the_return");

theReturn.at(0).signal("shadow_threshold");
theReturn.at(8).shot("bathroom_mirror");
theReturn.at(26).presence("black_reflection");
theReturn.at(35).camera("shadow_closer");
theReturn.at(44).presence("whisper_at_ear");
theReturn.at(62).event("collapse_out_of_frame");
theReturn.at(80).transition("morning_return");
theReturn.at(87).reaction("relief_after_dream");
theReturn.at(98).prop("letter_from_mother");
theReturn.at(106).reaction("recognition");
theReturn.at(114).camera("fear_zoom_out");
theReturn.at(124).signal("blackout_triangle");
theReturn.at(130).credit("new_music_performance");

theReturn.run();`;

export const TRAILER_CHAPTER_SOURCES: Record<TrailerChapterId, string> = {
  "01_the_mark": TRAILER_CHAPTER_ONE_SOURCE,
  "02_first_sign": TRAILER_CHAPTER_TWO_SOURCE,
  "03_the_return": TRAILER_CHAPTER_THREE_SOURCE,
};

export const TRAILER_KNOWN_CUES: Record<TrailerChapterId, ReadonlySet<string>> = {
  "01_the_mark": new Set(["triangle_boot", "wellington_house", "boy_at_window", "rain_room", "triangle_letter", "ink_mark", "finger_triangle", "morning_cut"]),
  "02_first_sign": new Set(["ordinary_morning", "waking_hand", "closed_door", "handle_approach", "metal_pressure", "handle_break", "quiet_shock", "floating_book", "cold_room"]),
  "03_the_return": new Set(["shadow_threshold", "bathroom_mirror", "black_reflection", "shadow_closer", "whisper_at_ear", "collapse_out_of_frame", "morning_return", "relief_after_dream", "letter_from_mother", "recognition", "fear_zoom_out", "blackout_triangle", "new_music_performance"]),
};
