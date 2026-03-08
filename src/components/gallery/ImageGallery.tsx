"use client";

import type { GeneratedImage, SelectedImage, ImageRole } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Check, ZoomIn, ImageIcon } from "lucide-react";

interface ImageGalleryProps {
  generatedImages: GeneratedImage[];
  selectedImages: SelectedImage[];
  onSelectionChange: (images: SelectedImage[]) => void;
  isGenerating?: boolean;
}

const ROLE_OPTIONS: { value: ImageRole; label: string }[] = [
  { value: "hero", label: "히어로" },
  { value: "feature", label: "특징 설명" },
  { value: "lifestyle", label: "사용 장면" },
  { value: "comparison", label: "비교" },
  { value: "detail", label: "디테일" },
];

export default function ImageGallery({
  generatedImages,
  selectedImages,
  onSelectionChange,
  isGenerating,
}: ImageGalleryProps) {
  const isSelected = (id: string) => selectedImages.some((s) => s.image.id === id);

  const getRole = (id: string): ImageRole | undefined =>
    selectedImages.find((s) => s.image.id === id)?.role;

  const toggleSelect = (image: GeneratedImage) => {
    if (isSelected(image.id)) {
      onSelectionChange(selectedImages.filter((s) => s.image.id !== image.id));
    } else {
      onSelectionChange([...selectedImages, { image, role: "hero" }]);
    }
  };

  const updateRole = (imageId: string, role: ImageRole) => {
    onSelectionChange(
      selectedImages.map((s) =>
        s.image.id === imageId ? { ...s, role } : s
      )
    );
  };

  const selectAll = () => {
    onSelectionChange(
      generatedImages.map((img) => ({
        image: img,
        role: (getRole(img.id) || "hero") as ImageRole,
      }))
    );
  };

  const deselectAll = () => onSelectionChange([]);

  if (isGenerating) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-2xl shimmer" />
        ))}
      </div>
    );
  }

  if (generatedImages.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
          <ImageIcon className="h-10 w-10 text-primary/40" />
        </div>
        <p className="font-bold text-foreground">아직 생성된 이미지가 없습니다</p>
        <p className="text-sm mt-1">이전 단계에서 프리셋을 선택한 뒤 생성해주세요</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 액션 버튼 */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium bg-gradient-to-r from-primary to-accent text-white rounded-full px-3 py-1">
          {selectedImages.length}/{generatedImages.length}장 선택
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={selectAll}>
            전체 선택
          </Button>
          <Button variant="outline" size="sm" onClick={deselectAll}>
            선택 해제
          </Button>
        </div>
      </div>

      {/* 이미지 그리드 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {generatedImages.map((img) => {
          const selected = isSelected(img.id);
          return (
            <div key={img.id} className="space-y-2">
              <div
                className={cn(
                  "relative aspect-square rounded-2xl overflow-hidden cursor-pointer group border-2 transition-all duration-300",
                  selected ? "border-primary glow-soft shadow-raised" : "border-transparent hover:border-border hover:shadow-raised hover:-translate-y-1"
                )}
                onClick={() => toggleSelect(img)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt="생성 이미지"
                  className="w-full h-full object-cover"
                />

                {/* 체크 표시 */}
                {selected && (
                  <div className="absolute top-2 left-2 bg-gradient-to-br from-primary to-accent text-white rounded-full p-1.5 shadow-sm animate-check-pop">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                )}

                {/* 확대 보기 */}
                <Dialog>
                  <DialogTrigger asChild>
                    <button
                      className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ZoomIn className="h-3 w-3" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt="생성 이미지 확대" className="w-full rounded" />
                  </DialogContent>
                </Dialog>
              </div>

              {/* 역할 선택 (선택된 경우만) */}
              {selected && (
                <Select
                  value={getRole(img.id)}
                  onValueChange={(v) => updateRole(img.id, v as ImageRole)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Badge 중복 제거 — Select가 이미 역할 표시 */}
            </div>
          );
        })}
      </div>
    </div>
  );
}
