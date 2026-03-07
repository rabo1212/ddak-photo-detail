import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";

// FLUX Kontext Pro — 현존 최고 사실감, 참조 이미지 기반 합성 ($0.04/장)
const FAL_API_URL = "https://fal.run/fal-ai/flux-pro/kontext";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const apiKey = process.env.FAL_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "FAL_KEY가 설정되지 않았습니다." }, { status: 500 });
  }

  try {
    const formData = await req.formData();
    const imageFile = formData.get("image") as File | null;
    const promptsJson = formData.get("prompts") as string;

    if (!imageFile || !promptsJson) {
      return NextResponse.json({ error: "image와 prompts는 필수입니다." }, { status: 400 });
    }

    let prompts: { shot_type: string; scene: string }[];
    try {
      prompts = JSON.parse(promptsJson);
    } catch {
      return NextResponse.json({ error: "prompts JSON 형식이 올바르지 않습니다." }, { status: 400 });
    }

    if (!Array.isArray(prompts) || prompts.length === 0 || !prompts.every(p => p.scene)) {
      return NextResponse.json({ error: "유효한 프롬프트가 없습니다." }, { status: 400 });
    }

    // File -> base64 data URL
    const buffer = await imageFile.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const mimeType = imageFile.type || "image/png";
    const dataUrl = `data:${mimeType};base64,${base64}`;

    // Gemini가 생성한 프롬프트 각각으로 FLUX 호출
    const promises = prompts.map((p) => {
      const seed = Math.floor(Math.random() * 2147483647);
      return fetch(FAL_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Key ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: p.scene,
          image_url: dataUrl,
          guidance_scale: 3.5,
          output_format: "png",
          seed,
        }),
      });
    });

    const responses = await Promise.allSettled(promises);
    const images: { id: string; url: string; shot_type: string }[] = [];

    for (let i = 0; i < responses.length; i++) {
      const res = responses[i];
      if (res.status === "fulfilled" && res.value.ok) {
        const data = await res.value.json();
        if (data.images) {
          for (const img of data.images) {
            images.push({ id: uuid(), url: img.url, shot_type: prompts[i].shot_type });
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
