"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { dummyApplications } from "@/lib/dummy-data";
import type { Application, AdminStatus } from "@/lib/types";
import { 
  Clock, 
  PlayCircle, 
  CheckCircle2, 
  FileText, 
  MapPin,
  Calendar,
  Scale,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  AlertTriangle,
  Info
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { JudgmentRationale } from "@/lib/types";

const adminStatusConfig: Record<AdminStatus, { 
  label: string; 
  icon: typeof Clock; 
  variant: "warning-subtle" | "info-subtle" | "success-subtle";
  iconColor: string;
  bgColor: string;
  textColor: string;
}> = {
  접수완료: { 
    label: "접수완료", 
    icon: Clock, 
    variant: "warning-subtle",  // 주황 solid-pastel
    iconColor: "text-amber-700",
    bgColor: "bg-amber-50",
    textColor: "text-amber-700",
  },
  진행중: { 
    label: "진행중", 
    icon: PlayCircle, 
    variant: "info-subtle",     // 파랑 solid-pastel
    iconColor: "text-sky-700",
    bgColor: "bg-sky-50",
    textColor: "text-sky-700",
  },
  심사완료: { 
    label: "심사완료", 
    icon: CheckCircle2, 
    variant: "success-subtle",  // 녹색 solid-pastel
    iconColor: "text-emerald-700",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-700",
  },
};

// 신청 현황용 판단 근거 컴포넌트
function StatusRationaleSection({ rationale, provisionalJudgment }: { rationale: JudgmentRationale; provisionalJudgment?: "매수" | "기각" }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className={`rounded-lg border ${isOpen ? "border-primary/30 bg-muted/20" : "border-border"}`}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            className={`h-12 w-full cursor-pointer justify-between rounded-b-none ${isOpen ? "border-b border-border" : ""}`}
          >
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-primary" />
              <span>AI 판단 근거 보기</span>
              {provisionalJudgment && (
                <Badge 
                  variant={provisionalJudgment === "매수" ? "success-subtle" : "destructive-subtle"}
                >
                  {provisionalJudgment === "매수" ? "매수 가능" : "기준 미충족"}
                </Badge>
              )}
            </div>
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 p-4">
        {/* 판단 요약 */}
        <div className="flex items-start gap-3">
          <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div>
            <h4 className="text-base font-semibold text-foreground">판단 요약</h4>
            <p className="mt-1 text-base leading-relaxed text-muted-foreground">{rationale.summary}</p>
          </div>
        </div>

        {/* 법적 근거 */}
        <div className="flex items-start gap-3">
          <Scale className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <div>
            <h4 className="text-base font-semibold text-foreground">법적 근거</h4>
            <p className="mt-1 text-base leading-relaxed text-muted-foreground">{rationale.legalBasis}</p>
          </div>
        </div>

        {/* 적용 기준 */}
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div>
            <h4 className="text-base font-semibold text-foreground">적용 기준</h4>
            <ul className="mt-1 space-y-1">
              {rationale.appliedCriteria.map((criteria, idx) => (
                <li key={idx} className="flex items-start gap-2 text-base text-muted-foreground">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                  <span>{criteria}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 직접 확인 필요 항목 */}
        {rationale.manualCheckItems && rationale.manualCheckItems.length > 0 && (
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div>
              <h4 className="text-base font-semibold text-foreground">직접 확인 항목</h4>
              <ul className="mt-1 space-y-1">
                {rationale.manualCheckItems.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-base text-muted-foreground">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* 상세 설명 */}
        <div className="flex items-start gap-3">
          <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div>
            <h4 className="text-base font-semibold text-foreground">상세 분석</h4>
            <pre className="mt-1 whitespace-pre-wrap text-base leading-relaxed text-muted-foreground">
              {rationale.detailedExplanation}
            </pre>
          </div>
        </div>

        {/* 안내 문구 */}
        <div className="flex items-start gap-2 pt-2">
          <Info className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
          <p className="text-base text-muted-foreground">
            AI 판독 결과는 참고용이며, 최종 판정은 담당자 검토에 따라 결정됩니다.
          </p>
        </div>
      </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

// 상세 정보 패널 컴포넌트
function ApplicationDetailPanel({ application }: { application: Application }) {
  const getStatusStep = (status: AdminStatus) => {
    switch (status) {
  case "접수완료": return 1;
  case "진행중": return 2;
  case "심사완료": return 3;
  default: return 1;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5 text-primary" />
          신청 상세 정보
        </CardTitle>
        <CardDescription>
          접수번호: {application.applicationNumber}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* KRDS 스타일 진행 상황 표시 */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h4 className="mb-4 text-base font-semibold text-foreground">진행 상황</h4>
          <ol className="flex items-center justify-between">
            {(["접수완료", "진행중", "심사완료"] as AdminStatus[]).map((status, idx) => {
              const config = adminStatusConfig[status];
              const currentStep = getStatusStep(application.adminStatus);
              const stepNum = idx + 1;
              const isActive = stepNum <= currentStep;
              const isCurrent = stepNum === currentStep;
              const isLast = idx === 2;

              const Icon = config.icon;
              return (
                <li key={status} className={`flex items-center ${isLast ? "flex-none" : "flex-1"}`}>
                  <div className="flex flex-col items-center">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-full text-base font-semibold ${
                      isCurrent 
                        ? `${config.bgColor} ${config.iconColor}` 
                        : isActive 
                          ? "bg-gray-200 text-gray-600"
                          : "bg-gray-100 text-gray-400"
                    }`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className={`mt-2 text-base font-medium ${
                      isCurrent ? config.textColor : isActive ? "text-gray-600" : "text-gray-400"
                    }`}>
                      {config.label}
                    </span>
                  </div>
                  {idx < 2 && (
                    <div className={`mx-3 h-0.5 flex-1 ${
                      stepNum < currentStep ? "bg-gray-300" : "bg-gray-200"
                    }`} aria-hidden="true" />
                  )}
                </li>
              );
            })}
          </ol>
        </div>

        {/* 처리 완료 시 결과 표시 */}
        {application.adminStatus === "심사완료" && application.finalJudgment && (
          <div className={`rounded-lg border p-4 ${
            application.finalJudgment === "매수" 
              ? "border-emerald-200 bg-emerald-50" 
              : application.finalJudgment === "기각"
                ? "border-red-200 bg-red-50"
                : "border-amber-200 bg-amber-50"
          }`}>
            <div className="flex items-center gap-2">
              {application.finalJudgment === "매수" && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
              {application.finalJudgment === "기각" && <AlertTriangle className="h-5 w-5 text-red-600" />}
              {application.finalJudgment === "심의위원회이관" && <Info className="h-5 w-5 text-amber-600" />}
              <span className={`font-semibold ${
                application.finalJudgment === "매수" ? "text-emerald-700" : 
                application.finalJudgment === "기각" ? "text-red-700" : "text-amber-700"
              }`}>최종 결과: {application.finalJudgment}</span>
            </div>
            {application.reviewerComment && (
              <p className="mt-2 text-base text-muted-foreground">
                {application.reviewerComment}
              </p>
            )}
          </div>
        )}

{/* AI 판단 근거 표시 */}
  {application.aiResult?.judgmentRationale && (
<StatusRationaleSection 
  rationale={application.aiResult.judgmentRationale} 
  provisionalJudgment={application.aiResult.provisionalJudgment}
/>
  )}

        {/* 토지 정보 요약 */}
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <h4 className="mb-3 text-base font-semibold text-foreground">토지 정보</h4>
          <div className="flex flex-wrap items-center justify-end gap-x-6 gap-y-2 text-base">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">토지 유형</span>
              <span className="font-medium">{application.landInfo.landType}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">잔여 면적</span>
              <span className="font-medium text-primary">{application.landInfo.remainingArea.toLocaleString()}m²</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">잔여 비율</span>
              <span className="font-medium">{application.landInfo.remainingRatio}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">AI 판정</span>
              <span className={`font-medium ${
                application.aiResult?.provisionalJudgment === "매수" ? "text-primary" : "text-muted-foreground"
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

  // 첫 번째 신청이 있으면 기본 선택
  const displayedApplication = selectedApplication || (myApplications.length > 0 ? myApplications[0] : null);

  return (
    <div className="space-y-4">
      {/* 타이틀 영역 */}
      <div className="space-y-1">
        <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
          <FileText className="h-5 w-5 text-primary" />
          내 신청 현황
        </h2>
        <p className="text-base text-muted-foreground">
          신청하신 잔여지 매수 건의 진행 상황을 확인하세요.
        </p>
      </div>

      {/* 2-column 레이아웃: 왼쪽 리스트 / 오른쪽 상세 */}
      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        {/* 왼쪽: 신청 목록 */}
        <Card className="h-fit py-0">
          <CardContent className="p-0">
            {myApplications.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center p-6 text-center">
                <FileText className="h-10 w-10 text-muted-foreground" />
                <p className="mt-4 font-medium text-foreground">신청 내역이 없습니다</p>
                <p className="mt-1 text-base text-muted-foreground">
                  신규 신청 탭에서 잔여지 매수를 신청해 주세요.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {myApplications.map((app) => {
                  const statusConfig = adminStatusConfig[app.adminStatus];
                  const isSelected = displayedApplication?.id === app.id;

                  return (
                    <li key={app.id}>
                      <button
                        onClick={() => setSelectedApplication(app)}
                        className={`w-full cursor-pointer px-4 py-4 text-left transition-colors hover:bg-muted/50 ${
                          isSelected ? "border-l-2 border-l-primary bg-primary/5" : ""
                        }`}
                      >
                        {/* 접수번호 + 현황 뱃지 */}
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <Badge variant={statusConfig.variant}>
                            <statusConfig.icon className="h-3.5 w-3.5" />
                            {statusConfig.label}
                          </Badge>
                          {app.adminStatus === "심사완료" && app.finalJudgment && (
                            <Badge 
                              variant="outline"
                              className={
                                app.finalJudgment === "매수" 
                                  ? "border-emerald-600 text-emerald-700" 
                                  : app.finalJudgment === "기각"
                                    ? "border-red-600 text-red-700"
                                    : "border-amber-600 text-amber-700"
                              }
                            >
                              {app.finalJudgment === "매수" && <CheckCircle2 className="h-3.5 w-3.5" />}
                              {app.finalJudgment === "기각" && <AlertTriangle className="h-3.5 w-3.5" />}
                              {app.finalJudgment === "심의위원회이관" && <Info className="h-3.5 w-3.5" />}
                              {app.finalJudgment}
                            </Badge>
                          )}
                          <h3 className={`text-base font-semibold ${isSelected ? "text-primary" : "text-foreground"}`}>
                            {app.applicationNumber}
                          </h3>
                        </div>

                        {/* 주소 */}
                        <p className="mt-1 truncate text-base text-muted-foreground">
                          {app.landInfo.address}
                        </p>

                        {/* 메타데이터 */}
                        <div className="mt-2 flex items-center gap-2 text-base text-gray-500">
                          <span>{app.appliedAt}</span>
                          <span className="text-gray-300">|</span>
                          <span>{app.landInfo.remainingArea.toLocaleString()}m²</span>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* 오른쪽: 신청 상세 정보 */}
        {displayedApplication ? (
          <ApplicationDetailPanel application={displayedApplication} />
        ) : (
          <Card className="flex h-64 items-center justify-center">
            <div className="text-center text-muted-foreground">
              <FileText className="mx-auto h-10 w-10" />
              <p className="mt-2 text-base">신청 내역을 선택해주세요</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
