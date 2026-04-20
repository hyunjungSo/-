"use client";

import { useState } from "react";
import { LandSearchSection } from "@/components/citizen/land-search-section";
import { ApplicationFormSection } from "@/components/citizen/application-form-section";
import { ApplicationResultSection } from "@/components/citizen/application-result-section";
import { ApplicationStatusSection } from "@/components/citizen/application-status-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { FilePlus, ClipboardList } from "lucide-react";
import type { LandInfo, Application, AIAnalysisResult } from "@/lib/types";

// 신청 프로세스 단계
type ApplicationStep = "search" | "apply" | "result";

export default function CitizenPage() {
  const [selectedLand, setSelectedLand] = useState<LandInfo | null>(null);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [submittedApplication, setSubmittedApplication] = useState<Application | null>(null);
  const [mainTab, setMainTab] = useState<"new" | "status">("new");
  const [applicationStep, setApplicationStep] = useState<ApplicationStep>("search");

  const handleLandSelect = (land: LandInfo, result: AIAnalysisResult) => {
    setSelectedLand(land);
    setAiResult(result);
    setApplicationStep("apply");
  };

  const handleApplicationSubmit = (application: Application) => {
    setSubmittedApplication(application);
    setApplicationStep("result");
  };

  const handleNewApplication = () => {
    setSelectedLand(null);
    setAiResult(null);
    setSubmittedApplication(null);
    setApplicationStep("search");
  };

  // 단계 정보
  const steps = [
    { id: "search", label: "토지 조회", number: 1 },
    { id: "apply", label: "매수 신청", number: 2 },
    { id: "result", label: "접수 완료", number: 3 },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === applicationStep);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          민원인 서비스
        </h1>
        <p className="mt-1 text-muted-foreground">
          잔여지 매수 신청 및 신청 현황 조회
        </p>
      </div>

      {/* 상위 메뉴: 신규 신청 / 신청 현황 조회 */}
      <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as "new" | "status")} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="new" className="cursor-pointer flex items-center gap-2">
            <FilePlus className="h-5 w-5" />
            <span>신규 신청</span>
          </TabsTrigger>
          <TabsTrigger value="status" className="cursor-pointer flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            <span>신청 현황 조회</span>
          </TabsTrigger>
        </TabsList>

        {/* 신규 신청 */}
        <TabsContent value="new" className="mt-6 space-y-6">
          {/* 진행 단계 표시 - 디지털 정부서비스 가이드라인 Step indicator */}
          <Card>
            <CardContent className="py-4">
              <nav aria-label="신청 진행 단계">
                <ol className="flex items-center justify-between">
                  {steps.map((step, index) => (
                    <li key={step.id} className="flex items-center">
                      <div className="flex items-center gap-2">
                        <div 
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                            index < currentStepIndex 
                              ? "bg-primary text-white" 
                              : index === currentStepIndex 
                                ? "bg-primary text-white" 
                                : "border-2 border-muted-foreground/30 bg-background text-muted-foreground"
                          }`}
                          aria-current={index === currentStepIndex ? "step" : undefined}
                        >
                          {step.number}
                        </div>
                        <span 
                          className={`text-sm font-medium hidden sm:block ${
                            index <= currentStepIndex ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                      {index < steps.length - 1 && (
                        <div 
                          className={`mx-2 h-0.5 w-8 sm:mx-4 sm:w-16 ${
                            index < currentStepIndex ? "bg-primary" : "bg-muted"
                          }`} 
                        />
                      )}
                    </li>
                  ))}
                </ol>
              </nav>
            </CardContent>
          </Card>

          {/* 단계별 콘텐츠 */}
          {applicationStep === "search" && (
            <LandSearchSection onLandSelect={handleLandSelect} />
          )}

          {applicationStep === "apply" && selectedLand && aiResult && (
            <ApplicationFormSection
              landInfo={selectedLand}
              aiResult={aiResult}
              onSubmit={handleApplicationSubmit}
              onBack={() => setApplicationStep("search")}
            />
          )}

          {applicationStep === "result" && submittedApplication && (
            <ApplicationResultSection 
              application={submittedApplication} 
              onNewApplication={handleNewApplication}
            />
          )}
        </TabsContent>

        {/* 신청 현황 조회 */}
        <TabsContent value="status" className="mt-6">
          <ApplicationStatusSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
