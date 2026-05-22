"use client";

import { useState } from "react";
import { ApplicationList } from "@/components/admin/application-list";
import { ApplicationDetail } from "@/components/admin/application-detail";
import { BatchAnalysis } from "@/components/admin/batch-analysis";
import { ParcelDetailReview } from "@/components/admin/parcel-detail-review";
import { IncomingParcelList } from "@/components/admin/incoming-parcel-list";
import type { Application, ProcessedParcel } from "@/lib/types";
import { dummyApplications, dummyProcessedParcels } from "@/lib/dummy-data";
import { FileText, MapPin, ChevronDown, ChevronRight, Scan, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

type ActiveTab = 
  | "applications" 
  | "incoming-parcels"    // 발생 잔여지 판독
  | "ai-judgment"         // AI 매수 판단
  | "parcel-review";      // 필지상세

export default function AdminPage() {
  const [applications, setApplications] = useState<Application[]>(dummyApplications);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [processedParcels, setProcessedParcels] = useState<ProcessedParcel[]>(dummyProcessedParcels);
  const [selectedParcel, setSelectedParcel] = useState<ProcessedParcel | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("applications");
  const [isParcelMenuExpanded, setIsParcelMenuExpanded] = useState(true);

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
    setActiveTab("ai-judgment");
  };

  // 발생 잔여지 판독에서 확정된 필지를 AI 매수 판단 목록으로 이동
  const handleConfirmParcels = (confirmedParcels: any[]) => {
    // 실제로는 API 호출 후 processedParcels에 추가
    // 여기서는 데모용으로 간단히 처리
    console.log("확정된 필지:", confirmedParcels);
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

            {/* 필지관리 메뉴 (확장 가능) */}
            <div>
              <button
                onClick={() => setIsParcelMenuExpanded(!isParcelMenuExpanded)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  (activeTab === "incoming-parcels" || activeTab === "ai-judgment" || activeTab === "parcel-review")
                    ? "bg-[#2E8B57]/10 text-[#2E8B57]"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <MapPin className="h-5 w-5" />
                <span className="flex-1 text-left">필지관리</span>
                {isParcelMenuExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>

              {/* 서브메뉴 */}
              {isParcelMenuExpanded && (
                <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-3">
                  {/* 서브메뉴 1: 발생 잔여지 판독 */}
                  <button
                    onClick={() => {
                      setActiveTab("incoming-parcels");
                      setSelectedParcel(null);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                      activeTab === "incoming-parcels"
                        ? "bg-[#2E8B57] text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    <Scan className="h-4 w-4" />
                    <span>발생 잔여지 판독</span>
                  </button>

                  {/* 서브메뉴 2: AI 매수 판단 */}
                  <button
                    onClick={() => {
                      setActiveTab("ai-judgment");
                      setSelectedParcel(null);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                      (activeTab === "ai-judgment" || activeTab === "parcel-review")
                        ? "bg-[#2E8B57] text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    <Brain className="h-4 w-4" />
                    <span>AI 매수 판단</span>
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      </aside>

      {/* 오른쪽 콘텐츠 영역 */}
      <main className="flex-1 p-6" style={{ backgroundColor: '#f3f6f9' }}>
        {/* 신청관리 콘텐츠 */}
        {activeTab === "applications" && (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">신청관리</h1>
            </div>
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
          </>
        )}

        {/* 발생 잔여지 판독 콘텐츠 */}
        {activeTab === "incoming-parcels" && (
          <IncomingParcelList onConfirmParcels={handleConfirmParcels} />
        )}

        {/* AI 매수 판단 콘텐츠 */}
        {activeTab === "ai-judgment" && (
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
          />
        )}
      </main>
    </div>
  );
}
