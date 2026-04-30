"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const success = await login(userId, password);
      if (success) {
        // 로그인 성공 시 역할에 따라 리다이렉트
        const storedUser = sessionStorage.getItem("user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          if (user.role === "admin") {
            router.push("/admin");
          } else {
            router.push("/citizen");
          }
        }
      } else {
        setError("아이디 또는 비밀번호가 올바르지 않습니다.");
      }
    } catch {
      setError("로그인 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* 상단 로고 영역 */}
      <header className="border-b bg-white py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Image
            src="/images/logo-lc.png"
            alt="한국도로공사 토지정보 토지보상"
            width={200}
            height={40}
            className="h-10"
            style={{ width: "auto", height: "auto" }}
            priority
          />
        </div>
      </header>

      {/* 로그인 폼 */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">로그인</CardTitle>
            <CardDescription>
              잔여지 매수 판독 서비스를 이용하려면 로그인하세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="userId">아이디</Label>
                <Input
                  id="userId"
                  type="text"
                  placeholder="아이디를 입력하세요"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="비밀번호를 입력하세요"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    로그인 중...
                  </>
                ) : (
                  "로그인"
                )}
              </Button>

              {/* 아이디/비밀번호 찾기 */}
              <div className="flex items-center justify-center gap-4 text-sm">
                <Link 
                  href="/find-id" 
                  className="text-muted-foreground hover:text-foreground hover:underline"
                >
                  아이디 찾기
                </Link>
                <span className="text-muted-foreground">|</span>
                <Link 
                  href="/find-password" 
                  className="text-muted-foreground hover:text-foreground hover:underline"
                >
                  비밀번호 찾기
                </Link>
              </div>

              {/* 테스트 계정 안내 */}
              <div className="mt-6 rounded-lg bg-muted p-4">
                <p className="text-sm font-medium text-foreground">테스트 계정</p>
                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <p>민원인: citizen / 1234</p>
                  <p>담당자: admin / 1234</p>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>

      {/* 하단 저작권 */}
      <footer className="border-t bg-white py-4 text-center text-sm text-muted-foreground">
        © 2024 Korea Expressway Corporation. All Rights reserved.
      </footer>
    </div>
  );
}
