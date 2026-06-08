"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { FinancialReportService } from "@/services/financialReportService";
import { DashboardData } from "@/types/financialReport";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

type FilterType = "daily" | "weekly" | "monthly";

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<FilterType>("daily");

  const formatCurrency = (value: number | string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(value));
  };

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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-800" />
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-6 text-center text-zinc-500 border border-dashed rounded-2xl">
        No dashboard data available.
      </div>
    );
  }

  const { summary, alerts, top_products, aging_receivables, chart_data } =
    dashboardData;

  const chartLabels = chart_data.map((item) => item.label);
  const chartRevenue = chart_data.map((item) => item.revenue);
  const chartCash = chart_data.map((item) => item.cash);

  const lineChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: "Gross Revenue",
        data: chartRevenue,
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.05)",
        tension: 0.3,
        fill: true,
      },
      {
        label: "Realized Cash",
        data: chartCash,
        borderColor: "rgb(16, 185, 129)",
        backgroundColor: "rgba(16, 185, 129, 0.05)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          boxWidth: 12,
          font: { size: 12, weight: "bold" as const },
        },
      },
    },
    scales: {
      y: {
        grid: { color: "rgba(244, 244, 245, 1)" },
        ticks: { font: { size: 11 } },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
    },
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto bg-zinc-50/50 min-h-screen">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Dashboard
          </h1>
          <p className="text-sm text-zinc-500">
            Overview of system sales performance and financial controls.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl self-start sm:self-auto border border-zinc-200">
          <button
            onClick={() => setFilterType("daily")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer  ${
              filterType === "daily"
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setFilterType("weekly")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              filterType === "weekly"
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setFilterType("monthly")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              filterType === "monthly"
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      {alerts.zero_cogs_count > 0 && (
        <div className="p-4 border border-rose-200 bg-rose-50/50 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="px-2.5 py-1 bg-rose-100 text-rose-700 rounded-lg font-bold text-sm">
              {alerts.zero_cogs_count}
            </div>
            <div>
              <h5 className="text-sm font-bold text-rose-950">
                Transaction Items with Missing Cost (COGS 0)
              </h5>
              <p className="text-xs text-rose-700">
                Some sold items have no cost price configuration. Please review
                your product data entries.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="p-5 bg-white border border-zinc-200 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-700">
            Total Sale
          </p>
          <p className="mt-2 text-3xl font-bold text-zinc-900">
            {summary.total_orders} Invoices
          </p>
        </div>

        <div className="p-5 bg-white border border-zinc-200 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-700">
            Gross Revenue
          </p>
          <p className="mt-2 text-2xl font-bold text-primary-brand">
            {formatCurrency(summary.gross_revenue)}
          </p>
        </div>

        <div className="p-5 bg-white border border-zinc-200 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-700">
            Collected Cash
          </p>
          <p className="text-xs tracking-wider text-zinc-400">
            Customer Payment
          </p>

          <p className="mt-2 text-2xl font-bold text-emerald-600">
            {formatCurrency(summary.total_cash_received)}
          </p>
        </div>

        <div className="p-5 bg-white border border-zinc-200 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-700">
            Total Customer Bills
          </p>
          <p className="text-xs tracking-wider text-zinc-400">Unpaid Invoice</p>
          <p className="mt-2 text-2xl font-bold text-rose-600">
            {formatCurrency(summary.total_receivable)}
          </p>
        </div>
      </div>

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
        <div className="h-75 w-full">
          <Line data={lineChartData} options={lineChartOptions} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="p-5 bg-white border border-zinc-200 rounded-2xl shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-zinc-800">
              Top 5 Products (All-Time)
            </h3>
            <p className="text-xs text-zinc-400">
              Ranked by total quantity sold volume across all orders.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-zinc-100 text-zinc-400 text-xs uppercase font-semibold">
                  <th className="pb-3">Product Name</th>
                  <th className="pb-3 text-right">Volume</th>
                  <th className="pb-3 text-right">Order Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-medium text-zinc-700">
                {top_products.map((product) => (
                  <tr
                    key={product.product_id}
                    className="group hover:bg-zinc-50/50"
                  >
                    <td className="py-3.5 pr-2 font-semibold text-zinc-900">
                      {product.product_name}
                    </td>
                    <td className="py-3.5 text-right font-bold text-zinc-900">
                      {Number(product.total_qty_sold).toLocaleString("en-US")}{" "}
                      {product.unit_name || "pcs"}
                    </td>
                    <td className="py-3.5 text-right text-zinc-500">
                      {product.total_times_ordered} times
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-5 bg-white border border-zinc-200 rounded-2xl shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-zinc-800">
              Top Aging Receivables
            </h3>
            <p className="text-xs text-zinc-400">
              Customers with the largest outstanding uncollected balances.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-zinc-100 text-zinc-400 text-xs uppercase font-semibold">
                  <th className="pb-3">Customer Name</th>
                  <th className="pb-3 text-right">Oldest Invoice</th>
                  <th className="pb-3 text-right">Remaining Debt</th>
                  <th className="pb-3 text-right">Debt Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-medium text-zinc-700">
                {aging_receivables.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="p-3 bg-zinc-50 rounded-full border border-zinc-100 text-zinc-400">
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              path="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-sm font-semibold text-zinc-800">
                            No critical aging receivables
                          </p>
                          <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                            All outstanding invoices are currently under 7 days
                            or fully settled.
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  aging_receivables.map((debtor) => (
                    <tr
                      key={debtor.customer_id}
                      className="group hover:bg-zinc-50/50"
                    >
                      <td className="py-3.5 pr-2 font-semibold text-zinc-900">
                        <div>{debtor.customer_name}</div>
                      </td>

                      <td className="py-3.5 text-right text-amber-600 font-bold">
                        <div className="flex flex-col items-end gap-1 justify-center">
                          <span className="px-2 py-0.5 text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 rounded-full">
                            {debtor.oldest_invoice_days} Days
                          </span>
                          <span className="text-xs text-zinc-400 font-normal tracking-tight">
                            {debtor.invoice_number}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 text-right text-rose-600 font-bold">
                        {formatCurrency(debtor.remaining_debt)}
                      </td>

                      <td className="py-3.5 text-right vertical-align-middle">
                        {(() => {
                          const isHighRisk = debtor.debt_status === "High Risk";
                          const badgeStyles = isHighRisk
                            ? "bg-rose-50 text-rose-700 border-rose-200/60"
                            : "bg-amber-50 text-amber-700 border-amber-200/60";

                          return (
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${badgeStyles}`}
                            >
                              <span className="relative flex h-1.5 w-1.5">
                                {isHighRisk && (
                                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75"></span>
                                )}
                                <span
                                  className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isHighRisk ? "bg-rose-500" : "bg-amber-500"}`}
                                />
                              </span>
                              {debtor.debt_status}
                            </span>
                          );
                        })()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
