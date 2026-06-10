"use client";

import React, { useSyncExternalStore } from "react";
import { PieChart } from "lucide-react";
import { formatRupiah } from "@/utils/helper";

interface TopExpenseItem {
  category: string;
  total: number | string;
}

interface RevenueSummaryData {
  total_expenses: number;
}

interface TopExpensesRevenueProps {
  topExpenses: TopExpenseItem[];
  summary: RevenueSummaryData;
}

const emptySubscribe = () => () => {};

export default function TopExpensesRevenue({
  topExpenses,
  summary,
}: TopExpensesRevenueProps) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const totalExpenses = Number(summary?.total_expenses || 0);

  return (
    <div className="space-y-4">
      <div className="space-y-1 px-1">
        <div className="flex items-center gap-2">
          <PieChart className="w-4 h-4 text-zinc-500" />
          <h4 className="font-bold text-sm tracking-tight text-zinc-900">
            Top Operational Cost Burners
          </h4>
        </div>
        <p className="text-xs text-zinc-400 leading-normal">
          Quick visibility into the top 3 items draining your daily operational
          budget.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {topExpenses.length > 0 ? (
          topExpenses.map((item, index) => {
            const pctOfExpenses =
              totalExpenses > 0
                ? Math.round((Number(item.total || 0) / totalExpenses) * 100)
                : 0;

            const categoryName =
              item.category === "pay_supplier"
                ? "Supplier Payment"
                : item.category === "salary"
                  ? "Employee Salary"
                  : item.category;

            return (
              <div
                key={index}
                className="p-4 border border-zinc-200/60 rounded-2xl bg-zinc-50/40 shadow-3xs flex flex-col justify-between space-y-3"
              >
                <div className="space-y-0.5">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-zinc-400">
                    Rank #{index + 1}
                  </span>
                  <p className="text-xs font-bold text-zinc-900 capitalize truncate">
                    {categoryName || "General Expense"}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-base font-bold text-zinc-950 font-mono tracking-tight">
                    {isClient ? formatRupiah(Number(item.total || 0)) : "Rp 0"}
                  </p>
                  <p className="text-[10px] font-medium text-zinc-400">
                    Takes up {isClient ? pctOfExpenses : 0}% of total expenses
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-1 md:col-span-3 text-center py-8 text-xs font-medium text-zinc-400 border border-dashed border-zinc-200 rounded-2xl bg-zinc-50/30">
            No cost burn distribution data available.
          </div>
        )}
      </div>
    </div>
  );
}
