"use client";

import React from "react";
import TableData from "@/components/ui/Table/TableData";
import { ExpenseBreakdown } from "@/types/financialReport";

export interface TableColumnConfig<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
}

interface TableRevenueProps {
  expensesBreakdown: ExpenseBreakdown[];
  columns: TableColumnConfig<ExpenseBreakdown>[];
}

export default function TableRevenue({
  expensesBreakdown,
  columns,
}: TableRevenueProps) {
  return (
    <div className="bg-white border border-zinc-200/60 rounded-2xl shadow-xs overflow-hidden">
      <div className="p-5 border-b border-zinc-100 bg-zinc-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <h3 className="font-bold text-base md:text-lg tracking-tight text-zinc-900">
            Operating Expenses Breakdown
          </h3>
          <p className="text-xs text-zinc-400">
            Comprehensive breakdown of general cash expenditures affecting
            business margins.
          </p>
        </div>
      </div>

      <div className="p-4 bg-white overflow-x-auto">
        {expensesBreakdown && expensesBreakdown.length > 0 ? (
          <TableData columns={columns} data={expensesBreakdown} />
        ) : (
          <div className="text-center py-12 text-sm text-zinc-400 font-medium border border-dashed border-zinc-200 rounded-xl bg-zinc-50/30">
            No expense records found for this period.
          </div>
        )}
      </div>
    </div>
  );
}
