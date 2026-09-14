# The Night Letter — Cinematic Web Player

15분 공연을 염두에 둔 브라우저 기반 시네마틱 플레이어입니다. 현재 편집본은 웰링턴의 편지와 흰 천 의식에서 시작해, 소년의 능력·그림자의 명령·꿈에서 깨어난 뒤 되돌아온 편지까지 이어지는 **14분(840초) 하이브리드 필름 컷**입니다. 기본 장면은 타임라인 기반 레이어 애니매틱이며, `05:36–08:24` Chapter 3은 22개 숏으로 편집한 실제 H.264 MP4를 같은 재생바 안에서 재생합니다.

전체는 공연자가 숫자키 `1`–`5`로 다룰 수 있는 다섯 챕터로 나뉘며, 각 챕터 길이는 `02:48`입니다. 영화 안의 세부 컷은 절대 시간 기반 서브 큐이므로 재생바를 임의 위치로 옮겨도 카메라, 디졸브, 자막, 오디오 슬롯이 같은 상태로 복원됩니다.

`00:00–04:52`의 기존 편집, 특히 `00:52`부터 실제 편지 위를 이동하며 한 줄씩 읽는 연출은 그대로 보존했습니다. Chapter 3은 와이드·미디엄·클로즈업·소품 인서트를 4–8초 단위로 교차하며, 한 구도가 20–40초 유지되던 슬라이드형 편집을 제거했습니다. 인물의 얼굴이나 보행을 코드로 억지로 변형하지 않고, 동일한 원본 플레이트를 영화식 리프레이밍하고 새 소품 플레이트를 결합합니다. 고양이는 목걸이와 소리로만 암시하며 위해 장면은 없습니다.

## Chapter 3 — Motion Edit

`05:36–08:24`는 `public/video/chapter-3/the-shadow-motion-pass.mp4` 한 파일로 재생됩니다.

- 총 `168초`, `22개 숏`, `1280×720`, `24fps`, H.264
- 일반 숏 `7–8초`, 마지막 전환 숏 `4–6초`
- 거울: 와이드 → 반사 미디엄 → 세면대 인서트 → 반사 변화
- 침실: 와이드 → 잠든 얼굴 → 커튼/빗물 → 문틈/바닥 → 침대와 어둠의 교차 편집
- 등굣길: 빈 거리 → 와이드 → 미디엄 → 발/젖은 노면 → 어긋난 그림자 인서트
- `06:06`, `07:30`에는 MP4 내부 암전으로 공간을 전환
- 원본 14분 레이어 타임라인은 유지하며 Chapter 3 구간에서만 무음 MP4 레이어가 프레임 동기화됨

렌더를 다시 만들 때는 다음 명령을 사용합니다.

```bash
npm run render:chapter3
```

숏 길이, 크롭, 패닝, 푸시인, 암전 위치는 `scripts/render-chapter-3.mjs`의 `shots` 배열에서 수정합니다. 배열의 총합이 `168초`가 아니면 렌더가 중단되어 전체 타임라인 싱크가 틀어지지 않습니다.

기존의 `/stage`, `/control`, 복잡한 Cue 입력 창은 사용하지 않습니다. 공연용 공개 화면은 왼쪽 영상과 오른쪽 실시간 코드 편집기를 결합한 하나의 분할 화면입니다. `/player`는 이 화면의 왼쪽 영상을 재생하기 위한 내부 경로로 유지합니다.

## 실행

```bash
cd "/Users/hyewon/NewPopo"
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다. 루트 주소에서 왼쪽 영상과 오른쪽 코딩 화면이 함께 있는 공연용 분할 화면이 바로 표시됩니다.

## GitHub Pages 공유

친구에게 공유하는 GitHub Pages 빌드는 공연용 `/player` 화면만 첫 화면에
표시합니다. 로컬 Next/vinext 앱과 Pages 정적 빌드는 서로 분리되어 있습니다.

```bash
npm run build:pages
```

`main` 브랜치에 변경이 올라오면 GitHub Actions가 자동으로 정적 플레이어를
빌드하고 `https://hyewonleeeee.github.io/the-night-letter-live/`에 배포합니다.
저장소의 **Settings → Pages → Build and deployment**에서 Source를
**GitHub Actions**로 한 번 선택하면 이후 푸시부터 자동 갱신됩니다.

## 실시간 라이브 코딩 데스크

루트 주소 `http://localhost:3000`과 `http://localhost:3000/live`는 동일한 공연용 단일 분할 화면을 표시합니다.

- 왼쪽: 14분 / 5챕터 시네마틱 플레이어
- 오른쪽: 공연자가 실제로 타이핑하는 코드 편집기
- `Cmd/Ctrl + Enter`: 현재 줄 또는 선택한 코드만 즉시 실행
- `Cmd/Ctrl + Shift + Enter`: 편집기 전체 실행
- `RUN LINE`, `RUN ALL`: 키보드와 동일한 실행 버튼
- `RESET FRAME`: 라이브 효과만 1.8초 동안 기본값으로 복귀
- `CLEAR`: 입력한 코드만 지움
- `FULL DESK`: 영상과 편집기를 함께 전체 화면으로 표시

자동 타이핑은 사용하지 않습니다. 오른쪽에 보이는 내용은 공연자가 실제로 입력한 코드이며, 실행한 줄만 왼쪽 영상에 반영됩니다. 왼쪽 영상을 한 번 클릭하면 기존 `Space`, 방향키, 숫자키 플레이어 단축키를 그대로 사용할 수 있습니다.

사용 가능한 명령은 다음과 같습니다. 첫 번째 숫자는 목표값, 두 번째 숫자는 그 값까지 변화하는 시간(초)입니다.

```ts
camera.push(0.018, 8);
fog.opacity(0.055, 7);
wind.amount(0.12, 5);
light.cool(0.035, 6);
grain.amount(0.012, 4);
reset(1.8);
```

오른쪽 편집기 아래 버튼은 명령을 자동 실행하지 않고 현재 커서 위치에 예시만 삽입합니다. 숫자를 직접 바꾼 뒤 실행할 수 있습니다. 모든 명령은 `app/lib/liveCoding.ts`의 허용 목록과 범위 검사를 통과해야 하며, 임의 JavaScript나 `eval`은 실행하지 않습니다. 잘못된 코드는 영상에 전달되지 않고 해당 줄의 오류만 표시됩니다.

왼쪽 영상은 같은 페이지의 `/player`를 사용하므로 원본 타임라인, 오디오, 탐색 기능과 향후 MP4 교체 구조가 그대로 유지됩니다.

## 플레이어 기능

- 재생 / 일시정지 / 정지 / 처음으로 이동
- 10초 앞으로·뒤로와 재생바 탐색
- 현재 시간 / 전체 시간
- 전체 화면, 음소거, 볼륨
- 장면별 바로가기
- 재생 중 컨트롤 자동 숨김
- `Space`: 재생 / 일시정지
- `←`, `→`: 5초 뒤로 / 앞으로
- 숫자 `1`–`5`: 다섯 챕터 바로가기
- 더블클릭: 전체 화면, `Escape`: 전체 화면 해제

## 14분 / 5챕터 타임라인

공연자용 챕터 시작점은 다음과 같습니다.

- `1` — `00:00` **I · THE INVITATION**
- `2` — `02:48` **II · THE FIRST SIGN**
- `3` — `05:36` **III · THE SHADOW**
- `4` — `08:24` **IV · THE PRICE**
- `5` — `11:12` **V · THE RETURN**

기존 구간:

- `00:00` 웰링턴 외곽 주택과 젖은 도로
- `00:12` 빗물 맺힌 창문과 소년 실루엣
- `00:24` 바람에 밀렸다가 불규칙한 곡선으로 날아오는 편지
- `00:34` 그림자와 컷 분할로 편지를 집고 뒤집는 클로즈업
- `00:45` 비스듬한 책상 위에서 열리는 봉투와 미끄러져 나오는 편지지
- `00:52` 카메라가 실제 편지 위를 이동하며 읽는 다섯 문장
- `01:12` 서서히 암전
- `01:20` 편지를 읽은 뒤 잠시 멈춘 소년
- `01:35` 새벽·낮을 지나 할로윈 밤으로 전환
- `01:50` 세 개의 흰 천으로 삼각형 준비
- `02:25` 삼각형 안에 서기
- `02:40` Scene 2 시작 — 낮은 정면 구도의 소년과 삼각형
- `02:45.8` 긴장한 손과 어깨가 미세하게 굳음
- `02:48.4` 숨을 들이쉼
- `02:51.25` 작은 목소리로 “Alohomora.”
- `02:52.35` 바람·천·저음·검은 안개의 미세한 반응
- `02:54.35–03:01.75` 아무 일도 일어나지 않는 7.4초의 정적
- `03:02.05` “역시 장난이었네...”
- `03:04.8–03:11.25` 소년이 삼각형과 프레임을 벗어남
- `03:16.15` 빈 프레임의 왼쪽 어둠에서 살아 있는 듯한 검은 형상이 나타났다가 약 4초 뒤 다시 사라짐
- `03:22` Scene 3 시작 — 암전 뒤 새소리가 들리는 따뜻한 아침
- `03:24.8–03:29.4` 작은 제목 “THE FIRST SIGN”
- `03:38` 소년이 문으로 다가가는 느린 카메라 이동
- `03:43.5` 낡은 황동 문고리 클로즈업
- `03:44.2–03:49.1` 실제 손이 접근하고, 손가락을 열고, 닿고, 감싸 쥔 뒤 천천히 누름
- `03:49.2–03:51.1` 과장 없이 문고리 목 부분이 파단되고 손이 지지점을 잃어 물러남
- `03:55–04:12` 소년의 그림자가 파손 부위를 확인하는 정적인 여백
- `04:12` 비가 그친 젖은 정원과 작은 돌
- `04:18.3` 돌이 흙을 조금 스치며 움직임
- `04:21.4–04:26.2` 돌이 몇 센티미터 떠올랐다가 다시 떨어짐
- `04:30` 주변 바람 없이 한 줄기의 꽃만 천천히 기울어짐
- `04:40.5` 꽃이 원래 자세로 돌아옴
- `04:43–04:52` 자신의 손을 내려다보는 소년의 불안한 얼굴에서 종료

새 후반부:

- `04:52–05:18` 평범한 욕실 거울. 소년과 반사는 아직 일치함
- `05:18–05:40` 맞은편 어둠이 반사에만 천천히 나타남
- `05:36–06:06` Chapter 3 MP4 — 거울 와이드·반사 미디엄·세면대 인서트·반사 변화
- `06:06–06:30` 침실 와이드·잠든 얼굴·커튼과 빗물 인서트
- `06:30–07:02` 문틈·바닥·침대를 교차하며 어둠의 접근을 공간 변화로 암시
- `07:02–07:30` 얼굴·눈·형체를 보여주지 않는 어둠과 보코더 음성용 정적
- `07:30–07:54` 빈 거리·와이드·미디엄으로 달라진 등교 자세를 제시
- `07:54–08:24` 발과 젖은 노면, 어긋난 그림자를 인서트해 따라붙은 존재를 암시
- `08:24–08:48` 사람이 없는 서비스 도로와 주차된 차를 넓은 숏으로 확인
- `08:48–09:18` 차가 천천히 약 30cm 떠오름. 광선이나 슈퍼히어로 포즈는 없음
- `09:18–09:42` 작은 성취감이 통제를 잃는 불안으로 바뀜
- `09:42–10:04` 차가 내려온 뒤 색과 공간감이 빠지며 공포/전쟁의 톤으로 전환
- `10:04–10:36` 저녁 방. 화면 밖 고양이는 작은 목걸이와 방울로만 암시
- `10:36–11:00` 그림자가 대가를 요구하고 소년이 짧게 거절함
- `11:00–11:12` 벽과 사물의 그림자가 분리되며 공격이 시작됨
- `11:12–12:00` 방의 가장자리가 검은 우주 같은 무공간으로 천천히 지워짐
- `12:00–12:42` 힘으로 맞서려 하지만 통하지 않고, 소년이 자신의 의지로 다시 거절함
- `12:42–13:06` 마지막 빛과 호흡이 좁아지는 위험한 순간
- `13:06–13:14` 음악 스팅어 없이 날카로운 들숨과 함께 침대의 와이드 숏으로 돌아옴
- `13:14–13:40` 평범한 새벽 룸톤 속 클로즈업에서 호흡을 가라앉히며 안도함
- `13:40–13:52` 침대 옆에 처음과 같은 편지가 놓여 있음을 발견
- `13:52–14:00` 두려움인지 다시 힘을 원하는지 읽히지 않는 표정으로 종료

현재 시간 하나로 카메라, 레이어, 오브젝트 상태를 계산하므로 재생바를 앞뒤로 움직여도 해당 프레임이 즉시 재현됩니다.

## 레이어 구조

`app/components/CinematicCanvas.tsx`는 이름을 유지하지만, 화면 전체를 단순 도형 Canvas로 그리지 않습니다. 다음 레이어를 합성하고, 안개·비·먼지만 가벼운 Canvas로 처리합니다.

1. Background — 생성형 배경 이미지와 느린 카메라 이동
2. Midground — 도로 반사, 실내 그림자, 커튼 그림자
3. Character — 배경에 결합된 실사형 소년·손 숏과 투명 인물 PNG
4. Props — 실제 광원과 접촉 그림자를 포함한 편지·봉투·흰 천 연속 프레임
5. Foreground — 초점이 흐린 가지와 창문 빗물
6. Atmosphere — 깊이별 비, 안개, 먼지
7. Light and shadow — 장면 색보정과 국부 조명
8. Text — 실제 편지 면에 맞춘 세리프 문장
9. Film finish — 레터박스, 필름 그레인, 비네트

## 에셋 폴더

```text
public/
├── images/
│   ├── backgrounds/   # 불투명 배경 PNG/JPG/WebP
│   ├── characters/    # 투명 인물 PNG 또는 SVG 실루엣
│   ├── props/         # 편지, 봉투, 문양, 의식용 천
│   └── textures/      # 가지, 빗물, 필름 그레인
├── video/             # 향후 완성 MP4
└── audio/             # 애니매틱용 사운드트랙
```

포함된 주요 배경은 다음과 같습니다.

- `public/images/backgrounds/wellington-exterior.png`
- `public/images/backgrounds/rain-window-boy-seated.png`
- `public/images/backgrounds/rain-window-boy-letter.png`
- `public/images/backgrounds/writing-desk.png`
- `public/images/backgrounds/desk-envelope-hand-01-approach.png`
- `public/images/backgrounds/desk-envelope-hand-02-lift.png`
- `public/images/backgrounds/desk-envelope-hand-03-open.png`
- `public/images/backgrounds/ritual-floor.png`
- `public/images/backgrounds/ritual-cloth-01-single.png`
- `public/images/backgrounds/ritual-cloth-02-hand.png`
- `public/images/backgrounds/ritual-cloth-03-complete.png`
- `public/images/backgrounds/scene-2-ritual-room-cloth.png`
- `public/images/backgrounds/scene-2-ritual-room-cloth-draft.png`
- `public/images/backgrounds/scene-3-morning-room.png`
- `public/images/backgrounds/scene-3-door-handle-intact.png`
- `public/images/backgrounds/scene-3-handle-hand-01-approach.png`
- `public/images/backgrounds/scene-3-handle-hand-02-contact.png`
- `public/images/backgrounds/scene-3-handle-hand-03-grip.png`
- `public/images/backgrounds/scene-3-handle-hand-04-press.png`
- `public/images/backgrounds/scene-3-handle-hand-05-recoil.png`
- `public/images/backgrounds/scene-3-door-handle-broken.png`
- `public/images/backgrounds/scene-3-morning-garden.png`
- `public/images/backgrounds/scene-3-boy-anxious.png`
- `public/images/backgrounds/chapter-3-mirror-normal.png`
- `public/images/backgrounds/chapter-3-mirror-shadow.png`
- `public/images/backgrounds/chapter-3-bedroom-shadow.png`
- `public/images/backgrounds/chapter-3-school-shadow.png`
- `public/images/backgrounds/chapter-3-mirror-sink-insert.png`
- `public/images/backgrounds/chapter-3-bedroom-curtain-insert.png`
- `public/images/backgrounds/chapter-3-bedroom-doorway-insert.png`
- `public/images/backgrounds/chapter-3-school-empty-insert.png`
- `public/images/backgrounds/chapter-3-school-feet-insert.png`
- `public/images/backgrounds/chapter-4-road-car-grounded.png`
- `public/images/backgrounds/chapter-4-road-car-lifted.png`
- `public/images/backgrounds/chapter-4-refusal.png`
- `public/images/backgrounds/chapter-5-void-resistance.png`

편지와 천은 실제 종이·섬유 질감이 들어간 투명 PNG입니다. Scene 2의 소년은 실사형 투명 PNG 레이어를 사용합니다.

- `public/images/characters/boy-ritual-standing.png`
- `public/images/characters/boy-ritual-walking.png`
- `public/images/characters/boy-ritual-walking-step-b.png`

퇴장은 왼발 선행 포즈와 오른발 선행 포즈를 `0.92초` 간격으로 교차합니다. 각 포즈는 대부분의 스텝 동안 유지되고 발 디딤 직전 약 `0.13초`만 디졸브됩니다. 같은 보행 위상으로 상하 이동·좌우 체중 이동·원근 축소·접촉 그림자·문틀 마스킹이 동기화됩니다.

마지막 연무는 PNG가 아니라 `LivingMistCanvas`가 실시간으로 생성합니다. 낮고 넓은 두 개의 안개층에 저주파 밀도 변화만 적용하며, 별도의 외곽선·소용돌이·확대 효과는 사용하지 않습니다. 가장자리는 넓게 흐려지고 중심부만 조금 더 어두워진 상태로 왼쪽에서 오른쪽 어둠까지 한 방향으로 이동합니다.

Chapter 3의 새 PNG는 모두 같은 `public/images/backgrounds` 경로의 16:9 이미지로 교체할 수 있습니다. 교체 후 `npm run render:chapter3`을 실행하면 새 플레이트가 Chapter 3 MP4에 반영됩니다. 현재 `public/audio/chapter-3/*.mp3`와 `public/audio/test-scene-soundtrack.mp3`는 브라우저 404를 방지하고 향후 사운드 싱크를 고정하기 위한 무음 플레이스홀더이므로, 같은 파일명으로 실제 룸톤·보코더·거리음을 덮어쓰면 됩니다.

Scene 3의 돌과 꽃은 투명 PNG 소품으로 분리되어 있습니다.

- `public/images/props/scene-3-small-stone.png`
- `public/images/props/scene-3-wildflower.png`

문고리는 정상·접근·접촉·그립·압력·반동·파손 프레임이 같은 카메라 구도와 조명을 공유합니다. 약 `0.3초` 디졸브로 연결되며, 손가락 위치와 손목의 압력 변화가 먼저 보인 뒤 금속이 파단됩니다. 폭발·CG 파편·마법 광원은 사용하지 않습니다. 돌과 꽃에도 오라나 파티클을 적용하지 않으며 위치·회전·접촉 그림자만 시간값으로 계산합니다.

## 이미지 교체 방법

가장 간단한 방법은 새 파일을 현재 파일과 **같은 이름**으로 덮어쓰는 것입니다. 코드 수정 없이 바로 반영됩니다.

다른 파일명을 사용할 경우 `app/config/playerConfig.ts`의 해당 장면에서 아래 경로만 변경합니다.

```ts
backgroundImage: "/images/backgrounds/my-background.webp",
characterImage: "/images/characters/my-character.png",
foregroundImage: "/images/textures/my-foreground.png",
textureImage: "/images/textures/my-grain.png",
```

편지 소품 원본은 같은 설정 파일의 `PROP_ASSETS`에서, 실사 합성 숏은 `PROLOGUE_PHOTO_ASSETS`에서 교체합니다.

```ts
export const PROP_ASSETS = {
  envelopeFront: "/images/props/envelope-front.png",
  envelopeBack: "/images/props/envelope-back.png",
  envelopeOpen: "/images/props/envelope-open.png",
  letterPaper: "/images/props/letter-paper.png",
  ritualCloth: "/images/props/white-cloth-strip.png",
};

export const PROLOGUE_PHOTO_ASSETS = {
  rainWindowBoySeated: "/images/backgrounds/rain-window-boy-seated.png",
  rainWindowBoyLetter: "/images/backgrounds/rain-window-boy-letter.png",
  deskEnvelopeApproach: "/images/backgrounds/desk-envelope-hand-01-approach.png",
  deskEnvelopeLift: "/images/backgrounds/desk-envelope-hand-02-lift.png",
  deskEnvelopeOpen: "/images/backgrounds/desk-envelope-hand-03-open.png",
  ritualClothSingle: "/images/backgrounds/ritual-cloth-01-single.png",
  ritualClothTwoSides: "/images/backgrounds/ritual-cloth-02-hand.png",
  ritualClothComplete: "/images/backgrounds/ritual-cloth-03-complete.png",
};
```

Scene 3 에셋은 `SCENE_3_ASSETS` 한 곳에서 교체합니다.

```ts
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
};
```

후반부의 영화 플레이트는 `LATER_STORY_ASSETS`에서 한 번에 교체합니다.

```ts
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
};
```

거울 두 장과 자동차 두 장은 같은 해상도·크롭·렌즈·인물 위치로 등록된 상태여야 디졸브가 실제 움직임처럼 읽힙니다. 후반부 인물과 자동차의 물리 동작은 플레이트 안에 두고, 웹에서는 카메라 이동·초점·색·암부만 조절합니다.

문고리 연속 프레임은 모두 동일한 해상도·렌즈·크롭·문고리 위치를 유지해야 전환이 흔들리지 않습니다. 새 프레임을 만들 때 손의 크기, 소매, 광원 방향도 이전 프레임과 같게 유지하세요. 돌과 꽃은 투명 배경 PNG/WebP로 준비하고 피사체 주변 여백을 현재 파일과 비슷하게 맞추면 CSS 위치값을 그대로 사용할 수 있습니다.

새 에셋은 투명 배경 PNG 또는 WebP를 권장합니다. 봉투 앞면·뒷면·열린 상태의 비율과 여백을 비슷하게 맞추면 컷 전환 때 위치가 흔들리지 않습니다. 편지지는 문구를 HTML로 올리므로 글자가 없는 원본을 사용하고, 흰 천은 한 장을 세 번 재사용하므로 충분히 긴 가로 형태로 준비합니다.

투명 인물 PNG는 캔버스를 넉넉하게 자르되, 발 또는 의자 기준점이 이미지 아래쪽에 오도록 만들면 현재 CSS 배치와 잘 맞습니다. 배경 이미지는 16:9, 최소 1920×1080을 권장합니다. 에셋은 모두 `public` 아래에 두어 오프라인에서도 로컬 경로로 읽히게 합니다.

## 장면 연출 설정

`app/config/playerConfig.ts`의 각 `timeline` 장면에서 다음 항목을 수정할 수 있습니다.

- `backgroundImage`, `characterImage`, `foregroundImage`, `textureImage`
- `cameraMotion`: 시작·종료 scale, x/y 이동, blur
- `transitionType`: `dissolve`, `rack-focus`, `fade-black`
- `transitionDuration`: 전환 길이(초)
- `textPosition`: `none`, `letter`, `paper-camera`, `lower-third`
- `textStyle`: 색, 크기, 자간, 폭, 정렬
- `sceneColorGrade`: 밝기, 대비, 채도, 색 온도, 그림자

전체 길이와 바로가기, 문장도 같은 파일의 `durationSeconds`, `sceneMarkers`, `textCues`에서 바꿉니다. `textCues.paperYPercent`는 편지 위 문장 위치와 카메라가 읽을 지점을 함께 정합니다. `FIVE_CHAPTER_MARKERS`가 숫자키 1–5의 시작점을 관리합니다.

Scene 2는 같은 파일의 두 객체로 분리되어 있습니다.

- `SCENE_2_ASSETS`: 방 배경, 정지 소년, 퇴장 소년, 흰 천 경로
- `SCENE_2_TIMING`: 긴장, 호흡, 주문, 반응, 정적, 대사, 퇴장, 안개, 종료 시점

연출 시간을 조정할 때는 `SCENE_2_TIMING`의 값만 변경하면 화면·대사·사운드 큐가 함께 이동합니다.

Scene 3도 같은 방식으로 분리되어 있습니다.

- `SCENE_3_ASSETS`: 아침 방, 문고리 정상/파손, 정원, 소년 클로즈업, 돌, 꽃 경로
- `SCENE_3_TIMING`: 문고리 접촉·파단, 돌의 이동·부유·낙하, 꽃의 굽힘·복원, 마지막 클로즈업 시점

`SCENE_3_TIMING`의 값을 바꾸면 화면 동작과 해당 오디오 큐가 함께 이동합니다.

후반부도 같은 방식으로 분리되어 있습니다.

- `LATER_STORY_ASSETS`: 거울, 침실, 등굣길, 자동차, 거절, 검은 공간, 마지막 침실 플레이트
- `LATER_STORY_TIMING`: `04:52–14:00`의 모든 서브 컷 경계
- `FIVE_CHAPTER_MARKERS`: `00:00`, `02:48`, `05:36`, `08:24`, `11:12`의 공연자용 챕터 시작점

현재 전체 플레이어 길이는 `LATER_STORY_TIMING.end`의 `840`초입니다.

## 완성 MP4로 전환

1. 완성 영상을 `public/video/performance-film.mp4`에 넣습니다.
2. `app/config/playerConfig.ts`의 `renderMode`를 `"video"`로 바꿉니다.
3. `sceneMarkers`와 전체 길이를 실제 편집본에 맞춥니다.

MP4 모드에서도 같은 재생바, 볼륨, 키보드, 전체 화면 기능을 사용합니다. 실제 영상 길이는 메타데이터에서 자동으로 읽습니다.

## 오디오

애니매틱 사운드트랙을 사용할 때 다음 경로에 파일을 넣습니다.

```text
public/audio/test-scene-soundtrack.mp3
```

파일이 없어도 화면 타임라인은 독립적으로 재생됩니다.

Scene 2의 레이어 사운드는 다음 경로를 사용합니다.

```text
public/audio/scene-2/halloween-night.mp3
public/audio/scene-2/boy-inhale.mp3
public/audio/scene-2/alohomora.mp3
public/audio/scene-2/threshold-drone.mp3
public/audio/scene-2/cloth-wind.mp3
public/audio/scene-2/just-a-joke.mp3
public/audio/scene-2/footsteps.mp3
```

Scene 3의 레이어 사운드는 다음 경로를 사용합니다.

```text
public/audio/scene-3/morning-room.mp3
public/audio/scene-3/distant-birds.mp3
public/audio/scene-3/handle-strain.mp3
public/audio/scene-3/metal-snap.mp3
public/audio/scene-3/garden-air.mp3
public/audio/scene-3/stone-contact.mp3
public/audio/scene-3/flower-rustle.mp3
public/audio/scene-3/anxious-breath.mp3
```

후반부는 다음 교체 슬롯을 사용합니다.

```text
public/audio/chapter-3/bathroom-room-tone.mp3
public/audio/chapter-3/bedroom-night.mp3
public/audio/chapter-3/shadow-whisper.mp3
public/audio/chapter-3/school-street.mp3
public/audio/chapter-4/empty-road.mp3
public/audio/chapter-4/car-metal-strain.mp3
public/audio/chapter-4/command-room.mp3
public/audio/chapter-4/shadow-command.mp3
public/audio/chapter-5/void-pressure.mp3
public/audio/chapter-5/dawn-room.mp3
```

첫 그림자 음성은 유혹에 가까운 짧은 인간 속삭임과 20–30ms 먼저 도착하는 낮은 보코더 레이어로 설계합니다. 명령 장면에서는 가공량을 줄여 의미가 더 명확해지게 하되, 특정 영화의 언어·억양·음색은 모사하지 않습니다.

각 파일의 시작·종료·볼륨·페이드는 `playerConfig.ts`의 `audioCues`에서 관리합니다. 파일이 아직 없어도 화면 재생, 탐색, 일시정지는 중단되지 않습니다.

## 검사

```bash
npm run typecheck
npm run lint
npm run build
```

공연 전에는 `/player`를 전체 화면으로 열고, 컨트롤이 숨겨진 상태에서 프로젝터의 블랙 레벨과 편지 글자 대비를 최종 조정하세요.
