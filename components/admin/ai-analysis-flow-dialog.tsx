"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LandInfo, AIAnalysisResult } from "@/lib/types";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Home,
  Wheat,
  TreePine,
  MapPin,
} from "lucide-react";

interface AIAnalysisFlowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aiResult: AIAnalysisResult | null;
  landInfo: LandInfo;
}

// 토지 유형별 설정
const landTypeConfig: Record<string, { icon: typeof Home; color: string }> = {
  "대지": { icon: Home, color: "bg-blue-500" },
  "농지": { icon: Wheat, color: "bg-green-500" },
  "산지": { icon: TreePine, color: "bg-emerald-600" },
  "그밖의토지": { icon: MapPin, color: "bg-gray-500" },
};

export function AIAnalysisFlowDialog({
  open,
  onOpenChange,
  aiResult,
  landInfo,
}: AIAnalysisFlowDialogProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [animationComplete, setAnimationComplete] = useState(false);

  // 조건 데이터 계산
  const landType = landInfo.landType || "그밖의토지";
  const remainingArea = landInfo.remainingArea;
  const remainingRatio = landInfo.remainingRatio;
  
  // 면적 기준 (PRD 기준)
  const getAreaThreshold = () => {
    if (landType === "대지") {
      return { base: 90, relaxed: 135 };
    }
    return { base: 330, relaxed: 495 };
  };
  
  const areaThreshold = getAreaThreshold();
  const isRatioRelaxed = remainingRatio <= 25;
  const effectiveThreshold = isRatioRelaxed ? areaThreshold.relaxed : areaThreshold.base;
  const areaMet = remainingArea <= effectiveThreshold;
  
  // 형상 변화 충족 여부
  const shapeChangeMet = (landInfo.remainingShapeIndex || 0) - (landInfo.originalShapeIndex || 0) >= 1.0 ||
    ["삼각형", "역삼각형", "자루형", "부정형"].includes(landInfo.remainingShape || "");
  
  // 물리 조건
  const physicalConditionMet = aiResult?.accessRoadConditionMet === false;
  
  // 최종 판정
  const finalJudgment = aiResult?.provisionalJudgment || "검토필요";

  // 다이얼로그 열릴 때 애니메이션 시작
  useEffect(() => {
    if (open) {
      setCurrentStep(0);
      setAnimationComplete(false);
      
      const delays = [400, 800, 1200, 1600, 2000];
      delays.forEach((delay, index) => {
        setTimeout(() => {
          setCurrentStep(index + 1);
          if (index === delays.length - 1) {
            setTimeout(() => setAnimationComplete(true), 400);
          }
        }, delay);
      });
    }
  }, [open]);

  const config = landTypeConfig[landType] || landTypeConfig["그밖의토지"];
  const LandIcon = config.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-muted/30">
          <DialogTitle className="flex items-center gap-3">
            <div className={cn("rounded-full p-2", config.color)}>
              <LandIcon className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="text-base">AI 판독 프로세스</span>
              <p className="text-xs font-normal text-muted-foreground mt-0.5">
                {landInfo.address}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-0">
          {/* STEP 1: 토지 분류 */}
          <StepNode
            step={1}
            title="토지 분류"
            currentStep={currentStep}
          >
            <div className="flex gap-2">
              {(["대지", "농지", "산지", "그밖의토지"] as const).map((type) => {
                const TypeIcon = landTypeConfig[type].icon;
                const isSelected = type === landType;
                return (
                  <div
                    key={type}
                    className={cn(
                      "flex flex-col items-center gap-0.5 rounded-md border px-2 py-1.5 transition-all duration-300",
                      isSelected && currentStep >= 1
                        ? "border-primary bg-primary text-primary-foreground scale-105"
                        : "border-border text-muted-foreground opacity-50"
                    )}
                  >
                    <TypeIcon className="h-4 w-4" />
                    <span className="text-[10px] font-medium">{type}</span>
                  </div>
                );
              })}
            </div>
          </StepNode>

          <StepConnector active={currentStep >= 2} />

          {/* STEP 2: 면적 기준 */}
          <StepNode
            step={2}
            title="면적 기준"
            currentStep={currentStep}
          >
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <span className="text-muted-foreground">잔여 면적: </span>
                <span className="font-semibold">{remainingArea.toLocaleString()}m²</span>
                <span className="text-muted-foreground"> / 기준: </span>
                <span className="font-medium">{areaThreshold.base}m²</span>
              </div>
              <ResultBadge met={areaMet} active={currentStep >= 2} />
            </div>
          </StepNode>

          <StepConnector active={currentStep >= 3} />

          {/* STEP 3: 비율 완화 */}
          <StepNode
            step={3}
            title="비율 완화 적용"
            currentStep={currentStep}
          >
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <span className="text-muted-foreground">잔여 비율: </span>
                <span className="font-semibold">{remainingRatio}%</span>
                <span className="text-muted-foreground"> (25% 이하 시 1.5배 완화)</span>
              </div>
              <ResultBadge 
                met={isRatioRelaxed} 
                active={currentStep >= 3}
                trueLabel="적용"
                falseLabel="미적용"
                neutral
              />
            </div>
          </StepNode>

          <StepConnector active={currentStep >= 4} />

          {/* STEP 4: 물리적 조건 */}
          <StepNode
            step={4}
            title="물리적 조건"
            subtitle={getPhysicalConditionText(landType)}
            currentStep={currentStep}
          >
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1.5">
                <ConditionChip label="접면도로 상실" met={physicalConditionMet} active={currentStep >= 4} />
                <ConditionChip label="형상 부정형" met={shapeChangeMet} active={currentStep >= 4} />
              </div>
              <ResultBadge 
                met={physicalConditionMet || shapeChangeMet} 
                active={currentStep >= 4}
              />
            </div>
          </StepNode>

          <StepConnector active={currentStep >= 5} />

          {/* STEP 5: 최종 판정 */}
          <div
            className={cn(
              "rounded-xl border-2 p-4 transition-all duration-500",
              currentStep >= 5
                ? finalJudgment === "매수"
                  ? "border-green-500 bg-green-50"
                  : finalJudgment === "매수불가" || finalJudgment === "기각"
                    ? "border-red-500 bg-red-50"
                    : "border-amber-500 bg-amber-50"
                : "border-border bg-muted/30 opacity-50"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white",
                  currentStep >= 5
                    ? finalJudgment === "매수"
                      ? "bg-green-500"
                      : finalJudgment === "매수불가" || finalJudgment === "기각"
                        ? "bg-red-500"
                        : "bg-amber-500"
                    : "bg-muted-foreground"
                )}>
                  5
                </div>
                <span className="font-semibold">AI 잠정 판정</span>
              </div>
              
              {currentStep >= 5 && animationComplete ? (
                <div className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-1.5 font-bold",
                  finalJudgment === "매수"
                    ? "bg-green-500 text-white"
                    : finalJudgment === "매수불가" || finalJudgment === "기각"
                      ? "bg-red-500 text-white"
                      : "bg-amber-500 text-white"
                )}>
                  {finalJudgment === "매수" ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : finalJudgment === "매수불가" || finalJudgment === "기각" ? (
                    <XCircle className="h-4 w-4" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                  {finalJudgment}
                </div>
              ) : (
                <Badge variant="outline" className="opacity-50">판정 중...</Badge>
              )}
            </div>
          </div>
        </div>

        {/* 하단 범례 */}
        <div className="px-6 pb-4 pt-2 border-t">
          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
              충족
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
              미충족
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              검토필요
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// 스텝 노드 컴포넌트
function StepNode({
  step,
  title,
  subtitle,
  currentStep,
  children,
}: {
  step: number;
  title: string;
  subtitle?: string;
  currentStep: number;
  children: React.ReactNode;
}) {
  const isActive = currentStep >= step;
  
  return (
    <div
      className={cn(
        "rounded-lg border-2 p-3 transition-all duration-500",
        isActive
          ? "border-primary/50 bg-card shadow-sm"
          : "border-border bg-muted/30 opacity-50"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
            isActive
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          {step}
        </div>
        <div className="flex-1 space-y-2">
          <div>
            <span className="text-sm font-semibold">{title}</span>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className={cn("transition-opacity duration-300", isActive ? "opacity-100" : "opacity-0")}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// 연결선 컴포넌트
function StepConnector({ active }: { active: boolean }) {
  return (
    <div className="flex justify-center py-1">
      <div
        className={cn(
          "h-4 w-0.5 rounded-full transition-all duration-500",
          active ? "bg-primary" : "bg-border"
        )}
      />
    </div>
  );
}

// 결과 뱃지 컴포넌트
function ResultBadge({
  met,
  active,
  trueLabel = "충족",
  falseLabel = "미충족",
  neutral = false,
}: {
  met: boolean;
  active: boolean;
  trueLabel?: string;
  falseLabel?: string;
  neutral?: boolean;
}) {
  if (!active) {
    return <Badge variant="outline" className="opacity-50">-</Badge>;
  }
  
  if (met) {
    return (
      <Badge className="gap-1 bg-green-500 hover:bg-green-500">
        <CheckCircle2 className="h-3 w-3" />
        {trueLabel}
      </Badge>
    );
  }
  
  if (neutral) {
    return <Badge variant="secondary">{falseLabel}</Badge>;
  }
  
  return (
    <Badge className="gap-1 bg-red-500 hover:bg-red-500">
      <XCircle className="h-3 w-3" />
      {falseLabel}
    </Badge>
  );
}

// 조건 칩 컴포넌트
function ConditionChip({
  label,
  met,
  active,
}: {
  label: string;
  met: boolean;
  active: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-all duration-300",
        !active
          ? "bg-muted text-muted-foreground"
          : met
            ? "bg-green-100 text-green-700"
            : "bg-gray-100 text-gray-500"
      )}
    >
      {active && met && <CheckCircle2 className="h-3 w-3" />}
      {label}
    </span>
  );
}

// 토지 유형별 물리 조건 설명
function getPhysicalConditionText(landType: string): string {
  switch (landType) {
    case "대지":
      return "접면도로 상실 또는 형상 부정형 변경";
    case "농지":
      return "도로/수로 상실, 농기계 진입 곤란, 형상 부정형";
    case "산지":
      return "접한 도로가 없어진 경우";
    default:
      return "진입 곤란, 토지 양분, 형상 변경";
  }
}
