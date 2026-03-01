# Task 008: 제품 정보 입력 폼

## 목표
상세페이지 카피 생성에 필요한 제품 정보를 입력받는 폼

## 파일 1개

### `src/components/product/ProductInfoForm.tsx`
- Props: productInfo, onChange
- 입력 필드:
  1. 제품명 (Input, 필수)
  2. 카테고리 (Select: 화장품/식품/전자기기/의류/생활용품/기타)
  3. 가격 (Input, 숫자)
  4. 타겟 고객 (Textarea, "20~30대 여성, 피부 고민이 있는")
  5. 핵심 특장점 (3~5개, 동적 추가/삭제 가능한 Input 리스트)
  6. 톤앤매너 (Select: 친근/전문/럭셔리/캐주얼)
  7. 판매 채널 (Select: 쿠팡/스마트스토어/자사몰/인스타/아마존)
- shadcn 컴포넌트 사용 (Input, Textarea, Select, Button, Card)
- 유효성 검사: 제품명, 카테고리 필수

## 디자인
- 카드 안에 폼 배치
- 라벨 + 입력 세로 배치
- 특장점: "+" 버튼으로 항목 추가, 각 항목 옆 "X"로 삭제

## 완료 기준
- `npm run build` 성공
- 제품 정보 입력/수정 동작
- page.tsx에서 Step 5로 렌더링
