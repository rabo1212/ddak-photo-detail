"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// 섹션 한국어 라벨
const FIELD_LABELS: Record<string, string> = {
  badge: "뱃지",
  headline: "헤드라인",
  subheadline: "서브 헤드라인",
  cta_button: "CTA 버튼",
  cta_sub_text: "CTA 부가 정보",
  title: "제목",
  question: "질문",
  closing_hook: "마무리 훅",
  reversal_hook: "반전 문구",
  perspective_shift: "시각 전환",
  before: "이전 상황",
  turning_point: "전환점",
  after: "변화된 현재",
  proof: "증거",
  product_name: "제품명",
  one_liner: "한줄 소개",
  for_whom: "추천 대상",
  description: "설명",
  subtitle: "부제",
  name: "이름",
  role: "직함",
  bio: "소개",
  why_message: "제작 동기",
  total_value: "총 가치",
  actual_price: "실제 가격",
  support: "CS 지원 정보",
  closing_question: "마무리 질문",
  subheadline_cta: "서브 헤드라인",
  original_price: "정가",
  sale_price: "할인가",
  urgency: "긴급성 문구",
  button_text: "버튼 텍스트",
  closing_message: "마무리 메시지",
  icon: "아이콘",
  situation: "상황",
  emotion: "감정",
  number: "숫자",
  label: "라벨",
  quote: "후기",
  result: "결과",
  text: "내용",
  value: "가치",
  type: "유형",
  period: "기간",
  answer: "답변",
};

function getLabel(key: string): string {
  return FIELD_LABELS[key] || key;
}

// 긴 텍스트 필드 여부 판단
function isLongField(key: string, value: string): boolean {
  const longKeys = ["description", "bio", "quote", "why_message", "closing_hook", "perspective_shift", "one_liner", "for_whom", "proof", "before", "turning_point", "after", "answer"];
  return longKeys.includes(key) || value.length > 40;
}

interface SectionEditorProps {
  sectionKey: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sectionData: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (updated: any) => void;
}

export default function SectionEditor({ sectionKey, sectionData, onChange }: SectionEditorProps) {
  if (!sectionData || typeof sectionData !== "object") return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateField = (key: string, value: any) => {
    onChange({ ...sectionData, [key]: value });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateArrayItem = (key: string, index: number, updated: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const arr = [...(sectionData[key] as any[])];
    arr[index] = updated;
    onChange({ ...sectionData, [key]: arr });
  };

  const updateStringArrayItem = (key: string, index: number, value: string) => {
    const arr = [...(sectionData[key] as string[])];
    arr[index] = value;
    onChange({ ...sectionData, [key]: arr });
  };

  return (
    <div className="space-y-3">
      {Object.entries(sectionData).map(([key, value]) => {
        // string 필드
        if (typeof value === "string") {
          return (
            <div key={`${sectionKey}-${key}`}>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                {getLabel(key)}
              </label>
              {isLongField(key, value) ? (
                <Textarea
                  value={value}
                  onChange={(e) => updateField(key, e.target.value)}
                  rows={2}
                  className="text-sm"
                />
              ) : (
                <Input
                  value={value}
                  onChange={(e) => updateField(key, e.target.value)}
                  className="text-sm"
                />
              )}
            </div>
          );
        }

        // number 필드 (how.steps의 number)
        if (typeof value === "number") {
          return null; // step number는 수정 불필요
        }

        // string[] 필드 (credentials, without, with, recommended, not_recommended, keywords)
        if (Array.isArray(value) && value.length > 0 && typeof value[0] === "string") {
          return (
            <div key={`${sectionKey}-${key}`}>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                {getLabel(key)} ({value.length}개)
              </label>
              <div className="space-y-1.5">
                {(value as string[]).map((item, i) => (
                  <Input
                    key={`${sectionKey}-${key}-${i}`}
                    value={item}
                    onChange={(e) => updateStringArrayItem(key, i, e.target.value)}
                    className="text-sm"
                  />
                ))}
              </div>
            </div>
          );
        }

        // object[] 필드 (points, causes, steps, stats, testimonials, core_list, bonuses, faqs)
        if (Array.isArray(value) && value.length > 0 && typeof value[0] === "object") {
          return (
            <div key={`${sectionKey}-${key}`}>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                {getLabel(key)} ({value.length}개)
              </label>
              <div className="space-y-2">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(value as any[]).map((item, i) => (
                  <div key={`${sectionKey}-${key}-${i}`} className="border rounded-md p-2.5 space-y-1.5 bg-muted/30">
                    {Object.entries(item).map(([subKey, subVal]) => {
                      if (typeof subVal === "number") return null;
                      return (
                        <div key={`${sectionKey}-${key}-${i}-${subKey}`}>
                          <label className="text-[10px] text-muted-foreground">{getLabel(subKey)}</label>
                          <Input
                            value={String(subVal)}
                            onChange={(e) => updateArrayItem(key, i, { ...item, [subKey]: e.target.value })}
                            className="text-sm"
                          />
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          );
        }

        // 단일 object 필드 (guarantee)
        if (typeof value === "object" && value !== null && !Array.isArray(value)) {
          return (
            <div key={`${sectionKey}-${key}`}>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                {getLabel(key)}
              </label>
              <div className="border rounded-md p-2.5 space-y-1.5 bg-muted/30">
                {Object.entries(value as Record<string, string>).map(([subKey, subVal]) => (
                  <div key={`${sectionKey}-${key}-${subKey}`}>
                    <label className="text-[10px] text-muted-foreground">{getLabel(subKey)}</label>
                    <Input
                      value={String(subVal)}
                      onChange={(e) => updateField(key, { ...(value as Record<string, string>), [subKey]: e.target.value })}
                      className="text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
