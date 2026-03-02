"use client";

import { STEP_LABELS, type WizardStep } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface StepWizardProps {
  currentStep: WizardStep;
  onNext: () => void;
  onPrev: () => void;
  canNext: boolean;
  isGenerating?: boolean;
  children: React.ReactNode;
}

const STEPS: WizardStep[] = [1, 2, 3, 4, 5, 6, 7];

export default function StepWizard({
  currentStep,
  onNext,
  onPrev,
  canNext,
  isGenerating,
  children,
}: StepWizardProps) {
  const getNextLabel = () => {
    if (isGenerating) return "생성 중...";
    switch (currentStep) {
      case 3: return "AI 이미지 생성하기";
      case 6: return "상세페이지 만들기";
      case 7: return "완료";
      default: return "다음 단계";
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* 상단 프로그레스 */}
      <div className="sticky top-[57px] z-10 bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3">
          {/* 모바일: 프로그레스 바 */}
          <div className="sm:hidden">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium">{STEP_LABELS[currentStep]}</span>
              <span className="text-xs text-muted-foreground">{currentStep}/7</span>
            </div>
            <Progress value={(currentStep / 7) * 100} className="h-1.5" />
          </div>

          {/* 데스크탑: 원형 인디케이터 */}
          <div className="hidden sm:flex items-center justify-between mb-2"
            role="progressbar"
            aria-valuenow={currentStep}
            aria-valuemin={1}
            aria-valuemax={7}
            aria-label={`${currentStep}/7단계: ${STEP_LABELS[currentStep]}`}
          >
            {STEPS.map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                    step < currentStep && "bg-primary text-primary-foreground",
                    step === currentStep && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                    step > currentStep && "bg-muted text-muted-foreground"
                  )}
                >
                  {step < currentStep ? "✓" : step}
                </div>
                {step < 7 && (
                  <div
                    className={cn(
                      "w-12 lg:w-20 h-0.5 mx-1 transition-colors",
                      step < currentStep ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          {/* 현재 단계 이름 (데스크탑) */}
          <p className="hidden sm:block text-center text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {currentStep}/7
            </span>{" "}
            {STEP_LABELS[currentStep]}
          </p>
        </div>
      </div>

      {/* 콘텐츠 — 스텝 전환 애니메이션 */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div key={currentStep} className="animate-in fade-in slide-in-from-right-4 duration-300">
          {children}
        </div>
      </div>

      {/* 하단 네비게이션 */}
      <div className="sticky bottom-0 bg-white border-t shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between">
          <Button
            variant="outline"
            onClick={onPrev}
            disabled={currentStep === 1}
            className={cn(currentStep === 1 && "invisible")}
          >
            이전
          </Button>

          <Button
            onClick={onNext}
            disabled={!canNext || isGenerating}
            size="lg"
          >
            {isGenerating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {getNextLabel()}
          </Button>
        </div>
      </div>
    </div>
  );
}
