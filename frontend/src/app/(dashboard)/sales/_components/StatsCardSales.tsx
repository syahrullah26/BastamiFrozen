"use client";

import React, { useSyncExternalStore } from "react";
import { Receipt, Clock, Calendar, DollarSign } from "lucide-react";
import StatsCard from "@/components/ui/card/StatsCard";
import { formatRupiah } from "@/utils/helper";

interface SaleStatsData {
  total_monthly_sale: number | string;
  total_pending_sale: number | string;
  total_monthly_paid_sale: number | string;
  total_remaining_bill: number | string;
}

interface StatsCardSalesProps {
  saleStats: SaleStatsData;
}

const emptySubscribe = () => () => {};

export default function StatsCardSales({ saleStats }: StatsCardSalesProps) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <StatsCard
          title="Sales This Month"
          value={saleStats.total_monthly_sale}
          icon={<Receipt className="w-5 h-5" />}
          iconBgColor="bg-rose-50"
          iconColor="text-rose-600"
        />
        <StatsCard
          title="Sales Pending"
          value={saleStats.total_pending_sale}
          icon={<Clock className="w-5 h-5" />}
          iconBgColor="bg-amber-50"
          iconColor="text-amber-600"
        />
        <StatsCard
          title="Sales Paid This Month"
          value={saleStats.total_monthly_paid_sale}
          icon={<Calendar className="w-5 h-5" />}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
        />
      </div>

      <div className="grid grid-cols-1">
        <StatsCard
          title="Remaining Bills"
          value={
            isClient
              ? formatRupiah(Number(saleStats.total_remaining_bill || 0))
              : "Rp 0"
          }
          icon={<DollarSign className="w-5 h-5" />}
          iconBgColor="bg-zinc-100"
          iconColor="text-zinc-900"
        />
      </div>
    </div>
  );
}
