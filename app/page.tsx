import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileSearch, 
  ClipboardList, 
  Users, 
  Shield,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/5">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="text-center">
            <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              잔여지 매수 판독 서비스
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
              AI 기반 자동 분석으로 잔여지 매수 판정을 신속하고 일관되게 처리합니다.
              <br />
              민원인은 간편하게 신청하고, 담당자는 효율적으로 검토할 수 있습니다.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/citizen">
                  민원인 서비스
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link href="/admin">
                  담당자 서비스
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border bg-card py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              주요 기능
            </h2>
            <p className="mt-2 text-muted-foreground">
              효율적인 잔여지 매수 판독을 위한 핵심 기능을 제공합니다
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <FileSearch className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="mt-4 text-lg">토지 조회</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  지번 입력, 지도 클릭, 목록 선택 등 다양한 방식으로 편입 토지 및 잔여지를 조회할 수 있습니다.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                  <ClipboardList className="h-6 w-6 text-accent" />
                </div>
                <CardTitle className="mt-4 text-lg">AI 자동 분석</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  면적, 형상, 용도, 맹지 여부 등 법적 기준을 AI가 자동으로 분석하여 매수 여부를 판정합니다.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-3/10">
                  <Users className="h-6 w-6 text-chart-3" />
                </div>
                <CardTitle className="mt-4 text-lg">담당자 검토</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  AI 분석 결과를 담당자가 검토하고 수정할 수 있는 협업 구조로 정확한 판정을 지원합니다.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-4/10">
                  <Shield className="h-6 w-6 text-chart-4" />
                </div>
                <CardTitle className="mt-4 text-lg">심의서 자동 생성</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  판정 근거와 기준 문구가 포함된 심의서를 자동으로 생성하여 문서화 작업을 간소화합니다.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="border-t border-border py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              처리 절차
            </h2>
            <p className="mt-2 text-muted-foreground">
              간단한 4단계로 잔여지 매수 신청이 완료됩니다
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="mt-4 font-semibold text-foreground">토지 조회</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                편입 토지 지번으로 잔여지 정보를 조회합니다
              </p>
            </div>

            <div className="relative flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="mt-4 font-semibold text-foreground">매수 신청</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                신청인 정보와 필요 서류를 제출합니다
              </p>
            </div>

            <div className="relative flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="mt-4 font-semibold text-foreground">AI 분석 및 검토</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                AI가 자동 분석하고 담당자가 검토합니다
              </p>
            </div>

            <div className="relative flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <span className="text-xl font-bold">4</span>
              </div>
              <h3 className="mt-4 font-semibold text-foreground">결과 통보</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                매수, 기각, 또는 심의위원회 이관 결과를 통보합니다
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-t border-border bg-card py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <CheckCircle2 className="h-10 w-10 text-accent" />
              <p className="mt-4 text-3xl font-bold text-foreground">일관된 판정</p>
              <p className="mt-2 text-sm text-muted-foreground">
                동일 조건에 동일한 결과 제공
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Clock className="h-10 w-10 text-chart-3" />
              <p className="mt-4 text-3xl font-bold text-foreground">신속한 처리</p>
              <p className="mt-2 text-sm text-muted-foreground">
                AI 분석으로 검토 시간 단축
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <FileText className="h-10 w-10 text-chart-4" />
              <p className="mt-4 text-3xl font-bold text-foreground">자동 문서화</p>
              <p className="mt-2 text-sm text-muted-foreground">
                심의서 자동 생성으로 업무 효율화
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
