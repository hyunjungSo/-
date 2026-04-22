import type { LandInfo, Application, AIAnalysisResult, JudgmentRationale } from "./types";

// 더미 토지 정보
export const dummyLandInfoList: LandInfo[] = [
  {
    id: "land-001",
    address: "경기도 용인시 처인구 양지면 마성리 123-4",
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
    coordinates: [
      { lat: 37.2180, lng: 127.2950 },
      { lat: 37.2185, lng: 127.2960 },
      { lat: 37.2178, lng: 127.2965 },
      { lat: 37.2173, lng: 127.2955 },
    ],
  },
  {
    id: "land-002",
    address: "경기도 용인시 처인구 양지면 마성리 125-1",
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
    coordinates: [
      { lat: 37.2185, lng: 127.2960 },
      { lat: 37.2192, lng: 127.2972 },
      { lat: 37.2188, lng: 127.2980 },
      { lat: 37.2178, lng: 127.2965 },
    ],
  },
  {
    id: "land-003",
    address: "경기도 용인시 처인구 양지면 마성리 127",
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
    coordinates: [
      { lat: 37.2192, lng: 127.2972 },
      { lat: 37.2200, lng: 127.2985 },
      { lat: 37.2195, lng: 127.2995 },
      { lat: 37.2188, lng: 127.2980 },
    ],
  },
  {
    id: "land-004",
    address: "경기도 용인시 처인구 양지면 마성리 130-2",
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
    coordinates: [
      { lat: 37.2173, lng: 127.2955 },
      { lat: 37.2178, lng: 127.2965 },
      { lat: 37.2170, lng: 127.2970 },
      { lat: 37.2165, lng: 127.2960 },
    ],
  },
  // 매수 불가 케이스 (잔여 비율 높음, 형상 변화 적음)
  {
    id: "land-005",
    address: "경기도 용인시 처인구 양지면 마성리 135",
    originalArea: 2000,
    includedArea: 200,
    remainingArea: 1800,
    remainingRatio: 90.0,
    landType: "대지",
    landCategory: "대",
    originalShape: "정방형",
    remainingShape: "가로장방형",
    originalShapeIndex: 4.0,
    remainingShapeIndex: 4.3,
    ownerName: "정민수",
    ownerContact: "010-2222-3333",
    hasIncludedLand: true,
    coordinates: [
      { lat: 37.2165, lng: 127.2960 },
      { lat: 37.2170, lng: 127.2970 },
      { lat: 37.2162, lng: 127.2975 },
      { lat: 37.2157, lng: 127.2965 },
    ],
  },
  // 편입토지 없는 토지 (신청 불가 케이스)
  {
    id: "land-006",
    address: "경기도 용인시 처인구 양지면 마성리 140",
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
    ownerName: "한지민",
    ownerContact: "010-4444-5555",
    hasIncludedLand: false,
    coordinates: [
      { lat: 37.2155, lng: 127.2950 },
      { lat: 37.2160, lng: 127.2960 },
      { lat: 37.2152, lng: 127.2965 },
      { lat: 37.2147, lng: 127.2955 },
    ],
  },
  {
    id: "land-006",
    address: "경기도 용인시 처인구 양지면 마성리 140",
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
    coordinates: [
      { lat: 37.2200, lng: 127.2985 },
      { lat: 37.2210, lng: 127.2998 },
      { lat: 37.2205, lng: 127.3008 },
      { lat: 37.2195, lng: 127.2995 },
    ],
  },
  // 동일 소유자 복수 필지 (일단지 판정 케이스) - 주 필지
  {
    id: "land-007",
    address: "경기도 성남시 분당구 야탑동 100-1",
    originalArea: 400,
    includedArea: 280,
    remainingArea: 120,
    remainingRatio: 30.0,
    landType: "대지",
    landCategory: "대",
    originalShape: "가로장방형",
    remainingShape: "삼각형",
    originalShapeIndex: 4.2,
    remainingShapeIndex: 5.9,
    ownerName: "강동원",
    ownerContact: "010-6666-7777",
    hasIncludedLand: true,
    coordinates: [
      { lat: 37.4115, lng: 127.1275 },
      { lat: 37.4120, lng: 127.1285 },
      { lat: 37.4113, lng: 127.1290 },
      { lat: 37.4108, lng: 127.1280 },
    ],
  },
  // 동일 소유자 복수 필지 - 인접 필지 1
  {
    id: "land-008",
    address: "경기도 성남시 분당구 야탑동 100-2",
    originalArea: 350,
    includedArea: 200,
    remainingArea: 150,
    remainingRatio: 42.9,
    landType: "대지",
    landCategory: "대",
    originalShape: "세로장방형",
    remainingShape: "부정형",
    originalShapeIndex: 4.3,
    remainingShapeIndex: 5.7,
    ownerName: "강동원",
    ownerContact: "010-6666-7777",
    hasIncludedLand: true,
    coordinates: [
      { lat: 37.4120, lng: 127.1285 },
      { lat: 37.4125, lng: 127.1295 },
      { lat: 37.4118, lng: 127.1300 },
      { lat: 37.4113, lng: 127.1290 },
    ],
  },
  // AI 판정 경계 사례 (기준 충족 애매한 케이스)
  {
    id: "land-009",
    address: "경기도 광주시 오포읍 능평리 555-3",
    originalArea: 1000,
    includedArea: 650,
    remainingArea: 350,
    remainingRatio: 35.0,
    landType: "농지",
    landCategory: "답",
    originalShape: "정방형",
    remainingShape: "사다리형",
    originalShapeIndex: 4.0,
    remainingShapeIndex: 4.8,
    ownerName: "윤서연",
    ownerContact: "010-8888-9999",
    hasIncludedLand: true,
    coordinates: [
      { lat: 37.3685, lng: 127.1420 },
      { lat: 37.3690, lng: 127.1430 },
      { lat: 37.3683, lng: 127.1435 },
      { lat: 37.3678, lng: 127.1425 },
    ],
  },
  // 매수 불가 케이스 1: 잔여비율이 너무 높고 형상 변화 없음
  {
    id: "land-010",
    address: "경기도 이천시 마장면 덕평리 333-1",
    originalArea: 2000,
    includedArea: 200,
    remainingArea: 1800,
    remainingRatio: 90.0,
    landType: "농지",
    landCategory: "전",
    originalShape: "가로장방형",
    remainingShape: "가로장방형",
    originalShapeIndex: 4.1,
    remainingShapeIndex: 4.2,
    ownerName: "조현우",
    ownerContact: "010-1111-2222",
    hasIncludedLand: true,
    coordinates: [
      { lat: 37.2745, lng: 127.4320 },
      { lat: 37.2750, lng: 127.4330 },
      { lat: 37.2743, lng: 127.4335 },
      { lat: 37.2738, lng: 127.4325 },
    ],
  },
  // 매수 불가 케이스 2: 면적/형상 기준 모두 미충족
  {
    id: "land-011",
    address: "경기도 여주시 대신면 천남리 777-5",
    originalArea: 3000,
    includedArea: 500,
    remainingArea: 2500,
    remainingRatio: 83.3,
    landType: "대지",
    landCategory: "대",
    originalShape: "정방형",
    remainingShape: "세로장방형",
    originalShapeIndex: 4.0,
    remainingShapeIndex: 4.3,
    ownerName: "송지훈",
    ownerContact: "010-3333-4444",
    hasIncludedLand: true,
    coordinates: [
      { lat: 37.2985, lng: 127.6420 },
      { lat: 37.2990, lng: 127.6430 },
      { lat: 37.2983, lng: 127.6435 },
      { lat: 37.2978, lng: 127.6425 },
    ],
  },
];

// AI 분석 결과 생성 함수
function generateAIResult(landInfo: LandInfo, isBorderline: boolean = false): AIAnalysisResult {
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

  // 접도 상태 (직접 확인 필요)
  criteriaChecks.push({
    criteriaName: "접면도로 상실",
    criteriaDescription: "접면도로 상실로 건축허가 불가 또는 종래 목적 사용 곤란",
    isMet: false,
    autoDetected: false,
  });

  // 농기계 진입/회전 곤란 (농지의 경우 직접 확인 필요)
  if (landInfo.landType === "농지") {
    criteriaChecks.push({
      criteriaName: "농기계 진입/회전 곤란",
      criteriaDescription: "농기계 진입 및 회전이 곤란하여 영농이 불가능한 경우",
      isMet: false,
      autoDetected: false,
    });
  }

  // 수로 상실 (농지의 경우 직접 확인 필요)
  if (landInfo.landType === "농지") {
    criteriaChecks.push({
      criteriaName: "수로 상실",
      criteriaDescription: "관개수로 상실로 농업용수 공급이 불가능한 경우",
      isMet: false,
      autoDetected: false,
    });
  }

  // 최종 판정 결정
  const metAutoCriteria = criteriaChecks.filter(c => c.isMet && c.autoDetected).length;
  const hasManualCheckNeeded = criteriaChecks.some(c => !c.autoDetected);
  const manualCheckItems = criteriaChecks.filter(c => !c.autoDetected).map(c => c.criteriaName);
  const metCriteriaNames = criteriaChecks.filter(c => c.isMet).map(c => c.criteriaName);
  
  // 경계 사례 판정: 자동 판독 기준 1개만 충족하거나, 수동 확인 항목이 많은 경우
  const isBorderlineResult = isBorderline || (metAutoCriteria === 1 && hasManualCheckNeeded);
  
  let provisionalJudgment: "매수" | "기각" | "심의위원회이관";
  let borderlineReason: string | undefined;
  
  if (isBorderlineResult) {
    provisionalJudgment = "심의위원회이관";
    borderlineReason = "자동 판독 기준 충족이 애매하여 담당자 검토 및 심의위원회 판단이 필요합니다.";
  } else if (metAutoCriteria >= 2) {
    provisionalJudgment = "매수";
  } else if (hasManualCheckNeeded && metAutoCriteria >= 1) {
    provisionalJudgment = "심의위원회이관";
    borderlineReason = "수동 확인 항목이 존재하여 담당자 검토가 필요합니다.";
  } else {
    provisionalJudgment = "기각";
  }

  // 판단 근거 생성
  const judgmentRationale = generateRationale(landInfo, provisionalJudgment, metAutoCriteria, metCriteriaNames, manualCheckItems, shapeIndexChange);

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
    farmMachineDifficulty: false,
    isBorderlineCase: isBorderlineResult,
    borderlineReason,
    judgmentRationale,
  };
}

// 판단 근거 생성 헬퍼 함수
function generateRationale(
  land: LandInfo,
  judgment: "매수" | "기각" | "심의위원회이관",
  metCriteriaCount: number,
  metCriteriaNames: string[],
  manualCheckItems: string[],
  shapeIndexChange: number
): JudgmentRationale {
  const legalBasis = "「공익사업을 위한 토지 등의 취득 및 보상에 관한 법률」 제74조 및 동법 시행규칙 제34조";
  
  const appliedCriteria = [
    `${land.landType} 면적 기준 적용`,
    `형상지수 변화 기준: 1.0 이상 상승`,
    `토지 형상 기준: 불규칙 형상 여부`,
    `잔여비율 기준: 30% 이하`,
  ];

  let summary: string;
  let detailedExplanation: string;

  if (judgment === "매수") {
    summary = `잔여지 매수 기준 ${metCriteriaCount}개 항목 충족으로 「매수 가능」 판정`;
    detailedExplanation = `소재지: ${land.address}\n토지유형: ${land.landType}, 지목: ${land.landCategory}\n편입현황: ${land.originalArea}㎡ → 잔여 ${land.remainingArea}㎡ (${land.remainingRatio}%)\n형상변화: ${land.originalShape} → ${land.remainingShape} (지수 +${shapeIndexChange.toFixed(1)})\n충족기준: ${metCriteriaNames.join(", ")}`;
  } else if (judgment === "기각") {
    summary = `잔여지 매수 기준 미충족으로 「기각」 판정`;
    detailedExplanation = `소재지: ${land.address}\n토지유형: ${land.landType}, 지목: ${land.landCategory}\n편입현황: ${land.originalArea}㎡ → 잔여 ${land.remainingArea}㎡ (${land.remainingRatio}%)\n형상변화: ${land.originalShape} → ${land.remainingShape} (지수 +${shapeIndexChange.toFixed(1)})\n미충족사유: 잔여비율 ${land.remainingRatio}% > 30%, 형상 정상 범위`;
  } else {
    summary = `자동 판독 기준 애매하여 「심의위원회 이관」 필요`;
    detailedExplanation = `소재지: ${land.address}\n토지유형: ${land.landType}, 지목: ${land.landCategory}\n편입현황: ${land.originalArea}㎡ → 잔여 ${land.remainingArea}㎡ (${land.remainingRatio}%)\n수동확인필요: ${manualCheckItems.join(", ")}`;
  }

  return {
    summary,
    legalBasis,
    appliedCriteria,
    detailedExplanation,
    manualCheckItems: manualCheckItems.length > 0 ? manualCheckItems : undefined,
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
    adminStatus: "대기중",
    appliedAt: "2026-04-01",
    aiResult: generateAIResult(dummyLandInfoList[0]),
    adminName: "박민수",
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
    adminStatus: "대기중",
    appliedAt: "2026-04-03",
    aiResult: generateAIResult(dummyLandInfoList[2]),
    adminName: "이정은",
  },
  {
    id: "app-004",
    applicationNumber: "2026-0404-001",
    applicantName: "최지영",
    applicantContact: "010-7777-8888",
    applicantAddress: "경기도 안성시 공도읍 용사리 200",
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
  // 동일 소유자 복수 필지 신청 (일단지 판정 케이스)
  {
    id: "app-005",
    applicationNumber: "2026-0405-001",
    applicantName: "강동원",
    applicantContact: "010-6666-7777",
    applicantAddress: "경기도 성남시 분당구 야탑동 50",
    landInfo: dummyLandInfoList[6], // land-007
    additionalLands: [dummyLandInfoList[7]], // land-008 (인접 필지)
    unifiedParcelCondition: {
      sameOwner: true,
      continuous: true,
      sameUsage: true,
      isUnifiedParcel: true,
    },
    actualUsage: "대",
    reportedShape: "삼각형",
    farmMachineDifficulty: false,
    reason: "도로 편입으로 인접한 2개 필지가 모두 불규칙한 형태로 남아 건축이 불가능합니다. 일단지로 판정하여 병합 처리를 요청드립니다.",
    attachments: ["토지대장_100-1.pdf", "토지대장_100-2.pdf", "등기부등본.pdf"],
    status: "검토중",
    adminStatus: "진행중",
    appliedAt: "2026-04-05",
    aiResult: generateAIResult(dummyLandInfoList[6]),
    adminName: "홍길동",
    statusUpdatedAt: "2026-04-12",
  },
  // AI 판정 경계 사례 (심의위원회 이관 필요)
  {
    id: "app-006",
    applicationNumber: "2026-0406-001",
    applicantName: "윤서연",
    applicantContact: "010-8888-9999",
    applicantAddress: "경기도 광주시 오포읍 능평리 500",
    landInfo: dummyLandInfoList[8], // land-009
    actualUsage: "답",
    reportedShape: "사다리형",
    farmMachineDifficulty: true,
    reason: "도로 편입 후 농지 형태가 사다리형으로 변경되어 농기계 작업이 매우 곤란합니다. 수로도 일부 단절되어 관개가 어렵습니다.",
    attachments: ["토지대장.pdf", "농지원부.pdf"],
    status: "AI분석완료",
    adminStatus: "대기중",
    appliedAt: "2026-04-06",
    aiResult: generateAIResult(dummyLandInfoList[8], true), // 경계 사례로 생성
    isBorderlineCase: true,
    adminName: "최영호",
  },
  // 매수 불가 케이스 - 기각 처리됨
  {
    id: "app-007",
    applicationNumber: "2026-0407-001",
    applicantName: "조현우",
    applicantContact: "010-1111-2222",
    applicantAddress: "경기도 이천시 마장면 덕평리 300",
    landInfo: dummyLandInfoList[9], // land-010 (매수 불가 케이스)
    actualUsage: "전",
    reportedShape: "가로장방형",
    farmMachineDifficulty: false,
    reason: "도로 편입으로 일부 토지가 편입되었으나 잔여지가 충분히 넓어 매수를 요청합니다.",
    attachments: ["토지대장.pdf"],
    status: "처리완료",
    adminStatus: "완료",
    appliedAt: "2026-04-07",
    aiResult: generateAIResult(dummyLandInfoList[9]),
    finalJudgment: "기각",
    reviewerComment: "잔여비율 90%로 매수 기준(30% 이하)을 크게 초과하며, 형상지수 변화도 0.1로 미미하여 종래 용도 사용에 지장이 없음. 매수 기준 미충족으로 기각 처리.",
    adminName: "박담당",
    statusUpdatedAt: "2026-04-18",
  },
  // 매수 불가 케이스 - 검토 중 (곧 기각 예정)
  {
    id: "app-008",
    applicationNumber: "2026-0408-001",
    applicantName: "송지훈",
    applicantContact: "010-3333-4444",
    applicantAddress: "경기도 여주시 대신면 천남리 700",
    landInfo: dummyLandInfoList[10], // land-011 (매수 불가 케이스)
    actualUsage: "대",
    reportedShape: "세로장방형",
    farmMachineDifficulty: false,
    reason: "토지 일부가 도로에 편입되어 잔여지 매수를 신청합니다.",
    attachments: ["토지대장.pdf", "등기부등본.pdf"],
    status: "검토중",
    adminStatus: "진행중",
    appliedAt: "2026-04-08",
    aiResult: generateAIResult(dummyLandInfoList[10]),
    adminName: "김담당",
    statusUpdatedAt: "2026-04-19",
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
