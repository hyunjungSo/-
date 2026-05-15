"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  ChevronLeft
} from "lucide-react";
import { AIIcon } from "@/components/ui/ai-icon";
import type { PreRegisteredParcel } from "@/lib/types";
import { preRegisteredParcels } from "@/lib/dummy-data";

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
    setShowDetailDialog(true);
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
        <Card className="border-primary">
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
            <div className="space-y-2 mb-4">
              {cartItems.map((parcel) => (
                <div 
                  key={parcel.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">{parcel.landInfo.address}</p>
                      <p className="text-xs text-muted-foreground">
                        {parcel.landInfo.landType} | {parcel.landInfo.remainingArea.toLocaleString()}㎡
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onRemoveFromCart(parcel.id)}
                    className="text-destructive hover:text-destructive h-8 px-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button 
              className="w-full h-12 text-base gap-2"
              onClick={() => onSubmitApplication(cartItems)}
            >
              <FileText className="h-5 w-5" />
              신청서 작성하기
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 필지 상세 다이얼로그 */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">필지 상세 정보</DialogTitle>
            <DialogDescription>
              AI 분석 결과와 필지 정보를 확인하세요.
            </DialogDescription>
          </DialogHeader>

          {selectedParcel && (
            <div className="space-y-6">
              {/* 기본 정보 */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <MapPin className="h-5 w-5 text-primary" />
                  {selectedParcel.landInfo.address}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">토지유형</span>
                    <p className="font-medium text-base">{selectedParcel.landInfo.landType}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">지목</span>
                    <p className="font-medium text-base">{selectedParcel.landInfo.landCategory}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">잔여면적</span>
                    <p className="font-medium text-base">{selectedParcel.landInfo.remainingArea.toLocaleString()}㎡</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">잔여비율</span>
                    <p className="font-medium text-base">{selectedParcel.landInfo.remainingRatio.toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              {/* AI 판정 결과 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold flex items-center gap-2">
                    <AIIcon className="h-5 w-5" />
                    AI 분석 결과
                  </h4>
                  <Badge className="bg-[rgb(20,113,97)] hover:bg-[rgb(20,113,97)]/90 text-base px-3 py-1">
                    매수 신청 가능
                  </Badge>
                </div>
                
                {/* 기준 충족 여부 */}
                <div className="space-y-2">
                  {selectedParcel.aiResult.criteriaChecks.map((check, index) => (
                    <div 
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        check.isMet ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {check.isMet ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-gray-400" />
                        )}
                        <div>
                          <p className="font-medium">{check.criteriaName}</p>
                          <p className="text-sm text-muted-foreground">{check.criteriaDescription}</p>
                        </div>
                      </div>
                      <Badge variant={check.isMet ? "default" : "secondary"}>
                        {check.isMet ? "충족" : "미충족"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI 상세 분석 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <p className="font-medium text-blue-900">
                  {selectedParcel.aiResult.judgmentRationale.summary}
                </p>
                <div className="text-sm text-blue-800">
                  <p>
                    <strong>법적 근거:</strong> {selectedParcel.aiResult.judgmentRationale.legalBasis}
                  </p>
                </div>
              </div>

              {/* 소유자 정보 */}
              <div className="space-y-3">
                <h4 className="font-semibold">소유자 정보</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="text-sm text-muted-foreground">소유자명</span>
                      <p className="font-medium">{selectedParcel.landInfo.ownerName}</p>
                    </div>
                  </div>
                  {selectedParcel.landInfo.ownerContact && (
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <span className="text-sm text-muted-foreground">연락처</span>
                        <p className="font-medium">{selectedParcel.landInfo.ownerContact}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              닫기
            </Button>
            {selectedParcel && !isInCart(selectedParcel.id) && (
              <Button onClick={() => handleAddToCart(selectedParcel)} className="gap-2">
                <ShoppingCart className="h-4 w-4" />
                신청 목록에 추가
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
