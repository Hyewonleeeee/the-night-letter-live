# Video assets

Chapter 3의 현재 모션 편집본:

```text
chapter-3/the-shadow-motion-pass.mp4
```

이 파일은 전체 타임라인의 `05:36–08:24`에만 프레임 동기화되어 재생됩니다.
`npm run render:chapter3`으로 다시 렌더할 수 있습니다.

전체 공연을 완성 MP4 하나로 교체할 때는 아래 경로에 넣습니다.

완성된 공연 영상을 아래 경로에 넣습니다.

```text
performance-film.mp4
```

그다음 `app/config/playerConfig.ts`의 `renderMode`를 `"video"`로 변경합니다.
