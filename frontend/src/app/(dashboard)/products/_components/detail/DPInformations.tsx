"use client";

import React from "react";
import { Package, DollarSign, Edit3 } from "lucide-react";
import StatsCard from "@/components/ui/card/StatsCard";
import ButtonNav from "@/components/ui/button/ButtonNav";

interface ProductData {
  name: string;
  stock: number | string;
}

interface UnitData {
  unit_name?: string | null;
  price: number;
}

interface DPInformationsProps {
  id: string | number;
  product: ProductData;
  smallestUnit: UnitData | null | undefined;
  formatRupiah: (value: number) => string;
}

export default function DPInformations({
  id,
  product,
  smallestUnit,
  formatRupiah,
}: DPInformationsProps) {
  return (
    <div className="flex flex-col justify-between p-6 bg-white border border-zinc-200 rounded-2xl shadow-sm min-h-[300px] md:min-h-[400px] transition-all duration-300">
      <div className="space-y-6">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
            Product Details
          </span>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
            {product.name}
          </h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatsCard
            title="Total Stock"
            value={`${product.stock} Pcs`}
            icon={<Package className="w-4 h-4 text-zinc-500" />}
            className="bg-zinc-50/50 border border-zinc-100 shadow-none"
          />
          <StatsCard
            title={`Price (${smallestUnit?.unit_name || "Base Unit"})`}
            value={formatRupiah(smallestUnit?.price || 0)}
            icon={<DollarSign className="w-4 h-4 text-zinc-500" />}
            className="bg-zinc-50/50 border border-zinc-100 shadow-none"
          />
        </div>
      </div>

      <div className="pt-5 mt-6 border-t border-zinc-100 flex justify-end">
        <ButtonNav
          href={`/products/${id}/edit`}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 transition-all shadow-sm group cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5 transition-transform group-hover:rotate-12" />
          Edit Product Data
        </ButtonNav>
      </div>
    </div>
  );
}
