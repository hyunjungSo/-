"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { LandMap } from "@/components/land-map";
import { dummyLandInfoList } from "@/lib/dummy-data";
import type { LandInfo, AIAnalysisResult } from "@/lib/types";
import { Search, MapPin, ChevronRight, Bot, CheckCircle2, XCircle, AlertTriangle, Loader2, RotateCcw, Info, Ban } from "lucide-react";

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
  const [isSearching, setIsSearching] = useState(false);
  const [searchNotFound, setSearchNotFound] = useState(false);
  const [noIncludedLand, setNoIncludedLand] = useState(false);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSearchNotFound(false);
    setNoIncludedLand(false);
    setAiResult(null);
    
    // 검색 시뮬레이션 (0.5초 딜레이)
    setTimeout(() => {
      const found = dummyLandInfoList.find(
        (land) =>
          land.address.includes(searchQuery) ||
          land.id.includes(searchQuery)
      );
      setSearchResult(found || null);
      setSearchNotFound(!found);
      
      // 편입토지 없는 경우 체크
      if (found && !found.hasIncludedLand) {
        setNoIncludedLand(true);
      }
      
      setIsSearching(false);
    }, 500);
  };

  // 토지 조회 성공 시 자동으로 AI 분석 실행 (편입토지가 있는 경우에만)
  useEffect(() => {
    if (searchResult && !aiResult && !aiAnalyzing && searchResult.hasIncludedLand) {
      setAiAnalyzing(true);
      setTimeout(() => {
        const result = simulateAIAnalysis(searchResult);
        setAiResult(result);
        setAiAnalyzing(false);
      }, 1200);
    }
  }, [searchResult, aiResult, aiAnalyzing]);

  const handleReset = () => {
    setSearchQuery("");
    setSearchResult(null);
    setAiResult(null);
    setSearchNotFound(false);
    setNoIncludedLand(false);
  };

  return (
    <div className="space-y-6">
      {/* 진행 단계 표시 */}
      <div className="flex items-center justify-center gap-2 text-sm">
        <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 ${
          !searchResult ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        }`}>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs font-bold">1</span>
          <span>토지 검색</span>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 ${
          searchResult && !aiResult ? "bg-primary text-primary-foreground" : 
          aiResult ? "bg-muted text-muted-foreground" : "bg-muted/50 text-muted-foreground/50"
        }`}>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs font-bold">2</span>
          <span>AI 판독</span>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 ${
          aiResult ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground/50"
        }`}>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs font-bold">3</span>
          <span>결과 확인</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 검색 영역 */}
        <Card className="border-2 border-primary/20">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-primary" />
                  토지 조회
                </CardTitle>
                <CardDescription className="mt-1">
                  편입 토지 지번을 입력하여 잔여지 정보를 조회하세요.
                </CardDescription>
              </div>
              {searchResult && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleReset}
                  className="cursor-pointer text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="mr-1 h-4 w-4" />
                  초기화
                </Button>
              )}
            </div>
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
                <div className="space-y-3">
                  <Label htmlFor="address-input" className="text-sm font-medium">편입토지 지번</Label>
                  <div className="flex gap-2">
                    <Input
                      id="address-input"
                      placeholder="예: 마성리, 신리, 봉남리"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setSearchNotFound(false);
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      className={searchNotFound ? "border-destructive" : ""}
                    />
                    <Button 
                      onClick={handleSearch} 
                      className="cursor-pointer px-6"
                      disabled={isSearching || !searchQuery.trim()}
                    >
                      {isSearching ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "조회"
                      )}
                    </Button>
                  </div>
                  
                  {searchNotFound && (
                    <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                      <XCircle className="h-4 w-4 shrink-0" />
                      <span>검색 결과가 없습니다. 다른 지번으로 검색해 주세요.</span>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div className="text-xs text-muted-foreground">
                      <p className="font-medium text-foreground">검색 가능 지번 (테스트용)</p>
                      <p className="mt-1">
                        <span className="text-primary">편입토지 있음:</span> 마성리, 신리, 봉남리, 진사리
                      </p>
                      <p className="mt-0.5">
                        <span className="text-destructive">편입토지 없음:</span> 금곡동, 가장리
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="map" className="mt-4">
                <LandMap interactive showOverlay={false} />
                <p className="mt-2 text-center text-sm text-muted-foreground">
                  지도에서 토지를 클릭하여 선택하세요.
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* 조회 결과 */}
        <Card className={`border-2 transition-all duration-300 ${
          searchResult ? "border-primary/20" : "border-dashed border-muted-foreground/20"
        }`}>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              {noIncludedLand ? (
                <Ban className="h-5 w-5 text-destructive" />
              ) : aiAnalyzing ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : aiResult ? (
                aiResult.provisionalJudgment === "매수" ? (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive" />
                )
              ) : (
                <Bot className="h-5 w-5 text-muted-foreground" />
              )}
              {noIncludedLand 
                ? "신청 불가" 
                : aiAnalyzing 
                  ? "AI 분석 중..." 
                  : aiResult 
                    ? "AI 판독 완료" 
                    : "조회 결과"}
            </CardTitle>
            <CardDescription>
              {noIncludedLand
                ? "편입토지가 없는 토지는 잔여지 매수 신청이 불가합니다."
                : aiAnalyzing 
                  ? "잠시만 기다려 주세요. AI가 토지 정보를 분석하고 있습니다."
                  : aiResult 
                    ? "AI 분석이 완료되었습니다. 결과를 확인하고 신청을 진행하세요."
                    : "토지를 조회하면 AI가 자동으로 매수 가능 여부를 분석합니다."
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {searchResult ? (
              <div className="space-y-4">
                {/* 지도 - 컴팩트하게 */}
                <div className="overflow-hidden rounded-lg border border-border">
                  <LandMap landInfo={searchResult} showOverlay />
                </div>

                {/* 토지 정보 - 컴팩트한 그리드 */}
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">지번</span>
                      <span className="font-medium">{searchResult.address.split(" ").slice(-2).join(" ")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">지목</span>
                      <span className="font-medium">{searchResult.landCategory}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">편입 면적</span>
                      <span className="font-medium text-destructive">{searchResult.includedArea.toLocaleString()}m²</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">잔여 면적</span>
                      <span className="font-medium text-primary">{searchResult.remainingArea.toLocaleString()}m²</span>
                    </div>
                    <div className="col-span-2 flex justify-between border-t border-border pt-1.5">
                      <span className="text-muted-foreground">잔여 비율</span>
                      <span className={`font-bold ${searchResult.remainingRatio <= 30 ? "text-primary" : "text-foreground"}`}>
                        {searchResult.remainingRatio}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* 편입토지 없음 경고 */}
                {noIncludedLand && (
                  <div className="rounded-lg border-2 border-destructive bg-destructive/5 p-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="rounded-full bg-destructive/10 p-3">
                        <Ban className="h-8 w-8 text-destructive" />
                      </div>
                      <h4 className="mt-4 text-lg font-bold text-destructive">편입토지 없음</h4>
                      <p className="mt-2 text-sm text-muted-foreground">
                        해당 토지는 도로 등에 편입된 토지가 없습니다.
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        잔여지 매수 신청은 <span className="font-medium text-foreground">편입토지가 있는 경우에만</span> 가능합니다.
                      </p>
                    </div>
                    
                    <div className="mt-4 rounded-lg bg-muted/50 p-3">
                      <p className="text-xs font-medium text-foreground">잔여지 매수 신청 조건</p>
                      <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                        <li className="flex items-center gap-1.5">
                          <XCircle className="h-3 w-3 text-destructive" />
                          <span>편입토지 존재 여부: <span className="font-medium text-destructive">미충족</span></span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <Info className="mt-0.5 h-3 w-3 text-muted-foreground" />
                          <span>공익사업(도로, 철도 등)에 토지가 편입되어 잔여지가 발생한 경우에만 매수 신청이 가능합니다.</span>
                        </li>
                      </ul>
                    </div>

                    <Button 
                      variant="outline"
                      className="mt-4 w-full cursor-pointer" 
                      onClick={handleReset}
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      다른 토지 검색하기
                    </Button>
                  </div>
                )}

                {/* AI 분석 중 */}
                {aiAnalyzing && !noIncludedLand && (
                  <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 py-8">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="mt-3 font-medium text-primary">AI 자동 판독 진행 중</p>
                    <p className="mt-1 text-sm text-muted-foreground">형상지수, 잔여비율 등을 분석하고 있습니다.</p>
                  </div>
                )}

                {/* AI 결과 */}
                {aiResult && !noIncludedLand && (
                  <div className="space-y-3">
                    <div className={`rounded-lg border-2 p-4 ${
                      aiResult.provisionalJudgment === "매수" 
                        ? "border-primary bg-primary/5" 
                        : "border-destructive bg-destructive/5"
                    }`}>
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bot className="h-5 w-5 text-primary" />
                          <span className="font-semibold text-foreground">AI 판독 결과</span>
                        </div>
                        <div className={`rounded-full px-3 py-1 text-sm font-bold ${
                          aiResult.provisionalJudgment === "매수"
                            ? "bg-primary text-primary-foreground"
                            : "bg-destructive text-destructive-foreground"
                        }`}>
                          {aiResult.provisionalJudgment === "매수" ? "매수 가능" : "기준 미충족"}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        {aiResult.criteriaChecks.map((check, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            {check.isMet ? (
                              <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                            ) : (
                              <XCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
                            )}
                            <span className={check.isMet ? "text-foreground" : "text-muted-foreground"}>
                              {check.criteriaName}
                            </span>
                            {!check.autoDetected && (
                              <span className="rounded bg-warning/20 px-1.5 py-0.5 text-xs text-warning-foreground">
                                수동확인
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {aiResult.provisionalJudgment !== "매수" && (
                      <div className="flex items-start gap-2 rounded-lg border border-warning/50 bg-warning/10 p-3">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                        <p className="text-xs text-foreground">
                          AI 분석 결과 기준 미충족이지만, 현장 상황에 따라 다를 수 있습니다.
                        </p>
                      </div>
                    )}

                    <Button 
                      className="w-full cursor-pointer" 
                      size="lg"
                      onClick={() => onLandSelect(searchResult, aiResult)}
                    >
                      {aiResult.provisionalJudgment === "매수" ? "매수 신청 진행하기" : "그래도 신청하기"}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-[300px] flex-col items-center justify-center text-center">
                <div className="rounded-full bg-muted p-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="mt-4 font-medium text-foreground">토지를 조회해 주세요</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  좌측에서 지번을 입력하거나 지도에서 선택하세요.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
