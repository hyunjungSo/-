"use client";

import { useState } from "react";
import { ApplicationList } from "@/components/admin/application-list";
import { ApplicationDetail } from "@/components/admin/application-detail";
import { BatchAnalysis } from "@/components/admin/batch-analysis";
import { ParcelDetailReview } from "@/components/admin/parcel-detail-review";
import type { Application, ProcessedParcel } from "@/lib/types";
import { dummyApplications, dummyProcessedParcels } from "@/lib/dummy-data";
import { FileText, MapPin, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type ActiveTab = 
  | "applications" 
  | "parcel-management"   // 필지 관리 (통합)
  | "parcel-review";      // 필지상세

export default function AdminPage() {
  const [applications, setApplications] = useState<Application[]>(dummyApplications);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [processedParcels, setProcessedParcels] = useState<ProcessedParcel[]>(dummyProcessedParcels);
  const [selectedParcel, setSelectedParcel] = useState<ProcessedParcel | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("applications");
  const [projectUnitFilter, setProjectUnitFilter] = useState<"all" | "gangjin-gwangju">("gangjin-gwangju");

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
    setActiveTab("parcel-management");
  };

  // 필지상세에서 신청상세로 이동
  const handleNavigateToApplication = (applicationId: string) => {
    const application = applications.find(app => app.id === applicationId);
    if (application) {
      setSelectedApplication(application);
      setSelectedParcel(null);
      setActiveTab("applications");
    }
  };

  // 신청 목록으로 이동 (진입 경로와 무관하게 신청 목록으로)
  const handleNavigateToApplicationList = () => {
    setSelectedApplication(null);
    setActiveTab("applications");
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* 왼쪽 SNB (Side Navigation Bar) */}
      <aside className="w-56 shrink-0 border-r border-gray-200 bg-white">
        <div className="sticky top-0 p-4">
          <h2 className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
            메뉴
          </h2>
          <nav className="space-y-1">
            {/* 신청관리 메뉴 */}
            <button
              onClick={() => {
                setActiveTab("applications");
                setSelectedApplication(null);
              }}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                activeTab === "applications"
                  ? "bg-[#2E8B57] text-white"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <FileText className="h-5 w-5" />
              <span>신청관리</span>
            </button>

            {/* 필지관리 메뉴 (단일 1depth) */}
            <button
              onClick={() => {
                setActiveTab("parcel-management");
                setSelectedParcel(null);
              }}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                (activeTab === "parcel-management" || activeTab === "parcel-review")
                  ? "bg-[#2E8B57] text-white"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <MapPin className="h-5 w-5" />
              <span>필지관리</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* 오른쪽 콘텐츠 영역 */}
      <main className="flex-1 p-6" style={{ backgroundColor: '#f3f6f9' }}>
        {/* 신청관리 콘텐츠 */}
        {activeTab === "applications" && (
          <>
            {/* 신청 상세 화면이 아닐 때만 타이틀과 사업지구 선택기 노출 */}
            {!selectedApplication && (
              <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-foreground sm:text-3xl">신청관리</h1>
                {/* 사업단(지구) 선택 - 최상위 전역 필터 */}
                <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
                  <span className="text-sm font-medium text-slate-600">현재 사업지구:</span>
                  <Select value={projectUnitFilter} onValueChange={(value) => setProjectUnitFilter(value as "all" | "gangjin-gwangju")}>
                    <SelectTrigger className="w-[220px] h-[38px] bg-white border-slate-300 font-medium">
                      <SelectValue placeholder="사업단 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체 사업단</SelectItem>
                      <SelectItem value="gangjin-gwangju">강진광주건설사업단</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            {selectedApplication ? (
              <div>
                <ApplicationDetail
                  application={selectedApplication}
                  onBack={handleBack}
                  onSave={handleSave}
                  onNavigateToList={handleNavigateToApplicationList}
                />
                {/* 콘텐츠 하단 - 목록 버튼 (고정 아님) */}
                <div className="flex justify-center py-8 mt-24">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleNavigateToApplicationList}
                    className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 text-base"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    목록
                  </Button>
                </div>
              </div>
            ) : (
              <ApplicationList
                applications={applications}
                onSelect={handleApplicationSelect}
              />
            )}
          </>
        )}

        {/* 필지관리 콘텐츠 */}
        {activeTab === "parcel-management" && (
          <BatchAnalysis 
            parcels={processedParcels}
            onParcelsUpdate={setProcessedParcels}
            onParcelSelect={handleParcelSelect}
          />
        )}

        {/* 필지상세 콘텐츠 */}
        {activeTab === "parcel-review" && selectedParcel && (
          <ParcelDetailReview
            parcel={selectedParcel}
            onBack={handleParcelBack}
            onUpdate={handleParcelUpdate}
            onNavigateToApplication={handleNavigateToApplication}
          />
        )}
      </main>
    </div>
  );
}
