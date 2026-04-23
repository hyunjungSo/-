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

  // 판단 근거 생성
  const shapeIndexChange = aiResult.shapeIndexChange || 0;
  const metCriteriaNames = aiResult.criteriaChecks.filter(c => c.isMet).map(c => c.criteriaName);
  const manualCheckItems = aiResult.criteriaChecks.filter(c => !c.autoDetected).map(c => c.criteriaName);

  const appliedCriteria: string[] = [];
  if (metCriteriaNames.includes("잔여지 비율")) {
    appliedCriteria.push(`잔여지 비율 기준: 잔여 면적이 원 면적의 30% 이하 (현재 ${landInfo.remainingRatio}%)`);
  }
  if (metCriteriaNames.includes("형상지수 변화")) {
    appliedCriteria.push(`형상지수 변화 기준: 편입 전 대비 1.0 이상 상승 시 형상 불량으로 판단`);
  }
  if (metCriteriaNames.includes("잔여지 형상")) {
    appliedCriteria.push(`잔여지 형상 기준: 삼각형, 역삼각형, 자루형, 부정형 등 불규칙 형상`);
  }

  const summary = aiResult.provisionalJudgment === "매수"
    ? `잔여지 비율 ${landInfo.remainingRatio}%로 기준(30% 이하) 충족, 형상지수 +${shapeIndexChange.toFixed(1)} 상승으로 매수 대상 판정`
    : `분석 결과 매수 기준에 충족하지 않아 기각 대상으로 판정되었습니다.`;

  const legalBasis = "공익사업을 위한 토지 등의 취득 및 보상에 관한 법률 제73조 (잔여지의 매수청구)";

  const detailedExplanation = `[토지 정보]
- 소재지: ${landInfo.address}
- 편입 전 면적: ${landInfo.originalArea.toLocaleString()}㎡
- 편입 면적: ${landInfo.includedArea.toLocaleString()}㎡
- 잔여 면적: ${landInfo.remainingArea.toLocaleString()}㎡
- 잔여 비율: ${landInfo.remainingRatio}%

[형상 분석]
- 편입 전 형상지수: ${landInfo.originalShapeIndex.toFixed(2)}
- 편입 후 형상지수: ${landInfo.remainingShapeIndex.toFixed(2)}
- 형상지수 변화: +${shapeIndexChange.toFixed(2)}
- 잔여지 형상: ${landInfo.remainingShape}

[판정 결과]
- 충족 기준: ${metCriteriaNames.join(", ") || "없음"}
${manualCheckItems.length > 0 ? `- 직접 확인 필요 항목: ${manualCheckItems.join(", ")}` : ""}`;

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
        {manualCheckItems.length > 0 && (
          <div className="rounded-lg border border-warning/50 bg-warning/5 p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
              <div>
                <h4 className="font-semibold text-foreground">직접 확인 필요 항목</h4>
                <p className="mt-1 text-base text-muted-foreground">
                  다음 항목은 AI 자동 판독이 불가하여 담당자가 현장 확인 후 판단합니다.
                </p>
                <ul className="mt-2 space-y-1">
                  {manualCheckItems.map((item, idx) => (
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
    // 민원인 입력 필드
    currentUsage: landInfo.landCategory as LandCategory, // AI 판단과 다를 수 있는 현재 활용 지목
    landSubType: "" as "" | "residential-detached" | "residential-multi" | "residential-apartment" | "commercial" | "industrial", // 택지 세부 유형
    actualUsage: landInfo.landCategory as LandCategory,
    reportedShape: landInfo.remainingShape as LandShape,
    farmMachineDifficulty: false,
    accessRoadLost: false, // 접면도로 상실
    waterChannelLost: false, // 수로 상실
    reason: "",
    attachments: [] as FileItem[],
  });

  const [isAddressSearchOpen, setIsAddressSearchOpen] = useState(false);

  const MAX_FILES = 10;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 신청 데이터 생성
    const application: Application = {
      id: `app-${Date.now()}`,
      applicationNumber: `2026-${String(new Date().getMonth() + 1).padStart(2, "0")}${String(new Date().getDate()).padStart(2, "0")}-${String(Math.floor(Math.random() * 999)).padStart(3, "0")}`,
      applicantName: formData.applicantName,
      applicantContact: formData.applicantContact,
      applicantAddress: `(${formData.postalCode}) ${formData.baseAddress} ${formData.detailAddress}`.trim(),
      landInfo,
      actualUsage: formData.actualUsage,
      reportedShape: formData.reportedShape,
      farmMachineDifficulty: formData.farmMachineDifficulty,
      reason: formData.reason,
      attachments: formData.attachments,
      status: "접수완료",
      adminStatus: "접수완료",
      appliedAt: new Date().toISOString().split("T")[0],
      aiResult: aiResult,
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
      <Button variant="outline" onClick={onBack} className="mb-4 h-10">
        <ArrowLeft className="mr-2 h-4 w-4" />
        토지 조회로 돌아가기
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 토지 정보 요약 */}
        <Card className="lg:col-span-1">
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
                {allLands[0].address.split(" ").slice(0, 2).join(" ")} 지역 토지 {allLands.length}건
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
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>매수 신청서 작성</CardTitle>
            <CardDescription>
              신청인 정보와 토지 관련 정보를 입력해주세요. * 표시는 필수 항목입니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 신청인 정보 */}
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">신청인 정보</h4>
                
                {/* 신청인/대리인 선택 */}
                <div className="space-y-2">
                  <Label>신청 구분 *</Label>
                  <div className="flex gap-4">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="applicantRelation"
                        value="owner"
                        checked={formData.applicantRelation === "owner"}
                        onChange={() => setFormData((prev) => ({ ...prev, applicantRelation: "owner" }))}
                        className="h-4 w-4 text-primary"
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
                        className="h-4 w-4 text-primary"
                      />
                      <span className="text-sm">대리인 신청</span>
                    </label>
                  </div>
                </div>

                {/* 대리인 신청 시 안내 */}
                {formData.applicantRelation === "agent" && (
                  <div className="rounded-lg border border-warning/50 bg-warning/5 p-3">
                    <p className="flex items-start gap-2 text-sm text-muted-foreground">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                      대리인 신청 시 위임장 및 대리인 신분증 사본을 첨부 서류에 추가해 주세요.
                    </p>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="applicantName">
                      {formData.applicantRelation === "owner" ? "소유자 성명 *" : "소유자 성명 *"}
                    </Label>
                    <Input
                      id="applicantName"
                      value={formData.applicantName}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, applicantName: e.target.value }))
                      }
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="applicantContact">
                      {formData.applicantRelation === "owner" ? "연락처 *" : "소유자 연락처 *"}
                    </Label>
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
                    <div className="space-y-2">
                      <Label htmlFor="agentName">대리인 성명 *</Label>
                      <Input
                        id="agentName"
                        value={formData.agentName}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, agentName: e.target.value }))
                        }
                        required={formData.applicantRelation === "agent"}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="agentContact">대리인 연락처 *</Label>
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

                <div className="space-y-2">
                  <Label>주소 *</Label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        id="postalCode"
                        placeholder="우편번호"
                        value={formData.postalCode}
                        readOnly
                        className="h-10 w-28 bg-muted"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 shrink-0 bg-[#222222] text-white hover:bg-[#333333] hover:text-white"
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
                      className="bg-muted"
                    />
                    <Input
                      id="detailAddress"
                      placeholder="상세주소를 입력해주세요"
                      value={formData.detailAddress}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, detailAddress: e.target.value }))
                      }
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
              </div>

              {/* 토지 정보 */}
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">토지 정보 (민원인 입력)</h4>
                <p className="text-sm text-muted-foreground">
                  AI 판단과 실제 현황이 다를 수 있습니다. 현재 토지의 실제 활용 상황을 입력해 주세요.
                </p>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="currentUsage">현재 활용 지목 *</Label>
                    <Select
                      value={formData.currentUsage}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ 
                          ...prev, 
                          currentUsage: value as LandCategory,
                          // 택지가 아니면 세부 유형 초기화
                          landSubType: value === "대" ? prev.landSubType : ""
                        }))
                      }
                    >
                      <SelectTrigger id="currentUsage">
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
                      AI가 판단한 지목: {landInfo.landCategory} ({landCategories.find(c => c.value === landInfo.landCategory)?.label || ""})
                    </p>
                  </div>

                  {/* 택지(대지) 선택 시 세부 유형 선택 */}
                  {formData.currentUsage === "대" && (
                    <div className="space-y-2">
                      <Label htmlFor="landSubType">택지 세부 유형 *</Label>
                      <Select
                        value={formData.landSubType}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, landSubType: value as typeof formData.landSubType }))
                        }
                      >
                        <SelectTrigger id="landSubType">
                          <SelectValue placeholder="선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="residential-detached">주거용 - 단독주택 (기준: 90㎡)</SelectItem>
                          <SelectItem value="residential-multi">주거용 - 연립/다세대 (기준: 165㎡)</SelectItem>
                          <SelectItem value="residential-apartment">주거용 - 아파트 (기준: 60㎡)</SelectItem>
                          <SelectItem value="commercial">상업용 (기준: 150㎡)</SelectItem>
                          <SelectItem value="industrial">공업용 (기준: 330㎡)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        택지 유형에 따라 매수 기준 면적이 다릅니다.
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="actualUsage">공부상 지목</Label>
                    <Select
                      value={formData.actualUsage}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, actualUsage: value as LandCategory }))
                      }
                    >
                      <SelectTrigger id="actualUsage">
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reportedShape">토지 모양 *</Label>
                    <Select
                      value={formData.reportedShape}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, reportedShape: value as LandShape }))
                      }
                    >
                      <SelectTrigger id="reportedShape">
                        <SelectValue placeholder="선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="px-2 py-1 text-base font-semibold text-muted-foreground">
                          정형
                        </div>
                        {landShapes.regular.map((shape) => (
                          <SelectItem key={shape.value} value={shape.value}>
                            {shape.label}
                          </SelectItem>
                        ))}
                        <div className="px-2 py-1 text-base font-semibold text-muted-foreground">
                          비정형
                        </div>
                        {landShapes.irregular.map((shape) => (
                          <SelectItem key={shape.value} value={shape.value}>
                            {shape.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* 직접 확인 항목 (민원인 입력) */}
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <h5 className="mb-3 text-sm font-semibold text-foreground">직접 확인 항목 (해당 시 체크)</h5>
                  <p className="mb-3 text-xs text-muted-foreground">
                    아래 항목은 AI가 자동 판독할 수 없는 사항입니다. 해당되는 경우 체크해 주세요.
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="accessRoadLost"
                        checked={formData.accessRoadLost}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({
                            ...prev,
                            accessRoadLost: checked === true,
                          }))
                        }
                      />
                      <Label htmlFor="accessRoadLost" className="text-sm font-normal">
                        접면도로 상실 (도로 편입으로 인해 건축허가 불가 또는 출입 불가)
                      </Label>
                    </div>
                    
                    {(landInfo.landType === "농지" || formData.currentUsage === "답" || formData.currentUsage === "전") && (
                      <>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="waterChannelLost"
                            checked={formData.waterChannelLost}
                            onCheckedChange={(checked) =>
                              setFormData((prev) => ({
                                ...prev,
                                waterChannelLost: checked === true,
                              }))
                            }
                          />
                          <Label htmlFor="waterChannelLost" className="text-sm font-normal">
                            관개수로 상실 (수로 편입으로 인해 농업용수 공급 불가)
                          </Label>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {(landInfo.landType === "농지" || formData.currentUsage === "답" || formData.currentUsage === "전") && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="farmMachine"
                      checked={formData.farmMachineDifficulty}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          farmMachineDifficulty: checked === true,
                        }))
                      }
                    />
                    <Label htmlFor="farmMachine" className="text-base font-normal">
                      농기계 진입 및 회전이 곤란합니다
                    </Label>
                  </div>
                )}
              </div>

              {/* 신청 사유 */}
              <div className="space-y-2">
                <Label htmlFor="reason">신청 사유 (소유자 의견) *</Label>
                <Textarea
                  id="reason"
                  placeholder="잔여지 매수를 신청하는 사유를 상세히 작성해주세요."
                  rows={4}
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, reason: e.target.value }))
                  }
                  required
                />
              </div>

              {/* 첨부 서류 - KRDS 스타일 */}
              <div className="space-y-4">
                <Label>첨부 서류</Label>
                <p className="text-base text-muted-foreground">
                  토지 소유 증빙 서류, 사진 등을 첨부해주세요.
                </p>
                
                {/* 드롭존 영역 */}
                <div className="rounded-lg bg-gray-100 p-8">
                  <div className="flex flex-col items-center justify-center text-center">
                    <p className="mb-4 text-base text-gray-600">
                      첨부할 파일을 여기에 끌어다 놓거나, 파일 선택 버튼을 직접 선택해주세요.
                    </p>
                    <label className="cursor-pointer">
                      <span className="inline-flex items-center gap-2 rounded-md bg-[#222222] px-4 py-2 text-base font-medium text-white hover:bg-[#333333]">
                        <Upload className="h-4 w-4" />
                        파일선택
                      </span>
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                    </label>
                  </div>
                </div>

                {/* 파일 개수 및 전체 삭제 */}
                {formData.attachments.length > 0 && (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="text-base">
                        <span className="font-semibold text-primary">{formData.attachments.length}개</span>
                        <span className="text-muted-foreground"> / {MAX_FILES}개</span>
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveAllFiles}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        전체 파일 삭제
                        <X className="ml-1 h-3 w-3" />
                      </Button>
                    </div>

                    {/* 파일 리스트 */}
                    <ul className="space-y-2">
                      {formData.attachments.map((file, index) => (
                        <li
                          key={index}
                          className="flex items-center justify-between rounded-md border border-gray-200 bg-white px-4 py-3"
                        >
                          <span className="text-base text-foreground">
                            {file.name} [{file.size}]
                          </span>
                          <div className="flex items-center gap-3">
                            {file.status === "uploading" ? (
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFile(index)}
                                  className="flex items-center gap-1 text-base text-muted-foreground hover:text-destructive"
                                >
                                  삭제
                                  <X className="h-3 w-3" />
                                </button>
                                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                                  <Check className="h-3 w-3 text-white" />
                                </div>
                              </>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </>
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
