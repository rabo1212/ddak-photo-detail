# Task 007: 이미지 갤러리 + 선택 + 역할 지정

## 목표
AI 생성된 이미지들을 갤러리로 보여주고, 상세페이지에 사용할 이미지를 선택 + 역할 지정

## 파일 1개

### `src/components/gallery/ImageGallery.tsx`
- Props: generatedImages, selectedImages, onSelectionChange
- 생성된 이미지 그리드 (3~4열)
- 각 이미지:
  - 체크박스로 선택/해제
  - 선택된 이미지에 역할 드롭다운: hero, feature, lifestyle, comparison, detail
  - 프리셋 이름 표시
  - 클릭하면 크게 보기 (shadcn Dialog)
- "전체 선택" / "선택 해제" 버튼
- 선택된 이미지 수 표시

## 로딩 상태
- Step 3 (AI 생성 중): 스켈레톤 또는 로딩 스피너 표시
- Step 4 (이미지 선택): 갤러리 표시

## 디자인
- 이미지 카드: rounded-lg, 체크시 ring-2 ring-primary
- 역할 드롭다운: shadcn Select, 작은 사이즈
- 모바일: 2열

## 완료 기준
- `npm run build` 성공
- 이미지 선택 + 역할 지정 동작
- page.tsx에서 Step 3-4로 렌더링
