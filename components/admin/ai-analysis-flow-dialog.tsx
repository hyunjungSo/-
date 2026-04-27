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
  Star,
  Layers,
  Check,
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
  "그밖의토지": Star,
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
    if (type === "대지") return { base: 90, relaxed: 135 };
    if (type === "농지") return { base: 330, relaxed: 495 };
    if (type === "산지") return { base: 330, relaxed: 495 };
    return { base: 330, relaxed: 330 };
  };

  const areaThreshold = getAreaThreshold(currentLandType);
  const isRatioRelaxed = remainingRatio <= 25;
  const effectiveThreshold = isRatioRelaxed ? areaThreshold.relaxed : areaThreshold.base;
  const areaMet = remainingArea <= effectiveThreshold;

  // 물리적 조건
  const accessRoadLost = aiResult?.accessRoadConditionMet === false;
  const shapeChanged = (landInfo.remainingShapeIndex || 0) - (landInfo.originalShapeIndex || 0) >= 1.0 ||
    ["삼각형", "역삼각형", "자루형", "부정형"].includes(landInfo.remainingShape || "");

  // 최종 판정
  const finalJudgment = aiResult?.provisionalJudgment || "검토필요";
  const anyConditionMet = areaMet || accessRoadLost || shapeChanged;

  // 조건 상태 결정
  const getConditionStatus = () => {
    if (anyConditionMet) return "충족";
    if (finalJudgment === "검토필요") return "검토필요";
    return "미충족";
  };
  const conditionStatus = getConditionStatus();

  // 애니메이션
  useEffect(() => {
    if (open) {
      setAnimationStep(0);
      const steps = [300, 600, 900, 1200, 1500, 1800, 2100];
      steps.forEach((delay, i) => {
        setTimeout(() => setAnimationStep(i + 1), delay);
      });
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-h-[95vh] overflow-y-auto p-0 border-0 shadow-2xl bg-white" 
        style={{ width: '70vw', maxWidth: '1200px', minWidth: '900px' }}
      >
        {/* 헤더 */}
        <DialogHeader className="px-6 pt-5 pb-4 bg-white sticky top-0 z-10 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-2 rounded bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white">
              AI 분석 프로세스
            </span>
            <div className="flex items-center gap-3">
              <Layers className="h-5 w-5 text-gray-400" />
              <span className="font-semibold text-gray-800">[공통] 일단의 토지</span>
              <span className="text-sm text-gray-500">소유자 동일, 지반 연속, 용도의 일체성 확인</span>
            </div>
            <div className="ml-auto flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-gray-600">일단지 판정 시 병합 처리</span>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6">
          {/* 토지 분류 헤더 */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: animationStep >= 1 ? 1 : 0.3 }}
            className="text-center mb-6"
          >
            <h3 className="text-lg font-bold text-gray-800 border-b-2 border-gray-800 inline-block pb-1">
              토지 분류
            </h3>
          </motion.div>

          {/* 4개 경로 컬럼 */}
          <div className="grid grid-cols-4 gap-4">
            {/* 대지 경로 */}
            <LandPathColumn
              type="대지"
              icon={Home}
              isActive={currentLandType === "대지"}
              animationStep={animationStep}
              areaContent={
                <>
                  <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    <div><p className="font-semibold">주거</p><p className="text-gray-500">90㎡ 이하</p></div>
                    <div><p className="font-semibold">상업</p><p className="text-gray-500">150㎡ 이하</p></div>
                    <div><p className="font-semibold">공업</p><p className="text-gray-500">330㎡ 이하</p></div>
                  </div>
                  <p className="text-sm text-blue-600 mt-2">잔여 비율 25% 이하 시, 1.5배 완화 적용</p>
                </>
              }
              roadContent={
                <>
                  <p className="text-sm text-gray-600">접면도로 상태 변경으로 건축허가 불가</p>
                </>
              }
              shapeContent={
                <>
                  <p className="text-sm text-gray-600">사각형 폭: 5m 이하</p>
                  <p className="text-sm text-gray-600">삼각형 한 변: 11m 이하</p>
                </>
              }
              conditionStatus={conditionStatus}
              areaMet={areaMet}
              accessRoadLost={accessRoadLost}
              shapeChanged={shapeChanged}
            />

            {/* 농지 경로 */}
            <LandPathColumn
              type="농지"
              icon={Wheat}
              isActive={currentLandType === "농지"}
              animationStep={animationStep}
              areaContent={
                <>
                  <div className="flex justify-between text-sm">
                    <div><p className="font-semibold">기본 면적</p><p className="text-gray-500">330㎡ 이하</p></div>
                    <div className="text-right"><p className="font-semibold text-blue-600">잔여 비율 25% 이하</p><p className="text-blue-600">495㎡ 이하 (완화)</p></div>
                  </div>
                </>
              }
              roadContent={
                <>
                  <p className="text-sm text-gray-600">도로/수로 상실로 농지로서의 사용 불가</p>
                  <p className="text-sm text-gray-600">접면도로 상태변경으로 축사부지 건축불가</p>
                </>
              }
              shapeContent={
                <>
                  <p className="text-sm text-gray-600">농기계 진입 및 회전 곤란</p>
                  <p className="text-sm text-gray-600">사각형 폭: 5m 이하</p>
                  <p className="text-sm text-gray-600">삼각형 한 변: 11m 이하</p>
                </>
              }
              conditionStatus={conditionStatus}
              areaMet={areaMet}
              accessRoadLost={accessRoadLost}
              shapeChanged={shapeChanged}
            />

            {/* 산지 경로 */}
            <LandPathColumn
              type="산지"
              icon={TreePine}
              isActive={currentLandType === "산지"}
              animationStep={animationStep}
              areaContent={
                <>
                  <div className="flex justify-between text-sm">
                    <div><p className="font-semibold">기본 면적</p><p className="text-gray-500">330㎡ 이하</p></div>
                    <div className="text-right"><p className="font-semibold text-blue-600">잔여 비율 25% 이하</p><p className="text-blue-600">495㎡ 이하 (완화)</p></div>
                  </div>
                </>
              }
              roadContent={
                <>
                  <p className="text-sm text-gray-600">산지가 도로와 접하였다가</p>
                  <p className="text-sm text-gray-600">공익사업으로 인해 접한 도로가 없어진 경우</p>
                </>
              }
              shapeContent={null}
              conditionStatus={conditionStatus}
              areaMet={areaMet}
              accessRoadLost={accessRoadLost}
              shapeChanged={shapeChanged}
            />

            {/* 그밖의토지 경로 */}
            <LandPathColumn
              type="그밖의토지"
              icon={Star}
              isActive={currentLandType === "그밖의토지"}
              animationStep={animationStep}
              areaContent={
                <>
                  <div className="flex justify-between text-sm">
                    <div><p className="font-semibold">기본 면적</p><p className="text-gray-500">330㎡ 이하</p></div>
                    <div className="text-right"><p className="font-semibold">또는</p><p className="text-gray-500">잔여 비율 50% 이하</p></div>
                  </div>
                </>
              }
              roadContent={
                <>
                  <p className="text-sm text-gray-600">절토 및 성토/옹벽 설치 등</p>
                </>
              }
              shapeContent={
                <>
                  <p className="text-sm text-gray-600">일단의 토지가 양분되어 잔여지 발생</p>
                  <p className="text-sm text-gray-600">정형: 잔여지 폭이 기준 이하로 변경</p>
                  <p className="text-xs text-gray-400">주거용 5m, 상업용 7m, 공업용, 농지, 산지 10m</p>
                </>
              }
              conditionStatus={conditionStatus}
              areaMet={areaMet}
              accessRoadLost={accessRoadLost}
              shapeChanged={shapeChanged}
            />
          </div>

          {/* 담당자 검토 섹션 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: animationStep >= 6 ? 1 : 0.3, y: 0 }}
            className="mt-8 pt-6 border-t-2 border-gray-200"
          >
            <div className="flex items-center gap-8">
              <h4 className="text-lg font-bold text-gray-800 whitespace-nowrap">담당자 검토</h4>
              <div className="flex-1 grid grid-cols-3 gap-4">
                <div className={cn(
                  "border rounded-lg p-4 text-center transition-all",
                  finalJudgment === "매수" ? "border-green-500 bg-green-50" : "border-gray-200"
                )}>
                  <p className="font-semibold text-gray-800">매수 판단</p>
                </div>
                <div className={cn(
                  "border rounded-lg p-4 text-center transition-all",
                  (finalJudgment === "매수불가" || finalJudgment === "기각") ? "border-red-500 bg-red-50" : "border-gray-200"
                )}>
                  <p className="font-semibold text-gray-800">기각 판단</p>
                </div>
                <div className={cn(
                  "border rounded-lg p-4 text-center transition-all",
                  finalJudgment === "검토필요" ? "border-amber-500 bg-amber-50" : "border-gray-200"
                )}>
                  <p className="font-semibold text-gray-800">토지보상심의위원회 이관 판단</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 최종 결정 섹션 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: animationStep >= 7 ? 1 : 0.3, y: 0 }}
            className="mt-6"
          >
            <div className="flex items-center gap-8">
              <h4 className="text-lg font-bold text-red-600 whitespace-nowrap border-l-4 border-red-600 pl-3">최종 결정</h4>
              <div className="flex-1 grid grid-cols-3 gap-4">
                <motion.div 
                  animate={{ scale: finalJudgment === "매수" && animationStep >= 7 ? 1.02 : 1 }}
                  className={cn(
                    "rounded-lg p-4 text-center font-bold transition-all",
                    finalJudgment === "매수" 
                      ? "bg-green-100 text-green-700 ring-2 ring-green-500" 
                      : "bg-green-50 text-green-300"
                  )}
                >
                  매수
                </motion.div>
                <motion.div 
                  animate={{ scale: (finalJudgment === "매수불가" || finalJudgment === "기각") && animationStep >= 7 ? 1.02 : 1 }}
                  className={cn(
                    "rounded-lg p-4 text-center font-bold border-2 transition-all",
                    (finalJudgment === "매수불가" || finalJudgment === "기각")
                      ? "border-red-500 text-red-600 bg-red-50 ring-2 ring-red-300" 
                      : "border-red-200 text-red-300"
                  )}
                >
                  기각
                </motion.div>
                <motion.div 
                  animate={{ scale: finalJudgment === "검토필요" && animationStep >= 7 ? 1.02 : 1 }}
                  className={cn(
                    "rounded-lg p-4 text-center font-bold border-2 transition-all",
                    finalJudgment === "검토필요"
                      ? "border-amber-500 text-amber-600 bg-amber-50 ring-2 ring-amber-300" 
                      : "border-amber-200 text-amber-300"
                  )}
                >
                  토지보상심의위원회 이관
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 푸터 - 현재 케이스 요약 */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">토지 유형</span>
                <span className="font-semibold text-gray-800 bg-white px-2 py-0.5 rounded border">{currentLandType}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">잔여 면적</span>
                <span className="font-semibold text-gray-800">{remainingArea.toLocaleString()}㎡</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">잔여 비율</span>
                <span className="font-semibold text-gray-800">{remainingRatio}%</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">AI 잠정 판정:</span>
              <span className={cn(
                "font-bold px-3 py-1 rounded",
                finalJudgment === "매수" ? "bg-green-500 text-white" :
                (finalJudgment === "매수불가" || finalJudgment === "기각") ? "bg-red-500 text-white" :
                "bg-amber-500 text-white"
              )}>
                {finalJudgment}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// 경로 컬럼 컴포넌트
function LandPathColumn({
  type,
  icon: Icon,
  isActive,
  animationStep,
  areaContent,
  roadContent,
  shapeContent,
  conditionStatus,
  areaMet,
  accessRoadLost,
  shapeChanged,
}: {
  type: LandType;
  icon: typeof Home;
  isActive: boolean;
  animationStep: number;
  areaContent: React.ReactNode;
  roadContent: React.ReactNode;
  shapeContent: React.ReactNode | null;
  conditionStatus: string;
  areaMet: boolean;
  accessRoadLost: boolean;
  shapeChanged: boolean;
}) {
  const showHighlight = isActive && animationStep >= 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: animationStep >= 1 ? 1 : 0.3, y: 0 }}
      className={cn(
        "rounded-lg border-2 p-4 transition-all",
        showHighlight ? "border-blue-400 bg-blue-50/30" : "border-gray-200 bg-white"
      )}
    >
      {/* 경로 헤더 */}
      <div className={cn(
        "flex items-center gap-2 mb-4 pb-3 border-b",
        showHighlight ? "border-blue-200" : "border-gray-100"
      )}>
        <Icon className={cn("h-5 w-5", showHighlight ? "text-blue-600" : "text-gray-400")} />
        <span className={cn("font-bold", showHighlight ? "text-blue-800" : "text-gray-600")}>
          {type} 경로
        </span>
      </div>

      {/* 면적 기준 미달 여부 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: animationStep >= 2 ? 1 : 0.4 }}
        className="mb-4"
      >
        <CriteriaCard
          title="면적 기준 미달 여부"
          isActive={isActive && animationStep >= 2}
          isMet={isActive && areaMet}
        >
          {areaContent}
        </CriteriaCard>
      </motion.div>

      {/* 접면 도로/수로 상실 여부 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: animationStep >= 3 ? 1 : 0.4 }}
        className="mb-4"
      >
        <CriteriaCard
          title={type === "농지" ? "접면 도로/수로 상실 여부" : "접면 도로 상실 여부"}
          isActive={isActive && animationStep >= 3}
          isMet={isActive && accessRoadLost}
        >
          {roadContent}
        </CriteriaCard>
      </motion.div>

      {/* 형상 변경 */}
      {shapeContent ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: animationStep >= 4 ? 1 : 0.4 }}
          className="mb-4"
        >
          <CriteriaCard
            title={type === "농지" ? "농기계 회전 곤란, 형상 부정형 변경" : type === "그밖의토지" ? "양분된 토지 / 형상 변경" : "형상 부정형으로 변경"}
            isActive={isActive && animationStep >= 4}
            isMet={isActive && shapeChanged}
          >
            {shapeContent}
          </CriteriaCard>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: animationStep >= 4 ? 1 : 0.4 }}
          className="mb-4"
        >
          <div className="border border-dashed border-gray-200 rounded-lg p-3 bg-gray-50">
            <p className="text-sm text-gray-400 italic text-center">해당 없음</p>
          </div>
        </motion.div>
      )}

      {/* 판정 조건 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: animationStep >= 5 ? 1 : 0.4 }}
        className="text-sm space-y-1 mb-4 py-3 border-t border-gray-100"
      >
        <p className={cn(
          "flex items-center gap-1",
          isActive && conditionStatus === "충족" ? "text-green-600 font-semibold" : "text-gray-500"
        )}>
          어느 하나라도 해당 시 조건 <span className="text-green-600">충족</span> → 수용
        </p>
        <p className={cn(
          "flex items-center gap-1",
          isActive && conditionStatus === "미충족" ? "text-red-600 font-semibold" : "text-gray-500"
        )}>
          전체 미해당 시 조건 <span className="text-red-600">미충족</span> → 수용
        </p>
        <p className={cn(
          "flex items-center gap-1",
          isActive && conditionStatus === "검토필요" ? "text-amber-600 font-semibold" : "text-gray-500"
        )}>
          실측 및 추가 검토 필요시 <span className="text-amber-600">검토 필요</span>
        </p>
      </motion.div>

      {/* 결과 배지 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: animationStep >= 5 ? 1 : 0.3, scale: animationStep >= 5 ? 1 : 0.9 }}
        className="flex justify-center"
      >
        {isActive ? (
          <span className={cn(
            "px-6 py-2 rounded-full text-sm font-bold",
            conditionStatus === "충족" ? "bg-green-100 text-green-700" :
            conditionStatus === "미충족" ? "bg-red-100 text-red-700" :
            "bg-amber-100 text-amber-700"
          )}>
            {conditionStatus}
          </span>
        ) : (
          <span className="px-6 py-2 rounded-full text-sm font-bold bg-gray-100 text-gray-400">
            -
          </span>
        )}
      </motion.div>
    </motion.div>
  );
}

// 기준 카드 컴포넌트
function CriteriaCard({
  title,
  isActive,
  isMet,
  children,
}: {
  title: string;
  isActive: boolean;
  isMet: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={cn(
      "border rounded-lg p-3 transition-all",
      isActive 
        ? isMet 
          ? "border-green-400 bg-green-50" 
          : "border-blue-300 bg-blue-50/50"
        : "border-gray-200 bg-white"
    )}>
      <div className="flex items-start gap-2 mb-2">
        {isMet && (
          <div className="flex-shrink-0 w-5 h-5 rounded bg-red-500 flex items-center justify-center mt-0.5">
            <Check className="h-3 w-3 text-white" />
          </div>
        )}
        <p className={cn(
          "font-semibold text-sm",
          isMet ? "text-red-600" : isActive ? "text-blue-700" : "text-gray-600"
        )}>
          {title}
        </p>
      </div>
      <div className={cn(!isActive && "opacity-50")}>
        {children}
      </div>
    </div>
  );
}
