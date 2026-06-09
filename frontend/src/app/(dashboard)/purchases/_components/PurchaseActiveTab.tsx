"use client";

import React from "react";

interface TabConfig {
  id: string;
  label: string;
}

interface PurchaseActiveTabProps {
  activeBatchTab: string;
  handleBatchTabChange: (id: string) => void;
  batchTabConfig: TabConfig[];
  activeTab: string;
  handleTabChange: (id: string) => void;
  filterTabsConfig: TabConfig[];
}

export default function PurchaseActiveTab({
  activeBatchTab,
  handleBatchTabChange,
  batchTabConfig,
  activeTab,
  handleTabChange,
  filterTabsConfig,
}: PurchaseActiveTabProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between border-b border-zinc-200 pb-3 gap-4">
      <div className="space-y-0.5">
        <h2 className="text-base font-bold tracking-tight text-zinc-950">
          Your Purchases List
        </h2>
        <p className="text-xs text-zinc-400 font-medium">
          Showing{" "}
          <span className="text-zinc-800 font-semibold">{activeBatchTab}</span>{" "}
          batch with{" "}
          <span className="text-zinc-800 font-semibold">{activeTab}</span>{" "}
          invoices.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl w-full sm:w-auto shadow-inner">
          {batchTabConfig.map((tab) => {
            const isActive = activeBatchTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleBatchTabChange(tab.id)}
                className={`flex-1 sm:flex-initial text-center px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-white text-zinc-900 shadow-xs border border-zinc-200/60"
                    : "text-zinc-400 hover:text-zinc-600"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="hidden sm:block text-zinc-300 font-light text-sm select-none">
          /
        </div>

        <div className="flex items-center gap-1 bg-zinc-100/60 p-1 rounded-xl w-full sm:w-auto shadow-inner border border-zinc-200/40">
          {filterTabsConfig.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`flex-1 sm:flex-initial text-center px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all duration-200 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-zinc-900 text-white shadow-xs"
                    : "text-zinc-400 hover:text-zinc-600"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
