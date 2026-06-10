"use client";

import React from "react";
import SearchExpense from "./SearchExpense";

interface TableHeaderExpenseProps {
  search: string;
  setSearch: (search: string) => void;
  placeholder?: string;
}

export default function TableHeaderExpense({
  search,
  setSearch,
  placeholder = "Search Expense...",
}: TableHeaderExpenseProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-950 sm:text-2xl">
          Expense List
        </h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          Manage Expense history, Supplier Payment history, and utilities.
        </p>
      </div>
      <SearchExpense
        search={search}
        onSearchChange={setSearch}
        placeholder={placeholder}
      />
    </div>
  );
}
