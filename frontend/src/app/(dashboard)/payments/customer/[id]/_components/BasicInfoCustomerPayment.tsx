"use client";
import React from "react";
import { CustomerPayment } from "@/types/payment";
import { formatDate, formatRupiah } from "@/utils/helper";
import ButtonNav from "@/components/ui/button/ButtonNav";
import { Calendar, FilePen, MapPin, Phone, User } from "lucide-react";

interface BasicInfoCustomerPaymentProps {
  payment: CustomerPayment | null;
}

export default function BasicInfoCustomer({
  payment,
}: BasicInfoCustomerPaymentProps) {
  if (!payment) return null;
  return (
    <>
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
          <h2 className="text-base font-bold text-brand-dark">
            Payment Information
          </h2>
          <ButtonNav
            href={`/payments/customer/${payment.id}/edit`}
            className="flex items-center gap-1 text-xs font-bold text-primary-brand hover:text-primary-brand/80 cursor-pointer"
            variant="secondary"
            fullWidth={false}
          >
            <FilePen className="w-3.5 h-3.5" /> Edit Transaction
          </ButtonNav>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
              Amount Paid
            </span>
            <span className="text-xl font-black text-primary-brand">
              {formatRupiah(payment.amount)}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
              Payment Date
            </span>
            <div className="flex items-center gap-1.5 text-zinc-700 text-sm font-semibold">
              <Calendar className="w-4 h-4 text-zinc-400" />
              {payment.payment_date ? formatDate(payment.payment_date) : "-"}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-zinc-100">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
              Customer Details
            </span>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-primary-brand font-bold text-sm border border-blue-100">
                {payment.customer?.name?.charAt(0) || "C"}
              </div>
              <div>
                <h4 className="text-sm font-bold text-brand-dark flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-zinc-400" />
                  {payment.customer?.name}
                </h4>
                <p className="text-xs text-zinc-500 font-medium flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-zinc-400" />
                  {payment.customer?.phone || "-"}
                </p>
              </div>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
              Location
            </span>
            <div className="flex items-start gap-2 text-zinc-600 text-xs font-medium leading-relaxed">
              <MapPin className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
              <span>
                {payment.customer?.location || "No address details available."}
              </span>
            </div>
          </div>
        </div>

        {payment.notes && (
          <div className="pt-4 border-t border-zinc-100">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
              Transaction Notes
            </span>
            <div className="bg-zinc-50 border border-zinc-200/60 rounded-xl p-3 text-xs font-semibold text-zinc-600 italic border-l-4 border-l-blue-500">
              {payment.notes}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
