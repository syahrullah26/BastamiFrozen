"use client";

import React from "react";
import { TYPEATTENDANCE_TABS_CONFIG } from "@/constants/Filter/TypeAttendanceFilterConfig";

interface ActiveTabAttendanceProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  TYPEATTENDANCE_TABS_CONFIG: typeof TYPEATTENDANCE_TABS_CONFIG;
}

export default function ActiveTabAttendance({
  activeTab,
  setActiveTab,
  TYPEATTENDANCE_TABS_CONFIG,
}: ActiveTabAttendanceProps) {
  const handleTabChange = (status: string) => setActiveTab(status);
  return (
    <>
      <div className="flex md:flex-row flex-col gap-4 md:justify-between justify-center items-center md:items-start">
        <span className="text-xl font-bold text-brand-dark md:text-2xl mt-3.5 ml-3.5">
          Your Attendance List (
          {activeTab === "monthly" ? "This Month" : "History"})
        </span>
        <div className="flex items-center gap-1 bg-zinc-100 p-1.5 rounded-xl w-full lg:w-fit overflow-x-auto no-scrollbar">
          {TYPEATTENDANCE_TABS_CONFIG.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`flex-1 lg:flex-initial text-center px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-white text-brand-dark shadow-xs border border-zinc-200/50"
                    : "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200/30"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
