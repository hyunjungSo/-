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
    businessUnit: "수도권",
    projectName: "용인-양지 도로확장사업",
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
    businessUnit: "수도권",
    projectName: "용인-양지 도로확장사업",
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
    businessUnit: "수도권",
    projectName: "용인-양지 도로확장사업",
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
    businessUnit: "수도권",
    projectName: "용인-양지 도로확장사업",
    coordinates: [
      { lat: 37.2173, lng: 127.2955 },
      { lat: 37.2178, lng: 127.2965 },
      { lat: 37.2170, lng: 127.2970 },
      { lat: 37.2165, lng: 127.2960 },
    ],
  },
  // 매수 충족 케이스 (면적 기준 충족 + 형상 비정형)
  {
    id: "land-005-met",
    address: "경기도 용인시 처인구 양지면 마성리 133",
    originalArea: 300,
    includedArea: 230,
    remainingArea: 70,
    remainingRatio: 23.3,
    landType: "대지",
    landCategory: "대",
    originalShape: "정방형",
    remainingShape: "삼각형",
    originalShapeIndex: 4.0,
    remainingShapeIndex: 5.8,
    ownerName: "이충족",
    ownerContact: "010-1111-0000",
    hasIncludedLand: true,
    businessUnit: "수도권",
    projectName: "용인-양지 도로확장사업",
    coordinates: [
      { lat: 37.2160, lng: 127.2950 },
      { lat: 37.2165, lng: 127.2960 },
      { lat: 37.2158, lng: 127.2965 },
      { lat: 37.2153, lng: 127.2955 },
    ],
  },
  // 검토필요 케이스 (면적 기준 애매, 실측 필요)
  {
    id: "land-005-review",
    address: "경기도 용인시 처인구 양지면 마성리 137",
    originalArea: 500,
    includedArea: 380,
    remainingArea: 120,
    remainingRatio: 24.0,
    landType: "대지",
    landCategory: "대",
    originalShape: "정방형",
    remainingShape: "자루형",
    originalShapeIndex: 4.0,
    remainingShapeIndex: 5.2,
    ownerName: "박검토",
    ownerContact: "010-9999-8888",
    hasIncludedLand: true,
    businessUnit: "수도권",
    projectName: "용인-양지 도로확장사업",
    coordinates: [
      { lat: 37.2162, lng: 127.2952 },
      { lat: 37.2167, lng: 127.2962 },
      { lat: 37.2160, lng: 127.2967 },
      { lat: 37.2155, lng: 127.2957 },
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
    businessUnit: "수도권",
    projectName: "용인-양지 도로확장사업",
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
    businessUnit: "수도권",
    projectName: "용인-양지 도로확장사업",
    coordinates: [
      { lat: 37.2155, lng: 127.2950 },
      { lat: 37.2160, lng: 127.2960 },
      { lat: 37.2152, lng: 127.2965 },
      { lat: 37.2147, lng: 127.2955 },
    ],
  },
  {
    id: "land-006-2",
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
    businessUnit: "수도권",
    projectName: "용인-양지 도로확장사업",
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
    businessUnit: "수도권",
    projectName: "성남-분당 도시개발사업",
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
    businessUnit: "수도권",
    projectName: "성남-분당 도시개발사업",
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
    businessUnit: "수도권",
    projectName: "광주-이천 국도확장사업",
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
    businessUnit: "양평이천",
    projectName: "이천-여주 국도확장사업",
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
    businessUnit: "양평이천",
    projectName: "여주-양평 도로확장사업",
    coordinates: [
      { lat: 37.2985, lng: 127.6420 },
      { lat: 37.2990, lng: 127.6430 },
      { lat: 37.2983, lng: 127.6435 },
      { lat: 37.2978, lng: 127.6425 },
    ],
  },
// 복수 필지 8건 케이스용 토지 데이터
  {
    id: "land-012",
    address: "경기도 화성시 동탄면 신리 201-1",
    originalArea: 500,
    includedArea: 350,
    remainingArea: 150,
    remainingRatio: 30.0,
    landType: "대지",
    landCategory: "대",
    originalShape: "가로장방형",
    remainingShape: "삼각형",
    originalShapeIndex: 4.2,
    remainingShapeIndex: 5.6,
    ownerName: "김대현",
    ownerContact: "010-1234-0001",
    hasIncludedLand: true,
    businessUnit: "수도권",
    projectName: "동탄2 도시개발사업",
    coordinates: [
      { lat: 37.2050, lng: 127.0750 },
      { lat: 37.2055, lng: 127.0760 },
      { lat: 37.2048, lng: 127.0765 },
      { lat: 37.2043, lng: 127.0755 },
    ],
  },
  {
    id: "land-013",
    address: "경기도 화성시 동탄면 신리 201-2",
    originalArea: 420,
    includedArea: 280,
    remainingArea: 140,
    remainingRatio: 33.3,
    landType: "대지",
    landCategory: "대",
    originalShape: "세로장방형",
    remainingShape: "부정형",
    originalShapeIndex: 4.3,
    remainingShapeIndex: 5.9,
    ownerName: "김대현",
    ownerContact: "010-1234-0001",
    hasIncludedLand: true,
    businessUnit: "수도권",
    projectName: "동탄2 도시개발사업",
    coordinates: [
      { lat: 37.2055, lng: 127.0760 },
      { lat: 37.2060, lng: 127.0770 },
      { lat: 37.2053, lng: 127.0775 },
      { lat: 37.2048, lng: 127.0765 },
    ],
  },
  {
    id: "land-014",
    address: "경기도 화성시 동탄면 신리 201-3",
    originalArea: 380,
    includedArea: 250,
    remainingArea: 130,
    remainingRatio: 34.2,
    landType: "대지",
    landCategory: "대",
    originalShape: "정방형",
    remainingShape: "자루형",
    originalShapeIndex: 4.0,
    remainingShapeIndex: 6.1,
    ownerName: "김대현",
    ownerContact: "010-1234-0001",
    hasIncludedLand: true,
    businessUnit: "수도권",
    projectName: "동탄2 도시개발사업",
    coordinates: [
      { lat: 37.2060, lng: 127.0770 },
      { lat: 37.2065, lng: 127.0780 },
      { lat: 37.2058, lng: 127.0785 },
      { lat: 37.2053, lng: 127.0775 },
    ],
  },
  {
    id: "land-015",
    address: "경기도 화성시 동탄면 신리 201-4",
    originalArea: 600,
    includedArea: 420,
    remainingArea: 180,
    remainingRatio: 30.0,
    landType: "농지",
    landCategory: "전",
    originalShape: "가로장방형",
    remainingShape: "삼각형",
    originalShapeIndex: 4.1,
    remainingShapeIndex: 5.4,
    ownerName: "김대현",
    ownerContact: "010-1234-0001",
    hasIncludedLand: true,
    businessUnit: "수도권",
    projectName: "동탄2 도시개발사업",
    coordinates: [
      { lat: 37.2065, lng: 127.0780 },
      { lat: 37.2070, lng: 127.0790 },
      { lat: 37.2063, lng: 127.0795 },
      { lat: 37.2058, lng: 127.0785 },
    ],
  },
  {
    id: "land-016",
    address: "경기도 화성시 동탄면 신리 201-5",
    originalArea: 550,
    includedArea: 380,
    remainingArea: 170,
    remainingRatio: 30.9,
    landType: "농지",
    landCategory: "답",
    originalShape: "세로장방형",
    remainingShape: "역삼각형",
    originalShapeIndex: 4.4,
    remainingShapeIndex: 5.8,
    ownerName: "김대현",
    ownerContact: "010-1234-0001",
    hasIncludedLand: true,
    businessUnit: "수도권",
    projectName: "동탄2 도시개발사업",
    coordinates: [
      { lat: 37.2070, lng: 127.0790 },
      { lat: 37.2075, lng: 127.0800 },
      { lat: 37.2068, lng: 127.0805 },
      { lat: 37.2063, lng: 127.0795 },
    ],
  },
  {
    id: "land-017",
    address: "경기도 화성시 동탄면 신리 201-6",
    originalArea: 480,
    includedArea: 320,
    remainingArea: 160,
    remainingRatio: 33.3,
    landType: "농지",
    landCategory: "전",
    originalShape: "정방형",
    remainingShape: "부정형",
    originalShapeIndex: 4.0,
    remainingShapeIndex: 5.5,
    ownerName: "김대현",
    ownerContact: "010-1234-0001",
    hasIncludedLand: true,
    businessUnit: "수도권",
    projectName: "동탄2 도시개발사업",
    coordinates: [
      { lat: 37.2075, lng: 127.0800 },
      { lat: 37.2080, lng: 127.0810 },
      { lat: 37.2073, lng: 127.0815 },
      { lat: 37.2068, lng: 127.0805 },
    ],
  },
  {
    id: "land-018",
    address: "경기도 화성시 동탄면 신리 201-7",
    originalArea: 700,
    includedArea: 500,
    remainingArea: 200,
    remainingRatio: 28.6,
    landType: "산지",
    landCategory: "임",
    originalShape: "가로장방형",
    remainingShape: "자루형",
    originalShapeIndex: 4.2,
    remainingShapeIndex: 6.3,
    ownerName: "김대현",
    ownerContact: "010-1234-0001",
    hasIncludedLand: true,
    businessUnit: "수도권",
    projectName: "동탄2 도시개발사업",
    coordinates: [
      { lat: 37.2080, lng: 127.0810 },
      { lat: 37.2085, lng: 127.0820 },
      { lat: 37.2078, lng: 127.0825 },
      { lat: 37.2073, lng: 127.0815 },
    ],
  },
  {
    id: "land-019",
    address: "경기도 화성시 동탄면 신리 201-8",
    originalArea: 450,
    includedArea: 300,
    remainingArea: 150,
    remainingRatio: 33.3,
    landType: "그밖의토지",
    landCategory: "잡",
    originalShape: "세로장방형",
    remainingShape: "삼각형",
    originalShapeIndex: 4.3,
    remainingShapeIndex: 5.7,
    ownerName: "김대현",
    ownerContact: "010-1234-0001",
    hasIncludedLand: true,
    businessUnit: "수도권",
    projectName: "동탄2 도시개발사업",
    coordinates: [
      { lat: 37.2085, lng: 127.0820 },
      { lat: 37.2090, lng: 127.0830 },
      { lat: 37.2083, lng: 127.0835 },
      { lat: 37.2078, lng: 127.0825 },
    ],
  },
];

// 토지분류별 면적 기준 (PRD v2.0 기준 - 중앙토지수용위원회 참고기준)
// 잔여비율 25% 이하 시 면적 기준 1.5배 완화 적용
const LAND_TYPE_CRITERIA = {
  // 대지(택지): 주거 90㎡ / 상업 150㎡ / 공업 330㎡ 이하 (잔여비율 25% 이하 시 1.5배 완화)
  대지: {
    "residential-detached": { areaThreshold: 90, ratioThreshold: 25, label: "주거용" },
    "residential-multi": { areaThreshold: 90, ratioThreshold: 25, label: "주거용" },
    "residential-apartment": { areaThreshold: 90, ratioThreshold: 25, label: "주거용" },
    "commercial": { areaThreshold: 150, ratioThreshold: 25, label: "상업용" },
    "industrial": { areaThreshold: 330, ratioThreshold: 25, label: "공업용" },
    default: { areaThreshold: 90, ratioThreshold: 25, label: "주거용(기본)" },
  },
  // 농지: 기본 면적 330㎡ 이하 (잔여비율 25% 이하 시 495㎡까지 완화)
  농지: { areaThreshold: 330, relaxedAreaThreshold: 495, ratioThreshold: 25 },
  // 산지(임야): 기본 면적 330㎡ 이하 (잔여비율 25% 이하 시 495㎡까지 완화)
  임야: { areaThreshold: 330, relaxedAreaThreshold: 495, ratioThreshold: 25 },
  // 그 밖의 토지: 기본 면적 330㎡ 이하 또는 잔여비율 50% 이하
  기타: { areaThreshold: 330, ratioThreshold: 50 },
};

// 형상 기준 상수 (PRD 물리 조건)
const SHAPE_CRITERIA = {
  rectangleWidthMin: 5, // 사각형 폭 5m 이하
  triangleSideMin: 11,  // 삼각형 한 변 11m 이하
  shapeIndexIncrease: 1.0, // 형상지수 1.0 이상 상승
  // 정형 토지 폭 기준
  regularWidthByType: {
    residential: 5,  // 주거용 5m
    commercial: 7,   // 상업용 7m  
    industrial: 10,  // 공업용 10m
    farm: 10,        // 농지 10m
    forest: 10,      // 산지 10m
  },
};

// AI 분석 결과 생성 함수 (PRD v2.0 기준)
function generateAIResult(landInfo: LandInfo, landSubType?: string): AIAnalysisResult {
  const criteriaChecks = [];
  
  // 토지 유형별 기준 가져오기 (PRD 기준)
  let baseAreaThreshold: number;
  let effectiveAreaThreshold: number;
  let ratioThreshold: number;
  let criteriaLabel: string;
  
  // 잔여비율 25% 이하 여부 확인 (완화 조건)
  const isLowRemainingRatio = landInfo.remainingRatio <= 25;
  
  if (landInfo.landType === "대지") {
    const subTypeKey = landSubType || "default";
    const subTypeCriteria = LAND_TYPE_CRITERIA.대지[subTypeKey as keyof typeof LAND_TYPE_CRITERIA.대지] || LAND_TYPE_CRITERIA.대지.default;
    baseAreaThreshold = subTypeCriteria.areaThreshold;
    // 택지: 잔여비율 25% 이하 시 1.5배 완화
    effectiveAreaThreshold = isLowRemainingRatio ? baseAreaThreshold * 1.5 : baseAreaThreshold;
    ratioThreshold = subTypeCriteria.ratioThreshold;
    const relaxedNote = isLowRemainingRatio ? ` (완화: ${effectiveAreaThreshold}㎡)` : "";
    criteriaLabel = `택지(${subTypeCriteria.label}) 기준 ${baseAreaThreshold}㎡ 이하${relaxedNote}`;
  } else if (landInfo.landType === "농지") {
    baseAreaThreshold = LAND_TYPE_CRITERIA.농지.areaThreshold;
    // 농지: 잔여비율 25% 이하 시 495㎡까지 완화
    effectiveAreaThreshold = isLowRemainingRatio ? LAND_TYPE_CRITERIA.농지.relaxedAreaThreshold : baseAreaThreshold;
    ratioThreshold = LAND_TYPE_CRITERIA.농지.ratioThreshold;
    const relaxedNote = isLowRemainingRatio ? ` (완화: ${effectiveAreaThreshold}㎡)` : "";
    criteriaLabel = `농지 기준 ${baseAreaThreshold}㎡ 이하${relaxedNote}`;
  } else if (landInfo.landType === "임야") {
    baseAreaThreshold = LAND_TYPE_CRITERIA.임야.areaThreshold;
    // 산지: 잔여비율 25% 이하 시 495㎡까지 완화
    effectiveAreaThreshold = isLowRemainingRatio ? LAND_TYPE_CRITERIA.임야.relaxedAreaThreshold : baseAreaThreshold;
    ratioThreshold = LAND_TYPE_CRITERIA.임야.ratioThreshold;
    const relaxedNote = isLowRemainingRatio ? ` (완화: ${effectiveAreaThreshold}㎡)` : "";
    criteriaLabel = `산지 기준 ${baseAreaThreshold}㎡ 이하${relaxedNote}`;
  } else {
    // 그 밖의 토지: 330㎡ 이하 또는 잔여비율 50% 이하
    baseAreaThreshold = LAND_TYPE_CRITERIA.기타.areaThreshold;
    effectiveAreaThreshold = baseAreaThreshold;
    ratioThreshold = LAND_TYPE_CRITERIA.기타.ratioThreshold;
    criteriaLabel = `그 밖의 토지 기준 ${baseAreaThreshold}㎡ 이하 또는 잔여비율 ${ratioThreshold}% 이하`;
  }
  
  // 면적 기준 체크 (완화 적용된 기준)
  const areaMet = landInfo.remainingArea <= effectiveAreaThreshold;
  criteriaChecks.push({
    criteriaName: "면적 기준",
    criteriaDescription: criteriaLabel,
    isMet: areaMet,
    autoDetected: true,
  });

  // 형상 기준 체크 (PRD 물리 조건)
  const isIrregularShape = ["삼각형", "역삼각형", "부정형", "자루형"].includes(landInfo.remainingShape);
  criteriaChecks.push({
    criteriaName: "형상 기준",
    criteriaDescription: `비정형 형상 (사각형 폭 ${SHAPE_CRITERIA.rectangleWidthMin}m 이하 / 삼각형 한 변 ${SHAPE_CRITERIA.triangleSideMin}m 이하)`,
    isMet: isIrregularShape,
    autoDetected: true,
  });

  // 형상지수 변화
  const shapeIndexChange = landInfo.remainingShapeIndex - landInfo.originalShapeIndex;
  const shapeIndexMet = shapeIndexChange >= SHAPE_CRITERIA.shapeIndexIncrease;
  criteriaChecks.push({
    criteriaName: "형상지수 변화",
    criteriaDescription: `형상지수 ${SHAPE_CRITERIA.shapeIndexIncrease} 이상 상승`,
    isMet: shapeIndexMet,
    autoDetected: true,
  });

  // 토지유형별 물리 조건 (PRD 기준)
  const isBlindLand = landInfo.remainingRatio <= ratioThreshold;
  
  if (landInfo.landType === "대지") {
    // 택지: ① 접면도로 상태 변경으로 건축허가 불가 ② 형상 부정형으로 변경
    criteriaChecks.push({
      criteriaName: "접면도로 상실",
      criteriaDescription: "접면도로 상태 변경으로 건축허가 불가",
      isMet: false, // 민원인이 직접 체크
      autoDetected: false,
    });
  } else if (landInfo.landType === "농지") {
    // 농지: ① 도로/수로 상실 ② 농기계 진입/��전 곤란 ③ 축사부지 건축 불가
    criteriaChecks.push({
      criteriaName: "도로/수로 상실",
      criteriaDescription: "도로/수로 상실로 농지로서의 사용 불가",
      isMet: false,
      autoDetected: false,
    });
    criteriaChecks.push({
      criteriaName: "농기계 진입/회전 곤란",
      criteriaDescription: "농기계 진입 및 회전이 곤란하여 영농 불가",
      isMet: false,
      autoDetected: false,
    });
  } else if (landInfo.landType === "임야") {
    // 산지: ① 접한 도로가 없어진 경우
    criteriaChecks.push({
      criteriaName: "접근도로 상실",
      criteriaDescription: "공익사업으로 인해 접한 도로가 없어진 경우",
      isMet: false,
      autoDetected: false,
    });
  } else {
    // 그 밖의 토지: ① 진입 ��란 ② 토지 양분 ③ 형상 변경
    criteriaChecks.push({
      criteriaName: "진입 곤란",
      criteriaDescription: "절토/성토/옹벽 설치 등으로 진입 곤란",
      isMet: false,
      autoDetected: false,
    });
    criteriaChecks.push({
      criteriaName: "토지 양분",
      criteriaDescription: "일단의 토지가 양분되어 잔여지 발생",
      isMet: false,
      autoDetected: false,
    });
  }

  // 최종 판정 결정 (PRD 판정 원칙)
  const manualCheckItems = criteriaChecks.filter(c => !c.autoDetected).map(c => c.criteriaName);
  const metCriteriaNames = criteriaChecks.filter(c => c.isMet).map(c => c.criteriaName);
  const physicalConditionMet = criteriaChecks.some(c => !c.autoDetected && c.isMet);
  
  // PRD 판정 원칙:
  // - AI 판정은 "매수" 또는 "매수불가" 두 가지만 존재
  // - 물리 조건 중 하나라도 해당 시 '수용 조건 충족'(=매수)
  // - 전체 조건 미해당시 '수용 조건 미충족'(=매수불가)
  let provisionalJudgment: "매수" | "매수불가";
  
  // 면적 기준 충족 여부
  const coreCriteriaMet = areaMet;
  
  if (coreCriteriaMet && (isIrregularShape || shapeIndexMet)) {
    // 면적 기준 + 형상 조건 충족 → 매수
    provisionalJudgment = "매수";
  } else if (coreCriteriaMet || (isIrregularShape && shapeIndexMet)) {
    // 면적 기준만 충족 또는 형상 조건만 충족 → 매수 (검토 필요하지만 AI는 매수 판정)
    provisionalJudgment = "매수";
  } else {
    // 전체 조건 미해당 → 매수불가
    provisionalJudgment = "매수불가";
  }
  
  const metAutoCriteria = criteriaChecks.filter(c => c.autoDetected && c.isMet).length;

  // 판단 근거 생성
  const judgmentRationale = generateRationale(landInfo, provisionalJudgment, metAutoCriteria, metCriteriaNames, manualCheckItems, shapeIndexChange);

  return {
    landTypePath: landInfo.landType,
    criteriaChecks,
    provisionalJudgment,
    originalShapeIndex: landInfo.originalShapeIndex,
    remainingShapeIndex: landInfo.remainingShapeIndex,
    shapeIndexChange,
    isBlindLand,
    accessRoadLost: false,
    waterChannelLost: false,
    farmMachineDifficulty: false,
    judgmentRationale,
  };
}

// 판단 근거 생성 헬퍼 함수 (PRD v2.0 기준 - 중앙토지수용위원회 참고문서)
function generateRationale(
  land: LandInfo,
  judgment: "매수" | "매수불가",
  metCriteriaCount: number,
  metCriteriaNames: string[],
  manualCheckItems: string[],
  shapeIndexChange: number
): JudgmentRationale {
  const legalBasis = "「공익사업을 위한 토지 등의 취득 및 보상에 관한 법률」 제74조 및 동법 시행규칙 제34조, 중앙토지수용위원회 잔여지 수용 참고기준";
  
  // 토지유형별 기준 설명 (PRD 기준)
  let landTypeCriteria: string;
  let physicalConditions: string;
  
  if (land.landType === "농지") {
    landTypeCriteria = "농지 기준: 면적 330㎡ 이하 (잔여비율 25% 이하 시 495㎡까지 완화)";
    physicalConditions = "물리조건: ①도로/수로 상실로 농지 사용 불가 ②농기계 진입/회전 곤란 ③형상 부정형(사각형 폭 5m이하/삼각형 한변 11m이하)";
  } else if (land.landType === "대지") {
    landTypeCriteria = "택지 기준: 주거 90㎡, 상업 150㎡, 공업 330㎡ 이하 (잔여비율 25% 이하 시 1.5배 완화)";
    physicalConditions = "물리조건: ①접면도로 상실로 건축허가 불가 ②형상 부정형(사각형 폭 5m이하/삼각형 한변 11m이하)";
  } else if (land.landType === "임야") {
    landTypeCriteria = "산지 기준: 면적 330㎡ 이하 (잔여비율 25% 이하 시 495㎡까지 완화)";
    physicalConditions = "물리조건: ①공익사업으로 접한 도로가 없어진 경우";
  } else {
    landTypeCriteria = "그 밖의 토지 기준: 면적 330㎡ 이하 또는 잔여비율 50% 이하";
    physicalConditions = "물리조건: ①절토/성토/옹벽으로 진입 곤란 ②토지 양분 ③형상 변경(정형: 폭 기준 미달/비정형: 형상지수 1.0이상 상승)";
  }
  
  const appliedCriteria = [
    landTypeCriteria,
    physicalConditions,
    `형상지수 변화 기준: 1.0 이상 상승 시 수용 조건 충족`,
  ];

  let summary: string;
  let detailedExplanation: string;

  if (judgment === "매수") {
    summary = `${land.landType} 수용 조건 충족으로 「매수」 판정 - 사용이 현저히 곤란한 경우로 예상`;
    detailedExplanation = `소재지: ${land.address}\n토지유형: ${land.landType}, 지목: ${land.landCategory}\n편입현황: ${land.originalArea}㎡ → 잔여 ${land.remainingArea}㎡ (잔여비율 ${land.remainingRatio}%)\n형상변화: ${land.originalShape} → ${land.remainingShape} (형상지수 +${shapeIndexChange.toFixed(1)})\n충족기준: ${metCriteriaNames.join(", ")}\n\n※ 물리 조건 중 하나 이상 해당으로 수용 조건 충족`;
  } else {
    // 매수불가
    const areaThreshold = land.landType === "대지" ? 90 : 330;
    const rejectionReason = `잔여면적 ${land.remainingArea}㎡(기준 ${areaThreshold}㎡ 초과), 잔여비율 ${land.remainingRatio}%(기준 초과), 물리조건 미해당`;
    summary = `${land.landType} 수용 조건 미충족으로 「매수불가」 판정`;
    detailedExplanation = `소재지: ${land.address}\n토지유형: ${land.landType}, 지목: ${land.landCategory}\n편입현황: ${land.originalArea}㎡ → 잔여 ${land.remainingArea}㎡ (잔여비율 ${land.remainingRatio}%)\n형상변화: ${land.originalShape} → ${land.remainingShape} (형상지수 +${shapeIndexChange.toFixed(1)})\n매수불가사유: ${rejectionReason}\n\n※ 면적/비율 기준 및 물리조건 전체 미해당`;
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
    adminStatus: "접수완료",
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
    status: "접수완료",
    adminStatus: "접수완료",
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
    adminStatus: "심사완료",
    appliedAt: "2026-04-04",
    aiResult: generateAIResult(dummyLandInfoList[3]),
    finalJudgment: "매수",
    reviewerComment: "잔여지 형상 및 면적 기준 충족으로 매수 ��정",
    adminName: "홍길동",
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
    // 토지별 민원인 입력 데이터
    landDataList: [
      {
        currentUsage: "대" as const,
        landSubType: "residential-detached" as const,
        actualUsage: "대" as const,
        reportedShape: "삼각형" as const,
        farmMachineDifficulty: false,
        accessRoadLost: true,
        waterChannelLost: false,
      },
      {
        currentUsage: "대" as const,
        landSubType: "residential-detached" as const,
        actualUsage: "대" as const,
        reportedShape: "역삼각형" as const,
        farmMachineDifficulty: false,
        accessRoadLost: true,
        waterChannelLost: false,
      },
    ],
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
  adminStatus: "접수완료",
  appliedAt: "2026-04-06",
  aiResult: generateAIResult(dummyLandInfoList[8]),
  adminName: "최영호",
  },
  // 매수 충족 케이스 - 면적/형상 모두 충족
  {
    id: "app-met-001",
    applicationNumber: "2026-0420-001",
    applicantName: "이충족",
    applicantContact: "010-1111-0000",
    applicantAddress: "경기도 용인시 처인구 양지면 마성리 133",
    landInfo: dummyLandInfoList[4], // land-005-met (충족 케이스)
    actualUsage: "대",
    reportedShape: "삼각형",
    farmMachineDifficulty: false,
    reason: "도로 편입으로 토지가 삼각형으로 변형되어 건축이 불가능합니다. 잔여면적 70㎡로 기준 이하입니다.",
    attachments: ["토지대장.pdf", "지적도.pdf"],
    status: "검토중",
    adminStatus: "진행중",
    appliedAt: "2026-04-20",
    aiResult: generateAIResult(dummyLandInfoList[4]),
    adminName: "홍길동",
    statusUpdatedAt: "2026-04-21",
  },
  // 검토필요 케이스 - 실측 및 추가 검토 필요
  {
    id: "app-review-001",
    applicationNumber: "2026-0421-001",
    applicantName: "박검토",
    applicantContact: "010-9999-8888",
    applicantAddress: "경기도 용인시 처인구 양지면 마성리 137",
    landInfo: dummyLandInfoList[5], // land-005-review (검토필요 케이스)
    actualUsage: "대",
    reportedShape: "자루형",
    farmMachineDifficulty: false,
    reason: "도로 편입으로 토지가 자루형으로 변형되었습니다. 면적 기준은 애매하여 실측이 필요합니다.",
    attachments: ["토지대장.pdf", "지적도.pdf", "현황사진.jpg"],
    status: "검토중",
    adminStatus: "진행중",
    appliedAt: "2026-04-21",
    aiResult: {
      landTypePath: "대지",
      criteriaChecks: [
        { criteriaName: "면적 기준", criteriaDescription: "택지(주거) 기준 90㎡ 이하 (완화: 135㎡)", isMet: true, autoDetected: true },
        { criteriaName: "형상 기준", criteriaDescription: "비정형 형상 (자루형)", isMet: true, autoDetected: true },
        { criteriaName: "형상지수 변화", criteriaDescription: "형상지수 1.0 이상 상승", isMet: true, autoDetected: true },
        { criteriaName: "접면도로 상실", criteriaDescription: "접면도로 상태 변경으로 건축허가 불가", isMet: false, autoDetected: false },
      ],
      provisionalJudgment: "검토필요",
      originalShapeIndex: 4.0,
      remainingShapeIndex: 5.2,
      shapeIndexChange: 1.2,
      isBlindLand: true,
      accessRoadLost: false,
      waterChannelLost: false,
      farmMachineDifficulty: false,
      judgmentRationale: {
        summary: "대지 수용 조건 일부 충족으로 「검토필요」 판정 - 실측 및 추가 검토 필요",
        legalBasis: "「공익사업을 위한 토지 등의 취득 및 보상에 관한 법률」 제74조 및 동법 시행규칙 제34조",
        appliedCriteria: [
          "택지 기준: 주거 90㎡ 이하 (잔여비율 25% 이하 시 1.5배 완화)",
          "물리조건: 형상 부정형(자루형) 확인됨",
          "면적 기준 경계선상으로 실측 필요",
        ],
        detailedExplanation: "소재지: 경기도 용인시 처인구 양지면 마성리 137\n토지유형: 대지, 지목: 대\n편입현황: 500㎡ → 잔여 120㎡ (잔여비율 24.0%)\n형상변화: 정방형 → 자루형 (형상지수 +1.2)\n\n※ 면적이 완화기준(135㎡) 근처로 실측 확인 필요",
        manualCheckItems: ["접면도로 상실 여부 현장 확인"],
      },
    },
    adminName: "홍길동",
    statusUpdatedAt: "2026-04-22",
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
    adminStatus: "심사완료",
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
    adminName: "홍길동",
    statusUpdatedAt: "2026-04-19",
  },
  // 복수 필지 8건 신청 케이스
  {
    id: "app-multi-8",
    applicationNumber: "2026-0420-001",
    applicantName: "김대현",
    applicantContact: "010-1234-0001",
    applicantAddress: "경기도 화성시 동탄면 신리 200",
    landInfo: dummyLandInfoList[11], // land-012 (첫 번째 필지)
    additionalLands: [
      dummyLandInfoList[12], // land-013
      dummyLandInfoList[13], // land-014
      dummyLandInfoList[14], // land-015
      dummyLandInfoList[15], // land-016
      dummyLandInfoList[16], // land-017
      dummyLandInfoList[17], // land-018
      dummyLandInfoList[18], // land-019
    ],
    unifiedParcelCondition: {
      sameOwner: true,
      continuous: true,
      sameUsage: false,
      isUnifiedParcel: true,
    },
    actualUsage: "대",
    reportedShape: "삼각형",
    farmMachineDifficulty: false,
    reason: "동탄2 도시개발사업으로 인해 소유한 8개 필지가 모두 도로에 편입되어 잔여지가 불규칙한 형태로 남았습니다. 각 필지별로 건축 및 농업 활동이 불가능하여 일괄 매수를 신청합니다.",
    landDataList: [
      {
        currentUsage: "대" as const,
        landSubType: "residential-detached" as const,
        actualUsage: "대" as const,
        reportedShape: "삼각형" as const,
        farmMachineDifficulty: false,
        accessRoadLost: true,
        waterChannelLost: false,
      },
      {
        currentUsage: "대" as const,
        landSubType: "residential-detached" as const,
        actualUsage: "대" as const,
        reportedShape: "부정형" as const,
        farmMachineDifficulty: false,
        accessRoadLost: true,
        waterChannelLost: false,
      },
      {
        currentUsage: "대" as const,
        landSubType: "residential-multi" as const,
        actualUsage: "대" as const,
        reportedShape: "자루형" as const,
        farmMachineDifficulty: false,
        accessRoadLost: true,
        waterChannelLost: false,
      },
      {
        currentUsage: "전" as const,
        landSubType: undefined,
        actualUsage: "전" as const,
        reportedShape: "삼각형" as const,
        farmMachineDifficulty: true,
        accessRoadLost: false,
        waterChannelLost: true,
      },
      {
        currentUsage: "답" as const,
        landSubType: undefined,
        actualUsage: "답" as const,
        reportedShape: "역삼각형" as const,
        farmMachineDifficulty: true,
        accessRoadLost: false,
        waterChannelLost: true,
      },
      {
        currentUsage: "전" as const,
        landSubType: undefined,
        actualUsage: "전" as const,
        reportedShape: "부정형" as const,
        farmMachineDifficulty: true,
        accessRoadLost: true,
        waterChannelLost: false,
      },
      {
        currentUsage: "임" as const,
        landSubType: undefined,
        actualUsage: "임" as const,
        reportedShape: "자루형" as const,
        farmMachineDifficulty: false,
        accessRoadLost: true,
        waterChannelLost: false,
      },
      {
        currentUsage: "잡" as const,
        landSubType: undefined,
        actualUsage: "잡" as const,
        reportedShape: "삼각형" as const,
        farmMachineDifficulty: false,
        accessRoadLost: true,
        waterChannelLost: false,
      },
    ],
    attachments: [
      "토지대장_201-1.pdf", 
      "토지대장_201-2.pdf", 
      "토지대장_201-3.pdf", 
      "토지대장_201-4.pdf",
      "토지대장_201-5.pdf",
      "토지대장_201-6.pdf",
      "토지대장_201-7.pdf",
      "토지대장_201-8.pdf",
      "등기부등본.pdf",
      "농지원부.pdf",
    ],
    status: "검토중",
    adminStatus: "진행중",
    appliedAt: "2026-04-20",
    aiResult: generateAIResult(dummyLandInfoList[11]),
    adminName: "홍길동",
    statusUpdatedAt: "2026-04-22",
  },
  // 추가 더미 데이터 (스크롤 테스트용)
  {
    id: "app-009",
    applicationNumber: "2026-0409-001",
    applicantName: "한지민",
    applicantContact: "010-4444-5555",
    applicantAddress: "경기도 파주시 탄현면 금산리 200",
    landInfo: dummyLandInfoList[0],
    actualUsage: "대",
    reportedShape: "삼각형",
    farmMachineDifficulty: false,
    reason: "도로 편입으로 인한 잔여지 매수 신청",
    attachments: ["토지대장.pdf"],
    status: "접수완료",
    adminStatus: "접수완료",
    appliedAt: "2026-04-09",
    aiResult: generateAIResult(dummyLandInfoList[0]),
    adminName: "이정은",
  },
  {
    id: "app-010",
    applicationNumber: "2026-0410-001",
    applicantName: "정우성",
    applicantContact: "010-5555-6666",
    applicantAddress: "경기도 고양시 일산동구 마두동 100",
    landInfo: dummyLandInfoList[1],
    actualUsage: "답",
    reportedShape: "부정형",
    farmMachineDifficulty: true,
    reason: "농기계 진입이 불가하여 농업 활동이 불가능합니다.",
    attachments: ["토지대장.pdf", "농지원부.pdf"],
    status: "AI분석완료",
    adminStatus: "접수완료",
    appliedAt: "2026-04-10",
    aiResult: generateAIResult(dummyLandInfoList[1]),
    adminName: "박민수",
  },
  {
    id: "app-011",
    applicationNumber: "2026-0411-001",
    applicantName: "김태희",
    applicantContact: "010-6666-7777",
    applicantAddress: "경기도 수원시 권선구 호매실동 300",
    landInfo: dummyLandInfoList[2],
    actualUsage: "임",
    reportedShape: "자루형",
    farmMachineDifficulty: false,
    reason: "산지 접근이 불가능해졌습니다.",
    attachments: ["토지대장.pdf"],
    status: "검토중",
    adminStatus: "진행중",
    appliedAt: "2026-04-11",
    aiResult: generateAIResult(dummyLandInfoList[2]),
    adminName: "홍길동",
    statusUpdatedAt: "2026-04-18",
  },
  {
    id: "app-012",
    applicationNumber: "2026-0412-001",
    applicantName: "이병헌",
    applicantContact: "010-7777-8888",
    applicantAddress: "경기도 안양시 동안구 평촌동 500",
    landInfo: dummyLandInfoList[3],
    actualUsage: "잡",
    reportedShape: "삼각형",
    farmMachineDifficulty: false,
    reason: "잔여지 형태가 불규칙하여 사용이 곤란합니다.",
    attachments: ["토지대장.pdf"],
    status: "처리완료",
    adminStatus: "심사완료",
    appliedAt: "2026-04-12",
    aiResult: generateAIResult(dummyLandInfoList[3]),
    finalJudgment: "매수",
    reviewerComment: "매수 기준 충족",
    adminName: "최영호",
    statusUpdatedAt: "2026-04-20",
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
