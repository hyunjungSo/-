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
import { Search, Filter, ChevronRight, Users, Clock, Loader2, CheckCircle2, Layers, AlertTriangle } from "lucide-react";

interface ApplicationListProps {
  applications: Application[];
  onSelect: (application: Application) => void;
}

const statusConfig: Record<ProcessStatus, { label: string; className: string }> = {
  접수됨: { label: "접수됨", className: "bg-gray-100 text-gray-700 border-gray-300" },
  AI분석완료: { label: "AI 분석 완료", className: "bg-blue-100 text-blue-700 border-blue-300" },
  검토중: { label: "검토 중", className: "bg-amber-100 text-amber-700 border-amber-300" },
  처리완료: { label: "처리 완료", className: "bg-green-100 text-green-700 border-green-300" },
};

const adminStatusConfig: Record<AdminStatus, { label: string; icon: typeof Clock; color: string }> = {
  대기중: { label: "대기중", icon: Clock, color: "text-gray-500" },
  진행중: { label: "진행중", icon: Loader2, color: "text-blue-600" },
  완료: { label: "완료", icon: CheckCircle2, color: "text-green-600" },
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
      대기중: applications.filter((a) => a.adminStatus === "대기중").length,
      진행중: applications.filter((a) => a.adminStatus === "진행중").length,
      완료: applications.filter((a) => a.adminStatus === "완료").length,
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
                <p className="text-xs text-muted-foreground">전체 민원</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                <Clock className="h-5 w-5 text-gray-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-600">{stats.대기중}</p>
                <p className="text-xs text-muted-foreground">대기중</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Loader2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats.진행중}</p>
                <p className="text-xs text-muted-foreground">진행중</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.완료}</p>
                <p className="text-xs text-muted-foreground">완료</p>
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
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="접수번호, 신청인명, 지번으로 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as AdminStatus | "all")}>
                <SelectTrigger className="h-10 w-[150px] gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="처리상태" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 민원</SelectItem>
                  <SelectItem value="대기중">대기중</SelectItem>
                  <SelectItem value="진행중">진행중</SelectItem>
                  <SelectItem value="완료">완료</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="default"
                className="h-10 gap-2 px-4"
                onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
              >
                <span className="text-muted-foreground">{sortOrder === "desc" ? "↓" : "↑"}</span>
                {sortOrder === "desc" ? "최신순" : "오래된순"}
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
                  <TableHead>처리상태</TableHead>
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
                          <span className="flex items-center gap-0.5 rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary" title="복수 필지">
                            <Layers className="h-3 w-3" />
                            {app.additionalLands.length + 1}
                          </span>
                        )}
                        {(app.isBorderlineCase || app.aiResult?.isBorderlineCase) && (
                          <span className="flex items-center rounded bg-warning/10 px-1.5 py-0.5 text-xs text-warning" title="AI 판정 경계 사례">
                            <AlertTriangle className="h-3 w-3" />
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
                      <Badge className={statusConfig[app.status].className}>
                        {statusConfig[app.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const config = adminStatusConfig[app.adminStatus];
                        const Icon = config.icon;
                        return (
                          <div className={`flex items-center gap-1 ${config.color}`}>
                            <Icon className={`h-4 w-4 ${app.adminStatus === "진행중" ? "animate-spin" : ""}`} />
                            <span className="text-sm font-medium">{config.label}</span>
                          </div>
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
                    <Badge className={`text-xs ${statusConfig[app.status].className}`}>
                      {statusConfig[app.status].label}
                    </Badge>
                    {app.additionalLands && app.additionalLands.length > 0 && (
                      <span className="flex items-center gap-0.5 rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                        <Layers className="h-3 w-3" />
                        복수필지
                      </span>
                    )}
                    {(app.isBorderlineCase || app.aiResult?.isBorderlineCase) && (
                      <span className="flex items-center gap-0.5 rounded bg-warning/10 px-1.5 py-0.5 text-xs text-warning">
                        <AlertTriangle className="h-3 w-3" />
                        경계사례
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {app.applicantName} | {app.appliedAt}
                  </p>
                  <p className="text-xs text-muted-foreground">
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
