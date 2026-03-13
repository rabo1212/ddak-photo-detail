import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import sharp from "sharp";

// FLUX Pro Fill — 마스크 기반 인페인팅 (배경만 생성, 제품 보존)
const FLUX_FILL_URL = "https://fal.run/fal-ai/flux-pro/v1/fill";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const apiKey = process.env.FAL_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "FAL_KEY가 설정되지 않았습니다." }, { status: 500 });
  }

  try {
    const formData = await req.formData();
    const imageFile = formData.get("image") as File | null;
    const promptsRaw = formData.get("prompts") as string;
    const foregroundUrl = formData.get("foregroundUrl") as string;
    const maskUrl = formData.get("maskUrl") as string;

    if (!imageFile || !promptsRaw || !foregroundUrl || !maskUrl) {
      return NextResponse.json({ error: "image, prompts, foregroundUrl, maskUrl는 필수입니다." }, { status: 400 });
    }

    let prompts: { shot_type: string; scene: string }[];
    try {
      prompts = JSON.parse(promptsRaw);
    } catch {
      return NextResponse.json({ error: "prompts JSON 파싱에 실패했습니다." }, { status: 400 });
    }

    if (!Array.isArray(prompts) || prompts.length === 0 || !prompts.every(p => p.scene)) {
      return NextResponse.json({ error: "유효한 프롬프트가 없습니다." }, { status: 400 });
    }

    // 원본 이미지 → base64 data URL (서버에서 변환, Vercel 페이로드 제한 회피)
    const imageBuffer = await imageFile.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString("base64");
    const imageMime = imageFile.type || "image/png";
    const originalImageDataUrl = `data:${imageMime};base64,${imageBase64}`;

    // 전경 이미지 미리 다운로드 (1회, 모든 합성에 재사용)
    const fgRes = await fetch(foregroundUrl);
    if (!fgRes.ok) {
      return NextResponse.json({ error: "전경 이미지 다운로드에 실패했습니다. 이미지를 다시 업로드해주세요." }, { status: 500 });
    }
    const fgBuffer = Buffer.from(await fgRes.arrayBuffer());

    // 각 프롬프트별 FLUX Fill 호출 (병렬)
    const promises = prompts.map(async (p) => {
      const seed = Math.floor(Math.random() * 2147483647);
      const fillRes = await fetch(FLUX_FILL_URL, {
        method: "POST",
        headers: {
          Authorization: `Key ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: p.scene,
          image_url: originalImageDataUrl,
          mask_url: maskUrl,
          output_format: "png",
          seed,
        }),
      });

      if (!fillRes.ok) {
        const errText = await fillRes.text().catch(() => "");
        console.error(`[FLUX Fill] ${p.shot_type} error:`, fillRes.status, errText.slice(0, 200));
        throw new Error(`FLUX Fill 실패 (${fillRes.status})`);
      }

      const fillData = await fillRes.json();
      const bgUrl = fillData.images?.[0]?.url;
      if (!bgUrl) throw new Error("FLUX Fill 결과에 이미지 URL이 없습니다.");

      // 배경 이미지 다운로드
      const bgRes = await fetch(bgUrl);
      if (!bgRes.ok) throw new Error("배경 이미지 다운로드 실패");
      const bgBuffer = Buffer.from(await bgRes.arrayBuffer());

      // sharp로 합성: 배경 위에 전경(투명 PNG) 올리기
      const bgMeta = await sharp(bgBuffer).metadata();
      const fgMeta = await sharp(fgBuffer).metadata();

      // 크기가 다르면 전경을 배경 크기에 맞게 리사이즈
      // fill: 배경 크기에 정확히 맞춤 (비율 무시) — FLUX Fill 출력과 원본 비율이 같으므로 안전
      let fgForComposite: Buffer = fgBuffer;
      if (bgMeta.width !== fgMeta.width || bgMeta.height !== fgMeta.height) {
        fgForComposite = await sharp(fgBuffer)
          .resize(bgMeta.width, bgMeta.height, { fit: "fill" })
          .png()
          .toBuffer();
      }

      const composited = await sharp(bgBuffer)
        .composite([{ input: fgForComposite, gravity: "centre" }])
        .png({ quality: 90 })
        .toBuffer();

      // 합성 결과를 base64 data URL로 반환
      const compositedUrl = `data:image/png;base64,${composited.toString("base64")}`;

      return { id: uuid(), url: compositedUrl, shot_type: p.shot_type };
    });

    const settled = await Promise.allSettled(promises);
    const images: { id: string; url: string; shot_type: string }[] = [];

    for (let i = 0; i < settled.length; i++) {
      const res = settled[i];
      if (res.status === "fulfilled") {
        images.push(res.value);
      } else {
        console.error(`[generate-image] ${prompts[i].shot_type} 실패:`, res.reason);
      }
    }

    if (images.length === 0) {
      return NextResponse.json({ error: "이미지 생성에 실패했습니다. 다시 시도해주세요." }, { status: 500 });
    }

    return NextResponse.json({ images });
  } catch (err) {
    console.error("[generate-image] error:", err);
    return NextResponse.json(
      { error: "이미지 생성 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
