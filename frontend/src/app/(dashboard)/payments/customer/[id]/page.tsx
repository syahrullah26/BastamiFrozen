"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { PaymentService } from "@/services/paymentService";
import { CustomerPayment } from "@/types/payment";
import { formatRupiah, formatDate, formatTimeOnly } from "@/utils/helper";
import {
  ArrowLeft,
  FilePen,
  Calendar,
  User,
  FileText,
  Clock,
  MapPin,
  Phone,
  CheckCircle2,
  CreditCard,
  ExternalLink,
} from "lucide-react";
import ButtonNav from "@/components/ui/button/ButtonNav";

export default function CustomerPaymentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [payment, setPayment] = useState<CustomerPayment | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id || id === "undefined") return;
    const fetchPayment = async () => {
      try {
        setLoading(true);
        const data = await PaymentService.getCustomerPayment(Number(id));
        setPayment(data);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          return;
        } else {
          toast.error("Failed to load payment data");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPayment();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-dark border-t-transparent" />
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="flex flex-col h-[40vh] items-center justify-center gap-2">
        <p className="text-sm font-medium text-zinc-500">
          Customer Payment data not found.
        </p>
        <button
          onClick={() => router.back()}
          className="text-xs font-bold text-primary-brand flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
      </div>
    );
  }

  const isCompleted = payment.customer?.remaining_bill === 0;
  const totalOrderEstimate =
    payment.amount + (payment.customer?.remaining_bill || 0);
  const paymentPercentage =
    totalOrderEstimate > 0
      ? Math.round((payment.amount / totalOrderEstimate) * 100)
      : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-2">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
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
                  {payment.payment_date
                    ? formatDate(payment.payment_date)
                    : "-"}
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
                    {payment.customer?.location ||
                      "No address details available."}
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
                  Verification network successful via payment automation
                  gateway.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs p-6 space-y-4">
            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-0.5">
                Financial Status
              </span>
              <h3 className="text-xs font-semibold text-zinc-400">
                Remaining Bills
              </h3>
            </div>

            <div className="text-2xl font-black text-red-500">
              {formatRupiah(payment.customer?.remaining_bill || 0)}
            </div>

            <div className="space-y-1">
              <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                <div
                  className="h-full text-primary-brand rounded-full transition-all duration-500"
                  style={{ width: `${paymentPercentage}%` }}
                />
              </div>
              <p className="text-[10px] text-zinc-400 font-semibold italic">
                {paymentPercentage}% of total order estimates (
                {formatRupiah(totalOrderEstimate)}) has been cleared.
              </p>
            </div>

            <button
              onClick={() =>
                toast.success("Record management framework triggered")
              }
              className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-primary-brand bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all cursor-pointer"
            >
              <CreditCard className="w-4 h-4" /> Record Remaining Payment
            </button>
          </div>
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
          <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs p-6 space-y-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Related Documents
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-zinc-100 bg-zinc-50/50 rounded-xl hover:border-zinc-200 transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 border border-blue-100 rounded-lg text-primary-brand">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-brand-dark">
                      Order Document
                    </h5>
                    <p className="text-[10px] text-zinc-400 font-medium">
                      Linked Customer Bill
                    </p>
                  </div>
                </div>
                <ButtonNav
                  href={`/customers/${payment.customer?.id}`}
                  icon={<ExternalLink className="w-4 h-4" />}
                  fullWidth={false}
                  variant="secondary"
                  className="text-zinc-400 hover:text-brand-dark transition-colors cursor-pointer"
                />
              </div>

              {/* <div className="flex items-center justify-between p-3 border border-zinc-100 bg-zinc-50/50 rounded-xl hover:border-zinc-200 transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 border border-purple-100 rounded-lg text-purple-600">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-brand-dark">
                      System Invoice
                    </h5>
                    <p className="text-[10px] text-zinc-400 font-medium">
                      PDF Format
                    </p>
                  </div>
                </div>
                <ButtonNav
                  onClick={() =>
                    toast.success("Button Print Pressed Successfully")
                  }
                  icon={<Download className="w-4 h-4" />}
                  fullWidth={false}
                  variant="secondary"
                  className="text-zinc-400 hover:text-brand-dark transition-colors cursor-pointer"
                />
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
