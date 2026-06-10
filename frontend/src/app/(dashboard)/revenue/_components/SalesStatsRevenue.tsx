"use client";

import React, { useSyncExternalStore } from "react";
import { Calendar, ShoppingBag, DollarSign } from "lucide-react";
import { formatRupiah } from "@/utils/helper";

interface SalesSummaryData {
  total_orders: number | string;
  average_order_value: number | string;
}

interface SalesStatsRevenueProps {
  summary: SalesSummaryData;
}

const emptySubscribe = () => () => {};

export default function SalesStatsRevenue({ summary }: SalesStatsRevenueProps) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <Calendar className="w-4 h-4 text-zinc-400" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Sales Activity Summary
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
        <div className="bg-white p-5 border border-zinc-200/60 rounded-2xl flex items-center justify-between shadow-xs hover:border-zinc-300 transition-all duration-300 group">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Total Sales
            </p>
            <p className="text-xl md:text-2xl font-bold text-zinc-950 font-mono tracking-tight">
              {summary?.total_orders || 0}{" "}
              <span className="text-xs font-medium text-zinc-400 ml-1 font-sans tracking-normal">
                Transactions in This Period
              </span>
            </p>
          </div>
          <div className="p-3 bg-zinc-50 text-zinc-500 border border-zinc-100 rounded-xl shrink-0 group-hover:bg-zinc-100 transition-colors">
            <ShoppingBag className="w-5 h-5 stroke-1.5" />
          </div>
        </div>

        <div className="bg-white p-5 border border-zinc-200/60 rounded-2xl flex items-center justify-between shadow-xs hover:border-zinc-300 transition-all duration-300 group">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Average Order Value (AOV)
            </p>
            <p className="text-xl md:text-2xl font-bold text-zinc-950 font-mono tracking-tight">
              {isClient
                ? formatRupiah(Number(summary?.average_order_value || 0))
                : "Rp 0"}
            </p>
          </div>
          <div className="p-3 bg-zinc-50 text-zinc-500 border border-zinc-100 rounded-xl shrink-0 group-hover:bg-zinc-100 transition-colors">
            <DollarSign className="w-5 h-5 stroke-1.5" />
          </div>
        </div>
      </div>
    </div>
  );
}
