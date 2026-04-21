"use client";

import { useEffect, useRef, useState } from "react";
import { Layers, Map as MapIcon, Plus, Minus, Info, Locate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// 레이어 가시화 최소 줌 레벨
const LAYER_MIN_ZOOM = 17;

// 지역별 좌표 데이터
const regionCoordinates: Record<string, { lat: number; lng: number; zoom: number }> = {
  // 시도
  "서울특별시": { lat: 37.5665, lng: 126.9780, zoom: 11 },
  "부산광역시": { lat: 35.1796, lng: 129.0756, zoom: 11 },
  "대구광역시": { lat: 35.8714, lng: 128.6014, zoom: 11 },
  "인천광역시": { lat: 37.4563, lng: 126.7052, zoom: 11 },
  "광주광역시": { lat: 35.1595, lng: 126.8526, zoom: 11 },
  "대전광역시": { lat: 36.3504, lng: 127.3845, zoom: 11 },
  "울산광역시": { lat: 35.5384, lng: 129.3114, zoom: 11 },
  "세종특별자치시": { lat: 36.4800, lng: 127.2890, zoom: 11 },
  "경기도": { lat: 37.4138, lng: 127.5183, zoom: 9 },
  "강원특별자치도": { lat: 37.8228, lng: 128.1555, zoom: 9 },
  "충청북도": { lat: 36.6357, lng: 127.4917, zoom: 9 },
  "충청남도": { lat: 36.5184, lng: 126.8000, zoom: 9 },
  "전북특별자치도": { lat: 35.8203, lng: 127.1088, zoom: 9 },
  "전라남도": { lat: 34.8679, lng: 126.9910, zoom: 9 },
  "경상북도": { lat: 36.4919, lng: 128.8889, zoom: 9 },
  "경상남도": { lat: 35.4606, lng: 128.2132, zoom: 9 },
  "제주특별자치도": { lat: 33.4890, lng: 126.4983, zoom: 10 },
  // 시군구 (일부 예시)
  "용인시 처인구": { lat: 37.2343, lng: 127.2010, zoom: 13 },
  "이천시": { lat: 37.2720, lng: 127.4350, zoom: 12 },
  "광주시": { lat: 37.4095, lng: 127.2550, zoom: 12 },
  "음성군": { lat: 36.9400, lng: 127.6900, zoom: 12 },
  "진천군": { lat: 36.8550, lng: 127.4350, zoom: 12 },
  "천안시 동남구": { lat: 36.7850, lng: 127.1550, zoom: 12 },
  "천안시 서북구": { lat: 36.8650, lng: 127.1350, zoom: 12 },
  "아산시": { lat: 36.7900, lng: 127.0020, zoom: 12 },
  // 읍면동 (일부 예시)
  "양지면": { lat: 37.2350, lng: 127.2850, zoom: 14 },
  "백암면": { lat: 37.1550, lng: 127.3550, zoom: 14 },
  "마장면": { lat: 37.3050, lng: 127.4250, zoom: 14 },
  "곤지암읍": { lat: 37.3550, lng: 127.3250, zoom: 14 },
  "삼성면": { lat: 36.9650, lng: 127.5850, zoom: 14 },
  "금왕읍": { lat: 36.9950, lng: 127.6150, zoom: 14 },
  // 리 (일부 예시)
  "마성리": { lat: 37.2180, lng: 127.2950, zoom: 17 },
  "송문리": { lat: 37.2280, lng: 127.2780, zoom: 17 },
  "봉남리": { lat: 37.1450, lng: 127.3650, zoom: 17 },
  "덕평리": { lat: 37.3150, lng: 127.4150, zoom: 17 },
  "신리": { lat: 37.3620, lng: 127.3180, zoom: 17 },
};

interface ParcelData {
  id: string;
  coordinates: Array<{ lat: number; lng: number }>;
  address: string;
  isIncluded: boolean;
}

interface LeafletMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  selectedRegion?: string;
  onParcelClick?: (parcelId: string) => void;
  parcels?: ParcelData[];
  selectedParcelId?: string;
}

type BaseMapType = "normal" | "satellite";

export function LeafletMap({
  center = { lat: 37.2350, lng: 127.2850 },
  zoom = 14,
  selectedRegion,
  onParcelClick,
  parcels = [],
  selectedParcelId,
}: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polygonLayerRef = useRef<L.LayerGroup | null>(null);
  const normalTileRef = useRef<L.TileLayer | null>(null);
  const satelliteTileRef = useRef<L.TileLayer | null>(null);
  const landSupplyLayerRef = useRef<L.LayerGroup | null>(null);
  const roadAreaLayerRef = useRef<L.LayerGroup | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [baseMap, setBaseMap] = useState<BaseMapType>("normal");
  const [layers, setLayers] = useState({
    landSupplyDemand: false,
    roadArea: true,
  });

  const isLayerVisible = currentZoom >= LAYER_MIN_ZOOM;

  // Leaflet 초기화
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    // Leaflet CSS 동적 로드
    const linkEl = document.createElement("link");
    linkEl.rel = "stylesheet";
    linkEl.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(linkEl);

    // Leaflet JS 동적 로드
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => {
      if (!mapRef.current || mapInstanceRef.current) return;

      const L = (window as typeof window & { L: typeof import("leaflet") }).L;

      // 지도 생성
      const map = L.map(mapRef.current, {
        center: [center.lat, center.lng],
        zoom: zoom,
        zoomControl: false,
      });

      // 타일 레이어 추가 (OpenStreetMap 기본, ESRI 위성)
      const normalTile = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution: "© OpenStreetMap contributors",
        }
      );

      const satelliteTile = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: "© Esri, Maxar, Earthstar Geographics",
        }
      );

      // ref에 저장
      normalTileRef.current = normalTile;
      satelliteTileRef.current = satelliteTile;

      // 기본 타일 추가
      normalTile.addTo(map);

      // 폴리곤 레이어 그룹 생성
      const polygonLayer = L.layerGroup().addTo(map);
      polygonLayerRef.current = polygonLayer;

      // 국토수급 레이어 그룹 생성
      const landSupplyLayer = L.layerGroup();
      landSupplyLayerRef.current = landSupplyLayer;

      // 도로구역 레이어 그룹 생성 (기본 활성화)
      const roadAreaLayer = L.layerGroup().addTo(map);
      roadAreaLayerRef.current = roadAreaLayer;

      // 줌 변경 이벤트
      map.on("zoomend", () => {
        setCurrentZoom(map.getZoom());
      });

      mapInstanceRef.current = map;
      setIsMapReady(true);
    };

    document.body.appendChild(script);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 지역 변경 시 지도 이동
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedRegion) return;

    const coords = regionCoordinates[selectedRegion];
    if (coords) {
      mapInstanceRef.current.setView([coords.lat, coords.lng], coords.zoom, {
        animate: true,
      });
    }
  }, [selectedRegion]);

  // 배경지도 타입 변경 시 타일 전환
  useEffect(() => {
    if (!mapInstanceRef.current || !normalTileRef.current || !satelliteTileRef.current || !isMapReady) return;

    const map = mapInstanceRef.current;
    const normalTile = normalTileRef.current;
    const satelliteTile = satelliteTileRef.current;

    if (baseMap === "satellite") {
      if (map.hasLayer(normalTile)) {
        map.removeLayer(normalTile);
      }
      if (!map.hasLayer(satelliteTile)) {
        satelliteTile.addTo(map);
        satelliteTile.bringToBack();
      }
    } else {
      if (map.hasLayer(satelliteTile)) {
        map.removeLayer(satelliteTile);
      }
      if (!map.hasLayer(normalTile)) {
        normalTile.addTo(map);
        normalTile.bringToBack();
      }
    }
  }, [baseMap, isMapReady]);

  // 레이어 토글 효과 (국토수급, 도로구역)
  useEffect(() => {
    if (!mapInstanceRef.current || !landSupplyLayerRef.current || !roadAreaLayerRef.current || !isMapReady) return;

    const L = (window as typeof window & { L: typeof import("leaflet") }).L;
    const map = mapInstanceRef.current;
    const landSupplyLayer = landSupplyLayerRef.current;
    const roadAreaLayer = roadAreaLayerRef.current;

    // 국토수급 레이어 토글
    if (layers.landSupplyDemand) {
      if (!map.hasLayer(landSupplyLayer)) {
        // 국토수급 영역 표시 (예시 데이터 - 파란색 영역)
        landSupplyLayer.clearLayers();
        const landSupplyArea = L.polygon([
          [37.2200, 127.2900],
          [37.2250, 127.2900],
          [37.2250, 127.3000],
          [37.2200, 127.3000],
        ], {
          color: "#2196f3",
          weight: 2,
          fillColor: "#2196f3",
          fillOpacity: 0.2,
          dashArray: "5, 5",
        });
        landSupplyArea.addTo(landSupplyLayer);
        landSupplyLayer.addTo(map);
      }
    } else {
      if (map.hasLayer(landSupplyLayer)) {
        map.removeLayer(landSupplyLayer);
      }
    }

    // 도로구역 레이어 토글
    if (layers.roadArea) {
      if (!map.hasLayer(roadAreaLayer)) {
        // 도로구역 영역 표시 (예시 데이터 - 주황색 영역)
        roadAreaLayer.clearLayers();
        const roadArea = L.polygon([
          [37.2170, 127.2940],
          [37.2210, 127.2940],
          [37.2210, 127.3010],
          [37.2170, 127.3010],
        ], {
          color: "#ff9800",
          weight: 2,
          fillColor: "#ff9800",
          fillOpacity: 0.15,
          dashArray: "10, 5",
        });
        roadArea.addTo(roadAreaLayer);
        roadAreaLayer.addTo(map);
      }
    } else {
      if (map.hasLayer(roadAreaLayer)) {
        map.removeLayer(roadAreaLayer);
      }
    }
  }, [layers, isMapReady]);

  // 필지 폴리곤 렌더링
  useEffect(() => {
    if (!mapInstanceRef.current || !polygonLayerRef.current || !isMapReady) return;

    const L = (window as typeof window & { L: typeof import("leaflet") }).L;
    const polygonLayer = polygonLayerRef.current;

    // 기존 폴리곤 제거
    polygonLayer.clearLayers();

    if (parcels.length === 0) return;

    // 각 필지에 대해 폴리곤 생성
    parcels.forEach((parcel) => {
      if (!parcel.coordinates || parcel.coordinates.length < 3) return;

      const isSelected = parcel.id === selectedParcelId;
      const latlngs = parcel.coordinates.map(coord => [coord.lat, coord.lng] as [number, number]);

      // 폴리곤 스타일 (분홍색/마젠타 라인) - EXCO 스타일
      const polygon = L.polygon(latlngs, {
        color: "#ec407a", // 분홍/마젠타
        weight: isSelected ? 4 : 3,
        fillColor: isSelected ? "#f48fb1" : "#fce4ec",
        fillOpacity: isSelected ? 0.4 : 0.1,
        opacity: 1,
      });

      // 클릭 이벤트
      polygon.on("click", () => {
        if (onParcelClick) {
          onParcelClick(parcel.id);
        }
      });

      polygon.addTo(polygonLayer);

      // 필지 중앙에 지번 라벨 추가
      const bounds = polygon.getBounds();
      const center = bounds.getCenter();
      
      // 주소에서 지번만 추출 (마지막 부분)
      const addressParts = parcel.address.split(" ");
      const jibunNumber = addressParts[addressParts.length - 1];
      
      // 커스텀 라벨 마커 생성
      const labelIcon = L.divIcon({
        className: "parcel-label",
        html: `<div style="
          background: transparent;
          color: #333;
          font-size: 11px;
          font-weight: 500;
          white-space: nowrap;
          text-shadow: 1px 1px 1px white, -1px -1px 1px white, 1px -1px 1px white, -1px 1px 1px white;
        ">${jibunNumber}</div>`,
        iconSize: [50, 20],
        iconAnchor: [25, 10],
      });
      
      const labelMarker = L.marker(center, { 
        icon: labelIcon,
        interactive: true,
      });
      
      // 라벨 클릭시에도 필지 선택
      labelMarker.on("click", () => {
        if (onParcelClick) {
          onParcelClick(parcel.id);
        }
      });
      
      labelMarker.addTo(polygonLayer);
    });

    // 필지들이 있으면 해당 영역으로 지도 이동
    if (parcels.length > 0) {
      const firstParcel = parcels[0];
      if (firstParcel.coordinates && firstParcel.coordinates.length > 0) {
        // 첫번째 필지의 중심점으로 이동
        const coords = firstParcel.coordinates;
        const centerLat = coords.reduce((sum, c) => sum + c.lat, 0) / coords.length;
        const centerLng = coords.reduce((sum, c) => sum + c.lng, 0) / coords.length;
        mapInstanceRef.current.setView([centerLat, centerLng], 18, { animate: true });
      }
    }
  }, [parcels, selectedParcelId, onParcelClick, isMapReady]);

  // 줌 컨트롤
  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  // 현재 위치로 이동
  const handleLocate = () => {
    if (mapInstanceRef.current && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          mapInstanceRef.current?.setView(
            [position.coords.latitude, position.coords.longitude],
            17
          );
        },
        (error) => {
          console.error("Geolocation error:", error);
        }
      );
    }
  };

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg border border-border">
      {/* 지도 컨테이너 */}
      <div ref={mapRef} className="h-full w-full" />

      {/* 로딩 상태 */}
      {!isMapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="mt-2 text-sm text-muted-foreground">지도 로딩중...</p>
          </div>
        </div>
      )}

      {/* 지도 컨트롤 - 배경지도/레이어 */}
      <div className="absolute right-14 top-3 z-[1000] flex flex-col gap-2">
        {/* 배경지도 선택 */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="secondary" size="sm" className="h-8 gap-1.5 bg-white shadow-md hover:bg-gray-50">
              <MapIcon className="h-4 w-4" />
              <span className="text-xs">배경지도</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="z-[1001] w-36 p-2" align="start" sideOffset={5}>
            <div className="space-y-1">
              <button
                onClick={() => setBaseMap("normal")}
                className={`w-full rounded px-3 py-2 text-left text-sm ${
                  baseMap === "normal" ? "bg-primary text-white" : "hover:bg-muted"
                }`}
              >
                일반
              </button>
              <button
                onClick={() => setBaseMap("satellite")}
                className={`w-full rounded px-3 py-2 text-left text-sm ${
                  baseMap === "satellite" ? "bg-primary text-white" : "hover:bg-muted"
                }`}
              >
                위성
              </button>
            </div>
          </PopoverContent>
        </Popover>

        {/* 레이어 선택 */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="secondary" size="sm" className="h-8 gap-1.5 bg-white shadow-md hover:bg-gray-50">
              <Layers className="h-4 w-4" />
              <span className="text-xs">레이어</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="z-[1001] w-52 p-3" align="start" sideOffset={5}>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="layer-land"
                  checked={layers.landSupplyDemand}
                  onCheckedChange={(checked) =>
                    setLayers((prev) => ({ ...prev, landSupplyDemand: checked === true }))
                  }
                />
                <Label htmlFor="layer-land" className="text-sm font-normal">
                  국토수급
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="layer-road"
                  checked={layers.roadArea}
                  onCheckedChange={(checked) =>
                    setLayers((prev) => ({ ...prev, roadArea: checked === true }))
                  }
                />
                <Label htmlFor="layer-road" className="text-sm font-normal">
                  도로구역
                </Label>
              </div>

              {/* 레이어 가시화 안내 */}
              <div className="flex items-start gap-1.5 rounded bg-amber-50 p-2">
                <Info className="mt-0.5 h-3 w-3 shrink-0 text-amber-600" />
                <p className="text-xs leading-relaxed text-amber-700">
                  국토수급, 도로구역 레이어는 {LAYER_MIN_ZOOM}Level 부터 가시화됩니다.
                  현재 Zoom Level은 <strong>{currentZoom}Level</strong> 입니다.
                </p>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* 줌 컨트롤 */}
      <div className="absolute right-3 top-3 z-[1000] flex flex-col gap-1">
        <div className="flex flex-col overflow-hidden rounded-md bg-white shadow-md">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 rounded-none p-0 hover:bg-gray-100"
            onClick={handleZoomIn}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <div className="border-t border-gray-200 px-1 py-1 text-center text-xs font-medium text-gray-700">
            {currentZoom}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 rounded-none border-t border-gray-200 p-0 hover:bg-gray-100"
            onClick={handleZoomOut}
          >
            <Minus className="h-4 w-4" />
          </Button>
        </div>
        
        {/* 현재 위치 버튼 */}
        <Button
          variant="secondary"
          size="sm"
          className="h-8 w-8 bg-white p-0 shadow-md hover:bg-gray-50"
          onClick={handleLocate}
        >
          <Locate className="h-4 w-4" />
        </Button>
      </div>

      {/* 축척 표시 */}
      <div className="absolute bottom-3 left-3 z-[1000] rounded bg-white/90 px-2 py-1 text-xs text-gray-600 shadow">
        축척: 1:{Math.round(591657550.5 / Math.pow(2, currentZoom))}
      </div>

      {/* 저작권 표시 */}
      <div className="absolute bottom-3 right-3 z-[1000] rounded bg-white/90 px-2 py-1 text-xs text-gray-500">
        © VWorld, OpenStreetMap
      </div>
    </div>
  );
}
