import { NextRequest, NextResponse } from "next/server";

const VEO_API_BASE = "https://generativelanguage.googleapis.com/v1beta";

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  try {
    const { operationName } = await req.json();

    if (!operationName) {
      return NextResponse.json(
        { error: "operationName은 필수입니다." },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${VEO_API_BASE}/${operationName}?key=${apiKey}`
    );

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      console.error("Veo status error:", response.status, errText);
      return NextResponse.json(
        { error: `상태 확인에 실패했습니다. (${response.status})` },
        { status: 500 }
      );
    }

    const data = await response.json();

    if (data.done) {
      // 에러 응답 우선 체크
      if (data.error) {
        return NextResponse.json({
          status: "failed",
          error: data.error.message || "영상 생성에 실패했습니다.",
        });
      }

      // 완료: 영상 URL 추출
      // 실제 응답 구조: response.generateVideoResponse.generatedSamples[0].video.uri
      const samples = data.response?.generateVideoResponse?.generatedSamples || [];
      const fallbackVideos = data.response?.videos || data.response?.predictions || [];
      const videoUrl =
        samples[0]?.video?.uri ||
        fallbackVideos[0]?.video?.uri ||
        fallbackVideos[0]?.uri ||
        null;

      if (!videoUrl) {
        return NextResponse.json({
          status: "failed",
          error: "영상 URL을 찾을 수 없습니다.",
        });
      }

      // 영상 다운로드에 API key 필요 — 서버에서 붙여서 반환
      const authedUrl = videoUrl.includes("?")
        ? `${videoUrl}&key=${apiKey}`
        : `${videoUrl}?key=${apiKey}`;

      return NextResponse.json({
        status: "completed",
        videoUrl: authedUrl,
      });
    }

    // 아직 진행 중
    return NextResponse.json({
      status: "generating",
      metadata: data.metadata || null,
    });
  } catch (err) {
    console.error("video-status error:", err);
    return NextResponse.json(
      { error: "상태 확인 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
