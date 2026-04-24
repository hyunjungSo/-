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
import { Search, ChevronRight, Users, Clock, PlayCircle, CheckCircle2, Layers, TrendingUp, AlertCircle, Brain, FileCheck } from "lucide-react";
import { AdminStatusBadge, ProcessStatusBadge, adminStatusConfig } from "@/components/ui/status-badge";
import { Progress } from "@/components/ui/progress";

interface ApplicationListProps {
  applications: Application[];
  onSelect: (application: Application) => void;
}

export function ApplicationList({ applications, onSelect }: ApplicationListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AdminStatus | "all">("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const filteredApplications = useMemo(() => {
    return applications
      .filter((app) => {
        const matchesSearch =
          app.applicationNumber.includes(searchQuery) ||
          app.applicantName.includes(searchQuery) ||
          app.landInfo.address.includes(searchQuery);
        const matchesStatus = statusFilter === "all" || app.adminStatus === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const dateA = new Date(a.appliedAt).getTime();
        const dateB = new Date(b.appliedAt).getTime();
        return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
      });
  }, [applications, searchQuery, statusFilter, sortOrder]);

  // 상태별 통계
  const stats = useMemo(() => {
    const total = applications.length;
    const 접수완료 = applications.filter((a) => a.adminStatus === "접수완료").length;
    const 진행중 = applications.filter((a) => a.adminStatus === "진행중").length;
    const 심사완료 = applications.filter((a) => a.adminStatus === "심사완료").length;
    
    // AI 판정 통계
    const aiAnalyzed = applications.filter((a) => a.aiResult).length;
    const aiPurchase = applications.filter((a) => a.aiResult?.provisionalJudgment === "매수").length;
    const aiReject = applications.filter((a) => a.aiResult?.provisionalJudgment === "매수불가").length;
    
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
                  <Clock className="h-4 w-4 text-amber-700" />
                </div>
                <span className="mt-2 text-xl font-bold text-amber-700">{stats.접수완료}</span>
                <span className="text-xs text-muted-foreground">접수완료</span>
              </div>
              <div className="flex flex-col items-center rounded-lg bg-sky-50 p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100">
                  <PlayCircle className="h-4 w-4 text-sky-700" />
                </div>
                <span className="mt-2 text-xl font-bold text-sky-700">{stats.진행중}</span>
                <span className="text-xs text-muted-foreground">진행중</span>
              </div>
              <div className="flex flex-col items-center rounded-lg bg-emerald-50 p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                  <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                </div>
                <span className="mt-2 text-xl font-bold text-emerald-700">{stats.심사완료}</span>
                <span className="text-xs text-muted-foreground">심사완료</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI 분석 현황 카드 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Brain className="h-4 w-4 text-primary" />
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
              <div className="flex items-center justify-between rounded-md bg-emerald-50 px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-sm">매수 판정</span>
                </div>
                <span className="font-semibold text-emerald-700">{stats.aiPurchase}건</span>
              </div>
              <div className="flex items-center justify-between rounded-md bg-red-50 px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <span className="text-sm">매수불가 판정</span>
                </div>
                <span className="font-semibold text-red-700">{stats.aiReject}건</span>
              </div>
            </div>

            {/* AI 분석률 */}
            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">AI 분석 완료율</span>
                <span className="font-medium">{stats.total > 0 ? Math.round((stats.aiAnalyzed / stats.total) * 100) : 0}%</span>
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
          {/* KRDS 필터 및 검색 */}
          <div className="mb-6 rounded-lg border border-border bg-secondary/30 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              {/* 검색 입력 */}
              <div className="flex flex-1 flex-col gap-2">
                <label className="text-sm font-medium text-foreground">검색</label>
                <div className="relative">
                  <Input
                    placeholder="접수번호, 신청인명, 지번으로 검색"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                  />
                  <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
              
              {/* 처리상태 필터 */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">처리상태</label>
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as AdminStatus | "all")}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="전체" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 민원</SelectItem>
                    <SelectItem value="접수완료">접수완료</SelectItem>
                    <SelectItem value="진행중">진행중</SelectItem>
                    <SelectItem value="심사완료">심사완료</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* 정렬 버튼 */}
              <Button
                variant="outline"
                className="gap-1.5 px-4"
                onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
              >
                <span>{sortOrder === "desc" ? "↓" : "↑"}</span>
                <span>{sortOrder === "desc" ? "최신순" : "오래된순"}</span>
              </Button>
            </div>
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
                  <TableHead>토지 유형</TableHead>
                  <TableHead>면적</TableHead>
                  <TableHead>담당자</TableHead>
                  <TableHead>진행상황</TableHead>
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
                      <div className="flex items-center gap-2">
                        {app.applicationNumber}
                        {app.additionalLands && app.additionalLands.length > 0 && (
                          <span className="flex items-center gap-0.5 rounded bg-primary/10 px-1.5 py-0.5 text-base text-primary" title="복수 필지">
                            <Layers className="h-3 w-3" />
                            {app.additionalLands.length + 1}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{app.applicantName}</TableCell>
                    <TableCell>{app.appliedAt}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {app.landInfo.address}
                    </TableCell>
                    <TableCell>{app.landInfo.landType}</TableCell>
                    <TableCell>{app.landInfo.remainingArea.toLocaleString()}㎡</TableCell>
                    <TableCell>
                      <span className={app.adminName ? "text-foreground" : "text-muted-foreground"}>
                        {app.adminName || "미정"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <AdminStatusBadge status={app.adminStatus} />
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
                    <ProcessStatusBadge status={app.status} />
                    {app.additionalLands && app.additionalLands.length > 0 && (
                      <span className="flex items-center gap-0.5 rounded bg-primary/10 px-1.5 py-0.5 text-base text-primary">
                        <Layers className="h-3 w-3" />
                        복수필지
                      </span>
                    )}
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
