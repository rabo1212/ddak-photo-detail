import type { Preset } from "./types";

// FLUX Kontext Pro 최적화 프롬프트 — 포토리얼리즘 + Anti-AI 기법 내장
export const PRESETS: Preset[] = [
  {
    id: "minimal-studio",
    name: "미니멀 스튜디오",
    prompt_template:
      "Place the product on a clean matte white acrylic surface. Professional studio photography with a large softbox light positioned above-left at 45 degrees, creating a soft gradient shadow beneath the product. Background is a smooth transition from pure white to very light gray (#F5F5F5). Shallow depth of field with f/2.8 aperture, subtle lens vignetting at edges. Shot with Sony A7R IV, 90mm macro lens. Photorealistic commercial product photography, no visible AI artifacts",
    lighting: "studio-softbox",
    color_grading: "neutral",
    best_for: "전자기기, 화장품, 깔끔한 제품",
  },
  {
    id: "lifestyle-kitchen",
    name: "라이프스타일 주방",
    prompt_template:
      "Place the product on a Calacatta marble kitchen countertop. Warm natural window light streaming from the right side, casting soft directional shadows. Background shows blurred wooden open shelves with ceramic jars, a small potted herb plant, and warm pendant lighting. Morning golden hour atmosphere. Shot with Canon EOS R5, 50mm f/1.8 lens, shallow depth of field with creamy bokeh. Subtle film grain texture, warm color temperature around 5500K. Lifestyle product photography for premium food brand",
    lighting: "natural-window",
    color_grading: "warm",
    best_for: "식품, 주방용품, 건강식품",
  },
  {
    id: "lifestyle-bathroom",
    name: "라이프스타일 욕실",
    prompt_template:
      "Place the product on a white terrazzo bathroom shelf next to a round mirror. Bright, even vanity lighting with a cool-white color temperature. Clean white subway tiles in the background, soft and slightly out of focus. Fresh eucalyptus sprig and a folded cotton towel as minimal styling props. Shot with Nikon Z7, 85mm f/1.4 lens, medium depth of field. Clean and fresh atmosphere with subtle cool tones. High-end skincare brand photography, natural and organic feel",
    lighting: "bathroom-vanity",
    color_grading: "cool",
    best_for: "스킨케어, 바디케어, 뷰티 제품",
  },
  {
    id: "outdoor-natural",
    name: "아웃도어 자연광",
    prompt_template:
      "Place the product on a weathered oak wood table outdoors. Golden hour sunlight from behind-left creating warm rim light around the product and a soft lens flare. Background is a lush blurred garden with green foliage and dappled sunlight. Shallow depth of field with f/2.0 aperture, beautiful circular bokeh in highlights. Shot with Fujifilm X-T5, 56mm f/1.2 lens. Warm organic color palette, slight film grain like Kodak Portra 400. Natural lifestyle photography with authentic outdoor feel",
    lighting: "golden-hour",
    color_grading: "warm",
    best_for: "유기농 제품, 아웃도어 용품, 친환경 제품",
  },
  {
    id: "luxury-dark",
    name: "럭셔리 다크",
    prompt_template:
      "Place the product on a polished black obsidian surface with subtle reflections. Dramatic rim lighting from behind using a strip softbox, creating an elegant glow around the product edges. Deep black background (#0A0A0A) with a subtle radial gradient vignette. Minimal but precise fill light from the front to show product details. Shot with Phase One IQ4, 120mm macro lens, f/5.6. Premium luxury brand photography, moody and sophisticated atmosphere. Subtle warm tone in highlights, cool shadows. High-end commercial quality",
    lighting: "dramatic-rim",
    color_grading: "cinematic",
    best_for: "향수, 주류, 프리미엄 전자기기, 럭셔리 브랜드",
  },
  {
    id: "flat-lay",
    name: "플랫레이",
    prompt_template:
      "Flat lay top-down view of the product centered on a natural linen fabric background. Arranged with carefully styled complementary props: dried flowers, a ceramic dish, a handwritten note card. Soft overhead diffused natural light from a large window, creating very minimal shadows. Shot from directly above with Canon EOS R5, 35mm lens at f/4. Muted warm color palette, desaturated tones like a lifestyle magazine editorial. Instagram-worthy styling with intentional negative space. Subtle texture in the linen fabric visible",
    lighting: "overhead-natural",
    color_grading: "muted",
    best_for: "패션 소품, 문구류, 구독박스, 인스타 콘텐츠",
  },
];
