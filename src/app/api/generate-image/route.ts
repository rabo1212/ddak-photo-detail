import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";

// 동기 방식 (fal.run) — 바로 결과 반환, 큐 폴링 불필요
const FAL_API_URL = "https://fal.run/fal-ai/iclight-v2";

// 각 요청마다 다른 결과를 내기 위한 프롬프트 변형
const PROMPT_VARIATIONS = [
  "", // 원본 그대로
  ", shot from a slightly different angle, subtle warm lighting",
  ", with softer diffused lighting, gentle shadows on the left",
  ", dramatic side lighting from the right, deeper shadows",
  ", overhead soft light, minimal shadows, bright and airy",
  ", golden hour warm tones, slight backlight glow",
];

export async function POST(req: NextRequest) {
  const apiKey = process.env.FAL_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "FAL_KEY가 설정되지 않았습니다." }, { status: 500 });
  }

  try {
    const formData = await req.formData();
    const imageFile = formData.get("image") as File | null;
    const prompt = formData.get("prompt") as string;
    const count = parseInt(formData.get("count") as string) || 2;

    if (!imageFile || !prompt) {
      return NextResponse.json({ error: "image와 prompt는 필수입니다." }, { status: 400 });
    }

    // File → base64 data URL
    const buffer = await imageFile.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const mimeType = imageFile.type || "image/png";
    const dataUrl = `data:${mimeType};base64,${base64}`;

    // 여러 장 생성: 각각 다른 seed + 프롬프트 변형으로 병렬 호출
    const numImages = Math.min(count, 4);
    const promises = Array.from({ length: numImages }, (_, i) => {
      const seed = Math.floor(Math.random() * 2147483647);
      const variation = PROMPT_VARIATIONS[i % PROMPT_VARIATIONS.length];
      return fetch(FAL_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Key ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt + variation,
          image_url: dataUrl,
          image_size: "square_hd",
          seed,
        }),
      });
    });

    const responses = await Promise.allSettled(promises);
    const images: { id: string; url: string }[] = [];

    for (const res of responses) {
      if (res.status === "fulfilled" && res.value.ok) {
        const data = await res.value.json();
        if (data.images) {
          for (const img of data.images) {
            images.push({ id: uuid(), url: img.url });
          }
        }
      }
    }

    if (images.length === 0) {
      return NextResponse.json({ error: "이미지 생성에 실패했습니다." }, { status: 500 });
    }

    return NextResponse.json({ images });
  } catch (err) {
    console.error("generate-image error:", err);
    return NextResponse.json(
      { error: "이미지 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
