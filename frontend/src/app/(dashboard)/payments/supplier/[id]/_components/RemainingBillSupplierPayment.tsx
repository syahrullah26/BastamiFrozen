"use client";

import React from "react";
import { SupplierPayment } from "@/types/payment";
import { formatRupiah } from "@/utils/helper";
import { toast } from "sonner";
import { CreditCard } from "lucide-react";

interface RemainingBillSupplierPaymentProps {
  payment: SupplierPayment | null;
  paymentPercentage: number;
  totalOrderEstimate: number;
}

export default function RemainingBillSupplierPayment({
  payment,
  paymentPercentage,
  totalOrderEstimate,
}: RemainingBillSupplierPaymentProps) {
  if (!payment) return null;
  return (
    <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs p-6 space-y-4">
      <div>
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-0.5">
          Financial Statement
        </span>
        <h3 className="text-xs font-semibold text-zinc-400">
          Remaining Bill to Supplier
        </h3>
      </div>

      <div className="text-2xl font-black text-red-500">
        {formatRupiah(payment.supplier?.remaining_bill || 0)}
      </div>

      <div className="space-y-1">
        <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${paymentPercentage}%` }}
          />
        </div>
        <p className="text-[10px] text-zinc-400 font-semibold italic">
          {paymentPercentage}% of total wholesale history (
          {formatRupiah(totalOrderEstimate)}) has been settled.
        </p>
      </div>

      <button
        onClick={() =>
          toast.success("Navigating to records management framework")
        }
        className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all cursor-pointer"
      >
        <CreditCard className="w-4 h-4" /> Pay Remaining Balance
      </button>
    </div>
  );
}
