"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LandMap } from "@/components/land-map";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  RotateCcw,
  CheckCircle2,
  MapPin,
  Ruler,
  Shapes,
  FileText,
  AlertTriangle,
  ChevronRight,
  Loader2,
  Sparkles,
  RefreshCw,
  ArrowLeft,
  Lock
} from "lucide-react";
import type { 
  ProcessedParcel, 
  AnalysisHistory,
  LandCategory, 
  LandShape,
  AIJudgmentResult,
  AdminCheckItems,
  AIAnalysisResult,
  LandType
} from "@/lib/types";
import { 
  landCategories, 
  landShapes, 
  adminCheckItemOptions,
} from "@/lib/dummy-data";
import { formatDateTime } from "@/lib/format";
import { AIAnalysisFlowDialog } from "@/components/admin/ai-analysis-flow-dialog";

interface ParcelDetailReviewProps {
  parcel: ProcessedParcel;
  onUpdate: (updatedParcel: ProcessedParcel) => void;
  onBack: () => void;
  onNavigateToApplication?: (applicationId: string) => void;
}

export function ParcelDetailReview({ parcel, onUpdate, onBack, onNavigateToApplication }: ParcelDetailReviewProps) {
  // 신청상세 화면으로 이동
  const handleNavigateToApplication = () => {
    if (parcel.citizenActivity?.applicationId && onNavigateToApplication) {
      onNavigateToApplication(parcel.citizenActivity.applicationId);
    }
  };
  
  // 분석 옵션 상태
  const [currentUsage, setCurrentUsage] = useState<LandCategory>(parcel.currentUsage);
  const [landShape, setLandShape] = useState<LandShape>(parcel.landShape);
  const [checkItems, setCheckItems] = useState<AdminCheckItems>(parcel.adminCheckItems);
  
  // 메모
  const [memo, setMemo] = useState("");
  
  // 분석 상태
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // AI 분석 상세 다이얼로그
  const [showAIAnalysisDialog, setShowAIAnalysisDialog] = useState(false);
  const [selectedAnalysisResult, setSelectedAnalysisResult] = useState<AIAnalysisResult | null>(null);

  // 2차 분석 (재분석) 실행
  const handleReanalyze = async () => {
    setIsAnalyzing(true);
    
    // 분석 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 옵션에 따른 결과 계산 (시뮬레이션)
    let newResult: AIJudgmentResult = "매수 가능성 낮음";
    
    // 농기계 진입불가, 접면도로 상실, 관개수로 상실 중 하나라도 체크되면 높음
    if (checkItems.farmMachineDifficulty || checkItems.accessRoadLost || checkItems.waterChannelLost) {
      newResult = "매수 가능성 높음";
    }
    
    // 토지 형상이 불규칙하면 높음
    const irregularShapes: LandShape[] = ["삼각형", "역삼각형", "부정형", "자루형"];
    if (irregularShapes.includes(landShape)) {
      newResult = "매수 가능성 높음";
    }
    
    // 새 AI 분석 결과 생성
    const newAiResult: AIAnalysisResult = {
      landTypePath: parcel.landInfo.landType as LandType,
      criteriaChecks: [
        { criteria: "잔여지 면적 기준", isMet: true, description: "잔여지 면적이 기준 이하" },
        { criteria: "형상지수 변화", isMet: true, description: "형상지수 악화 확인" },
      ],
      provisionalJudgment: newResult,
      originalShapeIndex: parcel.landInfo.originalShapeIndex || 3.5,
      remainingShapeIndex: Math.random() * 0.5 + 0.2,
      remainingMinWidth: Math.round(Math.random() * 5 + 2),
      remainingArea: parcel.landInfo.remainingArea,
      shapeIndexChange: -0.3,
      isBlindLand: false,
      accessRoadLost: checkItems.accessRoadLost,
      waterChannelLost: checkItems.waterChannelLost,
      farmMachineDifficulty: checkItems.farmMachineDifficulty,
      elevationDifference: false,
    };

    // 히스토리에 바로 추가
    const newHistory: AnalysisHistory = {
      id: `history-${Date.now()}`,
      parcelId: parcel.id,
      stage: `${(parcel.analysisHistory?.length || 0) + 1}차분석`,
      analyzedAt: new Date().toISOString(),
      analyzedBy: "현재 담당자",
      previousResult: parcel.aiResult?.provisionalJudgment as AIJudgmentResult || "매수 가능성 낮음",
      newResult: newResult,
      previousShapeIndex: parcel.aiResult?.remainingShapeIndex || 0,
      newShapeIndex: newAiResult.remainingShapeIndex,
      changedOptions: {
        currentUsage,
        landShape,
        ...checkItems,
      },
      memo: memo || undefined,
      aiResult: newAiResult,
    };
    
    const updatedParcel: ProcessedParcel = {
      ...parcel,
      currentUsage,
      landShape,
      adminCheckItems: checkItems,
      aiResult: newAiResult,
      publishStatus: (parcel.analysisHistory?.length || 0) === 0 ? "1차분석완료" : "재분석완료",
      analysisHistory: [...(parcel.analysisHistory || []), newHistory],
      lastAnalyzedAt: new Date().toISOString(),
    };
    
    onUpdate(updatedParcel);
    setIsAnalyzing(false);
    setChangeReason("");
    setMemo("");
  };

  // 민원인이 신청완료했거나 장바구니에 담은 경우 수정 불가
  const isApplicationSubmitted = parcel.citizenActivity?.applicationSubmitted;
  const isInCart = parcel.citizenActivity?.inCart;
  const isLockedByCitizen = isApplicationSubmitted || isInCart;
  
  // 가시성 변경 확인 모달 상태
  const [showVisibilityConfirmModal, setShowVisibilityConfirmModal] = useState(false);
  const [pendingVisibilityChange, setPendingVisibilityChange] = useState<boolean | null>(null);

  // 관리(공개/비공개) 변경 핸들러 - 모달 표시
  const handleVisibilityChange = (checked: boolean) => {
    if (isApplicationSubmitted) {
      alert("이미 신청이 완료된 건이라 수정이 불가합니다.");
      return;
    }
    if (isInCart) {
      alert("이미 민원인이 신청을 진행중인 건이라 수정이 불가합니다.");
      return;
    }
    setPendingVisibilityChange(checked);
    setShowVisibilityConfirmModal(true);
  };
  
  // 모달 확인 시 가시성 변경 적용
  const handleConfirmVisibilityChange = () => {
    if (pendingVisibilityChange !== null) {
      onUpdate({
        ...parcel,
        isVisible: pendingVisibilityChange,
      });
    }
    setShowVisibilityConfirmModal(false);
    setPendingVisibilityChange(null);
  };

  return (
    <div className="space-y-6">
      {/* 필지상세 타이틀 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onBack}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">필지상세</h1>
        </div>
      </div>

      {/* 필지 기본 정보 - 통합 헤더 레이아웃 */}
      <Card className="border-2 border-slate-200 px-6">
        <CardContent className="p-0">
          {/* 상단: 소재지 + 민원 신청 상태 */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <span className="text-lg font-semibold text-foreground">{parcel.landInfo.address}</span>
            {/* 편입 유형이 확정된 경우(부분 편입)에만 신청상세 보기 버튼 노출 */}
            {parcel.residualStatus === "잔여지 인정" && parcel.citizenActivity?.applicationSubmitted && (
              <Badge 
                className="bg-transparent text-emerald-700 hover:bg-transparent cursor-pointer"
                onClick={handleNavigateToApplication}
              >
                신청상세 보기
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Badge>
            )}
          </div>
          
          {/* 하단: 정보 그리드 2행 3열 */}
          <div className="grid grid-cols-3 gap-x-8 gap-y-3 pt-4">
            {/* 1행 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">사업명:</span>
              <span className="text-sm font-medium">{parcel.projectName}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">잔여 면적 (비율):</span>
              <span className="text-sm font-medium">{parcel.landInfo.remainingArea.toLocaleString()} ㎡ ({parcel.landInfo.remainingRatio}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">공개 여부:</span>
              <div className="flex items-center gap-2">
                {parcel.residualStatus === "잔여지 인정" ? (
                  // 부분 편입(잔여지 인정)만 공개 가능
                  <>
                    <Switch 
                      checked={parcel.isVisible !== false}
                      disabled={isLockedByCitizen}
                      onCheckedChange={handleVisibilityChange}
                      className="h-[22px] w-[40px] [&>span]:size-[18px] [&>span]:data-[state=checked]:translate-x-[18px] [&>span]:data-[state=unchecked]:translate-x-[2px]"
                    />
                    <span className={`text-sm font-medium ${parcel.isVisible !== false ? "text-emerald-600" : "text-muted-foreground"}`}>
                      {parcel.isVisible !== false ? "공개" : "비공개"}
                    </span>
                    {isLockedByCitizen && (
                      <span className="text-xs text-orange-500">
                        (수정 불가)
                      </span>
                    )}
                  </>
                ) : parcel.residualStatus === "기준 미달" ? (
                  // 전체 편입(기준 미달)은 공개 불가 - 스위치 비활성화
                  <>
                    <Switch 
                      checked={false}
                      disabled={true}
                      className="h-[22px] w-[40px] [&>span]:size-[18px] [&>span]:data-[state=checked]:translate-x-[18px] [&>span]:data-[state=unchecked]:translate-x-[2px]"
                    />
                    <span className="text-sm font-medium text-muted-foreground">비공개</span>
                    <span className="text-xs text-gray-400">(전체 편입은 공개 불가)</span>
                  </>
                ) : (
                  // 판독대기 상태 - 공개 불가
                  <>
                    <Switch 
                      checked={false}
                      disabled={true}
                      className="h-[22px] w-[40px] [&>span]:size-[18px] [&>span]:data-[state=checked]:translate-x-[18px] [&>span]:data-[state=unchecked]:translate-x-[2px]"
                    />
                    <span className="text-sm font-medium text-muted-foreground">비공개</span>
                    <span className="text-xs text-gray-400">(판독대기)</span>
                  </>
                )}
              </div>
            </div>
            
            {/* 2행 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">소유자:</span>
              <span className="text-sm font-medium">{parcel.landInfo.ownerName}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">분석 횟수:</span>
              <span className="text-sm font-medium">{parcel.analysisHistory?.length || 0}회</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI 분석 영역 - 2컬럼 레이아웃 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 왼쪽: AI 분석 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>AI 분석</CardTitle>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => {
                  setCurrentUsage(parcel.currentUsage as LandCategory);
                  setLandShape(parcel.landShape as LandShape);
                  setCheckItems(parcel.adminCheckItems);
                  setChangeReason("");
                  setMemo("");
                }}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription>
              분석 옵션을 설정하고 AI 분석을 실행합니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 지��도 */}
            <div className="space-y-2">
              <Label className="font-medium">지적도</Label>
              <div className="h-[400px] rounded-lg overflow-hidden border bg-muted">
                <LandMap landInfo={parcel.landInfo} showOverlay={true} interactive={false} />
              </div>
            </div>

            {/* 현재 활용지목 및 토지 형상 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">현재 활용지목</Label>
                <Select value={currentUsage} onValueChange={(v) => setCurrentUsage(v as LandCategory)}>
                  <SelectTrigger className="h-[40px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {landCategories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">토지 형상</Label>
                <Select value={landShape} onValueChange={(v) => setLandShape(v as LandShape)}>
                  <SelectTrigger className="h-[40px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="px-2 py-1 text-xs text-muted-foreground">정형</div>
                    {landShapes.regular.map((shape) => (
                      <SelectItem key={shape.value} value={shape.value}>{shape.label}</SelectItem>
                    ))}
                    <div className="px-2 py-1 text-xs text-muted-foreground border-t mt-1 pt-1">부정형</div>
                    {landShapes.irregular.map((shape) => (
                      <SelectItem key={shape.value} value={shape.value}>{shape.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 담당자 확인항목 */}
            <div className="space-y-2">
              <Label className="text-sm">담당자 확인항목</Label>
              <div className="grid grid-cols-3 gap-2">
                {adminCheckItemOptions.map((option) => (
                  <div 
                    key={option.value}
                    className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                      checkItems[option.value as keyof AdminCheckItems] 
                        ? "bg-primary/10 border-primary" 
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => setCheckItems(prev => ({
                      ...prev,
                      [option.value]: !prev[option.value as keyof AdminCheckItems]
                    }))}
                  >
                    <Checkbox 
                      checked={checkItems[option.value as keyof AdminCheckItems]}
                      onCheckedChange={(checked) => setCheckItems(prev => ({
                        ...prev,
                        [option.value]: !!checked
                      }))}
                    />
                    <span className="text-xs">{option.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 메모 */}
            <div className="space-y-2">
              <Label className="text-sm">메모</Label>
              <Textarea 
                placeholder="추가 메모 (선택)"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                rows={3}
              />
            </div>

            {/* AI 분석 실행 버튼 */}
            <Button 
              onClick={handleReanalyze}
              disabled={isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  분석 중...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI 분석 실행
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* 오른쪽: AI 분석결과 */}
        <Card>
          <CardHeader>
            <CardTitle>AI 분석결과</CardTitle>
            <CardDescription>
              AI 분석 결과와 매수 가능성 판정을 확인합니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(parcel.analysisHistory?.length || 0) > 0 ? (
              <Accordion 
                type="single" 
                collapsible 
                defaultValue={`history-${parcel.analysisHistory[parcel.analysisHistory.length - 1]?.id}`}
                className="space-y-2"
              >
                {parcel.analysisHistory.slice().reverse().map((history, index) => {
                  const aiResult = history.aiResult;
                  const isLatest = index === 0;
                  
                  return (
                    <AccordionItem 
                      key={history.id} 
                      value={`history-${history.id}`}
                      className="border rounded-lg px-4"
                    >
                      <AccordionTrigger className="hover:no-underline py-3">
                        <div className="flex items-center gap-3 w-full">
                          <Badge variant="outline">
                            {history.stage}
                          </Badge>
                          {isLatest && <Badge variant="secondary" className="text-xs">최신</Badge>}
                          <Badge 
                            className={
                              history.newResult === "매수 가능성 높음" || 
                              history.newResult === "수용가능"
                                ? "bg-emerald-500 text-white"
                                : "bg-rose-500 text-white"
                            }
                          >
                            {history.newResult === "수용가능" ? "매수 가능성 높음" : 
                             history.newResult === "수용불가" ? "매수 가능성 낮음" :
                             history.newResult}
                          </Badge>
                          <span className="text-xs text-muted-foreground ml-auto mr-2">
                            {formatDateTime(history.analyzedAt)}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4">
                        {aiResult ? (
                            <div className="space-y-4 pt-2">
                            {/* 판정 기준 - 잔여지 형상지수 기반 판정 */}
                            <div className="space-y-4">
                              <div className="space-y-3">
                                <h5 className="text-sm font-semibold flex items-center gap-2">
                                  <Shapes className="h-4 w-4 text-muted-foreground" />
                                  잔여지 형상지수 기반 판정
                                </h5>
                                <div className="grid grid-cols-3 gap-3">
                                  <div className="p-2 rounded" style={{ backgroundColor: "rgb(251, 251, 251)" }}>
                                    <p className="text-xs text-muted-foreground">잔여지 형상지수</p>
                                    <p className="text-lg font-semibold">{aiResult.remainingShapeIndex?.toFixed(3) || "-"}</p>
                                  </div>
                                  <div className="p-2 rounded" style={{ backgroundColor: "rgb(251, 251, 251)" }}>
                                    <p className="text-xs text-muted-foreground">최소 폭</p>
                                    <p className="text-lg font-semibold">{aiResult.remainingMinWidth || "-"}m</p>
                                  </div>
                                  <div className="p-2 rounded" style={{ backgroundColor: "rgb(251, 251, 251)" }}>
                                    <p className="text-xs text-muted-foreground">잔여 면적</p>
                                    <p className="text-lg font-semibold">{aiResult.remainingArea?.toLocaleString() || "-"}㎡</p>
                                  </div>
                                </div>
                              </div>

                              {/* 수동 확인 항목 */}
                              <div className="space-y-3">
                                <h5 className="text-sm font-semibold flex items-center gap-2">
                                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                                  수동 확인 항목
                                </h5>
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="p-2 rounded flex items-center justify-between" style={{ backgroundColor: "rgb(251, 251, 251)" }}>
                                    <span className="text-sm">농기계 진입 불가</span>
                                    <Badge variant={aiResult.farmMachineDifficulty ? "destructive" : "outline"}>
                                      {aiResult.farmMachineDifficulty ? "해당" : "미해당"}
                                    </Badge>
                                  </div>
                                  <div className="p-2 rounded flex items-center justify-between" style={{ backgroundColor: "rgb(251, 251, 251)" }}>
                                    <span className="text-sm">접면도로 상실</span>
                                    <Badge variant={aiResult.accessRoadLost ? "destructive" : "outline"}>
                                      {aiResult.accessRoadLost ? "해당" : "미해당"}
                                    </Badge>
                                  </div>
                                  <div className="p-2 rounded flex items-center justify-between" style={{ backgroundColor: "rgb(251, 251, 251)" }}>
                                    <span className="text-sm">관개수로 상실</span>
                                    <Badge variant={aiResult.waterChannelLost ? "destructive" : "outline"}>
                                      {aiResult.waterChannelLost ? "해당" : "미해당"}
                                    </Badge>
                                  </div>
                                  <div className="p-2 rounded flex items-center justify-between" style={{ backgroundColor: "rgb(251, 251, 251)" }}>
                                    <span className="text-sm">고저차 발생</span>
                                    <Badge variant={aiResult.elevationDifference ? "destructive" : "outline"}>
                                      {aiResult.elevationDifference ? "해당" : "미해당"}
                                    </Badge>
                                  </div>
                                </div>
                              </div>

                              {/* 판정 기준 충족 여부 */}
                              {aiResult.criteriaChecks && aiResult.criteriaChecks.length > 0 && (
                                <div>
                                  <h5 className="text-sm font-semibold mb-2">판정 기준 충족 여부</h5>
                                  <div className="space-y-1 rounded-lg p-2" style={{ backgroundColor: "rgb(251, 251, 251)" }}>
                                    {aiResult.criteriaChecks.map((check, idx) => (
                                      <div key={idx} className="flex items-center gap-2 text-sm py-1">
                                        {check.isMet ? (
                                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                        ) : (
                                          <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0" />
                                        )}
                                        <span>{check.criteria || check.criteriaName}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* 메모 */}
                            {history.memo && (
                              <div className="space-y-2">
                                <div className="space-y-1">
                                  <label className="text-xs font-semibold" style={{ color: "rgb(26, 26, 26)" }}>메모</label>
                                  <div className="rounded-lg min-h-[80px] overflow-y-auto text-sm whitespace-pre-wrap break-words" style={{ backgroundColor: "rgb(251, 251, 251)", padding: "8px" }}>
                                    {history.memo}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground py-2">상세 분석 결과가 없습니다.</p>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            ) : (
              <div className="p-8 text-center text-muted-foreground border rounded-lg bg-muted/30">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>아직 분석 결과가 없습니다.</p>
                <p className="text-sm mt-1">왼쪽에서 분석을 실행하세요.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 하단 액션 버튼 */}
      <div className="flex items-center justify-end pt-4">
        <Button variant="outline" onClick={onBack}>
          목록
        </Button>
      </div>

      {/* AI 분석 상세 다이얼로그 */}
      <AIAnalysisFlowDialog
        open={showAIAnalysisDialog}
        onOpenChange={setShowAIAnalysisDialog}
        aiResult={selectedAnalysisResult}
        landInfo={parcel.landInfo}
      />

      {/* 필지 정보 공개/비공개 확인 모달 */}
      <Dialog open={showVisibilityConfirmModal} onOpenChange={setShowVisibilityConfirmModal}>
        <DialogContent className="max-w-md p-8 relative">
          <DialogHeader className="pr-8">
            <DialogTitle className="text-xl">
              {pendingVisibilityChange ? "필지 정보 공개 확인" : "필지 정보 비공개 확인"}
            </DialogTitle>
            <DialogDescription className="pt-4 space-y-4 leading-7 text-base" asChild>
              <div>
                {pendingVisibilityChange ? (
                  <>
                    <span className="block">해당 필지를 민원인에게 공개하시겠습니까?</span>
                    <span className="block">공개 시 민원인이 직접 정보를 조회하고 매수 신청을 진행할 수 있습니다.</span>
                  </>
                ) : (
                  <>
                    <span className="block">해당 필지의 상세 정보와 AI 분석 결과를 민원인에게 비공개 처리하시겠습니까?</span>
                    <span className="block">비공개 시 민원인이 해당 필지 정보를 조회할 수 ���습니다.</span>
                  </>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="gap-4 sm:gap-4 mt-6">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowVisibilityConfirmModal(false);
                setPendingVisibilityChange(null);
              }}
              className="border-gray-200 text-gray-600 bg-gray-50 hover:bg-gray-100 hover:text-gray-700"
            >
              취소
            </Button>
            <Button 
              onClick={handleConfirmVisibilityChange}
              className={pendingVisibilityChange 
                ? "bg-emerald-700 hover:bg-emerald-800 text-white"
                : "bg-gray-700 hover:bg-gray-800 text-white"
              }
            >
              {pendingVisibilityChange ? "공개하기" : "비공개하기"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
