"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { LandInfo, AIAnalysisResult } from "@/lib/types";
import {
  CheckCircle2,
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
  const remainingArea = landInfo.remainingArea || 0;
  const originalArea = landInfo.originalArea || 0;
  const includedArea = landInfo.includedArea || 0;
  const remainingRatio = landInfo.remainingRatio || 0;
  const originalShape = landInfo.originalShape || "정방형";
  const remainingShape = landInfo.remainingShape || "정방형";
  const originalShapeIndex = landInfo.originalShapeIndex || 4.0;
  const remainingShapeIndex = landInfo.remainingShapeIndex || 4.0;
  const shapeIndexChange = remainingShapeIndex - originalShapeIndex;
  
  // 용도지역 추출 (기본값: 주거)
  // 실제로는 landInfo에 별도 필드가 있어야 함. 현재는 임의로 "주거"로 설정
  const zoneType = "주거";
  
  // 면적 기준 계산 (PRD 기준)
  const getAreaThreshold = (type: LandType, zone: string) => {
    if (type === "대지") {
      if (zone.includes("상업")) return { base: 150, relaxed: 225, label: "상업" };
      if (zone.includes("공업")) return { base: 330, relaxed: 495, label: "공업" };
      return { base: 90, relaxed: 135, label: "주거" };
    }
    if (type === "농지") return { base: 330, relaxed: 495, label: "농지" };
    if (type === "산지") return { base: 330, relaxed: 495, label: "산지" };
    return { base: 330, relaxed: 330, label: "그밖의토지" };
  };

  const areaThreshold = getAreaThreshold(currentLandType, zoneType);
  const isRatioRelaxed = remainingRatio <= 25;
  const effectiveThreshold = isRatioRelaxed ? areaThreshold.relaxed : areaThreshold.base;
  const areaMet = remainingArea <= effectiveThreshold;

  // 물리적 조건 (aiResult에서 가져오기)
  const accessRoadLost = aiResult?.accessRoadLost || false;
  const waterChannelLost = aiResult?.waterChannelLost || false;
  const farmMachineDifficulty = aiResult?.farmMachineDifficulty || false;
  const isBlindLand = aiResult?.isBlindLand || false;
  
  // 형상 변경 여부
  const isIrregularShape = ["삼각형", "역삼각형", "자루형", "부정형"].includes(remainingShape);
  const shapeChanged = shapeIndexChange >= 1.0 || isIrregularShape;

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
        style={{ width: '75vw', maxWidth: '1400px', minWidth: '1000px' }}
      >
        {/* 헤더 */}
        <DialogHeader className="px-6 pt-5 pb-4 bg-white sticky top-0 z-10 border-b border-gray-100">
          <DialogTitle className="text-lg font-semibold text-foreground">
            AI 분석 프로세스
          </DialogTitle>
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
            <PathColumn
              type="대지"
              icon={Home}
              isActive={currentLandType === "대지"}
              animationStep={animationStep}
              criteria={[
                {
                  title: "면적 기준 미달 여부",
                  items: [
                    { label: "주거", value: "90㎡ 이하", isSelected: currentLandType === "대지" && areaThreshold.label === "주거", isMet: currentLandType === "대지" && areaThreshold.label === "주거" && areaMet, 
                      explanationMet: `잔여면적 ${remainingArea.toLocaleString()}㎡ ≤ 기준 ${effectiveThreshold.toLocaleString()}㎡${isRatioRelaxed ? " (완화적용)" : ""}`,
                      explanationUnmet: `잔여면적 ${remainingArea.toLocaleString()}㎡ > 기준 ${effectiveThreshold.toLocaleString()}㎡${isRatioRelaxed ? " (완화적용)" : ""}` },
                    { label: "상업", value: "150㎡ 이하", isSelected: currentLandType === "대지" && areaThreshold.label === "상업", isMet: currentLandType === "대지" && areaThreshold.label === "상업" && areaMet,
                      explanationMet: `잔여면적 ${remainingArea.toLocaleString()}㎡ ≤ 기준 ${effectiveThreshold.toLocaleString()}㎡${isRatioRelaxed ? " (완화적용)" : ""}`,
                      explanationUnmet: `잔여면적 ${remainingArea.toLocaleString()}㎡ > 기준 ${effectiveThreshold.toLocaleString()}㎡${isRatioRelaxed ? " (완화적용)" : ""}` },
                    { label: "공업", value: "330㎡ 이하", isSelected: currentLandType === "대지" && areaThreshold.label === "공업", isMet: currentLandType === "대지" && areaThreshold.label === "공업" && areaMet,
                      explanationMet: `잔여면적 ${remainingArea.toLocaleString()}㎡ ≤ 기준 ${effectiveThreshold.toLocaleString()}��${isRatioRelaxed ? " (완화적용)" : ""}`,
                      explanationUnmet: `잔여면적 ${remainingArea.toLocaleString()}㎡ > 기준 ${effectiveThreshold.toLocaleString()}㎡${isRatioRelaxed ? " (완화적용)" : ""}` },
                  ],
                  note: "잔여 비율 25% 이하 시, 1.5배 완화 적용",
                  showStep: 2,
                },
                {
                  title: "접면 도로 상태 변경",
                  items: [
                    { label: "접면도로 상태 변경으로 건축허가 불가", isSelected: currentLandType === "대지", isMet: currentLandType === "대지" && accessRoadLost,
                      explanationMet: "접면도로 상태 변경으로 건축 불가 상태 확인됨",
                      explanationUnmet: "접면도로 상태 변경 없음 - 건축 가능 상태" },
                  ],
                  showStep: 3,
                },
                {
                  title: "형상 부정형으로 변경",
                  items: [
                    { label: "사각형 폭: 5m 이하", isSelected: currentLandType === "대지", isMet: currentLandType === "대지" && shapeChanged,
                      explanationMet: `형상 변경: ${originalShape} → ${remainingShape} (형상지수 +${shapeIndexChange.toFixed(1)})`,
                      explanationUnmet: `형상 유지: ${originalShape} → ${remainingShape} (형상지수 +${shapeIndexChange.toFixed(1)})` },
                    { label: "삼각형 한 변: 11m 이하", isSelected: currentLandType === "대지", isMet: currentLandType === "대지" && shapeChanged,
                      explanationMet: `비정형 형상(${remainingShape})으로 기준 충족`,
                      explanationUnmet: `정형 형상(${remainingShape}) 유지 - 형상 기준 미해당` },
                  ],
                  showStep: 4,
                },
              ]}
              conditionStatus={currentLandType === "대지" ? conditionStatus : null}
            />

            {/* 농지 경로 */}
            <PathColumn
              type="농지"
              icon={Wheat}
              isActive={currentLandType === "농지"}
              animationStep={animationStep}
              criteria={[
                {
                  title: "면적 기준 미달 여부",
                  items: [
                    { label: "기본 면적", value: "330㎡ 이하", isSelected: currentLandType === "농지" && !isRatioRelaxed, isMet: currentLandType === "농지" && !isRatioRelaxed && areaMet,
                      explanationMet: `잔여면적 ${remainingArea.toLocaleString()}㎡ ≤ 기준 330㎡`,
                      explanationUnmet: `잔여면적 ${remainingArea.toLocaleString()}㎡ > 기준 330㎡` },
                    { label: "잔여 비율 25% 이하", value: "495㎡ 이하 (완화)", isSelected: currentLandType === "농지" && isRatioRelaxed, isMet: currentLandType === "농지" && isRatioRelaxed && areaMet, highlight: true,
                      explanationMet: `잔여면적 ${remainingArea.toLocaleString()}㎡ ≤ 완화기준 495㎡`,
                      explanationUnmet: `잔여면적 ${remainingArea.toLocaleString()}㎡ > 완화기준 495㎡` },
                  ],
                  showStep: 2,
                },
                {
                  title: "접면 도로/수로 상실 여부",
                  items: [
                    { label: "도로/수로 상실로 농지로서의 사용 불가", isSelected: currentLandType === "농지", isMet: currentLandType === "농지" && (accessRoadLost || waterChannelLost),
                      explanationMet: accessRoadLost ? "접면도로 상실 확인됨" : "관개수로 상실 확인됨",
                      explanationUnmet: "도로/수로 정상 유지 - 농지로서 사용 가능" },
                    { label: "접면도로 상태변경으로 축사부지 건축불가", isSelected: currentLandType === "농지", isMet: currentLandType === "농지" && accessRoadLost,
                      explanationMet: "접면도로 상태변경으로 축사부지 건축 불가",
                      explanationUnmet: "접면도로 정상 - 축사부지 건축 가능" },
                  ],
                  showStep: 3,
                },
                {
                  title: "농기계 회전 곤란, 형상 부정형 변경",
                  items: [
                    { label: "농기계 진입 및 회전 곤란", isSelected: currentLandType === "농지", isMet: currentLandType === "농지" && farmMachineDifficulty,
                      explanationMet: "민원인 확인: 농기계 진입/회전 곤란 상태",
                      explanationUnmet: "농기계 진입/회전 가능 상태" },
                    { label: "사각형 폭: 5m 이하", isSelected: currentLandType === "농지", isMet: currentLandType === "농지" && shapeChanged,
                      explanationMet: `형상 변경: ${originalShape} → ${remainingShape} (형상지수 +${shapeIndexChange.toFixed(1)})`,
                      explanationUnmet: `형상 유지: ${originalShape} → ${remainingShape} (형상지수 +${shapeIndexChange.toFixed(1)})` },
                    { label: "삼각형 한 변: 11m 이하", isSelected: currentLandType === "농지", isMet: currentLandType === "농지" && isIrregularShape,
                      explanationMet: `비정형 형상(${remainingShape})으로 기준 충족`,
                      explanationUnmet: `정형 형상(${remainingShape}) 유지 - 형상 기준 미해당` },
                  ],
                  showStep: 4,
                },
              ]}
              conditionStatus={currentLandType === "농지" ? conditionStatus : null}
            />

            {/* 산지 경로 */}
            <PathColumn
              type="산지"
              icon={TreePine}
              isActive={currentLandType === "산지"}
              animationStep={animationStep}
              criteria={[
                {
                  title: "면적 기준 미달 여부",
                  items: [
                    { label: "기본 면적", value: "330㎡ 이하", isSelected: currentLandType === "산지" && !isRatioRelaxed, isMet: currentLandType === "산지" && !isRatioRelaxed && areaMet,
                      explanationMet: `잔여면적 ${remainingArea.toLocaleString()}㎡ ≤ 기준 330㎡`,
                      explanationUnmet: `잔여면적 ${remainingArea.toLocaleString()}㎡ > 기준 330㎡` },
                    { label: "잔여 비율 25% 이하", value: "495㎡ 이하 (완화)", isSelected: currentLandType === "산지" && isRatioRelaxed, isMet: currentLandType === "산지" && isRatioRelaxed && areaMet, highlight: true,
                      explanationMet: `잔여면적 ${remainingArea.toLocaleString()}㎡ ≤ 완화기준 495㎡`,
                      explanationUnmet: `잔여면적 ${remainingArea.toLocaleString()}㎡ > 완화기준 495㎡` },
                  ],
                  showStep: 2,
                },
                {
                  title: "접면 도로 상실 여부",
                  items: [
                    { label: "산지가 도로와 접하였다가 공익사업으로 인해 접한 도로가 없어진 경우", isSelected: currentLandType === "산지", isMet: currentLandType === "산지" && accessRoadLost,
                      explanationMet: "공익사업으로 접면도로 상실 확인됨",
                      explanationUnmet: "접면도로 정상 유지 - 도로 상실 기준 미해당" },
                  ],
                  showStep: 3,
                },
                {
                  title: null, // 해당 없음
                  items: [],
                  showStep: 4,
                },
              ]}
              conditionStatus={currentLandType === "산지" ? conditionStatus : null}
            />

            {/* 그밖의토지 경로 */}
            <PathColumn
              type="그밖의토지"
              icon={Star}
              isActive={currentLandType === "그밖의토지"}
              animationStep={animationStep}
              criteria={[
                {
                  title: "면적 기준 미달 여부",
                  items: [
                    { label: "기본 면적", value: "330㎡ 이하", isSelected: currentLandType === "그밖의토지", isMet: currentLandType === "그밖의토지" && areaMet,
                      explanationMet: `잔여면적 ${remainingArea.toLocaleString()}㎡ ≤ 기준 330㎡`,
                      explanationUnmet: `잔여면적 ${remainingArea.toLocaleString()}㎡ > 기준 330㎡` },
                    { label: "또는", value: "잔여 비율 50% 이하", isSelected: currentLandType === "그밖의토지" && remainingRatio <= 50, isMet: currentLandType === "그밖의토지" && remainingRatio <= 50,
                      explanationMet: `잔여비율 ${remainingRatio.toFixed(1)}% ≤ 기준 50%`,
                      explanationUnmet: `잔여비율 ${remainingRatio.toFixed(1)}% > 기준 50%` },
                  ],
                  showStep: 2,
                },
                {
                  title: "진입 곤란",
                  items: [
                    { label: "절토 및 성토/옹벽 설치 등", isSelected: currentLandType === "그밖의토지", isMet: currentLandType === "그밖의토지" && accessRoadLost,
                      explanationMet: "절토/성토/옹벽 설치로 진입 곤란 확인됨",
                      explanationUnmet: "진입 가능 - 진입 곤란 기준 미해당" },
                  ],
                  showStep: 3,
                },
                {
                  title: "양분된 토지 / 형상 변경",
                  items: [
                    { label: "일단의 토지가 양분되어 잔여지 발생", isSelected: currentLandType === "그밖의토지", isMet: currentLandType === "그밖의토지" && includedArea > 0,
                      explanationMet: `편입면적 ${includedArea.toLocaleString()}㎡로 토지 양분됨`,
                      explanationUnmet: "편입 없음 - 토지 양분 미발생" },
                    { label: "정형: 잔여지 폭이 기준 이하로 변경", isSelected: currentLandType === "그밖의토지", isMet: currentLandType === "그밖의토지" && shapeChanged, subLabel: "주거용 5m, 상업용 7m, 공업용/농지/산지 10m",
                      explanationMet: `형상 변경: ${originalShape} → ${remainingShape} (형상지수 +${shapeIndexChange.toFixed(1)})`,
                      explanationUnmet: `형상 유지: ${originalShape} → ${remainingShape} (형상지수 +${shapeIndexChange.toFixed(1)})` },
                  ],
                  showStep: 4,
                },
              ]}
              conditionStatus={currentLandType === "그밖의토지" ? conditionStatus : null}
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
                <span className="text-gray-400">/ 기준 {effectiveThreshold}㎡ {isRatioRelaxed && "(완화)"}</span>
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

// 기준 아이템 타입
interface CriteriaItem {
  label: string;
  value?: string;
  subLabel?: string;
  isSelected: boolean;
  isMet: boolean;
  highlight?: boolean;
  explanationMet?: string;
  explanationUnmet?: string;
}

interface Criteria {
  title: string | null;
  items: CriteriaItem[];
  note?: string;
  showStep: number;
}

// 경로 컬럼 컴포넌트
function PathColumn({
  type,
  icon: Icon,
  isActive,
  animationStep,
  criteria,
  conditionStatus,
}: {
  type: LandType;
  icon: typeof Home;
  isActive: boolean;
  animationStep: number;
  criteria: Criteria[];
  conditionStatus: string | null;
}) {
  const showHighlight = isActive && animationStep >= 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: animationStep >= 1 ? 1 : 0.5, y: 0 }}
      className={cn(
        "rounded-lg border-2 p-4 transition-all",
        showHighlight ? "border-blue-500 bg-blue-50/50 shadow-lg" : "border-gray-200 bg-white"
      )}
    >
      {/* 경로 헤더 */}
      <div className={cn(
        "flex items-center gap-2 mb-4 pb-3 border-b",
        showHighlight ? "border-blue-200" : "border-gray-100"
      )}>
        <Icon className={cn("h-5 w-5", showHighlight ? "text-blue-600" : "text-gray-400")} />
        <span className={cn("font-bold", showHighlight ? "text-blue-800" : "text-gray-500")}>
          {type} 경로
        </span>
      </div>

      {/* 기준 카드들 */}
      {criteria.map((c, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0 }}
          animate={{ opacity: animationStep >= c.showStep ? 1 : 0.4 }}
          className="mb-3"
        >
          {c.title === null ? (
            <div className="border border-dashed border-gray-200 rounded-lg p-3 bg-gray-50">
              <p className="text-sm text-gray-400 italic text-center">해당 없음</p>
            </div>
          ) : (
            <div className={cn(
              "border rounded-lg p-3 transition-all",
              isActive && c.items.some(item => item.isMet)
                ? "border-green-400 bg-green-50"
                : isActive 
                  ? "border-blue-300 bg-white"
                  : "border-gray-200 bg-white"
            )}>
              {/* 카드 타이틀 + 뱃지 */}
              <div className="flex items-center justify-between mb-2">
                <p className={cn(
                  "text-sm font-semibold",
                  isActive && c.items.some(item => item.isMet) ? "text-green-700" : "text-gray-700"
                )}>
                  {c.title}
                </p>
                {isActive && (
                  <span className={cn(
                    "text-xs font-bold px-2 py-0.5 rounded",
                    c.items.some(item => item.isMet) 
                      ? "bg-green-500 text-white" 
                      : "bg-red-500 text-white"
                  )}>
                    {c.items.some(item => item.isMet) ? "충족" : "미충족"}
                  </span>
                )}
              </div>

              {/* 기준 항목들 */}
              <div className="space-y-1.5 pl-1">
                {c.items.map((item, itemIdx) => (
                  <div 
                    key={itemIdx}
                    className={cn(
                      "flex items-start gap-2 text-sm rounded px-2 py-1 transition-all",
                      item.isSelected && item.isMet ? "bg-green-100 border border-green-300" : 
                      item.isSelected ? "bg-blue-50 border border-blue-200" : ""
                    )}
                  >
                    {item.isSelected && (
                      <div className={cn(
                        "flex-shrink-0 w-4 h-4 rounded-sm flex items-center justify-center mt-0.5",
                        item.isMet ? "bg-green-500" : "border border-gray-300"
                      )}>
                        {item.isMet && <Check className="h-3 w-3 text-white" />}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          item.isSelected ? (item.isMet ? "text-green-700 font-semibold" : "text-blue-700") : "text-gray-600"
                        )}>
                          {item.label}
                        </span>
                        {item.value && (
                          <span className={cn(
                            "text-sm",
                            item.highlight ? "text-blue-600 font-semibold" : "text-gray-500"
                          )}>
                            {item.value}
                          </span>
                        )}
                      </div>
                      {item.subLabel && (
                        <p className="text-xs text-gray-400 mt-0.5">{item.subLabel}</p>
                      )}
                      {/* 충족/미충족 상세 설명 */}
                      {item.isSelected && item.isMet && item.explanationMet && (
                        <p className="text-xs text-green-600 mt-1 font-medium">
                          ✓ {item.explanationMet}
                        </p>
                      )}
                      {item.isSelected && !item.isMet && item.explanationUnmet && (
                        <p className="text-xs text-red-600 mt-1 font-medium">
                          ✗ {item.explanationUnmet}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* 참고 사항 */}
              {c.note && (
                <p className="text-xs text-blue-600 mt-2 pl-1">{c.note}</p>
              )}
            </div>
          )}
        </motion.div>
      ))}

      {/* 판정 조건 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: animationStep >= 5 ? 1 : 0.4 }}
        className="text-sm space-y-1 mb-4 py-3 border-t border-gray-100"
      >
        <p className={cn(
          "flex items-center gap-1",
          conditionStatus === "충족" ? "text-green-600 font-semibold" : "text-gray-500"
        )}>
          어느 하나라도 해당 시 조건 <span className="text-green-600">충족</span> → 수용
        </p>
        <p className={cn(
          "flex items-center gap-1",
          conditionStatus === "미충족" ? "text-red-600 font-semibold" : "text-gray-500"
        )}>
          전체 미해당 시 조건 <span className="text-red-600">미충족</span> → 수용
        </p>
        <p className={cn(
          "flex items-center gap-1",
          conditionStatus === "검토필요" ? "text-amber-600 font-semibold" : "text-gray-500"
        )}>
          실측 및 추가 검토 필요시 → <span className="text-amber-600">검토필요</span>
        </p>
      </motion.div>

      {/* 결과 배지 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: animationStep >= 5 ? 1 : 0.3, scale: animationStep >= 5 ? 1 : 0.9 }}
        className="flex justify-center"
      >
        {conditionStatus ? (
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
