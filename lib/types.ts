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
export type ProcessStatus = "접수됨" | "AI분석완료" | "검토중" | "처리완료";

// 판정 결과
export type JudgmentResult = "매수" | "기각" | "심의위원회이관";

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
}

// 민원 신청
export interface Application {
  id: string;
  applicationNumber: string; // 접수번호
  applicantName: string; // 신청인명
  applicantContact: string; // 연락처
  applicantAddress: string; // 주소
  landInfo: LandInfo;
  actualUsage: LandCategory; // 실제 이용 상황
  reportedShape: LandShape; // 신청인 입력 토지 모양
  farmMachineDifficulty?: boolean; // 농기계 진입·회전 곤란
  reason: string; // 신청 사유
  attachments: string[]; // 첨부 서류
  status: ProcessStatus;
  appliedAt: string; // 신청일
  aiResult?: AIAnalysisResult; // AI 분석 결과
  finalJudgment?: JudgmentResult; // 최종 판정
  reviewerComment?: string; // 담당자 검토 의견
}

// AI 분석 결과
export interface AIAnalysisResult {
  landTypePath: LandType; // 판단 경로 (토지 유형)
  criteriaChecks: CriteriaCheck[]; // 기준 충족 여부
  provisionalJudgment: JudgmentResult; // 잠정 판정
  originalShapeIndex: number;
  remainingShapeIndex: number;
  shapeIndexChange: number;
  isBlindLand: boolean; // 맹지 여부
  accessRoadLost: boolean; // 접면도로 상실
  waterChannelLost: boolean; // 수로 상실
}

// 기준 충족 여부
export interface CriteriaCheck {
  criteriaName: string; // 기준명
  criteriaDescription: string; // 기준 설명
  isMet: boolean; // 충족 여부
  autoDetected: boolean; // 자동 판독 가능 여부
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
