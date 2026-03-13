import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export const maxDuration = 30;

const BIREFNET_URL = "https://fal.run/fal-ai/birefnet/v2";

export async function POST(req: NextRequest) {
  const apiKey = process.env.FAL_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "FAL_KEY가 설정되지 않았습니다." }, { status: 500 });
  }

  try {
    const formData = await req.formData();
    const imageFile = formData.get("image") as File | null;

    if (!imageFile) {
      return NextResponse.json({ error: "image는 필수입니다." }, { status: 400 });
    }

    // File → base64 data URL
    const buffer = await imageFile.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const mimeType = imageFile.type || "image/png";
    const dataUrl = `data:${mimeType};base64,${base64}`;

    // BiRefNet v2 호출 — 배경 제거 + 마스크
    const res = await fetch(BIREFNET_URL, {
      method: "POST",
      headers: {
        Authorization: `Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image_url: dataUrl,
        model: "General",
        output_format: "png",
        output_mask: true,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error("[remove-bg] BiRefNet error:", res.status, errText.slice(0, 200));
      return NextResponse.json(
        { error: "배경 제거에 실패했습니다." },
        { status: 500 },
      );
    }

    const data = await res.json();
    const foregroundUrl = data.image?.url;
    const maskUrl = data.mask?.url;
    const width = data.image?.width || 0;
    const height = data.image?.height || 0;

    if (!foregroundUrl || !maskUrl) {
      return NextResponse.json(
        { error: "배경 제거 결과가 올바르지 않습니다." },
        { status: 500 },
      );
    }

    // 마스크 반전 (BiRefNet: white=foreground → FLUX Fill: white=background)
    const maskRes = await fetch(maskUrl);
    if (!maskRes.ok) {
      return NextResponse.json({ error: "마스크 다운로드에 실패했습니다." }, { status: 500 });
    }
    const maskBuffer = Buffer.from(await maskRes.arrayBuffer());
    const invertedMask = await sharp(maskBuffer).negate().png().toBuffer();
    const invertedMaskDataUrl = `data:image/png;base64,${invertedMask.toString("base64")}`;

    return NextResponse.json({
      foregroundUrl,
      maskUrl: invertedMaskDataUrl,
      width,
      height,
    });
  } catch (err) {
    console.error("[remove-bg] error:", err);
    return NextResponse.json(
      { error: "배경 제거 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
