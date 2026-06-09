"use client";

import React, { useSyncExternalStore } from "react";
import { ShoppingBag } from "lucide-react";
import { formatRupiah } from "@/utils/helper";

interface PurchaseItem {
  id?: string | number;
  product_name: string;
  quantity: number | string;
  product_unit_name: string;
  price: number | string;
  cost_price: number | string;
  subtotal: number | string;
}

interface PurchaseData {
  invoice_number?: string;
  items?: PurchaseItem[];
}

interface TablePurchaseDetailProps {
  purchase: PurchaseData | null;
}

const emptySubscribe = () => () => {};

export default function TablePurchaseDetail({
  purchase,
}: TablePurchaseDetailProps) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl shadow-xs overflow-hidden mt-6">
      <div className="p-5 border-b border-zinc-100 flex items-center gap-2">
        <ShoppingBag className="w-4 h-4 text-zinc-500" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900">
          Product Items for #{purchase?.invoice_number || "—"}
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
              <th className="py-3 px-4 w-16">No</th>
              <th className="py-3 px-4">Product Name</th>
              <th className="py-3 px-4 text-center w-32">Qty / Unit</th>
              <th className="py-3 px-4 text-right w-44">Unit Cost</th>
              <th className="py-3 px-4 text-right w-44">Base Price</th>
              <th className="py-3 px-4 text-right w-44">Subtotal</th>
            </tr>
          </thead>
          <tbody className="text-xs">
            {!purchase?.items || purchase.items.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-10 text-center text-zinc-400 font-medium"
                >
                  No items found for this purchase.
                </td>
              </tr>
            ) : (
              purchase.items.map((item, index) => {
                const isEven = index % 2 === 0;

                return (
                  <tr
                    key={item.id || index}
                    className={`transition-colors duration-150 hover:bg-zinc-50 text-zinc-700 font-medium border-b border-zinc-100 last:border-0 ${
                      isEven ? "bg-zinc-50/20" : "bg-white"
                    }`}
                  >
                    <td className="py-3 px-4 font-bold tracking-wide text-zinc-400 font-mono">
                      {index + 1}
                    </td>
                    <td className="py-3 px-4 font-semibold text-zinc-900">
                      {item.product_name}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2 py-0.5 bg-zinc-100 text-zinc-600 font-mono font-bold rounded">
                        {item.quantity} {item.product_unit_name}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-zinc-500">
                      {isClient ? formatRupiah(Number(item.price || 0)) : "—"}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-zinc-500">
                      {isClient
                        ? formatRupiah(Number(item.cost_price || 0))
                        : "—"}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-zinc-900">
                      {isClient
                        ? formatRupiah(Number(item.subtotal || 0))
                        : "—"}
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
