"use client";

import React from "react";
import { Calendar, Search } from "lucide-react";

interface FilterAttendanceProps {
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
  search: string;
  setSearch: (value: string) => void;
  placeholder?: string;
}

export default function FilterAttendance({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  search,
  setSearch,
  placeholder = "Search Employee Name...",
}: FilterAttendanceProps) {
  return (
    <>
      <div className="bg-white rounded-xl  border border-zinc-200 shadow-sm hover:shadow-md overflow-hidden">
        <div className="p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2 bg-zinc-50/50 border border-zinc-200 rounded-xl px-3 py-1.5 shadow-2xs focus-within:bg-white focus-within:border-brand-dark focus-within:ring-4 focus-within:ring-brand-dark/5 transition-all duration-200 flex-1 sm:flex-initial">
            <div className="flex items-center gap-2 text-zinc-400 shrink-0">
              <Calendar className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Period:
              </span>
            </div>

            <div className="flex items-center gap-1 w-full">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-xs text-zinc-700 font-medium focus:outline-none cursor-pointer w-full scheme-light"
              />

              <span className="text-zinc-400 text-xs px-0.5">-</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-xs text-zinc-700 font-medium focus:outline-none cursor-pointer w-full scheme-light"
              />

              {(startDate || endDate) && (
                <button
                  type="button"
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                  }}
                  className="text-[10px] font-bold text-rose-500 hover:text-rose-600 ml-1 px-1.5 py-0.5 rounded-md hover:bg-rose-50 cursor-pointer transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          <div className="group w-full sm:max-w-xs flex items-center bg-ghost-white border border-brand-dark/50 rounded-xl px-3 focus-within:border-brand-dark transition-all">
            <Search className="w-4 h-4 text-zinc-400 group-focus-within:text-brand-dark transition-colors" />
            <input
              type="text"
              placeholder={placeholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-2 pr-2 py-2.5 bg-transparent text-xs focus:outline-none transition-all"
            />
          </div>
        </div>
      </div>
    </>
  );
}
