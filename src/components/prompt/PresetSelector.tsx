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
              "cursor-pointer transition-all hover:shadow-md relative",
              isSelected && "ring-2 ring-blue-600 shadow-md"
            )}
            onClick={() => onSelect(preset)}
          >
            {isSelected && (
              <div className="absolute top-3 right-3 bg-blue-600 text-white rounded-full p-1">
                <Check className="h-3 w-3" />
              </div>
            )}
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">
                  {LIGHTING_EMOJI[preset.lighting] || "📷"}
                </span>
                <h3 className="font-semibold">{preset.name}</h3>
              </div>
              <p className="text-sm text-gray-500">{preset.best_for}</p>
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
