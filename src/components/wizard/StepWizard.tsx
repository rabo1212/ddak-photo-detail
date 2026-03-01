"use client";

import { STEP_LABELS, type WizardStep } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 프로그레스 */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3">
          {/* 스텝 인디케이터 */}
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                    step < currentStep && "bg-green-500 text-white",
                    step === currentStep && "bg-blue-600 text-white",
                    step > currentStep && "bg-gray-200 text-gray-500"
                  )}
                >
                  {step < currentStep ? "✓" : step}
                </div>
                {step < 7 && (
                  <div
                    className={cn(
                      "hidden sm:block w-12 lg:w-20 h-0.5 mx-1",
                      step < currentStep ? "bg-green-500" : "bg-gray-200"
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          {/* 현재 단계 이름 */}
          <p className="text-center text-sm text-gray-600">
            <span className="font-medium text-gray-900">
              {currentStep}/7
            </span>{" "}
            {STEP_LABELS[currentStep]}
          </p>
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="max-w-4xl mx-auto px-4 py-8">{children}</div>

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
          >
            {isGenerating
              ? "생성 중..."
              : currentStep === 7
                ? "완료"
                : "다음"}
          </Button>
        </div>
      </div>
    </div>
  );
}
