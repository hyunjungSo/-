"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Menu, X, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

const navigation = [
  { name: "잔여지 매수 신청", href: "/citizen" },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      {/* 상단 유틸리티 바 */}
      <div className="border-b border-gray-100 bg-gray-50">
        <div className="mx-auto flex h-8 max-w-7xl items-center justify-end gap-4 px-4 text-xs text-gray-600 sm:px-6 lg:px-8">
          <Link href="https://www.ex.co.kr" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
            한국도로공사
          </Link>
          <span className="text-gray-300">|</span>
          <Link href="https://exland.ex.co.kr" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
            토지보상시스템
          </Link>
        </div>
      </div>
      
      {/* 메인 헤더 */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* 로고 */}
          <Link href="/" className="flex cursor-pointer items-center gap-3 py-2">
            <Image
              src="/images/logo-lc.png"
              alt="한국도로공사 토지정보 토지보상"
              width={180}
              height={36}
              className="h-9 w-auto object-contain"
              priority
            />
            <span className="hidden border-l border-gray-300 pl-3 text-lg font-semibold text-foreground sm:block">
              잔여지 매수
            </span>
          </Link>

          {/* 데스크톱 네비게이션 */}
          <div className="hidden items-center gap-6 md:flex">
            <nav className="flex items-center" role="navigation" aria-label="메인 메뉴">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "relative cursor-pointer px-5 py-2 text-base font-medium transition-colors",
                    pathname.startsWith(item.href)
                      ? "text-primary"
                      : "text-foreground hover:text-primary"
                  )}
                  aria-current={pathname.startsWith(item.href) ? "page" : undefined}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* 사용자 정보 및 로그아웃 */}
            {user && (
              <div className="flex items-center gap-3 border-l border-gray-200 pl-5">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium text-foreground">{user.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="h-8 gap-1.5 text-sm text-gray-600 hover:text-gray-900"
                >
                  <LogOut className="h-4 w-4" />
                  <span>로그아웃</span>
                </Button>
              </div>
            )}
          </div>

          {/* 모바일 메뉴 버튼 */}
          <Button
            variant="ghost"
            size="icon"
            className="cursor-pointer text-gray-700 hover:bg-gray-100 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* 모바일 네비게이션 */}
      {mobileMenuOpen && (
        <div className="border-t bg-white md:hidden">
          <nav className="flex flex-col p-2" role="navigation" aria-label="모바일 메뉴">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "cursor-pointer rounded-md px-4 py-3 text-base font-medium transition-colors",
                  pathname.startsWith(item.href)
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                )}
                aria-current={pathname.startsWith(item.href) ? "page" : undefined}
              >
                {item.name}
              </Link>
            ))}
            {user && (
              <>
                <div className="my-2 border-t" />
                <div className="flex items-center gap-2.5 px-4 py-2 text-base text-gray-600">
                  <User className="h-4 w-4 shrink-0" />
                  <span>{user.name}</span>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-2.5 rounded-md px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-100"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  <span>로그아웃</span>
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
