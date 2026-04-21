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
  매수: { label: "매수", icon: CheckCircle2, color: "text-primary" },
  기각: { label: "기각", icon: XCircle, color: "text-destructive" },
  심의위원회이관: { label: "심의위원회 이관", icon: AlertTriangle, color: "text-amber-600" },
};

const adminStatusConfig: Record<AdminStatus, { label: string; icon: typeof Clock; color: string }> = {
  대기중: { label: "대기", icon: Clock, color: "text-gray-500" },
  진행중: { label: "진행중", icon: PlayCircle, color: "text-primary" },
  완료: { label: "완료", icon: CheckCircle2, color: "text-primary" },
};

export function ApplicationDetail({ application, onBack, onSave }: ApplicationDetailProps) {
  const [reviewData, setReviewData] = useState({
    actualUsage: application.actualUsage as LandCategory,
    landShape: application.reportedShape as LandShape,
    farmMachineDifficulty: application.farmMachineDifficulty ? "해당" : "미입력" as "미입력" | "해당" | "해당없음",
    accessRoadLost: application.aiResult?.accessRoadLost || false,
    waterChannelLost: application.aiResult?.waterChannelLost || false,
    reviewerComment: application.reviewerComment || "",
    finalJudgment: application.finalJudgment || application.aiResult?.provisionalJudgment || ("매수" as JudgmentResult),
    adminStatus: application.adminStatus || ("대기중" as AdminStatus),
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    
    const updatedApplication: Application = {
      ...application,
      actualUsage: reviewData.actualUsage,
      reportedShape: reviewData.landShape,
      farmMachineDifficulty: reviewData.farmMachineDifficulty === "해당",
      reviewerComment: reviewData.reviewerComment,
      finalJudgment: reviewData.finalJudgment,
      adminStatus: reviewData.adminStatus,
      status: reviewData.adminStatus === "완료" ? "처리완료" : application.status,
      adminName: "홍길동", // 실제로는 로그인한 담당자 정보
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
              심의서 생성
            </Link>
          </Button>
        </div>
      </div>

      {/* 민원 기본 정보 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>민원 정보</CardTitle>
              <CardDescription>접수번호: {application.applicationNumber}</CardDescription>
            </div>
            {(() => {
              const config = adminStatusConfig[application.adminStatus];
              const Icon = config.icon;
              return (
                <Badge variant="outline" className={config.color}>
                  <Icon className="mr-1 h-3 w-3" />
                  {config.label}
                </Badge>
              );
            })()}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">신청인</p>
              <p className="font-medium text-foreground">{application.applicantName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">연락처</p>
              <p className="font-medium text-foreground">{application.applicantContact}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">신청일</p>
              <p className="font-medium text-foreground">{application.appliedAt}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">대상 지번</p>
              <p className="font-medium text-foreground">{application.landInfo.address}</p>
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
                <div className="flex items-center gap-2">
                  {application.unifiedParcelCondition?.sameOwner ? (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  ) : (
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className="text-sm">소유자 동일성</span>
                </div>
                <div className="flex items-center gap-2">
                  {application.unifiedParcelCondition?.continuous ? (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  ) : (
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className="text-sm">지반 연속성</span>
                </div>
                <div className="flex items-center gap-2">
                  {application.unifiedParcelCondition?.sameUsage ? (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  ) : (
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className="text-sm">용도 일체성</span>
                </div>
              </div>
              {application.unifiedParcelCondition?.isUnifiedParcel && (
                <div className="mt-3 flex items-center gap-2 rounded bg-primary/10 px-3 py-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">일단지 조건 충족 - 병합 처리 가능</span>
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
                    <p className="text-sm text-muted-foreground">
                      잔여면적: {application.landInfo.remainingArea.toLocaleString()}m² ({application.landInfo.remainingRatio}%)
                    </p>
                  </div>
                  <Badge variant="default">주 필지</Badge>
                </div>
                {application.additionalLands.map((land, idx) => (
                  <div key={land.id} className="flex items-center justify-between p-3">
                    <div>
                      <p className="font-medium text-foreground">{land.address}</p>
                      <p className="text-sm text-muted-foreground">
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

      {/* AI 판정 경계 사례 경고 */}
      {(application.isBorderlineCase || application.aiResult?.isBorderlineCase) && (
        <Card className="border-2 border-warning/50 bg-warning/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              AI 판정 경계 사례
            </CardTitle>
            <CardDescription>
              이 신청건은 AI 자동 판정 기준 충족이 애매하여 담당자의 세심한 검토가 필요합니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3 rounded-lg border border-warning/30 bg-card p-4">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
              <div>
                <p className="font-medium text-foreground">토지보상심의위원회 이관 권장</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {application.aiResult?.borderlineReason || "자동 판독 기준만으로는 명확한 판정이 어렵습니다. 수동 확인 항목을 검토하고, 필요시 심의위원회에 이관해 주세요."}
                </p>
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
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="cadastral">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="cadastral">지적도</TabsTrigger>
                <TabsTrigger value="aerial">항공사진</TabsTrigger>
              </TabsList>
              <TabsContent value="cadastral" className="mt-4">
                <LandMap landInfo={application.landInfo} showOverlay />
              </TabsContent>
              <TabsContent value="aerial" className="mt-4">
                <div className="flex h-[300px] items-center justify-center rounded-lg bg-muted sm:h-[400px]">
                  <p className="text-muted-foreground">
                    항공/드론 사진 (연동 예정)
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <div className="grid grid-cols-2 gap-4 rounded-lg border border-border p-4">
              <div>
                <p className="text-sm text-muted-foreground">편입 전 면적</p>
                <p className="text-lg font-semibold text-foreground">
                  {application.landInfo.originalArea.toLocaleString()}㎡
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">편입 면적</p>
                <p className="text-lg font-semibold text-destructive">
                  {application.landInfo.includedArea.toLocaleString()}㎡
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">잔여 면적</p>
                <p className="text-lg font-semibold text-primary">
                  {application.landInfo.remainingArea.toLocaleString()}㎡
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">잔여 비율</p>
                <p className="text-lg font-semibold text-foreground">
                  {application.landInfo.remainingRatio}%
                </p>
              </div>
            </div>
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
                  <span className="text-sm text-muted-foreground">잠정 판정</span>
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
              <h4 className="font-medium text-foreground">기준 충�� 여부</h4>
              {aiResult?.criteriaChecks.map((check, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 rounded-lg border border-border p-3"
                >
                  {check.isMet ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 shrink-0 text-gray-400" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{check.criteriaName}</p>
                      {!check.autoDetected && (
                        <Badge variant="outline" className="text-xs">
                          수동 확인 필요
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
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
                <div className="grid grid-cols-3 gap-4 text-center text-sm">
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
          </CardTitle>
          <CardDescription>
            AI 분석 결과를 검토하고 필요 시 수정합니다. 자동 판독 불가 항목은 수동으로 입력해주세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
                  <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                    정형
                  </div>
                  {landShapes.regular.map((shape) => (
                    <SelectItem key={shape.value} value={shape.value}>
                      {shape.label}
                    </SelectItem>
                  ))}
                  <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
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
                <Label htmlFor="accessRoadLost" className="text-sm font-normal">
                  접면도로 상실
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="waterChannelLost"
                  checked={reviewData.waterChannelLost}
                  onCheckedChange={(checked) =>
                    setReviewData((prev) => ({ ...prev, waterChannelLost: checked === true }))
                  }
                />
                <Label htmlFor="waterChannelLost" className="text-sm font-normal">
                  수로 상실
                </Label>
              </div>
            </div>
          </div>

          {/* 소유자 의견 */}
          <div className="space-y-2">
            <Label>소유자 의견 (신청 사유)</Label>
            <div className="rounded-lg border border-border bg-muted/50 p-3 text-sm text-foreground">
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

          {/* 진행상황 설정 */}
          <div className="space-y-2">
            <Label>진행상황 설정</Label>
            <div className="flex flex-wrap gap-2">
              {(["대기중", "진행중", "완료"] as AdminStatus[]).map((status) => {
                const config = adminStatusConfig[status];
                const Icon = config.icon;
                const isSelected = reviewData.adminStatus === status;
                return (
                  <Button
                    key={status}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    onClick={() =>
                      setReviewData((prev) => ({ ...prev, adminStatus: status }))
                    }
                    className={`cursor-pointer ${isSelected ? "" : config.color}`}
                  >
                    <Icon className={`mr-2 h-4 w-4 ${status === "진행중" && isSelected ? "animate-spin" : ""}`} />
                    {config.label}
                  </Button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              민원인이 신청 현황 조회 시 이 진행상황이 표시됩니다.
            </p>
          </div>

          {/* 최종 판정 */}
          <div className="space-y-2">
            <Label>최종 판정</Label>
            <div className="flex flex-wrap gap-2">
              {(["매수", "기각", "심의위원회이관"] as JudgmentResult[]).map((judgment) => {
                const config = judgmentConfig[judgment];
                const Icon = config.icon;
                const isSelected = reviewData.finalJudgment === judgment;
                return (
                  <Button
                    key={judgment}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    onClick={() =>
                      setReviewData((prev) => ({ ...prev, finalJudgment: judgment }))
                    }
                    className={`cursor-pointer ${isSelected ? "" : config.color}`}
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
