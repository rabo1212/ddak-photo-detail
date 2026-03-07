"use client";

import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface StyleHintInputProps {
  hint: string;
  onHintChange: (hint: string) => void;
}

const QUICK_CHIPS = [
  "고급스러운",
  "자연스러운",
  "미니멀한",
  "따뜻한",
  "시원한",
  "드라마틱한",
  "모던한",
  "빈티지",
  "화사한",
  "차분한",
];

export default function StyleHintInput({ hint, onHintChange }: StyleHintInputProps) {
  const toggleChip = (chip: string) => {
    const current = hint.trim();
    if (current.includes(chip)) {
      // Remove chip
      onHintChange(current.replace(chip, "").replace(/\s+/g, " ").trim());
    } else {
      // Add chip
      onHintChange(current ? `${current} ${chip}` : chip);
    }
  };

  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100">
        <Sparkles className="h-5 w-5 text-violet-500 mt-0.5 shrink-0" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-violet-900">
            AI가 제품을 분석하여 맞춤 연출을 생성합니다
          </p>
          <p className="text-xs text-violet-600">
            업로드한 사진을 AI가 분석해서 제품에 최적화된 4가지 연출(히어로, 디테일, 라이프스타일, 크리에이티브)을 자동으로 만듭니다.
          </p>
        </div>
      </div>

      {/* Quick chips */}
      <div className="space-y-2">
        <label className="text-sm font-medium">분위기 키워드 (선택)</label>
        <div className="flex gap-2 flex-wrap">
          {QUICK_CHIPS.map((chip) => {
            const isActive = hint.includes(chip);
            return (
              <Badge
                key={chip}
                variant={isActive ? "default" : "outline"}
                className={cn(
                  "cursor-pointer transition-all text-sm py-1 px-3",
                  isActive
                    ? "bg-violet-600 hover:bg-violet-700"
                    : "hover:bg-violet-50 hover:border-violet-300"
                )}
                onClick={() => toggleChip(chip)}
              >
                {chip}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Free text hint */}
      <div className="space-y-2">
        <label htmlFor="style-hint" className="text-sm font-medium">
          추가 요청사항 (선택)
        </label>
        <Textarea
          id="style-hint"
          value={hint}
          onChange={(e) => onHintChange(e.target.value)}
          rows={2}
          placeholder="예: 고급스럽고 따뜻한 느낌, 대리석 배경, 골드 포인트..."
          className="text-sm"
        />
        <p className="text-xs text-muted-foreground">
          한국어로 자유롭게 적어주세요. AI가 알아서 반영합니다. 비워두면 제품 특성에 맞게 자동 연출합니다.
        </p>
      </div>
    </div>
  );
}
