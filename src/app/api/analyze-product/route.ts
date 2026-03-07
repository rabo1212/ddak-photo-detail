import { NextRequest, NextResponse } from "next/server";
import { callGeminiVision, extractJson } from "@/lib/gemini";

export const maxDuration = 30;

const SYSTEM_PROMPT = `You are a world-class commercial product photographer and creative director.

TASK: Analyze the product in this nukkei (cutout) photo, then create 4 completely different photographic direction prompts for FLUX Kontext Pro AI image generation.

PRODUCT ANALYSIS:
Look at the image carefully. Identify:
- What the product is (be specific)
- Materials, textures, colors visible
- Approximate size/scale
- Most likely target market and use context

PROMPT REQUIREMENTS (for each of the 4 prompts):
Each prompt MUST be a single English paragraph (80-120 words) containing ALL of these elements:
1. SURFACE: What the product is placed on (specific material: "honed Carrara marble slab", not just "marble")
2. BACKGROUND: Detailed scene description with depth layers (foreground props, mid-ground, background blur)
3. LIGHTING: Specific setup with equipment names (e.g., "large octabox key light at 45 degrees camera-left, white v-flat fill")
4. CAMERA: Exact specs (e.g., "Sony A7R V, 90mm f/2.8 macro, ISO 100, 1/125s")
5. COLOR: Color temperature in Kelvin + grading style (e.g., "5200K daylight balanced, desaturated warm tones like Kodak Portra 160")
6. COMPOSITION: Specific framing instruction (e.g., "rule of thirds with product at right intersection, 40% negative space left for text")
7. QUALITY: End with "Ultra-detailed commercial photography, photorealistic, no AI artifacts, subtle film grain"

DIVERSITY RULES (CRITICAL - this is the most important requirement):
The 4 prompts MUST maximize variety across ALL dimensions. Each prompt must use COMPLETELY DIFFERENT lighting direction, color temperature, surface material, camera angle, and mood.
- Prompt 1 (HERO): Wide/medium shot, clean studio or editorial setting, product-centric, generous negative space for banner use
- Prompt 2 (DETAIL): Extreme macro/close-up, f/1.4-2.8 shallow DOF, texture and material focus, intimate perspective
- Prompt 3 (LIFESTYLE): Environmental scene showing product in natural use context, storytelling, warm lived-in atmosphere with contextual props
- Prompt 4 (CREATIVE): Unexpected angle, dramatic or artistic lighting, editorial/magazine style, bold and memorable

Never repeat the same background concept, prop, lighting setup, or color palette between prompts.
Be wildly creative and specific. Avoid generic descriptions. Each scene should feel like it was art-directed for a high-end campaign.

Return JSON with this exact structure:
{
  "product": { "name": string, "category": string, "material": string, "colors": string[] },
  "prompts": [
    { "shot_type": "hero", "scene": string, "rationale_ko": string },
    { "shot_type": "detail", "scene": string, "rationale_ko": string },
    { "shot_type": "lifestyle", "scene": string, "rationale_ko": string },
    { "shot_type": "creative", "scene": string, "rationale_ko": string }
  ]
}

rationale_ko is a short Korean explanation (1 sentence) of what this shot achieves.`;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get("image") as File | null;
    const hint = (formData.get("hint") as string) || "";

    if (!imageFile) {
      return NextResponse.json({ error: "image는 필수입니다." }, { status: 400 });
    }

    // File -> base64 (크기 제한)
    const buffer = await imageFile.arrayBuffer();
    const MAX_IMAGE_SIZE = 4 * 1024 * 1024; // 4MB
    if (buffer.byteLength > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: "이미지가 너무 큽니다. 4MB 이하의 이미지를 사용해주세요." },
        { status: 400 }
      );
    }
    const base64 = Buffer.from(buffer).toString("base64");
    const mimeType = imageFile.type || "image/png";

    // Build prompt with optional hint
    let prompt = SYSTEM_PROMPT;
    if (hint.trim()) {
      prompt += `\n\nUSER STYLE DIRECTION: "${hint.trim()}". Incorporate this mood/direction into all 4 prompts while maintaining maximum diversity between them. Let this hint strongly influence the overall atmosphere, color choices, and styling direction.`;
    }

    const raw = await callGeminiVision(prompt, base64, mimeType);
    const jsonStr = extractJson(raw);
    const result = JSON.parse(jsonStr);

    // Validate structure
    if (!result.product || !result.prompts || result.prompts.length < 4) {
      throw new Error("Gemini 응답 구조가 올바르지 않습니다.");
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("analyze-product error:", err);
    return NextResponse.json(
      { error: "제품 분석 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
