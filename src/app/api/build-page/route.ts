import { NextRequest, NextResponse } from "next/server";
import { callGeminiPrecise, extractHtml } from "@/lib/gemini";
import { PAGE_MOODS } from "@/lib/types";
import type { CopyData, SelectedImage, ProductInfo } from "@/lib/types";

// 사용자 입력 정제 (프롬프트 인젝션 + XSS 방어)
function sanitizeInput(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// 생성된 HTML에서 위험한 태그 제거
function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^>]*>.*?<\/iframe>/gi, "")
    .replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, "");
}

// ── 무드별 디자인 디렉션 (Hex 코드 고정으로 AI 일관성 확보) ──
const MOOD_DESIGN_DIRECTIONS: Record<string, string> = {
  "minimal-white": `
    색상 팔레트 (반드시 이 Hex 코드만 사용):
    - 배경 A: #FFFFFF / 배경 B: #F8F9FA / 배경 C: #F1F3F5
    - 텍스트 메인: #212529 / 텍스트 서브: #868E96
    - 포인트: 브랜드 컬러 1가지만 (CTA, 강조 텍스트에만)
    디자인 규칙:
    - 여백을 극대화, padding-y: 100px 이상
    - 가늘고 세련된 폰트 웨이트 (300, 400, 700)
    - 그림자 최소화, 1px 보더 라인으로 구분
    - 제품 이미지에만 미세한 drop-shadow`,
  "luxury-dark": `
    색상 팔레트 (반드시 이 Hex 코드만 사용):
    - 배경 A: #0F0F0F / 배경 B: #1A1A2E / 배경 C: #16213E
    - 텍스트 메인: #F8F9FA / 텍스트 서브: #ADB5BD
    - 포인트 골드: #D4AF37 / 포인트 실버: #C0C0C0
    디자인 규칙:
    - 제품 이미지에 은은한 글로우 효과 (box-shadow: 0 0 60px rgba(212,175,55,0.15))
    - 자간 넓게 (letter-spacing: 0.05em~0.1em)
    - 섹션 구분: 골드 1px 라인 또는 그래디언트 디바이더
    - 배경에 미묘한 텍스처 느낌 (radial-gradient로 비네팅)`,
  "soft-pastel": `
    색상 팔레트 (반드시 이 Hex 코드만 사용):
    - 배경 A: #FFF5F5 / 배경 B: #F3F0FF / 배경 C: #E3FAFC / 배경 D: #FFF9DB
    - 텍스트 메인: #495057 / 텍스트 서브: #868E96
    - 포인트 핑크: #F06595 / 포인트 라벤더: #845EF7
    디자인 규칙:
    - 모서리 전부 rounded-2xl 이상
    - 카드형 요소에 부드러운 그림자 (shadow-md, 색상 있는 그림자)
    - 이모지 아이콘 적극 활용
    - 따뜻하고 친근한 곡선 레이아웃`,
  "vivid-pop": `
    색상 팔레트 (반드시 이 Hex 코드만 사용):
    - 배경 A: #FFF3BF / 배경 B: #D3F9D8 / 배경 C: #D0EBFF / 배경 D: #FFE3E3
    - 텍스트 메인: #212529 / 텍스트 서브: #495057
    - 포인트 레드: #FA5252 / 포인트 블루: #339AF0 / 포인트 옐로: #FCC419
    디자인 규칙:
    - 굵은 타이포 (700, 900), 큰 사이즈 (제목 48px+)
    - 비대칭 구성, 기울어진 배경 (skew), 에너지 넘치는 배치
    - 뱃지/스티커 스타일 장식 요소 (rotate, border-4)
    - CTA 버튼 크기 극대화, 대비색 사용`,
  "modern-gradient": `
    색상 팔레트 (반드시 이 Hex 코드만 사용):
    - 배경 라이트: #F8F9FA / 배경 다크: #1A1B2E
    - 그래디언트 A: #667EEA → #764BA2 / 그래디언트 B: #06B6D4 → #3B82F6
    - 텍스트 라이트섹션: #212529 / 텍스트 다크섹션: #F8F9FA
    - 포인트: #818CF8
    디자인 규칙:
    - 글래스모피즘 카드 (backdrop-blur-xl, bg-white/10, border border-white/20)
    - 라이트/다크 섹션 번갈아 배치
    - 미묘한 글로우 효과 (box-shadow with rgba 색상)
    - 모던하고 세련된 느낌`,
};

// ── 카테고리별 필수 포함 요소 ──
const CATEGORY_REQUIREMENTS: Record<string, string> = {
  cosmetics: `
    화장품 필수 요소:
    - Hero 바로 아래에 "피부 테스트 완료" 인증 뱃지 배치
    - 제형/텍스처 클로즈업 이미지 강조 (있으면)
    - 핵심 성분 3개를 아이콘+텍스트로 시각화
    - EWG 등급 또는 유해성분 FREE 뱃지
    - Before/After 섹션은 슬라이드형 레이아웃
    - 피부 타입별 추천 가이드 포함`,
  food: `
    식품 필수 요소:
    - HACCP/GMP 인증 마크를 상단에 눈에 띄게 배치
    - 영양성분 정보를 깔끔한 표로 시각화
    - 원산지/원재료 명확히 표기
    - 먹음직스러운 조리/섭취 사진 강조 (따뜻한 톤)
    - 유통기한/보관법 섹션 필수
    - 1회 섭취량 시각화 (스푼, 컵 등)`,
  electronics: `
    전자제품 필수 요소:
    - 기술 스펙을 깔끔한 비교 테이블로 정리
    - 사용 시나리오 3~4가지 시각화 (재택, 이동, 야외 등)
    - 실물 크기 비교 (손, 일상 사물과 대비)
    - KC인증 마크 배치
    - A/S 보증 기간 + 서비스센터 안내
    - 박스 구성품 일람 (Unboxing 느낌)`,
  fashion: `
    패션 필수 요소:
    - 착용 이미지를 다양한 앵글로 보여주기
    - 소재/원단 정보 + 클로즈업
    - 사이즈 가이드 표 (cm 기준)
    - 세탁 방법 아이콘
    - 코디 제안 (다른 아이템과 매칭)`,
  living: `
    생활용품 필수 요소:
    - 실제 생활 공간에서의 사용 장면 시각화
    - 수납/설치 후 모습 (After 이미지)
    - 정확한 사이즈 표기 + 공간 비교
    - 소재/세탁 정보
    - 다용도 활용법 3가지 이상`,
  etc: `
    기본 요소:
    - 제품의 핵심 가치를 시각적으로 전달
    - 사용 방법을 단계별로 보여주기
    - 실제 사용 장면 이미지 활용`,
};

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { copyData, selectedImages, productInfo } = (await req.json()) as {
      copyData: CopyData;
      selectedImages: SelectedImage[];
      productInfo: ProductInfo;
    };

    if (!copyData?.sections) {
      return NextResponse.json({ error: "카피 데이터가 필요합니다." }, { status: 400 });
    }

    const pageMood = productInfo.pageMood || "minimal-white";
    const moodInfo = PAGE_MOODS.find((m) => m.value === pageMood);
    const moodDirection = MOOD_DESIGN_DIRECTIONS[pageMood] || MOOD_DESIGN_DIRECTIONS["minimal-white"];
    const categoryReq = CATEGORY_REQUIREMENTS[productInfo.category] || CATEGORY_REQUIREMENTS["etc"];

    // 이미지 역할별 URL 매핑
    const imagesByRole: Record<string, string[]> = {};
    for (const si of selectedImages) {
      if (!imagesByRole[si.role]) imagesByRole[si.role] = [];
      imagesByRole[si.role].push(si.image.url);
    }

    const allImages = selectedImages.map((si) => si.image.url);
    const getImage = (role: string, index = 0) =>
      imagesByRole[role]?.[index] || allImages[index % allImages.length] || "";

    const imageList = selectedImages
      .map((si, i) => `  - 이미지${i + 1} (${si.role}): ${si.image.url}`)
      .join("\n");

    // 채널별 가로폭
    const channelWidth: Record<string, number> = {
      smartstore: 860, coupang: 780, own: 960, instagram: 1080, amazon: 970,
    };
    const maxWidth = channelWidth[productInfo.channel] || 860;

    const safeName = sanitizeInput(productInfo.name);
    const safeTarget = sanitizeInput(productInfo.target || "일반 소비자");

    const prompt = `당신은 한국 탑 이커머스 상세페이지 디자이너입니다.
월 매출 1억 이상 셀러들의 상세페이지를 만들어온 15년차 전문가로서,
"AI가 만들었다는 티가 절대 나지 않는" 프로페셔널한 상세페이지를 만드세요.

═══════════════════════════════════════
제품: ${safeName}
카테고리: ${productInfo.category}
채널: ${productInfo.channel} (가로 ${maxWidth}px)
타겟: ${safeTarget}
톤앤매너: ${productInfo.tone}
═══════════════════════════════════════

## 🎨 무드: ${moodInfo?.name || "미니멀 화이트"}
${moodDirection}

## 📦 카테고리별 필수 요소
${categoryReq}

## 🖼️ 사용 가능한 이미지
${imageList}

## 📝 카피 데이터
${JSON.stringify(copyData, null, 2)}

═══════════════════════════════════════
## ⭐ 전환율 극대화 — 검증된 9단계 심리학 구조 (이 순서를 반드시 따르세요!)
═══════════════════════════════════════

### 1단계: 판매 증거 (첫 화면, 상단 1000px)
"나만 사는 거 아니지?" → 신뢰 먼저 확보
- 풀블리드 Hero 이미지 + 후킹 헤드라인 (1가지만 강조!)
- 뱃지: 판매량, 리뷰 수, 별점 등 구체적 숫자
- 이미지: ${getImage("hero")}

### 2단계: 고객 페인포인트 (pain + problem 합침)
"나한테 필요한가?" → 일상의 구체적 불편함 건드리기
- 아이콘+텍스트 카드로 고민 3~5개 나열
- 기존 해결책의 한계 → 반전 훅
- 레이아웃: 아이콘 그리드 또는 좌우 대비

### 3단계: 해결책 제시 (solution)
"이게 답이야!" → 제품을 해결사로 포지셔닝
- 큰 제품 이미지 중앙 배치 (풀 너비)
- 한줄 소개 + 대상 고객 명시
- 이미지: ${getImage("feature") || getImage("hero")}

### 4단계: 상세 설명 + 사용법 (how + benefits)
"어떻게 쓰는 거지?" → 혜택 중심 설명 (스펙 나열 X)
- 번호 스텝 (1,2,3) + 각 스텝에 제품 사진
- 핵심 장점 아이콘+텍스트 그리드
- 이미지: 스텝별로 다르게 (${allImages.slice(0, 3).join(", ") || getImage("hero")})

### 5단계: 브랜드 스토리 (story + authority)
"이 브랜드 믿을만하나?" → 감성적 스토리텔링
- 타임라인: Before → 전환점 → After
- 인증/자격/경력 뱃지 나열
- 이미지: ${getImage("lifestyle") || getImage("hero")}

### 6단계: 사회적 증거 (proof)
"다른 사람들도 만족했을까?" → 숫자 + 후기
- 핵심 수치 3개 (큰 숫자 + 라벨)
- 후기 카드 2~3개 (이름, 역할, 인용)
- 이미지: ${getImage("comparison") || getImage("feature") || getImage("hero")}

### 7단계: 비교 + 필터 (compare + filter)
"다른 것보다 낫나?" → 확신 강화
- 2열 비교 테이블 (❌ 기존 vs ✅ 우리)
- 추천/비추천 대상 명확히 분리

### 8단계: 리스크 제거 (risk)
"후회하면 어쩌지?" → 불안 해소
- 보증 뱃지 크게 중앙 배치
- FAQ 아코디언 (3~5개)
- CS 지원 정보

### 9단계: 최종 CTA
"지금 사야 해!" → 긴급성 + 가격 앵커링
- 정가(line-through) → 할인가(크고 빨간 색)
- 긴급성 문구 ("오늘만 이 가격")
- CTA 버튼: min-height 64px, 폰트 20px+, 최대 대비색
- 풀블리드 배경 + 마무리 메시지
- 이미지: ${getImage("hero")}

═══════════════════════════════════════
## 🚫 AI 티 안 나게 만드는 필수 규칙 (가장 중요!)
═══════════════════════════════════════

### 디자인 일관성 (프로 디자이너의 핵심)
- 위 "색상 팔레트"의 **Hex 코드만** 사용하세요. 임의 색상 추가 금지!
- 폰트: Noto Sans KR만 사용, 웨이트 3가지로 위계 (400 본문, 700 소제목, 900 제목)
- 모서리 반경: 전체 페이지에서 하나로 통일 (예: rounded-xl 또는 rounded-2xl)
- 그림자: 한 가지 스타일만 일관 사용 (shadow-md 또는 shadow-lg)
- 정렬: 기본 좌측정렬, 헤드라인/CTA만 중앙정렬
- 아이콘: 이모지를 쓰되 같은 스타일로 통일

### 시각적 리듬 (기계적 균등 배치 금지!)
- 섹션 간 패딩을 **의도적으로 다르게**: Hero 뒤 120px, 일반 섹션 80px, CTA 전 100px
- 이미지와 텍스트의 밀도를 교대로: 이미지 풀블리드 → 텍스트 중심 → 이미지+텍스트
- "한 화면 = 한 메시지" 원칙 (모바일 스크롤 1회당 정보 1개)

### 여백과 호흡감
- 컨테이너 좌우 패딩: 24px (모바일)
- 텍스트 블록 max-width: 640px (읽기 편한 줄 길이)
- 제목 아래 여백: 16px, 본문 아래 여백: 24px, 섹션 내 요소 간: 32px

### 타이포그래피
- 섹션 제목: 32~40px, font-weight: 900, line-height: 1.2
- 소제목: 20~24px, font-weight: 700, line-height: 1.4
- 본문: 16~18px, font-weight: 400, line-height: 1.7
- 강조: 포인트 컬러 배경(하이라이트) 또는 색상 변경 (bold만으로 강조 X)

### 모바일 최적화 (한국 쇼핑객 80%가 모바일)
- max-width: ${maxWidth}px, margin: 0 auto
- 이미지: width 100%, lazy loading (loading="lazy")
- CTA 버튼: 터치 영역 48px 이상
- 폰트: 최소 16px (14px 이하 금지)

═══════════════════════════════════════
## 🔧 기술 요구사항
═══════════════════════════════════════
- 단일 HTML 파일, 외부 CSS/JS 의존성 없음
- Tailwind CSS CDN: <script src="https://cdn.tailwindcss.com"></script>
- Google Fonts: Noto Sans KR (400, 500, 700, 900)
- 이미지: alt 텍스트 필수, loading="lazy", width="100%"
- OG 메타태그 포함 (title, description, image)
- CTA 스크롤 2~3회마다 반복 배치 (미니 CTA 포함)

## 🚫 절대 하지 말 것
- 모든 섹션을 같은 레이아웃으로 만들기 (중앙정렬 텍스트 + 아래 이미지 반복)
- 한 화면에 텍스트 과다 (3문장 이내, 특징은 5개 이내)
- 이미지를 작게 (max-w-sm) 넣기 → 풀 너비 또는 max-w-2xl 이상
- 임의의 색상 추가 (위 팔레트 외 색상 사용 금지)
- 기계적으로 균등한 여백 (모든 섹션 동일 padding)
- 문구체 혼용 ("~합니다" ↔ "~해요" 섞기)

완성된 HTML 코드만 출력하세요. <!DOCTYPE html>부터 </html>까지만.`;

    const result = await callGeminiPrecise(prompt);
    const rawHtml = extractHtml(result);

    if (!rawHtml || (!rawHtml.includes("<!DOCTYPE") && !rawHtml.includes("<html"))) {
      console.error("[build-page] 유효하지 않은 HTML 반환:", rawHtml.slice(0, 200));
      return NextResponse.json(
        { error: "HTML 생성에 실패했습니다. 다시 시도해주세요." },
        { status: 500 }
      );
    }

    // 위험한 태그 제거 (script, iframe, inline event handlers)
    const html = sanitizeHtml(rawHtml);

    return NextResponse.json({ html });
  } catch (err) {
    console.error("[build-page] 오류:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "페이지 빌드 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
