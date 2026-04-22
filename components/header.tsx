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
  { name: "민원인 서비스", href: "/citizen" },
  { name: "담당자 서비스", href: "/admin" },
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
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      {/* KRDS: 헤더 영역 - 기관 식별 및 네비게이션 */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between lg:h-[72px]">
          {/* 로고 */}
          <Link href="/" className="flex cursor-pointer items-center py-2">
            <Image
              src="/images/logo-lc.png"
              alt="한국도로공사 토지정보 토지보상"
              width={180}
              height={36}
              className="h-8 w-auto object-contain"
              priority
            />
          </Link>

          {/* 데스크톱 네비게이션 - KRDS 메인 메뉴 스타일 */}
          <div className="hidden items-center gap-6 md:flex">
            <nav className="flex items-center gap-1" role="navigation" aria-label="메인 메뉴">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "relative cursor-pointer px-4 py-2.5 text-base font-medium transition-colors",
                    pathname.startsWith(item.href)
                      ? "text-primary after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-primary"
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
              <div className="flex items-center gap-4 border-l border-border pl-6">
                <div className="flex items-center gap-2 text-base text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span className="font-medium text-foreground">{user.name}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="h-9 gap-1.5 text-sm"
                >
                  <LogOut className="h-4 w-4" />
                  로그아웃
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
                <div className="flex items-center gap-2 px-4 py-2 text-base text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{user.name}</span>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-2 rounded-md px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-100"
                >
                  <LogOut className="h-4 w-4" />
                  로그아웃
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
