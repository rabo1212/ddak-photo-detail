"use client";

import type { Preset } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Check, Pencil } from "lucide-react";

interface PresetSelectorProps {
  presets: Preset[];
  selected: Preset | null;
  onSelect: (preset: Preset) => void;
  customPrompt: string;
  onCustomPromptChange: (prompt: string) => void;
}

const PRESET_GRADIENTS: Record<string, string> = {
  "minimal-studio": "from-gray-100 via-slate-50 to-white",
  "lifestyle-kitchen": "from-amber-100 via-orange-50 to-yellow-50",
  "lifestyle-bathroom": "from-cyan-50 via-blue-50 to-sky-50",
  "outdoor-natural": "from-green-100 via-emerald-50 to-lime-50",
  "luxury-dark": "from-gray-800 via-gray-900 to-black",
  "flat-lay": "from-stone-200 via-stone-100 to-amber-50",
};

const LIGHTING_EMOJI: Record<string, string> = {
  "studio-softbox": "💡",
  "natural-window": "🌤️",
  "bathroom-vanity": "🪞",
  "golden-hour": "🌅",
  "dramatic-rim": "🌑",
  "overhead-natural": "☀️",
};

export default function PresetSelector({
  presets,
  selected,
  onSelect,
  customPrompt,
  onCustomPromptChange,
}: PresetSelectorProps) {
  const handlePresetSelect = (preset: Preset) => {
    onSelect(preset);
    // 프리셋 선택 시 프롬프트 자동 채우기 (기존 커스텀이 없을 때만)
    if (!customPrompt || customPrompt === presets.find(p => p.id === selected?.id)?.prompt_template) {
      onCustomPromptChange(preset.prompt_template);
    }
  };

  return (
    <div className="space-y-6">
      {/* 프리셋 카드 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {presets.map((preset) => {
          const isSelected = selected?.id === preset.id;
          return (
            <Card
              key={preset.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md relative overflow-hidden",
                isSelected && "ring-2 ring-primary shadow-md"
              )}
              onClick={() => handlePresetSelect(preset)}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 z-10 bg-primary text-primary-foreground rounded-full p-1">
                  <Check className="h-3 w-3" />
                </div>
              )}
              <div className={cn(
                "h-20 bg-gradient-to-br",
                PRESET_GRADIENTS[preset.id] || "from-gray-100 to-gray-200"
              )}>
                <div className="h-full flex items-center justify-center text-3xl opacity-60">
                  {LIGHTING_EMOJI[preset.lighting] || "📷"}
                </div>
              </div>
              <CardContent className="p-4 space-y-2">
                <h3 className="font-semibold">{preset.name}</h3>
                <p className="text-sm text-muted-foreground">{preset.best_for}</p>
                <div className="flex gap-1.5 flex-wrap">
                  <Badge variant="secondary" className="text-xs">
                    {preset.lighting}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {preset.color_grading}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 프롬프트 편집 영역 */}
      {selected && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Pencil className="h-4 w-4 text-muted-foreground" />
            <label htmlFor="custom-prompt" className="text-sm font-medium">
              프롬프트 편집
            </label>
            <span className="text-xs text-muted-foreground">(프리셋 기반, 자유롭게 수정 가능)</span>
          </div>
          <Textarea
            id="custom-prompt"
            value={customPrompt}
            onChange={(e) => onCustomPromptChange(e.target.value)}
            rows={3}
            placeholder="배경, 조명, 분위기 등을 영어로 설명하세요..."
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            영어 프롬프트가 더 정확한 결과를 냅니다. 예: &quot;add pink flowers in background&quot;, &quot;brighter lighting&quot;
          </p>
        </div>
      )}
    </div>
  );
}
