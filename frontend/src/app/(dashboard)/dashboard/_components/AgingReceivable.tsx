"use client";

import React from "react";
import { DashboardAgingReceivable } from "@/types/financialReport";

interface AgingReceivablesTableProps {
  receivables: DashboardAgingReceivable[];
  formatRupiah?: (value: number) => string;
}

export default function AgingReceivablesTable({
  receivables,
  formatRupiah = (val) => `Rp ${val.toLocaleString("id-ID")}`,
}: AgingReceivablesTableProps) {
  return (
    <div className="p-5 bg-white border border-zinc-200 rounded-2xl shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-zinc-800">
          Top Aging Receivables
        </h3>
        <p className="text-xs text-zinc-400">
          Customers with the largest outstanding uncollected balances.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-zinc-100 text-zinc-400 text-xs uppercase font-semibold">
              <th className="pb-3">Customer Name</th>
              <th className="pb-3 text-right">Oldest Invoice</th>
              <th className="pb-3 text-right">Remaining Debt</th>
              <th className="pb-3 text-right">Debt Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 font-medium text-zinc-700">
            {receivables.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="p-3 bg-zinc-50 rounded-full border border-zinc-100 text-zinc-400">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-zinc-800">
                        No critical aging receivables
                      </p>
                      <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                        All outstanding invoices are currently under 7 days or
                        fully settled.
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              receivables.map((debtor) => {
                const isHighRisk = debtor.debt_status === "High Risk";
                const badgeStyles = isHighRisk
                  ? "bg-rose-50 text-rose-700 border-rose-200/60"
                  : "bg-amber-50 text-amber-700 border-amber-200/60";

                return (
                  <tr
                    key={debtor.customer_id}
                    className="group hover:bg-zinc-50/50 transition-colors"
                  >
                    <td className="py-3.5 pr-2 font-semibold text-zinc-900">
                      {debtor.customer_name}
                    </td>

                    <td className="py-3.5 text-right text-amber-600 font-bold">
                      <div className="flex flex-col items-end gap-1 justify-center">
                        <span
                          className={`px-2 py-0.5 text-[11px] font-semibold border rounded-full ${badgeStyles}`}
                        >
                          {debtor.oldest_invoice_days} Days
                        </span>
                        <span className="text-xs text-zinc-400 font-normal tracking-tight">
                          {debtor.invoice_number}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 text-right text-rose-600 font-bold">
                      {formatRupiah(Number(debtor.remaining_debt))}
                    </td>

                    <td className="py-3.5 text-right align-middle">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${badgeStyles}`}
                      >
                        <span className="relative flex h-1.5 w-1.5">
                          {isHighRisk && (
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75"></span>
                          )}
                          <span
                            className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                              isHighRisk ? "bg-rose-500" : "bg-amber-500"
                            }`}
                          />
                        </span>
                        {debtor.debt_status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
