"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { FinancialReportService } from "@/services/financialReportService";
import { DashboardData } from "@/types/financialReport";

import RevenueChart from "./_components/RevenueChart";
import DashboardHeader from "./_components/DashboardHeader";
import DashboardCogsAlert from "./_components/DashboardCogsAlert";
import DashboardStats from "./_components/DashboardStats";
import TopProductsTable from "./_components/TopProductsTable";
import AgingReceivablesTable from "./_components/AgingReceivable";
import GlobalLoader from "@/components/ui/common/GlobalLoading";
import EmptyState from "@/components/ui/common/EmptyState";

type FilterType = "daily" | "weekly" | "monthly";

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<FilterType>("daily");

  const loadData = useCallback(async (type: FilterType) => {
    try {
      setLoading(true);
      const data = await FinancialReportService.getDashboardData(type);
      setDashboardData(data);
    } catch (error) {
      toast.error("Failed to load dashboard data: " + error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (!isMounted) return;
      await loadData(filterType);
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [filterType, loadData]);

  if (loading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <GlobalLoader message="Loading..." />
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <EmptyState
        title="No Dashboard Data Available"
        description="We couldn't find any financial activities for the selected date range."
      />
    );
  }

  const { alerts, top_products, aging_receivables, chart_data } = dashboardData;

  const chartLabels = chart_data.map((item) => item.label);
  const chartRevenue = chart_data.map((item) => item.revenue);
  const chartCash = chart_data.map((item) => item.cash);

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto bg-zinc-50/50 min-h-screen">
      <DashboardHeader
        filterType={filterType}
        onFilterChange={(type) => setFilterType(type)}
      />

      <DashboardCogsAlert zeroCogsCount={alerts.zero_cogs_count} />

      <DashboardStats filterType={filterType} summary={dashboardData.summary} />

      <div className="p-5 bg-white border border-zinc-200 rounded-2xl shadow-sm">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-zinc-800">
            Financial Trend Chart (
            {filterType === "daily"
              ? "Daily"
              : filterType === "weekly"
                ? "Weekly"
                : "Monthly"}
            )
          </h3>
          <p className="text-xs text-zinc-400">
            Visual comparison between gross revenue generated and actual
            physical cash incoming.
          </p>
        </div>
        <RevenueChart
          labels={chartLabels}
          revenueData={chartRevenue}
          cashData={chartCash}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <TopProductsTable products={top_products} />
        <AgingReceivablesTable receivables={aging_receivables} />
      </div>
    </div>
  );
}
