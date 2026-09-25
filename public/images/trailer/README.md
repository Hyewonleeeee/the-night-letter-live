# November trailer plates

이 폴더의 이미지는 4분 50초 예고편에서만 사용합니다. 같은 파일명으로 교체하면
`app/config/trailerConfig.ts`를 수정하지 않아도 됩니다. 무대용 기준은 16:9,
최소 1920×1080, 무광 영화 색감입니다.

## Files

- `chapter-1-finger-triangle.png` — 오래된 삼각형 편지 위에서 두 손의 엄지와
  검지로 불완전한 삼각형을 만드는 밤의 클로즈업
- `chapter-2-waking-hand.png` — 평범한 아침, 침대에 앉아 자기 손을 의아하게
  바라보는 같은 12세 소년
- `chapter-2-book-levitation.png` — 소년의 한 손 아래 오래된 책 한 권만
  10–15cm 떠 있는 절제된 이상 현상
- `chapter-3-final-fear.png` — 엄마가 건넨 삼각형 편지를 든 채 두려움을
  숨기지 못하는 아침 식탁의 소년
- `chapter-3-morning-relief.png` — 악몽이 끝났다고 생각하며 침대에서 조용히
  숨을 고르는 다음 날 아침의 소년

## Generation method

OpenAI ImageGen을 사용해 기존 프로젝트의 소년, 방, 편지 이미지를 시각적
참조로 주고 생성했습니다. 공통 프롬프트는 다음 조건을 포함했습니다.

> Photorealistic live-action cinematic still, the same 12-year-old boy and dark knit
> wardrobe, restrained natural acting, Wellington domestic setting, practical light,
> subtle film grain, no magical glow, no particles, no wand, no purple fantasy effects,
> no text, no logo.

각 이미지에는 위 Files 항목의 상황과 구도를 추가했습니다. 인물을 교체할 때는
검은 니트, 짙은 갈색 머리, 나이, 광원 방향과 렌즈 높이를 다섯 이미지에서
동일하게 유지하십시오.
