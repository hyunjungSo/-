"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { LandMap } from "@/components/land-map";
import { LeafletMap } from "@/components/leaflet-map";
import { AIAnalysisFlowDialog } from "@/components/admin/ai-analysis-flow-dialog";
import { AIIcon } from "@/components/ui/ai-icon";
import { JudgmentStatus } from "@/components/ui/judgment-status";
import { landShapes, landCategories } from "@/lib/dummy-data";
import type { Application, JudgmentResult, LandShape, LandCategory, AdminStatus } from "@/lib/types";
import {
  ArrowLeft,
  User,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  PlayCircle,
  Info,
  ChevronDown,
  ChevronUp,
  Map as MapIcon,
  Loader2,
  RotateCcw,
  X,
  Maximize2,
  Image as ImageIcon,
  Split,
  Edit3,
  History,
  ArrowRight,
  Scale,
  Shield,
  Brain,
  ListChecks,
  Locate,
  Download,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

interface ApplicationDetailProps {
  application: Application;
  onBack: () => void;
  onSave: (application: Application) => void;
}

const judgmentConfig = {
  매수: { label: "매수", icon: CheckCircle2, borderColor: "border-green-600", textColor: "text-green-600", color: "text-green-600" },
  기각: { label: "기각", icon: XCircle, borderColor: "border-red-500", textColor: "text-red-500", color: "text-red-500" },
  "심의위원회 이관": { label: "심의위원회 이관", icon: AlertTriangle, borderColor: "border-amber-500", textColor: "text-amber-500", color: "text-amber-500" },
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
  
  // 신청 필지
  const applicationLands = isMultipleLands
    ? [application.landInfo, ...application.additionalLands]
    : [application.landInfo];
  
  // 인접 필지 데이터
  const adjacentLands = [
    {
      id: "adjacent-001",
      address: "경기도 용인시 처인구 포곡읍 마성리 101",
      landType: "농경지",
      landCategory: "전",
      originalArea: 856,
      remainingArea: 856,
      remainingRatio: 100,
      incorporatedArea: 0,
      remainingShape: "정형" as const,
    },
    {
      id: "adjacent-002",
      address: "경기도 용인시 처인구 포곡읍 마성리 102",
      landType: "농경지",
      landCategory: "답",
      originalArea: 1234,
      remainingArea: 1234,
      remainingRatio: 100,
      incorporatedArea: 0,
      remainingShape: "정형" as const,
    },
  ];
  
  // 전체 필지 (신청 필지 + 인접 필지)
  const allLands = [...applicationLands, ...adjacentLands];
  
  // 신청 유형 초기값 결정 - 일단지 판정 제거됨, 개별 필지 분석만 지원
  const initialApplicationType = application.applicationType || (isMultipleLands ? "multiple" : "single");
  
  // 신청유형 상태 (담당자가 변경 가능)
  const [applicationType, setApplicationType] = useState<"multiple" | "single">(initialApplicationType as "multiple" | "single");

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
  
  // �����커스된 필지 ID (지도 중심 이동용)
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
    farmMachineDifficulty: application.farmMachineDifficulty ? "해당" : "���������������������입력" as "미입력" | "해당" | "해당없음",
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
  const { toast } = useToast();
  const [isAIAnalyzing, setIsAIAnalyzing] = useState(false);
  
  // 필지별 분석 진행 상태: 'pending' | 'analyzing' | 'done'
  const [landAnalysisStatus, setLandAnalysisStatus] = useState<Record<string, 'pending' | 'analyzing' | 'done'>>({});
  
  // 필지별 분석 단계 상세 (0: 대기, 1: 형상지수 계산, 2: 면적 비율 분석, 3: 법적 기준 검토, 4: 종합 판정, 5: 완료)
  const [landAnalysisStep, setLandAnalysisStep] = useState<Record<string, number>>({});
  
  // 관리자용 AI 판독 추가 옵션 (현장 상황) - 필지별 관리
  const [adminAIOptionsPerLand, setAdminAIOptionsPerLand] = useState<Record<string, {
    accessRoadLost: boolean;      // 접면도로 상실
    waterChannelLost: boolean;    // 관개수로 상실
    farmMachineDifficulty: boolean; // 농기계 회전 곤란
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
  
  // 상세 판독 결과 확장 패널 상태
  const [isDetailPanelExpanded, setIsDetailPanelExpanded] = useState(false);
  const [expandedLandIndex, setExpandedLandIndex] = useState<number | null>(null);
  
  // 관리자 재판독 결과 (별도 저장)
  const [adminLandAIResults, setAdminLandAIResults] = useState<Record<string, {
    provisionalJudgment: string;
    landTypePath: string;
    accessRoadLost: boolean;
    waterChannelLost: boolean;
    farmMachineDifficulty: boolean;
    confidence: number;
    analysisDate: string;
    reason?: string;
    adminOptions: typeof adminAIOptions; // 관리자가 선택한 옵션 기록
    adminCurrentUsage?: string;  // 담당자가 선택한 현재 활용지목
    adminLandSubType?: string;   // 담당자가 선택한 건축물 용도
    shapeIndexChange?: number; // 형상지수 변화
    criteriaChecks?: Array<{ criteriaName: string; criteriaDescription?: string; isMet: boolean; autoDetected?: boolean }>; // 판정 기준
    judgmentRationale?: { // 판단 근거 설명
      summary: string;
      legalBasis: string;
      appliedCriteria: string[];
      detailedExplanation: string;
      manualCheckItems?: string[];
    };
  }>>({});
  

  
  // 민원인�� 신청한 필지 ID 목록 (application에서 가져옴, 읽기 전용)
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
  
  // 담당자 탭 체크박스 선택 변경 핸들러
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
  
  // 필지별 AI 판독 결과 상태 (landId -> AIResult) - 개별 필지 분석만 지원
  const [landAIResults, setLandAIResults] = useState<Record<string, {
    provisionalJudgment: string;
    landTypePath: string;
    accessRoadLost: boolean;
    waterChannelLost: boolean;
    confidence: number;
    analysisDate: string;
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
      
      // landJudgments가 있으면 필지별 판정 정보 사용
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
              reason: lj.reason,
              shapeIndexChange: application.aiResult!.shapeIndexChange,
              criteriaChecks: application.aiResult!.criteriaChecks?.map(c => ({ criteriaName: c.criteriaName, isMet: c.isMet })),
              judgmentRationale: application.aiResult!.judgmentRationale,
            };
          }
        });
      } else {
        // 개별 ��지별 분�������
        allLands.forEach(land => {
          initial[land.id] = {
            provisionalJudgment: application.aiResult!.provisionalJudgment,
            landTypePath: land.landType,
            accessRoadLost: application.aiResult!.accessRoadLost,
            waterChannelLost: application.aiResult!.waterChannelLost,
            confidence: 0.9,
            analysisDate: new Date().toISOString().split("T")[0],
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
  
  // 현재 선택된 필지의 AI 결과
  const currentAIResult = landAIResults[allLands[selectedLandIndex]?.id] || null;

// ===== 대상 토지 상세 분석 (중앙토지수용위원회 기준) =====
  
  // 편입 전 면적 기준 (㎡) - 초과 시 토지유형별 경로, 이하 시 소규모 토지 경로
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
    
    if (landType === "택지") {
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
      // 농지 경로: 기본 330㎡, 잔여비율 25% 이하 시 495㎡ (완화)
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
      ? (adminCurrentUsage === "대" ? "택지" : adminCurrentUsage === "전" || adminCurrentUsage === "답" ? "농지" : adminCurrentUsage === "임" ? "임야" : "기타")
      : land.landType;
    
    const criteria = getAreaCriteria(land, landData, adminLandSubType);
    const isSmall = isSmallScaleLand(land);
    const shapeCriteria = checkShapeCriteria(land);
    
    const criteriaChecks: Array<{ name: string; met: boolean; description: string }> = [];
    let judgment: "매수" | "기각" | "심의위원회 이관" = "기각";
    let reasons: string[] = [];
    
    // 1. 면적 기준 미달 여부
    const effectiveLimit = criteria.relaxed;
    const areaCheckMet = land.remainingArea <= effectiveLimit;
    criteriaChecks.push({
      name: "면적 기준",
      met: areaCheckMet,
      description: `잔여 ${land.remainingArea}㎡ ${areaCheckMet ? "≤" : ">"} ${effectiveLimit}㎡`
    });
    
    if (effectiveLandType === "택지") {
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
        judgment = "기각";
        reasons.push("���� 기준 미충족");
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
          : (roadLost ? "접면도로 상실" + (adminOptions?.accessRoadLost ? " (관리자 확인)" : "") : "도로/���� 유지")
      });
      
      // 3. 농기계 회전 곤란, 형상 부정형 변경
      const farmDifficulty = adminOptions?.farmMachineDifficulty || landData?.farmMachineDifficulty || land.remainingArea < 200;
      criteriaChecks.push({
        name: "농기계 회전",
        met: farmDifficulty,
        description: farmDifficulty ? "농기계 회전 곤란" + (adminOptions?.farmMachineDifficulty ? " (관리자 확인)" : "") : "농기계 사용 가능"
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
        if (farmDifficulty) reasons.push("농기계 회전 곤란" + (adminOptions?.farmMachineDifficulty ? " (관리자 확인)" : ""));
        if (shapeCriteria.met) reasons.push("형상 부정형 변경");
      } else {
        judgment = "기각";
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
        judgment = "기각";
        reasons.push("모든 기준 미충��");
      }
      
    } else {
      // 그 밖�� 토지 + 관��자 ���션 반영
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
        judgment = "기각";
        reasons.push("모든 기준 미충족");
      }
    }
    
    // 소규모 토지 추가 검토
    if (isSmall) {
      criteriaChecks.push({
        name: "소규모 토지",
        met: true,
        description: `편입전 ${land.originalArea}㎡ 또는 잔여비율 ${land.remainingRatio}% (소규모 해당)`
      });
      if (judgment === "기각") {
        judgment = "심의위원회 이관";
        reasons.push("소규모 토지로 심의위원회 검토 필요");
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

  // AI 판독 실행 핸들러 (2단계 프로세스) - 담당자가 선택한 필지만 분석
  const handleRunAIAnalysis = () => {
    // 선택된 필지가 없으면 알림
    if (adminCheckedLandIds.length === 0) {
      alert("AI 판독할 필지를 선택해주세요.");
      return;
    }
    
    setIsAIAnalyzing(true);
    setAdminLandAIResults({});
    
    // 필지별 분석 상태 초기화 (모두 pending)
    const initialStatus: Record<string, 'pending' | 'analyzing' | 'done'> = {};
    const initialStep: Record<string, number> = {};
    adminCheckedLandIds.forEach(id => {
      initialStatus[id] = 'pending';
      initialStep[id] = 0;
    });
    setLandAnalysisStatus(initialStatus);
    setLandAnalysisStep(initialStep);
    
    // 분석 실행 (최대 5초 이내 완료 보장)
    const runAnalysis = async () => {
      const totalLands = adminCheckedLandIds.length;
      const stepDelay = Math.min(80, Math.floor(800 / totalLands)); // 필지 수에 따라 동적 조절
      
      // 모든 필지를 병렬로 분석
      const analysisPromises = adminCheckedLandIds.map(async (landId) => {
        setLandAnalysisStatus(prev => ({ ...prev, [landId]: 'analyzing' }));
        
        for (let step = 1; step <= 5; step++) {
          setLandAnalysisStep(prev => ({ ...prev, [landId]: step }));
          await new Promise(resolve => setTimeout(resolve, stepDelay));
        }
        
        setLandAnalysisStatus(prev => ({ ...prev, [landId]: 'done' }));
      });
      
      await Promise.all(analysisPromises);
      
      try {
        // 분석 결과 생성
        const newResults: typeof adminLandAIResults = {};
        const selectedLands = allLands.filter(l => adminCheckedLandIds.includes(l.id));
        
        selectedLands.forEach((land) => {
          try {
            const landId = land.id;
            const landIndex = allLands.findIndex(l => l.id === landId);
            const landData = application.landDataList?.[landIndex];
            
            const landOptions = adminAIOptionsPerLand[landId] || { accessRoadLost: false, waterChannelLost: false, farmMachineDifficulty: false };
            const adminCurrentUsage = adminCurrentUsagePerLand[landId];
            const adminLandSubType = adminLandSubTypePerLand[landId];
            const analysis = analyzeSingleLand(land, landData, landOptions, adminCurrentUsage, adminLandSubType);
            
            const finalJudgment = analysis.judgment;
            
            const judgmentRationale = {
              summary: `${land.landType} 잔여면적 ${land.remainingArea.toLocaleString()}㎡(잔여비율 ${land.remainingRatio}%), ${analysis.reasons.join(", ")}으로 「${finalJudgment}」 판정`,
              legalBasis: "「공익사업을 위한 토지 등의 취득 및 보상에 관한 법률」 제74조 및 동법 시행규칙 제34조",
              appliedCriteria: analysis.criteriaChecks.map(check => 
                `${check.name}: ${check.description} ${check.met ? "✓" : "✗"}`
              ),
              detailedExplanation: `[필지 정보]\n주소: ${land.address}\n지목: ${land.landType} (${land.landCategory})\n편입 전 면적: ${land.originalArea.toLocaleString()}㎡\n잔여 면적: ${land.remainingArea.toLocaleString()}㎡ (${land.remainingRatio}%)\n\n[분석 결과]\n${analysis.reasons.map(r => `• ${r}`).join("\n")}`,
              manualCheckItems: analysis.criteriaChecks.filter(c => !c.met).map(c => `${c.name} 재확인 필요`),
            };
            
            const criteriaChecks = analysis.criteriaChecks.map(check => ({
              criteriaName: check.name,
              criteriaDescription: check.description,
              isMet: check.met,
              autoDetected: true,
            }));
            
            newResults[landId] = {
              provisionalJudgment: finalJudgment,
              landTypePath: analysis.landTypePath,
              accessRoadLost: analysis.accessRoadLost,
              waterChannelLost: analysis.waterChannelLost,
              confidence: analysis.confidence,
              analysisDate: new Date().toISOString().split("T")[0],
              reason: analysis.reasons.join(", "),
              adminCurrentUsage: adminCurrentUsage,
              adminLandSubType: adminLandSubType,
              judgmentRationale: judgmentRationale,
              criteriaChecks: criteriaChecks,
              shapeIndexChange: (land.remainingRatio < 50) ? 1.5 + Math.random() * 1.5 : 0.5 + Math.random() * 0.5,
            };
          } catch (landError) {
            // ���지 분석 오류 처리
          }
        });
        
        const adminResults: typeof adminLandAIResults = {};
        Object.entries(newResults).forEach(([landId, result]) => {
          adminResults[landId] = {
            ...result,
            farmMachineDifficulty: adminAIOptions.farmMachineDifficulty,
            adminOptions: { ...adminAIOptions }
          };
        });
        
        // 기존 결과에 새 결과를 누적 (같은 필지는 최신 결과로 덮어씀)
        setAdminLandAIResults(prev => ({ ...prev, ...adminResults }));
        setAiResultViewMode("admin");
        setIsAIAnalyzing(false);
      } catch (error) {
        // 분석 결과 생성 오류 처리
        setIsAIAnalyzing(false);
      }
    };
    
    runAnalysis().catch(() => {
      setIsAIAnalyzing(false);
    });
  };
  
  
  
  // 판독 결과 초기화 (관리자 재판독 결과만)
  const handleResetAdminAIResults = () => {
    setAdminLandAIResults({});
    setAdminAIOptions({
      accessRoadLost: false,
      waterChannelLost: false,
      farmMachineDifficulty: false,
    });
    setAiResultViewMode("citizen");
  };
  
  // 필지 포함/제외 상태 (민원인 소유 확인용)
  const [excludedLands, setExcludedLands] = useState<Set<string>>(new Set());
  
  // PDF 미리보기 상태
  const [selectedAttachment, setSelectedAttachment] = useState<{ name: string; url: string } | null>(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  
  // 첨부파일 클릭 핸들러
  const handleAttachmentClick = (fileName: string) => {
    // 실제 환경에서는 서버에서 파일 URL을 받아옴
    const fileUrl = `/attachments/${fileName}`;
    setSelectedAttachment({ name: fileName, url: fileUrl });
    setShowPdfPreview(true);
  };
  
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
    
    // 필지별 판정 결과 생성 (심의서 연동용)
    const landJudgmentsForReview = allLands.map((land, idx) => {
      const adminResult = adminLandAIResults[land.id];
      const citizenResult = landAIResults[land.id];
      const result = adminResult || citizenResult;
      
      return {
        landId: land.id,
        landIndex: idx,
        address: land.address,
        landType: land.landType,
        landCategory: land.landCategory,
        originalArea: land.originalArea,
        remainingArea: land.remainingArea,
        remainingRatio: land.remainingRatio,
        judgment: result?.provisionalJudgment || "분석중",
        purchaseDecision: result?.provisionalJudgment === "매수" ? "O" as const : 
                          result?.provisionalJudgment === "기각" ? "X" as const : 
                          "-" as const,
      };
    });
    
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
      // 필지별 판정 결과 저장 (심의서 연동)
      landJudgmentsForReview,
    };

    // 저장 완료 토스트 메시지 즉시 노출 (3초 후 사라짐)
    toast({
      title: "저장 완료",
      description: "검토 내용이 저장되었습니다.",
      duration: 3000,
    });

    setTimeout(() => {
      setIsSaving(false);
      onSave(updatedApplication);
    }, 1000);
  };

  return (
    <div className="space-y-10">
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
          <CardTitle className="text-lg">신청인 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div>
              <span className="text-sm text-muted-foreground">접수번호</span>
              <p className="font-medium">2026-05-001</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">신청 구분</span>
              <p className="font-medium">
                <Badge variant="default">본인 신청</Badge>
              </p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">신청인</span>
              <p className="font-medium">{application.applicantName}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">주소</span>
              <p className="font-medium">{application.applicantAddress || "-"}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">신청일</span>
              <p className="font-medium">{application.createdAt}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 02. 필지선택 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">대상 필지 분석 및 검토</CardTitle>
            {/* 필지 선택 */}
            <div className="flex items-center gap-4">
              <Select
                value={selectedLandIndex.toString()}
                onValueChange={(value) => setSelectedLandIndex(parseInt(value))}
              >
                <SelectTrigger className="w-full max-w-[500px] h-10">
                  <SelectValue placeholder="필지를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {applicationLands.map((land, index) => (
                    <SelectItem key={land.id} value={index.toString()}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{String.fromCharCode(65 + index)}</span>
                        <span>{land.address.split(" ").slice(-2).join(" ")}</span>
                        <span className="text-muted-foreground text-xs">| {land.landCategory} | {land.remainingArea.toLocaleString()}㎡</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setSelectedLandIndex(Math.max(0, selectedLandIndex - 1))}
                  disabled={selectedLandIndex === 0}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground whitespace-nowrap">{selectedLandIndex + 1} / {applicationLands.length}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setSelectedLandIndex(Math.min(applicationLands.length - 1, selectedLandIndex + 1))}
                  disabled={selectedLandIndex === applicationLands.length - 1}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-12">
          {/* 2-1. 토지정보 */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold ">토지정보</h3>
            {applicationLands[selectedLandIndex] && (
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                  <tbody className="divide-y">
                    <tr>
                      <td className="bg-muted/50 px-4 py-3 font-medium text-muted-foreground w-32">토지유형</td>
                      <td className="px-4 py-3">{applicationLands[selectedLandIndex].landType || "-"}</td>
                      <td className="bg-muted/50 px-4 py-3 font-medium text-muted-foreground w-32">대상 지번</td>
                      <td className="px-4 py-3">{applicationLands[selectedLandIndex].address}</td>
                    </tr>
                    <tr>
                      <td className="bg-muted/50 px-4 py-3 font-medium text-muted-foreground">잔여면적</td>
                      <td className="px-4 py-3">{applicationLands[selectedLandIndex].remainingArea.toLocaleString()}㎡</td>
                      <td className="bg-muted/50 px-4 py-3 font-medium text-muted-foreground">토지 모양</td>
                      <td className="px-4 py-3">사다리꼴</td>
                    </tr>
                    <tr>
                      <td className="bg-muted/50 px-4 py-3 font-medium text-muted-foreground">활용지목</td>
                      <td className="px-4 py-3">전</td>
                      <td className="bg-muted/50 px-4 py-3 font-medium text-muted-foreground">공부상 지목</td>
                      <td className="px-4 py-3">{applicationLands[selectedLandIndex].landCategory}</td>
                    </tr>
                    <tr>
                      <td className="bg-muted/50 px-4 py-3 font-medium text-muted-foreground align-top">확인항목</td>
                      <td className="px-4 py-3" colSpan={3}>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">농기계 진입 곤란</Badge>
                          <Badge variant="secondary">접면도로 상실</Badge>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="bg-muted/50 px-4 py-3 font-medium text-muted-foreground align-top">신청 사유</td>
                      <td className="px-4 py-3" colSpan={3}>
                        <p className="text-sm leading-relaxed">도로 개설로 인해 토지가 분할되어 잔여지의 형상이 불규칙하고, 농기계 진입이 어려워 농업 활용이 곤란합니다. 또한 기존 접면도로가 상실되어 토지 이용에 심각한 제한이 발생하였습니다.</p>
                      </td>
                    </tr>
                    <tr>
                      <td className="bg-muted/50 px-4 py-3 font-medium text-muted-foreground align-top">첨부서류</td>
                      <td className="px-4 py-3" colSpan={3}>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleAttachmentClick("토지대장_용인시_포곡읍_200-1.pdf")}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                          >
                            <Badge variant="outline" className="font-normal cursor-pointer">토지대장_용인시_포곡읍_200-1.pdf</Badge>
                          </button>
                          <button
                            onClick={() => handleAttachmentClick("지적도_용인시_포곡읍_200-1.pdf")}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                          >
                            <Badge variant="outline" className="font-normal cursor-pointer">지적도_용인시_포곡읍_200-1.pdf</Badge>
                          </button>
                          <button
                            onClick={() => handleAttachmentClick("현장사진_20260501.jpg")}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                          >
                            <Badge variant="outline" className="font-normal cursor-pointer">현장사진_20260501.jpg</Badge>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 2-2. AI 분석 */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold ">AI 분석</h3>
            <p className="text-sm text-muted-foreground">민원인 신청 결과와 담당자 분석 결과를 확인합니다.</p>
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
                  
                  {/* 지도 범례 */}
                  <div className="rounded-lg border bg-white/80 p-2">
                    <p className="text-xs font-medium text-muted-foreground mb-2">범례</p>
                    <div className="flex flex-wrap gap-3 text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="h-3 w-3 rounded-sm border-2 border-[#2563eb] bg-[#dbeafe]" />
                        <span className="text-blue-600 font-medium">신청필지</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="h-3 w-3 rounded-sm border-2 border-dashed border-[#d97706] bg-[#fef3c7]" />
                        <span>인접필지</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 우측: 분석결과 - 선택된 필지만 표시 */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">분석결과</h4>
                    {(() => {
                      const land = applicationLands[selectedLandIndex];
                      if (!land) return null;
                      const landResult = landAIResults[land.id];
                      const aiResult = application.aiResult;
                      const judgment = landResult?.provisionalJudgment || aiResult?.provisionalJudgment;
                      return (
                        <JudgmentStatus 
                          judgment={judgment || "분석중"} 
                          variant="badge" 
                          size="sm"
                        />
                      );
                    })()}
                  </div>
                  
                  {/* 선택된 필지의 분석 결과 */}
                  {(() => {
                    const land = applicationLands[selectedLandIndex];
                    if (!land) return null;
                    
                    const landResult = landAIResults[land.id];
                    const aiResult = application.aiResult;
                    const judgment = landResult?.provisionalJudgment || aiResult?.provisionalJudgment;
                    
                    return (
                      <div className={`rounded-lg border p-4 ${
                        judgment === "매수"
                          ? "border-green-600/20 bg-green-600/5"
                          : judgment === "기각"
                            ? "border-red-200 bg-red-50/50"
                            : "border-slate-200 bg-slate-50/50"
                      }`}>
                        {/* 편입 정보 */}
                        <div className="rounded-lg bg-white/60 p-3 border mb-4">
                          <p className="text-xs font-medium text-muted-foreground mb-2">편입 정보</p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                            <div>
                              <span className="text-muted-foreground">편입 전 면적:</span>
                              <span className="ml-1 font-medium">{land.originalArea.toLocaleString()}㎡</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">편입 면적:</span>
                              <span className="ml-1 font-medium">{(land.includedArea ?? ((land.originalArea ?? 0) - (land.remainingArea ?? 0))).toLocaleString()}m²</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">잔여 면적:</span>
                              <span className="ml-1 font-medium">{land.remainingArea.toLocaleString()}m²</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">잔여 비율:</span>
                              <span className="ml-1 font-medium">{land.remainingRatio}%</span>
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
                          <div className="flex items-start gap-2">
                            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                            <div>
                              <h4 className="text-sm font-semibold text-foreground">판단 요약</h4>
                              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                                {(() => {
                                  const summary = landResult?.judgmentRationale?.summary;
                                  if (!summary) {
                                    return `${land.landType} 잔여면적 ${land.remainingArea.toLocaleString()}㎡(잔여비율 ${land.remainingRatio}%)로 「${landResult?.provisionalJudgment || "분석중"}」 판정`;
                                  }
                                      
                                  // If this is multi-parcel, extract only current parcel's summary
                                  if (isMultipleLands && (summary.includes("필지") || summary.includes("-"))) {
                                    const summaryParts = summary.split(" - ");
                                    if (summaryParts.length > 1) {
                                      for (const part of summaryParts) {
                                        if (part.includes(land.landNumber || land.id) || part.includes(land.address?.split("-").pop())) {
                                          return part.trim();
                                        }
                                      }
                                    }
                                    const addressParts = land.address?.split("-") || [];
                                    const landNum = addressParts[addressParts.length - 1];
                                    if (landNum && summary.includes(landNum)) {
                                      const sentences = summary.split("→");
                                      for (const sentence of sentences) {
                                        if (sentence.includes(landNum)) {
                                          return sentence.trim();
                                        }
                                      }
                                    }
                                  }
                                  return summary;
                                })()}
                              </p>
                            </div>
                          </div>

                          {/* 법적 근거 */}
                          <div className="flex items-start gap-2">
                            <Scale className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                            <div>
                              <h4 className="text-sm font-semibold text-foreground">법적 근거</h4>
                              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                                {landResult?.judgmentRationale?.legalBasis || 
                                  "「공익사업을 위한 토지 등의 취득 및 보상에 관한 법률」 제74조 및 동법 시행규칙 제34조"}
                              </p>
                            </div>
                          </div>

                          {/* 적용 기준 */}
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                            <div>
                              <h4 className="text-sm font-semibold text-foreground">적용 기준</h4>
                              <ul className="mt-1 space-y-1">
                                {landResult?.judgmentRationale?.appliedCriteria ? (
                                  landResult.judgmentRationale.appliedCriteria.map((criteria, cIdx) => (
                                    <li key={cIdx} className="flex items-start gap-1.5 text-sm text-muted-foreground">
                                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                                      <span>{criteria}</span>
                                    </li>
                                  ))
                                ) : (
                                  <>
                                    <li className="flex items-start gap-1.5 text-sm text-muted-foreground">
                                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                                      <span>잔여면적 기준: {land.remainingArea.toLocaleString()}㎡</span>
                                    </li>
                                    <li className="flex items-start gap-1.5 text-sm text-muted-foreground">
                                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                                      <span>잔여비율 기준: {land.remainingRatio}%</span>
                                    </li>
                                  </>
                                )}
                              </ul>
                            </div>
                          </div>

                          {/* 수동 확인 항목 */}
                          {landResult?.judgmentRationale?.manualCheckItems && landResult.judgmentRationale.manualCheckItems.length > 0 && (
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
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
                          <div 
                            className="flex items-start gap-2 p-3 -mx-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
                            onClick={() => {
                              setExpandedLandIndex(selectedLandIndex);
                              setIsDetailPanelExpanded(true);
                            }}
                          >
                            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold text-foreground">상세 판독 결과</h4>
                                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Maximize2 className="h-3 w-3 mr-1" />
                                  확대 보기
                                </Button>
                              </div>
                              <pre className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                                {landResult?.judgmentRationale?.detailedExplanation || 
                                  `[필지 정보]\n주소: ${land.address}\n지목: ${land.landType} (${land.landCategory})\n편입 전 면적: ${land.originalArea.toLocaleString()}㎡\n잔여 면적: ${land.remainingArea.toLocaleString()}㎡ (${land.remainingRatio}%)\n\n[분석 결과]\n• 잔여면적 ${land.remainingArea.toLocaleString()}㎡\n• 잔여비율 ${land.remainingRatio}%`}
                              </pre>
                            </div>
                          </div>
                            
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
                                      className={`text-xs ${check.isMet ? "bg-green-600" : ""}`}
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
                    </div>
                  );
                })()}
                </div>
              </div>
            </TabsContent>
            
            {/* 담당자 결과 탭 */}
            <TabsContent value="admin">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* 좌측: 지적도 - 선택된 필지 */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">지적도</h4>
                    <Badge variant="outline" className="font-normal">
                      {applicationLands[selectedLandIndex]?.address.split(" ").slice(-2).join(" ")}
                    </Badge>
                  </div>
                  
                  {/* 지적도 - 선택된 필지와 인접지 */}
                  <div className="relative h-[450px] rounded-lg overflow-hidden border">
                    <div className="absolute inset-0">
                    <LeafletMap
                      parcels={(() => {
                        const selectedLand = applicationLands[selectedLandIndex];
                        if (!selectedLand) return [];
                        
                        // 선택된 필지
                        const baseLat = 37.2180 + (selectedLandIndex * 0.0008);
                        const baseLng = 127.2950 + (selectedLandIndex * 0.0005);
                        const offset = 0.0003;
                        
                        const selectedParcel = {
                          id: selectedLand.id,
                          address: selectedLand.address,
                          isIncluded: true,
                          isOwned: adminCheckedLandIds.includes(selectedLand.id),
                          coordinates: [
                            { lat: baseLat, lng: baseLng },
                            { lat: baseLat, lng: baseLng + offset * 1.2 },
                            { lat: baseLat + offset, lng: baseLng + offset * 1.2 },
                            { lat: baseLat + offset, lng: baseLng },
                          ],
                        };
                        
                        // 인접지 (미선택 상태)
                        const adjacentParcels = [
                          {
                            id: "adjacent-001",
                            address: "경기도 용인시 처인구 포곡읍 마성리 101",
                            isIncluded: false,
                            isOwned: false,
                            isAdjacent: true,
                            coordinates: [
                              { lat: baseLat + offset * 1.1, lng: baseLng },
                              { lat: baseLat + offset * 1.1, lng: baseLng + offset * 1.2 },
                              { lat: baseLat + offset * 2.1, lng: baseLng + offset * 1.2 },
                              { lat: baseLat + offset * 2.1, lng: baseLng },
                            ],
                          },
                          {
                            id: "adjacent-002",
                            address: "경기도 용인시 처인구 포곡읍 마성리 102",
                            isIncluded: false,
                            isOwned: false,
                            isAdjacent: true,
                            coordinates: [
                              { lat: baseLat, lng: baseLng + offset * 1.3 },
                              { lat: baseLat, lng: baseLng + offset * 2.5 },
                              { lat: baseLat + offset, lng: baseLng + offset * 2.5 },
                              { lat: baseLat + offset, lng: baseLng + offset * 1.3 },
                            ],
                          },
                        ];
                        
                        return [selectedParcel, ...adjacentParcels];
                      })()}
                      selectedParcelIds={new Set([applicationLands[selectedLandIndex]?.id].filter(Boolean))}
                      onParcelClick={() => {}}
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
                        <div className="h-3 w-3 rounded-sm border-2 border-[#2563eb] bg-[#dbeafe]" />
                        <span className="text-blue-600 font-medium">신청 필지</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="h-3 w-3 rounded-sm border-2 border-dashed border-[#d97706] bg-[#fef3c7]" />
                        <span>인접 필지 (미신청)</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* 필지 목록 */}
                  <div className="rounded-lg border bg-white p-3">
                    <p className="text-sm font-medium mb-3">필지 목록</p>
                    <div className="space-y-2">
                      {/* 신청 필지 (선택된 필지) */}
                      {applicationLands[selectedLandIndex] && (
                        <div 
                          className="flex items-center justify-between p-2 rounded-md border-2 border-[#2563eb] bg-[#dbeafe]/30 cursor-pointer hover:bg-[#dbeafe]/50 transition-colors"
                          onMouseEnter={() => setHoveredLandId(applicationLands[selectedLandIndex].id)}
                          onMouseLeave={() => setHoveredLandId(null)}
                        >
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-sm border-2 border-[#2563eb] bg-[#dbeafe]" />
                            <div>
                              <p className="text-sm font-medium text-blue-700">
                                {applicationLands[selectedLandIndex].address.split(" ").slice(-2).join(" ")}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {applicationLands[selectedLandIndex].landType} | {applicationLands[selectedLandIndex].originalArea.toLocaleString()}㎡
                              </p>
                            </div>
                          </div>
                          <Badge className="bg-blue-600 text-white text-xs">신청</Badge>
                        </div>
                      )}
                      
                      {/* 인접 필지 (미신청) */}
                      {[
                        { id: "adjacent-001", address: "경기도 용인시 처인구 포곡읍 마성리 101", landType: "전", area: 1250 },
                        { id: "adjacent-002", address: "경기도 용인시 처인구 포곡읍 마성리 102", landType: "답", area: 980 },
                      ].map((adjacent) => (
                        <div 
                          key={adjacent.id}
                          className="flex items-center justify-between p-2 rounded-md border border-dashed border-[#d97706] bg-[#fef3c7]/20 cursor-pointer hover:bg-[#fef3c7]/40 transition-colors"
                          onMouseEnter={() => setHoveredLandId(adjacent.id)}
                          onMouseLeave={() => setHoveredLandId(null)}
                        >
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-sm border-2 border-dashed border-[#d97706] bg-[#fef3c7]" />
                            <div>
                              <p className="text-sm font-medium text-amber-700">
                                {adjacent.address.split(" ").slice(-2).join(" ")}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {adjacent.landType} | {adjacent.area.toLocaleString()}㎡
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className="border-amber-600 text-amber-700 text-xs">인접</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* 선택된 필지 옵션 설정 */}
                  <div className="rounded-lg border bg-white">
                    {/* 헤더 */}
                    <div className="flex items-center justify-between border-b bg-muted/30 px-3 py-2.5">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <span 
                          className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
                          style={{ backgroundColor: selectedLandIndex < applicationLands.length ? "#2563eb" : "#d97706" }}
                        >
                          {String.fromCharCode(65 + selectedLandIndex)}
                        </span>
                        필지 검토 옵션
                      </span>
                      <Badge variant={selectedLandIndex < applicationLands.length ? "default" : "outline"}>
                        {selectedLandIndex < applicationLands.length ? "신청 ��지" : "인접 필지"}
                      </Badge>
                    </div>
                    
                    {/* 선택된 필지 옵션 설정 */}
                    <div className="p-4 space-y-4">
                      {(() => {
                        const selectedLand = allLands[selectedLandIndex];
                        if (!selectedLand) return null;
                        const landOptions = adminAIOptionsPerLand[selectedLand.id] || { accessRoadLost: false, waterChannelLost: false, farmMachineDifficulty: false };
                        
                        return (
                          <>
                            {/* 현재 활용 지목 */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-foreground">
                                  현재 활용 지목 <span className="text-destructive">*</span>
                                </label>
                                <span className="text-sm text-muted-foreground">
                                  공부상 지목: <span className="font-medium text-foreground">{selectedLand.landType}</span>
                                </span>
                              </div>
                              <Select 
                                value={adminCurrentUsagePerLand[selectedLand.id] || ""} 
                                onValueChange={(value) => setAdminCurrentUsagePerLand(prev => ({ ...prev, [selectedLand.id]: value }))}
                              >
                                <SelectTrigger className="h-10 bg-background">
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
                            </div>
                            
                            {/* 건축물 용도 선택 - 현재 활용 지목이 "대"인 경우만 표시 */}
                            {adminCurrentUsagePerLand[selectedLand.id] === "대" && (
                              <div className="space-y-2 p-3 rounded-lg bg-muted/30">
                                <label className="text-sm font-medium text-foreground">
                                  건축물 용도 선택 <span className="text-destructive">*</span>
                                </label>
                                <Select 
                                  value={adminLandSubTypePerLand[selectedLand.id] || ""} 
                                  onValueChange={(value) => setAdminLandSubTypePerLand(prev => ({ ...prev, [selectedLand.id]: value }))}
                                >
                                  <SelectTrigger className="h-10 bg-background">
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
                            <div className="space-y-3 pt-2 border-t">
                              <label className="text-sm font-medium text-foreground">현장 확인 항목</label>
                              <div className="space-y-2">
                                <label className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-muted/50">
                                  <Checkbox 
                                    checked={landOptions.farmMachineDifficulty}
                                    onCheckedChange={(checked) => updateLandOption(selectedLand.id, 'farmMachineDifficulty', checked === true)}
                                    className="h-5 w-5"
                                  />
                                  <span className="text-sm">농기계 회전 곤란</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-muted/50">
                                  <Checkbox 
                                    checked={landOptions.accessRoadLost}
                                    onCheckedChange={(checked) => updateLandOption(selectedLand.id, 'accessRoadLost', checked === true)}
                                    className="h-5 w-5"
                                  />
                                  <span className="text-sm">접면도로 상실</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-muted/50">
                                  <Checkbox 
                                    checked={landOptions.waterChannelLost}
                                    onCheckedChange={(checked) => updateLandOption(selectedLand.id, 'waterChannelLost', checked === true)}
                                    className="h-5 w-5"
                                  />
                                  <span className="text-sm">관개수로 상실</span>
                                </label>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                      
                    </div>
                  </div>
                  
                  {/* AI 분석 버튼 */}
                  {(() => {
                    const selectedLand = allLands[selectedLandIndex];
                    const hasCurrentUsage = selectedLand && adminCurrentUsagePerLand[selectedLand.id] && adminCurrentUsagePerLand[selectedLand.id].trim() !== "";
                    const isDisabled = isAIAnalyzing || !hasCurrentUsage;
                    
                    return (
                      <div className="space-y-1.5">
                        <Button
                          onClick={() => {
                            if (selectedLand) {
                              setAdminCheckedLandIds([selectedLand.id]);
                              handleRunAIAnalysis();
                            }
                          }}
                          disabled={isDisabled}
                          className="h-12 w-full gap-2 text-base bg-blue-600 hover:bg-blue-700"
                        >
                          {isAIAnalyzing ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              AI 분석 중...
                            </>
                          ) : (
                            <>
                              <AIIcon className="h-4 w-4" />
                              이 필지 AI 분석 실행
                            </>
                          )}
                        </Button>
                        {!hasCurrentUsage && (
                          <p className="text-xs text-center text-red-600">
                            현재 활�� 지목을 선택해 주세요
                          </p>
                        )}
                      </div>
                    );
                  })()}
                </div>
                
                {/* 우측: 분석결�� */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">분석결과</h4>
                    {Object.keys(adminLandAIResults).length > 0 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleResetAdminAIResults}
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        title="재분석 결과 초기화"
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
                          현재 민원인 결과를 표시하고 있습니다. 좌측에서 현장 상황 옵션을 설정하고 AI 재분석을 실행하면 담당자 결과가 표시됩니다.
                        </p>
                      </div>
                      
                      {/* 선택된 필지의 민원인 결과 표시 */}
                      {(() => {
                        const land = applicationLands[selectedLandIndex];
                        if (!land) return null;
                        
                        const landResult = landAIResults[land.id];
                        const judgment = landResult?.provisionalJudgment || application.aiResult?.provisionalJudgment;
                        
                        return (
                          <div className={`rounded-lg border p-4 ${
                            judgment === "매수"
                              ? "border-green-600/20 bg-green-600/5"
                              : judgment === "기각"
                                ? "border-red-200 bg-red-50/50"
                                : "border-slate-200 bg-slate-50/50"
                          }`}>
                            {/* 편입 정보 */}
                            <div className="rounded-lg bg-white/60 p-3 border mb-4">
                                      <p className="text-xs font-medium text-muted-foreground mb-2">��입 정보</p>
                                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                                        <div>
                                          <span className="text-muted-foreground">편입 전 면적:</span>
                                          <span className="ml-1 font-medium">{land.originalArea.toLocaleString()}㎡</span>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground">편입 면적:</span>
                                          <span className="ml-1 font-medium">{(land.includedArea ?? ((land.originalArea ?? 0) - (land.remainingArea ?? 0))).toLocaleString()}m²</span>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground">잔여 면적:</span>
                                          <span className="ml-1 font-medium">{land.remainingArea.toLocaleString()}m²</span>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground">잔여 비율:</span>
                                          <span className="ml-1 font-medium">{land.remainingRatio}%</span>
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
                                  <div className="flex items-start gap-2">
                                    <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                    <div>
                                      <h4 className="text-sm font-semibold text-foreground">판단 요약</h4>
                                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                                        {(() => {
                                          const summary = landResult?.judgmentRationale?.summary;
                                          if (!summary) {
                                            return `${land.landType} 잔여면적 ${land.remainingArea.toLocaleString()}㎡(잔여비율 ${land.remainingRatio}%)로 「${landResult?.provisionalJudgment || "분석중"}」 판정`;
                                          }
                                          
                                          // If this is multi-parcel, extract only current parcel's summary
                                          if (isMultipleLands && (summary.includes("필지") || summary.includes("-"))) {
                                            // Look for pattern like "200-1:" or "필지 1:" in the summary
                                            const summaryParts = summary.split(" - ");
                                            if (summaryParts.length > 1) {
                                              // Multi-line summary format
                                              for (const part of summaryParts) {
                                                if (part.includes(land.landNumber || land.id) || part.includes(land.address?.split("-").pop())) {
                                                  return part.trim();
                                                }
                                              }
                                            }
                                            
                                            // Look for address/land number patterns
                                            const addressParts = land.address?.split("-") || [];
                                            const landNum = addressParts[addressParts.length - 1];
                                            if (landNum && summary.includes(landNum)) {
                                              // Extract the sentence containing this land number
                                              const sentences = summary.split("→");
                                              for (const sentence of sentences) {
                                                if (sentence.includes(landNum)) {
                                                  return sentence.trim() + (sentence.includes("→") ? "" : "");
                                                }
                                              }
                                            }
                                          }
                                          
                                          return summary;
                                        })()}
                                      </p>
                                    </div>
                                  </div>

                                      {/* 법적 근거 */}
                                      <div className="flex items-start gap-2">
                                        <Scale className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                                        <div>
                                          <h4 className="text-sm font-semibold text-foreground">법적 근거</h4>
                                          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                                            {landResult?.judgmentRationale?.legalBasis || 
                                              "「공익사업을 위한 토지 등의 취득 및 보상에 관한 법률」 제74조 및 동법 시행규칙 제34조"}
                                          </p>
                                        </div>
                                      </div>

                                      {/* 적용 기준 */}
                                      <div className="flex items-start gap-2">
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                        <div>
                                          <h4 className="text-sm font-semibold text-foreground">적용 기준</h4>
                                          <ul className="mt-1 space-y-1">
                                            {landResult?.judgmentRationale?.appliedCriteria ? (
                                              landResult.judgmentRationale.appliedCriteria.map((criteria, cIdx) => (
                                                <li key={cIdx} className="flex items-start gap-1.5 text-sm text-muted-foreground">
                                                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                                                  <span>{criteria}</span>
                                                </li>
                                              ))
                                            ) : (
                                              <>
                                                <li className="flex items-start gap-1.5 text-sm text-muted-foreground">
                                                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                                                  <span>잔여면적 기준: {land.remainingArea.toLocaleString()}㎡</span>
                                                </li>
                                                <li className="flex items-start gap-1.5 text-sm text-muted-foreground">
                                                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                                                  <span>잔여비율 기준: {land.remainingRatio}%</span>
                                                </li>
                                              </>
                                            )}
                                          </ul>
                                        </div>
                                      </div>

                                      {/* 수동 확인 항목 */}
                                      {landResult?.judgmentRationale?.manualCheckItems && landResult.judgmentRationale.manualCheckItems.length > 0 && (
                                        <div className="flex items-start gap-2">
                                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
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
                                      <div 
                                        className="flex items-start gap-2 p-3 -mx-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
                                        onClick={() => {
                                          setExpandedLandIndex(landIdx);
                                          setIsDetailPanelExpanded(true);
                                        }}
                                      >
                                        <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                        <div className="flex-1">
                                          <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-semibold text-foreground">상세 판독 결과</h4>
                                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                              <Maximize2 className="h-3 w-3 mr-1" />
                                              확대 보기
                                            </Button>
                                          </div>
                                          <pre className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                                            {(() => {
                                              const explanation = landResult?.judgmentRationale?.detailedExplanation;
                                              if (!explanation) {
                                                return `[필지 정보]\n주소: ${land.address}\n지목: ${land.landType} (${land.landCategory})\n편입 전 면적: ${land.originalArea.toLocaleString()}㎡\n잔여 면적: ${land.remainingArea.toLocaleString()}㎡ (${land.remainingRatio}%)\n\n[분석 결과]\n• 잔여면적 ${land.remainingArea.toLocaleString()}㎡\n• 잔여비율 ${land.remainingRatio}%`;
                                              }
                                              
                                              // If this is multi-parcel and explanation contains all parcels info,
                                              // extract only the current parcel's info
                                              if (isMultipleLands && explanation.includes("[필지")) {
                                                const lines = explanation.split("\n");
                                                const currentLandIndex = selectedLandIndex;
                                                const landMarkerRegex = new RegExp(`\\[필지\\s*${currentLandIndex + 1}\\]`);
                                                const nextLandRegex = /\[필지\s*\d+\]/;
                                                
                                                let startIdx = -1;
                                                let endIdx = lines.length;
                                                
                                                // Find the current parcel's section
                                                for (let i = 0; i < lines.length; i++) {
                                                  if (landMarkerRegex.test(lines[i])) {
                                                    startIdx = i;
                                                  } else if (startIdx !== -1 && nextLandRegex.test(lines[i])) {
                                                    endIdx = i;
                                                    break;
                                                  }
                                                }
                                                
                                                if (startIdx !== -1) {
                                                  // Extract current parcel info and add general analysis
                                                  const currentParcelLines = lines.slice(startIdx, endIdx);
                                                  
                                                  // Find the summary/general part (above first [필지])
                                                  const summaryEndIdx = lines.findIndex(l => l.includes("[필지"));
                                                  const summaryLines = summaryEndIdx > 0 ? lines.slice(0, summaryEndIdx).filter(l => l.trim()) : [];
                                                  
                                                  const filtered = [...summaryLines, ...currentParcelLines].join("\n").trim();
                                                  return filtered || explanation;
                                                }
                                              }
                                              
                                              return explanation;
                                            })()}
                                          </pre>
                                        </div>
                                      </div>
                                      
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
                                                  className={`text-xs ${check.isMet ? "bg-green-600" : ""}`}
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
                          </div>
                        );
                      })()}
                    </>
                  ) : (
                    <>
                      {/* 선택된 필지의 담당자 재분석 결과 표시 */}
                      {(() => {
                        const land = applicationLands[selectedLandIndex];
                        if (!land) return null;
                        
                        const result = adminLandAIResults[land.id];
                        // 재분석 결과가 없으면 민원인 결과 사용
                        const landResult = result || landAIResults[land.id];
                        const judgment = result?.provisionalJudgment || landResult?.provisionalJudgment || application.aiResult?.provisionalJudgment;
                        
                        return (
                          <div className={`rounded-lg border p-4 ${
                            judgment === "매수"
                              ? "border-green-600/20 bg-green-600/5"
                              : judgment === "기각"
                                ? "border-red-200 bg-red-50/50"
                                : "border-slate-200 bg-slate-50/50"
                          }`}>
                            {result && (
                              <div className="flex items-center gap-2 mb-3 pb-2 border-b">
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  담당자 재분석 결과
                                </Badge>
                              </div>
                            )}
                            
                            {/* 편입 정보 */}
                            <div className="rounded-lg bg-white/60 p-3 border mb-4">
                              <p className="text-xs font-medium text-muted-foreground mb-2">편입 정보</p>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                                    <div>
                                      <span className="text-muted-foreground">편입 전 면적:</span>
                                      <span className="ml-1 font-medium">{land.originalArea.toLocaleString()}㎡</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">편입 면적:</span>
                                      <span className="ml-1 font-medium">{(land.includedArea ?? ((land.originalArea ?? 0) - (land.remainingArea ?? 0))).toLocaleString()}m²</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">잔여 면적:</span>
                                      <span className="ml-1 font-medium">{land.remainingArea.toLocaleString()}m²</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">잔여 비율:</span>
                                      <span className="ml-1 font-medium">{land.remainingRatio}%</span>
                                    </div>
                                <div>
                                  <span className="text-muted-foreground">형상지수 변화:</span>
                                  <span className="ml-1 font-medium">{(result || landResult)?.shapeIndexChange != null ? `+${(result || landResult).shapeIndexChange.toFixed(1)}` : "-"}</span>
                                </div>
                              </div>
                            </div>

                            {/* 상세 분석 내용 - 담당자 또는 민원인 결과 */}
                            <div className="space-y-4">
                              {/* 판단 요약 */}
                              {(landResult?.judgmentRationale || result?.judgmentRationale) && (
                                <div className="flex items-start gap-2">
                                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                  <div>
                                    <h4 className="text-sm font-semibold text-foreground">판단 요약</h4>
                                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{(result || landResult)?.judgmentRationale?.summary}</p>
                                  </div>
                                </div>
                              )}

                              {/* 법적 근거 */}
                              {(landResult?.judgmentRationale || result?.judgmentRationale) && (
                                <div className="flex items-start gap-2">
                                  <Scale className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                                  <div>
                                    <h4 className="text-sm font-semibold text-foreground">법적 근거</h4>
                                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{(result || landResult)?.judgmentRationale?.legalBasis}</p>
                                  </div>
                                </div>
                              )}

                              {/* 적용 기준 */}
                              {(landResult?.judgmentRationale || result?.judgmentRationale) && (
                                <div className="flex items-start gap-2">
                                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                  <div>
                                    <h4 className="text-sm font-semibold text-foreground">적용 기준</h4>
                                    <ul className="mt-1 space-y-1">
                                      {((result || landResult)?.judgmentRationale?.appliedCriteria || []).map((criteria, cIdx) => (
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
                              {((result || landResult)?.judgmentRationale?.manualCheckItems?.length ?? 0) > 0 && (
                                <div className="flex items-start gap-2">
                                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                                  <div>
                                    <h4 className="text-sm font-semibold text-foreground">수동 확인 항목</h4>
                                    <ul className="mt-1 space-y-1">
                                      {((result || landResult)?.judgmentRationale?.manualCheckItems || []).map((item, mIdx) => (
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
                              {(result || landResult)?.judgmentRationale?.detailedExplanation && (
                                <div className="flex items-start gap-2">
                                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                  <div>
                                    <h4 className="text-sm font-semibold text-foreground">상세 분석</h4>
                                    <pre className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                                      {(result || landResult)?.judgmentRationale?.detailedExplanation}
                                    </pre>
                                  </div>
                                </div>
                              )}
                              
                              {/* 판정 기준 충족 여부 */}
                              {((result || landResult)?.criteriaChecks?.length ?? 0) > 0 && (
                                <div className="rounded-lg bg-white/60 p-3 border">
                                  <p className="text-xs font-medium text-muted-foreground mb-2">판정 기준 충족 여부</p>
                                  <div className="space-y-2">
                                    {((result || landResult)?.criteriaChecks || []).map((check, cIdx) => (
                                      <div key={cIdx} className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">{check.criteriaName}</span>
                                        <Badge 
                                          variant={check.isMet ? "default" : "destructive"} 
                                          className={`text-xs ${check.isMet ? "bg-green-600" : ""}`}
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
                                            {landOptions.waterChannelLost && <Badge variant="outline" className="border-blue-400 text-blue-700 text-xs">관개수�� 상실</Badge>}
                                            {landOptions.farmMachineDifficulty && <Badge variant="outline" className="border-blue-400 text-blue-700 text-xs">농기계 회전 곤란</Badge>}
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
                                  
                              {/* 분석 프로���스 상세 보기 ��튼 */}
                              <Button
                                variant="outline"
                                className="h-12 w-full gap-2 mt-3 text-base bg-black text-white hover:bg-gray-800 hover:text-white border-black"
                                onClick={() => {
                                  setShowAnalysisFlow(true);
                                }}
                              >
                                <PlayCircle className="h-4 w-4" />
                                분석 프로세스 상세 보기
                              </Button>
                            </div>
                          </div>
                        );
                      })()}
                    </>
                  )}
                </div>
              </div>
            </TabsContent>
            </Tabs>
          </div>

          {/* 2-3. 담당자 검토 */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold ">담당자 검토</h3>
            <p className="text-sm text-muted-foreground">선택된 필지의 판정과 검토 의견을 입력하세요</p>
          {(() => {
            const landReview = landReviewDataList[selectedLandIndex];
            const land = applicationLands[selectedLandIndex];
            if (!land || !landReview) return null;
            
            // 담당자 AI 분석 결과 우선, 없으면 민원인 AI 분석 결과 사용
            const adminResult = adminLandAIResults[land.id];
            const citizenResult = landAIResults[land.id] || application.aiResult;
            const aiResult = adminResult || citizenResult;
            
            return (
              <div className="space-y-6">
                {/* AI 판정 정보 */}
                {aiResult?.provisionalJudgment && (
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <Badge variant="outline" className={`text-sm ${
                      adminResult ? "border-blue-500 text-blue-700" : "border-gray-400 text-gray-600"
                    }`}>
                      {adminResult ? "담당자 AI 판���" : "민원��� AI 판정"}: {aiResult.provisionalJudgment}
                    </Badge>
                  </div>
                )}
                
                {/* 매수 판정 */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">매수 판정</Label>
                  <div className="flex flex-wrap gap-2">
                    {(["매수", "기각", "심의위원회 이관"] as JudgmentResult[]).map((judgment) => {
                      const config = judgmentConfig[judgment];
                      const Icon = config.icon;
                      const isSelected = landReview.landJudgment === judgment;
                      return (
                        <Button
                          key={judgment}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => updateLandReviewData(selectedLandIndex, 'landJudgment', judgment)}
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
                  <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                    <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600">
                      AI 제안({aiResult.provisionalJudgment})과 다른 판정입니다. 검토 의견에 사유를 작성해주세요.
                    </p>
                  </div>
                )}
                
                {/* 검토 의견 */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">검토 의견</Label>
                  <Textarea
                    placeholder="해당 필지에 대한 검토 의견을 입력하세요..."
                    value={landReview.landComment}
                    onChange={(e) => updateLandReviewData(selectedLandIndex, 'landComment', e.target.value)}
                    className="min-h-[100px] resize-none"
                  />
                </div>
              </div>
            );
          })()}
          </div>

        </CardContent>
      </Card>

      {/* Section 03. 진행상황 선택 - 복수필지 전체에 대한 한 건 처리 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">진행상황 선택</CardTitle>
          <CardDescription>
            민원인이 신청 현황 조회 시 이 진행상황이 표시됩니다
          </CardDescription>
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

      {/* Section 04. 최종 검토 의견 */}
      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">최종 검토 의견</CardTitle>
          <CardDescription>
            모든 필지에 대한 종합적인 검토 의견을 작성해주세요. 이 내용은 심의서에 자동 입력됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 필지별 검토 현황 요약 */}
          <div className="mb-4 p-3 bg-background rounded-lg border">
            <p className="text-sm font-medium mb-2">필지별 검토 현황</p>
            <div className="flex flex-wrap gap-2">
              {applicationLands.map((land, idx) => {
                const review = landReviewDataList[idx];
                const isReviewed = review?.landJudgment !== null;
                return (
                  <Badge 
                    key={land.id}
                    variant={isReviewed ? "default" : "outline"}
                    className={isReviewed ? "bg-green-600" : "border-dashed"}
                  >
                    {String.fromCharCode(65 + idx)} {isReviewed ? review.landJudgment : "미검토"}
                  </Badge>
                );
              })}
            </div>
          </div>
          <Textarea
            placeholder="전체 필지에 대한 종합 검토 의견을 입력하세요..."
            rows={4}
            value={reviewData.reviewerComment || ""}
            onChange={(e) => setReviewData((prev) => ({ ...prev, reviewerComment: e.target.value }))}
            className="resize-none bg-background"
          />
        </CardContent>
      </Card>

      {/* AI 분석 프로세스 다이얼로그 - 관리자 재판독 결과 우선 표시 */}
      <AIAnalysisFlowDialog
        open={showAnalysisFlow}
        onOpenChange={setShowAnalysisFlow}
        aiResult={(() => {
          // 선����된 ���지의 관리��� 재판독 결과가 있으면 우선 사용
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

      {/* 상세 판독 결과 확장 패널 (Drawer) */}
      {isDetailPanelExpanded && expandedLandIndex !== null && (
        <div className="fixed inset-0 z-50 flex">
          {/* 배경 오버레이 */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsDetailPanelExpanded(false)}
          />
          
          {/* 확장 패널 */}
          <div className="relative flex w-full max-w-6xl bg-background shadow-2xl animate-in slide-in-from-left duration-300">
            {/* ��기 버튼 */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 z-10"
              onClick={() => setIsDetailPanelExpanded(false)}
            >
              <X className="h-5 w-5" />
            </Button>
            
            {/* 패널 내용 - 2단 레이아웃 */}
            <div className="flex flex-1 overflow-hidden">
              {/* 왼쪽: ���스트 정보 (판단 요약, 법적 근거) */}
              <div className="w-3/4 border-r overflow-y-auto p-6">
                <div className="space-y-6">
                  {/* 헤더 */}
                  <div>
                    <h2 className="text-xl font-bold text-foreground">상세 판독 결과</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {allLands[expandedLandIndex]?.address}
                    </p>
                  </div>

                  {/* 판단 요약 */}
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      판단 요약
                    </h3>
                    <p className="text-[15px] text-muted-foreground leading-relaxed">
                      {(() => {
                        const land = allLands[expandedLandIndex];
                        const result = citizenLandAIResults[land?.id];
                        return result?.judgmentRationale?.summary || 
                          `본 필지는 ${land?.landType} 유형으로, 잔여면적 ${land?.remainingArea?.toLocaleString()}㎡ (${land?.remainingRatio}%)입니다.`;
                      })()}
                    </p>
                  </div>

                  {/* 법적 근거 */}
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      ���적 근거
                    </h3>
                    <p className="text-[15px] text-muted-foreground leading-relaxed">
                      {(() => {
                        const land = allLands[expandedLandIndex];
                        const result = citizenLandAIResults[land?.id];
                        return result?.judgmentRationale?.legalBasis || 
                          "「공익사업을 위한 토지 등의 취득 및 보상에 관한 법��」 제74조 및 동법 시행규칙 제34조";
                      })()}
                    </p>
                  </div>

                  {/* 적용 기준 */}
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      적용 기준
                    </h3>
                    <ul className="space-y-2">
                      {(() => {
                        const land = allLands[expandedLandIndex];
                        const result = citizenLandAIResults[land?.id];
                        const criteria = result?.judgmentRationale?.appliedCriteria || [
                          "잔여지 면적 기준 미달 여부",
                          "잔여지 형상 변화 (정형 → 부정형)",
                          "접면도로 상태 변경 여부"
                        ];
                        return criteria.map((c: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-[15px] text-muted-foreground">
                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                            {c}
                          </li>
                        ));
                      })()}
                    </ul>
                  </div>

                  {/* 판정 결과 */}
                  <div className="rounded-lg border p-4">
                    <h3 className="text-sm font-semibold text-foreground mb-3">AI 판정 결과</h3>
                    <div className="flex items-center gap-3">
                      {(() => {
                        const land = allLands[expandedLandIndex];
                        const result = citizenLandAIResults[land?.id];
                        const judgment = result?.provisionalJudgment || "분석 필요";
                        return (
                          <JudgmentStatus 
                            judgment={judgment} 
                            variant="badge" 
                            size="md"
                          />
                        );
                      })()}
                      <span className="text-sm text-muted-foreground">
                        신뢰도: {(() => {
                          const land = allLands[expandedLandIndex];
                          const result = citizenLandAIResults[land?.id];
                          return result?.confidence ? `${result.confidence}%` : "-";
                        })()}
                      </span>
                    </div>
                  </div>

                  {/* 상세 설명 */}
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <h3 className="text-sm font-semibold text-foreground mb-3">상세 분�� ��용</h3>
                    <pre className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">
                      {(() => {
                        const land = allLands[expandedLandIndex];
                        const result = citizenLandAIResults[land?.id];
                        return result?.judgmentRationale?.detailedExplanation || 
                          `[필지 정보]\n주소: ${land?.address}\n지목: ${land?.landType} (${land?.landCategory})\n편입 전 면적: ${land?.originalArea?.toLocaleString()}㎡\n잔여 면적: ${land?.remainingArea?.toLocaleString()}㎡ (${land?.remainingRatio}%)`;
                      })()}
                    </pre>
                  </div>
                </div>
              </div>

              {/* 오른쪽: AI 판��� 분석 이미지 */}
              <div className="w-1/4 bg-muted/20 p-6 overflow-y-auto">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    AI 판독 분석 이미지
                  </h3>
                  
                  {/* 지적도 이미지 */}
                  <div className="rounded-lg border bg-background overflow-hidden">
                    <div className="aspect-square relative z-0">
                      <LeafletMap
                        parcels={allLands.map((l, i) => ({
                          id: l.id,
                          coordinates: [
                            [37.5665 + (i * 0.001), 126.9780],
                            [37.5665 + (i * 0.001), 126.9790],
                            [37.5675 + (i * 0.001), 126.9790],
                            [37.5675 + (i * 0.001), 126.9780],
                          ],
                          address: l.address,
                          landCategory: l.landCategory,
                          area: l.remainingArea,
                          owner: application.applicantName,
                          isOwned: true,
                          lotNumber: l.address.split(" ").pop() || "",
                        }))}
                        selectedParcelIds={[allLands[expandedLandIndex]?.id]}
                        onParcelSelect={() => {}}
                        height="100%"
                        showControls={false}
                      />
                    </div>
                    <div className="p-3 border-t bg-muted/30">
                      <p className="text-xs text-muted-foreground text-center">
                        편입 전후 토지 형상 분석
                      </p>
                    </div>
                  </div>

                  {/* 분석 시각화 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border bg-background p-4">
                      <p className="text-xs text-muted-foreground mb-2">잔여 ���적</p>
                      <p className="text-2xl font-bold text-foreground">
                        {allLands[expandedLandIndex]?.remainingArea?.toLocaleString()}
                        <span className="text-sm font-normal text-muted-foreground ml-1">㎡</span>
                      </p>
                      <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${allLands[expandedLandIndex]?.remainingRatio || 0}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        원래 면적의 {allLands[expandedLandIndex]?.remainingRatio}%
                      </p>
                    </div>
                    
                    <div className="rounded-lg border bg-background p-4">
                      <p className="text-xs text-muted-foreground mb-2">형상지수 변화</p>
                      <p className="text-2xl font-bold text-foreground">
                        {(() => {
                          const land = allLands[expandedLandIndex];
                          const result = citizenLandAIResults[land?.id];
                          return result?.shapeIndexChange != null ? `+${result.shapeIndexChange.toFixed(1)}` : "-";
                        })()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {allLands[expandedLandIndex]?.remainingShape === "부정형" ? "정형 → 부정형 변화" : "형상 유지"}
                      </p>
                    </div>
                  </div>

                  {/* 참고 안내 */}
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
                    <Info className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-700">
                      AI 판독 분석 이���지는 참고용이며, 실제 측량 결과와 다를 수 있습니다.
                      최종 판정은 ��당자의 현장 확인 및 검토에 따라 결정됩니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 하단 저장 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 w-screen bg-background border-t py-4 px-6 mt-6 z-[9999]">
        <div className="flex justify-end gap-3">
          <Button variant="outline" className="text-foreground border-foreground hover:bg-foreground/5" onClick={onBack}>
            취소
          </Button>
          <Button onClick={handleSave}>
            저장
          </Button>
        </div>
      </div>

      {/* 파일 미리보기 Dialog */}
      <Dialog open={showPdfPreview} onOpenChange={setShowPdfPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle>{selectedAttachment?.name}</DialogTitle>
            <Button
              size="sm"
              onClick={() => {
                if (selectedAttachment) {
                  const link = document.createElement('a');
                  link.href = selectedAttachment.url;
                  link.download = selectedAttachment.name;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }
              }}
              className="ml-auto"
            >
              <Download className="h-4 w-4 mr-2" />
              다운로드
            </Button>
          </DialogHeader>
          <div className="mt-4 flex flex-col gap-4">
            {selectedAttachment && (
              <>
                {selectedAttachment.name.toLowerCase().endsWith('.pdf') ? (
                  <div className="w-full bg-gray-100 rounded-lg border p-4 min-h-[500px]">
                    <div className="flex flex-col items-center justify-center h-full gap-4">
                      <FileText className="h-16 w-16 text-muted-foreground" />
                      <div className="text-center">
                        <p className="font-semibold text-foreground">{selectedAttachment.name}</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          PDF 문서
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full bg-gray-100 rounded-lg border p-4">
                    <div className="flex flex-col items-center justify-center gap-4 py-8">
                      <ImageIcon className="h-16 w-16 text-muted-foreground" />
                      <div className="text-center">
                        <p className="font-semibold text-foreground">{selectedAttachment.name}</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          이미지 문서
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
