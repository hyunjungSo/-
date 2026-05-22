"use client";

import { useState } from "react";
import { ApplicationList } from "@/components/admin/application-list";
import { ApplicationDetail } from "@/components/admin/application-detail";
import { BatchAnalysis } from "@/components/admin/batch-analysis";
import { ParcelDetailReview } from "@/components/admin/parcel-detail-review";
import type { Application, ProcessedParcel } from "@/lib/types";
import { dummyApplications, dummyProcessedParcels } from "@/lib/dummy-data";
import { FileText, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

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
  };

  const menuItems = [
    { id: "applications", label: "신청관리", icon: FileText },
    { id: "parcel-management", label: "필지관리", icon: MapPin },
  ];

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* 왼쪽 SNB (Side Navigation Bar) */}
      <aside className="w-56 shrink-0 border-r border-gray-200 bg-white">
        <div className="sticky top-0 p-4">
          <h2 className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
            메뉴
          </h2>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id || 
                (item.id === "parcel-management" && activeTab === "parcel-review");
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (item.id === "applications") {
                      setSelectedApplication(null);
                    } else if (item.id === "parcel-management") {
                      setSelectedParcel(null);
                    }
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[#2E8B57] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
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

        {/* 필지관리 콘텐츠 */}
        {(activeTab === "parcel-management" || activeTab === "parcel-review") && (
          <>
            {selectedParcel ? (
              <ParcelDetailReview
                parcel={selectedParcel}
                onBack={handleParcelBack}
                onUpdate={handleParcelUpdate}
              />
            ) : (
              <BatchAnalysis 
                parcels={processedParcels}
                onParcelsUpdate={setProcessedParcels}
                onParcelSelect={handleParcelSelect}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
