"use client";

import React from "react";
import SearchEmployee from "./SearchEmployee";

interface TableHeaderEmployeeProps {
  search: string;
  setSearch: (search: string) => void;
  placeholder?: string;
}

export default function TableHeaderEmployee({
  search,
  setSearch,
  placeholder = "Search Employee...",
}: TableHeaderEmployeeProps) {
  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-950 sm:text-2xl">
            Customer List
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Manage customer profiles, contact information, and billing history.
          </p>
        </div>
        <SearchEmployee
          search={search}
          onSearchChange={setSearch}
          placeholder={placeholder}
        />
      </div>
    </>
  );
}
