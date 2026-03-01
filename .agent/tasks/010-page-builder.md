# Task 010: HTML 상세페이지 빌드 API

## 목표
Gemini API로 카피 + 이미지를 합쳐 완성된 HTML 상세페이지 생성

## 파일 1개

### `src/app/api/build-page/route.ts`
- POST 엔드포인트
- Request body: { copyData: CopyData, selectedImages: SelectedImage[], productInfo: ProductInfo }
- callGemini()으로 HTML 생성 요청
- 프롬프트:
  - 13섹션 카피 데이터 (JSON)
  - 각 섹션에 매핑된 이미지 URL
  - 이미지 매핑 규칙:
    - 01.Hero → hero 역할 이미지
    - 04.Story → lifestyle
    - 05.Solution → feature
    - 06.How → lifestyle
    - 07.Proof → comparison
    - 09.Benefits → feature
    - 12.Filter → lifestyle
    - 13.CTA → hero 반복
  - Tailwind CSS 인라인 스타일 사용
  - 모바일 반응형
  - 단일 HTML 파일 (외부 의존성 없음, CDN으로 Tailwind)
- extractHtml()로 응답에서 HTML 추출
- Response: { html: string }

## 완료 기준
- `npm run build` 성공
- API 호출 시 완성된 HTML 문자열 반환
