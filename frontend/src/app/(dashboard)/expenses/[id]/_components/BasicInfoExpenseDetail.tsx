"use client";

import React, { useSyncExternalStore } from "react";
import { Calendar, FileText } from "lucide-react";
import { formatDate, formatRupiah } from "@/utils/helper";
import { Expense } from "@/types/expense";

interface BasicInfoExpenseDetailProps {
  expense: Expense;
}

const emptySubscribe = () => () => {};

export default function BasicInfoExpenseDetail({
  expense,
}: BasicInfoExpenseDetailProps) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  return (
    <div className="md:col-span-7 space-y-5">
      <div className="bg-white border border-zinc-200/60 rounded-2xl shadow-3xs p-5 space-y-4">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-100 pb-2">
          General Transaction Info
        </h3>

        <div className="bg-zinc-50/60 border border-zinc-100 p-4 rounded-xl flex flex-col justify-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
            Amount Spent
          </span>
          <span className="text-xl md:text-2xl font-bold text-zinc-900 font-mono tracking-tight">
            {isClient ? formatRupiah(Number(expense.amount || 0)) : "Rp 0"}
          </span>
        </div>

        <div className="space-y-3.5 text-xs">
          <div className="flex justify-between items-center py-0.5">
            <div className="flex items-center gap-2 text-zinc-400">
              <Calendar className="w-4 h-4 text-zinc-400" />
              <span>Transaction Date</span>
            </div>
            <span className="font-semibold text-zinc-700 font-mono">
              {isClient ? formatDate(expense.expense_date) : "—"}
            </span>
          </div>

          <div className="flex flex-col gap-1.5 border-t border-zinc-100 pt-3.5">
            <div className="flex items-center gap-2 text-zinc-400">
              <FileText className="w-4 h-4 text-zinc-400" />
              <span>Notes / Description</span>
            </div>
            <p className="bg-zinc-50/30 border border-zinc-100/70 rounded-xl p-3 text-zinc-600 font-medium leading-relaxed italic text-[11px]">
              {expense.notes || "No extra notes attached to this expense."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
