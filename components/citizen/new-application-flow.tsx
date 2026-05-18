"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Check, ChevronLeft, MapPin, Ruler, Home, Calendar, Search } from "lucide-react";
import type { LandInfo, AIAnalysisResult, Application } from "@/lib/types";

// 더미 잔여지 데이터 (사용자 소유) - 많은 항목 시뮬레이션
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
  {
    id: "price",
    title: "희망하시는 매수 가격대가 있으신가요?",
    subtitle: "선택사항입니다. 공시지가 기준으로 산정됩니다",
    type: "radio" as const,
    options: [
      { value: "official", label: "공시지가 기준으로 산정" },
      { value: "market", label: "시세 반영을 희망" },
      { value: "negotiate", label: "협의를 통해 결정" },
    ],
  },
];

interface NewApplicationFlowProps {
  onComplete: (application: Application) => void;
  onCancel: () => void;
}

export function NewApplicationFlow({ onComplete, onCancel }: NewApplicationFlowProps) {
  // 플로우 단계: select(잔여지 선택) -> questions(질문) -> confirm(확인) -> complete(완료)
  const [step, setStep] = useState<"select" | "questions" | "confirm" | "complete">("select");
  const [selectedParcel, setSelectedParcel] = useState<typeof myParcels[0] | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // 검색 필터링된 잔여지 목록
  const filteredParcels = useMemo(() => {
    if (!searchQuery.trim()) return myParcels;
    const query = searchQuery.toLowerCase();
    return myParcels.filter(
      parcel => parcel.address.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // 진행률 계산
  const totalSteps = questions.length + 2; // 선택 + 질문들 + 확인
  const currentStep = step === "select" ? 1 : step === "questions" ? currentQuestion + 2 : totalSteps;
  const progress = (currentStep / totalSteps) * 100;

  // 잔여지 선택
  const handleSelectParcel = (parcel: typeof myParcels[0]) => {
    setSelectedParcel(parcel);
  };

  // 다음 단계로
  const handleNext = () => {
    if (step === "select" && selectedParcel) {
      setStep("questions");
    } else if (step === "questions") {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        setStep("confirm");
      }
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
    } else if (step === "confirm") {
      setCurrentQuestion(questions.length - 1);
      setStep("questions");
    }
  };

  // 답변 저장
  const handleAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  // 신청 제출
  const handleSubmit = async () => {
    setIsAnalyzing(true);
    
    // AI 분석 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (!selectedParcel) return;

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

    const aiResult: AIAnalysisResult = {
      provisionalJudgment: "수용가능",
      confidenceScore: 85,
      reasoning: "잔여지 면적이 최소 기준을 충족하며, 도로 접근성 저하로 인한 활용도 감소가 인정됩니다.",
      comparisonCases: [],
      reviewDate: new Date().toISOString(),
      reviewerId: "AI-SYSTEM",
    };

    const application: Application = {
      id: `APP-${Date.now()}`,
      applicantName: selectedParcel.ownerName,
      applicantContact: "010-1234-5678",
      applicantEmail: "hong@email.com",
      applicationDate: new Date().toISOString(),
      status: "검토중",
      landInfo,
      aiResult,
      documents: [],
      additionalNotes: answers.reason || "",
    };

    setIsAnalyzing(false);
    setStep("complete");
    
    setTimeout(() => {
      onComplete(application);
    }, 2000);
  };

  // 현재 질문에 대한 답변이 있는지 확인
  const currentQuestionData = questions[currentQuestion];
  const hasAnswer = currentQuestionData ? !!answers[currentQuestionData.id] : false;

  return (
    <div className="max-w-2xl mx-auto">
      {/* 진행률 바 */}
      {step !== "complete" && (
        <div className="mb-8">
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#2E8B57] transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2 text-right">
            {currentStep} / {totalSteps}
          </p>
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
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>총 {filteredParcels.length}개의 잔여지</span>
            {selectedParcel && (
              <span className="text-[#2E8B57] font-medium">1개 선택됨</span>
            )}
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

          {myParcels.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>등록된 잔여지가 없습니다.</p>
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
              {currentQuestion === questions.length - 1 ? "확인하기" : "다음"}
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: 확인 */}
      {step === "confirm" && selectedParcel && (
        <div className="space-y-8">
          {/* 뒤로가기 */}
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>이전</span>
          </button>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              입력하신 내용을 확인해 주세요
            </h2>
            <p className="text-gray-500">
              아래 내용으로 매수 신청을 진행합니다
            </p>
          </div>

          {/* 선택된 토지 정보 */}
          <Card className="p-5 border-2 border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">선택한 잔여지</h3>
            <p className="text-gray-700">{selectedParcel.address}</p>
            <p className="text-sm text-gray-500 mt-1">
              잔여 면적: {selectedParcel.remainingArea}m² | {selectedParcel.landCategory} | {selectedParcel.roadContact}
            </p>
          </Card>

          {/* 답변 요약 */}
          <Card className="p-5 border-2 border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">입력 정보</h3>
            <div className="space-y-3 text-sm">
              {questions.map((q) => {
                const answer = answers[q.id];
                const displayAnswer = q.options 
                  ? q.options.find(o => o.value === answer)?.label 
                  : answer;
                return (
                  <div key={q.id} className="flex justify-between items-start">
                    <span className="text-gray-500">{q.title.replace("?", "")}</span>
                    <span className="text-gray-900 text-right ml-4">{displayAnswer || "-"}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          <div className="flex justify-end pt-6">
            <Button
              onClick={handleSubmit}
              disabled={isAnalyzing}
              className="bg-[#2E8B57] hover:bg-[#256b45] text-white px-8 py-6 text-lg rounded-xl"
            >
              {isAnalyzing ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  AI 분석 중...
                </span>
              ) : (
                "신청하기"
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: 완료 */}
      {step === "complete" && (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-[#2E8B57] rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            신청이 완료되었습니다
          </h2>
          <p className="text-gray-500 mb-8">
            신청 내역은 &apos;신청현황 조회&apos;에서 확인하실 수 있습니다
          </p>
        </div>
      )}
    </div>
  );
}
