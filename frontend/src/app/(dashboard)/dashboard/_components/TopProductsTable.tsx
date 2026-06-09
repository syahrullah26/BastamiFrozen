"use client";

import React from "react";

// Struktur data item produk terlaris dari API
export interface TopProductItem {
  product_id: number | string;
  product_name: string;
  total_qty_sold: number | string;
  unit_name?: string | null;
  total_times_ordered: number;
}

interface TopProductsTableProps {
  products: TopProductItem[];
}

export default function TopProductsTable({ products }: TopProductsTableProps) {
  return (
    <div className="p-5 bg-white border border-zinc-200 rounded-2xl shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-zinc-800">
          Top 5 Products (All-Time)
        </h3>
        <p className="text-xs text-zinc-400">
          Ranked by total quantity sold volume across all orders.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-zinc-100 text-zinc-400 text-xs uppercase font-semibold">
              <th className="pb-3">Product Name</th>
              <th className="pb-3 text-right">Volume</th>
              <th className="pb-3 text-right">Order Count</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 font-medium text-zinc-700">
            {products.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="py-4 text-center text-xs text-zinc-400"
                >
                  No product data available
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr
                  key={product.product_id}
                  className="group hover:bg-zinc-50/50 transition-colors"
                >
                  <td className="py-3.5 pr-2 font-semibold text-zinc-900">
                    {product.product_name}
                  </td>
                  <td className="py-3.5 text-right font-bold text-zinc-900">
                    {Number(product.total_qty_sold).toLocaleString("en-US")}{" "}
                    {product.unit_name || "pcs"}
                  </td>
                  <td className="py-3.5 text-right text-zinc-500">
                    {product.total_times_ordered} times
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
