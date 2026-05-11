"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// AI 판정 결과: 수용가능, 수용불가
export type JudgmentType = "수용가능" | "수용불가" | "분석중";

// 담당자/최종 판정 결과: 매수, 기각, 심의위원회 이관
export type FinalJudgmentType = "매수" | "기각" | "심의위원회 이관";

interface JudgmentStatusProps {
  judgment: JudgmentType | FinalJudgmentType | string;
  variant?: "badge" | "text";
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * 판정 상태 표시 컴포넌트
 * 
 * AI 판정: 수용가능 / 수용불가
 * 담당자/최종 판정: 매수 / 기각 / 심의위원회 이관
 * 
 * 사용 가이드:
 * 1. Badge 형식 (variant="badge"): 카드 헤더, 목록 아이템, 강조 필요 시
 * 2. Text 형식 (variant="text"): 본문 내 인라인, 테이블, 상세 정보 영역
 */
export function JudgmentStatus({ 
  judgment, 
  variant = "badge", 
  size = "md",
  className 
}: JudgmentStatusProps) {
  const getColors = () => {
    switch (judgment) {
      // AI 판정 결과 (수용가능/수용불가)
      case "수용가능":
        return {
          badge: "bg-green-600 text-white hover:bg-green-600",
          text: "text-green-600"
        };
      case "수용불가":
        return {
          badge: "bg-red-500 text-white hover:bg-red-500",
          text: "text-red-500"
        };
      // 담당자/최종 판정 결과 (매수/기각/심의위원회 이관)
      case "매수":
        return {
          badge: "bg-green-600 text-white hover:bg-green-600",
          text: "text-green-600"
        };
      case "기각":
        return {
          badge: "bg-red-500 text-white hover:bg-red-500",
          text: "text-red-500"
        };
      case "심의위원회 이관":
        return {
          badge: "bg-amber-500 text-white hover:bg-amber-500",
          text: "text-amber-500"
        };
      default:
        return {
          badge: "bg-gray-400 text-white hover:bg-gray-400",
          text: "text-gray-500"
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return {
          badge: "text-xs px-2 py-0.5",
          text: "text-xs"
        };
      case "lg":
        return {
          badge: "text-base px-3 py-1",
          text: "text-base"
        };
      default:
        return {
          badge: "text-sm px-2.5 py-0.5",
          text: "text-sm"
        };
    }
  };

  const colors = getColors();
  const sizeClasses = getSizeClasses();

  if (variant === "text") {
    return (
      <span className={cn("font-semibold", colors.text, sizeClasses.text, className)}>
        {judgment}
      </span>
    );
  }

  return (
    <Badge className={cn(colors.badge, sizeClasses.badge, className)}>
      {judgment}
    </Badge>
  );
}

/**
 * 수용여부 O/X 표시 (심의서용)
 */
export function JudgmentOX({ 
  judgment,
  className 
}: { 
  judgment: JudgmentType | FinalJudgmentType | string;
  className?: string;
}) {
  // AI 판정 "수용가능" 또는 담당자 판정 "매수"인 경우 O
  const isAccepted = judgment === "수용가능" || judgment === "매수";
  
  return (
    <span className={cn(
      "font-bold",
      isAccepted ? "text-green-600" : "text-red-500",
      className
    )}>
      {isAccepted ? "O" : "X"}
    </span>
  );
}
