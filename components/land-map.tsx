"use client";

import { useRef, useEffect } from "react";
import type { LandInfo } from "@/lib/types";

interface LandMapProps {
  landInfo?: LandInfo;
  showOverlay?: boolean;
  interactive?: boolean;
  onSelect?: (landId: string) => void;
}

export function LandMap({
  landInfo,
  showOverlay = true,
  interactive = false,
}: LandMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    // 배경 그리기 (지적도 시뮬레이션)
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

    // 도로 그리기 (고속도로)
    ctx.fillStyle = "#888888";
    ctx.beginPath();
    ctx.moveTo(rect.width * 0.1, rect.height * 0.3);
    ctx.lineTo(rect.width * 0.9, rect.height * 0.5);
    ctx.lineTo(rect.width * 0.9, rect.height * 0.6);
    ctx.lineTo(rect.width * 0.1, rect.height * 0.4);
    ctx.closePath();
    ctx.fill();

    // 원래 토지 그리기 (편입 전)
    ctx.strokeStyle = "#666666";
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
      ctx.font = "12px sans-serif";
      
      // 편입 구간 범례
      ctx.fillStyle = "rgba(239, 68, 68, 0.3)";
      ctx.fillRect(rect.width - 120, 10, 16, 16);
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 1;
      ctx.strokeRect(rect.width - 120, 10, 16, 16);
      ctx.fillStyle = "#333";
      ctx.fillText("편입 구간", rect.width - 100, 22);

      // 잔여지 범례
      ctx.fillStyle = "rgba(59, 130, 246, 0.3)";
      ctx.fillRect(rect.width - 120, 32, 16, 16);
      ctx.strokeStyle = "#3b82f6";
      ctx.strokeRect(rect.width - 120, 32, 16, 16);
      ctx.fillStyle = "#333";
      ctx.fillText("잔여지", rect.width - 100, 44);
    }

    // 지번 표시
    if (landInfo) {
      ctx.font = "bold 11px sans-serif";
      ctx.fillStyle = "#1e3a5f";
      ctx.textAlign = "center";
      
      const addressParts = landInfo.address.split(" ");
      const shortAddress = addressParts.slice(-1)[0];
      ctx.fillText(shortAddress, rect.width * 0.5, rect.height * 0.92);
    }
  }, [landInfo, showOverlay]);

  return (
    <div className="relative w-full overflow-hidden rounded-lg border border-border bg-muted">
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
