"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import { LandMap } from "@/components/land-map";
import { dummyApplications, landShapes, landCategories } from "@/lib/dummy-data";
import type { Application, LandShape, LandCategory } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Download, Printer, FileText, CheckCircle2, Edit3, Upload, ImageIcon, X } from "lucide-react";

// 대상 토지 필지 데이터 (샘플과 동일하게)
interface LandParcel {
  originalLotNumber: string;
  landCategory: string;
  originalArea: number;
  includedLotNumber: string;
  includedArea: number;
  remainingLotNumber: string;
  remainingArea: number;
  remainingRatio: number;
  purchaseDecision: "O" | "X" | "-" | "선택";
}

// 심의위원회 결정
interface CommitteeDecision {
  role: string;
  decision: "O" | "X" | "";
  signature: string;
}

export default function ReviewDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [isGenerated, setIsGenerated] = useState(false);
  const [isEditing, setIsEditing] = useState(true);

  // 문서 데이터
  const [documentMeta, setDocumentMeta] = useState({
    projectName: "대산당진 고속도로 건설공사",
    sectionNumber: "1공구",
    reviewNumber: "제4차",
    author: "차장 지광호",
  });

  const [landParcels, setLandParcels] = useState<LandParcel[]>([]);
  const [ownerInfo, setOwnerInfo] = useState({
    address: "",
    ownerName: "",
  });

  // 이미지 업로드 상태
  const [cadastralMapImage, setCadastralMapImage] = useState<string | null>(null);
  const [aerialPhotoImage, setAerialPhotoImage] = useState<string | null>(null);

  // 현지상황 및 검토의견 (textarea로 편집 가능)
  const [fieldConditionReview, setFieldConditionReview] = useState(`현황 : 지목(전, 임), 현황 임야
토지모양 : 부정형 다각형, 세장형, 부정형다각형
실제 이용상황 : 임
농기계 진입, 회전 : -

검토의견
가운데 부분이 편입되고, 일부 잔여지 359-1(임) 및 359-8(임)은
잔여 면적 및 잔여비율이 매우 커서 잔여지만 매수는 불가한 것으로
판단되며, 359-4 및 359-10은 면적이 작고 진입이 곤란한 형상으로
잔여지 활용이 현저히 어려워 매수가 타당하다고 판단됨.

잔여지 보상비 : 359-1, 359-2, 359-8, 359-4, 359-10`);

  // 소유자 의견
  const [ownerOpinion, setOwnerOpinion] = useState(
    "토지 활용도가 현저히 저하되어, 경제적 가치가 현저히 하락하게 되었으니 매수 요청"
  );

  // 심의위원회 결정
  const [committeeDecisions, setCommitteeDecisions] = useState<CommitteeDecision[]>([
    { role: "사업단장", decision: "", signature: "" },
    { role: "보상부장", decision: "", signature: "" },
    { role: "공사부장", decision: "", signature: "" },
    { role: "품질부장", decision: "", signature: "" },
    { role: "외부위원", decision: "", signature: "" },
    { role: "최종결정", decision: "", signature: "" },
  ]);

  useEffect(() => {
    const found = dummyApplications.find((app) => app.id === resolvedParams.id);
    if (found) {
      setApplication(found);
      setOwnerInfo({
        address: found.landInfo.address.split(" ").slice(0, -1).join(" "),
        ownerName: found.applicantName,
      });
      // 필지 데이터 생성
      setLandParcels([
        {
          originalLotNumber: "359-1",
          landCategory: "대",
          originalArea: 650,
          includedLotNumber: "359-6",
          includedArea: 97,
          remainingLotNumber: "359-1",
          remainingArea: 260,
          remainingRatio: 40.0,
      purchaseDecision: "선택",
      },
      {
        originalLotNumber: "359-2",
        landCategory: "대",
        originalArea: 780,
        includedLotNumber: "359-7",
        includedArea: 325,
        remainingLotNumber: "359-2",
        remainingArea: 195,
        remainingRatio: 23.2,
        purchaseDecision: "선택",
      },
      {
        originalLotNumber: "359-4",
        landCategory: "대",
        originalArea: 585,
        includedLotNumber: "359-9",
        includedArea: 357,
        remainingLotNumber: "359-4",
        remainingArea: 227,
        remainingRatio: 30.6,
        purchaseDecision: "선택",
      },
      ]);
      setOwnerOpinion(found.reason || ownerOpinion);
    }
  }, [resolvedParams.id]);

  const handleGenerate = () => {
    setIsGenerated(true);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  // 필지별 매수여부 변경 핸들러
  const handlePurchaseDecisionChange = (index: number, decision: "O" | "X" | "-" | "선택") => {
    setLandParcels((prev) =>
      prev.map((parcel, i) =>
        i === index ? { ...parcel, purchaseDecision: decision } : parcel
      )
    );
  };

  if (!application) {
    return (
      <div className="min-h-screen bg-background">
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-muted-foreground">민원을 찾을 수 없습니다.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* 상단 네비게이션 */}
          <div className="flex items-center justify-between print:hidden">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              돌아가기
            </Button>
            <div className="flex gap-2">
              {isEditing && (
                <Button onClick={handleGenerate}>
                  완료
                </Button>
              )}
              {isGenerated && !isEditing && (
                <>
                  <Button variant="outline" onClick={handleEdit}>
                    <Edit3 className="mr-2 h-4 w-4" />
                    수정
                  </Button>
                  <Button variant="outline" onClick={() => window.print()}>
                    <Printer className="mr-2 h-4 w-4" />
                    인쇄
                  </Button>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    PDF 다운로드
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="print:hidden">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              심의서 작성 {isGenerated && !isEditing && "완료"}
            </h1>
            <p className="mt-1 text-muted-foreground">
              접수번호: {application.applicationNumber}
            </p>
          </div>

          {/* 심의서 본문 */}
          <Card className="overflow-hidden print:border-none print:shadow-none">
            <CardContent className="p-0">
              <div className="bg-card p-6 print:p-0">
                {/* 제목 */}
                <div className="mb-6 text-center">
                  <h2 className="text-xl font-bold text-foreground sm:text-2xl">
                    잔여지 매수여부 심의서({documentMeta.sectionNumber})[{documentMeta.reviewNumber}]
                  </h2>
                </div>

                {/* 사업명 / 작성자 */}
                <div className="mb-4 flex items-center justify-between text-sm">
                  <div>
                    <span className="text-primary">○ 사업명 : </span>
                    <span className="text-foreground">{documentMeta.projectName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">작성자 : </span>
                    <span className="text-foreground">{documentMeta.author}</span>
                    <span className="ml-2 text-muted-foreground">(인)</span>
                  </div>
                </div>

                {/* 메인 테이블 */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-foreground text-sm">
                    <thead>
                      <tr>
                        <th
                          colSpan={10}
                          className="border border-foreground bg-muted px-2 py-2 text-center font-medium text-foreground"
                        >
                          대상 토지
                        </th>
                        <th
                          className="border border-foreground bg-primary/10 px-2 py-2 text-center font-semibold text-primary"
                          style={{ minWidth: "220px" }}
                        >
                          현지상황 및 검토의견
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td
                          rowSpan={2}
                          className="border border-foreground bg-muted px-2 py-2 text-center font-medium text-foreground"
                          style={{ minWidth: "140px" }}
                        >
                          소재지
                          <br />
                          (소유자)
                        </td>
                        <td
                          rowSpan={2}
                          className="border border-foreground bg-muted px-1 py-1 text-center text-sm font-medium text-foreground"
                          style={{ width: "50px" }}
                        >
                          원지번
                        </td>
                        <td
                          rowSpan={2}
                          className="border border-foreground bg-muted px-2 py-1 text-center text-sm font-medium text-foreground"
                        >
                          지목
                        </td>
                        <td
                          rowSpan={2}
                          className="border border-foreground bg-muted px-2 py-1 text-center text-sm font-medium text-foreground"
                        >
                          면적(m&sup2;)
                        </td>
                        <td
                          colSpan={2}
                          className="border border-foreground bg-muted px-2 py-2 text-center font-medium text-foreground"
                        >
                          편입토지
                        </td>
                        <td
                          colSpan={4}
                          className="border border-foreground bg-muted px-2 py-2 text-center font-medium text-foreground"
                        >
                          잔여토지
                        </td>
                        <td
                          rowSpan={9}
                          className="border border-foreground p-0 align-top"
                          style={{ minWidth: "220px" }}
                        >
                          {isEditing ? (
                            <Textarea
                              value={fieldConditionReview}
                              onChange={(e) => setFieldConditionReview(e.target.value)}
                              className="h-full min-h-[300px] cursor-text resize-none rounded-none border-0 text-sm leading-relaxed focus-visible:ring-0 focus-visible:ring-offset-0"
                              placeholder="현지상황 및 검토의견을 입력하세요"
                            />
                          ) : (
                            <div className="whitespace-pre-wrap p-2 text-sm leading-relaxed text-foreground">
                              {fieldConditionReview}
                            </div>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-foreground bg-muted px-1 py-1 text-center text-sm font-medium text-foreground" style={{ width: "50px" }}>
                          지번
                        </td>
                        <td className="border border-foreground bg-muted px-2 py-1 text-center text-sm font-medium text-foreground">
                          면적(m&sup2;)
                        </td>
                        <td className="border border-foreground bg-muted px-1 py-1 text-center text-sm font-medium text-foreground" style={{ width: "50px" }}>
                          지번
                        </td>
                        <td className="border border-foreground bg-muted px-2 py-1 text-center text-sm font-medium text-foreground">
                          면적(m&sup2;)
                        </td>
                        <td className="border border-foreground bg-muted px-2 py-1 text-center text-sm font-medium text-foreground">
                          잔여비율
                        </td>
                        <td className="border border-foreground bg-primary/10 px-2 py-1 text-center text-sm font-semibold text-primary">
                          매수여부
                        </td>
                      </tr>
                      {landParcels.map((parcel, index) => (
                        <tr key={index}>
                          {index === 0 && (
                            <td
                              rowSpan={landParcels.length}
                              className="border border-foreground px-2 py-2 text-center text-foreground"
                            >
                              {ownerInfo.address}
                              <br />
                              <span className="text-muted-foreground">({ownerInfo.ownerName})</span>
                            </td>
                          )}
                          <td className="border border-foreground px-2 py-1 text-center text-foreground">
                            {parcel.originalLotNumber}
                          </td>
                          <td className="border border-foreground px-2 py-1 text-center text-foreground">
                            {parcel.landCategory}
                          </td>
                          <td className="border border-foreground px-2 py-1 text-center text-foreground">
                            {parcel.originalArea.toLocaleString()}
                          </td>
                          <td className="border border-foreground px-2 py-1 text-center text-foreground">
                            {parcel.includedLotNumber}
                          </td>
                          <td className="border border-foreground px-2 py-1 text-center text-foreground">
                            {parcel.includedArea.toLocaleString()}
                          </td>
                          <td className="border border-foreground px-2 py-1 text-center text-foreground">
                            {parcel.remainingLotNumber}
                          </td>
                          <td className="border border-foreground px-2 py-1 text-center text-foreground">
                            {parcel.remainingArea.toLocaleString()}
                          </td>
                          <td className="border border-foreground px-2 py-1 text-center text-foreground">
                            {parcel.remainingRatio.toFixed(1)}%
                          </td>
                          <td className="border border-foreground px-1 py-1 text-center font-bold">
                            {isEditing ? (
                              <Select
                                value={parcel.purchaseDecision}
                                    onValueChange={(value) =>
                                      handlePurchaseDecisionChange(index, value as "O" | "X" | "-" | "선택")
                                    }
                                  >
                                    <SelectTrigger className="h-10 min-h-0 w-full min-w-0 border-primary/50 text-center font-bold">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="선택" className="text-muted-foreground">
                                        선택
                                      </SelectItem>
                                      <SelectItem value="O" className="font-bold text-primary">
                                        O (매수)
                                      </SelectItem>
                                      <SelectItem value="X" className="font-bold text-destructive">
                                        X (매수불가)
                                      </SelectItem>
                                      <SelectItem value="-" className="text-muted-foreground">
                                        - (미정)
                                      </SelectItem>
                                    </SelectContent>
                              </Select>
                            ) : (
                              <span
                                className={
                                  parcel.purchaseDecision === "O"
                                    ? "text-primary"
                                    : parcel.purchaseDecision === "X"
                                    ? "text-destructive"
                                    : "text-muted-foreground"
                                }
                              >
                                {parcel.purchaseDecision}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {/* 소유자 의견 + 심의위원회결정 */}
                      <tr>
                        <td
                          rowSpan={4}
                          className="w-8 border border-foreground bg-muted px-1 py-2 text-center text-sm font-medium text-foreground"
                          style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
                        >
                          소유자의견
                        </td>
                        <td rowSpan={4} colSpan={2} className="border border-foreground p-0 align-top">
                          {isEditing ? (
                            <Textarea
                              value={ownerOpinion}
                              onChange={(e) => setOwnerOpinion(e.target.value)}
                              className="h-full min-h-[100px] cursor-text resize-none rounded-none border-0 text-sm leading-relaxed focus-visible:ring-0 focus-visible:ring-offset-0"
                              placeholder="소유자 의견을 입력하세요"
                            />
                          ) : (
                            <div className="whitespace-pre-wrap p-2 text-sm leading-relaxed text-foreground">
                              {ownerOpinion}
                            </div>
                          )}
                        </td>
                        <td
                          colSpan={7}
                          className="border border-foreground bg-muted px-2 py-1 text-center text-sm font-medium text-foreground"
                        >
                          심의위원회결정{" "}
                          <span className="text-muted-foreground">(매수시 O, 매수불가시 X표시)</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-foreground bg-muted px-2 py-1 text-center text-sm font-medium text-foreground">
                          구분
                        </td>
                        {committeeDecisions.map((item, idx) => (
                          <td
                            key={idx}
                            className="border border-foreground bg-muted px-2 py-1 text-center text-sm font-medium text-foreground"
                          >
                            {item.role}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="border border-foreground bg-muted px-2 py-1 text-center text-sm font-medium text-foreground">
                          O, X
                        </td>
                        {committeeDecisions.map((_, idx) => (
                          <td
                            key={idx}
                            className="border border-foreground px-2 py-3 text-center"
                          >
                            {/* 인쇄 후 수기 기입 */}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="border border-foreground bg-muted px-2 py-1 text-center text-sm font-medium text-foreground">
                          서명
                        </td>
                        {committeeDecisions.map((_, idx) => (
                          <td
                            key={idx}
                            className="border border-foreground px-2 py-3 text-center"
                          >
                            {/* 인쇄 후 수기 서명 */}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 지적도 / 항공사진 */}
                <div className="mt-4 grid grid-cols-2 gap-0">
                  <div className="border border-foreground">
                    <div className="border-b border-foreground bg-muted px-2 py-1 text-center text-sm font-medium text-foreground">
                      지적도
                    </div>
                    <div className="relative h-[300px] overflow-hidden">
                      {cadastralMapImage ? (
                        <>
                          <img 
                            src={cadastralMapImage} 
                            alt="지적도" 
                            className="h-full w-full object-contain"
                          />
                          {isEditing && (
                            <button
                              onClick={() => setCadastralMapImage(null)}
                              className="absolute right-2 top-2 rounded-full bg-destructive p-1 text-white hover:bg-destructive/80 print:hidden"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center bg-muted/30">
                          <p className="mb-4 text-sm text-muted-foreground">
                            {isEditing ? '첨부할 파일을 여기에 끌어다 놓거나, 파일 선택 버튼을 직접 선택해주세요.' : '지적도 미등록'}
                          </p>
                          {isEditing && (
                            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-[#222222] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#333333]">
                              <Upload className="h-4 w-4" />
                              파일선택
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                      setCadastralMapImage(event.target?.result as string);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="border border-l-0 border-foreground">
                    <div className="border-b border-foreground bg-muted px-2 py-1 text-center text-sm font-medium text-foreground">
                      항공사진
                    </div>
                    <div className="relative h-[300px] overflow-hidden">
                      {aerialPhotoImage ? (
                        <>
                          <img 
                            src={aerialPhotoImage} 
                            alt="항공사진" 
                            className="h-full w-full object-contain"
                          />
                          {isEditing && (
                            <button
                              onClick={() => setAerialPhotoImage(null)}
                              className="absolute right-2 top-2 rounded-full bg-destructive p-1 text-white hover:bg-destructive/80 print:hidden"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center bg-muted/30">
                          <p className="mb-4 text-sm text-muted-foreground">
                            {isEditing ? '첨부할 파일을 여기에 끌어다 놓거나, 파일 선택 버튼을 직접 선택해주세요.' : '항공사진 미등록'}
                          </p>
                          {isEditing && (
                            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-[#222222] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#333333]">
                              <Upload className="h-4 w-4" />
                              파일선택
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                      setAerialPhotoImage(event.target?.result as string);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 생성 완료 메시지 */}
                {isGenerated && !isEditing && (
                  <div className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-accent/10 p-4 print:hidden">
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                    <span className="font-medium text-accent">
                      심의서가 생성되었습니다. 인쇄 또는 PDF 다운로드가 가능합니다.
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
