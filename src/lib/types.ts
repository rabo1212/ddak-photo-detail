// === 위자드 단계 ===
export type WizardStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const STEP_LABELS: Record<WizardStep, string> = {
  1: "사진 업로드",
  2: "연출 설정",
  3: "AI 생성",
  4: "이미지 선택",
  5: "제품 & 무드",
  6: "페이지 생성",
  7: "미리보기",
};

// === 이미지 업로드 ===
export type ImageAngle = "front" | "left" | "right" | "back" | "top" | "bottom";

export interface UploadedImage {
  id: string;
  file: File;
  preview: string; // object URL
  angle: ImageAngle;
}

// === 프리셋 ===
export type LightingType =
  | "studio-softbox"
  | "natural-window"
  | "bathroom-vanity"
  | "golden-hour"
  | "dramatic-rim"
  | "overhead-natural";

export type ColorGrading = "neutral" | "warm" | "cool" | "muted" | "cinematic";

export interface Preset {
  id: string;
  name: string;
  prompt_template: string;
  lighting: LightingType;
  color_grading: ColorGrading;
  best_for: string;
}

// === AI 생성 이미지 ===
export interface GeneratedImage {
  id: string;
  url: string;
  preset_id: string;
  original_image_id: string;
  prompt: string;
}

// === 이미지 역할 + 선택 ===
export type ImageRole = "hero" | "feature" | "lifestyle" | "comparison" | "detail";

export interface SelectedImage {
  image: GeneratedImage;
  role: ImageRole;
}

// === 제품 정보 ===
export type ProductCategory = "cosmetics" | "food" | "electronics" | "fashion" | "living" | "etc";
export type ToneStyle = "friendly" | "professional" | "luxury" | "casual";
export type SalesChannel = "coupang" | "smartstore" | "own" | "instagram" | "amazon";

// === 페이지 비주얼 무드 ===
export type PageMood = "minimal-white" | "luxury-dark" | "soft-pastel" | "vivid-pop" | "modern-gradient";

export const PAGE_MOODS: { value: PageMood; name: string; description: string; colors: string }[] = [
  { value: "minimal-white", name: "미니멀 화이트", description: "깔끔한 흰 배경, 넓은 여백, 절제된 색상", colors: "from-gray-50 to-white" },
  { value: "luxury-dark", name: "럭셔리 다크", description: "다크 배경, 골드/실버 포인트, 고급 느낌", colors: "from-gray-900 to-black" },
  { value: "soft-pastel", name: "소프트 파스텔", description: "연한 파스텔 톤, 부드러운 곡선, 따뜻한 분위기", colors: "from-pink-50 to-purple-50" },
  { value: "vivid-pop", name: "비비드 팝", description: "선명한 원색, 굵은 타이포, 에너지 넘치는 레이아웃", colors: "from-yellow-400 to-red-500" },
  { value: "modern-gradient", name: "모던 그래디언트", description: "그래디언트 배경, 글래스모피즘, 트렌디한 디자인", colors: "from-indigo-500 to-purple-600" },
];

export interface ProductInfo {
  name: string;
  category: ProductCategory;
  price: string;
  target: string;
  features: string[];
  tone: ToneStyle;
  channel: SalesChannel;
  pageMood: PageMood;
}

// === 13섹션 카피 (landing-agent-team에서 가져옴) ===
export interface CopyData {
  meta: {
    title: string;
    description: string;
    og_title: string;
    og_description: string;
    keywords: string[];
  };
  sections: {
    hero: { badge: string; headline: string; subheadline: string; cta_button: string; cta_sub_text: string };
    pain: { title: string; question: string; points: Array<{ icon: string; situation: string; emotion: string }>; closing_hook: string };
    problem: { title: string; reversal_hook: string; causes: Array<{ title: string; description: string }>; perspective_shift: string };
    story: { title: string; before: string; turning_point: string; after: string; proof: string };
    solution: { title: string; product_name: string; one_liner: string; for_whom: string; description: string };
    how: { title: string; subtitle: string; steps: Array<{ number: number; title: string; description: string; result: string }> };
    proof: { title: string; stats: Array<{ number: string; label: string }>; testimonials: Array<{ name: string; role: string; quote: string; result: string }> };
    authority: { title: string; name: string; role: string; bio: string; credentials: string[]; why_message: string };
    benefits: { title: string; core_list: Array<{ icon: string; text: string; value: string }>; bonuses: Array<{ name: string; value: string; description: string }>; total_value: string; actual_price: string };
    risk: { title: string; guarantee: { type: string; period: string; description: string }; faqs: Array<{ question: string; answer: string }>; support: string };
    compare: { title: string; without: string[]; with: string[]; closing_question: string };
    filter: { title: string; recommended: string[]; not_recommended: string[] };
    cta: { headline: string; subheadline: string; original_price: string; sale_price: string; urgency: string; button_text: string; closing_message: string };
  };
}

// === 영상 생성 ===
export interface VideoGeneration {
  id: string;
  sourceImageUrl: string;
  operationName: string;
  status: "pending" | "generating" | "completed" | "failed";
  videoUrl?: string;
  prompt: string;
  error?: string;
}

// 카테고리별 영상 프롬프트
export const VIDEO_PROMPTS: Record<ProductCategory, string> = {
  cosmetics: "Slowly rotate the product 360 degrees on a clean surface, highlight texture and light reflections on the packaging. Smooth camera movement, no text overlay, no voice.",
  food: "Showcase the product naturally, emphasizing freshness and appeal. Gentle camera pan around the product with soft natural lighting. No text overlay, no voice.",
  electronics: "Close-up product showcase highlighting design details and features. Clean minimal background, smooth dolly movement around the product. No text overlay, no voice.",
  fashion: "Model wearing the garment, showing fit and fabric with various poses and gentle rotation. No text overlay, no voice, last frame matches first frame for seamless loop.",
  living: "Product placed in a cozy living space setting, warm ambient lighting, slow camera movement revealing the product in context. No text overlay, no voice.",
  etc: "Elegant product showcase with smooth 360-degree rotation, professional studio lighting, clean background. No text overlay, no voice.",
};

// === 디자인 스펙 ===
export interface DesignSpec {
  style: string;
  colors: {
    primary: { hex: string; tailwind: string };
    secondary: { hex: string; tailwind: string };
    accent: { hex: string; tailwind: string };
    background: { light: { hex: string; tailwind: string }; dark: { hex: string; tailwind: string } };
    text: { primary: { hex: string; tailwind: string }; secondary: { hex: string; tailwind: string } };
  };
}
