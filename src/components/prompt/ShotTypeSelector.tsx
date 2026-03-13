"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { SHOT_TYPES, SCENE_THEMES } from "@/lib/shot-types";
import type { ShotType, CustomDirection } from "@/lib/types";
import {
  Camera,
  Search,
  Home,
  Leaf,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";

const ICON_MAP: Record<string, React.ElementType> = {
  Camera,
  Search,
  Home,
  Leaf,
  Sparkles,
};

interface ShotTypeSelectorProps {
  selectedShotTypes: ShotType[];
  onShotTypesChange: (types: ShotType[]) => void;
  selectedThemes: Record<string, string[]>;
  onThemesChange: (themes: Record<string, string[]>) => void;
  customDirection: CustomDirection;
  onCustomDirectionChange: (dir: CustomDirection) => void;
}

export default function ShotTypeSelector({
  selectedShotTypes,
  onShotTypesChange,
  selectedThemes,
  onThemesChange,
  customDirection,
  onCustomDirectionChange,
}: ShotTypeSelectorProps) {
  const [showCustom, setShowCustom] = useState(false);

  const toggleShotType = (type: ShotType) => {
    if (selectedShotTypes.includes(type)) {
      if (selectedShotTypes.length <= 1) return; // 최소 1개 필수
      onShotTypesChange(selectedShotTypes.filter((t) => t !== type));
      // 해당 샷타입의 테마도 제거
      const next = { ...selectedThemes };
      delete next[type];
      onThemesChange(next);
    } else {
      onShotTypesChange([...selectedShotTypes, type]);
    }
  };

  const toggleTheme = (shotType: ShotType, themeId: string) => {
    const current = selectedThemes[shotType] || [];
    const next = current.includes(themeId)
      ? current.filter((id) => id !== themeId)
      : [...current, themeId];
    onThemesChange({ ...selectedThemes, [shotType]: next });
  };

  // 선택된 샷타입에 맞는 테마만 필터
  const availableThemes = SCENE_THEMES.filter((t) =>
    t.shotTypes.some((st) => selectedShotTypes.includes(st))
  );

  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10 shadow-sm">
        <Sparkles className="h-5 w-5 text-primary mt-0.5 shrink-0" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">
            AI가 제품을 분석하여 맞춤 연출을 생성합니다
          </p>
          <p className="text-xs text-muted-foreground">
            촬영 타입을 선택하고, 원하는 배경 테마를 골라주세요. AI가 제품 특성에 맞게 최적의 연출을 만듭니다.
          </p>
        </div>
      </div>

      {/* Shot Type Cards */}
      <div className="space-y-2">
        <label className="text-sm font-medium">촬영 타입 (최소 1개)</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {SHOT_TYPES.map((shot) => {
            const isActive = selectedShotTypes.includes(shot.value);
            const Icon = ICON_MAP[shot.icon] || Camera;
            return (
              <button
                key={shot.value}
                type="button"
                onClick={() => toggleShotType(shot.value)}
                className={cn(
                  "relative flex flex-col items-start gap-1.5 p-4 rounded-2xl border-2 transition-all text-left",
                  "hover:-translate-y-0.5 active:scale-[0.98]",
                  isActive
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/30 hover:bg-primary/[0.02]"
                )}
              >
                <div className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center",
                  isActive
                    ? "bg-gradient-to-br from-primary to-accent text-white"
                    : "bg-muted text-muted-foreground"
                )}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{shot.label}</p>
                  <p className="text-xs text-muted-foreground">{shot.description}</p>
                </div>
                {isActive && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Theme Presets */}
      {availableThemes.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">배경 테마 (선택)</label>
          <div className="flex gap-2 flex-wrap">
            {availableThemes.map((theme) => {
              // 해당 테마가 선택된 샷타입 중 어디서든 선택되었는지 체크
              const isActive = Object.values(selectedThemes).some((ids) =>
                ids.includes(theme.id)
              );
              // 이 테마를 토글할 때 어느 샷타입에 연결할지 — 첫번째 매칭
              const linkedShotType = selectedShotTypes.find((st) =>
                theme.shotTypes.includes(st)
              );
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => {
                    if (linkedShotType) toggleTheme(linkedShotType, theme.id);
                  }}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-sm",
                    "hover:-translate-y-0.5 active:scale-[0.98]",
                    isActive
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/30"
                  )}
                >
                  <div
                    className="w-6 h-6 rounded-lg shrink-0 border border-black/5"
                    style={{ background: theme.cssPreview }}
                  />
                  <span>{theme.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Custom Direction (collapsible) */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setShowCustom(!showCustom)}
          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          {showCustom ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          추가 커스텀 설정
        </button>
        {showCustom && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-muted/30 border">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">배치</label>
              <Input
                placeholder="예: 45도 각도, 중앙 배치"
                value={customDirection.position || ""}
                onChange={(e) =>
                  onCustomDirectionChange({ ...customDirection, position: e.target.value })
                }
                className="text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">소품</label>
              <Input
                placeholder="예: 꽃잎, 물방울"
                value={customDirection.props || ""}
                onChange={(e) =>
                  onCustomDirectionChange({ ...customDirection, props: e.target.value })
                }
                className="text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">분위기</label>
              <Input
                placeholder="예: 따뜻하고 고급스러운"
                value={customDirection.mood || ""}
                onChange={(e) =>
                  onCustomDirectionChange({ ...customDirection, mood: e.target.value })
                }
                className="text-sm"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
