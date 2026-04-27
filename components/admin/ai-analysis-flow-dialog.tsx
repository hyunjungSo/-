"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Home,
  Wheat,
  TreePine,
  MapPin,
  Bot,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CriteriaCheck {
  criteriaName: string;
  criteriaDescription: string;
  isMet: boolean;
  autoDetected: boolean;
}

interface AIResult {
  provisionalJudgment: "매수" | "기각" | "검토필요";
  criteriaChecks: CriteriaCheck[];
  landTypePath: string;
  originalShapeIndex: number;
  remainingShapeIndex: number;
  shapeIndexChange: number;
  detailedExplanation: string;
}

interface LandInfo {
  landType: string;
  landCategory: string;
  remainingArea: number;
  remainingRatio: number;
  remainingShape: string;
  originalShapeIndex?: number;
  remainingShapeIndex?: number;
}

interface AIAnalysisFlowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aiResult: AIResult | null;
  landInfo: LandInfo;
}

type FlowStep = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

const landTypeConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string }> = {
  "대지": { icon: Home, color: "text-blue-600", bgColor: "bg-blue-500" },
  "농지": { icon: Wheat, color: "text-green-600", bgColor: "bg-green-500" },
  "산지": { icon: TreePine, color: "text-emerald-600", bgColor: "bg-emerald-600" },
  "그밖의토지": { icon: MapPin, color: "text-amber-600", bgColor: "bg-amber-500" },
};

export function AIAnalysisFlowDialog({
  open,
  onOpenChange,
  aiResult,
  landInfo,
}: AIAnalysisFlowDialogProps) {
  const [currentStep, setCurrentStep] = useState<FlowStep>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [pathHistory, setPathHistory] = useState<string[]>([]);

  // 조건 체크 데이터 추출
  const getConditionData = () => {
    const checks = aiResult?.criteriaChecks || [];
    const areaCheck = checks.find(c => c.criteriaName.includes("면적"));
    const ratioCheck = checks.find(c => c.criteriaName.includes("비율"));
    const shapeIndexCheck = checks.find(c => c.criteriaName.includes("형상지수"));
    const shapeCheck = checks.find(c => c.criteriaName === "잔여지 형상");
    
    const physicalChecks = checks.filter(c => 
      !c.criteriaName.includes("면적") && 
      !c.criteriaName.includes("비율") &&
      !c.criteriaName.includes("형상지수") &&
      c.criteriaName !== "잔여지 형상"
    );

    // 면적 기준 충족 여부 (25% 이하면 1.5배 완화 적용)
    const ratioMet = landInfo.remainingRatio <= 25;
    const areaMet = areaCheck?.isMet || false;
    
    // 형상 변화 (1.0 이상이면 매수 조건)
    const shapeIndexChange = aiResult?.shapeIndexChange || 
      ((landInfo.remainingShapeIndex || 0) - (landInfo.originalShapeIndex || 0));
    const shapeChangeMet = shapeIndexChange >= 1.0;
    
    // 물리적 조건 (하나라도 충족되면 매수 가능성)
    const physicalConditionMet = physicalChecks.some(c => c.isMet);

    return {
      areaCheck,
      ratioCheck,
      shapeIndexCheck,
      shapeCheck,
      physicalChecks,
      areaMet,
      ratioMet,
      shapeChangeMet,
      physicalConditionMet,
      shapeIndexChange,
    };
  };

  const conditionData = getConditionData();
  const config = landTypeConfig[landInfo.landType] || landTypeConfig["그밖의토지"];
  const LandIcon = config.icon;

  // 다이얼로그 열릴 때 자동 재생 시작
  useEffect(() => {
    if (open) {
      setCurrentStep(0);
      setPathHistory([]);
      setIsPlaying(true);
      const timer = setTimeout(() => setCurrentStep(1), 500);
      return () => clearTimeout(timer);
    } else {
      setCurrentStep(0);
      setPathHistory([]);
      setIsPlaying(false);
    }
  }, [open]);

  // 애니메이션 진행
  useEffect(() => {
    if (!isPlaying || !open || currentStep === 0) return;

    if (currentStep < 7) {
      const timer = setTimeout(() => {
        const nextStep = (currentStep + 1) as FlowStep;
        setCurrentStep(nextStep);
        
        // 경로 히스토리 업데이트
        if (currentStep === 1) {
          setPathHistory(prev => [...prev, landInfo.landType]);
        } else if (currentStep === 2) {
          setPathHistory(prev => [...prev, conditionData.areaMet ? "면적충족" : "면적미충족"]);
        } else if (currentStep === 3) {
          setPathHistory(prev => [...prev, conditionData.ratioMet ? "비율완화적용" : "비율초과"]);
        } else if (currentStep === 4) {
          setPathHistory(prev => [...prev, conditionData.physicalConditionMet ? "물리조건충족" : "물리조건미충족"]);
        } else if (currentStep === 5) {
          setPathHistory(prev => [...prev, conditionData.shapeChangeMet ? "형상변화충족" : "형상변화미충족"]);
        }
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setIsPlaying(false);
    }
  }, [currentStep, isPlaying, open, landInfo.landType, conditionData]);

  // 노드 스타일
  const getNodeStyle = (step: FlowStep, condition?: boolean) => {
    const isActive = currentStep === step;
    const isPassed = currentStep > step;
    
    if (isActive) {
      return "ring-2 ring-primary ring-offset-2 scale-105 shadow-lg";
    }
    if (isPassed) {
      if (condition === undefined) return "opacity-100";
      return condition ? "opacity-100" : "opacity-30";
    }
    return "opacity-40";
  };

  // 라인 애니메이션 스타일
  const getLineStyle = (fromStep: FlowStep, condition?: boolean) => {
    const isPassed = currentStep > fromStep;
    if (!isPassed) return "bg-gray-200";
    if (condition === undefined) return "bg-primary";
    return condition ? "bg-primary" : "bg-gray-300";
  };

  // 판정 결과
  const judgment = aiResult?.provisionalJudgment || "검토필요";
  const judgmentStyles: Record<string, { bg: string; text: string; icon: typeof CheckCircle2 }> = {
    "매수": { bg: "bg-green-500", text: "text-white", icon: CheckCircle2 },
    "매수불가": { bg: "bg-red-500", text: "text-white", icon: XCircle },
    "기각": { bg: "bg-red-500", text: "text-white", icon: XCircle },
    "검토필요": { bg: "bg-amber-500", text: "text-white", icon: AlertTriangle },
  };
  const judgmentStyle = judgmentStyles[judgment] || judgmentStyles["검토필요"];
  const JudgmentIcon = judgmentStyle.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI 분석 프로세스 - 사다리형 플로우
          </DialogTitle>
          <DialogDescription>
            중앙토지수용위원회 기준에 따른 잔여지 매수 판독 과정입니다.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 pt-4 space-y-4">
          {/* 사다리형 플로우 다이어그램 */}
          <div className="relative bg-gradient-to-b from-slate-50 to-slate-100 rounded-xl p-6 overflow-x-auto">
            <div className="min-w-[700px] space-y-0">
              
              {/* Step 1: 시작점 - 토지 입력 */}
              <div className="flex justify-center">
                <div className={cn(
                  "flex flex-col items-center transition-all duration-500",
                  getNodeStyle(1)
                )}>
                  <div className="w-48 rounded-xl border-2 border-slate-300 bg-white p-4 text-center shadow-md">
                    <div className="mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Start</div>
                    <div className="text-sm font-bold text-slate-800">잔여지 정보 입력</div>
                    <div className="mt-2 text-xs text-slate-500">
                      {landInfo.remainingArea.toLocaleString()}m² / {landInfo.remainingRatio}%
                    </div>
                  </div>
                </div>
              </div>

              {/* 연결선 */}
              <div className="flex justify-center py-2">
                <div className={cn("h-8 w-1 rounded transition-all duration-300", getLineStyle(1))} />
              </div>

              {/* Step 2: 토지 분류 분기 */}
              <div className="flex justify-center">
                <div className={cn(
                  "flex flex-col items-center transition-all duration-500",
                  getNodeStyle(2)
                )}>
                  <div className="relative w-64 rounded-xl border-2 border-blue-300 bg-blue-50 p-4 text-center shadow-md">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-500 px-3 py-0.5 text-xs font-bold text-white">
                      STEP 1
                    </div>
                    <div className="mt-1 text-sm font-bold text-blue-800">토지 분류</div>
                    <div className="mt-3 flex justify-center gap-2">
                      {["대지", "농지", "산지", "그밖의토지"].map((type) => {
                        const typeConfig = landTypeConfig[type];
                        const TypeIcon = typeConfig.icon;
                        const isSelected = landInfo.landType === type && currentStep >= 2;
                        return (
                          <div
                            key={type}
                            className={cn(
                              "flex flex-col items-center rounded-lg border p-2 transition-all",
                              isSelected
                                ? `${typeConfig.bgColor} text-white border-transparent scale-110 shadow-md`
                                : "bg-white border-slate-200 text-slate-400"
                            )}
                          >
                            <TypeIcon className="h-5 w-5" />
                            <span className="mt-1 text-[10px] font-medium">{type}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* 연결선 */}
              <div className="flex justify-center py-2">
                <div className={cn("h-8 w-1 rounded transition-all duration-300", getLineStyle(2))} />
              </div>

              {/* Step 3: 면적 기준 분기 */}
              <div className="flex justify-center">
                <div className={cn(
                  "transition-all duration-500",
                  getNodeStyle(3)
                )}>
                  <div className="relative w-80 rounded-xl border-2 border-emerald-300 bg-emerald-50 p-4 shadow-md">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-3 py-0.5 text-xs font-bold text-white">
                      STEP 2
                    </div>
                    <div className="mt-1 text-center text-sm font-bold text-emerald-800">면적 기준 검토</div>
                    <div className="mt-3 flex items-center justify-center gap-6">
                      {/* 충족 경로 */}
                      <div className={cn(
                        "flex flex-col items-center rounded-lg border-2 p-3 transition-all",
                        currentStep >= 3 && conditionData.areaMet
                          ? "border-green-500 bg-green-100 shadow-md"
                          : "border-slate-200 bg-white"
                      )}>
                        <CheckCircle2 className={cn(
                          "h-6 w-6",
                          currentStep >= 3 && conditionData.areaMet ? "text-green-600" : "text-slate-300"
                        )} />
                        <span className="mt-1 text-xs font-semibold">충족</span>
                        <span className="text-[10px] text-slate-500">기준 면적 이하</span>
                      </div>
                      
                      <div className="text-slate-300">
                        <ChevronDown className="h-6 w-6 rotate-90" />
                      </div>
                      
                      {/* 미충족 경로 */}
                      <div className={cn(
                        "flex flex-col items-center rounded-lg border-2 p-3 transition-all",
                        currentStep >= 3 && !conditionData.areaMet
                          ? "border-amber-500 bg-amber-100 shadow-md"
                          : "border-slate-200 bg-white"
                      )}>
                        <AlertTriangle className={cn(
                          "h-6 w-6",
                          currentStep >= 3 && !conditionData.areaMet ? "text-amber-600" : "text-slate-300"
                        )} />
                        <span className="mt-1 text-xs font-semibold">초과</span>
                        <span className="text-[10px] text-slate-500">추가 검토 필요</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 분기 라인 */}
              <div className="flex justify-center">
                <div className="relative w-80 h-12">
                  {/* 왼쪽 분기선 (충족) */}
                  <div className={cn(
                    "absolute left-1/4 top-0 h-full w-1 rounded transition-all duration-300",
                    currentStep > 3 && conditionData.areaMet ? "bg-green-500" : "bg-slate-200"
                  )} />
                  {/* 오른쪽 분기선 (미충족 - 완화조건으로) */}
                  <div className={cn(
                    "absolute right-1/4 top-0 h-full w-1 rounded transition-all duration-300",
                    currentStep > 3 && !conditionData.areaMet ? "bg-amber-500" : "bg-slate-200"
                  )} />
                </div>
              </div>

              {/* Step 4: 잔여 비율 완화 조건 (면적 미충족 시) */}
              <div className="flex justify-center gap-16">
                {/* 좌측: 면적 충족 시 바로 물리 조건으로 */}
                <div className={cn(
                  "flex flex-col items-center transition-all duration-500",
                  currentStep >= 4 && conditionData.areaMet ? "opacity-100" : "opacity-30"
                )}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white">
                    <ArrowDown className="h-5 w-5" />
                  </div>
                  <span className="mt-1 text-[10px] text-green-600 font-medium">물리 조건으로</span>
                </div>

                {/* 우측: 비율 완화 조건 */}
                <div className={cn(
                  "transition-all duration-500",
                  getNodeStyle(4, !conditionData.areaMet)
                )}>
                  <div className={cn(
                    "w-48 rounded-xl border-2 p-3 text-center shadow-md",
                    currentStep >= 4 && !conditionData.areaMet
                      ? "border-violet-400 bg-violet-50"
                      : "border-slate-200 bg-slate-50"
                  )}>
                    <div className="text-xs font-bold text-violet-700">비율 완화 조건</div>
                    <div className="mt-2 text-[10px] text-slate-600">
                      잔여비율 25% 이하 시<br/>면적기준 1.5배 완화
                    </div>
                    <div className={cn(
                      "mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                      conditionData.ratioMet ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    )}>
                      {conditionData.ratioMet ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      {landInfo.remainingRatio}% {conditionData.ratioMet ? "(적용)" : "(미적용)"}
                    </div>
                  </div>
                </div>
              </div>

              {/* 병합 라인 */}
              <div className="flex justify-center py-2">
                <div className={cn("h-8 w-1 rounded transition-all duration-300", getLineStyle(4))} />
              </div>

              {/* Step 5: 물리적 조건 */}
              <div className="flex justify-center">
                <div className={cn(
                  "transition-all duration-500",
                  getNodeStyle(5)
                )}>
                  <div className="relative w-96 rounded-xl border-2 border-orange-300 bg-orange-50 p-4 shadow-md">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-orange-500 px-3 py-0.5 text-xs font-bold text-white">
                      STEP 3
                    </div>
                    <div className="mt-1 text-center text-sm font-bold text-orange-800">물리적 조건 검토</div>
                    <div className="mt-2 text-center text-[10px] text-slate-500">
                      토지유형: {landInfo.landType}
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {conditionData.physicalChecks.slice(0, 4).map((check, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "flex items-center gap-2 rounded-lg border p-2 text-xs transition-all",
                            currentStep >= 5
                              ? check.isMet
                                ? "border-green-400 bg-green-50"
                                : "border-slate-200 bg-white"
                              : "border-slate-200 bg-white opacity-50"
                          )}
                        >
                          {currentStep >= 5 ? (
                            check.isMet ? (
                              <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                            ) : (
                              <Circle className="h-4 w-4 shrink-0 text-slate-300" />
                            )
                          ) : (
                            <Circle className="h-4 w-4 shrink-0 text-slate-300" />
                          )}
                          <span className={cn(
                            "truncate",
                            currentStep >= 5 && check.isMet ? "font-medium text-green-800" : "text-slate-600"
                          )}>
                            {check.criteriaName}
                          </span>
                          {!check.autoDetected && (
                            <Badge variant="outline" className="ml-auto shrink-0 text-[8px] px-1 py-0">
                              직접
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 연결선 */}
              <div className="flex justify-center py-2">
                <div className={cn("h-8 w-1 rounded transition-all duration-300", getLineStyle(5))} />
              </div>

              {/* Step 6: 형상 분석 */}
              <div className="flex justify-center">
                <div className={cn(
                  "transition-all duration-500",
                  getNodeStyle(6)
                )}>
                  <div className="relative w-80 rounded-xl border-2 border-pink-300 bg-pink-50 p-4 shadow-md">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-pink-500 px-3 py-0.5 text-xs font-bold text-white">
                      STEP 4
                    </div>
                    <div className="mt-1 text-center text-sm font-bold text-pink-800">형상 분석</div>
                    <div className="mt-3 flex items-center justify-center gap-4">
                      <div className="text-center">
                        <div className="text-[10px] text-slate-500">편입 전</div>
                        <div className="text-lg font-bold text-slate-700">
                          {(landInfo.originalShapeIndex || aiResult?.originalShapeIndex || 4.0).toFixed(1)}
                        </div>
                      </div>
                      <div className="flex flex-col items-center">
                        <ArrowDown className="h-4 w-4 text-pink-500 rotate-[-90deg]" />
                        <div className={cn(
                          "mt-1 rounded-full px-3 py-1 text-xs font-bold",
                          conditionData.shapeChangeMet ? "bg-red-500 text-white" : "bg-slate-200 text-slate-600"
                        )}>
                          +{conditionData.shapeIndexChange.toFixed(1)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-[10px] text-slate-500">편입 후</div>
                        <div className="text-lg font-bold text-slate-700">
                          {(landInfo.remainingShapeIndex || aiResult?.remainingShapeIndex || 5.0).toFixed(1)}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 text-center">
                      <Badge variant={conditionData.shapeChangeMet ? "default" : "secondary"}>
                        {conditionData.shapeChangeMet ? "형상지수 1.0 이상 상승" : "형상지수 변화 미미"}
                      </Badge>
                    </div>
                    <div className="mt-2 text-center text-[10px] text-slate-500">
                      잔여지 형상: <span className="font-semibold">{landInfo.remainingShape}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 연결선 */}
              <div className="flex justify-center py-2">
                <div className={cn("h-8 w-1 rounded transition-all duration-300", getLineStyle(6))} />
              </div>

              {/* Step 7: 최종 판정 */}
              <div className="flex justify-center">
                <div className={cn(
                  "transition-all duration-500",
                  getNodeStyle(7)
                )}>
                  <div className={cn(
                    "relative w-64 rounded-xl border-2 p-5 text-center shadow-lg",
                    currentStep >= 7 ? `${judgmentStyle.bg} border-transparent` : "border-slate-300 bg-white"
                  )}>
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-slate-800 px-3 py-0.5 text-xs font-bold text-white">
                      RESULT
                    </div>
                    <div className={cn(
                      "mt-2 text-sm font-bold",
                      currentStep >= 7 ? judgmentStyle.text : "text-slate-400"
                    )}>
                      AI 잠정 판정
                    </div>
                    <div className="mt-3 flex items-center justify-center gap-2">
                      {currentStep >= 7 ? (
                        <>
                          <JudgmentIcon className={cn("h-8 w-8", judgmentStyle.text)} />
                          <span className={cn("text-3xl font-black", judgmentStyle.text)}>
                            {judgment}
                          </span>
                        </>
                      ) : (
                        <span className="text-2xl text-slate-300">???</span>
                      )}
                    </div>
                    {currentStep >= 7 && (
                      <div className="mt-3 text-xs opacity-90">
                        {judgment === "매수" && "매수 기준 충족"}
                        {judgment === "기각" && "매수 기준 미충족"}
                        {judgment === "검토필요" && "담당자 추가 검토 필요"}
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* 범례 */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground border-t pt-4">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span>조건 충족</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-amber-500" />
              <span>추가 검토 필요</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <span>조건 미충족</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">직접</Badge>
              <span>담당자 직접 확인 항목</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
