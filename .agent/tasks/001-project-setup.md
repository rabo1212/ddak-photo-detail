# Task 001: Next.js 프로젝트 셋업

## 목표
Next.js 14 프로젝트 생성 + shadcn/ui + 필수 의존성 설치

## 실행 순서

1. Next.js 프로젝트 생성:
```bash
cd /Users/labo/clawd/
npx create-next-app@14 ddak-photo-detail --ts --tailwind --eslint --app --src-dir --no-import-alias
```

2. shadcn/ui 초기화:
```bash
cd ddak-photo-detail
npx shadcn@latest init
```

3. shadcn 컴포넌트 추가:
```bash
npx shadcn@latest add button card input textarea select tabs progress badge dialog
```

4. 추가 의존성:
```bash
npm install react-dropzone uuid
npm install -D @types/uuid
```

5. `.env.local` 파일 생성:
```
FAL_KEY=환경변수에서_가져오기
GEMINI_API_KEY=환경변수에서_가져오기
```

6. `CLAUDE.md` 프로젝트 규칙 파일 생성

7. `git init` + 첫 커밋

## 완료 기준
- `npm run dev` 실행 시 localhost:3000에서 기본 페이지 확인
- `npm run build` 성공
- shadcn/ui 컴포넌트 import 가능
