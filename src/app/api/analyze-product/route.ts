import { NextRequest, NextResponse } from "next/server";
import { callGeminiVision, extractJson } from "@/lib/gemini";

export const maxDuration = 60;

const SHOT_TYPE_DIRECTIONS: Record<string, string> = {
  studio: "Clean, minimal background surface with professional studio lighting. Solid or subtly textured backdrop, generous empty space around center where the product will be placed.",
  detail: "Tight, close-up background surface showing rich material texture. Shallow depth-of-field blur in the back, sharp surface detail in the foreground area.",
  lifestyle: "Environmental scene suggesting natural use context — a room, table, or outdoor setting. Include contextual props (plants, books, fabric, utensils) arranged around an empty center spot.",
  ingredient: "Background scene featuring raw materials, natural ingredients, or source elements arranged decoratively. Leave a clear central area empty for the product to be composited onto.",
  creative: "Dramatic or artistic background with bold lighting, vivid colors, or unexpected textures. Editorial magazine feel — striking and memorable atmosphere.",
};

function buildSystemPrompt(shotTypes: string[]): string {
  const promptCount = shotTypes.length;
  const shotTypeDescriptions = shotTypes
    .map((st, i) => `- Prompt ${i + 1} (${st.toUpperCase()}): ${SHOT_TYPE_DIRECTIONS[st] || st}`)
    .join("\n");
  const jsonPrompts = shotTypes
    .map((st) => `    { "shot_type": "${st}", "scene": string, "rationale_ko": string }`)
    .join(",\n");

  return `You are a world-class commercial product photographer and set designer.

TASK: Analyze the product in this nukkei (cutout) photo, then create ${promptCount} BACKGROUND SCENE prompts for FLUX Fill inpainting.

HOW THIS WORKS:
1. The product cutout (with transparent background) already exists
2. FLUX Fill will ONLY generate the background/scene using your prompt
3. The product will be composited on top UNCHANGED afterward
4. Your prompts must describe ONLY what goes BEHIND and AROUND the product — never the product itself

PRODUCT ANALYSIS (use this to choose complementary backgrounds):
Look at the image carefully. Identify:
- What the product is (category, type)
- Colors and materials visible on the product
- Approximate size/scale
- Target market and use context
Then choose backgrounds that COMPLEMENT the product's colors and material. Example: a warm-toned skincare bottle → cool marble or fresh green botanical backdrop for contrast.

PROMPT RULES — WHAT TO DESCRIBE:
Each prompt is a single English paragraph (80-120 words) covering:
1. SURFACE: Specific material the scene is built on ("honed Carrara marble slab", "warm walnut wood table", not just "marble" or "wood")
2. SCENE ELEMENTS: Props, objects, and environmental details AROUND where the product will sit. Describe foreground, mid-ground, and background layers.
3. LIGHTING: Direction, quality, and color of light ("soft window light from camera-left, warm 3200K", "overhead softbox with white bounce fill")
4. COLOR MOOD: Overall color palette and grading feel ("desaturated warm tones", "cool blue-grey with golden accents")
5. End with: "Empty center area for product placement. Ultra-detailed commercial photography, photorealistic."

PROMPT RULES — WHAT TO NEVER DO:
- NEVER mention, describe, or name the product in any prompt
- NEVER add text, typography, logos, labels, or watermarks
- NEVER add decorative stickers, stamps, badges, or overlays
- NEVER describe the product's shape, color, or material as part of the scene
- NEVER use words like "product", "bottle", "box", "package" in the scene description

SHOT DIRECTIONS (${promptCount} background scenes):
${shotTypeDescriptions}

DIVERSITY: Each background must use completely different surface material, color palette, lighting direction, and mood. No repeats.

Return JSON with this exact structure:
{
  "product": { "name": string, "category": string, "material": string, "colors": string[] },
  "prompts": [
${jsonPrompts}
  ]
}

rationale_ko: 1-sentence Korean explanation of why this background works for this product.`;
}

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

    // 동적 샷타입
    const shotTypesRaw = formData.get("shotTypes") as string;
    let shotTypes: string[] = ["studio", "detail", "lifestyle", "creative"];
    if (shotTypesRaw) {
      try {
        const parsed = JSON.parse(shotTypesRaw);
        if (Array.isArray(parsed) && parsed.length > 0) shotTypes = parsed;
      } catch { /* default */ }
    }

    // Build prompt with shot types and optional hint
    let prompt = buildSystemPrompt(shotTypes);
    if (hint.trim()) {
      prompt += `\n\nUSER STYLE DIRECTION (MUST follow these selections):\n${hint.trim()}\n\nIf SCENE THEMES are specified above, you MUST use those exact surface/environment types in your prompts. Distribute them across the prompts — each prompt should use a different theme if multiple are selected. If CUSTOM DIRECTION is specified, apply those preferences (position, props, mood) across all prompts.`;
    }

    const raw = await callGeminiVision(prompt, base64, mimeType);
    const jsonStr = extractJson(raw);
    const result = JSON.parse(jsonStr);

    // Validate structure
    if (!result.product || !result.prompts || result.prompts.length < 1) {
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
