# The Night Letter — Cinematic Web Player

30분 공연용 영상을 브라우저에서 재생하기 위한 단일 페이지 플레이어입니다. 현재는 전체 공연이 아니라, 웰링턴 외곽 주택에서 의문의 편지를 발견하고 할로윈 의식을 시작한 뒤 처음으로 설명할 수 없는 힘을 경험하는 **292초 레이어 애니매틱**을 구현합니다.

이번 버전은 `03:22`부터 시작하는 **Scene 3 — “The First Sign”**까지만 추가합니다. 평범하고 따뜻한 아침에서 시작해 문고리 파손, 작은 돌과 꽃의 미세한 반응을 거쳐 `04:52` 소년의 불안한 얼굴에서 끝납니다. 볼드모트, 검은 형상, 주문 발동 또는 그 이후 장면은 Scene 3에 포함하지 않았습니다.

현재 버전에는 전체 `00:00–04:52` 구간의 Visual Quality Pass가 적용되어 있습니다. 타임라인·대사·장면 순서·플레이어 기능은 바꾸지 않고, 인물과 손이 중요한 숏은 배경과 같은 원근·광원·접촉 그림자를 가진 실사형 연속 프레임으로 교체했습니다.

기존의 `/stage`, `/control`, 복잡한 Cue 입력 창은 사용하지 않습니다. 공연용 공개 화면은 왼쪽 영상과 오른쪽 실시간 코드 편집기를 결합한 하나의 분할 화면입니다. `/player`는 이 화면의 왼쪽 영상을 재생하기 위한 내부 경로로 유지합니다.

## 실행

```bash
cd "/Users/hyewon/NewPopo"
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다. 루트 주소에서 왼쪽 영상과 오른쪽 코딩 화면이 함께 있는 공연용 분할 화면이 바로 표시됩니다.

## 실시간 라이브 코딩 데스크

루트 주소 `http://localhost:3000`과 `http://localhost:3000/live`는 동일한 공연용 단일 분할 화면을 표시합니다.

- 왼쪽: 기존 292초 시네마틱 플레이어
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
- 숫자 `1`–`9`, `0`: 주요 장면 바로가기
- 더블클릭: 전체 화면, `Escape`: 전체 화면 해제

## 292초 타임라인

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

편지와 천은 실제 종이·섬유 질감이 들어간 투명 PNG입니다. Scene 2의 소년은 실사형 투명 PNG 레이어를 사용합니다.

- `public/images/characters/boy-ritual-standing.png`
- `public/images/characters/boy-ritual-walking.png`
- `public/images/characters/boy-ritual-walking-step-b.png`

퇴장은 왼발 선행 포즈와 오른발 선행 포즈를 `0.92초` 간격으로 교차합니다. 각 포즈는 대부분의 스텝 동안 유지되고 발 디딤 직전 약 `0.13초`만 디졸브됩니다. 같은 보행 위상으로 상하 이동·좌우 체중 이동·원근 축소·접촉 그림자·문틀 마스킹이 동기화됩니다.

마지막 연무는 PNG가 아니라 `LivingMistCanvas`가 실시간으로 생성합니다. 낮고 넓은 두 개의 안개층에 저주파 밀도 변화만 적용하며, 별도의 외곽선·소용돌이·확대 효과는 사용하지 않습니다. 가장자리는 넓게 흐려지고 중심부만 조금 더 어두워진 상태로 왼쪽에서 오른쪽 어둠까지 한 방향으로 이동합니다.

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

전체 길이와 바로가기, 문장도 같은 파일의 `durationSeconds`, `sceneMarkers`, `textCues`에서 바꿉니다. `textCues.paperYPercent`는 편지 위 문장 위치와 카메라가 읽을 지점을 함께 정합니다. `FULL_SHOW_SCENE_MARKERS`에는 향후 30분 MP4용 장면 예시가 준비되어 있습니다.

Scene 2는 같은 파일의 두 객체로 분리되어 있습니다.

- `SCENE_2_ASSETS`: 방 배경, 정지 소년, 퇴장 소년, 흰 천 경로
- `SCENE_2_TIMING`: 긴장, 호흡, 주문, 반응, 정적, 대사, 퇴장, 안개, 종료 시점

연출 시간을 조정할 때는 `SCENE_2_TIMING`의 값만 변경하면 화면·대사·사운드 큐가 함께 이동합니다.

Scene 3도 같은 방식으로 분리되어 있습니다.

- `SCENE_3_ASSETS`: 아침 방, 문고리 정상/파손, 정원, 소년 클로즈업, 돌, 꽃 경로
- `SCENE_3_TIMING`: 문고리 접촉·파단, 돌의 이동·부유·낙하, 꽃의 굽힘·복원, 마지막 클로즈업 시점

`SCENE_3_TIMING`의 값을 바꾸면 화면 동작과 해당 오디오 큐가 함께 이동합니다. Scene 3의 종료값 `end`가 현재 전체 플레이어 길이입니다.

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

각 파일의 시작·종료·볼륨·페이드는 `playerConfig.ts`의 `audioCues`에서 관리합니다. 파일이 아직 없어도 화면 재생, 탐색, 일시정지는 중단되지 않습니다.

## 검사

```bash
npm run typecheck
npm run lint
npm run build
```

공연 전에는 `/player`를 전체 화면으로 열고, 컨트롤이 숨겨진 상태에서 프로젝터의 블랙 레벨과 편지 글자 대비를 최종 조정하세요.
