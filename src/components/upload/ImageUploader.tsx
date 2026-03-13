"use client";

import { useCallback, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { v4 as uuid } from "uuid";
import type { UploadedImage, ImageAngle } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X, Upload, Loader2, Check, AlertCircle, RotateCw } from "lucide-react";

interface ImageUploaderProps {
  images: UploadedImage[];
  onImagesChange: (images: UploadedImage[]) => void;
  onBgRemoval?: (imageId: string, file: File) => void;
}

const ANGLE_OPTIONS: { value: ImageAngle; label: string }[] = [
  { value: "front", label: "정면" },
  { value: "left", label: "좌측" },
  { value: "right", label: "우측" },
  { value: "back", label: "후면" },
  { value: "top", label: "윗면" },
  { value: "bottom", label: "아랫면" },
];

export default function ImageUploader({ images, onImagesChange, onBgRemoval }: ImageUploaderProps) {
  // 컴포넌트 언마운트 시 Object URL 해제 (메모리 누수 방지)
  const prevUrlsRef = useRef<string[]>([]);
  useEffect(() => {
    prevUrlsRef.current = images.map((img) => img.preview);
    return () => {
      prevUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onDrop = useCallback(
    (files: File[]) => {
      const remaining = 6 - images.length;
      const newFiles = files.slice(0, remaining);
      const newImages: UploadedImage[] = newFiles.map((file) => ({
        id: uuid(),
        file,
        preview: URL.createObjectURL(file),
        angle: "front" as ImageAngle,
        bgRemovalStatus: "pending" as const,
      }));
      onImagesChange([...images, ...newImages]);
      // 각 이미지에 대해 bg removal 호출
      if (onBgRemoval) {
        newImages.forEach((img) => onBgRemoval(img.id, img.file));
      }
    },
    [images, onImagesChange, onBgRemoval]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [], "image/png": [], "image/webp": [] },
    maxSize: 10 * 1024 * 1024,
    disabled: images.length >= 6,
  });

  const removeImage = (id: string) => {
    const img = images.find((i) => i.id === id);
    if (img) URL.revokeObjectURL(img.preview);
    onImagesChange(images.filter((i) => i.id !== id));
  };

  const updateAngle = (id: string, angle: ImageAngle) => {
    onImagesChange(images.map((i) => (i.id === id ? { ...i, angle } : i)));
  };

  return (
    <div className="space-y-4">
      {/* 드롭존 */}
      {images.length < 6 && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-3xl p-12 sm:p-16 text-center cursor-pointer transition-all duration-300 ${
            isDragActive
              ? "border-primary bg-primary/5 glow-soft scale-[1.02]"
              : "border-border hover:border-primary/40 hover:bg-primary/[0.02] hover:shadow-raised"
          }`}
        >
          <input {...getInputProps()} />
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
            <Upload className="h-8 w-8 text-primary/60" />
          </div>
          <p className="text-foreground font-bold text-lg">
            {isDragActive ? "여기에 놓으세요!" : "사진을 드래그하거나 클릭해서 업로드"}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            JPG, PNG, WebP / 최대 10MB / {images.length}/6장
          </p>
        </div>
      )}

      {/* 썸네일 그리드 */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {images.map((img) => (
            <div
              key={img.id}
              className="relative group card-premium rounded-2xl overflow-hidden shadow-sm hover:shadow-float hover:-translate-y-1 transition-all duration-300"
            >
              {/* 이미지 */}
              <div className="aspect-square relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.preview}
                  alt={`제품 사진 (${img.angle})`}
                  className="w-full h-full object-cover"
                />
                {/* 배경 제거 상태 */}
                {img.bgRemovalStatus === "pending" && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  </div>
                )}
                {img.bgRemovalStatus === "done" && (
                  <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shadow-sm">
                    <Check className="h-3.5 w-3.5 text-white" />
                  </div>
                )}
                {img.bgRemovalStatus === "error" && (
                  <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-destructive flex items-center justify-center shadow-sm">
                    <AlertCircle className="h-3.5 w-3.5 text-white" />
                  </div>
                )}
                {/* 삭제 버튼 */}
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-9 w-9 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(img.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
                {/* 재시도 버튼 (에러 시) */}
                {img.bgRemovalStatus === "error" && onBgRemoval && (
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute bottom-14 right-2 h-8 w-8"
                    onClick={() => onBgRemoval(img.id, img.file)}
                  >
                    <RotateCw className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>

              {/* 각도 선택 */}
              <div className="p-2">
                <Select
                  value={img.angle}
                  onValueChange={(v) => updateAngle(img.id, v as ImageAngle)}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ANGLE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
