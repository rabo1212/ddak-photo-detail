"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Copy, Check } from "lucide-react";

interface ExportOptionsProps {
  html: string;
  productName: string;
}

export default function ExportOptions({ html, productName }: ExportOptionsProps) {
  const [copied, setCopied] = useState(false);

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

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!html) return null;

  return (
    <Card className="card-premium shadow-raised overflow-hidden">
      <div className="h-1 progress-gradient" />
      <CardHeader>
        <CardTitle className="text-lg">내보내기</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button onClick={downloadHtml} className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 hover:shadow-glow hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 text-white" size="lg">
          <Download className="h-4 w-4 mr-2" />
          HTML 파일 다운로드
        </Button>
        <Button onClick={copyToClipboard} variant="outline" className="w-full">
          {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
          {copied ? "복사 완료!" : "HTML 코드 클립보드 복사"}
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          다운로드한 HTML을 쿠팡/스마트스토어 상세페이지에 붙여넣기하세요.
        </p>
      </CardContent>
    </Card>
  );
}
