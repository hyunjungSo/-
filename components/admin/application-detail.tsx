"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { LandMap } from "@/components/land-map";
import { LeafletMap } from "@/components/leaflet-map";
import { AIAnalysisFlowDialog } from "@/components/admin/ai-analysis-flow-dialog";
import { AIIcon } from "@/components/ui/ai-icon";
import { landShapes, landCategories } from "@/lib/dummy-data";
import type { Application, JudgmentResult, LandShape, LandCategory, AdminStatus } from "@/lib/types";
import {
  ArrowLeft,
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
  ChevronUp,
  Map as MapIcon,
  Loader2,
  RotateCcw,
  X,
  Split,
  Edit3,
  History,
  ArrowRight,
  Scale,
  Shield,
  Brain,
  ListChecks,
  Locate,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
  landComment: string; // 필지별 검토의견
}

export function ApplicationDetail({ application, onBack, onSave }: ApplicationDetailProps) {
// 복수 필지 여부 확인
  const isMultipleLands = application.additionalLands && application.additionalLands.length > 0;
  const allLands = isMultipleLands
    ? [application.landInfo, ...application.additionalLands]
    : [application.landInfo];
  
  // 신청 유형 결정 (하위 호환: applicationType이 없으면 필지 수로 추론)
  // applicationType이 "unified"이거나, unifiedParcelCondition?.isUnifiedParcel이 true이면 일단지로 판단
  const applicationType = application.applicationType === "unified" || application.unifiedParcelCondition?.isUnifiedParcel
    ? "unified"
    : application.applicationType || (isMultipleLands ? "multiple" : "single");
  
  // 부분 일단지 여부 확인 (landJudgments에서 unifiedGroupId가 있는 필지가 있으면 부분 일단지)
  const partialUnifiedGroups = application.aiResult?.landJudgments?.reduce((groups, lj) => {
    if (lj.unifiedGroupId) {
      if (!groups[lj.unifiedGroupId]) {
        groups[lj.unifiedGroupId] = [];
      }
      groups[lj.unifiedGroupId].push(lj);
    }
    return groups;
  }, {} as Record<string, typeof application.aiResult.landJudgments>) || {};
  const hasUnifiedGroups = Object.keys(partialUnifiedGroups).length > 0;

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
        landComment: "",
      };
    });
  };

  const [landReviewDataList, setLandReviewDataList] = useState<LandReviewData[]>(initializeLandReviewData);
  
  // 선택된 필지 인덱스 (복수 필지용)
  const [selectedLandIndex, setSelectedLandIndex] = useState(0);
  
  // 호버된 필지 ID (지도-리스트 연동)
  const [hoveredLandId, setHoveredLandId] = useState<string | null>(null);
  
  // 포커스된 필지 ID (지도 중심 이동용)
  const [focusedLandId, setFocusedLandId] = useState<string | null>(null);
  
  // 선택된 인접 필지 정보 표시용
  const [selectedAdjacentParcel, setSelectedAdjacentParcel] = useState<{
    id: string;
    address: string;
    landCategory: string;
    landType: string;
    area: number;
    owner: string;
  } | null>(null);
  
  
  
  // 관리자 수치 수정 (면적, 폭 등)
  const [adminEditedValues, setAdminEditedValues] = useState<Record<string, {
    remainingArea?: number;
    width?: number;
    originalArea?: number;
  }>>({});
  
  // AI 결과와 다른 최종 판정 시 사유 필수
  const [adminOverrideReason, setAdminOverrideReason] = useState("");
  
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
  
  // 필�����별 분석 진행 상태: 'pending' | 'analyzing' | 'done'
  const [landAnalysisStatus, setLandAnalysisStatus] = useState<Record<string, 'pending' | 'analyzing' | 'done'>>({});
  
  // 필지별 분석 단계 상세 (0: 대기, 1: 형상지수 계산, 2: 면적 비율 분석, 3: 법적 기준 검토, 4: 종합 판정, 5: 완료)
  const [landAnalysisStep, setLandAnalysisStep] = useState<Record<string, number>>({});
  
  // 관리자용 AI 판독 추가 옵션 (현장 상황) - 필지별 관리
  const [adminAIOptionsPerLand, setAdminAIOptionsPerLand] = useState<Record<string, {
    accessRoadLost: boolean;      // 접면도로 상실
    waterChannelLost: boolean;    // 관개수로 상실
    farmMachineDifficulty: boolean; // 농기계 진입 곤란
  }>>({});
  
  // 필지별 옵션 업데이트 헬퍼
  const updateLandOption = (landId: string, option: string, value: boolean) => {
    setAdminAIOptionsPerLand(prev => ({
      ...prev,
      [landId]: {
        accessRoadLost: prev[landId]?.accessRoadLost || false,
        waterChannelLost: prev[landId]?.waterChannelLost || false,
        farmMachineDifficulty: prev[landId]?.farmMachineDifficulty || false,
        [option]: value
      }
    }));
  };
  
  // 필지별 현재 활용 지목 상태
  const [adminCurrentUsagePerLand, setAdminCurrentUsagePerLand] = useState<Record<string, string>>({});
  
  // 필지별 건축물 용도 상태
  const [adminLandSubTypePerLand, setAdminLandSubTypePerLand] = useState<Record<string, string>>({});
  
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
    adminCurrentUsage?: string;  // 담당자가 선택한 현재 활용지목
    adminLandSubType?: string;   // 담당자가 선택한 건축물 용도
  }>>({});
  
  // 관리자 재판독 일단지 그룹
  const [adminUnifiedGroups, setAdminUnifiedGroups] = useState<Record<string, {
    groupName: string;
    landIds: string[];
    combinedArea: number;
    judgment: string;
  }>>({});
  
  // 민원인이 신청한 필지 ID 목록 (application에서 가져옴, 읽기 전용)
  const citizenSelectedLandIds = allLands.map(l => l.id);
  
  // 담당자가 선택한 필지 ID 목록 (수정 가능, 초기값: 민원인 신청 필지와 동일)
  const [adminCheckedLandIds, setAdminCheckedLandIds] = useState<string[]>(() => allLands.map(l => l.id));
  
  // 기존 호환성을 위한 adminAIOptions (선택된 필지들의 옵션 합산)
  const adminAIOptions = {
    accessRoadLost: adminCheckedLandIds.some(id => adminAIOptionsPerLand[id]?.accessRoadLost),
    waterChannelLost: adminCheckedLandIds.some(id => adminAIOptionsPerLand[id]?.waterChannelLost),
    farmMachineDifficulty: adminCheckedLandIds.some(id => adminAIOptionsPerLand[id]?.farmMachineDifficulty),
  };
  
  // 현재 탭에 따른 선택된 필지 ID (지도 표시용)
  const currentSelectedLandIds = aiResultViewMode === "citizen" ? citizenSelectedLandIds : adminCheckedLandIds;
  
  // 담당자 탭 ��크박스 선택 변경 핸들러
  const handleAdminCheckLand = (landId: string, checked: boolean) => {
    if (checked) {
      setAdminCheckedLandIds(prev => [...prev, landId]);
    } else {
      setAdminCheckedLandIds(prev => prev.filter(id => id !== landId));
    }
  };
  
  // 담당자 탭 전체 선택 핸들러
  const handleAdminCheckAll = (checked: boolean) => {
    if (checked) {
      setAdminCheckedLandIds(allLands.map(l => l.id));
    } else {
      setAdminCheckedLandIds([]);
    }
  };
  
  // 기존 호환용 (일부 로직에서 사용)
  const checkedLandIds = aiResultViewMode === "admin" ? adminCheckedLandIds : citizenSelectedLandIds;
  
  // 담당자 탭 필지 토글 핸들러
  const handleLandCheckToggle = (landId: string) => {
    setAdminCheckedLandIds(prev => 
      prev.includes(landId) 
        ? prev.filter(id => id !== landId)
        : [...prev, landId]
    );
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
    shapeIndexChange?: number; // 형상지수 변화
    criteriaChecks?: Array<{ criteriaName: string; isMet: boolean }>; // 판정 기준
    judgmentRationale?: { // 판단 근거 설명
      summary: string;
      legalBasis: string;
      appliedCriteria: string[];
      detailedExplanation: string;
      manualCheckItems?: string[];
    };
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
        shapeIndexChange?: number;
        criteriaChecks?: Array<{ criteriaName: string; isMet: boolean }>;
        judgmentRationale?: {
          summary: string;
          legalBasis: string;
          appliedCriteria: string[];
          detailedExplanation: string;
          manualCheckItems?: string[];
        };
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
              shapeIndexChange: application.aiResult!.shapeIndexChange,
              criteriaChecks: application.aiResult!.criteriaChecks?.map(c => ({ criteriaName: c.criteriaName, isMet: c.isMet })),
              judgmentRationale: application.aiResult!.judgmentRationale,
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
            shapeIndexChange: application.aiResult!.shapeIndexChange,
            criteriaChecks: application.aiResult!.criteriaChecks?.map(c => ({ criteriaName: c.criteriaName, isMet: c.isMet })),
            judgmentRationale: application.aiResult!.judgmentRationale,
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

// ===== [1단계] 일단지 판정 로직 =====
  // 주소에서 읍면/동 및 지번 정보 추출
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
  
  // 편입 전 면적 기준 (㎡) - 초과 시 토지유형별 경로, 이��� 시 소규모 토지 경로
  const AREA_THRESHOLD = {
    residential: { detached: 90, apartment: 330, commercial: 150, industrial: 330 },
    agricultural: 330,
    forest: 330,
    other: 330,
  };
  
  // 토지 유형별 면적 기준 (㎡)
  const getAreaCriteria = (land: typeof allLands[0], landData?: typeof application.landDataList[0], adminLandSubType?: string) => {
    const landType = land.landType;
    // 담당자가 선택한 건축물 용도 우선 적용, 없으면 신청 시 입력된 값 사용
    const subType = adminLandSubType || landData?.landSubType || "";
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
      // 농지 경�������������������������������: 기본 330㎡, 잔여비율 25% 이하 시 495㎡ (완화)
      return { base: 330, relaxed: remainingRatio <= 25 ? 495 : 330 };
    } else if (landType === "산지") {
      // 산지 경로: 기본 330㎡, 잔여비율 25% 이하 시 495㎡ (완화)
      return { base: 330, relaxed: remainingRatio <= 25 ? 495 : 330 };
    } else {
      // 그 밖의 토지: 택지/농지/산지 중 유사 용도 기준 적용, 기본 330㎡
      return { base: 330, relaxed: remainingRatio <= 25 ? 412.5 : 330 };
    }
  };
  
  // 소규모 토지 여부 판단 (편입 전 면적 330�� 이하 또는 잔여비율 50% 이하)
  const isSmallScaleLand = (land: typeof allLands[0]) => {
    return land.originalArea <= 330 || land.remainingRatio <= 50;
  };
  
  // 형상 기준 충족 여부 (폭 기준)
  const checkShapeCriteria = (land: typeof allLands[0]) => {
    const shape = land.remainingShape;
    // 사각형 폭: 5m 이하, 삼각형 한 변: 11m 이하
    // 형상지수 변화로 간접 판단 (실제 현장 데이터 없음)
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
  const analyzeSingleLand = (
    land: typeof allLands[0], 
    landData?: typeof application.landDataList[0], 
    adminOptions?: typeof adminAIOptions,
    adminCurrentUsage?: string, // 담당자가 선택한 현재 활용지목
    adminLandSubType?: string   // 담당자가 선택한 건축물 용도
  ) => {
    // 담당자가 선택한 현재 활용지목 우선 적용, 없으면 원래 지목 사용
    const effectiveLandType = adminCurrentUsage 
      ? (adminCurrentUsage === "대" ? "���지" : adminCurrentUsage === "��" || adminCurrentUsage === "답" ? "농지" : adminCurrentUsage === "임" ? "임야" : "기타")
      : land.landType;
    
    const criteria = getAreaCriteria(land, landData, adminLandSubType);
    const isSmall = isSmallScaleLand(land);
    const shapeCriteria = checkShapeCriteria(land);
    const addr = parseAddress(land.address);
    
    const criteriaChecks: Array<{ name: string; met: boolean; description: string }> = [];
    let judgment: "매수" | "매수불가" | "검토필요" = "매수불가";
    let reasons: string[] = [];
    
    // 1. ��적 기준 미달 여부
    const effectiveLimit = criteria.relaxed;
    const areaCheckMet = land.remainingArea <= effectiveLimit;
    criteriaChecks.push({
      name: "면적 기준",
      met: areaCheckMet,
      description: `잔여 ${land.remainingArea}㎡ ${areaCheckMet ? "≤" : ">"} ${effectiveLimit}㎡`
    });
    
    if (effectiveLandType === "대지") {
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
      
    } else if (effectiveLandType === "농지") {
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
        description: farmDifficulty ? "농기계 진입/회전 곤란" + (adminOptions?.farmMachineDifficulty ? " (관리자 확인)" : "") : "���기계 사용 가능"
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
        description: usageDifficulty ? "���치/형상/접근 상태로 ��래 ���용 곤란" : "종래 ��용 ���능"
      });
      
      if (areaCheckMet || usageDifficulty) {
        judgment = "매수";
        if (areaCheckMet) reasons.push("면적 기준 충족");
        if (usageDifficulty) reasons.push("종래 사용 곤란");
      } else {
        judgment = "매수불가";
        reasons.push("��든 ���준 미충족");
      }
    }
    
    // 소규모 토지 추��� 검���
    if (isSmall) {
      criteriaChecks.push({
        name: "소규모 토지",
        met: true,
        description: `편입전 ${land.originalArea}㎡ 또는 잔여비율 ${land.remainingRatio}% (���규��� 해당)`
      });
      if (judgment === "매수불가") {
        judgment = "검토필요";
        reasons.push("소규모 토지로 추가 검토 ��요");
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

  // AI 판독 실행 핸들러 (2단계 프로세스) - 담������가 선택한 필지만 분석
  const handleRunAIAnalysis = () => {
    // 선택된 필지가 없으면 알림
    if (adminCheckedLandIds.length === 0) {
      alert("AI 판독할 필지를 선택해주세요.");
      return;
    }
    
    setIsAIAnalyzing(true);
    setAdminLandAIResults({});
    setAdminUnifiedGroups({});
    
    // 필지별 분석 상태 초기화 (모두 pending)
    const initialStatus: Record<string, 'pending' | 'analyzing' | 'done'> = {};
    const initialStep: Record<string, number> = {};
    adminCheckedLandIds.forEach(id => {
      initialStatus[id] = 'pending';
      initialStep[id] = 0;
    });
    setLandAnalysisStatus(initialStatus);
    setLandAnalysisStep(initialStep);
    
    // 필지별 순차 분석 시뮬레이션
    const simulateSequentialAnalysis = async () => {
      // 각 필지를 순차적으로 분석 단계별로 진행
      for (let i = 0; i < adminCheckedLandIds.length; i++) {
        const landId = adminCheckedLandIds[i];
        setLandAnalysisStatus(prev => ({ ...prev, [landId]: 'analyzing' }));
        
        // 단계별 진행 (각 단계당 300ms)
        for (let step = 1; step <= 5; step++) {
          setLandAnalysisStep(prev => ({ ...prev, [landId]: step }));
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        setLandAnalysisStatus(prev => ({ ...prev, [landId]: 'done' }));
      }
    };
    
    simulateSequentialAnalysis();
    
    setTimeout(() => {
      const newResults: typeof adminLandAIResults = {};
      const newGroups: typeof adminUnifiedGroups = {};
      
      // 담당자가 선택한 필지들만 분석 대상��로 설정
      const selectedLands = allLands.filter(l => adminCheckedLandIds.includes(l.id));
      
      // ===== [1단계] 일단지 판정 =====
      // 소유자 동일, 지반 연속, 용도 일체성 확인하여 일단지 그룹 형성
      const unifiedLandGroups = selectedLands.length >= 2 ? findUnifiedGroups(selectedLands) : selectedLands.length === 1 ? [[selectedLands[0].id]] : [];
      let groupIndex = 0;
      
      unifiedLandGroups.forEach((groupLandIds) => {
        const groupLands = selectedLands.filter(l => groupLandIds.includes(l.id));
        const isUnified = groupLandIds.length >= 2;
        
        if (isUnified) {
          // ===== 일단지 병합 처리 =====
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
            
            // 토지유형별 추가 조건 검토 + 관리자 현장 상황 옵션 반영 (필지별 옵션 사용)
            // 그룹 내 필지들의 옵션 합산
            const groupOptions = {
              accessRoadLost: groupLandIds.some(id => adminAIOptionsPerLand[id]?.accessRoadLost),
              waterChannelLost: groupLandIds.some(id => adminAIOptionsPerLand[id]?.waterChannelLost),
              farmMachineDifficulty: groupLandIds.some(id => adminAIOptionsPerLand[id]?.farmMachineDifficulty),
            };
            
            if (landType === "대지") {
              // 택지 경로
              const hasRoadLoss = groupOptions.accessRoadLost || groupLands.some(l => l.remainingRatio < 30);
              const hasShapeChange = groupLands.some(l => checkShapeCriteria(l).met);
              if (hasRoadLoss) analysisReasons.push("접면도로 상실" + (groupOptions.accessRoadLost ? " (관리자 확인)" : ""));
              if (hasShapeChange) analysisReasons.push("형상 부정형 변경");
              
            } else if (landType === "농지") {
              // 농지 경로 + 관리자 옵션 우선 반영
              const hasRoadLoss = groupOptions.accessRoadLost || groupLands.some(l => {
                const data = application.landDataList?.[allLands.findIndex(al => al.id === l.id)];
                return data?.accessRoadLost || l.remainingRatio < 30;
              });
              const hasWaterLoss = groupOptions.waterChannelLost || groupLands.some(l => {
                const data = application.landDataList?.[allLands.findIndex(al => al.id === l.id)];
                return data?.waterChannelLost;
              });
              const hasFarmDifficulty = groupOptions.farmMachineDifficulty || groupLands.some(l => l.remainingArea < 200);
              const hasShapeChange = groupLands.some(l => checkShapeCriteria(l).met);
              
              if (hasRoadLoss) analysisReasons.push("접면도로 상실" + (groupOptions.accessRoadLost ? " (관리자 확인)" : ""));
              if (hasWaterLoss) analysisReasons.push("관개수로 상실" + (groupOptions.waterChannelLost ? " (관리자 확인)" : ""));
              if (hasFarmDifficulty) analysisReasons.push("농기계 진입/회전 곤란" + (groupOptions.farmMachineDifficulty ? " (관리자 확인)" : ""));
              if (hasShapeChange) analysisReasons.push("형상 부��형 변경");
              
            } else if (landType === "산지") {
              // 산지 경로
              const hasRoadLoss = groupOptions.accessRoadLost || groupLands.some(l => l.remainingRatio < 25);
              if (hasRoadLoss) analysisReasons.push("접면도로 상실 (접근 불가)" + (groupOptions.accessRoadLost ? " (관리자 확인)" : ""));
              
            } else {
              // 그 밖의 토지
              const hasUsageDifficulty = groupOptions.accessRoadLost || groupOptions.farmMachineDifficulty || 
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
          // ===== 단독 필지 분석 =====
          const landId = groupLandIds[0];
          const land = allLands.find(l => l.id === landId)!;
          const landIndex = allLands.findIndex(l => l.id === landId);
          const landData = application.landDataList?.[landIndex];
          
          // [2단계] 개별 필지 상세 분석 (관리자 옵션 반영 - 해당 필지의 옵션 사용)
          const landOptions = adminAIOptionsPerLand[landId] || { accessRoadLost: false, waterChannelLost: false, farmMachineDifficulty: false };
          const adminCurrentUsage = adminCurrentUsagePerLand[landId];
          const adminLandSubType = adminLandSubTypePerLand[landId];
          const analysis = analyzeSingleLand(land, landData, landOptions, adminCurrentUsage, adminLandSubType);
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
            adminCurrentUsage: adminCurrentUsage, // 담당자가 선택한 현재 활용지목
            adminLandSubType: adminLandSubType,   // 담당자가 선택한 건축물 용도
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
  
  // 필지 포함/제외 상태 (민원인 소유 확인용)
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

      {/* Section 01. 신청인 정보 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            신청인 정보
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">신청인</p>
              <p className="font-medium">{application.applicantName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">연���처</p>
              <p className="font-medium">{application.applicantContact}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">신청일</p>
              <p className="font-medium">{application.appliedAt}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">����명</p>
              <p className="font-medium">{application.landInfo.projectName}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mt-4">
            <div>
              <p className="text-xs text-muted-foreground">주소</p>
              <p className="font-medium">{application.applicantAddress}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">접수번호</p>
              <p className="font-medium">{application.applicationNumber}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">신청유형</p>
              <p className="font-medium">
                {(() => {
                  // 테이블과 동일한 로직 적용
                  const isUnified = application.aiResult?.unifiedLandAnalysis || 
                    application.aiResult?.landJudgments?.some(lj => lj.unifiedGroupId);
                  const isMultiple = application.additionalLands && application.additionalLands.length > 0;
                  
                  if (isUnified) {
                    return "일단지";
                  } else if (isMultiple) {
                    return `복수필지 (${application.additionalLands!.length + 1})`;
                  } else {
                    return "단일필지";
                  }
                })()}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">신청사유</p>
              <p className="font-medium text-sm line-clamp-2">{application.reason}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 02. AI 분석 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AIIcon className="h-5 w-5" />
            AI 분석
          </CardTitle>
          <CardDescription>
            민원인 신청 결과와 담당자 분석 결과를 확인합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="citizen" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="citizen">
                민원인 결과
              </TabsTrigger>
              <TabsTrigger value="admin">
                담당자 결과
              </TabsTrigger>
            </TabsList>
            
            {/* 민원인 결과 탭 */}
            <TabsContent value="citizen">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* 좌측: 지적도 */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">지적도</h4>
                    <Badge variant="outline" className="font-normal">
                      {allLands.length}필지
                    </Badge>
                  </div>
                  
                  {/* 지적도 */}
                  <div className="h-[450px] rounded-lg overflow-hidden border">
                    <LeafletMap
                      parcels={(() => {
                        const applicationParcels = allLands.map((land, idx) => {
                          const baseLat = 37.2180 + (idx * 0.0008);
                          const baseLng = 127.2950 + (idx * 0.0005);
                          const offset = 0.0003;
                          
                          return {
                            id: land.id,
                            address: land.address,
                            isIncluded: true,
                            isOwned: true,
                            coordinates: [
                              { lat: baseLat, lng: baseLng },
                              { lat: baseLat, lng: baseLng + offset * 1.2 },
                              { lat: baseLat + offset, lng: baseLng + offset * 1.2 },
                              { lat: baseLat + offset, lng: baseLng },
                            ],
                          };
                        });
                        
                        const adjacentParcels = [
                          {
                            id: "adjacent-001",
                            address: "경기도 용인시 처인구 포곡읍 마성리 101",
                            isIncluded: false,
                            isOwned: false,
                            coordinates: [
                              { lat: 37.2183, lng: 127.2953 },
                              { lat: 37.2183, lng: 127.2957 },
                              { lat: 37.2186, lng: 127.2957 },
                              { lat: 37.2186, lng: 127.2953 },
                            ],
                          },
                        ];
                        
                        return [...applicationParcels, ...adjacentParcels];
                      })()}
                      selectedParcelIds={new Set(allLands.map(l => l.id))}
                      onParcelClick={() => {}}
                      hoveredParcelId={hoveredLandId}
                      onParcelHover={(parcelId) => setHoveredLandId(parcelId)}
                      zoom={18}
                    />
                  </div>
                  
                  {/* 지��� 범례 */}
                  <div className="rounded-lg border bg-white/80 p-2">
                    <p className="text-xs font-medium text-muted-foreground mb-2">범례</p>
                    <div className="flex flex-wrap gap-3 text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="h-3 w-3 rounded-sm border-2 border-[#16a34a] bg-[#bbf7d0]" />
                        <span className="text-emerald-700 font-medium">신청필지</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="h-3 w-3 rounded-sm border-2 border-dashed border-[#d97706] bg-[#fef3c7]" />
                        <span>인접필지</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 우측: 분석결과 */}
                <div className="space-y-4">
                  <h4 className="font-medium">분석결과</h4>
                  
                  {/* 스크롤 컨테이너 - 일단지 판정 결과와 필지별 분석 결과 함께 스크롤 */}
                  <div className="max-h-[550px] overflow-y-auto space-y-4 pr-1">
                  {/* 일단지인 경우에만 최상단에 일단지 판정 결과 표시 */}
                  {applicationType === "unified" && (
                    <div className="space-y-3 mb-4">
                      {applicationType === "unified" ? (
                        // 전체 일단지
                        <div className="rounded-lg border-2 border-emerald-200 bg-emerald-50/50 p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-medium text-emerald-800 flex items-center gap-2">
                              <Layers className="h-4 w-4" />
                              일단지 판정 결과
                            </h5>
                            <Badge className={application.aiResult?.provisionalJudgment === "매수" ? "bg-emerald-600 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-500"}>
                              {application.aiResult?.provisionalJudgment || "매수"}
                            </Badge>
                          </div>
                          
                          {/* 일단지 조건 체크 */}
                          <div className="grid grid-cols-3 gap-2 mb-3">
                            <div className={`flex items-center gap-1.5 text-xs rounded px-2 py-1 ${
                              application.unifiedParcelCondition?.sameOwner ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
                            }`}>
                              {application.unifiedParcelCondition?.sameOwner ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                              소유자 동일
                            </div>
                            <div className={`flex items-center gap-1.5 text-xs rounded px-2 py-1 ${
                              application.unifiedParcelCondition?.continuous ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
                            }`}>
                              {application.unifiedParcelCondition?.continuous ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                              지반 연속
                            </div>
                            <div className={`flex items-center gap-1.5 text-xs rounded px-2 py-1 ${
                              application.unifiedParcelCondition?.sameUsage ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
                            }`}>
                              {application.unifiedParcelCondition?.sameUsage ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                              용도 일체성
                            </div>
                          </div>

                          {/* 기본 정보 */}
                          <div className="grid grid-cols-3 gap-2 mb-3">
                            <div className="rounded bg-white/80 p-2 text-center">
                              <p className="text-xs text-muted-foreground">포함 필지</p>
                              <p className="font-semibold text-sm">{allLands.map((_, idx) => String.fromCharCode(65 + idx)).join(", ")}</p>
                            </div>
                            <div className="rounded bg-white/80 p-2 text-center">
                              <p className="text-xs text-muted-foreground">합산 잔여���적</p>
                              <p className="font-semibold text-sm">{allLands.reduce((sum, l) => sum + l.remainingArea, 0).toLocaleString()}m²</p>
                            </div>
                            <div className="rounded bg-white/80 p-2 text-center">
                              <p className="text-xs text-muted-foreground">형상지수</p>
                              <p className="font-semibold text-sm">{application.aiResult?.remainingShapeIndex?.toFixed(1) || "-"}</p>
                            </div>
                          </div>

                          {/* 상세 분석 내용 - 아코디언 UI */}
                          <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="unified-detail" className="border-none">
                              <AccordionTrigger className="hover:no-underline py-2 px-0">
                                <span className="text-xs text-emerald-700 font-medium">상세 분석 보기</span>
                              </AccordionTrigger>
                              <AccordionContent className="pt-2">
                                {/* 추가 조건 */}
                                <div className="flex flex-wrap gap-2 mb-3">
                                  {application.aiResult?.farmMachineDifficulty && (
                                    <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                                      <AlertTriangle className="h-3 w-3" /> 농기계 진입 곤란
                                    </span>
                                  )}
                                  {application.aiResult?.waterChannelLost && (
                                    <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                                      <AlertTriangle className="h-3 w-3" /> 관개수로 상실
                                    </span>
                                  )}
                                  {application.aiResult?.accessRoadLost && (
                                    <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                                      <AlertTriangle className="h-3 w-3" /> 진입로 상실
                                    </span>
                                  )}
                                  {application.aiResult?.isBlindLand && (
                                    <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                                      <AlertTriangle className="h-3 w-3" /> 맹지 발생
                                    </span>
                                  )}
                                </div>

                                <div className="space-y-3 pt-3 border-t border-emerald-200">
                                  {/* 판단 요약 */}
                                  {application.aiResult?.judgmentRationale && (
                                    <div className="flex items-start gap-2">
                                      <FileText className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                                      <div>
                                        <h4 className="text-sm font-semibold text-emerald-800">판단 요약</h4>
                                        <p className="mt-1 text-sm leading-relaxed text-emerald-700">{application.aiResult.judgmentRationale.summary}</p>
                                      </div>
                                    </div>
                                  )}

                                  {/* 법적 근거 */}
                                  {application.aiResult?.judgmentRationale && (
                                    <div className="flex items-start gap-2">
                                      <Scale className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                                      <div>
                                        <h4 className="text-sm font-semibold text-emerald-800">법적 근거</h4>
                                        <p className="mt-1 text-sm leading-relaxed text-emerald-700">{application.aiResult.judgmentRationale.legalBasis}</p>
                                      </div>
                                    </div>
                                  )}

                                  {/* 적용 기준 */}
                                  {application.aiResult?.judgmentRationale?.appliedCriteria && (
                                    <div className="flex items-start gap-2">
                                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                                      <div>
                                        <h4 className="text-sm font-semibold text-emerald-800">적용 기준</h4>
                                        <ul className="mt-1 space-y-1">
                                          {application.aiResult.judgmentRationale.appliedCriteria.map((criteria, cIdx) => (
                                            <li key={cIdx} className="flex items-start gap-1.5 text-sm text-emerald-700">
                                              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500" />
                                              <span>{criteria}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>
                                  )}

                                  {/* 상세 분석 */}
                                  {application.aiResult?.judgmentRationale?.detailedExplanation && (
                                    <div className="flex items-start gap-2">
                                      <FileText className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                                      <div>
                                        <h4 className="text-sm font-semibold text-emerald-800">상세 분석</h4>
                                        <pre className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-emerald-700 bg-white/50 p-2 rounded">
                                          {application.aiResult.judgmentRationale.detailedExplanation}
                                        </pre>
                                      </div>
                                    </div>
                                  )}

                                  {/* 수동 확인 항목 */}
                                  {application.aiResult?.judgmentRationale?.manualCheckItems && application.aiResult.judgmentRationale.manualCheckItems.length > 0 && (
                                    <div className="flex items-start gap-2">
                                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                                      <div>
                                        <h4 className="text-sm font-semibold text-emerald-800">수동 확인 항목</h4>
                                        <ul className="mt-1 space-y-1">
                                          {application.aiResult.judgmentRationale.manualCheckItems.map((item, mIdx) => (
                                            <li key={mIdx} className="flex items-center gap-1.5 text-sm text-amber-700">
                                              <span className="mt-0.5 h-1 w-1 shrink-0 rounded-full bg-amber-500" />
                                              <span>{item}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>
                                  )}

                                  {/* 판정 기준 충족 여부 */}
                                  {application.aiResult?.criteriaChecks && application.aiResult.criteriaChecks.length > 0 && (
                                    <div className="rounded-lg bg-white/60 p-3 border border-emerald-200">
                                      <p className="text-xs font-medium text-emerald-700 mb-2">판정 기준 충족 여부</p>
                                      <div className="space-y-2">
                                        {application.aiResult.criteriaChecks.map((check, cIdx) => (
                                          <div key={cIdx} className="flex items-center justify-between text-sm">
                                            <span className="text-emerald-700">{check.criteriaName}</span>
                                            <Badge 
                                              variant={check.isMet ? "default" : "destructive"} 
                                              className={`text-xs ${check.isMet ? "bg-emerald-600" : ""}`}
                                            >
                                              {check.isMet ? "충족" : "미충족"}
                                            </Badge>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* 안내 문구 */}
                                  <div className="flex items-start gap-2 pt-2 border-t border-emerald-200">
                                    <Info className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" />
                                    <p className="text-xs text-emerald-600">
                                      AI 판독 결과는 참고용이며, 최종 판정은 담당자 검토에 따라 결정됩니다.
                                    </p>
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </div>
                      ) : (
                        // 부분 일단지 (그룹별로 표시)
                        Object.entries(partialUnifiedGroups).map(([groupId, lands]) => {
                          const groupLands = lands.map(lj => {
                            const landIdx = allLands.findIndex(l => l.id === lj.landId);
                            return { ...lj, landIdx, land: allLands[landIdx] };
                          }).filter(l => l.land);
                          const groupJudgment = lands[0]?.judgment || "매수";
                          const totalRemainingArea = groupLands.reduce((sum, l) => sum + (l.land?.remainingArea || 0), 0);
                          return (
                            <div key={groupId} className="rounded-lg border-2 border-emerald-200 bg-emerald-50/50 p-4">
                              <div className="flex items-center justify-between mb-3">
                                <h5 className="font-medium text-emerald-800 flex items-center gap-2">
                                  <Layers className="h-4 w-4" />
                                  일단지 판정 결과
                                </h5>
                                <Badge className={groupJudgment === "매수" ? "bg-emerald-600 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-500"}>
                                  {groupJudgment}
                                </Badge>
                              </div>
                              
                              {/* 일단지 조건 체크 */}
                              <div className="grid grid-cols-3 gap-2 mb-3">
                                <div className="flex items-center gap-1.5 text-xs rounded px-2 py-1 bg-emerald-100 text-emerald-700">
                                  <CheckCircle2 className="h-3 w-3" />
                                  소유자 동일
                                </div>
                                <div className="flex items-center gap-1.5 text-xs rounded px-2 py-1 bg-emerald-100 text-emerald-700">
                                  <CheckCircle2 className="h-3 w-3" />
                                  지반 연속
                                </div>
                                <div className="flex items-center gap-1.5 text-xs rounded px-2 py-1 bg-emerald-100 text-emerald-700">
                                  <CheckCircle2 className="h-3 w-3" />
                                  용도 일체성
                                </div>
                              </div>

                              {/* 기본 정보 */}
                              <div className="grid grid-cols-3 gap-2 mb-3">
                                <div className="rounded bg-white/80 p-2 text-center">
                                  <p className="text-xs text-muted-foreground">포함 필지</p>
                                  <p className="font-semibold text-sm">{groupLands.map(l => String.fromCharCode(65 + l.landIdx)).join(", ")}</p>
                                </div>
                                <div className="rounded bg-white/80 p-2 text-center">
                                  <p className="text-xs text-muted-foreground">합산 잔여면적</p>
                                  <p className="font-semibold text-sm">{totalRemainingArea.toLocaleString()}m²</p>
                                </div>
                                <div className="rounded bg-white/80 p-2 text-center">
                                  <p className="text-xs text-muted-foreground">형상지수</p>
                                  <p className="font-semibold text-sm">{application.aiResult?.remainingShapeIndex?.toFixed(1) || "5.0"}</p>
                                </div>
                              </div>

                              {/* 추가 조건 */}
                              <div className="flex flex-wrap gap-2 mb-3">
                                {application.aiResult?.farmMachineDifficulty && (
                                  <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                                    <AlertTriangle className="h-3 w-3" /> 농기계 진입 곤란
                                  </span>
                                )}
                                {application.aiResult?.waterChannelLost && (
                                  <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                                    <AlertTriangle className="h-3 w-3" /> 관개수로 상실
                                  </span>
                                )}
                                {application.aiResult?.accessRoadLost && (
                                  <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                                    <AlertTriangle className="h-3 w-3" /> 진입로 상실
                                  </span>
                                )}
                              </div>

                              {/* 상세 분석 내용 */}
                              <div className="space-y-3 mt-4 pt-3 border-t border-emerald-200">
                                {/* 판단 요약 */}
                                {application.aiResult?.judgmentRationale && (
                                  <div className="flex items-start gap-2">
                                    <FileText className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                                    <div>
                                      <h4 className="text-sm font-semibold text-emerald-800">판단 요약</h4>
                                      <p className="mt-1 text-sm leading-relaxed text-emerald-700">{application.aiResult.judgmentRationale.summary}</p>
                                    </div>
                                  </div>
                                )}

                                {/* 법적 근거 */}
                                {application.aiResult?.judgmentRationale && (
                                  <div className="flex items-start gap-2">
                                    <Scale className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                                    <div>
                                      <h4 className="text-sm font-semibold text-emerald-800">법적 근거</h4>
                                      <p className="mt-1 text-sm leading-relaxed text-emerald-700">{application.aiResult.judgmentRationale.legalBasis}</p>
                                    </div>
                                  </div>
                                )}

                                {/* 적용 기준 */}
                                {application.aiResult?.judgmentRationale?.appliedCriteria && (
                                  <div className="flex items-start gap-2">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                                    <div>
                                      <h4 className="text-sm font-semibold text-emerald-800">적용 기준</h4>
                                      <ul className="mt-1 space-y-1">
                                        {application.aiResult.judgmentRationale.appliedCriteria.map((criteria, cIdx) => (
                                          <li key={cIdx} className="flex items-start gap-1.5 text-sm text-emerald-700">
                                            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500" />
                                            <span>{criteria}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                )}

                                {/* 상세 분석 */}
                                {application.aiResult?.judgmentRationale?.detailedExplanation && (
                                  <div className="flex items-start gap-2">
                                    <FileText className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                                    <div>
                                      <h4 className="text-sm font-semibold text-emerald-800">상세 분석</h4>
                                      <pre className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-emerald-700 bg-white/50 p-2 rounded">
                                        {application.aiResult.judgmentRationale.detailedExplanation}
                                      </pre>
                                    </div>
                                  </div>
                                )}

                                {/* 수동 확인 항목 */}
                                {application.aiResult?.judgmentRationale?.manualCheckItems && application.aiResult.judgmentRationale.manualCheckItems.length > 0 && (
                                  <div className="flex items-start gap-2">
                                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                                    <div>
                                      <h4 className="text-sm font-semibold text-emerald-800">수동 확인 항목</h4>
                                      <ul className="mt-1 space-y-1">
                                        {application.aiResult.judgmentRationale.manualCheckItems.map((item, mIdx) => (
                                          <li key={mIdx} className="flex items-center gap-1.5 text-sm text-amber-700">
                                            <span className="mt-0.5 h-1 w-1 shrink-0 rounded-full bg-amber-500" />
                                            <span>{item}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                )}

                                {/* 판정 기준 충족 여부 */}
                                {application.aiResult?.criteriaChecks && application.aiResult.criteriaChecks.length > 0 && (
                                  <div className="rounded-lg bg-white/60 p-3 border border-emerald-200">
                                    <p className="text-xs font-medium text-emerald-700 mb-2">판정 기준 충족 여부</p>
                                    <div className="space-y-2">
                                      {application.aiResult.criteriaChecks.map((check, cIdx) => (
                                        <div key={cIdx} className="flex items-center justify-between text-sm">
                                          <span className="text-emerald-700">{check.criteriaName}</span>
                                          <Badge 
                                            variant={check.isMet ? "default" : "destructive"} 
                                            className={`text-xs ${check.isMet ? "bg-emerald-600" : ""}`}
                                          >
                                            {check.isMet ? "충족" : "미충족"}
                                          </Badge>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* 안내 문구 */}
                                <div className="flex items-start gap-2 pt-2 border-t border-emerald-200">
                                  <Info className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" />
                                  <p className="text-xs text-emerald-600">
                                    AI 판독 결과는 참고용이며, 최종 판정은 담당자 검토에 따라 결정됩니다.
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                  
                  {/* 필지별 분석 결과 */}
                  <Accordion type="multiple" className="space-y-3">
                    {allLands.map((land, idx) => {
                      const landResult = landAIResults[land.id];
                      // 민원인이 실행한 AI 분석 결과 (application.aiResult 직접 사용)
                      const aiResult = application.aiResult;
                      return (
                        <AccordionItem 
                          key={land.id}
                          value={land.id}
                          className={`rounded-lg border px-4 ${
                            landResult?.provisionalJudgment === "매수"
                              ? "border-emerald-200 bg-emerald-50/50"
                              : landResult?.provisionalJudgment === "매수불가"
                                ? "border-red-200 bg-red-50/50"
                                : "border-slate-200 bg-slate-50/50"
                          }`}
                        >
                          <AccordionTrigger className="hover:no-underline py-3">
                            <div className="flex items-center justify-between w-full pr-2">
                              <div className="flex items-center gap-2">
                                <div className="text-left">
                                  <p className="font-medium text-sm">{land.address}</p>
                                  <p className="text-xs text-muted-foreground">{land.landType} | {land.landCategory}</p>
                                </div>
                              </div>
                              {/* 필지별 매수/불매수 Badge 표시 */}
                              {landResult && (
                                <Badge className={`ml-2 ${
                                  landResult.provisionalJudgment === "매수" ? "bg-emerald-600" : "bg-red-500"
                                }`}>
                                  {landResult.provisionalJudgment}
                                </Badge>
                              )}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pb-4">
                            {/* 기본 정보 */}
                            <div className="grid grid-cols-3 gap-3 text-sm mb-4">
                              <div className="rounded bg-white/80 p-2 text-center">
                                <p className="text-xs text-muted-foreground">잔여 면적</p>
                                <p className="font-semibold">{land.remainingArea.toLocaleString()}m²</p>
                              </div>
                              <div className="rounded bg-white/80 p-2 text-center">
                                <p className="text-xs text-muted-foreground">잔여 비율</p>
                                <p className="font-semibold">{land.remainingRatio}%</p>
                              </div>
                              <div className="rounded bg-white/80 p-2 text-center">
                                <p className="text-xs text-muted-foreground">형상지수 변화</p>
                                <p className="font-semibold">
                                  {landResult?.shapeIndexChange != null ? `+${landResult.shapeIndexChange.toFixed(1)}` : "-"}
                                </p>
                              </div>
                            </div>

                            {/* 편입 정보 */}
                            <div className="rounded-lg bg-white/60 p-3 border mb-4">
                              <p className="text-xs font-medium text-muted-foreground mb-2">편입 정보</p>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="text-muted-foreground">편입 전 면적:</span>
                                  <span className="ml-1 font-medium">{land.originalArea.toLocaleString()}m²</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">편입 면적:</span>
                                  <span className="ml-1 font-medium">{land.includedArea.toLocaleString()}m²</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">잔여 면적:</span>
                                  <span className="ml-1 font-medium">{land.remainingArea.toLocaleString()}m² ({land.remainingRatio}%)</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">형상지수 변화:</span>
                                  <span className="ml-1 font-medium">{landResult?.shapeIndexChange != null ? `+${landResult.shapeIndexChange.toFixed(1)}` : "-"}</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* 일단지 또는 부분 일단지 그룹에 속한 경우 안내 문구 */}
                            {(() => {
                              const landJudgment = application.aiResult?.landJudgments?.find(lj => lj.landId === land.id);
                              const isInUnifiedGroup = applicationType === "unified" || landJudgment?.unifiedGroupId;
                              if (!isInUnifiedGroup) return null;
                              return (
                                <div className="flex items-start gap-2 pt-3 mt-3 border-t text-blue-600">
                                  <Info className="mt-0.5 h-3 w-3 shrink-0" />
                                  <p className="text-xs">
                                    이 필지는 일단지로 판정���었��니다. 상세 분석 결과는 상단의 일단지 판정 결과를 참조하세요.
                                  </p>
                                </div>
                              );
                            })()}
                            
                            {/* 상세 분석 내용 - 개별 필지인 경우에만 표시 (일단지는 상단에 통합 표시) */}
                            {(() => {
                              const landJudgment = application.aiResult?.landJudgments?.find(lj => lj.landId === land.id);
                              const isInUnifiedGroup = applicationType === "unified" || landJudgment?.unifiedGroupId;
                              return !isInUnifiedGroup;
                            })() && (
                              <div className="space-y-4">
                                {/* 판단 요약 */}
                                {landResult?.judgmentRationale && (
                                  <div className="flex items-start gap-2">
                                    <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                    <div>
                                      <h4 className="text-sm font-semibold text-foreground">판단 요약</h4>
                                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{landResult.judgmentRationale.summary}</p>
                                    </div>
                                  </div>
                                )}

                                {/* 법적 근거 */}
                                {landResult?.judgmentRationale && (
                                  <div className="flex items-start gap-2">
                                    <Scale className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                                    <div>
                                      <h4 className="text-sm font-semibold text-foreground">법적 근거</h4>
                                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{landResult.judgmentRationale.legalBasis}</p>
                                    </div>
                                  </div>
                                )}

                                {/* 적용 기준 */}
                                {landResult?.judgmentRationale?.appliedCriteria && (
                                  <div className="flex items-start gap-2">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                    <div>
                                      <h4 className="text-sm font-semibold text-foreground">적용 기준</h4>
                                      <ul className="mt-1 space-y-1">
                                        {landResult.judgmentRationale.appliedCriteria.map((criteria, cIdx) => (
                                          <li key={cIdx} className="flex items-start gap-1.5 text-sm text-muted-foreground">
                                            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                                            <span>{criteria}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                )}

                                {/* 수동 확인 항목 */}
                                {landResult?.judgmentRationale?.manualCheckItems && landResult.judgmentRationale.manualCheckItems.length > 0 && (
                                  <div className="flex items-start gap-2">
                                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                                    <div>
                                      <h4 className="text-sm font-semibold text-foreground">수동 확인 항목</h4>
                                      <ul className="mt-1 space-y-1">
                                        {landResult.judgmentRationale.manualCheckItems.map((item, mIdx) => (
                                          <li key={mIdx} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                            <span className="mt-0.5 h-1 w-1 shrink-0 rounded-full bg-amber-500" />
                                            <span>{item}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                )}

                                {/* 상세 분석 */}
                                {landResult?.judgmentRationale?.detailedExplanation && (
                                  <div className="flex items-start gap-2">
                                    <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                    <div>
                                      <h4 className="text-sm font-semibold text-foreground">�����세 분석</h4>
                                      <pre className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                                        {landResult.judgmentRationale.detailedExplanation}
                                      </pre>
                                    </div>
                                  </div>
                                )}
                                
                                {/* 판정 기준 충족 여부 */}
                                {landResult?.criteriaChecks && landResult.criteriaChecks.length > 0 && (
                                  <div className="rounded-lg bg-white/60 p-3 border">
                                    <p className="text-xs font-medium text-muted-foreground mb-2">판정 기준 충족 여부</p>
                                    <div className="space-y-2">
                                      {landResult.criteriaChecks.map((check, cIdx) => (
                                        <div key={cIdx} className="flex items-center justify-between text-sm">
                                          <span className="text-muted-foreground">{check.criteriaName}</span>
                                          <Badge 
                                            variant={check.isMet ? "default" : "destructive"} 
                                            className={`text-xs ${check.isMet ? "bg-emerald-600" : ""}`}
                                          >
                                            {check.isMet ? "충족" : "미충족"}
                                          </Badge>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* 안내 문구 */}
                                <div className="flex items-start gap-2 pt-2 border-t">
                                  <Info className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
                                  <p className="text-xs text-muted-foreground">
                                    AI 판독 결과는 참고용이며, 최종 판정은 담당자 검토에 따라 결정됩니다.
                                  </p>
                                </div>
                              </div>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* 담당자 결과 탭 */}
            <TabsContent value="admin">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* 좌측: 지적도 + 필지 리스트 */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">지적도</h4>
                    <Badge variant="outline" className="font-normal">
                      {allLands.length}필지
                    </Badge>
                  </div>
                  
                  {/* 지적도 */}
                  <div className="relative h-[450px] rounded-lg overflow-hidden border">
                    {/* 지적도 */}
                    <div className="absolute inset-0">
                    <LeafletMap
                      parcels={(() => {
                        const applicationParcels = allLands.map((land, idx) => {
                          const baseLat = 37.2180 + (idx * 0.0008);
                          const baseLng = 127.2950 + (idx * 0.0005);
                          const offset = 0.0003;
                          
                          return {
                            id: land.id,
                            address: land.address,
                            isIncluded: true,
                            isOwned: adminCheckedLandIds.includes(land.id),
                            coordinates: [
                              { lat: baseLat, lng: baseLng },
                              { lat: baseLat, lng: baseLng + offset * 1.2 },
                              { lat: baseLat + offset, lng: baseLng + offset * 1.2 },
                              { lat: baseLat + offset, lng: baseLng },
                            ],
                          };
                        });
                        
return applicationParcels;
                      })()}
                      selectedParcelIds={new Set(adminCheckedLandIds)}
                      onParcelClick={(parcelId) => {
                        if (adminCheckedLandIds.includes(parcelId)) {
                          setAdminCheckedLandIds(prev => prev.filter(id => id !== parcelId));
                        } else {
                          setAdminCheckedLandIds(prev => [...prev, parcelId]);
                        }
                        const landIdx = allLands.findIndex(l => l.id === parcelId);
                        if (landIdx !== -1) {
                          setSelectedLandIndex(landIdx);
                        }
                      }}
                      hoveredParcelId={hoveredLandId}
                      onParcelHover={(parcelId) => setHoveredLandId(parcelId)}
                      focusedParcelId={focusedLandId}
                      zoom={18}
                    />
                    </div>
                  </div>
                  
                  {/* 지도 범례 */}
                  <div className="rounded-lg border bg-white/80 p-2">
                    <p className="text-xs font-medium text-muted-foreground mb-2">범례</p>
                    <div className="flex flex-wrap gap-3 text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="h-3 w-3 rounded-sm border-2 border-[#6b7280] bg-[#f3f4f6]" />
                        <span>신청 필지</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="h-3 w-3 rounded-sm border-2 border-[#16a34a] bg-[#bbf7d0]" />
                        <span className="text-emerald-700 font-medium">선택된 필지</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* 필지 리스트 (체크박스 + 지도 연동) */}
                  <div className="rounded-lg border bg-white">
                    {/* 헤더 */}
                    <div className="flex items-center justify-between border-b bg-muted/30 px-3 py-2">
                      <span className="text-sm font-medium flex items-center gap-1.5">
                        <ListChecks className="h-3.5 w-3.5" />
                        필지 목록
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => setAdminCheckedLandIds(allLands.map(l => l.id))}
                        >
                          전체 선택
                        </Button>
                        {adminCheckedLandIds.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs text-muted-foreground"
                            onClick={() => setAdminCheckedLandIds([])}
                          >
                            전체 해제
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {/* 필지 리스트 */}
                    <div className="divide-y max-h-[320px] overflow-y-auto">
                      {allLands.map((land, idx) => {
                        const isSelected = adminCheckedLandIds.includes(land.id);
                        const isHovered = hoveredLandId === land.id;
                        const landResult = adminLandAIResults[land.id];
                        const landOptions = adminAIOptionsPerLand[land.id] || { accessRoadLost: false, waterChannelLost: false, farmMachineDifficulty: false };
                        
                        return (
                          <div 
                            key={land.id} 
                            className={`px-3 py-2.5 transition-colors ${
                              isHovered ? "bg-blue-50" :
                              isSelected ? "bg-primary/5 border-l-4 border-l-primary" : 
                              "hover:bg-muted/50"
                            }`}
                            onMouseEnter={() => setHoveredLandId(land.id)}
                            onMouseLeave={() => setHoveredLandId(null)}
                          >
                            {/* 상단: 체크박스 + 필지 정보 */}
                            <div className="flex items-center gap-3">
                              {/* 체크박스 - 독립적인 클릭 영역 */}
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setAdminCheckedLandIds(prev => [...prev, land.id]);
                                  } else {
                                    setAdminCheckedLandIds(prev => prev.filter(id => id !== land.id));
                                  }
                                }}
                                className="h-6 w-6 shrink-0"
                              />
                              
                              {/* 필지 마커 + 정보 (클릭 시 확장/축소 토글) */}
                              <div 
                                className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                                onClick={() => {
                                  // 같은 필지 클릭 시 닫기, 다른 필지 클릭 시 열기
                                  if (focusedLandId === land.id) {
                                    setFocusedLandId(null);
                                  } else {
                                    setSelectedLandIndex(idx);
                                    setFocusedLandId(land.id);
                                  }
                                }}
                              >
                                <span 
                                  className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white shrink-0"
                                  style={{
                                    backgroundColor: isSelected ? "#16a34a" : "#6b7280"
                                  }}
                                >
                                  {String.fromCharCode(65 + idx)}
                                </span>
                                
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{land.address.split(" ").slice(-2).join(" ")}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {land.landType} | 잔여 {land.remainingArea.toLocaleString()}m²
                                  </p>
                                </div>
                              </div>
                              
                              {/* AI 분석 상태 표시 */}
                              {landAnalysisStatus[land.id] === 'analyzing' ? (
                                <Badge variant="outline" className="text-xs shrink-0 border-blue-500 text-blue-700 bg-blue-50 gap-1">
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                  분석중
                                </Badge>
                              ) : landAnalysisStatus[land.id] === 'pending' && isAIAnalyzing ? (
                                <Badge variant="outline" className="text-xs shrink-0 border-gray-300 text-gray-500 bg-gray-50">
                                  대기중
                                </Badge>
                              ) : landResult?.provisionalJudgment ? (
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs shrink-0 ${
                                    landResult.provisionalJudgment === "매수" ? "border-emerald-500 text-emerald-700 bg-emerald-50" : 
                                    landResult.provisionalJudgment === "매수불가" ? "border-red-500 text-red-700 bg-red-50" : 
                                    "border-amber-500 text-amber-700 bg-amber-50"
                                  }`}
                                >
                                  {landResult.provisionalJudgment}
                                </Badge>
                              ) : null}
                              
                              {/* 아코디언 화살표 아이콘 */}
                              <div 
                                className="shrink-0 ml-2 cursor-pointer p-1 hover:bg-muted rounded"
                                onClick={() => {
                                  if (focusedLandId === land.id) {
                                    setFocusedLandId(null);
                                  } else {
                                    setSelectedLandIndex(idx);
                                    setFocusedLandId(land.id);
                                  }
                                }}
                              >
                                {focusedLandId === land.id ? (
                                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                            </div>
                            
                            {/* AI 분석 진행 단계 상세 (분석중일 때만 표시) */}
                            {landAnalysisStatus[land.id] === 'analyzing' && (
                              <div className="mt-2 ml-7 p-2 rounded-lg bg-blue-50/50 border border-blue-100">
                                <div className="space-y-1.5">
                                  {[
                                    { step: 1, label: "형상지수 계산" },
                                    { step: 2, label: "면적 비율 분석" },
                                    { step: 3, label: "법적 기준 검토" },
                                    { step: 4, label: "종합 판정" },
                                    { step: 5, label: "결과 저장" },
                                  ].map((item) => {
                                    const currentStep = landAnalysisStep[land.id] || 0;
                                    const isActive = currentStep === item.step;
                                    const isDone = currentStep > item.step;
                                    return (
                                      <div key={item.step} className="flex items-center gap-2 text-xs">
                                        {isDone ? (
                                          <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                                        ) : isActive ? (
                                          <Loader2 className="h-3.5 w-3.5 text-blue-600 animate-spin" />
                                        ) : (
                                          <div className="h-3.5 w-3.5 rounded-full border border-gray-300" />
                                        )}
                                        <span className={isDone ? "text-blue-600" : isActive ? "text-blue-700 font-medium" : "text-gray-400"}>
                                          {item.label}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                            
                            {/* 하단: 필지 상세 옵션 (포커스된 필지만 표시 - 아코디언 토글) */}
                            {focusedLandId === land.id && (
                              <div className="mt-3 ml-7 space-y-3 border-t pt-3">
                                {/* 현재 활용 지목 */}
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <label className="text-xs font-medium text-foreground">
                                      현재 활용 지목 <span className="text-destructive">*</span>
                                    </label>
                                    <span className="text-xs text-muted-foreground">
                                      공부상 지목: <span className="font-medium text-foreground">{land.landType}</span>
                                    </span>
                                  </div>
                                  <Select 
                                    value={adminCurrentUsagePerLand[land.id] || ""} 
                                    onValueChange={(value) => setAdminCurrentUsagePerLand(prev => ({ ...prev, [land.id]: value }))}
                                  >
                                    <SelectTrigger className="h-8 bg-background text-sm">
                                      <SelectValue placeholder="현재 활용 지목을 선택해 주세요" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="대">대 (택지)</SelectItem>
                                      <SelectItem value="전">전 (밭)</SelectItem>
                                      <SelectItem value="답">답 (논)</SelectItem>
                                      <SelectItem value="임">임 (임야)</SelectItem>
                                      <SelectItem value="잡">잡 (잡종지)</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <p className="text-[10px] text-muted-foreground">실제 토지 활용 상황에 따라 선택해 주세요.</p>
                                </div>
                                
                                {/* 건축물 용도 ��택 - 현재 활용 지목이 "대"인 경우만 표시 */}
                                {adminCurrentUsagePerLand[land.id] === "대" && (
                                  <div className="space-y-1.5 rounded bg-muted/30 p-2">
                                    <label className="text-xs font-medium text-foreground">
                                      건축물 용도 선택 <span className="text-destructive">*</span>
                                    </label>
                                    <Select 
                                      value={adminLandSubTypePerLand[land.id] || ""} 
                                      onValueChange={(value) => setAdminLandSubTypePerLand(prev => ({ ...prev, [land.id]: value }))}
                                    >
                                      <SelectTrigger className="h-8 bg-background text-sm">
                                        <SelectValue placeholder="건축물 용도를 선택해 주세요" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="residential-detached">주거용 - 단독주택 (기준: 90㎡)</SelectItem>
                                        <SelectItem value="residential-multi">주거용 - 연립/다세대 (기준: 165㎡)</SelectItem>
                                        <SelectItem value="residential-apartment">주거용 - 아파트 (기준: 60㎡)</SelectItem>
                                        <SelectItem value="commercial">상업용 (기준: 150㎡)</SelectItem>
                                        <SelectItem value="industrial">공업용 (기준: 330㎡)</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                )}
                                
                                {/* 현장확인 옵션 */}
                                <div className="space-y-1.5">
                                  <span className="text-xs text-muted-foreground font-medium">현장확인:</span>
                                  <div className="flex flex-col gap-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <Checkbox 
                                        checked={landOptions.farmMachineDifficulty}
                                        onCheckedChange={(checked) => updateLandOption(land.id, 'farmMachineDifficulty', checked === true)}
                                        className="h-[18px] w-[18px]"
                                      />
                                      <span className="text-xs">농기계 곤란</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <Checkbox 
                                        checked={landOptions.accessRoadLost}
                                        onCheckedChange={(checked) => updateLandOption(land.id, 'accessRoadLost', checked === true)}
                                        className="h-[18px] w-[18px]"
                                      />
                                      <span className="text-xs">접면도로 상실</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <Checkbox 
                                        checked={landOptions.waterChannelLost}
                                        onCheckedChange={(checked) => updateLandOption(land.id, 'waterChannelLost', checked === true)}
                                        className="h-[18px] w-[18px]"
                                      />
                                      <span className="text-xs">관개수로 상실</span>
                                    </label>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* 선택 요약 */}
                    <div className="border-t bg-muted/30 px-3 py-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{adminCheckedLandIds.length}필지 선택됨</span>
                        <span className="font-medium">
                          합계: {allLands.filter(l => adminCheckedLandIds.includes(l.id)).reduce((sum, l) => sum + l.remainingArea, 0).toLocaleString()}m²
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* AI 분석 버튼 */}
                  <Button
                    onClick={handleRunAIAnalysis}
                    disabled={isAIAnalyzing || adminCheckedLandIds.length === 0}
                    className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    {isAIAnalyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        AI 분석 중...
                      </>
                    ) : (
                      <>
                        <AIIcon className="h-4 w-4" />
                        AI 분석 실행 ({adminCheckedLandIds.length}필지)
                      </>
                    )}
                  </Button>
                </div>
                
                {/* 우측: 분석결과 */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">분석결��</h4>
                    {Object.keys(adminLandAIResults).length > 0 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleResetAdminAIResults}
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        title="재분석 결과 ���기화"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  {Object.keys(adminLandAIResults).length === 0 ? (
                    <>
                      {/* 재분석 미실행 안내 */}
                      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 mb-4 flex items-start gap-2">
                        <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                        <p className="text-sm text-blue-700">
                          현재 민원인 결과를 표시���고 있습니다. 좌측에서 현장 상황 옵션을 설정하고 AI 재분�����을 실행하면 담당자 결과가 표시��니다.
                        </p>
                      </div>
                      
                      {/* 일단지인 경우에만 최상단에 일단지 판정 결과 표시 */}
                      {applicationType === "unified" && (
                        <div className="space-y-3 mb-4">
                          {applicationType === "unified" ? (
                            // 전체 일단지
                            <div className="rounded-lg border-2 border-emerald-200 bg-emerald-50/50 p-4">
                              <div className="flex items-center justify-between mb-3">
                                <h5 className="font-medium text-emerald-800 flex items-center gap-2">
                                  <Layers className="h-4 w-4" />
                                  일단지 판정 결과
                                </h5>
                                <Badge className={application.aiResult?.provisionalJudgment === "매수" ? "bg-emerald-600 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-500"}>
                                  {application.aiResult?.provisionalJudgment || "매수"}
                                </Badge>
                              </div>
                              
                              {/* 일단지 조건 체크 */}
                              <div className="grid grid-cols-3 gap-2 mb-3">
                                <div className={`flex items-center gap-1.5 text-xs rounded px-2 py-1 ${
                                  application.unifiedParcelCondition?.sameOwner ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
                                }`}>
                                  {application.unifiedParcelCondition?.sameOwner ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                  소유자 동일
                                </div>
                                <div className={`flex items-center gap-1.5 text-xs rounded px-2 py-1 ${
                                  application.unifiedParcelCondition?.continuous ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
                                }`}>
                                  {application.unifiedParcelCondition?.continuous ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                  지반 연속
                                </div>
                                <div className={`flex items-center gap-1.5 text-xs rounded px-2 py-1 ${
                                  application.unifiedParcelCondition?.sameUsage ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
                                }`}>
                                  {application.unifiedParcelCondition?.sameUsage ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                  용도 일체성
                                </div>
                              </div>

                              {/* 기본 정보 */}
                              <div className="grid grid-cols-3 gap-2 mb-3">
                                <div className="rounded bg-white/80 p-2 text-center">
                                  <p className="text-xs text-muted-foreground">포함 필지</p>
                                  <p className="font-semibold text-sm">{allLands.map((_, idx) => String.fromCharCode(65 + idx)).join(", ")}</p>
                                </div>
                                <div className="rounded bg-white/80 p-2 text-center">
                                  <p className="text-xs text-muted-foreground">합산 잔여면적</p>
                                  <p className="font-semibold text-sm">{allLands.reduce((sum, l) => sum + l.remainingArea, 0).toLocaleString()}m²</p>
                                </div>
                                <div className="rounded bg-white/80 p-2 text-center">
                                  <p className="text-xs text-muted-foreground">형상지수</p>
                                  <p className="font-semibold text-sm">{application.aiResult?.remainingShapeIndex?.toFixed(1) || "-"}</p>
                                </div>
                              </div>

{/* 상세 분석 내용 - 아코디언 UI */}
                              <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="admin-unified-detail" className="border-none">
                                  <AccordionTrigger className="hover:no-underline py-2 px-0">
                                    <span className="text-xs text-emerald-700 font-medium">상세 분석 보기</span>
                                  </AccordionTrigger>
                                  <AccordionContent className="pt-2">
                                    {/* 추가 조건 */}
                                    <div className="flex flex-wrap gap-2 mb-3">
                                      {application.aiResult?.farmMachineDifficulty && (
                                        <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                                          <AlertTriangle className="h-3 w-3" /> 농기계 진입 곤란
                                        </span>
                                      )}
                                      {application.aiResult?.waterChannelLost && (
                                        <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                                          <AlertTriangle className="h-3 w-3" /> 관개수로 상실
                                        </span>
                                      )}
                                      {application.aiResult?.accessRoadLost && (
                                        <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                                          <AlertTriangle className="h-3 w-3" /> 진입로 상실
                                        </span>
                                      )}
                                      {application.aiResult?.isBlindLand && (
                                        <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                                          <AlertTriangle className="h-3 w-3" /> 맹지 발생
                                        </span>
                                      )}
                                    </div>

                                    <div className="space-y-3 pt-3 border-t border-emerald-200">
                                      {/* 판단 요약 */}
                                      {application.aiResult?.judgmentRationale && (
                                        <div className="flex items-start gap-2">
                                          <FileText className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                                          <div>
                                            <h4 className="text-sm font-semibold text-emerald-800">판단 요약</h4>
                                            <p className="mt-1 text-sm leading-relaxed text-emerald-700">{application.aiResult.judgmentRationale.summary}</p>
                                          </div>
                                        </div>
                                      )}

                                      {/* 법적 근거 */}
                                      {application.aiResult?.judgmentRationale && (
                                        <div className="flex items-start gap-2">
                                          <Scale className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                                          <div>
                                            <h4 className="text-sm font-semibold text-emerald-800">법적 근거</h4>
                                            <p className="mt-1 text-sm leading-relaxed text-emerald-700">{application.aiResult.judgmentRationale.legalBasis}</p>
                                          </div>
                                        </div>
                                      )}

                                      {/* 적용 기준 */}
                                      {application.aiResult?.judgmentRationale?.appliedCriteria && (
                                        <div className="flex items-start gap-2">
                                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                                          <div>
                                            <h4 className="text-sm font-semibold text-emerald-800">적용 기준</h4>
                                            <ul className="mt-1 space-y-1">
                                              {application.aiResult.judgmentRationale.appliedCriteria.map((criteria, cIdx) => (
                                                <li key={cIdx} className="flex items-start gap-1.5 text-sm text-emerald-700">
                                                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500" />
                                                  <span>{criteria}</span>
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        </div>
                                      )}

                                      {/* 상세 분석 */}
                                      {application.aiResult?.judgmentRationale?.detailedExplanation && (
                                        <div className="flex items-start gap-2">
                                          <FileText className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                                          <div>
                                            <h4 className="text-sm font-semibold text-emerald-800">상세 분석</h4>
                                            <pre className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-emerald-700 bg-white/50 p-2 rounded">
                                              {application.aiResult.judgmentRationale.detailedExplanation}
                                            </pre>
                                          </div>
                                        </div>
                                      )}

                                      {/* 수동 확인 항목 */}
                                      {application.aiResult?.judgmentRationale?.manualCheckItems && application.aiResult.judgmentRationale.manualCheckItems.length > 0 && (
                                        <div className="flex items-start gap-2">
                                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                                          <div>
                                            <h4 className="text-sm font-semibold text-emerald-800">수동 확인 항목</h4>
                                            <ul className="mt-1 space-y-1">
                                              {application.aiResult.judgmentRationale.manualCheckItems.map((item, mIdx) => (
                                                <li key={mIdx} className="flex items-center gap-1.5 text-sm text-amber-700">
                                                  <span className="mt-0.5 h-1 w-1 shrink-0 rounded-full bg-amber-500" />
                                                  <span>{item}</span>
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        </div>
                                      )}

                                      {/* 판정 기준 충족 여부 */}
                                      {application.aiResult?.criteriaChecks && application.aiResult.criteriaChecks.length > 0 && (
                                        <div className="rounded-lg bg-white/60 p-3 border border-emerald-200">
                                          <p className="text-xs font-medium text-emerald-700 mb-2">판정 기준 충족 여부</p>
                                          <div className="space-y-2">
                                            {application.aiResult.criteriaChecks.map((check, cIdx) => (
                                              <div key={cIdx} className="flex items-center justify-between text-sm">
                                                <span className="text-emerald-700">{check.criteriaName}</span>
                                                <Badge 
                                                  variant={check.isMet ? "default" : "destructive"} 
                                                  className={`text-xs ${check.isMet ? "bg-emerald-600" : ""}`}
                                                >
                                                  {check.isMet ? "충족" : "미충족"}
                                                </Badge>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {/* 안내 문구 */}
                                      <div className="flex items-start gap-2 pt-2 border-t border-emerald-200">
                                        <Info className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" />
                                        <p className="text-xs text-emerald-600">
                                          AI 판독 결과는 참고용이며, 최종 판정은 ���당자 검토에 따라 결정됩니다.
                                        </p>
                                      </div>
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              </Accordion>
                            </div>
                          ) : (
                            // 부분 일단지 (그룹별로 표시)
                            Object.entries(partialUnifiedGroups).map(([groupId, lands]) => {
                              const groupLands = lands.map(lj => {
                                const landIdx = allLands.findIndex(l => l.id === lj.landId);
                                return { ...lj, landIdx, land: allLands[landIdx] };
                              }).filter(l => l.land);
                              const groupJudgment = lands[0]?.judgment || "매수";
                              const totalRemainingArea = groupLands.reduce((sum, l) => sum + (l.land?.remainingArea || 0), 0);
                              return (
                                <div key={groupId} className="rounded-lg border-2 border-emerald-200 bg-emerald-50/50 p-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <h5 className="font-medium text-emerald-800 flex items-center gap-2">
                                      <Layers className="h-4 w-4" />
                                      일단지 판정 결과
                                    </h5>
                                    <Badge className={groupJudgment === "매수" ? "bg-emerald-600 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-500"}>
                                      {groupJudgment}
                                    </Badge>
                                  </div>
                                  
                                  {/* 일단지 조건 체크 */}
                                  <div className="grid grid-cols-3 gap-2 mb-3">
                                    <div className="flex items-center gap-1.5 text-xs rounded px-2 py-1 bg-emerald-100 text-emerald-700">
                                      <CheckCircle2 className="h-3 w-3" />
                                      소유자 동일
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs rounded px-2 py-1 bg-emerald-100 text-emerald-700">
                                      <CheckCircle2 className="h-3 w-3" />
                                      지반 연속
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs rounded px-2 py-1 bg-emerald-100 text-emerald-700">
                                      <CheckCircle2 className="h-3 w-3" />
                                      용도 일체성
                                    </div>
                                  </div>

                                  {/* 기본 정보 */}
                                  <div className="grid grid-cols-3 gap-2 mb-3">
                                    <div className="rounded bg-white/80 p-2 text-center">
                                      <p className="text-xs text-muted-foreground">포함 필지</p>
                                      <p className="font-semibold text-sm">{groupLands.map(l => String.fromCharCode(65 + l.landIdx)).join(", ")}</p>
                                    </div>
                                    <div className="rounded bg-white/80 p-2 text-center">
                                      <p className="text-xs text-muted-foreground">합산 잔여면적</p>
                                      <p className="font-semibold text-sm">{totalRemainingArea.toLocaleString()}m²</p>
                                    </div>
                                    <div className="rounded bg-white/80 p-2 text-center">
                                      <p className="text-xs text-muted-foreground">형상지수</p>
                                      <p className="font-semibold text-sm">{application.aiResult?.remainingShapeIndex?.toFixed(1) || "5.0"}</p>
                                    </div>
                                  </div>

                                  {/* 추가 조�� */}
                                  <div className="flex flex-wrap gap-2 mb-3">
                                    {application.aiResult?.farmMachineDifficulty && (
                                      <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                                        <AlertTriangle className="h-3 w-3" /> 농기계 진입 곤란
                                      </span>
                                    )}
                                    {application.aiResult?.waterChannelLost && (
                                      <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                                        <AlertTriangle className="h-3 w-3" /> 관개수로 상실
                                      </span>
                                    )}
                                    {application.aiResult?.accessRoadLost && (
                                      <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                                        <AlertTriangle className="h-3 w-3" /> 진입로 상실
                                      </span>
                                    )}
                                  </div>

                                  {/* 상세 분석 내용 */}
                                  <div className="space-y-3 mt-4 pt-3 border-t border-emerald-200">
                                    {/* 판단 요약 */}
                                    {application.aiResult?.judgmentRationale && (
                                      <div className="flex items-start gap-2">
                                        <FileText className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                                        <div>
                                          <h4 className="text-sm font-semibold text-emerald-800">판단 요약</h4>
                                          <p className="mt-1 text-sm leading-relaxed text-emerald-700">{application.aiResult.judgmentRationale.summary}</p>
                                        </div>
                                      </div>
                                    )}

                                    {/* 법적 근거 */}
                                    {application.aiResult?.judgmentRationale && (
                                      <div className="flex items-start gap-2">
                                        <Scale className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                                        <div>
                                          <h4 className="text-sm font-semibold text-emerald-800">법적 근거</h4>
                                          <p className="mt-1 text-sm leading-relaxed text-emerald-700">{application.aiResult.judgmentRationale.legalBasis}</p>
                                        </div>
                                      </div>
                                    )}

                                    {/* 적용 기준 */}
                                    {application.aiResult?.judgmentRationale?.appliedCriteria && (
                                      <div className="flex items-start gap-2">
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                                        <div>
                                          <h4 className="text-sm font-semibold text-emerald-800">적용 기준</h4>
                                          <ul className="mt-1 space-y-1">
                                            {application.aiResult.judgmentRationale.appliedCriteria.map((criteria, cIdx) => (
                                              <li key={cIdx} className="flex items-start gap-1.5 text-sm text-emerald-700">
                                                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500" />
                                                <span>{criteria}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      </div>
                                    )}

                                    {/* 상세 분석 */}
                                    {application.aiResult?.judgmentRationale?.detailedExplanation && (
                                      <div className="flex items-start gap-2">
                                        <FileText className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                                        <div>
                                          <h4 className="text-sm font-semibold text-emerald-800">상세 분석</h4>
                                          <pre className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-emerald-700 bg-white/50 p-2 rounded">
                                            {application.aiResult.judgmentRationale.detailedExplanation}
                                          </pre>
                                        </div>
                                      </div>
                                    )}

                                    {/* 수동 확인 항목 */}
                                    {application.aiResult?.judgmentRationale?.manualCheckItems && application.aiResult.judgmentRationale.manualCheckItems.length > 0 && (
                                      <div className="flex items-start gap-2">
                                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                                        <div>
                                          <h4 className="text-sm font-semibold text-emerald-800">수동 확인 항목</h4>
                                          <ul className="mt-1 space-y-1">
                                            {application.aiResult.judgmentRationale.manualCheckItems.map((item, mIdx) => (
                                              <li key={mIdx} className="flex items-center gap-1.5 text-sm text-amber-700">
                                                <span className="mt-0.5 h-1 w-1 shrink-0 rounded-full bg-amber-500" />
                                                <span>{item}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      </div>
                                    )}

                                    {/* 판정 기준 충족 여부 */}
                                    {application.aiResult?.criteriaChecks && application.aiResult.criteriaChecks.length > 0 && (
                                      <div className="rounded-lg bg-white/60 p-3 border border-emerald-200">
                                        <p className="text-xs font-medium text-emerald-700 mb-2">판정 기준 충족 여부</p>
                                        <div className="space-y-2">
                                          {application.aiResult.criteriaChecks.map((check, cIdx) => (
                                            <div key={cIdx} className="flex items-center justify-between text-sm">
                                              <span className="text-emerald-700">{check.criteriaName}</span>
                                              <Badge 
                                                variant={check.isMet ? "default" : "destructive"} 
                                                className={`text-xs ${check.isMet ? "bg-emerald-600" : ""}`}
                                              >
                                                {check.isMet ? "충족" : "미충족"}
                                              </Badge>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* 안내 문구 */}
                                    <div className="flex items-start gap-2 pt-2 border-t border-emerald-200">
                                      <Info className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" />
                                      <p className="text-xs text-emerald-600">
                                        AI 판독 결과는 참고용이며, 최종 판정은 담당자 검토에 따라 결정됩니다.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                      
                      {/* 민원인 결과를 기본으로 표시 */}
                      <Accordion type="multiple" defaultValue={[]} className="space-y-3 max-h-[550px] overflow-y-auto pb-4">
                        {allLands.map((land, idx) => {
                          const landResult = landAIResults[land.id];
                          const landJudgment = application.aiResult?.landJudgments?.find(lj => lj.landId === land.id);
                          const isInUnifiedGroup = applicationType === "unified" || landJudgment?.unifiedGroupId;
                          return (
                            <AccordionItem 
                              key={land.id}
                              value={land.id}
                              className={`rounded-lg border px-4 ${
                                isInUnifiedGroup
                                  ? "border-blue-200 bg-blue-50/50"
                                  : landResult?.provisionalJudgment === "매수"
                                    ? "border-emerald-200 bg-emerald-50/50"
                                    : landResult?.provisionalJudgment === "매수불가"
                                      ? "border-red-200 bg-red-50/50"
                                      : "border-slate-200 bg-slate-50/50"
                              }`}
                            >
                              <AccordionTrigger className="hover:no-underline py-3">
                                <div className="flex items-center justify-between w-full pr-2">
                                  <div className="flex items-center gap-2">
                                    <div className="text-left">
                                      <p className="font-medium text-sm">{land.address}</p>
                                      <p className="text-xs text-muted-foreground">{land.landType} | {land.landCategory}</p>
                                    </div>
                                  </div>
                                  {landResult && (
                                    <Badge className={`ml-2 ${
                                      landResult.provisionalJudgment === "매수" ? "bg-emerald-600" : "bg-red-500"
                                    }`}>
                                      {landResult.provisionalJudgment}
                                    </Badge>
                                  )}
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="pb-4">
                                {/* 일단지 그룹에 속한 필지는 안내 메시지만 표시 */}
                                {isInUnifiedGroup ? (
                                  <div className="flex items-start gap-2 text-blue-600">
                                    <Info className="mt-0.5 h-4 w-4 shrink-0" />
                                    <p className="text-sm">
                                      이 필지는 일단지로 판정되었습니다. 상세 분석 결과는 상단의 일단지 판정 결과를 참조하세요.
                                    </p>
                                  </div>
                                ) : (
                                  <>
                                    {/* 기본 정보 */}
                                    <div className="grid grid-cols-3 gap-3 text-sm mb-4">
                                      <div className="rounded bg-white/80 p-2 text-center">
                                        <p className="text-xs text-muted-foreground">잔여 면적</p>
                                        <p className="font-semibold">{land.remainingArea.toLocaleString()}m²</p>
                                      </div>
                                      <div className="rounded bg-white/80 p-2 text-center">
                                        <p className="text-xs text-muted-foreground">잔여 비율</p>
                                        <p className="font-semibold">{land.remainingRatio}%</p>
                                      </div>
                                      <div className="rounded bg-white/80 p-2 text-center">
                                        <p className="text-xs text-muted-foreground">형상지수 변화</p>
                                        <p className="font-semibold">
                                          {landResult?.shapeIndexChange != null ? `+${landResult.shapeIndexChange.toFixed(1)}` : "-"}
                                        </p>
                                      </div>
                                    </div>

                                    {/* 편입 정보 */}
                                    <div className="rounded-lg bg-white/60 p-3 border mb-4">
                                      <p className="text-xs font-medium text-muted-foreground mb-2">편입 정보</p>
                                      <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                          <span className="text-muted-foreground">편입 전 면적:</span>
                                          <span className="ml-1 font-medium">{land.originalArea.toLocaleString()}m²</span>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground">편입 면적:</span>
                                          <span className="ml-1 font-medium">{land.includedArea.toLocaleString()}m²</span>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground">잔여 면적:</span>
                                          <span className="ml-1 font-medium">{land.remainingArea.toLocaleString()}m² ({land.remainingRatio}%)</span>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground">형상지수 변화:</span>
                                          <span className="ml-1 font-medium">{landResult?.shapeIndexChange != null ? `+${landResult.shapeIndexChange.toFixed(1)}` : "-"}</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* 상세 분석 내용 */}
                                    <div className="space-y-4">
                                      {/* 판단 요약 */}
                                      {landResult?.judgmentRationale && (
                                        <div className="flex items-start gap-2">
                                          <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                          <div>
                                            <h4 className="text-sm font-semibold text-foreground">판단 요약</h4>
                                            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{landResult.judgmentRationale.summary}</p>
                                          </div>
                                        </div>
                                      )}

                                      {/* 법적 근거 */}
                                      {landResult?.judgmentRationale && (
                                        <div className="flex items-start gap-2">
                                          <Scale className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                                          <div>
                                            <h4 className="text-sm font-semibold text-foreground">법적 근거</h4>
                                            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{landResult.judgmentRationale.legalBasis}</p>
                                          </div>
                                        </div>
                                      )}

                                      {/* 적용 기준 */}
                                      {landResult?.judgmentRationale && (
                                        <div className="flex items-start gap-2">
                                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                          <div>
                                            <h4 className="text-sm font-semibold text-foreground">적용 기준</h4>
                                            <ul className="mt-1 space-y-1">
                                              {landResult.judgmentRationale.appliedCriteria.map((criteria, cIdx) => (
                                                <li key={cIdx} className="flex items-start gap-1.5 text-sm text-muted-foreground">
                                                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                                                  <span>{criteria}</span>
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        </div>
                                      )}

                                      {/* 수동 확인 항목 */}
                                      {landResult?.judgmentRationale?.manualCheckItems && landResult.judgmentRationale.manualCheckItems.length > 0 && (
                                        <div className="flex items-start gap-2">
                                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                                          <div>
                                            <h4 className="text-sm font-semibold text-foreground">수동 확��� 항목</h4>
                                            <ul className="mt-1 space-y-1">
                                              {landResult.judgmentRationale.manualCheckItems.map((item, mIdx) => (
                                                <li key={mIdx} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                  <span className="mt-0.5 h-1 w-1 shrink-0 rounded-full bg-amber-500" />
                                                  <span>{item}</span>
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        </div>
                                      )}

                                      {/* 상세 분석 */}
                                      {landResult?.judgmentRationale?.detailedExplanation && (
                                        <div className="flex items-start gap-2">
                                          <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                          <div>
                                            <h4 className="text-sm font-semibold text-foreground">상세 분석</h4>
                                            <pre className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                                              {landResult.judgmentRationale.detailedExplanation}
                                            </pre>
                                          </div>
                                        </div>
                                      )}
                                      
                                      {/* 판정 기준 충족 여부 */}
                                      {landResult?.criteriaChecks && landResult.criteriaChecks.length > 0 && (
                                        <div className="rounded-lg bg-white/60 p-3 border">
                                          <p className="text-xs font-medium text-muted-foreground mb-2">판정 기준 충족 여부</p>
                                          <div className="space-y-2">
                                            {landResult.criteriaChecks.map((check, cIdx) => (
                                              <div key={cIdx} className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">{check.criteriaName}</span>
                                                <Badge 
                                                  variant={check.isMet ? "default" : "destructive"} 
                                                  className={`text-xs ${check.isMet ? "bg-emerald-600" : ""}`}
                                                >
                                                  {check.isMet ? "충족" : "미충족"}
                                                </Badge>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {/* 안내 문구 */}
                                      <div className="flex items-start gap-2 pt-2 border-t">
                                        <Info className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
                                        <p className="text-xs text-muted-foreground">
                                          AI 판독 결과는 참고용��며, 최종 판정은 담당자 검토�� 따라 결정됩니다.
                                        </p>
                                      </div>
                                    </div>
                                  </>
                                )}
                              </AccordionContent>
                            </AccordionItem>
                          );
                        })}
                      </Accordion>
                    </>
                  ) : (
                    <>
                      {/* 분석 프로세스 보기 버튼 */}
                      <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={() => setShowAnalysisFlow(true)}
                      >
                        <PlayCircle className="h-4 w-4" />
                        분석 프로세스 상세 보기
                      </Button>
                      
                      {/* 적용된 옵션 - 필지별 현장 상황 옵�� 표시 */}
                      {allLands.map((land, idx) => {
                        const landOptions = adminAIOptionsPerLand[land.id] || { accessRoadLost: false, waterChannelLost: false, farmMachineDifficulty: false };
                        if (!landOptions.accessRoadLost && !landOptions.waterChannelLost && !landOptions.farmMachineDifficulty) {
                          return null;
                        }
                        return (
                          <div key={land.id} className="rounded-lg bg-blue-50 border border-blue-200 p-3">
                            <p className="text-xs font-medium text-blue-700 mb-2">{String.fromCharCode(65 + idx)}: 적용된 현장 상황 옵션</p>
                            <div className="flex flex-wrap gap-2">
                              {landOptions.accessRoadLost && <Badge className="bg-blue-600">접면도로 상실</Badge>}
                              {landOptions.waterChannelLost && <Badge className="bg-blue-600">관개수로 상실</Badge>}
                              {landOptions.farmMachineDifficulty && <Badge className="bg-blue-600">농기계 진입 곤란</Badge>}
                            </div>
                          </div>
                        );
                      })}
                      
{/* 신청 유형별 재분석 결과 */}
                      
                      {/* 일단지 신청: 통합 분석 결과 */}
                      {applicationType === "unified" && (
                        <div className="rounded-lg border-2 border-emerald-200 bg-emerald-50/50 p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-emerald-800 flex items-center gap-2">
                              <Layers className="h-4 w-4" />
                              일단지 통합 분석 결과
                            </h4>
                            {Object.values(adminLandAIResults)[0] && (
                              <Badge className={Object.values(adminLandAIResults)[0].provisionalJudgment === "매수" ? "bg-emerald-600" : "bg-red-500"}>
                                {Object.values(adminLandAIResults)[0].provisionalJudgment}
                              </Badge>
                            )}
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">포함 필지</span>
                              <span className="font-medium">{allLands.length}필지</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">합산 면적</span>
                              <span className="font-medium">{allLands.reduce((sum, l) => sum + l.remainingArea, 0).toLocaleString()}m²</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">일단지 기준</span>
                              <Badge variant="outline" className="border-emerald-400 text-emerald-700">충족</Badge>
                            </div>
                          </div>
                          {Object.values(adminLandAIResults)[0]?.reason && (
                            <div className="mt-3 pt-3 border-t border-emerald-200">
                              <p className="text-sm text-emerald-700">
                                <span className="font-medium">판정 사유:</span> {Object.values(adminLandAIResults)[0].reason}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* 필지별 분석 ���과 - 아코디언 UI */}
                      <Accordion type="multiple" defaultValue={[]} className="space-y-3 max-h-[550px] overflow-y-auto pb-4">
                        {Object.entries(adminLandAIResults).map(([landId, result]) => {
                          const land = allLands.find(l => l.id === landId);
                          const landIdx = allLands.findIndex(l => l.id === landId);
                          if (!land) return null;
                          
                          return (
                            <AccordionItem 
                              key={landId}
                              value={landId}
                              className={`rounded-lg border px-4 ${
                                result.provisionalJudgment === "매수"
                                  ? "border-emerald-200 bg-emerald-50/50"
                                  : "border-red-200 bg-red-50/50"
                              }`}
                            >
                              <AccordionTrigger className="hover:no-underline py-3">
                                <div className="flex items-center justify-between w-full pr-2">
                                  <div className="flex items-center gap-2">
                                    <span className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold text-white ${
                                      result.provisionalJudgment === "매수" ? "bg-emerald-600" : "bg-red-500"
                                    }`}>
                                      {String.fromCharCode(65 + landIdx)}
                                    </span>
                                    <div className="text-left">
                                      <p className="font-medium text-sm">{land.address}</p>
                                      <p className="text-xs text-muted-foreground">{land.landType} | {land.landCategory}</p>
                                    </div>
                                  </div>
                                  <Badge className={`ml-2 ${result.provisionalJudgment === "매수" ? "bg-emerald-600" : "bg-red-500"}`}>
                                    {result.provisionalJudgment}
                                  </Badge>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="pb-4">
                                {/* 기본 정보 */}
                                <div className="grid grid-cols-3 gap-3 text-sm mb-4">
                                  <div className="rounded bg-white/80 p-2 text-center">
                                    <p className="text-xs text-muted-foreground">잔여 면적</p>
                                    <p className="font-semibold">{land.remainingArea.toLocaleString()}m²</p>
                                  </div>
                                  <div className="rounded bg-white/80 p-2 text-center">
                                    <p className="text-xs text-muted-foreground">잔여 비율</p>
                                    <p className="font-semibold">{land.remainingRatio}%</p>
                                  </div>
                                  <div className="rounded bg-white/80 p-2 text-center">
                                    <p className="text-xs text-muted-foreground">형상지수 변화</p>
                                    <p className="font-semibold">
                                      {result?.shapeIndexChange != null ? `+${result.shapeIndexChange.toFixed(1)}` : "-"}
                                    </p>
                                  </div>
                                </div>

                                {/* 편입 정보 */}
                                <div className="rounded-lg bg-white/60 p-3 border mb-4">
                                  <p className="text-xs font-medium text-muted-foreground mb-2">편입 정보</p>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                      <span className="text-muted-foreground">편입 전 면적:</span>
                                      <span className="ml-1 font-medium">{land.originalArea.toLocaleString()}m²</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">편입 면적:</span>
                                      <span className="ml-1 font-medium">{land.includedArea.toLocaleString()}m²</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">잔여 면적:</span>
                                      <span className="ml-1 font-medium">{land.remainingArea.toLocaleString()}m² ({land.remainingRatio}%)</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">형상지수 변화:</span>
                                      <span className="ml-1 font-medium">{result?.shapeIndexChange != null ? `+${result.shapeIndexChange.toFixed(1)}` : "-"}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* 상세 분석 내용 - 민원인 화면과 동일 */}
                                <div className="space-y-4">
                                  {/* 판단 요약 */}
                                  {result.judgmentRationale && (
                                    <div className="flex items-start gap-2">
                                      <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                      <div>
                                        <h4 className="text-sm font-semibold text-foreground">판단 요약</h4>
                                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{result.judgmentRationale.summary}</p>
                                      </div>
                                    </div>
                                  )}

                                  {/* 법적 근거 */}
                                  {result.judgmentRationale && (
                                    <div className="flex items-start gap-2">
                                      <Scale className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                                      <div>
                                        <h4 className="text-sm font-semibold text-foreground">법적 근거</h4>
                                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{result.judgmentRationale.legalBasis}</p>
                                      </div>
                                    </div>
                                  )}

                                  {/* 적용 기준 */}
                                  {result.judgmentRationale && (
                                    <div className="flex items-start gap-2">
                                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                      <div>
                                        <h4 className="text-sm font-semibold text-foreground">적용 기준</h4>
                                        <ul className="mt-1 space-y-1">
                                          {result.judgmentRationale.appliedCriteria.map((criteria, cIdx) => (
                                            <li key={cIdx} className="flex items-start gap-1.5 text-sm text-muted-foreground">
                                              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                                              <span>{criteria}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>
                                  )}

                                  {/* 수동 확인 항목 */}
                                  {result.judgmentRationale?.manualCheckItems && result.judgmentRationale.manualCheckItems.length > 0 && (
                                    <div className="flex items-start gap-2">
                                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                                      <div>
                                        <h4 className="text-sm font-semibold text-foreground">수동 확인 항목</h4>
                                        <ul className="mt-1 space-y-1">
                                          {result.judgmentRationale.manualCheckItems.map((item, mIdx) => (
                                            <li key={mIdx} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                              <span className="mt-0.5 h-1 w-1 shrink-0 rounded-full bg-amber-500" />
                                              <span>{item}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>
                                  )}

                                  {/* 상세 분석 */}
                                  {result.judgmentRationale?.detailedExplanation && (
                                    <div className="flex items-start gap-2">
                                      <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                      <div>
                                        <h4 className="text-sm font-semibold text-foreground">상세 분석</h4>
                                        <pre className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                                          {result.judgmentRationale.detailedExplanation}
                                        </pre>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* 판정 기준 충족 여부 */}
                                  {result.criteriaChecks && result.criteriaChecks.length > 0 && (
                                    <div className="rounded-lg bg-white/60 p-3 border">
                                      <p className="text-xs font-medium text-muted-foreground mb-2">판정 기준 충족 여부</p>
                                      <div className="space-y-2">
                                        {result.criteriaChecks.map((check, cIdx) => (
                                          <div key={cIdx} className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">{check.criteriaName}</span>
                                            <Badge 
                                              variant={check.isMet ? "default" : "destructive"} 
                                              className={`text-xs ${check.isMet ? "bg-emerald-600" : ""}`}
                                            >
                                              {check.isMet ? "충족" : "미충족"}
                                            </Badge>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* 적용된 현장 상황 옵션 - 필지별 */}
                                  {(() => {
                                    const landOptions = adminAIOptionsPerLand[land.id] || { accessRoadLost: false, waterChannelLost: false, farmMachineDifficulty: false };
                                    if (landOptions.accessRoadLost || landOptions.waterChannelLost || landOptions.farmMachineDifficulty) {
                                      return (
                                        <div className="rounded-lg bg-blue-50/80 p-3 border border-blue-200">
                                          <p className="text-xs font-medium text-blue-700 mb-2">적용된 현장 상황</p>
                                          <div className="flex flex-wrap gap-2">
                                            {landOptions.accessRoadLost && <Badge variant="outline" className="border-blue-400 text-blue-700 text-xs">접면도로 상실</Badge>}
                                            {landOptions.waterChannelLost && <Badge variant="outline" className="border-blue-400 text-blue-700 text-xs">관개수로 상실</Badge>}
                                            {landOptions.farmMachineDifficulty && <Badge variant="outline" className="border-blue-400 text-blue-700 text-xs">농기계 진입 곤란</Badge>}
                                          </div>
                                        </div>
                                      );
                                    }
                                  })()}

                                  {/* 안내 문구 */}
                                  <div className="flex items-start gap-2 pt-2 border-t">
                                    <Info className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
                                    <p className="text-xs text-muted-foreground">
                                      담당자 AI 분석 결과입니다. 현장 상황 옵션이 적용되어 민원인 결과와 다를 수 있습니다.
                                    </p>
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          );
                        })}
                      </Accordion>
                    </>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Section 04. 담당자 검토 - 필지별 검토 */}
      {allLands.length > 1 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">필지별 검토</CardTitle>
                <CardDescription>각 필지별로 판정과 검토 의견을 입력하세요</CardDescription>
              </div>
              <Badge variant="outline">
                {landReviewDataList.filter(d => d.landJudgment !== null).length}/{allLands.length} 검토완료
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {allLands.map((land, idx) => {
                  const landReview = landReviewDataList[idx];
                  const aiResult = adminLandAIResults[land.id] || application.aiResult;
                  const isReviewed = landReview.landJudgment !== null;
                  
                  return (
                    <AccordionItem 
                      key={land.id} 
                      value={land.id}
                      className={`rounded-lg border ${isReviewed ? 'border-emerald-200 bg-emerald-50/30' : 'border-gray-200'}`}
                    >
                      <AccordionTrigger className="hover:no-underline px-4 py-3">
                        <div className="flex items-center justify-between w-full pr-2">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${
                              isReviewed ? 'bg-emerald-600' : 'bg-gray-400'
                            }`}>
                              {idx + 1}
                            </div>
                            <div className="text-left">
                              <p className="text-sm font-medium">{land.address}</p>
                              <p className="text-xs text-muted-foreground">{land.landType} | 잔여 {land.remainingArea.toLocaleString()}m²</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {aiResult?.provisionalJudgment && (
                              <Badge variant="outline" className="text-xs">
                                AI: {aiResult.provisionalJudgment}
                              </Badge>
                            )}
                            {landReview.landJudgment && (
                              <Badge className={
                                landReview.landJudgment === "매수" ? "bg-emerald-600" :
                                landReview.landJudgment === "기각" ? "bg-red-500" : "bg-amber-500"
                              }>
                                {landReview.landJudgment}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="space-y-4 pt-2">
                          {/* 필지 판정 */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">필지 판정</Label>
                            <div className="flex flex-wrap gap-2">
                              {(["매수", "기각", "심의위원회이관"] as JudgmentResult[]).map((judgment) => {
                                const config = judgmentConfig[judgment];
                                const Icon = config.icon;
                                const isSelected = landReview.landJudgment === judgment;
                                return (
                                  <Button
                                    key={judgment}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updateLandReviewData(idx, 'landJudgment', judgment)}
                                    className={`cursor-pointer border-2 ${isSelected ? `${config.borderColor} ${config.textColor}` : "border-gray-200"}`}
                                  >
                                    <Icon className="mr-1.5 h-3.5 w-3.5" />
                                    {config.label}
                                  </Button>
                                );
                              })}
                            </div>
                          </div>
                          
                          {/* AI 판정과 다른 경우 경고 */}
                          {landReview.landJudgment && aiResult?.provisionalJudgment && 
                            landReview.landJudgment !== aiResult.provisionalJudgment && (
                            <div className="rounded-lg border border-amber-200 bg-amber-50 p-2 flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                              <p className="text-xs text-amber-700">
                                AI 제안({aiResult.provisionalJudgment})과 다른 판정입니다. ��토 의견에 사유를 작성해주��요.
                              </p>
                            </div>
                          )}
                          
                          {/* 필지별 검토 의견 */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">검토 의견</Label>
                            <Textarea
                              placeholder="해당 필지에 대한 검토 의견을 입력하세요..."
                              value={landReview.landComment}
                              onChange={(e) => updateLandReviewData(idx, 'landComment', e.target.value)}
                              className="min-h-[80px] resize-none"
                            />
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
              })}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* 진행상황 선택 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">진행상황 선택</CardTitle>
          <CardDescription>민원인이 신청 현황 조회 시 이 진행상황이 표시됩니다</CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* 최종 ���토 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">최종 검토</CardTitle>
          <CardDescription>전체 민원에 대한 최종 검토 의견을 작성해주세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">최종 검토 의견</Label>
            <Textarea
              placeholder="현지상황 및 종합 검토의견을 작성해주세요. 이 내용은 심의서에 자동 입력됩니다."
              rows={4}
              value={reviewData.reviewerComment || ""}
              onChange={(e) => setReviewData((prev) => ({ ...prev, reviewerComment: e.target.value }))}
              className="resize-none"
            />
          </div>

          {/* 저장 버튼 */}
          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <Button variant="outline" onClick={onBack}>
              취소
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving || (
                // AI 결과와 다르게 결정 시 사유 필수
                reviewData.finalJudgment && Object.keys(adminLandAIResults).length > 0 && (() => {
                  const results = Object.values(adminLandAIResults);
                  const aiJudgment = results.every(r => r.provisionalJudgment === "매수") ? "매수" : 
                                    results.every(r => r.provisionalJudgment !== "매수") ? "기각" : "mixed";
                  const isDifferent = reviewData.finalJudgment !== aiJudgment && aiJudgment !== "mixed";
                  return isDifferent && !adminOverrideReason.trim();
                })()
              )}
            >
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

      {/* AI 분석 프로세스 ���이얼로그 - 관리자 재판독 결과 우선 표시 */}
      <AIAnalysisFlowDialog
        open={showAnalysisFlow}
        onOpenChange={setShowAnalysisFlow}
        aiResult={(() => {
          // 선택된 필지의 관리자 재판독 결과가 있으면 우선 사용
          const selectedLandId = allLands[selectedLandIndex]?.id;
          if (selectedLandId && adminLandAIResults[selectedLandId]) {
            return adminLandAIResults[selectedLandId];
          }
          // 없으면 기존 AI 결과 사용
          if (selectedLandId && landAIResults[selectedLandId]) {
            return landAIResults[selectedLandId];
          }
          return aiResult;
        })()}
        landInfo={allLands[selectedLandIndex]}
        isAdminResult={!!adminLandAIResults[allLands[selectedLandIndex]?.id]}
      />
    </div>
  );
}
