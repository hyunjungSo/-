// 토지 유형
export type LandType = "대지" | "농지" | "산지" | "그밖의토지";

// 토지 형상
export type LandShape =
  | "정방형"
  | "가로장방형"
  | "세로장방형"
  | "변형사다리형"
  | "역사다리형"
  | "사다리형"
  | "삼각형"
  | "역삼각형"
  | "부정형"
  | "자루형";

// 지목 (실제 이용 상황)
export type LandCategory =
  | "과"
  | "구"
  | "답"
  | "대"
  | "도"
  | "목"
  | "묘"
  | "양"
  | "임"
  | "잡"
  | "장"
  | "전"
  | "제"
  | "주유소"
  | "창"
  | "천";

// 처리 상태
export type ProcessStatus = "접수완료" | "AI분석완료" | "검토중" | "처리완료";

// 담당자 진행상황
export type AdminStatus = "접수완료" | "진행중" | "심사완료";

// AI 1차 판독 결과 (매수/기각만 가능)
export type AIJudgmentResult = "매수" | "기각";

// 최종 판정 결과 (담당자-민원인 의견 충돌 시 심의위원회이관 가능)
export type FinalJudgmentResult = "매수" | "기각" | "심의위원회이관";

// 판정 결과 (하위 호환용)
export type JudgmentResult = FinalJudgmentResult;

// 관할기관 타입
export type BusinessUnit = 
  // 수도권
  | "김포파주" 
  | "수도권" 
  | "양평이천"
  | "고양의정부"
  | "남양주구리"
  | "화성평택"
  // 강원권
  | "춘천원주"
  | "강릉속초"
  | "원주영월"
  // 충청권
  | "천안안성" 
  | "세종천안" 
  | "서산아산"
  | "청주충주"
  | "대전세종"
  | "홍성예산"
  // 전라권
  | "새만금전주" 
  | "강진광주"
  | "목포순천"
  | "여수광양"
  | "익산군산"
  | "남원정읍"
  // 경상권
  | "포항영덕" 
  | "함양합천" 
  | "합천창녕"
  | "대구경산"
  | "부산울산"
  | "창원김해"
  | "진주통영"
  | "안동영주"
  | "구미김천"
  // 제주권
  | "제주서귀포";

// 토지 정보
export interface LandInfo {
  id: string;
  address: string; // 지번
  originalArea: number; // 편입 전 면적 (㎡)
  includedArea: number; // 편입 면적 (㎡)
  remainingArea: number; // 잔여 면적 (㎡)
  remainingRatio: number; // 잔여 비율 (%)
  landType: LandType; // 토지 유형
  landCategory: LandCategory; // 지목
  originalShape: LandShape; // 편입 전 형상
  remainingShape: LandShape; // 잔여지 형상
  originalShapeIndex: number; // 편입 전 형상지수
  remainingShapeIndex: number; // 잔여지 형상지수
  ownerName: string; // 소유자명
  ownerContact?: string; // 소유자 연락처
  hasIncludedLand: boolean; // 편입토지 존재 여부
  coordinates?: Array<{ lat: number; lng: number }>; // 필지 경계 좌표
  businessUnit?: BusinessUnit; // 관할기관
  projectName?: string; // 사업명
}

// 일단지 판정 조건
export interface UnifiedParcelCondition {
  sameOwner: boolean; // 소유자 동일성
  continuous: boolean; // 지반 연속성
  sameUsage: boolean; // 용도 일체성
  isUnifiedParcel: boolean; // 일단지 여부
}

// 토지별 민원인 입력 데이터
export interface LandSpecificData {
  currentUsage: LandCategory; // 현재 활용 지목
  landSubType: "" | "residential-detached" | "residential-multi" | "residential-apartment" | "commercial" | "industrial"; // 택지 세부 유형
  actualUsage: LandCategory; // 공부상 지목
  reportedShape: LandShape; // 토지 모양
  farmMachineDifficulty: boolean; // 농기계 진입 곤란
  accessRoadLost: boolean; // 접면도로 상실
  waterChannelLost: boolean; // 관개수로 상실
}

// 민원 신청
export interface Application {
  id: string;
  applicationNumber: string; // 접수번호
  applicantName: string; // 신청인명
  applicantContact: string; // 연락처
  applicantAddress: string; // 주소
  landInfo: LandInfo;
  additionalLands?: LandInfo[]; // 동일 소유자 복수 필지
  unifiedParcelCondition?: UnifiedParcelCondition; // 일단지 판정 조건
  actualUsage: LandCategory; // 실제 이용 상황
  reportedShape: LandShape; // 신청인 입력 토지 모양
  farmMachineDifficulty?: boolean; // 농기계 진입·회전 곤란
  reason: string; // 신청 사유
  attachments: string[]; // 첨부 서류
  status: ProcessStatus;
  adminStatus: AdminStatus; // 담당자 진행상황
  appliedAt: string; // 신청일
  aiResult?: AIAnalysisResult; // AI 분석 결과
  finalJudgment?: JudgmentResult; // 최종 판정
  reviewerComment?: string; // 담당자 검토 의견
  adminName?: string; // 담당자명
  statusUpdatedAt?: string; // 상태 변경일
  landDataList?: LandSpecificData[]; // 토지별 민원인 입력 데이터 (복수 필지)
}

// AI 분석 결과
export interface AIAnalysisResult {
  landTypePath: LandType; // 판단 경로 (토지 유형)
  criteriaChecks: CriteriaCheck[]; // 기준 충족 여부
  provisionalJudgment: AIJudgmentResult; // AI 1차 판독 결과 (매수/기각)
  originalShapeIndex: number;
  remainingShapeIndex: number;
  shapeIndexChange: number;
  isBlindLand: boolean; // 맹지 여부
  accessRoadLost: boolean; // 접면도로 상실 (직접확인)
  waterChannelLost: boolean; // 수로 상실 (직접확인)
  farmMachineDifficulty: boolean; // 농기계 진입/회전 곤란 (직접확인)
  judgmentRationale: JudgmentRationale; // 판단 근거 설명
}

// 판단 근거 설명
export interface JudgmentRationale {
  summary: string; // 판단 요약
  legalBasis: string; // 법적 근거
  appliedCriteria: string[]; // 적용된 기준
  detailedExplanation: string; // 상세 설명
  manualCheckItems?: string[]; // 직접 확인 필요 항목
}

// 기준 충족 여부
export interface CriteriaCheck {
  criteriaName: string; // 기준명
  criteriaDescription: string; // 기준 설명
  isMet: boolean; // 충족 여부
  autoDetected: boolean; // 자동 판독 가능 여부
}

// 신청 목록 아이템 (장바구니)
export interface ApplicationCartItem {
  id: string;
  landInfo: LandInfo;
  aiResult: AIAnalysisResult;
  addedAt: string;
  businessUnit: BusinessUnit; // 관할기관 그룹핑용
}

// 관할기관별 그룹핑된 신청 목록
export interface BusinessUnitGroupedCart {
  businessUnit: BusinessUnit;
  items: ApplicationCartItem[];
}

// 심의서 데이터
export interface ReviewDocument {
  applicationId: string;
  landInfo: LandInfo;
  cadastralMapUrl?: string; // 지적도
  aerialPhotoUrl?: string; // 항공사진
  landShape: LandShape; // 토지 모양
  actualUsage: LandCategory; // 실제 이용 상황
  farmMachineDifficulty: "미입력" | "해당" | "해당없음";
  ownerOpinion: string; // 소유자 의견
  reviewerComment: string; // 검토 의견
  signatureArea?: string; // 서명란
  generatedAt: string;
}
