"use client";

import React, { useSyncExternalStore } from "react";
import { ShoppingBag, User, Briefcase } from "lucide-react";
import { formatDate, formatRupiah } from "@/utils/helper";
import { Expense } from "@/types/expense";

interface AmountExpenseDetailProps {
  expense: Expense;
}

const emptySubscribe = () => () => {};

export default function AmountExpenseDetail({
  expense,
}: AmountExpenseDetailProps) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  return (
    <div className="md:col-span-5 space-y-5">
      {expense.type === "pay_supplier" && expense.supplier_payment_id && (
        <div className="bg-white border border-zinc-200/60 rounded-2xl shadow-3xs p-5 space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg border border-amber-100">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                Supplier Payment
              </h3>
              <p className="text-[10px] text-zinc-400 font-mono">
                Linked ID: #{expense.supplier_payment?.id || "—"}
              </p>
            </div>
          </div>

          <div className="space-y-3 text-[11px] font-medium">
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Paid Amount</span>
              <span className="font-mono font-bold text-zinc-900">
                {isClient
                  ? formatRupiah(Number(expense.supplier_payment?.amount || 0))
                  : "—"}
              </span>
            </div>

            <div className="flex justify-between items-center border-t border-zinc-100 pt-2.5">
              <span className="text-zinc-400">Payment Date</span>
              <span className="font-mono text-zinc-600">
                {isClient && expense.supplier_payment?.payment_date
                  ? formatDate(expense.supplier_payment.payment_date)
                  : "—"}
              </span>
            </div>

            <div className="flex justify-between items-center border-t border-zinc-100 pt-2.5">
              <span className="text-zinc-400">Created Log</span>
              <span className="font-mono text-zinc-400 text-[10px]">
                {isClient && expense.supplier_payment?.created_at
                  ? formatDate(expense.supplier_payment.created_at)
                  : "—"}
              </span>
            </div>
          </div>
        </div>
      )}

      {expense.type === "salary" && expense.attendance_id && (
        <div className="bg-white border border-zinc-200/60 rounded-2xl shadow-3xs p-5 space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                Employee Attendance
              </h3>
              <p className="text-[10px] text-zinc-400 font-mono">
                Linked ID: #{expense.attendance?.id || "—"}
              </p>
            </div>
          </div>

          <div className="space-y-3 text-[11px] font-medium">
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Employee Name</span>
              <span className="font-bold text-zinc-900">
                {expense.attendance?.employee?.name || "Staff Employee"}
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-zinc-100 pt-2.5">
              <span className="text-zinc-400">Salary</span>
              <span className="font-mono text-zinc-600">
                {isClient
                  ? formatRupiah(
                      Number(expense.attendance?.employee?.salary || 0),
                    )
                  : "—"}
              </span>
            </div>
          </div>
        </div>
      )}

      {expense.type !== "pay_supplier" && expense.type !== "salary" && (
        <div className="bg-zinc-50/50 border border-dashed border-zinc-200 rounded-2xl p-6 text-center flex flex-col items-center justify-center gap-2 h-full min-h-[160px]">
          <Briefcase className="w-5 h-5 text-zinc-300 stroke-1.5" />
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-zinc-500">
              Standalone Expense
            </p>
            <p className="text-[10px] text-zinc-400 max-w-[180px] mx-auto leading-normal">
              This transaction is categorized as direct business overhead cost.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
