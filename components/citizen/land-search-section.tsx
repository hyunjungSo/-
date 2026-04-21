"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LeafletMap } from "@/components/leaflet-map";
import { dummyLandInfoList } from "@/lib/dummy-data";
import type { LandInfo, AIAnalysisResult, JudgmentRationale } from "@/lib/types";
import { Search, MapPin, ChevronRight, Bot, CheckCircle2, XCircle, AlertTriangle, Loader2, RotateCcw, Info, Ban, FileText, Scale, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface LandSearchSectionProps {
  onLandSelect: (land: LandInfo, aiResult: AIAnalysisResult) => void;
}

// 행정구역 데이터 (전국 17개 시도)
const regionData = {
  시도: [
    "서울특별시", "부산광역시", "대구광역시", "인천광역시", "광주광역시", 
    "대전광역시", "울산광역시", "세종특별자치시", "경기도", "강원특별자치도", 
    "충청북도", "충청남도", "전북특별자치도", "전라남도", "경상북도", 
    "경상남도", "제주특별자치도"
  ],
  시군구: {
    "서울특별시": ["강남구", "강동구", "강북구", "강서구", "관악구", "광진구", "구로구", "금천구", "노원구", "도봉구", "동대문구", "동작구", "마포구", "서대문구", "서초구", "성동구", "성북구", "송파구", "양천구", "영등포구", "용산구", "은평구", "종로구", "중구", "중랑구"],
    "부산광역시": ["강서구", "금정구", "기장군", "남구", "동구", "동래구", "부산진구", "북구", "사상구", "사하구", "서구", "수영구", "연제구", "영도구", "중구", "해운대구"],
    "대구광역시": ["남구", "달서구", "달성군", "동구", "북구", "서구", "수성구", "중구"],
    "인천광역시": ["강화군", "계양구", "남동구", "동구", "미추홀구", "부평구", "서구", "연수구", "옹진군", "중구"],
    "광주광역시": ["광산구", "남구", "동구", "북구", "서구"],
    "대전광역시": ["대덕구", "동구", "서구", "유성구", "중구"],
    "울산광역시": ["남구", "동구", "북구", "울주군", "중구"],
    "세종특별자치시": ["세종시"],
    "경기도": ["가평군", "고양시 덕양구", "고양시 일산동구", "고양시 일산서구", "과천시", "광명시", "광주시", "구리시", "군포시", "김포시", "남양주시", "동두천시", "부천시", "성남시 분당구", "성남시 수정구", "성남시 중원구", "수원시 권선구", "수원시 영통구", "수원시 장안구", "수원시 팔달구", "시흥시", "안산시 단원구", "안산시 상록구", "안성시", "안양시 동안구", "안양시 만안구", "양주시", "양평군", "여주시", "연천군", "오산시", "용인시 기흥구", "용인시 수지구", "용인시 처인구", "의왕시", "의정부시", "이천시", "파주시", "평택시", "포천시", "하남시", "화성시"],
    "강원특별자치도": ["강릉시", "고성군", "동해시", "삼척시", "속초시", "양구군", "양양군", "영월군", "원주시", "인제군", "정선군", "철원군", "춘천시", "태백시", "평창군", "홍천군", "화천군", "횡성군"],
    "충청북도": ["괴산군", "단양군", "보은군", "영동군", "옥천군", "음성군", "제천시", "증평군", "진천군", "청주시 상당구", "청주시 서원구", "청주시 청원구", "청주시 흥덕구", "충주시"],
    "충청남도": ["계룡시", "공주시", "금산군", "논산시", "당진시", "보령시", "부여군", "서산시", "서천군", "아산시", "예산군", "천안시 동남구", "천안시 서북구", "청양군", "태안군", "홍성군"],
    "전북특별자치도": ["고창군", "군산시", "김제시", "남원시", "무주군", "부안군", "순창군", "완주군", "익산시", "임실군", "장수군", "전주시 덕진구", "전주시 완산구", "정읍시", "진안군"],
    "전라남도": ["강진군", "고흥군", "곡성군", "광양시", "구례군", "나주시", "담양군", "목포시", "무안군", "보성군", "순천시", "신안군", "여수시", "영광군", "영암군", "완도군", "장성군", "장흥군", "진도군", "함평군", "해남군", "화순군"],
    "경상북도": ["경산시", "경주시", "고령군", "구미시", "군위군", "김천시", "문경시", "봉화군", "상주시", "성주군", "안동시", "영덕군", "영양군", "영주시", "영천시", "예천군", "울릉군", "울진군", "의성군", "청도군", "청송군", "칠곡군", "포항시 남구", "포항시 북구"],
    "경상남도": ["거제시", "거창군", "고성군", "김해시", "남해군", "밀양시", "사천시", "산청군", "양산시", "의령군", "진주시", "창녕군", "창원시 마산합포구", "창원시 마산회원구", "창원시 성산구", "창원시 의창구", "창원시 진해구", "통영시", "하동군", "함안군", "함양군", "합천군"],
    "제주특별자치도": ["서귀포시", "제주시"],
  },
  읍면동: {
    // 경기도 - 용인시 처인구
    "용인시 처인구": ["양지면", "백암면", "원삼면", "이동읍", "남사읍", "포곡읍", "모현읍"],
    // 경기도 - 이천시
    "이천시": ["마장면", "대월면", "모가면", "백사면", "설성면", "신둔면", "장호원읍", "호법면"],
    // 경기도 - 광주시
    "광주시": ["곤지암읍", "도척면", "퇴촌면", "남종면", "남한산성면", "실촌읍", "오포읍", "초월읍"],
    // 경기도 - 화성시
    "화성시": ["동탄면", "봉담읍", "서신면", "송산면", "양감면", "우정읍", "장안면", "정남면", "팔탄면", "향남읍"],
    // 경기도 - 평택시
    "평택시": ["고덕면", "서탄면", "안중읍", "오성면", "청북읍", "팽성읍", "포승읍", "현덕면"],
    // 충청북도 - 음성군
    "음성군": ["삼성면", "대소면", "금왕읍", "맹동면", "생극면", "소이면", "원남면", "음성읍"],
    // 충청북도 - 진천군
    "진천군": ["진천읍", "덕산면", "초평면", "광혜원면", "만승면", "백곡면", "이월면", "문백면"],
    // 충청남도 - 천안시 동남구
    "천안시 동남구": ["광덕면", "동면", "목천읍", "병천면", "북면", "성남면", "수신면", "풍세면"],
    // 충청남도 - 천안시 서북구
    "천안시 서북구": ["성환읍", "성거읍", "직산읍", "입장면"],
    // 충청남도 - 아산시
    "아산시": ["탕정면", "배방읍", "음봉면", "둔포면", "선장면", "송악면", "신창면", "염치읍", "영인면", "인주면"],
    // 기본값 (선택되지 않은 시군구용)
    "강남구": ["논현동", "삼성동", "역삼동", "청담동"],
    "해운대구": ["우동", "중동", "좌동", "송정동"],
    "세종시": ["조치원읍", "금남면", "부강면", "소정면", "연기면", "연동면", "연서면", "장군면", "전동면", "전의면"],
  },
  리: {
    "양지면": ["마성리", "송문리", "대대리", "남곡리", "추계리", "제일리", "정수리", "평창리"],
    "백암면": ["봉남리", "백봉리", "근창리", "고안리", "박곡리", "석천리", "옥산리", "용천리"],
    "원삼면": ["사암리", "문촌리", "두창리", "고당리", "좌항리", "맹리", "미평리", "죽능리"],
    "이동읍": ["묵리", "시미리", "송전리", "어비리", "천리"],
    "남사읍": ["완장리", "북리", "창리", "봉명리", "아곡리"],
    "마장면": ["덕평리", "이치리", "장암리", "오천리", "표교리", "해월리"],
    "대월면": ["사동리", "초지리", "대월리", "군량리", "송라리"],
    "모가면": ["진가리", "어농리", "소고리", "산내리", "서경리"],
    "곤지암읍": ["신리", "역동리", "삼리", "건업리", "연곡리", "오향리"],
    "도척면": ["진우리", "노곡리", "상림리", "도웅리", "유정리"],
    "퇴촌면": ["정지리", "영동리", "도수리", "관음리", "무수리"],
    "삼성면": ["천남리", "양덕리", "용성리", "대사리", "덕정리"],
    "대소면": ["성본리", "대풍리", "삼호리", "미곡리", "내산리"],
    "금왕읍": ["용계리", "내송리", "호산리", "오선리", "쌍봉리"],
    "진천읍": ["성석리", "연곡리", "읍내리", "벽암리", "행정리"],
    "덕산면": ["용몽리", "구산리", "합목리", "두촌리", "산수리"],
    "초평면": ["용정리", "화산리", "영구리", "금곡리", "오갑리"],
    "성환읍": ["대홍리", "수향리", "매주리", "봉양리", "왕림리"],
    "성거읍": ["요방리", "신월리", "천흥리", "모전리", "송남리"],
    "직산읍": ["군동리", "삼은리", "마정리", "모시리", "신갈리"],
    "탕정면": ["갈산리", "용두리", "매곡리", "호산리", "명암리"],
    "배방읍": ["장재리", "갈매리", "호서리", "공수리", "세교리"],
    "음봉면": ["신수리", "동천리", "쌍용리", "산동리", "외암리"],
    "논현동": [],
    "삼성동": [],
    "역삼동": [],
    "청담동": [],
    "조치원읍": [],
  }
} as const;

// 판단 근거 설명 컴포넌트
function JudgmentRationaleSection({ rationale }: { rationale: JudgmentRationale }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full cursor-pointer justify-between"
          size="sm"
        >
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-primary" />
            <span>판단 근거 상세 보기</span>
          </div>
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3 space-y-3">
        {/* 판단 요약 */}
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-start gap-2">
            <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <h4 className="font-semibold text-foreground">판단 요약</h4>
              <p className="mt-1 text-sm text-muted-foreground">{rationale.summary}</p>
            </div>
          </div>
        </div>

        {/* 법적 근거 */}
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <div className="flex items-start gap-2">
            <Scale className="mt-0.5 h-5 w-5 shrink-0 text-chart-3" />
            <div>
              <h4 className="font-semibold text-foreground">법적 근거</h4>
              <p className="mt-1 text-sm text-muted-foreground">{rationale.legalBasis}</p>
            </div>
          </div>
        </div>

        {/* 적용 기준 */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h4 className="mb-2 font-semibold text-foreground">적용 기준</h4>
          <ul className="space-y-1.5">
            {rationale.appliedCriteria.map((criteria, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>{criteria}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 수동 확인 필요 항목 */}
        {rationale.manualCheckItems && rationale.manualCheckItems.length > 0 && (
          <div className="rounded-lg border border-warning/50 bg-warning/5 p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
              <div>
                <h4 className="font-semibold text-foreground">수동 확인 필요 항목</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  다음 항목은 AI 자동 판독이 불가하여 담당자가 현장 확인 후 판단합니다.
                </p>
                <ul className="mt-2 space-y-1">
                  {rationale.manualCheckItems.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <Info className="h-3 w-3 text-warning" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 상세 설명 */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h4 className="mb-2 font-semibold text-foreground">상세 분석 내용</h4>
          <pre className="whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">
            {rationale.detailedExplanation}
          </pre>
        </div>

        {/* 안내 문구 */}
        <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-xs text-muted-foreground">
            본 AI 판독 결과는 참고용이며, 최종 판정은 담당자 검토 및 관련 법령에 따라 결정됩니다. 
            판단 근거에 이의가 있으시면 신청서 제출 시 의견을 기재해 주시기 바랍니다.
          </p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// AI 분석 결과 시뮬레이션
function simulateAIAnalysis(land: LandInfo): AIAnalysisResult {
  const shapeIndexChange = land.remainingShapeIndex - land.originalShapeIndex;
  
  const criteriaChecks = [
    {
      criteriaName: "잔여지 비율",
      criteriaDescription: `잔여 비율 ${land.remainingRatio}% (기준: 30% 이하)`,
      isMet: land.remainingRatio <= 30,
      autoDetected: true,
    },
    {
      criteriaName: "형상지수 변화",
      criteriaDescription: `형상지수 변화 +${shapeIndexChange.toFixed(1)} (기준: 1.0 이상)`,
      isMet: shapeIndexChange >= 1.0,
      autoDetected: true,
    },
    {
      criteriaName: "��지 형상",
      criteriaDescription: `잔여지 ��상: ${land.remainingShape}`,
      isMet: ["부정형", "삼각형", "역삼각형", "자루형"].includes(land.remainingShape),
      autoDetected: true,
    },
    {
      criteriaName: "접면도로 상실",
      criteriaDescription: "접면도로 상실로 건축허가 불가 또는 종래 목적 사용 곤란",
      isMet: false,
      autoDetected: false,
    },
  ];

  if (land.landType === "농지") {
    criteriaChecks.push({
      criteriaName: "농기계 진입/회전 곤란",
      criteriaDescription: "농기계 진입 및 회전이 곤란하여 영농이 불가능한 경우",
      isMet: false,
      autoDetected: false,
    });
    criteriaChecks.push({
      criteriaName: "수로 상실",
      criteriaDescription: "관개수로 상실로 농업용수 공급이 불가능한 경우",
      isMet: false,
      autoDetected: false,
    });
  }

  const metAutoCriteria = criteriaChecks.filter(c => c.isMet && c.autoDetected).length;
  const hasManualCheckNeeded = criteriaChecks.some(c => !c.autoDetected);
  const manualCheckItems = criteriaChecks.filter(c => !c.autoDetected).map(c => c.criteriaName);
  const metCriteriaNames = criteriaChecks.filter(c => c.isMet).map(c => c.criteriaName);
  
  const isBorderlineCase = metAutoCriteria === 1 && hasManualCheckNeeded;
  
  let provisionalJudgment: "매수" | "기각" | "심의위원회이관";
  let borderlineReason: string | undefined;
  
  if (isBorderlineCase) {
    provisionalJudgment = "심의위원회이관";
    borderlineReason = "자동 판독 기준 충족이 애매합니다. 담당자 검토 후 최종 결정됩니다.";
  } else if (metAutoCriteria >= 2) {
    provisionalJudgment = "매수";
  } else {
    provisionalJudgment = "기각";
  }

  const judgmentRationale: JudgmentRationale = generateJudgmentRationale(
    land,
    provisionalJudgment,
    metAutoCriteria,
    metCriteriaNames,
    manualCheckItems,
    shapeIndexChange
  );
  
  return {
    landTypePath: land.landType,
    criteriaChecks,
    provisionalJudgment,
    originalShapeIndex: land.originalShapeIndex,
    remainingShapeIndex: land.remainingShapeIndex,
    shapeIndexChange,
    isBlindLand: land.remainingRatio <= 20,
    accessRoadLost: false,
    waterChannelLost: false,
    farmMachineDifficulty: false,
    isBorderlineCase,
    borderlineReason,
    judgmentRationale,
  };
}

// 판단 근거 설명 생성 함수
function generateJudgmentRationale(
  land: LandInfo,
  judgment: "매수" | "기각" | "심의위원회이관",
  metCriteriaCount: number,
  metCriteriaNames: string[],
  manualCheckItems: string[],
  shapeIndexChange: number
): JudgmentRationale {
  const legalBasis = "「공익사업을 위한 토지 등의 취득 및 보상에 관한 법률」 제74조(잔여지의 매수청구 등) 및 동법 시행규칙 제34조(잔여지 등의 매수청구)";
  
  let summary: string;
  let detailedExplanation: string;
  const appliedCriteria: string[] = [];

  if (land.landType === "대지") {
    appliedCriteria.push(`대지 면적 기준: 주거지역 90㎡, 상업지역 150㎡, 공업지역 330㎡ 이하`);
  } else if (land.landType === "농지") {
    appliedCriteria.push(`농지 면적 기준: 330㎡ 이하`);
  } else if (land.landType === "산지") {
    appliedCriteria.push(`산지 면적 기준: 990㎡ 이하`);
  } else {
    appliedCriteria.push(`그 밖의 토지 면적 기준: 330㎡ 이하`);
  }
  
  appliedCriteria.push(`형상지수 변화 기준: 편입 전 대비 1.0 이상 상승 시 형상 불량으로 판단`);
  appliedCriteria.push(`토지 형상 기준: 삼각형, 역삼각형, 자루형, 부정형 등 불규칙 형상`);
  appliedCriteria.push(`잔여비율 기준: 30% 이하일 경우 종래 목적 사용 곤란으로 판단`);

  if (judgment === "매수") {
    summary = `본 토지는 잔여지 매수 기준 ${metCriteriaCount}개 항목을 충족하여 「매수 가능」으로 판정되었습니다.`;
    detailedExplanation = `1. 분석 대상 토지\n- 소재지: ${land.address}\n- 토지 유형: ${land.landType}\n- 지목: ${land.landCategory}\n\n2. 편입 현황\n- 편입 전 ���적: ${land.originalArea.toLocaleString()}㎡\n- 편입 면적: ${land.includedArea.toLocaleString()}㎡\n- 잔여 면적: ${land.remainingArea.toLocaleString()}㎡\n- 잔여 비율: ${land.remainingRatio}%\n\n3. 형상 분석\n- 편입 전 형상: ${land.originalShape} (형상지수 ${land.originalShapeIndex})\n- 잔여지 형상: ${land.remainingShape} (형상지수 ${land.remainingShapeIndex})\n- 형상지수 변화: +${shapeIndexChange.toFixed(1)}\n\n4. 충족 기준\n${metCriteriaNames.map((name, i) => `${i + 1}) ${name}`).join("\n")}\n\n5. 판정 결과\n위 분석 결과, 본 토지는 공익사업 편입으로 인해 잔여지의 종래 목적대로 사용이 현저히 곤란하게 되었으므로, 잔여지 매수 청구 대상에 해당합니다.`;
  } else if (judgment === "기각") {
    summary = `본 토지는 잔여지 매수 기준을 충족하지 않아 「기각」으로 판정되었습니다.`;
    detailedExplanation = `1. 분석 대상 토지\n- 소재지: ${land.address}\n- 토지 유형: ${land.landType}\n- 지목: ${land.landCategory}\n\n2. 편입 현황\n- 편입 전 면적: ${land.originalArea.toLocaleString()}㎡\n- 편입 면적: ${land.includedArea.toLocaleString()}㎡\n- 잔여 면적: ${land.remainingArea.toLocaleString()}㎡\n- 잔여 비율: ${land.remainingRatio}%\n\n3. 형상 분석\n- 편입 전 형상: ${land.originalShape} (형상지수 ${land.originalShapeIndex})\n- 잔여지 형상: ${land.remainingShape} (형상지수 ${land.remainingShapeIndex})\n- 형상지수 변화: +${shapeIndexChange.toFixed(1)}\n\n4. 미충족 사유\n- 잔여 비율 ${land.remainingRatio}%로 기준(30% 이하) 초과\n- 형상지수 변화 ${shapeIndexChange.toFixed(1)}로 기준(1.0 이상) 미달\n\n5. 판정 결과\n위 분석 결과, 본 토지는 공익사업 편입 후에도 잔여지의 종래 목적대로 사용이 가능한 것으로 판단되어, 잔여지 매수 청구 대상에 해당하지 않습니다.`;
  } else {
    summary = `본 토지는 자동 판독 기준 충족이 애매하여 담당자 검토가 필요한 「경계 사례」로 분류되었습니다.`;
    detailedExplanation = `1. 분석 대상 토지\n- 소재지: ${land.address}\n- 토지 유형: ${land.landType}\n- 지목: ${land.landCategory}\n\n2. 편입 현황\n- 편입 전 면적: ${land.originalArea.toLocaleString()}㎡\n- 편입 면적: ${land.includedArea.toLocaleString()}㎡\n- 잔여 면적: ${land.remainingArea.toLocaleString()}㎡\n- 잔여 비율: ${land.remainingRatio}%\n\n3. 형상 분석\n- 편입 전 형상: ${land.originalShape} (형상지수 ${land.originalShapeIndex})\n- 잔여지 형상: ${land.remainingShape} (형상지수 ${land.remainingShapeIndex})\n- 형상지수 변화: +${shapeIndexChange.toFixed(1)}\n\n4. 경계 사례 판정 사유\n- 자동 판독 기준 일부만 충족\n- 수동 확인 필요 항목: ${manualCheckItems.join(", ")}\n\n5. 판정 결과\n위 분석 결과, 본 토지는 자동 판독만으로 명확한 판정이 어려워 담당자 검토 후 최종 결정됩니다.`;
  }

  return {
    summary,
    legalBasis,
    appliedCriteria,
    manualCheckItems: manualCheckItems.length > 0 ? manualCheckItems : undefined,
    detailedExplanation,
  };
}

export function LandSearchSection({ onLandSelect }: LandSearchSectionProps) {
  // 행정구역 선택 상태
  const [selectedSido, setSelectedSido] = useState<string>("");
  const [selectedSigungu, setSelectedSigungu] = useState<string>("");
  const [selectedEupmyeondong, setSelectedEupmyeondong] = useState<string>("");
  const [selectedRi, setSelectedRi] = useState<string>("");
  const [jibun, setJibun] = useState<string>("");
  
  // 검색 결과 상태
  const [searchResults, setSearchResults] = useState<LandInfo[]>([]);
  const [selectedLand, setSelectedLand] = useState<LandInfo | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  
  // AI 분석 상태
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  
  // 편입토지 없음 상태
  const [noIncludedLand, setNoIncludedLand] = useState(false);

  // 현재 단계 계산
  const currentStep = aiResult ? 4 : aiAnalyzing ? 3 : selectedLand ? 3 : searchResults.length > 0 ? 2 : 1;

  // 검색 실행
  const handleSearch = () => {
    if (!selectedRi) return;
    
    setIsSearching(true);
    setSelectedLand(null);
    setAiResult(null);
    setNoIncludedLand(false);
    
    setTimeout(() => {
      // 선택된 리에 해당하는 토지 필터링
      const results = dummyLandInfoList.filter(land => 
        land.address.includes(selectedRi)
      );
      setSearchResults(results);
      setIsSearching(false);
    }, 500);
  };

  // 필지 선택
  const handleLandSelect = (land: LandInfo) => {
    setSelectedLand(land);
    setAiResult(null);
    setNoIncludedLand(false);
    
    // 편입토지 없는 경우 체크
    if (land.includedArea === 0) {
      setNoIncludedLand(true);
    }
  };

  // AI 판독 실행
  const handleAIAnalysis = () => {
    if (!selectedLand || noIncludedLand) return;
    
    setAiAnalyzing(true);
    
    setTimeout(() => {
      const result = simulateAIAnalysis(selectedLand);
      setAiResult(result);
      setAiAnalyzing(false);
    }, 1500);
  };

  // 초기화
  const handleReset = () => {
    setSelectedSido("");
    setSelectedSigungu("");
    setSelectedEupmyeondong("");
    setSelectedRi("");
    setJibun("");
    setSearchResults([]);
    setSelectedLand(null);
    setAiResult(null);
    setNoIncludedLand(false);
  };

  // 드롭다운 옵션
  const sigunguOptions = selectedSido ? regionData.시군구[selectedSido as keyof typeof regionData.시군구] || [] : [];
  const eupmyeondongOptions = selectedSigungu ? regionData.읍면동[selectedSigungu as keyof typeof regionData.읍면동] || [] : [];
  const riOptions = selectedEupmyeondong ? regionData.리[selectedEupmyeondong as keyof typeof regionData.리] || [] : [];

  return (
    <div className="space-y-6">
      {/* KRDS 진행 단계 표시기 */}
      <nav aria-label="신청 진행 단계" className="w-full">
        <ol className="flex items-center justify-center">
          {[
            { step: 1, label: "지번 조회" },
            { step: 2, label: "필지 선택" },
            { step: 3, label: "AI 판독" },
            { step: 4, label: "결과 확인" },
          ].map((item, idx) => (
            <li key={item.step} className="flex items-center">
              <div className={`flex items-center gap-2 ${currentStep >= item.step ? "text-primary" : "text-gray-400"}`}>
                <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                  currentStep === item.step 
                    ? "bg-primary text-white" 
                    : currentStep > item.step
                      ? "bg-gray-200 text-gray-600"
                      : "bg-gray-100 text-gray-400"
                }`}>
                  {currentStep > item.step ? <CheckCircle2 className="h-5 w-5" /> : item.step}
                </span>
                <span className={`hidden text-sm font-medium sm:block ${
                  currentStep >= item.step ? "text-primary" : "text-gray-400"
                }`}>
                  {item.label}
                </span>
              </div>
              {idx < 3 && (
                <div className={`mx-2 h-px w-8 sm:mx-4 sm:w-12 ${
                  currentStep > item.step ? "bg-primary" : "bg-gray-300"
                }`} aria-hidden="true" />
              )}
            </li>
          ))}
        </ol>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
        {/* 좌측: 검색 영역 */}
        <div className="space-y-4">
          {/* 행정구역 검색 */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Search className="h-5 w-5 text-primary" />
                    토지 조회
                  </CardTitle>
                  <CardDescription className="mt-1 text-xs">
                    행정구역을 선택하여 편입 토지를 조회하세요.
                  </CardDescription>
                </div>
                {(selectedSido || searchResults.length > 0) && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleReset}
                    className="cursor-pointer text-xs text-muted-foreground hover:text-foreground"
                  >
                    <RotateCcw className="mr-1 h-3 w-3" />
                    초기화
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* 시도 */}
              <div className="space-y-2">
                <Label className="text-xs">시도</Label>
                <Select 
                  value={selectedSido} 
                  onValueChange={(v) => {
                    setSelectedSido(v);
                    setSelectedSigungu("");
                    setSelectedEupmyeondong("");
                    setSelectedRi("");
                    setSearchResults([]);
                  }}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="시도 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {regionData.시도.map((sido) => (
                      <SelectItem key={sido} value={sido}>{sido}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 시군구 */}
              <div className="space-y-2">
                <Label className="text-xs">시군구</Label>
                <Select 
                  value={selectedSigungu} 
                  onValueChange={(v) => {
                    setSelectedSigungu(v);
                    setSelectedEupmyeondong("");
                    setSelectedRi("");
                    setSearchResults([]);
                  }}
                  disabled={!selectedSido}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="시군구 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {sigunguOptions.map((sigungu) => (
                      <SelectItem key={sigungu} value={sigungu}>{sigungu}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 읍면동 */}
              <div className="space-y-2">
                <Label className="text-xs">읍면동</Label>
                <Select 
                  value={selectedEupmyeondong} 
                  onValueChange={(v) => {
                    setSelectedEupmyeondong(v);
                    setSelectedRi("");
                    setSearchResults([]);
                  }}
                  disabled={!selectedSigungu || eupmyeondongOptions.length === 0}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder={eupmyeondongOptions.length === 0 ? "해당 없음" : "읍면동 선택"} />
                  </SelectTrigger>
                  <SelectContent>
                    {eupmyeondongOptions.map((eupmyeondong) => (
                      <SelectItem key={eupmyeondong} value={eupmyeondong}>{eupmyeondong}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 리 */}
              <div className="space-y-2">
                <Label className="text-xs">리</Label>
                <Select 
                  value={selectedRi} 
                  onValueChange={setSelectedRi}
                  disabled={!selectedEupmyeondong || riOptions.length === 0}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder={riOptions.length === 0 ? "해당 없음" : "리 선택"} />
                  </SelectTrigger>
                  <SelectContent>
                    {riOptions.map((ri) => (
                      <SelectItem key={ri} value={ri}>{ri}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 지번 */}
              <div className="space-y-2">
                <Label className="text-xs">지번</Label>
                <Input 
                  placeholder="예: 123-4" 
                  value={jibun}
                  onChange={(e) => setJibun(e.target.value)}
                  className="h-10"
                />
              </div>

              {/* 검색 버튼 */}
              <Button 
                onClick={handleSearch} 
                className="w-full cursor-pointer"
                disabled={!selectedRi || isSearching}
              >
                {isSearching ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Search className="mr-2 h-4 w-4" />
                )}
                검색
              </Button>
            </CardContent>
          </Card>

          {/* 필지 목록 */}
          {searchResults.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  검색 결과 ({searchResults.length}건)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="max-h-[300px] divide-y divide-border overflow-y-auto">
                  {searchResults.map((land) => (
                    <li key={land.id}>
                      <button
                        onClick={() => handleLandSelect(land)}
                        className={`w-full cursor-pointer px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
                          selectedLand?.id === land.id ? "border-l-2 border-l-primary bg-primary/5" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">{land.address.split(" ").slice(-2).join(" ")}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {land.landCategory} | {land.originalArea.toLocaleString()}m²
                            </p>
                          </div>
                          {land.includedArea > 0 ? (
                            <span className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">
                              편입 {land.includedArea.toLocaleString()}m²
                            </span>
                          ) : (
                            <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                              편입 없음
                            </span>
                          )}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 우측: 지도 및 결과 영역 */}
        <div className="space-y-4">
          {/* 지도 */}
          <Card className="overflow-hidden">
            <CardContent className="h-[400px] p-0">
              <LeafletMap 
                selectedRegion={selectedRi || selectedEupmyeondong || selectedSigungu || selectedSido}
                onParcelClick={(id) => {
                  const land = searchResults.find(l => l.id === id);
                  if (land) handleLandSelect(land);
                }}
              />
            </CardContent>
          </Card>

          {/* 선택된 토지 정보 및 AI 판독 */}
          {selectedLand && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-sm">선택된 토지 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 토지 기본 정보 */}
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">지번</span>
                      <span className="font-medium">{selectedLand.address.split(" ").slice(-2).join(" ")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">지목</span>
                      <span className="font-medium">{selectedLand.landCategory}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">총면적</span>
                      <span className="font-medium">{selectedLand.originalArea.toLocaleString()}m²</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">편입 면적</span>
                      <span className="font-medium text-destructive">{selectedLand.includedArea.toLocaleString()}m²</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">잔여 면적</span>
                      <span className="font-medium text-primary">{selectedLand.remainingArea.toLocaleString()}m²</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">잔여 비율</span>
                      <span className={`font-bold ${selectedLand.remainingRatio <= 30 ? "text-primary" : "text-foreground"}`}>
                        {selectedLand.remainingRatio}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* 편입토지 없음 경고 */}
                {noIncludedLand && (
                  <div className="rounded-lg border-2 border-destructive bg-destructive/5 p-4">
                    <div className="flex items-center gap-3">
                      <Ban className="h-8 w-8 text-destructive" />
                      <div>
                        <h4 className="font-bold text-destructive">편입토지 없음</h4>
                        <p className="mt-1 text-sm text-muted-foreground">
                          해당 토지는 도로 등에 편입된 토지가 없어 잔여지 매수 신청이 불가합니다.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI 판독 버튼 */}
                {!noIncludedLand && !aiResult && (
                  <Button 
                    onClick={handleAIAnalysis}
                    className="w-full cursor-pointer"
                    size="lg"
                    disabled={aiAnalyzing}
                  >
                    {aiAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        AI 판독 중...
                      </>
                    ) : (
                      <>
                        <Bot className="mr-2 h-5 w-5" />
                        AI 판독 ���작
                      </>
                    )}
                  </Button>
                )}

                {/* AI 판독 결과 */}
                {aiResult && (
                  <div className="space-y-3">
                    <div className={`rounded-lg border-2 p-4 ${
                      aiResult.provisionalJudgment === "매수" 
                        ? "border-primary bg-primary/5" 
                        : aiResult.provisionalJudgment === "심의위원회이관"
                          ? "border-warning bg-warning/5"
                          : "border-destructive bg-destructive/5"
                    }`}>
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bot className="h-5 w-5 text-primary" />
                          <span className="font-semibold">AI 판독 결과</span>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-sm font-bold ${
                          aiResult.provisionalJudgment === "매수"
                            ? "bg-primary text-white"
                            : aiResult.provisionalJudgment === "심의위원회이관"
                              ? "bg-warning text-white"
                              : "bg-destructive text-white"
                        }`}>
                          {aiResult.provisionalJudgment === "매수" 
                            ? "매수 가능" 
                            : aiResult.provisionalJudgment === "심의위원회이관"
                              ? "경계 사례"
                              : "기준 미충족"}
                        </span>
                      </div>

                      {/* 기준 체크 결과 */}
                      <div className="space-y-1.5">
                        {aiResult.criteriaChecks.filter(c => c.autoDetected).map((check, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            {check.isMet ? (
                              <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                            ) : (
                              <XCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
                            )}
                            <span className={check.isMet ? "text-foreground" : "text-muted-foreground"}>
                              {check.criteriaName}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* 수동 확인 필요 항목 */}
                      {aiResult.criteriaChecks.some(c => !c.autoDetected) && (
                        <div className="mt-3 space-y-1.5 border-t border-border pt-3">
                          <p className="text-xs font-medium text-amber-600">현장 확인 필요</p>
                          {aiResult.criteriaChecks.filter(c => !c.autoDetected).map((check, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
                              <span className="text-muted-foreground">{check.criteriaName}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 경계 사례 안내 */}
                    {aiResult.isBorderlineCase && (
                      <div className="flex items-start gap-2 rounded-lg border border-warning/50 bg-warning/10 p-3">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                        <p className="text-xs text-muted-foreground">
                          {aiResult.borderlineReason}
                        </p>
                      </div>
                    )}

                    {/* 판단 근거 */}
                    <JudgmentRationaleSection rationale={aiResult.judgmentRationale} />

                    {/* 매수 신청 버튼 */}
                    <Button 
                      className="w-full cursor-pointer" 
                      size="lg"
                      onClick={() => onLandSelect(selectedLand, aiResult)}
                    >
                      {aiResult.provisionalJudgment === "매수" 
                        ? "매수 신청 진행하기" 
                        : aiResult.provisionalJudgment === "심의위원회이관"
                          ? "검토 요청 신청하기"
                          : "그래도 신청하기"}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* 검색 전 안내 */}
          {!selectedLand && searchResults.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="flex h-[300px] flex-col items-center justify-center text-center">
                <div className="rounded-full bg-muted p-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="mt-4 font-medium">토지를 조회해 주세요</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  좌측에서 행정구역을 선택하여 편입 토지를 검색하세요.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
