import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";

const FAL_QUEUE_URL = "https://queue.fal.run/fal-ai/iclight-v2";

export async function POST(req: NextRequest) {
  const apiKey = process.env.FAL_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "FAL_KEY가 설정되지 않았습니다." }, { status: 500 });
  }

  try {
    const formData = await req.formData();
    const imageFile = formData.get("image") as File | null;
    const prompt = formData.get("prompt") as string;
    const count = parseInt(formData.get("count") as string) || 4;

    if (!imageFile || !prompt) {
      return NextResponse.json({ error: "image와 prompt는 필수입니다." }, { status: 400 });
    }

    // File → base64 data URL
    const buffer = await imageFile.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const mimeType = imageFile.type || "image/png";
    const dataUrl = `data:${mimeType};base64,${base64}`;

    // fal.ai 큐에 작업 제출
    const submitRes = await fetch(FAL_QUEUE_URL, {
      method: "POST",
      headers: {
        Authorization: `Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        image_url: dataUrl,
        image_size: "square_hd",
        num_images: Math.min(count, 4),
      }),
    });

    if (!submitRes.ok) {
      const errText = await submitRes.text();
      return NextResponse.json(
        { error: `fal.ai 요청 실패: ${errText}` },
        { status: submitRes.status }
      );
    }

    const submitData = await submitRes.json();

    // 큐 방식: request_id가 있으면 폴링
    if (submitData.request_id) {
      const requestId = submitData.request_id;
      const statusUrl = `${FAL_QUEUE_URL}/requests/${requestId}/status`;
      const resultUrl = `${FAL_QUEUE_URL}/requests/${requestId}`;

      // 상태 폴링 (최대 60초)
      const maxWait = 60_000;
      const start = Date.now();

      while (Date.now() - start < maxWait) {
        await new Promise((r) => setTimeout(r, 2000));

        const statusRes = await fetch(statusUrl, {
          headers: { Authorization: `Key ${apiKey}` },
        });
        if (!statusRes.ok) continue;
        const status = await statusRes.json();

        if (status.status === "COMPLETED") {
          const resultRes = await fetch(resultUrl, {
            headers: { Authorization: `Key ${apiKey}` },
          });
          if (!resultRes.ok) {
            return NextResponse.json({ error: "결과 조회 실패" }, { status: 500 });
          }
          const result = await resultRes.json();

          const images = (result.images || []).map(
            (img: { url: string }) => ({
              id: uuid(),
              url: img.url,
            })
          );

          return NextResponse.json({ images });
        }

        if (status.status === "FAILED") {
          return NextResponse.json(
            { error: "이미지 생성 실패" },
            { status: 500 }
          );
        }
      }

      return NextResponse.json({ error: "타임아웃 (60초 초과)" }, { status: 504 });
    }

    // 동기 응답인 경우
    const images = (submitData.images || []).map(
      (img: { url: string }) => ({
        id: uuid(),
        url: img.url,
      })
    );

    return NextResponse.json({ images });
  } catch (err) {
    console.error("generate-image error:", err);
    return NextResponse.json(
      { error: "이미지 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
