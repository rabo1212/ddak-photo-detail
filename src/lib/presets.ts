import type { Preset } from "./types";

export const PRESETS: Preset[] = [
  {
    id: "minimal-studio",
    name: "미니멀 스튜디오",
    prompt_template:
      "Product placed on clean white surface, soft gradient background from white to light gray, studio softbox lighting from above-left, subtle shadow beneath product, minimalist composition, professional product photography",
    lighting: "studio-softbox",
    color_grading: "neutral",
    best_for: "전자기기, 화장품, 깔끔한 제품",
  },
  {
    id: "lifestyle-kitchen",
    name: "라이프스타일 주방",
    prompt_template:
      "Product on marble kitchen countertop, warm natural window light from the right, blurred kitchen background with wooden shelves and plants, morning atmosphere, lifestyle product photography",
    lighting: "natural-window",
    color_grading: "warm",
    best_for: "식품, 주방용품, 건강식품",
  },
  {
    id: "lifestyle-bathroom",
    name: "라이프스타일 화장실",
    prompt_template:
      "Product on white bathroom shelf near a mirror, bright clean tiles, soft vanity lighting, fresh and clean atmosphere, towels and small plants in background, skincare lifestyle photography",
    lighting: "bathroom-vanity",
    color_grading: "cool",
    best_for: "스킨케어, 바디케어, 뷰티 제품",
  },
  {
    id: "outdoor-natural",
    name: "아웃도어 자연광",
    prompt_template:
      "Product on rustic wooden table outdoors, golden hour sunlight, blurred green nature background, warm and organic atmosphere, natural lifestyle photography",
    lighting: "golden-hour",
    color_grading: "warm",
    best_for: "유기농 제품, 아웃도어 용품, 친환경 제품",
  },
  {
    id: "luxury-dark",
    name: "럭셔리 다크",
    prompt_template:
      "Product on dark slate surface, dramatic rim lighting from behind, deep black background, elegant reflections, premium luxury product photography, moody atmosphere",
    lighting: "dramatic-rim",
    color_grading: "cinematic",
    best_for: "향수, 주류, 프리미엄 전자기기, 럭셔리 브랜드",
  },
  {
    id: "flat-lay",
    name: "플랫레이",
    prompt_template:
      "Product shot from directly above, arranged with complementary accessories on light linen fabric, soft overhead natural light, styled flat lay composition, instagram-worthy overhead photography",
    lighting: "overhead-natural",
    color_grading: "muted",
    best_for: "패션 소품, 문구류, 구독박스, 인스타 콘텐츠",
  },
];
