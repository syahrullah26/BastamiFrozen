"use client";

import React, { useSyncExternalStore } from "react";
import { Activity } from "lucide-react";

interface ExpenseRatioRevenueProps {
  expenseRatio: number;
}

const emptySubscribe = () => () => {};

export default function ExpenseRatioRevenue({
  expenseRatio,
}: ExpenseRatioRevenueProps) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const safeRatio = Math.min(Number(expenseRatio || 0), 100);
  const isHighDanger = expenseRatio > 35;

  return (
    <div className="lg:col-span-1 bg-white p-5 border border-zinc-200/60 rounded-2xl shadow-xs flex flex-col justify-between space-y-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-zinc-500" />
          <h4 className="font-bold text-sm tracking-tight text-zinc-900">
            Expense Burn Rate
          </h4>
        </div>
        <p className="text-xs text-zinc-400 leading-normal">
          How much revenue goes directly into supporting operations.
        </p>
      </div>

      <div className="space-y-2 py-1">
        <div className="flex justify-between items-end">
          <span className="text-xs font-semibold text-zinc-500">
            Operation Cost
          </span>
          <span
            className={`text-sm font-bold font-mono ${
              isHighDanger ? "text-rose-600" : "text-emerald-600"
            }`}
          >
            {isClient ? `${expenseRatio}%` : "0%"}{" "}
            <span className="text-[10px] font-medium text-zinc-400 font-sans">
              of income
            </span>
          </span>
        </div>

        <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isHighDanger ? "bg-rose-500" : "bg-emerald-500"
            }`}
            style={{ width: isClient ? `${safeRatio}%` : "0%" }}
          />
        </div>
      </div>

      <div
        className={`p-3 rounded-xl border text-[11px] font-medium leading-relaxed ${
          isHighDanger
            ? "bg-rose-50/50 border-rose-100 text-rose-700"
            : "bg-emerald-50/50 border-emerald-100 text-emerald-700"
        }`}
      >
        {isHighDanger
          ? "⚠️ Expenses are slightly high. Review your breakdown to protect your net profit margin."
          : "✨ Healthy ratio! Your operations are lean, keeping more pure profit in the business."}
      </div>
    </div>
  );
}
