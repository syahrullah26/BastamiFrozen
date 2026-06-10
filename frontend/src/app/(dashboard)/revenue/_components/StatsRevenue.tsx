"use client";

import React, { useSyncExternalStore } from "react";
import {
  Layers,
  DollarSign,
  ShoppingBag,
  Percent,
  Receipt,
} from "lucide-react";
import { formatRupiah } from "@/utils/helper";

interface RevenueSummaryData {
  gross_revenue: number | string;
  total_cogs: number | string;
  gross_profit: number | string;
  total_expenses: number | string;
}

interface StatsRevenueProps {
  summary: RevenueSummaryData;
}

const emptySubscribe = () => () => {};

export default function StatsRevenue({ summary }: StatsRevenueProps) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <Layers className="w-4 h-4 text-zinc-400" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Key Financial Metrics
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <div className="bg-white p-5 border border-zinc-200/60 rounded-2xl shadow-xs hover:shadow-md hover:border-zinc-300 transition-all duration-300 flex flex-col justify-between min-h-[140px] group">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider truncate">
                Gross Revenue (Turnover)
              </p>
              <div className="p-2 bg-zinc-50 text-zinc-600 rounded-xl border border-zinc-100 group-hover:bg-zinc-100 transition-colors shrink-0">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl md:text-2xl font-bold tracking-tight text-zinc-950 font-mono break-all">
              {isClient
                ? formatRupiah(Number(summary.gross_revenue || 0))
                : "Rp 0"}
            </p>
          </div>
          <div className="pt-2 border-t border-dashed border-zinc-100 mt-2">
            <p className="text-[10px] font-medium text-zinc-400 leading-normal">
              Gross amount. Total customer spending before deductions.
            </p>
          </div>
        </div>

        <div className="bg-white p-5 border border-zinc-200/60 rounded-2xl shadow-xs hover:shadow-md hover:border-amber-200 hover:bg-amber-50/5 transition-all duration-300 flex flex-col justify-between min-h-[140px] group">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider truncate">
                Product Capital (HPP)
              </p>
              <div className="p-2 bg-amber-50/60 text-amber-600 rounded-xl border border-amber-100/50 group-hover:bg-amber-100/60 transition-colors shrink-0">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl md:text-2xl font-bold tracking-tight text-amber-900 font-mono break-all">
              {isClient
                ? formatRupiah(Number(summary.total_cogs || 0))
                : "Rp 0"}
            </p>
          </div>
          <div className="pt-2 border-t border-dashed border-zinc-100 mt-2">
            <p className="text-[10px] font-medium text-zinc-400 leading-normal">
              Initial base cost to purchase or manufacture sold goods.
            </p>
          </div>
        </div>

        <div className="bg-white p-5 border border-zinc-200/60 rounded-2xl shadow-xs hover:shadow-md hover:border-emerald-200 hover:bg-emerald-50/5 transition-all duration-300 flex flex-col justify-between min-h-[140px] group">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider truncate">
                Remaining Revenue (Gross Profit)
              </p>
              <div className="p-2 bg-emerald-50/60 text-emerald-600 rounded-xl border border-emerald-100/50 group-hover:bg-emerald-100/60 transition-colors shrink-0">
                <Percent className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl md:text-2xl font-bold tracking-tight text-emerald-950 font-mono break-all">
              {isClient
                ? formatRupiah(Number(summary.gross_profit || 0))
                : "Rp 0"}
            </p>
          </div>
          <div className="pt-2 border-t border-dashed border-zinc-100 mt-2">
            <p className="text-[10px] font-medium text-zinc-400 leading-normal">
              Net sales output directly after deducting product capital.
            </p>
          </div>
        </div>

        <div className="bg-white p-5 border border-zinc-200/60 rounded-2xl shadow-xs hover:shadow-md hover:border-rose-200 hover:bg-rose-50/5 transition-all duration-300 flex flex-col justify-between min-h-[140px] group">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider truncate">
                Operating Expenses
              </p>
              <div className="p-2 bg-rose-50/60 text-rose-600 rounded-xl border border-rose-100/50 group-hover:bg-rose-100/60 transition-colors shrink-0">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl md:text-2xl font-bold tracking-tight text-rose-900 font-mono break-all">
              {isClient
                ? formatRupiah(Number(summary.total_expenses || 0))
                : "Rp 0"}
            </p>
          </div>
          <div className="pt-2 border-t border-dashed border-zinc-100 mt-2">
            <p className="text-[10px] font-medium text-zinc-400 leading-normal">
              Non-product costs (Salaries, ads, bills, wifi, etc).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
