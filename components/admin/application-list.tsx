"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import type { Application, ProcessStatus, AdminStatus } from "@/lib/types";
import { Search, Filter, ChevronRight, Users, Clock, PlayCircle, CheckCircle2, Layers, AlertTriangle } from "lucide-react";

interface ApplicationListProps {
  applications: Application[];
  onSelect: (application: Application) => void;
}

const statusConfig: Record<ProcessStatus, { label: string; variant: "secondary" | "info" | "warning" | "success" }> = {
  접수완료: { label: "접수완료", variant: "secondary" },
  AI분석완료: { label: "AI 분석 완료", variant: "info" },
  검토중: { label: "검토 중", variant: "warning" },
  처리완료: { label: "처리 완료", variant: "success" },
};

const adminStatusConfig: Record<AdminStatus, { label: string; icon: typeof Clock; variant: "warning-subtle" | "info-subtle" | "success-subtle" }> = {
  접수완료: { label: "접수완료", icon: Clock, variant: "warning-subtle" },      // 주황 solid-pastel
  진행중: { label: "진행중", icon: PlayCircle, variant: "info-subtle" },        // 파랑 solid-pastel
  심사완료: { label: "심사완료", icon: CheckCircle2, variant: "success-subtle" }, // 녹색 solid-pastel
};

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
    return {
      total: applications.length,
      접수완료: applications.filter((a) => a.adminStatus === "접수완료").length,
      진행중: applications.filter((a) => a.adminStatus === "진행중").length,
      심사완료: applications.filter((a) => a.adminStatus === "심사완료").length,
    };
  }, [applications]);

  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-base text-muted-foreground">전체 민원</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                <Clock className="h-5 w-5 text-amber-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-700">{stats.접수완료}</p>
                <p className="text-base text-muted-foreground">접수완료</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50">
                <PlayCircle className="h-5 w-5 text-sky-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-sky-700">{stats.진행중}</p>
                <p className="text-base text-muted-foreground">진행중</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                <CheckCircle2 className="h-5 w-5 text-emerald-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-700">{stats.심사완료}</p>
                <p className="text-base text-muted-foreground">심사완료</p>
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
                      {(() => {
                        const config = adminStatusConfig[app.adminStatus];
                        const Icon = config.icon;
                        return (
                          <Badge variant={config.variant}>
                            <Icon className="h-3.5 w-3.5" />
                            {config.label}
                          </Badge>
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
                    <Badge variant={statusConfig[app.status].variant}>
                      {statusConfig[app.status].label}
                    </Badge>
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
