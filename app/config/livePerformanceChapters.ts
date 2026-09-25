export type LivePerformanceChapter = {
  id: string;
  title: string;
  startSeconds: number;
  endSeconds: number;
};

export const LIVE_PERFORMANCE_CHAPTERS = {
  "01_invitation": {
    id: "01_invitation",
    title: "I · THE INVITATION",
    startSeconds: 0,
    endSeconds: 202,
  },
  "02_first_sign": {
    id: "02_first_sign",
    title: "II · THE FIRST SIGN",
    startSeconds: 202,
    endSeconds: 336,
  },
  "03_bargain": {
    id: "03_bargain",
    title: "III · THE BARGAIN",
    startSeconds: 336,
    endSeconds: 504,
  },
  "04_price": {
    id: "04_price",
    title: "IV · THE PRICE",
    startSeconds: 504,
    endSeconds: 672,
  },
  "05_return": {
    id: "05_return",
    title: "V · THE RETURN",
    startSeconds: 672,
    endSeconds: 840,
  },
} as const satisfies Record<string, LivePerformanceChapter>;

export type LivePerformanceChapterId = keyof typeof LIVE_PERFORMANCE_CHAPTERS;

export const LIVE_CHAPTER_FRAME_RATE = 24;

export function getLiveChapterHoldTime(chapterId: LivePerformanceChapterId) {
  const chapter = LIVE_PERFORMANCE_CHAPTERS[chapterId];
  return Math.max(chapter.startSeconds, chapter.endSeconds - 1 / LIVE_CHAPTER_FRAME_RATE);
}

export const CHAPTER_ONE_LIVE_SOURCE = `// THE NIGHT LETTER / CHAPTER 01
const invitation = chapter("01_invitation");

invitation.at(0).shot("wellington_house");
invitation.at(0).ambience("exterior_wind", 0.46, -0.12);
invitation.at(12).shot("boy_at_window");
invitation.at(12).ambience("interior_room", 0.28, 0.06);

invitation.at(24).prop("letter").enter("wind_curve");
invitation.at(24).ambience("letter_whoosh", 0.72, 0); // L -> R
invitation.at(34).ambience("paper_close", 0.52, 0.08);
invitation.at(45).shot("letter_open");
invitation.at(52).ambience("letter_taps", 0.46, -0.04);
invitation.at(80).transition("next_night");
invitation.at(80).ambience("time_shift", 0.34, 0);

invitation.at(110).ritual("white_triangle");
invitation.at(110).ambience("ritual_air", 0.3, 0);
invitation.at(145).character("boy").enterTriangle();

invitation.at(171.25).speak("Alohomora");
invitation.at(172.35).ambience("threshold_drone", 0.22, 0);
invitation.at(184.8).shot("empty_triangle");
invitation.at(198).fade("black", 4);

invitation.run();`;

export const CHAPTER_TWO_LIVE_SOURCE = `// THE NIGHT LETTER / CHAPTER 02
const firstSign = chapter("02_first_sign");

firstSign.at(0).shot("family_evening");
firstSign.at(0).ambience("domestic_room", 0.24, -0.06);
firstSign.at(14).transition("next_morning");
firstSign.at(14).shot("morning_room");

firstSign.at(24).shot("handle_approach");
firstSign.at(35).ambience("handle_metal", 0.58, 0.12);
firstSign.at(38).shot("handle_break");

firstSign.at(52).shot("school_walk");
firstSign.at(52).ambience("morning_street", 0.3, 0.08);
firstSign.at(70).shot("car_lift");
firstSign.at(88).shot("flower_scorch");

firstSign.at(106).shot("sleepless_nights");
firstSign.at(106).ambience("night_rain", 0.24, -0.1);
firstSign.at(114).shot("bathroom_mirror");
firstSign.at(114).ambience("bathroom_hum", 0.28, 0);
firstSign.at(123).shot("shadow_reflection");
firstSign.at(128).speak("He's back.");
firstSign.at(132).fade("black", 2);

firstSign.run();`;

export const CHAPTER_THREE_LIVE_SOURCE = `// THE NIGHT LETTER / CHAPTER 03
const bargain = chapter("03_bargain");

bargain.at(0).shot("sleeping_room");
bargain.at(0).ambience("contract_night", 0.22, -0.08);
bargain.at(26).shot("shadow_approach");
bargain.at(26).ambience("shadow_whisper", 0.48, 0.15);
bargain.at(26).speak("Give me a living vessel.");
bargain.at(38).speak("I can give you power.");

bargain.at(48).ambience("offering_air", 0.24, 0);
bargain.at(52).shot("living_offering");
bargain.at(66).shot("soul_transfer");
bargain.at(80).shot("thumb_payment");
bargain.at(102).shot("larger_price");

bargain.at(135).speak("The snail is too small.");
bargain.at(146).speak("Bring me something larger.");
bargain.at(159).shot("refusal");
bargain.at(159).speak("I won't.");
bargain.at(166).fade("black", 2);

bargain.run();`;

export const CHAPTER_FOUR_LIVE_SOURCE = `// THE NIGHT LETTER / CHAPTER 04
const price = chapter("04_price");

price.at(0).shot("empty_dog_bed");
price.at(0).ambience("consequence_room", 0.22, -0.04);
price.at(16).ambience("loss_rumble", 0.26, 0);
price.at(24).shot("loss_reveal");
price.at(24).speak("You should have listened.");

price.at(43).shot("contract_break");
price.at(47).speak("The contract is over.");
price.at(60).ambience("family_shadow", 0.23, 0.06);
price.at(64).shot("family_threat");
price.at(77).speak("They are next.");

price.at(100).shot("boy_stands_ground");
price.at(113).speak("Stay away from them.");
price.at(116).transition("void");
price.at(132).ambience("shadow_command", 0.46, -0.14);
price.at(132).shot("battle_begins");
price.at(166).fade("black", 2);

price.run();`;

export const CHAPTER_FIVE_LIVE_SOURCE = `// THE NIGHT LETTER / CHAPTER 05
const returnFromDark = chapter("05_return");

returnFromDark.at(0).shot("void_battle");
returnFromDark.at(0).ambience("void_pressure", 0.24, 0);
returnFromDark.at(38).shot("final_spell");
returnFromDark.at(38).ambience("final_spell_surge", 0.42, 0);
returnFromDark.at(47).speak("Avada Kedavra.");
returnFromDark.at(62).shot("darkness_breaks");

returnFromDark.at(84).shot("serpent_approach");
returnFromDark.at(84).ambience("serpent_floor", 0.32, 0.12);
returnFromDark.at(114).transition("dream_wake");
returnFromDark.at(114).shot("dream_wake");
returnFromDark.at(114).ambience("dawn_room", 0.25, -0.04);

returnFromDark.at(135).shot("breakfast");
returnFromDark.at(141).speak("I had the strangest dream.");
returnFromDark.at(149).shot("letter_returns");
returnFromDark.at(149).ambience("letter_slide", 0.48, -0.08);
returnFromDark.at(163).shot("ambiguous_look");
returnFromDark.at(166).fade("black", 2);

returnFromDark.run();`;

export const LIVE_CHAPTER_SOURCES = {
  "01_invitation": CHAPTER_ONE_LIVE_SOURCE,
  "02_first_sign": CHAPTER_TWO_LIVE_SOURCE,
  "03_bargain": CHAPTER_THREE_LIVE_SOURCE,
  "04_price": CHAPTER_FOUR_LIVE_SOURCE,
  "05_return": CHAPTER_FIVE_LIVE_SOURCE,
} as const satisfies Record<LivePerformanceChapterId, string>;

export const LIVE_AMBIENCE_CUE_IDS = {
  exterior_wind: "chapter-1-exterior-wind",
  interior_room: "chapter-1-interior-room",
  letter_whoosh: "chapter-1-letter-whoosh",
  paper_close: "chapter-1-paper-close",
  letter_taps: "chapter-1-letter-taps",
  time_shift: "chapter-1-time-shift",
  ritual_air: "chapter-1-ritual-air",
  threshold_drone: "chapter-1-threshold-drone",
  domestic_room: "chapter-2-domestic-room",
  handle_metal: "chapter-2-handle-metal",
  morning_street: "chapter-2-morning-street",
  night_rain: "chapter-2-night-rain",
  bathroom_hum: "chapter-2-bathroom-hum",
  contract_night: "chapter-3-contract-night",
  shadow_whisper: "chapter-3-shadow-whisper",
  offering_air: "chapter-3-offering-air",
  consequence_room: "chapter-4-consequence-room",
  loss_rumble: "chapter-4-loss-rumble",
  family_shadow: "chapter-4-family-shadow",
  shadow_command: "chapter-4-shadow-command",
  void_pressure: "chapter-5-void-pressure",
  final_spell_surge: "chapter-5-final-spell-surge",
  serpent_floor: "chapter-5-serpent-floor",
  dawn_room: "chapter-5-dawn-room",
  letter_slide: "chapter-5-letter-slide",
} as const;

export function getLiveAmbienceCueId(label: string) {
  return (LIVE_AMBIENCE_CUE_IDS as Readonly<Record<string, string>>)[label];
}
