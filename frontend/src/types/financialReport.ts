export interface SummaryData {
  period_label: string;
  total_orders: number;
  average_order_value: number;
  gross_revenue: number;
  total_cogs: number;
  gross_profit: number;
  total_expenses: number;
  net_profit_loss: number;
  profit_margin_pct: number;
  is_profit: boolean;
}

export interface expensesBreakdown {
  category: string;
  total: number;
}

export interface ChartDataPoint {
  label: string;
  revenue: number;
}
export interface FinancialReport {
  summary: SummaryData;
  expenses_breakdown: expensesBreakdown[];
  chart_data: ChartDataPoint[];
}
