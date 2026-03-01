"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";

interface ExportOptionsProps {
  html: string;
  productName: string;
}

export default function ExportOptions({ html, productName }: ExportOptionsProps) {
  const downloadHtml = () => {
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${productName || "상세페이지"}_상세페이지.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!html) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">내보내기</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={downloadHtml} className="w-full">
          <Download className="h-4 w-4 mr-2" />
          HTML 다운로드
        </Button>
        <p className="text-xs text-gray-400 mt-2 text-center">
          다운로드한 HTML을 쿠팡/스마트스토어 상세페이지에 붙여넣기하세요.
        </p>
      </CardContent>
    </Card>
  );
}
