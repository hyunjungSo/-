"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LeafletMap } from "@/components/leaflet-map";
import { 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  Info, 
  FileText,
  User,
  Phone,
  AlertCircle,
  ShoppingCart,
  Trash2,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  Loader2
} from "lucide-react";
import { AIIcon } from "@/components/ui/ai-icon";
import type { PreRegisteredParcel, AdminCheckItems, LandShape, LandCategory, AIAnalysisResult } from "@/lib/types";
import { preRegisteredParcels, adminCheckItemOptions } from "@/lib/dummy-data";

interface MyParcelListProps {
  onAddToCart: (parcel: PreRegisteredParcel) => void;
  onRemoveFromCart: (parcelId: string) => void;
  cartItems: PreRegisteredParcel[];
  onSubmitApplication: (parcels: PreRegisteredParcel[]) => void;
}

export function MyParcelList({ 
  onAddToCart, 
  onRemoveFromCart,
  cartItems, 
  onSubmitApplication 
}: MyParcelListProps) {
  // 선택된 필지
  const [selectedParcel, setSelectedParcel] = useState<PreRegisteredParcel | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [hoveredParcelId, setHoveredParcelId] = useState<string | null>(null);
  
  // 좌측 패널 접힘 상태
  const [isListCollapsed, setIsListCollapsed] = useState(false);
  
  // AI 재분석용 상태
  const [checkItems, setCheckItems] = useState<AdminCheckItems>({
    farmMachineDifficulty: false,
    accessRoadLost: false,
    waterChannelLost: false,
  });
  const [selectedLandShape, setSelectedLandShape] = useState<LandShape | "">("");
  const [selectedLandUsage, setSelectedLandUsage] = useState<LandCategory | "">("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reanalyzedResult, setReanalyzedResult] = useState<AIAnalysisResult | null>(null);

  // 현재 로그인한 민원인 정보 (실제로는 인증 시스템에서 가져옴)
  const currentUser = {
    name: "이순신",
    contact: "010-1111-2222"
  };

  // 본인 소유 잔여지 중 매수 신청 가능한 필지만 필터링
  const myParcels = useMemo(() => {
    return preRegisteredParcels.filter(
      p => p.preRegistrationStatus === "등록완료" && 
           p.aiResult.provisionalJudgment === "매수 신청 가능" &&
           p.landInfo.ownerName === currentUser.name
    );
  }, [currentUser.name]);

  // 필지 선택
  const handleParcelSelect = (parcel: PreRegisteredParcel) => {
    setSelectedParcel(parcel);
  };

  // 필지 상세 보기
  const handleViewDetail = (parcel: PreRegisteredParcel) => {
    setSelectedParcel(parcel);
    // 기존 확인 항목으로 초기화
    setCheckItems(parcel.adminCheckItems);
    setSelectedLandShape(parcel.landShape);
    setSelectedLandUsage(parcel.currentUsage);
    setReanalyzedResult(null);
    setShowDetailDialog(true);
  };
  
  // AI 재분석 실행
  const handleReanalyze = async () => {
    if (!selectedParcel) return;
    
    setIsAnalyzing(true);
    
    // 시뮬레이션된 AI 분석 (실제로는 API 호출)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 확인 항목 중 하나라도 true면 매수 신청 가능으로 판정 (시뮬레이션)
    const hasAnyCheckItem = checkItems.farmMachineDifficulty || checkItems.accessRoadLost || checkItems.waterChannelLost;
    const shapeIndexChange = selectedParcel.aiResult.shapeIndexChange;
    const meetsCriteria = hasAnyCheckItem || shapeIndexChange >= 1.0;
    
    const newResult: AIAnalysisResult = {
      ...selectedParcel.aiResult,
      provisionalJudgment: meetsCriteria ? "매수 신청 가능" : "매수 신청 불가능",
      farmMachineDifficulty: checkItems.farmMachineDifficulty,
      accessRoadLost: checkItems.accessRoadLost,
      waterChannelLost: checkItems.waterChannelLost,
      criteriaChecks: [
        { 
          criteriaName: "면적 기준", 
          criteriaDescription: `${selectedParcel.landInfo.landType} 기준 면적 이하`, 
          isMet: selectedParcel.landInfo.remainingArea <= 330, 
          autoDetected: true 
        },
        { 
          criteriaName: "형상 기준", 
          criteriaDescription: `비정형 형상 (${selectedLandShape})`, 
          isMet: !["정방형", "가로장방형", "세로장방형"].includes(selectedLandShape), 
          autoDetected: true 
        },
        { 
          criteriaName: "형상지수 변화", 
          criteriaDescription: "형상지수 1.0 이상 상승", 
          isMet: shapeIndexChange >= 1.0, 
          autoDetected: true 
        },
        ...(checkItems.farmMachineDifficulty ? [{
          criteriaName: "농기계 회전 곤란",
          criteriaDescription: "농기계 회전 곤란으로 경작 불가",
          isMet: true,
          autoDetected: false,
        }] : []),
        ...(checkItems.accessRoadLost ? [{
          criteriaName: "접면도로 상실",
          criteriaDescription: "맹지화로 건축허가 불가",
          isMet: true,
          autoDetected: false,
        }] : []),
        ...(checkItems.waterChannelLost ? [{
          criteriaName: "관개수로 상실",
          criteriaDescription: "관개수로 상실로 농업용수 공급 불가",
          isMet: true,
          autoDetected: false,
        }] : []),
      ],
      judgmentRationale: {
        ...selectedParcel.aiResult.judgmentRationale,
        summary: meetsCriteria 
          ? `${selectedParcel.landInfo.landType} 잔여지 - 선택된 기준 충족으로 「매수 신청 가능」 판정`
          : `${selectedParcel.landInfo.landType} 잔여지 - 기준 미충족으로 「매수 신청 불가능」 판정`,
        appliedCriteria: [
          `토지유형: ${selectedParcel.landInfo.landType}`,
          `토지형상: ${selectedLandShape}`,
          `활용지목: ${selectedLandUsage}`,
          ...(checkItems.farmMachineDifficulty ? ["농기계 회전 곤란: 해당"] : []),
          ...(checkItems.accessRoadLost ? ["접면도로 상실: 해당"] : []),
          ...(checkItems.waterChannelLost ? ["관개수로 상실: 해당"] : []),
        ],
      },
    };
    
    setReanalyzedResult(newResult);
    setIsAnalyzing(false);
  };

  // 장바구니에 추가
  const handleAddToCart = (parcel: PreRegisteredParcel) => {
    onAddToCart(parcel);
    setShowDetailDialog(false);
  };

  // 이미 장바구니에 있는지 확인
  const isInCart = (parcelId: string) => {
    return cartItems.some(item => item.id === parcelId);
  };

  // 지도용 필지 데이터 (좌표 생성)
  const mapParcels = useMemo(() => {
    return myParcels.map((parcel, index) => {
      // 더미 좌표 생성 (실제로는 DB에서 가져옴)
      const baseCoords = [
        [
          { lat: 37.2215 + index * 0.005, lng: 127.2985 + index * 0.003 },
          { lat: 37.2220 + index * 0.005, lng: 127.2995 + index * 0.003 },
          { lat: 37.2213 + index * 0.005, lng: 127.3000 + index * 0.003 },
          { lat: 37.2208 + index * 0.005, lng: 127.2990 + index * 0.003 },
        ]
      ];
      
      return {
        id: parcel.id,
        coordinates: parcel.landInfo.coordinates || baseCoords[0],
        address: parcel.landInfo.address,
        isIncluded: true,
        isOwned: true,
      };
    });
  }, [myParcels]);

  return (
    <div className="space-y-4">
      {/* 안내 메시지 */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="py-4">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-blue-800">
              <strong>{currentUser.name}</strong>님이 소유하신 잔여지 중 
              <strong className="text-[rgb(20,113,97)]"> 매수 신청 가능</strong> 판정을 받은 필지입니다.
              신청하실 필지를 선택해주세요.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 지도 + 좌측 필지 목록 레이아웃 */}
      <div className="relative h-[calc(100vh-320px)] min-h-[500px] w-full rounded-lg overflow-hidden border">
        {/* 지도 (전체 영역) */}
        <div className="absolute inset-0 z-[5]">
          <LeafletMap 
            zoomControlsPosition="sidebar-right"
            onParcelClick={(id) => {
              const parcel = myParcels.find(p => p.id === id);
              if (parcel) {
                handleParcelSelect(parcel);
              }
            }}
            parcels={mapParcels}
            selectedParcelId={selectedParcel?.id}
            hoveredParcelId={hoveredParcelId}
            onParcelHover={setHoveredParcelId}
          />
        </div>

        {/* 좌측 사이드바 - 필지 목록 */}
        <div className="absolute bottom-0 left-0 top-0 z-10 flex">
          <div className="relative">
            <div className={`h-full bg-background transition-all duration-300 overflow-hidden ${isListCollapsed ? "w-0" : "w-[360px]"}`}>
              {/* 필지 목록 헤더 */}
              <div className="flex items-center justify-between border-b bg-muted px-4 py-3">
                <span className="text-base font-semibold text-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  나의 잔여지
                </span>
                <Badge variant="secondary" className="text-sm">
                  {myParcels.length}건
                </Badge>
              </div>
              
              {/* 필지 목록 */}
              <div className="max-h-[calc(100%-52px)] overflow-y-auto">
                {myParcels.length > 0 ? (
                  <div className="divide-y">
                    {myParcels.map((parcel) => (
                      <div
                        key={parcel.id}
                        className={`p-4 cursor-pointer transition-colors ${
                          selectedParcel?.id === parcel.id 
                            ? "bg-primary/10 border-l-4 border-l-primary" 
                            : "hover:bg-muted/50"
                        }`}
                        onClick={() => handleParcelSelect(parcel)}
                        onMouseEnter={() => setHoveredParcelId(parcel.id)}
                        onMouseLeave={() => setHoveredParcelId(null)}
                      >
                        <div className="space-y-2">
                          <p className="font-medium text-foreground leading-tight">
                            {parcel.landInfo.address}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline" className="text-xs">
                              {parcel.landInfo.landType}
                            </Badge>
                            <span>잔여 {parcel.landInfo.remainingArea.toLocaleString()}㎡</span>
                            <span>({parcel.landInfo.remainingRatio.toFixed(1)}%)</span>
                          </div>
                          <div className="flex items-center justify-between pt-1">
                            <Badge className="bg-[rgb(20,113,97)] hover:bg-[rgb(20,113,97)]/90 text-xs">
                              매수 신청 가능
                            </Badge>
                            {isInCart(parcel.id) ? (
                              <Badge variant="secondary" className="text-xs">추가됨</Badge>
                            ) : (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddToCart(parcel);
                                }}
                                className="h-7 text-xs gap-1"
                              >
                                <ShoppingCart className="h-3 w-3" />
                                담기
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full px-4 py-12 text-center">
                    <AlertCircle className="h-10 w-10 text-muted-foreground/50 mb-3" />
                    <p className="font-medium text-muted-foreground">
                      매수 신청 가능한<br />잔여지가 없습니다.
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      담당자 사전 분석 완료 후<br />목록에 표시됩니다.
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* 접기/펼치기 버튼 */}
            <Button
              variant="secondary"
              size="icon"
              className="absolute -right-3 top-1/2 -translate-y-1/2 h-8 w-6 rounded-l-none rounded-r-md shadow-md z-20"
              onClick={() => setIsListCollapsed(!isListCollapsed)}
            >
              {isListCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* 우측 하단 - 선택된 필지 정보 카드 */}
        {selectedParcel && (
          <div className="absolute bottom-4 right-4 z-10 w-[320px]">
            <Card className="shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  선택된 필지
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="font-medium">{selectedParcel.landInfo.address}</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">토지유형</span>
                    <p className="font-medium">{selectedParcel.landInfo.landType}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">잔여면적</span>
                    <p className="font-medium">{selectedParcel.landInfo.remainingArea.toLocaleString()}㎡</p>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleViewDetail(selectedParcel)}
                  >
                    상세보기
                  </Button>
                  {!isInCart(selectedParcel.id) && (
                    <Button 
                      size="sm" 
                      className="flex-1 gap-1"
                      onClick={() => handleAddToCart(selectedParcel)}
                    >
                      <ShoppingCart className="h-3 w-3" />
                      신청 담기
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* 장바구니 (신청 목록) */}
      {cartItems.length > 0 && (
        <Card className="border-primary max-w-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                신청 목록
              </span>
              <Badge className="text-sm px-3 py-1">
                {cartItems.length}건
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4 max-h-[200px] overflow-y-auto">
              {cartItems.map((parcel) => (
                <div 
                  key={parcel.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{parcel.landInfo.address}</p>
                      <p className="text-xs text-muted-foreground">
                        {parcel.landInfo.landType} | {parcel.landInfo.remainingArea.toLocaleString()}㎡
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onRemoveFromCart(parcel.id)}
                    className="text-destructive hover:text-destructive h-8 px-2 flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button 
              className="w-full h-11 text-base gap-2"
              onClick={() => onSubmitApplication(cartItems)}
            >
              <FileText className="h-5 w-5" />
              신청서 작성
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 필지 상세 다이얼로그 */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">필지 상세</DialogTitle>
            <DialogDescription>
              확인 항목 선택 후 AI 분석을 실행하세요.
            </DialogDescription>
          </DialogHeader>

          {selectedParcel && (
            <div className="space-y-5">
              {/* 기본 정보 */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                  <p className="font-medium text-sm leading-snug">
                    {selectedParcel.landInfo.address}
                  </p>
                </div>
                <div className="grid grid-cols-4 gap-3 text-sm pt-2">
                  <div>
                    <span className="text-xs text-muted-foreground">토지유형</span>
                    <p className="font-medium">{selectedParcel.landInfo.landType}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">지목</span>
                    <p className="font-medium">{selectedParcel.landInfo.landCategory}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">잔여면적</span>
                    <p className="font-medium">{selectedParcel.landInfo.remainingArea.toLocaleString()}㎡</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">잔여비율</span>
                    <p className="font-medium">{selectedParcel.landInfo.remainingRatio.toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              {/* 확인 항목 선택 (AI 재분석용) */}
              <div className="space-y-3 border rounded-lg p-4">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  확인 항목 (AI 재분석)
                </h4>
                
                {/* 담당자 확인항목 체크박스 */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">확인항목</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {adminCheckItemOptions.map((option) => (
                      <div 
                        key={option.value}
                        className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors text-sm ${
                          checkItems[option.value as keyof AdminCheckItems] 
                            ? 'bg-primary/10 border-primary' 
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => setCheckItems(prev => ({
                          ...prev,
                          [option.value]: !prev[option.value as keyof AdminCheckItems]
                        }))}
                      >
                        <Checkbox 
                          id={option.value}
                          checked={checkItems[option.value as keyof AdminCheckItems]}
                          onCheckedChange={(checked) => setCheckItems(prev => ({
                            ...prev,
                            [option.value]: !!checked
                          }))}
                        />
                        <Label htmlFor={option.value} className="cursor-pointer font-normal text-xs">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* 토지 형상 및 활용지목 선택 */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">토지 형상</Label>
                    <Select value={selectedLandShape} onValueChange={(v) => setSelectedLandShape(v as LandShape)}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {["정방형", "가로장방형", "세로장방형", "사다리형", "역사다리형", "변형사다리형", "삼각형", "역삼각형", "부정형", "자루형"].map((shape) => (
                          <SelectItem key={shape} value={shape}>{shape}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">활용지목</Label>
                    <Select value={selectedLandUsage} onValueChange={(v) => setSelectedLandUsage(v as LandCategory)}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {["전", "답", "과", "대", "임", "목", "잡", "구", "도", "제", "천", "묘", "장", "양", "창", "주유소"].map((usage) => (
                          <SelectItem key={usage} value={usage}>{usage}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* AI 재분석 버튼 */}
                <Button 
                  onClick={handleReanalyze}
                  disabled={isAnalyzing}
                  className="w-full h-10 gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      분석 중...
                    </>
                  ) : (
                    <>
                      <AIIcon className="h-4 w-4" />
                      AI 분석
                    </>
                  )}
                </Button>
              </div>

              {/* AI 판정 결과 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <AIIcon className="h-4 w-4" />
                    AI 결과
                    {reanalyzedResult && <Badge variant="outline" className="text-xs">재분석</Badge>}
                  </h4>
                  {(() => {
                    const result = reanalyzedResult || selectedParcel.aiResult;
                    const isApproved = result.provisionalJudgment === "매수 신청 가능";
                    return (
                      <Badge className={`text-sm px-2 py-0.5 ${isApproved ? 'bg-[rgb(20,113,97)] hover:bg-[rgb(20,113,97)]/90' : 'bg-destructive'}`}>
                        {isApproved ? "신청 가능" : "신청 불가"}
                      </Badge>
                    );
                  })()}
                </div>
                
                {/* 기준 충족 여부 */}
                <div className="space-y-1.5 max-h-[180px] overflow-y-auto">
                  {(reanalyzedResult || selectedParcel.aiResult).criteriaChecks.map((check, index) => (
                    <div 
                      key={index}
                      className={`flex items-center justify-between p-2 rounded-lg border text-sm ${
                        check.isMet ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {check.isMet ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        )}
                        <span className="font-medium">{check.criteriaName}</span>
                      </div>
                      <Badge variant={check.isMet ? "default" : "secondary"} className="text-xs">
                        {check.isMet ? "충족" : "미충족"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI 상세 분석 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                <p className="font-medium text-sm text-blue-900">
                  {(reanalyzedResult || selectedParcel.aiResult).judgmentRationale.summary}
                </p>
                <p className="text-xs text-blue-700">
                  {(reanalyzedResult || selectedParcel.aiResult).judgmentRationale.legalBasis}
                </p>
              </div>

              {/* 소유자 정보 */}
              <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedParcel.landInfo.ownerName}</span>
                </div>
                {selectedParcel.landInfo.ownerContact && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedParcel.landInfo.ownerContact}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              닫기
            </Button>
            {selectedParcel && !isInCart(selectedParcel.id) && (reanalyzedResult?.provisionalJudgment === "매수 신청 가능" || (!reanalyzedResult && selectedParcel.aiResult.provisionalJudgment === "매수 신청 가능")) && (
              <Button onClick={() => handleAddToCart(selectedParcel)} className="gap-2">
                <ShoppingCart className="h-4 w-4" />
                추가
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
