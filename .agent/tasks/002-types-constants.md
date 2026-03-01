# Task 002: 타입 + 상수 + Gemini 유틸

## 목표
프로젝트 전체에서 사용할 타입, 프리셋 상수, Gemini API 유틸 생성

## 파일 3개

### 1. `src/lib/types.ts`
- `WizardStep` — 7단계 enum/union
- `UploadedImage` — { id, file, preview, angle }
- `Preset` — { id, name, prompt_template, lighting, color_grading, best_for, icon }
- `GeneratedImage` — { id, url, preset_id, original_image_id, prompt }
- `ProductInfo` — { name, category, price, target, features[], tone, channel }
- `ImageRole` — 'hero' | 'feature' | 'lifestyle' | 'comparison' | 'detail'
- `SelectedImage` — { image: GeneratedImage, role: ImageRole }
- `CopyData` — 13섹션 카피 구조 (landing-agent-team/webapp/lib/types.ts에서 복사)
- `DesignSpec` — 디자인 스펙 (landing-agent-team에서 복사)

### 2. `src/lib/presets.ts`
6종 프리셋 배열 export:
- 미니멀 스튜디오
- 라이프스타일 주방
- 라이프스타일 화장실
- 아웃도어 자연광
- 럭셔리 다크
- 플랫레이

각 프리셋의 prompt_template, lighting, color_grading, best_for는 작업지시서 참고:
`/Users/labo/clawd/딱포토-AI상세페이지-클코작업지시서.md`

### 3. `src/lib/gemini.ts`
`/Users/labo/landing-agent-team/webapp/lib/gemini.ts`에서 복사:
- `callGemini(prompt)` — Gemini API 호출
- `extractJson(text)` — JSON 추출
- `extractHtml(text)` — HTML 추출

## 완료 기준
- `npm run build` 성공
- 모든 타입이 정상 export됨
