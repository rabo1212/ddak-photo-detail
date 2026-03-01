# Task 006: fal.ai API 이미지 생성 엔드포인트

## 목표
fal.ai iclight-v2 모델로 누끼 이미지에 배경을 합성하는 API 라우트

## 파일 1개

### `src/app/api/generate-image/route.ts`
- POST 엔드포인트
- Request body: { image_base64, prompt, preset_id, count }
  - image_base64: 업로드된 누끼 이미지 (base64)
  - prompt: 프리셋의 prompt_template
  - count: 생성할 이미지 수 (기본 4)

- fal.ai API 호출:
```
POST https://queue.fal.run/fal-ai/iclight-v2
Authorization: Key ${FAL_KEY}
{
  "prompt": "프리셋 프롬프트",
  "image_url": "data:image/png;base64,...",
  "image_size": "square_hd"
}
```

- 큐 방식 (queue.fal.run):
  1. POST로 작업 제출 → request_id 받기
  2. GET으로 상태 폴링 (status: IN_QUEUE → IN_PROGRESS → COMPLETED)
  3. COMPLETED시 결과 이미지 URL 반환

- Response: { images: [{ url, seed }] }

## 주의
- FAL_KEY는 서버 사이드에서만 사용 (환경변수)
- 타임아웃 처리 (최대 60초)
- 에러 시 적절한 에러 메시지 반환

## 완료 기준
- `npm run build` 성공
- API 엔드포인트가 정상 응답 구조를 반환
