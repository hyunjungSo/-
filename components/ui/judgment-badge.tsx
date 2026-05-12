"use client";

import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";

// 심사결과 타입
export type JudgmentType = "매수" | "기각" | "이관";

// 필지 정보 인터페이스
export interface LandInfo {
  address: string;
  remainingRatio: number;
}

// 심사결과 판정 함수
export function getJudgment(remainingRatio: number): JudgmentType {
  if (remainingRatio <= 30) return "매수";
  if (remainingRatio <= 50) return "이관";
  return "기각";
}

// 심사결과별 스타일 설정
export const judgmentConfig: Record<JudgmentType, { 
  bgClass: string; 
  textClass: string;
  solidClass: string;
}> = {
  매수: { 
    bgClass: "bg-emerald-500", 
    textClass: "text-emerald-600",
    solidClass: "bg-emerald-500 text-white"
  },
  기각: { 
    bgClass: "bg-rose-500", 
    textClass: "text-rose-600",
    solidClass: "bg-rose-500 text-white"
  },
  이관: { 
    bgClass: "bg-amber-500", 
    textClass: "text-amber-600",
    solidClass: "bg-amber-500 text-white"
  },
};

// 단일 심사결과 배지
export function JudgmentBadge({ 
  type, 
  count,
  showLabel = true,
}: { 
  type: JudgmentType; 
  count?: number;
  showLabel?: boolean;
}) {
  const config = judgmentConfig[type];
  
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${config.solidClass}`}>
      {showLabel ? type : ""}{count !== undefined ? ` ${count}` : ""}
    </span>
  );
}

// 심사결과 요약 배지 (HoverCard 포함)
export function JudgmentSummaryBadge({ 
  lands,
  showHoverCard = true,
}: { 
  lands: LandInfo[];
  showHoverCard?: boolean;
}) {
  // 판정 결과별 개수 세기
  const judgments = lands.map(land => getJudgment(land.remainingRatio));
  
  const judgmentCounts = {
    매수: judgments.filter(j => j === "매수").length,
    기각: judgments.filter(j => j === "기각").length,
    이관: judgments.filter(j => j === "이관").length,
  };

  const badges = (
    <div className="flex items-center gap-2 cursor-pointer">
      {judgmentCounts.매수 > 0 && (
        <JudgmentBadge type="매수" count={judgmentCounts.매수} />
      )}
      {judgmentCounts.기각 > 0 && (
        <JudgmentBadge type="기각" count={judgmentCounts.기각} />
      )}
      {judgmentCounts.이관 > 0 && (
        <JudgmentBadge type="이관" count={judgmentCounts.이관} />
      )}
    </div>
  );

  if (!showHoverCard) {
    return badges;
  }

  return (
    <HoverCard openDelay={100} closeDelay={100}>
      <HoverCardTrigger asChild>
        {badges}
      </HoverCardTrigger>
      <HoverCardContent className="w-64" align="start">
        <div className="space-y-2">
          <p className="text-sm font-semibold">심사 결과 상세</p>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {lands.map((land, idx) => {
              const judgment = getJudgment(land.remainingRatio);
              const config = judgmentConfig[judgment];
              return (
                <div key={idx} className="text-xs">
                  <span className="font-medium">{idx + 1}:</span>{" "}
                  <span className="text-muted-foreground">{land.address.split(" ").slice(-2).join(" ")}</span>{" "}
                  <span className={`font-medium ${config.textClass}`}>({judgment})</span>
                </div>
              );
            })}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
