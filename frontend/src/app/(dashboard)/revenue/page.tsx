"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { FinancialReport } from "@/types/financialReport";
import { FinancialReportService } from "@/services/financialReportService";
import { expenseColumns } from "@/constants/DataTable/financialReportData";
import HeaderRevenue from "./_components/HeaderRevenue";
import GlobalLoader from "@/components/ui/common/GlobalLoading";
import AlertRevenue from "./_components/AlertRevenue";
import StatsRevenue from "./_components/StatsRevenue";
import ExpenseRatioRevenue from "./_components/ExpenseRatioRevenue";
import TopExpensesRevenue from "./_components/TopExpenseRevenue";
import SalesStatsRevenue from "./_components/SalesStatsRevenue";
import TableRevenue from "./_components/TableRevenue";
import EmptyExpenseRevenue from "./_components/EmptyExpenseRevenue";

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
      <HeaderRevenue
        report={report}
        filterType={filterType}
        setFilterType={setFilterType}
        filterDate={filterDate}
        setFilterDate={setFilterDate}
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-100 bg-white border border-zinc-200/60 rounded-2xl shadow-sm space-y-4">
          <GlobalLoader message="Calculating data..." fullScreen={false} />
        </div>
      ) : report && report.summary ? (
        <>
          <AlertRevenue summary={report.summary} />
          <StatsRevenue summary={report.summary} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ExpenseRatioRevenue expenseRatio={expenseRatio} />

            <div className="lg:col-span-2 bg-white p-5 border border-zinc-200/60 rounded-2xl shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-1">
                <TopExpensesRevenue
                  topExpenses={topExpenses}
                  summary={report.summary}
                />
              </div>
            </div>
          </div>
          <SalesStatsRevenue summary={report.summary} />
          <div className="bg-white border border-zinc-200/60 rounded-2xl shadow-sm overflow-hidden">
            <TableRevenue
              expensesBreakdown={report.expenses_breakdown}
              columns={expenseColumns}
            />
          </div>
        </>
      ) : (
        <EmptyExpenseRevenue />
      )}
    </div>
  );
}
