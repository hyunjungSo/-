"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { dummyApplications } from "@/lib/dummy-data";
import type { Application, AdminStatus } from "@/lib/types";
import { 
  Clock, 
  Loader2, 
  CheckCircle2, 
  FileText, 
  MapPin,
  Calendar,
  Scale,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Info,
  Eye
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { JudgmentRationale } from "@/lib/types";

const adminStatusConfig: Record<AdminStatus, { label: string; icon: typeof Clock; color: string; bgColor: string }> = {
  대기중: { label: "대기중", icon: Clock, color: "text-gray-600", bgColor: "bg-gray-100" },
  진행중: { label: "진행중", icon: Loader2, color: "text-blue-600", bgColor: "bg-blue-100" },
  완료: { label: "완료", icon: CheckCircle2, color: "text-green-600", bgColor: "bg-green-100" },
};

// 신청 현황용 판단 근거 컴포넌트
function StatusRationaleSection({ rationale }: { rationale: JudgmentRationale }) {
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
            <span>AI 판단 근거 보기</span>
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
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="flex items-start gap-2">
            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div>
              <h4 className="text-sm font-semibold text-foreground">판단 요약</h4>
              <p className="mt-1 text-xs text-muted-foreground">{rationale.summary}</p>
            </div>
          </div>
        </div>

        {/* 법적 근거 */}
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <div className="flex items-start gap-2">
            <Scale className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div>
              <h4 className="text-sm font-semibold text-foreground">법적 근거</h4>
              <p className="mt-1 text-xs text-muted-foreground">{rationale.legalBasis}</p>
            </div>
          </div>
        </div>

        {/* 적용 기준 */}
        <div className="rounded-lg border border-border bg-card p-3">
          <h4 className="mb-2 text-sm font-semibold text-foreground">적용 기준</h4>
          <ul className="space-y-1">
            {rationale.appliedCriteria.map((criteria, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary" />
                <span>{criteria}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 수동 확인 필요 항목 */}
        {rationale.manualCheckItems && rationale.manualCheckItems.length > 0 && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <div>
                <h4 className="text-sm font-semibold text-foreground">수동 확인 항목</h4>
                <ul className="mt-1 space-y-0.5">
                  {rationale.manualCheckItems.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Info className="h-3 w-3 text-amber-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 상세 설명 */}
        <div className="rounded-lg border border-border bg-card p-3">
          <h4 className="mb-2 text-sm font-semibold text-foreground">상세 분석</h4>
          <pre className="whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">
            {rationale.detailedExplanation}
          </pre>
        </div>

        {/* 안내 문구 */}
        <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-2">
          <Info className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
          <p className="text-xs text-muted-foreground">
            AI 판독 결과는 참고용이며, 최종 판정은 담당자 검토에 따라 결정됩니다.
          </p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// 상세 정보 모달/확장 컴포넌트
function ApplicationDetailCard({ application, onClose }: { application: Application; onClose: () => void }) {
  const getStatusStep = (status: AdminStatus) => {
    switch (status) {
      case "대기중": return 1;
      case "진행중": return 2;
      case "완료": return 3;
      default: return 1;
    }
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            신청 상세 정보
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            닫기
          </Button>
        </div>
        <CardDescription>
          접수번호: {application.applicationNumber}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 진행 상황 타임라인 */}
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <h4 className="mb-4 text-sm font-semibold text-foreground">진행 상황</h4>
          <div className="flex items-center justify-between">
            {(["대기중", "진행중", "완료"] as AdminStatus[]).map((status, idx) => {
              const config = adminStatusConfig[status];
              const Icon = config.icon;
              const currentStep = getStatusStep(application.adminStatus);
              const stepNum = idx + 1;
              const isActive = stepNum <= currentStep;
              const isCurrent = stepNum === currentStep;

              return (
                <div key={status} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                      isCurrent 
                        ? "border-primary bg-primary text-primary-foreground" 
                        : isActive 
                          ? "border-primary/50 bg-primary/10 text-primary"
                          : "border-muted-foreground/30 bg-muted text-muted-foreground"
                    }`}>
                      <Icon className={`h-5 w-5 ${status === "진행중" && isCurrent ? "animate-spin" : ""}`} />
                    </div>
                    <span className={`mt-2 text-xs font-medium ${
                      isCurrent ? "text-primary" : isActive ? "text-foreground" : "text-muted-foreground"
                    }`}>
                      {config.label}
                    </span>
                  </div>
                  {idx < 2 && (
                    <div className={`mx-2 h-0.5 flex-1 ${
                      stepNum < currentStep ? "bg-primary" : "bg-muted-foreground/30"
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 처리 완료 시 결과 표시 */}
        {application.adminStatus === "완료" && application.finalJudgment && (
          <div className={`rounded-lg border-2 p-4 ${
            application.finalJudgment === "매수" 
              ? "border-green-200 bg-green-50" 
              : application.finalJudgment === "기각"
                ? "border-red-200 bg-red-50"
                : "border-amber-200 bg-amber-50"
          }`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className={`h-5 w-5 ${
                application.finalJudgment === "매수" ? "text-green-600" : 
                application.finalJudgment === "기각" ? "text-red-600" : "text-amber-600"
              }`} />
              <span className="font-semibold">최종 결과: {application.finalJudgment}</span>
            </div>
            {application.reviewerComment && (
              <p className="mt-2 text-sm text-muted-foreground">
                {application.reviewerComment}
              </p>
            )}
          </div>
        )}

        {/* AI 판단 근거 표시 */}
        {application.aiResult?.judgmentRationale && (
          <StatusRationaleSection rationale={application.aiResult.judgmentRationale} />
        )}

        {/* 토지 정보 요약 */}
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <h4 className="mb-2 text-sm font-semibold text-foreground">토지 정보</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">토지 유형</span>
              <span className="font-medium">{application.landInfo.landType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">잔여 면적</span>
              <span className="font-medium text-primary">{application.landInfo.remainingArea.toLocaleString()}m²</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">잔여 비율</span>
              <span className="font-medium">{application.landInfo.remainingRatio}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">AI 판정</span>
              <span className={`font-medium ${
                application.aiResult?.provisionalJudgment === "매수" ? "text-green-600" : "text-muted-foreground"
              }`}>
                {application.aiResult?.provisionalJudgment || "-"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ApplicationStatusSection() {
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  // 현재 로그인한 사용자의 신청 목록 (실제로는 사용자 ID로 필터링)
  // 여기서는 더미 데이터 전체를 표시
  const myApplications = dummyApplications;

  return (
    <div className="space-y-6">
      {/* 선택된 신청 상세 */}
      {selectedApplication && (
        <ApplicationDetailCard 
          application={selectedApplication} 
          onClose={() => setSelectedApplication(null)} 
        />
      )}

      {/* 신청 목록 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            내 신청 현황
          </CardTitle>
          <CardDescription>
            신청하신 잔여지 매수 건의 진행 상황을 확인하세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {myApplications.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center text-center">
              <FileText className="h-10 w-10 text-muted-foreground" />
              <p className="mt-4 font-medium text-foreground">신청 내역이 없습니다</p>
              <p className="mt-1 text-sm text-muted-foreground">
                신규 신청 탭에서 잔여지 매수를 신청해 주세요.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {myApplications.map((app) => {
                const statusConfig = adminStatusConfig[app.adminStatus];
                const StatusIcon = statusConfig.icon;

                return (
                  <div
                    key={app.id}
                    className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-foreground">
                          {app.applicationNumber}
                        </span>
                        <Badge className={`${statusConfig.bgColor} ${statusConfig.color}`}>
                          <StatusIcon className={`mr-1 h-3 w-3 ${app.adminStatus === "진행중" ? "animate-spin" : ""}`} />
                          {statusConfig.label}
                        </Badge>
                        {app.adminStatus === "완료" && app.finalJudgment && (
                          <Badge className={
                            app.finalJudgment === "매수" 
                              ? "bg-green-100 text-green-700" 
                              : app.finalJudgment === "기각"
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-700"
                          }>
                            {app.finalJudgment}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {app.landInfo.address}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {app.appliedAt}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedApplication(app)}
                      className="ml-4 gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      상세보기
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
