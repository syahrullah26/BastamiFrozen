"use client";

import React from "react";
import StatsCard from "@/components/ui/card/StatsCard";
import { Calendar, Clock, DollarSign, Receipt } from "lucide-react";

interface PurchaseStatsProps {
  totalMonthlyPurchase: number;
  totalPendingPurchase: number;
  totalPaidMonthlyPurchase: number;
  totalRemainingBill: number;
}

export default function PurchaseStatsCard({
  totalMonthlyPurchase,
  totalPendingPurchase,
  totalPaidMonthlyPurchase,
  totalRemainingBill,
}: PurchaseStatsProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Purchases This Month"
          value={totalMonthlyPurchase}
          icon={<Receipt className="w-6 h-6" />}
          iconBgColor="bg-rose-500/10"
          iconColor="text-rose-500"
        />
        <StatsCard
          title="Purchases Pending"
          value={totalPendingPurchase}
          icon={<Clock className="w-6 h-6" />}
          iconBgColor="bg-amber-500/10"
          iconColor="text-amber-500"
        />
        <StatsCard
          title="Purchases Paid This Month"
          value={totalPaidMonthlyPurchase}
          icon={<Calendar className="w-6 h-6" />}
          iconBgColor="bg-emerald-500/10"
          iconColor="text-emerald-500"
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <StatsCard
          title="Remaining Bills"
          value={
            totalRemainingBill > 0
              ? `Rp ${totalRemainingBill.toLocaleString()}`
              : "Rp 0"
          }
          icon={<DollarSign className="w-6 h-6" />}
          iconBgColor="bg-primary-brand/10"
          iconColor="text-primary-brand"
        />
      </div>
    </>
  );
}
