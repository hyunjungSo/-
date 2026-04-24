"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { dummyApplications } from "@/lib/dummy-data";
import type { Application, AdminStatus } from "@/lib/types";
import { 
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
import { AdminStatusBadge, adminStatusConfig } from "@/components/ui/status-badge";

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

// 신청 현황용 판단 근거 컴포넌트 (land-search-section과 동일한 스타일)
function StatusRationaleSection({ rationale, provisionalJudgment }: { rationale: JudgmentRationale; provisionalJudgment?: "매수" | "매수불가" }) {
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
              <p className="mt-1 text-base text-muted-foreground">{rationale.summary}</p>
            </div>
          </div>
        </div>

        {/* 법적 근거 */}
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <div className="flex items-start gap-2">
            <Scale className="mt-0.5 h-5 w-5 shrink-0 text-chart-3" />
            <div>
              <h4 className="font-semibold text-foreground">법적 근거</h4>
              <p className="mt-1 text-base text-muted-foreground">{rationale.legalBasis}</p>
            </div>
          </div>
        </div>

        {/* 적용 기준 */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h4 className="mb-2 font-semibold text-foreground">적용 기준</h4>
          <ul className="space-y-1.5">
            {rationale.appliedCriteria.map((criteria, idx) => (
              <li key={idx} className="flex items-start gap-2 text-base text-muted-foreground">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>{criteria}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 직접 확인 필요 항목 */}
        {rationale.manualCheckItems && rationale.manualCheckItems.length > 0 && (
          <div className="rounded-lg border border-warning/50 bg-warning/5 p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
              <div>
                <h4 className="font-semibold text-foreground">직접 확인 필요 항목</h4>
                <p className="mt-1 text-base text-muted-foreground">
                  다음 항목은 AI 자동 판독이 불가하여 담당자가 현장 확인 후 판단합니다.
                </p>
                <ul className="mt-2 space-y-1">
                  {rationale.manualCheckItems.map((item, idx) => (
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
            {rationale.detailedExplanation}
          </pre>
        </div>

        {/* 안내 문구 */}
        <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-base text-muted-foreground">
            본 AI 판독 결과는 참고용이며, 최종 판정은 담당자 검토 및 관련 법령에 따라 결정됩니다. 
            판단 근거에 이의가 있으시면 신청서 제출 시 의견을 기재해 주시기 바랍니다.
          </p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// 상세 정보 패널 컴포넌트 (고용24 스타일)
function ApplicationDetailPanel({ application }: { application: Application }) {
  return (
    <div className="space-y-4 overflow-visible">
      {/* 신청 정보 테이블 */}
      <div className="overflow-hidden rounded-lg border border-border">
        <div className="border-b border-border bg-muted/50 px-4 py-2.5">
          <h4 className="font-semibold text-foreground">신청 정보</h4>
        </div>
        
        {/* 접수번호 행 */}
        <div className="flex border-b border-border">
          <div className="flex w-28 shrink-0 items-center bg-muted/30 px-4 py-3">
            <span className="text-sm font-medium">접수번호</span>
          </div>
          <div className="flex flex-1 items-center gap-2 px-4 py-3">
            <Badge variant={adminStatusConfig[application.adminStatus].variant}>
              {adminStatusConfig[application.adminStatus].label}
            </Badge>
            <span className="font-semibold text-foreground">{application.applicationNumber}</span>
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
            <ul className="flex-1 divide-y divide-border overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent">
              {myApplications.map((app) => {
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
                        <AdminStatusBadge status={app.adminStatus} size="sm" />
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
