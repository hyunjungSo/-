"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LeafletMap } from "@/components/leaflet-map";
import { dummyLandInfoList } from "@/lib/dummy-data";
import type { LandInfo, AIAnalysisResult, JudgmentRationale, ApplicationCartItem } from "@/lib/types";
import { Search, MapPin, ChevronRight, ChevronLeft, Bot, CheckCircle2, XCircle, AlertTriangle, Loader2, RotateCcw, Info, Ban, FileText, Scale, ChevronDown, ChevronUp, ShoppingCart, Plus, Trash2, X } from "lucide-react";


interface LandSearchSectionProps {
  onLandSelect: (land: LandInfo, aiResult: AIAnalysisResult) => void;
  cartItems: ApplicationCartItem[];
  onAddToCart: (land: LandInfo, aiResult: AIAnalysisResult) => void;
  onRemoveFromCart: (itemId: string) => void;
  onSubmitCart: (items: ApplicationCartItem[]) => void;
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
    "이천시": ["마장면", "대월면", "모가면", "백사면", "설성면", "신둔면", "장호원읍", "���법면"],
    // 경기도 - 광주시
    "광주시": ["곤지암읍", "도척면", "퇴촌면", "남종면", "남한산성면", "��촌읍", "오포읍", "초월읍"],
    // 경기도 - 화성시
    "화성시": ["동탄면", "봉담읍", "서신면", "송산면", "양감면", "우정읍", "장안면", "정남면", "팔탄면", "향남읍"],
    // 경기도 - ���택시
    "평택시": ["고덕면", "서탄면", "안중읍", "오성면", "청북읍", "팽성읍", "포승읍", "현덕면"],
    // 충청북도 - 음성군
    "음성군": ["삼성면", "대소면", "금왕읍", "맹동면", "생극면", "소이면", "원남면", "음성읍"],
    // 충청북도 - 진천군
    "진천군": ["진천읍", "덕산면", "초평면", "광혜원면", "만승면", "백곡면", "이월면", "문백면"],
    // 충청남도 - 천안시 동남구
    "천안시 동남구": ["광덕면", "동면", "목천읍", "병천면", "북면", "성남면", "수신면", "풍세면"],
    // 충청남도 - 천안시 서북구
    "천안시 서북구": ["성환읍", "성거읍", "직산읍", "���장면"],
    // 충청남도 - 아산시
    "아산시": ["탕정면", "배방읍", "음봉면", "둔포면", "선장면", "송악면", "신창면", "염치읍", "영인면", "인주면"],
    // 기본값 (선택되지 않은 시군구용)
    "강남구": ["논현동", "삼성동", "역삼동", "청담동"],
    "해운대구": ["우동", "중동", "좌동", "송정동", "반여동", "반송동", "석대동", "재송동"],
    "기장군": ["기장읍", "장안읍", "정관읍", "일광면", "철마면"],
    "강서구": ["대저1동", "대저2동", "강동동", "명지동", "녹산동", "가락동", "송정동"],
    "금정구": ["서동", "금사동", "부곡동", "장전동", "선두구동", "청룡동", "남산동", "구서동"],
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
              <p className="mt-1 text-base text-muted-foreground">{rationale.summary}</p>
            </div>
          </div>
        </div>

        {/* 법적 근거 */}
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <div className="flex items-start gap-2">
            <Scale className="mt-0.5 h-5 w-5 shrink-0 text-chart-3" />
            <div>
              <h4 className="font-semibold text-foreground">법적 근거</h4>
              <p className="mt-1 text-base text-muted-foreground">{rationale.legalBasis}</p>
            </div>
          </div>
        </div>

        {/* 적용 기준 */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h4 className="mb-2 font-semibold text-foreground">적용 기준</h4>
          <ul className="space-y-1.5">
            {rationale.appliedCriteria.map((criteria, idx) => (
              <li key={idx} className="flex items-start gap-2 text-base text-muted-foreground">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>{criteria}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 직접 확인 필요 항목 */}
        {rationale.manualCheckItems && rationale.manualCheckItems.length > 0 && (
          <div className="rounded-lg border border-warning/50 bg-warning/5 p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
              <div>
                <h4 className="font-semibold text-foreground">직접 확인 필요 항목</h4>
                <p className="mt-1 text-base text-muted-foreground">
                  다음 항목은 AI 자동 판독이 불가하여 담당자가 현장 확인 후 판단합니다.
                </p>
                <ul className="mt-2 space-y-1">
                  {rationale.manualCheckItems.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-base">
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
          <pre className="whitespace-pre-wrap text-base leading-relaxed text-muted-foreground">
            {rationale.detailedExplanation}
          </pre>
        </div>

        {/* 안내 문구 */}
        <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-base text-muted-foreground">
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
      criteriaName: "형�����지�� 변화",
      criteriaDescription: `형상지수 변화 +${shapeIndexChange.toFixed(1)} (기준: 1.0 이상)`,
      isMet: shapeIndexChange >= 1.0,
      autoDetected: true,
    },
    {
      criteriaName: "잔여지 형상",
      criteriaDescription: `잔여지 형상: ${land.remainingShape}`,
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
  
  // AI 1차 판독: 매수 또는 기각만 판정
  let provisionalJudgment: "매수" | "기각";
  
  if (metAutoCriteria >= 1) {
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
    judgmentRationale,
  };
}

// 중앙토지수용위원회 기준 기반 판단 근거 설명 생성 함수
function generateJudgmentRationale(
  land: LandInfo,
  judgment: "매수" | "기각",
  metCriteriaCount: number,
  metCriteriaNames: string[],
  manualCheckItems: string[],
  shapeIndexChange: number
): JudgmentRationale {
  const legalBasis = "「공익사업을 위한 토지 등의 취득 및 보상에 관한 법률」 제74조(잔여지의 매수청구 등) 및 동법 시행규칙 제34조(잔여지 등의 매수청구), 중앙토지수용위원회 잔여지 수용 및 가치하락 손실보상 참고기준";
  
  let summary: string;
  let detailedExplanation: string;
  const appliedCriteria: string[] = [];

  // 중앙토지수용위원회 기준에 따른 토지 유형별 판단 문장
  if (land.landType === "대지") {
    appliedCriteria.push(`택지(대지) 면적 기준: 주거용(단독주택) 90㎡, 주거용(연립·다세대) 165㎡, 주거용(아파트) 60㎡, 상업용 150㎡, 공업용 330㎡ 이하`);
  } else if (land.landType === "농지") {
    appliedCriteria.push(`농지 면적 기준: 330㎡(약 100��) 이하이거나, 폭 5m 이하의 부정형으로서 농기계 진입·회전이 곤란한 경우`);
  } else if (land.landType === "산지") {
    appliedCriteria.push(`산지 면적 기준: 990㎡(약 300평) 이하`);
  } else {
    appliedCriteria.push(`그 밖의 토지 면적 기준: 330㎡ 이하`);
  }
  
  appliedCriteria.push(`형상지수 변화 기준: 편입 전 대비 1.0 이상 상승 시 형상 불량으로 판단`);
  appliedCriteria.push(`잔여지 형상 기준: 삼각형, 역삼각형, 자루형, 부정형 등 불규칙 형상으로 종래 목적 사용 곤란`);
  appliedCriteria.push(`잔여비율 기준: 30% 이하일 경우 종래 목적 사용이 현저히 곤란한 것으로 판단`);

  // 중앙토지수용위원회 기준 문장 형식의 판단 근거
  const shapeDescription = getShapeDescription(land.remainingShape, land.remainingArea);
  const usageDescription = getUsageDifficultyDescription(land.landType, land.remainingArea, land.remainingShape);

  if (judgment === "매수") {
    summary = `${shapeDescription} ${usageDescription} 수용할 수 있는 것으로 판단됩니다.`;
    detailedExplanation = `[중앙토지수용위원회 참고기준에 따른 분석]

1. 분석 대상 토지
- 소재지: ${land.address}
- 토지 유형: ${land.landType}
- 지목: ${land.landCategory}
- 소유자: ${land.ownerName}

2. 편입 현황
- 편입 전 면적: ${land.originalArea.toLocaleString()}㎡
- 편입 면적: ${land.includedArea.toLocaleString()}㎡
- 잔여 면적: ${land.remainingArea.toLocaleString()}㎡
- 잔여 비율: ${land.remainingRatio}%

3. 형상 분석
- 편입 전 형상: ${land.originalShape} (형상지수 ${land.originalShapeIndex})
- 잔여지 형상: ${land.remainingShape} (형상지수 ${land.remainingShapeIndex})
- 형상지수 변화: +${shapeIndexChange.toFixed(1)}

4. 충족 기준
${metCriteriaNames.map((name, i) => `${i + 1}) ${name}`).join("\n")}

5. 판정 결과
${summary}`;
  } else if (judgment === "기각") {
    summary = `본 토지는 잔여지 면적 및 형상이 종래 목적대로 사용 가능한 것으로 판단되어 매수청구 대상에 해당하지 않습니다.`;
    detailedExplanation = `[중앙토지수용위원회 참고기준에 따른 분석]

1. 분석 대상 토지
- 소재지: ${land.address}
- 토지 유형: ${land.landType}
- 지목: ${land.landCategory}
- 소유자: ${land.ownerName}

2. 편입 현황
- 편입 전 면적: ${land.originalArea.toLocaleString()}㎡
- 편입 면적: ${land.includedArea.toLocaleString()}㎡
- 잔여 면적: ${land.remainingArea.toLocaleString()}㎡
- 잔여 비율: ${land.remainingRatio}%

3. 형상 분석
- 편입 전 형상: ${land.originalShape} (형상지수 ${land.originalShapeIndex})
- 잔여지 형상: ${land.remainingShape} (형상지수 ${land.remainingShapeIndex})
- 형상지수 변화: +${shapeIndexChange.toFixed(1)}

4. 미충족 ��유
- 잔여 비율 ${land.remainingRatio}%로 기준(30% 이하) 초과
- 형상지수 변화 ${shapeIndexChange.toFixed(1)}로 기준(1.0 이상) 미달

5. 판정 결과
${summary}`;
  } else {
    summary = `본 토지는 자동 판독 기준 충족이 애매하여 담당자 검토가 필요한 「경계 사례」로 분류되었습니다.`;
    detailedExplanation = `[중앙토지수용위원회 참고기준에 따른 분석]

1. 분석 대상 토지
- 소재지: ${land.address}
- 토지 유형: ${land.landType}
- 지목: ${land.landCategory}

2. 편입 현황
- 편입 전 면적: ${land.originalArea.toLocaleString()}㎡
- 편입 면적: ${land.includedArea.toLocaleString()}㎡
- 잔여 면적: ${land.remainingArea.toLocaleString()}㎡
- 잔여 비율: ${land.remainingRatio}%

3. 형상 분석
- 편입 전 형상: ${land.originalShape} (형상지수 ${land.originalShapeIndex})
- 잔여지 형상: ${land.remainingShape} (형상지수 ${land.remainingShapeIndex})
- 형상지수 변화: +${shapeIndexChange.toFixed(1)}

4. 경계 사례 판정 사유
- 자동 판독 기준 일부만 충족
- 직접 확인 필요 항목: ${manualCheckItems.join(", ")}

5. 판정 결과
${summary}`;
  }

  return {
    summary,
    legalBasis,
    appliedCriteria,
    manualCheckItems: manualCheckItems.length > 0 ? manualCheckItems : undefined,
    detailedExplanation,
  };
}

// 형상 설명 생성 (중앙토지수용위원회 문장 형식)
function getShapeDescription(shape: string, area: number): string {
  const width = Math.sqrt(area); // 대략적인 폭 계산
  
  switch (shape) {
    case "삼각형":
    case "역삼각형":
      return `잔여지의 형상이 ${shape}으로서 정상적인 이용이 곤란한 부정형으로 보이며,`;
    case "자루형":
      return `잔여지의 형상이 자루형(세장형)으로서 폭이 좁아 정상적인 이용이 곤란하며,`;
    case "부정형":
      return `잔여지의 형상이 사각형으로서 폭 ${width.toFixed(0)}미터 이하인 부정형으로 보이며,`;
    default:
      return `잔여지의 형상이 ${shape}으로서,`;
  }
}

// 사용 곤란 설명 생성 (토지 유형별)
function getUsageDifficultyDescription(landType: string, area: number, shape: string): string {
  switch (landType) {
    case "농지":
      return `이는 농지로서의 사용이 현저히 곤란한 경우(농기계 진입·회전 곤란)로 예상되어`;
    case "대지":
      return `이는 택지로서 건축물의 건축이 현저히 곤란한 경우로 예상되어`;
    case "산지":
      return `이는 산지로서의 종래 목적대로 사용이 현저히 곤란한 경우로 예상되어`;
    default:
      return `이는 종래 목적대로 사용이 현저히 곤란한 경우로 예상되어`;
  }
}

export function LandSearchSection({ onLandSelect, cartItems = [], onAddToCart, onRemoveFromCart, onSubmitCart }: LandSearchSectionProps) {
  // 장바구니 패널 표시 상태
  const [isCartOpen, setIsCartOpen] = useState(false);
  // 검색 방식 탭 (지�� / 소유자)
  const [searchMode, setSearchMode] = useState<"address" | "owner">("address");
  
  // 소유자 검색 상태 (이름 + 주민번호 앞자리)
  const [ownerName, setOwnerName] = useState<string>("");
  const [ownerBirthDate, setOwnerBirthDate] = useState<string>(""); // YYMMDD
  
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isResultsCollapsed, setIsResultsCollapsed] = useState(false);
  const [isBasicInfoCollapsed, setIsBasicInfoCollapsed] = useState(false);
  
  // AI 분석 상태
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  
  // 편입토지 없음 상태
  const [noIncludedLand, setNoIncludedLand] = useState(false);

  // 현재 단계 계산
  // 1. 지번조회 = 필지 선택 전까지
  // 2. 필지 선택 = AI 판독 시작 버튼 누르기 전까지
  // 3. AI 판독 = AI판독 시작 버튼 누르고난 후
  // 4. 결과 확인 = AI 판독 완료 후
  const currentStep = aiResult ? 4 : (aiAnalyzing ? 3 : (selectedLand ? 2 : 1));

  // 검색 실행
  const handleSearch = () => {
    // 검색 모드에 따른 유효성 검사
    if (searchMode === "address" && !selectedSigungu) return;
    if (searchMode === "owner" && (!ownerName || ownerBirthDate.length !== 6)) return;
    
    setIsSearching(true);
    setSelectedLand(null);
    setCurrentPage(1);
    setAiResult(null);
    setNoIncludedLand(false);
    
    setTimeout(() => {
      let results: LandInfo[];
      
      if (searchMode === "owner") {
        // 소유자 검색: 이름 + 주민번호 앞자리로 검색
        // 실제 구현에서는 API 호출, 여기서는 더미 데이터 시뮬레이션
        const baseCoords = [
          [
            { lat: 37.2180, lng: 127.2950 },
            { lat: 37.2185, lng: 127.2960 },
            { lat: 37.2178, lng: 127.2965 },
            { lat: 37.2173, lng: 127.2955 },
          ],
          [
            { lat: 37.2185, lng: 127.2960 },
            { lat: 37.2192, lng: 127.2972 },
            { lat: 37.2188, lng: 127.2980 },
            { lat: 37.2178, lng: 127.2965 },
          ],
          [
            { lat: 37.2192, lng: 127.2972 },
            { lat: 37.2200, lng: 127.2985 },
            { lat: 37.2195, lng: 127.2995 },
            { lat: 37.2188, lng: 127.2980 },
          ],
        ];
        
        // 여러 필지를 소유한 경우 시뮬레이션 (한 사람이 여러 잔여지 보유)
        results = dummyLandInfoList.slice(0, 3).map((land, idx) => ({
          ...land,
          id: `owner-search-${idx}`,
          ownerName: ownerName,
          address: `경기도 용인시 처인구 양지면 마성리 ${100 + idx}-${idx + 1}`,
          coordinates: baseCoords[idx] || baseCoords[0],
        }));
        
        setSearchResults(results);
        setIsSearching(false);
        return;
      }
      
      // 지번 검색: 선택된 지역에 해당하는 토지 필터링
      results = dummyLandInfoList.filter(land => {
        // 시군구 포함 여부
        if (!land.address.includes(selectedSigungu)) return false;
        
        // 읍면동이 선택되었으면 필터링
        if (selectedEupmyeondong && !land.address.includes(selectedEupmyeondong)) return false;
        
        // 리가 선택되었으면 필터링
        if (selectedRi && !land.address.includes(selectedRi)) return false;
        
        // 지번이 입력되었으면 필터링
        if (jibun && !land.address.includes(jibun)) return false;
        
        return true;
      });
      
      // 검색 결과가 없으면 해당 지역의 더미 데이터 생성 (좌표 포함)
      if (results.length === 0) {
        const baseCoords = [
          [
            { lat: 37.2180, lng: 127.2950 },
            { lat: 37.2185, lng: 127.2960 },
            { lat: 37.2178, lng: 127.2965 },
            { lat: 37.2173, lng: 127.2955 },
          ],
          [
            { lat: 37.2185, lng: 127.2960 },
            { lat: 37.2192, lng: 127.2972 },
            { lat: 37.2188, lng: 127.2980 },
            { lat: 37.2178, lng: 127.2965 },
          ],
          [
            { lat: 37.2192, lng: 127.2972 },
            { lat: 37.2200, lng: 127.2985 },
            { lat: 37.2195, lng: 127.2995 },
            { lat: 37.2188, lng: 127.2980 },
          ],
          [
            { lat: 37.2170, lng: 127.2940 },
            { lat: 37.2176, lng: 127.2948 },
            { lat: 37.2172, lng: 127.2956 },
            { lat: 37.2165, lng: 127.2948 },
          ],
          [
            { lat: 37.2200, lng: 127.2985 },
            { lat: 37.2208, lng: 127.2998 },
            { lat: 37.2202, lng: 127.3008 },
            { lat: 37.2195, lng: 127.2995 },
          ],
        ];
        results = dummyLandInfoList.slice(0, 5).map((land, idx) => ({
          ...land,
          id: `search-${idx}`,
          address: `${selectedSido} ${selectedSigungu}${selectedEupmyeondong ? ` ${selectedEupmyeondong}` : ""}${selectedRi ? ` ${selectedRi}` : ""} ${jibun || `${100 + idx}-${idx + 1}`}`,
          coordinates: baseCoords[idx] || baseCoords[0],
        }));
      }
      
      setSearchResults(results);
      setIsSearching(false);
    }, 500);
  };

  // 필지 선택
  const handleLandSelect = (land: LandInfo) => {
    setSelectedLand(land);
    setAiResult(null);
    setNoIncludedLand(false);
    
    // 기본정보 패널이 접혀 있으면 자동으로 펼침
    if (isBasicInfoCollapsed) {
      setIsBasicInfoCollapsed(false);
    }
    
    // 편���토��� 없는 경우 체크
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
    setSearchMode("address");
    setOwnerName("");
    setOwnerBirthDate("");
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
                <span className={`flex h-8 w-8 items-center justify-center rounded-full text-base font-semibold ${
                  currentStep === item.step 
                    ? "bg-primary text-white" 
                    : currentStep > item.step
                      ? "bg-gray-200 text-gray-600"
                      : "bg-gray-100 text-gray-400"
                }`}>
                  {currentStep > item.step ? <CheckCircle2 className="h-5 w-5" /> : item.step}
                </span>
                <span className={`hidden text-base font-medium sm:block ${
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

      {/* KRDS 검색 필터 영역 */}
      <div className="mb-3 rounded-lg border border-border bg-card p-4">
        {/* 검색 방식 스위치 토글 (텍스트 내장형) */}
        <div className="mb-4 flex items-center gap-3">
          <div className="inline-flex rounded-lg bg-muted p-1">
            <button
              type="button"
              onClick={() => setSearchMode("address")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ${
                searchMode === "address"
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              지번으로 검색
            </button>
            <button
              type="button"
              onClick={() => setSearchMode("owner")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ${
                searchMode === "owner"
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              소유자로 검색
            </button>
          </div>
          {searchMode === "owner" && (
            <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              대리신청 가능
            </span>
          )}
        </div>

        {searchMode === "owner" ? (
          /* 소유자 검색 폼 */
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              토지 소유자 또는 대리인이 이름과 주민번호 앞자리로 해당 소유자의 모든 잔여지를 검색할 수 있습니다.
            </p>
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">소유자 성명 *</label>
                <Input
                  placeholder="홍길동"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-[160px]"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">주민번호 앞자리 *</label>
                <Input
                  placeholder="YYMMDD"
                  value={ownerBirthDate}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setOwnerBirthDate(value);
                  }}
                  maxLength={6}
                  className="w-[120px]"
                />
              </div>
              <Button
                onClick={handleSearch}
                variant="secondary"
                disabled={!ownerName || ownerBirthDate.length !== 6 || isSearching}
                className="h-10 gap-2 px-6"
              >
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                검색
              </Button>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="flex items-start gap-2 text-sm text-muted-foreground">
                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                대리 신청 시, 신청서 제출 단계에서 위임장 및 대리인 신분증 사본이 필요합니다.
              </p>
            </div>
          </div>
        ) : (
          /* 지번 검색 폼 */
          <div className="flex flex-wrap items-end gap-3">
          {/* 시도 */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">시도</label>
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
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="선택" />
              </SelectTrigger>
              <SelectContent>
                {regionData.시도.map((sido) => (
                  <SelectItem key={sido} value={sido}>{sido}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 시군구 */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">시군구</label>
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
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="선택" />
              </SelectTrigger>
              <SelectContent>
                {sigunguOptions.map((sigungu) => (
                  <SelectItem key={sigungu} value={sigungu}>{sigungu}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 읍면동 */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">읍면동</label>
            <Select 
              value={selectedEupmyeondong} 
              onValueChange={(v) => {
                setSelectedEupmyeondong(v);
                setSelectedRi("");
                setSearchResults([]);
              }}
              disabled={!selectedSigungu || eupmyeondongOptions.length === 0}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder={eupmyeondongOptions.length === 0 ? "해당없음" : "선택"} />
              </SelectTrigger>
              <SelectContent>
                {eupmyeondongOptions.map((eupmyeondong) => (
                  <SelectItem key={eupmyeondong} value={eupmyeondong}>{eupmyeondong}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 리 */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">리</label>
            <Select 
              value={selectedRi} 
              onValueChange={setSelectedRi}
              disabled={!selectedEupmyeondong || riOptions.length === 0}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder={riOptions.length === 0 ? "해당없음" : "선택"} />
              </SelectTrigger>
              <SelectContent>
                {riOptions.map((ri) => (
                  <SelectItem key={ri} value={ri}>{ri}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 지번 */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">지번</label>
            <div className="relative">
              <Input 
                placeholder="번지 입력" 
                value={jibun}
                onChange={(e) => setJibun(e.target.value)}
                className="w-[120px] pr-8"
              />
              <Search className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          {/* 검색/초기화 버튼 */}
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleSearch} 
              variant="secondary"
              className="gap-1.5 px-5"
              disabled={!selectedSigungu || isSearching}
            >
              {isSearching ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>조회 중</span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  <span>조회</span>
                </>
              )}
            </Button>
            {(selectedSido || searchResults.length > 0) && (
              <Button 
                onClick={handleReset}
                variant="tertiary"
                className="gap-1.5 px-4"
              >
                <RotateCcw className="h-4 w-4" />
                <span>초기화</span>
              </Button>
            )}
          </div>
          </div>
        )}
      </div>

      {/* 전체 화면 지도 컨테이너 */}
      <div className="relative h-[calc(100vh-260px)] min-h-[500px] w-full">
        {/* 지도 (전체 화면) */}
        <div className="absolute inset-0 z-0">
          <LeafletMap 
            selectedRegion={selectedRi || selectedEupmyeondong || selectedSigungu || selectedSido}
            onParcelClick={(id) => {
              const land = searchResults.find(l => l.id === id);
              if (land) handleLandSelect(land);
            }}
            parcels={searchResults
              .filter(land => land.coordinates && land.coordinates.length >= 3)
              .map(land => ({
                id: land.id,
                coordinates: land.coordinates!,
                address: land.address,
                isIncluded: land.includedArea > 0,
              }))}
            selectedParcelId={selectedLand?.id}
          />
        </div>

        {/* 좌측 사이드�� - 결과 + 기본정보 패널 */}
        <div className="absolute bottom-0 left-0 top-0 z-10 flex shadow-lg">
          {/* 결과 패널 */}
          <div className={`bg-background transition-all duration-300 overflow-hidden ${isResultsCollapsed ? "w-0" : "w-[280px]"}`}>
            {/* 검색 결과 헤더 */}
            <div className="flex items-center justify-between border-b bg-muted px-4 py-3">
              <span className="text-base font-medium text-foreground">결과</span>
              {searchResults.length > 0 && (
                <span className="text-base text-muted-foreground">총 {searchResults.length}건</span>
              )}
            </div>
            
            {/* 검색 결과 목록 */}
            <div className="h-[calc(100%-100px)] overflow-y-auto">
              {searchResults.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                  <MapPin className="h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-base text-muted-foreground">
                    행정구역을 선택하고<br />검색 버튼을 클릭하세요.
                  </p>
                </div>
              ) : (
                <ul>
                  {searchResults.map((land) => (
                    <li key={land.id} className="border-b border-border">
                      <button
                        onClick={() => handleLandSelect(land)}
                        className={`flex w-full cursor-pointer items-center justify-between px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
                          selectedLand?.id === land.id ? "border-2 border-primary bg-primary/5" : ""
                        }`}
                      >
                        {/* 주소 텍스트 */}
                        <span className="flex-1 text-base">{land.address}</span>
                        {/* 화살표 */}
                        <ChevronRight className={`h-5 w-5 shrink-0 ${selectedLand?.id === land.id ? "text-primary" : "text-muted-foreground"}`} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

              {/* 페이지네이션 */}
              {searchResults.length > 0 && (
              <div className="absolute bottom-0 left-0 flex w-[280px] items-center justify-center gap-1 border-t bg-background py-3">
                {(() => {
                  const totalPages = Math.ceil(searchResults.length / itemsPerPage);
                  if (totalPages <= 1) return null;
                  
                  return (
                    <>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8" 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <Button 
                          key={page}
                          size="sm" 
                          className={`h-8 w-8 p-0 ${currentPage === page ? "bg-[#222222] hover:bg-[#333333]" : ""}`}
                          variant={currentPage === page ? "default" : "ghost"}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      ))}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </>
                  );
                })()}
              </div>
              )}
          </div>

          {/* 기본정보 패널 (선택된 토지 정보) - 슬라이드 */}
          {selectedLand && (
          <div className={`flex h-full flex-col border-l bg-background transition-all duration-300 overflow-hidden ${isBasicInfoCollapsed ? "w-0 border-l-0" : "w-[320px]"}`}>
            {/* 헤더 */}
            <div className="flex shrink-0 items-center justify-between border-b bg-muted px-4 py-3">
              <span className="text-base font-medium text-foreground">기본정보</span>
            </div>
            
            {/* 컨텐츠 */}
            <div className="flex-1 overflow-y-auto p-4">
              {selectedLand ? (
                <div className="space-y-4">
                {/* 토지 기본 정보 */}
                <div className="rounded border border-border bg-muted/30 p-3">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-base">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">지번</span>
                      <span className="font-medium">{selectedLand.address.split(" ").slice(-2).join(" ")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">지목</span>
                      <span className="font-medium">{selectedLand.landCategory}</span>
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
                  <div className="rounded border border-destructive bg-destructive/5 p-3">
                    <div className="flex items-center gap-2">
                      <Ban className="h-4 w-4 text-destructive" />
                      <span className="text-base font-medium text-destructive">편입토지 없음 - 매수 신청 불가</span>
                    </div>
                  </div>
                )}

                {/* AI 판독 버튼 */}
                {!noIncludedLand && !aiResult && (
                  <Button 
                    onClick={handleAIAnalysis}
                    className="h-12 w-full cursor-pointer"
                    variant="default"
                    disabled={aiAnalyzing}
                  >
                    {aiAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        AI 판독 중...
                      </>
                    ) : (
                      <>
                        <Bot className="mr-2 h-4 w-4" />
                        AI 판독 시작
                      </>
                    )}
                  </Button>
                )}

                {/* AI 판독 결과 */}
                {aiResult && (
                  <div className={`rounded-lg border-2 p-4 ${
                    aiResult.provisionalJudgment === "매수" 
                      ? "border-primary bg-primary/5" 
                      : aiResult.provisionalJudgment === "심의위원회이관"
                        ? "border-amber-500 bg-amber-50"
                        : "border-red-500 bg-red-50"
                  }`}>
                    {/* 헤더 */}
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-base font-semibold">AI 판독 결과</span>
                      <Badge 
                        variant={
                          aiResult.provisionalJudgment === "매수" 
                            ? "success" 
                            : aiResult.provisionalJudgment === "심의위원회이관"
                              ? "warning"
                              : "destructive"
                        }
                        size="lg"
                        className="px-3 py-1 text-sm font-bold"
                      >
                        {aiResult.provisionalJudgment === "매수" 
                          ? "매수 가능" 
                          : aiResult.provisionalJudgment === "심의위원회이관"
                            ? "경계 사례"
                            : "기준 미충족"}
                      </Badge>
                    </div>

                    {/* 내용 - 신청현황조회와 동일한 순서 */}
                    <div className="space-y-4">
                      {/* 판단 요약 */}
                      {aiResult.judgmentRationale && (
                        <div className="flex items-start gap-3">
                          <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <div>
                            <h4 className="text-base font-semibold text-foreground">판단 요약</h4>
                            <p className="mt-1 text-base leading-relaxed text-muted-foreground">{aiResult.judgmentRationale.summary}</p>
                          </div>
                        </div>
                      )}

                      {/* 법적 근거 */}
                      {aiResult.judgmentRationale && (
                        <div className="flex items-start gap-3">
                          <Scale className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                          <div>
                            <h4 className="text-base font-semibold text-foreground">법적 근거</h4>
                            <p className="mt-1 text-base leading-relaxed text-muted-foreground">{aiResult.judgmentRationale.legalBasis}</p>
                          </div>
                        </div>
                      )}

                      {/* 적용 기준 */}
                      {aiResult.judgmentRationale && (
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <div>
                            <h4 className="text-base font-semibold text-foreground">적용 기준</h4>
                            <ul className="mt-1 space-y-1">
                              {aiResult.judgmentRationale.appliedCriteria.map((criteria, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-base text-muted-foreground">
                                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                                  <span>{criteria}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {/* 수동 확인 항목 */}
                      {aiResult.judgmentRationale?.manualCheckItems && aiResult.judgmentRationale.manualCheckItems.length > 0 && (
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                          <div>
                            <h4 className="text-base font-semibold text-foreground">수동 확인 항목</h4>
                            <ul className="mt-1 space-y-1">
                              {aiResult.judgmentRationale.manualCheckItems.map((item, idx) => (
                                <li key={idx} className="flex items-center gap-2 text-base text-muted-foreground">
                                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-500" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {/* 상세 분석 */}
                      {aiResult.judgmentRationale?.detailedExplanation && (
                        <div className="flex items-start gap-3">
                          <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                          <div>
                            <h4 className="text-base font-semibold text-foreground">상세 분석</h4>
                            <pre className="mt-1 whitespace-pre-wrap text-base leading-relaxed text-muted-foreground">
                              {aiResult.judgmentRationale.detailedExplanation}
                            </pre>
                          </div>
                        </div>
                      )}

                      {/* 안내 문구 */}
                      <div className="flex items-start gap-2 pt-2">
                        <Info className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
                        <p className="text-base text-muted-foreground">
                          AI 판독 결과는 참고용이며, 최종 판정은 담당자 검토에 따라 결정됩니다.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  정보 제공 대상 필지가 아닙니다.
                </div>
              )}
            </div>
            
            {/* 신청 목록 추가 버튼 - 하단 고정 */}
            {selectedLand && aiResult && (
              <div className="shrink-0 border-t bg-background p-3">
                {(() => {
                  const isAlreadyInCart = cartItems.some(item => item.landInfo.id === selectedLand.id);
                  
                  if (isAlreadyInCart) {
                    return (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2 rounded-lg bg-primary/10 p-3">
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                          <span className="text-sm font-medium text-primary">신청 목록에 추가됨</span>
                        </div>
                        <Button 
                          onClick={() => onRemoveFromCart(selectedLand.id)}
                          variant="outline"
                          className="h-10 w-full"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          신청 목록에서 제거
                        </Button>
                      </div>
                    );
                  }
                  
                  if (aiResult.provisionalJudgment !== "기각") {
                    return (
                      <div className="space-y-2">
                        <Button 
                          onClick={() => onAddToCart(selectedLand, aiResult!)}
                          className="h-12 w-full cursor-pointer"
                          variant="default"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          신청 목록에 추가
                        </Button>
                        <p className="text-center text-xs text-muted-foreground">
                          여러 필지를 한번에 신청할 수 있습니다
                        </p>
                      </div>
                    );
                  }
                  
                  return (
                    <div className="space-y-2">
                      <div className="rounded bg-muted/50 p-2 text-center">
                        <p className="text-sm font-medium text-muted-foreground">
                          AI 분석 결과 매수 기준에 충족하지 않습니다
                        </p>
                      </div>
                      <button
                        onClick={() => onAddToCart(selectedLand, aiResult!)}
                        className="w-full cursor-pointer py-1 text-xs text-muted-foreground/60 underline-offset-2 transition-colors hover:text-muted-foreground hover:underline"
                      >
                        그래도 신청 목록에 추가하기
                      </button>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
          )}

        </div>

        {/* 사이드바 토글 버튼 - 결과 패널용 */}
        <button 
          onClick={() => setIsResultsCollapsed(!isResultsCollapsed)}
          className={`absolute top-1/2 z-20 flex h-12 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-r-md bg-background shadow-md transition-all duration-300 ${isResultsCollapsed ? "left-0" : "left-[280px]"}`}
          style={{ display: selectedLand && !isBasicInfoCollapsed ? "none" : "flex" }}
        >
          <ChevronLeft className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${isResultsCollapsed ? "rotate-180" : ""}`} />
        </button>

        {/* 사이드바 토글 버튼 - 기본정보 패널용 (선택된 토지가 있을 때만) */}
        {selectedLand && (
          <button 
            onClick={() => setIsBasicInfoCollapsed(!isBasicInfoCollapsed)}
            className={`absolute top-1/2 z-20 flex h-12 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-r-md bg-background shadow-md transition-all duration-300`}
            style={{ 
              left: isBasicInfoCollapsed 
                ? (isResultsCollapsed ? "0px" : "280px") 
                : (isResultsCollapsed ? "320px" : "600px") 
            }}
          >
            <ChevronLeft className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${isBasicInfoCollapsed ? "rotate-180" : ""}`} />
          </button>
        )}
      </div>

      {/* 장바구니 플로팅 버튼 */}
      {cartItems.length > 0 && !isCartOpen && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 items-center gap-2 rounded-full bg-primary px-5 text-white shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl"
        >
          <ShoppingCart className="h-5 w-5" />
          <span className="font-medium">신청 목록</span>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm font-bold text-primary">
            {cartItems.length}
          </span>
        </button>
      )}

      {/* 장바구니 슬라이드 패널 */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* 오버레이 */}
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={() => setIsCartOpen(false)}
          />
          
          {/* 패널 */}
          <div className="relative z-10 flex h-full w-full max-w-md flex-col bg-background shadow-2xl">
            {/* 헤더 */}
            <div className="flex items-center justify-between border-b px-4 py-4">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">신청 목록</h2>
                <Badge variant="secondary">{cartItems.length}건</Badge>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="rounded-lg p-2 hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* 안내 문구 */}
            <div className="border-b bg-muted/30 px-4 py-3">
              <p className="text-sm text-muted-foreground">
                <Info className="mr-1 inline h-4 w-4" />
                같은 지역의 토지만 함께 신청할 수 있습니다. 서로 다른 지역의 토지는 별도로 신청해 주세요.
              </p>
            </div>

            {/* 지역별 그룹핑된 목록 */}
            <div className="flex-1 overflow-y-auto p-4">
              {(() => {
                // 지역별로 그룹핑
                const groupedByRegion = cartItems.reduce((acc, item) => {
                  // 주소에서 시도+시군구 추출
                  const addressParts = item.landInfo.address.split(" ");
                  const region = addressParts.slice(0, 2).join(" ");
                  
                  if (!acc[region]) {
                    acc[region] = [];
                  }
                  acc[region].push(item);
                  return acc;
                }, {} as Record<string, ApplicationCartItem[]>);

                const regions = Object.keys(groupedByRegion);

                if (regions.length === 0) {
                  return (
                    <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                      <ShoppingCart className="mb-2 h-12 w-12 opacity-30" />
                      <p>신청 목록이 비어 있습니다</p>
                      <p className="mt-1 text-sm">토지를 검색하여 추가해 주세요</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    {regions.map((region) => {
                      const items = groupedByRegion[region];
                      return (
                        <div key={region} className="rounded-lg border bg-card">
                          {/* 지역 헤더 */}
                          <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-primary" />
                              <span className="font-medium">{region}</span>
                              <Badge variant="outline" className="text-xs">{items.length}필지</Badge>
                            </div>
                          </div>
                          
                          {/* 해당 지역 토지 목록 */}
                          <div className="divide-y">
                            {items.map((item) => (
                              <div key={item.id} className="flex items-start justify-between p-3">
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{item.landInfo.address}</p>
                                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                    <span>잔여: {item.landInfo.remainingArea.toLocaleString()}㎡</span>
                                    <span>|</span>
                                    <span>{item.landInfo.landType}</span>
                                    <Badge 
                                      variant={item.aiResult.provisionalJudgment === "매수" ? "success" : "warning"}
                                      className="text-xs"
                                    >
                                      {item.aiResult.provisionalJudgment === "매수" ? "매수 가능" : "기준 미충족"}
                                    </Badge>
                                  </div>
                                </div>
                                <button
                                  onClick={() => onRemoveFromCart(item.id)}
                                  className="ml-2 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                          
                          {/* 이 지역 신청하기 버튼 */}
                          <div className="border-t p-3">
                            <Button 
                              onClick={() => {
                                onSubmitCart(items);
                                setIsCartOpen(false);
                              }}
                              className="w-full"
                            >
                              이 지역 {items.length}건 신청하기
                              <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}

                    {/* 여러 지역이 있을 때 안내 */}
                    {regions.length > 1 && (
                      <div className="rounded-lg border border-warning/50 bg-warning/5 p-3">
                        <p className="flex items-start gap-2 text-sm text-warning">
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                          <span>
                            <strong>{regions.length}개 지역</strong>의 토지가 있습니다. 
                            각 지역별로 별도 신청이 필요합니다.
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* 하단 요약 */}
            {cartItems.length > 0 && (
              <div className="border-t bg-muted/30 px-4 py-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">총 {cartItems.length}필지</span>
                  <button
                    onClick={() => {
                      cartItems.forEach(item => onRemoveFromCart(item.id));
                    }}
                    className="text-sm text-muted-foreground hover:text-destructive"
                  >
                    전체 삭제
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
