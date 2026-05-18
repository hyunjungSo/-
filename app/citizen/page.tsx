"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CitizenSidebar } from "@/components/citizen/citizen-sidebar";
import { MyParcelList } from "@/components/citizen/my-parcel-list";
import { ApplicationFormSection } from "@/components/citizen/application-form-section";
import { ApplicationResultSection } from "@/components/citizen/application-result-section";
import { ApplicationStatusSection } from "@/components/citizen/application-status-section";
import { OwnerParcelSearch } from "@/components/citizen/owner-parcel-search";
import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import type { LandInfo, Application, AIAnalysisResult, PreRegisteredParcel } from "@/lib/types";

// 신청 프로세스 단계
type ApplicationStep = "search" | "apply" | "result";

// 탭별 제목 및 브레드크럼
const tabConfig: Record<string, { title: string; breadcrumb: string }> = {
  new: { title: "신규 신청", breadcrumb: "신규 신청" },
  status: { title: "신청 현황 조회", breadcrumb: "신청 현황 조회" },
  myparcel: { title: "내 잔여지 조회", breadcrumb: "내 잔여지 조회" },
};

function CitizenPageContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") || "new";
  
  const [activeTab, setActiveTab] = useState<"new" | "status" | "myparcel">(
    tabParam === "status" ? "status" : tabParam === "myparcel" ? "myparcel" : "new"
  );
  const [selectedLand, setSelectedLand] = useState<LandInfo | null>(null);
  const [selectedLands, setSelectedLands] = useState<LandInfo[]>([]);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [aiResults, setAiResults] = useState<AIAnalysisResult[]>([]);
  const [submittedApplication, setSubmittedApplication] = useState<Application | null>(null);
  const [applicationStep, setApplicationStep] = useState<ApplicationStep>("search");
  
  // 장바구니 (신청 목록)
  const [cartItems, setCartItems] = useState<PreRegisteredParcel[]>([]);

  const currentConfig = tabConfig[activeTab] || tabConfig.new;

  // 탭 변경 핸들러
  const handleTabChange = (tab: string) => {
    setActiveTab(tab as "new" | "status" | "myparcel");
    if (tab === "new") {
      handleNewApplication();
    }
  };

  // 장바구니에 추가
  const handleAddToCart = (parcel: PreRegisteredParcel) => {
    if (cartItems.some(item => item.id === parcel.id)) {
      return;
    }
    setCartItems(prev => [...prev, parcel]);
  };
  
  // 장바구니에서 제거
  const handleRemoveFromCart = (parcelId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== parcelId));
  };
  
  // 장바구니 아이템들로 신청 진행
  const handleSubmitApplication = (parcels: PreRegisteredParcel[]) => {
    if (parcels.length === 0) return;
    
    const lands = parcels.map(p => p.landInfo);
    const results = parcels.map(p => p.aiResult);
    
    setSelectedLands(lands);
    setAiResults(results);
    setSelectedLand(lands[0]);
    setAiResult(results[0]);
    setApplicationStep("apply");
  };

  const handleNewApplication = () => {
    setSelectedLand(null);
    setSelectedLands([]);
    setAiResult(null);
    setAiResults([]);
    setSubmittedApplication(null);
    setApplicationStep("search");
  };
  
  // 신청 완료 후 장바구니 정리
  const handleApplicationSubmitWithCartCleanup = (application: Application) => {
    const submittedIds = selectedLands.map(land => land.id);
    setCartItems(prev => prev.filter(item => !submittedIds.includes(item.landInfo.id)));
    
    setSubmittedApplication(application);
    setApplicationStep("result");
  };

  // 재신청 처리
  const handleReapply = (application: Application) => {
    setSelectedLand(application.landInfo);
    setSelectedLands([application.landInfo]);
    
    if (application.aiResult) {
      setAiResult(application.aiResult);
      setAiResults([application.aiResult]);
    }
    
    setActiveTab("new");
    setApplicationStep("apply");
  };

  return (
    <div className="flex gap-8">
      {/* 좌측 사이드바 */}
      <CitizenSidebar activeTab={activeTab} onTabChange={handleTabChange} />
      
      {/* 우측 콘텐츠 영역 */}
      <div className="flex-1 min-w-0">
        {/* 브레드크럼 */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-gray-700 flex items-center gap-1">
            <Home className="h-4 w-4" />
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span>마이페이지</span>
          <ChevronRight className="h-4 w-4" />
          <span>잔여지 매수</span>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900 font-medium">{currentConfig.breadcrumb}</span>
        </nav>
        
        {/* 페이지 제목 */}
        <h1 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b">
          {currentConfig.title}
        </h1>

        {/* 콘텐츠 */}
        <div className="space-y-6">
          {/* 신규 신청 */}
          {activeTab === "new" && (
            <>
              {applicationStep === "search" && (
                <MyParcelList 
                  onAddToCart={handleAddToCart}
                  onRemoveFromCart={handleRemoveFromCart}
                  cartItems={cartItems}
                  onSubmitApplication={handleSubmitApplication}
                />
              )}

              {applicationStep === "apply" && selectedLand && aiResult && (
                <ApplicationFormSection
                  landInfo={selectedLand}
                  landInfoList={selectedLands.length > 1 ? selectedLands : undefined}
                  aiResult={aiResult}
                  aiResultList={aiResults.length > 1 ? aiResults : undefined}
                  onSubmit={handleApplicationSubmitWithCartCleanup}
                  onBack={() => setApplicationStep("search")}
                />
              )}

              {applicationStep === "result" && submittedApplication && (
                <ApplicationResultSection 
                  application={submittedApplication} 
                  onNewApplication={handleNewApplication}
                />
              )}
            </>
          )}

          {/* 신청 현황 조회 */}
          {activeTab === "status" && (
            <ApplicationStatusSection onReapply={handleReapply} />
          )}

          {/* 내 잔여지 조회 */}
          {activeTab === "myparcel" && (
            <OwnerParcelSearch />
          )}
        </div>
      </div>
    </div>
  );
}

export default function CitizenPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">로딩 중...</div>}>
      <CitizenPageContent />
    </Suspense>
  );
}
