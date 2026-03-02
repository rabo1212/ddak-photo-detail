import { NextRequest, NextResponse } from "next/server";
import { callGemini, extractHtml } from "@/lib/gemini";
import { PAGE_MOODS } from "@/lib/types";
import type { CopyData, SelectedImage, ProductInfo } from "@/lib/types";

const MOOD_DESIGN_DIRECTIONS: Record<string, string> = {
  "minimal-white": `
    - 배경: 순백(#FFFFFF)과 연한 그레이(#F8F9FA) 교차
    - 여백을 극대화, 요소 간 충분한 공간
    - 색상: 브랜드 컬러 1가지만 포인트로 절제 사용
    - 타이포: 가늘고 세련된 폰트 웨이트, 대비는 크기로만
    - 그림자 최소화, 얇은 보더 라인 활용`,
  "luxury-dark": `
    - 배경: 짙은 다크(#0F0F0F ~ #1A1A2E) 기반
    - 텍스트: 화이트 + 골드(#D4AF37) 또는 실버(#C0C0C0) 포인트
    - 제품 이미지에 은은한 글로우/림라이트 효과
    - 고급 서체 느낌, 자간 넓게, 대문자 활용
    - 섹션 구분: 골드 라인 또는 미묘한 그래디언트`,
  "soft-pastel": `
    - 배경: 연한 파스텔 톤 교차 (라벤더, 민트, 피치, 스카이블루)
    - 둥근 모서리(rounded-2xl~3xl), 부드러운 그림자
    - 일러스트풍 아이콘, 손그림 느낌의 장식 요소
    - 따뜻하고 친근한 분위기, 곡선 레이아웃
    - 폰트: 둥글둥글한 느낌의 웨이트`,
  "vivid-pop": `
    - 배경: 원색 블록 교차 (노랑, 빨강, 파랑, 초록 등 채도 높은 색)
    - 굵은 타이포, 큰 폰트 사이즈, 임팩트 있는 레이아웃
    - 기울어진 요소, 비대칭 구성, 에너지 넘치는 배치
    - 뱃지/스티커 스타일 장식 요소
    - 대비를 극대화한 CTA 버튼`,
  "modern-gradient": `
    - 배경: 인디고→퍼플, 블루→시안 등 트렌디한 그래디언트
    - 글래스모피즘: 반투명 카드(backdrop-blur, bg-white/10)
    - 미묘한 네온 글로우 효과
    - 모던하고 세련된 느낌, 약간의 3D 감각
    - 다크/라이트 섹션을 번갈아 배치`,
};

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

    // 페이지 무드 정보
    const pageMood = productInfo.pageMood || "minimal-white";
    const moodInfo = PAGE_MOODS.find((m) => m.value === pageMood);
    const moodDirection = MOOD_DESIGN_DIRECTIONS[pageMood] || MOOD_DESIGN_DIRECTIONS["minimal-white"];

    // 이미지 역할별 URL 매핑
    const imagesByRole: Record<string, string[]> = {};
    for (const si of selectedImages) {
      if (!imagesByRole[si.role]) imagesByRole[si.role] = [];
      imagesByRole[si.role].push(si.image.url);
    }

    const allImages = selectedImages.map((si) => si.image.url);
    const getImage = (role: string, index = 0) =>
      imagesByRole[role]?.[index] || allImages[index % allImages.length] || "";

    // 사용 가능한 이미지 목록 정리
    const imageList = selectedImages
      .map((si, i) => `  - 이미지${i + 1} (${si.role}): ${si.image.url}`)
      .join("\n");

    const prompt = `당신은 한국 이커머스 상세페이지 전문 HTML/CSS 디자이너입니다.
스마트스토어, 쿠팡에서 실제로 전환율이 높은 상세페이지를 만드는 전문가입니다.

## 제품: ${productInfo.name}
## 판매 채널: ${productInfo.channel}

## 🎨 선택된 페이지 무드: ${moodInfo?.name || "미니멀 화이트"}
${moodInfo?.description || ""}

### 무드 디자인 디렉션 (반드시 따르세요!)
${moodDirection}

## 사용 가능한 이미지
${imageList}

## 카피 데이터 (13섹션)
${JSON.stringify(copyData, null, 2)}

---

## 핵심 디자인 규칙 (반드시 지키세요!)

### 1. 레이아웃 원칙
- **모바일 퍼스트**: max-width 860px, 세로 스크롤 최적화
- **풀블리드 이미지**: 제품 이미지는 width:100% 풀 너비로 시원하게
- **섹션마다 레이아웃을 바꿔라**:
  - Hero: 풀블리드 이미지 + 오버레이 텍스트
  - Pain: 아이콘 + 텍스트 카드 (수직 나열)
  - Problem: 좌우 대비 레이아웃 또는 도표
  - Story: 타임라인 스타일 (Before → Turning Point → After)
  - Solution: 큰 제품 이미지 중앙 + 위아래 캡션
  - How: 번호 스텝 (1,2,3) + 각 스텝에 제품 사진
  - Proof: 숫자 3열 그리드 + 후기 카드
  - Authority: 인증 마크 뱃지 나열
  - Benefits: 아이콘 + 텍스트 2열 그리드
  - Risk: 보증 뱃지 중앙 + FAQ 아코디언
  - Compare: 2열 비교 테이블 (X vs O)
  - Filter: 추천/비추천 2컬럼
  - CTA: 풀블리드 배경 + 가격 + 큰 버튼

### 2. 비주얼 디자인
- **선택된 무드("${moodInfo?.name}")에 맞는 색상 시스템을 반드시 적용하세요!**
- 위의 "무드 디자인 디렉션"에 명시된 배경색, 텍스트색, 포인트색을 따르세요
- **배경색 교차**: 섹션마다 번갈아 배치하여 시각적 리듬감
- **타이포 위계**: 섹션 제목은 bold 32-40px, 소제목 20-24px, 본문 16-18px
- **강조 텍스트**: 핵심 키워드는 브랜드 컬러로 색상 변경 또는 하이라이트 배경
- **그림자와 라운딩**: 카드형 요소는 shadow-lg + rounded-2xl로 고급스럽게
- **여백**: 섹션간 padding-y: 80px 이상, 요소간 적절한 공간

### 3. 이미지 사용 규칙 (중요!)
- 제공된 이미지를 **최대한 다양하게** 분배하세요
- 같은 이미지가 3번 이상 반복되면 안 됩니다
- Hero와 CTA에는 가장 임팩트 있는 이미지 사용
- 이미지 없는 섹션은 이모지 아이콘, 그래디언트 배경, SVG 도형으로 시각적 풍성함 확보
- 제품 이미지에는 미세한 그림자(drop-shadow) 적용

### 4. 섹션별 이미지 매핑
- 01.Hero: ${getImage("hero")}
- 04.Story: ${getImage("lifestyle") || getImage("hero")}
- 05.Solution: ${getImage("feature") || getImage("hero")}
- 06.How: 스텝별로 다른 이미지 사용 (${allImages.slice(0, 3).join(", ") || getImage("hero")})
- 07.Proof: ${getImage("comparison") || getImage("feature") || getImage("hero")}
- 09.Benefits: ${getImage("feature", 1) || getImage("feature") || getImage("hero")}
- 12.Filter: ${getImage("lifestyle", 1) || getImage("lifestyle") || getImage("hero")}
- 13.CTA: ${getImage("hero")}

### 5. 기술 요구사항
- 단일 HTML 파일 (외부 CSS/JS 의존성 없음)
- Tailwind CSS CDN: <script src="https://cdn.tailwindcss.com"></script>
- Google Fonts: Noto Sans KR (400, 500, 700, 900)
- 모든 이미지에 적절한 alt 텍스트
- CTA 버튼: 눈에 띄는 대비 색상, min-height 56px, 폰트 크기 18px 이상
- 가격 표시: 정가는 line-through, 할인가는 크고 빨간 색상
- OG 메타 태그 포함

### 6. 절대 하지 말 것
- 모든 섹션을 같은 레이아웃(중앙정렬 텍스트 + 아래 이미지)으로 만들지 마세요
- 지나치게 많은 텍스트를 한 화면에 넣지 마세요
- 이미지를 max-w-sm 같이 작게 넣지 마세요. 풀 너비 또는 max-w-2xl 이상으로
- 단조로운 흰색 배경만 반복하지 마세요

완성된 HTML 코드만 출력하세요. 설명이나 마크다운 없이 <!DOCTYPE html>부터 </html>까지만.`;

    const result = await callGemini(prompt);
    const html = extractHtml(result);

    return NextResponse.json({ html });
  } catch (err) {
    console.error("build-page error:", err);
    return NextResponse.json(
      { error: "페이지 빌드 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
