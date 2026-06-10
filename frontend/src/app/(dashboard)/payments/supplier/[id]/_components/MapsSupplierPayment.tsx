"use client";

import React from "react";
import { MapPin, ExternalLink } from "lucide-react";
import { SupplierPayment } from "@/types/payment";

interface MapsSupplierPaymentProps {
  payment: SupplierPayment | null;
}

export default function MapsSupplierPaymentProps({
  payment,
}: MapsSupplierPaymentProps) {
  if (!payment) return null;

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200/80 shadow-xs aspect-video bg-zinc-900 flex flex-col justify-between p-4 group">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] bg-size-[16px_16px]" />
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent z-0" />

        <div className="z-10" />

        <div className="z-10 text-white space-y-1">
          <span className="text-[9px] font-bold tracking-wider uppercase text-emerald-400 flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Target Address
          </span>
          <h4 className="text-xs font-black truncate max-w-full">
            {payment.supplier?.information.address ||
              "No Address Configuration"}
          </h4>
          {payment.supplier?.information.address &&
            payment.supplier?.information.address !== "-" && (
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(payment.supplier?.information.address)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors mt-1"
              >
                Open in Google Maps <ExternalLink className="w-3 h-3" />
              </a>
            )}
        </div>
      </div>
    </>
  );
}
