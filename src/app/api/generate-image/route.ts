import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";

// FLUX Kontext Pro — 현존 최고 사실감, 참조 이미지 기반 합성 ($0.04/장)
const FAL_API_URL = "https://fal.run/fal-ai/flux-pro/kontext";

// 장면 변형: 각 요청마다 다른 배경/조명을 지시해서 다양성 확보
const SCENE_VARIATIONS = [
  "", // 원본 프롬프트 그대로
  ". Use soft diffused window light from the left side, with gentle shadows and shallow depth of field on the background",
  ". Place on a warm-toned wooden surface with morning sunlight, blurred cozy interior behind",
  ". Use dramatic side lighting from the right with deeper shadows, slightly moody atmosphere",
  ". Bright overhead soft light, minimal shadows, clean and airy feel with light background",
  ". Golden hour warm tones with subtle backlight glow, creating a premium inviting atmosphere",
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
      const variation = SCENE_VARIATIONS[i % SCENE_VARIATIONS.length];
      return fetch(FAL_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Key ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt + variation,
          image_url: dataUrl,
          guidance_scale: 3.5,
          output_format: "png",
          seed,
        }),
      });
    });

    const responses = await Promise.allSettled(promises);
    const images: { id: string; url: string }[] = [];

    for (const res of responses) {
      if (res.status === "fulfilled" && res.value.ok) {
        const data = await res.value.json();
        // FLUX Kontext Pro: images 배열로 반환
        if (data.images) {
          for (const img of data.images) {
            images.push({ id: uuid(), url: img.url });
          }
        }
      } else if (res.status === "fulfilled" && !res.value.ok) {
        const errText = await res.value.text().catch(() => "");
        console.error("FLUX Kontext Pro error:", res.value.status, errText);
      }
    }

    if (images.length === 0) {
      return NextResponse.json({ error: "이미지 생성에 실패했습니다. 다시 시도해주세요." }, { status: 500 });
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
