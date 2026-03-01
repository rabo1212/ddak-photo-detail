# 프로젝트: 딱포토 AI 상세페이지 생성기

## 한줄 설명
누끼 사진 업로드 → AI 배경 합성 → 13섹션 상세페이지 자동 완성

## 기술 스택
- Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
- fal.ai API (iclight-v2, 배경 합성)
- Gemini API (13섹션 카피 생성 + HTML 빌드)
- react-dropzone (이미지 업로드)
- localStorage (MVP 상태 저장)

## 7단계 위자드 플로우
1. 누끼 사진 업로드 (최대 6장, 각도 태깅)
2. 연출 프리셋 선택 (6종)
3. AI 이미지 생성 (fal.ai)
4. 이미지 선택 + 역할 지정
5. 제품 정보 입력
6. AI 상세페이지 생성 (Gemini)
7. 미리보기 + HTML 내보내기

## 현재 상태
- Phase 1 MVP 개발 시작
- [마지막 업데이트: 2026-03-01]

## 경로
- 프로젝트: `/Users/labo/clawd/ddak-photo-detail/`
- 작업지시서: `/Users/labo/clawd/딱포토-AI상세페이지-클코작업지시서.md`
- 재사용 자산: `/Users/labo/landing-agent-team/webapp/lib/`
