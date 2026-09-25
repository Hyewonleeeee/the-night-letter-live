# The Night Letter — Cinematic Web Player

15분 공연을 위한 브라우저 기반 시네마틱 플레이어입니다. 현재 러닝타임은
`14:00`(840초)이며, 편지와 흰 천 의식부터 능력의 발현, 계약과 대가, 가족을
지키기 위한 전투, 꿈에서 깨어난 뒤 되돌아온 편지까지 한 서사로 연결됩니다.

주인공은 웰링턴 외곽에 사는 12세 소년 **Noah Leo Henry Daniel Minhyuk Kim
(MH)**입니다.

## 11월 공연용 4분 50초 예고편

12월용 14분 본편은 그대로 보존되어 있습니다. 11월 `New Music Performance`
발표용 예고편은 별도 페이지와 설정을 사용하므로 두 버전의 타임라인은 서로
영향을 주지 않습니다.

- `http://localhost:3000/trailer`: 4분 50초 예고편 단독 플레이어
- `http://localhost:3000/live-trailer`: 왼쪽 영상 + 오른쪽 라이브 코딩 공연 화면
- `https://hyewonleeeee.github.io/the-night-letter-live/`: 관람용 무음 예고편 공개 링크
- `app/config/trailerConfig.ts`: 예고편 길이, 세 챕터, 숏, 공연용 코드
- `app/components/TrailerCanvas.tsx`: 영상 레이어와 인트로·아웃트로 신호 그래픽

예고편은 공연자가 반드시 **세 번만 복사·붙여넣기**하도록 구성했습니다.

1. `COPY CHAPTER 01` → 코드 편집기에 `Cmd/Ctrl + V`
2. 첫 챕터가 끝나면 `COPY CHAPTER 02` → `Cmd/Ctrl + V`
3. 두 번째 챕터가 끝나면 `COPY CHAPTER 03` → `Cmd/Ctrl + V`

붙여넣는 즉시 해당 영상과 코드 타임라인이 시작됩니다. 코드는 한꺼번에 표시되지
않고 장면의 실제 시간에 맞춰 오른쪽 편집기에 천천히 완성됩니다. 일시정지와
재생 위치 이동도 코드 타이핑에 동기화되며, 챕터 끝에서는 영상과 코드가 함께
멈춥니다.

11월 예고편은 완전한 **무음 버전**입니다. 오디오 레이어, 음소거 버튼, 볼륨
컨트롤을 모두 제거했으며 공연 음악과 음향은 외부 연주 시스템에서 담당합니다.

### 예고편 3챕터 타임라인

- `00:00–01:10` **I · THE MARK** — 신호 인트로, 집, 편지, 손가락 삼각형
- `01:10–02:35` **II · THE FIRST SIGN** — 아침, 문고리 파손, 책의 공중부양
- `02:35–04:50` **III · THE RETURN** — 거울 속 검은 그림자가 귀 가까이 접근,
  소년의 시야가 꺼지고 빈 세면대로 전환, 다음 날 침대에서 안도, 되돌아온 편지,
  두려운 표정과 검은 화면, 5초 크레딧

인트로와 챕터 전환에는 삼각형 선, 스캔라인, 데이터 점을 절제한
TouchDesigner 계열의 신호 그래픽을 사용합니다. 마지막 크레딧은
`TO BE CONTINUED / IN NEW MUSIC PERFORMANCE / A PERFORMANCE BY HYE-JEONG`입니다.
무대 재생 중 마우스를 움직이지 않으면 플레이어 컨트롤은 2.4초 뒤 자동으로
사라집니다.

예고편 전용 교체 이미지는 `public/images/trailer`에 있습니다. 동일한 파일명과
비율로 이미지를 바꾸면 코드 수정 없이 즉시 반영됩니다. 생성 방법과 이미지별
의도는 해당 폴더의 `README.md`를 참고합니다.

## 현재 편집 방식

- `00:00–03:22`: 기존 레이어 애니매틱. 편지, 의식, “Alohomora.”와 빈
  삼각형의 여운을 보존합니다.
- `03:22–05:36`: Chapter 2의 29숏 H.264 편집본입니다.
- `05:36–08:24`: Chapter 3의 24숏 H.264 편집본입니다.
- `08:24–11:12`: Chapter 4의 22숏 H.264 편집본입니다.
- `11:12–14:00`: Chapter 5의 24숏 H.264 편집본입니다.

202초 이후에는 총 99개 숏을 사용합니다. 일반 숏은 대체로 `4–8초`이고,
서사의 전환에 필요한 마지막 홀드만 `12초`입니다. 카메라 움직임은 숏마다
1–2%의 미세한 푸시인으로 제한하고, 사건은 화면 흔들림이 아니라 와이드·
미디엄·클로즈업·소품 인서트와 상태 변화 디졸브로 보여줍니다.

MP4는 무음 영상 레이어이며 기존 웹 타임라인의 자막·음향 큐와 프레임
동기화됩니다. 재생바로 임의 위치를 탐색해도 해당 MP4의 로컬 시간이 즉시
복원됩니다. 향후 AI 생성 모션 클립을 같은 길이의 파일로 교체할 수 있습니다.

## 실행

```bash
cd "/Users/hyewon/NewPopo"
npm install
npm run dev
```

- `http://localhost:3000/player`: 영상 플레이어
- `http://localhost:3000` 또는 `/live`: 왼쪽 영상 + 오른쪽 실제 코드 입력 화면

포트가 사용 중이면 개발 서버가 `3001`, `3002` 순으로 다음 포트를 안내합니다.

## 플레이어 조작

- 재생 / 일시정지 / 정지 / 처음으로 이동
- 10초 앞·뒤 이동과 자유 탐색 재생바
- 현재 시간 / 전체 시간, 음소거, 볼륨, 전체 화면
- `Space`: 재생·일시정지
- `←`, `→`: 5초 이동
- 숫자 `1`–`5`: 챕터 바로가기
- 더블클릭: 전체 화면

## 14분 / 5챕터 타임라인

- `1` — `00:00` **I · THE INVITATION**
- `2` — `02:48` **II · THE FIRST SIGN**
- `3` — `05:36` **III · THE BARGAIN**
- `4` — `08:24` **IV · THE PRICE**
- `5` — `11:12` **V · THE RETURN**

### I · THE INVITATION — 00:00–02:48

- `00:00` 비 내리는 웰링턴 외곽 주택
- `00:12` 창문 안의 MH
- `00:24` 바람을 타고 날아온 편지
- `00:34` 편지를 집고 뒤집는 클로즈업
- `00:45` 책상 위에서 봉투를 열고 편지지를 꺼냄
- `00:52–01:12` 카메라가 편지 위를 이동하며 다섯 문장을 한 줄씩 읽음
- `01:20` 편지를 읽은 뒤 멈춘 MH
- `01:35` Halloween 밤으로 시간 이동
- `01:50` 하얀 천 세 장으로 삼각형을 준비
- `02:25` 삼각형 안에 섬

### II · THE FIRST SIGN — 02:48–05:36

- `02:51.25` “Alohomora.”
- `02:52–03:02` 천, 바람, 낮은 소리만 미세하게 반응
- `03:02` 아무 일도 없다고 생각한 MH가 삼각형을 떠남
- `03:16` 빈 삼각형 뒤를 낮은 검은 연무가 한 번 스침
- `03:22–03:36` 가족과 보내는 평범하고 따뜻한 밤
- `03:36` 다음 날 아침
- `03:42–04:02` 손이 문고리를 잡고 압력이 쌓인 뒤 금속이 파단됨
- `04:02–04:14` 부서진 문고리와 MH의 놀란 반응
- `04:14–04:32` 다음 날 당당하게 등교하지만 발밑 그림자는 보행과 어긋남
- `04:32–04:50` 사람이 없는 길에서 주차된 차가 천천히 떠오름
- `04:50–05:08` 길가 꽃의 가장자리가 설명 없이 그을리고 시듦
- `05:08–05:16` 여러 밤의 불면을 침실과 빗물 인서트로 압축
- `05:16–05:30` 욕실 거울 속 반사가 조금 늦게 어긋남
- `05:30–05:36` MH의 얼굴과 그림자가 겹치며 “He's back.”

### III · THE BARGAIN — 05:36–08:24

- `05:36–06:02` 잠든 MH와 비어 있는 문틈
- `06:02–06:28` 보이지 않는 음성이 살아 있는 그릇과 대가를 제안
- `06:28–06:56` 흰 천 삼각형 안에 달팽이를 놓고 영혼 이동을 암시
- `06:56–07:18` 깨끗한 붕대로 감긴 엄지와 편지 인서트로 첫 대가를 표현
- `07:18–07:42` 작은 몸이 불편하다는 음성과 더 큰 제물의 요구
- `07:42–08:24` 개 목걸이 인서트와 MH의 표정, 닫힌 문을 교차해 거절을 선택

달팽이와 손톱은 직접적인 위해 장면으로 표현하지 않습니다. 달팽이는 살아
있는 상태로 그대로 있고, 엄지는 붕대 이후의 결과만 보여줍니다.

### IV · THE PRICE — 08:24–11:12

- `08:24–08:42` 방에 놓인 개 목걸이
- `08:42–09:00` 비어 있는 반려견 침대와 남겨진 목걸이
- `09:00–09:28` 상실을 이해한 MH가 계약 종료를 선언
- `09:28–10:04` 따뜻한 부엌의 부모와 동생 쪽으로 비정상적인 그림자가 접근
- `10:04–10:20` MH가 가족을 지키기 위해 맞섬
- `10:20–10:52` 현실의 방이 검은 무공간으로 천천히 지워짐
- `10:52–11:12` 전투가 시작되고 암부가 화면을 좁히며 다음 챕터로 연결

반려견의 죽음은 빈 침대, 물그릇, 목걸이만으로 전달합니다. 동물의 공격이나
위해 이미지는 사용하지 않습니다.

### V · THE RETURN — 11:12–14:00

- `11:12–11:50` MH의 저항과 가족 숏을 교차
- `11:50–12:22` 마지막 주문과 검은 공간의 붕괴
- `12:22–12:40` 현실의 방으로 돌아와 잠시 안도
- `12:40–13:10` 바닥 높이의 좁은 시점이 MH의 방으로 미끄러지듯 접근
- `13:10–13:14` 시야가 닫히는 순간 꿈에서 깨어남
- `13:14–13:27` 평범한 새벽과 안도
- `13:27–13:41` 아침 식탁에서 가족에게 이상한 꿈을 이야기함
- `13:41–13:55` 엄마가 처음과 같은 삼각형 편지를 건넴
- `13:55–14:00` 의미를 읽기 어려운 MH의 표정으로 종료

## 마스터 타임라인과 자막

`app/config/playerConfig.ts`에서 다음 항목을 수정합니다.

- `FULL_STORY_TIMING`: 사건별 절대 시간
- `FIVE_CHAPTER_MARKERS`: 숫자키 1–5 시작점
- `chapterMotionClips`: 각 MP4의 경로와 시작·종료 시간
- `textCues`: 대사와 자막
- `audioCues`: 룸톤, 보코더, 효과음의 경로와 게인·페이드
- `timeline`: MP4가 없을 때 사용하는 레이어 애니매틱 폴백

편지 원문 `00:52–01:12`는 `textCues`의 `letter` 그룹에 그대로 분리되어
있습니다. 다섯 문장이 한 번에 뜨지 않고 실제 종이의 각 위치를 카메라가
차례로 읽습니다.

## 영상 렌더와 검증

```bash
npm run render:story
npm run verify:story
```

숏 길이, 크롭, 포커스 지점, 상태 변화 디졸브는
`scripts/render-story-recut.mjs`의 `chapters[].shots`에서 수정합니다. 각 챕터
합계가 지정 길이와 다르면 렌더를 시작하기 전에 중단됩니다.

```text
public/video/chapter-2/the-first-sign-recut.mp4  # 134초 / 29숏
public/video/chapter-3/the-contract-recut.mp4    # 168초 / 24숏
public/video/chapter-4/the-price-recut.mp4       # 168초 / 22숏
public/video/chapter-5/the-return-recut.mp4      # 168초 / 24숏
```

모두 `1280×720`, `24fps`, H.264이며 소리는 웹 타임라인에서 별도로 재생합니다.

## 새 핵심 이미지 교체

실제 이미지 파일은 모두 `public/images/backgrounds`에 있습니다.

- `chapter-2-family-evening.png`
- `scene-3-morning-garden-scorched.png`
- `chapter-3-mirror-shadow-black.png`
- `chapter-3-snail-offering.png`
- `chapter-3-snail-shadow.png`
- `chapter-3-thumb-payment.png`
- `chapter-4-empty-dog-bed.png`
- `chapter-4-family-threat.png`
- `chapter-5-final-spell.png`
- `chapter-5-serpent-pov.png`
- `chapter-5-breakfast-letter.png`

같은 이름의 16:9 이미지로 교체한 뒤 `npm run render:story`를 실행하면 새
플레이트가 영상에 반영됩니다. 인물 교체 시 머리, 검은 니트, 키, 렌즈 높이와
광원 방향을 기존 이미지와 맞추는 것이 중요합니다.

거울 속 형상은 `public/images/textures/mirror-apparition-shadow-layer-black.png`의
표면광과 의상 질감을 제거한 완전한 검은 그림자 실루엣을 거울 플레이트에 합성한 것입니다. 형상의 크기나 농도를 바꿀 때는
`scripts/render-story-recut.mjs`의 `mirrorShadow` 플레이트를 교체한 뒤 Chapter 2를
다시 렌더합니다. 예전 테스트용 작은 돌 장면은 최종 이야기에서 제거되었습니다.

## 완성 MP4 한 파일로 교체

최종 영상을 `public/video/performance-film.mp4`에 넣고
`PLAYER_CONFIG.renderMode`를 `"video"`로 변경하면 동일한 플레이어 컨트롤로
재생합니다. `renderMode: "animation"`은 현재의 하이브리드 타임라인 모드입니다.

## 실시간 라이브 코딩 데스크

`/live`는 왼쪽 플레이어와 오른쪽 실제 코드 편집기를 한 화면에 표시합니다.

### AUTO TYPE 공연 방식

1. 오른쪽 위의 `AUTO TYPE`을 선택합니다.
2. `CHAPTER 01–05` 중 하나를 선택합니다.
3. `PERFORM CHAPTER`를 누릅니다.

선택한 챕터의 영상과 앰비언스가 즉시 시작되고, 오른쪽에는 전체 코드가 한꺼번에
나타나지 않습니다. 선언부가 먼저 입력된 뒤 각 `.at()` 큐가 실제 장면 직전에
자동으로 타이핑됩니다. 큐 사이에는 커서가 기다리며, 편집기는 현재 입력 위치까지
자동 스크롤됩니다. 왼쪽 영상을 일시정지하거나 재생바로 이동하면 코드도 같은
시간으로 정지하거나 이동합니다. 챕터 마지막에는 `.run()`까지 완성되고 영상은
마지막 프레임에서 멈춥니다.

전체 챕터 코드를 직접 복사해 `AUTO TYPE` 편집기에 붙여 넣어도 검사 후 곧바로 같은
공연이 시작됩니다. 따라서 무대에서는 챕터 버튼 방식과 코드 복사·붙여넣기 방식 중
하나만 선택하면 됩니다. 직접 한 줄씩 실행하려면 언제든 `MANUAL`로 돌아갑니다.

- `Cmd/Ctrl + Enter`: 현재 줄 또는 선택 영역 실행
- `Cmd/Ctrl + Shift + Enter`: 붙여 넣은 챕터 전체 실행
- `CHAPTER 01–05`: 검증된 각 챕터 코드를 편집기에 불러오기
- `RUN LINE`, `RUN CHAPTER`, `RESET FRAME`, `CLEAR`, `FULL DESK`

각 챕터 버튼을 누른 뒤 `RUN CHAPTER`를 실행하면 해당 구간 시작점으로 이동하고,
구간의 마지막 프레임에서 자동으로 멈춥니다. 경계는 `00:00 / 03:22 / 05:36 /
08:24 / 11:12 / 14:00`입니다. 코드 전체를 먼저 검사하므로 오타가 있으면 영상이나
앰비언스가 일부만 실행되지 않습니다. 다섯 개의 전체 복사 코드는
`app/config/livePerformanceChapters.ts`의 `LIVE_CHAPTER_SOURCES`에 있습니다.

```ts
// THE NIGHT LETTER / CHAPTER 01
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

invitation.run();
```

실제 Chapter 1 앰비언스는 `public/audio/chapter-1`의 로컬 MP3 레이어를 사용합니다.
집 밖의 바람에서 방 안의 먹먹한 공기로 크로스페이드되고, 00:24 편지는 파일 자체에
기록된 좌→우 패닝으로 지나갑니다. 00:34부터는 봉투를 만지고 여는 종이 마찰음,
00:52부터는 편지의 다섯 문장 노출 시간에 맞춘 절제된 타닥거림이 이어집니다.
01:18–01:52 시간 전환과 의식 준비도 서로 겹쳐 페이드되며, 주문 직후에는 기존의
저음 드론이 들어옵니다. 공연 시작 전에 왼쪽 플레이어의 재생 버튼을 한 번 눌렀다가
정지하면 브라우저의 오디오 자동재생 잠금을 확실히 해제할 수 있습니다.

전체 공연 사운드를 다시 생성하려면 `npm run render:show-audio`를 실행합니다.
교체 파일명과 정확한 길이는 `public/audio/chapter-1`부터 `chapter-5`까지 각 README에
정리되어 있습니다.

짧은 화면 효과 명령은 기존 방식으로 계속 실행할 수 있습니다.

```ts
camera.push(0.018, 8);
fog.opacity(0.055, 7);
wind.amount(0.12, 5);
light.cool(0.035, 6);
grain.amount(0.012, 4);
reset(1.8);
```

## 품질 검사

```bash
npm run typecheck
npm run lint
npm run test
npm run build:pages
npm run verify:story
```

프로젝터 점검 시에는 컨트롤을 숨긴 전체 화면에서 암부, 자막 대비, 챕터 전환,
달팽이·목걸이·편지 인서트의 가독성을 확인합니다.
