# Task 011: 미리보기 + HTML 내보내기

## 목표
생성된 HTML 상세페이지를 미리보고 다운로드하는 UI

## 파일 2개

### 1. `src/components/preview/PagePreview.tsx`
- Props: html
- iframe으로 HTML 미리보기
  - `srcdoc`에 HTML 삽입
  - iframe 높이 자동 조절
- 뷰 토글: 데스크탑 (860px) / 모바일 (390px)
- shadcn Tabs로 전환

### 2. `src/components/preview/ExportOptions.tsx`
- Props: html, productName
- 내보내기 버튼:
  - "HTML 다운로드" → Blob + download
  - 파일명: `{productName}_상세페이지.html`
- shadcn Button + Card

## page.tsx Step 6-7 통합
- Step 6 (생성 중): 프로그레스 표시 + API 호출 (generate-copy → build-page)
- Step 7 (미리보기): PagePreview + ExportOptions

## 디자인
- 미리보기: border로 감싼 iframe
- 데스크탑/모바일 토글 탭
- 내보내기 버튼은 미리보기 아래

## 완료 기준
- `npm run build` 성공
- HTML 미리보기 (데스크탑/모바일) 동작
- HTML 다운로드 동작
- 전체 7단계 위자드 플로우 E2E 동작
