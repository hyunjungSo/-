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
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Play,
  RotateCcw,
  Home,
  Wheat,
  TreePine,
  MapPin,
  Layers,
  Bot,
  User,
  FileCheck,
} from "lucide-react";

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
}

interface AIAnalysisFlowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aiResult: AIResult | null;
  landInfo: LandInfo;
}

type FlowStep = 
  | "idle"
  | "classify"
  | "area-check"
  | "condition-check-1"
  | "condition-check-2"
  | "condition-check-3"
  | "review"
  | "decision"
  | "complete";

const landTypeIcons: Record<string, React.ElementType> = {
  "대지": Home,
  "농지": Wheat,
  "산지": TreePine,
  "그밖의토지": MapPin,
};

const landTypeColors: Record<string, string> = {
  "대지": "bg-blue-500",
  "농지": "bg-green-500",
  "산지": "bg-emerald-700",
  "그밖의토지": "bg-amber-500",
};

export function AIAnalysisFlowDialog({
  open,
  onOpenChange,
  aiResult,
  landInfo,
}: AIAnalysisFlowDialogProps) {
  const [currentStep, setCurrentStep] = useState<FlowStep>("idle");
  const [isPlaying, setIsPlaying] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<FlowStep[]>([]);

  // 토지 유형에 따른 조건 체크 항목 정의
  const getConditionChecks = () => {
    const checks = aiResult?.criteriaChecks || [];
    const areaCheck = checks.find(c => c.criteriaName.includes("면적"));
    const ratioCheck = checks.find(c => c.criteriaName.includes("비율"));
    const shapeCheck = checks.find(c => c.criteriaName.includes("형상"));
    
    // 토지 유형별 물리적 조건
    const physicalChecks = checks.filter(c => 
      !c.criteriaName.includes("면적") && 
      !c.criteriaName.includes("비율") &&
      !c.criteriaName.includes("형상지수")
    );

    return { areaCheck, ratioCheck, shapeCheck, physicalChecks };
  };

  const { areaCheck, ratioCheck, shapeCheck, physicalChecks } = getConditionChecks();

  // 애니메이션 스텝 진행
  useEffect(() => {
    if (!isPlaying || !open) return;

    const stepSequence: FlowStep[] = [
      "classify",
      "area-check",
      "condition-check-1",
      "condition-check-2",
      "review",
      "decision",
      "complete",
    ];

    const currentIndex = stepSequence.indexOf(currentStep);
    
    if (currentIndex < stepSequence.length - 1) {
      const timer = setTimeout(() => {
        const nextStep = stepSequence[currentIndex + 1];
        setCurrentStep(nextStep);
        setCompletedSteps(prev => [...prev, currentStep]);
      }, 1200);
      return () => clearTimeout(timer);
    } else {
      setIsPlaying(false);
    }
  }, [currentStep, isPlaying, open]);

  const handlePlay = () => {
    setCurrentStep("classify");
    setCompletedSteps([]);
    setIsPlaying(true);
  };

  const handleReset = () => {
    setCurrentStep("idle");
    setCompletedSteps([]);
    setIsPlaying(false);
  };

  const isStepActive = (step: FlowStep) => currentStep === step;
  const isStepCompleted = (step: FlowStep) => completedSteps.includes(step);
  const isStepPending = (step: FlowStep) => !isStepActive(step) && !isStepCompleted(step);

  const getStepStyle = (step: FlowStep) => {
    if (isStepActive(step)) return "ring-2 ring-primary ring-offset-2 bg-primary/10 scale-105";
    if (isStepCompleted(step)) return "bg-green-50 border-green-300";
    return "bg-muted/30 opacity-50";
  };

  const LandTypeIcon = landTypeIcons[landInfo.landType] || MapPin;
  const landTypeColor = landTypeColors[landInfo.landType] || "bg-gray-500";

  // 판정 결과 스타일
  const getJudgmentStyle = () => {
    if (!aiResult) return { bg: "bg-gray-100", text: "text-gray-700", icon: AlertTriangle };
    switch (aiResult.provisionalJudgment) {
      case "매수":
        return { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle2 };
      case "기각":
        return { bg: "bg-red-100", text: "text-red-700", icon: XCircle };
      default:
        return { bg: "bg-amber-100", text: "text-amber-700", icon: AlertTriangle };
    }
  };

  const judgmentStyle = getJudgmentStyle();
  const JudgmentIcon = judgmentStyle.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI 분석 프로세스
          </DialogTitle>
          <DialogDescription>
            중앙토지수용위원회 기준에 따른 자동화 판독 과정을 확인합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 재생 컨트롤 */}
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="default"
              size="sm"
              onClick={handlePlay}
              disabled={isPlaying}
              className="gap-2"
            >
              <Play className="h-4 w-4" />
              {currentStep === "idle" ? "분석 시작" : "다시 재생"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={currentStep === "idle"}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              초기화
            </Button>
          </div>

          {/* 프로세스 플로우 */}
          <div className="relative">
            {/* Step 1: 토지 분류 */}
            <div className={`rounded-xl border p-4 transition-all duration-500 ${getStepStyle("classify")}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-white ${landTypeColor}`}>
                  <LandTypeIcon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold">1. 토지 분류</h3>
                  <p className="text-sm text-muted-foreground">토지 유형 판별</p>
                </div>
                {isStepCompleted("classify") && (
                  <CheckCircle2 className="ml-auto h-5 w-5 text-green-600" />
                )}
              </div>
              <div className={`transition-all duration-300 ${isStepActive("classify") || isStepCompleted("classify") ? "opacity-100" : "opacity-40"}`}>
                <div className="flex items-center gap-2 rounded-lg bg-card p-3 border">
                  <Badge className={`${landTypeColor} text-white`}>
                    {landInfo.landType}
                  </Badge>
                  <span className="text-sm">
                    지목: {landInfo.landCategory} | 잔여면적: {landInfo.remainingArea.toLocaleString()}m²
                  </span>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center py-2">
              <ArrowRight className={`h-5 w-5 rotate-90 transition-colors duration-300 ${isStepCompleted("classify") ? "text-green-600" : "text-muted-foreground"}`} />
            </div>

            {/* Step 2: 면적 기준 체크 */}
            <div className={`rounded-xl border p-4 transition-all duration-500 ${getStepStyle("area-check")}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white">
                  <Layers className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold">2. AI 정량 판독 - 면적 기준</h3>
                  <p className="text-sm text-muted-foreground">면적 및 비율 기준 검토</p>
                </div>
                {isStepCompleted("area-check") && (
                  <CheckCircle2 className="ml-auto h-5 w-5 text-green-600" />
                )}
              </div>
              <div className={`space-y-2 transition-all duration-300 ${isStepActive("area-check") || isStepCompleted("area-check") ? "opacity-100" : "opacity-40"}`}>
                {areaCheck && (
                  <div className={`flex items-center gap-2 rounded-lg p-3 border ${areaCheck.isMet ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                    {areaCheck.isMet ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{areaCheck.criteriaName}</p>
                      <p className="text-xs text-muted-foreground truncate">{areaCheck.criteriaDescription}</p>
                    </div>
                    <Badge variant={areaCheck.isMet ? "default" : "destructive"} className="shrink-0">
                      {areaCheck.isMet ? "충족" : "미충족"}
                    </Badge>
                  </div>
                )}
                {ratioCheck && (
                  <div className={`flex items-center gap-2 rounded-lg p-3 border ${ratioCheck.isMet ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                    {ratioCheck.isMet ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{ratioCheck.criteriaName}</p>
                      <p className="text-xs text-muted-foreground truncate">{ratioCheck.criteriaDescription}</p>
                    </div>
                    <Badge variant={ratioCheck.isMet ? "default" : "destructive"} className="shrink-0">
                      {ratioCheck.isMet ? "충족" : "미충족"}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center py-2">
              <ArrowRight className={`h-5 w-5 rotate-90 transition-colors duration-300 ${isStepCompleted("area-check") ? "text-green-600" : "text-muted-foreground"}`} />
            </div>

            {/* Step 3: 물리적 조건 체크 */}
            <div className={`rounded-xl border p-4 transition-all duration-500 ${getStepStyle("condition-check-1")}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500 text-white">
                  <FileCheck className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold">3. AI 정량 판독 - 물리적 조건</h3>
                  <p className="text-sm text-muted-foreground">토지 유형별 세부 조건 검토</p>
                </div>
                {isStepCompleted("condition-check-1") && (
                  <CheckCircle2 className="ml-auto h-5 w-5 text-green-600" />
                )}
              </div>
              <div className={`space-y-2 transition-all duration-300 ${isStepActive("condition-check-1") || isStepCompleted("condition-check-1") ? "opacity-100" : "opacity-40"}`}>
                {physicalChecks.slice(0, 2).map((check, idx) => (
                  <div 
                    key={idx}
                    className={`flex items-center gap-2 rounded-lg p-3 border ${check.isMet ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
                  >
                    {check.isMet ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{check.criteriaName}</p>
                      <p className="text-xs text-muted-foreground truncate">{check.criteriaDescription}</p>
                    </div>
                    {!check.autoDetected && (
                      <Badge variant="outline" className="shrink-0 text-xs">직접확인</Badge>
                    )}
                    <Badge variant={check.isMet ? "default" : "destructive"} className="shrink-0">
                      {check.isMet ? "충족" : "미충족"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center py-2">
              <ArrowRight className={`h-5 w-5 rotate-90 transition-colors duration-300 ${isStepCompleted("condition-check-1") ? "text-green-600" : "text-muted-foreground"}`} />
            </div>

            {/* Step 4: 형상 체크 */}
            <div className={`rounded-xl border p-4 transition-all duration-500 ${getStepStyle("condition-check-2")}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white">
                  <FileCheck className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold">4. AI 정량 판독 - 형상 분석</h3>
                  <p className="text-sm text-muted-foreground">형상지수 변화 및 형상 부정형 여부</p>
                </div>
                {isStepCompleted("condition-check-2") && (
                  <CheckCircle2 className="ml-auto h-5 w-5 text-green-600" />
                )}
              </div>
              <div className={`space-y-2 transition-all duration-300 ${isStepActive("condition-check-2") || isStepCompleted("condition-check-2") ? "opacity-100" : "opacity-40"}`}>
                {shapeCheck && (
                  <div className={`flex items-center gap-2 rounded-lg p-3 border ${shapeCheck.isMet ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                    {shapeCheck.isMet ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{shapeCheck.criteriaName}</p>
                      <p className="text-xs text-muted-foreground truncate">{shapeCheck.criteriaDescription}</p>
                    </div>
                    <Badge variant={shapeCheck.isMet ? "default" : "destructive"} className="shrink-0">
                      {shapeCheck.isMet ? "충족" : "미충족"}
                    </Badge>
                  </div>
                )}
                {aiResult && (
                  <div className="rounded-lg border bg-card p-3">
                    <div className="grid grid-cols-3 gap-4 text-center text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">편입 전</p>
                        <p className="font-semibold">{aiResult.originalShapeIndex.toFixed(1)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">편입 후</p>
                        <p className="font-semibold">{aiResult.remainingShapeIndex.toFixed(1)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">변화량</p>
                        <p className={`font-semibold ${aiResult.shapeIndexChange >= 1 ? "text-red-600" : ""}`}>
                          +{aiResult.shapeIndexChange.toFixed(1)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center py-2">
              <ArrowRight className={`h-5 w-5 rotate-90 transition-colors duration-300 ${isStepCompleted("condition-check-2") ? "text-green-600" : "text-muted-foreground"}`} />
            </div>

            {/* Step 5: 담당자 검토 */}
            <div className={`rounded-xl border p-4 transition-all duration-500 ${getStepStyle("review")}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 text-white">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold">5. 담당자 검토</h3>
                  <p className="text-sm text-muted-foreground">현장/정성 확인 및 직접 입력 항목 검토</p>
                </div>
                {isStepCompleted("review") && (
                  <CheckCircle2 className="ml-auto h-5 w-5 text-green-600" />
                )}
              </div>
              <div className={`transition-all duration-300 ${isStepActive("review") || isStepCompleted("review") ? "opacity-100" : "opacity-40"}`}>
                <div className="rounded-lg border bg-card p-3">
                  <div className="flex flex-wrap gap-2">
                    {physicalChecks.filter(c => !c.autoDetected).length > 0 ? (
                      physicalChecks.filter(c => !c.autoDetected).map((check, idx) => (
                        <Badge key={idx} variant="outline" className="gap-1">
                          {check.isMet ? (
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                          ) : (
                            <XCircle className="h-3 w-3 text-red-600" />
                          )}
                          {check.criteriaName}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">직접 확인 항목 없음 - 자동 판독 완료</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center py-2">
              <ArrowRight className={`h-5 w-5 rotate-90 transition-colors duration-300 ${isStepCompleted("review") ? "text-green-600" : "text-muted-foreground"}`} />
            </div>

            {/* Step 6: 최종 판정 */}
            <div className={`rounded-xl border p-4 transition-all duration-500 ${getStepStyle("decision")}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${judgmentStyle.bg} ${judgmentStyle.text}`}>
                  <JudgmentIcon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold">6. 의사결정</h3>
                  <p className="text-sm text-muted-foreground">AI 잠정 판정 결과</p>
                </div>
                {isStepCompleted("decision") && (
                  <CheckCircle2 className="ml-auto h-5 w-5 text-green-600" />
                )}
              </div>
              <div className={`transition-all duration-300 ${isStepActive("decision") || isStepCompleted("decision") || currentStep === "complete" ? "opacity-100" : "opacity-40"}`}>
                <div className={`rounded-lg p-4 ${judgmentStyle.bg}`}>
                  <div className="flex items-center justify-center gap-3">
                    <JudgmentIcon className={`h-8 w-8 ${judgmentStyle.text}`} />
                    <span className={`text-2xl font-bold ${judgmentStyle.text}`}>
                      {aiResult?.provisionalJudgment || "-"}
                    </span>
                  </div>
                  {aiResult?.provisionalJudgment === "매수" && (
                    <p className="mt-2 text-center text-sm text-green-700">
                      수용 조건 충족 - 매수 대상입니다.
                    </p>
                  )}
                  {aiResult?.provisionalJudgment === "기각" && (
                    <p className="mt-2 text-center text-sm text-red-700">
                      수용 조건 미충족 - 기각 대상입니다.
                    </p>
                  )}
                  {aiResult?.provisionalJudgment === "검토필요" && (
                    <p className="mt-2 text-center text-sm text-amber-700">
                      추가 검토 필요 - 토지보상심의위원회 이관 검토
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 완료 메시지 */}
            {currentStep === "complete" && (
              <div className="mt-4 rounded-xl border-2 border-primary bg-primary/5 p-4 text-center animate-in fade-in duration-500">
                <CheckCircle2 className="mx-auto h-10 w-10 text-primary mb-2" />
                <h3 className="font-semibold text-primary">분석 완료</h3>
                <p className="text-sm text-muted-foreground">
                  AI 자동화 판독 프로세스가 완료되었습니다.
                </p>
              </div>
            )}
          </div>

          {/* 범례 */}
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">판정 기준</p>
            <div className="flex flex-wrap gap-3 text-xs">
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span>충족</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <span>미충족</span>
              </div>
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="text-xs h-5">직접확인</Badge>
                <span>담당자 확인 필요</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
