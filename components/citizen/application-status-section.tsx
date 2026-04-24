"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { dummyApplications } from "@/lib/dummy-data";
import type { Application, AdminStatus } from "@/lib/types";
import { 
  Clock, 
  PlayCircle, 
  CheckCircle2, 
  FileText, 
  MapPin,
  Scale,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Info,
  Layers
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

// 토지 정보 섹션 컴포넌트 (고용24 스타일 테이블 형태)
function LandInfoSection({ application }: { application: Application }) {
  const isMultipleLands = application.additionalLands && application.additionalLands.length > 0;
  const allLands = isMultipleLands 
    ? [application.landInfo, ...application.additionalLands] 
    : [application.landInfo];
  
  const [selectedLandIndex, setSelectedLandIndex] = useState(0);
  const selectedLand = allLands[selectedLandIndex];

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-2.5">
        <h4 className="font-semibold text-foreground">토지 정보</h4>
        {isMultipleLands && (
          <span className="flex items-center gap-1 rounded bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700">
            <Layers className="h-3 w-3" />
            {allLands.length}필지
          </span>
        )}
      </div>
      
      {/* 복수 필지일 경우 셀렉트박스 표시 */}
      {isMultipleLands && (
        <div className="flex border-b border-border">
          <div className="flex w-28 shrink-0 items-center bg-muted/30 px-4 py-3">
            <span className="text-sm font-medium">필지 선택</span>
          </div>
          <div className="flex flex-1 items-center px-4 py-3">
            <Select
              value={selectedLandIndex.toString()}
              onValueChange={(value) => setSelectedLandIndex(parseInt(value))}
            >
              <SelectTrigger className="w-full max-w-md">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {allLands.map((land, index) => (
                  <SelectItem key={land.id} value={index.toString()}>
                    필지 {index + 1} - {land.address.split(" ").slice(-2).join(" ")} ({land.remainingArea.toLocaleString()}m²)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
      
      {/* 토지 유형 행 */}
      <div className="flex border-b border-border">
        <div className="flex w-28 shrink-0 items-center bg-muted/30 px-4 py-3">
          <span className="text-sm font-medium">토지 유형</span>
        </div>
        <div className="flex flex-1 items-center px-4 py-3">
          <span className="text-sm">{selectedLand.landType}</span>
        </div>
      </div>
      
      {/* 잔여 면적 & 비율 행 */}
      <div className="flex border-b border-border">
        <div className="flex w-28 shrink-0 items-center bg-muted/30 px-4 py-3">
          <span className="text-sm font-medium">잔여 면적</span>
        </div>
        <div className="flex flex-1 items-center gap-6 px-4 py-3">
          <span className="font-medium text-primary">{selectedLand.remainingArea.toLocaleString()}m²</span>
          <span className="text-sm text-muted-foreground">|</span>
          <span className="text-sm text-muted-foreground">잔여 비율</span>
          <span className="font-medium">{selectedLand.remainingRatio}%</span>
        </div>
      </div>
      
      {/* AI 판정 행 */}
      <div className="flex">
        <div className="flex w-28 shrink-0 items-center bg-muted/30 px-4 py-3">
          <span className="text-sm font-medium">AI 판정</span>
        </div>
        <div className="flex flex-1 items-center px-4 py-3">
          <span className={`font-medium ${
            application.aiResult?.provisionalJudgment === "매수" ? "text-primary" : "text-muted-foreground"
          }`}>
            {application.aiResult?.provisionalJudgment || "-"}
          </span>
        </div>
      </div>
    </div>
  );
}

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
        <CollapsibleContent className="space-y-4 overflow-visible p-4">
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

// 상세 정보 패널 컴포넌트 (고용24 스타일)
function ApplicationDetailPanel({ application }: { application: Application }) {
  const getStatusStep = (status: AdminStatus) => {
    switch (status) {
      case "접수완료": return 1;
      case "진행중": return 2;
      case "심사완료": return 3;
      default: return 1;
    }
  };

  const currentStep = getStatusStep(application.adminStatus);

  return (
    <div className="space-y-4 overflow-visible">
      {/* 신청 정보 테이블 */}
      <div className="overflow-hidden rounded-lg border border-border">
        <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-2.5">
          <h4 className="font-semibold text-foreground">신청 정보</h4>
          <Badge variant={adminStatusConfig[application.adminStatus].variant}>
            {adminStatusConfig[application.adminStatus].label}
          </Badge>
        </div>
        
        {/* 접수번호 행 */}
        <div className="flex border-b border-border">
          <div className="flex w-28 shrink-0 items-center bg-muted/30 px-4 py-3">
            <span className="text-sm font-medium">접수번호</span>
          </div>
          <div className="flex flex-1 items-center px-4 py-3">
            <span className="font-semibold text-foreground">{application.applicationNumber}</span>
          </div>
        </div>
        
        {/* 소재지 행 */}
        <div className="flex border-b border-border">
          <div className="flex w-28 shrink-0 items-center bg-muted/30 px-4 py-3">
            <span className="text-sm font-medium">소재지</span>
          </div>
          <div className="flex flex-1 items-center px-4 py-3">
            <span className="text-sm">{application.landInfo.address}</span>
          </div>
        </div>
        
        {/* 신청일 행 */}
        <div className="flex">
          <div className="flex w-28 shrink-0 items-center bg-muted/30 px-4 py-3">
            <span className="text-sm font-medium">신청일</span>
          </div>
          <div className="flex flex-1 items-center px-4 py-3">
            <span className="text-sm">{application.appliedAt}</span>
          </div>
        </div>
      </div>

      {/* 진행 상태 테이블 */}
      <div className="overflow-hidden rounded-lg border border-border">
        <div className="border-b border-border bg-muted/50 px-4 py-2.5">
          <h4 className="font-semibold text-foreground">진행 상태</h4>
        </div>
        <div className="px-4 py-5">
          <div className="relative max-w-md">
            {/* 배경 라인 */}
            <div className="absolute left-0 right-0 top-5 h-0.5 bg-gray-200" />
            {/* 진행 라인 */}
            <div 
              className="absolute left-0 top-5 h-0.5 bg-primary transition-all duration-500" 
              style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
            />
            
            <ol className="relative flex justify-between">
              {(["접수완료", "진행중", "심사완료"] as AdminStatus[]).map((status, idx) => {
                const config = adminStatusConfig[status];
                const stepNum = idx + 1;
                const isCompleted = stepNum < currentStep;
                const isCurrent = stepNum === currentStep;
                const Icon = config.icon;

                return (
                  <li key={status} className="flex flex-col items-center">
                    <span className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                      isCurrent 
                        ? "border-primary bg-primary text-white" 
                        : isCompleted 
                          ? "border-primary bg-primary text-white"
                          : "border-gray-300 bg-white text-gray-400"
                    }`}>
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </span>
                    <span className={`mt-3 text-sm font-medium ${
                      isCurrent ? "text-primary" : isCompleted ? "text-foreground" : "text-gray-400"
                    }`}>
                      {config.label}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>

      {/* 처리 완료 시 결과 표시 */}
      {application.adminStatus === "심사완료" && application.finalJudgment && (
        <div className="overflow-hidden rounded-lg border border-border">
          <div className="border-b border-border bg-muted/50 px-4 py-2.5">
            <h4 className="font-semibold text-foreground">심사 결과</h4>
          </div>
          <div className="flex">
            <div className="flex w-28 shrink-0 items-center bg-muted/30 px-4 py-4">
              <span className="text-sm font-medium">최종 판정</span>
            </div>
            <div className="flex flex-1 items-center gap-3 px-4 py-4">
              {application.finalJudgment === "매수" && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
              {application.finalJudgment === "기각" && <AlertTriangle className="h-5 w-5 text-red-600" />}
              {application.finalJudgment === "심의위원회이관" && <Info className="h-5 w-5 text-amber-600" />}
              <span className={`font-bold ${
                application.finalJudgment === "매수" ? "text-emerald-700" : 
                application.finalJudgment === "기각" ? "text-red-700" : "text-amber-700"
              }`}>{application.finalJudgment}</span>
            </div>
          </div>
          {application.reviewerComment && (
            <div className="flex border-t border-border">
              <div className="flex w-28 shrink-0 bg-muted/30 px-4 py-3">
                <span className="text-sm font-medium">심사 의견</span>
              </div>
              <div className="flex flex-1 px-4 py-3">
                <p className="text-sm text-muted-foreground">{application.reviewerComment}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 토지 정보 요약 - 셀렉트박스로 필지 선택 */}
      <LandInfoSection application={application} />

      {/* AI 판단 근거 표시 */}
      {application.aiResult?.judgmentRationale && (
        <StatusRationaleSection 
          rationale={application.aiResult.judgmentRationale} 
          provisionalJudgment={application.aiResult.provisionalJudgment}
        />
      )}
    </div>
  );
}

export function ApplicationStatusSection() {
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  // 현재 로그인한 사용자의 신청 목록 (실제로는 사용자 ID로 필터링)
  const myApplications = dummyApplications;

  // 첫 번째 신청이 있으면 기본 선택
  const displayedApplication = selectedApplication || (myApplications.length > 0 ? myApplications[0] : null);

  return (
    <div>
      {/* 2-column 레이아웃: 왼쪽 리스트 / 오른쪽 상세 */}
      <div className="grid grid-cols-[320px_1fr] gap-4">
        {/* 왼쪽: 신청 목록 - 고용24 스타일 */}
        <div className="flex h-full max-h-[calc(100vh-200px)] flex-col overflow-hidden rounded-lg border border-border">
          <div className="flex shrink-0 items-center justify-between border-b border-border bg-muted/50 px-4 py-2.5">
            <h3 className="font-semibold text-foreground">신청 목록</h3>
            <span className="text-sm text-muted-foreground">{myApplications.length}건</span>
          </div>
          
          {myApplications.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
              <FileText className="h-10 w-10 text-muted-foreground" />
              <p className="mt-4 text-sm font-medium text-foreground">신청 내역이 없습니다</p>
              <p className="mt-1 text-xs text-muted-foreground">
                신규 신청 탭에서 잔여지 매수를 신청해 주세요.
              </p>
            </div>
          ) : (
            <ul className="flex-1 divide-y divide-border overflow-y-auto">
              {myApplications.map((app) => {
                const statusConfig = adminStatusConfig[app.adminStatus];
                const isSelected = displayedApplication?.id === app.id;
                const isMultipleLands = app.additionalLands && app.additionalLands.length > 0;

                return (
                  <li key={app.id}>
                    <button
                      onClick={() => setSelectedApplication(app)}
                      className={`group w-full px-4 py-3 text-left transition-all ${
                        isSelected 
                          ? "border-l-2 border-l-primary bg-primary/5" 
                          : "hover:bg-muted/50"
                      }`}
                    >
                      {/* 상단: 상태 + 접수번호 */}
                      <div className="flex items-center gap-2">
                        <Badge variant={statusConfig.variant} className="text-xs">
                          {statusConfig.label}
                        </Badge>
                        <span className={`text-sm font-semibold ${isSelected ? "text-primary" : "text-foreground"}`}>
                          {app.applicationNumber}
                        </span>
                      </div>

                      {/* 주소 */}
                      <p className="mt-1.5 truncate text-xs text-muted-foreground">
                        {app.landInfo.address}
                        {isMultipleLands && (
                          <span className="ml-1 font-medium text-violet-600">외 {app.additionalLands.length}필지</span>
                        )}
                      </p>

                      {/* 하단: 날짜 + 결과 */}
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{app.appliedAt}</span>
                        {app.adminStatus === "심사완료" && app.finalJudgment && (
                          <span className={`text-xs font-medium ${
                            app.finalJudgment === "매수" 
                              ? "text-emerald-600" 
                              : app.finalJudgment === "기각"
                                ? "text-red-600"
                                : "text-amber-600"
                          }`}>
                            {app.finalJudgment}
                          </span>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* 오른쪽: 신청 상세 정보 */}
        {displayedApplication ? (
          <ApplicationDetailPanel application={displayedApplication} />
        ) : (
          <div className="overflow-hidden rounded-lg border border-border">
            <div className="border-b border-border bg-muted/50 px-4 py-2.5">
              <h4 className="font-semibold text-foreground">상세 정보</h4>
            </div>
            <div className="flex h-48 items-center justify-center">
              <div className="text-center">
                <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">신청 내역을 선택해주세요</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
