# Task 003: 7단계 스텝 위자드 UI

## 목표
메인 페이지에 7단계 위자드 흐름 구현 (프로그레스바 + 이전/다음 버튼)

## 파일 2개

### 1. `src/components/wizard/StepWizard.tsx`
- Props: currentStep, totalSteps(7), onNext, onPrev, canNext
- 상단 프로그레스바 (shadcn Progress 또는 커스텀)
- 7단계 이름 표시: 사진 업로드 → 프리셋 선택 → AI 생성 → 이미지 선택 → 제품 정보 → 페이지 생성 → 미리보기
- 현재 단계 하이라이트
- 이전/다음 버튼 (shadcn Button)
- 첫 단계에서 이전 숨김, 마지막 단계에서 "다음" → "완료"

### 2. `src/app/page.tsx`
- `useState`로 currentStep 관리
- 각 단계별 데이터 state:
  - step 1: uploadedImages: UploadedImage[]
  - step 2: selectedPreset: Preset | null
  - step 3: generatedImages: GeneratedImage[] (API 호출)
  - step 4: selectedImages: SelectedImage[]
  - step 5: productInfo: ProductInfo
  - step 6: copyData + html (생성 중 로딩)
  - step 7: 미리보기
- StepWizard 컴포넌트 렌더링
- 각 단계별 컴포넌트 placeholder (다음 태스크에서 구현)

## 디자인
- 깔끔한 미니멀 스타일
- 중앙 정렬, max-w-4xl
- 모바일 반응형

## 완료 기준
- `npm run build` 성공
- 7단계 프로그레스바가 표시되고 이전/다음 네비게이션 동작
