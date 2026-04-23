"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LandMap } from "@/components/land-map";
import { landShapes, landCategories } from "@/lib/dummy-data";
import type { Application, JudgmentResult, LandShape, LandCategory, AdminStatus } from "@/lib/types";
import {
  ArrowLeft,
  Bot,
  User,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Save,
  Clock,
  PlayCircle,
  Layers,
  Info,
} from "lucide-react";
import Link from "next/link";

interface ApplicationDetailProps {
  application: Application;
  onBack: () => void;
  onSave: (application: Application) => void;
}

const judgmentConfig = {
  매수: { label: "매수", icon: CheckCircle2, borderColor: "border-emerald-600", textColor: "text-emerald-700" },
  기각: { label: "기각", icon: XCircle, borderColor: "border-red-600", textColor: "text-red-700" },
  심의위원회이관: { label: "심의위원회 이관", icon: AlertTriangle, borderColor: "border-amber-600", textColor: "text-amber-700" },
};

const adminStatusConfig: Record<AdminStatus, { 
  label: string; 
  icon: typeof Clock; 
  variant: "warning-subtle" | "info-subtle" | "success-subtle";
}> = {
  접수완료: { label: "접수완료", icon: Clock, variant: "warning-subtle" },
  진행중: { label: "진행중", icon: PlayCircle, variant: "info-subtle" },
  심사완료: { label: "심사완료", icon: CheckCircle2, variant: "success-subtle" },
};

// 담당자 목록 (실제로는 API에서 가져옴)
const assigneeList = [
  { id: "admin-001", name: "홍길동", department: "토지보상과" },
  { id: "admin-002", name: "김철수", department: "토지보상과" },
  { id: "admin-003", name: "이영희", department: "토지보상과" },
  { id: "admin-004", name: "박민수", department: "보상심의팀" },
  { id: "admin-005", name: "정수연", department: "보상심의팀" },
];

// 필지별 검토 데이터 타입
interface LandReviewData {
  actualUsage: LandCategory;
  landShape: LandShape;
  farmMachineDifficulty: "미입력" | "해당" | "해당없음";
  accessRoadLost: boolean;
  waterChannelLost: boolean;
  landJudgment: JudgmentResult | null;
}

export function ApplicationDetail({ application, onBack, onSave }: ApplicationDetailProps) {
  // 복수 필지 여부 확인
  const isMultipleLands = application.additionalLands && application.additionalLands.length > 0;
  const allLands = isMultipleLands 
    ? [application.landInfo, ...application.additionalLands] 
    : [application.landInfo];

  // 필지별 검토 데이터 초기화
  const initializeLandReviewData = (): LandReviewData[] => {
    return allLands.map((land, index) => {
      const landData = application.landDataList?.[index];
      return {
        actualUsage: (landData?.actualUsage || land.landCategory) as LandCategory,
        landShape: (landData?.reportedShape || land.remainingShape) as LandShape,
        farmMachineDifficulty: landData?.farmMachineDifficulty ? "해당" : "미입력",
        accessRoadLost: landData?.accessRoadLost || false,
        waterChannelLost: landData?.waterChannelLost || false,
        landJudgment: null,
      };
    });
  };

  const [landReviewDataList, setLandReviewDataList] = useState<LandReviewData[]>(initializeLandReviewData);
  
  // 선택된 필지 인덱스 (복수 필지용)
  const [selectedLandIndex, setSelectedLandIndex] = useState(0);
  
  // 필지별 검토 데이터 업데이트 함수
  const updateLandReviewData = (index: number, field: keyof LandReviewData, value: LandReviewData[keyof LandReviewData]) => {
    setLandReviewDataList(prev => {
      const newList = [...prev];
      newList[index] = { ...newList[index], [field]: value };
      return newList;
    });
  };

  const [reviewData, setReviewData] = useState({
    actualUsage: application.actualUsage as LandCategory,
    landShape: application.reportedShape as LandShape,
    farmMachineDifficulty: application.farmMachineDifficulty ? "해당" : "미입력" as "미입력" | "해당" | "해당없음",
    accessRoadLost: application.aiResult?.accessRoadLost || false,
    waterChannelLost: application.aiResult?.waterChannelLost || false,
    reviewerComment: application.reviewerComment || "",
    finalReviewOpinion: application.finalReviewOpinion || "", // 최종 검토 의견 (복수 필지용)
    finalJudgment: application.finalJudgment || (null as unknown as JudgmentResult),
    adminStatus: application.adminStatus || ("접수완료" as AdminStatus),
    assigneeId: application.adminName ? assigneeList.find(a => a.name === application.adminName)?.id || "" : "",
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    
    const selectedAssignee = assigneeList.find(a => a.id === reviewData.assigneeId);
    
    const updatedApplication: Application = {
      ...application,
      actualUsage: reviewData.actualUsage,
      reportedShape: reviewData.landShape,
      farmMachineDifficulty: reviewData.farmMachineDifficulty === "해당",
      reviewerComment: reviewData.reviewerComment,
      finalJudgment: reviewData.finalJudgment,
      adminStatus: reviewData.adminStatus,
      status: reviewData.adminStatus === "심사완료" ? "처리완료" : application.status,
      adminName: selectedAssignee?.name || application.adminName,
      statusUpdatedAt: new Date().toISOString().split("T")[0],
    };

    setTimeout(() => {
      setIsSaving(false);
      onSave(updatedApplication);
    }, 1000);
  };

  const aiResult = application.aiResult;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          목록으로 돌아가기
        </Button>
        <div className="flex gap-2">
          <Button variant="secondary" asChild>
            <Link href={`/admin/review/${application.id}`}>
              <FileText className="mr-2 h-4 w-4" />
              심의서 작성
            </Link>
          </Button>
        </div>
      </div>

      {/* 민원 기본 정보 */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <CardTitle>민원 정보</CardTitle>
              {(() => {
                const config = adminStatusConfig[application.adminStatus];
                const Icon = config.icon;
                return (
                  <Badge variant={config.variant}>
                    <Icon className="h-3.5 w-3.5" />
                    {config.label}
                  </Badge>
                );
              })()}
            </div>
            <CardDescription>접수번호: {application.applicationNumber}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <p className="text-base text-muted-foreground">신청인</p>
              <p className="font-medium text-foreground">{application.applicantName}</p>
            </div>
            <div>
              <p className="text-base text-muted-foreground">연락처</p>
              <p className="font-medium text-foreground">{application.applicantContact}</p>
            </div>
            <div>
              <p className="text-base text-muted-foreground">신청일</p>
              <p className="font-medium text-foreground">{application.appliedAt}</p>
            </div>
            <div>
              <p className="text-base text-muted-foreground">대상 지번</p>
              <p className="font-medium text-foreground">{application.landInfo.address}</p>
            </div>
            <div>
              <p className="mb-1 text-base text-muted-foreground">담당자</p>
              <Select
                value={reviewData.assigneeId}
                onValueChange={(value) =>
                  setReviewData((prev) => ({ ...prev, assigneeId: value }))
                }
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="담당자 지정" />
                </SelectTrigger>
                <SelectContent>
                  {assigneeList.map((assignee) => (
                    <SelectItem key={assignee.id} value={assignee.id}>
                      {assignee.name} ({assignee.department})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 일단지 판정 (복수 필지가 있는 경우) */}
      {application.additionalLands && application.additionalLands.length > 0 && (
        <Card className="border-2 border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Layers className="h-5 w-5" />
              동일 소유자 복수 필지 (일단지 판정)
            </CardTitle>
            <CardDescription>
              동일 소유자의 인접 필지가 {application.additionalLands.length + 1}개 있습니다. 일단지 조건 충족 시 병합 처리가 가능합니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 일단지 판정 조건 */}
            <div className="rounded-lg border border-border bg-card p-4">
              <h4 className="mb-3 font-medium text-foreground">일단지 판정 조건</h4>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className={`flex items-center gap-2 rounded-md px-2 py-1 ${
                  application.unifiedParcelCondition?.sameOwner ? "bg-green-50" : "bg-red-50"
                }`}>
                  {application.unifiedParcelCondition?.sameOwner ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className={`text-base ${application.unifiedParcelCondition?.sameOwner ? "" : "text-red-700 font-medium"}`}>소유자 동일성</span>
                </div>
                <div className={`flex items-center gap-2 rounded-md px-2 py-1 ${
                  application.unifiedParcelCondition?.continuous ? "bg-green-50" : "bg-red-50"
                }`}>
                  {application.unifiedParcelCondition?.continuous ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className={`text-base ${application.unifiedParcelCondition?.continuous ? "" : "text-red-700 font-medium"}`}>지반 연속성</span>
                </div>
                <div className={`flex items-center gap-2 rounded-md px-2 py-1 ${
                  application.unifiedParcelCondition?.sameUsage ? "bg-green-50" : "bg-red-50"
                }`}>
                  {application.unifiedParcelCondition?.sameUsage ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className={`text-base ${application.unifiedParcelCondition?.sameUsage ? "" : "text-red-700 font-medium"}`}>용도 일체성</span>
                </div>
              </div>
              {application.unifiedParcelCondition?.isUnifiedParcel && (
                <div className="mt-3 flex items-center gap-2 rounded bg-primary/10 px-3 py-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="text-base font-medium text-primary">일단지 조건 충족 - 병합 처리 가능</span>
                </div>
              )}
            </div>

            {/* 필지 목록 */}
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">포함 필지 목록</h4>
              <div className="divide-y divide-border rounded-lg border border-border">
                <div className="flex items-center justify-between p-3 bg-muted/30">
                  <div>
                    <p className="font-medium text-foreground">{application.landInfo.address}</p>
                    <p className="text-base text-muted-foreground">
                      잔여면적: {application.landInfo.remainingArea.toLocaleString()}m² ({application.landInfo.remainingRatio}%)
                    </p>
                  </div>
                  <Badge variant="default">주 필지</Badge>
                </div>
                {application.additionalLands.map((land, idx) => (
                  <div key={land.id} className="flex items-center justify-between p-3">
                    <div>
                      <p className="font-medium text-foreground">{land.address}</p>
                      <p className="text-base text-muted-foreground">
                        잔여면적: {land.remainingArea.toLocaleString()}m² ({land.remainingRatio}%)
                      </p>
                    </div>
                    <Badge variant="outline">인접 필지 {idx + 1}</Badge>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                <span className="font-medium">합산 잔여 면적</span>
                <span className="text-lg font-bold text-primary">
                  {(application.landInfo.remainingArea + application.additionalLands.reduce((sum, l) => sum + l.remainingArea, 0)).toLocaleString()}m²
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 지도 및 토지 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapIcon className="h-5 w-5" />
              지도 및 토지 정보
              {isMultipleLands && (
                <Badge variant="outline" className="ml-2">
                  {allLands.length}필지
                </Badge>
              )}
            </CardTitle>
            {isMultipleLands && (
              <CardDescription>
                필지를 선택하여 각 토지의 지적도/항공사진을 확인하세요.
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 복수 필지: 필지 선택 */}
            {isMultipleLands && (
              <Select
                value={selectedLandIndex.toString()}
                onValueChange={(value) => setSelectedLandIndex(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allLands.map((land, index) => (
                    <SelectItem key={land.id} value={index.toString()}>
                      필지 {index + 1} - {land.address.split(" ").slice(-2).join(" ")} ({land.remainingArea.toLocaleString()}m2)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Tabs defaultValue="cadastral">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="cadastral">지적도</TabsTrigger>
                <TabsTrigger value="aerial">항공사진</TabsTrigger>
              </TabsList>
              <TabsContent value="cadastral" className="mt-4">
                <LandMap landInfo={allLands[selectedLandIndex]} showOverlay />
              </TabsContent>
              <TabsContent value="aerial" className="mt-4">
                <div className="flex h-[300px] items-center justify-center rounded-lg bg-muted sm:h-[400px]">
                  <p className="text-muted-foreground">
                    항공/드론 사진 (연동 예정)
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            {/* 선택된 필지 토지 정보 */}
            {(() => {
              const displayLand = allLands[selectedLandIndex];
              return (
                <div className="space-y-3">
                  {isMultipleLands && (
                    <p className="text-sm font-medium text-muted-foreground">
                      필지 {selectedLandIndex + 1}: {displayLand.address}
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-4 rounded-lg border border-border p-4">
                    <div>
                      <p className="text-base text-muted-foreground">편입 전 면적</p>
                      <p className="text-lg font-semibold text-foreground">
                        {displayLand.originalArea.toLocaleString()}m2
                      </p>
                    </div>
                    <div>
                      <p className="text-base text-muted-foreground">편입 면적</p>
                      <p className="text-lg font-semibold text-destructive">
                        {displayLand.includedArea.toLocaleString()}m2
                      </p>
                    </div>
                    <div>
                      <p className="text-base text-muted-foreground">잔여 면적</p>
                      <p className="text-lg font-semibold text-primary">
                        {displayLand.remainingArea.toLocaleString()}m2
                      </p>
                    </div>
                    <div>
                      <p className="text-base text-muted-foreground">잔여 비율</p>
                      <p className="text-lg font-semibold text-foreground">
                        {displayLand.remainingRatio}%
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>

        {/* AI 분석 결과 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              AI 분석 결과
            </CardTitle>
            <CardDescription>
              토지 유형: {aiResult?.landTypePath || application.landInfo.landType}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 잠정 판정 */}
            {aiResult && (
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-base text-muted-foreground">잠정 판정</span>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const config = judgmentConfig[aiResult.provisionalJudgment];
                      const Icon = config.icon;
                      return (
                        <>
                          <Icon className={`h-5 w-5 ${config.color}`} />
                          <span className={`font-semibold ${config.color}`}>
                            {config.label}
                          </span>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* 기준 충족 여부 */}
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">기준 충족 여부</h4>
              {aiResult?.criteriaChecks.map((check, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 rounded-lg border p-3 ${
                    check.isMet 
                      ? "border-green-200 bg-green-50/50" 
                      : "border-red-200 bg-red-50/50"
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {check.isMet ? (
                        <Badge variant="default" className="bg-green-600 hover:bg-green-600">
                          충족
                        </Badge>
                      ) : (
                        <Badge variant="destructive-subtle">
                          미충족
                        </Badge>
                      )}
                      <p className="font-medium text-foreground">{check.criteriaName}</p>
                      {!check.autoDetected && (
                        <Badge variant="outline">
                          직접 확인 필요
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-base text-muted-foreground">
                      {check.criteriaDescription}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* 형상지수 */}
            {aiResult && (
              <div className="rounded-lg border border-border p-4">
                <h4 className="mb-3 font-medium text-foreground">형상지수</h4>
                <div className="grid grid-cols-3 gap-4 text-center text-base">
                  <div>
                    <p className="text-muted-foreground">편입 전</p>
                    <p className="text-lg font-semibold text-foreground">
                      {aiResult.originalShapeIndex.toFixed(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">편입 후</p>
                    <p className="text-lg font-semibold text-foreground">
                      {aiResult.remainingShapeIndex.toFixed(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">변화량</p>
                    <p className={`text-lg font-semibold ${aiResult.shapeIndexChange >= 1 ? "text-destructive" : "text-foreground"}`}>
                      +{aiResult.shapeIndexChange.toFixed(1)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 담당자 검토 영역 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            담당자 검토
            {isMultipleLands && (
              <Badge variant="outline" className="ml-2">
                <Layers className="mr-1 h-3 w-3" />
                {allLands.length}필지
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            {isMultipleLands 
              ? "각 필지별로 AI 분석 결과를 검토하고 필요 시 수정합니다."
              : "AI 분석 결과를 검토하고 필요 시 수정합니다. 자동 판독 불가 항목은 수동으로 입력해주세요."
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 복수 필지: 비교 테이블 + 셀렉트박스 + 상세 검토 */}
          {isMultipleLands ? (
            <div className="space-y-6">
              {/* 필지별 비교 요약 테이블 */}
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">필지별 비교 요약</h4>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">필지</th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">잔여면적</th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">잔여비율</th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">토지모양</th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">AI 판정</th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">담당자 판정</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allLands.map((land, index) => {
                        const landReview = landReviewDataList[index];
                        const landData = application.landDataList?.[index];
                        const isSelected = selectedLandIndex === index;
                        // AI 판정 결과 (실제로는 필지별로 다르게 계산되어야 함)
                        const aiJudgment = application.aiResult?.provisionalJudgment || "-";
                        
                        return (
                          <tr 
                            key={land.id} 
                            className={`cursor-pointer border-t border-border transition-colors ${
                              isSelected ? "bg-primary/10" : "hover:bg-muted/30"
                            }`}
                            onClick={() => setSelectedLandIndex(index)}
                          >
                            <td className="px-3 py-2">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">필지 {index + 1}</span>
                                {isSelected && (
                                  <Badge variant="outline" className="text-xs">선택됨</Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">{land.address}</p>
                            </td>
                            <td className="px-3 py-2 font-medium text-primary">{land.remainingArea.toLocaleString()}m2</td>
                            <td className={`px-3 py-2 ${land.remainingRatio >= 24 ? "text-amber-600 font-medium" : ""}`}>
                              {land.remainingRatio}%
                              {land.remainingRatio >= 24 && <span className="ml-1 text-xs">(기준초과)</span>}
                            </td>
                            <td className="px-3 py-2">{landData?.reportedShape || land.remainingShape}</td>
                            <td className="px-3 py-2">
                              <Badge variant={aiJudgment === "매수" ? "default" : aiJudgment === "기각" ? "destructive" : "secondary"} className="text-xs">
                                {aiJudgment}
                              </Badge>
                            </td>
                            <td className="px-3 py-2">
                              {landReview?.landJudgment ? (
                                <Badge variant={landReview.landJudgment === "매수" ? "default" : landReview.landJudgment === "기각" ? "destructive" : "secondary"} className="text-xs">
                                  {landReview.landJudgment}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 필지 선택 셀렉트박스 */}
              <div className="flex items-center gap-4">
                <Label className="shrink-0">상세 검토할 필지</Label>
                <Select
                  value={selectedLandIndex.toString()}
                  onValueChange={(value) => setSelectedLandIndex(parseInt(value))}
                >
                  <SelectTrigger className="w-[300px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allLands.map((land, index) => (
                      <SelectItem key={land.id} value={index.toString()}>
                        필지 {index + 1} - {land.address.split(" ").slice(-2).join(" ")} ({land.remainingArea.toLocaleString()}m2)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 선택된 필지 상세 정보: AI 분석 | 민원인 입력 2컬럼 */}
              {(() => {
                const selectedLand = allLands[selectedLandIndex];
                const selectedLandData = application.landDataList?.[selectedLandIndex];
                const selectedLandReview = landReviewDataList[selectedLandIndex];
                const isAgricultural = selectedLand.landType === "농지" || selectedLandReview?.actualUsage === "답" || selectedLandReview?.actualUsage === "전";
                
                const landSubTypeLabels: Record<string, string> = {
                  "residential-detached": "주거용 - 단독주택",
                  "residential-multi": "주거용 - 연립/다세대",
                  "residential-apartment": "주거용 - 아파트",
                  "commercial": "상업용",
                  "industrial": "공업용",
                };

                return (
                  <div className="rounded-lg border border-border p-5 space-y-5">
                    {/* 필지 헤더 */}
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <div>
                        <span className="text-lg font-semibold text-foreground">필지 {selectedLandIndex + 1} 상세</span>
                        <p className="text-sm text-muted-foreground">{selectedLand.address}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="rounded bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                          {selectedLand.remainingArea.toLocaleString()}m2 / {selectedLand.remainingRatio}%
                        </span>
                      </div>
                    </div>

                    {/* 2컬럼: AI 분석 결과 | 민원인 입력 정보 */}
                    <div className="grid gap-4 lg:grid-cols-2">
                      {/* AI 분석 결과 */}
                      <div className="rounded-lg border border-blue-200 bg-blue-50/30 p-4 space-y-3">
                        <h5 className="flex items-center gap-2 font-semibold text-blue-700">
                          <Bot className="h-4 w-4" />
                          AI 분석 결과
                        </h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">토지 유형</span>
                            <span className="font-medium">{selectedLand.landType}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">지목</span>
                            <span className="font-medium">{selectedLand.landCategory}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">토지 형상</span>
                            <span className="font-medium">{selectedLand.remainingShape}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">형상지수 변화</span>
                            <span className="font-medium">
                              {selectedLand.originalShapeIndex?.toFixed(1) || "-"} → {selectedLand.remainingShapeIndex?.toFixed(1) || "-"}
                            </span>
                          </div>
                          <div className="flex justify-between border-t border-blue-200 pt-2 mt-2">
                            <span className="text-muted-foreground">AI 잠정 판정</span>
                            <Badge variant={application.aiResult?.provisionalJudgment === "매수" ? "default" : "destructive"}>
                              {application.aiResult?.provisionalJudgment || "-"}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* 민원인 입력 정보 */}
                      <div className="rounded-lg border border-violet-200 bg-violet-50/30 p-4 space-y-3">
                        <h5 className="flex items-center gap-2 font-semibold text-violet-700">
                          <User className="h-4 w-4" />
                          민원인 입력 정보
                        </h5>
                        {selectedLandData ? (
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">현재 활용 지목</span>
                              <span className="font-medium">
                                {selectedLandData.currentUsage} ({landCategories.find(c => c.value === selectedLandData.currentUsage)?.label || ""})
                              </span>
                            </div>
                            {selectedLandData.currentUsage === "대" && selectedLandData.landSubType && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">택지 세부 유형</span>
                                <span className="font-medium">{landSubTypeLabels[selectedLandData.landSubType] || selectedLandData.landSubType}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">공부상 지목</span>
                              <span className="font-medium">
                                {selectedLandData.actualUsage} ({landCategories.find(c => c.value === selectedLandData.actualUsage)?.label || ""})
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">토지 모양</span>
                              <span className="font-medium">{selectedLandData.reportedShape}</span>
                            </div>
                            <div className="flex flex-wrap gap-2 border-t border-violet-200 pt-2 mt-2">
                              {selectedLandData.accessRoadLost && (
                                <Badge variant="destructive-subtle" className="text-xs">접면도로 상실</Badge>
                              )}
                              {selectedLandData.waterChannelLost && (
                                <Badge variant="destructive-subtle" className="text-xs">관개수로 상실</Badge>
                              )}
                              {selectedLandData.farmMachineDifficulty && (
                                <Badge variant="destructive-subtle" className="text-xs">농기계 진입 곤란</Badge>
                              )}
                              {!selectedLandData.accessRoadLost && !selectedLandData.waterChannelLost && !selectedLandData.farmMachineDifficulty && (
                                <span className="text-xs text-muted-foreground">직접 확인 항목 없음</span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">민원인 입력 정보가 없습니다.</p>
                        )}
                      </div>
                    </div>

                    {/* 담당자 검토 입력 */}
                    <div className="border-t border-border pt-4 space-y-4">
                      <h5 className="font-semibold text-foreground">담당자 검토</h5>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-2">
                          <Label>실제 이용 상황</Label>
                          <Select
                            value={selectedLandReview?.actualUsage || ""}
                            onValueChange={(value) => updateLandReviewData(selectedLandIndex, "actualUsage", value as LandCategory)}
                          >
                            <SelectTrigger>
                              <SelectValue />
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
                          <Label>토지 모양</Label>
                          <Select
                            value={selectedLandReview?.landShape || ""}
                            onValueChange={(value) => updateLandReviewData(selectedLandIndex, "landShape", value as LandShape)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <div className="px-2 py-1 text-base font-semibold text-muted-foreground">정형</div>
                              {landShapes.regular.map((shape) => (
                                <SelectItem key={shape.value} value={shape.value}>{shape.label}</SelectItem>
                              ))}
                              <div className="px-2 py-1 text-base font-semibold text-muted-foreground">비정형</div>
                              {landShapes.irregular.map((shape) => (
                                <SelectItem key={shape.value} value={shape.value}>{shape.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {isAgricultural && (
                          <div className="space-y-2">
                            <Label>농기계 진입/회전 곤란</Label>
                            <Select
                              value={selectedLandReview?.farmMachineDifficulty || "미입력"}
                              onValueChange={(value) => updateLandReviewData(selectedLandIndex, "farmMachineDifficulty", value as "미입력" | "해당" | "해당없음")}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="미입력">미입력</SelectItem>
                                <SelectItem value="해당">해당</SelectItem>
                                <SelectItem value="해당없음">해당 없음</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label>필지별 판정</Label>
                          <Select
                            value={selectedLandReview?.landJudgment || ""}
                            onValueChange={(value) => updateLandReviewData(selectedLandIndex, "landJudgment", value as JudgmentResult)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="판정 선택" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="매수">매수</SelectItem>
                              <SelectItem value="기각">기각</SelectItem>
                              <SelectItem value="심의위원회이관">심의위원회 이관</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* 자동 판독 불가 항목 */}
                      <div className="space-y-2">
                        <Label>자동 판독 불가 항목</Label>
                        <div className="flex flex-wrap gap-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`accessRoadLost-${selectedLandIndex}`}
                              checked={selectedLandReview?.accessRoadLost || false}
                              onCheckedChange={(checked) => updateLandReviewData(selectedLandIndex, "accessRoadLost", checked === true)}
                            />
                            <Label htmlFor={`accessRoadLost-${selectedLandIndex}`} className="text-base font-normal">
                              접면도로 상실
                            </Label>
                          </div>
                          {isAgricultural && (
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`waterChannelLost-${selectedLandIndex}`}
                                checked={selectedLandReview?.waterChannelLost || false}
                                onCheckedChange={(checked) => updateLandReviewData(selectedLandIndex, "waterChannelLost", checked === true)}
                              />
                              <Label htmlFor={`waterChannelLost-${selectedLandIndex}`} className="text-base font-normal">
                                관개수로 상실
                              </Label>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* 소유자 의견 */}
              <div className="space-y-2">
                <Label>소유자 의견 (신청 사유)</Label>
                <div className="rounded-lg border border-border bg-muted/50 p-3 text-base text-foreground">
                  {application.reason}
                </div>
              </div>

              {/* 최종 검토 의견 (복수 필지용) */}
              <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <Label className="text-base font-semibold text-primary">최종 검토 의견</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  복수 필지 신청건에 대한 종합적인 검토 의견을 작성하세요. 이 내용은 심의서의 &quot;현지상황 및 검토의견&quot;에 자동 입력됩니다.
                </p>
                <Textarea
                  id="finalReviewOpinion"
                  placeholder="복수 필지에 대한 종합 검토 의견을 작성하세요. (예: 해당 토지들은 동일 소유자 소유로 연접해 있으며, 도로 편입으로 인해 모두 불규칙한 형태로 남아 건축 및 영농이 곤란한 상태입니다.)"
                  rows={5}
                  value={reviewData.finalReviewOpinion}
                  onChange={(e) =>
                    setReviewData((prev) => ({ ...prev, finalReviewOpinion: e.target.value }))
                  }
                  className="border-primary/20"
                />
              </div>
            </div>
          ) : (
            /* 단일 필지: 기존 방식 */
            <>
              {/* 수정 가능 항목 */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label>실제 이용 상황</Label>
                  <Select
                    value={reviewData.actualUsage}
                    onValueChange={(value) =>
                      setReviewData((prev) => ({ ...prev, actualUsage: value as LandCategory }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
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
                  <Label>토지 모양</Label>
                  <Select
                    value={reviewData.landShape}
                    onValueChange={(value) =>
                      setReviewData((prev) => ({ ...prev, landShape: value as LandShape }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
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

                <div className="space-y-2">
                  <Label>농기계 진입/회전 곤란</Label>
                  <Select
                    value={reviewData.farmMachineDifficulty}
                    onValueChange={(value) =>
                      setReviewData((prev) => ({
                        ...prev,
                        farmMachineDifficulty: value as "미입력" | "해당" | "해당없음",
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="미입력">미입력</SelectItem>
                      <SelectItem value="해당">해당</SelectItem>
                      <SelectItem value="해당없음">해당 없음</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 자동 판독 불가 항목 */}
              <div className="space-y-2">
                <Label>자동 판독 불가 항목 (수동 입력)</Label>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="accessRoadLost"
                      checked={reviewData.accessRoadLost}
                      onCheckedChange={(checked) =>
                        setReviewData((prev) => ({ ...prev, accessRoadLost: checked === true }))
                      }
                    />
                    <Label htmlFor="accessRoadLost" className="text-base font-normal">접면도로 상실</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="waterChannelLost"
                      checked={reviewData.waterChannelLost}
                      onCheckedChange={(checked) =>
                        setReviewData((prev) => ({ ...prev, waterChannelLost: checked === true }))
                      }
                    />
                    <Label htmlFor="waterChannelLost" className="text-base font-normal">
                      수로 상실
                    </Label>
                  </div>
                </div>
              </div>

              {/* 소유자 의견 */}
              <div className="space-y-2">
                <Label>소유자 의견 (신청 사유)</Label>
                <div className="rounded-lg border border-border bg-muted/50 p-3 text-base text-foreground">
                  {application.reason}
                </div>
              </div>

              {/* 검토 의견 */}
              <div className="space-y-2">
                <Label htmlFor="reviewerComment">검토 의견</Label>
                <Textarea
                  id="reviewerComment"
                  placeholder="담당자 검토 의견을 작성하세요."
                  rows={4}
                  value={reviewData.reviewerComment}
                  onChange={(e) =>
                    setReviewData((prev) => ({ ...prev, reviewerComment: e.target.value }))
                  }
                />
              </div>
            </>
          )}

          {/* 진행상황 설정 */}
          <div className="space-y-2">
            <Label>진행상황 설정</Label>
            <div className="flex flex-wrap gap-2">
              {(["접수완료", "진행중", "심사완료"] as AdminStatus[]).map((status) => {
                const config = adminStatusConfig[status];
                const Icon = config.icon;
                const isSelected = reviewData.adminStatus === status;
                return (
                  <Button
                    key={status}
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setReviewData((prev) => ({ ...prev, adminStatus: status }))
                    }
                    className={`cursor-pointer border-2 ${isSelected ? "border-primary text-primary" : "border-[#E1E4E7] text-foreground"}`}
                  >
                    <Icon className={`mr-2 h-4 w-4 ${status === "진행중" && isSelected ? "animate-spin" : ""}`} />
                    {config.label}
                  </Button>
                );
              })}
            </div>
            <p className="text-base text-muted-foreground">
              민원인이 신청 현황 조회 시 이 진행상황이 표시됩니다.
            </p>
          </div>

          {/* 최종 판정 - 진행상황이 완료일 때만 활성화 */}
          <div className="space-y-2">
<Label className={reviewData.adminStatus !== "심사완료" ? "text-muted-foreground" : ""}>
                  최종 판정
{reviewData.adminStatus !== "심사완료" && (
                    <span className="ml-2 text-base font-normal text-muted-foreground">
                    (진행상황을 &apos;심사완료&apos;로 설정하면 활성화됩니다)
                </span>
              )}
            </Label>
            <div className="flex flex-wrap gap-2">
              {(["매수", "기각", "심의위원회이관"] as JudgmentResult[]).map((judgment) => {
                const config = judgmentConfig[judgment];
                const Icon = config.icon;
                const isSelected = reviewData.finalJudgment === judgment;
                const isDisabled = reviewData.adminStatus !== "심사완료";
                return (
                  <Button
                    key={judgment}
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setReviewData((prev) => ({ ...prev, finalJudgment: judgment }))
                    }
                    disabled={isDisabled}
                    className={`cursor-pointer border-2 ${isSelected ? "border-primary text-primary" : "border-[#E1E4E7] text-foreground"} ${isDisabled ? "opacity-50" : ""}`}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {config.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* 저장 버튼 */}
          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <Button variant="outline" onClick={onBack}>
              취소
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                "저장 중..."
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  검토 완료 및 저장
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MapIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" x2="9" y1="3" y2="18" />
      <line x1="15" x2="15" y1="6" y2="21" />
    </svg>
  );
}
