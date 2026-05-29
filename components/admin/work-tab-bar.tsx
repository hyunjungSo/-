"use client";

import { cn } from "@/lib/utils";
import { X, LayoutDashboard, FileText, MapPin } from "lucide-react";

export type WorkTabType =
  | "applications"
  | "parcel-management"
  | "application-detail"
  | "parcel-detail";

export interface WorkTab {
  id: string;
  type: WorkTabType;
  label: string;
  refId?: string;
  closable: boolean;
}

interface WorkTabBarProps {
  tabs: WorkTab[];
  activeTabId: string;
  onTabSelect: (id: string) => void;
  onTabClose: (id: string) => void;
}

function TabIcon({ type }: { type: WorkTabType }) {
  if (type === "applications") return <LayoutDashboard className="h-4 w-4 shrink-0" />;
  if (type === "parcel-management") return <LayoutDashboard className="h-4 w-4 shrink-0" />;
  if (type === "application-detail") return <FileText className="h-4 w-4 shrink-0" />;
  return <MapPin className="h-4 w-4 shrink-0" />;
}

export function WorkTabBar({ tabs, activeTabId, onTabSelect, onTabClose }: WorkTabBarProps) {
  return (
    <div className="flex items-end gap-1 overflow-x-auto border-b border-gray-200">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        return (
          <div
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            tabIndex={0}
            onClick={() => onTabSelect(tab.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onTabSelect(tab.id);
              }
            }}
            className={cn(
              "group -mb-px flex cursor-pointer select-none items-center gap-2 whitespace-nowrap rounded-t-lg border px-4 py-2.5 text-sm transition-colors",
              isActive
                ? "border-gray-200 border-b-white border-t-2 border-t-[#00875a] bg-white font-semibold text-[#00875a]"
                : "border-transparent bg-transparent font-medium text-gray-500 hover:bg-gray-100/70 hover:text-gray-800"
            )}
          >
            <TabIcon type={tab.type} />
            <span>{tab.label}</span>
            {tab.closable && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onTabClose(tab.id);
                }}
                className="flex items-center justify-center rounded-full p-0.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700"
                aria-label={`${tab.label} 탭 닫기`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
