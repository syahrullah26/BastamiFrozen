"use client";

import React from "react";

interface TabConfig {
  id: string;
  label: string;
}

interface ActiveTabSalesProps<T extends string> {
  activeTab: T;
  handleTabChange: (id: T) => void;
  filterTabsConfig: { id: T; label: string }[];
}

export default function ActiveTabSales<T extends string>({
  activeTab,
  handleTabChange,
  filterTabsConfig,
}: ActiveTabSalesProps<T>) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-200 pb-3">
      <div>
        <h2 className="text-base font-bold tracking-tight text-zinc-950 capitalize">
          Your Sales List ({activeTab})
        </h2>
      </div>

      <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto no-scrollbar shadow-inner">
        {filterTabsConfig.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`flex-1 md:flex-initial text-center px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-white text-zinc-900 shadow-xs border border-zinc-200/60"
                  : "text-zinc-400 hover:text-zinc-600 hover:bg-white/40"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
