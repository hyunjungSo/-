"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { dummyApplications } from "@/lib/dummy-data";
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
            <X className="h-8 w-8" />
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
          <p className="text-muted-foreground" style={{ fontSize: '14px' }}>
            * 정확한 주소를 찾을 수 없는 경우, 가까운 건물명이나 도로명으로 검색해 보세요.
          </p>
        </div>
      </div>
    </div>
  );
}

// 토지 정보 섹션 컴포넌트 (고용24 스타일 테이블 형태)
function LandInfoSection({ application }: { application: Application }) {
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
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
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
          <Collapsible defaultOpen={false}>
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
                    <ChevronDown className="h-6 w-6 text-muted-foreground transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
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
    </div>
  );
}

// RationaleCard 컴포넌트를 import해서 사용
import { RationaleCard } from "@/components/ui/rationale-card";

// 상세 정보 패널 컴포넌트 (고용24 스타일)
function ApplicationDetailPanel({ application }: { application: Application }) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editData, setEditData] = useState({
    applicantName: application.applicantName,
    applicantContact: application.applicantContact,
    postalCode: "",
    baseAddress: application.applicantAddress,
    detailAddress: "",
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

  const handleSave = () => {
    // TODO: API 호출하여 수정 내용 저장
    setIsEditMode(false);
  };

  const handleCancel = () => {
    // 원래 데이터로 복원
    setEditData({
      applicantName: application.applicantName,
      applicantContact: application.applicantContact,
      postalCode: "",
      baseAddress: application.applicantAddress,
      detailAddress: "",
      reason: application.reason,
      attachments: [],
    });
    setIsEditMode(false);
  };

  return (
    <div className="space-y-4 overflow-visible">
      {/* 신청 정보 테이블 */}
      <div className="overflow-hidden rounded-lg border border-border">
        <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-2.5">
          <h4 className="font-semibold text-foreground">신청 정보</h4>
          {/* 수정/저장/취소 버튼 - 접수완료 상태에서만 활성화 */}
          {isEditMode ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="h-8 gap-1.5 text-xs"
              >
                <X className="h-4 w-4" />
                취소
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                className="h-8 gap-1.5 text-xs"
              >
                <Save className="h-4 w-4" />
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
              <Pencil className="h-4 w-4" />
              수정
            </Button>
          )}
        </div>
        
        {/* 접수번호 행 */}
        <div className="flex border-b border-border">
          <div className="flex w-28 shrink-0 items-center bg-muted/30 px-4 py-3">
            <span className="text-sm font-medium">접수번호</span>
          </div>
          <div className="flex flex-1 items-center gap-2 px-4 py-3">
            <Badge variant={adminStatusConfig[application.adminStatus].variant}>
              {adminStatusConfig[application.adminStatus].label}
            </Badge>
            <span className="font-semibold text-foreground">{application.applicationNumber}</span>
          </div>
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

        {/* 신청인명 행 */}
        <div className="flex border-b border-border">
          <div className="flex w-28 shrink-0 items-center bg-muted/30 px-4 py-3">
            <span className="text-sm font-medium">신청인명</span>
          </div>
          <div className="flex flex-1 items-center px-4 py-3">
            {isEditMode ? (
              <Input
                value={editData.applicantName}
                onChange={(e) => setEditData({ ...editData, applicantName: e.target.value })}
                className="h-8 text-sm"
              />
            ) : (
              <span className="text-sm">{application.applicantName}</span>
            )}
          </div>
        </div>

        {/* 연락처 행 */}
        <div className="flex border-b border-border">
          <div className="flex w-28 shrink-0 items-center bg-muted/30 px-4 py-3">
            <span className="text-sm font-medium">연락처</span>
          </div>
          <div className="flex flex-1 items-center px-4 py-3">
            {isEditMode ? (
              <Input
                value={editData.applicantContact}
                onChange={(e) => setEditData({ ...editData, applicantContact: e.target.value })}
                className="h-8 text-sm"
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
          <div className="flex flex-1 px-4 py-3">
            {isEditMode ? (
              <div className="w-full space-y-1.5">
                <div className="flex gap-2">
                  <Input
                    value={editData.postalCode}
                    placeholder="우편번호"
                    readOnly
                    className="h-9 w-24 bg-muted text-sm"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowAddressModal(true)}
                    className="h-9 shrink-0"
                  >
                    주소 검색
                  </Button>
                </div>
                <Input
                  value={editData.baseAddress}
                  placeholder="기본주소"
                  readOnly
                  className="bg-muted text-sm"
                />
                <Input
                  value={editData.detailAddress}
                  onChange={(e) => setEditData({ ...editData, detailAddress: e.target.value })}
                  placeholder="상세주소를 입력해주세요"
                  className="text-sm"
                />
              </div>
            ) : (
              <span className="text-sm">{application.applicantAddress}</span>
            )}
          </div>
        </div>

        {/* 신청사유 행 */}
        <div className="flex border-b border-border">
          <div className="flex w-28 shrink-0 items-start bg-muted/30 px-4 py-3">
            <span className="text-sm font-medium">신청사유</span>
          </div>
          <div className="flex flex-1 items-center px-4 py-3">
            {isEditMode ? (
              <Textarea
                value={editData.reason}
                onChange={(e) => setEditData({ ...editData, reason: e.target.value })}
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
            {isEditMode ? (
              <div className="w-full space-y-3">
                {/* 파일 업로드 영역 */}
                <div className="rounded-md border border-dashed border-gray-300 bg-gray-50 p-3">
                  <p className="mb-2 text-center text-xs text-muted-foreground">
                    첨부할 파일을 여기에 끌어다 놓거나, 파일 선택 버튼을 클릭하세요.
                  </p>
                  <div className="flex items-center justify-center">
                    <label className="cursor-pointer">
                      <span className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-gray-50">
                        <Upload className="h-3.5 w-3.5" />
                        파일선택
                      </span>
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                    </label>
                  </div>
                </div>

                {/* 파일 리스트 */}
                {editData.attachments.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {editData.attachments.length}개 / {MAX_FILES}개
                      </span>
                    </div>
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
                            onClick={() => handleRemoveFile(index)}
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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

      {/* 토지 정보 요약 - 셀렉트박스로 필지 선택 */}
      <LandInfoSection application={application} />

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
