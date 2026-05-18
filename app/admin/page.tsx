"use client";

import { useState } from "react";
import { ApplicationList } from "@/components/admin/application-list";
import { ApplicationDetail } from "@/components/admin/application-detail";
import { BatchAnalysis } from "@/components/admin/batch-analysis";
import { ParcelDetailReview } from "@/components/admin/parcel-detail-review";
import type { Application, ProcessedParcel } from "@/lib/types";
import { dummyApplications, dummyProcessedParcels } from "@/lib/dummy-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, MapPin } from "lucide-react";

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">관리자 페이지</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid">
          <TabsTrigger value="applications" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>신청관리</span>
          </TabsTrigger>
          <TabsTrigger value="parcel-management" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>필지관리</span>
          </TabsTrigger>
        </TabsList>

        {/* 신청관리 탭 */}
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

        {/* 필지관리 탭 */}
        <TabsContent value="parcel-management" className="mt-6">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
