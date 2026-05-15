"use client";

import { useState } from "react";
import { ApplicationList } from "@/components/admin/application-list";
import { ApplicationDetail } from "@/components/admin/application-detail";
import { ParcelPreRegistration } from "@/components/admin/parcel-pre-registration";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Application } from "@/lib/types";
import { dummyApplications } from "@/lib/dummy-data";
import { FileText, MapPinPlus } from "lucide-react";

export default function AdminPage() {
  const [applications, setApplications] = useState<Application[]>(dummyApplications);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [activeTab, setActiveTab] = useState("applications");
  
  // 현재 로그인된 사업단 (실제로는 인증 시스템에서 가져옴)
  const currentBusinessUnit = "수도권";

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

  // 상세 보기 중일 때는 탭 없이 상세 화면만 표시
  if (selectedApplication) {
    return (
      <div className="space-y-6">
        <ApplicationDetail
          application={selectedApplication}
          onBack={handleBack}
          onSave={handleSave}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 h-12">
          <TabsTrigger value="applications" className="gap-2 text-base">
            <FileText className="h-4 w-4" />
            민원 접수 목록
          </TabsTrigger>
          <TabsTrigger value="pre-registration" className="gap-2 text-base">
            <MapPinPlus className="h-4 w-4" />
            잔여지 사전등록
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="applications" className="mt-6">
          <ApplicationList
            applications={applications}
            onSelect={handleApplicationSelect}
          />
        </TabsContent>
        
        <TabsContent value="pre-registration" className="mt-6">
          <ParcelPreRegistration 
            businessUnit={currentBusinessUnit}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
