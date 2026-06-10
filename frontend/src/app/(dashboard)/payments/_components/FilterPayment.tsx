"use client";

import React from "react";
import { Search } from "lucide-react";

type PaymentTab = "customer" | "supplier";

interface PaymentStats {
  customerCount: number;
  supplierCount: number;
}

interface FilterPaymentProps {
  activeTab: PaymentTab;
  setActiveTab: (tab: PaymentTab) => void;
  search: string;
  setSearch: (value: string) => void;
  setCurrentPage: (page: number) => void;
  stats: PaymentStats;
}

export default function FilterPayment({
  activeTab,
  setActiveTab,
  search,
  setSearch,
  setCurrentPage,
  stats,
}: FilterPaymentProps) {
  const handleTabClick = (tab: PaymentTab) => {
    setActiveTab(tab);
    setSearch("");
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
      <div className="flex bg-zinc-100 p-1 rounded-xl w-fit border border-zinc-200/50 shadow-inner">
        <button
          type="button"
          onClick={() => handleTabClick("customer")}
          className={`px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap ${
            activeTab === "customer"
              ? "bg-white text-zinc-900 shadow-xs border border-zinc-200/40"
              : "text-zinc-500 hover:text-zinc-700"
          }`}
        >
          Customer Payments ({stats.customerCount})
        </button>

        <button
          type="button"
          onClick={() => handleTabClick("supplier")}
          className={`px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap ${
            activeTab === "supplier"
              ? "bg-white text-zinc-900 shadow-xs border border-zinc-200/40"
              : "text-zinc-500 hover:text-zinc-700"
          }`}
        >
          Supplier Payments ({stats.supplierCount})
        </button>
      </div>

      <div className="group relative w-full sm:w-72 bg-white border border-zinc-200 focus-within:border-zinc-950 focus-within:ring-4 focus-within:ring-zinc-950/5 rounded-xl px-3.5 py-2 transition-all duration-200 shadow-2xs">
        <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-zinc-950 transition-colors">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search ${
            activeTab === "customer"
              ? "customer name or phone..."
              : "supplier name..."
          }`}
          className="w-full bg-transparent pl-5 text-xs font-medium text-zinc-800 placeholder-zinc-400 focus:outline-none"
        />
      </div>
    </div>
  );
}
