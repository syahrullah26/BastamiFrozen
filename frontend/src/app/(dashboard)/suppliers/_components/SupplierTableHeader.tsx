"use client";

import React from "react";
import SupplierSearch from "./SupplierSearch";

interface SupplierTableHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
}

export default function SupplierTableHeader({
  search,
  onSearchChange,
  placeholder = "Search Suppliers...",
}: SupplierTableHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-950 sm:text-2xl">
          Supplier List
        </h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          Manage Supplier profiles, contact information, and billing history.
        </p>
      </div>
      <SupplierSearch
        search={search}
        onSearchChange={onSearchChange}
        placeholder={placeholder}
      />
    </div>
  );
}
