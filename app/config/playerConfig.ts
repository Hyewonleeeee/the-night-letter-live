export type PlayerRenderMode = "animation" | "video";

export type SceneMarker = {
  id: string;
  label: string;
  timeSeconds: number;
};

export type CameraMotion = {
  scaleFrom: number;
  scaleTo: number;
  xFrom: number;
  xTo: number;
  yFrom: number;
  yTo: number;
  blurFrom: number;
  blurTo: number;
};

export type TransitionType = "dissolve" | "rack-focus" | "fade-black";
export type TextPosition = "none" | "letter" | "paper-camera" | "lower-third" | "dialogue";

export type SceneTextStyle = {
  color: string;
  fontSizeVh: number;
  letterSpacingEm: number;
  maxWidthVw: number;
  align: "left" | "center";
};

export type SceneColorGrade = {
  brightness: number;
  contrast: number;
  saturation: number;
  temperature: string;
  shadow: string;
};

/**
 * 모든 이미지 경로는 public 폴더 기준입니다. PNG/JPG/WebP/SVG를 같은 경로의
 * 파일로 교체하면 타임라인 코드를 건드리지 않고 에셋만 바꿀 수 있습니다.
 */
export type TimelineSegment = {
  id: string;
  label: string;
  startSeconds: number;
  endSeconds: number;
  backgroundImage: string;
  characterImage?: string;
  foregroundImage?: string;
  textureImage: string;
  cameraMotion: CameraMotion;
  transitionType: TransitionType;
  transitionDuration: number;
  textPosition: TextPosition;
  textStyle: SceneTextStyle;
  sceneColorGrade: SceneColorGrade;
};

export type PlayerTextCue = {
  id: string;
  text: string;
  startSeconds: number;
  endSeconds: number;
  group: "letter" | "intertitle" | "dialogue";
  paperYPercent?: number;
  emphasis?: boolean;
};

export type TimelineAudioCue = {
  id: string;
  source: string;
  startSeconds: number;
  endSeconds: number;
  gain: number;
  fadeInSeconds: number;
  fadeOutSeconds: number;
  loop?: boolean;
};

export type PlayerConfig = {
  title: string;
  renderMode: PlayerRenderMode;
  durationSeconds: number;
  videoSource: string;
  animationAudioSource: string;
  sceneMarkers: SceneMarker[];
  timeline: TimelineSegment[];
  textCues: PlayerTextCue[];
  audioCues: TimelineAudioCue[];
};

const serifLetterStyle: SceneTextStyle = {
  color: "#201f1b",
  fontSizeVh: 2.5,
  letterSpacingEm: 0.055,
  maxWidthVw: 30,
  align: "left",
};

const subtitleStyle: SceneTextStyle = {
  color: "#e6e4dc",
  fontSizeVh: 2.1,
  letterSpacingEm: 0.06,
  maxWidthVw: 68,
  align: "center",
};

const coldExterior: SceneColorGrade = {
  brightness: 0.8,
  contrast: 1.12,
  saturation: 0.66,
  temperature: "rgba(33, 53, 61, 0.16)",
  shadow: "rgba(0, 3, 5, 0.24)",
};

const warmInterior: SceneColorGrade = {
  brightness: 0.86,
  contrast: 1.07,
  saturation: 0.78,
  temperature: "rgba(95, 61, 27, 0.09)",
  shadow: "rgba(2, 4, 5, 0.18)",
};

const ritualNight: SceneColorGrade = {
  brightness: 0.76,
  contrast: 1.1,
  saturation: 0.58,
  temperature: "rgba(71, 50, 30, 0.08)",
  shadow: "rgba(0, 3, 5, 0.26)",
};

const thresholdNight: SceneColorGrade = {
  brightness: 0.77,
  contrast: 1.1,
  saturation: 0.54,
  temperature: "rgba(28, 52, 66, 0.14)",
  shadow: "rgba(0, 4, 8, 0.22)",
};

const morningWarmth: SceneColorGrade = {
  brightness: 0.91,
  contrast: 1.04,
  saturation: 0.84,
  temperature: "rgba(132, 89, 42, 0.07)",
  shadow: "rgba(17, 11, 6, 0.12)",
};

const unsettledMorning: SceneColorGrade = {
  brightness: 0.86,
  contrast: 1.08,
  saturation: 0.72,
  temperature: "rgba(91, 78, 58, 0.045)",
  shadow: "rgba(12, 13, 13, 0.18)",
};

const anxiousMorning: SceneColorGrade = {
  brightness: 0.82,
  contrast: 1.1,
  saturation: 0.68,
  temperature: "rgba(76, 72, 61, 0.035)",
  shadow: "rgba(9, 12, 13, 0.22)",
};

export const PROP_ASSETS = {
  envelopeFront: "/images/props/envelope-front.png",
  envelopeBack: "/images/props/envelope-back.png",
  envelopeOpen: "/images/props/envelope-open.png",
  letterPaper: "/images/props/letter-paper.png",
  ritualCloth: "/images/props/white-cloth-strip.png",
} as const;

export const PROLOGUE_PHOTO_ASSETS = {
  rainWindowBoySeated: "/images/backgrounds/rain-window-boy-seated.png",
  rainWindowBoyLetter: "/images/backgrounds/rain-window-boy-letter.png",
  deskEnvelopeApproach: "/images/backgrounds/desk-envelope-hand-01-approach.png",
  deskEnvelopeLift: "/images/backgrounds/desk-envelope-hand-02-lift.png",
  deskEnvelopeOpen: "/images/backgrounds/desk-envelope-hand-03-open.png",
  ritualClothSingle: "/images/backgrounds/ritual-cloth-01-single.png",
  ritualClothTwoSides: "/images/backgrounds/ritual-cloth-02-hand.png",
  ritualClothComplete: "/images/backgrounds/ritual-cloth-03-complete.png",
} as const;

export const SCENE_2_ASSETS = {
  background: "/images/backgrounds/scene-2-ritual-room-cloth.png",
  backgroundDraft: "/images/backgrounds/scene-2-ritual-room-cloth-draft.png",
  boyStanding: "/images/characters/boy-ritual-standing.png",
  boyWalking: "/images/characters/boy-ritual-walking.png",
  boyWalkingStepB: "/images/characters/boy-ritual-walking-step-b.png",
  ritualCloth: PROP_ASSETS.ritualCloth,
} as const;

export const SCENE_3_ASSETS = {
  morningRoom: "/images/backgrounds/scene-3-morning-room.png",
  doorHandleIntact: "/images/backgrounds/scene-3-door-handle-intact.png",
  doorHandleApproach: "/images/backgrounds/scene-3-handle-hand-01-approach.png",
  doorHandleContact: "/images/backgrounds/scene-3-handle-hand-02-contact.png",
  doorHandleGrip: "/images/backgrounds/scene-3-handle-hand-03-grip.png",
  doorHandlePress: "/images/backgrounds/scene-3-handle-hand-04-press.png",
  doorHandleRecoil: "/images/backgrounds/scene-3-handle-hand-05-recoil.png",
  doorHandleBroken: "/images/backgrounds/scene-3-door-handle-broken.png",
  morningGarden: "/images/backgrounds/scene-3-morning-garden.png",
  anxiousBoy: "/images/backgrounds/scene-3-boy-anxious.png",
  smallStone: "/images/props/scene-3-small-stone.png",
  wildflower: "/images/props/scene-3-wildflower.png",
} as const;

/**
 * Scene 2의 모든 연기·대사·반응 타이밍은 이 객체만 수정하면 함께 이동합니다.
 */
export const SCENE_2_TIMING = {
  start: 160,
  tensionStart: 162.2,
  fistStart: 165.8,
  fistEnd: 168.3,
  inhaleStart: 168.4,
  inhaleEnd: 171.1,
  spellStart: 171.25,
  spellEnd: 172.3,
  responseStart: 172.35,
  responseEnd: 174.35,
  stillnessStart: 174.35,
  stillnessEnd: 181.75,
  asideStart: 182.05,
  asideEnd: 184.75,
  exitStart: 184.8,
  exitEnd: 193.35,
  emptyHoldStart: 193.35,
  secondFogStart: 196.15,
  secondFogEnd: 200.25,
  end: 202,
} as const;

/**
 * Scene 3 — "The First Sign"의 화면·소품·사운드는 이 시간표를 함께 참조합니다.
 * end가 현재 플레이어의 마지막 프레임이며 이후 장면은 구현하지 않습니다.
 */
export const SCENE_3_TIMING = {
  start: SCENE_2_TIMING.end,
  morningEnd: 218,
  doorApproachEnd: 223.5,
  handleTouch: 225.8,
  handleStrain: 228.1,
  handleBreak: 229.2,
  handleRevealEnd: 230.15,
  handleEnd: 235,
  aftermathEnd: 252,
  stoneStart: 252,
  stoneMoveStart: 258.3,
  stoneLiftStart: 261.4,
  stoneHoverEnd: 264.8,
  stoneDrop: 266.2,
  stoneEnd: 270,
  flowerStart: 270,
  flowerBendStart: 275.2,
  flowerHoldStart: 278.2,
  flowerRelease: 280.5,
  flowerEnd: 283,
  anxiousStart: 283,
  end: 292,
} as const;

/**
 * 현재는 Scene 3까지 포함한 292초 레이어 애니매틱입니다. 완성 MP4를 사용할 때 renderMode만
 * "video"로 바꾸면 동일한 플레이어 컨트롤이 videoSource를 제어합니다.
 */
export const PLAYER_CONFIG: PlayerConfig = {
  title: "THE NIGHT LETTER",
  renderMode: "animation",
  durationSeconds: SCENE_3_TIMING.end,
  videoSource: "/video/performance-film.mp4",
  animationAudioSource: "/audio/test-scene-soundtrack.mp3",
  sceneMarkers: [
    { id: "exterior", label: "주택 외부", timeSeconds: 0 },
    { id: "window", label: "창가의 소년", timeSeconds: 12 },
    { id: "arrival", label: "편지 도착", timeSeconds: 24 },
    { id: "pickup", label: "편지를 집다", timeSeconds: 34 },
    { id: "open", label: "봉투와 삼각형", timeSeconds: 45 },
    { id: "message", label: "편지 내용", timeSeconds: 52 },
    { id: "after-reading", label: "편지를 읽은 뒤", timeSeconds: 80 },
    { id: "ritual-prep", label: "의식 준비", timeSeconds: 110 },
    { id: "inside-triangle", label: "삼각형 안", timeSeconds: 145 },
    { id: "threshold-spell", label: "Alohomora", timeSeconds: SCENE_2_TIMING.start },
    { id: "first-sign", label: "The First Sign", timeSeconds: SCENE_3_TIMING.start },
  ],
  timeline: [
    {
      id: "house",
      label: "어두운 주택",
      startSeconds: 0,
      endSeconds: 12,
      backgroundImage: "/images/backgrounds/wellington-exterior.png",
      foregroundImage: "/images/textures/branches-foreground.svg",
      textureImage: "/images/textures/film-grain.svg",
      cameraMotion: { scaleFrom: 1.01, scaleTo: 1.075, xFrom: 0, xTo: -1.7, yFrom: 0, yTo: -0.5, blurFrom: 0.4, blurTo: 0 },
      transitionType: "dissolve",
      transitionDuration: 1.2,
      textPosition: "none",
      textStyle: subtitleStyle,
      sceneColorGrade: coldExterior,
    },
    {
      id: "boy",
      label: "창문의 실루엣",
      startSeconds: 12,
      endSeconds: 24,
      backgroundImage: PROLOGUE_PHOTO_ASSETS.rainWindowBoySeated,
      foregroundImage: "/images/textures/window-rain.svg",
      textureImage: "/images/textures/film-grain.svg",
      cameraMotion: { scaleFrom: 1.025, scaleTo: 1.13, xFrom: 0.8, xTo: -1.1, yFrom: 0, yTo: -0.7, blurFrom: 2.2, blurTo: 0 },
      transitionType: "rack-focus",
      transitionDuration: 2.8,
      textPosition: "none",
      textStyle: subtitleStyle,
      sceneColorGrade: warmInterior,
    },
    {
      id: "letter-flight",
      label: "날아오는 편지",
      startSeconds: 24,
      endSeconds: 34,
      backgroundImage: PROLOGUE_PHOTO_ASSETS.rainWindowBoySeated,
      foregroundImage: "/images/textures/window-rain.svg",
      textureImage: "/images/textures/film-grain.svg",
      cameraMotion: { scaleFrom: 1.12, scaleTo: 1.16, xFrom: -1, xTo: 1.2, yFrom: -0.7, yTo: 0.3, blurFrom: 0, blurTo: 0.3 },
      transitionType: "dissolve",
      transitionDuration: 1.8,
      textPosition: "none",
      textStyle: subtitleStyle,
      sceneColorGrade: warmInterior,
    },
    {
      id: "letter-pickup",
      label: "편지를 집어 듦",
      startSeconds: 34,
      endSeconds: 45,
      backgroundImage: "/images/backgrounds/writing-desk.png",
      foregroundImage: "/images/textures/window-rain.svg",
      textureImage: "/images/textures/film-grain.svg",
      cameraMotion: { scaleFrom: 1.02, scaleTo: 1.11, xFrom: 0.8, xTo: -0.5, yFrom: 0.6, yTo: -0.7, blurFrom: 1.2, blurTo: 0 },
      transitionType: "dissolve",
      transitionDuration: 2.4,
      textPosition: "none",
      textStyle: subtitleStyle,
      sceneColorGrade: warmInterior,
    },
    {
      id: "envelope",
      label: "봉투를 열다",
      startSeconds: 45,
      endSeconds: 52,
      backgroundImage: "/images/backgrounds/writing-desk.png",
      textureImage: "/images/textures/film-grain.svg",
      cameraMotion: { scaleFrom: 1.06, scaleTo: 1.15, xFrom: -0.2, xTo: -1.2, yFrom: -0.3, yTo: -1, blurFrom: 0.8, blurTo: 0 },
      transitionType: "rack-focus",
      transitionDuration: 1.2,
      textPosition: "none",
      textStyle: subtitleStyle,
      sceneColorGrade: warmInterior,
    },
    {
      id: "letter-text",
      label: "편지 내용",
      startSeconds: 52,
      endSeconds: 72,
      backgroundImage: "/images/backgrounds/writing-desk.png",
      textureImage: "/images/textures/film-grain.svg",
      cameraMotion: { scaleFrom: 1.09, scaleTo: 1.125, xFrom: -0.7, xTo: -1.1, yFrom: -0.5, yTo: -0.8, blurFrom: 0.3, blurTo: 0 },
      transitionType: "dissolve",
      transitionDuration: 2.2,
      textPosition: "paper-camera",
      textStyle: serifLetterStyle,
      sceneColorGrade: warmInterior,
    },
    {
      id: "fade-out",
      label: "암전",
      startSeconds: 72,
      endSeconds: 80,
      backgroundImage: "/images/backgrounds/writing-desk.png",
      textureImage: "/images/textures/film-grain.svg",
      cameraMotion: { scaleFrom: 1.125, scaleTo: 1.14, xFrom: -1.1, xTo: -1.2, yFrom: -0.8, yTo: -0.9, blurFrom: 0, blurTo: 1.8 },
      transitionType: "fade-black",
      transitionDuration: 8,
      textPosition: "none",
      textStyle: subtitleStyle,
      sceneColorGrade: warmInterior,
    },
    {
      id: "after-reading",
      label: "편지를 읽은 뒤",
      startSeconds: 80,
      endSeconds: 95,
      backgroundImage: PROLOGUE_PHOTO_ASSETS.rainWindowBoyLetter,
      foregroundImage: "/images/textures/window-rain.svg",
      textureImage: "/images/textures/film-grain.svg",
      cameraMotion: { scaleFrom: 1.08, scaleTo: 1.13, xFrom: -0.4, xTo: 0.5, yFrom: -0.4, yTo: -0.7, blurFrom: 1.1, blurTo: 0.2 },
      transitionType: "dissolve",
      transitionDuration: 3.2,
      textPosition: "none",
      textStyle: subtitleStyle,
      sceneColorGrade: warmInterior,
    },
    {
      id: "time-passage",
      label: "할로윈 밤으로",
      startSeconds: 95,
      endSeconds: 110,
      backgroundImage: "/images/backgrounds/rain-window.png",
      foregroundImage: "/images/textures/window-rain.svg",
      textureImage: "/images/textures/film-grain.svg",
      cameraMotion: { scaleFrom: 1.06, scaleTo: 1.1, xFrom: 0, xTo: -0.5, yFrom: 0, yTo: -0.3, blurFrom: 0.5, blurTo: 0 },
      transitionType: "rack-focus",
      transitionDuration: 2.5,
      textPosition: "lower-third",
      textStyle: { ...subtitleStyle, fontSizeVh: 1.85, letterSpacingEm: 0.16 },
      sceneColorGrade: coldExterior,
    },
    {
      id: "ritual-prep",
      label: "흰 천으로 삼각형 준비",
      startSeconds: 110,
      endSeconds: 145,
      backgroundImage: "/images/backgrounds/ritual-floor.png",
      textureImage: "/images/textures/film-grain.svg",
      cameraMotion: { scaleFrom: 1.2, scaleTo: 1.04, xFrom: -1.5, xTo: 0, yFrom: 2.2, yTo: 0, blurFrom: 0.6, blurTo: 0 },
      transitionType: "fade-black",
      transitionDuration: 2.5,
      textPosition: "none",
      textStyle: subtitleStyle,
      sceneColorGrade: ritualNight,
    },
    {
      id: "inside-triangle",
      label: "삼각형 안에 서기",
      startSeconds: 145,
      endSeconds: 160,
      backgroundImage: "/images/backgrounds/ritual-floor.png",
      textureImage: "/images/textures/film-grain.svg",
      cameraMotion: { scaleFrom: 1.04, scaleTo: 1.015, xFrom: 0, xTo: 0.2, yFrom: 0, yTo: -0.2, blurFrom: 0, blurTo: 0.15 },
      transitionType: "dissolve",
      transitionDuration: 2,
      textPosition: "none",
      textStyle: subtitleStyle,
      sceneColorGrade: ritualNight,
    },
    {
      id: "threshold-spell",
      label: "경계가 흔들리는 순간",
      startSeconds: SCENE_2_TIMING.start,
      endSeconds: SCENE_2_TIMING.end,
      backgroundImage: SCENE_2_ASSETS.background,
      characterImage: SCENE_2_ASSETS.boyStanding,
      textureImage: "/images/textures/film-grain.svg",
      cameraMotion: { scaleFrom: 1, scaleTo: 1, xFrom: 0, xTo: 0, yFrom: 0, yTo: 0, blurFrom: 0.8, blurTo: 0 },
      transitionType: "dissolve",
      transitionDuration: 2.6,
      textPosition: "dialogue",
      textStyle: { ...subtitleStyle, fontSizeVh: 1.7, letterSpacingEm: 0.045, maxWidthVw: 58 },
      sceneColorGrade: thresholdNight,
    },
    {
      id: "first-sign-morning",
      label: "평범한 아침",
      startSeconds: SCENE_3_TIMING.start,
      endSeconds: SCENE_3_TIMING.morningEnd,
      backgroundImage: SCENE_3_ASSETS.morningRoom,
      textureImage: "/images/textures/film-grain.svg",
      cameraMotion: { scaleFrom: 1.01, scaleTo: 1.055, xFrom: 0.2, xTo: -0.8, yFrom: 0, yTo: -0.35, blurFrom: 0.8, blurTo: 0 },
      transitionType: "fade-black",
      transitionDuration: 4,
      textPosition: "lower-third",
      textStyle: { ...subtitleStyle, fontSizeVh: 1.4, letterSpacingEm: 0.34, maxWidthVw: 52 },
      sceneColorGrade: morningWarmth,
    },
    {
      id: "first-sign-door-approach",
      label: "문으로 다가감",
      startSeconds: SCENE_3_TIMING.morningEnd,
      endSeconds: SCENE_3_TIMING.doorApproachEnd,
      backgroundImage: SCENE_3_ASSETS.morningRoom,
      textureImage: "/images/textures/film-grain.svg",
      cameraMotion: { scaleFrom: 1.055, scaleTo: 1.17, xFrom: -0.8, xTo: -6.2, yFrom: -0.35, yTo: 0.15, blurFrom: 0, blurTo: 0.3 },
      transitionType: "dissolve",
      transitionDuration: 0.8,
      textPosition: "none",
      textStyle: subtitleStyle,
      sceneColorGrade: morningWarmth,
    },
    {
      id: "first-sign-handle",
      label: "부서지는 문고리",
      startSeconds: SCENE_3_TIMING.doorApproachEnd,
      endSeconds: SCENE_3_TIMING.handleEnd,
      backgroundImage: SCENE_3_ASSETS.doorHandleIntact,
      textureImage: "/images/textures/film-grain.svg",
      cameraMotion: { scaleFrom: 1.015, scaleTo: 1.065, xFrom: 0, xTo: -0.7, yFrom: 0, yTo: 0.25, blurFrom: 1.8, blurTo: 0 },
      transitionType: "rack-focus",
      transitionDuration: 1.7,
      textPosition: "none",
      textStyle: subtitleStyle,
      sceneColorGrade: morningWarmth,
    },
    {
      id: "first-sign-aftermath",
      label: "파손을 확인함",
      startSeconds: SCENE_3_TIMING.handleEnd,
      endSeconds: SCENE_3_TIMING.aftermathEnd,
      backgroundImage: SCENE_3_ASSETS.doorHandleBroken,
      textureImage: "/images/textures/film-grain.svg",
      cameraMotion: { scaleFrom: 1.06, scaleTo: 1.015, xFrom: -0.7, xTo: 0.15, yFrom: 0.25, yTo: 0, blurFrom: 0.2, blurTo: 0.65 },
      transitionType: "dissolve",
      transitionDuration: 0.18,
      textPosition: "none",
      textStyle: subtitleStyle,
      sceneColorGrade: unsettledMorning,
    },
    {
      id: "first-sign-stone",
      label: "작은 돌",
      startSeconds: SCENE_3_TIMING.stoneStart,
      endSeconds: SCENE_3_TIMING.stoneEnd,
      backgroundImage: SCENE_3_ASSETS.morningGarden,
      textureImage: "/images/textures/film-grain.svg",
      cameraMotion: { scaleFrom: 1.015, scaleTo: 1.075, xFrom: 0.4, xTo: -0.9, yFrom: 0.3, yTo: -0.15, blurFrom: 1.1, blurTo: 0 },
      transitionType: "rack-focus",
      transitionDuration: 2.5,
      textPosition: "none",
      textStyle: subtitleStyle,
      sceneColorGrade: unsettledMorning,
    },
    {
      id: "first-sign-flower",
      label: "꽃의 반응",
      startSeconds: SCENE_3_TIMING.flowerStart,
      endSeconds: SCENE_3_TIMING.flowerEnd,
      backgroundImage: SCENE_3_ASSETS.morningGarden,
      textureImage: "/images/textures/film-grain.svg",
      cameraMotion: { scaleFrom: 1.07, scaleTo: 1.125, xFrom: -0.9, xTo: 1.25, yFrom: -0.15, yTo: -0.45, blurFrom: 0.35, blurTo: 0 },
      transitionType: "dissolve",
      transitionDuration: 1.6,
      textPosition: "none",
      textStyle: subtitleStyle,
      sceneColorGrade: unsettledMorning,
    },
    {
      id: "first-sign-anxious",
      label: "처음 느끼는 불안",
      startSeconds: SCENE_3_TIMING.anxiousStart,
      endSeconds: SCENE_3_TIMING.end,
      backgroundImage: SCENE_3_ASSETS.anxiousBoy,
      textureImage: "/images/textures/film-grain.svg",
      cameraMotion: { scaleFrom: 1.005, scaleTo: 1.07, xFrom: 0, xTo: 0.5, yFrom: 0, yTo: -0.2, blurFrom: 0.9, blurTo: 0.1 },
      transitionType: "rack-focus",
      transitionDuration: 2.8,
      textPosition: "none",
      textStyle: subtitleStyle,
      sceneColorGrade: anxiousMorning,
    },
  ],
  textCues: [
    { id: "line-time", group: "letter", text: "October 31. 10:00 PM.", startSeconds: 52, endSeconds: 55.3, paperYPercent: 23 },
    { id: "line-cloth", group: "letter", text: "Make a triangle with white cloth.", startSeconds: 56.1, endSeconds: 59.5, paperYPercent: 37 },
    { id: "line-stand", group: "letter", text: "Stand inside.", startSeconds: 60.4, endSeconds: 63.6, paperYPercent: 50 },
    { id: "line-speak", group: "letter", text: "Speak the words that open the door.", startSeconds: 64.4, endSeconds: 67.8, paperYPercent: 64 },
    { id: "line-open", group: "letter", text: "Open the door.", startSeconds: 68.6, endSeconds: 71.8, paperYPercent: 77, emphasis: true },
    { id: "date-card", group: "intertitle", text: "October 31", startSeconds: 103.2, endSeconds: 105.3 },
    { id: "time-card", group: "intertitle", text: "9:58 PM", startSeconds: 105.7, endSeconds: 107.8, emphasis: true },
    {
      id: "spell-alohomora",
      group: "dialogue",
      text: "Alohomora.",
      startSeconds: SCENE_2_TIMING.spellStart,
      endSeconds: SCENE_2_TIMING.spellEnd,
    },
    {
      id: "aside-joke",
      group: "dialogue",
      text: "역시 장난이었네...",
      startSeconds: SCENE_2_TIMING.asideStart,
      endSeconds: SCENE_2_TIMING.asideEnd,
    },
    {
      id: "first-sign-title",
      group: "intertitle",
      text: "THE FIRST SIGN",
      startSeconds: SCENE_3_TIMING.start + 2.8,
      endSeconds: SCENE_3_TIMING.start + 7.4,
    },
  ],
  audioCues: [
    {
      id: "scene-2-night-ambience",
      source: "/audio/scene-2/halloween-night.mp3",
      startSeconds: SCENE_2_TIMING.start,
      endSeconds: SCENE_2_TIMING.end,
      gain: 0.28,
      fadeInSeconds: 2.8,
      fadeOutSeconds: 2,
      loop: true,
    },
    {
      id: "scene-2-inhale",
      source: "/audio/scene-2/boy-inhale.mp3",
      startSeconds: SCENE_2_TIMING.inhaleStart,
      endSeconds: SCENE_2_TIMING.spellStart,
      gain: 0.38,
      fadeInSeconds: 0.35,
      fadeOutSeconds: 0.3,
    },
    {
      id: "scene-2-alohomora",
      source: "/audio/scene-2/alohomora.mp3",
      startSeconds: SCENE_2_TIMING.spellStart,
      endSeconds: SCENE_2_TIMING.spellEnd + 0.35,
      gain: 0.68,
      fadeInSeconds: 0.08,
      fadeOutSeconds: 0.22,
    },
    {
      id: "scene-2-low-drone",
      source: "/audio/scene-2/threshold-drone.mp3",
      startSeconds: SCENE_2_TIMING.responseStart,
      endSeconds: SCENE_2_TIMING.end,
      gain: 0.16,
      fadeInSeconds: 4.5,
      fadeOutSeconds: 2.5,
      loop: true,
    },
    {
      id: "scene-2-cloth-wind",
      source: "/audio/scene-2/cloth-wind.mp3",
      startSeconds: SCENE_2_TIMING.responseStart,
      endSeconds: SCENE_2_TIMING.responseEnd + 1.6,
      gain: 0.25,
      fadeInSeconds: 0.45,
      fadeOutSeconds: 1.3,
    },
    {
      id: "scene-2-aside",
      source: "/audio/scene-2/just-a-joke.mp3",
      startSeconds: SCENE_2_TIMING.asideStart,
      endSeconds: SCENE_2_TIMING.asideEnd + 0.25,
      gain: 0.58,
      fadeInSeconds: 0.08,
      fadeOutSeconds: 0.3,
    },
    {
      id: "scene-2-footsteps",
      source: "/audio/scene-2/footsteps.mp3",
      startSeconds: SCENE_2_TIMING.exitStart,
      endSeconds: SCENE_2_TIMING.exitEnd,
      gain: 0.25,
      fadeInSeconds: 0.5,
      fadeOutSeconds: 1,
    },
    {
      id: "scene-3-morning-room",
      source: "/audio/scene-3/morning-room.mp3",
      startSeconds: SCENE_3_TIMING.start,
      endSeconds: SCENE_3_TIMING.aftermathEnd,
      gain: 0.24,
      fadeInSeconds: 3.5,
      fadeOutSeconds: 2.5,
      loop: true,
    },
    {
      id: "scene-3-distant-birds",
      source: "/audio/scene-3/distant-birds.mp3",
      startSeconds: SCENE_3_TIMING.start + 1,
      endSeconds: SCENE_3_TIMING.doorApproachEnd,
      gain: 0.2,
      fadeInSeconds: 2.5,
      fadeOutSeconds: 2.2,
      loop: true,
    },
    {
      id: "scene-3-handle-strain",
      source: "/audio/scene-3/handle-strain.mp3",
      startSeconds: SCENE_3_TIMING.handleTouch,
      endSeconds: SCENE_3_TIMING.handleBreak + 0.12,
      gain: 0.34,
      fadeInSeconds: 0.6,
      fadeOutSeconds: 0.12,
    },
    {
      id: "scene-3-metal-snap",
      source: "/audio/scene-3/metal-snap.mp3",
      startSeconds: SCENE_3_TIMING.handleBreak,
      endSeconds: SCENE_3_TIMING.handleBreak + 0.8,
      gain: 0.46,
      fadeInSeconds: 0.02,
      fadeOutSeconds: 0.5,
    },
    {
      id: "scene-3-garden-air",
      source: "/audio/scene-3/garden-air.mp3",
      startSeconds: SCENE_3_TIMING.stoneStart,
      endSeconds: SCENE_3_TIMING.flowerEnd,
      gain: 0.2,
      fadeInSeconds: 2.4,
      fadeOutSeconds: 1.8,
      loop: true,
    },
    {
      id: "scene-3-stone-contact",
      source: "/audio/scene-3/stone-contact.mp3",
      startSeconds: SCENE_3_TIMING.stoneMoveStart,
      endSeconds: SCENE_3_TIMING.stoneDrop + 0.9,
      gain: 0.3,
      fadeInSeconds: 0.4,
      fadeOutSeconds: 0.55,
    },
    {
      id: "scene-3-flower-rustle",
      source: "/audio/scene-3/flower-rustle.mp3",
      startSeconds: SCENE_3_TIMING.flowerBendStart,
      endSeconds: SCENE_3_TIMING.flowerRelease + 1.2,
      gain: 0.18,
      fadeInSeconds: 0.8,
      fadeOutSeconds: 1.1,
    },
    {
      id: "scene-3-anxious-breath",
      source: "/audio/scene-3/anxious-breath.mp3",
      startSeconds: SCENE_3_TIMING.anxiousStart,
      endSeconds: SCENE_3_TIMING.end,
      gain: 0.27,
      fadeInSeconds: 1.6,
      fadeOutSeconds: 1.8,
      loop: true,
    },
  ],
};

/** 향후 30분 MP4가 준비되면 PLAYER_CONFIG.sceneMarkers로 교체할 목록입니다. */
export const FULL_SHOW_SCENE_MARKERS: SceneMarker[] = [
  { id: "prologue", label: "프롤로그", timeSeconds: 0 },
  { id: "letter", label: "편지", timeSeconds: 80 },
  { id: "triangle", label: "삼각형 의식", timeSeconds: 190 },
  { id: "magic", label: "마법 발현", timeSeconds: 300 },
  { id: "mirror", label: "거울", timeSeconds: 480 },
  { id: "contract", label: "계약", timeSeconds: 720 },
  { id: "conflict", label: "갈등", timeSeconds: 1_020 },
  { id: "battle", label: "전투", timeSeconds: 1_320 },
  { id: "ending", label: "엔딩", timeSeconds: 1_680 },
];
