import { Customer } from "./customer";
import { Product, ProductUnit } from "./product";

export interface SaleItem {
  id: number;
  sale_id: number;
  product_id: number;
  product_unit_id: number;
  product_name: string;
  product: Product;
  product_unit: ProductUnit;
  quantity: number;
  unit: string;
  conversion_factor: number;
  stock_out: number;
  price: number;
  subtotal: number;
  cost_price_at_sale: number;
  gross_profit: number;
}

export type StatusSale = "paid" | "unpaid";
export type StatusFilter = "paid" | "unpaid" | "all";
export interface Sale {
  id: number;
  customer_id: number;
  customer_name: string;
  invoice_number: string;
  amount: {
    total_amount: number;
    remaining_bill: number;
  };
  transaction_date: string;
  status: StatusSale;
  items: SaleItem[];
  customer: Customer;
}

export interface SaleItemRequest {
  product_id: number;
  product_unit_id: number;
  quantity: number;
  discount_amount?: number;
}
export interface SaleRequest {
  customer_id: number;
  transaction_date: string;
  items: SaleItemRequest[];
}

export interface SaleStats {
  total_monthly_sale: number;
  total_monthly_paid_sale: number;
  total_pending_sale: number;
  total_remaining_bill: number;
}

export interface BackfillPayload {
  product_id?: string | number | null;
}
