"use client";
import React from "react";
import StatsCard from "@/components/ui/card/StatsCard";
import { formatRupiah } from "@/utils/helper";
import { CustomerPaymentStats, SupplierPaymentStats } from "@/types/payment";
import { ArrowDownLeft, ArrowUpRight, TrendingUp, Users } from "lucide-react";

interface StatsPaymentProps {
  customerStats: CustomerPaymentStats | null;
  supplierStats: SupplierPaymentStats | null;
  supplierCount: number;
  customerCount: number;
}

export default function StatsPayment({
  customerStats,
  supplierStats,
  supplierCount,
  customerCount,
}: StatsPaymentProps) {
  if (!customerStats) return null;
  if (!supplierStats) return null;
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2   gap-5">
        <StatsCard
          title="Total Cash Inflow"
          value={
            customerStats.total_cash_in_flow
              ? formatRupiah(customerStats.total_cash_in_flow)
              : "Rp 0"
          }
          icon={<ArrowDownLeft className="w-4 h-4" />}
          iconBgColor="bg-emerald-500/10"
          iconColor="text-emerald-500"
        />
        <StatsCard
          title="Total Cash Outflow"
          value={
            supplierStats.total_cash_out_flow
              ? formatRupiah(supplierStats.total_cash_out_flow)
              : "Rp 0"
          }
          icon={<ArrowUpRight className="w-4 h-4" />}
          iconBgColor="bg-rose-500/10"
          iconColor="text-rose-500"
        />
        <StatsCard
          title="Client Invoices Handled"
          value={customerCount}
          icon={<Users className="w-4 h-4" />}
          iconBgColor="bg-blue-500/10"
          iconColor="text-blue-500"
        />
        <StatsCard
          title="Supplier Invoices Handled"
          value={supplierCount}
          icon={<TrendingUp className="w-4 h-4" />}
          iconBgColor="bg-amber-500/10"
          iconColor="text-amber-500"
        />
      </div>
    </>
  );
}
