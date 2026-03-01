#!/bin/bash
# run-ralph.sh — 딱포토 AI 상세페이지 Ralph Loop 자동 실행

MAX_ITERATIONS=12
ITERATION=0

echo "=== 딱포토 AI 상세페이지 Ralph Loop 시작 ==="
echo "=== 최대 반복: $MAX_ITERATIONS ==="
echo ""

while [ $ITERATION -lt $MAX_ITERATIONS ]; do
  echo "=== 반복 #$ITERATION 시작 ==="

  # 클코 실행 (비대화형 모드)
  claude -p ".agent/PROMPT.md 읽고 다음 미완료 작업 1개만 실행해. 끝나면 종료해."

  # 완료된 작업 확인
  DONE=$(grep -c '"done"' .agent/tasks.json)
  TOTAL=$(grep -c '"id"' .agent/tasks.json)
  echo "=== 진행률: $DONE/$TOTAL ==="

  # 모든 작업 완료 시 종료
  if [ "$DONE" -eq "$TOTAL" ]; then
    echo "=== 모든 작업 완료! ==="
    break
  fi

  # blocked 작업 확인
  BLOCKED=$(grep -c '"blocked"' .agent/tasks.json)
  if [ "$BLOCKED" -gt 0 ]; then
    echo "=== 경고: $BLOCKED개 작업이 blocked 상태 ==="
  fi

  ITERATION=$((ITERATION + 1))
  echo ""
done

echo "=== Ralph Loop 종료 (반복 $ITERATION회) ==="
