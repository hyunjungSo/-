import type { LandInfo, Application, AIAnalysisResult } from "./types";

// 더미 토지 정보
export const dummyLandInfoList: LandInfo[] = [
  {
    id: "land-001",
    address: "경기도 용인시 처인구 포곡읍 마성리 123-4",
    originalArea: 1200,
    includedArea: 850,
    remainingArea: 350,
    remainingRatio: 29.2,
    landType: "대지",
    landCategory: "대",
    originalShape: "가로장방형",
    remainingShape: "삼각형",
    originalShapeIndex: 4.2,
    remainingShapeIndex: 5.8,
    ownerName: "김철수",
    ownerContact: "010-1234-5678",
    hasIncludedLand: true,
  },
  {
    id: "land-002",
    address: "경기도 화성시 동탄면 신리 456-7",
    originalArea: 2500,
    includedArea: 1800,
    remainingArea: 700,
    remainingRatio: 28.0,
    landType: "농지",
    landCategory: "답",
    originalShape: "세로장방형",
    remainingShape: "부정형",
    originalShapeIndex: 4.5,
    remainingShapeIndex: 6.2,
    ownerName: "박영희",
    ownerContact: "010-9876-5432",
    hasIncludedLand: true,
  },
  {
    id: "land-003",
    address: "경기도 평택시 진위면 봉남리 789-1",
    originalArea: 5000,
    includedArea: 4200,
    remainingArea: 800,
    remainingRatio: 16.0,
    landType: "산지",
    landCategory: "임",
    originalShape: "정방형",
    remainingShape: "자루형",
    originalShapeIndex: 4.0,
    remainingShapeIndex: 7.1,
    ownerName: "이민호",
    ownerContact: "010-5555-1234",
    hasIncludedLand: true,
  },
  {
    id: "land-004",
    address: "경기도 안성시 공도읍 진사리 234-5",
    originalArea: 800,
    includedArea: 500,
    remainingArea: 300,
    remainingRatio: 37.5,
    landType: "그밖의토지",
    landCategory: "잡",
    originalShape: "가로장방형",
    remainingShape: "역삼각형",
    originalShapeIndex: 4.3,
    remainingShapeIndex: 5.5,
    ownerName: "최지영",
    ownerContact: "010-7777-8888",
    hasIncludedLand: true,
  },
  // 편입토지 없는 토지 (신청 불가 케이스)
  {
    id: "land-005",
    address: "경기도 수원시 권선구 금곡동 567-8",
    originalArea: 600,
    includedArea: 0,
    remainingArea: 600,
    remainingRatio: 100,
    landType: "대지",
    landCategory: "대",
    originalShape: "정방형",
    remainingShape: "정방형",
    originalShapeIndex: 4.0,
    remainingShapeIndex: 4.0,
    ownerName: "정민수",
    ownerContact: "010-2222-3333",
    hasIncludedLand: false,
  },
  {
    id: "land-006",
    address: "경기도 오산시 오산동 가장리 890-2",
    originalArea: 1500,
    includedArea: 0,
    remainingArea: 1500,
    remainingRatio: 100,
    landType: "농지",
    landCategory: "전",
    originalShape: "가로장방형",
    remainingShape: "가로장방형",
    originalShapeIndex: 4.2,
    remainingShapeIndex: 4.2,
    ownerName: "한소영",
    ownerContact: "010-4444-5555",
    hasIncludedLand: false,
  },
];

// AI 분석 결과 생성 함수
function generateAIResult(landInfo: LandInfo): AIAnalysisResult {
  const criteriaChecks = [];
  
  // 면적 기준 체크
  criteriaChecks.push({
    criteriaName: "면적 기준",
    criteriaDescription: landInfo.landType === "대지" 
      ? "주거 90㎡ / 상업 150㎡ / 공업 330㎡ (잔여비율 25% 이하 시 1.5배 완화)"
      : "330㎡ 이하 (잔여비율 25% 이하 시 495㎡까지 완화)",
    isMet: landInfo.remainingArea <= 330 || landInfo.remainingRatio <= 25,
    autoDetected: true,
  });

  // 형상 기준 체크
  const isIrregularShape = ["삼각형", "역삼각형", "부정형", "자루형"].includes(landInfo.remainingShape);
  criteriaChecks.push({
    criteriaName: "형상 기준",
    criteriaDescription: "형상 폭 5m 이하 또는 삼각형 한 변 11m 이하, 부정형",
    isMet: isIrregularShape,
    autoDetected: true,
  });

  // 형상지수 변화
  const shapeIndexChange = landInfo.remainingShapeIndex - landInfo.originalShapeIndex;
  criteriaChecks.push({
    criteriaName: "형상지수 변화",
    criteriaDescription: "형상지수 1.0 이상 상승",
    isMet: shapeIndexChange >= 1.0,
    autoDetected: true,
  });

  // 접도 상태 (수동 확인 필요)
  criteriaChecks.push({
    criteriaName: "접면도로 상실",
    criteriaDescription: "접면도로 상실로 건축허가 불가 또는 종래 목적 사용 곤란",
    isMet: false,
    autoDetected: false,
  });

  // 최종 판정 결정
  const metCriteria = criteriaChecks.filter(c => c.isMet).length;
  const hasManualCheck = criteriaChecks.some(c => !c.autoDetected && !c.isMet);
  
  let provisionalJudgment: "매수" | "기각" | "심의위원회이관";
  if (hasManualCheck) {
    provisionalJudgment = "심의위원회이관";
  } else if (metCriteria >= 2) {
    provisionalJudgment = "매수";
  } else {
    provisionalJudgment = "기각";
  }

  return {
    landTypePath: landInfo.landType,
    criteriaChecks,
    provisionalJudgment,
    originalShapeIndex: landInfo.originalShapeIndex,
    remainingShapeIndex: landInfo.remainingShapeIndex,
    shapeIndexChange,
    isBlindLand: false,
    accessRoadLost: false,
    waterChannelLost: false,
  };
}

// 더미 민원 신청 목록
export const dummyApplications: Application[] = [
  {
    id: "app-001",
    applicationNumber: "2026-0401-001",
    applicantName: "김철수",
    applicantContact: "010-1234-5678",
    applicantAddress: "경기도 용인시 처인구 포곡읍 마성리 100",
    landInfo: dummyLandInfoList[0],
    actualUsage: "대",
    reportedShape: "삼각형",
    farmMachineDifficulty: false,
    reason: "고속도로 편입으로 인해 잔여지가 삼각형 형태로 남아 건축물 건축이 불가능합니다. 잔여 면적도 협소하여 종래 목적대로 사용할 수 없습니다.",
    attachments: ["토지대장.pdf", "등기부등본.pdf"],
    status: "AI분석완료",
    adminStatus: "대기",
    appliedAt: "2026-04-01",
    aiResult: generateAIResult(dummyLandInfoList[0]),
  },
  {
    id: "app-002",
    applicationNumber: "2026-0402-001",
    applicantName: "박영희",
    applicantContact: "010-9876-5432",
    applicantAddress: "경기도 화성시 동탄면 신리 400",
    landInfo: dummyLandInfoList[1],
    actualUsage: "답",
    reportedShape: "부정형",
    farmMachineDifficulty: true,
    reason: "도로 편입으로 농지가 분할되어 농기계 진입 및 회전이 불가능해졌습니다. 남은 면적으로는 농업 활동이 어렵습니다.",
    attachments: ["토지대장.pdf", "농지원부.pdf"],
    status: "검토중",
    adminStatus: "진행중",
    appliedAt: "2026-04-02",
    aiResult: generateAIResult(dummyLandInfoList[1]),
    adminName: "홍길동",
    statusUpdatedAt: "2026-04-10",
  },
  {
    id: "app-003",
    applicationNumber: "2026-0403-001",
    applicantName: "이민호",
    applicantContact: "010-5555-1234",
    applicantAddress: "경기도 평택시 진위면 봉남리 700",
    landInfo: dummyLandInfoList[2],
    actualUsage: "임",
    reportedShape: "자루형",
    farmMachineDifficulty: false,
    reason: "산지가 자루형으로 변형되어 임도 접근이 불가능해졌습니다. 종래 목적으로 사용이 현저히 곤란합니다.",
    attachments: ["토지대장.pdf", "산지전용허가서.pdf"],
    status: "접수됨",
    adminStatus: "대기",
    appliedAt: "2026-04-03",
    aiResult: generateAIResult(dummyLandInfoList[2]),
  },
  {
    id: "app-004",
    applicationNumber: "2026-0404-001",
    applicantName: "최지영",
    applicantContact: "010-7777-8888",
    applicantAddress: "경기도 안성시 공도읍 진사리 200",
    landInfo: dummyLandInfoList[3],
    actualUsage: "잡",
    reportedShape: "역삼각형",
    farmMachineDifficulty: false,
    reason: "토지가 양분되어 잔여지 발생. 절토 및 옹벽 설치로 진입이 곤란합니다.",
    attachments: ["토지대장.pdf"],
    status: "처리완료",
    adminStatus: "완료",
    appliedAt: "2026-04-04",
    aiResult: generateAIResult(dummyLandInfoList[3]),
    finalJudgment: "매수",
    reviewerComment: "잔여지 형상 및 면적 기준 충족으로 매수 결정",
    adminName: "김담당",
    statusUpdatedAt: "2026-04-15",
  },
];

// 법정 지목 목록
export const landCategories = [
  { value: "과", label: "과수원" },
  { value: "구", label: "구거" },
  { value: "답", label: "답" },
  { value: "대", label: "대지" },
  { value: "도", label: "도로" },
  { value: "목", label: "목장용지" },
  { value: "묘", label: "묘지" },
  { value: "양", label: "양어장" },
  { value: "임", label: "임야" },
  { value: "잡", label: "잡종지" },
  { value: "장", label: "공장용지" },
  { value: "전", label: "전" },
  { value: "제", label: "제방" },
  { value: "주유소", label: "주유소용지" },
  { value: "창", label: "창고용지" },
  { value: "천", label: "하천" },
] as const;

// 토지 형상 목록
export const landShapes = {
  regular: [
    { value: "정방형", label: "정방형" },
    { value: "가로장방형", label: "가로장방형" },
    { value: "세로장방형", label: "세로장방형" },
  ],
  irregular: [
    { value: "변형사다리형", label: "변형사다리형" },
    { value: "역사다리형", label: "역사다리형" },
    { value: "사다리형", label: "사다리형" },
    { value: "삼각형", label: "삼각형" },
    { value: "역삼각형", label: "역삼각형" },
    { value: "부정형", label: "부정형" },
    { value: "자루형", label: "자루형" },
  ],
} as const;
