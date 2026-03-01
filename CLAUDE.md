# 딱포토 AI 상세페이지 생성기

## 스택
- Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
- fal.ai API (iclight-v2, 배경 합성)
- Gemini API (카피 생성 + HTML 빌드)
- react-dropzone, uuid

## 규칙
- shadcn/ui 컴포넌트 우선 사용
- 카파시 원칙 준수 (단순, 수술적, 요청한 것만)
- `npm run build` 통과 필수
- 환경변수: FAL_KEY, GEMINI_API_KEY (.env.local)

## Ralph Loop
- `.agent/PROMPT.md` — 매 반복 지시서
- `.agent/tasks.json` — 작업 대기열
- `.agent/STEERING.md` — 방향 수정
- 작업 1개 = commit 1개
