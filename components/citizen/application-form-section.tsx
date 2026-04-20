"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LandMap } from "@/components/land-map";
import { landCategories, landShapes } from "@/lib/dummy-data";
import type { LandInfo, Application, LandCategory, LandShape, AIAnalysisResult } from "@/lib/types";
import { ArrowLeft, Upload, Send, Bot, CheckCircle2, XCircle } from "lucide-react";

interface ApplicationFormSectionProps {
  landInfo: LandInfo;
  aiResult: AIAnalysisResult;
  onSubmit: (application: Application) => void;
  onBack: () => void;
}

export function ApplicationFormSection({
  landInfo,
  aiResult,
  onSubmit,
  onBack,
}: ApplicationFormSectionProps) {
  const [formData, setFormData] = useState({
    applicantName: landInfo.ownerName,
    applicantContact: landInfo.ownerContact || "",
    applicantAddress: "",
    actualUsage: landInfo.landCategory as LandCategory,
    reportedShape: landInfo.remainingShape as LandShape,
    farmMachineDifficulty: false,
    reason: "",
    attachments: [] as string[],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 신청 데이터 생성
    const application: Application = {
      id: `app-${Date.now()}`,
      applicationNumber: `2026-${String(new Date().getMonth() + 1).padStart(2, "0")}${String(new Date().getDate()).padStart(2, "0")}-${String(Math.floor(Math.random() * 999)).padStart(3, "0")}`,
      applicantName: formData.applicantName,
      applicantContact: formData.applicantContact,
      applicantAddress: formData.applicantAddress,
      landInfo,
      actualUsage: formData.actualUsage,
      reportedShape: formData.reportedShape,
      farmMachineDifficulty: formData.farmMachineDifficulty,
      reason: formData.reason,
      attachments: formData.attachments,
      status: "접수됨",
      adminStatus: "대기",
      appliedAt: new Date().toISOString().split("T")[0],
      aiResult: aiResult,
    };

    // 시뮬레이션을 위한 딜레이
    setTimeout(() => {
      setIsSubmitting(false);
      onSubmit(application);
    }, 1500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileNames = Array.from(files).map((f) => f.name);
      setFormData((prev) => ({
        ...prev,
        attachments: [...prev.attachments, ...fileNames],
      }));
    }
  };

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={onBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        토지 조회로 돌아가기
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 토지 정보 요약 */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">신청 대상 토지</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <LandMap landInfo={landInfo} showOverlay />
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">지번</span>
                <span className="font-medium text-foreground">{landInfo.address.split(" ").slice(-2).join(" ")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">잔여 면적</span>
                <span className="font-medium text-primary">{landInfo.remainingArea.toLocaleString()}㎡</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">잔여 비율</span>
                <span className="font-medium text-foreground">{landInfo.remainingRatio}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">토지 유형</span>
                <span className="font-medium text-foreground">{landInfo.landType}</span>
              </div>
            </div>

            {/* AI 판독 결과 요약 */}
            <div className={`mt-4 rounded-lg border p-3 ${
              aiResult.provisionalJudgment === "매수" 
                ? "border-primary bg-primary/5" 
                : "border-destructive bg-destructive/5"
            }`}>
              <div className="mb-2 flex items-center gap-2">
                <Bot className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-foreground">AI 판독 결과</span>
              </div>
              <div className="flex items-center gap-1.5">
                {aiResult.provisionalJudgment === "매수" ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span className="text-sm font-bold text-primary">매수 가능성 높음</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-destructive" />
                    <span className="text-sm font-bold text-destructive">기준 미충족</span>
                  </>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {aiResult.criteriaChecks.filter(c => c.isMet).length}/{aiResult.criteriaChecks.length}개 기준 충족
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 신청서 양식 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>매수 신청서 작성</CardTitle>
            <CardDescription>
              신청인 정보와 토지 관련 정보를 입력해주세요. * 표시는 필수 항목입니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 신청인 정보 */}
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">신청인 정보</h4>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="applicantName">성명 *</Label>
                    <Input
                      id="applicantName"
                      value={formData.applicantName}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, applicantName: e.target.value }))
                      }
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="applicantContact">연락처 *</Label>
                    <Input
                      id="applicantContact"
                      placeholder="010-0000-0000"
                      value={formData.applicantContact}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, applicantContact: e.target.value }))
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="applicantAddress">주소 *</Label>
                  <Input
                    id="applicantAddress"
                    placeholder="우편물 수령 가능한 주소를 입력해주세요"
                    value={formData.applicantAddress}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, applicantAddress: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>

              {/* 토지 정보 */}
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">토지 정보</h4>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="actualUsage">실제 이용 상황 *</Label>
                    <Select
                      value={formData.actualUsage}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, actualUsage: value as LandCategory }))
                      }
                    >
                      <SelectTrigger id="actualUsage">
                        <SelectValue placeholder="선택하세요" />
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
                    <Label htmlFor="reportedShape">토지 모양 *</Label>
                    <Select
                      value={formData.reportedShape}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, reportedShape: value as LandShape }))
                      }
                    >
                      <SelectTrigger id="reportedShape">
                        <SelectValue placeholder="선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                          정형
                        </div>
                        {landShapes.regular.map((shape) => (
                          <SelectItem key={shape.value} value={shape.value}>
                            {shape.label}
                          </SelectItem>
                        ))}
                        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                          비정형
                        </div>
                        {landShapes.irregular.map((shape) => (
                          <SelectItem key={shape.value} value={shape.value}>
                            {shape.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {landInfo.landType === "농지" && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="farmMachine"
                      checked={formData.farmMachineDifficulty}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          farmMachineDifficulty: checked === true,
                        }))
                      }
                    />
                    <Label htmlFor="farmMachine" className="text-sm font-normal">
                      농기계 진입 및 회전이 곤란합니다
                    </Label>
                  </div>
                )}
              </div>

              {/* 신청 사유 */}
              <div className="space-y-2">
                <Label htmlFor="reason">신청 사유 (소유자 의견) *</Label>
                <Textarea
                  id="reason"
                  placeholder="잔여지 매수를 신청하는 사유를 상세히 작성해주세요."
                  rows={4}
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, reason: e.target.value }))
                  }
                  required
                />
              </div>

              {/* 첨부 서류 */}
              <div className="space-y-2">
                <Label>첨부 서류</Label>
                <div className="rounded-lg border border-dashed border-border p-4">
                  <div className="flex flex-col items-center justify-center text-center">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      클릭하거나 파일을 드래그하여 업로드
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PDF, JPG, PNG (최대 10MB)
                    </p>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="absolute inset-0 cursor-pointer opacity-0"
                      style={{ position: "relative" }}
                    />
                  </div>
                </div>
                {formData.attachments.length > 0 && (
                  <ul className="mt-2 space-y-1 text-sm">
                    {formData.attachments.map((file, index) => (
                      <li key={index} className="text-muted-foreground">
                        - {file}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* 제출 버튼 */}
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "신청서 제출 중..."
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    매수 신청서 제출
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
