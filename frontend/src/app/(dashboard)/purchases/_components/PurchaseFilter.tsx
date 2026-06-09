"use client";

import React from "react";
import { Calendar, Search } from "lucide-react";

interface PurchaseFilterProps {
  search: string;
  setSearch: (value: string) => void;
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
  placeholder?: string;
}

export default function PurchaseFilter({
  search,
  setSearch,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  placeholder = "Search purchases...",
}: PurchaseFilterProps) {
  const handleResetPeriod = () => {
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] overflow-hidden">
      <div className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2 bg-zinc-50/50 border border-zinc-200 rounded-xl px-3 py-1.5 shadow-2xs focus-within:bg-white focus-within:border-zinc-950 focus-within:ring-4 focus-within:ring-zinc-950/5 transition-all duration-200 flex-1 md:flex-initial">
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
                onClick={handleResetPeriod}
                className="text-[10px] font-bold text-rose-500 hover:text-rose-600 ml-1 px-1.5 py-0.5 rounded-md hover:bg-rose-50 cursor-pointer transition-colors whitespace-nowrap"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        <div className="w-full md:max-w-xs flex-1 md:flex-initial">
          <div className="group relative flex items-center bg-zinc-50/50 hover:bg-white border border-zinc-200 rounded-xl px-3.5 shadow-2xs focus-within:bg-white focus-within:border-zinc-950 focus-within:ring-4 focus-within:ring-zinc-950/5 transition-all duration-200 w-full">
            <Search className="w-4 h-4 text-zinc-400 group-focus-within:text-zinc-950 transition-colors shrink-0" />
            <input
              type="text"
              placeholder={placeholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-2.5 pr-1 py-2.5 bg-transparent text-xs text-zinc-800 placeholder-zinc-400 font-medium focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
