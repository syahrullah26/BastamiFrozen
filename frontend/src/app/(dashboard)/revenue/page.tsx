"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { FinancialReport } from "@/types/financialReport";
import { FinancialReportService } from "@/services/financialReportService";
import TableData from "@/components/ui/Table/TableData";
import { formatRupiah } from "@/utils/helper";
import { expenseColumns } from "@/constants/DataTable/financialReportData";
import { FloatingInput } from "@/components/ui/input/FloatingInput";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Percent,
  Receipt,
  Layers,
  Scale,
  Calendar,
  AlertCircle,
  Loader2,
  Activity,
  PieChart,
} from "lucide-react";

export default function FinancialReportsPage() {
  const [report, setReport] = useState<FinancialReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<string>("monthly");

  const [filterDate, setFilterDate] = useState<string>(() => {
    const localDate = new Date();
    const offset = localDate.getTimezoneOffset();
    const adjustedDate = new Date(localDate.getTime() - offset * 60 * 1000);
    return adjustedDate.toISOString().split("T")[0];
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await FinancialReportService.getProfitLossReport(
        filterType,
        filterDate,
      );

      if (response) {
        setReport(response);
      } else {
        setReport(null);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      toast.error(`Failed to load financial report: ${errorMessage}`);
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [filterType, filterDate]);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (isMounted) {
        await loadData();
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [loadData]);

  const expenseRatio = useMemo(() => {
    if (!report?.summary?.gross_revenue || !report?.summary?.total_expenses)
      return 0;
    const ratio =
      (report.summary.total_expenses / report.summary.gross_revenue) * 100;
    return Math.round(ratio * 10) / 10;
  }, [report]);

  const topExpenses = useMemo(() => {
    if (!report?.expenses_breakdown || report.expenses_breakdown.length === 0)
      return [];
    return [...report.expenses_breakdown]
      .sort((a, b) => b.total - a.total)
      .slice(0, 3);
  }, [report]);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-6 bg-white border border-zinc-200/60 rounded-2xl shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-primary/10 rounded-xl text-primary shrink-0 mt-0.5">
            <Scale className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-brand-dark">
              Profit & Loss Statement
            </h1>
            <p className="text-xs md:text-sm text-gray-500">
              Report Period:{" "}
              <span className="font-semibold text-primary">
                {report?.summary?.period_label || "Calculating data..."}
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex rounded-xl border border-zinc-200/60 bg-zinc-50 p-1 shadow-inner">
            {["daily", "weekly", "monthly"].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3.5 py-1.5 text-xs font-semibold capitalize rounded-lg transition-all ${
                  filterType === type
                    ? "bg-white shadow-sm border border-zinc-200/50 text-brand-dark"
                    : "text-gray-500 hover:text-brand-dark"
                }`}
              >
                {type === "daily"
                  ? "Daily"
                  : type === "weekly"
                    ? "Weekly"
                    : "Monthly"}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-48">
            <FloatingInput
              type="date"
              label="Select Date"
              value={filterDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFilterDate(e.target.value)
              }
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-100 bg-white border border-zinc-200/60 rounded-2xl shadow-sm space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-gray-400">Loading</p>
        </div>
      ) : report && report.summary ? (
        <>
          <div
            className={`p-6 md:p-8 rounded-2xl border transition-all duration-300 shadow-sm ${
              report.summary.is_profit
                ? "bg-emerald-50  border-emerald-200"
                : "bg-rose-50  to-white border-rose-200"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Final Net Earnings (Net Profit)
                </p>
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl md:text-4xl font-black tracking-tight text-brand-dark">
                    {formatRupiah(report.summary.net_profit_loss)}
                  </h2>
                  <div
                    className={`p-1.5 rounded-lg ${
                      report.summary.is_profit
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {report.summary.is_profit ? (
                      <TrendingUp className="w-5 h-5" />
                    ) : (
                      <TrendingDown className="w-5 h-5" />
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-start sm:items-end gap-1">
                <span
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wide border uppercase ${
                    report.summary.is_profit
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                      : "bg-rose-50 border-rose-200 text-rose-700"
                  }`}
                >
                  Net Margin: {report.summary.profit_margin_pct}% Of Revenue
                </span>
                <p className="text-[10px] text-zinc-400">
                  Pure earnings you can take home or add to savings
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <Layers className="w-4 h-4 text-zinc-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Key Financial Metrics
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              <div className="bg-white p-5 border border-zinc-200/60 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-300 hover:bg-blue-50/10 transition-all duration-300 flex flex-col justify-between min-h-35 group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-wide truncate">
                      Gross Revenue (Turnover)
                    </p>
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-100 transition-colors shrink-0">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-xl md:text-2xl font-black tracking-tight text-brand-dark break-all">
                    {formatRupiah(report.summary.gross_revenue)}
                  </p>
                </div>
                <div className="pt-2 border-t border-dashed border-zinc-100 mt-2">
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Gross amount. Total customer spending before deductions.
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 border border-zinc-200/60 rounded-2xl shadow-sm hover:shadow-md hover:border-amber-300 hover:bg-amber-50/10 transition-all duration-300 flex flex-col justify-between min-h-35 group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-wide truncate">
                      Product Capital (HPP)
                    </p>
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-100 transition-colors shrink-0">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-xl md:text-2xl font-black tracking-tight text-amber-900 break-all">
                    {formatRupiah(report.summary.total_cogs)}
                  </p>
                </div>
                <div className="pt-2 border-t border-dashed border-zinc-100 mt-2">
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Initial base cost to purchase or manufacture sold goods.
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 border border-zinc-200/60 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-300 hover:bg-emerald-50/10 transition-all duration-300 flex flex-col justify-between min-h-35 group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-wide truncate">
                      Remaining Revenue (Gross Profit)
                    </p>
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-100 transition-colors shrink-0">
                      <Percent className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-xl md:text-2xl font-black tracking-tight text-primary break-all">
                    {formatRupiah(report.summary.gross_profit)}
                  </p>
                </div>
                <div className="pt-2 border-t border-dashed border-zinc-100 mt-2">
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Net sales output directly after deducting product capital.
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 border border-zinc-200/60 rounded-2xl shadow-sm hover:shadow-md hover:border-rose-300 hover:bg-rose-50/10 transition-all duration-300 flex flex-col justify-between min-h-35 group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-wide truncate">
                      Operating Expenses
                    </p>
                    <div className="p-2 bg-rose-50 text-rose-600 rounded-xl group-hover:bg-rose-100 transition-colors shrink-0">
                      <Receipt className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-xl md:text-2xl font-black tracking-tight text-rose-900 break-all">
                    {formatRupiah(report.summary.total_expenses)}
                  </p>
                </div>
                <div className="pt-2 border-t border-dashed border-zinc-100 mt-2">
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Non-product costs (Salaries, ads, bills, wifi, etc).
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white p-5 border border-zinc-200/60 rounded-2xl shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  <h4 className="font-bold text-sm tracking-tight text-brand-dark">
                    Expense Burn Rate
                  </h4>
                </div>
                <p className="text-xs text-zinc-400">
                  How much revenue goes directly into supporting operations.
                </p>
              </div>

              <div className="space-y-2 py-2">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-semibold text-zinc-500">
                    Operation Cost
                  </span>
                  <span
                    className={`text-sm font-black ${expenseRatio > 35 ? "text-rose-600" : "text-emerald-600"}`}
                  >
                    {expenseRatio}%{" "}
                    <span className="text-[10px] font-medium text-zinc-400">
                      of income
                    </span>
                  </span>
                </div>
                <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${expenseRatio > 35 ? "bg-rose-500" : "bg-emerald-500"}`}
                    style={{ width: `${Math.min(expenseRatio, 100)}%` }}
                  />
                </div>
              </div>

              <div
                className={`p-3 rounded-xl border text-xs ${
                  expenseRatio > 35
                    ? "bg-rose-50 border-rose-100 text-rose-700"
                    : "bg-emerald-50 border-emerald-100 text-emerald-700"
                }`}
              >
                {expenseRatio > 35
                  ? "⚠️ Expenses are slightly high. Review your breakdown to protect your net profit margin."
                  : "✨ Healthy ratio! Your operations are lean, keeping more pure profit in the business."}
              </div>
            </div>

            <div className="lg:col-span-2 bg-white p-5 border border-zinc-200/60 rounded-2xl shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-amber-500" />
                  <h4 className="font-bold text-sm tracking-tight text-brand-dark">
                    Top Operational Cost Burners
                  </h4>
                </div>
                <p className="text-xs text-zinc-400">
                  Quick visibility into the top 3 items draining your daily
                  operational budget.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:pt-2">
                {topExpenses.length > 0 ? (
                  topExpenses.map((item, index) => {
                    const pctOfExpenses =
                      report.summary.total_expenses > 0
                        ? Math.round(
                            (item.total / report.summary.total_expenses) * 100,
                          )
                        : 0;
                    const categoryName =
                      item.category === "pay_supplier"
                        ? "Supplier Payment"
                        : item.category;
                    return (
                      <div
                        key={index}
                        className="p-3 border border-zinc-100 bg-zinc-50/50 rounded-xl space-y-2 flex flex-col justify-between"
                      >
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400">
                            Rank #{index + 1}
                          </span>
                          <p className="text-xs font-bold text-brand-dark line-clamp-1">
                            {categoryName || "General Expense"}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-black text-zinc-700">
                            {formatRupiah(item.total)}
                          </p>
                          <p className="text-[10px] text-zinc-400">
                            Takes up {pctOfExpenses}% of total expenses
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-3 text-center py-6 text-xs text-zinc-400">
                    No cost burn distribution data available.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <Calendar className="w-4 h-4 text-zinc-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Sales Activity Summary
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              <div className="bg-white p-5 border border-zinc-200/60 rounded-2xl flex items-center justify-between shadow-sm hover:border-zinc-300 transition-all group">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Total Sales
                  </p>
                  <p className="text-xl md:text-2xl font-black text-brand-dark">
                    {report.summary.total_orders}{" "}
                    <span className="text-xs md:text-sm font-medium text-zinc-400 ml-1">
                      Transactions in This Period
                    </span>
                  </p>
                </div>
                <div className="p-3 bg-zinc-50 text-zinc-500 rounded-xl shrink-0 group-hover:bg-zinc-100 transition-colors">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white p-5 border border-zinc-200/60 rounded-2xl flex items-center justify-between shadow-sm hover:border-zinc-300 transition-all group">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Average Order Value (AOV)
                  </p>
                  <p className="text-xl md:text-2xl font-black text-brand-dark">
                    {formatRupiah(report.summary.average_order_value)}
                  </p>
                </div>
                <div className="p-3 bg-zinc-50 text-zinc-500 rounded-xl shrink-0 group-hover:bg-zinc-100 transition-colors">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-zinc-200/60 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-zinc-100 bg-zinc-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <h3 className="font-bold text-base md:text-lg tracking-tight text-brand-dark">
                  Operating Expenses Breakdown
                </h3>
                <p className="text-xs text-zinc-400">
                  Comprehensive breakdown of general cash expenditures affecting
                  business margins.
                </p>
              </div>
            </div>
            <div className="p-4 bg-white overflow-x-auto">
              {report.expenses_breakdown &&
              report.expenses_breakdown.length > 0 ? (
                <TableData
                  columns={expenseColumns}
                  data={report.expenses_breakdown}
                />
              ) : (
                <div className="text-center py-12 text-sm text-zinc-400 font-medium">
                  No expense records found for this period.
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-16 bg-white border border-zinc-200/60 rounded-2xl text-gray-400 font-medium shadow-sm flex flex-col items-center justify-center space-y-3">
          <div className="p-3 bg-zinc-50 text-zinc-400 rounded-full">
            <AlertCircle className="w-6 h-6" />
          </div>
          <p className="text-sm">
            No financial data found matching current filter configuration.
          </p>
        </div>
      )}
    </div>
  );
}
