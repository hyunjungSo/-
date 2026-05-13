"use client";

import { useState, useMemo, useEffect, useTransition } from "react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import type { Application, AdminStatus } from "@/lib/types";
import { Search, ChevronRight, Users, Clock, PlayCircle, CheckCircle2, TrendingUp, AlertCircle, FileCheck, Layers, RefreshCw, CalendarIcon, Loader2 } from "lucide-react";
import { AdminStatusBadge, ProcessStatusBadge, adminStatusConfig } from "@/components/ui/status-badge";
import { Progress } from "@/components/ui/progress";
import { JudgmentSummaryBadge, PARCEL_COUNT_COLORS } from "@/components/ui/judgment-badge";
import { cn } from "@/lib/utils";

interface ApplicationListProps {
  applications: Application[];
  onSelect: (application: Application) => void;
}

type PeriodFilter = "year" | "today" | "week" | "month" | "custom";

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

const currentYear = new Date().getFullYear();
const availableYears = Array.from({ length: 10 }, (_, i) => currentYear - i);

export function ApplicationList({ applications, onSelect }: ApplicationListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AdminStatus | "all">("all");
  const [projectUnitFilter, setProjectUnitFilter] = useState<"all" | "gangjin-gwangju">("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("year");
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [aiMismatchFilter, setAiMismatchFilter] = useState(false);
  const [customDateRange, setCustomDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // 클라이언트 마운트 후 날짜 설정 (hydration mismatch 방지)
  useEffect(() => {
    setIsMounted(true);
    setLastUpdated(new Date());
  }, []);

  // 필터 변경 시 로딩 효과
  const handlePeriodChange = (newPeriod: PeriodFilter) => {
    setIsLoading(true);
    startTransition(() => {
      setPeriodFilter(newPeriod);
      setTimeout(() => setIsLoading(false), 300);
    });
  };

  // 현재 조회 기간 계산
  const currentDateRange = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (periodFilter) {
      case "year": {
        const yearStart = new Date(selectedYear, 0, 1);
        const yearEnd = new Date(selectedYear, 11, 31);
        return { from: yearStart, to: yearEnd };
      }
      case "today":
        return { from: today, to: today };
      case "week": {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return { from: weekAgo, to: today };
      }
      case "month": {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return { from: monthStart, to: today };
      }
      case "custom":
        return customDateRange;
      default:
        return { from: undefined, to: undefined };
    }
  }, [periodFilter, customDateRange, selectedYear]);

  // 조회 기간 텍스트
  const dateRangeText = useMemo(() => {
    if (!currentDateRange.from) return "전체 기간";
    
    const formatDate = (date: Date) => {
      return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    };
    
    if (periodFilter === "year") {
      return `${selectedYear}년 (${selectedYear}.01.01 ~ ${selectedYear}.12.31)`;
    }
    
    if (periodFilter === "today") {
      return formatDate(currentDateRange.from);
    }
    
    if (currentDateRange.to && currentDateRange.from.getTime() !== currentDateRange.to.getTime()) {
      return `${formatDate(currentDateRange.from)} ~ ${formatDate(currentDateRange.to)}`;
    }
    
    return formatDate(currentDateRange.from);
  }, [periodFilter, currentDateRange, selectedYear]);

  // 기간 필터링된 데이터
  const periodFilteredApplications = useMemo(() => {
    if (periodFilter === "all") return applications;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return applications.filter((app) => {
      const appDate = new Date(app.appliedAt);
      
      switch (periodFilter) {
        case "year": {
          const yearStart = new Date(selectedYear, 0, 1);
          const yearEnd = new Date(selectedYear, 11, 31, 23, 59, 59, 999);
          return appDate >= yearStart && appDate <= yearEnd;
        }
        case "today":
          return appDate >= today && appDate < tomorrow;
        case "week": {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return appDate >= weekAgo && appDate < tomorrow;
        }
        case "month": {
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          return appDate >= monthStart && appDate < tomorrow;
        }
        case "custom": {
          if (!customDateRange.from) return true;
          const fromDate = new Date(customDateRange.from);
          fromDate.setHours(0, 0, 0, 0);
          if (customDateRange.to) {
            const toDate = new Date(customDateRange.to);
            toDate.setHours(23, 59, 59, 999);
            return appDate >= fromDate && appDate <= toDate;
          }
          return appDate >= fromDate;
        }
        default:
          return true;
      }
    });
  }, [applications, periodFilter, customDateRange, selectedYear]);

  // 전일 대비 증감 계산
  const dailyChanges = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    const todayNew = periodFilteredApplications.filter((a) => a.appliedAt === today).length;
    const yesterdayNew = periodFilteredApplications.filter((a) => a.appliedAt === yesterday).length;
    
    const todayReceived = periodFilteredApplications.filter((a) => a.appliedAt === today && a.adminStatus === "접수완료").length;
    const todayInProgress = periodFilteredApplications.filter((a) => a.appliedAt === today && a.adminStatus === "진행중").length;
    const todayCompleted = periodFilteredApplications.filter((a) => a.appliedAt === today && a.adminStatus === "심사완료").length;
    
    return {
      total: todayNew,
      접수완료: todayReceived,
      진행중: todayInProgress,
      심사완료: todayCompleted,
    };
  }, [periodFilteredApplications]);

  const handleRefresh = () => {
    setLastUpdated(new Date());
  };

  const filteredApplications = useMemo(() => {
    return periodFilteredApplications
      .filter((app) => {
        const matchesSearch =
          app.applicationNumber.includes(searchQuery) ||
          app.applicantName.includes(searchQuery) ||
          app.landInfo.address.includes(searchQuery);
      const matchesStatus = statusFilter === "all" || app.adminStatus === statusFilter;
      const matchesProjectUnit = projectUnitFilter === "all" || app.businessUnit === "강진광주";
      // AI 불일치 필터 (시뮬레이션: 접수번호가 특정 패턴일 때 불일치로 간주)
      const matchesAiMismatch = !aiMismatchFilter || (app.adminStatus === "심사완료" && app.applicationNumber.endsWith("2"));
      return matchesSearch && matchesStatus && matchesProjectUnit && matchesAiMismatch;
      })
      .sort((a, b) => {
        const dateA = new Date(a.appliedAt).getTime();
        const dateB = new Date(b.appliedAt).getTime();
        return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
      });
    }, [periodFilteredApplications, searchQuery, statusFilter, projectUnitFilter, sortOrder, aiMismatchFilter]);

  // 상태별 통계 (기간 필터 적용)
  const stats = useMemo(() => {
    const total = periodFilteredApplications.length;
    const 접수완료 = periodFilteredApplications.filter((a) => a.adminStatus === "접수완료").length;
    const 진행중 = periodFilteredApplications.filter((a) => a.adminStatus === "진행중").length;
    const 심사완료 = periodFilteredApplications.filter((a) => a.adminStatus === "심사완료").length;
    
    // AI 판정 통계 (수용가능/수용불가)
    const aiAnalyzed = periodFilteredApplications.filter((a) => a.aiResult).length;
    const aiPurchase = periodFilteredApplications.filter((a) => a.aiResult?.provisionalJudgment === "수용가능").length;
    const aiReject = periodFilteredApplications.filter((a) => a.aiResult?.provisionalJudgment === "수용불가").length;
    const aiTransfer = aiAnalyzed - aiPurchase - aiReject; // 이관 건수
    
    // 담당자 최종 심사 통계 (심사완료 기준)
    const finalCompleted = periodFilteredApplications.filter((a) => a.adminStatus === "심사완료");
    const finalPurchase = finalCompleted.filter((a) => a.aiResult?.provisionalJudgment === "수용가능").length;
    const finalReject = finalCompleted.filter((a) => a.aiResult?.provisionalJudgment === "수용불가").length;
    const finalTransfer = finalCompleted.length - finalPurchase - finalReject;
    
    // AI 신뢰도 계산 (AI 판정과 담당자 판정 일치율) - 90% 케이스
    // 심사완료된 건 중에서 AI 판정과 최종 결과가 일치하는 비율
    const aiMismatchCount = Math.max(1, Math.floor(finalCompleted.length * 0.10)); // 불일치 건수 (10% 불일치 = 90% 일치)
    const aiMatchCount = finalCompleted.length - aiMismatchCount; // 일치 건수
    const aiReliability = 90; // 고정 90% 신뢰도
    
    // 처리 완료율
    const completionRate = total > 0 ? Math.round((심사완료 / total) * 100) : 0;
    
    // 오늘 접수된 민원
    const today = new Date().toISOString().split('T')[0];
    const todayCount = periodFilteredApplications.filter((a) => a.appliedAt === today).length;
    
    return {
      total,
      접수완료,
      진행중,
      심사완료,
      aiAnalyzed,
      aiPurchase,
      aiReject,
      aiTransfer,
      finalPurchase,
      finalReject,
      finalTransfer,
      aiReliability,
      aiMatchCount: finalCompleted.length - aiMismatchCount,
      aiMismatchCount,
      completionRate,
      todayCount,
    };
  }, [periodFilteredApplications]);

  return (
    <div className="space-y-6">
      {/* 글로벌 필터 바 */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* 좌측: 타이틀 및 업데이트 정보 */}
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">대시보드</h2>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>업데이트: {isMounted && lastUpdated ? lastUpdated.toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '--'}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleRefresh}
                title="새로고침"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
              </Button>
            </div>
          </div>
          
          {/* 우측: 기간 필터 */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">조회 기간:</span>
            <div className="flex items-center gap-1">
              {/* 연도 피커 */}
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      "flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                      periodFilter === "year"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {selectedYear}년
                    <ChevronRight className="h-3 w-3 rotate-90" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-32 p-1" align="start">
                  <div className="max-h-48 overflow-y-auto">
                    {availableYears.map((year) => (
                      <button
                        key={year}
                        onClick={() => {
                          setSelectedYear(year);
                          handlePeriodChange("year");
                        }}
                        className={cn(
                          "w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors",
                          selectedYear === year && periodFilter === "year"
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        )}
                      >
                        {year}년
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              
              {/* 기간 버튼들 */}
              {[
                { value: "today", label: "오늘" },
                { value: "week", label: "이번 주" },
                { value: "month", label: "이번 달" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handlePeriodChange(option.value as PeriodFilter)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                    periodFilter === option.value
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {option.label}
                </button>
              ))}
              
              {/* 직접선택 */}
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                      periodFilter === "custom"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <CalendarIcon className="h-3.5 w-3.5" />
                    직접선택
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="range"
                    selected={{ from: customDateRange.from, to: customDateRange.to }}
                    onSelect={(range) => {
                      setCustomDateRange({ from: range?.from, to: range?.to });
                      if (range?.from) {
                        handlePeriodChange("custom");
                      }
                    }}
                    numberOfMonths={2}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

      {/* 현재 조회 기준 표시 */}
      <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2">
        <CalendarIcon className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-primary">현재 조회 기준: {dateRangeText}</span>
        <span className="text-xs text-muted-foreground">({periodFilteredApplications.length}건)</span>
      </div>

      {/* 로딩 오버레이 */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-3 shadow-lg">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm font-medium">데이터를 불러오는 중...</span>
          </div>
        </div>
      )}

      {/* 대시보드 요약 */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* 민원 진행 ��황 ��드 */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">민원 진행 현황</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 진행률 바 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">전체 처리 완료율</span>
                <span className="text-primary" style={{ fontSize: '20px', fontWeight: '700' }}>{stats.completionRate}%</span>
              </div>
              <Progress value={stats.completionRate} className="h-2" />
            </div>
            
            {/* 상태별 ��황 그리드 */}
            <div className="grid grid-cols-4 gap-3 pt-2">
              <div 
                onClick={() => setStatusFilter("all")}
                className="flex cursor-pointer flex-col items-center rounded-lg bg-muted/50 p-3 transition-opacity hover:opacity-80"
              >
                <span className="text-sm font-medium text-muted-foreground" style={{ order: 1 }}>전체</span>
                <div className="mt-2 flex items-baseline gap-1" style={{ order: 2 }}>
                  <span className="font-bold text-foreground" style={{ fontSize: '38px' }}>{stats.total}</span>
                  <span className="text-sm font-medium text-foreground">건</span>
                  {dailyChanges.total > 0 && (
                    <span className="rounded bg-primary/10 px-1 py-0.5 text-[10px] font-medium text-primary">+{dailyChanges.total}</span>
                  )}
                </div>
              </div>
              <div 
                onClick={() => setStatusFilter("접수완료")}
                className="relative flex cursor-pointer flex-col items-center rounded-lg bg-slate-50 p-3 transition-opacity hover:opacity-80"
              >
                {dailyChanges.접수완료 > 0 && (
                  <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white shadow-sm">
                    {dailyChanges.접수완료}
                  </div>
                )}
                <span className="text-sm font-medium text-slate-600" style={{ order: 1 }}>접수완료</span>
                <div className="mt-2 flex items-baseline gap-1" style={{ order: 2 }}>
                  <span className="font-bold text-slate-500" style={{ fontSize: '38px' }}>{stats.접수완료}</span>
                  <span className="text-sm font-medium text-slate-500">건</span>
                  {dailyChanges.접수완료 > 0 && (
                    <span className="rounded bg-amber-100 px-1 py-0.5 text-[10px] font-medium text-amber-600">+{dailyChanges.접수완료}</span>
                  )}
                </div>
              </div>
              <div 
                onClick={() => setStatusFilter("진행중")}
                className="flex cursor-pointer flex-col items-center rounded-lg bg-sky-50 p-3 transition-opacity hover:opacity-80"
              >
                <span className="text-sm font-medium text-sky-700" style={{ order: 1 }}>진행중</span>
                <div className="mt-2 flex items-baseline gap-1" style={{ order: 2 }}>
                  <span className="font-bold text-sky-500" style={{ fontSize: '38px' }}>{stats.진행중}</span>
                  <span className="text-sm font-medium text-sky-500">건</span>
                  {dailyChanges.진행중 > 0 && (
                    <span className="rounded bg-sky-100 px-1 py-0.5 text-[10px] font-medium text-sky-600">+{dailyChanges.진행중}</span>
                  )}
                </div>
              </div>
              <div 
                onClick={() => setStatusFilter("심사완료")}
                className="flex cursor-pointer flex-col items-center rounded-lg bg-slate-100 p-3 transition-opacity hover:opacity-80"
              >
                <span className="text-sm font-medium text-slate-700" style={{ order: 1 }}>심사완료</span>
                <div className="mt-2 flex items-baseline gap-1" style={{ order: 2 }}>
                  <span className="font-bold text-slate-700" style={{ fontSize: '38px' }}>{stats.심사완료}</span>
                  <span className="text-sm font-medium text-slate-700">건</span>
                  {dailyChanges.심사완료 > 0 && (
                    <span className="rounded bg-green-100 px-1 py-0.5 text-[10px] font-medium text-green-600">+{dailyChanges.심사완료}</span>
                  )}
                </div>
              </div>
            </div>
            {/* 기준 안내 문구 */}
            <p className="pt-2 text-[11px] text-muted-foreground/70">
              ※ 본 통계는 선택된 기간 내 접수된 민원을 기준으로 산출되었습니다.
            </p>
          </CardContent>
        </Card>

        {/* AI 판독 신뢰도 카드 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">AI 판독 신뢰도</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* AI 신뢰도 강조 표시 */}
            <div className="flex items-center justify-between rounded-lg bg-primary/5 px-4 py-3">
              <span className="text-sm font-medium text-muted-foreground">AI 신뢰도</span>
              <span className="text-2xl font-bold text-primary">{stats.aiReliability}%</span>
            </div>
            
            {/* 스택 바 비교 */}
            <div className="space-y-3">
              {/* AI 초기 판정 막대 */}
              <div className="space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">AI 초기 판정</span>
                <div className="flex h-8 w-full overflow-hidden rounded-md">
                  {stats.aiAnalyzed > 0 ? (
                    <>
                      {stats.aiPurchase > 0 && (
                        <div 
                          className="flex items-center justify-center bg-emerald-500 text-xs font-semibold text-white"
                          style={{ width: `${(stats.aiPurchase / stats.aiAnalyzed) * 100}%` }}
                        >
                          {stats.aiPurchase}건
                        </div>
                      )}
                      {stats.aiReject > 0 && (
                        <div 
                          className="flex items-center justify-center bg-rose-500 text-xs font-semibold text-white"
                          style={{ width: `${(stats.aiReject / stats.aiAnalyzed) * 100}%` }}
                        >
                          {stats.aiReject}건
                        </div>
                      )}
                      {stats.aiTransfer > 0 && (
                        <div 
                          className="flex items-center justify-center bg-amber-500 text-xs font-semibold text-white"
                          style={{ width: `${(stats.aiTransfer / stats.aiAnalyzed) * 100}%` }}
                        >
                          {stats.aiTransfer}건
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted text-xs text-muted-foreground">
                      데이터 없음
                    </div>
                  )}
                </div>
              </div>
              
              {/* 담당자 최종 심사 막대 */}
              <div className="space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">담당자 최종 심사</span>
                <div className="flex h-8 w-full overflow-hidden rounded-md">
                  {stats.심사완료 > 0 ? (
                    <>
                      {stats.finalPurchase > 0 && (
                        <div 
                          className="flex items-center justify-center bg-emerald-500 text-xs font-semibold text-white"
                          style={{ width: `${(stats.finalPurchase / stats.심사완료) * 100}%` }}
                        >
                          {stats.finalPurchase}건
                        </div>
                      )}
                      {stats.finalReject > 0 && (
                        <div 
                          className="flex items-center justify-center bg-rose-500 text-xs font-semibold text-white"
                          style={{ width: `${(stats.finalReject / stats.심사완료) * 100}%` }}
                        >
                          {stats.finalReject}건
                        </div>
                      )}
                      {stats.finalTransfer > 0 && (
                        <div 
                          className="flex items-center justify-center bg-amber-500 text-xs font-semibold text-white"
                          style={{ width: `${(stats.finalTransfer / stats.심사완료) * 100}%` }}
                        >
                          {stats.finalTransfer}건
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted text-xs text-muted-foreground">
                      데이터 없음
                    </div>
                  )}
                </div>
              </div>
              
              {/* 범례 */}
              <div className="flex items-center justify-center gap-4 pt-1">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                  <span className="text-xs text-muted-foreground">매수</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-sm bg-rose-500" />
                  <span className="text-xs text-muted-foreground">기각</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-sm bg-amber-500" />
                  <span className="text-xs text-muted-foreground">이관</span>
                </div>
              </div>
            </div>
            
            {/* 상세 지표 */}
            <div className="flex items-center justify-between border-t pt-3">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-sm text-muted-foreground">판정 일치:</span>
                <span className="font-semibold">{stats.aiMatchCount}건</span>
              </div>
              <button
                onClick={() => setAiMismatchFilter(!aiMismatchFilter)}
                className={`flex items-center gap-1 rounded-md px-2 py-1 text-sm transition-colors ${
                  aiMismatchFilter 
                    ? "bg-rose-100 text-rose-700" 
                    : "text-rose-600 hover:bg-rose-50"
                }`}
              >
                <AlertCircle className="h-4 w-4" />
                <span className="underline-offset-2 hover:underline">판정 수정:</span>
                <span className="font-semibold">{stats.aiMismatchCount}건</span>
              </button>
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
                <SelectItem value="all">전체 상황</SelectItem>
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
                  <TableHead>사업단</TableHead>
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
                    <TableCell style={{ width: "220px" }}>
                      <div className="flex items-center gap-2">
                        <span>{app.landInfo.address}</span>
                        {(app.additionalLands?.length || 0) >= 1 && (
                          <span className={`inline-flex items-center gap-1 whitespace-nowrap ${PARCEL_COUNT_COLORS.text}`}>
                            <Layers className="h-4 w-4" />
                            <span className="text-sm font-medium">{(app.additionalLands?.length || 0) + 1}</span>
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={app.businessUnit ? "text-foreground" : "text-muted-foreground"}>
                        {app.businessUnit || "-"}
                      </span>
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
                      <JudgmentSummaryBadge 
                        lands={[app.landInfo, ...(app.additionalLands || [])]} 
                      />
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
