import type { ShotType } from "./types";

export const SHOT_TYPES: {
  value: ShotType;
  label: string;
  labelEn: string;
  description: string;
  icon: string;
}[] = [
  { value: "studio", label: "스튜디오", labelEn: "Studio", description: "깔끔한 배경, 프로 라이팅", icon: "Camera" },
  { value: "detail", label: "디테일", labelEn: "Detail", description: "매크로 클로즈업, 질감 포커스", icon: "Search" },
  { value: "lifestyle", label: "라이프스타일", labelEn: "Lifestyle", description: "일상 속 제품 연출", icon: "Home" },
  { value: "ingredient", label: "재료/성분컷", labelEn: "Ingredient", description: "원재료와 함께 배치", icon: "Leaf" },
  { value: "creative", label: "크리에이티브", labelEn: "Creative", description: "아트 디렉팅 에디토리얼", icon: "Sparkles" },
];

export interface SceneTheme {
  id: string;
  name: string;
  nameEn: string;
  cssPreview: string; // CSS gradient for thumbnail preview
  shotTypes: ShotType[];
}

export const SCENE_THEMES: SceneTheme[] = [
  { id: "marble", name: "대리석", nameEn: "honed Carrara marble surface", cssPreview: "linear-gradient(135deg, #f5f5f5, #e0e0e0, #f0f0f0)", shotTypes: ["studio", "detail"] },
  { id: "wood", name: "우드", nameEn: "warm walnut wood surface", cssPreview: "linear-gradient(135deg, #8B6914, #A0785A, #6B4F2E)", shotTypes: ["studio", "lifestyle"] },
  { id: "natural-light", name: "자연광", nameEn: "soft natural window light, white setting", cssPreview: "linear-gradient(135deg, #FFF8E7, #FFFDF5, #FFF3D6)", shotTypes: ["studio", "lifestyle", "detail"] },
  { id: "cafe", name: "카페", nameEn: "cozy cafe table setting with warm ambient light", cssPreview: "linear-gradient(135deg, #3E2723, #5D4037, #795548)", shotTypes: ["lifestyle"] },
  { id: "kitchen", name: "주방", nameEn: "modern kitchen countertop with cooking props", cssPreview: "linear-gradient(135deg, #ECEFF1, #CFD8DC, #B0BEC5)", shotTypes: ["lifestyle", "ingredient"] },
  { id: "bathroom", name: "욕실", nameEn: "clean bathroom vanity with soft lighting", cssPreview: "linear-gradient(135deg, #E3F2FD, #BBDEFB, #E1F5FE)", shotTypes: ["lifestyle"] },
  { id: "outdoor", name: "아웃도어", nameEn: "outdoor natural setting with greenery and sunlight", cssPreview: "linear-gradient(135deg, #4CAF50, #81C784, #A5D6A7)", shotTypes: ["lifestyle", "creative"] },
  { id: "fabric", name: "패브릭", nameEn: "draped silk or linen fabric backdrop", cssPreview: "linear-gradient(135deg, #F3E5F5, #E1BEE7, #CE93D8)", shotTypes: ["studio", "creative"] },
  { id: "gradient", name: "그래디언트", nameEn: "smooth pastel gradient studio background", cssPreview: "linear-gradient(135deg, #667eea, #764ba2)", shotTypes: ["studio", "creative"] },
  { id: "concrete", name: "콘크리트", nameEn: "raw concrete or cement surface, industrial", cssPreview: "linear-gradient(135deg, #9E9E9E, #BDBDBD, #757575)", shotTypes: ["studio", "detail", "creative"] },
  { id: "sand", name: "모래/해변", nameEn: "sandy beach with ocean blur background", cssPreview: "linear-gradient(135deg, #FFE0B2, #FFCC80, #64B5F6)", shotTypes: ["lifestyle", "creative"] },
  { id: "dark-studio", name: "다크 스튜디오", nameEn: "dark studio with dramatic rim lighting", cssPreview: "linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)", shotTypes: ["studio", "creative"] },
];

/** 선택된 샷타입/테마/커스텀 입력을 Gemini에 보낼 구조화된 힌트로 변환 */
export function buildHintFromSelections(
  shotTypes: ShotType[],
  themes: Record<string, string[]>,
  custom: { position?: string; props?: string; mood?: string },
): string {
  const parts: string[] = [];

  // 선택된 샷타입
  const shotLabels = shotTypes.map((st) => {
    const info = SHOT_TYPES.find((s) => s.value === st);
    return info ? `${info.labelEn} (${info.label})` : st;
  });
  parts.push(`SHOT TYPES: ${shotLabels.join(", ")}`);

  // 선택된 테마
  const allThemeIds = Object.values(themes).flat();
  const uniqueThemes = Array.from(new Set(allThemeIds));
  if (uniqueThemes.length > 0) {
    const themeNames = uniqueThemes
      .map((id) => SCENE_THEMES.find((t) => t.id === id)?.nameEn)
      .filter(Boolean);
    parts.push(`SCENE THEMES: ${themeNames.join(", ")}`);
  }

  // 커스텀 입력
  const customParts: string[] = [];
  if (custom.position?.trim()) customParts.push(`position: ${custom.position.trim()}`);
  if (custom.props?.trim()) customParts.push(`props: ${custom.props.trim()}`);
  if (custom.mood?.trim()) customParts.push(`mood: ${custom.mood.trim()}`);
  if (customParts.length > 0) {
    parts.push(`CUSTOM DIRECTION: ${customParts.join(", ")}`);
  }

  return parts.join("\n");
}
