"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  ChevronDown,
} from "lucide-react";

interface AIAnalysisFlowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aiResult: AIAnalysisResult | null;
  landInfo: LandInfo;
}

type LandType = "대지" | "농지" | "산지" | "그밖의토지";

const landTypeIcons: Record<LandType, typeof Home> = {
  "대지": Home,
  "농지": Wheat,
  "산지": TreePine,
  "그밖의토지": MapPin,
};

const landTypeColors: Record<LandType, string> = {
  "대지": "bg-blue-500",
  "농지": "bg-green-500", 
  "산지": "bg-emerald-600",
  "그밖의토지": "bg-gray-500",
};

export function AIAnalysisFlowDialog({
  open,
  onOpenChange,
  aiResult,
  landInfo,
}: AIAnalysisFlowDialogProps) {
  const [animationStep, setAnimationStep] = useState(0);

  const currentLandType = (landInfo.landType || "그밖의토지") as LandType;
  const remainingArea = landInfo.remainingArea;
  const remainingRatio = landInfo.remainingRatio;

  // 면적 기준 계산
  const getAreaThreshold = (type: LandType) => {
    if (type === "대지") return { base: 90, relaxed: 135, label: "주거 90㎡ / 상업 150㎡ / 공업 330㎡" };
    if (type === "농지") return { base: 330, relaxed: 495, label: "330㎡ (완화 495㎡)" };
    if (type === "산지") return { base: 330, relaxed: 495, label: "330㎡ (완화 495㎡)" };
    return { base: 330, relaxed: 330, label: "330㎡ 또는 잔여비율 50% 이하" };
  };

  const areaThreshold = getAreaThreshold(currentLandType);
  const isRatioRelaxed = remainingRatio <= 25;
  const effectiveThreshold = isRatioRelaxed ? areaThreshold.relaxed : areaThreshold.base;
  const areaMet = remainingArea <= effectiveThreshold;

  // 물리적 조건
  const accessRoadLost = aiResult?.accessRoadConditionMet === false;
  const shapeChanged = (landInfo.remainingShapeIndex || 0) - (landInfo.originalShapeIndex || 0) >= 1.0 ||
    ["삼각형", "역삼각형", "자루형", "부정형"].includes(landInfo.remainingShape || "");
  const physicalMet = accessRoadLost || shapeChanged;

  // 최종 판정
  const finalJudgment = aiResult?.provisionalJudgment || "검토필요";
  const anyConditionMet = areaMet || physicalMet;

  // 애니메이션
  useEffect(() => {
    if (open) {
      setAnimationStep(0);
      const steps = [300, 600, 900, 1200, 1500, 1800];
      steps.forEach((delay, i) => {
        setTimeout(() => setAnimationStep(i + 1), delay);
      });
    }
  }, [open]);

  const Icon = landTypeIcons[currentLandType];
  const color = landTypeColors[currentLandType];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-0" style={{ width: '60vw', maxWidth: '60vw', minWidth: '800px', fontSize: '14px' }}>
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-muted/30 sticky top-0 z-10">
          <DialogTitle className="flex items-center gap-3">
            <div className={cn("rounded-full p-2 text-white", color)}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <span>AI 잔여지 매수 자동화 판독 프로세스</span>
              <p className="text-sm font-normal text-muted-foreground mt-0.5">
                {landInfo.address} | 잔여 {remainingArea.toLocaleString()}㎡ ({remainingRatio}%)
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="p-6">
          {/* STEP 1: 토지 분류 */}
          <div className={cn(
            "transition-all duration-500",
            animationStep >= 1 ? "opacity-100" : "opacity-30"
          )}>
            <div className="text-center mb-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground">
                STEP 1. 토지 분류
              </span>
            </div>
            
            {/* 4개 경로 헤더 */}
            <div className="grid grid-cols-4 gap-3 mb-2">
              {(["대지", "농지", "산지", "그밖의토지"] as LandType[]).map((type) => {
                const TypeIcon = landTypeIcons[type];
                const isSelected = type === currentLandType && animationStep >= 1;
                return (
                  <div
                    key={type}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-lg border-2 p-3 transition-all duration-500",
                      isSelected
                        ? `${landTypeColors[type]} text-white border-transparent shadow-lg scale-105`
                        : "border-border bg-muted/30 text-muted-foreground"
                    )}
                  >
                    <TypeIcon className="h-5 w-5" />
                    <span className="text-sm font-semibold">{type}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 연결선 */}
          <div className="grid grid-cols-4 gap-3 mb-2">
            {(["대지", "농지", "산지", "그밖의토지"] as LandType[]).map((type) => {
              const isActive = type === currentLandType && animationStep >= 2;
              return (
                <div key={type} className="flex justify-center">
                  <ChevronDown className={cn(
                    "h-5 w-5 transition-all duration-500",
                    isActive ? "text-primary" : "text-border"
                  )} />
                </div>
              );
            })}
          </div>

          {/* STEP 2: 면적 기준 */}
          <div className={cn(
            "transition-all duration-500",
            animationStep >= 2 ? "opacity-100" : "opacity-30"
          )}>
            <div className="text-center mb-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground">
                STEP 2. 면적 기준 미달 여부
              </span>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-2">
              {/* 대지 */}
              <PathBox
                active={currentLandType === "대지" && animationStep >= 2}
                checked={currentLandType === "대지" && areaMet && animationStep >= 2}
              >
                <p className="text-sm font-semibold mb-1">면적 기준</p>
                <p className="text-[10px] text-muted-foreground">주거 90㎡ 이하</p>
                <p className="text-[10px] text-muted-foreground">상업 150㎡ 이하</p>
                <p className="text-[10px] text-muted-foreground">공업 330㎡ 이하</p>
                <p className="text-[10px] text-primary mt-1">잔여비율 25% 이하 시 1.5배 완화</p>
              </PathBox>

              {/* 농지 */}
              <PathBox
                active={currentLandType === "농지" && animationStep >= 2}
                checked={currentLandType === "농지" && areaMet && animationStep >= 2}
              >
                <p className="text-sm font-semibold mb-1">면적 기준</p>
                <p className="text-[10px] text-muted-foreground">기본 330㎡ 이하</p>
                <p className="text-[10px] text-primary mt-1">잔여비율 25% 이하 시</p>
                <p className="text-[10px] text-primary">495㎡ 이하 (완화)</p>
              </PathBox>

              {/* 산지 */}
              <PathBox
                active={currentLandType === "산지" && animationStep >= 2}
                checked={currentLandType === "산지" && areaMet && animationStep >= 2}
              >
                <p className="text-sm font-semibold mb-1">면적 기준</p>
                <p className="text-[10px] text-muted-foreground">기본 330㎡ 이하</p>
                <p className="text-[10px] text-primary mt-1">잔여비율 25% 이하 시</p>
                <p className="text-[10px] text-primary">495㎡ 이하 (완화)</p>
              </PathBox>

              {/* 그밖의토지 */}
              <PathBox
                active={currentLandType === "그밖의토지" && animationStep >= 2}
                checked={currentLandType === "그밖의토지" && areaMet && animationStep >= 2}
              >
                <p className="text-sm font-semibold mb-1">면적 기준</p>
                <p className="text-[10px] text-muted-foreground">기본 330㎡ 이하</p>
                <p className="text-[10px] text-muted-foreground">또는</p>
                <p className="text-[10px] text-muted-foreground">잔여비율 50% 이하</p>
              </PathBox>
            </div>
          </div>

          {/* 연결선 */}
          <div className="grid grid-cols-4 gap-3 mb-2">
            {(["대지", "농지", "산지", "그밖의토지"] as LandType[]).map((type) => {
              const isActive = type === currentLandType && animationStep >= 3;
              return (
                <div key={type} className="flex justify-center">
                  <ChevronDown className={cn(
                    "h-5 w-5 transition-all duration-500",
                    isActive ? "text-primary" : "text-border"
                  )} />
                </div>
              );
            })}
          </div>

          {/* STEP 3: 물리적 조건 - 접면도로/수로 */}
          <div className={cn(
            "transition-all duration-500",
            animationStep >= 3 ? "opacity-100" : "opacity-30"
          )}>
            <div className="text-center mb-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground">
                STEP 3. 접면 도로/수로 상실 여부
              </span>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-2">
              {/* 대지 */}
              <PathBox
                active={currentLandType === "대지" && animationStep >= 3}
                checked={currentLandType === "대지" && accessRoadLost && animationStep >= 3}
              >
                <p className="text-sm font-semibold mb-1">접면 도로 상태 변경</p>
                <p className="text-[10px] text-muted-foreground">접면도로 상태 변경으로</p>
                <p className="text-[10px] text-muted-foreground">건축허가 불가</p>
              </PathBox>

              {/* 농지 */}
              <PathBox
                active={currentLandType === "농지" && animationStep >= 3}
                checked={currentLandType === "농지" && accessRoadLost && animationStep >= 3}
              >
                <p className="text-sm font-semibold mb-1">접면 도로/수로 상실</p>
                <p className="text-[10px] text-muted-foreground">도로/수로 상실로</p>
                <p className="text-[10px] text-muted-foreground">농지로서의 사용 불가</p>
              </PathBox>

              {/* 산지 */}
              <PathBox
                active={currentLandType === "산지" && animationStep >= 3}
                checked={currentLandType === "산지" && accessRoadLost && animationStep >= 3}
              >
                <p className="text-sm font-semibold mb-1">접면 도로 상실</p>
                <p className="text-[10px] text-muted-foreground">산지가 도로와 접하였다가</p>
                <p className="text-[10px] text-muted-foreground">공익사업으로 인해</p>
                <p className="text-[10px] text-muted-foreground">접한 도로가 없어진 경우</p>
              </PathBox>

              {/* 그밖의토지 */}
              <PathBox
                active={currentLandType === "그밖의토지" && animationStep >= 3}
                checked={currentLandType === "그밖의토지" && accessRoadLost && animationStep >= 3}
              >
                <p className="text-sm font-semibold mb-1">진입 곤란</p>
                <p className="text-[10px] text-muted-foreground">절토 및 성토/옹벽 설치 등</p>
              </PathBox>
            </div>
          </div>

          {/* 연결선 */}
          <div className="grid grid-cols-4 gap-3 mb-2">
            {(["대지", "농지", "산지", "그밖의토지"] as LandType[]).map((type) => {
              const isActive = type === currentLandType && animationStep >= 4;
              return (
                <div key={type} className="flex justify-center">
                  <ChevronDown className={cn(
                    "h-5 w-5 transition-all duration-500",
                    isActive ? "text-primary" : "text-border"
                  )} />
                </div>
              );
            })}
          </div>

          {/* STEP 4: 형상 변경 */}
          <div className={cn(
            "transition-all duration-500",
            animationStep >= 4 ? "opacity-100" : "opacity-30"
          )}>
            <div className="text-center mb-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground">
                STEP 4. 형상 부정형으로 변경
              </span>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-2">
              {/* 대지 */}
              <PathBox
                active={currentLandType === "대지" && animationStep >= 4}
                checked={currentLandType === "대지" && shapeChanged && animationStep >= 4}
              >
                <p className="text-sm font-semibold mb-1">형상 부정형 변경</p>
                <p className="text-[10px] text-muted-foreground">사각형 폭: 5m 이하</p>
                <p className="text-[10px] text-muted-foreground">삼각형 한 변: 11m 이하</p>
              </PathBox>

              {/* 농지 */}
              <PathBox
                active={currentLandType === "농지" && animationStep >= 4}
                checked={currentLandType === "농지" && shapeChanged && animationStep >= 4}
              >
                <p className="text-sm font-semibold mb-1">농기계 회전 곤란, 형상 변경</p>
                <p className="text-[10px] text-muted-foreground">농기계 진입 및 회전 곤란</p>
                <p className="text-[10px] text-muted-foreground">사각형 폭: 5m 이하</p>
                <p className="text-[10px] text-muted-foreground">삼각형 한 변: 11m 이하</p>
              </PathBox>

              {/* 산지 - 해당 없음 */}
              <PathBox
                active={currentLandType === "산지" && animationStep >= 4}
                checked={false}
                empty
              >
                <p className="text-sm text-muted-foreground">해당 없음</p>
              </PathBox>

              {/* 그밖의토지 */}
              <PathBox
                active={currentLandType === "그밖의토지" && animationStep >= 4}
                checked={currentLandType === "그밖의토지" && shapeChanged && animationStep >= 4}
              >
                <p className="text-sm font-semibold mb-1">양분/형상 변경</p>
                <p className="text-[10px] text-muted-foreground">일단의 토지가 양분</p>
                <p className="text-[10px] text-muted-foreground">정형: 잔여지 폭 기준 이하</p>
                <p className="text-[10px] text-muted-foreground">비정형: 형상지수 1.0↑ 상승</p>
              </PathBox>
            </div>
          </div>

          {/* 연결선 */}
          <div className="grid grid-cols-4 gap-3 mb-2">
            {(["대지", "농지", "산지", "그밖의토지"] as LandType[]).map((type) => {
              const isActive = type === currentLandType && animationStep >= 5;
              return (
                <div key={type} className="flex justify-center">
                  <ChevronDown className={cn(
                    "h-5 w-5 transition-all duration-500",
                    isActive ? "text-primary" : "text-border"
                  )} />
                </div>
              );
            })}
          </div>

          {/* STEP 5: 판정 기준 */}
          <div className={cn(
            "transition-all duration-500",
            animationStep >= 5 ? "opacity-100" : "opacity-30"
          )}>
            <div className="text-center mb-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground">
                STEP 5. 판정 기준
              </span>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-4">
              {(["대지", "농지", "산지", "그밖의토지"] as LandType[]).map((type) => {
                const isActive = type === currentLandType && animationStep >= 5;
                return (
                  <div
                    key={type}
                    className={cn(
                      "rounded-lg border p-3 text-[10px] transition-all duration-500",
                      isActive ? "border-primary bg-primary/5" : "border-border bg-muted/30 text-muted-foreground"
                    )}
                  >
                    <p className={cn(isActive && anyConditionMet ? "text-green-600 font-medium" : "")}>
                      어느 하나라도 해당 시 → 수용 조건 충족
                    </p>
                    <p className={cn(isActive && !anyConditionMet ? "text-red-600 font-medium" : "")}>
                      전체 미해당 시 → 수용 조건 미충족
                    </p>
                    <p>실측 및 추가 검토 필요시 → 검토 필요</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 최종 판정 */}
          <div className={cn(
            "transition-all duration-500",
            animationStep >= 6 ? "opacity-100 scale-100" : "opacity-30 scale-95"
          )}>
            <div className="text-center mb-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-gray-800 px-4 py-1.5 text-sm font-semibold text-white">
                AI 잠정 판정 결과
              </span>
            </div>

            <div className="flex justify-center gap-4">
              <JudgmentBox
                label="충족"
                color="green"
                active={animationStep >= 6 && finalJudgment === "매수"}
                icon={CheckCircle2}
              />
              <JudgmentBox
                label="미충족"
                color="red"
                active={animationStep >= 6 && (finalJudgment === "매수불가" || finalJudgment === "기각")}
                icon={XCircle}
              />
              <JudgmentBox
                label="검토필요"
                color="amber"
                active={animationStep >= 6 && finalJudgment === "검토필요"}
                icon={AlertTriangle}
              />
            </div>
          </div>
        </div>

        {/* 현재 케이스 요약 */}
        <div className="px-6 pb-4 pt-2 border-t bg-muted/30">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground">현재 케이스:</span>
              <span className="font-medium">{currentLandType}</span>
              <span className="text-muted-foreground">|</span>
              <span>잔여 면적 <strong>{remainingArea.toLocaleString()}㎡</strong></span>
              <span className="text-muted-foreground">|</span>
              <span>잔여 비율 <strong>{remainingRatio}%</strong></span>
            </div>
            <div className={cn(
              "flex items-center gap-2 rounded-full px-3 py-1 font-semibold text-white",
              finalJudgment === "매수" ? "bg-green-500" :
              finalJudgment === "매수불가" || finalJudgment === "기각" ? "bg-red-500" :
              "bg-amber-500"
            )}>
              {finalJudgment === "매수" && <CheckCircle2 className="h-4 w-4" />}
              {(finalJudgment === "매수불가" || finalJudgment === "기각") && <XCircle className="h-4 w-4" />}
              {finalJudgment === "검토필요" && <AlertTriangle className="h-4 w-4" />}
              {finalJudgment}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// 경로 박스 컴포넌트
function PathBox({
  active,
  checked,
  empty = false,
  children,
}: {
  active: boolean;
  checked: boolean;
  empty?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative rounded-lg border-2 p-3 transition-all duration-500",
        active
          ? checked
            ? "border-green-500 bg-green-50"
            : "border-primary bg-primary/5"
          : "border-border bg-muted/30",
        empty && "border-dashed"
      )}
    >
      {active && checked && (
        <div className="absolute -top-2 -right-2 rounded-full bg-green-500 p-0.5">
          <CheckCircle2 className="h-4 w-4 text-white" />
        </div>
      )}
      <div className={cn(!active && "text-muted-foreground")}>
        {children}
      </div>
    </div>
  );
}

// 판정 박스 컴포넌트
function JudgmentBox({
  label,
  color,
  active,
  icon: Icon,
}: {
  label: string;
  color: "green" | "red" | "amber";
  active: boolean;
  icon: typeof CheckCircle2;
}) {
  const colorClasses = {
    green: active ? "border-green-500 bg-green-500 text-white" : "border-green-200 bg-green-50 text-green-300",
    red: active ? "border-red-500 bg-red-500 text-white" : "border-red-200 bg-red-50 text-red-300",
    amber: active ? "border-amber-500 bg-amber-500 text-white" : "border-amber-200 bg-amber-50 text-amber-300",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 rounded-xl border-2 px-8 py-4 transition-all duration-500",
        colorClasses[color],
        active && "scale-110 shadow-lg"
      )}
    >
      <Icon className="h-8 w-8" />
      <span className="text-sm font-bold">{label}</span>
    </div>
  );
}
