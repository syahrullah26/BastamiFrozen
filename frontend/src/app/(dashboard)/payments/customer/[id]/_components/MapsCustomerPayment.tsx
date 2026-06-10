"use client";

import React from "react";
import { MapPin, ExternalLink } from "lucide-react";
import { CustomerPayment } from "@/types/payment";

interface MapsCustomerPaymentProps {
  payment: CustomerPayment | null;
}

export default function MapsCustomerPaymentProps({
  payment,
}: MapsCustomerPaymentProps) {
  if (!payment) return null;

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200/80 shadow-xs aspect-video bg-zinc-900 flex flex-col justify-between p-4 group">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] bg-size-[16px_16px]" />
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent z-0" />

        <div className="z-10" />

        <div className="z-10 text-white space-y-1">
          <span className="text-[9px] font-bold tracking-wider uppercase text-blue-400 flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Delivery Destination
          </span>
          <h4 className="text-xs font-black truncate max-w-full">
            {payment.customer?.location || "No Location Configured"}
          </h4>
          {payment.customer?.location && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(payment.customer.location)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-400 hover:text-blue-300 transition-colors mt-1"
            >
              Open in Google Maps <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </>
  );
}
