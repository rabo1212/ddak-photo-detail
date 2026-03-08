"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, Download, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import Image from "next/image";
import type { SelectedImage, ProductCategory, VideoGeneration } from "@/lib/types";

interface VideoGeneratorProps {
  selectedImages: SelectedImage[];
  category: ProductCategory;
  videoGenerations: VideoGeneration[];
  onVideoGenerationsChange: (videos: VideoGeneration[]) => void;
}

const POLL_INTERVAL = 5000; // 5초마다 상태 확인

export default function VideoGenerator({
  selectedImages,
  category,
  videoGenerations,
  onVideoGenerationsChange,
}: VideoGeneratorProps) {
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const videoGenRef = useRef(videoGenerations);
  videoGenRef.current = videoGenerations;

  // hero 이미지 찾기 (없으면 첫 번째 이미지)
  const heroImage =
    selectedImages.find((si) => si.role === "hero") || selectedImages[0];

  // 폴링: generating 상태인 영상들의 상태 확인 (ref로 최신 상태 참조)
  const pollStatus = useCallback(async () => {
    const current = videoGenRef.current;
    const generating = current.filter((v) => v.status === "generating");
    if (generating.length === 0) return;

    const updated = current.map((v) => ({ ...v }));
    let changed = false;

    for (const video of generating) {
      try {
        const res = await fetch("/api/video-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ operationName: video.operationName }),
          signal: AbortSignal.timeout(10000),
        });
        const data = await res.json();

        const target = updated.find((v) => v.id === video.id);
        if (!target) continue;

        if (data.status === "completed" && data.videoUrl) {
          target.status = "completed";
          target.videoUrl = data.videoUrl;
          changed = true;
        } else if (data.status === "failed" || data.error) {
          target.status = "failed";
          target.error = data.error || "영상 생성에 실패했습니다.";
          changed = true;
        }
      } catch {
        // 네트워크 에러는 다음 폴링에서 재시도
      }
    }

    if (changed) {
      onVideoGenerationsChange(updated);
    }
  }, [onVideoGenerationsChange]);

  // 폴링 시작/정지 — videoGenerations 변경 시만 재평가
  useEffect(() => {
    const hasGenerating = videoGenerations.some(
      (v) => v.status === "generating"
    );

    if (hasGenerating && !pollingRef.current) {
      pollingRef.current = setInterval(pollStatus, POLL_INTERVAL);
    } else if (!hasGenerating && pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [videoGenerations, pollStatus]);

  const generateVideo = async () => {
    if (!heroImage) return;
    setIsRequesting(true);
    setError(null);

    try {
      const res = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: heroImage.image.url,
          category,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "영상 생성 요청에 실패했습니다.");
      }

      const data = await res.json();

      const newVideo: VideoGeneration = {
        id: data.id,
        sourceImageUrl: heroImage.image.url,
        operationName: data.operationName,
        status: "generating",
        prompt: data.prompt,
      };

      onVideoGenerationsChange([...videoGenerations, newVideo]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "영상 생성 중 오류가 발생했습니다."
      );
    } finally {
      setIsRequesting(false);
    }
  };

  const downloadVideo = (videoUrl: string, index: number) => {
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = `제품영상_${index + 1}.mp4`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!heroImage) return null;

  const completedVideos = videoGenerations.filter(
    (v) => v.status === "completed"
  );
  const generatingVideos = videoGenerations.filter(
    (v) => v.status === "generating"
  );

  return (
    <Card className="card-premium shadow-raised">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Video className="h-5 w-5" />
          제품 영상 생성
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 소스 이미지 미리보기 */}
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
          <Image
            src={heroImage.image.url}
            alt="소스 이미지"
            width={64}
            height={64}
            className="w-16 h-16 object-cover rounded-xl"
            unoptimized
          />
          <div className="text-sm">
            <p className="font-medium">Hero 이미지로 영상 생성</p>
            <p className="text-muted-foreground">
              8초 루핑 영상 (세로 9:16)
            </p>
          </div>
        </div>

        {/* 생성 버튼 */}
        <Button
          onClick={generateVideo}
          disabled={isRequesting || generatingVideos.length > 0}
          className="w-full"
          size="lg"
        >
          {isRequesting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              요청 중...
            </>
          ) : generatingVideos.length > 0 ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              영상 생성 중... (약 2~5분 소요)
            </>
          ) : (
            <>
              <Video className="h-4 w-4 mr-2" />
              제품 영상 생성 (~$3)
            </>
          )}
        </Button>

        {/* 에러 */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* 실패한 영상 */}
        {videoGenerations
          .filter((v) => v.status === "failed")
          .map((video) => (
            <div
              key={video.id}
              className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
            >
              <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <div className="flex-1 text-sm">
                <p className="text-destructive">
                  {video.error || "영상 생성에 실패했습니다."}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={generateVideo}
                disabled={isRequesting}
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
          ))}

        {/* 완료된 영상 */}
        {completedVideos.map((video, i) => (
          <div key={video.id} className="space-y-2">
            <video
              src={video.videoUrl}
              controls
              loop
              muted
              autoPlay
              playsInline
              className="w-full rounded-xl shadow-raised"
            />
            <Button
              variant="outline"
              className="w-full hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
              onClick={() => downloadVideo(video.videoUrl!, i)}
            >
              <Download className="h-4 w-4 mr-2" />
              영상 다운로드 (MP4)
            </Button>
          </div>
        ))}

        <p className="text-xs text-muted-foreground text-center">
          Google Veo 기반 8초 루핑 영상 생성. 인스타 릴스/틱톡에 바로 활용 가능.
        </p>
      </CardContent>
    </Card>
  );
}
