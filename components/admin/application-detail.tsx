"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { LandMap } from "@/components/land-map";
import { AIAnalysisFlowDialog } from "@/components/admin/ai-analysis-flow-dialog";
import { landShapes, landCategories } from "@/lib/dummy-data";
import type { Application, JudgmentResult, LandShape, LandCategory, AdminStatus } from "@/lib/types";
import {
  ArrowLeft,
  Bot,
  User,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Save,
  Clock,
  PlayCircle,
  Layers,
  Info,
  ChevronDown,
  Map as MapIcon,
  Loader2,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";

interface ApplicationDetailProps {
  application: Application;
  onBack: () => void;
  onSave: (application: Application) => void;
}

const judgmentConfig = {
  매수: { label: "매수", icon: CheckCircle2, borderColor: "border-emerald-600", textColor: "text-emerald-700", color: "text-emerald-700" },
  매수불가: { label: "매수불가", icon: XCircle, borderColor: "border-red-600", textColor: "text-red-700", color: "text-red-700" },
  기각: { label: "기각", icon: XCircle, borderColor: "border-red-600", textColor: "text-red-700", color: "text-red-700" },
  심의위원회이관: { label: "심의위원회 이관", icon: AlertTriangle, borderColor: "border-amber-600", textColor: "text-amber-700", color: "text-amber-700" },
};

const adminStatusConfig: Record<AdminStatus, { 
  label: string; 
  icon: typeof Clock; 
  variant: "warning-subtle" | "info-subtle" | "success-subtle";
}> = {
  접수완료: { label: "접수완료", icon: Clock, variant: "warning-subtle" },
  진행중: { label: "진행중", icon: PlayCircle, variant: "info-subtle" },
  심사완료: { label: "심사완료", icon: CheckCircle2, variant: "success-subtle" },
};

// 담당자 목록 (실제로는 API에서 가져옴)
const assigneeList = [
  { id: "admin-001", name: "홍길동", department: "토지보상과" },
  { id: "admin-002", name: "김철수", department: "토지보상과" },
  { id: "admin-003", name: "이영희", department: "토지보상과" },
  { id: "admin-004", name: "박민수", department: "보상심의팀" },
  { id: "admin-005", name: "정수연", department: "보상심의팀" },
];

// 필지별 검토 데이터 타입
interface LandReviewData {
  actualUsage: LandCategory;
  landShape: LandShape;
  farmMachineDifficulty: "미입력" | "해당" | "해당없음";
  accessRoadLost: boolean;
  waterChannelLost: boolean;
  landJudgment: JudgmentResult | null;
}

export function ApplicationDetail({ application, onBack, onSave }: ApplicationDetailProps) {
// 복수 필지 여부 확인
  const isMultipleLands = application.additionalLands && application.additionalLands.length > 0;
  const allLands = isMultipleLands
    ? [application.landInfo, ...application.additionalLands]
    : [application.landInfo];
  
  // 신청 유형 결정 (하위 호환: applicationType이 없으면 필지 수로 추론)
  const applicationType = application.applicationType || (
    isMultipleLands 
      ? (application.unifiedParcelCondition?.isUnifiedParcel ? "unified" : "multiple")
      : "single"
  );

  // 필지별 검토 데이터 초기화
  const initializeLandReviewData = (): LandReviewData[] => {
    return allLands.map((land, index) => {
      const landData = application.landDataList?.[index];
      return {
        actualUsage: (landData?.actualUsage || land.landCategory) as LandCategory,
        landShape: (landData?.reportedShape || land.remainingShape) as LandShape,
        farmMachineDifficulty: landData?.farmMachineDifficulty ? "해당" : "미입력",
        accessRoadLost: landData?.accessRoadLost || false,
        waterChannelLost: landData?.waterChannelLost || false,
        landJudgment: null,
      };
    });
  };

  const [landReviewDataList, setLandReviewDataList] = useState<LandReviewData[]>(initializeLandReviewData);
  
  // 선택된 필지 인덱스 (복수 필지용)
  const [selectedLandIndex, setSelectedLandIndex] = useState(0);
  
  // 필지별 검토 데이터 업데이트 함수
  const updateLandReviewData = (index: number, field: keyof LandReviewData, value: LandReviewData[keyof LandReviewData]) => {
    setLandReviewDataList(prev => {
      const newList = [...prev];
      newList[index] = { ...newList[index], [field]: value };
      return newList;
    });
  };

  const [reviewData, setReviewData] = useState({
    actualUsage: application.actualUsage as LandCategory,
    landShape: application.reportedShape as LandShape,
    farmMachineDifficulty: application.farmMachineDifficulty ? "해당" : "미입력" as "미입력" | "해당" | "해당없음",
    accessRoadLost: application.aiResult?.accessRoadLost || false,
    waterChannelLost: application.aiResult?.waterChannelLost || false,
    reviewerComment: application.reviewerComment || "",
    finalReviewOpinion: application.finalReviewOpinion || "", // 최종 검토 의견 (복수 필지용)
    finalJudgment: application.finalJudgment || (null as unknown as JudgmentResult),
    adminStatus: application.adminStatus || ("접수완료" as AdminStatus),
    assigneeId: application.adminName ? assigneeList.find(a => a.name === application.adminName)?.id || "" : "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showAnalysisFlow, setShowAnalysisFlow] = useState(false);
  const [isAIAnalyzing, setIsAIAnalyzing] = useState(false);
  
  // 관리자용 AI 판독 추가 옵션 (현장 상황)
  const [adminAIOptions, setAdminAIOptions] = useState({
    accessRoadLost: false,      // 접면도로 상실
    waterChannelLost: false,    // 관개수로 상실
    farmMachineDifficulty: false, // 농기계 진입 곤란
  });
  
  // AI 결과 뷰 모드: "citizen" (민원인 신청 결과) | "admin" (관리자 재판독 결과)
  const [aiResultViewMode, setAiResultViewMode] = useState<"citizen" | "admin">("citizen");
  
  // 관리자 재판독 결과 (별도 저장)
  const [adminLandAIResults, setAdminLandAIResults] = useState<Record<string, {
    provisionalJudgment: string;
    landTypePath: string;
    accessRoadLost: boolean;
    waterChannelLost: boolean;
    farmMachineDifficulty: boolean;
    confidence: number;
    analysisDate: string;
    unifiedGroupId?: string;
    reason?: string;
    adminOptions: typeof adminAIOptions; // 관리자가 선택한 옵션 기록
  }>>({});
  
  // 관리자 재판독 일단지 그룹
  const [adminUnifiedGroups, setAdminUnifiedGroups] = useState<Record<string, {
    groupName: string;
    landIds: string[];
    combinedArea: number;
    judgment: string;
  }>>({});
  
  // 체크박스로 선택된 필지 ID 목록 (초기값: 미체크)
  const [checkedLandIds, setCheckedLandIds] = useState<string[]>([]);
  
  // 체크박스 선택 변경 핸들러
  const handleCheckLand = (landId: string, checked: boolean) => {
    if (checked) {
      setCheckedLandIds(prev => [...prev, landId]);
    } else {
      setCheckedLandIds(prev => prev.filter(id => id !== landId));
    }
  };
  
  // 전체 선택 핸들러
  const handleCheckAll = (checked: boolean) => {
    if (checked) {
      setCheckedLandIds(allLands.map(l => l.id));
    } else {
      setCheckedLandIds([]);
    }
  };
  
  // 필지별 AI 판독 결과 상태 (landId -> AIResult)
  const [landAIResults, setLandAIResults] = useState<Record<string, {
    provisionalJudgment: string;
    landTypePath: string;
    accessRoadLost: boolean;
    waterChannelLost: boolean;
    confidence: number;
    analysisDate: string;
    unifiedGroupId?: string; // 일단지 그룹 ID (있으면 일단지로 묶임)
    reason?: string; // 판정 사유
  }>>(() => {
    // 기존 application.aiResult가 있으면 초기값으로 설정
    if (application.aiResult) {
      const initial: Record<string, {
        provisionalJudgment: string;
        landTypePath: string;
        accessRoadLost: boolean;
        waterChannelLost: boolean;
        confidence: number;
        analysisDate: string;
        unifiedGroupId?: string;
        reason?: string;
      }> = {};
      
      // landJudgments가 있으면 필지별 판정 정보 사용 (혼합 케이스)
      if (application.aiResult.landJudgments && application.aiResult.landJudgments.length > 0) {
        application.aiResult.landJudgments.forEach(lj => {
          const land = allLands.find(l => l.id === lj.landId);
          if (land) {
            initial[lj.landId] = {
              provisionalJudgment: lj.judgment,
              landTypePath: land.landType,
              accessRoadLost: application.aiResult!.accessRoadLost,
              waterChannelLost: application.aiResult!.waterChannelLost,
              confidence: 0.9,
              analysisDate: new Date().toISOString().split("T")[0],
              unifiedGroupId: lj.unifiedGroupId || undefined,
              reason: lj.reason,
            };
          }
        });
      } else {
        // 기존 로직: 전체 일단지 또는 개별
        const hasUnifiedAnalysis = application.aiResult.unifiedParcelAnalysis?.isUnifiedParcel;
        allLands.forEach(land => {
          initial[land.id] = {
            provisionalJudgment: application.aiResult!.provisionalJudgment,
            landTypePath: land.landType,
            accessRoadLost: application.aiResult!.accessRoadLost,
            waterChannelLost: application.aiResult!.waterChannelLost,
            confidence: 0.9,
            analysisDate: new Date().toISOString().split("T")[0],
            unifiedGroupId: hasUnifiedAnalysis ? "group-initial" : undefined,
          };
        });
      }
      return initial;
    }
    return {};
  });
  
  // 일단지 그룹 정보 (groupId -> 그룹 정보)
  const [unifiedGroups, setUnifiedGroups] = useState<Record<string, {
    landIds: string[];
    groupName: string;
    combinedArea: number;
    judgment: string;
  }>>(() => {
    // landJudgments가 있으면 그룹 정보 추출
    if (application.aiResult?.landJudgments && application.aiResult.landJudgments.length > 0) {
      const groups: Record<string, { landIds: string[]; groupName: string; combinedArea: number; judgment: string }> = {};
      const groupIdSet = new Set<string>();
      
      application.aiResult.landJudgments.forEach(lj => {
        if (lj.unifiedGroupId) {
          groupIdSet.add(lj.unifiedGroupId);
        }
      });
      
      let groupIndex = 0;
      groupIdSet.forEach(groupId => {
        const landsInGroup = application.aiResult!.landJudgments!.filter(lj => lj.unifiedGroupId === groupId);
        const landIdsInGroup = landsInGroup.map(lj => lj.landId);
        const landsData = allLands.filter(l => landIdsInGroup.includes(l.id));
        
        groups[groupId] = {
          landIds: landIdsInGroup,
          groupName: `일단지 ${String.fromCharCode(65 + groupIndex)}`,
          combinedArea: landsData.reduce((sum, l) => sum + l.remainingArea, 0),
          judgment: landsInGroup[0]?.judgment || "매수",
        };
        groupIndex++;
      });
      
      return groups;
    }
    
    // 기존 로직: 전체 일단지
    if (application.aiResult?.unifiedParcelAnalysis?.isUnifiedParcel) {
      return {
        "group-initial": {
          landIds: allLands.map(l => l.id),
          groupName: "일단지 A",
          combinedArea: allLands.reduce((sum, l) => sum + l.remainingArea, 0),
          judgment: application.aiResult.provisionalJudgment || "매수",
        }
      };
    }
    return {};
  });
  
  // 현재 선택된 필지의 AI 결과
  const currentAIResult = landAIResults[allLands[selectedLandIndex]?.id] || null;
  
  // 필지가 속한 일단지 그룹 찾기
  const getLandGroup = (landId: string) => {
    const result = landAIResults[landId];
    if (result?.unifiedGroupId) {
      return unifiedGroups[result.unifiedGroupId];
    }
    return null;
  };

// ===== [1��계] 일단지 판정 로직 =====
  // 주소에서 리/동 및 지번 정보 추출
  const parseAddress = (address: string) => {
    const parts = address.split(" ");
    const lastPart = parts[parts.length - 1];
    const district = parts[parts.length - 2];
    const [lotNumber, subNumber] = lastPart.includes("-") 
      ? lastPart.split("-") 
      : [lastPart, "0"];
    return { district, lotNumber, subNumber: subNumber || "0" };
  };
  
  // 소유자 동일 여부 확인
  const checkSameOwner = (land1: typeof allLands[0], land2: typeof allLands[0]) => {
    // 실제로는 소유자 정보 비교, 여기서는 동일 신청서 내 필지이므로 동일 소유자로 가정
    return true;
  };
  
  // 지반 연속 여부 확인 (인접 필지)
  const checkContinuousGround = (land1: typeof allLands[0], land2: typeof allLands[0]) => {
    const addr1 = parseAddress(land1.address);
    const addr2 = parseAddress(land2.address);
    
    // 1. 같은 리/동이 아니면 연속 불가
    if (addr1.district !== addr2.district) return false;
    
    // 2. 같은 본번이면 연속 (예: 200-1, 200-2)
    if (addr1.lotNumber === addr2.lotNumber) return true;
    
    // 3. 본번이 연속이면 연속 (예: 200, 201)
    const lot1 = parseInt(addr1.lotNumber);
    const lot2 = parseInt(addr2.lotNumber);
    if (Math.abs(lot1 - lot2) <= 1) return true;
    
    return false;
  };
  
  // 용도 일체성 확인 (동일 지목 또는 유사 용도)
  const checkUsageUnity = (land1: typeof allLands[0], land2: typeof allLands[0]) => {
    // 동일 지목이면 일체
    if (land1.landType === land2.landType) return true;
    
    // 유사 용도 그룹 (택지류, 농지류 등)
    const residentialTypes = ["대지", "주택용지"];
    const agriculturalTypes = ["농지", "전", "답", "과수원"];
    const forestTypes = ["산지", "임야"];
    
    const getGroup = (type: string) => {
      if (residentialTypes.includes(type)) return "택지";
      if (agriculturalTypes.includes(type)) return "농지";
      if (forestTypes.includes(type)) return "산지";
      return "기타";
    };
    
    return getGroup(land1.landType) === getGroup(land2.landType);
  };
  
  // 일단지 여부 종합 판단 (소유자 동일 + 지반 연속 + 용도 일체성)
  const isUnifiedLand = (land1: typeof allLands[0], land2: typeof allLands[0]) => {
    return checkSameOwner(land1, land2) && 
           checkContinuousGround(land1, land2) && 
           checkUsageUnity(land1, land2);
  };
  
  // 일단지 그룹 찾기 (BFS)
  const findUnifiedGroups = (lands: typeof allLands) => {
    const groups: string[][] = [];
    const visited = new Set<string>();
    
    for (let i = 0; i < lands.length; i++) {
      if (visited.has(lands[i].id)) continue;
      
      const group: string[] = [lands[i].id];
      visited.add(lands[i].id);
      
      const queue = [i];
      while (queue.length > 0) {
        const current = queue.shift()!;
        for (let j = 0; j < lands.length; j++) {
          if (visited.has(lands[j].id)) continue;
          if (isUnifiedLand(lands[current], lands[j])) {
            group.push(lands[j].id);
            visited.add(lands[j].id);
            queue.push(j);
          }
        }
      }
      groups.push(group);
    }
    return groups;
  };

  // ===== [2단계] 대상 토지 상세 분석 (중앙토지수용위원회 기준) =====
  
  // 편입 전 면적 기준 (㎡) - 초과 시 토지유형별 경로, 이하 시 소규모 토지 경로
  const AREA_THRESHOLD = {
    residential: { detached: 90, apartment: 330, commercial: 150, industrial: 330 },
    agricultural: 330,
    forest: 330,
    other: 330,
  };
  
  // 토지 유형별 면적 기준 (㎡)
  const getAreaCriteria = (land: typeof allLands[0], landData?: typeof application.landDataList[0]) => {
    const landType = land.landType;
    const subType = landData?.landSubType || "";
    const remainingRatio = land.remainingRatio;
    
    if (landType === "대지") {
      // 택지 경로: 세부 유형별 기준
      switch (subType) {
        case "residential-detached": // 단독·다세대주택
          return { base: 90, relaxed: remainingRatio <= 25 ? 112.5 : 90 }; // 25% 이하 시 1.25배 완화
        case "residential-apartment": // 아파트 (1,000㎡ 이하)
          return { base: 330, relaxed: remainingRatio <= 25 ? 412.5 : 330 };
        case "commercial": // 상업용
          return { base: 150, relaxed: remainingRatio <= 25 ? 187.5 : 150 };
        case "industrial": // 공업용
          return { base: 330, relaxed: remainingRatio <= 25 ? 412.5 : 330 };
        default:
          return { base: 330, relaxed: remainingRatio <= 25 ? 412.5 : 330 };
      }
    } else if (landType === "농지") {
      // 농지 경로: 기본 330㎡, 잔여비율 25% ���하 시 495㎡ (완화)
      return { base: 330, relaxed: remainingRatio <= 25 ? 495 : 330 };
    } else if (landType === "산지") {
      // 산지 경로: 기본 330㎡, 잔여비율 25% 이하 시 495㎡ (완화)
      return { base: 330, relaxed: remainingRatio <= 25 ? 495 : 330 };
    } else {
      // 그 밖의 토지: 택지/농지/산지 중 유사 용도 기준 적용, 기본 330㎡
      return { base: 330, relaxed: remainingRatio <= 25 ? 412.5 : 330 };
    }
  };
  
  // 소규모 토지 여부 판단 (편입 전 면적 330㎡ 이하 또는 잔여비율 50% 이하)
  const isSmallScaleLand = (land: typeof allLands[0]) => {
    return land.originalArea <= 330 || land.remainingRatio <= 50;
  };
  
  // 형상 기준 충족 여부 (폭 기준)
  const checkShapeCriteria = (land: typeof allLands[0]) => {
    const shape = land.remainingShape;
    // 사각형 폭: 5m 이하, 삼각형 한 변: 11m 이하
    // 형상지수 변화로 간접 판단 (실제 폭 데이터 없음)
    const shapeIndexChange = land.remainingShapeIndex - land.originalShapeIndex;
    
    if (shape === "삼각형" || shape === "역삼각형") {
      return { met: shapeIndexChange >= 0.5, description: "삼각형 형상 (한 변 11m 이하 기준)" };
    } else if (shape === "부정형" || shape === "자루형") {
      return { met: shapeIndexChange >= 0.3, description: "부정형 형상 (폭 5m 이하 기준)" };
    } else {
      return { met: shapeIndexChange >= 0.8, description: "형상 변경 (사각형 폭 5m 이하 기준)" };
    }
  };
  
  // 개별 필지 AI 분석 (관리자 옵션 반영)
  const analyzeSingleLand = (land: typeof allLands[0], landData?: typeof application.landDataList[0], adminOptions?: typeof adminAIOptions) => {
    const criteria = getAreaCriteria(land, landData);
    const isSmall = isSmallScaleLand(land);
    const shapeCriteria = checkShapeCriteria(land);
    const addr = parseAddress(land.address);
    
    const criteriaChecks: Array<{ name: string; met: boolean; description: string }> = [];
    let judgment: "매수" | "매수불가" | "검토필요" = "매수불가";
    let reasons: string[] = [];
    
    // 1. 면적 기준 미달 여부
    const effectiveLimit = criteria.relaxed;
    const areaCheckMet = land.remainingArea <= effectiveLimit;
    criteriaChecks.push({
      name: "면적 기준",
      met: areaCheckMet,
      description: `잔여 ${land.remainingArea}㎡ ${areaCheckMet ? "≤" : ">"} ${effectiveLimit}㎡`
    });
    
    if (land.landType === "대지") {
      // 택지 경로 + 관리자 옵션 반영
      // 2. 접면도로 상태 변경
      const roadLost = adminOptions?.accessRoadLost || landData?.accessRoadLost || land.remainingRatio < 30;
      criteriaChecks.push({
        name: "접면도로 상태",
        met: roadLost,
        description: roadLost ? "접면도로 상실로 건축 불가" + (adminOptions?.accessRoadLost ? " (관리자 확인)" : "") : "접면도로 유지"
      });
      
      // 3. 형상 부정형 변경
      criteriaChecks.push({
        name: "형상 변경",
        met: shapeCriteria.met,
        description: shapeCriteria.description
      });
      
      // 하나라도 해당 시 → 충족(매수), 전체 미해당 시 → 미충족(기각)
      if (areaCheckMet || roadLost || shapeCriteria.met) {
        judgment = "매수";
        if (areaCheckMet) reasons.push("면적 기준 충족");
        if (roadLost) reasons.push("접면도로 상실" + (adminOptions?.accessRoadLost ? " (관리자 확인)" : ""));
        if (shapeCriteria.met) reasons.push("형상 부정형 변경");
      } else {
        judgment = "매수불가";
        reasons.push("모든 기준 미충족");
      }
      
    } else if (land.landType === "농지") {
      // 농지 경로 + 관리자 옵션 반영
      // 2. 접면 도로/수로 상실 여부
      const waterLost = adminOptions?.waterChannelLost || landData?.waterChannelLost || false;
      const roadLost = adminOptions?.accessRoadLost || landData?.accessRoadLost || false;
      criteriaChecks.push({
        name: "도로/수로 상실",
        met: waterLost || roadLost,
        description: waterLost 
          ? "관개수로 상실로 농지 사용 불가" + (adminOptions?.waterChannelLost ? " (관리자 확인)" : "")
          : (roadLost ? "접면도로 상실" + (adminOptions?.accessRoadLost ? " (관리자 확인)" : "") : "도로/수로 유지")
      });
      
      // 3. 농기계 회전 곤란, 형상 부정형 변경
      const farmDifficulty = adminOptions?.farmMachineDifficulty || landData?.farmMachineDifficulty || land.remainingArea < 200;
      criteriaChecks.push({
        name: "농기계 진입/회전",
        met: farmDifficulty,
        description: farmDifficulty ? "농기계 진입/회전 곤란" + (adminOptions?.farmMachineDifficulty ? " (관리자 확인)" : "") : "농기계 사용 가능"
      });
      
      criteriaChecks.push({
        name: "형상 변경",
        met: shapeCriteria.met,
        description: shapeCriteria.description
      });
      
      if (areaCheckMet || waterLost || roadLost || farmDifficulty || shapeCriteria.met) {
        judgment = "매수";
        if (areaCheckMet) reasons.push("면적 기준 충족");
        if (waterLost) reasons.push("관개수로 상실" + (adminOptions?.waterChannelLost ? " (관리자 확인)" : ""));
        if (roadLost) reasons.push("접면도로 상실" + (adminOptions?.accessRoadLost ? " (관리자 확인)" : ""));
        if (farmDifficulty) reasons.push("농기계 진입 곤란" + (adminOptions?.farmMachineDifficulty ? " (관리자 확인)" : ""));
        if (shapeCriteria.met) reasons.push("형상 부정형 변경");
      } else {
        judgment = "매수불가";
        reasons.push("모든 기준 미충족");
      }
      
    } else if (land.landType === "산지") {
      // 산지 경로 + 관리자 옵션 반영
      // 2. 접면 도로 상실 여부
      const roadLost = adminOptions?.accessRoadLost || landData?.accessRoadLost || land.remainingRatio < 25;
      criteriaChecks.push({
        name: "접면도로 상실",
        met: roadLost,
        description: roadLost ? "도로 접하지 않아 접근 불가" + (adminOptions?.accessRoadLost ? " (관리자 확인)" : "") : "접면도로 유지"
      });
      
      if (areaCheckMet || roadLost) {
        judgment = "매수";
        if (areaCheckMet) reasons.push("면적 기준 충족");
        if (roadLost) reasons.push("접면도로 상실" + (adminOptions?.accessRoadLost ? " (관리자 확인)" : ""));
      } else {
        judgment = "매수불가";
        reasons.push("모든 기준 미충족");
      }
      
    } else {
      // 그 밖의 토지 + 관리자 옵션 반영
      // 종래 목적 사용 곤란 여부 (위치, 형상, 접근 상태 고려)
      const usageDifficulty = adminOptions?.accessRoadLost || adminOptions?.farmMachineDifficulty || land.remainingRatio < 40 || shapeCriteria.met;
      criteriaChecks.push({
        name: "종래 사용 곤란",
        met: usageDifficulty,
        description: usageDifficulty ? "위치/형상/접근 상태로 종래 사용 곤란" : "종래 사용 가능"
      });
      
      if (areaCheckMet || usageDifficulty) {
        judgment = "매수";
        if (areaCheckMet) reasons.push("면적 기준 충족");
        if (usageDifficulty) reasons.push("종래 사용 곤란");
      } else {
        judgment = "매수불가";
        reasons.push("모든 기준 미충족");
      }
    }
    
    // 소규모 토지 추가 검토
    if (isSmall) {
      criteriaChecks.push({
        name: "���규모 토지",
        met: true,
        description: `편입전 ${land.originalArea}㎡ 또는 잔여비율 ${land.remainingRatio}% (소규모 해당)`
      });
      if (judgment === "매수불가") {
        judgment = "검토필요";
        reasons.push("소규모 토지로 추가 검토 필요");
      }
    }
    
    return {
      judgment,
      criteriaChecks,
      reasons,
      landTypePath: land.landType,
      accessRoadLost: landData?.accessRoadLost || land.remainingRatio < 30,
      waterChannelLost: landData?.waterChannelLost || false,
      confidence: 0.85 + Math.random() * 0.1,
    };
  };

  // AI 판독 실행 핸들러 (2단계 프로세스) - 체크박스 선택된 필지만 분석
  const handleRunAIAnalysis = () => {
    // 선택된 필지가 없으면 알림
    if (checkedLandIds.length === 0) {
      alert("AI 판독할 필지를 선택해주세요.");
      return;
    }
    
    setIsAIAnalyzing(true);
    setLandAIResults({});
    setUnifiedGroups({});
    
    setTimeout(() => {
      const newResults: typeof landAIResults = {};
      const newGroups: typeof unifiedGroups = {};
      
      // 선택된 필지들만 분석 대상으로 설정
      const selectedLands = allLands.filter(l => checkedLandIds.includes(l.id));
      
      // ===== [1단계] 일단지 판정 =====
      // ���유자 동일, 지반 연속, 용도 일체성 확인하여 일단지 그룹 형성
      const unifiedLandGroups = selectedLands.length >= 2 ? findUnifiedGroups(selectedLands) : selectedLands.length === 1 ? [[selectedLands[0].id]] : [];
      let groupIndex = 0;
      
      unifiedLandGroups.forEach((groupLandIds) => {
        const groupLands = selectedLands.filter(l => groupLandIds.includes(l.id));
        const isUnified = groupLandIds.length >= 2;
        
        if (isUnified) {
          // ===== 일단지 병�� 처리 =====
          const groupId = `group-${Date.now()}-${groupIndex}`;
          const combinedArea = groupLands.reduce((sum, l) => sum + l.remainingArea, 0);
          const combinedOriginalArea = groupLands.reduce((sum, l) => sum + l.originalArea, 0);
          const primaryLand = groupLands[0];
          
          // 일단지 판정 사유 기록
          const unificationReasons = [
            "소유자 동일",
            `지반 연속 (${parseAddress(primaryLand.address).district})`,
            `용도 일체 (${primaryLand.landType})`
          ];
          
          // ===== [2단계] 일단지 합산 기준으로 대상 토지 분석 =====
          // 편입 전 면적 기준 (합산) 확인
          const landData = application.landDataList?.[allLands.findIndex(l => l.id === primaryLand.id)];
          const criteria = getAreaCriteria(primaryLand, landData);
          const isSmallScale = combinedOriginalArea <= 330; // 합산 기준 소규모 여부
          
          let groupJudgment: "매수" | "매수불가" | "검토필요" = "매수불가";
          const analysisReasons: string[] = [];
          
          if (isSmallScale) {
            // 소규모 토지 경로 (합산 편입전 330㎡ 이하)
            const meetsAreaCriteria = combinedArea <= 330 || groupLands.some(l => l.remainingRatio <= 50);
            const hasAccessDifficulty = groupLands.some(l => l.remainingRatio < 30);
            const hasDividedLand = groupLands.some(l => l.remainingRatio < 50);
            const hasShapeChange = groupLands.some(l => {
              const check = checkShapeCriteria(l);
              return check.met;
            });
            
            if (meetsAreaCriteria) analysisReasons.push(`소규모 합산 ${combinedArea}㎡`);
            if (hasAccessDifficulty) analysisReasons.push("진입 곤란");
            if (hasDividedLand) analysisReasons.push("양분된 토지");
            if (hasShapeChange) analysisReasons.push("형상 변경");
            
            groupJudgment = analysisReasons.length > 0 ? "매수" : "검토필요";
            
          } else {
            // 토지유형별 경로 (합산 편입전 330㎡ 초과)
            const landType = primaryLand.landType;
            
            // 합산 면적 기준 충족 여부
            const effectiveLimit = criteria.relaxed * groupLandIds.length;
            const meetsAreaCriteria = combinedArea <= effectiveLimit;
            if (meetsAreaCriteria) {
              analysisReasons.push(`합산 면적 ${combinedArea}㎡ ≤ ${effectiveLimit}㎡`);
            }
            
            // 토지유형별 추가 조건 검토 + 관리자 현장 상황 옵션 반영
            if (landType === "대지") {
              // 택지 경로
              const hasRoadLoss = adminAIOptions.accessRoadLost || groupLands.some(l => l.remainingRatio < 30);
              const hasShapeChange = groupLands.some(l => checkShapeCriteria(l).met);
              if (hasRoadLoss) analysisReasons.push("접면도로 상실" + (adminAIOptions.accessRoadLost ? " (관리자 확인)" : ""));
              if (hasShapeChange) analysisReasons.push("형상 부정형 변경");
              
            } else if (landType === "농지") {
              // 농지 경로 + 관리자 옵션 우선 반영
              const hasRoadLoss = adminAIOptions.accessRoadLost || groupLands.some(l => {
                const data = application.landDataList?.[allLands.findIndex(al => al.id === l.id)];
                return data?.accessRoadLost || l.remainingRatio < 30;
              });
              const hasWaterLoss = adminAIOptions.waterChannelLost || groupLands.some(l => {
                const data = application.landDataList?.[allLands.findIndex(al => al.id === l.id)];
                return data?.waterChannelLost;
              });
              const hasFarmDifficulty = adminAIOptions.farmMachineDifficulty || groupLands.some(l => l.remainingArea < 200);
              const hasShapeChange = groupLands.some(l => checkShapeCriteria(l).met);
              
              if (hasRoadLoss) analysisReasons.push("접면도로 상실" + (adminAIOptions.accessRoadLost ? " (관리자 확인)" : ""));
              if (hasWaterLoss) analysisReasons.push("관개수로 상실" + (adminAIOptions.waterChannelLost ? " (관리자 확인)" : ""));
              if (hasFarmDifficulty) analysisReasons.push("농기계 진입/회전 곤란" + (adminAIOptions.farmMachineDifficulty ? " (관리자 확인)" : ""));
              if (hasShapeChange) analysisReasons.push("형상 부정형 변경");
              
            } else if (landType === "산지") {
              // 산지 경로
              const hasRoadLoss = adminAIOptions.accessRoadLost || groupLands.some(l => l.remainingRatio < 25);
              if (hasRoadLoss) analysisReasons.push("접면도로 상실 (접근 불가)" + (adminAIOptions.accessRoadLost ? " (관리자 확인)" : ""));
              
            } else {
              // 그 밖의 토지
              const hasUsageDifficulty = adminAIOptions.accessRoadLost || adminAIOptions.farmMachineDifficulty || 
                groupLands.some(l => l.remainingRatio < 40 || checkShapeCriteria(l).met);
              if (hasUsageDifficulty) analysisReasons.push("종래 목적 사용 곤란");
            }
            
            // 하나라도 해당 시 충족, 전체 미해당 시 미충족
            groupJudgment = analysisReasons.length > 0 ? "매수" : "매수불가";
          }
          
          // 각 필지별 결과 저장
          groupLandIds.forEach(landId => {
            const land = allLands.find(l => l.id === landId)!;
            newResults[landId] = {
              provisionalJudgment: groupJudgment === "검토필요" ? "매수불가" : groupJudgment,
              landTypePath: land.landType,
              accessRoadLost: land.remainingRatio < 30,
              waterChannelLost: false,
              confidence: 0.88 + Math.random() * 0.08,
              analysisDate: new Date().toISOString().split("T")[0],
              unifiedGroupId: groupId,
              reason: `[일단지 ${String.fromCharCode(65 + groupIndex)}] ${analysisReasons.join(", ")}`,
            };
          });
          
          // 일단지 그룹 정보 저장
          newGroups[groupId] = {
            landIds: groupLandIds,
            groupName: `일단지 ${String.fromCharCode(65 + groupIndex)}`,
            combinedArea,
            judgment: groupJudgment,
          };
          groupIndex++;
          
        } else {
          // ===== 단독 필지 (일단지 미해당) =====
          const landId = groupLandIds[0];
          const land = allLands.find(l => l.id === landId)!;
          const landIndex = allLands.findIndex(l => l.id === landId);
          const landData = application.landDataList?.[landIndex];
          
          // [2단계] 개별 필지 상세 분석 (관리자 옵션 반영)
          const analysis = analyzeSingleLand(land, landData, adminAIOptions);
          const addr = parseAddress(land.address);
          
          newResults[landId] = {
            provisionalJudgment: analysis.judgment === "검토필요" ? "매수불가" : analysis.judgment,
            landTypePath: analysis.landTypePath,
            accessRoadLost: analysis.accessRoadLost,
            waterChannelLost: analysis.waterChannelLost,
            confidence: analysis.confidence,
            analysisDate: new Date().toISOString().split("T")[0],
            unifiedGroupId: undefined,
            reason: `[단독] ${analysis.reasons.join(", ")}`,
          };
        }
      });
      
      // 관리자 재판독 결과로 저장 (민원인 결과는 유지)
      const adminResults: typeof adminLandAIResults = {};
      Object.entries(newResults).forEach(([landId, result]) => {
        adminResults[landId] = {
          ...result,
          farmMachineDifficulty: adminAIOptions.farmMachineDifficulty,
          adminOptions: { ...adminAIOptions }
        };
      });
      
      setAdminUnifiedGroups(newGroups);
      setAdminLandAIResults(adminResults);
      setAiResultViewMode("admin"); // 관리자 결과 탭으로 자동 전환
      setIsAIAnalyzing(false);
    }, 2000);
  };
  
  
  
  // 판독 결과 초기화 (관리자 재판독 결과만)
  const handleResetAdminAIResults = () => {
    setAdminLandAIResults({});
    setAdminUnifiedGroups({});
    setAdminAIOptions({
      accessRoadLost: false,
      waterChannelLost: false,
      farmMachineDifficulty: false,
    });
    setAiResultViewMode("citizen");
  };
  
  // 필지 ������/제외 상태 (민원인 소유 확인용)
  const [excludedLands, setExcludedLands] = useState<Set<string>>(new Set());
  
  // 필지 포함/제외 토글
  const toggleLandInclusion = (landId: string) => {
    setExcludedLands(prev => {
      const newSet = new Set(prev);
      if (newSet.has(landId)) {
        newSet.delete(landId);
      } else {
        newSet.add(landId);
      }
      return newSet;
    });
  };
  
  // 포함된 필지만 필터링
  const includedLands = allLands.filter(land => !excludedLands.has(land.id));
  const includedLandsArea = includedLands.reduce((sum, l) => sum + l.remainingArea, 0);
  
  // AI 분석 결과
  const aiResult = application.aiResult;

  const handleSave = () => {
    setIsSaving(true);
    
    const selectedAssignee = assigneeList.find(a => a.id === reviewData.assigneeId);
    
    const updatedApplication: Application = {
      ...application,
      actualUsage: reviewData.actualUsage,
      reportedShape: reviewData.landShape,
      farmMachineDifficulty: reviewData.farmMachineDifficulty === "해당",
      reviewerComment: reviewData.reviewerComment,
      finalJudgment: reviewData.finalJudgment,
      adminStatus: reviewData.adminStatus,
      status: reviewData.adminStatus === "심사완료" ? "처리완료" : application.status,
      adminName: selectedAssignee?.name || application.adminName,
      statusUpdatedAt: new Date().toISOString().split("T")[0],
    };

    setTimeout(() => {
      setIsSaving(false);
      onSave(updatedApplication);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="h-auto px-0 text-muted-foreground hover:bg-transparent hover:text-foreground">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          목록으로 돌아가기
        </Button>
        <div className="flex gap-2">
          <Button variant="secondary" asChild>
            <Link href={`/admin/review/${application.id}`}>
              <FileText className="mr-2 h-4 w-4" />
              심의서 작성
            </Link>
          </Button>
        </div>
      </div>

      {/* 민원 기본 정보 */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <CardTitle>민원 정보</CardTitle>
              {(() => {
                const config = adminStatusConfig[application.adminStatus];
                const Icon = config.icon;
                return (
                  <Badge variant={config.variant}>
                    <Icon className="h-3.5 w-3.5" />
                    {config.label}
                  </Badge>
                );
              })()}
            </div>
            <CardDescription>접수번호: {application.applicationNumber}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">신청인</p>
              <p className="font-medium text-foreground">{application.applicantName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">연락처</p>
              <p className="font-medium text-foreground">{application.applicantContact}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">신청일</p>
              <p className="font-medium text-foreground">{application.appliedAt}</p>
            </div>
            <div>
              <p className="mb-1 text-sm text-muted-foreground">담당자</p>
              <Select
                value={reviewData.assigneeId}
                onValueChange={(value) =>
                  setReviewData((prev) => ({ ...prev, assigneeId: value }))
                }
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="담당자 지정" />
                </SelectTrigger>
                <SelectContent>
                  {assigneeList.map((assignee) => (
                    <SelectItem key={assignee.id} value={assignee.id}>
                      {assignee.name} ({assignee.department})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 필지 선택 영역 (상위 레벨) */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              대상 필지
              {isMultipleLands && (
                <Badge variant="secondary" className="ml-1">
                  {allLands.length}필지
                </Badge>
              )}
            </CardTitle>
            {/* 신청 유형 표시 */}
            {isMultipleLands && (
              <div className="flex items-center gap-2">
                {applicationType === "unified" ? (
                  <Badge className="bg-emerald-600 hover:bg-emerald-600">
                    <Layers className="mr-1 h-3 w-3" />
                    일단지 신청
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-blue-300 text-blue-700">
                    복수 필지 개별 신청
                  </Badge>
                )}
              </div>
            )}
          </div>
          {isMultipleLands && (
            <CardDescription>
              {applicationType === "unified" 
                ? "일단지 신청: 모든 필지가 하나의 토지로 합산되어 분석됩니다."
                : "복수 필지 개별 신청: 각 필지별로 개별 분석됩니다."}
            </CardDescription>
          )}
        </CardHeader>
        
        {/* 일단지 판정 요약 (일단지 신청인 경우에만 표시) */}
        {applicationType === "unified" && Object.keys(unifiedGroups).length > 0 && (
          <div className="mx-6 mb-4 rounded-lg border-2 border-emerald-500/50 bg-emerald-50/50 p-4 dark:bg-emerald-950/30">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">일단지 판정 결과</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                총 {allLands.length}필지 중 {Object.values(unifiedGroups).flatMap(g => g.landIds).length}필지 해당
              </Badge>
            </div>
            <div className="flex flex-wrap gap-3">
              {Object.entries(unifiedGroups).map(([groupId, group]) => (
                <div key={groupId} className="flex items-center gap-2 rounded-lg bg-white/80 px-3 py-2 shadow-sm dark:bg-emerald-900/30">
                  <Badge className="bg-emerald-600 hover:bg-emerald-700">
                    {group.groupName}
                  </Badge>
                  <span className="text-sm font-medium">인접 {group.landIds.length}필지</span>
                  <span className="text-sm text-muted-foreground">|</span>
                  <span className="text-sm text-muted-foreground">합산 {group.combinedArea.toLocaleString()}m²</span>
                  <Badge variant="default">{group.judgment}</Badge>
                </div>
              ))}
              {(() => {
                const unifiedLandIds = Object.values(unifiedGroups).flatMap(g => g.landIds);
                const nonUnifiedLands = allLands.filter(l => !unifiedLandIds.includes(l.id));
                if (nonUnifiedLands.length === 0) return null;
                return (
                  <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                    <Badge variant="outline" className="text-muted-foreground">미해당</Badge>
                    <span className="text-sm font-medium">{nonUnifiedLands.length}필지</span>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
        
        <CardContent>
          {isMultipleLands ? (
            <div className="space-y-3">
              {/* 필지가 5개 이상이면 셀렉트 박스 + 요약, 4개 이하면 카드 그리드 */}
              {allLands.length >= 5 ? (
                <div className="space-y-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                    <Select
                      value={selectedLandIndex.toString()}
                      onValueChange={(value) => setSelectedLandIndex(parseInt(value))}
                    >
                      <SelectTrigger className="w-full sm:w-[280px]">
                        <SelectValue placeholder="필지 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {allLands.map((land, index) => {
                          const landResult = landAIResults[land.id];
                          const group = getLandGroup(land.id);
                          return (
                            <SelectItem key={land.id} value={index.toString()}>
                              <span className="flex items-center gap-2">
                                필����� {index + 1} - {land.address.split(" ").slice(-2).join(" ")}
                                {group && <span className="text-emerald-600 text-xs">({group.groupName})</span>}
                                {landResult && !group && <span className="text-muted-foreground text-xs">(미해당)</span>}
                              </span>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <div className={`flex flex-1 items-center justify-between rounded-lg border p-3 ${
                      getLandGroup(allLands[selectedLandIndex].id) 
                        ? "border-emerald-500/50 bg-emerald-50/30 dark:bg-emerald-950/20" 
                        : "border-border"
                    }`}>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-medium">{allLands[selectedLandIndex].address}</p>
                          {getLandGroup(allLands[selectedLandIndex].id) && (
                            <Badge className="bg-emerald-600 hover:bg-emerald-700 text-xs shrink-0">
                              {getLandGroup(allLands[selectedLandIndex].id)?.groupName}
                            </Badge>
                          )}
                        </div>
                        <div className="mt-1 flex gap-3 text-sm">
                          <span className="font-medium text-primary">{allLands[selectedLandIndex].remainingArea.toLocaleString()}m²</span>
                          <span className="text-muted-foreground">잔여 {allLands[selectedLandIndex].remainingRatio}%</span>
                        </div>
                      </div>
                      {landAIResults[allLands[selectedLandIndex].id] && (
                        <Badge 
                          variant={landAIResults[allLands[selectedLandIndex].id].provisionalJudgment === "매수" ? "default" : landAIResults[allLands[selectedLandIndex].id].provisionalJudgment === "미해당" ? "secondary" : "destructive"} 
                          className="ml-3 shrink-0"
                        >
                          {landAIResults[allLands[selectedLandIndex].id].provisionalJudgment}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* 일단지 그룹이 있는 경우 그룹별로 표시 */}
                  {Object.keys(unifiedGroups).length > 0 ? (
                    <>
                      {/* 일단지 그룹들 */}
                      {Object.entries(unifiedGroups).map(([groupId, group]) => (
                        <div key={groupId} className="rounded-lg border-2 border-emerald-500 bg-emerald-50/50 p-4 dark:bg-emerald-950/30">
                          <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold">
                                {group.landIds.length}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                                    {group.groupName}
                                  </span>
                                  <Badge variant="default" className="text-xs">
                                    {group.judgment}
                                  </Badge>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  인접 {group.landIds.length}필지 | 합산 {group.combinedArea.toLocaleString()}m²
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="grid gap-2 sm:grid-cols-2">
                            {allLands.filter(l => group.landIds.includes(l.id)).map((land) => {
                              const index = allLands.findIndex(l => l.id === land.id);
                              const isSelected = selectedLandIndex === index;
                              const isChecked = checkedLandIds.includes(land.id);
                              const landResult = landAIResults[land.id];
                              const landLabel = String.fromCharCode(65 + index);
                              return (
                                <div
                                  key={land.id}
                                  onClick={() => setSelectedLandIndex(index)}
                                  className={`flex flex-col items-start gap-1.5 rounded-lg border-2 p-3 text-left transition-all cursor-pointer ${
                                    isChecked
                                      ? "border-primary bg-white ring-2 ring-primary dark:bg-background" 
                                      : isSelected 
                                        ? "border-emerald-400 bg-white dark:bg-emerald-900/30" 
                                        : "border-emerald-300 bg-white/90 hover:border-emerald-400 dark:border-emerald-700 dark:bg-emerald-900/20"
                                  }`}
                                >
                                  <div className="flex w-full items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={(e) => {
                                          e.stopPropagation();
                                          handleCheckLand(land.id, e.target.checked);
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        className="h-4 w-4 rounded border-gray-300"
                                      />
                                      <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${isChecked ? "bg-primary text-primary-foreground" : "bg-emerald-600 text-white"}`}>
                                        {landLabel}
                                      </span>
                                      <span className="text-sm font-medium">필�� {landLabel}</span>
                                    </div>
                                    <Badge variant="default" className="text-xs bg-emerald-600">
                                      {landResult?.provisionalJudgment || "매수"}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground line-clamp-1 pl-6">{land.address}</p>
                                  <div className="flex gap-3 text-xs pl-6">
                                    <span className="font-medium text-emerald-700 dark:text-emerald-400">{land.remainingArea.toLocaleString()}m²</span>
                                    <span className="text-muted-foreground">잔여 {land.remainingRatio}%</span>
                                  </div>
                                  {landResult?.reason && (
                                    <p className="mt-0.5 text-xs text-emerald-600 dark:text-emerald-400 line-clamp-1 pl-6">
                                      {landResult.reason}
                                    </p>
                                  )}
                                  {landResult?.analysisDate && (
                                    <p className="text-xs text-muted-foreground pl-6">
                                      판독: {landResult.analysisDate}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                      
                      {/* 미해당 필지들 */}
                      {(() => {
                        const unifiedLandIds = Object.values(unifiedGroups).flatMap(g => g.landIds);
                        const nonUnifiedLands = allLands.filter(l => !unifiedLandIds.includes(l.id));
                        if (nonUnifiedLands.length === 0) return null;
                        
                        return (
                          <div className="rounded-lg border-2 border-dashed border-amber-400/50 bg-amber-50/30 p-4 dark:bg-amber-950/20">
                            <div className="mb-3 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-white text-xs font-bold">
                                  {nonUnifiedLands.length}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-amber-700 dark:text-amber-400">
                                      일단지 미해당
                                    </span>
                                    <Badge variant="secondary" className="text-xs">
                                      개별 검토
                                    </Badge>
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    ���연접 또는 기준 미충족 {nonUnifiedLands.length}필지
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="grid gap-2 sm:grid-cols-2">
                              {nonUnifiedLands.map((land) => {
                                const index = allLands.findIndex(l => l.id === land.id);
                                const isSelected = selectedLandIndex === index;
                                const isChecked = checkedLandIds.includes(land.id);
                                const landResult = landAIResults[land.id];
                                const landLabel = String.fromCharCode(65 + index);
                                return (
                                  <div
                                    key={land.id}
                                    onClick={() => setSelectedLandIndex(index)}
                                    className={`flex flex-col items-start gap-1.5 rounded-lg border-2 p-3 text-left transition-all cursor-pointer ${
                                      isChecked
                                        ? "border-primary bg-white ring-2 ring-primary dark:bg-background" 
                                        : isSelected 
                                          ? "border-amber-400 bg-white dark:bg-amber-900/30" 
                                          : "border-amber-300 bg-white/90 hover:border-amber-400 dark:border-amber-700 dark:bg-amber-900/20"
                                    }`}
                                  >
                                    <div className="flex w-full items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="checkbox"
                                          checked={isChecked}
                                          onChange={(e) => {
                                            e.stopPropagation();
                                            handleCheckLand(land.id, e.target.checked);
                                          }}
                                          onClick={(e) => e.stopPropagation()}
                                          className="h-4 w-4 rounded border-gray-300"
                                        />
                                        <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${isChecked ? "bg-primary text-primary-foreground" : "bg-amber-500 text-white"}`}>
                                          {landLabel}
                                        </span>
                                        <span className="text-sm font-medium">필지 {landLabel}</span>
                                      </div>
                                      <Badge variant="secondary" className="text-xs">
                                        {landResult?.provisionalJudgment || "미해당"}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-1 pl-6">{land.address}</p>
                                    <div className="flex gap-3 text-xs pl-6">
                                      <span className="font-medium text-amber-700 dark:text-amber-400">{land.remainingArea.toLocaleString()}m²</span>
                                      <span className="text-muted-foreground">잔여 {land.remainingRatio}%</span>
                                    </div>
                                    {landResult?.reason && (
                                      <p className="mt-0.5 text-xs text-amber-600 dark:text-amber-400 line-clamp-1 pl-6">
                                        {landResult.reason}
                                      </p>
                                    )}
                                    {landResult?.analysisDate && (
                                      <p className="text-xs text-muted-foreground pl-6">
                                        판���: {landResult.analysisDate}
                                      </p>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}
                    </>
                  ) : (
                    /* 일단지 그룹 없음 - 기본 그리드 표시 (AI 판독 전) */
                    <>
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={checkedLandIds.length === allLands.length}
                            onChange={(e) => handleCheckAll(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <span className="text-sm text-muted-foreground">
                            전체 선택 ({checkedLandIds.length}/{allLands.length})
                          </span>
                        </div>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {allLands.map((land, index) => {
                          const isSelected = selectedLandIndex === index;
                          const isChecked = checkedLandIds.includes(land.id);
                          const landResult = landAIResults[land.id];
                          const landLabel = String.fromCharCode(65 + index);
                          return (
                            <div
                              key={land.id}
                              className={`relative flex flex-col items-start gap-1.5 rounded-lg border-2 p-3 text-left transition-all cursor-pointer ${
                                isChecked
                                  ? "border-primary bg-primary/5 ring-2 ring-primary"
                                  : isSelected 
                                    ? "border-primary/50 bg-primary/5" 
                                    : "border-border hover:border-primary/50 hover:bg-muted/30"
                              }`}
                              onClick={() => setSelectedLandIndex(index)}
                            >
                              <div className="flex w-full items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      handleCheckLand(land.id, e.target.checked);
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="h-4 w-4 rounded border-gray-300"
                                  />
                                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${isChecked ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                                    {landLabel}
                                  </span>
                                  <span className="text-sm font-medium">필지 {landLabel}</span>
                                </div>
                                {landResult ? (
                                  <Badge 
                                    variant={landResult.provisionalJudgment === "매수" ? "default" : landResult.provisionalJudgment === "미해당" ? "secondary" : "destructive"} 
                                    className="text-xs"
                                  >
                                    {landResult.provisionalJudgment}
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs text-muted-foreground">
                                    미판독
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-1 pl-6">{land.address}</p>
                              <div className="flex gap-3 text-xs pl-6">
                                <span className="font-medium text-primary">{land.remainingArea.toLocaleString()}m²</span>
                                <span className="text-muted-foreground">잔여 {land.remainingRatio}%</span>
                              </div>
                              {landResult?.analysisDate && (
                                <p className="mt-1 text-xs text-muted-foreground pl-6">
                                  판독: {landResult.analysisDate}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}
              <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-2">
                <span className="text-sm font-medium">
                  {checkedLandIds.length > 0 ? `선택 필지 합산 (${checkedLandIds.length}필지)` : "합산 잔여 면적"}
                </span>
                <span className="text-base font-bold text-primary">
                  {checkedLandIds.length > 0 
                    ? allLands.filter(l => checkedLandIds.includes(l.id)).reduce((sum, l) => sum + l.remainingArea, 0).toLocaleString()
                    : (application.landInfo.remainingArea + (application.additionalLands?.reduce((sum, l) => sum + l.remainingArea, 0) || 0)).toLocaleString()
                  }m²
                </span>
              </div>
              
              {/* 선택된 필지 기준 표시 안내 */}
              <div className="flex items-center justify-center gap-2 pt-2 text-sm text-muted-foreground">
                <div className="h-px flex-1 bg-border" />
                <span className="flex items-center gap-1.5 px-2">
                  <ChevronDown className="h-4 w-4" />
                  {checkedLandIds.length > 0 ? (
                    <>
                      아래 정보는 <Badge variant="default" className="mx-1">{checkedLandIds.length}필지 선택됨</Badge> 기준입니다
                    </>
                  ) : (
                    <>
                      아래 정보는 <Badge variant="outline" className="mx-1">필지 {String.fromCharCode(65 + selectedLandIndex)}</Badge> 기준입니다
                    </>
                  )}
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{application.landInfo.address}</p>
                  <div className="mt-1 flex gap-4 text-sm">
                    <span className="font-medium text-primary">{application.landInfo.remainingArea.toLocaleString()}m² 잔여</span>
                    <span className="text-muted-foreground">잔여 비율 {application.landInfo.remainingRatio}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 지도 및 토지 정보 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <MapIcon className="h-5 w-5" />
              지적도
              {checkedLandIds.length > 0 && (
                <Badge variant="outline" className="ml-auto font-normal">
                  {checkedLandIds.length}필지 선택
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              필지를 선택하여 AI 재판독을 실행할 수 있습니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* 필지 선택 목록 (민원인 화면과 동일한 형태) */}
            {isMultipleLands && (
              <div className="mb-4 rounded-lg border overflow-hidden">
                {/* 헤더 */}
                <div className="flex items-center justify-between border-b bg-muted/50 px-3 py-2">
                  <span className="text-sm font-medium">판독 대상 필지</span>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">
                      선택: {checkedLandIds.length}필지
                    </span>
                    <span className="text-primary font-medium">
                      총 {allLands.length}필지
                    </span>
                  </div>
                </div>
                
                {/* 필지 목록 */}
                <ul className="max-h-[280px] overflow-y-auto divide-y">
                  {allLands.map((land, idx) => {
                    const isChecked = checkedLandIds.includes(land.id);
                    const landResult = landAIResults[land.id];
                    const adminResult = adminLandAIResults[land.id];
                    const hasResult = landResult || adminResult;
                    const judgment = adminResult?.provisionalJudgment || landResult?.provisionalJudgment;
                    
                    return (
                      <li key={land.id}>
                        <div 
                          className={`flex w-full items-center gap-3 px-3 py-3 transition-all duration-150 cursor-pointer ${
                            isChecked 
                              ? "border-l-4 border-l-primary bg-primary/5" 
                              : "hover:bg-muted/50"
                          }`}
                          onClick={() => {
                            if (isChecked) {
                              setCheckedLandIds(prev => prev.filter(id => id !== land.id));
                            } else {
                              setCheckedLandIds(prev => [...prev, land.id]);
                            }
                            setSelectedLandIndex(idx);
                          }}
                        >
                          {/* 체크박스 */}
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setCheckedLandIds(prev => [...prev, land.id]);
                              } else {
                                setCheckedLandIds(prev => prev.filter(id => id !== land.id));
                              }
                            }}
                            className="h-5 w-5 shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          />
                          
                          {/* 필지 라벨 */}
                          <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold shrink-0 ${
                            isChecked ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                          }`}>
                            {String.fromCharCode(65 + idx)}
                          </span>
                          
                          {/* 필지 정보 */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm truncate ${!isChecked ? "text-muted-foreground" : ""}`}>
                                {land.address}
                              </span>
                              {/* AI 판독 결과 뱃지 */}
                              {hasResult && (
                                <Badge 
                                  variant={judgment === "매수" ? "default" : "secondary"}
                                  className={`text-[10px] px-1.5 py-0 shrink-0 ${
                                    judgment === "매수" 
                                      ? "bg-green-100 text-green-700 border-green-200" 
                                      : judgment === "매수불가"
                                        ? "bg-red-100 text-red-700 border-red-200"
                                        : "bg-amber-100 text-amber-700 border-amber-200"
                                  }`}
                                >
                                  {adminResult ? "(재)" : ""}
                                  {judgment === "매수" ? "판독완료" : judgment === "매수불가" ? "미충족" : "심의이관"}
                                </Badge>
                              )}
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                              <span>잔여 {land.remainingArea.toLocaleString()}m²</span>
                              <span>|</span>
                              <span>{land.landType}</span>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                
                {/* 하단 전체 선택/해제 */}
                <div className="flex items-center justify-between border-t bg-muted/30 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCheckedLandIds(allLands.map(l => l.id))}
                      className="h-7 text-xs"
                    >
                      전체 선택
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCheckedLandIds([])}
                      className="h-7 text-xs"
                    >
                      전체 해제
                    </Button>
                  </div>
                  {Object.keys(adminLandAIResults).length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleResetAdminAIResults}
                      className="h-7 text-xs text-muted-foreground"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      재판독 초기화
                    </Button>
                  )}
                </div>
              </div>
            )}
            
            <Tabs defaultValue="cadastral">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="cadastral">지적도</TabsTrigger>
                <TabsTrigger value="aerial">항공사진</TabsTrigger>
              </TabsList>
              <TabsContent value="cadastral" className="mt-4">
                {checkedLandIds.length > 0 ? (
                  <LandMap landInfo={allLands.find(l => l.id === checkedLandIds[0])!} showOverlay />
                ) : (
                  <LandMap landInfo={allLands[selectedLandIndex]} showOverlay />
                )}
              </TabsContent>
              <TabsContent value="aerial" className="mt-4">
                <div className="flex h-[300px] items-center justify-center rounded-lg bg-muted sm:h-[400px]">
                  <p className="text-muted-foreground">
                    항공/드론 사진 (연동 예정)
                  </p>
                </div>
              </TabsContent>
            </Tabs>
            
            {/* 관리자용 AI 판독 옵션 + 실행 버튼 */}
            <div className="mt-4 pt-4 border-t border-border">
              {/* 현장 상황 체크 옵션 */}
              {checkedLandIds.length > 0 && (
                <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50/50 p-4">
                  <h4 className="mb-3 text-sm font-medium text-blue-800 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    현장 상황 확인 (선택 시 AI 판독에 반영)
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="admin-accessRoadLost"
                        checked={adminAIOptions.accessRoadLost}
                        onCheckedChange={(checked) => 
                          setAdminAIOptions(prev => ({ ...prev, accessRoadLost: !!checked }))
                        }
                      />
                      <Label 
                        htmlFor="admin-accessRoadLost" 
                        className="text-sm font-normal cursor-pointer"
                      >
                        접면도로 상실
                        <span className="ml-2 text-xs text-muted-foreground">(사업으로 인해 도로 접근이 불가능해진 경우)</span>
                      </Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="admin-waterChannelLost"
                        checked={adminAIOptions.waterChannelLost}
                        onCheckedChange={(checked) => 
                          setAdminAIOptions(prev => ({ ...prev, waterChannelLost: !!checked }))
                        }
                      />
                      <Label 
                        htmlFor="admin-waterChannelLost" 
                        className="text-sm font-normal cursor-pointer"
                      >
                        관개수로 상실
                        <span className="ml-2 text-xs text-muted-foreground">(사업으로 인해 농업용수 공급이 불가능해진 경우)</span>
                      </Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="admin-farmMachineDifficulty"
                        checked={adminAIOptions.farmMachineDifficulty}
                        onCheckedChange={(checked) => 
                          setAdminAIOptions(prev => ({ ...prev, farmMachineDifficulty: !!checked }))
                        }
                      />
                      <Label 
                        htmlFor="admin-farmMachineDifficulty" 
                        className="text-sm font-normal cursor-pointer"
                      >
                        농기계 진입 곤란
                        <span className="ml-2 text-xs text-muted-foreground">(형상 변경으로 농기계 진입이 어려워진 경우)</span>
                      </Label>
                    </div>
                  </div>
                  {(adminAIOptions.accessRoadLost || adminAIOptions.waterChannelLost || adminAIOptions.farmMachineDifficulty) && (
                    <p className="mt-3 text-xs text-blue-700 bg-blue-100 rounded px-2 py-1">
                      선택된 현장 상황이 AI 판독 시 가중치로 반영됩니다.
                    </p>
                  )}
                </div>
              )}
              
              <Button
                onClick={handleRunAIAnalysis}
                disabled={isAIAnalyzing || checkedLandIds.length === 0}
                className="w-full gap-2 bg-primary hover:bg-primary/90"
                size="lg"
              >
                {isAIAnalyzing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    AI 판독 중... ({checkedLandIds.length}필지)
                  </>
                ) : Object.keys(landAIResults).length > 0 ? (
                  <>
                    <RotateCcw className="h-5 w-5" />
                    선택 필지 AI 재판독 ({checkedLandIds.length}필지)
                  </>
                ) : (
                  <>
                    <Bot className="h-5 w-5" />
                    선택 필지 AI 판독 ({checkedLandIds.length}필지)
                  </>
                )}
              </Button>
              {/* AI 판독 결과 - 신청 유형에 따라 다르게 표시 */}
              {Object.keys(landAIResults).length > 0 && (
                <div className="mt-4 space-y-3">
                  {/* 일단지 신청인 경우 */}
                  {applicationType === "unified" && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4">
                      <h4 className="mb-3 font-medium text-emerald-800 flex items-center gap-2">
                        <Layers className="h-4 w-4" />
                        일단지 분석 결과
                        <Badge className="ml-auto bg-emerald-600 hover:bg-emerald-600">
                          {checkedLandIds.length}필지 합산
                        </Badge>
                      </h4>
                      <div className="space-y-2">
                        <div className="rounded-md bg-white/80 p-3 border border-emerald-100">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-emerald-700">일단지 판정</span>
                            {Object.keys(unifiedGroups).length > 0 ? (
                              <Badge className="bg-emerald-600 hover:bg-emerald-600">
                                {Object.values(unifiedGroups)[0]?.judgment || "매수"}
                              </Badge>
                            ) : (
                              <Badge variant="destructive">일단지 조건 미충족</Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>포함 필지: {checkedLandIds.map((id) => String.fromCharCode(65 + allLands.findIndex(al => al.id === id))).join(", ")}</p>
                            <p>합산 면적: {allLands.filter(l => checkedLandIds.includes(l.id)).reduce((sum, l) => sum + l.remainingArea, 0).toLocaleString()}m²</p>
                            {Object.keys(unifiedGroups).length > 0 && (
                              <p className="text-xs text-emerald-600">
                                소유자 동일 + 지반 연속 + 용도 일체성 충족
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* 복수 필지 개별 신청인 경우 */}
                  {applicationType === "multiple" && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4">
                      <h4 className="mb-3 font-medium text-blue-800 flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        필지별 개별 분석 결과
                        <Badge variant="outline" className="ml-auto border-blue-300 text-blue-700">
                          {checkedLandIds.length}필지
                        </Badge>
                      </h4>
                      <div className="space-y-2">
                        {checkedLandIds.map((landId) => {
                          const land = allLands.find(l => l.id === landId);
                          const landResult = landAIResults[landId];
                          const landIdx = allLands.findIndex(l => l.id === landId);
                          if (!land) return null;
                          return (
                            <div key={landId} className="rounded-md bg-white/80 p-3 border border-blue-100">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-blue-700">
                                  필지 {String.fromCharCode(65 + landIdx)}
                                </span>
                                {landResult && (
                                  <Badge 
                                    variant={landResult.provisionalJudgment === "매수" ? "default" : "destructive"}
                                    className={landResult.provisionalJudgment === "매수" ? "bg-emerald-600 hover:bg-emerald-600" : ""}
                                  >
                                    {landResult.provisionalJudgment}
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                <p className="truncate">{land.address}</p>
                                <p>잔여 면적: {land.remainingArea.toLocaleString()}m²</p>
                              </div>
                              {landResult?.reason && (
                                <p className="mt-1 text-xs text-blue-600">
                                  {landResult.reason}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-blue-700 font-medium">분석 요약</span>
                          <span className="text-muted-foreground">
                            매수 가능: {checkedLandIds.filter(id => landAIResults[id]?.provisionalJudgment === "매수").length}필지 / 
                            기각: {checkedLandIds.filter(id => landAIResults[id]?.provisionalJudgment !== "매수").length}필지
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* 단일 필지인 경우 */}
                  {applicationType === "single" && checkedLandIds.length > 0 && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
                      <h4 className="mb-3 font-medium text-gray-800 flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        단일 필지 분석 결과
                      </h4>
                      {(() => {
                        const landId = checkedLandIds[0];
                        const landResult = landAIResults[landId];
                        return (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">AI 판정 결과</span>
                            {landResult && (
                              <Badge 
                                variant={landResult.provisionalJudgment === "매수" ? "default" : "destructive"}
                                className={landResult.provisionalJudgment === "매수" ? "bg-emerald-600 hover:bg-emerald-600" : ""}
                              >
                                {landResult.provisionalJudgment}
                              </Badge>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}
              
              {/* 일단지 미판정 상태 안내 (AI 판독 전) */}
              {checkedLandIds.length >= 2 && Object.keys(landAIResults).length === 0 && (
                <div className="mt-4 rounded-lg border border-muted bg-muted/30 p-4">
                  <p className="text-sm text-muted-foreground text-center">
                    AI 판독 실행 시 일단지 여부를 자동으로 판정합니다
                  </p>
                  <p className="text-xs text-muted-foreground text-center mt-1">
                    (소유자 동일, 지반 연속, 용도 일체성 기준)
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI 분석 결과 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              AI 분석 결과
            </CardTitle>
            <CardDescription>
              민원인 신청 시 결과와 관리자 재판독 결과를 비교할 수 있습니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 결과 탭 전환 */}
            <div className="flex gap-2 rounded-lg bg-muted p-1">
              <button
                onClick={() => setAiResultViewMode("citizen")}
                className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  aiResultViewMode === "citizen"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>민원인 신청 결과</span>
                  {aiResult && (
                    <Badge 
                      variant="outline"
                      className={
                        aiResult.provisionalJudgment === "매수" 
                          ? "border-green-500 text-green-600" 
                          : aiResult.provisionalJudgment === "매수불가" || aiResult.provisionalJudgment === "기각"
                            ? "border-red-500 text-red-600"
                            : "border-amber-500 text-amber-600"
                      }
                    >
                      {aiResult.provisionalJudgment}
                    </Badge>
                  )}
                </div>
              </button>
              <button
                onClick={() => setAiResultViewMode("admin")}
                className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  aiResultViewMode === "admin"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>관리자 재판독 결과</span>
                  {Object.keys(adminLandAIResults).length > 0 && (
                    <Badge 
                      variant="outline"
                      className={(() => {
                        const results = Object.values(adminLandAIResults);
                        const hasPurchase = results.some(r => r.provisionalJudgment === "매수");
                        const allRejected = results.every(r => r.provisionalJudgment === "매수불가");
                        if (allRejected) return "border-red-500 text-red-600";
                        if (hasPurchase) return "border-green-500 text-green-600";
                        return "border-amber-500 text-amber-600";
                      })()}
                    >
                      {(() => {
                        const results = Object.values(adminLandAIResults);
                        const purchaseCount = results.filter(r => r.provisionalJudgment === "매수").length;
                        return `${purchaseCount}/${results.length} 매수`;
                      })()}
                    </Badge>
                  )}
                  {Object.keys(adminLandAIResults).length === 0 && (
                    <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground">
                      미실행
                    </Badge>
                  )}
                </div>
              </button>
            </div>
            
            {/* 민원인 신청 결과 뷰 */}
            {aiResultViewMode === "citizen" && (
              <div className="space-y-4">
                {/* 결과 요약 헤더 */}
                <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">토지 유형:</span>
                    <span className="font-medium">{aiResult?.landTypePath || allLands[selectedLandIndex].landType}</span>
                  </div>
                  {isMultipleLands && (
                    <Badge variant="outline" className="font-normal">
                      필지 {selectedLandIndex + 1}
                    </Badge>
                  )}
                </div>
            {/* 분석 상세 보기 버튼 */}
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => setShowAnalysisFlow(true)}
            >
              <PlayCircle className="h-4 w-4" />
              분석 프로세스 상세 보기
            </Button>

            {/* 기준 충족 여부 */}
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">기준 충족 여부</h4>
              {aiResult?.criteriaChecks.map((check, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 rounded-lg border p-3 ${
                    check.isMet 
                      ? "border-green-200 bg-green-50/50" 
                      : "border-red-200 bg-red-50/50"
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {check.isMet ? (
                        <Badge variant="default" className="bg-green-600 hover:bg-green-600">
                          충족
                        </Badge>
                      ) : (
                        <Badge variant="destructive-subtle">
                          미충족
                        </Badge>
                      )}
                      <p className="font-medium text-foreground">{check.criteriaName}</p>
                      {!check.autoDetected && (
                        <Badge variant="outline">
                          직접 확인 필요
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-base text-muted-foreground">
                      {check.criteriaDescription}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* 형상지수 */}
            {aiResult && (
              <div className="rounded-lg border border-border p-4">
                <h4 className="mb-3 font-medium text-foreground">형상지수</h4>
                <div className="grid grid-cols-3 gap-4 text-center text-base">
                  <div>
                    <p className="text-muted-foreground">편입 전</p>
                    <p className="text-lg font-semibold text-foreground">
                      {aiResult.originalShapeIndex.toFixed(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">편입 후</p>
                    <p className="text-lg font-semibold text-foreground">
                      {aiResult.remainingShapeIndex.toFixed(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">변화량</p>
                    <p className={`text-lg font-semibold ${aiResult.shapeIndexChange >= 1 ? "text-destructive" : "text-foreground"}`}>
                      +{aiResult.shapeIndexChange.toFixed(1)}
                    </p>
                  </div>
                </div>
              </div>
            )}
              </div>
            )}
            
            {/* 관리자 재판독 결과 뷰 */}
            {aiResultViewMode === "admin" && (
              <div className="space-y-4">
                {/* 재판독 결과가 있을 때 초기화 버튼 */}
                {Object.keys(adminLandAIResults).length > 0 && (
                  <div className="flex justify-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleResetAdminAIResults}
                      className="gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      재판독 결과 초기화
                    </Button>
                  </div>
                )}
                
                {Object.keys(adminLandAIResults).length === 0 ? (
                  <div className="rounded-lg border-2 border-dashed border-muted p-8 text-center">
                    <Bot className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h4 className="mt-4 font-medium text-foreground">관리자 재판독 미실행</h4>
                    <p className="mt-2 text-sm text-muted-foreground">
                      위 담당자 검토 영역에서 필지를 선택하고<br />
                      현장 상황 옵션을 설정한 후 AI 판독을 실행해주세요.
                    </p>
                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                      <Badge variant="outline" className="text-xs">접면도로 상실</Badge>
                      <Badge variant="outline" className="text-xs">관개수로 상실</Badge>
                      <Badge variant="outline" className="text-xs">농기계 진입 곤란</Badge>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* 관리자 옵션 적용 내역 */}
                    {(adminAIOptions.accessRoadLost || adminAIOptions.waterChannelLost || adminAIOptions.farmMachineDifficulty) && (
                      <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4">
                        <h4 className="mb-2 text-sm font-medium text-blue-800 flex items-center gap-2">
                          <Info className="h-4 w-4" />
                          적용된 현장 상황 옵션
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {adminAIOptions.accessRoadLost && (
                            <Badge className="bg-blue-600 hover:bg-blue-600">접면도로 상실</Badge>
                          )}
                          {adminAIOptions.waterChannelLost && (
                            <Badge className="bg-blue-600 hover:bg-blue-600">관개수로 상실</Badge>
                          )}
                          {adminAIOptions.farmMachineDifficulty && (
                            <Badge className="bg-blue-600 hover:bg-blue-600">농기계 진입 곤란</Badge>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* 필지별 재판독 결과 */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-foreground flex items-center gap-2">
                        필지별 재판독 결과
                        <Badge variant="outline">
                          {Object.keys(adminLandAIResults).length}필지
                        </Badge>
                      </h4>
                      {Object.entries(adminLandAIResults).map(([landId, result]) => {
                        const land = allLands.find(l => l.id === landId);
                        const landIdx = allLands.findIndex(l => l.id === landId);
                        if (!land) return null;
                        
                        return (
                          <div 
                            key={landId}
                            className={`rounded-lg border p-4 ${
                              result.provisionalJudgment === "매수"
                                ? "border-green-200 bg-green-50/50"
                                : "border-red-200 bg-red-50/50"
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                                  result.provisionalJudgment === "매수" 
                                    ? "bg-green-600 text-white" 
                                    : "bg-red-500 text-white"
                                }`}>
                                  {String.fromCharCode(65 + landIdx)}
                                </span>
                                <div>
                                  <p className="font-medium">{land.address}</p>
                                  <p className="text-sm text-muted-foreground">
                                    잔여: {land.remainingArea.toLocaleString()}m² | {land.landType}
                                  </p>
                                </div>
                              </div>
                              <Badge className={
                                result.provisionalJudgment === "매수" 
                                  ? "bg-green-600 hover:bg-green-600" 
                                  : "bg-red-500 hover:bg-red-500"
                              }>
                                {result.provisionalJudgment}
                              </Badge>
                            </div>
                            
                            {/* 판정 사유 */}
                            {result.reason && (
                              <div className="mt-3 pt-3 border-t">
                                <p className="text-sm text-muted-foreground">
                                  <span className="font-medium">판정 사유:</span> {result.reason}
                                </p>
                              </div>
                            )}
                            
                            {/* 관리자 확인 항목 표시 */}
                            {result.adminOptions && (result.adminOptions.accessRoadLost || result.adminOptions.waterChannelLost || result.adminOptions.farmMachineDifficulty) && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {result.adminOptions.accessRoadLost && (
                                  <Badge variant="outline" className="text-xs border-blue-300 text-blue-700">
                                    접면도로 상실 (관리자 확인)
                                  </Badge>
                                )}
                                {result.adminOptions.waterChannelLost && (
                                  <Badge variant="outline" className="text-xs border-blue-300 text-blue-700">
                                    관개수로 상실 (관리자 확인)
                                  </Badge>
                                )}
                                {result.adminOptions.farmMachineDifficulty && (
                                  <Badge variant="outline" className="text-xs border-blue-300 text-blue-700">
                                    농기계 진입 곤란 (관리자 확인)
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* 일단지 그룹 (관리자 재판독) */}
                    {Object.keys(adminUnifiedGroups).length > 0 && (
                      <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4">
                        <h4 className="mb-3 font-medium text-emerald-800 flex items-center gap-2">
                          <Layers className="h-4 w-4" />
                          일단지 판정 (관리자 재판독)
                        </h4>
                        <div className="space-y-2">
                          {Object.entries(adminUnifiedGroups).map(([groupId, group]) => (
                            <div key={groupId} className="rounded-md bg-white/80 p-3 border border-emerald-100">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-emerald-700">{group.groupName}</span>
                                <Badge className="bg-emerald-600 hover:bg-emerald-600">
                                  {group.judgment}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                합산 면적: {group.combinedArea.toLocaleString()}m²
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* 민원인 결과와 비교 */}
                    {aiResult && (
                      <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4">
                        <h4 className="mb-3 font-medium text-amber-800 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          민원인 신청 결과와 비교
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="rounded-md bg-white/80 p-3 border border-amber-100 text-center">
                            <p className="text-sm text-muted-foreground mb-1">민원인 신청</p>
                            <Badge 
                              className={
                                aiResult.provisionalJudgment === "매수" 
                                  ? "bg-green-600 hover:bg-green-600" 
                                  : "bg-red-500 hover:bg-red-500"
                              }
                            >
                              {aiResult.provisionalJudgment}
                            </Badge>
                          </div>
                          <div className="rounded-md bg-white/80 p-3 border border-amber-100 text-center">
                            <p className="text-sm text-muted-foreground mb-1">관리자 재판독</p>
                            <Badge 
                              className={(() => {
                                const results = Object.values(adminLandAIResults);
                                const hasPurchase = results.some(r => r.provisionalJudgment === "매수");
                                if (hasPurchase) return "bg-green-600 hover:bg-green-600";
                                return "bg-red-500 hover:bg-red-500";
                              })()}
                            >
                              {(() => {
                                const results = Object.values(adminLandAIResults);
                                const purchaseCount = results.filter(r => r.provisionalJudgment === "매수").length;
                                if (purchaseCount === 0) return "매수불가";
                                if (purchaseCount === results.length) return "매수";
                                return `${purchaseCount}/${results.length} 매수`;
                              })()}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 담당자 검토 영역 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            담당자 검토
            {checkedLandIds.length > 0 && (
              <Badge variant="outline" className="ml-auto font-normal">
                {checkedLandIds.length}필지 선택
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            {checkedLandIds.length > 0 
              ? `선택된 ${checkedLandIds.length}개 필지에 대한 AI 분석 결과를 검토합니다.`
              : "필지를 선택하고 AI 판독을 실행해주세요."
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 체크된 필지가 있는 경우 */}
          {checkedLandIds.length > 0 ? (
            <div className="space-y-6">
              {/* 선택된 필지별 상세 정보 */}
              {checkedLandIds.map((landId) => {
                const landIndex = allLands.findIndex(l => l.id === landId);
                const selectedLand = allLands[landIndex];
                const selectedLandData = application.landDataList?.[landIndex];
                const selectedLandReview = landReviewDataList[landIndex];
                const landLabel = String.fromCharCode(65 + landIndex);
                const landResult = landAIResults[landId];
                if (!selectedLand) return null;
                const isAgricultural = selectedLand.landType === "농지" || selectedLandReview?.actualUsage === "답" || selectedLandReview?.actualUsage === "전";
                
                const landSubTypeLabels: Record<string, string> = {
                  "residential-detached": "주거용 - 단독주택",
                  "residential-multi": "주거용 - 연립/다세대",
                  "residential-apartment": "주거용 - 아파트",
                  "commercial": "상업용",
                  "industrial": "공업용",
                };

                return (
                  <div key={landId} className="space-y-4 rounded-lg border p-4">
                    {/* 필지 헤더 */}
                    <div className="flex items-center justify-between border-b pb-3">
                      <div className="flex items-center gap-2">
                        <span className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
                          landResult?.provisionalJudgment === "매수" ? "bg-green-600 text-white" : 
                          landResult?.provisionalJudgment === "매수불가" ? "bg-red-500 text-white" : "bg-muted"
                        }`}>
                          {landLabel}
                        </span>
                        <div>
                          <p className="font-medium">필지 {landLabel}</p>
                          <p className="text-sm text-muted-foreground">{selectedLand.address}</p>
                        </div>
                      </div>
                      {landResult && (
                        <Badge className={
                          landResult.provisionalJudgment === "매수" ? "bg-green-600" : "bg-red-500"
                        }>
                          {landResult.provisionalJudgment}
                        </Badge>
                      )}
                    </div>
                    
                    {/* 민원인 입력 정보 */}
                    <div className="rounded-lg border border-violet-200 bg-violet-50/30 p-4 space-y-3">
                      <h5 className="flex items-center gap-2 font-semibold text-violet-700">
                        <User className="h-4 w-4" />
                        민원인 입력 정보
                      </h5>
                      {selectedLandData ? (
                        <div className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">현재 활용 지목</span>
                            <span className="font-medium">
                              {selectedLandData.currentUsage} ({landCategories.find(c => c.value === selectedLandData.currentUsage)?.label || ""})
                            </span>
                          </div>
                          {selectedLandData.currentUsage === "대" && selectedLandData.landSubType && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">택지 세부 유형</span>
                              <span className="font-medium">{landSubTypeLabels[selectedLandData.landSubType] || selectedLandData.landSubType}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">공부상 지목</span>
                            <span className="font-medium">
                              {selectedLandData.actualUsage} ({landCategories.find(c => c.value === selectedLandData.actualUsage)?.label || ""})
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">토지 모양</span>
                            <span className="font-medium">{selectedLandData.reportedShape}</span>
                          </div>
                          <div className="col-span-full flex flex-wrap gap-2 border-t border-violet-200 pt-2 mt-2">
                            {selectedLandData.accessRoadLost && (
                              <Badge variant="destructive-subtle" className="text-xs">접면도로 상실</Badge>
                            )}
                            {selectedLandData.waterChannelLost && (
                              <Badge variant="destructive-subtle" className="text-xs">관개수로 상실</Badge>
                            )}
                            {selectedLandData.farmMachineDifficulty && (
                              <Badge variant="destructive-subtle" className="text-xs">농기계 진입 곤란</Badge>
                            )}
                            {!selectedLandData.accessRoadLost && !selectedLandData.waterChannelLost && !selectedLandData.farmMachineDifficulty && (
                              <span className="text-xs text-muted-foreground">직접 확인 항목 없음</span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">민원인 입력 정보가 없습니다.</p>
                      )}
                    </div>

                    {/* 담당자 검토 입력 */}
                    <div className="space-y-4">
                      <h5 className="font-semibold text-foreground">담당자 확인</h5>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-2">
                          <Label>실제 이용 상황</Label>
                          <Select
                            value={selectedLandReview?.actualUsage || ""}
                            onValueChange={(value) => updateLandReviewData(landIndex, "actualUsage", value as LandCategory)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {landCategories.map((cat) => (
                                <SelectItem key={cat.value} value={cat.value}>
                                  {cat.value} ({cat.label})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>토지 모양</Label>
                          <Select
                            value={selectedLandReview?.landShape || ""}
                            onValueChange={(value) => updateLandReviewData(landIndex, "landShape", value as LandShape)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <div className="px-2 py-1 text-base font-semibold text-muted-foreground">정형</div>
                              {landShapes.regular.map((shape) => (
                                <SelectItem key={shape.value} value={shape.value}>{shape.label}</SelectItem>
                              ))}
                              <div className="px-2 py-1 text-base font-semibold text-muted-foreground">비정형</div>
                              {landShapes.irregular.map((shape) => (
                                <SelectItem key={shape.value} value={shape.value}>{shape.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {isAgricultural && (
                          <div className="space-y-2">
                            <Label>농기계 진입/회전 곤란</Label>
                            <Select
                              value={selectedLandReview?.farmMachineDifficulty || "미입력"}
                              onValueChange={(value) => updateLandReviewData(landIndex, "farmMachineDifficulty", value as "미입력" | "해당" | "해당없음")}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="미입력">미입력</SelectItem>
                                <SelectItem value="해당">해당</SelectItem>
                                <SelectItem value="해당없음">해당 없음</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label>필지별 판정</Label>
                          <Select
                            value={selectedLandReview?.landJudgment || ""}
                            onValueChange={(value) => updateLandReviewData(landIndex, "landJudgment", value as JudgmentResult)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="판정 선택" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="매수">매수</SelectItem>
                              <SelectItem value="기각">기각</SelectItem>
                              <SelectItem value="심의위원회이관">심의위원회 이관</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* 자동 판독 불가 항목 */}
                      <div className="space-y-2">
                        <Label>자동 판독 불가 항목</Label>
                        <div className="flex flex-wrap gap-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`accessRoadLost-${selectedLandIndex}`}
                              checked={selectedLandReview?.accessRoadLost || false}
                              onCheckedChange={(checked) => updateLandReviewData(landIndex, "accessRoadLost", checked === true)}
                            />
                            <Label htmlFor={`accessRoadLost-${selectedLandIndex}`} className="text-base font-normal">
                              접면도로 상실
                            </Label>
                          </div>
                          {isAgricultural && (
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`waterChannelLost-${selectedLandIndex}`}
                                checked={selectedLandReview?.waterChannelLost || false}
                                onCheckedChange={(checked) => updateLandReviewData(landIndex, "waterChannelLost", checked === true)}
                              />
                              <Label htmlFor={`waterChannelLost-${selectedLandIndex}`} className="text-base font-normal">
                                관개수로 상실
                              </Label>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* 소유자 의견 */}
              <div className="space-y-2">
                <Label>소유자 의견 (신청 사유)</Label>
                <div className="rounded-lg border border-border bg-muted/50 p-3 text-base text-foreground">
                  {application.reason}
                </div>
              </div>

              {/* 최종 검토 의견 (복수 필지용) */}
              <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <Label className="text-base font-semibold text-primary">최종 검토 의견</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  복수 필��� 신청건에 대한 종합적인 검토 의견을 작성하세요. 이 내용은 심의서의 &quot;현지상황 및 검토의견&quot;에 자동 입력됩니다.
                </p>
                <Textarea
                  id="finalReviewOpinion"
                  placeholder="복수 필지에 대한 종합 검토 의견을 작성하세요. (예: 해당 토지들은 동일 소유자 소유로 연접해 있으며, 도�� 편입으로 인해 모두 불규칙한 형태로 남아 건축 및 영농이 곤란한 ��태입니다.)"
                  rows={5}
                  value={reviewData.finalReviewOpinion}
                  onChange={(e) =>
                    setReviewData((prev) => ({ ...prev, finalReviewOpinion: e.target.value }))
                  }
                  className="border-primary/20"
                />
              </div>
            </div>
          ) : (
            /* 필지 선택 안내 */
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <User className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium text-muted-foreground mb-2">
                필지를 선택해주세요
              </p>
              <p className="text-sm text-muted-foreground">
                필지 목록에서 체크박스로 필지를 선택하고 AI 판독을 실행하세요.
              </p>
            </div>
          )}
          
          {/* 진행상황 설정 */}
          <div className="space-y-2">
            <Label>진행상황 설���</Label>
            <div className="flex flex-wrap gap-2">
              {(["접수완료", "진행중", "심사완료"] as AdminStatus[]).map((status) => {
                const config = adminStatusConfig[status];
                const Icon = config.icon;
                const isSelected = reviewData.adminStatus === status;
                return (
                  <Button
                    key={status}
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setReviewData((prev) => ({ ...prev, adminStatus: status }))
                    }
                    className={`cursor-pointer border-2 ${isSelected ? "border-primary text-primary" : "border-[#E1E4E7] text-foreground"}`}
                  >
                    <Icon className={`mr-2 h-4 w-4 ${status === "진행중" && isSelected ? "animate-spin" : ""}`} />
                    {config.label}
                  </Button>
                );
              })}
            </div>
            <p className="text-base text-muted-foreground">
              민원인이 신청 현황 조회 시 이 진행상황이 표시됩니다.
            </p>
          </div>

          {/* 최종 판정 - 진행상황이 완료일 때만 활성화 */}
          <div className="space-y-2">
<Label className={reviewData.adminStatus !== "심사완료" ? "text-muted-foreground" : ""}>
                  최종 판정
                  {reviewData.adminStatus !== "심사완료" && (
                    <span className="ml-2 text-base font-normal text-muted-foreground">
                      (진행상황을 &apos;심사완료&apos;로 설정하면 활성화됩니다)
                    </span>
                  )}
            </Label>
            <div className="flex flex-wrap gap-2">
              {(["매수", "기각", "심의위원회이관"] as JudgmentResult[]).map((judgment) => {
                const config = judgmentConfig[judgment];
                const Icon = config.icon;
                const isSelected = reviewData.finalJudgment === judgment;
                const isDisabled = reviewData.adminStatus !== "심사완료";
                return (
                  <Button
                    key={judgment}
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setReviewData((prev) => ({ ...prev, finalJudgment: judgment }))
                    }
                    disabled={isDisabled}
                    className={`cursor-pointer border-2 ${isSelected ? "border-primary text-primary" : "border-[#E1E4E7] text-foreground"} ${isDisabled ? "opacity-50" : ""}`}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {config.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* 저장 버�� */}
          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <Button variant="outline" onClick={onBack}>
              취소
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                "저장 중..."
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  검토 완료 및 저장
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI 분석 프로세스 ��이��로그 */}
      <AIAnalysisFlowDialog
        open={showAnalysisFlow}
        onOpenChange={setShowAnalysisFlow}
        aiResult={aiResult}
        landInfo={allLands[selectedLandIndex]}
      />
    </div>
  );
}
