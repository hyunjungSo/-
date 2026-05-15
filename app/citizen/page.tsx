"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MyParcelList } from "@/components/citizen/my-parcel-list";
import { ApplicationFormSection } from "@/components/citizen/application-form-section";
import { ApplicationResultSection } from "@/components/citizen/application-result-section";
import { ApplicationStatusSection } from "@/components/citizen/application-status-section";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FilePlus, ClipboardList } from "lucide-react";
import type { LandInfo, Application, AIAnalysisResult, PreRegisteredParcel } from "@/lib/types";

// 신청 프로세스 단계
type ApplicationStep = "search" | "apply" | "result";

function CitizenPageContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  
  const [selectedLand, setSelectedLand] = useState<LandInfo | null>(null);
  const [selectedLands, setSelectedLands] = useState<LandInfo[]>([]); // 복수 필지 신청용
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [aiResults, setAiResults] = useState<AIAnalysisResult[]>([]); // 복수 필지 AI 결과
  const [submittedApplication, setSubmittedApplication] = useState<Application | null>(null);
  const [mainTab, setMainTab] = useState<"new" | "status">(tabParam === "status" ? "status" : "new");
  const [applicationStep, setApplicationStep] = useState<ApplicationStep>("search");
  
  // 장바구니 (신청 목록) - 사전등록된 필지
  const [cartItems, setCartItems] = useState<PreRegisteredParcel[]>([]);
  
  // URL 파라미터 변경 시 탭 상태 업데이트
  useEffect(() => {
    if (tabParam === "status") {
      setMainTab("status");
    }
  }, [tabParam]);

  // 장바구니에 추가
  const handleAddToCart = (parcel: PreRegisteredParcel) => {
    // 이미 장바구니에 있는지 확인
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
    
    // 복수 필지 신청 설정
    const lands = parcels.map(p => p.landInfo);
    const results = parcels.map(p => p.aiResult);
    
    setSelectedLands(lands);
    setAiResults(results);
    setSelectedLand(lands[0]); // 첫 번째 필지를 대표로
    setAiResult(results[0]);
    setApplicationStep("apply");
  };

  const handleApplicationSubmit = (application: Application) => {
    // 신청된 필지들 장바구니에서 제거
    const submittedIds = selectedLands.map(land => land.id);
    setCartItems(prev => prev.filter(item => !submittedIds.includes(item.landInfo.id)));
    
    setSubmittedApplication(application);
    setApplicationStep("result");
  };

  const handleNewApplication = () => {
    setSelectedLand(null);
    setSelectedLands([]);
    setAiResult(null);
    setAiResults([]);
    setSubmittedApplication(null);
    setApplicationStep("search");
    setReapplyData(null);
  };
  
  // 취소 후 재신청 처리 - 기존 신청 데이터를 프리필하여 신청 화면으로 이동
  const [reapplyData, setReapplyData] = useState<Application | null>(null);
  
  const handleReapply = (application: Application) => {
    // 기존 신청 데이터를 저장하고 신규 신청 탭으로 전환
    setReapplyData(application);
    
    // 필지 정보 설정
    const lands = application.additionalLands 
      ? [application.landInfo, ...application.additionalLands]
      : [application.landInfo];
    
    // AI 결과 설정 (기존 데이터에서 가져옴)
    const results = application.aiResultList || (application.aiResult ? [application.aiResult] : []);
    
    setSelectedLands(lands);
    setSelectedLand(lands[0]);
    setAiResults(results);
    setAiResult(results[0] || null);
    
    // 신규 신청 탭으로 전환하고 신청 단계로 이동
    setMainTab("new");
    setApplicationStep("apply");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          잔여지 매수
        </h1>
      </div>

      {/* 상위 메뉴: 신규 신청 / 신청 현황 조회 - KRDS 라인형 탭 */}
      <Tabs 
        value={mainTab} 
        onValueChange={(v) => {
          const newTab = v as "new" | "status";
          setMainTab(newTab);
          // 신규 신청 탭 클릭 시 데이터 초기화
          if (newTab === "new") {
            handleNewApplication();
          }
        }} 
        className="w-full"
      >
        <TabsList aria-label="서비스 메뉴">
          <TabsTrigger value="new">
            <FilePlus className="h-5 w-5" />
            <span>신규 신청</span>
          </TabsTrigger>
          <TabsTrigger value="status">
            <ClipboardList className="h-5 w-5" />
            <span>신청 현황 조회</span>
          </TabsTrigger>
        </TabsList>

        {/* 신규 신청 */}
        <TabsContent 
          value="new" 
          className="mt-6 space-y-6"
          role="tabpanel"
          id="tabpanel-new"
          aria-labelledby="tab-new"
        >
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
              onSubmit={handleApplicationSubmit}
              onBack={() => setApplicationStep("search")}
              prefillData={reapplyData}
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
          <ApplicationStatusSection onReapply={handleReapply} />
        </TabsContent>
      </Tabs>
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
