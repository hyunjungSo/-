"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { LandMap } from "@/components/land-map";
import { dummyLandInfoList } from "@/lib/dummy-data";
import type { LandInfo, AIAnalysisResult } from "@/lib/types";
import { Search, MapPin, ChevronRight, Bot, CheckCircle2, XCircle, AlertTriangle, Loader2 } from "lucide-react";

interface LandSearchSectionProps {
  onLandSelect: (land: LandInfo, aiResult: AIAnalysisResult) => void;
}

// AI 분석 결과 시뮬레이션
function simulateAIAnalysis(land: LandInfo): AIAnalysisResult {
  const shapeIndexChange = land.originalShapeIndex - land.remainingShapeIndex;
  
  // 잔여지 비율 30% 이하이거나 형상지수 변화가 크면 매수 권장
  const shouldPurchase = land.remainingRatio <= 30 || shapeIndexChange >= 0.15;
  
  return {
    landTypePath: land.landType,
    criteriaChecks: [
      {
        criteriaName: "잔여지 비율",
        criteriaDescription: `잔여 비율 ${land.remainingRatio}% (기준: 30% 이하)`,
        isMet: land.remainingRatio <= 30,
        autoDetected: true,
      },
      {
        criteriaName: "형상지수 변화",
        criteriaDescription: `형상지수 변화 ${shapeIndexChange.toFixed(2)} (기준: 0.15 이상)`,
        isMet: shapeIndexChange >= 0.15,
        autoDetected: true,
      },
      {
        criteriaName: "토지 형상",
        criteriaDescription: `잔여지 형상: ${land.remainingShape}`,
        isMet: ["부정형", "삼각형", "역삼각형", "자루형"].includes(land.remainingShape),
        autoDetected: true,
      },
      {
        criteriaName: "맹지 여부",
        criteriaDescription: "접면도로 상실로 인한 맹지화",
        isMet: land.remainingRatio <= 20,
        autoDetected: false,
      },
    ],
    provisionalJudgment: shouldPurchase ? "매수" : "기각",
    originalShapeIndex: land.originalShapeIndex,
    remainingShapeIndex: land.remainingShapeIndex,
    shapeIndexChange,
    isBlindLand: land.remainingRatio <= 20,
    accessRoadLost: false,
    waterChannelLost: false,
  };
}

export function LandSearchSection({ onLandSelect }: LandSearchSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<LandInfo | null>(null);
  const [searchMethod, setSearchMethod] = useState("address");
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);

  const handleSearch = () => {
    // 더미 데이터에서 검색 시뮬레이션
    const found = dummyLandInfoList.find(
      (land) =>
        land.address.includes(searchQuery) ||
        land.id.includes(searchQuery)
    );
    setSearchResult(found || null);
    setAiResult(null);
  };

  const handleAIAnalysis = () => {
    if (!searchResult) return;
    
    setAiAnalyzing(true);
    // AI 분석 시뮬레이션 (1.5초 딜레이)
    setTimeout(() => {
      const result = simulateAIAnalysis(searchResult);
      setAiResult(result);
      setAiAnalyzing(false);
    }, 1500);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* 검색 영역 */}
      <Card>
        <CardHeader>
          <CardTitle>토지 조회</CardTitle>
          <CardDescription>
            편입 토지 지번을 입력하세요.
            잔여지에는 반드시 편입토지가 존재해야 합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={searchMethod} onValueChange={setSearchMethod}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="address" className="cursor-pointer text-xs sm:text-sm">
                <Search className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                지번 입력
              </TabsTrigger>
              <TabsTrigger value="map" className="cursor-pointer text-xs sm:text-sm">
                <MapPin className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                지도 선택
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
                  <Button onClick={handleSearch} className="cursor-pointer">조회</Button>
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
          </Tabs>
        </CardContent>
      </Card>

      {/* 조회 결과 */}
      <Card>
        <CardHeader>
          <CardTitle>조회 결과</CardTitle>
          <CardDescription>
            선택한 토지의 상세 정보와 AI 판독 결과를 확인하세요.
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

              {/* AI 자동 판독 영역 */}
              {!aiResult ? (
                <Button 
                  variant="outline"
                  className="w-full cursor-pointer border-primary text-primary hover:bg-primary hover:text-primary-foreground" 
                  size="lg"
                  onClick={handleAIAnalysis}
                  disabled={aiAnalyzing}
                >
                  {aiAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      AI 분석 중...
                    </>
                  ) : (
                    <>
                      <Bot className="mr-2 h-5 w-5" />
                      AI 자동 판독 실행
                    </>
                  )}
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className={`rounded-lg border-2 p-4 ${
                    aiResult.provisionalJudgment === "매수" 
                      ? "border-primary bg-primary/5" 
                      : "border-destructive bg-destructive/5"
                  }`}>
                    <div className="mb-3 flex items-center gap-2">
                      <Bot className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold text-foreground">AI 자동 판독 결과</h4>
                    </div>
                    
                    <div className="mb-3 flex items-center gap-2">
                      {aiResult.provisionalJudgment === "매수" ? (
                        <>
                          <CheckCircle2 className="h-6 w-6 text-primary" />
                          <span className="text-lg font-bold text-primary">매수 가능성 높음</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-6 w-6 text-destructive" />
                          <span className="text-lg font-bold text-destructive">매수 기준 미충족</span>
                        </>
                      )}
                    </div>

                    <div className="space-y-2">
                      {aiResult.criteriaChecks.map((check, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          {check.isMet ? (
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          ) : (
                            <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                          )}
                          <div>
                            <span className="font-medium">{check.criteriaName}</span>
                            <span className="text-muted-foreground"> - {check.criteriaDescription}</span>
                            {!check.autoDetected && (
                              <span className="ml-1 rounded bg-warning/20 px-1 py-0.5 text-xs text-warning-foreground">
                                수동확인필요
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {aiResult.provisionalJudgment !== "매수" && (
                    <div className="flex items-start gap-2 rounded-lg border border-warning bg-warning/10 p-3">
                      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
                      <p className="text-sm text-foreground">
                        AI 판독 결과 매수 기준에 충족하지 않을 가능성이 높습니다. 
                        그래도 신청을 원하시면 아래 버튼을 클릭하세요.
                      </p>
                    </div>
                  )}

                  <Button 
                    className="w-full cursor-pointer" 
                    size="lg"
                    onClick={() => onLandSelect(searchResult, aiResult)}
                  >
                    {aiResult.provisionalJudgment === "매수" ? "매수 신청 진행하기" : "그래도 매수 신청하기"}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
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
