"use client";

import React, { useSyncExternalStore } from "react";
import { User, Phone, DollarSign } from "lucide-react";
import { formatRupiah } from "@/utils/helper";

interface SupplierInfo {
  name: string;
  remaining_bill: number | string;
  information: {
    address?: string;
    phone?: string;
  };
}

interface PurchaseDetail {
  total_amount: number;
  remaining_bill: number;
  status: string;
  supplier?: SupplierInfo | null;
}

interface StatsPurchaseDetailProps {
  purchase: PurchaseDetail | null;
}

const emptySubscribe = () => () => {};

export default function StatsPurchaseDetail({
  purchase,
}: StatsPurchaseDetailProps) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const supplierRemainingBill = Number(purchase?.supplier?.remaining_bill || 0);
  const currentInvoiceRemainingBill = Number(purchase?.remaining_bill || 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-6">
      <div className="flex flex-col gap-4 p-5 rounded-2xl border border-zinc-200/60 bg-white shadow-3xs">
        <div className="border-b border-zinc-100 pb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-sans flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            Supplier Details
          </h3>
        </div>
        <div className="space-y-3.5">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-sans">
              Full Name
            </span>
            <span className="text-xs font-bold text-zinc-800">
              {purchase?.supplier?.name || "-"}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-sans">
              Address / Location
            </span>
            <span className="text-xs font-medium text-zinc-600 leading-relaxed">
              {purchase?.supplier?.information?.address || "-"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-1.5 border-t border-zinc-50">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-sans flex items-center gap-1">
                <Phone className="w-3 h-3" /> Phone
              </span>
              <span className="text-xs font-semibold font-mono text-zinc-600">
                {purchase?.supplier?.information?.phone || "-"}
              </span>
            </div>
            <div className="flex flex-col gap-1 items-end text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-sans">
                Remaining Bills
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold font-mono border ${
                  supplierRemainingBill === 0
                    ? "text-emerald-600 bg-emerald-50 border-emerald-100"
                    : "text-rose-600 bg-rose-50 border-rose-100"
                }`}
              >
                {isClient ? formatRupiah(supplierRemainingBill) : "—"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-5 rounded-2xl border border-zinc-200/60 bg-white shadow-3xs">
        <div className="border-b border-zinc-100 pb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-sans flex items-center gap-2">
            <DollarSign className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            Total Amount
          </h3>
        </div>
        <div className="flex flex-col justify-center flex-1 py-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-sans mb-1">
            Accumulated Total
          </span>
          <span className="text-xl md:text-2xl font-bold font-mono text-zinc-900 tracking-tight">
            {isClient ? formatRupiah(purchase?.total_amount || 0) : "—"}
          </span>
        </div>
        <div className="pt-3 border-t border-zinc-50 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Payment Status
          </span>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
              purchase?.status === "unpaid"
                ? "text-amber-600 bg-amber-50 border-amber-200/60"
                : "text-emerald-600 bg-emerald-50 border-emerald-200/60"
            }`}
          >
            {purchase?.status || "—"}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-5 rounded-2xl border border-zinc-200/60 bg-white shadow-3xs">
        <div className="border-b border-zinc-100 pb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-sans flex items-center gap-2">
            <DollarSign className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            Remaining Bill
          </h3>
        </div>
        <div className="flex flex-col justify-center flex-1 py-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-sans mb-1">
            Outstanding Invoice
          </span>
          <span
            className={`text-xl md:text-2xl font-bold font-mono tracking-tight ${
              currentInvoiceRemainingBill === 0
                ? "text-emerald-600"
                : "text-rose-600"
            }`}
          >
            {isClient ? formatRupiah(currentInvoiceRemainingBill) : "—"}
          </span>
        </div>
        <div className="pt-3 border-t border-zinc-50 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Collection Status
          </span>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
              currentInvoiceRemainingBill === 0
                ? "text-emerald-600 bg-emerald-50 border-emerald-200/60"
                : "text-rose-600 bg-rose-50 border-rose-200/60"
            }`}
          >
            {currentInvoiceRemainingBill === 0 ? "Settled" : "Pending"}
          </span>
        </div>
      </div>
    </div>
  );
}
