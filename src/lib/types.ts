// === 위자드 단계 ===
export type WizardStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const STEP_LABELS: Record<WizardStep, string> = {
  1: "사진 업로드",
  2: "프리셋 선택",
  3: "AI 생성",
  4: "이미지 선택",
  5: "제품 정보",
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

export interface ProductInfo {
  name: string;
  category: ProductCategory;
  price: string;
  target: string;
  features: string[];
  tone: ToneStyle;
  channel: SalesChannel;
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
