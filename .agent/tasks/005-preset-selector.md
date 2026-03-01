# Task 005: 연출 프리셋 선택 UI

## 목표
6종 프리셋을 카드 형태로 보여주고 선택하는 UI

## 파일 1개

### `src/components/prompt/PresetSelector.tsx`
- Props: presets, selectedPreset, onSelect
- 6종 프리셋을 2x3 그리드 카드로 표시
- 각 카드:
  - 프리셋 이름 (미니멀 스튜디오, 라이프스타일 주방 등)
  - 짧은 설명 (best_for)
  - 조명/색감 태그
  - 아이콘 또는 색상 배경
- 선택된 카드: border 하이라이트 + 체크 표시
- shadcn Card 컴포넌트 활용
- 선택하면 onSelect 콜백

## 디자인
- 카드: hover시 scale 약간, 선택시 primary border
- 깔끔한 미니멀 카드 스타일
- 모바일: 1열 세로 스크롤

## 완료 기준
- `npm run build` 성공
- 6종 카드 렌더링 + 선택 동작
- page.tsx에서 Step 2로 렌더링
