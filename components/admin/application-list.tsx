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
import { Search, ChevronRight, Users, Clock, PlayCircle, CheckCircle2, TrendingUp, AlertCircle, FileCheck, Layers, RefreshCw, CalendarIcon, Loader2, XCircle } from "lucide-react";
import { AdminStatusBadge, ProcessStatusBadge, adminStatusConfig } from "@/components/ui/status-badge";
import { Progress } from "@/components/ui/progress";
import { JudgmentSummaryBadge, PARCEL_COUNT_COLORS } from "@/components/ui/judgment-badge";
import { PeriodFilter, type PeriodFilterType, type DateRange } from "@/components/ui/period-filter";
import { StatCard, StatCardGroup } from "@/components/ui/stat-card";
import { formatDateTime } from "@/lib/format";
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
  const [selectedYear, setSelectedYear] = useState<number | null>(currentYear);
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
  const handlePeriodChange = (newPeriod: PeriodFilter, year?: number) => {
    setIsLoading(true);
    startTransition(() => {
      setPeriodFilter(newPeriod);
      // 연도 필터가 아닌 다른 필터 선택 시 연도 초기화
      if (newPeriod !== "year") {
        setSelectedYear(null);
      } else if (year !== undefined) {
        setSelectedYear(year);
      }
      setTimeout(() => setIsLoading(false), 300);
    });
  };

  // 현재 조회 기간 계산
  const currentDateRange = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (periodFilter) {
      case "year": {
        if (selectedYear === null) return { from: undefined, to: undefined };
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
    
    if (periodFilter === "year" && selectedYear !== null) {
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
          if (selectedYear === null) return true;
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
    
    // 심사완료된 건만 기준으로 비교
    const finalCompleted = periodFilteredApplications.filter((a) => a.adminStatus === "심사완료");
    const completedCount = finalCompleted.length;
    
    // AI 초기 판정: 매수가능/매수불가 (2가지만 존재, 이관 없음)
    const aiPurchasable = Math.round(completedCount * 0.65);    // 매수가능 65%
    const aiNotPurchasable = completedCount - aiPurchasable;     // 매수불가 35%
    const aiAnalyzed = completedCount;
    
    // AI 신뢰도 계산 로직:
    // - AI(매수가능) -> 담당자(매수) = 일치
    // - AI(매수가능) -> 담당자(기각) = 불일치 (반대 결정)
    // - AI(매수가능) -> 담당자(이관) = 불일치 (판단 보류)
    // - AI(매수불가) -> 담당자(기각) = 일치
    // - AI(매수불가) -> 담당자(이관) = 불일치 (판단 보류)
    
    // 시뮬레이션: 불일치 유형 구분
    const mismatchOpposite = Math.max(1, Math.floor(completedCount * 0.05)); // 반대 결정: AI(매수가능)->담당자(기각)
    const mismatchDeferred = Math.max(1, Math.floor(completedCount * 0.05)); // 판단 보류: AI 판정과 무관하게 담당자가 이관
    const aiMismatchCount = mismatchOpposite + mismatchDeferred;
    const aiMatchCount = completedCount - aiMismatchCount;
    const aiReliability = completedCount > 0 ? Math.round((aiMatchCount / completedCount) * 100) : 0;
    
    // 담당자 최종 심사 통계: 매수/기각/이관 (3가지)
    // 전체 건수 = completedCount로 동일해야 함
    // 이관 건수 = 판단 보류 건수
    const finalTransfer = mismatchDeferred;
    // 매수 건수 = AI 매수가능 - 반대결정(기각으로 변경) - 일부 이관
    const deferredFromPurchasable = Math.floor(mismatchDeferred * 0.6); // 매수가능에서 이관된 건
    const deferredFromNotPurchasable = mismatchDeferred - deferredFromPurchasable; // 매수불가에서 이관된 건
    const finalPurchase = aiPurchasable - mismatchOpposite - deferredFromPurchasable;
    // 기각 건수 = AI 매수불가 - 이관 + 반대결정(매수가능->기각)
    const finalReject = aiNotPurchasable - deferredFromNotPurchasable + mismatchOpposite;
    // 검증: finalPurchase + finalReject + finalTransfer = completedCount
    
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
      aiPurchasable,    // AI 초기 판정: 매수가능
      aiNotPurchasable, // AI 초기 판정: 매수불가
      finalPurchase,    // 담당자 최종: 매수
      finalReject,      // 담당자 최종: 기각
      finalTransfer,    // 담당자 최종: 이관
      aiReliability,
      aiMatchCount,
      aiMismatchCount,
      mismatchOpposite, // 반대 결정 건수
      mismatchDeferred, // 판단 보류(이관) 건수
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
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">담당자 서비스</h1>
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
            <span className="text-sm font-medium text-muted-foreground">조회 기간:</span>
            <div className="flex items-center gap-1">
              {/* 연도 피커 */}
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      "flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium transition-all",
                      periodFilter === "year" && selectedYear !== null
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-muted-foreground/30 text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground"
                    )}
                  >
                    {selectedYear !== null ? `${selectedYear}년` : "년도선택"}
                    <ChevronRight className="h-3 w-3 rotate-90" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-32 p-1" align="start">
                  <div className="max-h-48 overflow-y-auto">
                    {availableYears.map((year) => (
                      <button
                        key={year}
                        onClick={() => {
                          handlePeriodChange("year", year);
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
                    "rounded-md border px-3 py-1.5 text-xs font-medium transition-all",
                    periodFilter === option.value
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-muted-foreground/30 text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground"
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
                      "flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-all",
                      periodFilter === "custom"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-muted-foreground/30 text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground"
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
      <div className="flex items-center gap-2 rounded-lg bg-primary/5 px-4 py-2">
        <CalendarIcon className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-primary">현재 조회 기준: {dateRangeText}</span>
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
      <div className="grid gap-4 lg:grid-cols-11">
        {/* 민원 진행 현황 카드 */}
        <Card className="lg:col-span-6">
          <CardHeader style={{ paddingBottom: '6px' }}>
            <CardTitle className="text-base font-medium" style={{ fontSize: '18px', fontWeight: '600' }}>민원 진행 현황</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4" style={{ paddingTop: '0' }}>
            {/* 진행률 바 - Green 계열로 심사완료와 동기화 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">전체 처리 완료율</span>
                <span className="text-green-600" style={{ fontSize: '24px', fontWeight: '800' }}>{stats.completionRate}%</span>
              </div>
              <Progress 
                value={stats.completionRate} 
                className="h-[18px] bg-green-100" 
                indicatorClassName="bg-green-500"
              />
            </div>
            
            {/* 상태별 현황 그리드 - 카드별 포인트 컬러 적용 */}
            <div className="grid grid-cols-4 gap-3 pt-2">
              {/* 전체: Slate 계열 */}
              <div 
                onClick={() => setStatusFilter("all")}
                className="flex cursor-pointer flex-col items-center rounded-lg bg-slate-50 p-4 transition-all hover:bg-slate-100"
              >
                <span className="text-sm font-medium text-slate-600" style={{ order: 1 }}>전체</span>
                <div className="flex items-baseline gap-0.5" style={{ order: 2, marginTop: '8px' }}>
                  <span className="font-bold text-slate-900" style={{ fontSize: '42px', lineHeight: '1em' }}>{stats.total}</span>
                  <span className="text-xs font-medium ml-0.5" style={{ color: '#959595' }}>건</span>
                </div>
              </div>
              {/* 접수완료: Indigo #6366F1 (신규 접수 강조) */}
              <div 
                onClick={() => setStatusFilter("접수완료")}
                className="flex cursor-pointer flex-col items-center rounded-lg bg-indigo-50 p-4 transition-all hover:bg-indigo-100"
              >
                <span className="text-sm font-medium text-indigo-500" style={{ order: 1 }}>접수완료</span>
                <div className="flex items-baseline gap-0.5" style={{ order: 2, marginTop: '8px' }}>
                  <span className="font-bold text-indigo-500" style={{ fontSize: '42px', lineHeight: '1em' }}>{stats.접수완료}</span>
                  <span className="text-xs font-medium ml-0.5" style={{ color: '#959595' }}>건</span>
                </div>
              </div>
              {/* 진행중: Blue 계열 (활동 상태 강조) */}
              <div 
                onClick={() => setStatusFilter("진행중")}
                className="flex cursor-pointer flex-col items-center rounded-lg bg-blue-50 p-4 transition-all hover:bg-blue-100"
              >
                <span className="text-sm font-medium text-blue-600" style={{ order: 1 }}>진행중</span>
                <div className="flex items-baseline gap-0.5" style={{ order: 2, marginTop: '8px' }}>
                  <span className="font-bold text-blue-600" style={{ fontSize: '42px', lineHeight: '1em' }}>{stats.진행중}</span>
                  <span className="text-xs font-medium ml-0.5" style={{ color: '#959595' }}>건</span>
                </div>
              </div>
              {/* 심사완료: Green 계열 (완료 상태 강조) */}
              <div 
                onClick={() => setStatusFilter("심사완료")}
                className="flex cursor-pointer flex-col items-center rounded-lg bg-green-50 p-4 transition-all hover:bg-green-100"
              >
                <span className="text-sm font-medium text-green-600" style={{ order: 1 }}>심사완료</span>
                <div className="flex items-baseline gap-0.5" style={{ order: 2, marginTop: '8px' }}>
                  <span className="font-bold text-green-600" style={{ fontSize: '42px', lineHeight: '1em' }}>{stats.심사완료}</span>
                  <span className="text-xs font-medium ml-0.5" style={{ color: '#959595' }}>건</span>
                </div>
              </div>
            </div>
            {/* 기준 안내 문구 */}
            <p className="pt-2 text-xs text-muted-foreground/70">
              ※ 본 통계는 선택된 기간 내 접수된 민원을 기준으로 산출되었습니다.
            </p>
          </CardContent>
        </Card>

        {/* AI 판독 신뢰도 카드 */}
        <Card className="lg:col-span-5">
          <CardHeader style={{ paddingBottom: '6px' }}>
            <CardTitle className="text-base font-medium flex items-center justify-between">
              <span style={{ fontSize: '18px', fontWeight: '600' }}>AI 판독 신뢰도</span>
              <span className="text-2xl font-bold text-primary">{stats.aiReliability}%</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4" style={{ paddingTop: '0' }}>
            
            {/* 스택 바 비교 */}
            <div className="space-y-3">
              {/* AI 초기 판정 막대 (매��가능/매수불가 2가지만) */}
              <div className="space-y-1.5">
                <span className="text-sm font-medium text-muted-foreground" style={{ fontSize: '14px' }}>AI 초기 판정</span>
                <div className="flex h-8 w-full overflow-hidden rounded-md">
                  {stats.aiAnalyzed > 0 ? (
                    <>
                      {stats.aiPurchasable > 0 && (
                        <div 
                          className="flex items-center justify-center bg-emerald-500 text-xs font-semibold text-white"
                          style={{ width: `${(stats.aiPurchasable / stats.aiAnalyzed) * 100}%` }}
                        >
                          {stats.aiPurchasable}건
                        </div>
                      )}
                      {stats.aiNotPurchasable > 0 && (
                        <div 
                          className="flex items-center justify-center bg-rose-500 text-xs font-semibold text-white"
                          style={{ width: `${(stats.aiNotPurchasable / stats.aiAnalyzed) * 100}%` }}
                        >
                          {stats.aiNotPurchasable}건
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
                <span className="text-sm font-medium text-muted-foreground" style={{ fontSize: '14px' }}>담당자 최종 심사</span>
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
              <div className="flex items-center justify-center gap-4 pt-2">
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
            <div className="space-y-2 border-t pt-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm text-muted-foreground">판정 일치:</span>
                  <span className="font-bold" style={{ fontSize: '16px' }}>{stats.aiMatchCount}건</span>
                </div>
                <div className="flex items-center gap-1">
                  <XCircle className="h-4 w-4 text-rose-600" />
                  <span className="text-sm text-rose-600">판정 불일치:</span>
                  <span className="font-bold text-rose-600" style={{ fontSize: '16px' }}>{stats.aiMismatchCount}건</span>
                </div>
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
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center">
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
                  <TableHead>신청일시</TableHead>
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
                      <div className="flex items-center gap-2">
                        {app.applicationNumber}
                        {aiMismatchFilter && app.adminStatus === "심사완료" && (
                          // 시뮬레이션: 접수번호 끝자리로 불일치 유형 구분
                          app.applicationNumber.endsWith("2") ? (
                            <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-medium text-rose-700">반대 결정</span>
                          ) : app.applicationNumber.endsWith("5") ? (
                            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">판단 보류</span>
                          ) : null
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{app.applicantName}</TableCell>
                    <TableCell>
                      {(() => {
                        const date = new Date(app.appliedAt);
                        const dateStr = date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '-').replace('.', '');
                        const timeStr = date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
                        return `${dateStr} ${timeStr}`;
                      })()}
                    </TableCell>
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
                    {aiMismatchFilter && app.adminStatus === "심사완료" && (
                      app.applicationNumber.endsWith("2") ? (
                        <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-medium text-rose-700">반대 결정</span>
                      ) : app.applicationNumber.endsWith("5") ? (
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">판단 보류</span>
                      ) : null
                    )}
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
                    {app.applicantName} | {(() => {
                      const date = new Date(app.appliedAt);
                      const dateStr = date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '-').replace('.', '');
                      const timeStr = date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
                      return `${dateStr} ${timeStr}`;
                    })()}
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
