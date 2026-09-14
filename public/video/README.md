# Video assets

```text
chapter-2/the-first-sign-recut.mp4  # 03:22–05:36 / 134초 / 29숏
chapter-3/the-contract-recut.mp4    # 05:36–08:24 / 168초 / 24숏
chapter-4/the-price-recut.mp4       # 08:24–11:12 / 168초 / 22숏
chapter-5/the-return-recut.mp4      # 11:12–14:00 / 168초 / 24숏
```

`npm run render:story`로 렌더하고 `npm run verify:story`로 코덱·해상도·FPS·
길이를 확인합니다. 같은 길이의 AI 생성 모션 영상으로 교체하면 웹 타임라인의
자막과 사운드 싱크가 유지됩니다.

완성된 14분 공연 영상을 한 파일로 사용할 때는 `performance-film.mp4`에 넣고
`app/config/playerConfig.ts`의 `renderMode`를 `"video"`로 바꿉니다.
