import type { LandInfo, Application, AIAnalysisResult, JudgmentRationale } from "./types";

// 동적 날짜 생성 헬퍼 함수
const getDateString = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

// 날짜 상수 (현재 날짜 기준)
const TODAY = getDateString(0);           // 오늘
const YESTERDAY = getDateString(1);       // 어제
const TWO_DAYS_AGO = getDateString(2);    // 2일 전
const THREE_DAYS_AGO = getDateString(3);  // 3일 전
const FOUR_DAYS_AGO = getDateString(4);   // 4일 전
const FIVE_DAYS_AGO = getDateString(5);   // 5일 전
const SIX_DAYS_AGO = getDateString(6);    // 6일 전
const ONE_WEEK_AGO = getDateString(7);    // 1주일 전
const TEN_DAYS_AGO = getDateString(10);   // 10일 전
const TWO_WEEKS_AGO = getDateString(14);  // 2주 전
const THREE_WEEKS_AGO = getDateString(21);// 3주 전
const ONE_MONTH_AGO = getDateString(30);  // 1달 전
const TWO_MONTHS_AGO = getDateString(60); // 2달 전
const THREE_MONTHS_AGO = getDateString(90);// 3달 전
const SIX_MONTHS_AGO = getDateString(180);// 6달 전
const ONE_YEAR_AGO = getDateString(365);  // 1년 전
const TWO_YEARS_AGO = getDateString(730); // 2년 전

// 더미 토지 정보
export const dummyLandInfoList: LandInfo[] = [
  {
    id: "land-001",
    address: "경기도 용인시 처인구 양지면 마성리 123-4",
    originalArea: 1200,
    includedArea: 850,
    remainingArea: 350,
    remainingRatio: 29.2,
    landType: "택지",
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

  // 잔여지 0 케이스 (전체 편입)
  {
    id: "land-002",
    address: "경기도 용인시 처인구 양지면 마성리 125-1",
    originalArea: 600,
    includedArea: 600,
    remainingArea: 0,
    remainingRatio: 0,
    landType: "농지",
    landCategory: "전",
    originalShape: "정방형",
    remainingShape: "-",
    originalShapeIndex: 4.0,
    remainingShapeIndex: 0,
    ownerName: "박영희",
    ownerContact: "010-9876-5432",
    hasIncludedLand: true,
    businessUnit: "수도권",
    projectName: "용인-양지 도로확장사업",
    coordinates: [
      { lat: 37.2186, lng: 127.2958 },
      { lat: 37.2191, lng: 127.2968 },
      { lat: 37.2184, lng: 127.2973 },
      { lat: 37.2179, lng: 127.2963 },
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
    landType: "택지",
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
    landType: "택지",
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
    landType: "택지",
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
    landType: "택지",
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
  // 동일 소유자 복수 필지 - 주 필지
  {
    id: "land-007",
    address: "경기도 성남시 분당구 야탑동 100-1",
    originalArea: 400,
    includedArea: 280,
    remainingArea: 120,
    remainingRatio: 30.0,
    landType: "택지",
    landCategory: "대",
    originalShape: "���로장방형",
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
  // ========== 강남 지역 필지들 ==========
  // 강남 필지 1: 김대현 소유
  {
    id: "land-gangnam-001",
    address: "서울특별시 강남구 역삼동 123-1",
    originalArea: 500,
    includedArea: 350,
    remainingArea: 150,
    remainingRatio: 30.0,
    landType: "택지",
    landCategory: "대",
    originalShape: "정방형",
    remainingShape: "삼각형",
    originalShapeIndex: 4.0,
    remainingShapeIndex: 5.5,
    ownerName: "김대현",
    ownerContact: "010-1234-5678",
    hasIncludedLand: true,
    businessUnit: "강남",
    projectName: "강남역 주변 도시정비사업",
    coordinates: [
      { lat: 37.5010, lng: 127.0360 },
      { lat: 37.5015, lng: 127.0370 },
      { lat: 37.5008, lng: 127.0375 },
      { lat: 37.5003, lng: 127.0365 },
    ],
  },
  // 강남 필지 2: 김대현 소유 (동일 소유자, 동일 지목)
  {
    id: "land-gangnam-002",
    address: "서울특별시 강남구 역삼동 123-2",
    originalArea: 400,
    includedArea: 280,
    remainingArea: 120,
    remainingRatio: 30.0,
    landType: "택지",
    landCategory: "대",
    originalShape: "가로장방형",
    remainingShape: "부정형",
    originalShapeIndex: 4.2,
    remainingShapeIndex: 5.8,
    ownerName: "김대현",
    ownerContact: "010-1234-5678",
    hasIncludedLand: true,
    businessUnit: "강남",
    projectName: "강남역 주변 도시정비사업",
    coordinates: [
      { lat: 37.5015, lng: 127.0370 },
      { lat: 37.5020, lng: 127.0380 },
      { lat: 37.5013, lng: 127.0385 },
      { lat: 37.5008, lng: 127.0375 },
    ],
  },
  // 강남 필지 3: 이서현 소유 (다른 소유자)
  {
    id: "land-gangnam-003",
    address: "서울특별시 강남구 역삼동 125-1",
    originalArea: 600,
    includedArea: 450,
    remainingArea: 150,
    remainingRatio: 25.0,
    landType: "택지",
    landCategory: "대",
    originalShape: "세로장방형",
    remainingShape: "자루형",
    originalShapeIndex: 4.5,
    remainingShapeIndex: 6.2,
    ownerName: "이서현",
    ownerContact: "010-9876-5432",
    hasIncludedLand: true,
    businessUnit: "강남",
    projectName: "강남역 주변 도시정비사업",
    coordinates: [
      { lat: 37.5020, lng: 127.0380 },
      { lat: 37.5025, lng: 127.0390 },
      { lat: 37.5018, lng: 127.0395 },
      { lat: 37.5013, lng: 127.0385 },
    ],
  },
  // 강남 필지 4: 박준혁 소유 (다른 소유자)
  {
    id: "land-gangnam-004",
    address: "서울특별시 강남구 역삼동 127-3",
    originalArea: 450,
    includedArea: 300,
    remainingArea: 150,
    remainingRatio: 33.3,
    landType: "택지",
    landCategory: "대",
    originalShape: "정방형",
    remainingShape: "역삼각형",
    originalShapeIndex: 4.0,
    remainingShapeIndex: 5.3,
    ownerName: "박준혁",
    ownerContact: "010-5555-6666",
    hasIncludedLand: true,
    businessUnit: "강남",
    projectName: "강남역 주변 도시정비사업",
    coordinates: [
      { lat: 37.5025, lng: 127.0390 },
      { lat: 37.5030, lng: 127.0400 },
      { lat: 37.5023, lng: 127.0405 },
      { lat: 37.5018, lng: 127.0395 },
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
    landType: "택지",
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
    landType: "택지",
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
    landType: "택지",
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
    landType: "택지",
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
    landType: "���지",
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
      { lat: 37.2090, lng: 127.0830 },
      { lat: 37.2083, lng: 127.0835 },
      { lat: 37.2078, lng: 127.0825 },
    ],
  },
  {
    id: "land-019",
    address: "경기도 화성시 동탄면 신리 201-8",
    originalArea: 450,
    includedArea: 290,
    remainingArea: 160,
    remainingRatio: 35.6,
    landType: "그밖의토지",
    landCategory: "잡",
    originalShape: "세로장방형",
    remainingShape: "삼각형",
    originalShapeIndex: 4.3,
    remainingShapeIndex: 5.4,
    ownerName: "김대현",
    ownerContact: "010-1234-0001",
    hasIncludedLand: true,
    businessUnit: "수도권",
    projectName: "동탄2 도시개발사업",
    coordinates: [
      { lat: 37.2095, lng: 127.0840 },
      { lat: 37.2088, lng: 127.0845 },
      { lat: 37.2083, lng: 127.0835 },
    ],
  },
  // ===== 복수필지 매수 케이스 =====
  // 복수필지: 3필지 농지 (동일 소유자)
  {
    id: "land-unified-001",
    address: "경기도 안성시 미양면 계륵리 501-1",
    originalArea: 800,
    includedArea: 550,
    remainingArea: 250,
    remainingRatio: 31.3,
    landType: "농지",
    landCategory: "답",
    originalShape: "가로장방형",
    remainingShape: "삼각형",
    originalShapeIndex: 4.2,
    remainingShapeIndex: 5.9,
    ownerName: "박일단",
    ownerContact: "010-5500-1001",
    hasIncludedLand: true,
    businessUnit: "천안안성",
    projectName: "안성-천안 국도확장사업",
    coordinates: [
      { lat: 37.0050, lng: 127.2750 },
      { lat: 37.0055, lng: 127.2760 },
      { lat: 37.0048, lng: 127.2765 },
      { lat: 37.0043, lng: 127.2755 },
    ],
  },
  {
    id: "land-unified-002",
    address: "경기도 안성시 미양면 계륵리 501-2",
    originalArea: 650,
    includedArea: 480,
    remainingArea: 170,
    remainingRatio: 26.2,
    landType: "농지",
    landCategory: "답",
    originalShape: "세로장방형",
    remainingShape: "역삼각형",
    originalShapeIndex: 4.3,
    remainingShapeIndex: 5.7,
    ownerName: "박일단",
    ownerContact: "010-5500-1001",
    hasIncludedLand: true,
    businessUnit: "천안안성",
    projectName: "안성-천안 국도확장사업",
    coordinates: [
      { lat: 37.0055, lng: 127.2760 },
      { lat: 37.0060, lng: 127.2770 },
      { lat: 37.0053, lng: 127.2775 },
      { lat: 37.0048, lng: 127.2765 },
    ],
  },
  {
    id: "land-unified-003",
    address: "경기도 안성시 미양면 계륵리 501-3",
    originalArea: 550,
    includedArea: 400,
    remainingArea: 150,
    remainingRatio: 27.3,
    landType: "농지",
    landCategory: "전",
    originalShape: "정방형",
    remainingShape: "부정형",
    originalShapeIndex: 4.0,
    remainingShapeIndex: 5.5,
    ownerName: "박일단",
    ownerContact: "010-5500-1001",
    hasIncludedLand: true,
    businessUnit: "천안안성",
    projectName: "안성-천안 국도확장사업",
    coordinates: [
      { lat: 37.0060, lng: 127.2770 },
      { lat: 37.0065, lng: 127.2780 },
      { lat: 37.0058, lng: 127.2785 },
      { lat: 37.0053, lng: 127.2775 },
    ],
  },
  // 복수필지: 대지+농지 혼합 (4필지, 다양한 용도)
  {
    id: "land-unified-004",
    address: "충청남도 천안시 서북구 성정동 777-1",
    originalArea: 300,
    includedArea: 210,
    remainingArea: 90,
    remainingRatio: 30.0,
    landType: "택지",
    landCategory: "대",
    originalShape: "가로장방형",
    remainingShape: "삼각형",
    originalShapeIndex: 4.2,
    remainingShapeIndex: 5.8,
    ownerName: "최혼합",
    ownerContact: "010-7700-2002",
    hasIncludedLand: true,
    businessUnit: "천안안성",
    projectName: "천안 도시개발사업",
    coordinates: [
      { lat: 36.8150, lng: 127.1550 },
      { lat: 36.8155, lng: 127.1560 },
      { lat: 36.8148, lng: 127.1565 },
      { lat: 36.8143, lng: 127.1555 },
    ],
  },
  {
    id: "land-unified-005",
    address: "충청남도 천안시 서북구 성정동 777-2",
    originalArea: 450,
    includedArea: 320,
    remainingArea: 130,
    remainingRatio: 28.9,
    landType: "농지",
    landCategory: "전",
    originalShape: "세로장방형",
    remainingShape: "자루형",
    originalShapeIndex: 4.4,
    remainingShapeIndex: 6.2,
    ownerName: "최혼합",
    ownerContact: "010-7700-2002",
    hasIncludedLand: true,
    businessUnit: "천안안성",
    projectName: "천안 도시개발사업",
    coordinates: [
      { lat: 36.8155, lng: 127.1560 },
      { lat: 36.8160, lng: 127.1570 },
      { lat: 36.8153, lng: 127.1575 },
      { lat: 36.8148, lng: 127.1565 },
    ],
  },
  {
    id: "land-unified-006",
    address: "충청남도 천안시 서북구 성정동 777-3",
    originalArea: 600,
    includedArea: 430,
    remainingArea: 170,
    remainingRatio: 28.3,
    landType: "농지",
    landCategory: "답",
    originalShape: "정방형",
    remainingShape: "역삼각형",
    originalShapeIndex: 4.0,
    remainingShapeIndex: 5.6,
    ownerName: "최혼합",
    ownerContact: "010-7700-2002",
    hasIncludedLand: true,
    businessUnit: "천안안성",
    projectName: "천안 도시개발사업",
    coordinates: [
      { lat: 36.8160, lng: 127.1570 },
      { lat: 36.8165, lng: 127.1580 },
      { lat: 36.8158, lng: 127.1585 },
      { lat: 36.8153, lng: 127.1575 },
    ],
  },
  {
    id: "land-unified-007",
    address: "충청남도 천안시 서북구 성정동 777-4",
    originalArea: 200,
    includedArea: 140,
    remainingArea: 60,
    remainingRatio: 30.0,
    landType: "그밖의토지",
    landCategory: "잡",
    originalShape: "가로장방형",
    remainingShape: "삼각형",
    originalShapeIndex: 4.1,
    remainingShapeIndex: 5.4,
    ownerName: "최혼합",
    ownerContact: "010-7700-2002",
    hasIncludedLand: true,
    businessUnit: "천안안성",
    projectName: "천안 도시개발사업",
    coordinates: [
      { lat: 36.8165, lng: 127.1580 },
      { lat: 36.8170, lng: 127.1590 },
      { lat: 36.8163, lng: 127.1595 },
      { lat: 36.8158, lng: 127.1585 },
    ],
  },
  // ===== 소규모 복수필지 케이스 =====
  // 소규모 복수필지: 2필지 대지 (맹지 발생으로 매수)
  {
    id: "land-recognized-001",
    address: "경기도 용인시 처인구 양지면 대대리 123-1",
    originalArea: 180,
    includedArea: 100,
    remainingArea: 80,
    remainingRatio: 44.4,
    landType: "택지",
    landCategory: "대",
    originalShape: "가로장방형",
    remainingShape: "삼각형",
    originalShapeIndex: 4.0,
    remainingShapeIndex: 5.8,
    ownerName: "김인정",
    ownerContact: "010-1234-5678",
    hasIncludedLand: true,
    businessUnit: "양평이천",
    projectName: "용인-안성 고속도로 확장",
    coordinates: [
      { lat: 37.2350, lng: 127.2850 },
      { lat: 37.2355, lng: 127.2860 },
      { lat: 37.2348, lng: 127.2865 },
      { lat: 37.2343, lng: 127.2855 },
    ],
  },
  {
    id: "land-recognized-002",
    address: "경기도 용인시 처인구 양지면 대대리 123-2",
    originalArea: 150,
    includedArea: 90,
    remainingArea: 60,
    remainingRatio: 40.0,
    landType: "택지",
    landCategory: "대",
    originalShape: "세로장방형",
    remainingShape: "자루형",
    originalShapeIndex: 4.2,
    remainingShapeIndex: 6.1,
    ownerName: "김인정",
    ownerContact: "010-1234-5678",
    hasIncludedLand: true,
    businessUnit: "양평이천",
    projectName: "용인-안성 고속도로 확장",
    coordinates: [
      { lat: 37.2355, lng: 127.2860 },
      { lat: 37.2360, lng: 127.2870 },
      { lat: 37.2353, lng: 127.2875 },
      { lat: 37.2348, lng: 127.2865 },
    ],
  },
  // 복수필지: 5필지 산지 (임야 조림지)
  {
    id: "land-recognized-003",
    address: "강원도 원주시 지정면 신평리 산 101",
    originalArea: 3000,
    includedArea: 1500,
    remainingArea: 1500,
    remainingRatio: 50.0,
    landType: "산지",
    landCategory: "임",
    originalShape: "부정형",
    remainingShape: "삼각형",
    originalShapeIndex: 5.5,
    remainingShapeIndex: 6.8,
    ownerName: "이산림",
    ownerContact: "010-2345-6789",
    hasIncludedLand: true,
    businessUnit: "원주영월",
    projectName: "원주-제천 고속도로",
    coordinates: [
      { lat: 37.3150, lng: 127.9450 },
      { lat: 37.3160, lng: 127.9470 },
      { lat: 37.3145, lng: 127.9480 },
      { lat: 37.3135, lng: 127.9460 },
    ],
  },
  {
    id: "land-recognized-004",
    address: "강원도 원주시 지정면 신평리 산 102",
    originalArea: 2500,
    includedArea: 1800,
    remainingArea: 700,
    remainingRatio: 28.0,
    landType: "산지",
    landCategory: "임",
    originalShape: "부정형",
    remainingShape: "역삼각형",
    originalShapeIndex: 5.3,
    remainingShapeIndex: 6.5,
    ownerName: "이산림",
    ownerContact: "010-2345-6789",
    hasIncludedLand: true,
    businessUnit: "원주영월",
    projectName: "원주-제천 고속도로",
    coordinates: [
      { lat: 37.3160, lng: 127.9470 },
      { lat: 37.3170, lng: 127.9490 },
      { lat: 37.3155, lng: 127.9500 },
      { lat: 37.3145, lng: 127.9480 },
    ],
  },
  {
    id: "land-recognized-005",
    address: "강원도 원주시 지정면 신평리 산 103",
    originalArea: 2800,
    includedArea: 2000,
    remainingArea: 800,
    remainingRatio: 28.6,
    landType: "산지",
    landCategory: "임",
    originalShape: "부정형",
    remainingShape: "부정형",
    originalShapeIndex: 5.4,
    remainingShapeIndex: 6.9,
    ownerName: "이산림",
    ownerContact: "010-2345-6789",
    hasIncludedLand: true,
    businessUnit: "원주영월",
    projectName: "원주-제천 고속도로",
    coordinates: [
      { lat: 37.3170, lng: 127.9490 },
      { lat: 37.3180, lng: 127.9510 },
      { lat: 37.3165, lng: 127.9520 },
      { lat: 37.3155, lng: 127.9500 },
    ],
  },
  {
    id: "land-recognized-006",
    address: "강원도 원주시 지정면 신평리 산 104",
    originalArea: 2200,
    includedArea: 1600,
    remainingArea: 600,
    remainingRatio: 27.3,
    landType: "산지",
    landCategory: "임",
    originalShape: "세로장방형",
    remainingShape: "삼각형",
    originalShapeIndex: 4.8,
    remainingShapeIndex: 6.2,
    ownerName: "이산림",
    ownerContact: "010-2345-6789",
    hasIncludedLand: true,
    businessUnit: "원주영월",
    projectName: "원주-제천 고속도로",
    coordinates: [
      { lat: 37.3180, lng: 127.9510 },
      { lat: 37.3190, lng: 127.9530 },
      { lat: 37.3175, lng: 127.9540 },
      { lat: 37.3165, lng: 127.9520 },
    ],
  },
  {
    id: "land-recognized-007",
    address: "강원도 원주시 지정면 신평리 산 105",
    originalArea: 1800,
    includedArea: 1300,
    remainingArea: 500,
    remainingRatio: 27.8,
    landType: "산지",
    landCategory: "임",
    originalShape: "가로장방형",
    remainingShape: "자루형",
    originalShapeIndex: 4.5,
    remainingShapeIndex: 6.0,
    ownerName: "이산림",
    ownerContact: "010-2345-6789",
    hasIncludedLand: true,
    businessUnit: "원주영월",
    projectName: "원주-제천 고속도로",
    coordinates: [
      { lat: 37.3190, lng: 127.9530 },
      { lat: 37.3200, lng: 127.9550 },
      { lat: 37.3185, lng: 127.9560 },
      { lat: 37.3175, lng: 127.9540 },
    ],
  },
  // ===== 혼합 케이스 (일부 매수 + 일부 미해당) =====
  // 4필지 중 2필지 매수, 나머지 2필지 미해당
  {
    id: "land-mixed-001",
    address: "경기도 평택시 포승읍 내기리 200-1",
    originalArea: 500,
    includedArea: 350,
    remainingArea: 150,
    remainingRatio: 30.0,
    landType: "농지",
    landCategory: "답",
    originalShape: "가로장방형",
    remainingShape: "삼각형",
    originalShapeIndex: 4.1,
    remainingShapeIndex: 5.9,
    ownerName: "정혼합",
    ownerContact: "010-3456-7890",
    hasIncludedLand: true,
    businessUnit: "평택화성",
    projectName: "평택항 배후도로 건설",
    coordinates: [
      { lat: 36.9650, lng: 126.8250 },
      { lat: 36.9655, lng: 126.8260 },
      { lat: 36.9648, lng: 126.8265 },
      { lat: 36.9643, lng: 126.8255 },
    ],
  },
  {
    id: "land-mixed-002",
    address: "경기도 평택시 포승읍 내기리 200-2",
    originalArea: 600,
    includedArea: 420,
    remainingArea: 180,
    remainingRatio: 30.0,
    landType: "농지",
    landCategory: "답",
    originalShape: "세로장방형",
    remainingShape: "역삼각형",
    originalShapeIndex: 4.2,
    remainingShapeIndex: 5.7,
    ownerName: "정혼합",
    ownerContact: "010-3456-7890",
    hasIncludedLand: true,
    businessUnit: "평택화성",
    projectName: "평택항 배후도로 건설",
    coordinates: [
      { lat: 36.9655, lng: 126.8260 },
      { lat: 36.9660, lng: 126.8270 },
      { lat: 36.9653, lng: 126.8275 },
      { lat: 36.9648, lng: 126.8265 },
    ],
  },
  {
    id: "land-mixed-003",
    address: "경기도 평택시 포승읍 만호리 55-1",
    originalArea: 800,
    includedArea: 200,
    remainingArea: 600,
    remainingRatio: 75.0,
    landType: "농지",
    landCategory: "전",
    originalShape: "정방형",
    remainingShape: "정방형",
    originalShapeIndex: 4.0,
    remainingShapeIndex: 4.2,
    ownerName: "정혼합",
    ownerContact: "010-3456-7890",
    hasIncludedLand: true,
    businessUnit: "평택화성",
    projectName: "평택항 배후도로 건설",
    coordinates: [
      { lat: 36.9700, lng: 126.8300 },
      { lat: 36.9705, lng: 126.8310 },
      { lat: 36.9698, lng: 126.8315 },
      { lat: 36.9693, lng: 126.8305 },
    ],
  },
  {
    id: "land-mixed-004",
    address: "경기도 평택시 포승읍 만호리 55-2",
    originalArea: 700,
    includedArea: 150,
    remainingArea: 550,
    remainingRatio: 78.6,
    landType: "농지",
    landCategory: "전",
    originalShape: "가로장방형",
    remainingShape: "가로장방형",
    originalShapeIndex: 4.1,
    remainingShapeIndex: 4.3,
    ownerName: "정혼합",
    ownerContact: "010-3456-7890",
    hasIncludedLand: true,
    businessUnit: "평택화성",
    projectName: "평택항 배후도로 건설",
    coordinates: [
      { lat: 36.9705, lng: 126.8310 },
      { lat: 36.9710, lng: 126.8320 },
      { lat: 36.9703, lng: 126.8325 },
      { lat: 36.9698, lng: 126.8315 },
    ],
  },
  // 3필지 접수완료 케이스용 토지 정보
  {
    id: "land-3parcel-001",
    address: "경기도 수원시 영통구 매탄동 100",
    landType: "택지",
    landSubType: "residential-detached",
    originalArea: 450,
    incorporatedArea: 180,
    remainingArea: 270,
    remainingRatio: 60,
    currentUsage: "대",
    reportedShape: "정방형",
    ownerName: "김접수",
    ownerContact: "010-1111-2222",
    hasIncludedLand: true,
    businessUnit: "수원시청",
    projectName: "영통지구 도시개발사업",
    coordinates: [
      { lat: 37.2580, lng: 127.0460 },
      { lat: 37.2585, lng: 127.0470 },
      { lat: 37.2578, lng: 127.0475 },
      { lat: 37.2573, lng: 127.0465 },
    ],
  },
  {
    id: "land-3parcel-002",
    address: "경기도 수원시 영통구 매탄동 101",
    landType: "택지",
    landSubType: "residential-detached",
    originalArea: 380,
    incorporatedArea: 150,
    remainingArea: 230,
    remainingRatio: 60.5,
    currentUsage: "대",
    reportedShape: "장방형",
    ownerName: "김접수",
    ownerContact: "010-1111-2222",
    hasIncludedLand: true,
    businessUnit: "수원시청",
    projectName: "영통지구 도시개발사업",
    coordinates: [
      { lat: 37.2585, lng: 127.0470 },
      { lat: 37.2590, lng: 127.0480 },
      { lat: 37.2583, lng: 127.0485 },
      { lat: 37.2578, lng: 127.0475 },
    ],
  },
  {
    id: "land-3parcel-003",
    address: "경기도 수원시 영통구 매탄동 102",
    landType: "택지",
    landSubType: "residential-detached",
    originalArea: 520,
    incorporatedArea: 220,
    remainingArea: 300,
    remainingRatio: 57.7,
    currentUsage: "대",
    reportedShape: "사다리꼴",
    ownerName: "김접수",
    ownerContact: "010-1111-2222",
    hasIncludedLand: true,
    businessUnit: "수원시청",
    projectName: "영통지구 도시개발사업",
    coordinates: [
      { lat: 37.2590, lng: 127.0480 },
      { lat: 37.2595, lng: 127.0490 },
      { lat: 37.2588, lng: 127.0495 },
      { lat: 37.2583, lng: 127.0485 },
    ],
  },
];

// 토지분류별 면적 기준 (PRD v2.0 기준 - 중앙토지수용위원회 참고기준)
// 잔여비율 25% 이하 시 면적 기준 1.5배 완화 적용
const LAND_TYPE_CRITERIA = {
  // 택지: 주거 90㎡ / 상업 150㎡ / 공업 330㎡ 이하 (잔여비율 25% 이하 시 1.5배 완화)
  택지: {
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
  
  if (landInfo.landType === "택지") {
    const subTypeKey = landSubType || "default";
    const subTypeCriteria = LAND_TYPE_CRITERIA.택지[subTypeKey as keyof typeof LAND_TYPE_CRITERIA.택지] || LAND_TYPE_CRITERIA.택지.default;
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
  
  if (landInfo.landType === "택지") {
    // 택지: ① 접면도로 상태 변경으로 건축허가 불가 ② 형상 부정형으로 변경
    criteriaChecks.push({
      criteriaName: "접면도로 상실",
      criteriaDescription: "접면도로 상태 변경으로 건축허가 불가",
      isMet: false, // 민원인이 직접 체크
      autoDetected: false,
    });
  } else if (landInfo.landType === "농지") {
    // 농지: ① 도로/수로 상실 ② 농기계 회전 곤란 ③ 축사부지 건축 불가
    criteriaChecks.push({
      criteriaName: "도로/수로 상실",
      criteriaDescription: "도로/수로 상실로 농지로서의 사용 불가",
      isMet: false,
      autoDetected: false,
    });
    criteriaChecks.push({
      criteriaName: "농기계 회전 곤란",
      criteriaDescription: "농기계 회전이 곤란하여 영농 불가",
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
    // 그 밖의 토지: ① 진입 곤란 ② 토지 양분 ③ 형상 변경
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
  // - AI 판정은 "수용가능", "수용불가" 두 가지
  // - 물리 조건 중 하나라도 해당 시 '수용가능'
  // - 전체 조건 미해당시 '수용불가'
  // - 잔여 면적이 0인 경우 잔여지가 없으므로 '수용불가'
  let provisionalJudgment: "수용가능" | "수용불가";
  
  // 잔여 면적이 0인 경우: 잔여지 자체가 없으므로 신청 불가
  if (landInfo.remainingArea === 0) {
    provisionalJudgment = "수용불가";
  } else {
    // 면적 기준 충족 여부
    const coreCriteriaMet = areaMet;
    
    // 토지 유형별 판정 로직 (PDF 기준)
    if (landInfo.landType === "임야") {
    // 산지: 면적 기준 + 접면 도로 상실만 (형상 조건 없음!)
    if (coreCriteriaMet) {
      provisionalJudgment = "수용가능";
    } else {
      provisionalJudgment = "수용불가";
    }
  } else if (landInfo.landType === "택지" || landInfo.landType === "농지") {
    // 택지/농지: 면적 기준 + 형상 조건 적용
    if (coreCriteriaMet || isIrregularShape || shapeIndexMet) {
      provisionalJudgment = "수용가능";
    } else {
      provisionalJudgment = "수용불가";
    }
  } else {
    // 그 밖의 토지: 면적 기준 + 잔여비율 50% 이하 + 형상 변경
    if (coreCriteriaMet || isBlindLand || isIrregularShape || shapeIndexMet) {
      provisionalJudgment = "수용가능";
    } else {
      provisionalJudgment = "수용불가";
    }
  }
  } // end of remainingArea > 0 check
  
  const metAutoCriteria = criteriaChecks.filter(c => c.autoDetected && c.isMet).length;

  // 판단 ��거 생성
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
  judgment: "수용가능" | "수용불가",
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
    landTypeCriteria = "농지 기준: 면��� 330㎡ 이하 (잔여비율 25% 이하 시 495㎡까지 완화)";
    physicalConditions = "물리조건: ①도로/수로 상실로 농지 사용 불가 ②농기계 회전 곤란 ③형상 부정형(사각형 폭 5m이하/삼각형 한변 11m이하)";
  } else if (land.landType === "택지") {
    landTypeCriteria = "택지 기준: 주거 90㎡, 상업 150㎡, 공업 330㎡ 이하 (���여비율 25% 이하 시 1.5배 완화)";
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

  // Build strings in parts to avoid Turbopack unicode boundary issues
  const landTypeStr = land.landType;
  const addressStr = land.address;
  const landCategoryStr = land.landCategory;
  const originalAreaStr = String(land.originalArea);
  const remainingAreaStr = String(land.remainingArea);
  const remainingRatioStr = String(land.remainingRatio);
  const originalShapeStr = land.originalShape;
  const remainingShapeStr = land.remainingShape;
  const shapeIndexStr = shapeIndexChange.toFixed(1);
  const criteriaStr = metCriteriaNames.join(", ");

  if (judgment === "수용가능") {
    summary = landTypeStr + " 수용 조건 충족으로 수용가능 판정";
    detailedExplanation = [
      "소재지: " + addressStr,
      "토지유형: " + landTypeStr + ", 지목: " + landCategoryStr,
      "편입현황: " + originalAreaStr + "m2 -> 잔여 " + remainingAreaStr + "m2 (잔여비율 " + remainingRatioStr + "%)",
      "형상변화: " + originalShapeStr + " -> " + remainingShapeStr + " (형상지수 +" + shapeIndexStr + ")",
      "충족기준: " + criteriaStr,
      "",
      "* 물리 조건 중 하나 이상 해당으로 수용 조건 충족"
    ].join("\n");
  } else {
    const areaThreshold = land.landType === "택지" ? 90 : 330;
    const rejectionReason = "잔여면적 " + remainingAreaStr + "m2(기준 " + areaThreshold + "m2 초과), 잔여비율 " + remainingRatioStr + "%(기준 초과), 물리조건 미해당";
    summary = landTypeStr + " 수용 조건 미충족으로 수용불가 판정";
    detailedExplanation = [
      "소재지: " + addressStr,
      "토지유형: " + landTypeStr + ", 지목: " + landCategoryStr,
      "편입현황: " + originalAreaStr + "m2 -> 잔여 " + remainingAreaStr + "m2 (잔여비율 " + remainingRatioStr + "%)",
      "형상변화: " + originalShapeStr + " -> " + remainingShapeStr + " (형상지수 +" + shapeIndexStr + ")",
      "수용불가사유: " + rejectionReason,
      "",
      "* 면적/비율 기준 및 물리조건 전체 미해당"
    ].join("\n");
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
    applicationType: "single",
    applicantName: "김철수",
    applicantContact: "010-1234-5678",
    applicantAddress: "경기도 용인시 처인구 포곡읍 마성리 100",
    landInfo: dummyLandInfoList[0],
    actualUsage: "대",
    reportedShape: "삼각형",
    farmMachineDifficulty: false,
    reason: "고속도로 편입으로 인해 잔여지가 삼각형 형태로 남아 건축물 건축이 불가능합니다. 잔여 면적도 협소하여 종래 목적대로 사용할 수 없습니다.",
    attachments: ["토지대장.jpg", "현황사진.jpg", "지적도.jpg"],
    status: "AI분석완료",
    adminStatus: "접수완료",
    appliedAt: TODAY,
    aiResult: generateAIResult(dummyLandInfoList[0]),
    adminName: "박민수",
    businessUnit: "강진광주건설 사업단",
  },
  {
    id: "app-002",
    applicationNumber: "2026-0402-001",
    applicationType: "single",
    applicantName: "박영희",
    applicantContact: "010-9876-5432",
    applicantAddress: "경기도 화성시 동탄면 신리 400",
    landInfo: dummyLandInfoList[1],
    actualUsage: "답",
    reportedShape: "부정형",
    farmMachineDifficulty: true,
    reason: "도로 편입으로 농지가 분할되어 농기계 회전 및 회전이 불가능해졌습니다. 남은 면적으로는 농업 활동이 어렵습니다.",
    attachments: ["토지대장.pdf", "농지원부.pdf"],
    status: "검토중",
    adminStatus: "진행중",
    appliedAt: TODAY,
    aiResult: generateAIResult(dummyLandInfoList[1]),
    adminName: "홍길동",
    statusUpdatedAt: TODAY,
    businessUnit: "강진광주건설 사업단",
  },
  {
    id: "app-003",
    applicationNumber: "2026-0403-001",
    applicationType: "single",
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
    appliedAt: YESTERDAY,
    aiResult: generateAIResult(dummyLandInfoList[2]),
    adminName: "이정은",
    businessUnit: "강진광주건설 사업단",
  },
  {
    id: "app-004",
    applicationNumber: "2026-0404-001",
    applicationType: "single",
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
    appliedAt: TWO_DAYS_AGO,
    aiResult: generateAIResult(dummyLandInfoList[3]),
    finalJudgment: "매수",
    reviewerComment: "잔여지 형상 및 면적 기준 충족으로 매수 판정",
    finalReviewOpinion: "본 토지는 도로사업 편입으로 인해 잔여지가 발생하였으며, 잔여지 면적이 기준 미달이고 형상지수 악화로 정상적인 이용이 곤란한 것으로 판단됩니다. 따라서 잔여지 매수 기준에 부합하여 매수 결정이 적정합니다.",
    adminName: "홍길동",
    statusUpdatedAt: YESTERDAY,
    businessUnit: "강진광주건설 사업단",
  },
  // 동일 소유자 복수 필지 신청 케이스
  {
    id: "app-005",
    applicationNumber: "2026-0405-001",
    applicationType: "multiple", // 복수필지 신청
    applicantName: "강동원",
    applicantContact: "010-6666-7777",
    applicantAddress: "경기도 성남시 분당구 야탑동 50",
    landInfo: dummyLandInfoList[6], // land-007
    additionalLands: [dummyLandInfoList[7]], // land-008 (인접 필지)
    unifiedParcelCondition: {
      sameOwner: true,
      continuous: true,
      sameUsage: true,
      isUnifiedParcel: false,
    },
    actualUsage: "대",
    reportedShape: "삼각형",
    farmMachineDifficulty: false,
    reason: "도로 편입으로 인접한 2개 필지가 모두 불규칙한 형태로 남아 건축이 불가능합니다. 각 필지별로 매수 검토를 요청드립니다.",
    // 토지는 민원인 입력 데이터
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
    appliedAt: THREE_DAYS_AGO,
    aiResult: generateAIResult(dummyLandInfoList[6]),
    adminName: "홍길동",
    statusUpdatedAt: TWO_DAYS_AGO,
    businessUnit: "강진광주건설 사업단",
  },
  // AI 판정 경계 사례 (심의위원회 이관 필요)
  {
    id: "app-006",
    applicationNumber: "2026-0406-001",
    applicationType: "single",
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
    appliedAt: FOUR_DAYS_AGO,
  aiResult: generateAIResult(dummyLandInfoList[8]),
  adminName: "최영호",
  businessUnit: "강진광주건설 사업단",
  },
  // 매수 충족 케이스 - 면적/형상 모두 충족
  {
    id: "app-met-001",
    applicationNumber: "2026-0420-001",
    applicationType: "single",
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
    appliedAt: SIX_DAYS_AGO,
    aiResult: generateAIResult(dummyLandInfoList[4]),
    adminName: "홍길동",
    statusUpdatedAt: THREE_DAYS_AGO,
    businessUnit: "강진광주건설 사업단",
  },
  // 검토필요 케이스 - 실측 및 추가 검토 필요
  {
    id: "app-review-001",
    applicationNumber: "2026-0421-001",
    applicationType: "single",
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
    appliedAt: TEN_DAYS_AGO,
    aiResult: {
      landTypePath: "택지",
      criteriaChecks: [
        { criteriaName: "면적 기준", criteriaDescription: "택지(주거) 기준 90㎡ 이하 (완화: 135㎡)", isMet: true, autoDetected: true },
        { criteriaName: "형상 기준", criteriaDescription: "비정형 형상 (자루형)", isMet: true, autoDetected: true },
        { criteriaName: "형상지수 변화", criteriaDescription: "형상지수 1.0 이상 상승", isMet: true, autoDetected: true },
        { criteriaName: "접면도로 상실", criteriaDescription: "접면도로 상태 변경으로 건축허가 불가", isMet: false, autoDetected: false },
      ],
      provisionalJudgment: "수용가능",
      originalShapeIndex: 4.0,
      remainingShapeIndex: 5.2,
      shapeIndexChange: 1.2,
      isBlindLand: true,
      accessRoadLost: false,
      waterChannelLost: false,
      farmMachineDifficulty: false,
      judgmentRationale: {
        summary: "대지 수용 조건 일부 충족으로 「심의위원회 이관」 판정 - 실측 및 추가 검토 필요",
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
    statusUpdatedAt: FOUR_DAYS_AGO,
    businessUnit: "강진광주건설 사업단",
  },
  // 매수 불가 케이스 - 기각 처리됨
  {
    id: "app-007",
    applicationNumber: "2026-0407-001",
    applicationType: "single",
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
    appliedAt: THREE_MONTHS_AGO,
    aiResult: generateAIResult(dummyLandInfoList[9]),
    finalJudgment: "기각",
    reviewerComment: "잔여비율 90%로 매수 기준(30% 이하)을 크게 초과하며, 형상지수 변화도 0.1로 미미하여 종래 용도 사용에 지장이 없음. 매수 기준 미충족으로 기각 처리.",
    adminName: "박담당",
    statusUpdatedAt: FIVE_DAYS_AGO,
    businessUnit: "강진광주건설 사업단",
  },
  // 심의위원회 이관 케이스 - 기준 경계 사례로 위원회 심의 필요
  {
    id: "app-committee",
    applicationNumber: "2026-0407-002",
    applicationType: "single",
    applicantName: "김심의",
    applicantContact: "010-7777-8888",
    applicantAddress: "경기도 용인시 처인구 양지면 마성리 145",
    landInfo: dummyLandInfoList[8], // AI 판정 경계 사례
    actualUsage: "답",
    reportedShape: "사다리형",
    farmMachineDifficulty: true,
    reason: "도로 편입 후 농지 형태��� 크게 변경되어 정상적인 영농이 어렵습니다. 경계선 문제로 인접 토지와의 분쟁 가능성도 있어 전문가 심의가 필요합니다.",
    attachments: ["토지대장.pdf", "농지원부.pdf", "현황사진.jpg"],
    status: "처리완료",
    adminStatus: "심사완료",
    appliedAt: SIX_MONTHS_AGO,
    aiResult: generateAIResult(dummyLandInfoList[8]),
    finalJudgment: "심의위원회 이관",
    reviewerComment: "AI 판정 결과 수용가능이나, 인접 토지와의 경계 분쟁 가능성 및 농지 활용도에 대한 현장 확인 결과 추가 검토가 필요함. 잔여면적 기준은 충족하나 형상지수 변화가 경계값에 있어 심의위원회의 전문적 판단이 요구됨.",
    finalReviewOpinion: "본 건은 AI 분석 결과 매수 기준 충족으로 판단되었으나, 현장 조사 결과 인접 토지 소유자와의 경계 관련 민원이 제기된 상태이며, 농지 활용도에 대한 전문가 의견이 상이하여 심의위원회에 이관하여 종합적인 검토가 필요한 것으로 판단됩니다.",
    adminName: "박담당",
    statusUpdatedAt: SIX_DAYS_AGO,
    businessUnit: "강진광주건설 사업단",
  },
  // 매수 불가 케이스 - 검토 중 (곧 기각 예정)
  {
    id: "app-008",
    applicationNumber: "2026-0408-001",
    applicationType: "single",
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
    appliedAt: SIX_MONTHS_AGO,
    aiResult: generateAIResult(dummyLandInfoList[10]),
    adminName: "홍길동",
    statusUpdatedAt: ONE_WEEK_AGO,
    businessUnit: "강진광주건설 사업단",
  },
  // 복수 필지 8건 신청 케이스 (복수 필지 개별 신청)
  {
    id: "app-multi-8",
    applicationNumber: "2026-0420-001",
    applicationType: "multiple", // 복수 필지 개별 신청
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
    actualUsage: "답",
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
    appliedAt: TWO_WEEKS_AGO,
    aiResult: generateAIResult(dummyLandInfoList[11]),
    adminName: "홍길동",
    statusUpdatedAt: TEN_DAYS_AGO,
    businessUnit: "강진광주건설 사업단",
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
    appliedAt: THREE_WEEKS_AGO,
    aiResult: generateAIResult(dummyLandInfoList[0]),
    adminName: "이정은",
    businessUnit: "강진광주건설 사업단",
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
    appliedAt: ONE_MONTH_AGO,
    aiResult: generateAIResult(dummyLandInfoList[2]),
    adminName: "홍길동",
    statusUpdatedAt: FIVE_DAYS_AGO,
    businessUnit: "강진광주건설 사업단",
  },
  {
    id: "app-012",
    applicationNumber: "2026-0412-001",
    applicantName: "이병헌",
    applicantContact: "010-7777-8888",
    applicantAddress: "경기�� 안양시 동안구 평촌동 500",
    landInfo: dummyLandInfoList[3],
    actualUsage: "잡",
    reportedShape: "삼각형",
    farmMachineDifficulty: false,
    reason: "잔여지 형태가 불규칙하여 사용이 곤란합니다.",
    attachments: ["토지대장.pdf"],
    status: "처리완료",
    adminStatus: "심사완료",
    appliedAt: ONE_MONTH_AGO,
    aiResult: generateAIResult(dummyLandInfoList[3]),
    finalJudgment: "매수",
    reviewerComment: "매수 기준 충족",
    adminName: "최영호",
    statusUpdatedAt: SIX_DAYS_AGO,
    businessUnit: "강진광주건설 사업단",
  },
  // ===== 복수필지 매수 케이스 (신규) =====
  // 복수필지 케이스 1: 박일단 - 3필지 농지 (AI 분석 완료, 매수 판정)
  {
    id: "app-unified-001",
    applicationNumber: "2026-0425-001",
    applicantName: "박일단",
    applicantContact: "010-5500-1001",
    applicantAddress: "경기도 안성시 미양면 계륵리 500",
    landInfo: dummyLandInfoList[19], // land-unified-001
    additionalLands: [dummyLandInfoList[20], dummyLandInfoList[21]], // land-unified-002, 003
    unifiedParcelCondition: {
      sameOwner: true,
      continuous: true,
      sameUsage: true, // 모두 농지
      isUnifiedParcel: false,
    },
    actualUsage: "답",
    reportedShape: "삼각형",
    farmMachineDifficulty: true,
    reason: "안성-천안 국도확장사업으로 인해 소유한 3개 농지 필지가 모두 도로에 편입되었습니다. 편입 후 각 필지가 불규칙한 형태로 남아 농기계 회전이 불가능하고 관개수로도 단절되어 농업이 불가능합니다. 3필지 모두 매수 기준을 충족하여 일괄 매수를 신청합니다.",
    landDataList: [
      {
        currentUsage: "답" as const,
        landSubType: "" as const,
        actualUsage: "답" as const,
        reportedShape: "삼각형" as const,
        farmMachineDifficulty: true,
        accessRoadLost: false,
        waterChannelLost: true,
      },
      {
        currentUsage: "답" as const,
        landSubType: "" as const,
        actualUsage: "답" as const,
        reportedShape: "역삼각형" as const,
        farmMachineDifficulty: true,
        accessRoadLost: false,
        waterChannelLost: true,
      },
      {
        currentUsage: "전" as const,
        landSubType: "" as const,
        actualUsage: "전" as const,
        reportedShape: "부정형" as const,
        farmMachineDifficulty: true,
        accessRoadLost: true,
        waterChannelLost: false,
      },
    ],
    attachments: ["토지대장_501-1.pdf", "토지대장_501-2.pdf", "토지대장_501-3.pdf", "등기부등본.pdf", "농지원부.pdf"],
    status: "처리완료",
    adminStatus: "심사완료",
    appliedAt: ONE_YEAR_AGO,
    aiResult: {
      landTypePath: "농지",
      criteriaChecks: [
        { criteriaName: "면적 기준", criteriaDescription: "농지 기준 330㎡ 이하 (완화: 495㎡)", isMet: true, autoDetected: true },
        { criteriaName: "형상 기준", criteriaDescription: "비정형 형상 (삼각형, 역삼각형, 부정형)", isMet: true, autoDetected: true },
        { criteriaName: "형상지수 변화", criteriaDescription: "형상지수 1.0 이상 상승", isMet: true, autoDetected: true },
        { criteriaName: "도로/수로 상실", criteriaDescription: "관개수로 상실로 농지 사용 불가", isMet: true, autoDetected: false },
        { criteriaName: "농기계 회전 곤란", criteriaDescription: "농기계 회전 곤란으로 경작 불가", isMet: true, autoDetected: false },
      ],
      provisionalJudgment: "수용가능",
      originalShapeIndex: 4.2,
      remainingShapeIndex: 5.9,
      shapeIndexChange: 1.7,
      isBlindLand: false,
      accessRoadLost: true,
      waterChannelLost: true,
      farmMachineDifficulty: true,
      judgmentRationale: {
        summary: "농지 3필지 - 모든 매수 기준 충족으로 「매수」 판정",
        legalBasis: "「공익사업을 위한 토지 등의 취득 및 보상에 관한 법률」 제74조 및 동법 시행규칙 제34조",
        appliedCriteria: [
          "토지유형: 농지",
          "잔여면적: 570㎡ (개별 필지 기준 각각 충족)",
          "농지 물리조건: 관개수로 상실, 농기계 회전 곤란",
          "형상 변화: 3필지 모두 비정형으로 변경",
        ],
        detailedExplanation: "3필지 농��\n\n[필지 1] 501-1: 800㎡ → 250㎡ (삼각형)\n[필지 2] 501-2: 650㎡ → 170㎡ (역삼각형)\n[필지 3] 501-3: 550㎡ → 150㎡ (부정형)\n\n도로 편입 후 관개수로가 단절되고 형상이 불규칙하게 변경되어 농업 활동이 불가능한 상태입니다.",
        manualCheckItems: [],
      },
    },
    finalJudgment: "매수",
    reviewerComment: "3필지 농지로 확인됨. 관개수로 단절 및 형상 변경으로 농업 활동 불가. 매수 기준 충족으로 매수 결정.",
    finalReviewOpinion: "안성-천안 국도확장사업으로 편입된 3필지 농지입니다. 현장 확인 결과, 도로 편입 후 관개수로가 단절되고, 각 필지가 삼각형, 역삼각형, 부정형으로 변경되어 농기계 회전 및 회전이 불가능한 상태입니다. 매수 기준 충족하여 매수가 적정합니다.",
    adminName: "홍길동",
    statusUpdatedAt: TWO_WEEKS_AGO,
    businessUnit: "강진광주건설 사업단",
  },
  // 복수필지 케이스 2: 최혼합 - 4필지 혼합 (대지+농지+잡��지, 검토 중)
  {
    id: "app-unified-002",
    applicationNumber: "2026-0426-001",
    applicantName: "최혼합",
    applicantContact: "010-7700-2002",
    applicantAddress: "충청남도 천안시 서북구 성정동 700",
    landInfo: dummyLandInfoList[22], // land-unified-004 (대지)
    additionalLands: [dummyLandInfoList[23], dummyLandInfoList[24], dummyLandInfoList[25]], // land-unified-005, 006, 007
    unifiedParcelCondition: {
      sameOwner: true,
      continuous: true,
      sameUsage: false, // 대지+농지+잡종지 혼합
      isUnifiedParcel: false,
    },
    actualUsage: "대",
    reportedShape: "삼각형",
    farmMachineDifficulty: false,
    reason: "천안 도시개발사업으로 인해 소유한 4개 필지(대지 1, 농지 2, 잡종지 1)가 모두 도로에 편입되었습니다. 대지에는 주택이 있었으나 철거되었고, 인접한 농지와 잡종지는 주택 부속 텃밭과 창고용지로 사용해 왔습니다. 편입 후 각 필지가 불규칙한 형태로 남아 건축 및 농업이 불가능합니다. 4필지 모두 매수를 신청합니다.",
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
        currentUsage: "전" as const,
        landSubType: "" as const,
        actualUsage: "전" as const,
        reportedShape: "���루형" as const,
        farmMachineDifficulty: true,
        accessRoadLost: true,
        waterChannelLost: false,
      },
      {
        currentUsage: "답" as const,
        landSubType: "" as const,
        actualUsage: "답" as const,
        reportedShape: "역삼각형" as const,
        farmMachineDifficulty: true,
        accessRoadLost: false,
        waterChannelLost: true,
      },
      {
        currentUsage: "잡" as const,
        landSubType: "" as const,
        actualUsage: "잡" as const,
        reportedShape: "삼각형" as const,
        farmMachineDifficulty: false,
        accessRoadLost: true,
        waterChannelLost: false,
      },
    ],
    attachments: ["��지대장_777-1.pdf", "토지대장_777-2.pdf", "토지대장_777-3.pdf", "토지대장_777-4.pdf", "등기부등본.pdf", "건축물대장.pdf"],
    status: "검토중",
    adminStatus: "진행중",
    appliedAt: TWO_MONTHS_AGO,
    aiResult: {
      landTypePath: "택지",
      criteriaChecks: [
        { criteriaName: "면적 기준", criteriaDescription: "대지 기준 90㎡ 이하 (완화: 135㎡)", isMet: true, autoDetected: true },
        { criteriaName: "형상 기준", criteriaDescription: "비정형 형상 (삼각형, 자루형, 역삼각형)", isMet: true, autoDetected: true },
        { criteriaName: "형상지수 변화", criteriaDescription: "형상지수 1.0 이상 상승", isMet: true, autoDetected: true },
        { criteriaName: "접면도로 상실", criteriaDescription: "접면도로 상태 변경으로 건축허가 불가", isMet: true, autoDetected: false },
      ],
      provisionalJudgment: "수용가능",
      originalShapeIndex: 4.2,
      remainingShapeIndex: 5.8,
      shapeIndexChange: 1.6,
      isBlindLand: true,
      accessRoadLost: true,
      waterChannelLost: true,
      farmMachineDifficulty: true,
      judgmentRationale: {
        summary: "4필지 혼합 토지 - 각 필지별 매수 기준 충족으로 「매수」 판정",
        legalBasis: "「공익사업을 위한 토지 등의 취득 및 보상에 관한 법률」 제74조 및 동법 시행규칙 제34조",
        appliedCriteria: [
          "토지유형: 혼합 (대지+농지+잡종지)",
          "잔여면적: 450㎡ (개별 필지 기준 각각 충족)",
          "대지 물리조건: 접면도로 상실로 건축 불가",
          "농지 물리조건: 농기계 회전 곤란, 관개수로 상실",
          "형상 변화: 4필지 모두 비정형으로 변경",
        ],
        detailedExplanation: "4필지 혼합 토지\n\n[필지 1] 777-1 (대지): 300㎡ → 90㎡ (삼각형)\n[필지 2] 777-2 (전): 450㎡ → 130㎡ (자루형)\n[필지 3] 777-3 (답): 600㎡ → 170㎡ (역삼각형)\n[필지 4] 777-4 (잡): 200㎡ → 60㎡ (삼각형)\n\n도로 편입 후 각 필지가 비정형으로 변경되어 종래 용도로 사용이 불가능한 상태입니다.",
        manualCheckItems: ["사용 여부 현장 확인"],
      },
    },
    adminName: "홍길동",
    statusUpdatedAt: THREE_WEEKS_AGO,
    businessUnit: "강진광주건설 사업단",
  },
  // ===== 소규모 복수필지 케이스 =====
  // 소규모 복수필지 케이스 1: 김인정 - 2필지 대지 (개별 필지별 맹지 발생으로 매수 인정)
  {
    id: "app-recognized-001",
    applicationNumber: "2026-0427-001",
    applicantName: "김인정",
    applicantContact: "010-1234-5678",
    applicantAddress: "경기도 용인시 처인구 양지면 대대리 100",
    landInfo: dummyLandInfoList[26], // land-recognized-001
    additionalLands: [dummyLandInfoList[27]], // land-recognized-002
    unifiedParcelCondition: {
      sameOwner: true,
      continuous: true,
      sameUsage: true,
      isUnifiedParcel: true,
    },
    actualUsage: "대",
    reportedShape: "삼각형",
    farmMachineDifficulty: false,
    reason: "용인-안성 고속도로 확장으로 인해 소유한 2개 대지 필지가 편입되었습니다. 각 필지의 잔여면적은 개별적으로는 면적 기준을 초과하나, 고속도로 편입으로 두 필지 모두 접면도로가 상실되어 맹지가 되었습니다.",
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
        reportedShape: "자루형" as const,
        farmMachineDifficulty: false,
        accessRoadLost: true,
        waterChannelLost: false,
      },
    ],
    attachments: ["토지대장_123-1.pdf", "토지대장_123-2.pdf", "등기부등본.pdf", "현황사진.jpg"],
    status: "처리완료",
    adminStatus: "심사완료",
    appliedAt: THREE_MONTHS_AGO,
    aiResult: {
      landTypePath: "택지",
      criteriaChecks: [
        { criteriaName: "면적 기준", criteriaDescription: "잔여면적 140㎡로 건축 곤란", isMet: true, autoDetected: true },
        { criteriaName: "형상 기준", criteriaDescription: "비정형 형상 (삼각형, 자루형)", isMet: true, autoDetected: true },
        { criteriaName: "맹지 판정", criteriaDescription: "접면도로 상실로 양 필지 모두 맹지화", isMet: true, autoDetected: true },
      ],
      provisionalJudgment: "수용가능",
      originalShapeIndex: 4.1,
      remainingShapeIndex: 5.95,
      shapeIndexChange: 1.85,
      isBlindLand: true,
      accessRoadLost: true,
      waterChannelLost: false,
      farmMachineDifficulty: false,
      judgmentRationale: {
        summary: "2필지 대지 - 맹지 판정으로 「매수」 인정",
        legalBasis: "「공익사업을 위한 토지 등의 취득 및 보상에 관한 법률」 제74조 및 동법 시행규칙 제34조",
        appliedCriteria: [
          "토지유형: 대지 (주거용)",
          "잔여면적: 140㎡ (건축 곤란)",
          "맹지 판정: 양 필지 모두 접면도로 상실로 건축허가 불가",
        ],
        detailedExplanation: "2필지 대지\n\n[필지 1] 123-1: 180㎡ → 80㎡ (삼각형)\n[필지 2] 123-2: 150㎡ → 60㎡ (자루형)\n\n고속도로 편입으로 양 필지 모두 접면도로가 상실되어 맹지가 되었습니다. 건축이 불가능한 맹지 상태이므로 매수가 인정됩니다.",
        manualCheckItems: [],
      },
    },
    finalJudgment: "매수",
    reviewerComment: "맹지 판정으로 매수 인정. 현장 확인 결과 두 필지 모두 접면도로 상실 확인.",
    finalReviewOpinion: "용인-안성 고속도로 확장으로 편입된 2필지 대지입니다. 고속도로 편입으로 양 필지 모두 접면도로가 상실되어 맹지가 되었습니다. 건축이 불가능한 맹지 상태이므로 매수가 적정합니다.",
    adminName: "김철수",
    statusUpdatedAt: ONE_MONTH_AGO,
    businessUnit: "강진광주건설 사업단",
  },
  // 소규모 복수필지 케이스 2: 이산림 - 5필지 산지 (조림지 분단으로 매수 인정)
  {
    id: "app-recognized-002",
    applicationNumber: "2026-0428-001",
    applicantName: "이산림",
    applicantContact: "010-2345-6789",
    applicantAddress: "강원도 원주시 지정면 신평리 100",
    landInfo: dummyLandInfoList[28], // land-recognized-003
    additionalLands: [dummyLandInfoList[29], dummyLandInfoList[30], dummyLandInfoList[31], dummyLandInfoList[32]], // land-recognized-004~007
    unifiedParcelCondition: {
      sameOwner: true,
      continuous: true,
      sameUsage: true,
      isUnifiedParcel: false,
    },
    actualUsage: "임",
    reportedShape: "부정형",
    farmMachineDifficulty: false,
    reason: "원주-제천 고속도로 ���설로 인해 소유한 5개 산지 필지가 편입되었습니다. 30년간 조림하여 관리해 온 임야로, 고속도로가 중앙을 관통하여 조림지가 양분되었습니다. 각 필지별로 형상이 불량해지고 접근로가 차단되어 산림경영이 불가능합니다. 5필지 모두 매수를 신청합니다.",
    landDataList: [
      {
        currentUsage: "임" as const,
        landSubType: "" as const,
        actualUsage: "임" as const,
        reportedShape: "삼각형" as const,
        farmMachineDifficulty: false,
        accessRoadLost: true,
        waterChannelLost: false,
      },
      {
        currentUsage: "임" as const,
        landSubType: "" as const,
        actualUsage: "임" as const,
        reportedShape: "역삼각형" as const,
        farmMachineDifficulty: false,
        accessRoadLost: true,
        waterChannelLost: false,
      },
      {
        currentUsage: "임" as const,
        landSubType: "" as const,
        actualUsage: "임" as const,
        reportedShape: "부정형" as const,
        farmMachineDifficulty: false,
        accessRoadLost: true,
        waterChannelLost: false,
      },
      {
        currentUsage: "임" as const,
        landSubType: "" as const,
        actualUsage: "임" as const,
        reportedShape: "삼각형" as const,
        farmMachineDifficulty: false,
        accessRoadLost: true,
        waterChannelLost: false,
      },
      {
        currentUsage: "임" as const,
        landSubType: "" as const,
        actualUsage: "임" as const,
        reportedShape: "자루형" as const,
        farmMachineDifficulty: false,
        accessRoadLost: true,
        waterChannelLost: false,
      },
    ],
    attachments: ["토지대장_산101.pdf", "토지대장_산102.pdf", "토지대장_산103.pdf", "토지대장_산104.pdf", "토지대장_산105.pdf", "등기부등본.pdf", "산림경영계획서.pdf", "조림현황사진.jpg"],
    status: "검토중",
    adminStatus: "진행중",
    appliedAt: SIX_MONTHS_AGO,
    aiResult: {
      landTypePath: "산지",
      criteriaChecks: [
        { criteriaName: "면적 기준", criteriaDescription: "잔여면적 4,100㎡로 조림지 분단", isMet: true, autoDetected: true },
        { criteriaName: "형상 기준", criteriaDescription: "비정형 형상 (삼각형, 역삼각형, 부정형, 자루형)", isMet: true, autoDetected: true },
        { criteriaName: "토지 양분", criteriaDescription: "고속도로 관통으로 조림지 양분", isMet: true, autoDetected: true },
      ],
      provisionalJudgment: "수용가능",
      originalShapeIndex: 5.1,
      remainingShapeIndex: 6.48,
      shapeIndexChange: 1.38,
      isBlindLand: false,
      accessRoadLost: true,
      waterChannelLost: false,
      farmMachineDifficulty: false,
      judgmentRationale: {
        summary: "5필지 산지 - 조림지 분단으로 「매수」 인정",
        legalBasis: "「공익사업을 위한 토지 등의 취득 및 보상에 관한 법률」 제74조 및 동법 시행규칙 제34조, 산지관리법 제18조",
        appliedCriteria: [
          "토지유형: 산지 (조림지)",
          "잔여면적: 4,100㎡ (조림지 분단)",
          "토지 양분: 고속도로 관통으로 산림경영 불가",
        ],
        detailedExplanation: "5필지 산지 (조림지)\n\n[필지 1] 산101: 3,000㎡ → 1,500㎡ (삼각형)\n[필지 2] 산102: 2,500㎡ → 700㎡ (역삼각형)\n[필지 3] 산103: 2,800㎡ → 800㎡ (부정형)\n[필지 4] 산104: 2,200㎡ → 600㎡ (삼각형)\n[필지 5] 산105: 1,800㎡ → 500㎡ (자루형)\n\n고속도로가 중앙을 관통하여 조림지가 양분되어 산림경영이 불가능합니다.",
        manualCheckItems: ["산림경영계획서 확인", "조림 현황 현장 확인"],
      },
    },
    adminName: "박영희",
    statusUpdatedAt: ONE_MONTH_AGO,
    businessUnit: "강진광주건설 사업단",
  },
  // ===== 혼합 케이스: 일부 매수 + 일부 미해당 =====
  // 정혼합 - 4필지 개별 판정
  // 내기리 200-1, 200-2: 답(논), 면적 기준 충족 → 매수
  // 만호리 55-1, 55-2: 전(밭), 면적 기준 미충족 → 미해당
  {
    id: "app-mixed-001",
    applicationNumber: "2026-0429-001",
    applicantName: "정혼합",
    applicantContact: "010-3456-7890",
    applicantAddress: "경기도 평택시 포승읍 내기리 100",
    landInfo: dummyLandInfoList[33], // land-mixed-001 (내기리 200-1)
    additionalLands: [dummyLandInfoList[34], dummyLandInfoList[35], dummyLandInfoList[36]], // 200-2, 55-1, 55-2
    unifiedParcelCondition: {
      sameOwner: true,
      continuous: false, // 내기리와 만호리가 떨어져 있음
      sameUsage: false, // 답(논)과 전(밭)으로 용도 다름
      isUnifiedParcel: false,
    },
    actualUsage: "답",
    reportedShape: "삼각형",
    farmMachineDifficulty: true,
    reason: "평택항 배후도로 건설로 인해 소유한 4개 농지 필지가 편입되었습니다. 내기리 200-1, 200-2 필지는 논으로 사용 중이었으나 도로 편입 후 형상이 불규칙해져 농기계 사용이 불가합니다. 만호리 55-1, 55-2 필지는 밭으로 별도 위치에 있어 개별 검토가 필요합니다.",
    landDataList: [
      {
        currentUsage: "답" as const,
        landSubType: "" as const,
        actualUsage: "답" as const,
        reportedShape: "삼각형" as const,
        farmMachineDifficulty: true,
        accessRoadLost: false,
        waterChannelLost: true,
      },
      {
        currentUsage: "답" as const,
        landSubType: "" as const,
        actualUsage: "답" as const,
        reportedShape: "역삼각형" as const,
        farmMachineDifficulty: true,
        accessRoadLost: false,
        waterChannelLost: true,
      },
      {
        currentUsage: "전" as const,
        landSubType: "" as const,
        actualUsage: "전" as const,
        reportedShape: "정방형" as const,
        farmMachineDifficulty: false,
        accessRoadLost: false,
        waterChannelLost: false,
      },
      {
        currentUsage: "전" as const,
        landSubType: "" as const,
        actualUsage: "전" as const,
        reportedShape: "가로장방형" as const,
        farmMachineDifficulty: false,
        accessRoadLost: false,
        waterChannelLost: false,
      },
    ],
    attachments: ["토지대장_200-1.pdf", "토지대장_200-2.pdf", "토지대장_55-1.pdf", "토지대장_55-2.pdf", "���기부등본.pdf"],
    status: "검토중",
    adminStatus: "진행중",
    appliedAt: TWO_YEARS_AGO,
    aiResult: {
      landTypePath: "농지",
      criteriaChecks: [
        { criteriaName: "면적 기준 (200-1)", criteriaDescription: "잔여 150㎡ ≤ 330㎡ (농지 기준 충족)", isMet: true, autoDetected: true },
        { criteriaName: "면적 기준 (200-2)", criteriaDescription: "잔여 180㎡ ≤ 330㎡ (농지 기준 충족)", isMet: true, autoDetected: true },
        { criteriaName: "형상지수 (200-1)", criteriaDescription: "형상지수 5.0 ≥ 2.0 (불량)", isMet: true, autoDetected: true },
        { criteriaName: "면적 기준 (55-1)", criteriaDescription: "잔여 600㎡ > 330㎡ (농지 기준 미충족)", isMet: false, autoDetected: true },
        { criteriaName: "형상지수 (55-1)", criteriaDescription: "형상지수 1.2 < 2.0 (양호)", isMet: false, autoDetected: true },
        { criteriaName: "면적 기준 (55-2)", criteriaDescription: "잔여 550㎡ > 330㎡ (농지 기준 미충족)", isMet: false, autoDetected: true },
        { criteriaName: "형상지수 (55-2)", criteriaDescription: "형상지수 1.3 < 2.0 (양호)", isMet: false, autoDetected: true },
      ],
      provisionalJudgment: "수용가능",
      originalShapeIndex: 4.1,
      remainingShapeIndex: 5.0,
      shapeIndexChange: 0.9,
      isBlindLand: false,
      accessRoadLost: false,
      waterChannelLost: true,
      farmMachineDifficulty: true,
      judgmentRationale: {
        summary: "4필지 개별 판정 - 2필지(내기리) 「매수」, 2필지(만호리) 「미해당」",
        legalBasis: "「공익사업을 위한 토지 등의 취득 및 보상에 관한 법률」 제74조 및 동법 시행규칙 제34조",
        appliedCriteria: [
          "내기리 200-1: 잔여 150㎡ ≤ 330㎡, 형상지수 5.0(불량), 농기계 회전곤란 → 매수",
          "내기리 200-2: 잔여 180㎡ ≤ 330㎡, 형상지수 4.8(불량), 관개수로 상실 → 매수",
          "만호리 55-1: 면적 기준 미충족(600㎡>330㎡), 형상 양호(1.2), 종래 사용 가능 → 미해당",
          "만호리 55-2: 면적 기준 미충족(550㎡>330㎡), 형상 양호(1.3), 종래 사용 가능 → 미해당",
        ],
        detailedExplanation: "4필지 개별 판정\n\n[매수 판정]\n• 내기리 200-1(답): 500㎡→150㎡, 삼각형, 형상지수 5.0(불량)\n• 내기리 200-2(답): 600㎡→180㎡, 역삼각형, 형상지수 4.8(불량)\n→ 면적 기준 충족, 형상 불량, 관개수로 상실, 농기계 회전 곤란\n\n[미해당 판정]\n• 만호리 55-1(전): 800㎡→600㎡, 형상지수 1.2, 정방형\n• 만호리 55-2(전): 700㎡→550㎡, 형상지수 1.3, 장방형\n→ 면적 기준 미충족, 형상 양호, 종래 용도 사용 가능",
        manualCheckItems: ["만호리 필지 현장 확인", "농기계 회전로 상태 확인"],
      },
      unifiedParcelAnalysis: {
        isUnifiedParcel: false,
        totalParcels: 4,
        ownedParcels: 4,
        adjacentParcels: 2, // 내기리 200-1, 200-2만 연접
        conditions: {
          sameOwner: true,
          continuous: false, // 전체는 인접 아님
          sameUsage: false, // 전체는 용도 불일치 (답/전)
        },
        combinedArea: 1480,
        explanation: "4필지 개별 분석 결과: 내기리 200-1, 200-2는 면적 기준 충족 및 형상 불량으로 매수 판정. 만호리 55-1, 55-2는 면적 기준 미충족, 형상 양호로 미해당 판정.",
      },
      // 필지별 판정 결과 (개별 분석)
      landJudgments: [
        { landId: "land-mixed-001", judgment: "매수", unifiedGroupId: null, reason: "내기리 200-1: 잔여 150㎡ ≤ 330㎡, 형상지수 5.0(불량), 농기계 회전곤란" },
        { landId: "land-mixed-002", judgment: "매수", unifiedGroupId: null, reason: "내기리 200-2: 잔여 180㎡ ≤ 330㎡, 형상지수 4.8(불량), 관개수로 상실" },
        { landId: "land-mixed-003", judgment: "미해당", unifiedGroupId: null, reason: "면적 기준 미충족(600㎡>330㎡), 형상지수 1.2(양호), 종래 사용 가능" },
        { landId: "land-mixed-004", judgment: "미해당", unifiedGroupId: null, reason: "면적 기준 미충족(550㎡>330㎡), 형상지수 1.3(양호), 종래 사용 가능" },
      ],
    },
    adminName: "홍길동",
    statusUpdatedAt: TWO_MONTHS_AGO,
    businessUnit: "강진광주건설 사업단",
  },
  // 복수필지 신청 케이스
  {
    id: "app-unified-to-multiple",
    applicationNumber: "2026-0501-001",
    applicationType: "multiple", // 복수필지 신청
    applicantName: "정민재",
    applicantContact: "010-5555-1234",
    applicantAddress: "경기도 용인시 처인구 포곡읍 둔전리 200",
    landInfo: {
      id: "land-unified-001",
      pnu: "4146325027100200001",
      address: "경기도 용인시 처인구 포곡읍 둔전리 200-1",
      landCategory: "전",
      landType: "농지",
      originalArea: 1850,
      includedArea: 620,
      remainingArea: 1230,
      remainingRatio: 66.5,
      originalShape: "정방형",
      remainingShape: "세장형",
      originalShapeIndex: 1.2,
      remainingShapeIndex: 4.8,
      projectName: "국도 42호선 확장공사",
      projectType: "도로",
      owner: "정민재",
    },
    additionalLands: [
      {
        id: "land-unified-002",
        pnu: "4146325027100200002",
        address: "경기도 용인시 처인구 포곡읍 둔전리 200-2",
        landCategory: "답",
        landType: "농지",
        originalArea: 2100,
        includedArea: 850,
        remainingArea: 1250,
        remainingRatio: 59.5,
        originalShape: "장방형",
        remainingShape: "부정형",
        originalShapeIndex: 1.5,
        remainingShapeIndex: 5.2,
        projectName: "국도 42호선 확장공사",
        projectType: "도로",
        owner: "정민재",
      },
    ],
    unifiedParcelCondition: {
      sameOwner: true,
      continuous: true,
      sameUsage: true,
      isUnifiedParcel: false,
    },
    actualUsage: "전",
    reportedShape: "세장형",
    farmMachineDifficulty: true,
    reason: "도로 편입으로 인접한 농지 2필지가 잔여지로 남았습니다. 200-1번지(전)는 세장형으로 변하여 농기계 진입이 곤란하고, 200-2번지(답)는 관개수로가 상실되어 영농이 불가능합니다.",
    landDataList: [
      {
        currentUsage: "전" as const,
        landSubType: undefined,
        actualUsage: "전" as const,
        reportedShape: "세장형" as const,
        farmMachineDifficulty: true,
        accessRoadLost: false,
        waterChannelLost: false,
      },
      {
        currentUsage: "답" as const,
        landSubType: undefined,
        actualUsage: "답" as const,
        reportedShape: "부정형" as const,
        farmMachineDifficulty: false,
        accessRoadLost: false,
        waterChannelLost: true,
      },
    ],
    attachments: ["토지대장_용인시_포곡읍_200-1.pdf", "지적도_용인시_포곡읍_200-1.pdf", "현장사진_20260501.jpg"],
    status: "검토중",
    adminStatus: "진행중",
    appliedAt: ONE_WEEK_AGO,
    // 민원인 AI 분석 결과 - 농지 2필지 개별 분석
    aiResult: {
      provisionalJudgment: "수용가능",
      confidence: 85,
      originalArea: 3950,
      remainingArea: 2480,
      remainingRatio: 62.8,
      originalShapeIndex: 1.35,
      remainingShapeIndex: 5.0,
      shapeIndexChange: 3.65,
      isBlindLand: false,
      accessRoadLost: false,
      waterChannelLost: true,
      farmMachineDifficulty: true,
      judgmentRationale: {
        summary: "농지 2필지 개별 분석 - 200-1(전): 세장형 변형으로 농기계 진입 곤란, 200-2(답): 관개수로 상실로 영농 불가",
        legalBasis: "「공익사업을 위한 토지 등의 취득 및 보상에 관한 법률」 제74조 및 동법 시행규칙 제34조",
        appliedCriteria: [
          "200-1(전): 형상지수 4.8 (불량) - 농기계 회전 곤란 ✓",
          "200-1(전): 세장형으로 변형되어 효율적 영농 곤란 ✓",
          "200-2(답): 형상지수 5.2 (불량) ✓",
          "200-2(답): 관개수로 상실로 논농사 불가 ✓",
        ],
        detailedExplanation: "둔전리 200-1(전, 1,850㎡→1,230㎡): 잔여지가 세장형으로 변형되어 형상지수 4.8(불량)이며, 농기계 진입 및 회전이 곤란하여 효율적인 영농이 어렵습니다.\n둔전리 200-2(답, 2,100㎡→1,250㎡): 도로 편입으로 관개수로가 상실되어 논농사가 불가능하며, 형상지수 5.2(불량)로 부정형입니다.",
        manualCheckItems: ["현장 형상 확인", "농기계 진입로 확인", "관개수로 현황 확인"],
      },
      landJudgments: [
        { landId: "land-unified-001", judgment: "매수", reason: "전: 세장형(형상지수 4.8), 농기계 회전 곤란으로 효율적 영농 불가" },
        { landId: "land-unified-002", judgment: "매수", reason: "답: 관개수로 상실(형상지수 5.2), 부정형으로 논농사 불가" },
      ],
    },
    // 담당자 AI 재분석 결과 - 농지 2��지 분석
    adminAiResult: {
      provisionalJudgment: "수용가능",
      confidence: 82,
      originalArea: 3950,
      remainingArea: 2480,
      remainingRatio: 62.8,
      originalShapeIndex: 1.35,
      remainingShapeIndex: 5.0,
      shapeIndexChange: 3.65,
      isBlindLand: false,
      accessRoadLost: false,
      waterChannelLost: true,
      farmMachineDifficulty: true,
      judgmentRationale: {
        summary: "농지 2필지 담당자 분석 - 200-1(전): 농기계 진��� 곤란 확인, 200-2(답): 관개수로 상실 확인",
        legalBasis: "「공익사업을 위한 토지 등의 취득 및 보상에 관한 법률」 제74조 및 동법 시행규칙 제34조",
        appliedCriteria: [
          "토지유형: 농지 (전, 답)",
          "200-1(전): 형상지수 4.8(불량), 농기계 회전 곤란 현장 확인 ✓",
          "200-2(답): 형상지수 5.2(불량), 관개수로 상실 현장 확인 ✓",
          "두 필지 모두 효율적 영농 곤란으로 매수 기준 충족",
        ],
        detailedExplanation: "둔전리 200-1(전, 1,850㎡→1,230㎡): 현장 확인 결과 세장형 형태로 농기계 진입 및 회전이 곤란하여 효율적인 밭농사가 어려움.\n둔전리 200-2(답, 2,100㎡→1,250㎡): 현장 확인 결과 도로 편입으로 관개수로가 절단되어 논농사 불가.",
        manualCheckItems: ["최종 형상 확인 완료", "농업인 영농 현황 확인"],
      },
      landJudgments: [
        { landId: "land-unified-001", judgment: "매수", reason: "전: 세장형(형상지수 4.8), 농기계 회전 곤란 현장 확인" },
        { landId: "land-unified-002", judgment: "매수", reason: "답: 관개수로 상실(형상지수 5.2), 논농사 불가 현장 확인" },
      ],
    },
    adminName: "김철수",
    statusUpdatedAt: TEN_DAYS_AGO,
    businessUnit: "강진광주건설 사업단",
  },
  // 접수완료 상태의 3필지 신청 건
  {
    id: "app-3parcel-001",
    applicationNumber: "2026-0510-001",
    applicationType: "multiple",
    applicantName: "김접수",
    applicantContact: "010-1111-2222",
    applicantAddress: "경기도 수원시 영통구 매탄동 100",
    landInfo: dummyLandInfoList[40], // land-3parcel-001
    additionalLands: [dummyLandInfoList[41], dummyLandInfoList[42]], // land-3parcel-002, 003
    actualUsage: "대",
    reportedShape: "정방형",
    farmMachineDifficulty: false,
    reason: "영통지구 도시개발사업으로 인해 소유한 3필지 모두 잔여지가 발생하였습니다. 각 필지가 분할되어 건축물 건축이 불가능한 면적으로 남았으며, 종래 목적대로 사용이 곤란합니다.",
    landDataList: [
      {
        currentUsage: "대" as const,
        landSubType: "residential-detached" as const,
        actualUsage: "대" as const,
        reportedShape: "정방형" as const,
        farmMachineDifficulty: false,
        accessRoadLost: false,
        waterChannelLost: false,
      },
      {
        currentUsage: "대" as const,
        landSubType: "residential-detached" as const,
        actualUsage: "대" as const,
        reportedShape: "장방형" as const,
        farmMachineDifficulty: false,
        accessRoadLost: false,
        waterChannelLost: false,
      },
      {
        currentUsage: "대" as const,
        landSubType: "residential-detached" as const,
        actualUsage: "대" as const,
        reportedShape: "사다리꼴" as const,
        farmMachineDifficulty: false,
        accessRoadLost: false,
        waterChannelLost: false,
      },
    ],
    attachments: ["토지대장_매탄동_100.pdf", "토지대장_매탄동_101.pdf", "토지대장_매탄동_102.pdf", "등기부등본.pdf"],
    status: "접수완료",
    adminStatus: "접수완료",
    appliedAt: THREE_DAYS_AGO,
    aiResult: {
      provisionalJudgment: "수용가능",
      confidence: 78,
      originalArea: 1350,
      remainingArea: 800,
      remainingRatio: 59.3,
      originalShapeIndex: 1.2,
      remainingShapeIndex: 2.8,
      shapeIndexChange: 1.6,
      isBlindLand: false,
      accessRoadLost: false,
      waterChannelLost: false,
      farmMachineDifficulty: false,
      judgmentRationale: {
        summary: "3필지 택지 분석 - 매탄동 100(270㎡), 101(230㎡), 102(300㎡) 모두 주거용 택지 기준 면적 초과로 개별 검토 필요",
        legalBasis: "「공익사업을 위한 토지 등의 취득 및 보상에 관한 법률」 제74조 및 동법 시행규칙 제34조",
        appliedCriteria: [
          "토지유형: 택지 (주거용)",
          "매탄동 100: 잔여면적 270㎡ > 기준 90㎡ - 추가 검토 필요",
          "매탄동 101: 잔여면적 230㎡ > 기준 90㎡ - 추가 검토 필요",
          "매탄동 102: 잔여면적 300㎡ > 기준 90㎡ - 추가 검토 필요",
        ],
        detailedExplanation: "영통지구 도시개발사업으로 3필지가 동시에 편입되었습니다. 각 필지의 잔여 면적이 주거용 택지 기준(90㎡)을 초과하나, 형상 변화 및 접도 조건을 종합적으로 검토하여 매수 가능 여부를 판단해야 합니다.",
        manualCheckItems: ["현장 형상 확인", "접도 조건 확인", "건축 가능 여부 확인"],
      },
      landJudgments: [
        { landId: "land-3parcel-001", judgment: "매수 불가", reason: "택지: 잔여면적 270㎡, 형상 양호하나 면적 기준 초과로 재분할 필요" },
        { landId: "land-3parcel-002", judgment: "매수 불가", reason: "택지: 잔여면적 230㎡, 장방형으로 건축 효율 저하로 부적절" },
        { landId: "land-3parcel-003", judgment: "매수", reason: "택지: 잔여면적 300㎡이나 사다리꼴 형상으로 건축 효율 저하" },
      ],
    },
    landAIResults: {
      "land-3parcel-001": {
        provisionalJudgment: "수용불가",
        confidence: 75,
        originalArea: 450,
        remainingArea: 270,
        remainingRatio: 60,
        judgmentRationale: {
          summary: "매탄동 100번지: 잔여면적 270㎡로 기준 초과, 재분할 필요",
          legalBasis: "「공익사업법」 제74조",
          appliedCriteria: ["잔여면적 270㎡ > 기준 90㎡"],
          detailedExplanation: "잔여 면적이 주거용 택지 기준을 초과하여 별도 재분할이 필요합니다.",
          manualCheckItems: ["건축 가능 여부 현장 확인"],
        },
      },
      "land-3parcel-002": {
        provisionalJudgment: "수용불가",
        confidence: 72,
        originalArea: 380,
        remainingArea: 230,
        remainingRatio: 60.5,
        judgmentRationale: {
          summary: "매탄동 101번지: 잔여면적 230㎡로 장방형 형상으로 부적절",
          legalBasis: "「공익사업법」 제74조",
          appliedCriteria: ["잔여면적 230㎡ > 기준 90㎡", "장방형 형상"],
          detailedExplanation: "장방형 형상으로 건축 효율이 저하되어 매수 불가로 판정합니다.",
          manualCheckItems: ["건축 배치 가능 여부 확인"],
        },
      },
      "land-3parcel-003": {
        provisionalJudgment: "수용가능",
        confidence: 80,
        originalArea: 520,
        remainingArea: 300,
        remainingRatio: 57.7,
        judgmentRationale: {
          summary: "매탄동 102번지: 사다리꼴 형상으로 건축 효율 저하, 매수 대상",
          legalBasis: "「공익사업법」 제74조",
          appliedCriteria: ["사다리꼴 형상으로 건축 효율 저하", "형상지수 불량"],
          detailedExplanation: "사다리꼴 형상으로 인해 효율적인 건축물 배치가 어려워 매수 가능으로 판정합니다.",
          manualCheckItems: ["최종 형상 확인"],
        },
      },
    },
    adminName: "이정은",
    businessUnit: "강진광주건설 사업단",
  },
];

// 현재 활용 지목 목록
export const landCategories = [
  { value: "대", label: "대(택지)" },
  { value: "전", label: "전(밭)" },
  { value: "답", label: "답(논)" },
  { value: "임", label: "임(임야)" },
  { value: "잡", label: "그밖의 토지" },
] as const;

// 토지 형상 목록
export const landShapes = {
  regular: [
    { value: "정방���", label: "정방형" },
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
