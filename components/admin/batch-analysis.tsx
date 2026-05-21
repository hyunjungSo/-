"use client";

import { useState, useMemo } from "react";
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
  Filter
} from "lucide-react";
import { 
  SearchInput, 
  RadioFilterGroup, 
  PublishRadioCell, 
  AIJudgmentBadge, 
  isHighPossibility 
} from "@/components/admin/shared";
import type { 
  ProcessedParcel, 
  AnalysisHistory,
  LandCategory, 
  LandShape,
  ParcelPublishStatus,
  AIJudgmentResult
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
  
  // 필터 (라디오 버튼)
  const [aiJudgmentFilter, setAiJudgmentFilter] = useState<"all" | "high" | "low">("all");
  const [businessUnitFilter, setBusinessUnitFilter] = useState<string>("all");
  
  // 사업단 목록 추출
  const businessUnits = useMemo(() => {
    const units = new Set(parcels.map(p => p.businessUnit));
    return Array.from(units).sort();
  }, [parcels]);
  
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
  const [analyzingParcelId, setAnalyzingParcelId] = useState<string | null>(null);

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

  // 배치 분석 실행
  const handleBatchAnalysis = async () => {
    if (selectedParcelIds.size === 0) return;

    setIsAnalyzing(true);
    try {
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

      // 선택 초기화
      setSelectedParcelIds(new Set());
      onAnalysisComplete?.();
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 필터링된 필지 목록
  const filteredParcels = useMemo(() => {
    return parcels.filter(parcel => {
      // 사업단 필터 (props로 전달된 것 또는 Select로 선택된 것)
      if (businessUnit && parcel.businessUnit !== businessUnit) return false;
      if (businessUnitFilter !== "all" && parcel.businessUnit !== businessUnitFilter) return false;
      
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
        const isHigh = isHighPossibility(parcel.aiResult.provisionalJudgment);
        if (aiJudgmentFilter === "high" && !isHigh) return false;
        if (aiJudgmentFilter === "low" && isHigh) return false;
      }
      
      return true;
    });
  }, [parcels, businessUnit, businessUnitFilter, searchQuery, aiJudgmentFilter]);

  // 통계 (검색값에 영향 받지 않음 - 전체 데이터 기준)
  const stats = useMemo(() => {
    // businessUnit 필터만 적용, 검색어/AI판정/관리 필터는 제외
    const relevantParcels = parcels.filter(parcel => {
      if (businessUnit && parcel.businessUnit !== businessUnit) return false;
      if (businessUnitFilter !== "all" && parcel.businessUnit !== businessUnitFilter) return false;
      return true;
    });
    
    const total = relevantParcels.length;
    const highPossibility = relevantParcels.filter(p => 
      p.aiResult && isHighPossibility(p.aiResult.provisionalJudgment)
    ).length;
    const lowPossibility = relevantParcels.filter(p => 
      p.aiResult && !isHighPossibility(p.aiResult.provisionalJudgment)
    ).length;
    const confirmed = relevantParcels.filter(p => 
      p.publishStatus === "담당자확인완료" || p.publishStatus === "공개"
    ).length;
    const pending = total - confirmed;
    
    return { total, highPossibility, lowPossibility, confirmed, pending };
  }, [parcels, businessUnit]);

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
      {/* 통계 카드 */}
      <div className="grid grid-cols-4 gap-3">
        {/* 매수 가능성 높음: Emerald */}
        <div 
          className="flex cursor-pointer flex-col items-center rounded-lg bg-emerald-50 p-4 transition-all hover:bg-emerald-100"
        >
          <span className="text-sm font-medium text-emerald-600">매수 가능성 높음</span>
          <div className="flex items-baseline gap-0.5" style={{ marginTop: '8px' }}>
            <span className="font-bold text-emerald-900" style={{ fontSize: '42px', lineHeight: '1em' }}>{stats.highPossibility}</span>
            <span className="text-xs font-medium ml-0.5" style={{ color: '#959595' }}>건</span>
          </div>
        </div>
        
        {/* 매수 가능성 낮음: Rose */}
        <div 
          className="flex cursor-pointer flex-col items-center rounded-lg bg-rose-50 p-4 transition-all hover:bg-rose-100"
        >
          <span className="text-sm font-medium text-rose-600">매수 가능성 낮음</span>
          <div className="flex items-baseline gap-0.5" style={{ marginTop: '8px' }}>
            <span className="font-bold text-rose-900" style={{ fontSize: '42px', lineHeight: '1em' }}>{stats.lowPossibility}</span>
            <span className="text-xs font-medium ml-0.5" style={{ color: '#959595' }}>건</span>
          </div>
        </div>
        
        {/* 분석완료: Purple */}
        <div 
          className="flex cursor-pointer flex-col items-center rounded-lg bg-purple-50 p-4 transition-all hover:bg-purple-100"
        >
          <span className="text-sm font-medium text-purple-600">분석완료</span>
          <div className="flex items-baseline gap-0.5" style={{ marginTop: '8px' }}>
            <span className="font-bold text-purple-900" style={{ fontSize: '42px', lineHeight: '1em' }}>{stats.confirmed}</span>
            <span className="text-xs font-medium ml-0.5" style={{ color: '#959595' }}>건</span>
          </div>
        </div>
        
        {/* 분석대기: Amber */}
        <div 
          className="flex cursor-pointer flex-col items-center rounded-lg bg-amber-50 p-4 transition-all hover:bg-amber-100"
        >
          <span className="text-sm font-medium text-amber-600">분석대기</span>
          <div className="flex items-baseline gap-0.5" style={{ marginTop: '8px' }}>
            <span className="font-bold text-amber-900" style={{ fontSize: '42px', lineHeight: '1em' }}>{stats.pending}</span>
            <span className="text-xs font-medium ml-0.5" style={{ color: '#959595' }}>건</span>
          </div>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <Card className="border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            검색 및 필터
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 검색바 */}
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="소재지, 소유자명을 입력하세요"
          />
          
          {/* 필터 영역 */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            {/* 사업단 선택 필터 */}
            <div className="flex items-center gap-3">
              <Label className="text-sm font-medium whitespace-nowrap">사업단:</Label>
              <Select value={businessUnitFilter} onValueChange={setBusinessUnitFilter}>
                <SelectTrigger className="w-[180px] h-[40px]">
                  <SelectValue placeholder="사업단 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 사업단</SelectItem>
                  {businessUnits.map((unit) => (
                    <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* AI 판정 필터 */}
            <RadioFilterGroup
              label="AI 판정"
              name="ai-judgment"
              value={aiJudgmentFilter}
              onChange={(v) => setAiJudgmentFilter(v as "all" | "high" | "low")}
              options={[
                { value: "all", label: "전체" },
                { value: "high", label: "매수 가능성 높음" },
                { value: "low", label: "매수 가능성 낮음" }
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* 필지 목록 테이블 */}
      <Card className="border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>잔여지 필지 목록</CardTitle>
              <CardDescription>
                분석할 필지를 선택하고 일괄 분석을 실행하세요. 2차 분석은 여러 번 실행할 수 있습니다.
              </CardDescription>
            </div>
            {selectedParcelIds.size > 0 && (
              <Button 
                onClick={handleBatchAnalysis}
                disabled={isAnalyzing}
                className="ml-auto"
              >
                {isAnalyzing ? "분석 중..." : `선택된 필지 분석 (${selectedParcelIds.size})`}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredParcels.length > 0 && (
            <label className="flex items-center gap-2 pb-2 border-b cursor-pointer">
              <input
                type="checkbox"
                checked={selectedParcelIds.size === filteredParcels.length && filteredParcels.length > 0}
                onChange={handleToggleSelectAll}
                className="w-4 h-4 cursor-pointer"
                title="모두 선택"
              />
              <span className="text-sm font-medium">
                전체 선택 ({selectedParcelIds.size}/{filteredParcels.length})
              </span>
            </label>
          )}
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">선택</TableHead>
                <TableHead className="w-[60px]">No.</TableHead>
                <TableHead>소재지</TableHead>
                <TableHead>면적(㎡)</TableHead>
                <TableHead>AI 판정</TableHead>
                <TableHead>분석 횟수</TableHead>
                <TableHead>최종 분석일</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParcels.map((parcel, index) => (
                <TableRow 
                  key={parcel.id} 
                  className="hover:bg-muted/50"
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
                  <TableCell className="text-center text-muted-foreground">{index + 1}</TableCell>
                  <TableCell 
                    className="font-medium cursor-pointer"
                    onClick={() => handleParcelClick(parcel)}
                  >
                    {parcel.landInfo.address}
                  </TableCell>
                  <TableCell className="cursor-pointer" onClick={() => handleParcelClick(parcel)}>
                    {parcel.landInfo.remainingArea.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {parcel.aiResult ? (
                      <AIJudgmentBadge judgment={parcel.aiResult.provisionalJudgment} />
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-foreground text-foreground hover:bg-foreground hover:text-background"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAnalyzeSingleParcel(parcel.id);
                        }}
                        disabled={analyzingParcelId === parcel.id}
                      >
                        {analyzingParcelId === parcel.id ? "분석 중..." : "분석"}
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{parcel.analysisHistory?.length || 0}회</span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {parcel.lastAnalyzedAt ? formatDateTime(parcel.lastAnalyzedAt) : "-"}
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
        </CardContent>
      </Card>

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
