"use client";

import React from "react";
import { CheckCircle2, Clock, CreditCard } from "lucide-react";
import { CustomerPayment } from "@/types/payment";
import { formatTimeOnly } from "@/utils/helper";

interface LogsCustomerPaymentProps {
  payment: CustomerPayment | null;
}

export default function LogsCustomerPayment({
  payment,
}: LogsCustomerPaymentProps) {
  if (!payment) return null;
  return (
    <>
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs p-6 space-y-4">
        <h3 className="text-base font-bold text-brand-dark">Audit Log</h3>
        <div className="relative border-l border-zinc-200 pl-6 ml-3 space-y-6">
          <div className="relative">
            <span className="absolute -left-7.75 top-0 flex h-4 w-4 items-center justify-center rounded-full text-primary-brand ring-4 ring-white">
              <CheckCircle2 className="h-3 w-3 text-primary-brand" />
            </span>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <h4 className="text-xs font-bold text-brand-dark">
                System Updated
              </h4>
              <span className="text-[10px] font-medium text-zinc-400 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Today,{" "}
                {formatTimeOnly(payment.updated_at)}
                WIB
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-medium mt-0.5">
              Database entry confirmed and ledger records updated securely.
            </p>
          </div>

          <div className="relative">
            <span className="absolute -left-7.75 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 ring-4 ring-white">
              <CreditCard className="h-2.5 w-2.5 text-white" />
            </span>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <h4 className="text-xs font-bold text-brand-dark">
                Payment Received
              </h4>
              <span className="text-[10px] font-medium text-zinc-400 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Today,{" "}
                {formatTimeOnly(payment.created_at)}
                WIB
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-medium mt-0.5">
              Verification network successful via payment automation gateway.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
