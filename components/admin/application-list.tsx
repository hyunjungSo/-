"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Application, AdminStatus } from "@/lib/types";
import { Search, ChevronRight, Users, Clock, PlayCircle, CheckCircle2, TrendingUp, AlertCircle, FileCheck, Layers } from "lucide-react";
import { AdminStatusBadge, ProcessStatusBadge, adminStatusConfig } from "@/components/ui/status-badge";
import { Progress } from "@/components/ui/progress";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";

interface ApplicationListProps {
  applications: Application[];
  onSelect: (application: Application) => void;
}

export function ApplicationList({ applications, onSelect }: ApplicationListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AdminStatus | "all">("all");
  const [projectUnitFilter, setProjectUnitFilter] = useState<"all" | "gangjin-gwangju">("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const filteredApplications = useMemo(() => {
    return applications
      .filter((app) => {
        const matchesSearch =
          app.applicationNumber.includes(searchQuery) ||
          app.applicantName.includes(searchQuery) ||
          app.landInfo.address.includes(searchQuery);
      const matchesStatus = statusFilter === "all" || app.adminStatus === statusFilter;
      const matchesProjectUnit = projectUnitFilter === "all" || app.businessUnit === "강진광주";
      return matchesSearch && matchesStatus && matchesProjectUnit;
      })
      .sort((a, b) => {
        const dateA = new Date(a.appliedAt).getTime();
        const dateB = new Date(b.appliedAt).getTime();
        return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
      });
    }, [applications, searchQuery, statusFilter, projectUnitFilter, sortOrder]);

  // 상태별 통계
  const stats = useMemo(() => {
    const total = applications.length;
    const 접수완료 = applications.filter((a) => a.adminStatus === "접수완료").length;
    const 진행중 = applications.filter((a) => a.adminStatus === "진행중").length;
    const 심사완료 = applications.filter((a) => a.adminStatus === "심사완료").length;
    
    // AI 판정 통계 (수용가능/수용불가)
    const aiAnalyzed = applications.filter((a) => a.aiResult).length;
    const aiPurchase = applications.filter((a) => a.aiResult?.provisionalJudgment === "수용가능").length;
    const aiReject = applications.filter((a) => a.aiResult?.provisionalJudgment === "수용불가").length;
    
    // 처리 완료율
    const completionRate = total > 0 ? Math.round((심사완료 / total) * 100) : 0;
    
    // 오늘 접수된 민원
    const today = new Date().toISOString().split('T')[0];
    const todayCount = applications.filter((a) => a.appliedAt === today).length;
    
    return {
      total,
      접수완료,
      진행중,
      심사완료,
      aiAnalyzed,
      aiPurchase,
      aiReject,
      completionRate,
      todayCount,
    };
  }, [applications]);

  return (
    <div className="space-y-6">
      {/* 대시보드 요약 */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* 민원 진행 현황 카드 */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">민원 진행 현황</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 진행률 바 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">전체 처리 완료율</span>
                <span className="font-semibold text-primary">{stats.completionRate}%</span>
              </div>
              <Progress value={stats.completionRate} className="h-2" />
            </div>
            
            {/* 상태별 현황 그리드 */}
            <div className="grid grid-cols-4 gap-3 pt-2">
              <div className="flex flex-col items-center rounded-lg bg-muted/50 p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <span className="mt-2 text-xl font-bold text-foreground">{stats.total}</span>
                <span className="text-xs text-muted-foreground">전체</span>
              </div>
              <div className="flex flex-col items-center rounded-lg bg-amber-50 p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
                  <Clock className="h-4 w-4 text-amber-500" />
                </div>
                <span className="mt-2 text-xl font-bold text-amber-500">{stats.접수완료}</span>
                <span className="text-xs text-muted-foreground">접수완료</span>
              </div>
              <div className="flex flex-col items-center rounded-lg bg-sky-50 p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100">
                  <PlayCircle className="h-4 w-4 text-sky-700" />
                </div>
                <span className="mt-2 text-xl font-bold text-sky-700">{stats.진행중}</span>
                <span className="text-xs text-muted-foreground">진행중</span>
              </div>
              <div className="flex flex-col items-center rounded-lg bg-success/10 p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success/20">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                </div>
                <span className="mt-2 text-xl font-bold text-success">{stats.심사완료}</span>
                <span className="text-xs text-muted-foreground">심사완료</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI 분석 현황 카드 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">
              AI 분석 현황
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">분석 완료</span>
              <span className="text-lg font-semibold">{stats.aiAnalyzed}건</span>
            </div>
            
            {/* AI 판정 결과 분포 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-md bg-success/10 px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-success" />
                  <span className="text-sm">매수 판정</span>
                </div>
                <span className="font-semibold text-success">{stats.aiPurchase}건</span>
              </div>
              <div className="flex items-center justify-between rounded-md bg-destructive/10 px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-destructive" />
                  <span className="text-sm">기각 판정</span>
                </div>
                <span className="font-semibold text-destructive">{stats.aiReject}건</span>
              </div>
            </div>


          </CardContent>
        </Card>
      </div>

      {/* 민원 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>민원 목록</CardTitle>
          <CardDescription>
            접수된 잔여지 매수 신청 민원을 관리합니다. 민원을 클릭하여 상세 분석을 진행하세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 필터 및 검색 */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* 검색 입력 */}
            <div className="relative flex-1">
              <Input
                placeholder="접수번호, 신청인명, 지번으로 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
            
            {/* 사업단 필터 */}
            <Select value={projectUnitFilter} onValueChange={(value) => setProjectUnitFilter(value as "all" | "gangjin-gwangju")}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="사업단 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 사업단</SelectItem>
                <SelectItem value="gangjin-gwangju">강진광주건설 사업단</SelectItem>
              </SelectContent>
            </Select>
            
            {/* 처리상태 필터 */}
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as AdminStatus | "all")}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="처리상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 민원</SelectItem>
                <SelectItem value="접수완료">접수완료</SelectItem>
                <SelectItem value="진행중">진행중</SelectItem>
                <SelectItem value="심사완료">심사완료</SelectItem>
              </SelectContent>
            </Select>
            
            {/* 정렬 버튼 */}
            <Button
              variant="outline"
              className="gap-1.5 border-foreground bg-foreground px-4 text-background hover:bg-foreground/90 hover:text-background"
              onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
            >
              <span>{sortOrder === "desc" ? "↓" : "↑"}</span>
              <span>{sortOrder === "desc" ? "최신순" : "오래된순"}</span>
            </Button>
          </div>

          {/* 테이블 (데스크톱) */}
          <div className="hidden rounded-lg border border-border md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>접수번호</TableHead>
                  <TableHead>신청인</TableHead>
                  <TableHead>신청일</TableHead>
                  <TableHead>대상 지번</TableHead>
                  <TableHead>담당자</TableHead>
                  <TableHead>진행상황</TableHead>
                  <TableHead>심사결과</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((app) => (
                  <TableRow
                    key={app.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onSelect(app)}
                  >
                    <TableCell className="font-medium">
                      {app.applicationNumber}
                    </TableCell>
                    <TableCell>{app.applicantName}</TableCell>
                    <TableCell>{app.appliedAt}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="truncate max-w-[180px]">{app.landInfo.address}</span>
                        <span className="inline-flex items-center gap-1 text-emerald-600 whitespace-nowrap">
                          <Layers className="h-4 w-4" />
                          <span className="text-sm font-medium">{(app.additionalLands?.length || 0) + 1}</span>
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={app.adminName ? "text-foreground" : "text-muted-foreground"}>
                        {app.adminName || "미정"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <AdminStatusBadge status={app.adminStatus} />
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const allLands = [app.landInfo, ...(app.additionalLands || [])];
                        
                        // 판정 결과별 개수 세기
                        const judgments = allLands.map(land => 
                          land.remainingRatio <= 30 ? "매수대상" : 
                          land.remainingRatio <= 50 ? "검토필요" : "대상외"
                        );
                        
                        const judgmentCounts = {
                          매수대상: judgments.filter(j => j === "매수대상").length,
                          기각: judgments.filter(j => j === "기각").length,
                          이관: judgments.filter(j => j === "이관").length,
                        };
                        
                        return (
                          <HoverCard openDelay={100} closeDelay={100}>
                            <HoverCardTrigger asChild>
                              <div className="flex items-center gap-2 cursor-pointer">
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                                  매수 {judgmentCounts.매수대상}
                                </span>
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">
                                  기각 {judgmentCounts.기각}
                                </span>
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                                  이관 {judgmentCounts.이관}
                                </span>
                              </div>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-64" align="start">
                              <div className="space-y-2">
                                <p className="text-sm font-semibold">심사 결과 상세</p>
                                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                                  {allLands.map((land, idx) => {
                                    const judgment = land.remainingRatio <= 30 ? "매수대상" : 
                                                    land.remainingRatio <= 50 ? "검토필요" : "대상외";
                                    const judgmentColor = judgment === "매수대상" ? "text-blue-600" :
                                                         judgment === "검토필요" ? "text-yellow-600" : "text-gray-600";
                                    return (
                                      <div key={idx} className="text-xs">
                                        <span className="font-medium">{idx + 1}:</span>{" "}
                                        <span className="text-muted-foreground">{land.address.split(" ").slice(-2).join(" ")}</span>{" "}
                                        <span className={`font-medium ${judgmentColor}`}>({judgment})</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        );
                      })()}
                    </TableCell>
                    <TableCell>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* 카드 목록 (모바일) */}
          <div className="space-y-3 md:hidden">
            {filteredApplications.map((app) => (
              <button
                key={app.id}
                onClick={() => onSelect(app)}
                className="flex w-full items-center justify-between rounded-lg border border-border bg-card p-4 text-left transition-colors hover:bg-muted"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-foreground">
                      {app.applicationNumber}
                    </span>
                    {(() => {
                      const isMultiple = app.additionalLands && app.additionalLands.length > 0;
                      
                      if (isMultiple) {
                        return <span className="text-sm text-foreground">복수필지 ({app.additionalLands!.length + 1})</span>;
                      } else {
                        return <span className="text-sm text-foreground">단일필지</span>;
                      }
                    })()}
                    <ProcessStatusBadge status={app.status} />
                  </div>
                  <p className="text-base text-muted-foreground">
                    {app.applicantName} | {app.appliedAt}
                  </p>
                  <p className="text-base text-muted-foreground">
                    {app.landInfo.address}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
              </button>
            ))}
          </div>

          {filteredApplications.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              검색 결과가 없습니다.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
