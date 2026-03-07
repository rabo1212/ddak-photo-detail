"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeftRight } from "lucide-react";
import Image from "next/image";
import type { SelectedImage, GeneratedImage } from "@/lib/types";

const ROLE_LABELS: Record<string, string> = {
  hero: "히어로",
  feature: "상세",
  lifestyle: "라이프스타일",
  comparison: "비교",
  detail: "디테일",
};

interface ImageSwapperProps {
  selectedImages: SelectedImage[];
  generatedImages: GeneratedImage[];
  onSwap: (index: number, newImage: GeneratedImage) => void;
}

export default function ImageSwapper({ selectedImages, generatedImages, onSwap }: ImageSwapperProps) {
  const [swapIndex, setSwapIndex] = useState<number | null>(null);

  if (selectedImages.length === 0) {
    return <p className="text-sm text-muted-foreground">선택된 이미지가 없습니다.</p>;
  }

  return (
    <>
      <div className="space-y-2">
        {selectedImages.map((si, i) => (
          <div key={si.image.id} className="flex items-center gap-3 p-2 border rounded-md">
            <Image
              src={si.image.url}
              alt={si.role}
              width={48}
              height={48}
              className="w-12 h-12 rounded object-cover shrink-0"
              unoptimized
            />
            <Badge variant="secondary" className="text-[10px]">
              {ROLE_LABELS[si.role] || si.role}
            </Badge>
            <div className="flex-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSwapIndex(i)}
              className="text-xs h-7"
            >
              <ArrowLeftRight className="h-3 w-3 mr-1" />
              교체
            </Button>
          </div>
        ))}
      </div>

      {/* 이미지 교체 Dialog */}
      <Dialog open={swapIndex !== null} onOpenChange={(open) => !open && setSwapIndex(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>이미지 교체</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mb-3">
            교체할 이미지를 선택하세요.
          </p>
          <div className="grid grid-cols-3 gap-2">
            {generatedImages.map((img) => {
              const isCurrentlySelected = swapIndex !== null && selectedImages[swapIndex]?.image.id === img.id;
              return (
                <button
                  key={img.id}
                  onClick={() => {
                    if (swapIndex !== null) {
                      onSwap(swapIndex, img);
                      setSwapIndex(null);
                    }
                  }}
                  className={`relative rounded-md overflow-hidden border-2 transition-all hover:opacity-90 ${
                    isCurrentlySelected ? "border-primary ring-2 ring-primary/30" : "border-transparent"
                  }`}
                >
                  <Image
                    src={img.url}
                    alt="생성 이미지"
                    width={200}
                    height={200}
                    className="w-full aspect-square object-cover"
                    unoptimized
                  />
                  {isCurrentlySelected && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-white bg-primary px-1.5 py-0.5 rounded">현재</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
