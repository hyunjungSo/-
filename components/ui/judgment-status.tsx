"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// AI 판정 및 최종 결정: 매수, 기각, 심의위원회 이관
export type JudgmentType = "매수" | "기각" | "심의위원회 이관" | "분석중";

interface JudgmentStatusProps {
  judgment: JudgmentType | string;
  variant?: "badge" | "text";
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * 매수 상태 표시 컴포넌트
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
      // 최종 결정
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
      // AI 판정 결과
      case "매수가능":
        return {
          badge: "bg-green-600 text-white hover:bg-green-600",
          text: "text-green-600"
        };
      case "매수불가":
        return {
          badge: "bg-red-500 text-white hover:bg-red-500",
          text: "text-red-500"
        };
      case "조건부매수":
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
 * 매수여부 O/X 표시 (심의서용)
 */
export function JudgmentOX({ 
  judgment,
  className 
}: { 
  judgment: JudgmentType | string;
  className?: string;
}) {
  const isApproved = judgment === "매수";
  
  return (
    <span className={cn(
      "font-bold",
      isApproved ? "text-green-600" : "text-red-500",
      className
    )}>
      {isApproved ? "O" : "X"}
    </span>
  );
}
