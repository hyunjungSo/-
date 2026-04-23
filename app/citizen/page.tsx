"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { LandSearchSection } from "@/components/citizen/land-search-section";
import { ApplicationFormSection } from "@/components/citizen/application-form-section";
import { ApplicationResultSection } from "@/components/citizen/application-result-section";
import { ApplicationStatusSection } from "@/components/citizen/application-status-section";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FilePlus, ClipboardList } from "lucide-react";
import type { LandInfo, Application, AIAnalysisResult, ApplicationCartItem } from "@/lib/types";

// 신청 프로세스 단계
type ApplicationStep = "search" | "apply" | "result";

export default function CitizenPage() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  
  const [selectedLand, setSelectedLand] = useState<LandInfo | null>(null);
  const [selectedLands, setSelectedLands] = useState<LandInfo[]>([]); // 복수 필지 신청용
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [aiResults, setAiResults] = useState<AIAnalysisResult[]>([]); // 복수 필지 AI 결과
  const [submittedApplication, setSubmittedApplication] = useState<Application | null>(null);
  const [mainTab, setMainTab] = useState<"new" | "status">(tabParam === "status" ? "status" : "new");
  const [applicationStep, setApplicationStep] = useState<ApplicationStep>("search");
  
  // 장바구니 (신청 목록)
  const [cartItems, setCartItems] = useState<ApplicationCartItem[]>([]);
  
  // URL 파라미터 변경 시 탭 상태 업데이트
  useEffect(() => {
    if (tabParam === "status") {
      setMainTab("status");
    }
  }, [tabParam]);

  // 장바구니에 추가
  const handleAddToCart = (land: LandInfo, result: AIAnalysisResult) => {
    // 이미 장바구니에 있는지 확인
    if (cartItems.some(item => item.landInfo.id === land.id)) {
      return;
    }
    
    const newItem: ApplicationCartItem = {
      id: land.id,
      landInfo: land,
      aiResult: result,
      addedAt: new Date().toISOString(),
      businessUnit: land.businessUnit || "수도권", // 관할기관 기준 그룹핑
    };
    
    setCartItems(prev => [...prev, newItem]);
  };
  
  // 장바구니에서 제거
  const handleRemoveFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };
  
  // 장바구니 아이템들로 신청 진행
  const handleSubmitCart = (items: ApplicationCartItem[]) => {
    if (items.length === 0) return;
    
    // 복수 필지 신청 설정
    const lands = items.map(item => item.landInfo);
    const results = items.map(item => item.aiResult);
    
    setSelectedLands(lands);
    setAiResults(results);
    setSelectedLand(lands[0]); // 첫 번째 필지를 대표로
    setAiResult(results[0]);
    setApplicationStep("apply");
  };

  const handleLandSelect = (land: LandInfo, result: AIAnalysisResult) => {
    setSelectedLand(land);
    setSelectedLands([land]);
    setAiResult(result);
    setAiResults([result]);
    setApplicationStep("apply");
  };

  const handleApplicationSubmit = (application: Application) => {
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
    // 장바구니는 유지 (신청 완료된 항목만 제거하려면 별도 로직 필요)
  };
  
  // 신청 완료 후 해당 항목들 장바구니에서 제거
  const handleApplicationSubmitWithCartCleanup = (application: Application) => {
    // 신청된 필지들 장바구니에서 제거
    const submittedIds = selectedLands.map(land => land.id);
    setCartItems(prev => prev.filter(item => !submittedIds.includes(item.id)));
    
    setSubmittedApplication(application);
    setApplicationStep("result");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          민원인 서비스
        </h1>
        <p className="mt-1 text-muted-foreground">
          잔여지 매수 신청 및 신청 현황 조회
        </p>
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
            <LandSearchSection 
              onLandSelect={handleLandSelect}
              cartItems={cartItems}
              onAddToCart={handleAddToCart}
              onRemoveFromCart={handleRemoveFromCart}
              onSubmitCart={handleSubmitCart}
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
        </TabsContent>

        {/* 신청 현황 조회 */}
        <TabsContent 
          value="status" 
          className="mt-6"
          role="tabpanel"
          id="tabpanel-status"
          aria-labelledby="tab-status"
        >
          <ApplicationStatusSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
