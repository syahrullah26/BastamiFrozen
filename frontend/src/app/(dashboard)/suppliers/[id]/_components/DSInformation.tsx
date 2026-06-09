"use client";

import React, { useSyncExternalStore } from "react";
import { Supplier } from "@/types/supplier";
import { Phone, MapPin } from "lucide-react";
import { formatRupiah } from "@/utils/helper";

interface DSInformationProps {
  supplier: Supplier | null;
  remainingBill: number;
}

const emptySubscribe = () => () => {};

export default function DSInformation({
  supplier,
  remainingBill,
}: DSInformationProps) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs">
      <div className="space-y-2.5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            Supplier Profile
          </span>
          <h1 className="text-xl md:text-2xl font-bold text-zinc-950 tracking-tight mt-0.5">
            {supplier?.name || "Loading Supplier..."}
          </h1>
        </div>

        <div className="space-y-1.5 pt-1">
          <div className="text-xs text-zinc-500 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span>
              <span className="font-medium text-zinc-700">Location:</span>{" "}
              {supplier?.information?.address || "No Location Listed"}
            </span>
          </div>

          <div className="text-xs text-zinc-500 flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span>
              <span className="font-medium text-zinc-700">Phone:</span>{" "}
              {supplier?.information?.phone || "No Phone Number Listed"}
            </span>
          </div>
        </div>
      </div>

      <div className="text-left md:text-right w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-zinc-100 flex flex-col justify-center">
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Total Remaining Bill
        </span>
        <span className="text-xl md:text-2xl font-bold text-zinc-950 tracking-tight mt-1">
          {isClient ? formatRupiah(remainingBill) : "Rp 0"}
        </span>
      </div>
    </div>
  );
}
