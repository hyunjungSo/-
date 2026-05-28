"use client";

import { useState } from "react";
import { ApplicationList } from "@/components/admin/application-list";
import { ApplicationDetail } from "@/components/admin/application-detail";
import { BatchAnalysis } from "@/components/admin/batch-analysis";
import { ParcelDetailReview } from "@/components/admin/parcel-detail-review";
import type { Application, ProcessedParcel } from "@/lib/types";
import { dummyApplications, dummyProcessedParcels } from "@/lib/dummy-data";
import { FileText, MapPin, LogOut, User } from "lucide-react";
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
  
  // 신청상세 진입 전 화면 추적 (뒤로가기 시 사용)
  const [previousScreen, setPreviousScreen] = useState<{
    tab: ActiveTab;
    parcel: ProcessedParcel | null;
  } | null>(null);

  const handleApplicationSelect = (application: Application) => {
    setSelectedApplication(application);
  };

  const handleBack = () => {
    // 이전 화면 정보가 있으면 해당 화면으로 복귀
    if (previousScreen) {
      setActiveTab(previousScreen.tab);
      setSelectedParcel(previousScreen.parcel);
      setSelectedApplication(null);
      setPreviousScreen(null);
    } else {
      // 이전 화면 정보가 없으면 신청 목록으로
      setSelectedApplication(null);
    }
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
      // 이전 화면 정보 저장 (필지상세에서 진입한 경우)
      setPreviousScreen({
        tab: activeTab,
        parcel: selectedParcel,
      });
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
    <div className="flex min-h-screen">
      {/* 왼쪽 SNB (Side Navigation Bar) - 어두운 배경 */}
      <aside className="w-60 shrink-0 bg-[#1a2332] flex flex-col">
        {/* 1단 - 시스템 로고 */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 bg-[#00875a] rounded-lg">
              <span className="text-white font-bold text-lg">EX</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-semibold text-sm">한국도로공사</span>
              <span className="text-gray-400 text-xs">토지보상시스템</span>
            </div>
          </div>
        </div>

        {/* 2단 - 전역 사업지구 셀렉트 */}
        <div className="p-4 border-b border-gray-700">
          <label className="block text-xs font-medium text-gray-400 mb-2">사업지구</label>
          <Select value={projectUnitFilter} onValueChange={(value) => setProjectUnitFilter(value as "all" | "gangjin-gwangju")}>
            <SelectTrigger className="w-full h-[42px] bg-[#2a3648] border-gray-600 text-white font-medium hover:bg-[#344056] focus:ring-[#00875a]">
              <SelectValue placeholder="사업단 선택" />
            </SelectTrigger>
            <SelectContent className="bg-[#2a3648] border-gray-600">
              <SelectItem value="all" className="text-white hover:bg-[#344056] focus:bg-[#344056]">전체 사업단</SelectItem>
              <SelectItem value="gangjin-gwangju" className="text-white hover:bg-[#344056] focus:bg-[#344056]">강진광주건설사업단</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 3단 - 메인 메뉴 */}
        <div className="flex-1 p-4">
          <h2 className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
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
                  ? "bg-[#00875a] text-white"
                  : "text-gray-300 hover:bg-[#2a3648] hover:text-white"
              )}
            >
              <FileText className="h-5 w-5" />
              <span>신청관리</span>
            </button>

            {/* 필지관리 메뉴 */}
            <button
              onClick={() => {
                setActiveTab("parcel-management");
                setSelectedParcel(null);
              }}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                (activeTab === "parcel-management" || activeTab === "parcel-review")
                  ? "bg-[#00875a] text-white"
                  : "text-gray-300 hover:bg-[#2a3648] hover:text-white"
              )}
            >
              <MapPin className="h-5 w-5" />
              <span>필지관리</span>
            </button>
          </nav>
        </div>

        {/* 4단 - 계정 정보 및 로그아웃 (하단 고정) */}
        <div className="mt-auto p-4 border-t border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-9 h-9 bg-[#2a3648] rounded-full">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">홍길동</span>
              <span className="text-xs text-gray-400">관리자</span>
            </div>
          </div>
          <button className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:bg-[#2a3648] hover:text-white transition-colors">
            <LogOut className="h-4 w-4" />
            <span>로그아웃</span>
          </button>
        </div>
      </aside>

      {/* 오른쪽 콘텐츠 영역 - 와이드하게 확장 */}
      <main className="flex-1 p-6 overflow-auto" style={{ backgroundColor: '#f3f6f9' }}>
        {/* 신청관리 콘텐츠 */}
        {activeTab === "applications" && (
          <>
            {/* 신청 상세 화면이 아닐 때만 타이틀 노출 */}
            {!selectedApplication && (
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground sm:text-3xl">신청관리</h1>
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
                {/* 콘텐츠 하단 - 목록으로 돌아가기 버튼 (고정 아님) */}
                <div className="flex justify-center py-8 mt-24">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleNavigateToApplicationList}
                    className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 text-base"
                  >
                    목록보기
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
