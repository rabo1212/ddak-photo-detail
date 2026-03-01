"use client";

import { useState, useCallback } from "react";
import StepWizard from "@/components/wizard/StepWizard";
import ImageUploader from "@/components/upload/ImageUploader";
import PresetSelector from "@/components/prompt/PresetSelector";
import ImageGallery from "@/components/gallery/ImageGallery";
import ProductInfoForm from "@/components/product/ProductInfoForm";
import PagePreview from "@/components/preview/PagePreview";
import ExportOptions from "@/components/preview/ExportOptions";
import { PRESETS } from "@/lib/presets";
import type {
  WizardStep,
  UploadedImage,
  Preset,
  GeneratedImage,
  SelectedImage,
  ProductInfo,
  CopyData,
} from "@/lib/types";

export default function Home() {
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);

  // Step 1: 업로드 이미지
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  // Step 2: 선택된 프리셋
  const [selectedPreset, setSelectedPreset] = useState<Preset | null>(null);
  // Step 3: AI 생성 이미지
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  // Step 4: 선택된 이미지
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  // Step 5: 제품 정보
  const [productInfo, setProductInfo] = useState<ProductInfo>({
    name: "",
    category: "etc",
    price: "",
    target: "",
    features: [""],
    tone: "friendly",
    channel: "smartstore",
  });
  // Step 6-7: 생성 결과
  const [_copyData, setCopyData] = useState<CopyData | null>(null);
  const [pageHtml, setPageHtml] = useState<string>("");

  const canNext = useCallback((): boolean => {
    switch (currentStep) {
      case 1:
        return uploadedImages.length > 0;
      case 2:
        return selectedPreset !== null;
      case 3:
        return generatedImages.length > 0;
      case 4:
        return selectedImages.length > 0;
      case 5:
        return productInfo.name.trim() !== "";
      case 6:
        return pageHtml !== "";
      case 7:
        return true;
      default:
        return false;
    }
  }, [currentStep, uploadedImages, selectedPreset, generatedImages, selectedImages, productInfo, pageHtml]);

  const handleNext = async () => {
    if (currentStep === 3 && generatedImages.length === 0) {
      // AI 이미지 생성 트리거
      await generateImages();
      return;
    }
    if (currentStep === 6 && !pageHtml) {
      // 상세페이지 생성 트리거
      await generatePage();
      return;
    }
    if (currentStep < 7) {
      setCurrentStep((s) => (s + 1) as WizardStep);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => (s - 1) as WizardStep);
    }
  };

  const generateImages = async () => {
    if (!selectedPreset || uploadedImages.length === 0) return;
    setIsGenerating(true);
    try {
      // 각 업로드 이미지에 대해 fal.ai 호출
      const results: GeneratedImage[] = [];
      for (const img of uploadedImages) {
        const formData = new FormData();
        formData.append("image", img.file);
        formData.append("prompt", selectedPreset.prompt_template);
        formData.append("preset_id", selectedPreset.id);
        formData.append("count", "4");

        const res = await fetch("/api/generate-image", {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          results.push(
            ...data.images.map((item: { url: string; id: string }) => ({
              id: item.id,
              url: item.url,
              preset_id: selectedPreset.id,
              original_image_id: img.id,
              prompt: selectedPreset.prompt_template,
            }))
          );
        }
      }
      setGeneratedImages(results);
      if (results.length > 0) {
        setCurrentStep(4);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePage = async () => {
    if (!productInfo.name || selectedImages.length === 0) return;
    setIsGenerating(true);
    try {
      // Step 1: 카피 생성
      const copyRes = await fetch("/api/generate-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productInfo, selectedImages }),
      });
      if (!copyRes.ok) throw new Error("카피 생성 실패");
      const copy: CopyData = await copyRes.json();
      setCopyData(copy);

      // Step 2: HTML 빌드
      const buildRes = await fetch("/api/build-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ copyData: copy, selectedImages, productInfo }),
      });
      if (!buildRes.ok) throw new Error("HTML 빌드 실패");
      const { html } = await buildRes.json();
      setPageHtml(html);
      setCurrentStep(7);
    } catch (err) {
      console.error("페이지 생성 오류:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <StepWizard
      currentStep={currentStep}
      onNext={handleNext}
      onPrev={handlePrev}
      canNext={canNext()}
      isGenerating={isGenerating}
    >
      {/* Step 1: 사진 업로드 */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">누끼 사진 업로드</h2>
          <p className="text-gray-600">
            제품 누끼 사진을 최대 6장 업로드하세요. 정면, 측면, 후면 등 다양한 각도를 권장합니다.
          </p>
          <ImageUploader images={uploadedImages} onImagesChange={setUploadedImages} />
        </div>
      )}

      {/* Step 2: 프리셋 선택 */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">연출 프리셋 선택</h2>
          <p className="text-gray-600">
            제품에 맞는 배경/조명 스타일을 선택하세요.
          </p>
          <PresetSelector presets={PRESETS} selected={selectedPreset} onSelect={setSelectedPreset} />
        </div>
      )}

      {/* Step 3: AI 이미지 생성 */}
      {currentStep === 3 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">AI 이미지 생성</h2>
          <p className="text-gray-600">
            {isGenerating
              ? "AI가 이미지를 생성하고 있습니다..."
              : generatedImages.length > 0
                ? `${generatedImages.length}장의 이미지가 생성되었습니다.`
                : "다음 버튼을 눌러 AI 이미지를 생성하세요."}
          </p>
          <ImageGallery
            generatedImages={generatedImages}
            selectedImages={selectedImages}
            onSelectionChange={setSelectedImages}
            isGenerating={isGenerating}
          />
        </div>
      )}

      {/* Step 4: 이미지 선택 */}
      {currentStep === 4 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">이미지 선택</h2>
          <p className="text-gray-600">
            상세페이지에 사용할 이미지를 선택하고 역할을 지정하세요.
          </p>
          <ImageGallery
            generatedImages={generatedImages}
            selectedImages={selectedImages}
            onSelectionChange={setSelectedImages}
          />
        </div>
      )}

      {/* Step 5: 제품 정보 입력 */}
      {currentStep === 5 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">제품 정보 입력</h2>
          <p className="text-gray-600">
            AI가 상세페이지 카피를 작성하는 데 필요한 정보를 입력하세요.
          </p>
          <ProductInfoForm productInfo={productInfo} onChange={setProductInfo} />
        </div>
      )}

      {/* Step 6: AI 상세페이지 생성 */}
      {currentStep === 6 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">AI 상세페이지 생성</h2>
          <p className="text-gray-600">
            {isGenerating
              ? "AI가 13섹션 상세페이지를 만들고 있습니다..."
              : "다음 버튼을 눌러 상세페이지를 생성하세요."}
          </p>
          {isGenerating && (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
          )}
        </div>
      )}

      {/* Step 7: 미리보기 */}
      {currentStep === 7 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">미리보기 & 내보내기</h2>
          <p className="text-gray-600">
            완성된 상세페이지를 확인하고 HTML을 다운로드하세요.
          </p>
          <PagePreview html={pageHtml} />
          <ExportOptions html={pageHtml} productName={productInfo.name} />
        </div>
      )}
    </StepWizard>
  );
}
