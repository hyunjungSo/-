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
  Layers,
  CheckCircle2,
  AlertTriangle,
  Info,
  Link2,
  User,
  MapPinned
} from "lucide-react";
import { AdminStatusBadge, adminStatusConfig } from "@/components/ui/status-badge";

// 일단지 판정 정보 섹션 컴포넌트
function UnifiedParcelSection({ application }: { application: Application }) {
  const isMultipleLands = application.additionalLands && application.additionalLands.length > 0;
  const unifiedAnalysis = application.aiResult?.unifiedParcelAnalysis;
  const conditions = application.unifiedParcelCondition || unifiedAnalysis?.conditions;
  
  // 복수 필지가 아니면 표시 안함
  if (!isMultipleLands) return null;
  
  const allLands = [application.landInfo, ...(application.additionalLands || [])];
  const totalArea = allLands.reduce((sum, land) => sum + land.remainingArea, 0);
  
  return (
    <div className="overflow-hidden rounded-lg border border-emerald-200 bg-emerald-50/30">
      <div className="flex items-center justify-between border-b border-emerald-200 bg-emerald-100/50 px-4 py-2.5">
        <h4 className="flex items-center gap-2 font-semibold text-emerald-800">
          <Link2 className="h-4 w-4" />
          일단지 판정 정보
        </h4>
        {unifiedAnalysis?.isUnifiedParcel && (
          <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white">
            일단지 인정
          </Badge>
        )}
      </div>
      
      {/* 일단지 판정 조건 */}
      <div className="p-4 space-y-3">
        {/* 판정 조건 체크리스트 */}
        <div className="grid gap-2 sm:grid-cols-3">
          <div className={`flex items-center gap-2 rounded-lg border p-3 ${
            conditions?.sameOwner ? "border-emerald-200 bg-emerald-50" : "border-border bg-muted/30"
          }`}>
            <User className={`h-4 w-4 ${conditions?.sameOwner ? "text-emerald-600" : "text-muted-foreground"}`} />
            <div>
              <p className="text-xs text-muted-foreground">소유자 동일성</p>
              <p className={`text-sm font-medium ${conditions?.sameOwner ? "text-emerald-700" : "text-muted-foreground"}`}>
                {conditions?.sameOwner ? "충족" : "미확인"}
              </p>
            </div>
          </div>
          
          <div className={`flex items-center gap-2 rounded-lg border p-3 ${
            conditions?.continuous ? "border-emerald-200 bg-emerald-50" : "border-border bg-muted/30"
          }`}>
            <MapPinned className={`h-4 w-4 ${conditions?.continuous ? "text-emerald-600" : "text-muted-foreground"}`} />
            <div>
              <p className="text-xs text-muted-foreground">지반 연속성</p>
              <p className={`text-sm font-medium ${conditions?.continuous ? "text-emerald-700" : "text-muted-foreground"}`}>
                {conditions?.continuous ? "충족" : "미확인"}
              </p>
            </div>
          </div>
          
          <div className={`flex items-center gap-2 rounded-lg border p-3 ${
            conditions?.sameUsage ? "border-emerald-200 bg-emerald-50" : "border-border bg-muted/30"
          }`}>
            <Layers className={`h-4 w-4 ${conditions?.sameUsage ? "text-emerald-600" : "text-muted-foreground"}`} />
            <div>
              <p className="text-xs text-muted-foreground">용도 일체성</p>
              <p className={`text-sm font-medium ${conditions?.sameUsage ? "text-emerald-700" : "text-muted-foreground"}`}>
                {conditions?.sameUsage ? "충족" : "미확인"}
              </p>
            </div>
          </div>
        </div>
        
        {/* 합산 면적 정보 */}
        <div className="flex items-center justify-between rounded-lg bg-emerald-100/50 px-4 py-3">
          <div>
            <p className="text-sm text-emerald-700">총 {allLands.length}필지 합산 면적</p>
            {unifiedAnalysis?.explanation && (
              <p className="mt-1 text-xs text-emerald-600">{unifiedAnalysis.explanation}</p>
            )}
          </div>
          <span className="text-lg font-bold text-emerald-800">
            {(unifiedAnalysis?.combinedArea || totalArea).toLocaleString()}m²
          </span>
        </div>
        
        {/* 일단지 미인정 시 안내 */}
        {unifiedAnalysis && !unifiedAnalysis.isUnifiedParcel && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p className="text-sm text-amber-800">
              <AlertTriangle className="mr-1.5 inline-block h-4 w-4" />
              일단지 조건 미충족으로 개별 필지로 심사됩니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// 토지 정보 섹션 컴포넌트 (고용24 스타일 테이블 형태)
function LandInfoSection({ application }: { application: Application }) {
  const isMultipleLands = application.additionalLands && application.additionalLands.length > 0;
  const allLands = isMultipleLands 
    ? [application.landInfo, ...application.additionalLands] 
    : [application.landInfo];
  
  const [selectedLandIndex, setSelectedLandIndex] = useState(0);
  const selectedLand = allLands[selectedLandIndex];
  
  // 필지별 판정 결과 가져오기
  const landJudgment = application.aiResult?.landJudgments?.find(
    j => j.landId === selectedLand.id
  );

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
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
                {allLands.map((land, index) => {
                  const judgment = application.aiResult?.landJudgments?.find(j => j.landId === land.id);
                  return (
                    <SelectItem key={land.id} value={index.toString()}>
                      <span className="flex items-center gap-2">
                        필지 {index + 1} - {land.address.split(" ").slice(-2).join(" ")} ({land.remainingArea.toLocaleString()}m²)
                        {judgment && (
                          <Badge 
                            variant={judgment.judgment === "매수" ? "default" : "secondary"} 
                            className="ml-1 text-xs"
                          >
                            {judgment.judgment}
                          </Badge>
                        )}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
      
      {/* 필지 주소 행 */}
      <div className="flex border-b border-border">
        <div className="flex w-28 shrink-0 items-center bg-muted/30 px-4 py-3">
          <span className="text-sm font-medium">필지 주소</span>
        </div>
        <div className="flex flex-1 items-center px-4 py-3">
          <span className="text-sm">{selectedLand.address}</span>
        </div>
      </div>
      
      {/* 토지 유형 행 */}
      <div className="flex border-b border-border">
        <div className="flex w-28 shrink-0 items-center bg-muted/30 px-4 py-3">
          <span className="text-sm font-medium">토지 유형</span>
        </div>
        <div className="flex flex-1 items-center px-4 py-3">
          <span className="text-sm">{selectedLand.landType}</span>
        </div>
      </div>
      
      {/* 잔여 면적 행 */}
      <div className="flex border-b border-border">
        <div className="flex w-28 shrink-0 items-center bg-muted/30 px-4 py-3">
          <span className="text-sm font-medium">잔여 면적</span>
        </div>
        <div className="flex flex-1 items-center px-4 py-3">
          <span className="font-medium text-primary">{selectedLand.remainingArea.toLocaleString()}m²</span>
          <span className="ml-2 text-sm text-muted-foreground">(잔여 비율 {selectedLand.remainingRatio}%)</span>
        </div>
      </div>
      
      {/* 필지별 판정 결과 행 (있는 경우) */}
      {landJudgment && (
        <div className="flex">
          <div className="flex w-28 shrink-0 items-center bg-muted/30 px-4 py-3">
            <span className="text-sm font-medium">AI 판정</span>
          </div>
          <div className="flex flex-1 items-center gap-2 px-4 py-3">
            <Badge 
              className={
                landJudgment.judgment === "매수" 
                  ? "bg-emerald-600 hover:bg-emerald-600" 
                  : landJudgment.judgment === "미해당"
                    ? "bg-amber-500 hover:bg-amber-500"
                    : "bg-red-500 hover:bg-red-500"
              }
            >
              {landJudgment.judgment}
            </Badge>
            {landJudgment.unifiedGroupId && (
              <span className="text-xs text-emerald-600">일단지 포함</span>
            )}
            {landJudgment.reason && (
              <span className="text-xs text-muted-foreground">{landJudgment.reason}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// RationaleCard 컴포넌트를 import해서 사용
import { RationaleCard } from "@/components/ui/rationale-card";

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
        <div className="flex border-b border-border">
          <div className="flex w-28 shrink-0 items-center bg-muted/30 px-4 py-3">
            <span className="text-sm font-medium">신청일</span>
          </div>
          <div className="flex flex-1 items-center px-4 py-3">
            <span className="text-sm">{application.appliedAt}</span>
          </div>
        </div>
        
        {/* AI 판정 행 */}
        {application.aiResult?.provisionalJudgment && (
          <div className="flex">
            <div className="flex w-28 shrink-0 items-center bg-muted/30 px-4 py-3">
              <span className="text-sm font-medium">AI 판정</span>
            </div>
            <div className="flex flex-1 items-center gap-2 px-4 py-3">
              <span className={`text-sm font-medium ${
                application.aiResult.provisionalJudgment === "매수" 
                  ? "text-primary" 
                  : "text-destructive"
              }`}>
                {application.aiResult.provisionalJudgment}
              </span>
              {application.aiResult.judgmentRationale && (
                <RationaleCard 
                  rationale={application.aiResult.judgmentRationale} 
                  provisionalJudgment={application.aiResult.provisionalJudgment}
                  variant="modal-trigger"
                />
              )}
            </div>
          </div>
        )}
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

{/* 일단지 판정 정보 (복수 필지인 경우) */}
      <UnifiedParcelSection application={application} />
      
      {/* 토지 정보 요약 - 셀렉트박스로 필지 선택 */}
      <LandInfoSection application={application} />
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
