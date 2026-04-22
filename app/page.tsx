import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { 
  FileSearch, 
  ArrowRight,
  Clock,
  FileText,
  Search,
  Zap,
  FileCheck,
  CheckCircle2,
  ChevronRight,
  Phone,
  HelpCircle
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      
      {/* Hero Section - 토지보상 시스템 스타일 */}
      <section className="relative bg-gradient-to-br from-primary/5 via-white to-primary/5">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-4 inline-flex items-center rounded bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                한국도로공사 토지보상
              </div>
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
                잔여지 매수 신청 서비스
              </h1>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                도로 편입으로 발생한 잔여지의 매수 가능 여부를 확인하고 온라인으로 간편하게 매수 신청을 진행하실 수 있습니다.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="h-12 px-8 text-base font-medium">
                  <Link href="/citizen">
                    잔여지 매수 조회
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base font-medium">
                  <Link href="/citizen?tab=status">
                    신청현황 확인
                  </Link>
                </Button>
              </div>
            </div>
            
            {/* 빠른 링크 카드 */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Link href="/citizen" className="group rounded-lg border border-gray-200 bg-white p-5 transition-all hover:border-primary hover:shadow-md">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground group-hover:text-primary">토지 조회</h3>
                <p className="mt-1 text-sm text-muted-foreground">편입 토지 정보 검색</p>
              </Link>
              
              <Link href="/citizen" className="group rounded-lg border border-gray-200 bg-white p-5 transition-all hover:border-primary hover:shadow-md">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground group-hover:text-primary">매수 신청</h3>
                <p className="mt-1 text-sm text-muted-foreground">온라인 신청서 제출</p>
              </Link>
              
              <Link href="/citizen?tab=status" className="group rounded-lg border border-gray-200 bg-white p-5 transition-all hover:border-primary hover:shadow-md">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground group-hover:text-primary">진행현황</h3>
                <p className="mt-1 text-sm text-muted-foreground">신청 처리상태 확인</p>
              </Link>
              
              <Link href="/guide" className="group rounded-lg border border-gray-200 bg-white p-5 transition-all hover:border-primary hover:shadow-md">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <HelpCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground group-hover:text-primary">이용안내</h3>
                <p className="mt-1 text-sm text-muted-foreground">서비스 안내 및 FAQ</p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-y border-gray-100 bg-gray-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">
              주요 기능
            </h2>
            <p className="mt-2 text-base text-muted-foreground">
              편리한 잔여지 매수 신청을 위한 서비스를 제공합니다
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-white p-6">
              <FileSearch className="h-8 w-8 text-primary" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">간편한 토지 조회</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                지번을 몰라도 읍면동만 선택하면 해당 지역의 편입 토지 목록에서 내 땅을 찾을 수 있습니다.
              </p>
            </div>

            <div className="rounded-lg bg-white p-6">
              <Zap className="h-8 w-8 text-primary" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">AI 매수 가능 분석</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                AI가 면적, 형상, 용도 등 법적 기준을 분석하여 매수 가능 여부를 사전에 안내해드립니다.
              </p>
            </div>

            <div className="rounded-lg bg-white p-6">
              <FileText className="h-8 w-8 text-primary" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">온라인 신청</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                방문 없이 온라인으로 매수 신청서를 제출하고 진행 상황을 실시간으로 확인하세요.
              </p>
            </div>

            <div className="rounded-lg bg-white p-6">
              <Clock className="h-8 w-8 text-primary" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">빠른 결과 확인</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                신청 접수부터 결과 통보까지 모든 진행 상황을 온라인에서 확인할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">
              처리 절차
            </h2>
            <p className="mt-2 text-base text-muted-foreground">
              간단한 4단계로 잔여지 매수 신청이 완료됩니다
            </p>
          </div>

          <div className="mt-12 flex flex-col items-center gap-4 lg:flex-row lg:justify-center lg:gap-0">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center lg:flex-1">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <Search className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">토지 조회</h3>
              <p className="mt-1 max-w-[180px] text-sm text-muted-foreground">
                편입 토지 지번으로 잔여지 정보를 조회합니다
              </p>
            </div>

            {/* Arrow 1 */}
            <div className="hidden shrink-0 px-2 text-gray-300 lg:block">
              <ChevronRight className="h-8 w-8" />
            </div>
            <div className="block rotate-90 text-gray-300 lg:hidden">
              <ChevronRight className="h-6 w-6" />
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center lg:flex-1">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <Zap className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">AI 분석</h3>
              <p className="mt-1 max-w-[180px] text-sm text-muted-foreground">
                AI가 매수 가능 여부를 사전 분석합니다
              </p>
            </div>

            {/* Arrow 2 */}
            <div className="hidden shrink-0 px-2 text-gray-300 lg:block">
              <ChevronRight className="h-8 w-8" />
            </div>
            <div className="block rotate-90 text-gray-300 lg:hidden">
              <ChevronRight className="h-6 w-6" />
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center lg:flex-1">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <FileCheck className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">매수 신청</h3>
              <p className="mt-1 max-w-[180px] text-sm text-muted-foreground">
                신청인 정보와 필요 서류를 제출합니다
              </p>
            </div>

            {/* Arrow 3 */}
            <div className="hidden shrink-0 px-2 text-gray-300 lg:block">
              <ChevronRight className="h-8 w-8" />
            </div>
            <div className="block rotate-90 text-gray-300 lg:hidden">
              <ChevronRight className="h-6 w-6" />
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center text-center lg:flex-1">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <CheckCircle2 className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">결과 통보</h3>
              <p className="mt-1 max-w-[180px] text-sm text-muted-foreground">
                매수, 기각, 또는 심의위원회 이관 결과를 통보합니다
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="border-t border-gray-100 bg-primary/5 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">잔여지 매수 관련 문의</p>
                <p className="text-xl font-bold text-foreground">1588-2504</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button asChild variant="outline" className="h-11 px-6">
                <Link href="/guide">
                  이용안내
                </Link>
              </Button>
              <Button asChild className="h-11 px-6">
                <Link href="/citizen">
                  서비스 시작하기
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
