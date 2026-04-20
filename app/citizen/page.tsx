"use client";

import { useState } from "react";
import { LandSearchSection } from "@/components/citizen/land-search-section";
import { ApplicationFormSection } from "@/components/citizen/application-form-section";
import { ApplicationResultSection } from "@/components/citizen/application-result-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, FileEdit, FileCheck } from "lucide-react";
import type { LandInfo, Application, AIAnalysisResult } from "@/lib/types";

export default function CitizenPage() {
  const [selectedLand, setSelectedLand] = useState<LandInfo | null>(null);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [submittedApplication, setSubmittedApplication] = useState<Application | null>(null);
  const [activeTab, setActiveTab] = useState("search");

  const handleLandSelect = (land: LandInfo, result: AIAnalysisResult) => {
    setSelectedLand(land);
    setAiResult(result);
    setActiveTab("apply");
  };

  const handleApplicationSubmit = (application: Application) => {
    setSubmittedApplication(application);
    setActiveTab("result");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          민원인 서비스
        </h1>
        <p className="mt-1 text-muted-foreground">
          잔여지 매수 신청을 위한 토지 조회 및 신청서 작성
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">토지 조회</span>
          </TabsTrigger>
          <TabsTrigger 
            value="apply" 
            className="flex items-center gap-2"
            disabled={!selectedLand}
          >
            <FileEdit className="h-4 w-4" />
            <span className="hidden sm:inline">매수 신청</span>
          </TabsTrigger>
          <TabsTrigger 
            value="result" 
            className="flex items-center gap-2"
            disabled={!submittedApplication}
          >
            <FileCheck className="h-4 w-4" />
            <span className="hidden sm:inline">결과 확인</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="mt-6">
          <LandSearchSection onLandSelect={handleLandSelect} />
        </TabsContent>

        <TabsContent value="apply" className="mt-6">
          {selectedLand && aiResult && (
            <ApplicationFormSection
              landInfo={selectedLand}
              aiResult={aiResult}
              onSubmit={handleApplicationSubmit}
              onBack={() => setActiveTab("search")}
            />
          )}
        </TabsContent>

        <TabsContent value="result" className="mt-6">
          {submittedApplication && (
            <ApplicationResultSection application={submittedApplication} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
