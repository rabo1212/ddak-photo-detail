# Task 004: 이미지 업로드 컴포넌트

## 목표
react-dropzone 기반 누끼 사진 업로드 UI

## 파일 1개

### `src/components/upload/ImageUploader.tsx`
- Props: images, onImagesChange
- react-dropzone으로 드래그앤드롭 영역
- 최대 6장 제한
- 지원 형식: jpg, png, webp
- 파일 용량 제한: 10MB/장
- 업로드 후:
  - 미리보기 썸네일 그리드 (2x3 또는 3x2)
  - 각 이미지에 각도 태깅 드롭다운: front, left, right, back, top, bottom
  - 삭제 버튼 (X)
- 빈 상태: 점선 박스 + "사진을 드래그하거나 클릭해서 업로드" 안내 문구
- 업로드 시 base64 또는 File 객체로 저장

## 디자인
- 드래그 영역: 점선 border, hover시 하이라이트
- 썸네일: rounded, aspect-square, object-cover
- shadcn Select로 각도 선택

## 완료 기준
- `npm run build` 성공
- 이미지 드래그앤드롭 + 각도 태깅 동작
- page.tsx에서 Step 1으로 렌더링
