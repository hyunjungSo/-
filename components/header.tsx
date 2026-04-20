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
    <header className="sticky top-0 z-50 w-full shadow-md">
      {/* Top bar */}
      <div className="bg-primary">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex cursor-pointer items-center gap-3">
              <div className="flex h-10 items-center justify-center rounded bg-white px-2 py-1">
                <Image
                  src="/images/ex-logo.jpg"
                  alt="한국도로공사 로고"
                  width={80}
                  height={32}
                  className="h-8 w-auto object-contain"
                />
              </div>
              <div>
                <p className="text-base font-bold text-primary-foreground">
                  한국도로공사
                </p>
                <p className="text-xs text-primary-foreground/80">용지정보시스템</p>
              </div>
            </Link>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="cursor-pointer text-primary-foreground hover:bg-white/20 md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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
      
      {/* Navigation bar */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="hidden h-12 items-center gap-0 md:flex">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex h-full cursor-pointer items-center border-b-2 px-5 text-sm font-medium transition-colors",
                  pathname.startsWith(item.href)
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-transparent text-foreground hover:border-primary/50 hover:bg-muted"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="border-b border-border bg-card md:hidden">
          <nav className="flex flex-col p-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "cursor-pointer rounded px-4 py-3 text-sm font-medium transition-colors",
                  pathname.startsWith(item.href)
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                )}
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
