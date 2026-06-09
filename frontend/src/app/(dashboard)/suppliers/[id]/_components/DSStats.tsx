"use client";

import React, { useSyncExternalStore } from "react";
import { DollarSign, Receipt, CreditCard } from "lucide-react";
import StatsCard from "@/components/ui/card/StatsCard";
import { formatRupiah } from "@/utils/helper";

interface DSStatsProps {
  totalUnpaidCount: number;
  latestPayment: number;
  remainingBill: number;
}

const emptySubscribe = () => () => {};

export default function DSStats({
  totalUnpaidCount,
  latestPayment,
  remainingBill,
}: DSStatsProps) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatsCard
        title="Unpaid Purchases"
        value={`${totalUnpaidCount} Bills`}
        icon={<Receipt className="w-4 h-4 text-zinc-500" />}
        iconColor="text-zinc-500"
        iconBgColor="bg-zinc-50"
        textColor="text-zinc-900"
      />
      <StatsCard
        title="Latest Payment"
        value={isClient ? formatRupiah(latestPayment) : "Rp 0"}
        icon={<DollarSign className="w-4 h-4 " />}
        iconColor="text-primary-brand"
        iconBgColor="bg-primary-brand/10"
        textColor="text-primary-brand"
      />
      <StatsCard
        title="Remaining Bill"
        value={isClient ? formatRupiah(remainingBill) : "Rp 0"}
        icon={<CreditCard className="w-4 h-4 text-zinc-500" />}
        iconColor="text-rose-500"
        iconBgColor="bg-rose-500/10"
        textColor="text-rose-500"
      />
    </div>
  );
}
