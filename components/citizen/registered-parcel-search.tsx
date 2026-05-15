"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Search, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  Info, 
  FileText,
  ChevronRight,
  User,
  Phone,
  Home,
  AlertCircle,
  Loader2,
  ShoppingCart
} from "lucide-react";
import { AIIcon } from "@/components/ui/ai-icon";
import type { 
  PreRegisteredParcel, 
  LandInfo, 
  AIAnalysisResult,
  ApplicationCartItem 
} from "@/lib/types";
import { preRegisteredParcels } from "@/lib/dummy-data";

interface RegisteredParcelSearchProps {
  onAddToCart: (parcel: PreRegisteredParcel) => void;
  cartItems: PreRegisteredParcel[];
  onSubmitApplication: (parcels: PreRegisteredParcel[]) => void;
}

export function RegisteredParcelSearch({ 
  onAddToCart, 
  cartItems, 
  onSubmitApplication 
}: RegisteredParcelSearchProps) {
  // 검색 조건
  const [searchAddress, setSearchAddress] = useState("");
  const [searchOwner, setSearchOwner] = useState("");
  
  // 검색 실행 여부
  const [hasSearched, setHasSearched] = useState(false);
  
  // 선택된 필지 상세 보기
  const [selectedParcel, setSelectedParcel] = useState<PreRegisteredParcel | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  
  // 검색 중 상태
  const [isSearching, setIsSearching] = useState(false);

  // 매수가능 필지만 필터링 (민원인은 매수가능 필지만 조회 가능)
  const availableParcels = useMemo(() => {
    return preRegisteredParcels.filter(
      p => p.preRegistrationStatus === "등록완료" && 
           p.aiResult.provisionalJudgment === "매수가능"
    );
  }, []);

  // 검색 결과 필터링
  const searchResults = useMemo(() => {
    if (!hasSearched) return [];
    
    return availableParcels.filter(parcel => {
      const addressMatch = searchAddress === "" || 
        parcel.landInfo.address.toLowerCase().includes(searchAddress.toLowerCase());
      const ownerMatch = searchOwner === "" || 
        parcel.landInfo.ownerName.includes(searchOwner);
      return addressMatch && ownerMatch;
    });
  }, [availableParcels, searchAddress, searchOwner, hasSearched]);

  // 검색 실행
  const handleSearch = async () => {
    if (!searchAddress && !searchOwner) {
      alert("주소 또는 소유자명을 입력해주세요.");
      return;
    }
    
    setIsSearching(true);
    // 검색 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 800));
    setHasSearched(true);
    setIsSearching(false);
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

  return (
    <div className="space-y-6">
      {/* 안내 메시지 */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Info className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="font-semibold text-blue-900">잔여지 매수 신청 안내</p>
              <p className="text-blue-800">
                담당자가 사전 분석한 잔여지 중 매수 가능 판정을 받은 필지만 조회 및 신청할 수 있습니다.
                주소 또는 소유자명으로 검색하여 해당 필지를 찾아 신청해 주세요.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 검색 폼 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Search className="h-5 w-5" />
            필지 검색
          </CardTitle>
          <CardDescription>
            매수 신청 가능한 잔여지를 검색합니다. 주소 또는 소유자명으로 검색하세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                지번 주소
              </Label>
              <Input
                id="address"
                placeholder="예: 용인시 처인구 양지면"
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="h-12 text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="owner" className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                소유자명
              </Label>
              <Input
                id="owner"
                placeholder="예: 홍길동"
                value={searchOwner}
                onChange={(e) => setSearchOwner(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="h-12 text-base"
              />
            </div>
          </div>
          <Button 
            onClick={handleSearch} 
            disabled={isSearching}
            className="w-full mt-4 h-12 text-base gap-2"
          >
            {isSearching ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                검색 중...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                필지 검색
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* 검색 결과 */}
      {hasSearched && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                검색 결과
              </span>
              <Badge variant="secondary" className="text-base px-3 py-1">
                {searchResults.length}건
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {searchResults.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>지번주소</TableHead>
                    <TableHead>토지유형</TableHead>
                    <TableHead className="text-right">잔여면적</TableHead>
                    <TableHead>AI 판정</TableHead>
                    <TableHead>소유자</TableHead>
                    <TableHead className="text-center">신청</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searchResults.map((parcel) => (
                    <TableRow 
                      key={parcel.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleViewDetail(parcel)}
                    >
                      <TableCell className="font-medium">
                        {parcel.landInfo.address}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{parcel.landInfo.landType}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {parcel.landInfo.remainingArea.toLocaleString()}㎡
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className="bg-[rgb(20,113,97)] hover:bg-[rgb(20,113,97)]/90"
                        >
                          매수가능
                        </Badge>
                      </TableCell>
                      <TableCell>{parcel.landInfo.ownerName}</TableCell>
                      <TableCell className="text-center">
                        {isInCart(parcel.id) ? (
                          <Badge variant="secondary">추가됨</Badge>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(parcel);
                            }}
                            className="gap-1"
                          >
                            <ShoppingCart className="h-3 w-3" />
                            담기
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-lg font-medium text-muted-foreground">
                  검색 조건에 맞는 필지가 없습니다.
                </p>
                <p className="text-muted-foreground mt-2">
                  다른 검색어로 다시 시도해 주세요.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 장바구니 (신청 목록) */}
      {cartItems.length > 0 && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="text-xl flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                신청 목록
              </span>
              <Badge className="text-base px-3 py-1">
                {cartItems.length}건
              </Badge>
            </CardTitle>
            <CardDescription>
              선택한 필지들을 확인하고 신청서를 제출하세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-4">
              {cartItems.map((parcel) => (
                <div 
                  key={parcel.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium">{parcel.landInfo.address}</p>
                      <p className="text-sm text-muted-foreground">
                        {parcel.landInfo.landType} | {parcel.landInfo.remainingArea.toLocaleString()}㎡
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      // 장바구니에서 제거 로직 (부모에서 처리)
                    }}
                    className="text-destructive hover:text-destructive"
                  >
                    삭제
                  </Button>
                </div>
              ))}
            </div>
            <Button 
              className="w-full h-12 text-base gap-2"
              onClick={() => onSubmitApplication(cartItems)}
            >
              <FileText className="h-4 w-4" />
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
                    <p className="font-medium">{selectedParcel.landInfo.landType}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">지목</span>
                    <p className="font-medium">{selectedParcel.landInfo.landCategory}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">잔여면적</span>
                    <p className="font-medium">{selectedParcel.landInfo.remainingArea.toLocaleString()}㎡</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">잔여비율</span>
                    <p className="font-medium">{selectedParcel.landInfo.remainingRatio.toFixed(1)}%</p>
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
                  <Badge 
                    className="bg-[rgb(20,113,97)] hover:bg-[rgb(20,113,97)]/90 text-base px-3 py-1"
                  >
                    매수가능
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
