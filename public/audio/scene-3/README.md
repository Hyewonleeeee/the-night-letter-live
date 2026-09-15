# Scene 3 audio placeholders

`playerConfig.ts`의 Scene 3 타임라인은 아래 로컬 파일 경로를 참조합니다.
파일이 없어도 영상 타임라인과 플레이어 조작은 계속 동작합니다.

- `morning-room.mp3` — 조용한 실내 아침 공기
- `distant-birds.mp3` — 멀리서 들리는 절제된 새소리
- `handle-strain.mp3` — 오래된 금속이 눌리며 버티는 짧은 소리
- `metal-snap.mp3` — 작고 건조한 금속 파단음
- `garden-air.mp3` — 바람이 거의 없는 젖은 정원 환경음
- `anxious-breath.mp3` — 소년의 얕고 불규칙한 호흡

초기 테스트에 있던 `stone-contact.mp3`와 `flower-rustle.mp3`는 현재 타임라인에서
사용하지 않습니다. 04:14 이후는 등굣길, 자동차 상승, 그을린 꽃 순서입니다.

권장 형식은 48 kHz WAV 또는 고품질 MP3입니다. 공연용 최종 음원으로
교체할 때 파일명만 유지하면 코드 수정 없이 반영됩니다.
