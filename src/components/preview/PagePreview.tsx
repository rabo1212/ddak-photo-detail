"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PagePreviewProps {
  html: string;
}

type ViewMode = "desktop" | "mobile";

export default function PagePreview({ html }: PagePreviewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("desktop");

  if (!html) {
    return (
      <div className="text-center py-12 text-gray-400">
        생성된 페이지가 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 뷰 모드 토글 */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
        <TabsList>
          <TabsTrigger value="desktop">데스크탑 (860px)</TabsTrigger>
          <TabsTrigger value="mobile">모바일 (390px)</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* iframe 미리보기 */}
      <div className="flex justify-center">
        <div
          className="border rounded-lg overflow-hidden bg-white shadow-sm transition-all"
          style={{
            width: viewMode === "desktop" ? 860 : 390,
            maxWidth: "100%",
          }}
        >
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
