"use client";
import React from "react";
import { Customer } from "@/types/customer";
import { formatRupiah } from "@/utils/helper";

interface DCInformationProps {
  customer: Customer | null;
  totalRemainingBill: number;
}

export default function DCInformation({
  customer,
  totalRemainingBill,
}: DCInformationProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-brand-primary">
          Customer Profile
        </span>
        <h1 className="text-2xl md:text-3xl font-black text-brand-dark mt-1">
          {customer?.name}
        </h1>
        <p className="text-sm text-slate-500 mt-2 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
          {customer?.location || "No Location Listed"}
        </p>
      </div>
      <div className="text-right w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block">
          Total Remaining Bill
        </span>
        <span className="text-2xl font-black text-brand-dark block mt-1">
          {formatRupiah(totalRemainingBill || 0)}
        </span>
      </div>
    </div>
  );
}
