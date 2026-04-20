"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navigation = [
  { name: "민원인 서비스", href: "/citizen" },
  { name: "담당자 서비스", href: "/admin" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      {/* 상단 기관 식별 영역 - 디지털 정부서비스 가이드라인 준수 */}
      <div className="border-b bg-primary">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* 로고 및 기관명 */}
            <Link href="/" className="flex cursor-pointer items-center gap-3">
              <div className="flex h-10 items-center justify-center rounded bg-white px-2">
                <Image
                  src="/images/ex-logo.jpg"
                  alt="한국도로공사 로고"
                  width={80}
                  height={32}
                  className="h-8 w-auto object-contain"
                />
              </div>
              <div className="hidden sm:block">
                <p className="text-base font-bold text-white">한국도로공사</p>
                <p className="text-sm text-white/90">잔여지 매수 신청 시스템</p>
              </div>
            </Link>

            {/* 모바일 메뉴 버튼 */}
            <Button
              variant="ghost"
              size="icon"
              className="cursor-pointer text-white hover:bg-white/10 md:hidden"
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
      </div>
      
      {/* 메인 네비게이션 */}
      <div className="bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="hidden h-12 items-center gap-1 md:flex" role="navigation" aria-label="메인 메뉴">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex h-full cursor-pointer items-center border-b-2 px-4 text-sm font-medium transition-colors",
                  pathname.startsWith(item.href)
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:border-primary/50 hover:text-foreground"
                )}
                aria-current={pathname.startsWith(item.href) ? "page" : undefined}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* 모바일 네비게이션 */}
      {mobileMenuOpen && (
        <div className="border-t bg-background md:hidden">
          <nav className="flex flex-col p-2" role="navigation" aria-label="모바일 메뉴">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "cursor-pointer rounded-md px-4 py-3 text-sm font-medium transition-colors",
                  pathname.startsWith(item.href)
                    ? "bg-primary text-white"
                    : "text-foreground hover:bg-muted"
                )}
                aria-current={pathname.startsWith(item.href) ? "page" : undefined}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
