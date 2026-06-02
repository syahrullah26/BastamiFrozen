/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect, useSyncExternalStore } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { ExpenseService } from "@/services/expenseService";
import { Expense } from "@/types/expense";
import { formatRupiah, formatDate } from "@/utils/helper";

import {
  ArrowLeft,
  FilePen,
  Calendar,
  DollarSign,
  User,
  ShoppingBag,
  FileText,
  Clock,
  Briefcase,
} from "lucide-react";
import ButtonNav from "@/components/ui/button/ButtonNav";

const emptySubscribe = () => () => {};

export default function ExpenseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);

  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!id || id === "undefined") return;
    const loadExpense = async () => {
      try {
        setLoading(true);
        const data = await ExpenseService.getExpense(id);
        setExpense(data);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          return;
        }
        toast.error("Failed to load expense");
      } finally {
        setLoading(false);
      }
    };
    loadExpense();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-dark border-t-transparent" />
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="flex h-[40vh] flex-col items-center justify-center gap-2 text-zinc-400">
        <FileText className="w-8 h-8 stroke-1.5" />
        <span className="text-xs font-medium">Expense data not found</span>
      </div>
    );
  }

  const typeConfig: Record<string, { label: string; className: string }> = {
    pay_supplier: {
      label: "Payment Supplier",
      className: "bg-amber-50 text-amber-700 border-amber-200/60",
    },
    utility: {
      label: "Utility",
      className: "bg-blue-50 text-blue-700 border-blue-200/60",
    },
    operational: {
      label: "Operational",
      className: "bg-purple-50 text-purple-700 border-purple-200/60",
    },
    salary: {
      label: "Salary / Wage",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
    },
    other: {
      label: "Other Expense",
      className: "bg-zinc-50 text-zinc-600 border-zinc-200",
    },
  };

  const currentType = typeConfig[expense.type] || {
    label: expense.type?.replace(/_/g, " ") || "Unknown",
    className: "bg-zinc-50 text-zinc-600 border-zinc-200",
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 md:p-6">
      <div className="w-full border-b border-zinc-100 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1 text-brand-dark hover:text-brand-primary cursor-pointer transition-colors group"
            >
              <div className="p-2 rounded-xl group-hover:bg-brand-primary/10 transition-all duration-300">
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              </div>
              <span className="text-xs font-black uppercase tracking-[0.2em] pl-1 hidden xs:inline">
                Back
              </span>
            </button>
            <div className="h-5 w-[1px] bg-zinc-200 hidden xs:block" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-zinc-800">
                  Expense Voucher
                </h1>
                <span
                  className={`px-2 py-0.5 border text-[9px] font-black uppercase tracking-wider rounded-md ${currentType.className}`}
                >
                  {currentType.label}
                </span>
              </div>
              <p className="text-xs font-mono text-zinc-400 mt-0.5">
                #EXP-{expense.id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <ButtonNav
              href={`/expenses/${expense.id}/edit`}
              icon={<FilePen className="w-3.5 h-3.5" />}
              fullWidth={false}
            >
              Edit Details
            </ButtonNav>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-7 space-y-5">
          <div className="bg-white border border-zinc-200/60 rounded-2xl shadow-3xs p-5 space-y-4">
            <h3 className="text-[11px] font-black uppercase tracking-wider text-zinc-400 border-b border-zinc-100 pb-2">
              General Transaction Info
            </h3>

            <div className="bg-zinc-50/60 border border-zinc-100 p-4 rounded-xl flex flex-col justify-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                Amount Spent
              </span>
              <span className="text-2xl font-black text-zinc-800 font-mono tracking-tight">
                {isClient ? formatRupiah(Number(expense.amount)) : "Rp 0"}
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

        <div className="md:col-span-5 space-y-5">
          {expense.type === "pay_supplier" && expense.supplier_payment_id && (
            <div className="bg-white border border-zinc-200/60 rounded-2xl shadow-3xs p-5 space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
                <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg border border-amber-100">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-800">
                    Supplier Payment
                  </h3>
                  <p className="text-[10px] text-zinc-400 font-mono">
                    Linked ID: #{expense.supplier_payment?.id}
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-[11px] font-medium">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Paid Amount</span>
                  <span className="font-mono font-bold text-zinc-800">
                    {formatRupiah(expense.supplier_payment?.amount || 0)}
                  </span>
                </div>

                <div className="flex justify-between items-center border-t border-zinc-100 pt-2.5">
                  <span className="text-zinc-400">Payment Date</span>
                  <span className="font-mono text-zinc-600">
                    {expense.supplier_payment?.payment_date
                      ? formatDate(expense.supplier_payment.payment_date)
                      : "—"}
                  </span>
                </div>

                <div className="flex justify-between items-center border-t border-zinc-100 pt-2.5">
                  <span className="text-zinc-400">Created Log</span>
                  <span className="font-mono text-zinc-400 text-[10px]">
                    {expense.supplier_payment?.created_at
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
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-800">
                    Employee Attendance
                  </h3>
                  <p className="text-[10px] text-zinc-400 font-mono">
                    Linked ID: #{expense.attendance?.id}
                  </p>
                </div>
              </div>
              <div className="space-y-3 text-[11px] font-medium">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Employee Name</span>
                  <span className="font-bold text-zinc-800">
                    {expense.attendance?.employee.name || "Staff Employee"}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-zinc-100 pt-2.5">
                  <span className="text-zinc-400">Salary</span>
                  <span className="font-mono text-zinc-600">
                    {formatRupiah(expense.attendance?.employee.salary || 0)}
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
                  This transaction is categorized as direct business overhead
                  cost.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
