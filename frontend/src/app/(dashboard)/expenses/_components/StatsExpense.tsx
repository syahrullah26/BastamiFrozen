"use client";

import React, { useSyncExternalStore } from "react";
import { Banknote, FileText, FolderArchive } from "lucide-react";
import StatsCard from "@/components/ui/card/StatsCard";
import { formatRupiah } from "@/utils/helper";
import { ExpenseStats } from "@/types/expense";

interface StatsExpenseProps {
  expenseStats: ExpenseStats;
}

const emptySubscribe = () => () => {};

export default function StatsExpense({ expenseStats }: StatsExpenseProps) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  return (
    <section className="space-y-4 rounded-2xl border border-zinc-200/60 bg-white p-5 shadow-3xs">
      <div className="flex flex-col gap-0.5 border-b border-zinc-100 pb-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900">
          Stats This Month
        </h2>
        <p className="text-[11px] font-medium text-zinc-400">
          Overview of your financial outlays and expenses recorded for the
          current period.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        <StatsCard
          title="Total Expenses"
          value={
            isClient
              ? formatRupiah(Number(expenseStats.total_monthly_expense || 0))
              : "Rp 0"
          }
          icon={<Banknote className="w-5 h-5 stroke-1.5" />}
          iconBgColor="bg-rose-100"
          iconColor="text-rose-900"
          textColor="text-rose-600"
        />

        <StatsCard
          title="Total Salary"
          value={
            isClient
              ? formatRupiah(
                  Number(expenseStats.total_monthly_salary_expense || 0),
                )
              : "Rp 0"
          }
          icon={<FileText className="w-5 h-5 stroke-1.5" />}
          iconBgColor="bg-zinc-100"
          iconColor="text-zinc-600"
          textColor="text-zinc-700"
        />
        <StatsCard
          title="Total Payment"
          value={
            isClient
              ? formatRupiah(
                  Number(expenseStats.total_monthly_supplier_expense || 0),
                )
              : "Rp 0"
          }
          icon={<FolderArchive className="w-5 h-5 stroke-1.5" />}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
          textColor="text-emerald-600"
        />
      </div>
    </section>
  );
}
