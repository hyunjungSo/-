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
  Home,
  Wheat,
  TreePine,
  Star,
  Layers,
  Check,
  X,
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

  // 조건 상태 결정 (AI 판정 결과 우선 적용)
  const getConditionStatus = () => {
    // AI 판정이 검토필요인 경우 검토필요 반환
    if (finalJudgment === "검토필요") return "검토필요";
    // AI 판정이 매수인 경우 충족 반환
    if (finalJudgment === "매수") return "충족";
    // AI 판정이 매수불가/기각인 경우 미충족 반환
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
        <DialogHeader className="px-6 pt-4 pb-4 bg-white sticky top-0 z-10 border-b border-gray-100">
          <DialogTitle className="text-lg font-semibold text-foreground">
            AI 분석 프로세스
          </DialogTitle>
        </DialogHeader>

        <div className="p-4">
          {/* 토지 분류 섹션 */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: animationStep >= 1 ? 1 : 0.3 }}
            className="flex flex-col"
          >
            {/* 타이틀 */}
            <div className="mb-4">
              <h3 className="text-sm font-bold text-gray-700">
                토지 분류
              </h3>
            </div>
            {/* 4개 경로 컬럼 */}
            <div className="grid grid-cols-4 gap-3">
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
                  title: "접면도로 상태 변경",
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
                      explanationMet: `잔여비율 ${remainingRatio.toFixed(1)}% <= 기준 50%`,
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
          </motion.div>

          {/* 담��자 검토 섹션 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: animationStep >= 6 ? 1 : 0.3, y: 0 }}
            className="mt-6 pt-4 border-t border-gray-200"
          >
            <div className="flex flex-col">
              <div className="mb-3">
                <h4 className="text-sm font-bold text-gray-700">담당자 검토</h4>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className={cn(
                  "border rounded p-3 text-center transition-all",
                  finalJudgment === "매수" ? "border-green-500 bg-green-50" : "border-gray-200 bg-gray-50"
                )}>
                  <p className={cn("text-sm font-medium", finalJudgment === "매수" ? "text-green-700" : "text-gray-500")}>매수 판단</p>
                </div>
                <div className={cn(
                  "border rounded p-3 text-center transition-all",
                  (finalJudgment === "매수불가" || finalJudgment === "기각") ? "border-red-500 bg-red-50" : "border-gray-200 bg-gray-50"
                )}>
                  <p className={cn("text-sm font-medium", (finalJudgment === "매수불가" || finalJudgment === "기각") ? "text-red-700" : "text-gray-500")}>기각 판단</p>
                </div>
                <div className={cn(
                  "border rounded p-3 text-center transition-all",
                  finalJudgment === "검토필요" ? "border-amber-500 bg-amber-50" : "border-gray-200 bg-gray-50"
                )}>
                  <p className={cn("text-sm font-medium", finalJudgment === "검토필요" ? "text-amber-700" : "text-gray-500")}>토지보상심의위원회 이관 판단</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 최종 결정 섹션 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: animationStep >= 7 ? 1 : 0.3, y: 0 }}
            className="mt-4"
          >
            <div className="flex flex-col">
              <div className="mb-3">
                <h4 className="text-sm font-bold text-gray-700">최종 결정</h4>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <motion.div 
                  animate={{ scale: finalJudgment === "매수" && animationStep >= 7 ? 1.02 : 1 }}
                  className={cn(
                    "rounded p-3 text-center text-sm font-semibold border transition-all",
                    finalJudgment === "매수" 
                      ? "border-green-500 bg-green-500 text-white" 
                      : "border-gray-200 bg-gray-50 text-gray-400"
                  )}
                >
                  매수
                </motion.div>
                <motion.div 
                  animate={{ scale: (finalJudgment === "매수불가" || finalJudgment === "기각") && animationStep >= 7 ? 1.02 : 1 }}
                  className={cn(
                    "rounded p-3 text-center text-sm font-semibold border transition-all",
                    (finalJudgment === "매수불가" || finalJudgment === "기각")
                      ? "border-red-500 bg-red-500 text-white" 
                      : "border-gray-200 bg-gray-50 text-gray-400"
                  )}
                >
                  기각
                </motion.div>
                <motion.div 
                  animate={{ scale: finalJudgment === "검토필요" && animationStep >= 7 ? 1.02 : 1 }}
                  className={cn(
                    "rounded p-3 text-center text-sm font-semibold border transition-all",
                    finalJudgment === "검토필요"
                      ? "border-amber-500 bg-amber-500 text-white" 
                      : "border-gray-200 bg-gray-50 text-gray-400"
                  )}
                >
                  토지보상심의위원회 이관
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 푸터 - 현재 케이스 요약 */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-base text-gray-500">토지 유형</span>
                <span className="text-base font-semibold text-gray-800 bg-white px-3 py-1 rounded border">{currentLandType}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base text-gray-500">잔여 면적</span>
                <span className="text-base font-semibold text-gray-800">{remainingArea.toLocaleString()}㎡</span>
                <span className="text-sm text-gray-400">/ 기준 {effectiveThreshold}㎡ {isRatioRelaxed && "(완화)"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base text-gray-500">잔여 비율</span>
                <span className="text-base font-semibold text-gray-800">{remainingRatio}%</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-base text-gray-500">AI 잠정 판정:</span>
              <span className={cn(
                "text-base font-bold px-4 py-1.5 rounded",
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
  // 충족/미충족 상태에 따른 색상 결정
  const isMet = conditionStatus === "충족";
  const isUnmet = conditionStatus === "미충족";
  
  // 색상 클래스 결정
  const borderColor = showHighlight 
    ? (isMet ? "border-green-500" : isUnmet ? "border-red-500" : "border-amber-500")
    : "border-gray-200";
  const bgColor = showHighlight 
    ? (isMet ? "bg-green-50/30" : isUnmet ? "bg-red-50/30" : "bg-amber-50/30")
    : "bg-white";
  const headerBorderColor = showHighlight 
    ? (isMet ? "border-green-200" : isUnmet ? "border-red-200" : "border-amber-200")
    : "border-gray-100";
  const iconColor = showHighlight 
    ? (isMet ? "text-green-600" : isUnmet ? "text-red-600" : "text-amber-600")
    : "text-gray-400";
  const titleColor = showHighlight 
    ? (isMet ? "text-green-800" : isUnmet ? "text-red-800" : "text-amber-800")
    : "text-gray-500";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: animationStep >= 1 ? 1 : 0.5, y: 0 }}
      className={cn(
        "rounded-lg border p-3 transition-all",
        borderColor, bgColor
      )}
    >
      {/* 경로 헤더 */}
      <div className={cn(
        "flex items-center gap-2 mb-3 pb-2 border-b",
        headerBorderColor
      )}>
        <Icon className={cn("h-5 w-5", iconColor)} />
        <span className={cn("text-sm font-bold", titleColor)}>
          {type} 경로
        </span>
      </div>

      {/* 기준 카드들 */}
      {criteria.map((c, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0 }}
          animate={{ opacity: animationStep >= c.showStep ? 1 : 0.4 }}
          className="mb-2"
        >
          {c.title === null ? (
            <div className={cn(
              "border border-dashed rounded p-2",
              showHighlight 
                ? (isMet ? "border-green-300 bg-green-50/30" : isUnmet ? "border-red-300 bg-red-50/30" : "border-amber-300 bg-amber-50/30")
                : "border-gray-200 bg-gray-50"
            )}>
              <p className="text-sm text-gray-400 italic text-center">해당 없음</p>
            </div>
          ) : (
            <div className={cn(
              "rounded p-2 transition-all",
              showHighlight ? bgColor : "bg-white"
            )}>
              {/* 카드 타이틀 + 체크박스 + 뱃지 */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  {/* 체크박스 - 충족시 체크, 미충족시 X 표시 */}
                  <div className={cn(
                    "flex-shrink-0 w-4 h-4 rounded-sm flex items-center justify-center border",
                    isActive && conditionStatus && c.items.some(item => item.isMet) 
                      ? "bg-green-500 border-green-500" 
                      : isActive && conditionStatus && !c.items.some(item => item.isMet)
                        ? "bg-red-500 border-red-500"
                        : "border-gray-300 bg-white"
                  )}>
                    {isActive && conditionStatus && c.items.some(item => item.isMet) && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                    {isActive && conditionStatus && !c.items.some(item => item.isMet) && (
                      <X className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <p className="text-sm font-semibold text-gray-700">
                    {c.title}
                  </p>
                </div>
              </div>

              {/* 기준 항목들 */}
              <div className="space-y-1 pl-6">
                {c.items.map((item, itemIdx) => (
                  <div 
                    key={itemIdx}
                    className={cn(
                      "flex items-start gap-2 text-sm py-0.5 rounded",
                      showHighlight ? bgColor : "bg-transparent"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-gray-700">
                          {item.label}
                        </span>
                        {item.value && (
                          <span className="text-sm text-gray-400">
                            {item.value}
                          </span>
                        )}
                      </div>
                      {item.subLabel && (
                        <p className="text-sm text-gray-400 mt-0.5">{item.subLabel}</p>
                      )}
                      {/* 충족/미충족 상세 설명 - 여기에만 컬러 적용 */}
                      {item.isSelected && item.isMet && item.explanationMet && (
                        <p className="text-sm text-green-600 mt-0.5">
                          {item.explanationMet}
                        </p>
                      )}
                      {item.isSelected && !item.isMet && item.explanationUnmet && (
                        <p className="text-sm text-red-500 mt-0.5">
                          {item.explanationUnmet}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* 참고 사항 */}
              {c.note && (
                <p className="text-sm text-gray-400 mt-1.5">{c.note}</p>
              )}
            </div>
          )}
        </motion.div>
      ))}

      {/* 판정 조건 - isActive이고 conditionStatus가 있을 때만 표시 */}
      {isActive && conditionStatus && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: animationStep >= 5 ? 1 : 0.4 }}
          className="text-sm space-y-0.5 mb-3 py-2 border-t border-gray-100"
        >
          <p className={cn(
            conditionStatus === "충족" ? "text-green-600 font-medium" : "text-gray-400"
          )}>
            어느 하나라도 해당 시 조건 <span className="text-green-600">충족</span> → 수용
          </p>
          <p className={cn(
            conditionStatus === "미충족" ? "text-red-600 font-medium" : "text-gray-400"
          )}>
            전체 미해당 시 조건 <span className="text-red-600">미충족</span> → 수용
          </p>
          <p className={cn(
            conditionStatus === "검토필요" ? "text-amber-600 font-medium" : "text-gray-400"
          )}>
            실측 및 추가 검토 필요시 → <span className="text-amber-600">검토필요</span>
          </p>
        </motion.div>
      )}

      {/* 결과 배지 - 선택된 경로에만 표시 */}
      {isActive && conditionStatus && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: animationStep >= 5 ? 1 : 0.3, scale: animationStep >= 5 ? 1 : 0.9 }}
          className="flex justify-center"
        >
          <span className={cn(
            "px-4 py-1.5 rounded-full text-sm font-bold",
            conditionStatus === "충족" ? "bg-green-500 text-white" :
            conditionStatus === "미충족" ? "bg-red-500 text-white" :
            "bg-amber-500 text-white"
          )}>
            {conditionStatus}
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
