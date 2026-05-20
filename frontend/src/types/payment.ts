import { Customer } from "./customer";
import { Expense } from "./expense";
import { Supplier } from "./supplier";

export interface CustomerPayment {
  id: number;
  customer_id: number;
  amount: number;
  payment_date: number;
  notes?: string;
  customer: Customer;
  created_at: string;
  updated_at: string;
}

export interface SupplierPayment {
  id: number;
  supplier_id: number;
  amount: number;
  payment_date: string;
  notes?: string;
  supplier: Supplier;
  expense: Expense;
  created_at: string;
  updated_at: string;
}
