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
              잔여지 매수 신청 서비스
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
              도로 편입으로 발생한 잔여지의 매수 가능 여부를 빠르게 확인하고
              <br />
              온라인으로 간편하게 매수 신청을 진행하실 수 있습니다.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/citizen">
                  잔여지 매수 조회
                  <ArrowRight className="ml-2 h-4 w-4" />
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
              편리한 잔여지 매수 신청을 위한 기능을 제공합니다
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <FileSearch className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="mt-4 text-lg">간편한 토지 조회</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  지번 입력만으로 편입 토지와 잔여지 정보를 손쉽게 확인할 수 있습니다.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <ClipboardList className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="mt-4 text-lg">매수 가능 여부 확인</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  AI가 면적, 형상, 용도 등 법적 기준을 분석하여 매수 가능 여부를 사전에 안내해드립니다.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-3/10">
                  <FileText className="h-6 w-6 text-chart-3" />
                </div>
                <CardTitle className="mt-4 text-lg">온라인 신청</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  방문 없이 온라인으로 매수 신청서를 제출하고 진행 상황을 실시간으로 확인하세요.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-4/10">
                  <Clock className="h-6 w-6 text-chart-4" />
                </div>
                <CardTitle className="mt-4 text-lg">빠른 결과 확인</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  신청 접수부터 결과 통보까지 모든 진행 상황을 온라인에서 확인할 수 있습니다.
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
              <h3 className="mt-4 font-semibold text-foreground">AI 분석 확인</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                AI가 매수 가능 여부를 사전 분석합니다
              </p>
            </div>

            <div className="relative flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="mt-4 font-semibold text-foreground">매수 신청</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                신청인 정보와 필요 서류를 제출합니다
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

      <Footer />
    </div>
  );
}
