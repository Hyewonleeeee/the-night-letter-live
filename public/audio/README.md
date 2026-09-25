# Audio placeholder

`test-scene-soundtrack.mp3`는 재생 클럭을 유지하기 위한 무음 마스터 트랙입니다.
실제 앰비언스는 챕터별 폴더에서 별도 레이어로 재생합니다.

```text
test-scene-soundtrack.mp3
```

Chapter 1에서 실제로 재생되는 파일은 다음과 같습니다.

```text
chapter-1/exterior-wind.mp3
chapter-1/interior-room.mp3
chapter-1/letter-whoosh.mp3
chapter-1/paper-close.mp3
chapter-1/letter-taps.mp3
chapter-1/time-shift.mp3
chapter-1/ritual-air.mp3
chapter-1/threshold-drone.mp3
```

Chapter 2–5도 각 폴더의 실제 로컬 사운드 레이어를 사용합니다. 주요 파일은 다음과
같습니다.

```text
chapter-2/domestic-room.mp3
chapter-2/handle-metal.mp3
chapter-2/morning-street.mp3
chapter-2/night-rain.mp3
chapter-2/bathroom-hum.mp3
chapter-3/contract-night.mp3
chapter-3/shadow-whisper.mp3
chapter-3/offering-air.mp3
chapter-4/consequence-room.mp3
chapter-4/loss-rumble.mp3
chapter-4/family-shadow.mp3
chapter-4/shadow-command.mp3
chapter-5/void-pressure.mp3
chapter-5/final-spell-surge.mp3
chapter-5/serpent-floor.mp3
chapter-5/dawn-room.mp3
chapter-5/letter-slide.mp3
```

경로와 재생 구간은 `app/config/playerConfig.ts`에서 변경할 수 있습니다. 파일이
없거나 디코딩에 실패해도 영상 타임라인은 계속 진행됩니다.

전체 공연 사운드를 다시 생성하려면 `npm run render:show-audio`를 실행합니다.
