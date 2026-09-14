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

const sterileBathroom: SceneColorGrade = {
  brightness: 0.92,
  contrast: 1.08,
  saturation: 0.64,
  temperature: "rgba(42, 64, 70, 0.12)",
  shadow: "rgba(0, 4, 6, 0.15)",
};

const midnightBedroom: SceneColorGrade = {
  brightness: 0.95,
  contrast: 1.08,
  saturation: 0.6,
  temperature: "rgba(24, 42, 56, 0.16)",
  shadow: "rgba(0, 2, 5, 0.18)",
};

const borrowedDaylight: SceneColorGrade = {
  brightness: 0.96,
  contrast: 1.07,
  saturation: 0.72,
  temperature: "rgba(99, 86, 64, 0.04)",
  shadow: "rgba(13, 15, 16, 0.15)",
};

const drainedRoad: SceneColorGrade = {
  brightness: 0.94,
  contrast: 1.08,
  saturation: 0.58,
  temperature: "rgba(38, 55, 61, 0.11)",
  shadow: "rgba(3, 6, 7, 0.16)",
};

const commandDusk: SceneColorGrade = {
  brightness: 1.08,
  contrast: 1.08,
  saturation: 0.54,
  temperature: "rgba(45, 49, 52, 0.08)",
  shadow: "rgba(0, 1, 2, 0.12)",
};

const cosmicVoid: SceneColorGrade = {
  brightness: 1.2,
  contrast: 1.05,
  saturation: 0.54,
  temperature: "rgba(18, 31, 43, 0.15)",
  shadow: "rgba(0, 0, 0, 0.08)",
};

const dawnReturn: SceneColorGrade = {
  brightness: 0.92,
  contrast: 1.08,
  saturation: 0.62,
  temperature: "rgba(82, 73, 61, 0.035)",
  shadow: "rgba(6, 9, 11, 0.2)",
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
 * 후반부는 완성 이미지를 교체해도 타임라인을 고치지 않도록 모든 플레이트를
 * 한 객체에 모읍니다. 16:9 PNG/WebP/JPG를 같은 경로에 덮어쓰면 됩니다.
 */
export const LATER_STORY_ASSETS = {
  bathroomNormal: "/images/backgrounds/chapter-3-mirror-normal.png",
  bathroomShadow: "/images/backgrounds/chapter-3-mirror-shadow.png",
  sleepingRoom: "/images/backgrounds/chapter-3-bedroom-shadow.png",
  schoolWalk: "/images/backgrounds/chapter-3-school-shadow.png",
  roadGrounded: "/images/backgrounds/chapter-4-road-car-grounded.png",
  roadLifted: "/images/backgrounds/chapter-4-road-car-lifted.png",
  confrontation: "/images/backgrounds/chapter-4-refusal.png",
  voidResistance: "/images/backgrounds/chapter-5-void-resistance.png",
  dawnRoom: SCENE_3_ASSETS.morningRoom,
  dawnFace: SCENE_3_ASSETS.anxiousBoy,
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
 * end는 기존 Scene 3의 마지막 프레임이며 후반부 타임라인은 이 값에서 이어집니다.
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
 * 04:52 이후 서사의 모든 컷 포인트입니다. 최종 프레임은 14:00에 고정합니다.
 * 향후 MP4로 교체할 때도 이 값과 sceneMarkers를 그대로 싱크 기준으로 씁니다.
 */
export const LATER_STORY_TIMING = {
  start: SCENE_3_TIMING.end,
  mirrorNormalEnd: 318,
  mirrorShadowEnd: 340,
  mirrorOverlapEnd: 360,
  sleepingEnd: 386,
  shadowApproachEnd: 420,
  firstVoiceEnd: 450,
  schoolConfidenceEnd: 482,
  schoolShadowEnd: 504,
  roadEstablishEnd: 528,
  carLiftEnd: 558,
  carUneaseEnd: 582,
  fearPivotEnd: 604,
  demandBuildEnd: 636,
  refusalEnd: 660,
  attackStartEnd: 672,
  voidDissolveEnd: 720,
  resistanceEnd: 762,
  mortalEdgeEnd: 786,
  wakeEnd: 794,
  reliefEnd: 820,
  letterRevealEnd: 832,
  end: 840,
} as const;

/** 14분 전체를 2분 48초씩 나눈 공연자용 5개 챕터입니다. */
export const FIVE_CHAPTER_MARKERS: SceneMarker[] = [
  { id: "chapter-1-invitation", label: "I · THE INVITATION", timeSeconds: 0 },
  { id: "chapter-2-first-sign", label: "II · THE FIRST SIGN", timeSeconds: 168 },
  { id: "chapter-3-shadow", label: "III · THE SHADOW", timeSeconds: 336 },
  { id: "chapter-4-price", label: "IV · THE PRICE", timeSeconds: 504 },
  { id: "chapter-5-return", label: "V · THE RETURN", timeSeconds: 672 },
];

/**
 * 현재는 다섯 챕터로 구성한 840초 레이어 애니매틱입니다. 완성 MP4를 사용할 때 renderMode만
 * "video"로 바꾸면 동일한 플레이어 컨트롤이 videoSource를 제어합니다.
 */
export const PLAYER_CONFIG: PlayerConfig = {
  title: "THE NIGHT LETTER",
  renderMode: "animation",
  durationSeconds: LATER_STORY_TIMING.end,
  videoSource: "/video/performance-film.mp4",
  animationAudioSource: "/audio/test-scene-soundtrack.mp3",
  sceneMarkers: FIVE_CHAPTER_MARKERS,
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
    {
      id: "mirror-normal",
      label: "평범한 거울",
      startSeconds: LATER_STORY_TIMING.start,
      endSeconds: LATER_STORY_TIMING.mirrorNormalEnd,
      backgroundImage: LATER_STORY_ASSETS.bathroomNormal,
      textureImage: "/images/textures/film-grain.svg",
      cameraMotion: { scaleFrom: 1.015, scaleTo: 1.065, xFrom: 0.35, xTo: -0.25, yFrom: 0.15, yTo: -0.2, blurFrom: 1.1, blurTo: 0 },
      transitionType: "fade-black",
      transitionDuration: 3.6,
      textPosition: "none",
      textStyle: subtitleStyle,
      sceneColorGrade: sterileBathroom,
    },
    {
      id: "mirror-shadow",
      label: "반사가 어긋나다",
      startSeconds: LATER_STORY_TIMING.mirrorNormalEnd,
      endSeconds: LATER_STORY_TIMING.mirrorShadowEnd,
      backgroundImage: LATER_STORY_ASSETS.bathroomShadow,
      textureImage: "/images/textures/film-grain.svg",
      cameraMotion: { scaleFrom: 1.05, scaleTo: 1.09, xFrom: -0.2, xTo: 0.32, yFrom: -0.15, yTo: -0.3, blurFrom: 2.4, blurTo: 0.25 },
      transitionType: "rack-focus",
      transitionDuration: 5.2,
      textPosition: "none",
      textStyle: subtitleStyle,
      sceneColorGrade: sterileBathroom,
    },
    {
      id: "mirror-overlap",
      label: "겹쳐진 그림자",
      startSeconds: LATER_STORY_TIMING.mirrorShadowEnd,
      endSeconds: LATER_STORY_TIMING.mirrorOverlapEnd,
      backgroundImage: LATER_STORY_ASSETS.bathroomShadow,
      textureImage: "/images/textures/film-grain.svg",
      cameraMotion: { scaleFrom: 1.09, scaleTo: 1.145, xFrom: 0.32, xTo: 0.75, yFrom: -0.3, yTo: -0.55, blurFrom: 0.35, blurTo: 0.1 },
      transitionType: "dissolve",
      transitionDuration: 2.8,
      textPosition: "none",
      textStyle: subtitleStyle,
      sceneColorGrade: sterileBathroom,
    },
    {
      id: "sleeping-room",
      label: "잠든 방",
      startSeconds: LATER_STORY_TIMING.mirrorOverlapEnd,
      endSeconds: LATER_STORY_TIMING.sleepingEnd,
      backgroundImage: LATER_STORY_ASSETS.sleepingRoom,
      textureImage: "/images/textures/film-grain.svg",
      cameraMotion: { scaleFrom: 1.01, scaleTo: 1.04, xFrom: -0.45, xTo: 0.15, yFrom: 0, yTo: -0.2, blurFrom: 1.4, blurTo: 0.2 },
      transitionType: "fade-black",
      transitionDuration: 4.2,
      textPosition: "none",
      textStyle: subtitleStyle,
      sceneColorGrade: midnightBedroom,
    },
    {
      id: "shadow-approach",
      label: "어둠이 다가오다",
      startSeconds: LATER_STORY_TIMING.sleepingEnd,
      endSeconds: LATER_STORY_TIMING.shadowApproachEnd,
      backgroundImage: LATER_STORY_ASSETS.sleepingRoom,
      textureImage: "/images/textures/film-grain.svg",
      cameraMotion: { scaleFrom: 1.035, scaleTo: 1.105, xFrom: 0.15, xTo: -0.85, yFrom: -0.2, yTo: -0.45, blurFrom: 1.7, blurTo: 0 },
      transitionType: "rack-focus",
      transitionDuration: 5.5,
      textPosition: "none",
      textStyle: subtitleStyle,
      sceneColorGrade: midnightBedroom,
    },
    {
      id: "shadow-first-voice",
      label: "첫 목소리",
      startSeconds: LATER_STORY_TIMING.shadowApproachEnd,
      endSeconds: LATER_STORY_TIMING.firstVoiceEnd,
      backgroundImage: LATER_STORY_ASSETS.sleepingRoom,
      textureImage: "/images/textures/film-grain.svg",
      cameraMotion: { scaleFrom: 1.105, scaleTo: 1.135, xFrom: -0.85, xTo: -1.15, yFrom: -0.45, yTo: -0.55, blurFrom: 0.3, blurTo: 0.55 },
      transitionType: "dissolve",
      transitionDuration: 2.8,
      textPosition: "dialogue",
      textStyle: { ...subtitleStyle, fontSizeVh: 1.6, letterSpacingEm: 0.055, maxWidthVw: 54 },
      sceneColorGrade: midnightBedroom,
    },
    {
      id: "school-confidence",
      label: "빌린 자신감",
      startSeconds: LATER_STORY_TIMING.firstVoiceEnd,
      endSeconds: LATER_STORY_TIMING.schoolConfidenceEnd,
      backgroundImage: LATER_STORY_ASSETS.schoolWalk,
      textureImage: "/images/textures/film-grain.svg",
      cameraMotion: { scaleFrom: 1.035, scaleTo: 1.075, xFrom: -1.4, xTo: 1.3, yFrom: 0, yTo: -0.15, blurFrom: 1.1, blurTo: 0 },
      transitionType: "fade-black",
      transitionDuration: 3.2,
      textPosition: "none",
      textStyle: subtitleStyle,
      sceneColorGrade: borrowedDaylight,
    },
    {
      id: "school-attached-shadow",
      label: "따라붙은 그림자",
      startSeconds: LATER_STORY_TIMING.schoolConfidenceEnd,
      endSeconds: LATER_STORY_TIMING.schoolShadowEnd,
      backgroundImage: LATER_STORY_ASSETS.schoolWalk,
      textureImage: "/images/textures/film-grain.svg",
      cameraMotion: { scaleFrom: 1.075, scaleTo: 1.12, xFrom: 1.3, xTo: 2.1, yFrom: -0.15, yTo: -0.25, blurFrom: 0.2, blurTo: 0.55 },
      transitionType: "dissolve",
      transitionDuration: 2.6,
      textPosition: "none",
      textStyle: subtitleStyle,
      sceneColorGrade: borrowedDaylight,
    },
    {
      id: "empty-road",
      label: "아무도 없는 길",
      startSeconds: LATER_STORY_TIMING.schoolShadowEnd,
      endSeconds: LATER_STORY_TIMING.roadEstablishEnd,
      backgroundImage: LATER_STORY_ASSETS.roadGrounded,
      textureImage: "/images/textures/film-grain.svg",
      cameraMotion: { scaleFrom: 1.01, scaleTo: 1.055, xFrom: 0.4, xTo: -0.45, yFrom: 0.1, yTo: -0.2, blurFrom: 1, blurTo: 0 },
      transitionType: "fade-black",
      transitionDuration: 3.4,
      textPosition: "none",
      textStyle: subtitleStyle,
      sceneColorGrade: drainedRoad,
    },
    {
      id: "car-lift",
      label: "자동차가 떠오르다",
      startSeconds: LATER_STORY_TIMING.roadEstablishEnd,
      endSeconds: LATER_STORY_TIMING.carLiftEnd,
      backgroundImage: LATER_STORY_ASSETS.roadLifted,
      textureImage: "/images/textures/film-grain.svg",
      cameraMotion: { scaleFrom: 1.045, scaleTo: 1.09, xFrom: -0.45, xTo: 0.35, yFrom: -0.15, yTo: -0.5, blurFrom: 2.2, blurTo: 0 },
      transitionType: "rack-focus",
      transitionDuration: 5.8,
      textPosition: "none",
      textStyle: subtitleStyle,
      sceneColorGrade: drainedRoad,
    },
    {
      id: "car-unease",
      label: "통제를 잃다",
      startSeconds: LATER_STORY_TIMING.carLiftEnd,
      endSeconds: LATER_STORY_TIMING.carUneaseEnd,
      backgroundImage: LATER_STORY_ASSETS.roadLifted,
      textureImage: "/images/textures/film-grain.svg",
      cameraMotion: { scaleFrom: 1.09, scaleTo: 1.125, xFrom: 0.35, xTo: 0.65, yFrom: -0.5, yTo: -0.68, blurFrom: 0, blurTo: 0.55 },
      transitionType: "dissolve",
      transitionDuration: 1.6,
      textPosition: "dialogue",
      textStyle: { ...subtitleStyle, fontSizeVh: 1.55, letterSpacingEm: 0.07, maxWidthVw: 48 },
      sceneColorGrade: drainedRoad,
    },
    {
      id: "fear-pivot",
      label: "두려움의 시작",
      startSeconds: LATER_STORY_TIMING.carUneaseEnd,
      endSeconds: LATER_STORY_TIMING.fearPivotEnd,
      backgroundImage: LATER_STORY_ASSETS.roadGrounded,
      textureImage: "/images/textures/film-grain.svg",
      cameraMotion: { scaleFrom: 1.06, scaleTo: 1.025, xFrom: 0.1, xTo: -0.35, yFrom: -0.2, yTo: 0, blurFrom: 0.2, blurTo: 1.1 },
      transitionType: "fade-black",
      transitionDuration: 3.2,
      textPosition: "none",
      textStyle: subtitleStyle,
      sceneColorGrade: commandDusk,
    },
    {
      id: "demand-build",
      label: "대가를 요구하다",
      startSeconds: LATER_STORY_TIMING.fearPivotEnd,
      endSeconds: LATER_STORY_TIMING.demandBuildEnd,
      backgroundImage: LATER_STORY_ASSETS.confrontation,
      textureImage: "/images/textures/film-grain.svg",
      cameraMotion: { scaleFrom: 1.015, scaleTo: 1.07, xFrom: 0.4, xTo: -0.65, yFrom: 0.2, yTo: -0.15, blurFrom: 1.6, blurTo: 0 },
      transitionType: "fade-black",
      transitionDuration: 3.8,
      textPosition: "none",
      textStyle: subtitleStyle,
      sceneColorGrade: commandDusk,
    },
    {
      id: "command-refusal",
      label: "명령과 거절",
      startSeconds: LATER_STORY_TIMING.demandBuildEnd,
      endSeconds: LATER_STORY_TIMING.refusalEnd,
      backgroundImage: LATER_STORY_ASSETS.confrontation,
      textureImage: "/images/textures/film-grain.svg",
      cameraMotion: { scaleFrom: 1.07, scaleTo: 1.105, xFrom: -0.65, xTo: -1.05, yFrom: -0.15, yTo: -0.35, blurFrom: 1.2, blurTo: 0.1 },
      transitionType: "rack-focus",
      transitionDuration: 3,
      textPosition: "dialogue",
      textStyle: { ...subtitleStyle, fontSizeVh: 1.58, letterSpacingEm: 0.045, maxWidthVw: 56 },
      sceneColorGrade: commandDusk,
    },
    {
      id: "attack-begins",
      label: "방이 깊이를 잃다",
      startSeconds: LATER_STORY_TIMING.refusalEnd,
      endSeconds: LATER_STORY_TIMING.attackStartEnd,
      backgroundImage: LATER_STORY_ASSETS.confrontation,
      textureImage: "/images/textures/film-grain.svg",
      cameraMotion: { scaleFrom: 1.105, scaleTo: 1.16, xFrom: -1.05, xTo: -1.45, yFrom: -0.35, yTo: -0.55, blurFrom: 0.1, blurTo: 1.4 },
      transitionType: "dissolve",
      transitionDuration: 1.8,
      textPosition: "dialogue",
      textStyle: { ...subtitleStyle, fontSizeVh: 1.55, letterSpacingEm: 0.055, maxWidthVw: 58 },
      sceneColorGrade: commandDusk,
    },
    {
      id: "void-dissolve",
      label: "검은 우주로",
      startSeconds: LATER_STORY_TIMING.attackStartEnd,
      endSeconds: LATER_STORY_TIMING.voidDissolveEnd,
      backgroundImage: LATER_STORY_ASSETS.voidResistance,
      textureImage: "/images/textures/film-grain.svg",
      cameraMotion: { scaleFrom: 1.01, scaleTo: 1.075, xFrom: 0.35, xTo: -0.5, yFrom: 0.25, yTo: -0.35, blurFrom: 3.2, blurTo: 0.35 },
      transitionType: "fade-black",
      transitionDuration: 5.8,
      textPosition: "none",
      textStyle: subtitleStyle,
      sceneColorGrade: cosmicVoid,
    },
    {
      id: "void-resistance",
      label: "필사적인 반항",
      startSeconds: LATER_STORY_TIMING.voidDissolveEnd,
      endSeconds: LATER_STORY_TIMING.resistanceEnd,
      backgroundImage: LATER_STORY_ASSETS.voidResistance,
      textureImage: "/images/textures/film-grain.svg",
      cameraMotion: { scaleFrom: 1.075, scaleTo: 1.13, xFrom: -0.5, xTo: 0.45, yFrom: -0.35, yTo: -0.5, blurFrom: 0.4, blurTo: 0.1 },
      transitionType: "dissolve",
      transitionDuration: 2.4,
      textPosition: "dialogue",
      textStyle: { ...subtitleStyle, fontSizeVh: 1.65, letterSpacingEm: 0.04, maxWidthVw: 52 },
      sceneColorGrade: cosmicVoid,
    },
    {
      id: "mortal-edge",
      label: "숨이 멎는 순간",
      startSeconds: LATER_STORY_TIMING.resistanceEnd,
      endSeconds: LATER_STORY_TIMING.mortalEdgeEnd,
      backgroundImage: LATER_STORY_ASSETS.voidResistance,
      textureImage: "/images/textures/film-grain.svg",
      cameraMotion: { scaleFrom: 1.13, scaleTo: 1.185, xFrom: 0.45, xTo: 0.72, yFrom: -0.5, yTo: -0.72, blurFrom: 0.2, blurTo: 1.6 },
      transitionType: "rack-focus",
      transitionDuration: 4.5,
      textPosition: "dialogue",
      textStyle: { ...subtitleStyle, fontSizeVh: 1.6, letterSpacingEm: 0.055, maxWidthVw: 50 },
      sceneColorGrade: cosmicVoid,
    },
    {
      id: "dream-wake",
      label: "꿈에서 깨어나다",
      startSeconds: LATER_STORY_TIMING.mortalEdgeEnd,
      endSeconds: LATER_STORY_TIMING.wakeEnd,
      backgroundImage: LATER_STORY_ASSETS.sleepingRoom,
      textureImage: "/images/textures/film-grain.svg",
      cameraMotion: { scaleFrom: 1.09, scaleTo: 1.035, xFrom: -0.55, xTo: -0.18, yFrom: -0.35, yTo: -0.05, blurFrom: 2.4, blurTo: 0 },
      transitionType: "fade-black",
      transitionDuration: 0.55,
      textPosition: "none",
      textStyle: subtitleStyle,
      sceneColorGrade: dawnReturn,
    },
    {
      id: "dawn-relief",
      label: "안도",
      startSeconds: LATER_STORY_TIMING.wakeEnd,
      endSeconds: LATER_STORY_TIMING.reliefEnd,
      backgroundImage: LATER_STORY_ASSETS.dawnFace,
      textureImage: "/images/textures/film-grain.svg",
      cameraMotion: { scaleFrom: 1.075, scaleTo: 1.045, xFrom: 0.1, xTo: -0.12, yFrom: -0.35, yTo: -0.2, blurFrom: 0.4, blurTo: 0.1 },
      transitionType: "rack-focus",
      transitionDuration: 1.35,
      textPosition: "none",
      textStyle: subtitleStyle,
      sceneColorGrade: dawnReturn,
    },
    {
      id: "letter-returns",
      label: "다시 놓인 편지",
      startSeconds: LATER_STORY_TIMING.reliefEnd,
      endSeconds: LATER_STORY_TIMING.letterRevealEnd,
      backgroundImage: LATER_STORY_ASSETS.dawnRoom,
      textureImage: "/images/textures/film-grain.svg",
      cameraMotion: { scaleFrom: 1.045, scaleTo: 1.14, xFrom: -0.12, xTo: 2.8, yFrom: -0.2, yTo: -2.8, blurFrom: 0.8, blurTo: 0 },
      transitionType: "rack-focus",
      transitionDuration: 2.8,
      textPosition: "none",
      textStyle: subtitleStyle,
      sceneColorGrade: dawnReturn,
    },
    {
      id: "ambiguous-ending",
      label: "모호한 표정",
      startSeconds: LATER_STORY_TIMING.letterRevealEnd,
      endSeconds: LATER_STORY_TIMING.end,
      backgroundImage: LATER_STORY_ASSETS.dawnFace,
      textureImage: "/images/textures/film-grain.svg",
      cameraMotion: { scaleFrom: 1.08, scaleTo: 1.12, xFrom: 0.2, xTo: 0.45, yFrom: -0.35, yTo: -0.48, blurFrom: 0.7, blurTo: 0.12 },
      transitionType: "dissolve",
      transitionDuration: 1.8,
      textPosition: "none",
      textStyle: subtitleStyle,
      sceneColorGrade: dawnReturn,
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
    {
      id: "shadow-voice-space",
      group: "dialogue",
      text: "You made a space.",
      startSeconds: 423.5,
      endSeconds: 428.5,
    },
    {
      id: "shadow-voice-follow",
      group: "dialogue",
      text: "Walk, and I will follow.",
      startSeconds: 437,
      endSeconds: 443,
    },
    {
      id: "shadow-higher",
      group: "dialogue",
      text: "Higher.",
      startSeconds: 567,
      endSeconds: 570.5,
    },
    {
      id: "shadow-demand",
      group: "dialogue",
      text: "Bring me the cat.",
      startSeconds: 638,
      endSeconds: 644,
    },
    {
      id: "shadow-price",
      group: "dialogue",
      text: "One life closes what you opened.",
      startSeconds: 646,
      endSeconds: 651.5,
    },
    {
      id: "boy-refusal",
      group: "dialogue",
      text: "No.",
      startSeconds: 654,
      endSeconds: 658.5,
      emphasis: true,
    },
    {
      id: "shadow-ultimatum",
      group: "dialogue",
      text: "It was never yours to return.",
      startSeconds: 663.5,
      endSeconds: 669.5,
    },
    {
      id: "boy-resists",
      group: "dialogue",
      text: "No.",
      startSeconds: 735,
      endSeconds: 739.5,
      emphasis: true,
    },
    {
      id: "shadow-yield",
      group: "dialogue",
      text: "Yield.",
      startSeconds: 765,
      endSeconds: 769,
    },
    {
      id: "boy-counterclaim",
      group: "dialogue",
      text: "You don't lead me.",
      startSeconds: 772,
      endSeconds: 778.5,
      emphasis: true,
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
    {
      id: "chapter-3-bathroom-room-tone",
      source: "/audio/chapter-3/bathroom-room-tone.mp3",
      startSeconds: LATER_STORY_TIMING.start,
      endSeconds: LATER_STORY_TIMING.mirrorOverlapEnd,
      gain: 0.2,
      fadeInSeconds: 2.8,
      fadeOutSeconds: 3.2,
      loop: true,
    },
    {
      id: "chapter-3-bedroom-night",
      source: "/audio/chapter-3/bedroom-night.mp3",
      startSeconds: LATER_STORY_TIMING.mirrorOverlapEnd,
      endSeconds: LATER_STORY_TIMING.firstVoiceEnd,
      gain: 0.18,
      fadeInSeconds: 4,
      fadeOutSeconds: 3,
      loop: true,
    },
    {
      id: "chapter-3-shadow-whisper",
      source: "/audio/chapter-3/shadow-whisper.mp3",
      startSeconds: LATER_STORY_TIMING.shadowApproachEnd,
      endSeconds: LATER_STORY_TIMING.firstVoiceEnd,
      gain: 0.5,
      fadeInSeconds: 0.8,
      fadeOutSeconds: 1.8,
    },
    {
      id: "chapter-3-school-street",
      source: "/audio/chapter-3/school-street.mp3",
      startSeconds: LATER_STORY_TIMING.firstVoiceEnd,
      endSeconds: LATER_STORY_TIMING.schoolShadowEnd,
      gain: 0.24,
      fadeInSeconds: 2.5,
      fadeOutSeconds: 2.5,
      loop: true,
    },
    {
      id: "chapter-4-empty-road",
      source: "/audio/chapter-4/empty-road.mp3",
      startSeconds: LATER_STORY_TIMING.schoolShadowEnd,
      endSeconds: LATER_STORY_TIMING.fearPivotEnd,
      gain: 0.23,
      fadeInSeconds: 3,
      fadeOutSeconds: 3,
      loop: true,
    },
    {
      id: "chapter-4-car-metal",
      source: "/audio/chapter-4/car-metal-strain.mp3",
      startSeconds: LATER_STORY_TIMING.roadEstablishEnd,
      endSeconds: LATER_STORY_TIMING.carUneaseEnd,
      gain: 0.32,
      fadeInSeconds: 4.5,
      fadeOutSeconds: 2,
    },
    {
      id: "chapter-4-command-room",
      source: "/audio/chapter-4/command-room.mp3",
      startSeconds: LATER_STORY_TIMING.fearPivotEnd,
      endSeconds: LATER_STORY_TIMING.attackStartEnd,
      gain: 0.18,
      fadeInSeconds: 3.5,
      fadeOutSeconds: 1.2,
      loop: true,
    },
    {
      id: "chapter-4-shadow-command",
      source: "/audio/chapter-4/shadow-command.mp3",
      startSeconds: LATER_STORY_TIMING.demandBuildEnd,
      endSeconds: LATER_STORY_TIMING.attackStartEnd,
      gain: 0.52,
      fadeInSeconds: 0.5,
      fadeOutSeconds: 1.5,
    },
    {
      id: "chapter-5-void-pressure",
      source: "/audio/chapter-5/void-pressure.mp3",
      startSeconds: LATER_STORY_TIMING.attackStartEnd,
      endSeconds: LATER_STORY_TIMING.mortalEdgeEnd,
      gain: 0.22,
      fadeInSeconds: 7,
      fadeOutSeconds: 0.5,
      loop: true,
    },
    {
      id: "chapter-5-dawn-room",
      source: "/audio/chapter-5/dawn-room.mp3",
      startSeconds: LATER_STORY_TIMING.mortalEdgeEnd,
      endSeconds: LATER_STORY_TIMING.end,
      gain: 0.21,
      fadeInSeconds: 0.2,
      fadeOutSeconds: 3,
      loop: true,
    },
  ],
};

/** MP4 교체 시에도 같은 다섯 시작점을 사용할 수 있도록 유지하는 별칭입니다. */
export const FULL_SHOW_SCENE_MARKERS: SceneMarker[] = FIVE_CHAPTER_MARKERS;
