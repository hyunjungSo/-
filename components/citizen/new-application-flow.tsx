"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Check, ChevronLeft, MapPin, Ruler, Search, FileText, Brain, ClipboardCheck, CheckCircle, XCircle, Loader2 } from "lucide-react";
import type { LandInfo, AIAnalysisResult, Application } from "@/lib/types";

// 더미 잔여지 데이터 (사용자 소유)
const myParcels = [
  {
    id: "parcel-1",
    address: "경기도 성남시 분당구 정자동 123-45",
    area: 150,
    remainingArea: 45,
    landCategory: "대" as const,
    landUse: "제2종일반주거지역",
    roadContact: "8m 도로" as const,
    ownerName: "홍길동",
    projectName: "분당-수서 고속도로",
  },
  {
    id: "parcel-2", 
    address: "경기도 용인시 수지구 동천동 456-78",
    area: 280,
    remainingArea: 120,
    landCategory: "전" as const,
    landUse: "자연녹지지역",
    roadContact: "비접도" as const,
    ownerName: "홍길동",
    projectName: "용인-서울 고속도로",
  },
  {
    id: "parcel-3",
    address: "서울시 강남구 삼성동 789-12",
    area: 95,
    remainingArea: 30,
    landCategory: "대" as const,
    landUse: "제3종일반주거지역", 
    roadContact: "12m 도로" as const,
    ownerName: "홍길동",
    projectName: "강남순환도로",
  },
  {
    id: "parcel-4",
    address: "경기도 화성시 동탄면 석우동 234-56",
    area: 320,
    remainingArea: 85,
    landCategory: "답" as const,
    landUse: "계획관리지역",
    roadContact: "4m 도로" as const,
    ownerName: "홍길동",
    projectName: "동탄-오산 연결도로",
  },
  {
    id: "parcel-5",
    address: "경기도 수원시 영통구 원천동 567-89",
    area: 180,
    remainingArea: 55,
    landCategory: "대" as const,
    landUse: "제1종일반주거지역",
    roadContact: "6m 도로" as const,
    ownerName: "홍길동",
    projectName: "수원-용인 고속도로",
  },
  {
    id: "parcel-6",
    address: "인천시 연수구 송도동 123-99",
    area: 420,
    remainingArea: 150,
    landCategory: "잡종지" as const,
    landUse: "일반상업지역",
    roadContact: "20m 도로" as const,
    ownerName: "홍길동",
    projectName: "송도국제도시 2단계",
  },
];

// AI 분석 질문들
const questions = [
  {
    id: "usage",
    title: "현재 토지를 어떻게 사용하고 계신가요?",
    subtitle: "토지의 현재 활용 상태를 알려주세요",
    type: "radio" as const,
    options: [
      { value: "residence", label: "주거용으로 사용 중" },
      { value: "farming", label: "농업용으로 사용 중" },
      { value: "commercial", label: "상업/영업용으로 사용 중" },
      { value: "unused", label: "현재 사용하지 않음" },
      { value: "other", label: "기타" },
    ],
  },
  {
    id: "plan",
    title: "잔여지에 대해 어떤 계획이 있으신가요?",
    subtitle: "향후 활용 계획을 알려주시면 분석에 도움이 됩니다",
    type: "radio" as const,
    options: [
      { value: "keep", label: "계속 보유하며 활용할 예정" },
      { value: "sell", label: "매도를 희망함" },
      { value: "develop", label: "개발/건축 예정" },
      { value: "undecided", label: "아직 결정하지 못함" },
    ],
  },
  {
    id: "urgent",
    title: "매수 신청의 긴급성은 어느 정도인가요?",
    subtitle: "처리 우선순위 판단에 참고됩니다",
    type: "radio" as const,
    options: [
      { value: "urgent", label: "매우 급함 (1개월 이내 처리 희망)" },
      { value: "normal", label: "보통 (3개월 이내)" },
      { value: "flexible", label: "여유 있음 (6개월 이내)" },
    ],
  },
  {
    id: "reason",
    title: "매수를 신청하시는 주된 이유가 무엇인가요?",
    subtitle: "자세히 작성해 주시면 심사에 도움이 됩니다",
    type: "textarea" as const,
    placeholder: "예: 잔여지가 너무 좁아 활용이 어렵습니다. 도로 공사로 인해 진출입이 불편해졌습니다.",
  },
];

interface NewApplicationFlowProps {
  onComplete: (application: Application) => void;
  onCancel: () => void;
}

type FlowStep = "select" | "questions" | "analysis" | "decision" | "application" | "complete";

export function NewApplicationFlow({ onComplete, onCancel }: NewApplicationFlowProps) {
  const [step, setStep] = useState<FlowStep>("select");
  const [selectedParcel, setSelectedParcel] = useState<typeof myParcels[0] | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [aiResult, setAiResult] = useState<{ judgment: string; score: number; reasoning: string } | null>(null);
  const [applicationForm, setApplicationForm] = useState({
    contact: "",
    email: "",
    additionalNotes: "",
  });

  // 검색 필터링된 잔여지 목록
  const filteredParcels = useMemo(() => {
    if (!searchQuery.trim()) return myParcels;
    const query = searchQuery.toLowerCase();
    return myParcels.filter(
      parcel => parcel.address.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // 잔여지 선택
  const handleSelectParcel = (parcel: typeof myParcels[0]) => {
    setSelectedParcel(parcel);
  };

  // 다음 단계로
  const handleNext = async () => {
    if (step === "select" && selectedParcel) {
      setStep("questions");
    } else if (step === "questions") {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        // 모든 질문 완료 -> AI 분석 시작
        setStep("analysis");
        setIsAnalyzing(true);
        
        // AI 분석 시뮬레이션
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        // 랜덤하게 결과 생성 (데모용)
        const isPositive = Math.random() > 0.3;
        setAiResult({
          judgment: isPositive ? "매수 가능성 높음" : "매수 가능성 낮음",
          score: isPositive ? Math.floor(Math.random() * 20) + 75 : Math.floor(Math.random() * 30) + 30,
          reasoning: isPositive 
            ? "잔여지 면적이 최소 기준을 충족하며, 도로 접근성 저하로 인한 활용도 감소가 인정됩니다. 주변 유사 사례와 비교 시 매수 가능성이 높은 것으로 분석됩니다."
            : "잔여지 면적이 독립 활용 가능한 수준으로 판단되며, 현재 용도로 계속 활용 가능한 것으로 보입니다. 다만, 추가 서류 제출 시 재검토가 가능합니다.",
        });
        setIsAnalyzing(false);
      }
    } else if (step === "decision") {
      setStep("application");
    } else if (step === "application") {
      handleSubmit();
    }
  };

  // 이전 단계로
  const handleBack = () => {
    if (step === "questions") {
      if (currentQuestion > 0) {
        setCurrentQuestion(prev => prev - 1);
      } else {
        setStep("select");
      }
    } else if (step === "analysis" && !isAnalyzing) {
      setCurrentQuestion(questions.length - 1);
      setStep("questions");
    } else if (step === "decision") {
      setStep("analysis");
    } else if (step === "application") {
      setStep("decision");
    }
  };

  // 답변 저장
  const handleAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  // 초기 화면으로 이동 (No 선택 시)
  const handleDeclineAndReset = () => {
    setStep("select");
    setSelectedParcel(null);
    setCurrentQuestion(0);
    setAnswers({});
    setAiResult(null);
    setApplicationForm({ contact: "", email: "", additionalNotes: "" });
  };

  // 신청 제출
  const handleSubmit = () => {
    if (!selectedParcel || !aiResult) return;

    const landInfo: LandInfo = {
      id: selectedParcel.id,
      address: selectedParcel.address,
      area: selectedParcel.area,
      remainingArea: selectedParcel.remainingArea,
      landCategory: selectedParcel.landCategory,
      landUse: selectedParcel.landUse,
      roadContact: selectedParcel.roadContact,
      ownerName: selectedParcel.ownerName,
      officialPrice: 500000,
      acquisitionDate: "2020-03-15",
    };

    const aiResultData: AIAnalysisResult = {
      provisionalJudgment: aiResult.judgment === "매수 가능성 높음" ? "수용가능" : "수용불가",
      confidenceScore: aiResult.score,
      reasoning: aiResult.reasoning,
      comparisonCases: [],
      reviewDate: new Date().toISOString(),
      reviewerId: "AI-SYSTEM",
    };

    const application: Application = {
      id: `APP-${Date.now()}`,
      applicantName: selectedParcel.ownerName,
      applicantContact: applicationForm.contact,
      applicantEmail: applicationForm.email,
      applicationDate: new Date().toISOString(),
      status: "검토중",
      landInfo,
      aiResult: aiResultData,
      documents: [],
      additionalNotes: applicationForm.additionalNotes,
    };

    setStep("complete");
    
    setTimeout(() => {
      onComplete(application);
    }, 2000);
  };

  // 현재 질문에 대한 답변이 있는지 확인
  const currentQuestionData = questions[currentQuestion];
  const hasAnswer = currentQuestionData ? !!answers[currentQuestionData.id] : false;

  // 스텝 정보 정의
  const steps = [
    { id: "select", label: "잔여지 선택", icon: MapPin },
    { id: "questions", label: "정보 입력", icon: FileText },
    { id: "analysis", label: "AI 분석", icon: Brain },
    { id: "application", label: "신청서 작성", icon: ClipboardCheck },
  ];

  // 현재 스텝 인덱스 계산
  const getCurrentStepIndex = () => {
    switch (step) {
      case "select": return 0;
      case "questions": return 1;
      case "analysis": 
      case "decision": return 2;
      case "application": return 3;
      case "complete": return 4;
      default: return 0;
    }
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="max-w-2xl mx-auto">
      {/* 스텝 인디케이터 */}
      {step !== "complete" && step !== "decision" && (
        <div className="mb-10">
          <div className="flex items-center justify-between">
            {steps.map((s, index) => (
              <div key={s.id} className="flex items-center flex-1">
                {/* 스텝 원형 + 라벨 */}
                <div className="flex flex-col items-center">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      index < currentStepIndex
                        ? "bg-[#2E8B57] text-white"
                        : index === currentStepIndex
                        ? "bg-[#2E8B57] text-white ring-4 ring-green-100"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {index < currentStepIndex ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <s.icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className={`mt-2 text-xs font-medium whitespace-nowrap ${
                    index <= currentStepIndex ? "text-[#2E8B57]" : "text-gray-400"
                  }`}>
                    {s.label}
                  </span>
                </div>
                
                {/* 연결선 (마지막 아이템 제외) */}
                {index < steps.length - 1 && (
                  <div className="flex-1 mx-3 mt-[-20px]">
                    <div className={`h-1 rounded-full transition-all ${
                      index < currentStepIndex ? "bg-[#2E8B57]" : "bg-gray-200"
                    }`} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 질문 진행 상황 (질문 단계일 때만) */}
          {step === "questions" && (
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600 font-medium">질문 {currentQuestion + 1} / {questions.length}</span>
                <span className="text-[#2E8B57] font-medium">{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#2E8B57] transition-all duration-300 ease-out"
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 1: 잔여지 선택 */}
      {step === "select" && (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              매수 신청할 잔여지를 선택해 주세요
            </h2>
            <p className="text-gray-500">
              본인 소유의 잔여지 목록입니다. 신청할 토지를 선택해 주세요.
            </p>
          </div>

          {/* 검색바 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="주소로 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>

          {/* 잔여지 개수 표시 */}
          <div className="text-sm text-gray-500">
            <span>총 {filteredParcels.length}개의 잔여지</span>
          </div>

          {/* 잔여지 카드 그리드 */}
          <div className="max-h-[400px] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredParcels.map((parcel) => (
                <Card
                  key={parcel.id}
                  className={`p-4 cursor-pointer transition-all border-2 ${
                    selectedParcel?.id === parcel.id
                      ? "border-[#2E8B57] bg-green-50 shadow-md"
                      : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                  }`}
                  onClick={() => handleSelectParcel(parcel)}
                >
                  <div className="flex items-start gap-3">
                    {/* 선택 인디케이터 */}
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      selectedParcel?.id === parcel.id
                        ? "border-[#2E8B57] bg-[#2E8B57]"
                        : "border-gray-300"
                    }`}>
                      {selectedParcel?.id === parcel.id && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>

                    {/* 토지 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded truncate max-w-[150px]">
                          {parcel.projectName}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded">
                          {parcel.landCategory}
                        </span>
                      </div>
                      <h3 className="font-medium text-gray-900 text-sm mb-2 line-clamp-2">
                        {parcel.address}
                      </h3>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Ruler className="w-3 h-3" />
                          잔여 {parcel.remainingArea}m²
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {parcel.roadContact}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {filteredParcels.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="font-medium">검색 결과가 없습니다</p>
              <p className="text-sm mt-1">다른 검색어로 시도해 보세요</p>
            </div>
          )}

          <div className="flex justify-end pt-6">
            <Button
              onClick={handleNext}
              disabled={!selectedParcel}
              className="bg-[#2E8B57] hover:bg-[#256b45] text-white px-8 py-6 text-lg rounded-xl"
            >
              다음
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: 질문 단계 */}
      {step === "questions" && currentQuestionData && (
        <div className="space-y-8">
          {/* 뒤로가기 */}
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>이전</span>
          </button>

          {/* 질문 */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {currentQuestionData.title}
            </h2>
            <p className="text-gray-500">
              {currentQuestionData.subtitle}
            </p>
          </div>

          {/* 답변 옵션 */}
          <div className="space-y-3">
            {currentQuestionData.type === "radio" && currentQuestionData.options && (
              <RadioGroup
                value={answers[currentQuestionData.id] || ""}
                onValueChange={(value) => handleAnswer(currentQuestionData.id, value)}
                className="space-y-3"
              >
                {currentQuestionData.options.map((option) => (
                  <Label
                    key={option.value}
                    htmlFor={option.value}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      answers[currentQuestionData.id] === option.value
                        ? "border-[#2E8B57] bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      answers[currentQuestionData.id] === option.value
                        ? "border-[#2E8B57] bg-[#2E8B57]"
                        : "border-gray-300"
                    }`}>
                      {answers[currentQuestionData.id] === option.value && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <span className="text-gray-900">{option.label}</span>
                  </Label>
                ))}
              </RadioGroup>
            )}

            {currentQuestionData.type === "textarea" && (
              <Textarea
                value={answers[currentQuestionData.id] || ""}
                onChange={(e) => handleAnswer(currentQuestionData.id, e.target.value)}
                placeholder={currentQuestionData.placeholder}
                className="min-h-[150px] text-lg p-4 rounded-xl border-2 border-gray-200 focus:border-[#2E8B57] focus:ring-[#2E8B57]"
              />
            )}
          </div>

          <div className="flex justify-end pt-6">
            <Button
              onClick={handleNext}
              disabled={!hasAnswer}
              className="bg-[#2E8B57] hover:bg-[#256b45] text-white px-8 py-6 text-lg rounded-xl"
            >
              {currentQuestion === questions.length - 1 ? "AI 분석 시작" : "다음"}
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: AI 분석 결과 */}
      {step === "analysis" && (
        <div className="space-y-8">
          {isAnalyzing ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 relative">
                <div className="absolute inset-0 border-4 border-gray-200 rounded-full" />
                <div className="absolute inset-0 border-4 border-[#2E8B57] rounded-full border-t-transparent animate-spin" />
                <Brain className="w-8 h-8 text-[#2E8B57] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                AI가 분석 중입니다
              </h2>
              <p className="text-gray-500">
                입력하신 정보를 바탕으로 매수 가능성을 분석하고 있어요.<br />
                잠시만 기다려 주세요.
              </p>
            </div>
          ) : aiResult && (
            <div className="space-y-6">
              {/* 뒤로가기 */}
              <button
                onClick={handleBack}
                className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>이전</span>
              </button>

              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  AI 분석 결과
                </h2>
                <p className="text-gray-500">
                  입력하신 정보를 바탕으로 분석한 결과입니다
                </p>
              </div>

              {/* 분석 결과 카드 */}
              <Card className={`p-6 border-2 ${
                aiResult.judgment === "매수 가능성 높음" 
                  ? "border-emerald-200 bg-emerald-50" 
                  : "border-rose-200 bg-rose-50"
              }`}>
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                    aiResult.judgment === "매수 가능성 높음"
                      ? "bg-emerald-500"
                      : "bg-rose-500"
                  }`}>
                    {aiResult.judgment === "매수 가능성 높음" ? (
                      <CheckCircle className="w-8 h-8 text-white" />
                    ) : (
                      <XCircle className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${
                      aiResult.judgment === "매수 가능성 높음"
                        ? "text-emerald-700"
                        : "text-rose-700"
                    }`}>
                      {aiResult.judgment}
                    </h3>
                    <p className="text-gray-600">신뢰도 {aiResult.score}%</p>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {aiResult.reasoning}
                </p>
              </Card>

              {/* 선택한 토지 정보 */}
              {selectedParcel && (
                <Card className="p-5 border-2 border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">분석 대상 토지</h3>
                  <p className="text-gray-700">{selectedParcel.address}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    잔여 면적: {selectedParcel.remainingArea}m² | {selectedParcel.landCategory} | {selectedParcel.roadContact}
                  </p>
                </Card>
              )}

              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => setStep("decision")}
                  className="bg-[#2E8B57] hover:bg-[#256b45] text-white px-8 py-6 text-lg rounded-xl"
                >
                  다음
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 4: 진행 여부 확인 */}
      {step === "decision" && (
        <div className="space-y-8">
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              매수 신청을 진행하시겠습니까?
            </h2>
            <p className="text-gray-500">
              AI 분석 결과를 확인하셨습니다.<br />
              매수 신청서를 작성하시겠습니까?
            </p>
          </div>

          {/* AI 결과 요약 */}
          {aiResult && (
            <Card className={`p-4 border-2 ${
              aiResult.judgment === "매수 가능성 높음" 
                ? "border-emerald-200 bg-emerald-50" 
                : "border-rose-200 bg-rose-50"
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  aiResult.judgment === "매수 가능성 높음"
                    ? "bg-emerald-500"
                    : "bg-rose-500"
                }`}>
                  {aiResult.judgment === "매수 가능성 높음" ? (
                    <CheckCircle className="w-5 h-5 text-white" />
                  ) : (
                    <XCircle className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <p className={`font-semibold ${
                    aiResult.judgment === "매수 가능성 높음"
                      ? "text-emerald-700"
                      : "text-rose-700"
                  }`}>
                    {aiResult.judgment}
                  </p>
                  <p className="text-sm text-gray-600">신뢰도 {aiResult.score}%</p>
                </div>
              </div>
            </Card>
          )}

          <div className="flex gap-4 pt-4">
            <Button
              onClick={handleDeclineAndReset}
              variant="outline"
              className="flex-1 py-6 text-lg rounded-xl border-2"
            >
              아니오, 다시 선택할게요
            </Button>
            <Button
              onClick={handleNext}
              className="flex-1 bg-[#2E8B57] hover:bg-[#256b45] text-white py-6 text-lg rounded-xl"
            >
              네, 신청할게요
            </Button>
          </div>
        </div>
      )}

      {/* Step 5: 신청서 양식 */}
      {step === "application" && selectedParcel && (
        <div className="space-y-8">
          {/* 뒤로가기 */}
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>이전</span>
          </button>

          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              신청서를 작성해 주세요
            </h2>
            <p className="text-gray-500">
              마지막 단계입니다. 연락처 정보를 입력해 주세요.
            </p>
          </div>

          {/* 신청자 정보 */}
          <Card className="p-5 border-2 border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">신청자 정보</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-gray-600 mb-1.5 block">신청자명</Label>
                <Input
                  value={selectedParcel.ownerName}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div>
                <Label className="text-sm text-gray-600 mb-1.5 block">연락처 *</Label>
                <Input
                  placeholder="010-0000-0000"
                  value={applicationForm.contact}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, contact: e.target.value }))}
                />
              </div>
              <div>
                <Label className="text-sm text-gray-600 mb-1.5 block">이메일 *</Label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={applicationForm.email}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>
          </Card>

          {/* 대상 토지 */}
          <Card className="p-5 border-2 border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">대상 토지</h3>
            <p className="text-gray-700">{selectedParcel.address}</p>
            <p className="text-sm text-gray-500 mt-1">
              잔여 면적: {selectedParcel.remainingArea}m² | {selectedParcel.landCategory} | {selectedParcel.roadContact}
            </p>
          </Card>

          {/* 추가 메모 */}
          <div>
            <Label className="text-sm text-gray-600 mb-1.5 block">추가 요청사항 (선택)</Label>
            <Textarea
              placeholder="담당자에게 전달할 추가 요청사항이 있으시면 작성해 주세요."
              value={applicationForm.additionalNotes}
              onChange={(e) => setApplicationForm(prev => ({ ...prev, additionalNotes: e.target.value }))}
              className="min-h-[100px]"
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleNext}
              disabled={!applicationForm.contact || !applicationForm.email}
              className="bg-[#2E8B57] hover:bg-[#256b45] text-white px-8 py-6 text-lg rounded-xl"
            >
              신청 완료
            </Button>
          </div>
        </div>
      )}

      {/* Step 6: 완료 */}
      {step === "complete" && (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-[#2E8B57] rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            신청이 완료되었습니다
          </h2>
          <p className="text-gray-500 mb-8">
            담당자 검토 후 결과를 안내드리겠습니다.<br />
            신청 현황에서 진행 상태를 확인하실 수 있습니다.
          </p>
          <Button
            onClick={onCancel}
            className="bg-[#2E8B57] hover:bg-[#256b45] text-white px-8 py-3 rounded-xl"
          >
            확인
          </Button>
        </div>
      )}
    </div>
  );
}
