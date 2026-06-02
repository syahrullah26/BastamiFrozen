"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { CustomerService } from "@/services/customerService";
import { Customer } from "@/types/customer";
import { toast } from "sonner";
import axios from "axios";
import { formatDate, formatRupiah } from "@/utils/helper";
import {
  ArrowLeft,
  Clock,
  FilePen,
  Plus,
  FileText,
  DollarSign,
  Calendar,
} from "lucide-react";
import ButtonNav from "@/components/ui/button/ButtonNav";
import StatsCard from "@/components/ui/card/StatsCard";

export default function CustomerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params?.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCustomer = async () => {
      if (!customerId || customerId === "undefined") return;
      try {
        setLoading(true);
        const data = await CustomerService.getCustomer(customerId);
        setCustomer(data);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          return;
        }
        toast.error("Failed to load customer");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [customerId]);

  const totalUnpaidCount =
    customer?.sale?.filter((sale) => sale.status === "unpaid").length || 0;
  const latestPayment =
    customer?.customer_payment && customer.customer_payment.length > 0
      ? customer.customer_payment[customer.customer_payment.length - 1]
      : null;
  const totalRemainingBill = customer?.remaining_bill || 0;

  const getRecentSale = customer?.sale
    ? customer.sale
        .filter((sale) => sale.status === "unpaid")
        .slice(-5)
        .reverse()
    : [];

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="w-full border-b border-slate-100 pb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-none">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1 text-brand-dark hover:text-brand-primary cursor-pointer transition-colors group"
            >
              <div className="p-2 rounded-xl group-hover:bg-brand-primary/10 transition-all duration-300">
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              </div>
              <span className="text-xs font-black uppercase tracking-[0.2em] pl-1 hidden xs:inline">
                Back
              </span>
            </button>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-none">
            <ButtonNav
              href={`/customers/${customer?.id}/edit`}
              className="px-3 py-2 text-xs sm:text-sm font-medium"
              icon={<FilePen className="w-3.5 h-3.5" />}
            >
              Edit
            </ButtonNav>
            <ButtonNav
              href={`/payments`}
              className="bg-brand-dark text-cloud-white hover:bg-brand-primary transition-colors px-3 py-2 text-xs sm:text-sm font-medium"
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Sales
            </ButtonNav>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-snow-white p-6 rounded-xl border border-foreground/30 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-brand-primary">
            Customer Profile
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-brand-dark mt-1">
            {customer?.name}
          </h1>
          <p className="text-sm text-slate-500 mt-2 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            {customer?.location || "No Location Listed"}
          </p>
        </div>
        <div className="text-right w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block">
            Total Remaining Bill
          </span>
          <span className="text-2xl font-black text-brand-dark block mt-1">
            {formatRupiah(totalRemainingBill || 0)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <StatsCard
          title="Total Unpaid"
          value={totalUnpaidCount}
          icon={<FileText className="w-4 h-4" />}
          iconBgColor="bg-orange-400/10"
          iconColor="text-orange-400"
        />
        <StatsCard
          title="Latest Payment"
          value={formatRupiah(latestPayment?.amount || 0)}
          icon={<DollarSign className="w-4 h-4" />}
          iconBgColor="bg-emerald-400/10"
          iconColor="text-emerald-400"
        />
        <StatsCard
          title="Total Remaining Bill"
          value={formatRupiah(totalRemainingBill || 0)}
          icon={<Clock className="w-4 h-4" />}
          iconBgColor="bg-red-400/10"
          iconColor="text-red-400"
        />
      </div>
      <div className="bg-snow-white border border-slate-100 rounded-xl shadow-sm overflow-hidden mt-2">
        <div className="p-5 border-b border-slate-100 flex items-center gap-2">
          <Clock className="w-4 h-4 text-brand-primary" />
          <h2 className="text-sm font-black uppercase tracking-wider text-brand-dark">
            Recent Unpaid Transactions
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-primary-brand">
              <tr className=" text-ghost-white text-xs font-black uppercase tracking-widest">
                <th className="py-3 px-4">Invoice Number</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Grand Total</th>
                <th className="py-3 px-4">Remaining Bill</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-slate-400 font-medium animate-pulse"
                  >
                    Loading transactions...
                  </td>
                </tr>
              ) : getRecentSale.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-slate-400 font-medium"
                  >
                    No unpaid transactions found.
                  </td>
                </tr>
              ) : (
                getRecentSale.map((sale, index) => {
                  const isEven = index % 2 === 0;
                  return (
                    <tr
                      key={sale.id || index}
                      className={`transition-colors duration-200 hover:bg-brand-primary/20 text-brand-dark font-medium ${
                        isEven ? "bg-background/40" : "bg-snow-white"
                      }`}
                    >
                      <td className="py-3.5 px-4 font-bold tracking-wide">
                        {sale.invoice_number ||
                          `#${sale.id?.toString().slice(0, 8)}`}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formatDate(sale.transaction_date)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        Rp{" "}
                        {(sale.amount.total_amount || 0).toLocaleString(
                          "id-ID",
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-amber-600 font-bold">
                        Rp{" "}
                        {(sale.amount.remaining_bill || 0).toLocaleString(
                          "id-ID",
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-md bg-amber-50 text-amber-600 border border-amber-200">
                          {sale.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
