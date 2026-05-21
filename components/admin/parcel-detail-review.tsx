"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  RotateCcw,
  History,
  CheckCircle2,
  MapPin,
  Ruler,
  Shapes,
  FileText,
  AlertTriangle,
  ChevronRight,
  Loader2,
  Save
} from "lucide-react";
import type { 
  ProcessedParcel, 
  AnalysisHistory,
  LandCategory, 
  LandShape,
  AIJudgmentResult,
  AdminCheckItems
} from "@/lib/types";
import { 
  landCategories, 
  landShapes, 
  adminCheckItemOptions,
} from "@/lib/dummy-data";
import { formatDateTime } from "@/lib/format";

interface ParcelDetailReviewProps {
  parcel: ProcessedParcel;
  onUpdate: (updatedParcel: ProcessedParcel) => void;
  onBack: () => void;
}

export function ParcelDetailReview({ parcel, onUpdate, onBack }: ParcelDetailReviewProps) {
  // 분석 옵션 상태
  const [currentUsage, setCurrentUsage] = useState<LandCategory>(parcel.currentUsage);
  const [landShape, setLandShape] = useState<LandShape>(parcel.landShape);
  const [checkItems, setCheckItems] = useState<AdminCheckItems>(parcel.adminCheckItems);
  
  // 변경 사유 및 메모
  const [changeReason, setChangeReason] = useState("");
  const [memo, setMemo] = useState("");
  
  // 분석 상태
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIJudgmentResult | null>(null);
  
  // 저장/확인 상태
  const [isSaving, setIsSaving] = useState(false);

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
    
    setAnalysisResult(newResult);
    setIsAnalyzing(false);
  };

  // 분석 결과 저장 및 히스토리 추가
  const handleSaveAnalysis = async () => {
    if (!analysisResult) return;
    
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newHistory: AnalysisHistory = {
      id: `history-${Date.now()}`,
      parcelId: parcel.id,
      stage: "2차분석",
      analyzedAt: new Date().toISOString(),
      analyzedBy: "현재 담당자",
      previousResult: parcel.aiResult.provisionalJudgment as AIJudgmentResult,
      newResult: analysisResult,
      previousShapeIndex: parcel.aiResult.remainingShapeIndex,
      newShapeIndex: Math.random() * 0.5 + 0.2,
      changedOptions: {
        currentUsage,
        landShape,
        ...checkItems,
      },
      changeReason: changeReason || undefined,
      memo: memo || undefined,
      aiResult: parcel.aiResult,
    };
    
    const updatedParcel: ProcessedParcel = {
      ...parcel,
      currentUsage,
      landShape,
      adminCheckItems: checkItems,
      aiResult: {
        ...parcel.aiResult,
        provisionalJudgment: analysisResult,
      },
      publishStatus: "2차분석중",
      analysisHistory: [...parcel.analysisHistory, newHistory],
      lastAnalyzedAt: new Date().toISOString(),
    };
    
    onUpdate(updatedParcel);
    setIsSaving(false);
    setAnalysisResult(null);
    setChangeReason("");
    setMemo("");
  };

  // 담당자 확인 완료 처리
  const handleConfirm = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const updatedParcel: ProcessedParcel = {
      ...parcel,
      publishStatus: "담당자확인완료",
      confirmedAt: new Date().toISOString(),
      confirmedBy: "현재 담당자",
    };
    
    onUpdate(updatedParcel);
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* 필지 기본 정보 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            필지 정보
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-muted-foreground">소재지</Label>
              <p className="font-medium">{parcel.landInfo.address}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">사업명</Label>
              <p className="font-medium">{parcel.projectName}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">잔여 면적</Label>
              <p className="font-medium">{parcel.landInfo.remainingArea.toLocaleString()} ㎡</p>
            </div>
            <div>
              <Label className="text-muted-foreground">잔여 비율</Label>
              <p className="font-medium">{parcel.landInfo.remainingRatio}%</p>
            </div>
            <div>
              <Label className="text-muted-foreground">소유자</Label>
              <p className="font-medium">{parcel.landInfo.ownerName}</p>
            </div>
            <div className="col-span-2 md:col-span-1 flex flex-col gap-2">
              <Label className="text-muted-foreground">현재 상태</Label>
              <Badge 
                className={
                  parcel.publishStatus === "공개" ? "bg-emerald-500" :
                  parcel.publishStatus === "담당자확인완료" ? "bg-purple-500" :
                  parcel.publishStatus === "2차분석중" ? "bg-amber-500" :
                  parcel.publishStatus === "1차분석완료" ? "bg-blue-500" : ""
                }
              >
                {parcel.publishStatus}
              </Badge>
            </div>
            <div>
              <Label className="text-muted-foreground">현재 AI 판정</Label>
              <Badge 
                className={
                  parcel.aiResult.provisionalJudgment === "매수 가능성 높음" || 
                  parcel.aiResult.provisionalJudgment === "수용가능" 
                    ? "bg-emerald-500 text-white" 
                    : "bg-rose-500 text-white"
                }
              >
                {parcel.aiResult.provisionalJudgment === "수용가능" ? "매수 가능성 높음" : 
                 parcel.aiResult.provisionalJudgment === "수용불가" ? "매수 가능성 낮음" :
                 parcel.aiResult.provisionalJudgment}
              </Badge>
            </div>
            <div>
              <Label className="text-muted-foreground">분석 횟수</Label>
              <p className="font-medium">{parcel.analysisHistory.length}회</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 분석 히스토리 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            분석 히스토리
          </CardTitle>
          <CardDescription>
            공사 진행 상황에 따라 여러 번 재분석할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {parcel.analysisHistory.length > 0 ? (
              parcel.analysisHistory.slice().reverse().map((history, index) => (
                <div 
                  key={history.id} 
                  className={`p-3 rounded-lg border ${index === 0 ? "border-primary bg-primary/5" : "bg-muted/50"}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={history.stage === "1차분석" ? "default" : "secondary"}>
                          {history.stage}
                        </Badge>
                        {index === 0 && <Badge variant="outline" className="text-xs">최신</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(history.analyzedAt)} | {history.analyzedBy}
                      </p>
                    </div>
                    <div className="text-right">
                      {history.previousResult ? (
                        <div className="flex items-center gap-2 text-sm">
                          <span className={
                            history.previousResult.includes("높음") || history.previousResult === "수용가능" 
                              ? "text-emerald-600" : "text-rose-600"
                          }>
                            {history.previousResult === "수용가능" ? "매수 가능성 높음" : 
                             history.previousResult === "수용불가" ? "매수 가능성 낮음" :
                             history.previousResult}
                          </span>
                          <ChevronRight className="h-4 w-4" />
                          <span className={
                            history.newResult.includes("높음") || history.newResult === "수용가능" 
                              ? "text-emerald-600 font-medium" : "text-rose-600 font-medium"
                          }>
                            {history.newResult === "수용가능" ? "매수 가능성 높음" : 
                             history.newResult === "수용불가" ? "매수 가능성 낮음" :
                             history.newResult}
                          </span>
                        </div>
                      ) : (
                        <span className={
                          history.newResult.includes("높음") || history.newResult === "수용가능" 
                            ? "text-emerald-600 font-medium" : "text-rose-600 font-medium"
                        }>
                          {history.newResult === "수용가능" ? "매수 가능성 높음" : 
                           history.newResult === "수용불가" ? "매수 가능성 낮음" :
                           history.newResult}
                        </span>
                      )}
                    </div>
                  </div>
                  {(history.changeReason || history.memo) && (
                    <div className="mt-2 pt-2 border-t text-sm">
                      {history.changeReason && <p><strong>변경 사유:</strong> {history.changeReason}</p>}
                      {history.memo && <p className="text-muted-foreground"><strong>메모:</strong> {history.memo}</p>}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center py-8 text-muted-foreground">분석 히스토리가 없습니다.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 2차 분석 (재분석) 옵션 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            2차 분석 (재분석)
          </CardTitle>
          <CardDescription>
            현장 확인 결과나 공사 진행 상황 변경에 따라 옵션을 수정하고 재분석하세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 활용지목 및 토지형상 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>현재 활용지목</Label>
              <Select value={currentUsage} onValueChange={(v) => setCurrentUsage(v as LandCategory)}>
                <SelectTrigger>
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
              <Label>토지 형상</Label>
              <Select value={landShape} onValueChange={(v) => setLandShape(v as LandShape)}>
                <SelectTrigger>
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
          <div className="space-y-3">
            <Label>담당자 확인항목</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {adminCheckItemOptions.map((option) => (
                <div 
                  key={option.value}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
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
                  <span className="font-medium">{option.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 변경 사유 및 메모 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>변경 사유</Label>
              <Textarea 
                placeholder="재분석 사유를 입력하세요 (선택)"
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>메모</Label>
              <Textarea 
                placeholder="추가 메모 (선택)"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* 분석 실행 버튼 */}
          <div className="flex items-center gap-4">
            <Button 
              onClick={handleReanalyze}
              disabled={isAnalyzing}
              className="flex-1"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  분석 중...
                </>
              ) : (
                <>
                  2차 분석 실행
                </>
              )}
            </Button>
          </div>

          {/* 분석 결과 표시 */}
          {analysisResult && (
            <div className={`p-4 rounded-lg border-2 ${
              analysisResult === "매수 가능성 높음" 
                ? "border-emerald-500 bg-emerald-50" 
                : "border-rose-500 bg-rose-50"
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {analysisResult === "매수 가능성 높음" ? (
                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="h-6 w-6 text-rose-600" />
                  )}
                  <div>
                    <p className="font-semibold">분석 결과</p>
                    <p className={`text-lg font-bold ${
                      analysisResult === "매수 가능성 높음" ? "text-emerald-600" : "text-rose-600"
                    }`}>
                      {analysisResult}
                    </p>
                  </div>
                </div>
                <Button onClick={handleSaveAnalysis} disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  결과 저장
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 하단 액션 버튼 */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button variant="outline" onClick={onBack}>
          닫기
        </Button>
        <div className="flex items-center gap-2">
          {parcel.publishStatus !== "담당자확인완료" && parcel.publishStatus !== "공개" && (
            <Button 
              variant="default"
              onClick={handleConfirm}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              담당자 확인 완료
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
