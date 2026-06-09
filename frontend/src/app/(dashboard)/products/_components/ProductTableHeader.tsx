"use client";

import React from "react";
import ProductSearch from "./ProductSearch";

interface ProductTableHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
}

export default function ProductTableHeader({
  search,
  onSearchChange,
  placeholder = "Search products...",
}: ProductTableHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-950 sm:text-2xl">
          Products Inventory
        </h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          Manage warehouse stock volumes, price configurations, and units.
        </p>
      </div>

      <ProductSearch
        search={search}
        onSearchChange={onSearchChange}
        placeholder={placeholder}
      />
    </div>
  );
}
