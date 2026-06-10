"use client";

import React from "react";
import ButtonNav from "@/components/ui/button/ButtonNav";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/utils/helper";
import { CustomerPayment } from "@/types/payment";

interface HeaderCustomerPaymentProps {
  payment: CustomerPayment;
  isCompleted: boolean;
}

export default function HeaderCustomerPayment({
  payment,
  isCompleted,
}: HeaderCustomerPaymentProps) {
  const router = useRouter();
  if (!payment) return null;

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-brand-dark">
              PAY-{payment.payment_date}-00{payment.id}
            </h1>
            {isCompleted ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Completed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700 border border-red-200">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                Pending
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 font-medium mt-0.5">
            Processed on{" "}
            {payment.payment_date ? formatDate(payment.payment_date) : "-"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ButtonNav
            onClick={() => router.back()}
            variant="secondary"
            icon={<ArrowLeft className="w-4 h-4" />}
            iconPosition="left"
            fullWidth={false}
            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-100 rounded-xl transition-all border border-zinc-200 cursor-pointer"
          >
            Back to List
          </ButtonNav>
          {/* <ButtonNav
            onClick={() =>
              toast.success("Payment receipt printed successfully")
            }
            variant="primary"
            fullWidth={false}
            icon={<Printer className="w-4 h-4" />}
            iconPosition="left"
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-zinc-800 hover:bg-zinc-900 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            Print Receipt
          </ButtonNav> */}
        </div>
      </div>
    </>
  );
}
