import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileSearch, 
  ClipboardList, 
  ArrowRight,
  Clock,
  FileText,
  Search,
  Zap,
  FileCheck,
  CheckCircle2,
  ChevronRight
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      
      {/* Hero Section - KRDS 가이드라인 준수 */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="text-center">
            <div className="mb-4">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                한국도로공사 공공서비스
              </span>
            </div>
            <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              잔여지 매수 신청 서비스
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              도로 편입으로 발생한 잔여지의 매수 가능 여부를 빠르게 확인하고
              <br className="hidden sm:block" />
              온라인으로 간편하게 매수 신청을 진행하실 수 있습니다.
            </p>
            <div className="mt-10">
              <Button asChild size="lg" className="h-12 min-w-[200px] text-base font-medium shadow-sm">
                <Link href="/citizen">
                  잔여지 매수 조회
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - KRDS 컴포넌트 스타일 적용 */}
      <section className="border-t border-border bg-muted/30 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              주요 기능
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              편리한 잔여지 매수 신청을 위한 기능을 제공합니다
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border bg-card transition-shadow hover:shadow-md">
              <CardHeader className="pb-1">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                  <FileSearch className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="mt-4 text-lg font-semibold">간편한 토지 조회</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-base leading-relaxed">
                  지번을 몰라도 읍면동만 선택하면 해당 지역의 편입 토지 목록에서 내 땅을 찾을 수 있습니다.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-border bg-card transition-shadow hover:shadow-md">
              <CardHeader className="pb-1">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-500/10">
                  <ClipboardList className="h-7 w-7 text-blue-600" />
                </div>
                <CardTitle className="mt-4 text-lg font-semibold">매수 가능 여부 확인</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-base leading-relaxed">
                  AI가 면적, 형상, 용도 등 법적 기준을 분석하여 매수 가능 여부를 사전에 안내해드립니다.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-border bg-card transition-shadow hover:shadow-md">
              <CardHeader className="pb-1">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-500/10">
                  <FileText className="h-7 w-7 text-amber-600" />
                </div>
                <CardTitle className="mt-4 text-lg font-semibold">온라인 신청</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-base leading-relaxed">
                  방문 없이 온라인으로 매수 신청서를 제출하고 진행 상황을 실시간으로 확인하세요.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-border bg-card transition-shadow hover:shadow-md">
              <CardHeader className="pb-1">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-teal-500/10">
                  <Clock className="h-7 w-7 text-teal-600" />
                </div>
                <CardTitle className="mt-4 text-lg font-semibold">빠른 결과 확인</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-base leading-relaxed">
                  신청 접수부터 결과 통보까지 모든 진행 상황을 온라인에서 확인할 수 있습니다.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Process Section - KRDS 단계 표시기 스타일 */}
      <section className="border-t border-border bg-card py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              처리 절차
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              간단한 4단계로 잔여지 매수 신청이 완료됩니다
            </p>
          </div>

          <div className="mt-14 flex flex-col items-center gap-6 lg:flex-row lg:justify-center lg:gap-0">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center lg:flex-1">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                <Search className="h-9 w-9" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-foreground">토지 조회</h3>
              <p className="mt-2 max-w-[200px] text-base leading-relaxed text-muted-foreground">
                편입 토지 지번으로 잔여지 정보를 조회합니���
              </p>
            </div>

            {/* Arrow 1 */}
            <div className="hidden shrink-0 px-4 text-muted-foreground/50 lg:block">
              <ChevronRight className="h-10 w-10" />
            </div>
            <div className="block rotate-90 text-muted-foreground/50 lg:hidden">
              <ChevronRight className="h-8 w-8" />
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center lg:flex-1">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                <Zap className="h-9 w-9" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-foreground">AI 분석 확인</h3>
              <p className="mt-2 max-w-[200px] text-base leading-relaxed text-muted-foreground">
                AI가 매수 가능 여부를 사전 분석합니다
              </p>
            </div>

            {/* Arrow 2 */}
            <div className="hidden shrink-0 px-4 text-muted-foreground/50 lg:block">
              <ChevronRight className="h-10 w-10" />
            </div>
            <div className="block rotate-90 text-muted-foreground/50 lg:hidden">
              <ChevronRight className="h-8 w-8" />
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center lg:flex-1">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                <FileCheck className="h-9 w-9" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-foreground">매수 신청</h3>
              <p className="mt-2 max-w-[200px] text-base leading-relaxed text-muted-foreground">
                신청인 정보와 필요 서류를 제출합니다
              </p>
            </div>

            {/* Arrow 3 */}
            <div className="hidden shrink-0 px-4 text-muted-foreground/50 lg:block">
              <ChevronRight className="h-10 w-10" />
            </div>
            <div className="block rotate-90 text-muted-foreground/50 lg:hidden">
              <ChevronRight className="h-8 w-8" />
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center text-center lg:flex-1">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-foreground">결과 통보</h3>
              <p className="mt-2 max-w-[200px] text-base leading-relaxed text-muted-foreground">
                매수, 기각, 또는 심의위원회 이관 결과를 통보합니다
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - KRDS 액션 버튼 스타일 */}
      <section className="border-t border-border bg-primary/5 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            지금 바로 시작하세요
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            잔여지 매수 가능 여부를 무료로 확인하고, 온라인으로 간편하게 신청하세요.
          </p>
          <div className="mt-8">
            <Button asChild size="lg" className="h-12 min-w-[200px] text-base font-medium shadow-sm">
              <Link href="/citizen">
                잔여지 조회 시작하기
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
