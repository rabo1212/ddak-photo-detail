"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ChevronDown, ChevronRight, RefreshCw } from "lucide-react";
import SectionEditor from "./SectionEditor";
import ImageSwapper from "./ImageSwapper";
import type { CopyData, SelectedImage, GeneratedImage } from "@/lib/types";

const SECTION_LABELS: Record<string, string> = {
  hero: "히어로 (첫 화면)",
  pain: "고객 고민",
  problem: "문제 인식",
  story: "브랜드 스토리",
  solution: "해결책",
  how: "사용 방법",
  proof: "사회적 증거",
  authority: "전문성",
  benefits: "혜택 & 가격",
  risk: "보증 & FAQ",
  compare: "비교",
  filter: "추천 대상",
  cta: "최종 CTA",
};

interface CopyEditorProps {
  copyData: CopyData;
  selectedImages: SelectedImage[];
  generatedImages: GeneratedImage[];
  onCopyChange: (copyData: CopyData) => void;
  onImagesChange: (selectedImages: SelectedImage[]) => void;
  onApply: () => void;
  isApplying: boolean;
  hasChanges: boolean;
}

export default function CopyEditor({
  copyData,
  selectedImages,
  generatedImages,
  onCopyChange,
  onImagesChange,
  onApply,
  isApplying,
  hasChanges,
}: CopyEditorProps) {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const [showImages, setShowImages] = useState(false);

  const toggleSection = (key: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateSection = (sectionKey: string, data: any) => {
    onCopyChange({
      ...copyData,
      sections: { ...copyData.sections, [sectionKey]: data },
    });
  };

  const handleImageSwap = (index: number, newImage: GeneratedImage) => {
    const updated = [...selectedImages];
    updated[index] = { ...updated[index], image: newImage };
    onImagesChange(updated);
  };

  return (
    <div className="space-y-3 h-full overflow-y-auto pr-1">
      {/* 빠른 편집: 가격 + CTA */}
      <Card>
        <CardContent className="pt-4 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="default" className="text-[10px]">빠른 편집</Badge>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground">정가</label>
              <Input
                value={copyData.sections.cta.original_price}
                onChange={(e) => updateSection("cta", { ...copyData.sections.cta, original_price: e.target.value })}
                className="text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">할인가</label>
              <Input
                value={copyData.sections.cta.sale_price}
                onChange={(e) => updateSection("cta", { ...copyData.sections.cta, sale_price: e.target.value })}
                className="text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">헤드라인</label>
            <Input
              value={copyData.sections.hero.headline}
              onChange={(e) => updateSection("hero", { ...copyData.sections.hero, headline: e.target.value })}
              className="text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">CTA 버튼</label>
            <Input
              value={copyData.sections.cta.button_text}
              onChange={(e) => updateSection("cta", { ...copyData.sections.cta, button_text: e.target.value })}
              className="text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* 이미지 교체 */}
      <div className="border rounded-lg">
        <button
          onClick={() => setShowImages(!showImages)}
          className="w-full flex items-center gap-2 p-3 text-sm font-medium hover:bg-muted/50 transition-colors"
        >
          {showImages ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          이미지 교체
          <Badge variant="outline" className="text-[10px] ml-auto">{selectedImages.length}장</Badge>
        </button>
        {showImages && (
          <div className="px-3 pb-3">
            <ImageSwapper
              selectedImages={selectedImages}
              generatedImages={generatedImages}
              onSwap={handleImageSwap}
            />
          </div>
        )}
      </div>

      {/* 13섹션 아코디언 */}
      {Object.entries(copyData.sections).map(([key, data]) => (
        <div key={key} className="border rounded-lg">
          <button
            onClick={() => toggleSection(key)}
            className="w-full flex items-center gap-2 p-3 text-sm font-medium hover:bg-muted/50 transition-colors"
          >
            {openSections.has(key) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            {SECTION_LABELS[key] || key}
          </button>
          {openSections.has(key) && (
            <div className="px-3 pb-3">
              <SectionEditor
                sectionKey={key}
                sectionData={data}
                onChange={(updated) => updateSection(key, updated)}
              />
            </div>
          )}
        </div>
      ))}

      {/* 적용 버튼 (하단 고정) */}
      <div className="sticky bottom-0 bg-background pt-2 pb-1 border-t">
        <Button
          onClick={onApply}
          disabled={!hasChanges || isApplying}
          className="w-full"
          size="lg"
        >
          {isApplying ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              페이지 재생성 중...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              변경사항 적용
            </>
          )}
        </Button>
        {!hasChanges && (
          <p className="text-[10px] text-muted-foreground text-center mt-1">변경사항이 없습니다</p>
        )}
      </div>
    </div>
  );
}
