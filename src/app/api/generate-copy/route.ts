import { NextRequest, NextResponse } from "next/server";
import { callGemini, extractJson } from "@/lib/gemini";
import type { ProductInfo, SelectedImage } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { productInfo, selectedImages } = (await req.json()) as {
      productInfo: ProductInfo;
      selectedImages: SelectedImage[];
    };

    if (!productInfo?.name) {
      return NextResponse.json({ error: "제품명이 필요합니다." }, { status: 400 });
    }

    // 이미지 역할 요약
    const imageRoles = selectedImages.map((si) => `- ${si.role}: ${si.image.url}`).join("\n");

    const toneMap: Record<string, string> = {
      friendly: "친근하고 따뜻한",
      professional: "전문적이고 신뢰감 있는",
      luxury: "고급스럽고 세련된",
      casual: "캐주얼하고 가벼운",
    };

    const categoryMap: Record<string, string> = {
      cosmetics: "화장품/뷰티",
      food: "식품/건강",
      electronics: "전자기기/IT",
      fashion: "의류/패션",
      living: "생활용품",
      etc: "기타",
    };

    const prompt = `당신은 이커머스 상세페이지 전문 카피라이터입니다.
아래 제품 정보를 바탕으로 13섹션 판매 카피를 JSON으로 작성하세요.

## 제품 정보
- 제품명: ${productInfo.name}
- 카테고리: ${categoryMap[productInfo.category] || productInfo.category}
- 가격: ${productInfo.price || "미정"}
- 타겟 고객: ${productInfo.target || "일반 소비자"}
- 핵심 특장점: ${productInfo.features.filter(Boolean).join(", ")}
- 톤앤매너: ${toneMap[productInfo.tone] || "친근한"}
- 판매 채널: ${productInfo.channel}

## 사용 가능한 이미지
${imageRoles || "없음"}

## 13섹션 구조
1. Hero: 3초 안에 잡는 헤드라인 + CTA
2. Pain: 고객 고민 3~5개 (공감)
3. Problem: 기존 해결책의 한계 (반전)
4. Story: 브랜드 탄생 배경
5. Solution: 제품 소개 (한줄 소개)
6. How: 사용법 3단계
7. Proof: 수치/후기 (신뢰)
8. Authority: 브랜드/전문가 신뢰도
9. Benefits: 핵심 장점 3~5개
10. Risk: 환불보증/FAQ
11. Compare: 우리 vs 기존 비교
12. Filter: 추천/비추천 대상
13. CTA: 최종 구매 유도

## 출력 형식
아래 JSON 구조를 정확히 따르세요:
\`\`\`json
{
  "meta": {
    "title": "페이지 타이틀",
    "description": "메타 설명",
    "og_title": "OG 타이틀",
    "og_description": "OG 설명",
    "keywords": ["키워드1", "키워드2"]
  },
  "sections": {
    "hero": { "badge": "뱃지텍스트", "headline": "헤드라인", "subheadline": "서브", "cta_button": "CTA", "cta_sub_text": "서브텍스트" },
    "pain": { "title": "제목", "question": "질문", "points": [{ "icon": "이모지", "situation": "상황", "emotion": "감정" }], "closing_hook": "마무리" },
    "problem": { "title": "제목", "reversal_hook": "반전", "causes": [{ "title": "원인", "description": "설명" }], "perspective_shift": "시각전환" },
    "story": { "title": "제목", "before": "이전", "turning_point": "전환점", "after": "이후", "proof": "증거" },
    "solution": { "title": "제목", "product_name": "제품명", "one_liner": "한줄소개", "for_whom": "대상", "description": "설명" },
    "how": { "title": "제목", "subtitle": "부제", "steps": [{ "number": 1, "title": "단계", "description": "설명", "result": "결과" }] },
    "proof": { "title": "제목", "stats": [{ "number": "수치", "label": "라벨" }], "testimonials": [{ "name": "이름", "role": "역할", "quote": "후기", "result": "결과" }] },
    "authority": { "title": "제목", "name": "이름", "role": "역할", "bio": "소개", "credentials": ["자격"], "why_message": "메시지" },
    "benefits": { "title": "제목", "core_list": [{ "icon": "이모지", "text": "장점", "value": "가치" }], "bonuses": [{ "name": "보너스", "value": "가치", "description": "설명" }], "total_value": "총가치", "actual_price": "실제가격" },
    "risk": { "title": "제목", "guarantee": { "type": "보증유형", "period": "기간", "description": "설명" }, "faqs": [{ "question": "질문", "answer": "답변" }], "support": "지원정보" },
    "compare": { "title": "제목", "without": ["기존방법"], "with": ["우리제품"], "closing_question": "마무리질문" },
    "filter": { "title": "제목", "recommended": ["추천대상"], "not_recommended": ["비추천대상"] },
    "cta": { "headline": "헤드라인", "subheadline": "서브", "original_price": "원가", "sale_price": "할인가", "urgency": "긴급성", "button_text": "버튼텍스트", "closing_message": "마무리" }
  }
}
\`\`\`

한국어로 작성하세요. 판매를 유도하는 설득력 있는 카피를 작성하되, 과장하지 마세요.`;

    const result = await callGemini(prompt);
    const jsonStr = extractJson(result);
    const copyData = JSON.parse(jsonStr);

    return NextResponse.json(copyData);
  } catch (err) {
    console.error("generate-copy error:", err);
    return NextResponse.json(
      { error: "카피 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
