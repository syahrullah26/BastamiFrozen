export interface ReportSummary {
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

export interface ExpenseBreakdown {
  id: number;
  category: string;
  total: number;
}

export interface ChartDataPoint {
  label: string;
  revenue: number;
}

export interface FinancialReport {
  summary: ReportSummary;
  expenses_breakdown: ExpenseBreakdown[];
  chart_data: ChartDataPoint[];
}
export interface DashboardSummary {
  total_orders: number;
  gross_revenue: number;
  total_cash_received: number;
  total_receivable: number;
}

export interface DashboardAlerts {
  zero_cogs_count: number;
}

export interface DashboardTopProduct {
  product_id: number;
  product_name: string;
  unit_name: string;
  total_qty_sold: string | number;
  total_times_ordered: number;
}

export interface DashboardAgingReceivable {
  customer_name: string;
  customer_id: number;
  invoice_number: string;
  remaining_debt: string | number;
  oldest_invoice_days: number;
  debt_status: "Monitor" | "High Risk";
}

export interface DashboardChartDataPoint {
  label: string;
  revenue: number;
  cash: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  alerts: DashboardAlerts;
  top_products: DashboardTopProduct[];
  aging_receivables: DashboardAgingReceivable[];
  chart_data: DashboardChartDataPoint[];
}
