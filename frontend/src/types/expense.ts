import { Attendance } from "./employee";
import { SupplierPayment } from "./payment";

export interface Expense {
  id: number;
  type: string;
  amount: number;
  expense_date: string;
  notes?: string;
  attendance_id?: number;
  supplier_payment_id?: number;
  supplier_payment?: SupplierPayment;
  attendance?: Attendance;
}

export type ExpenseType =
  | "utility"
  | "operational"
  | "salary"
  | "pay_supplier"
  | "other";
export interface ExpenseRequest {
  type: string;
  amount: number;
  expense_date: string;
  notes?: string;
}

export interface ExpenseStats {
  total_monthly_expense: number;
  total_monthly_salary_expense: number;
  total_monthly_supplier_expense: number;
}
