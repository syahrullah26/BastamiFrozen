"use client";

import React from "react";
import { AlertCircle } from "lucide-react";

interface EmptyExpenseRevenueProps {
  message?: string;
}

export default function EmptyExpenseRevenue({
  message = "No financial data found matching current filter configuration.",
}: EmptyExpenseRevenueProps) {
  return (
    <div className="text-center py-16 bg-white border border-zinc-200/60 rounded-2xl shadow-xs flex flex-col items-center justify-center space-y-3">
      <div className="p-3 bg-zinc-50 text-zinc-400 border border-zinc-100 rounded-full shrink-0">
        <AlertCircle className="w-6 h-6 stroke-1.5" />
      </div>
      <p className="text-xs md:text-sm font-medium text-zinc-400 max-w-xs leading-relaxed px-4">
        {message}
      </p>
    </div>
  );
}
