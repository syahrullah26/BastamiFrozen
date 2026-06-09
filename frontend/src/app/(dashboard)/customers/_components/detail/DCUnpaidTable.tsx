"use client";

import React from "react";
import { Sale } from "@/types/sale";
import { formatRupiah, formatDate } from "@/utils/helper";
import { Calendar, Clock } from "lucide-react";

interface DCUnpaidTableProps {
  recentSale: Sale[];
  loading: boolean;
}

export default function DCUnpaidTable({
  recentSale,
  loading,
}: DCUnpaidTableProps) {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden mt-2">
      <div className="p-5 border-b border-zinc-200 flex items-center gap-2">
        <Clock className="w-4 h-4 text-brand-primary" />
        <h2 className="text-sm font-black uppercase tracking-wider text-brand-dark">
          Recent Unpaid Transactions
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-primary-brand">
            <tr className=" text-ghost-white text-xs font-black uppercase tracking-widest">
              <th className="py-3 px-4">Invoice Number</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Grand Total</th>
              <th className="py-3 px-4">Remaining Bill</th>
              <th className="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-8 text-center text-slate-400 font-medium animate-pulse"
                >
                  Loading transactions...
                </td>
              </tr>
            ) : recentSale.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-8 text-center text-slate-400 font-medium"
                >
                  No unpaid transactions found.
                </td>
              </tr>
            ) : (
              recentSale.map((sale, index) => {
                const isEven = index % 2 === 0;
                return (
                  <tr
                    key={sale.id || index}
                    className={`transition-colors duration-200 hover:bg-brand-primary/20 text-brand-dark font-medium ${
                      isEven ? "bg-background/40" : "bg-snow-white"
                    }`}
                  >
                    <td className="py-3.5 px-4 font-bold tracking-wide">
                      {sale.invoice_number ||
                        `#${sale.id?.toString().slice(0, 8)}`}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {formatDate(sale.transaction_date)}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      Rp{" "}
                      {(sale.amount.total_amount || 0).toLocaleString("id-ID")}
                    </td>
                    <td className="py-3.5 px-4 text-amber-600 font-bold">
                      Rp{" "}
                      {(sale.amount.remaining_bill || 0).toLocaleString(
                        "id-ID",
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-md bg-amber-50 text-amber-600 border border-amber-200">
                        {sale.status}
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
