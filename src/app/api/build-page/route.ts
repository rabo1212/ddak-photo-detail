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

    const getImage = (role: string, index = 0) =>
      imagesByRole[role]?.[index] || imagesByRole["hero"]?.[0] || "";

    const imageMapping = `
## 섹션별 이미지 URL
- Hero (01): ${getImage("hero")}
- Story (04): ${getImage("lifestyle")}
- Solution (05): ${getImage("feature")}
- How (06): ${getImage("lifestyle", 1) || getImage("lifestyle")}
- Proof (07): ${getImage("comparison") || getImage("feature")}
- Benefits (09): ${getImage("feature", 1) || getImage("feature")}
- Filter (12): ${getImage("lifestyle", 2) || getImage("lifestyle")}
- CTA (13): ${getImage("hero")}
`;

    const prompt = `당신은 이커머스 상세페이지 전문 HTML 빌더입니다.
아래 13섹션 카피 데이터와 이미지를 사용하여, 완성된 단일 HTML 파일을 생성하세요.

## 제품: ${productInfo.name}

## 카피 데이터
${JSON.stringify(copyData, null, 2)}

${imageMapping}

## HTML 요구사항
1. 단일 HTML 파일 (외부 의존성 없음)
2. Tailwind CSS CDN 사용 (<script src="https://cdn.tailwindcss.com"></script>)
3. Google Fonts 사용 (Noto Sans KR)
4. 모바일 반응형 (max-width: 860px 중심)
5. 13섹션 순서대로 배치
6. 이미지가 있는 섹션은 위에 제공한 URL을 img 태그로 삽입
7. 이미지가 없는 섹션 (02.Pain, 03.Problem, 08.Authority, 10.Risk, 11.Compare)은 텍스트/아이콘만
8. CTA 버튼은 눈에 띄는 색상으로
9. 섹션 간 충분한 여백
10. 깔끔하고 전문적인 디자인

완성된 HTML만 출력하세요. 설명 없이 HTML 코드만.`;

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
