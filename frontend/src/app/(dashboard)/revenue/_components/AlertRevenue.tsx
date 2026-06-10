"use client";

import React, { useSyncExternalStore } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { formatRupiah } from "@/utils/helper";

interface RevenueSummaryData {
  is_profit: boolean;
  net_profit_loss: number | string;
  profit_margin_pct: number | string;
}

interface AlertRevenueProps {
  summary: RevenueSummaryData;
}

const emptySubscribe = () => () => {};

export default function AlertRevenue({ summary }: AlertRevenueProps) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const isProfit = summary.is_profit;

  return (
    <div
      className={`p-6 md:p-8 rounded-2xl border transition-all duration-300 shadow-3xs ${
        isProfit
          ? "bg-emerald-50/50 border-emerald-200/60 text-emerald-950"
          : "bg-rose-50/50 border-rose-200/60 text-rose-950"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Final Net Earnings (Net Profit)
          </p>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 font-mono">
              {isClient
                ? formatRupiah(Number(summary.net_profit_loss || 0))
                : "Rp 0"}
            </h2>

            <div
              className={`p-1.5 rounded-lg border ${
                isProfit
                  ? "bg-emerald-100 border-emerald-200/50 text-emerald-700"
                  : "bg-rose-100 border-rose-200/50 text-rose-700"
              }`}
            >
              {isProfit ? (
                <TrendingUp className="w-4 h-4 stroke-" />
              ) : (
                <TrendingDown className="w-4 h-4 stroke-" />
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start sm:items-end gap-1.5">
          <span
            className={`px-3 py-1 rounded-xl text-[11px] font-bold tracking-wide border uppercase ${
              isProfit
                ? "bg-white border-emerald-200 text-emerald-700 shadow-2xs"
                : "bg-white border-rose-200 text-rose-700 shadow-2xs"
            }`}
          >
            Net Margin: {summary.profit_margin_pct}% Of Revenue
          </span>
          <p className="text-[10px] text-zinc-400 font-medium">
            Pure earnings you can take home or add to savings
          </p>
        </div>
      </div>
    </div>
  );
}
