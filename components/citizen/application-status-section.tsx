"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { dummyApplications, landCategories, landShapes } from "@/lib/dummy-data";
import type { Application, AdminStatus } from "@/lib/types";
import { 
  FileText, 
  MapPin,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronDown,
  Pencil,
  Save,
  X,
  Upload,
  Trash2,
  Search
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AdminStatusBadge, adminStatusConfig } from "@/components/ui/status-badge";
import { JudgmentStatus } from "@/components/ui/judgment-status";

// 샘플 주소 데이터 (실제로는 API에서 가져옴)
const sampleAddresses = [
  { postalCode: "31110", address: "충청남도 천안시 동남구 신부동 810" },
  { postalCode: "31120", address: "충청남도 천안시 동남구 신방동 123-45" },
  { postalCode: "31130", address: "충청남도 천안시 서북구 불당동 1234" },
  { postalCode: "31140", address: "충청남도 천안시 서북구 쌍용동 567-8" },
  { postalCode: "31200", address: "충청남도 아산시 배방읍 세출리 100" },
  { postalCode: "31300", address: "충청남도 논산시 내동 150" },
];

// 파일 타입 정의
interface FileItem {
  name: string;
  size: string;
  status: "uploading" | "complete" | "error";
}

// 주소 검색 모달 컴포넌트
function AddressSearchModal({
  onSelect,
  onClose,
}: {
  onSelect: (address: { postalCode: string; address: string }) => void;
  onClose: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<typeof sampleAddresses>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    const results = sampleAddresses.filter(
      (addr) =>
        addr.address.includes(searchQuery) || addr.postalCode.includes(searchQuery)
    );
    setSearchResults(results);
    setHasSearched(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-lg rounded-lg bg-background shadow-xl">
        <div className="flex items-center justify-between py-2 px-4">
          <h3 className="text-lg font-semibold">주소 검색</h3>
          <Button variant="ghost" className="h-10 w-10 p-0" onClick={onClose}>
            <X className="size-6" />
          </Button>
        </div>
        
        <div className="p-4">
          <div className="flex gap-2">
            <Input
              placeholder="도로명, 건물명 또는 지번 입력"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSearch();
                }
              }}
              autoFocus
            />
            <Button 
              type="button"
              onClick={handleSearch}
              className="h-10 shrink-0 bg-[#222222] hover:bg-[#333333] py-3"
            >
              검색
            </Button>
          </div>
          
          <div className="mt-4 max-h-64 overflow-y-auto">
            {hasSearched && searchResults.length === 0 ? (
              <p className="py-8 text-center text-base text-muted-foreground">
                검색 결과가 없습니다.
              </p>
            ) : searchResults.length > 0 ? (
              <ul className="space-y-1">
                {searchResults.map((addr, idx) => (
                  <li key={idx}>
                    <button
                      type="button"
                      className="w-full rounded-md px-3 py-2 text-left text-base transition-colors hover:bg-muted"
                      onClick={() => onSelect(addr)}
                    >
                      <span className="mr-2 text-base text-muted-foreground">
                        [{addr.postalCode}]
                      </span>
                      <span>{addr.address}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="space-y-2 py-4 text-center text-base text-muted-foreground">
                <p>도로명, 건물명 또는 지번을 입력하세요.</p>
                <p className="text-base">예: 천안시 동남구, 신부동 100</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="border-t bg-muted/30 p-3">
          <p className="text-sm text-muted-foreground">
            * 정확한 주소를 찾을 수 없는 경우, 가까운 건물명이나 도로명으로 검색해 보세요.
          </p>
        </div>
      </div>
    </div>
  );
}

// 토지 정보 섹션 컴포넌트 (고용24 스타일 테이블 형태)
interface LandEditData {
  landUseCategory: string;
  landShape: string;
  siteType: string;
  roadFrontageLoss: boolean;
  irrigationCanalLoss: boolean;
  farmEquipmentTurnImpossible: boolean;
}

function LandInfoSection({ 
  application, 
  isEditMode = false,
  editData,
  onEditDataChange
}: { 
  application: Application;
  isEditMode?: boolean;
  editData?: LandEditData;
  onEditDataChange?: (data: Partial<LandEditData>) => void;
}) {
  const isMultipleLands = application.additionalLands && application.additionalLands.length > 0;
  const allLands = isMultipleLands 
    ? [application.landInfo, ...application.additionalLands] 
    : [application.landInfo];
  
  const [selectedLandIndex, setSelectedLandIndex] = useState(0);
  
  // 인덱스 범위 안전 처리
  const safeIndex = Math.min(selectedLandIndex, allLands.length - 1);
  const selectedLand = allLands[safeIndex];
  
  // selectedLand가 없으면 렌더링 안함
  if (!selectedLand) return null;

  return (
    <div className={`overflow-hidden rounded-lg border transition-colors duration-300 ${isEditMode ? "border-primary/50 bg-primary/5" : "border-border"}`}>
      <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-2.5">
        <h4 className="font-semibold text-foreground">토지 정보</h4>
        {isMultipleLands && (
          <span className="flex items-center gap-1 rounded bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700">
            <Layers className="h-3 w-3" />
            {allLands.length}필지
          </span>
        )}
      </div>
      
      {/* 복수 필지일 경우 셀렉트박스 표시 */}
      {isMultipleLands && (
        <div className="flex border-b border-border">
          <div className="flex w-28 shrink-0 items-center bg-muted/30 px-4 py-3">
            <span className="text-sm font-medium">필지 선택</span>
          </div>
          <div className="flex flex-1 items-center px-4 py-3">
            <Select
              value={selectedLandIndex.toString()}
              onValueChange={(value) => setSelectedLandIndex(parseInt(value))}
            >
              <SelectTrigger className="w-full max-w-md">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {allLands.map((land, index) => (
                  <SelectItem key={land.id} value={index.toString()}>
                    필지 {index + 1} - {land.address.split(" ").slice(-2).join(" ")} ({land.remainingArea.toLocaleString()}m²)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
      
      {/* 필지 주소 행 */}
      <div className="flex border-b border-border">
        <div className="flex w-28 shrink-0 items-center bg-muted/30 px-4 py-3">
          <span className="text-sm font-medium">필지 주소</span>
        </div>
        <div className="flex flex-1 items-center px-4 py-3">
          <span className="text-sm">{selectedLand.address}</span>
        </div>
      </div>
      
      {/* 토지 유형 행 */}
      <div className="flex border-b border-border">
        <div className="flex w-28 shrink-0 items-center bg-muted/30 px-4 py-3">
          <span className="text-sm font-medium">토지 유형</span>
        </div>
        <div className="flex flex-1 items-center px-4 py-3">
          <span className="text-sm">{selectedLand.landType}</span>
        </div>
      </div>
      
      {/* 잔여 면적 행 */}
      <div className="flex border-b border-border">
        <div className="flex w-28 shrink-0 items-center bg-muted/30 px-4 py-3">
          <span className="text-sm font-medium">잔여 면적</span>
        </div>
        <div className="flex flex-1 items-center px-4 py-3">
          <span className="font-medium text-primary">{selectedLand.remainingArea.toLocaleString()}m²</span>
          <span className="ml-2 text-sm text-muted-foreground">(잔여 비율 {selectedLand.remainingRatio}%)</span>
        </div>
      </div>
      
      {/* 필지별 AI 판정 행 - 아코디언 UI */}
      {(() => {
        // 필지별 AI 결과 가져오기
        const landAIResult = application.landAIResults?.[selectedLand.id] || application.aiResult;
        if (!landAIResult?.provisionalJudgment) return null;
        
        return (
          <Collapsible defaultOpen={false} className="border-b border-border">
            <CollapsibleTrigger asChild>
              <div className="flex cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex w-28 shrink-0 items-center bg-muted/30 px-4 py-3">
                  <span className="text-sm font-medium">AI 판정</span>
                </div>
                <div className="flex flex-1 items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2">
                    <JudgmentStatus 
                      judgment={landAIResult.provisionalJudgment} 
                      variant="badge" 
                      size="sm"
                    />
                  </div>
                  {landAIResult.judgmentRationale && (
                    <ChevronDown className="size-5 text-muted-foreground transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
                  )}
                </div>
              </div>
            </CollapsibleTrigger>
            {/* AI 판정 근거 아코디언 내용 */}
            {landAIResult.judgmentRationale && (
              <CollapsibleContent>
                <div className="border-t border-border bg-muted/20 px-4 py-3">
                  <RationaleCard 
                    rationale={landAIResult.judgmentRationale} 
                    provisionalJudgment={landAIResult.provisionalJudgment}
                    variant="expanded"
                  />
                </div>
              </CollapsibleContent>
            )}
          </Collapsible>
        );
      })()}
      
      {/* 수정 모드 안내 */}
      {isEditMode && (
        <div className="border-b border-border bg-blue-50 px-4 py-2">
          <p className="text-xs text-blue-700">
            AI 판단과 실제 현황이 다를 수 있습니다. 현재 토지의 실제 활용 상황을 입력해 주세요. (필지 주소는 수정 불가)
          </p>
        </div>
      )}

      {/* 활용 지목 / 공부상 지목 행 */}
      <div className="flex border-b border-border">
        <div className="flex w-28 shrink-0 items-center bg-muted/30 px-4 py-3">
          <span className="text-sm font-medium">활용 지목</span>
        </div>
        <div className="flex flex-1 items-center px-4 py-3">
          {isEditMode && editData && onEditDataChange ? (
            <Select
              value={editData.landUseCategory}
              onValueChange={(value) => onEditDataChange({ landUseCategory: value })}
            >
              <SelectTrigger className="h-10 w-48">
                <SelectValue placeholder="선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {landCategories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.value} ({cat.label})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <span className="text-sm">
              {selectedLand.currentUsage || "-"} {selectedLand.currentUsage && `(${landCategories.find(c => c.value === selectedLand.currentUsage)?.label || ""})`}
            </span>
          )}
        </div>
        <div className="flex w-28 shrink-0 items-center border-l border-border bg-muted/30 px-4 py-3">
          <span className="text-sm font-medium">공부상 지목</span>
        </div>
        <div className="flex flex-1 items-center px-4 py-3">
          <span className="text-sm text-muted-foreground">{selectedLand.landType || "대 (택지)"}</span>
        </div>
      </div>
      
      {/* 토지 모양 / 택지 유형 행 */}
      <div className="flex border-b border-border">
        <div className="flex w-28 shrink-0 items-center bg-muted/30 px-4 py-3">
          <span className="text-sm font-medium">토지 모양</span>
        </div>
        <div className="flex flex-1 items-center px-4 py-3">
          {isEditMode && editData && onEditDataChange ? (
            <Select
              value={editData.landShape}
              onValueChange={(value) => onEditDataChange({ landShape: value })}
            >
              <SelectTrigger className="h-10 w-36">
                <SelectValue placeholder="선택" />
              </SelectTrigger>
              <SelectContent>
                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">정형</div>
                {landShapes.regular.map((shape) => (
                  <SelectItem key={shape.value} value={shape.value}>{shape.label}</SelectItem>
                ))}
                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">비정형</div>
                {landShapes.irregular.map((shape) => (
                  <SelectItem key={shape.value} value={shape.value}>{shape.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <span className="text-sm">{selectedLand.reportedShape || "-"}</span>
          )}
        </div>
        <div className="flex w-28 shrink-0 items-center border-l border-border bg-muted/30 px-4 py-3">
          <span className="text-sm font-medium">택지 유형</span>
        </div>
        <div className="flex flex-1 items-center px-4 py-3">
          {isEditMode && editData && onEditDataChange ? (
            <Select
              value={editData.siteType}
              onValueChange={(value) => onEditDataChange({ siteType: value })}
            >
              <SelectTrigger className="h-10 w-40">
                <SelectValue placeholder="선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="residential-detached">주거용 (기준 90㎡ 이하)</SelectItem>
                <SelectItem value="commercial">상업용 (기준 150㎡ 이하)</SelectItem>
                <SelectItem value="industrial">공업용 (기준 330㎡ 이하)</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <span className="text-sm">
              {selectedLand.landSubType === "residential-detached" ? "주거용 (기준 90㎡ 이하)" :
               selectedLand.landSubType === "commercial" ? "상업용 (기준 150㎡ 이하)" :
               selectedLand.landSubType === "industrial" ? "공업용 (기준 330㎡ 이하)" :
               selectedLand.landSubType || "-"}
            </span>
          )}
        </div>
      </div>
      
      {/* 확인 항목 행 */}
      <div className="flex">
        <div className="flex w-28 shrink-0 items-start bg-muted/30 px-4 py-3">
          <span className="text-sm font-medium">확인 항목</span>
        </div>
        <div className="flex flex-1 flex-col px-4 py-3">
          {isEditMode && editData && onEditDataChange ? (
            <>
              <p className="mb-3 text-xs text-muted-foreground">
                AI가 자동 판독할 수 없는 사항입니다. 해당되는 경우 체크해 주세요.
              </p>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editData.roadFrontageLoss}
                    onChange={(e) => onEditDataChange({ roadFrontageLoss: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span className="text-sm">접면도로 상실</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editData.irrigationCanalLoss}
                    onChange={(e) => onEditDataChange({ irrigationCanalLoss: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span className="text-sm">관개수로 상실</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editData.farmEquipmentTurnImpossible}
                    onChange={(e) => onEditDataChange({ farmEquipmentTurnImpossible: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span className="text-sm">농기계 회전 불가</span>
                </label>
              </div>
            </>
          ) : (
            (() => {
              const checks = [];
              if (selectedLand.accessRoadLost) checks.push("접면도로 상실");
              if (selectedLand.waterChannelLost) checks.push("관개수로 상실");
              if (selectedLand.farmMachineDifficulty) checks.push("농기계 회전 곤란");
              return checks.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {checks.map((check, i) => (
                    <span key={i} className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                      {check}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">해당 없음</span>
              );
            })()
          )}
        </div>
      </div>

      {/* 신청사유 행 */}
      <div className="flex border-b border-border">
        <div className="flex w-28 shrink-0 items-start bg-muted/30 px-4 py-3">
          <span className="text-sm font-medium">신청사유</span>
        </div>
        <div className="flex flex-1 items-center px-4 py-3">
          {isEditMode && editData && onEditDataChange ? (
            <Textarea
              value={editData.reason}
              onChange={(e) => onEditDataChange({ reason: e.target.value })}
              className="min-h-[80px] text-sm"
            />
          ) : (
            <span className="text-sm">{application.reason}</span>
          )}
        </div>
      </div>

      {/* 첨부 서류 행 */}
      <div className="flex">
        <div className="flex w-28 shrink-0 items-start bg-muted/30 px-4 py-3">
          <span className="text-sm font-medium">첨부 서류</span>
        </div>
        <div className="flex flex-1 px-4 py-3">
          {isEditMode && editData && onFileChange && onRemoveFile ? (
            <div className="w-full space-y-3">
              <div className="rounded-md border border-dashed border-gray-300 bg-gray-50 p-3">
                <p className="mb-2 text-center text-sm text-muted-foreground">
                  첨부할 파일을 여기에 끌어다 놓거나, 파일 선택 버튼을 클릭하세요.
                </p>
                <div className="flex items-center justify-center">
                  <label className="cursor-pointer">
                    <span className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-gray-50">
                      <Upload className="size-[14px]" />
                      파일선택
                    </span>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={onFileChange}
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>

              {editData.attachments.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs text-muted-foreground">
                    {editData.attachments.length}개 / {MAX_FILES}개
                  </span>
                  <ul className="space-y-1">
                    {editData.attachments.map((file, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2"
                      >
                        <span className="truncate text-xs text-foreground">
                          {file.name} <span className="text-muted-foreground">[{file.size}]</span>
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveFile(index)}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="size-[14px]" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                PDF, JPG, PNG 파일 (최대 {MAX_FILES}개, 파일당 20MB 이하)
              </p>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">
              {application.attachments && application.attachments.length > 0
                ? `${application.attachments.length}개 파일 첨부됨`
                : "첨부된 파일 없음"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// RationaleCard 컴포넌트를 import해서 사용
import { RationaleCard } from "@/components/ui/rationale-card";

// 상세 정보 패널 컴포넌트 (고용24 스타일)
function ApplicationDetailPanel({ application }: { application: Application }) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [editData, setEditData] = useState({
    // 신청인 정보
    applicantRelation: "owner" as "owner" | "agent",
    applicantName: application.applicantName,
    applicantContact: application.applicantContact,
    agentName: "",
    agentContact: "",
    postalCode: "",
    baseAddress: application.applicantAddress,
    detailAddress: "",
    // 토지 정보 - 민원인이 신청 시 입력한 값으로 초기화
    landUseCategory: application.landInfo?.currentUsage || "대 (택지)",
    landShape: application.landInfo?.reportedShape || "정방형",
    siteType: application.landInfo?.landSubType || "",
    roadFrontageLoss: application.landInfo?.accessRoadLost || false,
    irrigationCanalLoss: application.landInfo?.waterChannelLost || false,
    farmEquipmentTurnImpossible: application.landInfo?.farmMachineDifficulty || false,
    // 신청 사유 및 첨부
    reason: application.reason,
    attachments: [] as FileItem[],
  });

  const canEdit = application.adminStatus === "접수완료";
  const MAX_FILES = 5;

  const handleAddressSelect = (address: { postalCode: string; address: string }) => {
    setEditData(prev => ({
      ...prev,
      postalCode: address.postalCode,
      baseAddress: address.address,
    }));
    setShowAddressModal(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: FileItem[] = Array.from(files).map((file) => ({
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)}KB`,
      status: "complete" as const,
    }));

    setEditData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...newFiles].slice(0, MAX_FILES),
    }));
  };

  const handleRemoveFile = (index: number) => {
    setEditData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const handleSaveClick = () => {
    // 컨펌 모달 표시
    setShowConfirmModal(true);
  };

  const handleConfirmSave = () => {
    // TODO: API 호출하여 수정 내용 저장
    setShowConfirmModal(false);
    setIsEditMode(false);
  };

  const handleCancel = () => {
    // 원래 데이터로 복원 (민원인이 신청 시 입력한 값)
    setEditData({
      applicantRelation: "owner",
      applicantName: application.applicantName,
      applicantContact: application.applicantContact,
      agentName: "",
      agentContact: "",
      postalCode: "",
      baseAddress: application.applicantAddress,
      detailAddress: "",
      landUseCategory: application.landInfo?.currentUsage || "대 (택지)",
      landShape: application.landInfo?.reportedShape || "정방형",
      siteType: application.landInfo?.landSubType || "",
      roadFrontageLoss: application.landInfo?.accessRoadLost || false,
      irrigationCanalLoss: application.landInfo?.waterChannelLost || false,
      farmEquipmentTurnImpossible: application.landInfo?.farmMachineDifficulty || false,
      reason: application.reason,
      attachments: [],
    });
    setIsEditMode(false);
  };

  return (
    <div className="space-y-4 overflow-visible">
      {/* 상세 화면 타이틀 헤더 */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Badge variant={adminStatusConfig[application.adminStatus].variant}>
            {adminStatusConfig[application.adminStatus].label}
          </Badge>
          <span className="text-lg font-semibold text-foreground">{application.applicationNumber}</span>
        </div>
        {/* 수정/저장/취소 버튼 - 접수완료 상태에서만 활성화 */}
        {isEditMode ? (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="h-8 gap-1.5 text-xs"
            >
              <X className="size-[18px]" />
              취소
            </Button>
            <Button
              size="sm"
              onClick={handleSaveClick}
              className="h-8 gap-1.5 text-xs"
            >
              <Save className="size-[18px]" />
              저장
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            disabled={!canEdit}
            onClick={() => setIsEditMode(true)}
            className="h-8 gap-1.5 text-xs"
          >
            <Pencil className="size-[18px]" />
            수정
          </Button>
        )}
      </div>

      {/* 신청인 정보 테이블 */}
      <div className={`overflow-hidden rounded-lg border transition-colors duration-300 ${isEditMode ? "border-primary/50 bg-primary/5" : "border-border"}`}>
        <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-2.5">
          <h4 className="font-semibold text-foreground">신청인 정보</h4>
        </div>
        
        {/* 신청일 행 */}
        <div className="flex border-b border-border">
          <div className="flex w-28 shrink-0 items-center bg-muted/30 px-4 py-3">
            <span className="text-sm font-medium">신청일</span>
          </div>
          <div className="flex flex-1 items-center px-4 py-3">
            <span className="text-sm">{application.appliedAt}</span>
          </div>
        </div>

        {/* 신청 구분 행 */}
        <div className="flex border-b border-border">
          <div className="flex w-28 shrink-0 items-center bg-muted/30 px-4 py-3">
            <span className="text-sm font-medium">신청 구분</span>
          </div>
          <div className="flex flex-1 items-center px-4 py-3">
            {isEditMode ? (
              <div className="flex gap-6">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="applicantRelation"
                    checked={editData.applicantRelation === "owner"}
                    onChange={() => setEditData({ ...editData, applicantRelation: "owner" })}
                    className="h-4 w-4 accent-primary"
                  />
                  <span className="text-sm">본인 신청</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="applicantRelation"
                    checked={editData.applicantRelation === "agent"}
                    onChange={() => setEditData({ ...editData, applicantRelation: "agent" })}
                    className="h-4 w-4 accent-primary"
                  />
                  <span className="text-sm">대리인 신청</span>
                </label>
              </div>
            ) : (
              <span className="text-sm">본인 신청</span>
            )}
          </div>
        </div>

        {/* 대리인 정보 (대리인 신청 시만 표시) */}
        {isEditMode && editData.applicantRelation === "agent" && (
          <>
            <div className="flex border-b border-border">
              <div className="flex w-28 shrink-0 items-center bg-muted/30 px-4 py-3">
                <span className="text-sm font-medium">대리인 성명</span>
              </div>
              <div className="flex flex-1 items-center px-4 py-3">
                <Input
                  value={editData.agentName}
                  onChange={(e) => setEditData({ ...editData, agentName: e.target.value })}
                  placeholder="대리인 성명을 입력해주세요"
                  className="h-10 text-sm"
                />
              </div>
            </div>
            <div className="flex border-b border-border">
              <div className="flex w-28 shrink-0 items-center bg-muted/30 px-4 py-3">
                <span className="text-sm font-medium">대리인 연락처</span>
              </div>
              <div className="flex flex-1 items-center px-4 py-3">
                <Input
                  value={editData.agentContact}
                  onChange={(e) => setEditData({ ...editData, agentContact: e.target.value })}
                  placeholder="대리인 연락처를 입력해주세요"
                  className="h-10 text-sm"
                />
              </div>
            </div>
            <div className="border-b border-border bg-amber-50 px-4 py-2">
              <p className="text-xs text-amber-700">
                대리인 신청 시 위임장 및 대리인 신분증 사본을 첨부 서류에 추가해 주세요.
              </p>
            </div>
          </>
        )}

        {/* 소유자 성명 행 */}
        <div className="flex border-b border-border">
          <div className="flex w-28 shrink-0 items-center bg-muted/30 px-4 py-3">
            <span className="text-sm font-medium">소유자 성명</span>
          </div>
          <div className="flex flex-1 items-center px-4 py-3">
            {isEditMode ? (
              <Input
                value={editData.applicantName}
                onChange={(e) => setEditData({ ...editData, applicantName: e.target.value })}
                className="h-10 text-sm"
              />
            ) : (
              <span className="text-sm">{application.applicantName}</span>
            )}
          </div>
        </div>

        {/* 소유자 연락처 행 */}
        <div className="flex border-b border-border">
          <div className="flex w-28 shrink-0 items-center bg-muted/30 px-4 py-3">
            <span className="text-sm font-medium">소유자 연락처</span>
          </div>
          <div className="flex flex-1 items-center px-4 py-3">
            {isEditMode ? (
              <Input
                value={editData.applicantContact}
                onChange={(e) => setEditData({ ...editData, applicantContact: e.target.value })}
                className="h-10 text-sm"
              />
            ) : (
              <span className="text-sm">{application.applicantContact}</span>
            )}
          </div>
        </div>

        {/* 주소 행 */}
        <div className="flex border-b border-border">
          <div className="flex w-28 shrink-0 items-start bg-muted/30 px-4 py-3">
            <span className="text-sm font-medium">주소</span>
          </div>
          <div className="flex flex-1 items-center px-4 py-3">
            {isEditMode ? (
              <div className="w-full space-y-1.5">
                <div className="flex gap-2">
                  <Input
                    value={editData.postalCode}
                    placeholder="우편번호"
                    readOnly
                    className="h-10 w-24 bg-muted text-sm"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowAddressModal(true)}
                    className="h-10 shrink-0"
                  >
                    주소 검색
                  </Button>
                </div>
                <Input
                  value={editData.baseAddress}
                  placeholder="기본주소"
                  readOnly
                  className="h-10 bg-muted text-sm"
                />
                <Input
                  value={editData.detailAddress}
                  onChange={(e) => setEditData({ ...editData, detailAddress: e.target.value })}
                  placeholder="상세주소를 입력해주세요"
                  className="h-10 text-sm"
                />
              </div>
            ) : (
              <span className="text-sm">{application.applicantAddress}</span>
            )}
          </div>
        </div>
      </div>

      {/* 주소 검색 모달 */}
      {showAddressModal && (
        <AddressSearchModal
          onSelect={handleAddressSelect}
          onClose={() => setShowAddressModal(false)}
        />
      )}

      {/* 수정 가능 여부 안내 */}
      {application.adminStatus !== "접수완료" && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
          <Info className="h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-xs text-amber-700">
            담당자가 검토를 시작하여 신청 내용 수정이 불가합니다. 수정이 필요한 경우 담당자에게 문의해 주세요.
          </p>
        </div>
      )}

      {/* 토지 정보 (활용 지목, 토지 모양, 택지 유형, 확인 항목, 신청 사유, 첨부 서류) */}
      <LandInfoSection 
        application={application}
        isEditMode={isEditMode}
        editData={{
          landUseCategory: editData.landUseCategory,
          landShape: editData.landShape,
          siteType: editData.siteType,
          roadFrontageLoss: editData.roadFrontageLoss,
          irrigationCanalLoss: editData.irrigationCanalLoss,
          farmEquipmentTurnImpossible: editData.farmEquipmentTurnImpossible,
          reason: editData.reason,
          attachments: editData.attachments,
        }}
        onEditDataChange={(data) => setEditData({ ...editData, ...data })}
        onFileChange={handleFileChange}
        onRemoveFile={handleRemoveFile}
        MAX_FILES={MAX_FILES}
      />

      {/* 처리 완료 시 결과 표시 */}
      {application.adminStatus === "심사완료" && application.finalJudgment && (
        <div className="overflow-hidden rounded-lg border border-border">
          <div className="border-b border-border bg-muted/50 px-4 py-2.5">
            <h4 className="font-semibold text-foreground">심사 결과</h4>
          </div>
          <div className="flex">
            <div className="flex w-28 shrink-0 items-center bg-muted/30 px-4 py-4">
              <span className="text-sm font-medium">최종 판정</span>
            </div>
            <div className="flex flex-1 items-center gap-3 px-4 py-4">
              {application.finalJudgment === "매수" && <CheckCircle2 className="h-5 w-5 text-green-600" />}
              {application.finalJudgment === "기각" && <AlertTriangle className="h-5 w-5 text-red-500" />}
              {application.finalJudgment === "심의위원회 이관" && <Info className="h-5 w-5 text-amber-500" />}
              <JudgmentStatus 
                judgment={application.finalJudgment} 
                variant="text" 
                size="lg"
              />
            </div>
          </div>
          {application.reviewerComment && (
            <div className="flex border-t border-border">
              <div className="flex w-28 shrink-0 bg-muted/30 px-4 py-3">
                <span className="text-sm font-medium">심사 의견</span>
              </div>
              <div className="flex flex-1 px-4 py-3">
                <p className="text-sm text-muted-foreground">{application.reviewerComment}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 컨펌 모달 */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-background p-6 shadow-xl">
            <h3 className="mb-2 text-lg font-semibold">수정 내용 저장</h3>
            <p className="mb-6 text-sm text-muted-foreground">
              필지 선택을 제외한 정보가 수정됩니다. 저장하시���습니까?
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowConfirmModal(false)}
              >
                취소
              </Button>
              <Button onClick={handleConfirmSave}>
                저장
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ApplicationStatusSection() {
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  // 현재 로그인한 사용자의 신청 목록 (실제로는 사용자 ID로 필터링)
  const myApplications = dummyApplications;

  // 첫 번째 신청이 있으면 기본 선택
  const displayedApplication = selectedApplication || (myApplications.length > 0 ? myApplications[0] : null);

  return (
    <div>
      {/* 2-column 레이아웃: 왼쪽 리스트 / 오른쪽 상세 */}
      <div className="grid grid-cols-[320px_1fr] gap-4">
        {/* 왼쪽: 신청 목록 - 고용24 스타일 */}
        <div className="flex h-full max-h-[calc(100vh-200px)] flex-col overflow-hidden rounded-lg border border-border">
          <div className="flex shrink-0 items-center justify-between border-b border-border bg-muted/50 px-4 py-2.5">
            <h3 className="font-semibold text-foreground">신청 목록</h3>
            <span className="text-sm text-muted-foreground">{myApplications.length}건</span>
          </div>
          
          {myApplications.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
              <FileText className="h-10 w-10 text-muted-foreground" />
              <p className="mt-4 text-sm font-medium text-foreground">신청 내역이 없습니다</p>
              <p className="mt-1 text-xs text-muted-foreground">
                신규 신청 탭에서 잔여지 매수를 신청해 주세요.
              </p>
            </div>
          ) : (
            <ul className="flex-1 divide-y divide-border overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent">
              {myApplications.map((app) => {
                const isSelected = displayedApplication?.id === app.id;
                const isMultipleLands = app.additionalLands && app.additionalLands.length > 0;

                return (
                  <li key={app.id}>
                    <button
                      onClick={() => setSelectedApplication(app)}
                      className={`group w-full px-4 py-3 text-left transition-all ${
                        isSelected 
                          ? "border-l-2 border-l-primary bg-primary/5" 
                          : "hover:bg-muted/50"
                      }`}
                    >
                      {/* 상단: 상태 + 접수번호 */}
                      <div className="flex items-center gap-2">
                        <AdminStatusBadge status={app.adminStatus} size="sm" />
                        <span className={`text-sm font-semibold ${isSelected ? "text-primary" : "text-foreground"}`}>
                          {app.applicationNumber}
                        </span>
                      </div>

                      {/* 주소 */}
                      <p className="mt-1.5 truncate text-xs text-muted-foreground">
                        {app.landInfo.address}
                        {isMultipleLands && (
                          <span className="ml-1 font-medium text-black">외 {app.additionalLands.length}필지</span>
                        )}
                      </p>

                      {/* 하단: 날짜 + 결과 */}
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{app.appliedAt}</span>
                        {app.adminStatus === "심사완료" && app.finalJudgment && (
                          <span className={`text-xs font-medium ${
                            app.finalJudgment === "매수" 
                              ? "text-green-600" 
                              : app.finalJudgment === "기각"
                                ? "text-red-500"
                                : "text-amber-500"
                          }`}>
                            {app.finalJudgment}
                          </span>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* 오른쪽: 신청 상세 정보 */}
        {displayedApplication ? (
          <ApplicationDetailPanel application={displayedApplication} />
        ) : (
          <div className="overflow-hidden rounded-lg border border-border">
            <div className="border-b border-border bg-muted/50 px-4 py-2.5">
              <h4 className="font-semibold text-foreground">상세 정보</h4>
            </div>
            <div className="flex h-48 items-center justify-center">
              <div className="text-center">
                <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">신청 내역을 선택해주���요</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
