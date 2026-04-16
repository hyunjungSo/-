"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { LandMap } from "@/components/land-map";
import { dummyLandInfoList } from "@/lib/dummy-data";
import type { LandInfo } from "@/lib/types";
import { Search, MapPin, List, ChevronRight } from "lucide-react";

interface LandSearchSectionProps {
  onLandSelect: (land: LandInfo) => void;
}

export function LandSearchSection({ onLandSelect }: LandSearchSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<LandInfo | null>(null);
  const [searchMethod, setSearchMethod] = useState("address");

  const handleSearch = () => {
    // 더미 데이터에서 검색 시뮬레이션
    const found = dummyLandInfoList.find(
      (land) =>
        land.address.includes(searchQuery) ||
        land.id.includes(searchQuery)
    );
    setSearchResult(found || null);
  };

  const handleListSelect = (land: LandInfo) => {
    setSearchResult(land);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* 검색 영역 */}
      <Card>
        <CardHeader>
          <CardTitle>토지 조회</CardTitle>
          <CardDescription>
            편입 토지 지번을 입력하거나 목록에서 선택하세요.
            잔여지에는 반드시 편입토지가 존재해야 합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={searchMethod} onValueChange={setSearchMethod}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="address" className="text-xs sm:text-sm">
                <Search className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                지번 입력
              </TabsTrigger>
              <TabsTrigger value="map" className="text-xs sm:text-sm">
                <MapPin className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                지도 선택
              </TabsTrigger>
              <TabsTrigger value="list" className="text-xs sm:text-sm">
                <List className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                목록 선택
              </TabsTrigger>
            </TabsList>

            <TabsContent value="address" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address-input">편입토지 지번</Label>
                <div className="flex gap-2">
                  <Input
                    id="address-input"
                    placeholder="예: 경기도 용인시 처인구 포곡읍 마성리 123-4"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                  <Button onClick={handleSearch}>조회</Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  테스트: &quot;마성리&quot;, &quot;신리&quot;, &quot;봉남리&quot;, &quot;진사리&quot; 검색 가능
                </p>
              </div>
            </TabsContent>

            <TabsContent value="map" className="mt-4">
              <LandMap interactive showOverlay={false} />
              <p className="mt-2 text-sm text-muted-foreground">
                지도에서 편입토지 또는 잔여지를 클릭하여 선택하세요.
              </p>
            </TabsContent>

            <TabsContent value="list" className="mt-4">
              <div className="space-y-2">
                <Label>보상조서 조회 데이터 목록</Label>
                <div className="max-h-[300px] space-y-2 overflow-y-auto rounded-lg border border-border p-2">
                  {dummyLandInfoList.map((land) => (
                    <button
                      key={land.id}
                      onClick={() => handleListSelect(land)}
                      className="flex w-full items-center justify-between rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-muted"
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          {land.address}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {land.landType} | {land.originalArea}㎡ | 소유자: {land.ownerName}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* 조회 결과 */}
      <Card>
        <CardHeader>
          <CardTitle>조회 결과</CardTitle>
          <CardDescription>
            선택한 토지의 상세 정보와 지도를 확인하세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {searchResult ? (
            <div className="space-y-4">
              <LandMap landInfo={searchResult} showOverlay />

              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <h4 className="mb-3 font-semibold text-foreground">토지 기본 정보</h4>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <dt className="text-muted-foreground">지번</dt>
                  <dd className="font-medium text-foreground">{searchResult.address}</dd>
                  
                  <dt className="text-muted-foreground">토지 유형</dt>
                  <dd className="font-medium text-foreground">{searchResult.landType}</dd>
                  
                  <dt className="text-muted-foreground">지목</dt>
                  <dd className="font-medium text-foreground">{searchResult.landCategory}</dd>
                  
                  <dt className="text-muted-foreground">편입 전 면적</dt>
                  <dd className="font-medium text-foreground">{searchResult.originalArea.toLocaleString()}㎡</dd>
                  
                  <dt className="text-muted-foreground">편입 면적</dt>
                  <dd className="font-medium text-destructive">{searchResult.includedArea.toLocaleString()}㎡</dd>
                  
                  <dt className="text-muted-foreground">잔여 면적</dt>
                  <dd className="font-medium text-primary">{searchResult.remainingArea.toLocaleString()}㎡</dd>
                  
                  <dt className="text-muted-foreground">잔여 비율</dt>
                  <dd className="font-medium text-foreground">{searchResult.remainingRatio}%</dd>
                  
                  <dt className="text-muted-foreground">소유자</dt>
                  <dd className="font-medium text-foreground">{searchResult.ownerName}</dd>
                </dl>
              </div>

              <Button 
                className="w-full" 
                size="lg"
                onClick={() => onLandSelect(searchResult)}
              >
                이 토지로 매수 신청하기
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex h-[400px] flex-col items-center justify-center text-center">
              <Search className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">
                토지를 조회하면 여기에 결과가 표시됩니다.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
