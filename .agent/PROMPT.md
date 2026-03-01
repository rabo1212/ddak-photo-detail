# 자율 실행 지시서 — 딱포토 AI 상세페이지 생성기

## 매 반복 시작할 때:
1. `.agent/STEERING.md` 읽기 (대장님 지시 변경 확인)
2. `.agent/tasks.json`에서 우선순위 가장 높은 미완료("todo") 작업 선택
3. 해당 작업의 `.agent/tasks/` 명세 읽기
4. CLAUDE.md 읽기 (프로젝트 규칙 확인)

## 작업 실행:
5. 명세에 따라 코드 구현
6. `npm run build` 실행하여 빌드 검증
7. 빌드 통과하면 → `git add` + `git commit` (작업 제목으로 커밋 메시지)
8. `tasks.json`에서 해당 작업 상태를 `"done"`으로 업데이트
9. `.agent/logs/`에 작업 기록 추가 (날짜, 작업ID, 결과)

## 규칙:
- 작업 1개 = commit 1개 (원자적 트랜잭션)
- 빌드 실패하면 → 수정 시도 최대 3번 → 안 되면 `"blocked"`으로 표시
- STEERING.md에 "중단" 또는 "⛔" 있으면 즉시 멈추기
- 관련 없는 코드 건드리지 않기 (카파시 원칙 3)
- 의존성(depends) 작업이 아직 "done"이 아니면 → 해당 작업 건너뛰기
- 한 반복에 작업 1개만 실행하고 종료

## 재사용 자산:
- Gemini 래퍼: `landing-agent-team/webapp/lib/gemini.ts` → `src/lib/gemini.ts`
- 13섹션 타입: `landing-agent-team/webapp/lib/types.ts` → CopyData, DesignSpec
- 프리셋 JSON: 작업지시서 `~/clawd/딱포토-AI상세페이지-클코작업지시서.md`
- fal.ai API: iclight-v2 엔드포인트
