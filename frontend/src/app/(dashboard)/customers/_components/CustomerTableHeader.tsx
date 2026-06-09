"use client";

import React from "react";
import CustomerSearch from "./CustomerSearch";

interface CustomerTableHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
}

export default function CustomerTableHeader({
  search,
  onSearchChange,
  placeholder = "Search customers...",
}: CustomerTableHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-950 sm:text-2xl">
          Customer List
        </h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          Manage customer profiles, contact information, and billing history.
        </p>
      </div>
      <CustomerSearch
        search={search}
        onSearchChange={onSearchChange}
        placeholder={placeholder}
      />
    </div>
  );
}
