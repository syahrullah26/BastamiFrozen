"use client";

import React from "react";

export interface ProductUnitTier {
  unit_name: string;
  conversion_factor: number | string;
  price: number;
}

interface DPUnitTableProps {
  units: ProductUnitTier[] | undefined | null;
  formatRupiah: (value: number) => string;
}

export default function DPUnitTable({ units, formatRupiah }: DPUnitTableProps) {
  if (!units || units.length === 0) return null;

  return (
    <div className="pt-4 space-y-3">
      <div className="flex items-center gap-2 px-1">
        <div className="w-1.5 h-3.5 bg-zinc-900 rounded-full" />
        <h4 className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
          Available Pricing Tiers
        </h4>
      </div>
      <div className="w-full border border-zinc-200 rounded-2xl overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-zinc-150 bg-zinc-50 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                <th className="py-3.5 px-6 select-none w-16">No</th>
                <th className="py-3.5 px-6 select-none">Unit Name</th>
                <th className="py-3.5 px-6 select-none text-center">
                  Conversion Factor
                </th>
                <th className="py-3.5 px-6 text-right select-none">
                  Price Tier
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs text-zinc-700">
              {units.map((u, i) => (
                <tr
                  key={i}
                  className="group hover:bg-zinc-50/50 transition-colors duration-150"
                >
                  <td className="py-4 px-6 font-mono text-zinc-400 font-semibold">
                    {String(i + 1).padStart(2, "0")}
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-semibold text-zinc-900 tracking-tight">
                      {u.unit_name}
                    </span>
                  </td>

                  <td className="py-4 px-6 text-center">
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full font-mono font-bold text-[11px] bg-zinc-100 text-zinc-800 border border-zinc-200/40">
                      {u.conversion_factor}
                    </span>
                  </td>

                  <td className="py-4 px-6 text-right">
                    <span className="font-bold text-sm text-zinc-900 tracking-tight group-hover:text-zinc-600 transition-colors">
                      {formatRupiah(u.price)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
