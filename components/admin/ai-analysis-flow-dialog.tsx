"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  Sparkles,
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
      const steps = [400, 800, 1200, 1600, 2000, 2400];
      steps.forEach((delay, i) => {
        setTimeout(() => setAnimationStep(i + 1), delay);
      });
    }
  }, [open]);

  const Icon = landTypeIcons[currentLandType];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-h-[90vh] overflow-y-auto p-0 border-0 shadow-2xl" 
        style={{ width: '65vw', maxWidth: '65vw', minWidth: '900px' }}
      >
        {/* 헤더 - 글래스모피즘 스타일 */}
        <DialogHeader className="px-8 pt-6 pb-5 bg-white sticky top-0 z-10">
          <DialogTitle className="flex items-center gap-4">
            <div className="relative">
              <div className="rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 p-3 shadow-lg shadow-emerald-200">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 rounded-full bg-white p-1 shadow">
                <Icon className="h-3.5 w-3.5 text-emerald-600" />
              </div>
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                AI 잔여지 매수 자동화 판독 프로세스
              </span>
              <p className="text-sm font-normal text-gray-500 mt-1">
                {landInfo.address}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="p-8 bg-gradient-to-b from-gray-50/50 to-white">
          {/* STEP 1: 토지 분류 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: animationStep >= 1 ? 1 : 0.3, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <StepHeader step={1} title="토지 분류" active={animationStep >= 1} />
            
            <div className="grid grid-cols-4 gap-4 mb-3">
              {(["대지", "농지", "산지", "그밖의토지"] as LandType[]).map((type) => {
                const TypeIcon = landTypeIcons[type];
                const isSelected = type === currentLandType && animationStep >= 1;
                return (
                  <motion.div
                    key={type}
                    initial={{ scale: 0.95 }}
                    animate={{ scale: isSelected ? 1.02 : 1 }}
                    className={cn(
                      "relative flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all duration-500",
                      isSelected
                        ? "border-emerald-400 bg-gradient-to-br from-emerald-50 to-white shadow-lg shadow-emerald-100"
                        : "border-gray-100 bg-white text-gray-400"
                    )}
                  >
                    {isSelected && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2.5 -right-2.5 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 p-1 shadow-md"
                      >
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      </motion.div>
                    )}
                    <div className={cn(
                      "rounded-xl p-2.5 transition-all",
                      isSelected ? "bg-emerald-100" : "bg-gray-50"
                    )}>
                      <TypeIcon className={cn("h-5 w-5", isSelected ? "text-emerald-600" : "text-gray-400")} />
                    </div>
                    <span className={cn("text-sm font-semibold", isSelected ? "text-emerald-700" : "text-gray-400")}>
                      {type}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* 연결선 */}
          <FlowConnectorRow landType={currentLandType} active={animationStep >= 2} />

          {/* STEP 2: 면적 기준 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: animationStep >= 2 ? 1 : 0.3, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <StepHeader step={2} title="면적 기준 미달 여부" active={animationStep >= 2} />

            <div className="grid grid-cols-4 gap-4 mb-3">
              <PathCard
                active={currentLandType === "대지" && animationStep >= 2}
                checked={currentLandType === "대지" && areaMet && animationStep >= 2}
              >
                <p className="font-semibold text-gray-800 mb-2">면적 기준</p>
                <div className="space-y-1 text-sm text-gray-500">
                  <p>주거 90㎡ 이하</p>
                  <p>상업 150㎡ 이하</p>
                  <p>공업 330㎡ 이하</p>
                </div>
                <p className="text-sm text-emerald-600 mt-2 font-medium">25% 이하 시 1.5배 완화</p>
              </PathCard>

              <PathCard
                active={currentLandType === "농지" && animationStep >= 2}
                checked={currentLandType === "농지" && areaMet && animationStep >= 2}
              >
                <p className="font-semibold text-gray-800 mb-2">면적 기준</p>
                <div className="space-y-1 text-sm text-gray-500">
                  <p>기본 330㎡ 이하</p>
                </div>
                <p className="text-sm text-emerald-600 mt-2 font-medium">25% 이하 시 495㎡ 완화</p>
              </PathCard>

              <PathCard
                active={currentLandType === "산지" && animationStep >= 2}
                checked={currentLandType === "산지" && areaMet && animationStep >= 2}
              >
                <p className="font-semibold text-gray-800 mb-2">면적 기준</p>
                <div className="space-y-1 text-sm text-gray-500">
                  <p>기본 330㎡ 이하</p>
                </div>
                <p className="text-sm text-emerald-600 mt-2 font-medium">25% 이하 시 495㎡ 완화</p>
              </PathCard>

              <PathCard
                active={currentLandType === "그밖의토지" && animationStep >= 2}
                checked={currentLandType === "그밖의토지" && areaMet && animationStep >= 2}
              >
                <p className="font-semibold text-gray-800 mb-2">면적 기준</p>
                <div className="space-y-1 text-sm text-gray-500">
                  <p>기본 330㎡ 이하</p>
                  <p>또는 잔여비율 50% 이하</p>
                </div>
              </PathCard>
            </div>
          </motion.div>

          {/* 연결선 */}
          <FlowConnectorRow landType={currentLandType} active={animationStep >= 3} />

          {/* STEP 3: 접면 도로/수로 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: animationStep >= 3 ? 1 : 0.3, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <StepHeader step={3} title="접면 도로/수로 상실 여부" active={animationStep >= 3} />

            <div className="grid grid-cols-4 gap-4 mb-3">
              <PathCard
                active={currentLandType === "대지" && animationStep >= 3}
                checked={currentLandType === "대지" && accessRoadLost && animationStep >= 3}
              >
                <p className="font-semibold text-gray-800 mb-2">접면 도로 상태 변경</p>
                <div className="space-y-1 text-sm text-gray-500">
                  <p>접면도로 상태 변경으로</p>
                  <p>건축허가 불가</p>
                </div>
              </PathCard>

              <PathCard
                active={currentLandType === "농지" && animationStep >= 3}
                checked={currentLandType === "농지" && accessRoadLost && animationStep >= 3}
              >
                <p className="font-semibold text-gray-800 mb-2">접면 도로/수로 상실</p>
                <div className="space-y-1 text-sm text-gray-500">
                  <p>도로/수로 상실로</p>
                  <p>농지로서의 사용 불가</p>
                </div>
              </PathCard>

              <PathCard
                active={currentLandType === "산지" && animationStep >= 3}
                checked={currentLandType === "산지" && accessRoadLost && animationStep >= 3}
              >
                <p className="font-semibold text-gray-800 mb-2">접면 도로 상실</p>
                <div className="space-y-1 text-sm text-gray-500">
                  <p>공익사업으로 인해</p>
                  <p>접한 도로가 없어진 경우</p>
                </div>
              </PathCard>

              <PathCard
                active={currentLandType === "그밖의토지" && animationStep >= 3}
                checked={currentLandType === "그밖의토지" && accessRoadLost && animationStep >= 3}
              >
                <p className="font-semibold text-gray-800 mb-2">진입 곤란</p>
                <div className="space-y-1 text-sm text-gray-500">
                  <p>절토 및 성토</p>
                  <p>옹벽 설치 등</p>
                </div>
              </PathCard>
            </div>
          </motion.div>

          {/* 연결선 */}
          <FlowConnectorRow landType={currentLandType} active={animationStep >= 4} />

          {/* STEP 4: 형상 변경 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: animationStep >= 4 ? 1 : 0.3, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <StepHeader step={4} title="형상 부정형으로 변경" active={animationStep >= 4} />

            <div className="grid grid-cols-4 gap-4 mb-3">
              <PathCard
                active={currentLandType === "대지" && animationStep >= 4}
                checked={currentLandType === "대지" && shapeChanged && animationStep >= 4}
              >
                <p className="font-semibold text-gray-800 mb-2">형상 부정형 변경</p>
                <div className="space-y-1 text-sm text-gray-500">
                  <p>사각형 폭: 5m 이하</p>
                  <p>삼각형 한 변: 11m 이하</p>
                </div>
              </PathCard>

              <PathCard
                active={currentLandType === "농지" && animationStep >= 4}
                checked={currentLandType === "농지" && shapeChanged && animationStep >= 4}
              >
                <p className="font-semibold text-gray-800 mb-2">농기계 회전 곤란</p>
                <div className="space-y-1 text-sm text-gray-500">
                  <p>농기계 진입/회전 곤란</p>
                  <p>사각형 폭: 5m 이하</p>
                </div>
              </PathCard>

              <PathCard
                active={currentLandType === "산지" && animationStep >= 4}
                checked={false}
                empty
              >
                <p className="text-sm text-gray-400 italic">해당 없음</p>
              </PathCard>

              <PathCard
                active={currentLandType === "그밖의토지" && animationStep >= 4}
                checked={currentLandType === "그밖의토지" && shapeChanged && animationStep >= 4}
              >
                <p className="font-semibold text-gray-800 mb-2">양분/형상 변경</p>
                <div className="space-y-1 text-sm text-gray-500">
                  <p>일단의 토지가 양분</p>
                  <p>형상지수 1.0↑ 상승</p>
                </div>
              </PathCard>
            </div>
          </motion.div>

          {/* 연결선 */}
          <FlowConnectorRow landType={currentLandType} active={animationStep >= 5} />

          {/* STEP 5: 판정 기준 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: animationStep >= 5 ? 1 : 0.3, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <StepHeader step={5} title="판정 기준" active={animationStep >= 5} />

            <div className="grid grid-cols-4 gap-4 mb-6">
              {(["대지", "농지", "산지", "그밖의토지"] as LandType[]).map((type) => {
                const isActive = type === currentLandType && animationStep >= 5;
                return (
                  <div
                    key={type}
                    className={cn(
                      "rounded-2xl border-2 p-4 transition-all duration-500",
                      isActive 
                        ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white shadow-sm" 
                        : "border-gray-100 bg-white text-gray-400"
                    )}
                  >
                    <div className="space-y-2 text-sm">
                      <p className={cn(
                        "flex items-center gap-2",
                        isActive && anyConditionMet ? "text-emerald-600 font-semibold" : ""
                      )}>
                        <span className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          isActive && anyConditionMet ? "bg-emerald-500" : "bg-gray-300"
                        )} />
                        하나 이상 해당 → 충족
                      </p>
                      <p className={cn(
                        "flex items-center gap-2",
                        isActive && !anyConditionMet ? "text-red-600 font-semibold" : ""
                      )}>
                        <span className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          isActive && !anyConditionMet ? "bg-red-500" : "bg-gray-300"
                        )} />
                        전체 미해당 → 미충족
                      </p>
                      <p className="flex items-center gap-2 text-gray-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                        추가 검토 필요 시 → 검토
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* 최종 판정 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ 
              opacity: animationStep >= 6 ? 1 : 0.3, 
              scale: animationStep >= 6 ? 1 : 0.95 
            }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="text-center mb-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gray-800 to-gray-900 px-5 py-2 text-sm font-semibold text-white shadow-lg">
                <Sparkles className="h-4 w-4" />
                AI 잠정 판정 결과
              </span>
            </div>

            <div className="flex justify-center gap-6">
              <JudgmentCard
                label="충족"
                subLabel="매수 대상"
                color="green"
                active={animationStep >= 6 && finalJudgment === "매수"}
                icon={CheckCircle2}
              />
              <JudgmentCard
                label="미충족"
                subLabel="매수 불가"
                color="red"
                active={animationStep >= 6 && (finalJudgment === "매수불가" || finalJudgment === "기각")}
                icon={XCircle}
              />
              <JudgmentCard
                label="검토필요"
                subLabel="추가 ��인"
                color="amber"
                active={animationStep >= 6 && finalJudgment === "검토필요"}
                icon={AlertTriangle}
              />
            </div>
          </motion.div>
        </div>

        {/* 푸터 - 현재 케이스 요약 */}
        <div className="px-8 py-5 border-t border-gray-100 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">토지 유형</span>
                <span className="font-semibold text-gray-800 bg-gray-100 px-2.5 py-1 rounded-lg">{currentLandType}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">잔여 면적</span>
                <span className="font-semibold text-gray-800">{remainingArea.toLocaleString()}㎡</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">잔여 비율</span>
                <span className="font-semibold text-gray-800">{remainingRatio}%</span>
              </div>
            </div>
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: animationStep >= 6 ? 1 : 0.9 }}
              className={cn(
                "flex items-center gap-2 rounded-full px-5 py-2 font-semibold text-white shadow-lg",
                finalJudgment === "매수" 
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-600" 
                  : finalJudgment === "매수불가" || finalJudgment === "기각" 
                    ? "bg-gradient-to-r from-red-500 to-red-600 shadow-red-200" 
                    : "bg-gradient-to-r from-amber-500 to-amber-600"
              )}
            >
              {finalJudgment === "매수" && <CheckCircle2 className="h-4 w-4" />}
              {(finalJudgment === "매수불가" || finalJudgment === "기각") && <XCircle className="h-4 w-4" />}
              {finalJudgment === "검토필요" && <AlertTriangle className="h-4 w-4" />}
              <span>{finalJudgment}</span>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// STEP 헤더 컴포넌트
function StepHeader({ step, title, active }: { step: number; title: string; active: boolean }) {
  return (
    <div className="mb-4">
      <motion.span 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: active ? 1 : 0.5, y: 0 }}
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300",
          active 
            ? "bg-gray-900 text-white shadow-lg" 
            : "bg-gray-200 text-gray-500"
        )}
      >
        <span className={cn(
          "flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold",
          active ? "bg-white text-gray-900" : "bg-gray-300 text-gray-500"
        )}>
          {step}
        </span>
        {title}
      </motion.span>
    </div>
  );
}

// 경로 카드 컴포넌트
function PathCard({
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
    <motion.div
      initial={{ scale: 0.98 }}
      animate={{ scale: active ? 1 : 0.98 }}
      className={cn(
        "relative rounded-2xl border-2 p-4 transition-all duration-500 min-h-[120px]",
        active
          ? checked
            ? "border-emerald-400 bg-gradient-to-br from-emerald-50 to-white shadow-lg shadow-emerald-100"
            : "border-emerald-300 bg-gradient-to-br from-emerald-50/50 to-white shadow-md"
          : "border-gray-100 bg-white",
        empty && "border-dashed border-gray-200"
      )}
    >
      {active && checked && (
        <motion.div 
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="absolute -top-2.5 -right-2.5 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 p-1 shadow-md"
        >
          <CheckCircle2 className="h-4 w-4 text-white" />
        </motion.div>
      )}
      <div className={cn(!active && "opacity-40")}>
        {children}
      </div>
    </motion.div>
  );
}

// 연결선 행 컴포넌트
function FlowConnectorRow({ landType, active }: { landType: LandType; active: boolean }) {
  return (
    <div className="grid grid-cols-4 gap-4 mb-3">
      {(["대지", "농지", "산지", "그밖의토지"] as LandType[]).map((type) => (
        <div key={type} className="flex justify-center py-2">
          <FlowConnector active={type === landType && active} />
        </div>
      ))}
    </div>
  );
}

// 연결선 컴포넌트
function FlowConnector({ active }: { active: boolean }) {
  return (
    <div className="relative h-8 w-8 flex items-center justify-center">
      {/* 배경 라인 */}
      <div className="absolute h-full w-0.5 bg-gray-200 rounded-full" />
      
      {/* 활성화 시 글로우 라인 */}
      {active && (
        <motion.div
          className="absolute w-1 rounded-full bg-gradient-to-b from-emerald-400 to-emerald-500"
          initial={{ height: 0, top: 0 }}
          animate={{ height: "100%", top: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={{
            boxShadow: "0 0 12px 3px rgba(52, 211, 153, 0.5)",
          }}
        />
      )}
      
      {/* 하단 점 */}
      <motion.div
        className={cn(
          "absolute bottom-0 w-2.5 h-2.5 rounded-full transition-all duration-300",
          active 
            ? "bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-200" 
            : "bg-gray-200"
        )}
        initial={active ? { scale: 0 } : {}}
        animate={active ? { scale: 1 } : {}}
        transition={{ delay: 0.3, duration: 0.2 }}
      />
    </div>
  );
}

// 판정 카드 컴포넌트
function JudgmentCard({
  label,
  subLabel,
  color,
  active,
  icon: Icon,
}: {
  label: string;
  subLabel: string;
  color: "green" | "red" | "amber";
  active: boolean;
  icon: typeof CheckCircle2;
}) {
  const gradients = {
    green: "from-emerald-400 to-emerald-600",
    red: "from-red-500 to-red-600",
    amber: "from-amber-400 to-amber-600",
  };
  
  const shadows = {
    green: "shadow-emerald-200",
    red: "shadow-red-200",
    amber: "shadow-amber-200",
  };
  
  const lightBgs = {
    green: "bg-emerald-50 border-emerald-100",
    red: "bg-red-50 border-red-100",
    amber: "bg-amber-50 border-amber-100",
  };
  
  const textColors = {
    green: "text-emerald-300",
    red: "text-red-300",
    amber: "text-amber-300",
  };

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0.5 }}
      animate={{ 
        scale: active ? 1.05 : 1, 
        opacity: active ? 1 : 0.6 
      }}
      transition={{ type: "spring", stiffness: 200 }}
      className={cn(
        "flex flex-col items-center gap-3 rounded-2xl border-2 px-10 py-6 transition-all duration-500",
        active
          ? `bg-gradient-to-br ${gradients[color]} text-white shadow-xl ${shadows[color]} border-transparent`
          : `${lightBgs[color]} ${textColors[color]}`
      )}
    >
      <Icon className={cn("h-10 w-10", active && color === "red" && "animate-pulse")} />
      <div className="text-center">
        <p className="text-lg font-bold">{label}</p>
        <p className={cn("text-sm", active ? "text-white/80" : "opacity-60")}>{subLabel}</p>
      </div>
    </motion.div>
  );
}
