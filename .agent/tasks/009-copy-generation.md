# Task 009: Gemini 13섹션 카피 생성 API

## 목표
Gemini API로 제품 정보 기반 13섹션 판매 카피 생성

## 파일 1개

### `src/app/api/generate-copy/route.ts`
- POST 엔드포인트
- Request body: { productInfo: ProductInfo, selectedImages: SelectedImage[] }
- callGemini()으로 Gemini API 호출
- 프롬프트에 포함:
  - 제품명, 카테고리, 가격, 타겟, 특장점, 톤앤매너, 채널
  - 선택된 이미지의 역할 정보 (어떤 이미지가 어느 섹션에 들어갈지)
  - 13섹션 구조 명세 (CopyData 타입에 맞는 JSON 출력 요청)

- 프롬프트 가이드라인 (landing-agent-team/prompts/copywriter.md 참고):
  - Hero: 3초 안에 잡는 한줄 카피
  - Pain: 고객이 "맞아 맞아" 할 고민 3~5개
  - Problem: 기존 해결책의 한계
  - Story: 브랜드 탄생 배경
  - Solution: 제품 소개
  - How: 사용법 3단계
  - Proof: 수치/후기
  - Authority: 브랜드 신뢰
  - Benefits: 핵심 장점 3~5개
  - Risk: 환불보증
  - Compare: 우리 vs 기존
  - Filter: 이런 분에게 추천
  - CTA: 최종 구매 유도

- Response: CopyData JSON

## 완료 기준
- `npm run build` 성공
- API 호출 시 CopyData 구조의 JSON 반환
