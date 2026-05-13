import Link from "next/link";
import Image from "next/image";
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
  Phone
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      
      {/* Hero Section - 배너 이미지 포함 */}
      <section className="relative overflow-hidden">
        {/* 배경 이미지 */}
        <div className="absolute inset-0">
          <Image
            src="/images/hero-banner.jpg"
            alt="고속도로와 토지 전경"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
        </div>
        
        {/* 컨텐츠 */}
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="max-w-xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-medium text-white">AI 기반 자동 판독 시스템</span>
            </div>
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              AI로 더 빠르고 정확한
              <br />
              잔여지 매수 판독
            </h1>
            <p className="mt-5 text-base leading-relaxed text-white/90 sm:text-lg">
              인공지능이 토지 형상, 면적, 법적 요건을 자동으로 분석하여
              <br />
              매수 가능 여부를 신속하게 판독해 드립니다.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-[55px] px-8 text-lg font-semibold">
                <Link href="/citizen">
                  잔여지 매수 신청
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-[55px] border-1 border-gray-400 bg-white px-8 text-lg font-semibold text-gray-800 hover:bg-gray-50 hover:text-gray-800">
                <Link href="/citizen?tab=status">
                  신청 현황 조회
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-y border-gray-100 bg-gray-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-[28px] font-bold text-foreground">
              AI 기반 핵심 기능
            </h2>
            <p className="mt-2 text-[18px] text-muted-foreground">
              인공지능이 복잡한 판독 업무를 자동화하여 신속하고 정확한 서비스를 제공합니다
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-white p-6">
              <FileSearch className="size-[1.8rem] text-primary" />
              <h3 className="mt-4 text-[20px] font-semibold text-foreground">간편한 토지 조회</h3>
              <p className="mt-2 text-base leading-[140%] text-muted-foreground">
                지번으로 직접 검색 또는 소유자 정보를 입력하면 편입된 매수 대상 토지를 손쉽게 조회할 수 있습니다.
              </p>
            </div>

            <div className="rounded-lg bg-white p-6">
              <Zap className="size-[1.8rem] text-primary" />
              <h3 className="mt-4 text-[20px] font-semibold text-foreground">AI 매수 가능 분석</h3>
              <p className="mt-2 text-base leading-[140%] text-muted-foreground">
                AI가 면적, 형상, 용도 등 법적 기준을 분석하여 매수 가능 여부를 사전에 안내해드립니다.
              </p>
            </div>

            <div className="rounded-lg bg-white p-6">
              <FileText className="size-[1.8rem] text-primary" />
              <h3 className="mt-4 text-[20px] font-semibold text-foreground">온라인 신청</h3>
              <p className="mt-2 text-base leading-[140%] text-muted-foreground">
                방문 없이 온라인으로 매수 신청서를 제출하고 진행 상황을 실시간으로 확인하세요.
              </p>
            </div>

            <div className="rounded-lg bg-white p-6">
              <Clock className="size-[1.8rem] text-primary" />
              <h3 className="mt-4 text-[20px] font-semibold text-foreground">빠른 결과 확인</h3>
              <p className="mt-2 text-base leading-[140%] text-muted-foreground">
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
            <h2 className="text-[28px] font-bold text-foreground">
              처리 절차
            </h2>
            <p className="mt-2 text-[18px] text-muted-foreground">
              간단한 4단계로 잔여지 매수 신청이 완료됩니다
            </p>
          </div>

          <div className="mt-12 flex flex-col items-center gap-4 lg:flex-row lg:justify-center lg:gap-0">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center lg:flex-1">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <Search className="size-[1.8rem] text-primary" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">토지 조회</h3>
              <p className="mt-1 max-w-[180px] text-base leading-[140%] text-muted-foreground">
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
                <Zap className="size-[1.8rem] text-primary" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">AI 분석</h3>
              <p className="mt-1 max-w-[180px] text-base leading-[140%] text-muted-foreground">
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
                <FileCheck className="size-[1.8rem] text-primary" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">매수 신청</h3>
              <p className="mt-1 max-w-[180px] text-base leading-[140%] text-muted-foreground">
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
                <CheckCircle2 className="size-[1.8rem] text-primary" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">결과 통보</h3>
              <p className="mt-1 max-w-[180px] text-base leading-[140%] text-muted-foreground">
                매수, 기각, 또는 이관 결과를 통보합니다
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
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <div className="flex flex-col justify-center">
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
