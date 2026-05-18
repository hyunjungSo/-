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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
  Play, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  RotateCcw,
  Eye,
  EyeOff,
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
  
  // 선택된 필지들
  const [selectedParcelIds, setSelectedParcelIds] = useState<Set<string>>(new Set());
  
  // 검색어
  const [searchQuery, setSearchQuery] = useState("");
  
  // 필터 (라디오 버튼)
  const [aiJudgmentFilter, setAiJudgmentFilter] = useState<"all" | "high" | "low">("all");
  const [publishFilter, setPublishFilter] = useState<"all" | "published" | "unpublished">("all");
  
  // 일괄 분석 진행 상태
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analyzedCount, setAnalyzedCount] = useState(0);
  
  // 히스토리 다이얼로그
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [selectedHistoryParcel, setSelectedHistoryParcel] = useState<ProcessedParcel | null>(null);
  
  // 분석 옵션 다이얼로그
  const [showAnalysisOptionsDialog, setShowAnalysisOptionsDialog] = useState(false);
  const [analysisOptions, setAnalysisOptions] = useState({
    useCurrentUsage: true,
    useLandShape: true,
  });

  // 필터링된 필지 목록
  const filteredParcels = useMemo(() => {
    return parcels.filter(parcel => {
      // 사업단 필터
      if (businessUnit && parcel.businessUnit !== businessUnit) return false;
      
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
      
      // 관리(노출) 필터 (라디오)
      if (publishFilter !== "all") {
        const isPublished = parcel.publishStatus === "공개";
        if (publishFilter === "published" && !isPublished) return false;
        if (publishFilter === "unpublished" && isPublished) return false;
      }
      
      return true;
    });
  }, [parcels, businessUnit, searchQuery, aiJudgmentFilter, publishFilter]);

  // 통계
  const stats = useMemo(() => {
    const total = filteredParcels.length;
    const highPossibility = filteredParcels.filter(p => 
      isHighPossibility(p.aiResult.provisionalJudgment)
    ).length;
    const lowPossibility = total - highPossibility;
    const confirmed = filteredParcels.filter(p => 
      p.publishStatus === "담당자확인완료" || p.publishStatus === "공개"
    ).length;
    const pending = total - confirmed;
    
    return { total, highPossibility, lowPossibility, confirmed, pending };
  }, [filteredParcels]);

  // 전체 선택/해제
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedParcelIds(new Set(filteredParcels.map(p => p.id)));
    } else {
      setSelectedParcelIds(new Set());
    }
  };

  // 개별 선택
  const handleSelectParcel = (parcelId: string, checked: boolean) => {
    const newSelected = new Set(selectedParcelIds);
    if (checked) {
      newSelected.add(parcelId);
    } else {
      newSelected.delete(parcelId);
    }
    setSelectedParcelIds(newSelected);
  };

  // 일괄 1차 분석 실행
  const handleBatchAnalysis = async (stage: "1차분석" | "2차분석") => {
    if (selectedParcelIds.size === 0) return;
    
    setShowAnalysisOptionsDialog(false);
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAnalyzedCount(0);
    
    const selectedParcels = filteredParcels.filter(p => selectedParcelIds.has(p.id));
    const total = selectedParcels.length;
    
    // 시뮬레이션: 각 필지를 순차적으로 분석
    for (let i = 0; i < total; i++) {
      await new Promise(resolve => setTimeout(resolve, 300)); // 분석 시간 시뮬레이션
      
      const parcel = selectedParcels[i];
      const newResult: AIJudgmentResult = Math.random() > 0.3 ? "매수 가능성 높음" : "매수 가능성 낮음";
      
      // 히스토리 추가
      const newHistory: AnalysisHistory = {
        id: `history-${Date.now()}-${i}`,
        parcelId: parcel.id,
        stage,
        analyzedAt: new Date().toISOString(),
        analyzedBy: stage === "1차분석" ? "시스템" : "담당자",
        previousResult: parcel.aiResult.provisionalJudgment as AIJudgmentResult,
        newResult,
        previousShapeIndex: parcel.aiResult.remainingShapeIndex,
        newShapeIndex: Math.random() * 0.5 + 0.2,
        aiResult: parcel.aiResult,
      };
      
      // 필지 업데이트
      setParcels(prev => prev.map(p => {
        if (p.id === parcel.id) {
          return {
            ...p,
            aiResult: {
              ...p.aiResult,
              provisionalJudgment: newResult,
            },
            publishStatus: stage === "1차분석" ? "1차분석완료" : "2차분석중",
            analysisHistory: [...p.analysisHistory, newHistory],
            firstAnalyzedAt: stage === "1차분석" ? new Date().toISOString() : p.firstAnalyzedAt,
            lastAnalyzedAt: new Date().toISOString(),
          } as ProcessedParcel;
        }
        return p;
      }));
      
      setAnalyzedCount(i + 1);
      setAnalysisProgress(((i + 1) / total) * 100);
    }
    
    setIsAnalyzing(false);
    setSelectedParcelIds(new Set());
    onAnalysisComplete?.();
  };

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
        
        {/* 확인 완료: Purple */}
        <div 
          className="flex cursor-pointer flex-col items-center rounded-lg bg-purple-50 p-4 transition-all hover:bg-purple-100"
        >
          <span className="text-sm font-medium text-purple-600">확인 완료</span>
          <div className="flex items-baseline gap-0.5" style={{ marginTop: '8px' }}>
            <span className="font-bold text-purple-900" style={{ fontSize: '42px', lineHeight: '1em' }}>{stats.confirmed}</span>
            <span className="text-xs font-medium ml-0.5" style={{ color: '#959595' }}>건</span>
          </div>
        </div>
        
        {/* 확인 대기: Amber */}
        <div 
          className="flex cursor-pointer flex-col items-center rounded-lg bg-amber-50 p-4 transition-all hover:bg-amber-100"
        >
          <span className="text-sm font-medium text-amber-600">확인 대기</span>
          <div className="flex items-baseline gap-0.5" style={{ marginTop: '8px' }}>
            <span className="font-bold text-amber-900" style={{ fontSize: '42px', lineHeight: '1em' }}>{stats.pending}</span>
            <span className="text-xs font-medium ml-0.5" style={{ color: '#959595' }}>건</span>
          </div>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <Card>
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
            placeholder="소재지, 소유자명, 사업단으로 검색"
          />
          
          {/* 필터 영역 */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            {/* AI 판정 필터 */}
            <RadioFilterGroup
              label="AI 판정"
              name="ai-judgment"
              value={aiJudgmentFilter}
              onChange={(v) => setAiJudgmentFilter(v as "all" | "high" | "low")}
              options={[
                { value: "all", label: "전체" },
                { value: "high", label: "매수 가능성 높음", className: "text-emerald-600" },
                { value: "low", label: "매수 가능성 낮음", className: "text-rose-600" }
              ]}
            />
            
            {/* 관리(노출) 필터 */}
            <RadioFilterGroup
              label="관리"
              name="publish"
              value={publishFilter}
              onChange={(v) => setPublishFilter(v as "all" | "published" | "unpublished")}
              options={[
                { value: "all", label: "전체" },
                { value: "published", label: "노출", icon: <Eye className="h-3.5 w-3.5" /> },
                { value: "unpublished", label: "미노출", icon: <EyeOff className="h-3.5 w-3.5" /> }
              ]}
            />
          </div>
          
          {/* 액션 버튼 */}
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm text-muted-foreground">
              {selectedParcelIds.size}건 선택됨
            </span>
            <Button 
              onClick={() => setShowAnalysisOptionsDialog(true)}
              disabled={selectedParcelIds.size === 0 || isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  분��� 중...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  일괄 분석 실행
                </>
              )}
            </Button>
          </div>

          {/* 분석 진행률 */}
          {isAnalyzing && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>분석 진행 중...</span>
                <span>{analyzedCount} / {selectedParcelIds.size} 완료</span>
              </div>
              <Progress value={analysisProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* 필지 목록 테이블 */}
      <Card>
        <CardHeader>
          <CardTitle>잔여지 필지 목록</CardTitle>
          <CardDescription>
            분석할 필지를 선택하고 일괄 분석을 실행하세요. 2차 분석은 여러 번 실행할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox 
                    checked={selectedParcelIds.size === filteredParcels.length && filteredParcels.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>소재지</TableHead>
                <TableHead>면적(㎡)</TableHead>
                <TableHead>AI 판정</TableHead>
                <TableHead>분석 횟수</TableHead>
                <TableHead>최종 분석일</TableHead>
                <TableHead className="text-right">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParcels.map((parcel) => (
                <TableRow 
                  key={parcel.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleParcelClick(parcel)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox 
                      checked={selectedParcelIds.has(parcel.id)}
                      onCheckedChange={(checked) => handleSelectParcel(parcel.id, !!checked)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{parcel.landInfo.address}</TableCell>
                  <TableCell>{parcel.landInfo.remainingArea.toLocaleString()}</TableCell>
                  <TableCell>
                    <AIJudgmentBadge judgment={parcel.aiResult.provisionalJudgment} />
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{parcel.analysisHistory.length}회</span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {parcel.lastAnalyzedAt ? formatDateTime(parcel.lastAnalyzedAt) : "-"}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <PublishRadioCell
                      id={parcel.id}
                      isPublished={parcel.publishStatus === "공개"}
                      onPublishChange={(published) => {
                        if (published) {
                          handlePublish(parcel.id);
                        } else {
                          handleUnpublish(parcel.id);
                        }
                      }}
                    />
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

      {/* 분석 옵션 다이얼로그 */}
      <Dialog open={showAnalysisOptionsDialog} onOpenChange={setShowAnalysisOptionsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>일괄 분석 옵션</DialogTitle>
            <DialogDescription>
              {selectedParcelIds.size}건의 필지를 분석합니다. 분석 옵션을 선택하세요.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="useCurrentUsage"
                checked={analysisOptions.useCurrentUsage}
                onCheckedChange={(checked) => 
                  setAnalysisOptions(prev => ({ ...prev, useCurrentUsage: !!checked }))
                }
              />
              <Label htmlFor="useCurrentUsage">현재 활용지목 적용</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="useLandShape"
                checked={analysisOptions.useLandShape}
                onCheckedChange={(checked) => 
                  setAnalysisOptions(prev => ({ ...prev, useLandShape: !!checked }))
                }
              />
              <Label htmlFor="useLandShape">토지형상 적용</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAnalysisOptionsDialog(false)}>
              취소
            </Button>
            <Button onClick={() => handleBatchAnalysis("1차분석")}>
              <Play className="h-4 w-4 mr-2" />
              1차 분석 실행
            </Button>
            <Button variant="secondary" onClick={() => handleBatchAnalysis("2차분석")}>
              <RotateCcw className="h-4 w-4 mr-2" />
              2차 분석 (재분석)
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
