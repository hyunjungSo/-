"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { LandMap } from "@/components/land-map";
import { dummyLandInfoList } from "@/lib/dummy-data";
import type { LandInfo, AIAnalysisResult, JudgmentRationale } from "@/lib/types";
import { Search, MapPin, ChevronRight, Bot, CheckCircle2, XCircle, AlertTriangle, Loader2, RotateCcw, Info, Ban, FileText, Scale, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface LandSearchSectionProps {
  onLandSelect: (land: LandInfo, aiResult: AIAnalysisResult) => void;
}

// 판단 근거 설명 컴포넌트
function JudgmentRationaleSection({ rationale }: { rationale: JudgmentRationale }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full cursor-pointer justify-between"
          size="sm"
        >
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-primary" />
            <span>판단 근거 상세 보기</span>
          </div>
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3 space-y-3">
        {/* 판단 요약 */}
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-start gap-2">
            <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <h4 className="font-semibold text-foreground">판단 요약</h4>
              <p className="mt-1 text-sm text-muted-foreground">{rationale.summary}</p>
            </div>
          </div>
        </div>

        {/* 법적 근거 */}
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <div className="flex items-start gap-2">
            <Scale className="mt-0.5 h-5 w-5 shrink-0 text-chart-3" />
            <div>
              <h4 className="font-semibold text-foreground">법적 근거</h4>
              <p className="mt-1 text-sm text-muted-foreground">{rationale.legalBasis}</p>
            </div>
          </div>
        </div>

        {/* 적용 기준 */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h4 className="mb-2 font-semibold text-foreground">적용 기준</h4>
          <ul className="space-y-1.5">
            {rationale.appliedCriteria.map((criteria, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>{criteria}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 수동 확인 필요 항목 */}
        {rationale.manualCheckItems && rationale.manualCheckItems.length > 0 && (
          <div className="rounded-lg border border-warning/50 bg-warning/5 p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
              <div>
                <h4 className="font-semibold text-foreground">수동 확인 필요 항목</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  다음 항목은 AI 자동 판독이 불가하여 담당자가 현장 확인 후 판단합니다.
                </p>
                <ul className="mt-2 space-y-1">
                  {rationale.manualCheckItems.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <Info className="h-3 w-3 text-warning" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 상세 설명 */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h4 className="mb-2 font-semibold text-foreground">상세 분석 내용</h4>
          <pre className="whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">
            {rationale.detailedExplanation}
          </pre>
        </div>

        {/* 안내 문구 */}
        <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-xs text-muted-foreground">
            본 AI 판독 결과는 참고용이며, 최종 판정은 담당자 검토 및 관련 법령에 따라 결정됩니다. 
            판단 근거에 이의가 있으시면 신청서 제출 시 의견을 기재해 주시기 바랍니다.
          </p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// AI 분석 결과 시뮬레이션
function simulateAIAnalysis(land: LandInfo): AIAnalysisResult {
  const shapeIndexChange = land.remainingShapeIndex - land.originalShapeIndex;
  
  const criteriaChecks = [
    {
      criteriaName: "잔여지 비율",
      criteriaDescription: `잔여 비율 ${land.remainingRatio}% (기준: 30% 이하)`,
      isMet: land.remainingRatio <= 30,
      autoDetected: true,
    },
    {
      criteriaName: "형상지수 변화",
      criteriaDescription: `형상지수 변화 +${shapeIndexChange.toFixed(1)} (기준: 1.0 이상)`,
      isMet: shapeIndexChange >= 1.0,
      autoDetected: true,
    },
    {
      criteriaName: "토지 형상",
      criteriaDescription: `잔여지 형상: ${land.remainingShape}`,
      isMet: ["부정형", "삼각형", "역삼각형", "자루형"].includes(land.remainingShape),
      autoDetected: true,
    },
    {
      criteriaName: "접면도로 상실",
      criteriaDescription: "접면도로 상실로 건축허가 불가 또는 종래 목적 사용 곤란",
      isMet: false,
      autoDetected: false, // 수동 확인 필요
    },
  ];

  // 농지의 경우 추가 수동 확인 항목
  if (land.landType === "농지") {
    criteriaChecks.push({
      criteriaName: "농기계 진입/회전 곤란",
      criteriaDescription: "농기계 진입 및 회전이 곤란하여 영농이 불가능한 경우",
      isMet: false,
      autoDetected: false,
    });
    criteriaChecks.push({
      criteriaName: "수로 상실",
      criteriaDescription: "관개수로 상실로 농업용수 공급이 불가능한 경우",
      isMet: false,
      autoDetected: false,
    });
  }

  // 자동 판독 기준 충족 개수
  const metAutoCriteria = criteriaChecks.filter(c => c.isMet && c.autoDetected).length;
  const hasManualCheckNeeded = criteriaChecks.some(c => !c.autoDetected);
  const manualCheckItems = criteriaChecks.filter(c => !c.autoDetected).map(c => c.criteriaName);
  const metCriteriaNames = criteriaChecks.filter(c => c.isMet).map(c => c.criteriaName);
  
  // 경계 사례 판정: 자동 판독 기준 1개만 충족하고 수동 확인 항목이 있는 경우
  const isBorderlineCase = metAutoCriteria === 1 && hasManualCheckNeeded;
  
  let provisionalJudgment: "매수" | "기각" | "심의위원회이관";
  let borderlineReason: string | undefined;
  
  if (isBorderlineCase) {
    provisionalJudgment = "심의위원회이관";
    borderlineReason = "자동 판독 기준 충족이 애매합니다. 담당자 검토 후 최종 결정됩니다.";
  } else if (metAutoCriteria >= 2) {
    provisionalJudgment = "매수";
  } else {
    provisionalJudgment = "기각";
  }

  // 판단 근거 생성
  const judgmentRationale: JudgmentRationale = generateJudgmentRationale(
    land,
    provisionalJudgment,
    metAutoCriteria,
    metCriteriaNames,
    manualCheckItems,
    shapeIndexChange
  );
  
  return {
    landTypePath: land.landType,
    criteriaChecks,
    provisionalJudgment,
    originalShapeIndex: land.originalShapeIndex,
    remainingShapeIndex: land.remainingShapeIndex,
    shapeIndexChange,
    isBlindLand: land.remainingRatio <= 20,
    accessRoadLost: false,
    waterChannelLost: false,
    farmMachineDifficulty: false,
    isBorderlineCase,
    borderlineReason,
    judgmentRationale,
  };
}

// 판단 근거 설명 생성 함수
function generateJudgmentRationale(
  land: LandInfo,
  judgment: "매수" | "기각" | "심의위원회이관",
  metCriteriaCount: number,
  metCriteriaNames: string[],
  manualCheckItems: string[],
  shapeIndexChange: number
): JudgmentRationale {
  const legalBasis = "「공익사업을 위한 토지 등의 취득 및 보상에 관한 법률」 제74조(잔여지의 매수청구 등) 및 동법 시행규칙 제34조(잔여지 등의 매수청구)";
  
  let summary: string;
  let detailedExplanation: string;
  const appliedCriteria: string[] = [];

  // 토지 유형별 기준 설명
  if (land.landType === "대지") {
    appliedCriteria.push(`대지 면적 기준: 주거지역 90㎡, 상업지역 150㎡, 공업지역 330㎡ 이하 (잔여비율 25% 이하 시 1.5배 완화)`);
  } else if (land.landType === "농지") {
    appliedCriteria.push(`농지 면적 기준: 330㎡ 이하 (잔여비율 25% 이하 시 495㎡까지 완화)`);
  } else if (land.landType === "산지") {
    appliedCriteria.push(`산지 면적 기준: 990㎡ 이하`);
  } else {
    appliedCriteria.push(`그 밖의 토지 면적 기준: 330㎡ 이하`);
  }
  
  appliedCriteria.push(`형상지수 변화 기준: 편입 전 대비 1.0 이상 상승 시 형상 불량으로 판단`);
  appliedCriteria.push(`토지 형상 기준: 삼각형, 역삼각형, 자루형, 부정형 등 불규칙 형상`);
  appliedCriteria.push(`잔여비율 기준: 30% 이하일 경우 종래 목적 사용 곤란으로 판단`);

  if (judgment === "매수") {
    summary = `본 토지는 잔여지 매수 기준 ${metCriteriaCount}개 항목을 충족하여 「매수 가능」으로 판정되었습니다.`;
    
    detailedExplanation = `1. 분석 대상 토지
- 소재지: ${land.address}
- 토지 유형: ${land.landType}
- 지목: ${land.landCategory}

2. 편입 현황
- 편입 전 면적: ${land.originalArea.toLocaleString()}㎡
- 편입 면적: ${land.includedArea.toLocaleString()}㎡
- 잔여 면적: ${land.remainingArea.toLocaleString()}㎡
- 잔여 비율: ${land.remainingRatio}%

3. 형상 분석
- 편입 전 형상: ${land.originalShape} (형상지수 ${land.originalShapeIndex})
- 잔여지 형상: ${land.remainingShape} (형상지수 ${land.remainingShapeIndex})
- 형상지수 변화: +${shapeIndexChange.toFixed(1)}

4. 충족 기준
${metCriteriaNames.map((name, i) => `${i + 1}) ${name}`).join("\n")}

5. 판정 결과
위 분석 결과, 본 토지는 공익사업 편입으로 인해 잔여지의 종래 목적대로 사용이 현저히 곤란하게 되었으므로, 잔여지 매수 청구 대상에 해당합니다.`;

  } else if (judgment === "기각") {
    summary = `본 토지는 잔여지 매수 기준을 충족하지 않아 「기각」으로 판정되었습니다.`;
    
    detailedExplanation = `1. 분석 대상 토지
- 소재지: ${land.address}
- 토지 유형: ${land.landType}
- 지목: ${land.landCategory}

2. 편입 현황
- 편입 전 면적: ${land.originalArea.toLocaleString()}㎡
- 편입 면적: ${land.includedArea.toLocaleString()}㎡
- 잔여 면적: ${land.remainingArea.toLocaleString()}㎡
- 잔여 비율: ${land.remainingRatio}%

3. 형상 분석
- 편입 전 형상: ${land.originalShape} (형상지수 ${land.originalShapeIndex})
- 잔여지 형상: ${land.remainingShape} (형상지수 ${land.remainingShapeIndex})
- 형상지수 변화: +${shapeIndexChange.toFixed(1)}

4. 미충족 사유
- 잔여 비율 ${land.remainingRatio}%로 기준(30% 이하) 초과
- 형상지수 변화 ${shapeIndexChange.toFixed(1)}로 기준(1.0 이상) 미달
- 잔여지 형상이 정상 범위 내로 종래 용도 사용 가능

5. 판정 결과
위 분석 결과, 본 토지는 공익사업 편입 후에도 잔여지의 종래 목적대로 사용이 가능한 것으로 판단되어, 잔여지 매수 청구 대상에 해당하지 않습니다.

※ 단, 현장 상황에 따라 실제 사용 가능 여부가 다를 수 있으며, 이 경우 담당자 검토를 통해 재판정될 수 있습니다.`;

  } else {
    summary = `본 토지는 자동 판독 기준만으로 명확한 판정이 어려워 「심의위원회 이관」이 필요합니다.`;
    
    detailedExplanation = `1. 분석 대상 토지
- 소재지: ${land.address}
- 토지 유형: ${land.landType}
- 지목: ${land.landCategory}

2. 편입 현황
- 편입 전 면적: ${land.originalArea.toLocaleString()}㎡
- 편입 면적: ${land.includedArea.toLocaleString()}㎡
- 잔여 면적: ${land.remainingArea.toLocaleString()}㎡
- 잔여 비율: ${land.remainingRatio}%

3. 형상 분석
- 편입 전 형상: ${land.originalShape} (형상지수 ${land.originalShapeIndex})
- 잔여지 형상: ${land.remainingShape} (형상지수 ${land.remainingShapeIndex})
- 형상지수 변화: +${shapeIndexChange.toFixed(1)}

4. 경계 사례 판정 사유
- 자동 판독 가능 기준 중 일부만 충족
- 수동 확인이 필요한 항목 존재: ${manualCheckItems.join(", ")}

5. 판정 결과
본 토지는 자동 판독 기준만으로는 명확한 판정이 어려운 경계 사례입니다. 담당자가 현장 확인 및 추가 검토를 진행한 후, 필요시 토지보상심의위원회에서 최종 판정합니다.

※ 수동 확인 항목(접면도로 상실, 농기계 진입 곤란, 수로 상실 등)의 충족 여부에 따라 최종 판정이 달라질 수 있습니다.`;
  }

  return {
    summary,
    legalBasis,
    appliedCriteria,
    detailedExplanation,
    manualCheckItems: manualCheckItems.length > 0 ? manualCheckItems : undefined,
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
      {/* KRDS 진행 단계 표시기 */}
      <nav aria-label="신청 진행 단계" className="w-full">
        <ol className="flex items-center justify-center">
          {/* Step 1: 토지 검색 */}
          <li className="flex items-center">
            <div className={`flex items-center gap-2 ${!searchResult ? "text-primary" : "text-muted-foreground"}`}>
              <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                !searchResult 
                  ? "bg-primary text-white" 
                  : "bg-gray-200 text-gray-600"
              }`}>
                1
              </span>
              <span className={`text-sm font-medium ${!searchResult ? "text-primary" : "text-muted-foreground"}`}>
                토지 검색
              </span>
            </div>
          </li>
          
          {/* Connector 1-2 */}
          <li className="mx-4 h-px w-12 bg-gray-300 sm:w-16" aria-hidden="true" />
          
          {/* Step 2: AI 판독 */}
          <li className="flex items-center">
            <div className={`flex items-center gap-2 ${
              searchResult && !aiResult ? "text-primary" : aiResult ? "text-muted-foreground" : "text-gray-400"
            }`}>
              <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                searchResult && !aiResult 
                  ? "bg-primary text-white" 
                  : aiResult 
                    ? "bg-gray-200 text-gray-600"
                    : "bg-gray-100 text-gray-400"
              }`}>
                2
              </span>
              <span className={`text-sm font-medium ${
                searchResult && !aiResult ? "text-primary" : aiResult ? "text-muted-foreground" : "text-gray-400"
              }`}>
                AI 판독
              </span>
            </div>
          </li>
          
          {/* Connector 2-3 */}
          <li className="mx-4 h-px w-12 bg-gray-300 sm:w-16" aria-hidden="true" />
          
          {/* Step 3: 결과 확인 */}
          <li className="flex items-center">
            <div className={`flex items-center gap-2 ${aiResult ? "text-primary" : "text-gray-400"}`}>
              <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                aiResult 
                  ? "bg-primary text-white" 
                  : "bg-gray-100 text-gray-400"
              }`}>
                3
              </span>
              <span className={`text-sm font-medium ${aiResult ? "text-primary" : "text-gray-400"}`}>
                결과 확인
              </span>
            </div>
          </li>
        </ol>
      </nav>

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
                      className="h-12 cursor-pointer px-6"
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
                        <span className="text-primary">매수 가능:</span> 마성리, 신리, 봉남리, 진사리
                      </p>
                      <p className="mt-0.5">
                        <span className="text-warning">경계 사례:</span> 능평리, 야탑동
                      </p>
                      <p className="mt-0.5">
                        <span className="text-destructive">매수 불가:</span> 덕평리, 천남리
                      </p>
                      <p className="mt-0.5">
                        <span className="text-muted-foreground">편입토지 없음:</span> 금곡동, 가장리
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
                        : aiResult.provisionalJudgment === "심의위원회이관"
                          ? "border-warning bg-warning/5"
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
                            : aiResult.provisionalJudgment === "심의위원회이관"
                              ? "bg-warning text-warning-foreground"
                              : "bg-destructive text-destructive-foreground"
                        }`}>
                          {aiResult.provisionalJudgment === "매수" 
                            ? "매수 가능" 
                            : aiResult.provisionalJudgment === "심의위원회이관"
                              ? "경계 사례"
                              : "기준 미충족"}
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

                    {/* 경계 사례 안내 */}
                    {aiResult.isBorderlineCase && (
                      <div className="flex items-start gap-2 rounded-lg border border-warning/50 bg-warning/10 p-3">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                        <div className="text-xs">
                          <p className="font-medium text-foreground">AI 판정 경계 사례</p>
                          <p className="mt-0.5 text-muted-foreground">
                            {aiResult.borderlineReason || "자동 판독 기준만으로는 명확한 판정이 어렵습니다. 담당자가 수동 확인 항목을 검토한 후 최종 결정합니다."}
                          </p>
                        </div>
                      </div>
                    )}

                    {aiResult.provisionalJudgment === "기각" && !aiResult.isBorderlineCase && (
                      <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                        <p className="text-xs text-foreground">
                          AI 분석 결과 기준 미충족이지만, 현장 상황에 따라 다를 수 있습니다.
                        </p>
                      </div>
                    )}

                    {/* 판단 근거 설명 */}
                    <JudgmentRationaleSection rationale={aiResult.judgmentRationale} />

                    <Button 
                      className="w-full cursor-pointer" 
                      size="lg"
                      onClick={() => onLandSelect(searchResult, aiResult)}
                    >
                      {aiResult.provisionalJudgment === "매수" 
                        ? "매수 신청 진행하기" 
                        : aiResult.provisionalJudgment === "심의위원회이관"
                          ? "검토 요청 신청하기"
                          : "그래도 신청하기"}
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
