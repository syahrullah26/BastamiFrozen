"use client";

import React from "react";
import { Scale } from "lucide-react";
import { FloatingInput } from "@/components/ui/input/FloatingInput"; // Sesuaikan path FloatingInput Anda

type FilterType = "daily" | "weekly" | "monthly" | string;

interface RevenueSummary {
  period_label?: string | null;
}

interface RevenueReportData {
  summary?: RevenueSummary | null;
}

interface HeaderRevenueProps {
  report: RevenueReportData | null;
  filterType: FilterType;
  setFilterType: (type: FilterType) => void;
  filterDate: string;
  setFilterDate: (date: string) => void;
}

export default function HeaderRevenue({
  report,
  filterType,
  setFilterType,
  filterDate,
  setFilterDate,
}: HeaderRevenueProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-6 bg-white border border-zinc-200/60 rounded-2xl shadow-xs">
      <div className="flex items-start gap-3">
        <div className="p-2.5 bg-zinc-100 rounded-xl text-zinc-900 shrink-0 mt-0.5 border border-zinc-200/40">
          <Scale className="w-5 h-5 stroke-1.5" />
        </div>
        <div className="space-y-0.5">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-950">
            Profit & Loss Statement
          </h1>
          <p className="text-xs md:text-sm text-zinc-500 font-medium">
            Report Period:{" "}
            <span className="font-semibold text-zinc-900 font-mono">
              {report?.summary?.period_label || "Calculating data..."}
            </span>
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex rounded-xl border border-zinc-200/60 bg-zinc-50 p-1 shadow-inner">
          {(["daily", "weekly", "monthly"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFilterType(type)}
              className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                filterType === type
                  ? "bg-white shadow-xs border border-zinc-200/40 text-zinc-950"
                  : "text-zinc-400 hover:text-zinc-600"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-48 text-zinc-950">
          <FloatingInput
            type="date"
            label="Select Date"
            value={filterDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFilterDate(e.target.value)
            }
          />
        </div>
      </div>
    </div>
  );
}
