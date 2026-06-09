"use client";

import React from "react";
import { Search } from "lucide-react";

interface CustomerSearchProps {
  search: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
}

export default function CustomerSearch({
  search,
  onSearchChange,
  placeholder = "Search Customer...",
}: CustomerSearchProps) {
  return (
    <div className="w-full sm:max-w-xs">
      <div className="group flex items-center bg-white border border-zinc-200 focus-within:border-zinc-400 rounded-xl px-3 transition-all shadow-sm">
        <Search className="w-4 h-4 text-zinc-400 group-focus-within:text-zinc-600 transition-colors shrink-0" />

        <input
          type="text"
          placeholder={placeholder}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-2.5 py-2.5 bg-transparent text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none"
        />
      </div>
    </div>
  );
}
