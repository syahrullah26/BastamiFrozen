"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ExpenseService } from "@/services/expenseService";
import { ExpenseRequest } from "@/types/expense";
import { toast } from "sonner";
import { Save, Loader2, ArrowLeft, Lock, AlertCircle } from "lucide-react";
import axios from "axios";

import { FloatingInput } from "@/components/ui/input/FloatingInput";
import ButtonLoad from "@/components/ui/button/ButtonLoad";
import ButtonNav from "@/components/ui/button/ButtonNav";

export default function EditExpensePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<ExpenseRequest>({
    type: "",
    amount: 0,
    notes: "",
    expense_date: "",
  });
  const isLockedSystemExpense =
    formData.type === "salary" || formData.type === "pay_supplier";

  useEffect(() => {
    if (!id || id === "undefined") return;

    const fetchExpense = async () => {
      try {
        setLoading(true);
        const data = await ExpenseService.getExpense(id);
        setFormData({
          type: data.type,
          amount: data.amount,
          notes: data.notes,
          expense_date: data.expense_date,
        });
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          return;
        }
        toast.error("Failed to load expense");
        router.push("/expenses");
      } finally {
        setLoading(false);
      }
    };

    fetchExpense();
  }, [id, router]);

  const handleChangeType = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      type: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLockedSystemExpense) {
      toast.error("Akses Ditolak", {
        description: "Transaksi otomatis sistem tidak boleh diubah manual.",
      });
      return;
    }

    try {
      setSubmitting(true);
      await ExpenseService.updateExpense(id, formData);
      toast.success("Perubahan Disimpan", {
        description: `${formData.type?.replace(/_/g, " ")} telah diperbarui.`,
      });
      router.push("/expenses");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return;
      }
      toast.error("Failed to update expense");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-2 text-zinc-500">
        <Loader2 className="h-5 w-5 animate-spin text-brand-dark" />
        <span className="text-xs font-medium font-mono">Loading data...</span>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-1 text-brand-dark hover:text-brand-primary cursor-pointer transition-colors"
          >
            <div className="p-2 rounded-xl group-hover:bg-brand-primary/10 transition-all duration-300">
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            </div>
          </button>
          <div>
            <h2 className="text-base font-black tracking-tight text-zinc-800">
              Edit Expense Voucher
            </h2>
            <p className="text-[11px] text-zinc-400 font-mono">ID: #EXP-{id}</p>
          </div>
        </div>
      </div>
      {isLockedSystemExpense && (
        <div className="flex items-start gap-2.5 bg-amber-50/80 border border-amber-200 p-3.5 rounded-xl animate-in fade-in duration-300">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
              Form Protected <Lock className="w-3 h-3" />
            </h4>
            <p className="text-[11px] text-amber-700 font-medium leading-normal">
              Expenses categorized as{" "}
              <span className="font-bold underline font-mono capitalize">
                {formData.type?.replace(/_/g, " ")}
              </span>{" "}
              are automated system records linked to employee attendance logs or
              supplier payments. Manual modifications are restricted to maintain
              financial data consistency.
            </p>
          </div>
        </div>
      )}
      <div className="bg-white border border-zinc-200/60 rounded-2xl shadow-3xs p-5 md:p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 pl-0.5">
              Expense Type
            </label>
            <select
              value={formData.type}
              onChange={handleChangeType}
              disabled={isLockedSystemExpense || !formData.type}
              className="w-full text-xs font-semibold text-zinc-700 bg-white border border-zinc-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-zinc-400 disabled:bg-zinc-50 disabled:text-zinc-400 disabled:border-zinc-200 transition-all cursor-pointer"
            >
              <option value="">Select Type</option>
              <option value="operational">Operational</option>
              <option value="salary">Salary / Wage</option>
              <option value="pay_supplier">Payment Supplier</option>
              <option value="utility">Utility</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div
            className={`${isLockedSystemExpense ? "opacity-75 pointer-events-none" : ""}`}
          >
            <FloatingInput
              label="Amount (Rp)"
              type="number"
              value={formData.amount}
              disabled={isLockedSystemExpense}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  amount: Number(e.target.value),
                }))
              }
            />
          </div>

          <div
            className={`${isLockedSystemExpense ? "opacity-75 pointer-events-none" : ""}`}
          >
            <FloatingInput
              label="Notes / Description"
              value={formData.notes}
              disabled={isLockedSystemExpense}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  notes: e.target.value,
                }))
              }
            />
          </div>
          <div
            className={`${isLockedSystemExpense ? "opacity-75 pointer-events-none" : ""}`}
          >
            <FloatingInput
              label="Expense Date"
              type="date"
              value={formData.expense_date}
              disabled={isLockedSystemExpense}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  expense_date: e.target.value,
                }))
              }
            />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-zinc-100 mt-6">
            <ButtonLoad
              type="submit"
              isLoading={submitting}
              disabled={submitting || isLockedSystemExpense}
              icon={
                isLockedSystemExpense ? (
                  <Lock className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )
              }
              className={
                isLockedSystemExpense
                  ? "bg-zinc-100 text-zinc-400 border-zinc-200 cursor-not-allowed"
                  : ""
              }
            >
              {isLockedSystemExpense ? "Locked" : "Save Changes"}
            </ButtonLoad>
          </div>
        </form>
      </div>
    </div>
  );
}
