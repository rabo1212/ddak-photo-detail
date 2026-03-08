"use client";

import type { ProductInfo, ProductCategory, ToneStyle, SalesChannel } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X } from "lucide-react";

interface ProductInfoFormProps {
  productInfo: ProductInfo;
  onChange: (info: ProductInfo) => void;
}

const CATEGORY_OPTIONS: { value: ProductCategory; label: string }[] = [
  { value: "cosmetics", label: "화장품" },
  { value: "food", label: "식품" },
  { value: "electronics", label: "전자기기" },
  { value: "fashion", label: "의류/패션" },
  { value: "living", label: "생활용품" },
  { value: "etc", label: "기타" },
];

const TONE_OPTIONS: { value: ToneStyle; label: string }[] = [
  { value: "friendly", label: "친근한" },
  { value: "professional", label: "전문적인" },
  { value: "luxury", label: "럭셔리" },
  { value: "casual", label: "캐주얼" },
];

const CHANNEL_OPTIONS: { value: SalesChannel; label: string }[] = [
  { value: "coupang", label: "쿠팡" },
  { value: "smartstore", label: "스마트스토어" },
  { value: "own", label: "자사몰" },
  { value: "instagram", label: "인스타그램" },
  { value: "amazon", label: "아마존" },
];

export default function ProductInfoForm({ productInfo, onChange }: ProductInfoFormProps) {
  const update = <K extends keyof ProductInfo>(key: K, value: ProductInfo[K]) => {
    onChange({ ...productInfo, [key]: value });
  };

  const addFeature = () => {
    if (productInfo.features.length < 5) {
      update("features", [...productInfo.features, ""]);
    }
  };

  const removeFeature = (index: number) => {
    update("features", productInfo.features.filter((_, i) => i !== index));
  };

  const updateFeature = (index: number, value: string) => {
    const updated = [...productInfo.features];
    updated[index] = value;
    update("features", updated);
  };

  return (
    <Card className="card-premium shadow-raised">
      <CardHeader>
        <CardTitle className="text-lg">제품 정보</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 제품명 */}
        <div className="space-y-1.5">
          <label htmlFor="product-name" className="text-sm font-medium">제품명 *</label>
          <Input
            id="product-name"
            placeholder="예: 수분 세럼 30ml"
            value={productInfo.name}
            onChange={(e) => update("name", e.target.value.slice(0, 100))}
            maxLength={100}
            aria-required="true"
          />
        </div>

        {/* 카테고리 + 톤앤매너 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="product-category" className="text-sm font-medium">카테고리</label>
            <Select value={productInfo.category} onValueChange={(v) => update("category", v as ProductCategory)}>
              <SelectTrigger id="product-category"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="product-tone" className="text-sm font-medium">톤앤매너</label>
            <Select value={productInfo.tone} onValueChange={(v) => update("tone", v as ToneStyle)}>
              <SelectTrigger id="product-tone"><SelectValue /></SelectTrigger>
              <SelectContent>
                {TONE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 가격 + 판매 채널 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="product-price" className="text-sm font-medium">가격</label>
            <Input
              id="product-price"
              placeholder="예: 29,900원"
              value={productInfo.price}
              onChange={(e) => update("price", e.target.value.slice(0, 50))}
              maxLength={50}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="product-channel" className="text-sm font-medium">판매 채널</label>
            <Select value={productInfo.channel} onValueChange={(v) => update("channel", v as SalesChannel)}>
              <SelectTrigger id="product-channel"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CHANNEL_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 타겟 고객 */}
        <div className="space-y-1.5">
          <label htmlFor="product-target" className="text-sm font-medium">타겟 고객</label>
          <Textarea
            id="product-target"
            placeholder="예: 20~30대 여성, 건조한 피부 고민이 있는 직장인"
            value={productInfo.target}
            onChange={(e) => update("target", e.target.value.slice(0, 500))}
            rows={2}
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground text-right">{productInfo.target.length}/500</p>
        </div>

        {/* 핵심 특장점 */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">핵심 특장점 (3~5개)</label>
            {productInfo.features.length < 5 && (
              <Button variant="ghost" size="sm" onClick={addFeature} className="text-xs">
                <Plus className="h-3 w-3 mr-1" /> 추가
              </Button>
            )}
          </div>
          <div className="space-y-2">
            {productInfo.features.map((feature, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  id={`feature-${i}`}
                  placeholder={`특장점 ${i + 1}`}
                  value={feature}
                  onChange={(e) => updateFeature(i, e.target.value.slice(0, 200))}
                  aria-label={`특장점 ${i + 1}`}
                />
                {productInfo.features.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 shrink-0"
                    onClick={() => removeFeature(i)}
                    aria-label={`특장점 ${i + 1} 삭제`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
