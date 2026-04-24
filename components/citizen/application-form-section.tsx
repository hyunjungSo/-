"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LandMap } from "@/components/land-map";
import { landCategories, landShapes } from "@/lib/dummy-data";
import type { LandInfo, Application, LandCategory, LandShape, AIAnalysisResult } from "@/lib/types";
import { ArrowLeft, Upload, Send, Bot, CheckCircle2, XCircle, X, Check, Loader2, Scale, FileText, AlertTriangle, Info, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ApplicationFormSectionProps {
  landInfo: LandInfo;
  landInfoList?: LandInfo[]; // 복수 필지 신청용
  aiResult: AIAnalysisResult;
  aiResultList?: AIAnalysisResult[]; // 복수 필지 AI 결과
  onSubmit: (application: Application) => void;
  onBack: () => void;
}

// 샘플 주소 데이터
const sampleAddresses = [
  { postalCode: "31000", address: "충청남도 천안시 동남구 신부동 100" },
  { postalCode: "31001", address: "충청남도 천안시 동남구 신방동 200" },
  { postalCode: "31002", address: "충청남도 천안시 동남구 봉명동 300" },
  { postalCode: "31010", address: "충청남도 천안시 서북구 성정동 150" },
  { postalCode: "31011", address: "충청남도 천안시 서북구 쌍용동 250" },
  { postalCode: "31100", address: "충청남도 아산시 탕정면 갈산리 50" },
  { postalCode: "31101", address: "충청남도 아산시 배방읍 장재리 100" },
  { postalCode: "31200", address: "충청남도 공주시 중동 200" },
  { postalCode: "31201", address: "충청남도 공주시 산성동 300" },
  { postalCode: "31300", address: "충청남도 논산시 내동 150" },
];

// 주소 검색 모달 컴포넌트
function AddressSearchModal({
  onSelect,
  onClose,
}: {
  onSelect: (address: { postalCode: string; address: string }) => void;
  onClose: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<typeof sampleAddresses>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    // 샘플 데이터에서 검색 (실제로는 API 호출)
    const results = sampleAddresses.filter(
      (addr) =>
        addr.address.includes(searchQuery) || addr.postalCode.includes(searchQuery)
    );
    setSearchResults(results);
    setHasSearched(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-lg rounded-lg bg-background shadow-xl">
        <div className="flex items-center justify-between py-2 px-4">
          <h3 className="text-lg font-semibold">주소 검색</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        </div>
        
        <div className="p-4">
          <div className="flex gap-2">
            <Input
              placeholder="도로명, 건물명 또는 지번 입력"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              autoFocus
            />
            <Button 
              onClick={handleSearch}
              className="h-10 shrink-0 bg-[#222222] hover:bg-[#333333] py-3"
            >
              검색
            </Button>
          </div>
          
          <div className="mt-4 max-h-64 overflow-y-auto">
            {hasSearched && searchResults.length === 0 ? (
              <p className="py-8 text-center text-base text-muted-foreground">
                검색 결과가 없습니다.
              </p>
            ) : searchResults.length > 0 ? (
              <ul className="space-y-1">
                {searchResults.map((addr, idx) => (
                  <li key={idx}>
                    <button
                      type="button"
                      className="w-full rounded-md px-3 py-2 text-left text-base transition-colors hover:bg-muted"
                      onClick={() => onSelect(addr)}
                    >
                      <span className="mr-2 text-base text-muted-foreground">
                        [{addr.postalCode}]
                      </span>
                      <span>{addr.address}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="space-y-2 py-4 text-center text-base text-muted-foreground">
                <p>도로명, 건물명 또는 지번을 입력하세요.</p>
                <p className="text-base">예: 천안시 동남구, 신부동 100</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="border-t bg-muted/30 p-3">
          <p className="text-base text-muted-foreground">
            * 정확한 주소를 찾을 수 없는 경우, 가까운 건물명이나 도로명으로 검색해 보세요.
          </p>
        </div>
      </div>
    </div>
  );
}

// AI 분석 결과 상세 섹션
function AIResultDetailSection({ aiResult, landInfo }: { aiResult: AIAnalysisResult; landInfo: LandInfo }) {
  const [isOpen, setIsOpen] = useState(false);

  // aiResult에서 judgmentRationale 사용 (dummy-data.ts에서 생성)
  const rationale = aiResult.judgmentRationale;

  // rationale이 없는 경우 기본값 생성
  const shapeIndexChange = aiResult.shapeIndexChange || 0;
  const metCriteriaNames = aiResult.criteriaChecks.filter(c => c.isMet).map(c => c.criteriaName);
  const manualCheckItems = aiResult.criteriaChecks.filter(c => !c.autoDetected).map(c => c.criteriaName);

  const summary = rationale?.summary || (aiResult.provisionalJudgment === "매수"
    ? `잔여지 비율 ${landInfo.remainingRatio}%로 기준 충족, 형상지수 +${shapeIndexChange.toFixed(1)} 상승으로 매수 대상 판정`
    : `분석 결과 매수 기준에 충족하지 않아 기각 대상으로 판정되었습니다.`);

  const legalBasis = rationale?.legalBasis || "「공익사업을 위한 토지 등의 취득 및 보상에 관한 법률」 제74조 및 동법 시행규칙 제34조";

  const appliedCriteria = rationale?.appliedCriteria || [];

  const detailedExplanation = rationale?.detailedExplanation || `소재지: ${landInfo.address}
토지유형: ${landInfo.landType}, 지목: ${landInfo.landCategory}
편입현황: ${landInfo.originalArea}㎡ → 잔여 ${landInfo.remainingArea}㎡ (잔여비율 ${landInfo.remainingRatio}%)
형상변화: ${landInfo.originalShape} → ${landInfo.remainingShape} (지수 +${shapeIndexChange.toFixed(1)})`;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-4">
      <CollapsibleTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full cursor-pointer justify-between"
          size="sm"
          type="button"
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
              <p className="mt-1 text-base text-muted-foreground">{summary}</p>
            </div>
          </div>
        </div>

        {/* 법적 근거 */}
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <div className="flex items-start gap-2">
            <Scale className="mt-0.5 h-5 w-5 shrink-0 text-chart-3" />
            <div>
              <h4 className="font-semibold text-foreground">법적 근거</h4>
              <p className="mt-1 text-base text-muted-foreground">{legalBasis}</p>
            </div>
          </div>
        </div>

        {/* 적용 기준 */}
        {appliedCriteria.length > 0 && (
          <div className="rounded-lg border border-border bg-card p-4">
            <h4 className="mb-2 font-semibold text-foreground">적용 기준</h4>
            <ul className="space-y-1.5">
              {appliedCriteria.map((criteria, idx) => (
                <li key={idx} className="flex items-start gap-2 text-base text-muted-foreground">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{criteria}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 직접 확인 필요 항목 */}
        {(rationale?.manualCheckItems || manualCheckItems).length > 0 && (
          <div className="rounded-lg border border-warning/50 bg-warning/5 p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
              <div>
                <h4 className="font-semibold text-foreground">직접 확인 필요 항목</h4>
                <p className="mt-1 text-base text-muted-foreground">
                  다음 항목은 AI 자동 판독이 불가하여 담당자가 현장 확인 후 판단합니다.
                </p>
                <ul className="mt-2 space-y-1">
                  {(rationale?.manualCheckItems || manualCheckItems).map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-base">
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
          <pre className="whitespace-pre-wrap text-base leading-relaxed text-muted-foreground">
            {detailedExplanation}
          </pre>
        </div>

        {/* 안내 문구 */}
        <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-base text-muted-foreground">
            본 AI 판독 결과는 참고용이며, 최종 판정은 담당자 검토 및 관련 법령에 따라 결정됩니다. 
            판단 근거에 이의가 있으시면 신청서 제출 시 사유를 기재해 주시기 바랍니다.
          </p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function ApplicationFormSection({
  landInfo,
  landInfoList,
  aiResult,
  aiResultList,
  onSubmit,
  onBack,
}: ApplicationFormSectionProps) {
  // 복수 필지 여부
  const isMultipleLands = landInfoList && landInfoList.length > 1;
  const allLands = landInfoList || [landInfo];
  const allAiResults = aiResultList || [aiResult];
  interface FileItem {
    name: string;
    size: string;
    status: "uploading" | "complete";
  }

  // 토지별 개별 입력 데이터 타입
  interface LandSpecificData {
    currentUsage: LandCategory;
    landSubType: "" | "residential-detached" | "residential-multi" | "residential-apartment" | "commercial" | "industrial";
    actualUsage: LandCategory;
    reportedShape: LandShape;
    farmMachineDifficulty: boolean;
    accessRoadLost: boolean;
    waterChannelLost: boolean;
  }

  // 토지별 초기 데이터 생성
  const createInitialLandData = (land: LandInfo): LandSpecificData => ({
    currentUsage: land.landCategory as LandCategory,
    landSubType: "",
    actualUsage: land.landCategory as LandCategory,
    reportedShape: land.remainingShape as LandShape,
    farmMachineDifficulty: false,
    accessRoadLost: false,
    waterChannelLost: false,
  });

  const [formData, setFormData] = useState({
    applicantName: landInfo.ownerName,
    applicantContact: landInfo.ownerContact || "",
    postalCode: "",
    baseAddress: "",
    detailAddress: "",
    // 신청인과 소유자 관계 (본인/대리인)
    applicantRelation: "owner" as "owner" | "agent",
    agentName: "",
    agentContact: "",
    reason: "",
    attachments: [] as FileItem[],
  });

  // 토지별 개별 데이터 상태
  const [landDataList, setLandDataList] = useState<LandSpecificData[]>(
    allLands.map(createInitialLandData)
  );

  // 토지별 데이터 업데이트 함수
  const updateLandData = (index: number, field: keyof LandSpecificData, value: LandSpecificData[keyof LandSpecificData]) => {
    setLandDataList(prev => {
      const newList = [...prev];
      newList[index] = { ...newList[index], [field]: value };
      // 택지가 아니면 세부 유형 초기화
      if (field === "currentUsage" && value !== "대") {
        newList[index].landSubType = "";
      }
      return newList;
    });
  };

  const [isAddressSearchOpen, setIsAddressSearchOpen] = useState(false);

  const MAX_FILES = 10;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 첫 번째 토지의 데이터 사용 (단일 필지의 경우)
    const firstLandData = landDataList[0];

    // 신청 데이터 생성
    const application: Application = {
      id: `app-${Date.now()}`,
      applicationNumber: `2026-${String(new Date().getMonth() + 1).padStart(2, "0")}${String(new Date().getDate()).padStart(2, "0")}-${String(Math.floor(Math.random() * 999)).padStart(3, "0")}`,
      applicantName: formData.applicantName,
      applicantContact: formData.applicantContact,
      applicantAddress: `(${formData.postalCode}) ${formData.baseAddress} ${formData.detailAddress}`.trim(),
      landInfo,
      actualUsage: firstLandData.actualUsage,
      reportedShape: firstLandData.reportedShape,
      farmMachineDifficulty: firstLandData.farmMachineDifficulty,
      reason: formData.reason,
      attachments: formData.attachments,
      status: "접수완료",
      adminStatus: "접수완료",
      appliedAt: new Date().toISOString().split("T")[0],
      aiResult: aiResult,
      // 복수 필지일 경우 토지별 데이터 추가
      landDataList: isMultipleLands ? landDataList : undefined,
    };

    // 시뮬레이션을 위한 딜레이
    setTimeout(() => {
      setIsSubmitting(false);
      onSubmit(application);
    }, 1500);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + "B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + "KB";
    return (bytes / (1024 * 1024)).toFixed(1) + "MB";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles: FileItem[] = Array.from(files).map((f) => ({
        name: f.name,
        size: formatFileSize(f.size),
        status: "uploading" as const,
      }));

      setFormData((prev) => ({
        ...prev,
        attachments: [...prev.attachments, ...newFiles].slice(0, MAX_FILES),
      }));

      // Simulate upload completion
      setTimeout(() => {
        setFormData((prev) => ({
          ...prev,
          attachments: prev.attachments.map((file) =>
            file.status === "uploading" ? { ...file, status: "complete" } : file
          ),
        }));
      }, 1500);
    }
    e.target.value = "";
  };

  const handleRemoveFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const handleRemoveAllFiles = () => {
    setFormData((prev) => ({
      ...prev,
      attachments: [],
    }));
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="mb-4 h-auto px-0 text-muted-foreground hover:bg-transparent hover:text-foreground">
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        토지 조회로 돌아가기
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 토지 정보 요약 */}
        <Card className="lg:col-span-1 flex flex-col bg-gray-100">
          <CardHeader>
            <CardTitle className="text-lg">
              신청 대상 토지
              {isMultipleLands && (
                <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-sm font-medium text-white">
                  {allLands.length}필지
                </span>
              )}
            </CardTitle>
            {isMultipleLands && (
              <CardDescription>
                {(() => {
                  // 시군구 단위로 그룹핑 (예: "경기도 이천시", "경기도 양평군")
                  const regionGroups = allLands.reduce((acc, land) => {
                    const region = land.address.split(" ").slice(0, 2).join(" ");
                    acc[region] = (acc[region] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>);
                  const regionList = Object.entries(regionGroups);
                  
                  if (regionList.length === 1) {
                    // 동일 지역인 경우
                    return `${regionList[0][0]} 토지 ${regionList[0][1]}건`;
                  } else if (regionList.length <= 2) {
                    // 2개 지역인 경우 모두 표시
                    return regionList.map(([region, count]) => `${region} ${count}건`).join(", ");
                  } else {
                    // 3개 이상 지역인 경우
                    return `${regionList.length}개 지역 토지 ${allLands.length}건`;
                  }
                })()}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 복수 필지일 경우 목록 표시 */}
            {isMultipleLands ? (
              <div className="space-y-3">
                <div className="max-h-[300px] space-y-2 overflow-y-auto">
                  {allLands.map((land, index) => {
                    const result = allAiResults[index];
                    return (
                      <div 
                        key={land.id} 
                        className={`rounded-lg border p-3 ${
                          result?.provisionalJudgment === "매수" 
                            ? "border-primary/30 bg-primary/5" 
                            : "border-amber-500/30 bg-amber-50"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{land.address}</p>
                            <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                              <span>잔여: {land.remainingArea.toLocaleString()}㎡</span>
                              <span>|</span>
                              <span>{land.landType}</span>
                            </div>
                          </div>
                          <div className={`rounded px-2 py-0.5 text-xs font-medium ${
                            result?.provisionalJudgment === "매수" 
                              ? "bg-primary/10 text-primary" 
                              : "bg-red-100 text-red-700"
                          }`}>
                            {result?.provisionalJudgment === "매수" ? "매수 가능" : "기준 미충족"}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* 총계 */}
                <div className="rounded-lg bg-muted/50 p-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">총 필지 수</span>
                    <span className="font-medium">{allLands.length}필지</span>
                  </div>
                  <div className="mt-1 flex justify-between text-sm">
                    <span className="text-muted-foreground">총 잔여 면적</span>
                    <span className="font-medium text-primary">
                      {allLands.reduce((sum, land) => sum + land.remainingArea, 0).toLocaleString()}㎡
                    </span>
                  </div>
                  <div className="mt-1 flex justify-between text-sm">
                    <span className="text-muted-foreground">매수 가능 필지</span>
                    <span className="font-medium text-primary">
                      {allAiResults.filter(r => r?.provisionalJudgment === "매수").length}건
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <LandMap landInfo={landInfo} showOverlay />
                
                <div className="space-y-2 text-base">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">지번</span>
                    <span className="font-medium text-foreground">{landInfo.address.split(" ").slice(-2).join(" ")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">잔여 면적</span>
                    <span className="font-medium text-primary">{landInfo.remainingArea.toLocaleString()}㎡</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">잔여 비율</span>
                    <span className="font-medium text-foreground">{landInfo.remainingRatio}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">토지 유형</span>
                    <span className="font-medium text-foreground">{landInfo.landType}</span>
                  </div>
                </div>

                {/* AI 판독 결과 요약 */}
                <div className={`mt-4 rounded-lg border-2 p-4 ${
                  aiResult.provisionalJudgment === "매수" 
                    ? "border-primary bg-primary/5" 
                    : "border-red-500 bg-red-50"
                }`}>
                  <div className="mb-2">
                    <span className="text-base font-semibold text-foreground">AI 판독 결과</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {aiResult.provisionalJudgment === "매수" ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                        <span className="text-base font-bold text-primary">매수 가능성 높음</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-600" />
                        <span className="rounded-full bg-red-600 px-3 py-1 text-base font-bold text-white">기준 미충족</span>
                      </>
                    )}
                  </div>
                  <p className="mt-2 text-base text-muted-foreground">
                    {aiResult.criteriaChecks.filter(c => c.isMet).length}/{aiResult.criteriaChecks.length}개 기준 충족
                  </p>
                </div>

                {/* 판단 근거 상세 보기 */}
                <AIResultDetailSection aiResult={aiResult} landInfo={landInfo} />
              </>
            )}
          </CardContent>
        </Card>

        {/* 신청서 양식 */}
        <Card className="lg:col-span-2 border-0 shadow-none">
          <CardHeader>
            <CardTitle className="text-xl">매수 신청서 작성</CardTitle>
            <CardDescription>
              신청인 정보와 토지 관련 정보를 입력해주세요. * 표시는 필수 항목입니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 신청인 정보 - 깔끔한 스택형 레이아웃 */}
              <div className="space-y-5">
                <h4 className="border-b border-border pb-2 text-sm font-medium text-foreground">신청인 정보</h4>
                
                {/* 신청 구분 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">신청 구분 <span className="text-destructive">*</span></label>
                  <div className="flex items-center gap-6">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="applicantRelation"
                        value="owner"
                        checked={formData.applicantRelation === "owner"}
                        onChange={() => setFormData((prev) => ({ ...prev, applicantRelation: "owner" }))}
                        className="h-4 w-4 accent-gray-900"
                      />
                      <span className="text-sm">본인 신청</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="applicantRelation"
                        value="agent"
                        checked={formData.applicantRelation === "agent"}
                        onChange={() => setFormData((prev) => ({ ...prev, applicantRelation: "agent" }))}
                        className="h-4 w-4 accent-gray-900"
                      />
                      <span className="text-sm">대리인 신청</span>
                    </label>
                  </div>
                  {formData.applicantRelation === "agent" && (
                    <p className="flex items-center gap-1.5 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      대리인 신청 시 위임장 및 대리인 신분증 사본을 첨부 서류에 추가해 주세요.
                    </p>
                  )}
                </div>

                {/* 소유자 정보 */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">소유자 성명 <span className="text-destructive">*</span></label>
                    <Input
                      id="applicantName"
                      value={formData.applicantName}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, applicantName: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">소유자 연락처 <span className="text-destructive">*</span></label>
                    <Input
                      id="applicantContact"
                      placeholder="010-0000-0000"
                      value={formData.applicantContact}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, applicantContact: e.target.value }))
                      }
                      required
                    />
                  </div>
                </div>

                {/* 대리인 정보 (대리인 신청 시만 표시) */}
                {formData.applicantRelation === "agent" && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">대리인 성명 <span className="text-destructive">*</span></label>
                      <Input
                        id="agentName"
                        value={formData.agentName}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, agentName: e.target.value }))
                        }
                        required={formData.applicantRelation === "agent"}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">대리인 연락처 <span className="text-destructive">*</span></label>
                      <Input
                        id="agentContact"
                        placeholder="010-0000-0000"
                        value={formData.agentContact}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, agentContact: e.target.value }))
                        }
                        required={formData.applicantRelation === "agent"}
                      />
                    </div>
                  </div>
                )}

                {/* 주소 */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">주소 <span className="text-destructive">*</span></label>
                  <div className="flex gap-2">
                    <Input
                      id="postalCode"
                      placeholder="우편번호"
                      value={formData.postalCode}
                      readOnly
                      className="h-9 w-24 bg-muted text-sm"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="h-9 shrink-0"
                      onClick={() => setIsAddressSearchOpen(true)}
                    >
                      주소 검색
                    </Button>
                  </div>
                  <Input
                    id="baseAddress"
                    placeholder="기본주소"
                    value={formData.baseAddress}
                    readOnly
                    className="bg-muted text-sm"
                  />
                  <Input
                    id="detailAddress"
                    placeholder="상세주소를 입력해주세요"
                    value={formData.detailAddress}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, detailAddress: e.target.value }))
                    }
                    className="text-sm"
                  />
                </div>
              </div>

              {/* 주소 검색 모달 */}
              {isAddressSearchOpen && (
                <AddressSearchModal
                  onSelect={(address) => {
                    setFormData((prev) => ({
                      ...prev,
                      postalCode: address.postalCode,
                      baseAddress: address.address,
                    }));
                    setIsAddressSearchOpen(false);
                  }}
                  onClose={() => setIsAddressSearchOpen(false)}
                />
              )}

              {/* 토지 정보 - 스택형 레이아웃 */}
              {allLands.map((land, index) => {
                const landData = landDataList[index];
                const isAgricultural = land.landType === "농지" || landData.currentUsage === "답" || landData.currentUsage === "전";
                
                return (
                  <div key={land.id} className="space-y-5">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <h4 className="text-sm font-medium text-foreground">
                        {isMultipleLands ? `필지 ${index + 1} 토지 정보` : "토지 정보"}
                      </h4>
                      {isMultipleLands && (
                        <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          {land.remainingArea.toLocaleString()}m²
                        </span>
                      )}
                    </div>
                    
                    {isMultipleLands && (
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">소재지</label>
                        <p className="text-sm text-muted-foreground">{land.address}</p>
                      </div>
                    )}
                    
                    {/* 안내 */}
                    {index === 0 && (
                      <p className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                        AI 판단과 실제 현황이 다를 수 있습니다. 현재 토지의 실제 활용 상황을 입력해 주세요.
                      </p>
                    )}
                    
                    {/* 활용 지목 */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">활용 지목 <span className="text-destructive">*</span></label>
                        <Select
                          value={landData.currentUsage}
                          onValueChange={(value) => updateLandData(index, "currentUsage", value as LandCategory)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="선택하세요" />
                          </SelectTrigger>
                          <SelectContent>
                            {landCategories.map((cat) => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.value} ({cat.label})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          AI 판단: {land.landCategory} ({landCategories.find(c => c.value === land.landCategory)?.label || ""})
                        </p>
                      </div>
                      
                      {/* 택지(대지) 선택 시 세부 유형 */}
                      {landData.currentUsage === "대" && (
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium">택지 유형</label>
                          <Select
                            value={landData.landSubType}
                            onValueChange={(value) => updateLandData(index, "landSubType", value as typeof landData.landSubType)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="선택하세요" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="residential-detached">주거용 (기준 90㎡ 이하)</SelectItem>
                              <SelectItem value="commercial">상업용 (기준 150㎡ 이하)</SelectItem>
                              <SelectItem value="industrial">공업용 (기준 330㎡ 이하)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>

                    {/* 공부상 지목 & 토지 모양 */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">공부상 지목</label>
                        <Select
                          value={landData.actualUsage}
                          onValueChange={(value) => updateLandData(index, "actualUsage", value as LandCategory)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="선택" />
                          </SelectTrigger>
                          <SelectContent>
                            {landCategories.map((cat) => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.value} ({cat.label})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">토지 모양 <span className="text-destructive">*</span></label>
                        <Select
                          value={landData.reportedShape}
                          onValueChange={(value) => updateLandData(index, "reportedShape", value as LandShape)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="선택" />
                          </SelectTrigger>
                          <SelectContent>
                            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">정형</div>
                            {landShapes.regular.map((shape) => (
                              <SelectItem key={shape.value} value={shape.value}>{shape.label}</SelectItem>
                            ))}
                            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">비정형</div>
                            {landShapes.irregular.map((shape) => (
                              <SelectItem key={shape.value} value={shape.value}>{shape.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* 직접 확인 항목 */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">확인 항목</label>
                      <p className="text-xs text-muted-foreground">
                        AI가 자동 판독할 수 없는 사항입니다. 해당되는 경우 체크해 주세요.
                      </p>
                      <div className="flex flex-wrap gap-x-6 gap-y-2">
                        <label className="flex cursor-pointer items-center gap-2">
                          <Checkbox
                            id={`accessRoadLost-${index}`}
                            checked={landData.accessRoadLost}
                            onCheckedChange={(checked) => updateLandData(index, "accessRoadLost", checked === true)}
                          />
                          <span className="text-sm">접면도로 상실</span>
                        </label>
                        
                        {isAgricultural && (
                          <>
                            <label className="flex cursor-pointer items-center gap-2">
                              <Checkbox
                                id={`waterChannelLost-${index}`}
                                checked={landData.waterChannelLost}
                                onCheckedChange={(checked) => updateLandData(index, "waterChannelLost", checked === true)}
                              />
                              <span className="text-sm">관개수로 상실</span>
                            </label>
                            <label className="flex cursor-pointer items-center gap-2">
                              <Checkbox
                                id={`farmMachine-${index}`}
                                checked={landData.farmMachineDifficulty}
                                onCheckedChange={(checked) => updateLandData(index, "farmMachineDifficulty", checked === true)}
                              />
                              <span className="text-sm">농기계 진입 곤란</span>
                            </label>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* 신청 사유 */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">신청 사유 <span className="text-destructive">*</span></label>
                <Textarea
                  id="reason"
                  placeholder="잔여지 매수를 신청하는 사유를 상세히 작성해주세요."
                  rows={3}
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, reason: e.target.value }))
                  }
                  className="w-full resize-none"
                  required
                />
              </div>

              {/* 첨부 서류 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">첨부 서류</label>
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-8 transition-colors hover:border-gray-400 hover:bg-gray-100">
                  <Upload className="mb-2 h-8 w-8 text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">파일을 선택하세요</span>
                  <span className="mt-1 text-xs text-muted-foreground">
                    PDF, JPG, PNG (최대 {MAX_FILES}개)
                  </span>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>

                {/* 파일 리스트 */}
                {formData.attachments.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        첨부파일 {formData.attachments.length}개
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveAllFiles}
                        className="h-auto px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                      >
                        전체삭제
                      </Button>
                    </div>
                    <ul className="space-y-1.5">
                      {formData.attachments.map((file, index) => (
                        <li
                          key={index}
                          className="flex items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2"
                        >
                          <span className="text-sm text-foreground">
                            {file.name} <span className="text-muted-foreground">[{file.size}]</span>
                          </span>
                          <div className="flex items-center gap-2">
                            {file.status === "uploading" ? (
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            ) : (
                              <>
                                <Check className="h-4 w-4 text-primary" />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFile(index)}
                                  className="text-muted-foreground hover:text-destructive"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* 제출 버튼 */}
              <Button
                type="submit"
                size="lg"
                className="mx-auto flex w-full max-w-[600px] items-center justify-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "신청서 제출 중..."
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    매수 신청서 제출
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
