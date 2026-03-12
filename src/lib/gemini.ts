const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent";

const MAX_RETRIES = 1;
const RETRY_DELAY_MS = 2000;
const MAX_RETRY_WAIT_MS = 10000; // Retry-After 최대 10초

interface GeminiOptions {
  temperature?: number;
  maxOutputTokens?: number;
  responseMimeType?: string;
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type GeminiPart = { text: string } | { inlineData: { mimeType: string; data: string } };

/** 재시도 불가능한 에러를 구분하기 위한 클래스 */
class GeminiFatalError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GeminiFatalError";
  }
}

async function callGeminiBase(prompt: string, options: GeminiOptions = {}, parts?: GeminiPart[]): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY 환경변수가 설정되지 않았습니다.");

  const { temperature = 0.7, maxOutputTokens = 65536, responseMimeType } = options;

  const generationConfig: Record<string, unknown> = {
    temperature,
    maxOutputTokens,
  };
  if (responseMimeType) {
    generationConfig.responseMimeType = responseMimeType;
  }

  const contentParts: GeminiPart[] = parts || [{ text: prompt }];

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: contentParts }],
          generationConfig,
        }),
      });

      if (res.status === 429 || res.status === 503) {
        // Rate limit 또는 일시 장애 — 재시도 (최대 10초 대기)
        const retryAfter = res.headers.get("Retry-After");
        const rawWait = retryAfter ? parseInt(retryAfter) * 1000 : RETRY_DELAY_MS * (attempt + 1);
        const waitMs = Math.min(rawWait, MAX_RETRY_WAIT_MS);
        console.warn(`[Gemini] ${res.status} 응답, ${waitMs}ms 후 재시도 (${attempt + 1}/${MAX_RETRIES})`);
        await sleep(waitMs);
        continue;
      }

      if (!res.ok) {
        const errText = await res.text();
        console.error(`[Gemini] ${res.status} error:`, errText.slice(0, 200));
        // 재시도해도 의미 없는 에러 → 즉시 중단
        if (res.status === 401) throw new GeminiFatalError("API 인증 오류. 관리자에게 문의하세요.");
        if (res.status === 403) throw new GeminiFatalError("API 접근이 거부되었습니다.");
        if (res.status >= 500) throw new GeminiFatalError("AI 서버 오류가 발생했습니다. 잠시 후 다시 시도하세요.");
        throw new GeminiFatalError("AI 요청 처리 중 오류가 발생했습니다.");
      }

      const data = await res.json();

      // API 에러 응답 체크
      if (data.error) {
        throw new GeminiFatalError(`Gemini API 에러: ${data.error.message || "알 수 없는 오류"}`);
      }

      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

      if (!text) {
        const finishReason = data?.candidates?.[0]?.finishReason || "unknown";
        console.warn(`[Gemini] 빈 응답. finishReason: ${finishReason}`);
        if (finishReason === "SAFETY") {
          throw new GeminiFatalError("콘텐츠 정책 위반으로 생성할 수 없습니다.");
        }
        throw new Error("Gemini API가 유효한 응답을 반환하지 않았습니다.");
      }

      return text;
    } catch (err) {
      // 재시도 불가 에러는 즉시 throw
      if (err instanceof GeminiFatalError) throw err;

      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < MAX_RETRIES) {
        console.warn(`[Gemini] 오류 발생, 재시도 ${attempt + 1}/${MAX_RETRIES}:`, lastError.message);
        await sleep(RETRY_DELAY_MS * (attempt + 1));
      }
    }
  }

  throw lastError || new Error("Gemini API 호출에 실패했습니다.");
}

/** 카피 생성용 — 창의적 (temperature 0.9) */
export async function callGeminiCreative(prompt: string): Promise<string> {
  return callGeminiBase(prompt, { temperature: 0.9 });
}

/** JSON 응답용 — 구조적 (temperature 0.5, JSON MIME) */
export async function callGeminiJson(prompt: string): Promise<string> {
  return callGeminiBase(prompt, {
    temperature: 0.5,
    responseMimeType: "application/json",
  });
}

/** HTML 빌드용 — 정확한 (temperature 0.4) */
export async function callGeminiPrecise(prompt: string): Promise<string> {
  return callGeminiBase(prompt, { temperature: 0.4 });
}

/** 레거시 호환용 (기존 코드에서 사용) */
export async function callGemini(prompt: string): Promise<string> {
  return callGeminiBase(prompt);
}

/** Vision (멀티모달) — 이미지 분석 + JSON 응답 (temperature 0.8) */
export async function callGeminiVision(
  prompt: string,
  imageBase64: string,
  mimeType: string
): Promise<string> {
  const parts: GeminiPart[] = [
    { text: prompt },
    { inlineData: { mimeType, data: imageBase64 } },
  ];
  return callGeminiBase(prompt, {
    temperature: 0.8,
    responseMimeType: "application/json",
  }, parts);
}

export function extractJson(text: string): string {
  const jsonBlockMatch = text.match(/```json\s*\n?([\s\S]*?)```/);
  if (jsonBlockMatch) return jsonBlockMatch[1].trim();

  const codeBlockMatch = text.match(/```\s*\n?([\s\S]*?)```/);
  if (codeBlockMatch) return codeBlockMatch[1].trim();

  // JSON 객체/배열 직접 감지
  const directJson = text.trim();
  if (directJson.startsWith("{") || directJson.startsWith("[")) {
    return directJson;
  }

  return text.trim();
}

export function extractHtml(text: string): string {
  const htmlBlockMatch = text.match(/```html\s*\n?([\s\S]*?)```/);
  if (htmlBlockMatch) return htmlBlockMatch[1].trim();

  const codeBlockMatch = text.match(/```\s*\n?([\s\S]*?)```/);
  if (codeBlockMatch) return codeBlockMatch[1].trim();

  if (text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")) {
    return text.trim();
  }

  return text.trim();
}
