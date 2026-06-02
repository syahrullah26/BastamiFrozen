"use client";
import React, { useState, useEffect, useSyncExternalStore } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { formatDate, formatRupiah } from "@/utils/helper";
import { SaleService } from "@/services/saleService";
import { Sale } from "@/types/sale";

import {
  ArrowLeft,
  FilePen,
  Calendar,
  BoxIcon,
  Printer,
  DollarSignIcon,
  Phone,
  User,
  ShoppingBag,
} from "lucide-react";
import ButtonNav from "@/components/ui/button/ButtonNav";

const emptySubscribe = () => () => {};

export default function SaleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);

  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!id || id === "undefined") return;
    const fetchSale = async () => {
      try {
        setLoading(true);
        const data = await SaleService.getSale(id);
        setSale(data);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          return;
        }
        toast.error("Failed to load sale");
      } finally {
        setLoading(false);
      }
    };
    fetchSale();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-dark border-t-transparent" />
      </div>
    );
  }

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
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-5 rounded-2xl border border-zinc-200/60 bg-white shadow-3xs">
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 w-full lg:max-w-md">
          <div className="flex items-center justify-start">
            <span className="text-lg font-black tracking-tight text-zinc-800 font-mono">
              #{sale?.invoice_number || "—"}
            </span>
          </div>
          <div className="flex items-center justify-end">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                sale?.status === "unpaid"
                  ? "text-amber-600 bg-amber-50 border-amber-200/60"
                  : "text-emerald-600 bg-emerald-50 border-emerald-200/60"
              }`}
            >
              {sale?.status || "—"}
            </span>
          </div>
          <div className="flex items-center justify-start">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400">
              <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              {sale?.transaction_date ? formatDate(sale.transaction_date) : "—"}
            </span>
          </div>
          <div className="flex items-center justify-end">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400">
              <BoxIcon className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              {sale?.items?.length || 0} Products
            </span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 w-full lg:w-auto min-w-70">
          <div className="w-full">
            <ButtonNav
              href={`/sales/${sale?.id}/edit`}
              className="w-full justify-center px-3 py-2 text-xs font-semibold rounded-xl"
              icon={<FilePen className="w-3.5 h-3.5" />}
              iconPosition="left"
              variant="neutral"
              fullWidth={false}
            >
              Edit
            </ButtonNav>
          </div>
          <div className="w-full">
            <ButtonNav
              className="w-full justify-center px-3 py-2 text-xs font-semibold rounded-xl"
              icon={<Printer className="w-3.5 h-3.5" />}
              variant="secondary"
              iconPosition="left"
              fullWidth={false}
            >
              Print
            </ButtonNav>
          </div>
          <div className="w-full">
            <ButtonNav
              className="w-full justify-center px-3 py-2 text-xs font-semibold rounded-xl"
              icon={<DollarSignIcon className="w-3.5 h-3.5" />}
              iconPosition="left"
              fullWidth={false}
            >
              Payment
            </ButtonNav>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 mt-6">
        <div className="flex flex-col gap-4 p-5 rounded-2xl border border-zinc-200/60 bg-white shadow-3xs">
          <div className="border-b border-zinc-100 pb-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 font-sans flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              Customer Details
            </h3>
          </div>
          <div className="space-y-3.5">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-sans">
                Full Name
              </span>
              <span className="text-xs font-bold text-zinc-800">
                {sale?.customer?.name || "-"}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-sans">
                Address / Location
              </span>
              <span className="text-xs font-medium text-zinc-600 leading-relaxed">
                {sale?.customer?.location || "-"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-1.5 border-t border-zinc-50">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-sans flex items-center gap-1">
                  <Phone className="w-3 h-3" /> Phone
                </span>
                <span className="text-xs font-semibold font-mono text-zinc-600">
                  {sale?.customer?.phone || "-"}
                </span>
              </div>

              <div className="flex flex-col gap-1 items-end text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-sans">
                  Remaining Bills
                </span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-black font-mono border ${
                    Number(sale?.customer?.remaining_bill || 0) === 0
                      ? "text-emerald-600 bg-emerald-50 border-emerald-100"
                      : "text-rose-600 bg-rose-50 border-rose-100"
                  }`}
                >
                  {isClient
                    ? formatRupiah(Number(sale?.customer?.remaining_bill || 0))
                    : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 p-5 rounded-2xl border border-zinc-200/60 bg-white shadow-3xs">
          <div className="border-b border-zinc-100 pb-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 font-sans flex items-center gap-2">
              <DollarSignIcon className="w-3.5 h-3.5 text-brand-primary shrink-0" />
              Total Amount
            </h3>
          </div>
          <div className="flex flex-col justify-center flex-1 py-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-sans mb-1">
              Accumulated Total
            </span>
            <span className="text-2xl font-black font-mono text-zinc-800 tracking-tight">
              {isClient ? formatRupiah(sale?.amount.total_amount || 0) : "—"}
            </span>
          </div>
          <div className="pt-3 border-t border-zinc-50 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Payment Status
            </span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                sale?.status === "unpaid"
                  ? "text-amber-600 bg-amber-50 border-amber-200/60"
                  : "text-emerald-600 bg-emerald-50 border-emerald-200/60"
              }`}
            >
              {sale?.status}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-4 p-5 rounded-2xl border border-zinc-200/60 bg-white shadow-3xs">
          <div className="border-b border-zinc-100 pb-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 font-sans flex items-center gap-2">
              <DollarSignIcon className="w-3.5 h-3.5 shrink-0" />
              Remaining Bill
            </h3>
          </div>
          <div className="flex flex-col justify-center flex-1 py-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-sans mb-1">
              Outstanding Invoice
            </span>
            <span
              className={`text-2xl font-black font-mono tracking-tight ${
                Number(sale?.amount.remaining_bill || 0) === 0
                  ? "text-emerald-600"
                  : "text-rose-600"
              }`}
            >
              {isClient ? formatRupiah(sale?.amount.remaining_bill || 0) : "—"}
            </span>
          </div>
          <div className="pt-3 border-t border-zinc-50 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Collection Status
            </span>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                Number(sale?.amount.remaining_bill || 0) === 0
                  ? "text-emerald-600 bg-emerald-50 border-emerald-200/60"
                  : "text-rose-600 bg-rose-50 border-rose-200/60"
              }`}
            >
              {Number(sale?.amount.remaining_bill || 0) === 0
                ? "Settled"
                : "Pending"}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden mt-2">
        <div className="p-5 border-b border-slate-100 flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-brand-primary" />
          <h2 className="text-sm font-black uppercase tracking-wider text-brand-dark">
            Products items for #{sale?.invoice_number || "—"}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-primary-brand">
              <tr className="text-white text-xs font-black uppercase tracking-widest">
                <th className="py-3 px-4">No</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4 text-center">Qty / Unit</th>
                <th className="py-3 px-4 text-right">Price</th>
                <th className="py-3 px-4 text-right">HPP</th>
                <th className="py-3 px-4 text-right">Subtotal</th>
                <th className="py-3 px-4 text-right">Profit / Loss</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {!sale?.items || sale.items.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-slate-400 font-medium"
                  >
                    No items found for this sale.
                  </td>
                </tr>
              ) : (
                sale.items.map((item, index) => {
                  const isEven = index % 2 === 0;
                  const itemProfit = Number(item.gross_profit || 0);
                  const isLoss = itemProfit < 0;
                  const isBreakeven = itemProfit === 0;

                  return (
                    <tr
                      key={item.id || index}
                      className={`transition-colors duration-200 hover:bg-zinc-50 text-brand-dark font-medium border-b border-slate-100/60 last:border-0 ${
                        isEven ? "bg-slate-50/40" : "bg-white"
                      }`}
                    >
                      <td className="py-3.5 px-4 font-bold tracking-wide text-zinc-400 font-mono">
                        {index + 1}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-zinc-800">
                        {item.product_name}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block px-2 py-0.5 bg-zinc-100 text-zinc-600 font-mono font-bold text-xs rounded">
                          {item.quantity} {item.unit}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-zinc-500">
                        {isClient ? formatRupiah(Number(item.price)) : "—"}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-zinc-500">
                        {isClient
                          ? formatRupiah(Number(item.cost_price_at_sale))
                          : "—"}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-zinc-700">
                        {isClient ? formatRupiah(Number(item.subtotal)) : "—"}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md border font-mono ${
                            isLoss
                              ? "bg-rose-50 text-rose-600 border-rose-200"
                              : isBreakeven
                                ? "bg-zinc-50 text-zinc-600 border-zinc-200"
                                : "bg-emerald-50 text-emerald-600 border-emerald-200"
                          }`}
                        >
                          {!isLoss && !isBreakeven && "+"}
                          {isClient ? formatRupiah(itemProfit) : "—"}
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
