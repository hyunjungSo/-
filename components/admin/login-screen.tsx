"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, User } from "lucide-react";

interface LoginScreenProps {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // 로그인 처리 시뮬레이션
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 800);
  };

  return (
    <div className="flex h-screen w-screen">
      {/* 좌측 영역 - 브랜드 이미지 섹션 */}
      <div className="relative hidden w-1/2 lg:block">
        {/* 배경 이미지 */}
        <Image
          src="/images/login-bg.png"
          alt="한국도로공사 배경"
          fill
          className="object-cover"
          priority
        />
        
        {/* 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a365d]/90 via-[#1e4a5f]/85 to-[#2E8B57]/80" />
        
        {/* 콘텐츠 */}
        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          {/* 상단 로고 영역 */}
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                <span className="text-2xl font-bold text-white">EX</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-semibold text-white">한국도로공사</span>
                <span className="text-sm text-white/70">Korea Expressway Corporation</span>
              </div>
            </div>
          </div>
          
          {/* 중앙 타이틀 */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight text-white">
                토지정보 토지보상
              </h1>
              <h2 className="text-3xl font-semibold text-white/90">
                어드민 시스템
              </h2>
            </div>
            <div className="h-1 w-24 rounded-full bg-[#2E8B57]" />
            <p className="max-w-md text-lg leading-relaxed text-white/80">
              신뢰와 안전을 바탕으로<br />
              토지보상 업무를 디지털로 혁신합니다.
            </p>
          </div>
          
          {/* 하단 푸터 */}
          <div className="text-sm text-white/50">
            &copy; 2026 Korea Expressway Corporation. All rights reserved.
          </div>
        </div>
      </div>

      {/* 우측 영역 - 로그인 폼 섹션 */}
      <div className="flex w-full flex-col items-center justify-center bg-white px-8 lg:w-1/2">
        <div className="w-full max-w-md space-y-8">
          {/* 상단 로고 및 타이틀 */}
          <div className="space-y-2 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-[#1a365d] to-[#2E8B57]">
              <span className="text-2xl font-bold text-white">EX</span>
            </div>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">
              소속 직원 로그인
            </h1>
            <p className="text-sm text-gray-500">
              사번과 비밀번호를 입력하여 로그인하세요
            </p>
          </div>

          {/* 로그인 폼 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 아이디 입력 필드 */}
            <div className="space-y-2">
              <Label htmlFor="employeeId" className="text-sm font-medium text-gray-700">
                사번 / 아이디
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  id="employeeId"
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="사번 또는 아이디를 입력하세요"
                  className="h-12 pl-10 text-base"
                  required
                />
              </div>
            </div>

            {/* 비밀번호 입력 필드 */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                비밀번호
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  className="h-12 pl-10 text-base"
                  required
                />
              </div>
            </div>

            {/* 로그인 버튼 */}
            <Button
              type="submit"
              disabled={isLoading}
              className="h-12 w-full bg-[#2E8B57] text-base font-semibold text-white hover:bg-[#256b45] disabled:opacity-70"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>로그인 중...</span>
                </div>
              ) : (
                "로그인"
              )}
            </Button>
          </form>

          {/* 하단 안내 */}
          <div className="text-center">
            <p className="text-sm text-gray-500">
              로그인에 문제가 있으신가요?{" "}
              <span className="cursor-pointer font-medium text-[#2E8B57] hover:underline">
                관리자에게 문의
              </span>
            </p>
          </div>
        </div>

        {/* 모바일에서만 보이는 푸터 */}
        <div className="mt-8 text-center text-sm text-gray-400 lg:hidden">
          &copy; 2026 한국도로공사
        </div>
      </div>
    </div>
  );
}
