"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LandMap } from "@/components/land-map";
import { dummyApplications, landShapes, landCategories } from "@/lib/dummy-data";
import type { Application, LandShape, LandCategory } from "@/lib/types";
import { ArrowLeft, Download, Printer, FileText, CheckCircle2 } from "lucide-react";

export default function ReviewDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [documentData, setDocumentData] = useState({
    landShape: "" as LandShape,
    actualUsage: "" as LandCategory,
    farmMachineDifficulty: "미입력" as "미입력" | "해당" | "해당없음",
    ownerOpinion: "",
    reviewerComment: "",
  });
  const [isGenerated, setIsGenerated] = useState(false);

  useEffect(() => {
    const found = dummyApplications.find((app) => app.id === resolvedParams.id);
    if (found) {
      setApplication(found);
      setDocumentData({
        landShape: found.reportedShape,
        actualUsage: found.actualUsage,
        farmMachineDifficulty: found.farmMachineDifficulty ? "해당" : "미입력",
        ownerOpinion: found.reason,
        reviewerComment: found.reviewerComment || "",
      });
    }
  }, [resolvedParams.id]);

  const handleGenerate = () => {
    setIsGenerated(true);
  };

  if (!application) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-muted-foreground">민원을 찾을 수 없습니다.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              돌아가기
            </Button>
            {isGenerated && (
              <div className="flex gap-2">
                <Button variant="outline">
                  <Printer className="mr-2 h-4 w-4" />
                  인쇄
                </Button>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  PDF 다운로드
                </Button>
              </div>
            )}
          </div>

          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              심의서 작성 및 생성
            </h1>
            <p className="mt-1 text-muted-foreground">
              접수번호: {application.applicationNumber}
            </p>
          </div>

          {!isGenerated ? (
            // 심의서 입력 폼
            <div className="grid gap-6 lg:grid-cols-2">
              {/* 자동 생성 항목 미리보기 */}
              <Card>
                <CardHeader>
                  <CardTitle>자동 생성 항목</CardTitle>
                  <CardDescription>
                    시스템에서 자동으로 삽입되는 항목입니다.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>지적도</Label>
                    <LandMap landInfo={application.landInfo} showOverlay />
                  </div>

                  <div className="space-y-2">
                    <Label>항공사진</Label>
                    <div className="flex h-[200px] items-center justify-center rounded-lg bg-muted">
                      <p className="text-sm text-muted-foreground">
                        항공/드론 중첩 영상 (연동 예정)
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 rounded-lg border border-border p-4">
                    <div>
                      <p className="text-sm text-muted-foreground">지번</p>
                      <p className="font-medium text-foreground">
                        {application.landInfo.address}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">토지 유형</p>
                      <p className="font-medium text-foreground">
                        {application.landInfo.landType}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">잔여 면적</p>
                      <p className="font-medium text-primary">
                        {application.landInfo.remainingArea.toLocaleString()}㎡
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">잔여 비율</p>
                      <p className="font-medium text-foreground">
                        {application.landInfo.remainingRatio}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 수동 입력 항목 */}
              <Card>
                <CardHeader>
                  <CardTitle>심의서 항목 입력</CardTitle>
                  <CardDescription>
                    담당자가 직접 입력하거나 수정할 수 있는 항목입니다.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>토지 모양</Label>
                    <Select
                      value={documentData.landShape}
                      onValueChange={(value) =>
                        setDocumentData((prev) => ({
                          ...prev,
                          landShape: value as LandShape,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                          정형 (3종)
                        </div>
                        {landShapes.regular.map((shape) => (
                          <SelectItem key={shape.value} value={shape.value}>
                            {shape.label}
                          </SelectItem>
                        ))}
                        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                          비정형 (7종)
                        </div>
                        {landShapes.irregular.map((shape) => (
                          <SelectItem key={shape.value} value={shape.value}>
                            {shape.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>실제 이용 상황</Label>
                    <Select
                      value={documentData.actualUsage}
                      onValueChange={(value) =>
                        setDocumentData((prev) => ({
                          ...prev,
                          actualUsage: value as LandCategory,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {landCategories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.value} ({cat.label})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>농기계 진입/회전 곤란</Label>
                    <Select
                      value={documentData.farmMachineDifficulty}
                      onValueChange={(value) =>
                        setDocumentData((prev) => ({
                          ...prev,
                          farmMachineDifficulty: value as "미입력" | "해당" | "해당없음",
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="미입력">미입력</SelectItem>
                        <SelectItem value="해당">해당</SelectItem>
                        <SelectItem value="해당없음">해당 없음</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>소유자 의견</Label>
                    <Textarea
                      value={documentData.ownerOpinion}
                      onChange={(e) =>
                        setDocumentData((prev) => ({
                          ...prev,
                          ownerOpinion: e.target.value,
                        }))
                      }
                      rows={3}
                      placeholder="민원인이 입력한 신청 사유가 자동으로 불러옵니다."
                    />
                    <p className="text-xs text-muted-foreground">
                      민원인 입력값이 자동 불러와집니다. 필요 시 수정할 수 있습니다.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>검토 의견</Label>
                    <Textarea
                      value={documentData.reviewerComment}
                      onChange={(e) =>
                        setDocumentData((prev) => ({
                          ...prev,
                          reviewerComment: e.target.value,
                        }))
                      }
                      rows={4}
                      placeholder="담당자 검토 의견을 작성하세요."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>서명란</Label>
                    <div className="flex h-20 items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted">
                      <p className="text-sm text-muted-foreground">
                        출력 후 수기 서명 예정
                      </p>
                    </div>
                  </div>

                  <Button onClick={handleGenerate} className="w-full" size="lg">
                    <FileText className="mr-2 h-4 w-4" />
                    심의서 생성
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            // 생성된 심의서 미리보기
            <Card>
              <CardHeader className="border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-accent" />
                    <div>
                      <CardTitle>심의서가 생성되었습니다</CardTitle>
                      <CardDescription>
                        생성일시: {new Date().toLocaleString("ko-KR")}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className="bg-accent text-accent-foreground">생성 완료</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {/* 심의서 미리보기 */}
                <div className="bg-card p-8 print:p-0">
                  <div className="mx-auto max-w-3xl space-y-8">
                    {/* 제목 */}
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-foreground">
                        잔여지 매수 심의서
                      </h2>
                      <p className="mt-2 text-muted-foreground">
                        접수번호: {application.applicationNumber}
                      </p>
                    </div>

                    {/* 기본 정보 테이블 */}
                    <div className="overflow-hidden rounded-lg border border-border">
                      <table className="w-full text-sm">
                        <tbody>
                          <tr className="border-b border-border">
                            <th className="w-1/4 bg-muted px-4 py-3 text-left font-medium text-foreground">
                              신청인
                            </th>
                            <td className="px-4 py-3 text-foreground">
                              {application.applicantName}
                            </td>
                            <th className="w-1/4 bg-muted px-4 py-3 text-left font-medium text-foreground">
                              신청일
                            </th>
                            <td className="px-4 py-3 text-foreground">
                              {application.appliedAt}
                            </td>
                          </tr>
                          <tr className="border-b border-border">
                            <th className="bg-muted px-4 py-3 text-left font-medium text-foreground">
                              대상 지번
                            </th>
                            <td colSpan={3} className="px-4 py-3 text-foreground">
                              {application.landInfo.address}
                            </td>
                          </tr>
                          <tr className="border-b border-border">
                            <th className="bg-muted px-4 py-3 text-left font-medium text-foreground">
                              토지 유형
                            </th>
                            <td className="px-4 py-3 text-foreground">
                              {application.landInfo.landType}
                            </td>
                            <th className="bg-muted px-4 py-3 text-left font-medium text-foreground">
                              지목
                            </th>
                            <td className="px-4 py-3 text-foreground">
                              {documentData.actualUsage}
                            </td>
                          </tr>
                          <tr className="border-b border-border">
                            <th className="bg-muted px-4 py-3 text-left font-medium text-foreground">
                              편입 전 면적
                            </th>
                            <td className="px-4 py-3 text-foreground">
                              {application.landInfo.originalArea.toLocaleString()}㎡
                            </td>
                            <th className="bg-muted px-4 py-3 text-left font-medium text-foreground">
                              편입 면적
                            </th>
                            <td className="px-4 py-3 text-foreground">
                              {application.landInfo.includedArea.toLocaleString()}㎡
                            </td>
                          </tr>
                          <tr className="border-b border-border">
                            <th className="bg-muted px-4 py-3 text-left font-medium text-foreground">
                              잔여 면적
                            </th>
                            <td className="px-4 py-3 font-semibold text-primary">
                              {application.landInfo.remainingArea.toLocaleString()}㎡
                            </td>
                            <th className="bg-muted px-4 py-3 text-left font-medium text-foreground">
                              잔여 비율
                            </th>
                            <td className="px-4 py-3 text-foreground">
                              {application.landInfo.remainingRatio}%
                            </td>
                          </tr>
                          <tr className="border-b border-border">
                            <th className="bg-muted px-4 py-3 text-left font-medium text-foreground">
                              토지 형상
                            </th>
                            <td className="px-4 py-3 text-foreground">
                              {documentData.landShape}
                            </td>
                            <th className="bg-muted px-4 py-3 text-left font-medium text-foreground">
                              농기계 곤란
                            </th>
                            <td className="px-4 py-3 text-foreground">
                              {documentData.farmMachineDifficulty}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* 지적도 */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-foreground">지적도</h3>
                      <LandMap landInfo={application.landInfo} showOverlay />
                    </div>

                    {/* 항공사진 */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-foreground">항공사진</h3>
                      <div className="flex h-[200px] items-center justify-center rounded-lg border border-border bg-muted">
                        <p className="text-sm text-muted-foreground">
                          항공/드론 중첩 영상 자동 삽입 영역
                        </p>
                      </div>
                    </div>

                    {/* 소유자 의견 */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-foreground">소유자 의견</h3>
                      <div className="rounded-lg border border-border bg-muted/50 p-4">
                        <p className="text-sm leading-relaxed text-foreground">
                          {documentData.ownerOpinion || "-"}
                        </p>
                      </div>
                    </div>

                    {/* 검토 의견 */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-foreground">검토 의견</h3>
                      <div className="rounded-lg border border-border bg-muted/50 p-4">
                        <p className="text-sm leading-relaxed text-foreground">
                          {documentData.reviewerComment || "-"}
                        </p>
                      </div>
                    </div>

                    {/* AI 분석 결과 */}
                    {application.aiResult && (
                      <div className="space-y-2">
                        <h3 className="font-semibold text-foreground">
                          AI 분석 기준 충족 여부
                        </h3>
                        <div className="overflow-hidden rounded-lg border border-border">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-border bg-muted">
                                <th className="px-4 py-2 text-left font-medium text-foreground">
                                  기준
                                </th>
                                <th className="px-4 py-2 text-left font-medium text-foreground">
                                  설명
                                </th>
                                <th className="px-4 py-2 text-center font-medium text-foreground">
                                  충족
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {application.aiResult.criteriaChecks.map(
                                (check, index) => (
                                  <tr
                                    key={index}
                                    className="border-b border-border last:border-b-0"
                                  >
                                    <td className="px-4 py-2 font-medium text-foreground">
                                      {check.criteriaName}
                                    </td>
                                    <td className="px-4 py-2 text-muted-foreground">
                                      {check.criteriaDescription}
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                      {check.isMet ? (
                                        <span className="text-accent">O</span>
                                      ) : (
                                        <span className="text-muted-foreground">
                                          X
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* 판정 결과 */}
                    <div className="rounded-lg border-2 border-primary bg-primary/5 p-6 text-center">
                      <p className="text-sm text-muted-foreground">판정 결과</p>
                      <p className="mt-2 text-2xl font-bold text-primary">
                        {application.finalJudgment ||
                          application.aiResult?.provisionalJudgment ||
                          "매수"}
                      </p>
                    </div>

                    {/* 서명란 */}
                    <div className="flex justify-end gap-8 pt-8">
                      <div className="text-center">
                        <div className="mb-2 h-16 w-32 border-b-2 border-foreground"></div>
                        <p className="text-sm text-muted-foreground">담당자</p>
                      </div>
                      <div className="text-center">
                        <div className="mb-2 h-16 w-32 border-b-2 border-foreground"></div>
                        <p className="text-sm text-muted-foreground">팀장</p>
                      </div>
                    </div>

                    {/* 푸터 */}
                    <div className="border-t border-border pt-4 text-center text-xs text-muted-foreground">
                      <p>한국도로공사 잔여지 매수 판독 솔루션</p>
                      <p>생성일시: {new Date().toLocaleString("ko-KR")}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
