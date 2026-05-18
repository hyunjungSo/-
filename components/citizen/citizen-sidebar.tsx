"use client";

import { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronDown, ChevronUp, User, MapPin, FileText, ClipboardList, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  children?: {
    id: string;
    label: string;
    href: string;
  }[];
}

const menuItems: MenuItem[] = [
  {
    id: "residual-land",
    label: "잔여지 매수",
    icon: <MapPin className="h-4 w-4" />,
    children: [
      { id: "new", label: "신규 신청", href: "/citizen?tab=new" },
      { id: "status", label: "신청 현황 조회", href: "/citizen?tab=status" },
      { id: "myparcel", label: "내 잔여지 조회", href: "/citizen?tab=myparcel" },
    ],
  },
  {
    id: "member",
    label: "회원정보 관리",
    icon: <User className="h-4 w-4" />,
    children: [
      { id: "profile", label: "내 정보 수정", href: "/citizen/profile" },
    ],
  },
];

interface CitizenSidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function CitizenSidebar({ activeTab, onTabChange }: CitizenSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "new";
  
  // 기본적으로 잔여지 매수 메뉴 열어두기
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set(["residual-land"]));

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => {
      const next = new Set(prev);
      if (next.has(menuId)) {
        next.delete(menuId);
      } else {
        next.add(menuId);
      }
      return next;
    });
  };

  const isActive = (href: string) => {
    if (href.includes("?tab=")) {
      const tabValue = href.split("tab=")[1];
      return currentTab === tabValue;
    }
    return pathname === href;
  };

  const handleMenuClick = (menuId: string, href?: string) => {
    if (href && onTabChange) {
      const tabMatch = href.match(/tab=(\w+)/);
      if (tabMatch) {
        onTabChange(tabMatch[1]);
      }
    }
  };

  return (
    <aside className="w-[280px] flex-shrink-0">
      {/* 헤더 */}
      <div className="bg-[#0B6138] text-white p-6 rounded-t-lg">
        <h2 className="text-xl font-bold">마이페이지</h2>
      </div>
      
      {/* 메뉴 */}
      <nav className="border border-t-0 rounded-b-lg bg-white">
        {menuItems.map((menu) => (
          <div key={menu.id} className="border-b last:border-b-0">
            {/* 상위 메뉴 */}
            <button
              onClick={() => toggleMenu(menu.id)}
              className={cn(
                "w-full flex items-center justify-between px-5 py-4 text-left font-medium transition-colors",
                "hover:bg-gray-50",
                expandedMenus.has(menu.id) ? "bg-[#0B6138] text-white hover:bg-[#0B6138]/90" : "text-gray-900"
              )}
            >
              <span className="flex items-center gap-2">
                {menu.icon}
                {menu.label}
              </span>
              {menu.children && (
                expandedMenus.has(menu.id) 
                  ? <ChevronUp className="h-4 w-4" />
                  : <ChevronDown className="h-4 w-4" />
              )}
            </button>
            
            {/* 하위 메뉴 */}
            {menu.children && expandedMenus.has(menu.id) && (
              <div className="bg-gray-50">
                {menu.children.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => handleMenuClick(child.id, child.href)}
                    className={cn(
                      "w-full text-left px-5 py-3 pl-10 text-sm transition-colors border-l-4",
                      isActive(child.href)
                        ? "border-l-[#0B6138] bg-white text-[#0B6138] font-medium"
                        : "border-l-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    - {child.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
