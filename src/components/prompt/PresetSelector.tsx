"use client";

import type { Preset } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface PresetSelectorProps {
  presets: Preset[];
  selected: Preset | null;
  onSelect: (preset: Preset) => void;
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
}: PresetSelectorProps) {
  return (
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
            onClick={() => onSelect(preset)}
          >
            {isSelected && (
              <div className="absolute top-3 right-3 z-10 bg-primary text-primary-foreground rounded-full p-1">
                <Check className="h-3 w-3" />
              </div>
            )}
            {/* 프리셋 미리보기 그래디언트 */}
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
  );
}
