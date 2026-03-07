"use client";

import { useState, useCallback, useEffect } from "react";
import StepWizard from "@/components/wizard/StepWizard";
import ImageUploader from "@/components/upload/ImageUploader";
import StyleHintInput from "@/components/prompt/StyleHintInput";
import ImageGallery from "@/components/gallery/ImageGallery";
import ProductInfoForm from "@/components/product/ProductInfoForm";
import PageMoodSelector from "@/components/product/PageMoodSelector";
import PagePreview from "@/components/preview/PagePreview";
import ExportOptions from "@/components/preview/ExportOptions";
import VideoGenerator from "@/components/video/VideoGenerator";
import CopyEditor from "@/components/editor/CopyEditor";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, X, Pencil, Eye } from "lucide-react";
import type {
  WizardStep,
  UploadedImage,
  GeneratedImage,
  GeneratedPrompt,
  SelectedImage,
  ProductInfo,
  PageMood,
  CopyData,
  VideoGeneration,
} from "@/lib/types";

export default function Home() {
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [error, setError] = useState<string | null>(null);

  // Step 1: 업로드 이미지
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  // Step 2: 스타일 힌트
  const [styleHint, setStyleHint] = useState("");
  const [generatedPrompts, setGeneratedPrompts] = useState<GeneratedPrompt[]>([]);
  // Step 3: AI 생성 이미지
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  // Step 4: 선택된 이미지
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  // Step 5: 제품 정보 + 페이지 무드
  const [productInfo, setProductInfo] = useState<ProductInfo>({
    name: "",
    category: "etc",
    price: "",
    target: "",
    features: [""],
    tone: "friendly",
    channel: "smartstore",
    pageMood: "minimal-white",
  });
  // Step 6-7: 생성 결과
  const [copyData, setCopyData] = useState<CopyData | null>(null);
  const [pageHtml, setPageHtml] = useState<string>("");
  // 영상 생성
  const [videoGenerations, setVideoGenerations] = useState<VideoGeneration[]>([]);
  // 편집 모드
  const [editMode, setEditMode] = useState(false);
  const [editedCopyData, setEditedCopyData] = useState<CopyData | null>(null);
  const [editedSelectedImages, setEditedSelectedImages] = useState<SelectedImage[]>([]);
  const [isRebuilding, setIsRebuilding] = useState(false);

  // localStorage 복구 (마운트 시 1회)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("ddak-state");
      if (!saved) return;
      const s = JSON.parse(saved);
      if (s.currentStep) setCurrentStep(s.currentStep);
      if (s.styleHint) setStyleHint(s.styleHint);
      if (s.generatedPrompts?.length) setGeneratedPrompts(s.generatedPrompts);
      if (s.generatedImages?.length) setGeneratedImages(s.generatedImages);
      if (s.selectedImages?.length) setSelectedImages(s.selectedImages);
      if (s.productInfo) setProductInfo(s.productInfo);
      if (s.copyData) setCopyData(s.copyData);
      if (s.pageHtml) setPageHtml(s.pageHtml);
    } catch {
      // 손상된 데이터는 무시
    }
  }, []);

  // localStorage 저장 (상태 변경 시)
  useEffect(() => {
    const state = {
      currentStep,
      styleHint,
      generatedPrompts,
      generatedImages,
      selectedImages,
      productInfo,
      copyData,
      pageHtml,
    };
    try {
      localStorage.setItem("ddak-state", JSON.stringify(state));
    } catch {
      // 용량 초과 시 무시
    }
  }, [currentStep, styleHint, generatedPrompts, generatedImages, selectedImages, productInfo, copyData, pageHtml]);

  const canNext = useCallback((): boolean => {
    switch (currentStep) {
      case 1:
        return uploadedImages.length > 0;
      case 2:
        return uploadedImages.length > 0; // 힌트는 선택사항
      case 3:
        return generatedImages.length > 0 || uploadedImages.length > 0;
      case 4:
        return selectedImages.length > 0;
      case 5:
        return productInfo.name.trim() !== "";
      case 6:
        return pageHtml !== "" || (productInfo.name.trim() !== "" && selectedImages.length > 0);
      case 7:
        return true;
      default:
        return false;
    }
  }, [currentStep, uploadedImages, generatedImages, selectedImages, productInfo, pageHtml]);

  const handleNext = async () => {
    setError(null);
    // Step 2 → 3: 자동으로 이미지 생성 시작
    if (currentStep === 2) {
      setCurrentStep(3);
      await generateImages();
      return;
    }
    // Step 3에서 재시도 (생성 실패 시)
    if (currentStep === 3 && generatedImages.length === 0) {
      await generateImages();
      return;
    }
    if (currentStep === 6 && !pageHtml) {
      await generatePage();
      return;
    }
    if (currentStep < 7) {
      setCurrentStep((s) => (s + 1) as WizardStep);
    }
  };

  const handlePrev = () => {
    setError(null);
    if (currentStep > 1) {
      setCurrentStep((s) => (s - 1) as WizardStep);
    }
  };

  const generateImages = async () => {
    if (uploadedImages.length === 0) return;
    setIsGenerating(true);
    setError(null);
    try {
      // Step 1: 첫 이미지로 Gemini 제품 분석 (1회만)
      const firstImg = uploadedImages[0];
      const analyzeForm = new FormData();
      analyzeForm.append("image", firstImg.file);
      if (styleHint.trim()) {
        analyzeForm.append("hint", styleHint.trim());
      }

      const analyzeRes = await fetch("/api/analyze-product", {
        method: "POST",
        body: analyzeForm,
      });
      if (!analyzeRes.ok) {
        const errData = await analyzeRes.json().catch(() => ({}));
        throw new Error(errData.error || "제품 분석에 실패했습니다.");
      }
      const analysis = await analyzeRes.json();
      setGeneratedPrompts(analysis.prompts);

      // Step 2: 모든 이미지에 같은 프롬프트 적용 (병렬 생성)
      const genPromises = uploadedImages.map(async (img) => {
        const genForm = new FormData();
        genForm.append("image", img.file);
        genForm.append("prompts", JSON.stringify(analysis.prompts));

        const genRes = await fetch("/api/generate-image", {
          method: "POST",
          body: genForm,
        });
        if (!genRes.ok) {
          const errData = await genRes.json().catch(() => ({}));
          throw new Error(errData.error || "이미지 생성에 실패했습니다.");
        }
        const data = await genRes.json();
        return data.images.map((item: { url: string; id: string; shot_type: string }) => ({
          id: item.id,
          url: item.url,
          shot_type: item.shot_type,
          original_image_id: img.id,
          prompt: analysis.prompts.find((p: GeneratedPrompt) => p.shot_type === item.shot_type)?.scene || "",
        }));
      });

      const settled = await Promise.allSettled(genPromises);
      const results: GeneratedImage[] = [];
      for (const res of settled) {
        if (res.status === "fulfilled") {
          results.push(...res.value);
        }
      }

      setGeneratedImages(results);
      if (results.length > 0) {
        setCurrentStep(4);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "이미지 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePage = async () => {
    if (!productInfo.name || selectedImages.length === 0) return;
    setIsGenerating(true);
    setError(null);
    try {
      const copyRes = await fetch("/api/generate-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productInfo, selectedImages }),
      });
      if (!copyRes.ok) {
        const errData = await copyRes.json().catch(() => ({}));
        throw new Error(errData.error || "카피 생성에 실패했습니다.");
      }
      const copy: CopyData = await copyRes.json();
      setCopyData(copy);

      const buildRes = await fetch("/api/build-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ copyData: copy, selectedImages, productInfo }),
      });
      if (!buildRes.ok) {
        const errData = await buildRes.json().catch(() => ({}));
        throw new Error(errData.error || "HTML 빌드에 실패했습니다.");
      }
      const { html } = await buildRes.json();
      setPageHtml(html);
      setCurrentStep(7);
    } catch (err) {
      setError(err instanceof Error ? err.message : "상세페이지 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsGenerating(false);
    }
  };

  const updatePageMood = (mood: PageMood) => {
    setProductInfo((prev) => ({ ...prev, pageMood: mood }));
  };

  // 편집 모드 진입: 현재 데이터를 deep copy
  const enterEditMode = () => {
    setEditedCopyData(copyData ? JSON.parse(JSON.stringify(copyData)) : null);
    setEditedSelectedImages(selectedImages.map((si) => ({ ...si, image: { ...si.image } })));
    setEditMode(true);
  };

  // 변경사항 적용: build-page API만 재호출
  const rebuildPage = async () => {
    if (!editedCopyData) return;
    setIsRebuilding(true);
    setError(null);
    try {
      const res = await fetch("/api/build-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          copyData: editedCopyData,
          selectedImages: editedSelectedImages,
          productInfo,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "HTML 재빌드에 실패했습니다.");
      }
      const { html } = await res.json();
      setPageHtml(html);
      setCopyData(JSON.parse(JSON.stringify(editedCopyData)));
      setSelectedImages(editedSelectedImages.map((si) => ({ ...si, image: { ...si.image } })));
    } catch (err) {
      setError(err instanceof Error ? err.message : "재빌드 중 오류가 발생했습니다.");
    } finally {
      setIsRebuilding(false);
    }
  };

  const hasEditChanges =
    editMode &&
    (JSON.stringify(editedCopyData) !== JSON.stringify(copyData) ||
      JSON.stringify(editedSelectedImages) !== JSON.stringify(selectedImages));

  return (
    <StepWizard
      currentStep={currentStep}
      onNext={handleNext}
      onPrev={handlePrev}
      canNext={canNext()}
      isGenerating={isGenerating}
    >
      {error && (
        <div className="mb-4 bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p className="text-sm flex-1">{error}</p>
          <button onClick={() => setError(null)} className="shrink-0 hover:opacity-70">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Step 1: 사진 업로드 */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">누끼 사진 업로드</h2>
          <p className="text-muted-foreground">
            제품 누끼 사진을 최대 6장 업로드하세요. 정면, 측면, 후면 등 다양한 각도를 권장합니다.
          </p>
          <ImageUploader images={uploadedImages} onImagesChange={setUploadedImages} />
        </div>
      )}

      {/* Step 2: 연출 설정 (AI 동적 생성) */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">연출 설정</h2>
          <p className="text-muted-foreground">
            원하는 분위기가 있으면 힌트를 입력하세요. 비워두면 AI가 알아서 최적의 연출을 만듭니다.
          </p>
          <StyleHintInput hint={styleHint} onHintChange={setStyleHint} />
        </div>
      )}

      {/* Step 3: AI 이미지 생성 */}
      {currentStep === 3 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">AI 이미지 생성</h2>
          <p className="text-muted-foreground">
            {isGenerating
              ? "AI가 이미지를 생성하고 있습니다..."
              : generatedImages.length > 0
                ? `${generatedImages.length}장의 이미지가 생성되었습니다.`
                : "아래 버튼을 눌러 AI 이미지를 생성하세요."}
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
          <p className="text-muted-foreground">
            상세페이지에 사용할 이미지를 선택하고 역할을 지정하세요.
          </p>
          <ImageGallery
            generatedImages={generatedImages}
            selectedImages={selectedImages}
            onSelectionChange={setSelectedImages}
          />
        </div>
      )}

      {/* Step 5: 제품 정보 + 페이지 무드 (탭) */}
      {currentStep === 5 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">제품 정보 & 페이지 설정</h2>
          <p className="text-muted-foreground">
            제품 정보를 입력하고, 원하는 상세페이지 무드를 선택하세요.
          </p>
          <Tabs defaultValue="product" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="product">제품 정보</TabsTrigger>
              <TabsTrigger value="mood">페이지 무드</TabsTrigger>
            </TabsList>
            <TabsContent value="product" className="mt-4">
              <ProductInfoForm productInfo={productInfo} onChange={setProductInfo} />
            </TabsContent>
            <TabsContent value="mood" className="mt-4">
              <PageMoodSelector selected={productInfo.pageMood} onSelect={updatePageMood} />
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Step 6: AI 상세페이지 생성 */}
      {currentStep === 6 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">AI 상세페이지 생성</h2>
          <p className="text-muted-foreground">
            {isGenerating
              ? "AI가 13섹션 상세페이지를 만들고 있습니다..."
              : "아래 버튼을 눌러 상세페이지를 생성하세요."}
          </p>
          {isGenerating && (
            <div className="flex flex-col items-center gap-4 py-16">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-primary/20 rounded-full" />
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin absolute inset-0" />
              </div>
              <p className="text-sm text-muted-foreground animate-pulse">
                보통 30초~1분 정도 소요됩니다
              </p>
            </div>
          )}
        </div>
      )}

      {/* Step 7: 미리보기 + 편집 */}
      {currentStep === 7 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">미리보기 & 내보내기</h2>
            <Button
              variant={editMode ? "default" : "outline"}
              size="sm"
              onClick={() => (editMode ? setEditMode(false) : enterEditMode())}
            >
              {editMode ? (
                <><Eye className="h-4 w-4 mr-1.5" />편집 닫기</>
              ) : (
                <><Pencil className="h-4 w-4 mr-1.5" />편집하기</>
              )}
            </Button>
          </div>

          {editMode && editedCopyData ? (
            <>
              {/* 데스크탑: 2컬럼 / 모바일: 탭 전환 */}
              <div className="hidden lg:grid lg:grid-cols-[400px_1fr] gap-4">
                <div className="max-h-[80vh] overflow-y-auto">
                  <CopyEditor
                    copyData={editedCopyData}
                    selectedImages={editedSelectedImages}
                    generatedImages={generatedImages}
                    onCopyChange={setEditedCopyData}
                    onImagesChange={setEditedSelectedImages}
                    onApply={rebuildPage}
                    isApplying={isRebuilding}
                    hasChanges={hasEditChanges}
                  />
                </div>
                <PagePreview html={pageHtml} />
              </div>
              {/* 모바일: 탭 */}
              <div className="lg:hidden">
                <Tabs defaultValue="edit">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="edit">편집</TabsTrigger>
                    <TabsTrigger value="preview">미리보기</TabsTrigger>
                  </TabsList>
                  <TabsContent value="edit" className="mt-3">
                    <CopyEditor
                      copyData={editedCopyData}
                      selectedImages={editedSelectedImages}
                      generatedImages={generatedImages}
                      onCopyChange={setEditedCopyData}
                      onImagesChange={setEditedSelectedImages}
                      onApply={rebuildPage}
                      isApplying={isRebuilding}
                      hasChanges={hasEditChanges}
                    />
                  </TabsContent>
                  <TabsContent value="preview" className="mt-3">
                    <PagePreview html={pageHtml} />
                  </TabsContent>
                </Tabs>
              </div>
            </>
          ) : (
            <>
              <p className="text-muted-foreground">
                완성된 상세페이지를 확인하고 HTML을 다운로드하세요.
              </p>
              <PagePreview html={pageHtml} />
            </>
          )}

          <ExportOptions html={pageHtml} productName={productInfo.name} />
          <VideoGenerator
            selectedImages={selectedImages}
            category={productInfo.category}
            videoGenerations={videoGenerations}
            onVideoGenerationsChange={setVideoGenerations}
          />
        </div>
      )}
    </StepWizard>
  );
}
