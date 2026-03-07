import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { VIDEO_PROMPTS, type ProductCategory } from "@/lib/types";

const VEO_API_BASE = "https://generativelanguage.googleapis.com/v1beta";
const VEO_MODEL = "veo-3.1-generate-preview";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  try {
    const { imageUrl, category, customPrompt, aspectRatio } = await req.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "imageUrl은 필수입니다." },
        { status: 400 }
      );
    }

    // 이미지 URL → base64 변환
    let base64Image: string;
    let mimeType = "image/png";
    if (imageUrl.startsWith("data:")) {
      mimeType = imageUrl.split(";")[0].split(":")[1] || "image/png";
      base64Image = imageUrl.split(",")[1];
    } else {
      const imgRes = await fetch(imageUrl);
      if (!imgRes.ok) {
        return NextResponse.json(
          { error: "이미지를 다운로드할 수 없습니다." },
          { status: 400 }
        );
      }
      mimeType = imgRes.headers.get("content-type") || "image/png";
      const buffer = await imgRes.arrayBuffer();
      base64Image = Buffer.from(buffer).toString("base64");
    }

    // 프롬프트 결정: 커스텀 > 카테고리별 기본
    const prompt =
      customPrompt ||
      VIDEO_PROMPTS[(category as ProductCategory) || "etc"];

    // Veo API 호출 (비동기 long-running operation)
    const response = await fetch(
      `${VEO_API_BASE}/models/${VEO_MODEL}:predictLongRunning?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instances: [
            {
              prompt,
              image: { bytesBase64Encoded: base64Image, mimeType },
            },
          ],
          parameters: {
            sampleCount: 1,
            durationSeconds: 8,
            aspectRatio: aspectRatio || "9:16",
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      console.error("Veo API error:", response.status, errText);
      return NextResponse.json(
        {
          error: `영상 생성 요청에 실패했습니다. (${response.status})`,
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    const operationName = data.name;

    if (!operationName) {
      return NextResponse.json(
        { error: "영상 생성 작업 ID를 받지 못했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: uuid(),
      operationName,
      status: "generating",
      prompt,
    });
  } catch (err) {
    console.error("generate-video error:", err);
    return NextResponse.json(
      { error: "영상 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
