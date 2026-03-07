import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";

// FLUX Kontext Pro — 현존 최고 사실감, 참조 이미지 기반 합성 ($0.04/장)
const FAL_API_URL = "https://fal.run/fal-ai/flux-pro/kontext";

// 샷 타입별 구도 지시 — 4장이 각각 다른 구도로 생성됨
const SHOT_TYPES = [
  {
    name: "hero",
    suffix: ". Frame the full product centered in the shot with generous negative space around it for text overlay. Medium shot, product fills about 60% of frame. Clean, balanced composition perfect for a hero banner.",
  },
  {
    name: "closeup",
    suffix: ". Extreme close-up macro shot focusing on the product's key detail, texture, or label. Shallow depth of field f/1.8, only the focal point is sharp. Show material quality and craftsmanship up close.",
  },
  {
    name: "lifestyle",
    suffix: ". Place the product in a natural lifestyle scene as if someone is about to use it. Include contextual props (a hand reaching, a table setting, morning routine). Environmental portrait style, product is part of a larger scene. Warm and inviting atmosphere.",
  },
  {
    name: "angle",
    suffix: ". Dramatic 45-degree low angle or three-quarter view of the product, showing depth and dimension. Dynamic perspective that makes the product look powerful and substantial. Slight wide-angle distortion for impact.",
  },
];

export const maxDuration = 60;

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

    // 4장 생성: 각각 다른 샷 타입(구도) + seed로 다양성 확보
    const numImages = Math.min(count, SHOT_TYPES.length);
    const promises = Array.from({ length: numImages }, (_, i) => {
      const seed = Math.floor(Math.random() * 2147483647);
      const shot = SHOT_TYPES[i % SHOT_TYPES.length];
      return fetch(FAL_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Key ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt + shot.suffix,
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
