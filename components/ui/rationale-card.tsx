"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { JudgmentRationale } from "@/lib/types";
import { 
  Scale, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  AlertTriangle, 
  CheckCircle2,
  Info,
  Gavel
} from "lucide-react";

interface RationaleCardProps {
  rationale: JudgmentRationale;
  provisionalJudgment?: "매수" | "매수불가";
  defaultOpen?: boolean;
  variant?: "collapsible" | "expanded";
}

export function RationaleCard({ 
  rationale, 
  provisionalJudgment,
  defaultOpen = false,
  variant = "collapsible"
}: RationaleCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const content = (
    <div className="space-y-4">
      {/* 판단 요약 */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-foreground">판단 요약</h4>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{rationale.summary}</p>
          </div>
        </div>
      </div>

      {/* 법적 근거 */}
      <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100">
            <Gavel className="h-4 w-4 text-amber-700" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-foreground">법적 근거</h4>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{rationale.legalBasis}</p>
          </div>
        </div>
      </div>

      {/* 적용 기준 */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-4 w-4 text-emerald-700" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-foreground">적용 기준</h4>
            <ul className="mt-2 space-y-2">
              {rationale.appliedCriteria.map((criteria, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  <span className="leading-relaxed">{criteria}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 직접 확인 필요 항목 */}
      {rationale.manualCheckItems && rationale.manualCheckItems.length > 0 && (
        <div className="rounded-lg border border-orange-200 bg-orange-50/50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-foreground">직접 확인 필요 항목</h4>
              <p className="mt-1 text-xs text-muted-foreground">
                다음 항목은 AI 자동 판독이 불가하여 담당자가 현장 확인 후 판단합니다.
              </p>
              <ul className="mt-2 space-y-1.5">
                {rationale.manualCheckItems.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 상세 분석 */}
      {rationale.detailedExplanation && (
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-foreground">상세 분석</h4>
              <pre className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {rationale.detailedExplanation}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* 안내 문구 */}
      <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2">
        <Info className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">
          AI 판독 결과는 참고용이며, 최종 판정은 담당자 검토에 따라 결정됩니다.
        </p>
      </div>
    </div>
  );

  if (variant === "expanded") {
    return content;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full cursor-pointer justify-between border-primary/20 bg-primary/5 hover:bg-primary/10"
          size="sm"
        >
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-primary" />
            <span className="font-medium">판단 근거 상세 보기</span>
          </div>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-primary" />
          ) : (
            <ChevronDown className="h-4 w-4 text-primary" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-4">
        {content}
      </CollapsibleContent>
    </Collapsible>
  );
}
