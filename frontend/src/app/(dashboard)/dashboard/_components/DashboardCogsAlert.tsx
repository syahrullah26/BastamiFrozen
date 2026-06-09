"use client";

import React from "react";

interface DashboardAlertProps {
  zeroCogsCount: number;
}

export default function DashboardAlert({ zeroCogsCount }: DashboardAlertProps) {

  if (zeroCogsCount <= 0) return null;

  return (
    <div className="p-4 border border-rose-200 bg-rose-50/50 rounded-2xl flex items-center justify-between transition-all duration-300">
      <div className="flex items-center gap-3">
        <div className="px-2.5 py-1 bg-rose-100 text-rose-700 rounded-lg font-bold text-sm shrink-0">
          {zeroCogsCount}
        </div>

        <div>
          <h5 className="text-sm font-bold text-rose-950">
            Transaction Items with Missing Cost (HPP 0)
          </h5>
          <p className="text-xs text-rose-700 mt-0.5">
            Some sold items have no cost price configuration. Please review your
            product data entries.
          </p>
        </div>
      </div>
    </div>
  );
}
