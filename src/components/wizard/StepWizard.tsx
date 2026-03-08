"use client";

import { STEP_LABELS, type WizardStep } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

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
    <div className="min-h-screen">
      {/* 상단 프로그레스 */}
      <div className="sticky top-[57px] z-10 glass">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3">
          {/* 모바일: 세그먼트 진행바 */}
          <div className="sm:hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold tracking-tight">{STEP_LABELS[currentStep]}</span>
              <span className="text-xs text-muted-foreground font-medium">{currentStep}/7</span>
            </div>
            <div className="flex gap-1">
              {STEPS.map((step) => (
                <div
                  key={step}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-all duration-500",
                    step <= currentStep
                      ? "progress-gradient"
                      : "bg-border/60"
                  )}
                />
              ))}
            </div>
          </div>

          {/* 데스크탑: 원형 인디케이터 + 라벨 */}
          <div className="hidden sm:flex items-center justify-between"
            role="progressbar"
            aria-valuenow={currentStep}
            aria-valuemin={1}
            aria-valuemax={7}
            aria-label={`${currentStep}/7단계: ${STEP_LABELS[currentStep]}`}
          >
            {STEPS.map((step) => (
              <div key={step} className="flex items-center">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={cn(
                      "rounded-full flex items-center justify-center font-medium transition-all duration-300",
                      step < currentStep && "w-9 h-9 bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-sm text-sm",
                      step === currentStep && "w-10 h-10 bg-gradient-to-br from-primary to-accent text-primary-foreground glow-soft shadow-raised text-sm",
                      step > currentStep && "w-8 h-8 bg-muted/60 text-muted-foreground/60 border border-border text-xs"
                    )}
                  >
                    {step < currentStep ? (
                      <Check className="h-4 w-4 animate-check-pop" />
                    ) : step}
                  </div>
                  <span className={cn(
                    "text-[10px] font-medium transition-colors duration-200 whitespace-nowrap",
                    step === currentStep ? "text-primary" : "text-muted-foreground/60"
                  )}>
                    {STEP_LABELS[step as WizardStep]?.replace(/\s.*/, '')}
                  </span>
                </div>
                {step < 7 && (
                  <div
                    className={cn(
                      "w-8 lg:w-14 h-0.5 mx-1 transition-all duration-500 rounded-full self-start mt-[18px]",
                      step < currentStep ? "bg-gradient-to-r from-primary to-accent" : "bg-border/50"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
      </div>

      {/* 콘텐츠 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div key={currentStep} className="animate-fade-up">
          {children}
        </div>
      </div>

      {/* 하단 플로팅 네비게이션 */}
      <div className="sticky bottom-0 z-10 pb-4 px-4 pointer-events-none">
        <div className="max-w-4xl mx-auto glass rounded-2xl shadow-float border border-white/30 pointer-events-auto">
          <div className="px-4 sm:px-6 py-3 flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={onPrev}
              disabled={currentStep === 1}
              className={cn(
                "rounded-xl transition-all duration-200",
                currentStep === 1 && "invisible"
              )}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              이전
            </Button>

            <Button
              onClick={onNext}
              disabled={!canNext || isGenerating}
              size="lg"
              className="rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-raised hover:shadow-glow transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-white group"
            >
              {isGenerating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {getNextLabel()}
              {!isGenerating && currentStep < 7 && (
                <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
