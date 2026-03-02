"use client";

import { PAGE_MOODS, type PageMood } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface PageMoodSelectorProps {
  selected: PageMood;
  onSelect: (mood: PageMood) => void;
}

export default function PageMoodSelector({ selected, onSelect }: PageMoodSelectorProps) {
  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <p className="text-sm text-muted-foreground">
          상세페이지의 전체적인 비주얼 분위기를 선택하세요.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PAGE_MOODS.map((mood) => {
            const isSelected = selected === mood.value;
            return (
              <div
                key={mood.value}
                className={cn(
                  "relative flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all hover:shadow-sm",
                  isSelected ? "border-primary bg-primary/5" : "border-transparent bg-muted/50 hover:border-muted-foreground/20"
                )}
                onClick={() => onSelect(mood.value)}
              >
                {/* 컬러 프리뷰 */}
                <div className={cn(
                  "w-12 h-12 rounded-lg bg-gradient-to-br shrink-0 shadow-inner",
                  mood.colors
                )} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{mood.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{mood.description}</p>
                </div>
                {isSelected && (
                  <div className="bg-primary text-primary-foreground rounded-full p-0.5 shrink-0">
                    <Check className="h-3 w-3" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
