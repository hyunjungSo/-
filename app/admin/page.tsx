"use client";

import { useState } from "react";
import { ApplicationList } from "@/components/admin/application-list";
import { ApplicationDetail } from "@/components/admin/application-detail";
import { BatchAnalysis } from "@/components/admin/batch-analysis";
import { ParcelDetailReview } from "@/components/admin/parcel-detail-review";
import type { Application, ProcessedParcel } from "@/lib/types";
import { dummyApplications, dummyProcessedParcels } from "@/lib/dummy-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, BarChart3, Search, ClipboardCheck } from "lucide-react";

export default function AdminPage() {
  const [applications, setApplications] = useState<Application[]>(dummyApplications);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [processedParcels, setProcessedParcels] = useState<ProcessedParcel[]>(dummyProcessedParcels);
  const [selectedParcel, setSelectedParcel] = useState<ProcessedParcel | null>(null);
  const [activeTab, setActiveTab] = useState("applications");

  const handleApplicationSelect = (application: Application) => {
    setSelectedApplication(application);
  };

  const handleBack = () => {
    setSelectedApplication(null);
  };

  const handleSave = (updatedApplication: Application) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === updatedApplication.id ? updatedApplication : app
      )
    );
    setSelectedApplication(updatedApplication);
    
    // localStorage에 업데이트된 application 저장 (심의서 페이지와 연동)
    try {
      const savedApplications = JSON.parse(localStorage.getItem('updatedApplications') || '{}');
      savedApplications[updatedApplication.id] = updatedApplication;
      localStorage.setItem('updatedApplications', JSON.stringify(savedApplications));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  };

  const handleParcelSelect = (parcel: ProcessedParcel) => {
    setSelectedParcel(parcel);
    setActiveTab("parcel-review");
  };

  const handleParcelUpdate = (updatedParcel: ProcessedParcel) => {
    setProcessedParcels((prev) =>
      prev.map((p) => (p.id === updatedParcel.id ? updatedParcel : p))
    );
    setSelectedParcel(updatedParcel);
  };

  const handleParcelBack = () => {
    setSelectedParcel(null);
    setActiveTab("batch-analysis");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">관리자 페이지</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="applications" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">신청 관리</span>
            <span className="sm:hidden">신청</span>
          </TabsTrigger>
          <TabsTrigger value="batch-analysis" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">일괄 분석</span>
            <span className="sm:hidden">분석</span>
          </TabsTrigger>
          <TabsTrigger value="parcel-review" className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4" />
            <span className="hidden sm:inline">필지 검토</span>
            <span className="sm:hidden">검토</span>
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">조회</span>
            <span className="sm:hidden">조회</span>
          </TabsTrigger>
        </TabsList>

        {/* 신청 관리 탭 */}
        <TabsContent value="applications" className="mt-6">
          {selectedApplication ? (
            <ApplicationDetail
              application={selectedApplication}
              onBack={handleBack}
              onSave={handleSave}
            />
          ) : (
            <ApplicationList
              applications={applications}
              onSelect={handleApplicationSelect}
            />
          )}
        </TabsContent>

        {/* 일괄 분석 탭 */}
        <TabsContent value="batch-analysis" className="mt-6">
          <BatchAnalysis 
            parcels={processedParcels}
            onParcelsUpdate={setProcessedParcels}
            onParcelSelect={handleParcelSelect}
          />
        </TabsContent>

        {/* 필지 검토 탭 */}
        <TabsContent value="parcel-review" className="mt-6">
          {selectedParcel ? (
            <ParcelDetailReview
              parcel={selectedParcel}
              onBack={handleParcelBack}
              onUpdate={handleParcelUpdate}
            />
          ) : (
            <div className="rounded-lg border bg-card p-8 text-center">
              <ClipboardCheck className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">필지를 선택해주세요</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                일괄 분석 탭에서 검토할 필지를 선택하거나,<br />
                아래 목록에서 필지를 선택해주세요.
              </p>
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-3">검토 대기 필지 목록</h4>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {processedParcels
                    .filter(p => p.publishStatus !== "공개")
                    .map((parcel) => (
                      <button
                        key={parcel.id}
                        onClick={() => handleParcelSelect(parcel)}
                        className="w-full text-left p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{parcel.landInfo.address}</p>
                            <p className="text-xs text-muted-foreground">
                              {parcel.landInfo.area}m² | {parcel.publishStatus}
                            </p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${
                            parcel.aiResult.provisionalJudgment === "매수 가능성 높음" 
                              ? "bg-emerald-100 text-emerald-700" 
                              : "bg-rose-100 text-rose-700"
                          }`}>
                            {parcel.aiResult.provisionalJudgment}
                          </span>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* 조회 탭 (히스토리 등) */}
        <TabsContent value="search" className="mt-6">
          <div className="rounded-lg border bg-card p-8 text-center">
            <Search className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">분석 히스토리 조회</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              필지별 분석 이력을 조회하고 검색할 수 있습니다.
            </p>
            <div className="mt-6 space-y-4">
              {processedParcels.map((parcel) => (
                <div key={parcel.id} className="text-left p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">{parcel.landInfo.address}</p>
                    <span className={`text-xs px-2 py-1 rounded ${
                      parcel.publishStatus === "공개" 
                        ? "bg-blue-100 text-blue-700" 
                        : parcel.publishStatus === "담당자확인완료"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                    }`}>
                      {parcel.publishStatus}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    분석 이력: {parcel.analysisHistory?.length || 0}건 | 
                    최종 분석: {parcel.lastAnalyzedAt || "-"}
                  </p>
                  {parcel.analysisHistory && parcel.analysisHistory.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {parcel.analysisHistory.slice(0, 3).map((history, idx) => (
                        <div key={history.id} className="text-xs p-2 bg-muted/50 rounded flex justify-between">
                          <span>{history.stage} - {history.analyzedBy}</span>
                          <span className={history.newResult === "매수 가능성 높음" ? "text-emerald-600" : "text-rose-600"}>
                            {history.previousResult ? `${history.previousResult} → ` : ""}{history.newResult}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
