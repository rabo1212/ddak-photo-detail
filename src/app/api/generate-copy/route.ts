import { NextRequest, NextResponse } from "next/server";
import { callGeminiJson } from "@/lib/gemini";
import type { ProductInfo, SelectedImage } from "@/lib/types";

// ── 카테고리별 카피 전략 ──
const CATEGORY_COPY_RULES: Record<string, string> = {
  cosmetics: `
    화장품 카피 규칙:
    - Hero 후킹: "기능강화" 유형 사용 (예: "눈가 잔주름을 쏵 사라지게 하는 크림")
    - Pain: 피부 고민을 구체적으로 (건조함, 트러블, 칙칙함 등)
    - 핵심 성분 3개를 과학적 근거와 함께 설명
    - Authority: 피부과 전문의 추천, 임상시험 결과 활용
    - 절대 의약품 효능 표현 금지 (식약처 규제)
    - Proof: "사용 2주 후 92%가 피부결 개선 체감" 같은 구체적 수치`,
  food: `
    식품 카피 규칙:
    - Hero 후킹: "확실한 변화" 유형 사용 (예: "매일 아침 한 잔으로 활력 충전")
    - Pain: 바쁜 일상, 영양 불균형, 건강 걱정 등
    - 원재료 산지와 제조 과정의 안전성 강조
    - Authority: HACCP 인증, 전문 영양사 감수
    - "세계 최고", "100% 효과 보장" 등 과장 표현 절대 금지 (식약처)
    - Benefits: 영양성분을 일상 혜택으로 번역 ("비타민C 1000mg" → "하루 필요량 100% 충족")`,
  electronics: `
    전자제품 카피 규칙:
    - Hero 후킹: "기능강화" 유형 사용 (예: "배터리 걱정 없는 72시간 연속 사용")
    - Pain: 기존 제품의 불편함 (느림, 무거움, 복잡함)
    - 스펙을 사용자 혜택으로 번역 ("8GB RAM" → "10개 앱을 동시에 끊김 없이")
    - Compare: 경쟁 제품과의 객관적 스펙 비교 (타사명 직접 언급은 피할 것)
    - Authority: KC인증, 기술 특허, A/S 보증
    - How: 개봉→설정→사용의 3단계로 "쉽다"는 인상 전달`,
  fashion: `
    패션 카피 규칙:
    - Hero 후킹: "확실한 변화" 유형 사용 (예: "입는 순간 체형이 달라 보이는 핏")
    - Pain: 핏 불만족, 소재 불편함, 코디 고민
    - 소재감과 핏을 감각적으로 묘사 ("부드러운 실크 터치", "바디라인을 잡아주는 스트레치")
    - Benefits: 실루엣 변화, 다양한 코디 가능성 강조
    - Proof: 실제 구매자의 체형별 착용 후기`,
  living: `
    생활용품 카피 규칙:
    - Hero 후킹: "시간단축" 유형 사용 (예: "5분 만에 정리 완료, 깔끔한 아침")
    - Pain: 일상의 구체적 불편함과 시간 낭비
    - How: 사용법을 최대한 간단하게 (3스텝 이내)
    - Benefits: 시간 절약, 공간 절약, 스트레스 감소 등 일상 개선
    - 실사용 장면 묘사로 공감 유도`,
  etc: `
    기본 카피 규칙:
    - Hero 후킹: 제품의 가장 강력한 장점 1가지만 강조
    - 타겟 고객의 구체적 상황에 공감하는 카피
    - 추상적 표현 대신 구체적 수치와 사례 사용`,
};

export async function POST(req: NextRequest) {
  try {
    const { productInfo, selectedImages } = (await req.json()) as {
      productInfo: ProductInfo;
      selectedImages: SelectedImage[];
    };

    if (!productInfo?.name) {
      return NextResponse.json({ error: "제품명이 필요합니다." }, { status: 400 });
    }

    const imageRoles = selectedImages.map((si) => `- ${si.role}: ${si.image.url}`).join("\n");

    const toneMap: Record<string, string> = {
      friendly: "친근하고 따뜻한 (~해요 체)",
      professional: "전문적이고 신뢰감 있는 (~합니다 체)",
      luxury: "고급스럽고 세련된 (간결한 명사형)",
      casual: "캐주얼하고 가벼운 (~해요 체, 이모지 활용)",
    };

    const categoryMap: Record<string, string> = {
      cosmetics: "화장품/뷰티",
      food: "식품/건강",
      electronics: "전자기기/IT",
      fashion: "의류/패션",
      living: "생활용품",
      etc: "기타",
    };

    const categoryRules = CATEGORY_COPY_RULES[productInfo.category] || CATEGORY_COPY_RULES["etc"];

    const prompt = `당신은 한국 이커머스 탑셀러들의 상세페이지 카피를 쓰는 전문 카피라이터입니다.
"사고 싶다"는 감정을 만드는 게 목표입니다. 정보 나열이 아니라 설득 구조를 설계하세요.

═══════════════════════════════════════
## 제품 정보
- 제품명: ${productInfo.name}
- 카테고리: ${categoryMap[productInfo.category] || productInfo.category}
- 가격: ${productInfo.price || "미정"}
- 타겟 고객: ${productInfo.target || "일반 소비자"}
- 핵심 특장점: ${productInfo.features.filter(Boolean).join(", ") || "없음"}
- 톤앤매너: ${toneMap[productInfo.tone] || "친근한"}
- 판매 채널: ${productInfo.channel}
═══════════════════════════════════════

## 카테고리별 카피 전략
${categoryRules}

## 후킹 메시지 원칙 (Hero 섹션)
- 반드시 아래 3가지 유형 중 1가지만 선택:
  1. 시간단축: "2주 만에 ~" (기간 + 결과)
  2. 기능강화: "~를 쏵 해결하는" (고민 + 해결)
  3. 확실한 변화: "~에서 ~으로" (Before → After)
- 핵심 1가지만 강조 (여러 장점 나열 금지)
- 구체적 숫자 포함하면 신뢰도 상승

## 설득 구조 원칙
- 판매 증거를 먼저 보여줘야 함 (Hero 뱃지에 판매량/리뷰 수치)
- 문제를 건드린 후 해결책 제시 (Pain → Solution 순서)
- 스펙이 아니라 "고객의 혜택"으로 번역
- 각 섹션이 자연스럽게 다음 섹션으로 이어지는 흐름
- 문구체를 반드시 통일 (~해요 체 또는 ~합니다 체, 혼용 금지)

## 사용 가능한 이미지
${imageRoles || "없음"}

## 13섹션 구조 — JSON으로 출력
1. Hero: 3초 안에 잡는 헤드라인 + 판매 증거 뱃지 + CTA
2. Pain: 타겟 고객의 구체적 고민 3~5개 (공감, 감정 자극)
3. Problem: 기존 해결책의 한계 → 반전 (시각전환)
4. Story: 브랜드 탄생 배경 (Before → 전환점 → After)
5. Solution: 제품의 한줄 소개 + "누구를 위한" 명확히
6. How: 사용법 3단계 (각 단계에 기대 결과 포함)
7. Proof: 핵심 수치 3개 + 구매자 후기 3개 (구체적 결과)
8. Authority: 전문가/브랜드 신뢰도 (인증, 자격, 경력)
9. Benefits: 핵심 장점 3~5개 (아이콘 + 혜택 + 가치) + 보너스
10. Risk: 보증 정책 + FAQ 3~5개 (불안 해소)
11. Compare: 기존 방법 vs 우리 제품 (X vs O 대비)
12. Filter: 추천/비추천 대상 (자격 효과로 구매 욕구 자극)
13. CTA: 정가 → 할인가 앵커링 + 긴급성 + 강력한 CTA 문구

## 출력 형식
아래 JSON 구조를 정확히 따르세요:
\`\`\`json
{
  "meta": {
    "title": "페이지 타이틀 (SEO 최적화, 50자 이내)",
    "description": "메타 설명 (120자 이내, 핵심 키워드 포함)",
    "og_title": "OG 타이틀",
    "og_description": "OG 설명",
    "keywords": ["키워드1", "키워드2", "키워드3", "키워드4", "키워드5"]
  },
  "sections": {
    "hero": { "badge": "뱃지텍스트 (숫자 포함, 예: 누적 판매 5만개)", "headline": "후킹 헤드라인 (15자 이내)", "subheadline": "보조 설명 (30자 이내)", "cta_button": "CTA 버튼 텍스트", "cta_sub_text": "부가 정보 (무료배송, 당일발송 등)" },
    "pain": { "title": "제목", "question": "타겟에게 던지는 질문", "points": [{ "icon": "이모지", "situation": "구체적 상황", "emotion": "그때의 감정" }], "closing_hook": "마무리 훅 (해결 암시)" },
    "problem": { "title": "제목", "reversal_hook": "반전 문구", "causes": [{ "title": "원인", "description": "왜 기존 방법이 안 되는지" }], "perspective_shift": "새로운 시각 제시" },
    "story": { "title": "제목", "before": "이전 상황 (공감)", "turning_point": "전환점 (계기)", "after": "변화된 현재", "proof": "증거 (구체적)" },
    "solution": { "title": "제목", "product_name": "제품명", "one_liner": "한줄 소개 (혜택 중심)", "for_whom": "이런 분께 추천", "description": "핵심 설명 (3문장 이내)" },
    "how": { "title": "제목", "subtitle": "부제", "steps": [{ "number": 1, "title": "단계명", "description": "방법", "result": "이 단계의 결과" }] },
    "proof": { "title": "제목", "stats": [{ "number": "수치 (큰 숫자)", "label": "라벨" }], "testimonials": [{ "name": "이름", "role": "직업/상황", "quote": "구체적 후기", "result": "수치적 결과" }] },
    "authority": { "title": "제목", "name": "대표/전문가명", "role": "직함", "bio": "소개 (2문장)", "credentials": ["인증/자격1", "인증/자격2"], "why_message": "왜 이 제품을 만들었는지" },
    "benefits": { "title": "제목", "core_list": [{ "icon": "이모지", "text": "장점 (혜택 중심)", "value": "환산 가치" }], "bonuses": [{ "name": "보너스명", "value": "가치", "description": "설명" }], "total_value": "총 가치", "actual_price": "실제 가격" },
    "risk": { "title": "제목", "guarantee": { "type": "보증 유형", "period": "기간", "description": "상세 설명" }, "faqs": [{ "question": "자주 묻는 질문", "answer": "명확한 답변" }], "support": "CS 지원 정보" },
    "compare": { "title": "제목", "without": ["기존 방법의 한계 (❌ 접두사)"], "with": ["우리 제품의 장점 (✅ 접두사)"], "closing_question": "선택을 유도하는 질문" },
    "filter": { "title": "제목", "recommended": ["이런 분께 추천 (구체적 상황)"], "not_recommended": ["이런 분은 비추천 (솔직하게)"] },
    "cta": { "headline": "최종 헤드라인", "subheadline": "마지막 설득", "original_price": "정가", "sale_price": "할인가", "urgency": "긴급성 문구", "button_text": "CTA 버튼", "closing_message": "마무리 한마디" }
  }
}
\`\`\`

한국어로 작성하세요. 판매를 유도하되 과장하지 마세요. 구체적 숫자와 사례를 활용하세요.`;

    const result = await callGeminiJson(prompt);

    let copyData;
    try {
      copyData = JSON.parse(result);
    } catch (parseErr) {
      console.error("[generate-copy] JSON 파싱 실패:", parseErr, "\n원본:", result.slice(0, 500));
      return NextResponse.json(
        { error: "카피 데이터 파싱에 실패했습니다. 다시 시도해주세요." },
        { status: 500 }
      );
    }

    if (!copyData?.sections) {
      console.error("[generate-copy] sections 누락:", JSON.stringify(copyData).slice(0, 500));
      return NextResponse.json(
        { error: "카피 구조가 올바르지 않습니다. 다시 시도해주세요." },
        { status: 500 }
      );
    }

    return NextResponse.json(copyData);
  } catch (err) {
    console.error("[generate-copy] 오류:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "카피 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
