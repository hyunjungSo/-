"use client";

import { useRef, useEffect, useState } from "react";
import { Layers, Map as MapIcon, Plus, Minus, Info } from "lucide-react";
import type { LandInfo } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface LandMapProps {
  landInfo?: LandInfo;
  showOverlay?: boolean;
  interactive?: boolean;
  onSelect?: (landId: string) => void;
}

type BaseMapType = "normal" | "satellite";

// 레이어 가시화 최소 줌 레벨
const LAYER_MIN_ZOOM = 17;

export function LandMap({
  landInfo,
  showOverlay = true,
  interactive = false,
}: LandMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // 배경지도 타입
  const [baseMap, setBaseMap] = useState<BaseMapType>("normal");
  
  // 줌 레벨 (14-20)
  const [zoomLevel, setZoomLevel] = useState(14);
  
  // 레이어 옵션
  const [layers, setLayers] = useState({
    landSupplyDemand: false, // 국토수급
    roadArea: true, // 도로구역
  });
  
  // 레이어 가시화 여부
  const isLayerVisible = zoomLevel >= LAYER_MIN_ZOOM;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 캔버스 크기 설정
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // 배경 그리기 (배경지도 타입에 따라)
    if (baseMap === "satellite") {
      // 위성 배경
      ctx.fillStyle = "#2d4a3e";
      ctx.fillRect(0, 0, rect.width, rect.height);
      
      // 위성 텍스처 시뮬레이션
      for (let i = 0; i < 500; i++) {
        ctx.fillStyle = `rgba(${Math.random() * 50 + 30}, ${Math.random() * 60 + 50}, ${Math.random() * 40 + 30}, 0.3)`;
        ctx.fillRect(
          Math.random() * rect.width,
          Math.random() * rect.height,
          Math.random() * 20 + 5,
          Math.random() * 20 + 5
        );
      }
    } else {
      // 일반 지적도 배경
      ctx.fillStyle = "#f0f4e8";
      ctx.fillRect(0, 0, rect.width, rect.height);

      // 그리드 그리기
      ctx.strokeStyle = "#d0d8c8";
      ctx.lineWidth = 0.5;
      for (let i = 0; i < rect.width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, rect.height);
        ctx.stroke();
      }
      for (let i = 0; i < rect.height; i += 20) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(rect.width, i);
        ctx.stroke();
      }
    }

    // 국토수급 레이어 (17레벨 이상에서만 표시)
    if (layers.landSupplyDemand && isLayerVisible) {
      ctx.fillStyle = "rgba(255, 193, 7, 0.2)";
      ctx.fillRect(rect.width * 0.1, rect.height * 0.1, rect.width * 0.3, rect.height * 0.25);
      ctx.strokeStyle = "#ffc107";
      ctx.lineWidth = 1;
      ctx.strokeRect(rect.width * 0.1, rect.height * 0.1, rect.width * 0.3, rect.height * 0.25);
      
      ctx.fillStyle = "rgba(255, 193, 7, 0.2)";
      ctx.fillRect(rect.width * 0.6, rect.height * 0.65, rect.width * 0.3, rect.height * 0.25);
      ctx.strokeRect(rect.width * 0.6, rect.height * 0.65, rect.width * 0.3, rect.height * 0.25);
    }

    // 도로구역 레이어 (17레벨 이상에서만 표시)
    if (layers.roadArea && isLayerVisible) {
      ctx.fillStyle = baseMap === "satellite" ? "#555555" : "#888888";
      ctx.beginPath();
      ctx.moveTo(rect.width * 0.1, rect.height * 0.3);
      ctx.lineTo(rect.width * 0.9, rect.height * 0.5);
      ctx.lineTo(rect.width * 0.9, rect.height * 0.6);
      ctx.lineTo(rect.width * 0.1, rect.height * 0.4);
      ctx.closePath();
      ctx.fill();
      
      // 도로구역 경계선
      ctx.strokeStyle = "#ff6b6b";
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 원래 토지 그리기 (편입 전)
    ctx.strokeStyle = baseMap === "satellite" ? "#ffffff" : "#666666";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.rect(rect.width * 0.25, rect.height * 0.15, rect.width * 0.5, rect.height * 0.7);
    ctx.stroke();
    ctx.setLineDash([]);

    if (showOverlay && landInfo) {
      // 편입 토지 영역 (빨간색 반투명)
      ctx.fillStyle = "rgba(239, 68, 68, 0.3)";
      ctx.beginPath();
      ctx.moveTo(rect.width * 0.25, rect.height * 0.28);
      ctx.lineTo(rect.width * 0.75, rect.height * 0.42);
      ctx.lineTo(rect.width * 0.75, rect.height * 0.58);
      ctx.lineTo(rect.width * 0.25, rect.height * 0.44);
      ctx.closePath();
      ctx.fill();

      // 편입 영역 테두리
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 2;
      ctx.stroke();

      // 잔여지 영역 (파란색 반투명) - 위쪽
      ctx.fillStyle = "rgba(59, 130, 246, 0.3)";
      ctx.beginPath();
      ctx.moveTo(rect.width * 0.25, rect.height * 0.15);
      ctx.lineTo(rect.width * 0.75, rect.height * 0.15);
      ctx.lineTo(rect.width * 0.75, rect.height * 0.42);
      ctx.lineTo(rect.width * 0.25, rect.height * 0.28);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 2;
      ctx.stroke();

      // 잔여지 영역 (파란색 반투명) - 아래쪽
      ctx.fillStyle = "rgba(59, 130, 246, 0.3)";
      ctx.beginPath();
      ctx.moveTo(rect.width * 0.25, rect.height * 0.44);
      ctx.lineTo(rect.width * 0.75, rect.height * 0.58);
      ctx.lineTo(rect.width * 0.75, rect.height * 0.85);
      ctx.lineTo(rect.width * 0.25, rect.height * 0.85);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 2;
      ctx.stroke();

      // 범례
      const legendBg = baseMap === "satellite" ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.9)";
      const legendText = baseMap === "satellite" ? "#ffffff" : "#333333";
      
      ctx.fillStyle = legendBg;
      ctx.fillRect(rect.width - 130, 5, 125, 75);
      ctx.strokeStyle = baseMap === "satellite" ? "#555" : "#ddd";
      ctx.lineWidth = 1;
      ctx.strokeRect(rect.width - 130, 5, 125, 75);
      
      ctx.font = "12px sans-serif";
      
      // 편입 구간 범례
      ctx.fillStyle = "rgba(239, 68, 68, 0.3)";
      ctx.fillRect(rect.width - 120, 15, 16, 16);
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 1;
      ctx.strokeRect(rect.width - 120, 15, 16, 16);
      ctx.fillStyle = legendText;
      ctx.fillText("편입 구간", rect.width - 98, 27);

      // 잔여지 범례
      ctx.fillStyle = "rgba(59, 130, 246, 0.3)";
      ctx.fillRect(rect.width - 120, 37, 16, 16);
      ctx.strokeStyle = "#3b82f6";
      ctx.strokeRect(rect.width - 120, 37, 16, 16);
      ctx.fillStyle = legendText;
      ctx.fillText("잔여지", rect.width - 98, 49);
      
      // 도로구역 범례 (레이어 활성화 + 가시화 줌 레벨)
      if (layers.roadArea && isLayerVisible) {
        ctx.strokeStyle = "#ff6b6b";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 2]);
        ctx.beginPath();
        ctx.moveTo(rect.width - 120, 65);
        ctx.lineTo(rect.width - 104, 65);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = legendText;
        ctx.fillText("도로구역", rect.width - 98, 69);
      }
    }

    // 지번 표시
    if (landInfo) {
      ctx.font = "bold 11px sans-serif";
      ctx.fillStyle = baseMap === "satellite" ? "#ffffff" : "#1e3a5f";
      ctx.textAlign = "center";
      
      const addressParts = landInfo.address.split(" ");
      const shortAddress = addressParts.slice(-1)[0];
      ctx.fillText(shortAddress, rect.width * 0.5, rect.height * 0.92);
    }
  }, [landInfo, showOverlay, baseMap, layers, zoomLevel]);

  return (
    <div className="relative w-full overflow-hidden rounded-lg border border-border bg-muted">
      {/* 지도 컨트롤 */}
      <div className="absolute left-3 top-3 z-10 flex gap-2">
        {/* 배경지도 선택 */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="secondary" size="sm" className="h-8 gap-1.5 bg-white/90 shadow-sm hover:bg-white">
              <MapIcon className="h-4 w-4" />
              <span className="text-xs">배경지도</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-36 p-2" align="start">
            <div className="space-y-1">
              <button
                onClick={() => setBaseMap("normal")}
                className={`w-full rounded px-2 py-1.5 text-left text-sm ${
                  baseMap === "normal" ? "bg-primary text-white" : "hover:bg-muted"
                }`}
              >
                일반
              </button>
              <button
                onClick={() => setBaseMap("satellite")}
                className={`w-full rounded px-2 py-1.5 text-left text-sm ${
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
            <Button variant="secondary" size="sm" className="h-8 gap-1.5 bg-white/90 shadow-sm hover:bg-white">
              <Layers className="h-4 w-4" />
              <span className="text-xs">레이어</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-52 p-3" align="start">
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
                  현재 지도 Zoom Level은 <strong>{zoomLevel}Level</strong> 입니다.
                </p>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      {/* 줌 컨트롤 */}
      <div className="absolute right-3 top-3 z-10 flex flex-col gap-1">
        <div className="flex flex-col overflow-hidden rounded-md bg-white/90 shadow-sm">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 rounded-none p-0 hover:bg-gray-100"
            onClick={() => setZoomLevel(prev => Math.min(20, prev + 1))}
            disabled={zoomLevel >= 20}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <div className="border-t border-gray-200 px-1 py-1 text-center text-xs font-medium text-gray-700">
            {zoomLevel}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 rounded-none border-t border-gray-200 p-0 hover:bg-gray-100"
            onClick={() => setZoomLevel(prev => Math.max(10, prev - 1))}
            disabled={zoomLevel <= 10}
          >
            <Minus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className={cn(
          "h-[300px] w-full sm:h-[400px]",
          interactive && "cursor-crosshair"
        )}
        style={{ display: "block" }}
      />
      {interactive && (
        <div className="absolute bottom-3 left-3 rounded bg-card/90 px-2 py-1 text-xs text-muted-foreground">
          지도를 클릭하여 필지를 선택하세요
        </div>
      )}
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
