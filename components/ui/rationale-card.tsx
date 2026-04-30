"use client";

import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { JudgmentRationale, LandJudgment, LandInfo } from "@/lib/types";
import { Scale, ChevronDown, Info, Link2, CheckCircle2, AlertTriangle } from "lucide-react";
import { AIIcon } from "@/components/ui/ai-icon";

interface RationaleCardProps {
  rationale: JudgmentRationale;
  provisionalJudgment?: "매수" | "매수불가";
  defaultOpen?: boolean;
  variant?: "collapsible" | "expanded" | "modal-trigger";
  landJudgments?: LandJudgment[];
  allLands?: LandInfo[];
}

export function RationaleCard({ 
  rationale, 
  provisionalJudgment,
  defaultOpen = false,
  variant = "collapsible",
  landJudgments,
  allLands
}: RationaleCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 일단지 그룹별로 필지 분류
  const unifiedGroups: Record<string, { lands: LandInfo[]; area: number }> = {};
  const individualLands: LandInfo[] = [];
  const notApplicableLands: LandInfo[] = [];
  
  if (landJudgments && allLands && landJudgments.length > 0) {
    allLands.forEach((land) => {
      const judgment = landJudgments.find(j => j.landId === land.id);
      if (judgment?.unifiedGroupId) {
        if (!unifiedGroups[judgment.unifiedGroupId]) {
          unifiedGroups[judgment.unifiedGroupId] = { lands: [], area: 0 };
        }
        unifiedGroups[judgment.unifiedGroupId].lands.push(land);
        unifiedGroups[judgment.unifiedGroupId].area += land.remainingArea;
      } else if (judgment?.judgment === "매수") {
        individualLands.push(land);
      } else if (judgment) {
        notApplicableLands.push(land);
      }
    });
  }
  
  const hasUnifiedGroups = Object.keys(unifiedGroups).length > 0;
  const hasIndividualLands = individualLands.length > 0;
  const hasNotApplicable = notApplicableLands.length > 0;
  const showUnifiedSection = allLands && allLands.length >= 2 && landJudgments && landJudgments.length > 0;

  const content = (
    <div className="divide-y divide-border">
      {/* 판단 요약 */}
      <div className="py-3">
        <h4 className="text-xs font-medium text-muted-foreground">판단 요약</h4>
        <p className="mt-1 text-sm text-foreground">{rationale.summary}</p>
      </div>

      {/* 법적 근거 */}
      <div className="py-3">
        <h4 className="text-xs font-medium text-muted-foreground">법적 근거</h4>
        <p className="mt-1 text-sm text-foreground">{rationale.legalBasis}</p>
      </div>

      {/* 적용 기준 */}
      <div className="py-3">
        <h4 className="text-xs font-medium text-muted-foreground">적용 기준</h4>
        <ul className="mt-1.5 space-y-1">
          {rationale.appliedCriteria.map((criteria, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
              <span>{criteria}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 직접 확인 필요 항목 */}
      {rationale.manualCheckItems && rationale.manualCheckItems.length > 0 && (
        <div className="py-3">
          <h4 className="text-xs font-medium text-muted-foreground">직접 확인 필요 항목</h4>
          <p className="mt-0.5 text-xs text-muted-foreground">
            AI 자동 판독 불가 항목으로 담당자가 현장 확인 후 판단합니다.
          </p>
          <ul className="mt-1.5 space-y-1">
            {rationale.manualCheckItems.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 상세 분석 */}
      {rationale.detailedExplanation && (
        <div className="py-3">
          <h4 className="text-xs font-medium text-muted-foreground">상세 분석</h4>
          <pre className="mt-1 whitespace-pre-wrap text-sm text-foreground">
            {rationale.detailedExplanation}
          </pre>
        </div>
      )}

      {/* 일단지 판정 결과 */}
      {showUnifiedSection && (
        <div className="py-3">
          <h4 className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
            <Link2 className="h-3.5 w-3.5" />
            일단지 판정 결과
          </h4>
          <div className="space-y-2">
            {/* 일단지 그룹 */}
            {hasUnifiedGroups && Object.entries(unifiedGroups).map(([groupId, group], idx) => (
              <div key={groupId} className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-2.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-emerald-800">일단지 그룹 {idx + 1}</span>
                  <Badge className="bg-emerald-600 hover:bg-emerald-600 text-xs">해당</Badge>
                </div>
                <div className="flex flex-wrap gap-1">
                  {group.lands.map((land) => {
                    const overallIdx = allLands!.findIndex(l => l.id === land.id);
                    const label = String.fromCharCode(65 + overallIdx);
                    return (
                      <span key={land.id} className="inline-flex items-center gap-1 rounded bg-emerald-100 px-1.5 py-0.5 text-xs text-emerald-700">
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">{label}</span>
                        {land.address.split(" ").slice(-1)[0]}
                      </span>
                    );
                  })}
                </div>
                <p className="mt-1.5 text-xs text-emerald-600">합산 면적: {group.area.toLocaleString()}m²</p>
              </div>
            ))}
            
            {/* 개별 매수 */}
            {hasIndividualLands && (
              <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-2.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-blue-800">개별 매수 대상</span>
                  <Badge className="bg-blue-600 hover:bg-blue-600 text-xs">해당</Badge>
                </div>
                <div className="flex flex-wrap gap-1">
                  {individualLands.map((land) => {
                    const overallIdx = allLands!.findIndex(l => l.id === land.id);
                    const label = String.fromCharCode(65 + overallIdx);
                    return (
                      <span key={land.id} className="inline-flex items-center gap-1 rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700">
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">{label}</span>
                        {land.address.split(" ").slice(-1)[0]}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* 미해당 */}
            {hasNotApplicable && (
              <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-2.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-amber-800">기준 미충족</span>
                  <Badge variant="secondary" className="bg-amber-200 text-amber-800 text-xs">미해당</Badge>
                </div>
                <div className="flex flex-wrap gap-1">
                  {notApplicableLands.map((land) => {
                    const overallIdx = allLands!.findIndex(l => l.id === land.id);
                    const label = String.fromCharCode(65 + overallIdx);
                    const judgment = landJudgments?.find(j => j.landId === land.id);
                    return (
                      <div key={land.id} className="w-full">
                        <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-700">
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">{label}</span>
                          {land.address.split(" ").slice(-1)[0]}
                        </span>
                        {judgment?.reason && (
                          <p className="mt-0.5 text-xs text-amber-600 pl-5">{judgment.reason}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 안내 문구 */}
      <div className="pt-3">
        <p className="text-xs text-muted-foreground">
          AI 판독 결과는 참고용이며, 최종 판정은 담당자 검토에 따라 결정됩니다.
        </p>
      </div>
    </div>
  );

  if (variant === "expanded") {
    return content;
  }

  if (variant === "modal-trigger") {
    return (
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="h-auto gap-0.5 px-1.5 py-0.5 text-xs text-muted-foreground hover:text-foreground">
            <Info className="h-3 w-3" />
            상세
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AIIcon className="h-4 w-4" />
              AI 판단 근거
            </DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="rounded-lg border border-border overflow-hidden">
      <CollapsibleTrigger className="flex w-full items-center justify-between bg-muted/30 px-4 py-3 text-left hover:bg-muted/50 transition-colors [&[data-state=open]>svg]:rotate-180">
        <div className="flex items-center gap-2">
          <Scale className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">판단 근거 상세 보기</span>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="border-t border-border px-4 py-1">
          {content}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
