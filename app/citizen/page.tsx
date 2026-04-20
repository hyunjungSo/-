"use client";

import { useState } from "react";
import { LandSearchSection } from "@/components/citizen/land-search-section";
import { ApplicationFormSection } from "@/components/citizen/application-form-section";
import { ApplicationResultSection } from "@/components/citizen/application-result-section";
import { ApplicationStatusSection } from "@/components/citizen/application-status-section";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { FilePlus, ClipboardList, Check } from "lucide-react";
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

      {/* 상위 메뉴: 신규 신청 / 신청 현황 조회 - KRDS 라인형 탭 */}
      <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as "new" | "status")} className="w-full">
        <div 
          className="krds-tab-area border-b border-gray-200"
          role="tablist"
          aria-label="서비스 메뉴"
        >
          <div className="flex">
            <button
              role="tab"
              id="tab-new"
              aria-selected={mainTab === "new"}
              aria-controls="tabpanel-new"
              onClick={() => setMainTab("new")}
              className={`relative flex cursor-pointer items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                mainTab === "new"
                  ? "text-primary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <FilePlus className="h-5 w-5" />
              <span>신규 신청</span>
              {/* KRDS 인디케이터 - 선택된 탭 하단 표시 */}
              {mainTab === "new" && (
                <span className="absolute bottom-0 left-0 h-0.5 w-full bg-primary" aria-hidden="true" />
              )}
            </button>
            <button
              role="tab"
              id="tab-status"
              aria-selected={mainTab === "status"}
              aria-controls="tabpanel-status"
              onClick={() => setMainTab("status")}
              className={`relative flex cursor-pointer items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                mainTab === "status"
                  ? "text-primary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <ClipboardList className="h-5 w-5" />
              <span>신청 현황 조회</span>
              {/* KRDS 인디케이터 - 선택된 탭 하단 표시 */}
              {mainTab === "status" && (
                <span className="absolute bottom-0 left-0 h-0.5 w-full bg-primary" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* 신규 신청 */}
        <TabsContent 
          value="new" 
          className="mt-6 space-y-6"
          role="tabpanel"
          id="tabpanel-new"
          aria-labelledby="tab-new"
        >
          {/* KRDS 단계 표시기 (Step Indicator) */}
          <Card>
            <CardContent className="py-6">
              <nav aria-label="신청 진행 단계" className="krds-step-wrap">
                <ol className="flex items-center">
                  {steps.map((step, index) => {
                    const isCompleted = index < currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    const isPending = index > currentStepIndex;

                    return (
                      <li 
                        key={step.id} 
                        className={`relative flex flex-1 items-center ${
                          isCompleted ? "done" : isCurrent ? "active" : ""
                        }`}
                      >
                        {/* 연결선 - 첫 번째 단계 제외 */}
                        {index > 0 && (
                          <div 
                            className={`absolute left-0 top-4 h-0.5 w-full -translate-x-1/2 ${
                              isCompleted ? "bg-primary" : "bg-gray-200"
                            }`}
                            aria-hidden="true"
                          />
                        )}
                        
                        {/* 단계 내용 */}
                        <div className="relative flex flex-col items-center">
                          {/* 단계 식별자 */}
                          <div 
                            className={`z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                              isCompleted 
                                ? "bg-primary text-white" 
                                : isCurrent 
                                  ? "border-2 border-primary bg-white text-primary" 
                                  : "border-2 border-gray-300 bg-white text-gray-400"
                            }`}
                            aria-current={isCurrent ? "step" : undefined}
                          >
                            {isCompleted ? (
                              <Check className="h-4 w-4" aria-hidden="true" />
                            ) : (
                              step.number
                            )}
                          </div>
                          
                          {/* 단계 레이블 */}
                          <span 
                            className={`step-tit mt-2 text-center text-sm font-medium ${
                              isCompleted || isCurrent ? "text-foreground" : "text-gray-400"
                            }`}
                          >
                            {step.label}
                            {/* 스크린리더용 현재 단계 표시 */}
                            {isCurrent && (
                              <span className="sr-only">(현재 단계)</span>
                            )}
                            {isCompleted && (
                              <span className="sr-only">(완료)</span>
                            )}
                          </span>
                        </div>
                      </li>
                    );
                  })}
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
        <TabsContent 
          value="status" 
          className="mt-6"
          role="tabpanel"
          id="tabpanel-status"
          aria-labelledby="tab-status"
        >
          <ApplicationStatusSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
