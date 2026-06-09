"use client";

import React from "react";
export type FilterType = "daily" | "weekly" | "monthly";

interface DashboardHeaderProps {
  filterType: FilterType;
  onFilterChange: (type: FilterType) => void;
}

export default function DashboardHeader({
  filterType,
  onFilterChange,
}: DashboardHeaderProps) {
  const renderFilterButton = (type: FilterType, label: string) => {
    const isActive = filterType === type;

    return (
      <button
        onClick={() => onFilterChange(type)}
        className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
          isActive
            ? "bg-white text-zinc-900 shadow-sm"
            : "text-zinc-500 hover:text-zinc-900"
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Dashboard
        </h1>
        <p className="text-sm text-zinc-500">
          Overview of system sales performance and financial controls.
        </p>
      </div>

      <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl self-start sm:self-auto border border-zinc-200">
        {renderFilterButton("daily", "Daily")}
        {renderFilterButton("weekly", "Weekly")}
        {renderFilterButton("monthly", "Monthly")}
      </div>
    </div>
  );
}
