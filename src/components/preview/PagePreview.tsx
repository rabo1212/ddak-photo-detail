"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Monitor, Smartphone } from "lucide-react";

interface PagePreviewProps {
  html: string;
}

type ViewMode = "desktop" | "mobile";

export default function PagePreview({ html }: PagePreviewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("desktop");

  if (!html) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-muted/50 flex items-center justify-center">
          <Monitor className="h-8 w-8 text-muted-foreground/30" />
        </div>
        <p className="font-medium">생성된 페이지가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 뷰 모드 토글 — pill 형태 */}
      <div className="flex justify-center">
        <div className="inline-flex bg-muted/60 rounded-full p-1 gap-1">
          <button
            onClick={() => setViewMode("desktop")}
            className={cn(
              "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
              viewMode === "desktop"
                ? "bg-white shadow-raised text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Monitor className="h-3.5 w-3.5" />
            데스크탑
          </button>
          <button
            onClick={() => setViewMode("mobile")}
            className={cn(
              "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
              viewMode === "mobile"
                ? "bg-white shadow-raised text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Smartphone className="h-3.5 w-3.5" />
            모바일
          </button>
        </div>
      </div>

      {/* 디바이스 프레임 + iframe */}
      <div className="flex justify-center">
        <div
          className="rounded-2xl overflow-hidden bg-white shadow-float transition-all border border-border/50"
          style={{
            width: viewMode === "desktop" ? 860 : 390,
            maxWidth: "100%",
          }}
        >
          {/* 디바이스 상단 바 */}
          <div className="flex items-center gap-1.5 px-4 py-2.5 bg-muted/30 border-b border-border/30">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
            <div className="flex-1 mx-8">
              <div className="h-5 bg-muted/50 rounded-md max-w-xs mx-auto" />
            </div>
          </div>

          <iframe
            srcDoc={html}
            title="상세페이지 미리보기"
            className="w-full border-0"
            style={{ height: 800 }}
          />
        </div>
      </div>
    </div>
  );
}
