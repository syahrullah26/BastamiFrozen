"use client";

import React from "react";
import { Package, DollarSignIcon } from "lucide-react";
import { FilterType } from "./DashboardHeader";
import StatsCard from "@/components/ui/card/StatsCard";

interface DashboardSummary {
  total_orders: number;
  gross_revenue: number;
  total_cash_received: number;
  total_receivable: number;
}

interface DashboardStatsProps {
  filterType: FilterType;
  summary: DashboardSummary;
}

export default function DashboardStats({
  filterType,
  summary,
}: DashboardStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Sale"
        subtitle={`invoices this ${filterType}`}
        value={summary.total_orders}
        subvalue="Invoices"
        icon={<Package className="w-6 h-6 stroke-1" />}
      />

      <StatsCard
        title="Gross Revenue"
        subtitle={`gross this ${filterType}`}
        value={summary.gross_revenue}
        icon={<DollarSignIcon className="w-6 h-6 stroke-1" />}
        iconColor="text-primary-brand"
        iconBgColor="bg-primary-brand/10"
        textColor="text-primary-brand"
      />

      <StatsCard
        title="Collected Cash"
        subtitle={`Payment this ${filterType}`}
        value={summary.total_cash_received}
        icon={<DollarSignIcon className="w-6 h-6 stroke-1" />}
        iconColor="text-emerald-600"
        iconBgColor="bg-emerald-600/10"
        textColor="text-emerald-600"
      />

      <StatsCard
        title="Total Customer Bills"
        subtitle="Unpaid Invoice"
        value={summary.total_receivable}
        icon={<DollarSignIcon className="w-6 h-6 stroke-1" />}
        iconColor="text-rose-600"
        iconBgColor="bg-rose-600/10"
        textColor="text-rose-600"
      />
    </div>
  );
}
