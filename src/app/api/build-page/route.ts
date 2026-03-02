import { NextRequest, NextResponse } from "next/server";
import { callGemini, extractHtml } from "@/lib/gemini";
import type { CopyData, SelectedImage, ProductInfo } from "@/lib/types";

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
- **일관된 브랜드 컬러 시스템**: 메인 1색 + 강조 1색 + 중립색. 제품 카테고리에 맞춰 선택
  - 화장품: 연보라/라벤더 or 로즈골드 계열
  - 식품: 오렌지/그린 계열
  - 전자기기: 다크블루/네이비 계열
  - 기본: 블루+화이트 깔끔 계열
- **배경색 교차**: 흰색과 연한 컬러 배경을 섹션마다 번갈아 배치하여 시각적 리듬감
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
