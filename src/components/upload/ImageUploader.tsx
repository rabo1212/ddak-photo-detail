"use client";

import { useCallback } from "react";
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
import { X, Upload } from "lucide-react";

interface ImageUploaderProps {
  images: UploadedImage[];
  onImagesChange: (images: UploadedImage[]) => void;
}

const ANGLE_OPTIONS: { value: ImageAngle; label: string }[] = [
  { value: "front", label: "정면" },
  { value: "left", label: "좌측" },
  { value: "right", label: "우측" },
  { value: "back", label: "후면" },
  { value: "top", label: "윗면" },
  { value: "bottom", label: "아랫면" },
];

export default function ImageUploader({ images, onImagesChange }: ImageUploaderProps) {
  const onDrop = useCallback(
    (files: File[]) => {
      const remaining = 6 - images.length;
      const newFiles = files.slice(0, remaining);
      const newImages: UploadedImage[] = newFiles.map((file) => ({
        id: uuid(),
        file,
        preview: URL.createObjectURL(file),
        angle: "front" as ImageAngle,
      }));
      onImagesChange([...images, ...newImages]);
    },
    [images, onImagesChange]
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
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-10 w-10 text-gray-400 mb-3" />
          <p className="text-gray-600 font-medium">
            {isDragActive ? "여기에 놓으세요!" : "사진을 드래그하거나 클릭해서 업로드"}
          </p>
          <p className="text-sm text-gray-400 mt-1">
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
              className="relative group border rounded-lg overflow-hidden bg-white"
            >
              {/* 이미지 */}
              <div className="aspect-square relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.preview}
                  alt={`제품 사진 (${img.angle})`}
                  className="w-full h-full object-cover"
                />
                {/* 삭제 버튼 */}
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(img.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* 각도 선택 */}
              <div className="p-2">
                <Select
                  value={img.angle}
                  onValueChange={(v) => updateAngle(img.id, v as ImageAngle)}
                >
                  <SelectTrigger className="h-8 text-xs">
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
