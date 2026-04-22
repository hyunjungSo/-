"use client";

import Link from "next/link";
import Image from "next/image";
import { ExternalLink } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t bg-[#f6f6f6]">
      {/* 상단 정보 영역 */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          {/* 좌측: 로고 및 연락처 */}
          <div className="space-y-3">
            <Image
              src="/images/logo-lc.png"
              alt="한국도로공사 토지정보"
              width={160}
              height={32}
              className="h-8 w-auto"
            />
            <p className="text-sm text-gray-600">
              (39660) 경상북도 김천시 혁신8로 77 (율곡동 941) 한국도로공사
            </p>
            <p className="text-sm font-medium text-gray-900">
              대표전화 1588-2504
            </p>
          </div>

          {/* 우측: 찾아오시는 길 링크 */}
          <div className="lg:text-right">
            <Link
              href="https://www.ex.co.kr/site/com/pageProcess.do?url=/kor/company/location"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-base font-medium text-gray-700 hover:text-primary"
            >
              찾아오시는 길
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* 링크 및 저작권 */}
        <div className="mt-6 flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
          <nav className="flex flex-wrap items-center gap-4 text-sm" aria-label="푸터 링크">
            <Link
              href="/privacy"
              className="font-semibold text-primary hover:underline"
            >
              개인정보처리방침
            </Link>
            <Link
              href="/guide"
              className="text-gray-600 hover:text-gray-900"
            >
              이용안내
            </Link>
            <Link
              href="/terms"
              className="text-gray-600 hover:text-gray-900"
            >
              이용약관
            </Link>
            <Link
              href="/email-policy"
              className="text-gray-600 hover:text-gray-900"
            >
              이메일무단수집거부
            </Link>
          </nav>
          <p className="text-sm text-gray-500">
            © {currentYear} Korea Expressway Corporation. All Rights reserved.
          </p>
        </div>
      </div>

    </footer>
  );
}
