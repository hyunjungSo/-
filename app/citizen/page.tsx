"use client";

import { useState } from "react";
import { LandSearchSection } from "@/components/citizen/land-search-section";
import { ApplicationFormSection } from "@/components/citizen/application-form-section";
import { ApplicationResultSection } from "@/components/citizen/application-result-section";
import { ApplicationStatusSection } from "@/components/citizen/application-status-section";
import { Tabs, TabsContent } from "@/components/ui/tabs";
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
          <nav aria-label="신청 진행 단계" className="krds-step-wrap py-8">
            <div className="mx-auto max-w-xl">
              <ol className="relative flex items-start justify-between">
                {/* 연결선 배경 - 전체 가로선 */}
                <div 
                  className="absolute left-0 top-3 h-px w-full bg-gray-300" 
                  aria-hidden="true" 
                />
                {/* 완료된 단계까지의 연결선 */}
                {currentStepIndex > 0 && (
                  <div 
                    className="absolute left-0 top-3 h-px bg-gray-900 transition-all" 
                    style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                    aria-hidden="true" 
                  />
                )}
                
                {steps.map((step, index) => {
                  const isCompleted = index < currentStepIndex;
                  const isCurrent = index === currentStepIndex;

                  return (
                    <li 
                      key={step.id} 
                      className={`relative flex flex-col items-center ${isCompleted ? "done" : ""} ${isCurrent ? "active" : ""}`}
                    >
                      {/* 원형 인디케이터 */}
                      <div 
                        className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-white ${
                          isCurrent || isCompleted
                            ? "border-gray-400" 
                            : "border-gray-300"
                        }`}
                        aria-current={isCurrent ? "step" : undefined}
                      >
                        {/* 현재/완료 단계: 내부 채워진 원 */}
                        {(isCurrent || isCompleted) && (
                          <span className="h-3 w-3 rounded-full bg-gray-900" aria-hidden="true" />
                        )}
                      </div>
                      
                      {/* 단계 레이블 */}
                      <div className="mt-3 text-center">
                        <span className={`block text-xs ${
                          isCurrent || isCompleted ? "text-gray-500" : "text-gray-400"
                        }`}>
                          Step {step.number}
                        </span>
                        <span className={`mt-1 block text-sm ${
                          isCurrent 
                            ? "font-bold text-gray-900" 
                            : isCompleted 
                              ? "font-medium text-gray-600"
                              : "text-gray-400"
                        }`}>
                          {step.label}
                          {isCurrent && <span className="sr-only">(현재 단계)</span>}
                          {isCompleted && <span className="sr-only">(완료)</span>}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </nav>

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
