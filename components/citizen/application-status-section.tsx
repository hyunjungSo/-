"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { dummyApplications } from "@/lib/dummy-data";
import type { Application, AdminStatus } from "@/lib/types";
import { 
  Search, 
  Clock, 
  Loader2, 
  CheckCircle2, 
  FileText, 
  MapPin,
  User,
  Calendar,
  ChevronRight,
  Scale,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Info
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

import type { JudgmentRationale } from "@/lib/types";

const adminStatusConfig: Record<AdminStatus, { label: string; icon: typeof Clock; color: string; bgColor: string }> = {
  대기: { label: "대기", icon: Clock, color: "text-gray-600", bgColor: "bg-gray-100" },
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
            <Scale className="mt-0.5 h-4 w-4 shrink-0 text-chart-3" />
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
          <div className="rounded-lg border border-warning/50 bg-warning/5 p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
              <div>
                <h4 className="text-sm font-semibold text-foreground">수동 확인 항목</h4>
                <ul className="mt-1 space-y-0.5">
                  {rationale.manualCheckItems.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-1 text-xs text-muted-foreground">
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

export function ApplicationStatusSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<Application | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setNotFound(false);

    setTimeout(() => {
      const found = dummyApplications.find(
        (app) =>
          app.applicationNumber.includes(searchQuery) ||
          app.applicantContact.includes(searchQuery)
      );
      setSearchResult(found || null);
      setNotFound(!found);
      setIsSearching(false);
    }, 500);
  };

  const getStatusStep = (status: AdminStatus) => {
    switch (status) {
      case "대기": return 1;
      case "진행중": return 2;
      case "완료": return 3;
      default: return 1;
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* 검색 영역 */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            신청 현황 조회
          </CardTitle>
          <CardDescription>
            접수번호 또는 연락처를 입력하여 신청 현황을 확인하세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status-search">접수번호 또는 연락처</Label>
            <div className="flex gap-2">
              <Input
                id="status-search"
                placeholder="예: 2026-0401-001 또는 010-1234-5678"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setNotFound(false);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className={notFound ? "border-destructive" : ""}
              />
              <Button
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                className="cursor-pointer px-6"
              >
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "조회"}
              </Button>
            </div>
          </div>

          {notFound && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              검색 결과가 없습니다. 접수번호 또는 연락처를 확인해 주세요.
            </div>
          )}

          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs font-medium text-foreground">테스트용 데이터</p>
            <p className="mt-1 text-xs text-muted-foreground">
              접수번호: 2026-0401-001, 2026-0402-001, 2026-0403-001, 2026-0404-001
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 결과 영역 */}
      <Card className={`border-2 transition-all ${searchResult ? "border-primary/20" : "border-dashed border-muted-foreground/20"}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            조회 결과
          </CardTitle>
          <CardDescription>
            {searchResult ? "신청 내역과 진행 상황을 확인하세요." : "접수번호 또는 연락처로 조회하세요."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {searchResult ? (
            <div className="space-y-4">
              {/* 진행 상황 타임라인 */}
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <h4 className="mb-4 text-sm font-semibold text-foreground">진행 상황</h4>
                <div className="flex items-center justify-between">
                  {(["대기", "진행중", "완료"] as AdminStatus[]).map((status, idx) => {
                    const config = adminStatusConfig[status];
                    const Icon = config.icon;
                    const currentStep = getStatusStep(searchResult.adminStatus);
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

              {/* 현재 상태 배지 */}
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <span className="text-sm text-muted-foreground">현재 상태</span>
                <Badge className={`${adminStatusConfig[searchResult.adminStatus].bgColor} ${adminStatusConfig[searchResult.adminStatus].color}`}>
                  {(() => {
                    const config = adminStatusConfig[searchResult.adminStatus];
                    const Icon = config.icon;
                    return (
                      <>
                        <Icon className={`mr-1 h-3 w-3 ${searchResult.adminStatus === "진행중" ? "animate-spin" : ""}`} />
                        {config.label}
                      </>
                    );
                  })()}
                </Badge>
              </div>

              {/* 신청 정보 */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>접수번호:</span>
                  <span className="font-medium text-foreground">{searchResult.applicationNumber}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>신청일:</span>
                  <span className="font-medium text-foreground">{searchResult.appliedAt}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>대상 토지:</span>
                  <span className="font-medium text-foreground">{searchResult.landInfo.address}</span>
                </div>
                {searchResult.adminName && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>담당자:</span>
                    <span className="font-medium text-foreground">{searchResult.adminName}</span>
                  </div>
                )}
                {searchResult.statusUpdatedAt && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>최근 업데이트:</span>
                    <span className="font-medium text-foreground">{searchResult.statusUpdatedAt}</span>
                  </div>
                )}
              </div>

              {/* 처리 완료 시 결과 표시 */}
              {searchResult.adminStatus === "완료" && searchResult.finalJudgment && (
                <div className={`rounded-lg border-2 p-4 ${
                  searchResult.finalJudgment === "매수" 
                    ? "border-primary bg-primary/5" 
                    : searchResult.finalJudgment === "기각"
                      ? "border-destructive bg-destructive/5"
                      : "border-warning bg-warning/10"
                }`}>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`h-5 w-5 ${
                      searchResult.finalJudgment === "매수" ? "text-primary" : 
                      searchResult.finalJudgment === "기각" ? "text-destructive" : "text-warning"
                    }`} />
                    <span className="font-semibold">최종 결과: {searchResult.finalJudgment}</span>
                  </div>
                  {searchResult.reviewerComment && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {searchResult.reviewerComment}
                    </p>
                  )}
                </div>
              )}

              {/* AI 판단 근거 표시 */}
              {searchResult.aiResult?.judgmentRationale && (
                <StatusRationaleSection rationale={searchResult.aiResult.judgmentRationale} />
              )}

              {/* 토지 정보 요약 */}
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <h4 className="mb-2 text-sm font-semibold text-foreground">토지 정보</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">토지 유형</span>
                    <span className="font-medium">{searchResult.landInfo.landType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">잔여 면적</span>
                    <span className="font-medium text-primary">{searchResult.landInfo.remainingArea.toLocaleString()}m²</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">잔여 비율</span>
                    <span className="font-medium">{searchResult.landInfo.remainingRatio}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">AI 판정</span>
                    <span className={`font-medium ${
                      searchResult.aiResult?.provisionalJudgment === "매수" ? "text-primary" : "text-muted-foreground"
                    }`}>
                      {searchResult.aiResult?.provisionalJudgment || "-"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-[300px] flex-col items-center justify-center text-center">
              <div className="rounded-full bg-muted p-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="mt-4 font-medium text-foreground">신청 현황을 조회하세요</p>
              <p className="mt-1 text-sm text-muted-foreground">
                접수번호 또는 연락처를 입력하면 진행 상황을 확인할 수 있습니다.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
