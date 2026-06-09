"use client";

import React, { useSyncExternalStore } from "react";
import { User, Phone, DollarSign } from "lucide-react";
import { formatRupiah } from "@/utils/helper";
import { Sale } from "@/types/sale";

interface StatsCardSalesDetailProps {
  sale: Sale | null;
}

const emptySubscribe = () => () => {};

export default function StatsCardSalesDetail({
  sale,
}: StatsCardSalesDetailProps) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const customerRemainingBill = Number(sale?.customer?.remaining_bill || 0);
  const currentInvoiceRemainingBill = Number(sale?.amount?.remaining_bill || 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-6">
      <div className="flex flex-col gap-4 p-5 rounded-2xl border border-zinc-200/60 bg-white shadow-3xs">
        <div className="border-b border-zinc-100 pb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-sans flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            Customer Details
          </h3>
        </div>

        <div className="space-y-3.5">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-sans">
              Full Name
            </span>
            <span className="text-xs font-bold text-zinc-800">
              {sale?.customer?.name || "-"}
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-sans">
              Address / Location
            </span>
            <span className="text-xs font-medium text-zinc-600 leading-relaxed">
              {sale?.customer?.location || "-"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-1.5 border-t border-zinc-50">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-sans flex items-center gap-1">
                <Phone className="w-3 h-3" /> Phone
              </span>
              <span className="text-xs font-semibold font-mono text-zinc-600">
                {sale?.customer?.phone || "-"}
              </span>
            </div>

            <div className="flex flex-col gap-1 items-end text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-sans">
                Remaining Bills
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold font-mono border ${
                  customerRemainingBill === 0
                    ? "text-emerald-600 bg-emerald-50 border-emerald-100"
                    : "text-rose-600 bg-rose-50 border-rose-100"
                }`}
              >
                {isClient ? formatRupiah(customerRemainingBill) : "—"}
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
            {isClient
              ? formatRupiah(Number(sale?.amount?.total_amount || 0))
              : "—"}
          </span>
        </div>

        <div className="pt-3 border-t border-zinc-50 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Payment Status
          </span>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
              sale?.status === "unpaid"
                ? "text-amber-600 bg-amber-50 border-amber-200/60"
                : "text-emerald-600 bg-emerald-50 border-emerald-200/60"
            }`}
          >
            {sale?.status || "—"}
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
