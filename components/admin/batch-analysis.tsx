"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  CheckCircle2, 
  XCircle, 
  ChevronLeft,
  ChevronRight,
  Loader2,
  MapPin
} from "lucide-react";
import { 
  SearchInput, 
  RadioFilterGroup, 
  PublishRadioCell, 
  AIJudgmentBadge, 
  isHighPossibility 
} from "@/components/admin/shared";
import { PaginationButton, PaginationNavButton } from "@/components/ui/pagination-button";
import { useToast } from "@/hooks/use-toast";
import type { 
  ProcessedParcel, 
  AnalysisHistory,
  LandCategory, 
  LandShape,
  ParcelPublishStatus,
  AIJudgmentResult,
  ResidualStatus
} from "@/lib/types";
import { 
  dummyProcessedParcels,
  landCategories, 
  landShapes, 
} from "@/lib/dummy-data";
import { formatDateTime } from "@/lib/format";

interface BatchAnalysisProps {
  businessUnit?: string;
  onAnalysisComplete?: () => void;
  parcels?: ProcessedParcel[];
  onParcelsUpdate?: (parcels: ProcessedParcel[]) => void;
  onParcelSelect?: (parcel: ProcessedParcel) => void;
}

export function BatchAnalysis({ 
  businessUnit, 
  onAnalysisComplete,
  parcels: externalParcels,
  onParcelsUpdate,
  onParcelSelect
}: BatchAnalysisProps) {
  // 필지 목록
  const [parcels, setParcels] = useState<ProcessedParcel[]>(externalParcels || dummyProcessedParcels);
  
  // 검색어
  const [searchQuery, setSearchQuery] = useState("");
  
  // 사업단 목록 추출
  const businessUnits = useMemo(() => {
    const units = new Set(parcels.map(p => p.businessUnit));
    return Array.from(units).sort();
  }, [parcels]);
  
  // 필터 (라디오 버튼)
  const [aiJudgmentFilter, setAiJudgmentFilter] = useState<"all" | "high" | "low" | "pending">("all");
  const [businessUnitFilter, setBusinessUnitFilter] = useState<string>("");
  const [visibilityFilter, setVisibilityFilter] = useState<"all" | "visible" | "hidden">("all");
  // 편입 유형 필터 (기존 잔여지 판정)
  const [inclusionTypeFilter, setInclusionTypeFilter] = useState<"all" | "full" | "partial" | "pending">("all");
  
  // 사업단 필터 기본값 설정 (첫 번째 사업단)
  useEffect(() => {
    if (businessUnits.length > 0 && !businessUnitFilter) {
      setBusinessUnitFilter(businessUnits[0]);
    }
  }, [businessUnits, businessUnitFilter]);
  
  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  
  // 토스트
  const { toast } = useToast();

  // 히스토리 다이얼로그
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [selectedHistoryParcel, setSelectedHistoryParcel] = useState<ProcessedParcel | null>(null);
  const [analysisOptions, setAnalysisOptions] = useState({
    useCurrentUsage: true,
    useLandShape: true,
  });

  // 배치 분석을 위한 필지 선택
  const [selectedParcelIds, setSelectedParcelIds] = useState<Set<string>>(new Set());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isInclusionAnalyzing, setIsInclusionAnalyzing] = useState(false);
  const [isPurchaseAnalyzing, setIsPurchaseAnalyzing] = useState(false);
  const [analyzingParcelId, setAnalyzingParcelId] = useState<string | null>(null);

  // 관리 토글 확인 모달 상태
  const [showVisibilityModal, setShowVisibilityModal] = useState(false);
  const [pendingVisibilityChange, setPendingVisibilityChange] = useState<{parcelId: string, isVisible: boolean} | null>(null);

  // 필지 선택/해제 토글
  const handleToggleParcelSelection = (parcelId: string) => {
    setSelectedParcelIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(parcelId)) {
        newSet.delete(parcelId);
      } else {
        newSet.add(parcelId);
      }
      return newSet;
    });
  };

  // 전체 선택/해제
  const handleToggleSelectAll = () => {
    if (selectedParcelIds.size === filteredParcels.length) {
      setSelectedParcelIds(new Set());
    } else {
      setSelectedParcelIds(new Set(filteredParcels.map(p => p.id)));
    }
  };

  // 단일 필지 분석 실행
  const handleAnalyzeSingleParcel = async (parcelId: string) => {
    setAnalyzingParcelId(parcelId);
    try {
      const parcel = parcels.find(p => p.id === parcelId);
      if (!parcel) return;

      const newAnalysisResult: AIJudgmentResult = {
        provisionalJudgment: Math.random() > 0.5 ? "매수 가능성 높음" : "매수 가능성 낮음",
        reason: "AI 자동 분석 결과"
      };

      const newHistory: AnalysisHistory = {
        id: `analysis_${Date.now()}_${Math.random()}`,
        stage: parcel.analysisHistory?.length ? "2차분석" : "1차분석",
        analyzedAt: new Date().toISOString(),
        analyzedBy: "AI 자동 분석",
        newResult: newAnalysisResult.provisionalJudgment,
        previousResult: parcel.aiResult?.provisionalJudgment || undefined,
        changedOptions: {},
      };

      const updatedParcel: ProcessedParcel = {
        ...parcel,
        aiResult: newAnalysisResult,
        analysisHistory: [...(parcel.analysisHistory || []), newHistory],
        lastAnalyzedAt: new Date().toISOString(),
        isVisible: true,
      };

      setParcels(prev =>
        prev.map(p => p.id === parcelId ? updatedParcel : p)
      );

      onAnalysisComplete?.();
    } finally {
      setAnalyzingParcelId(null);
    }
  };

  // 단일 필지 분석 실행
  const handleSingleAnalysis = async (parcelId: string) => {
    setAnalyzingParcelId(parcelId);
    try {
      const parcel = parcels.find(p => p.id === parcelId);
      if (!parcel) return;

      // 분석 시뮬레이션 (1초 딜레이)
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newAnalysisResult: AIJudgmentResult = {
        provisionalJudgment: Math.random() > 0.5 ? "매수 가능성 높음" : "매수 가능성 낮음",
        reason: "AI 자동 분석 결과"
      };

      const newHistory: AnalysisHistory = {
        id: `analysis_${Date.now()}_${Math.random()}`,
        stage: parcel.analysisHistory?.length ? "2차분석" : "1차분석",
        analyzedAt: new Date().toISOString(),
        analyzedBy: "AI 자동 분석",
        newResult: newAnalysisResult.provisionalJudgment,
        previousResult: parcel.aiResult?.provisionalJudgment || undefined,
        changedOptions: {},
      };

      setParcels(prev => prev.map(p => 
        p.id === parcelId 
          ? {
              ...p,
              aiResult: newAnalysisResult,
              analysisHistory: [...(p.analysisHistory || []), newHistory],
              lastAnalyzedAt: new Date().toISOString(),
              isVisible: true,
            } as ProcessedParcel
          : p
      ));
    } finally {
      setAnalyzingParcelId(null);
    }
  };

  // AI 매수 가능성 분석 실행
  const handleBatchAnalysis = async () => {
    if (selectedParcelIds.size === 0) return;

    setIsPurchaseAnalyzing(true);
    try {
      // 분석 시뮬레이션 (1초 딜레이)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 선택된 필지들에 대해 분석 수행
      const parcelsToAnalyze = parcels.filter(p => selectedParcelIds.has(p.id));
      
      const updatedParcels = parcelsToAnalyze.map(parcel => {
        const newAnalysisResult: AIJudgmentResult = {
          provisionalJudgment: Math.random() > 0.5 ? "매수 가능성 높음" : "매수 가능성 낮음",
          reason: "AI 자동 분석 결과"
        };

        const newHistory: AnalysisHistory = {
          id: `analysis_${Date.now()}_${Math.random()}`,
          stage: parcel.analysisHistory?.length ? "2차분석" : "1차분석",
          analyzedAt: new Date().toISOString(),
          analyzedBy: "AI 자동 분석",
          newResult: newAnalysisResult.provisionalJudgment,
          previousResult: parcel.aiResult?.provisionalJudgment || undefined,
          changedOptions: {},
        };

        return {
          ...parcel,
          aiResult: newAnalysisResult,
          analysisHistory: [...(parcel.analysisHistory || []), newHistory],
          lastAnalyzedAt: new Date().toISOString(),
          isVisible: true,
        } as ProcessedParcel;
      });

      // 기존 필지들과 분석된 필지들 병합
      setParcels(prev => {
        const updated = [...prev];
        parcelsToAnalyze.forEach(analyzedParcel => {
          const idx = updated.findIndex(p => p.id === analyzedParcel.id);
          if (idx !== -1) {
            updated[idx] = updatedParcels.find(p => p.id === analyzedParcel.id)!;
          }
        });
        return updated;
      });

      toast({
        title: "AI 매수 가능성 분석 완료",
        description: `${selectedParcelIds.size}건의 AI 매수 가능성 분석이 완료되었습니다.`,
      });

      // 선택 초기화
      setSelectedParcelIds(new Set());
      onAnalysisComplete?.();
    } finally {
      setIsPurchaseAnalyzing(false);
    }
  };

  // 관리(노출/미노출) 토글 핸들러 - 모달 표시
  const handleToggleVisibilityRequest = (parcelId: string, isVisible: boolean) => {
    if (isVisible) {
      // 공개로 변경 시 확인 모달 표시
      setPendingVisibilityChange({ parcelId, isVisible });
      setShowVisibilityModal(true);
    } else {
      // 미노출로 변경 시 바로 적용
      handleToggleVisibility(parcelId, isVisible);
    }
  };

  // 실제 노출 상태 변경
  const handleToggleVisibility = (parcelId: string, isVisible: boolean) => {
    setParcels(prev => prev.map(p => 
      p.id === parcelId ? { ...p, isVisible } : p
    ));
    onParcelsUpdate?.(parcels.map(p => 
      p.id === parcelId ? { ...p, isVisible } : p
    ));
  };

  // 모달 확인 시 노출 변경 적용
  const handleConfirmVisibilityChange = () => {
    if (pendingVisibilityChange) {
      handleToggleVisibility(pendingVisibilityChange.parcelId, pendingVisibilityChange.isVisible);
      toast({
        title: "공개 설정 완료",
        description: "해당 필지가 민원인에게 공개되었습니다.",
      });
    }
    setShowVisibilityModal(false);
    setPendingVisibilityChange(null);
  };

  // 선택 필지 편입 유형 분석 실행 핸들러 (기존 잔여지 판정)
  const handleInclusionTypeAnalysis = async () => {
    if (selectedParcelIds.size === 0) return;
    
    setIsInclusionAnalyzing(true);
    try {
      // 분석 시뮬레이션 (1초 딜레이)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedParcels = parcels.map(p => {
        if (!selectedParcelIds.has(p.id)) return p;
        
        // 편입 유형 결과 생성 (전체 편입 또는 부분 편입)
        const residualStatus = Math.random() > 0.3 ? "잔여지 인정" : "기준 미달" as const;
        
        return {
          ...p,
          residualStatus,
        } as ProcessedParcel;
      });
      
      setParcels(updatedParcels);
      onParcelsUpdate?.(updatedParcels);
      
      toast({
        title: "편입 유형 분석 완료",
        description: `${selectedParcelIds.size}건의 편입 유형 분석이 완료되었습니다.`,
      });
      
      setSelectedParcelIds(new Set());
    } finally {
      setIsInclusionAnalyzing(false);
    }
  };

  // 필터링된 필지 목록
  const filteredParcels = useMemo(() => {
    return parcels.filter(parcel => {
      // 면적이 0인 필지 제외
      if (parcel.landInfo.remainingArea === 0) return false;
      
      // 사업단 필터 (props로 전달된 것 또는 Select로 선택된 것)
      if (businessUnit && parcel.businessUnit !== businessUnit) return false;
      if (businessUnitFilter && parcel.businessUnit !== businessUnitFilter) return false;
      
      // 검색어 필터
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesAddress = parcel.landInfo.address.toLowerCase().includes(query);
        const matchesOwner = parcel.landInfo.ownerName.toLowerCase().includes(query);
        const matchesBusinessUnit = parcel.businessUnit.toLowerCase().includes(query);
        if (!matchesAddress && !matchesOwner && !matchesBusinessUnit) return false;
      }
      
      // AI 판정 필터 (라디오)
      if (aiJudgmentFilter !== "all") {
        if (aiJudgmentFilter === "pending") {
          if (parcel.aiResult) return false;
        } else {
          if (!parcel.aiResult) return false;
          const isHigh = isHighPossibility(parcel.aiResult.provisionalJudgment);
          if (aiJudgmentFilter === "high" && !isHigh) return false;
          if (aiJudgmentFilter === "low" && isHigh) return false;
        }
      }
      
      // 관리(노출/미노출) 필터
      if (visibilityFilter !== "all") {
        const isVisible = parcel.isVisible !== false;
        if (visibilityFilter === "visible" && !isVisible) return false;
        if (visibilityFilter === "hidden" && isVisible) return false;
      }
      
      // 편입 유형 필터 (기존 잔여지 판정)
      if (inclusionTypeFilter !== "all") {
        if (inclusionTypeFilter === "pending") {
          if (parcel.residualStatus) return false;
        } else if (inclusionTypeFilter === "full") {
          // 전체 편입 = 기준 미달 (잔여지 미발생)
          if (parcel.residualStatus !== "기준 미달") return false;
        } else if (inclusionTypeFilter === "partial") {
          // 부분 편입 = 잔여지 인정 (잔여지 발생)
          if (parcel.residualStatus !== "잔여지 인정") return false;
        }
      }
      
      return true;
    });
  }, [parcels, businessUnit, businessUnitFilter, searchQuery, aiJudgmentFilter, visibilityFilter, inclusionTypeFilter]);

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredParcels.length / itemsPerPage);
  const paginatedParcels = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredParcels.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredParcels, currentPage, itemsPerPage]);

  // 필터 변경 시 페이지 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, aiJudgmentFilter, businessUnitFilter, visibilityFilter, inclusionTypeFilter]);

  // 통계 (검색값에 영향 받지 않음 - 전체 데이터 기준)
  const stats = useMemo(() => {
    // businessUnit 필터만 적용, 검색어/AI판정/관리 필터는 제외
    const relevantParcels = parcels.filter(parcel => {
      if (businessUnit && parcel.businessUnit !== businessUnit) return false;
      if (businessUnitFilter && parcel.businessUnit !== businessUnitFilter) return false;
      return true;
    });
    
    const total = relevantParcels.length;
    // 전체 편입 = 기준 미달 (잔여지 미발생)
    const fullInclusion = relevantParcels.filter(p => p.residualStatus === "기준 미달").length;
    // 부분 편입 = 잔여지 인정 (잔여지 발생)
    const partialInclusion = relevantParcels.filter(p => p.residualStatus === "잔여지 인정").length;
    const highPossibility = relevantParcels.filter(p => 
      p.aiResult && isHighPossibility(p.aiResult.provisionalJudgment)
    ).length;
    const lowPossibility = relevantParcels.filter(p => 
      p.aiResult && !isHighPossibility(p.aiResult.provisionalJudgment)
    ).length;
    // 분석 대기 = 편입 유형 또는 매수 가능성이 아직 분석되지 않은 건
    const analysisPending = relevantParcels.filter(p => !p.residualStatus || !p.aiResult).length;
    
    return { total, fullInclusion, partialInclusion, highPossibility, lowPossibility, analysisPending };
  }, [parcels, businessUnit, businessUnitFilter]);

  // 히스토리 보기
  const handleViewHistory = (parcel: ProcessedParcel) => {
    setSelectedHistoryParcel(parcel);
    setShowHistoryDialog(true);
  };

  // 필지 상세 보기 (테이블 행 클릭)
  const handleParcelClick = (parcel: ProcessedParcel) => {
    if (onParcelSelect) {
      onParcelSelect(parcel);
    }
  };

  // 담당자 확인 완료 처리
  const handleConfirm = (parcelId: string) => {
    setParcels(prev => prev.map(p => {
      if (p.id === parcelId) {
        return {
          ...p,
          publishStatus: "담당자확인완료",
          confirmedAt: new Date().toISOString(),
          confirmedBy: "현재 담당자",
        } as ProcessedParcel;
      }
      return p;
    }));
  };

  // 공개 처리
  const handlePublish = (parcelId: string) => {
    setParcels(prev => prev.map(p => {
      if (p.id === parcelId) {
        return {
          ...p,
          publishStatus: "공개",
        } as ProcessedParcel;
      }
      return p;
    }));
  };

  // 미노출 처리
  const handleUnpublish = (parcelId: string) => {
    setParcels(prev => prev.map(p => {
      if (p.id === parcelId) {
        return {
          ...p,
          publishStatus: "담당자확인완료",
        } as ProcessedParcel;
      }
      return p;
    }));
  };

  return (
    <div className="space-y-6">
      {/* 타이틀 + 사업단(지구) 선택 영역 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-7 w-7 text-[#2E8B57]" />
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">필지 관리</h1>
          </div>
        </div>
        {/* 사업단(지구) 선택 - 최상위 전역 필터 */}
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
          <span className="text-sm font-medium text-slate-600">현재 사업지구:</span>
          <Select value={businessUnitFilter} onValueChange={setBusinessUnitFilter}>
            <SelectTrigger className="w-[220px] h-[38px] bg-white border-slate-300 font-medium">
              <SelectValue placeholder="사업단 선택" />
            </SelectTrigger>
            <SelectContent>
              {businessUnits.map((unit) => (
                <SelectItem key={unit} value={unit}>{unit}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <p className="text-muted-foreground -mt-4">편입 유형 분석 및 매수 가능성 심사를 관리합니다.</p>

      {/* 통계 카드 - 6개 */}
      <div className="grid grid-cols-6 gap-3">
        {/* 전체 필지 */}
        <div 
          className="flex cursor-pointer flex-col items-center rounded-lg bg-slate-50 p-4 transition-all hover:bg-slate-100 border border-slate-200"
          onClick={() => {
            setInclusionTypeFilter("all");
            setAiJudgmentFilter("all");
          }}
        >
          <span className="text-sm font-medium text-slate-600">전체 필지</span>
          <div className="flex items-baseline gap-0.5" style={{ marginTop: '8px' }}>
            <span className="font-bold text-slate-900" style={{ fontSize: '36px', lineHeight: '1em' }}>{stats.total}</span>
            <span className="text-xs font-medium ml-0.5" style={{ color: '#959595' }}>건</span>
          </div>
        </div>

        {/* 전체 편입 (잔여지 미발생) */}
        <div 
          className="flex cursor-pointer flex-col items-center rounded-lg bg-blue-50 p-4 transition-all hover:bg-blue-100 border border-blue-200"
          onClick={() => setInclusionTypeFilter("full")}
        >
          <span className="text-sm font-medium text-blue-600">전체 편입</span>
          <div className="flex items-baseline gap-0.5" style={{ marginTop: '8px' }}>
            <span className="font-bold text-blue-900" style={{ fontSize: '36px', lineHeight: '1em' }}>{stats.fullInclusion}</span>
            <span className="text-xs font-medium ml-0.5" style={{ color: '#959595' }}>건</span>
          </div>
        </div>
        
        {/* 부분 편입 (잔여지 발생) */}
        <div 
          className="flex cursor-pointer flex-col items-center rounded-lg bg-emerald-50 p-4 transition-all hover:bg-emerald-100 border border-emerald-200"
          onClick={() => setInclusionTypeFilter("partial")}
        >
          <span className="text-sm font-medium text-emerald-600">부분 편입</span>
          <div className="flex items-baseline gap-0.5" style={{ marginTop: '8px' }}>
            <span className="font-bold text-emerald-900" style={{ fontSize: '36px', lineHeight: '1em' }}>{stats.partialInclusion}</span>
            <span className="text-xs font-medium ml-0.5" style={{ color: '#959595' }}>건</span>
          </div>
        </div>
        
        {/* 매수 가능성 높음 */}
        <div 
          className="flex cursor-pointer flex-col items-center rounded-lg bg-teal-50 p-4 transition-all hover:bg-teal-100 border border-teal-200"
          onClick={() => setAiJudgmentFilter("high")}
        >
          <span className="text-sm font-medium text-teal-600">매수 가능성 높음</span>
          <div className="flex items-baseline gap-0.5" style={{ marginTop: '8px' }}>
            <span className="font-bold text-teal-900" style={{ fontSize: '36px', lineHeight: '1em' }}>{stats.highPossibility}</span>
            <span className="text-xs font-medium ml-0.5" style={{ color: '#959595' }}>건</span>
          </div>
        </div>
        
        {/* 매수 가능성 낮음 */}
        <div 
          className="flex cursor-pointer flex-col items-center rounded-lg bg-orange-50 p-4 transition-all hover:bg-orange-100 border border-orange-200"
          onClick={() => setAiJudgmentFilter("low")}
        >
          <span className="text-sm font-medium text-orange-600">매수 가능성 낮음</span>
          <div className="flex items-baseline gap-0.5" style={{ marginTop: '8px' }}>
            <span className="font-bold text-orange-900" style={{ fontSize: '36px', lineHeight: '1em' }}>{stats.lowPossibility}</span>
            <span className="text-xs font-medium ml-0.5" style={{ color: '#959595' }}>건</span>
          </div>
        </div>
        
        {/* 분석 대기 */}
        <div 
          className="flex cursor-pointer flex-col items-center rounded-lg bg-gray-50 p-4 transition-all hover:bg-gray-100 border border-gray-200"
          onClick={() => {
            setInclusionTypeFilter("pending");
            setAiJudgmentFilter("pending");
          }}
        >
          <span className="text-sm font-medium text-gray-600">분석 대기</span>
          <div className="flex items-baseline gap-0.5" style={{ marginTop: '8px' }}>
            <span className="font-bold text-gray-900" style={{ fontSize: '36px', lineHeight: '1em' }}>{stats.analysisPending}</span>
            <span className="text-xs font-medium ml-0.5" style={{ color: '#959595' }}>건</span>
          </div>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">검색 및 필터</CardTitle>
        </CardHeader>
        <CardContent>
          {/* 필터 레이아웃 - 2행 구조 */}
          <div className="space-y-4">
            {/* 1행: 검색바 */}
            <div className="flex items-center">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="소재지, 소유자명을 입력하세요"
                className="w-[700px]"
              />
            </div>
            
            {/* 2행: 편입 유형 + 매수 가능성 + 관리 필터 */}
            <div className="flex flex-wrap items-center gap-6">
              {/* 편입 유형 필터 */}
              <RadioFilterGroup
                label="편입 유형"
                name="inclusion-type"
                value={inclusionTypeFilter}
                onChange={(v) => setInclusionTypeFilter(v as "all" | "full" | "partial" | "pending")}
                options={[
                  { value: "all", label: "전체" },
                  { value: "pending", label: "분석 대기" },
                  { value: "full", label: "전체 편입" },
                  { value: "partial", label: "부분 편입" }
                ]}
              />
              
              {/* 매수 가능성 필터 */}
              <RadioFilterGroup
                label="매수 가능성"
                name="ai-judgment"
                value={aiJudgmentFilter}
                onChange={(v) => setAiJudgmentFilter(v as "all" | "high" | "low" | "pending")}
                options={[
                  { value: "all", label: "전체" },
                  { value: "pending", label: "분석 대기" },
                  { value: "high", label: "높음" },
                  { value: "low", label: "낮음" }
                ]}
              />
              
              {/* 관리 필터 */}
              <RadioFilterGroup
                label="관리"
                name="visibility"
                value={visibilityFilter}
                onChange={(v) => setVisibilityFilter(v as "all" | "visible" | "hidden")}
                options={[
                  { value: "all", label: "전체" },
                  { value: "visible", label: "노출" },
                  { value: "hidden", label: "미노출" }
                ]}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 필지 목록 테이블 */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">필지 관리 목록</CardTitle>
              <CardDescription>
                편입 유형 및 매수 가능성 분석 결과를 확인하세요. 소재지를 클릭하면 필지 상세 화면으로 이동합니다.
              </CardDescription>
            </div>
            {/* 분석 버튼 */}
            <div className="flex items-center gap-2">
              <Button
                onClick={handleInclusionTypeAnalysis}
                disabled={selectedParcelIds.size === 0 || isInclusionAnalyzing || isPurchaseAnalyzing}
                variant="cta-outline"
                className="whitespace-nowrap"
              >
                {isInclusionAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    분석 중...
                  </>
                ) : (
                  `잔여지 판독 실행 (${selectedParcelIds.size}건)`
                )}
              </Button>
              <Button
                onClick={handleBatchAnalysis}
                disabled={selectedParcelIds.size === 0 || isInclusionAnalyzing || isPurchaseAnalyzing}
                variant="cta"
                className="whitespace-nowrap"
              >
                {isPurchaseAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    분석 중...
                  </>
                ) : (
                  `AI 매수 가능성 분석 (${selectedParcelIds.size}건)`
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto border rounded-lg">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-12 text-center">
                    <input
                      type="checkbox"
                      checked={selectedParcelIds.size === filteredParcels.length && filteredParcels.length > 0}
                      onChange={handleToggleSelectAll}
                      className="w-4 h-4 cursor-pointer"
                      title="모두 선택"
                    />
                  </TableHead>
                  <TableHead className="w-12 text-center">No.</TableHead>
                  <TableHead>소재지</TableHead>
                  <TableHead className="text-center">면적(㎡)</TableHead>
                  <TableHead className="text-center">편입 유형</TableHead>
                  <TableHead className="text-center">매수 가능성</TableHead>
                  <TableHead className="text-center">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedParcels.map((parcel, index) => (
                  <TableRow 
                    key={parcel.id} 
                    className={`hover:bg-muted/50 ${selectedParcelIds.has(parcel.id) ? 'bg-blue-50' : ''}`}
                  >
                    <TableCell className="text-center">
                      <input
                        type="checkbox"
                        checked={selectedParcelIds.has(parcel.id)}
                        onChange={() => handleToggleParcelSelection(parcel.id)}
                        className="w-4 h-4 cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </TableCell>
                    <TableCell 
                      className="font-medium max-w-[200px] truncate underline cursor-pointer hover:text-primary" 
                      title={parcel.landInfo.address}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleParcelClick(parcel);
                      }}
                    >
                      {parcel.landInfo.address}
                    </TableCell>
                    <TableCell className="text-center">
                      {parcel.landInfo.remainingArea.toLocaleString()}
                    </TableCell>
                    {/* 편입 유형 컬럼 */}
                    <TableCell className="text-center">
                      {isInclusionAnalyzing && selectedParcelIds.has(parcel.id) ? (
                        <div className="flex items-center justify-center gap-1">
                          <Loader2 className="h-4 w-4 animate-spin text-[#2E8B57]" />
                          <span className="text-xs text-[#2E8B57]">분석중</span>
                        </div>
                      ) : parcel.residualStatus === "잔여지 인정" ? (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0">
                          부분 편입
                        </Badge>
                      ) : parcel.residualStatus === "기준 미달" ? (
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0">
                          전체 편입
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-500 hover:bg-gray-100 border-0">
                          분석 대기
                        </Badge>
                      )}
                    </TableCell>
                    {/* 매수 가능성 컬럼 */}
                    <TableCell className="text-center">
                      {isPurchaseAnalyzing && selectedParcelIds.has(parcel.id) ? (
                        <div className="flex items-center justify-center gap-1">
                          <Loader2 className="h-4 w-4 animate-spin text-[#2E8B57]" />
                          <span className="text-xs text-[#2E8B57]">분석중</span>
                        </div>
                      ) : parcel.aiResult ? (
                        <AIJudgmentBadge judgment={parcel.aiResult.provisionalJudgment} />
                      ) : (
                        <Badge className="bg-gray-100 text-gray-500 hover:bg-gray-100 border-0">
                          분석 대기
                        </Badge>
                      )}
                    </TableCell>
                    {/* 관리 컬럼 - 토글 스위치 */}
                    <TableCell className="text-center">
                      {(parcel.citizenActivity?.applicationSubmitted || parcel.citizenActivity?.inCart) ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <Switch
                            checked={parcel.isVisible !== false}
                            disabled={true}
                            className="data-[state=checked]:bg-[#2E8B57] opacity-50"
                          />
                          <span className="text-sm text-muted-foreground w-[42px] text-left">{parcel.isVisible !== false ? "노출" : "미노출"}</span>
                          <span className="text-xs">🔒</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1.5">
                          <Switch
                            checked={parcel.isVisible !== false}
                            onCheckedChange={(checked) => handleToggleVisibilityRequest(parcel.id, checked)}
                            className="data-[state=checked]:bg-[#2E8B57]"
                          />
                          <span className="text-sm text-muted-foreground w-[42px] text-left">{parcel.isVisible !== false ? "노출" : "미노출"}</span>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredParcels.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      조건에 맞는 필지가 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4 mt-4">
              <PaginationNavButton
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                처음
              </PaginationNavButton>
              <PaginationNavButton
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                이전
              </PaginationNavButton>
              
              {/* 페이지 번호 */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <PaginationButton
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      isActive={currentPage === pageNum}
                    >
                      {pageNum}
                    </PaginationButton>
                  );
                })}
              </div>
              
              <PaginationNavButton
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                다음
              </PaginationNavButton>
              <PaginationNavButton
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                마지막
              </PaginationNavButton>
              
              <span className="text-sm text-muted-foreground ml-2">
                ({filteredParcels.length}건 중 {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredParcels.length)}건)
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 관리 토글 확인 모달 */}
      <Dialog open={showVisibilityModal} onOpenChange={setShowVisibilityModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>필지 정보 공개 확인</DialogTitle>
            <DialogDescription className="pt-2 leading-relaxed">
              해당 필지의 상세 정보와 AI 분석 결과를 민원인에게 공개하시겠습니까?
              <br /><br />
              공개 시 민원인이 직접 정보를 조회하고 매수 신청을 진행할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowVisibilityModal(false);
                setPendingVisibilityChange(null);
              }}
            >
              취소
            </Button>
            <Button 
              variant="cta"
              onClick={handleConfirmVisibilityChange}
            >
              공개하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 히스토리 다이얼로그 */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>분석 히스토리</DialogTitle>
            <DialogDescription>
              {selectedHistoryParcel?.landInfo.address}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {selectedHistoryParcel?.analysisHistory.map((history, index) => (
              <Card key={history.id} className={index === 0 ? "border-primary" : ""}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={history.stage === "1차분석" ? "default" : "secondary"}>
                          {history.stage}
                        </Badge>
                        {index === 0 && <Badge variant="outline">최신</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(history.analyzedAt)} | {history.analyzedBy}
                      </p>
                    </div>
                    <div className="text-right">
                      {history.previousResult && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className={history.previousResult.includes("높음") || history.previousResult === "수용가능" ? "text-emerald-600" : "text-rose-600"}>
                            {history.previousResult}
                          </span>
                          <span>→</span>
                          <span className={history.newResult.includes("높음") || history.newResult === "수용가능" ? "text-emerald-600 font-medium" : "text-rose-600 font-medium"}>
                            {history.newResult}
                          </span>
                        </div>
                      )}
                      {!history.previousResult && (
                        <span className={history.newResult.includes("높음") || history.newResult === "수용가능" ? "text-emerald-600 font-medium" : "text-rose-600 font-medium"}>
                          {history.newResult}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {history.changeReason && (
                    <div className="mt-3 p-2 bg-muted rounded text-sm">
                      <strong>변경 사유:</strong> {history.changeReason}
                    </div>
                  )}
                  {history.memo && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      <strong>메모:</strong> {history.memo}
                    </div>
                  )}
                  {history.changedOptions && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {history.changedOptions.currentUsage && (
                        <Badge variant="outline">활용지목: {history.changedOptions.currentUsage}</Badge>
                      )}
                      {history.changedOptions.landShape && (
                        <Badge variant="outline">토지형상: {history.changedOptions.landShape}</Badge>
                      )}
                      {history.changedOptions.farmMachineDifficulty && (
                        <Badge variant="outline">농기계 진입불가</Badge>
                      )}
                      {history.changedOptions.accessRoadLost && (
                        <Badge variant="outline">접면도로 상실</Badge>
                      )}
                      {history.changedOptions.waterChannelLost && (
                        <Badge variant="outline">관개수로 상실</Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {selectedHistoryParcel?.analysisHistory.length === 0 && (
              <p className="text-center py-8 text-muted-foreground">
                분석 히스토리가 없습니다.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowHistoryDialog(false)}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
