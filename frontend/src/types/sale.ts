import { Customer } from "./customer";
import { Product, ProductUnit } from "./product";

export interface SaleItem {
  id: number;
  sale_id: number;
  product_id: number;
  product_unit_id: number;
  product: Product;
  product_unit: ProductUnit;
  quantity: number;
  unit: string;
  stock_out: number;
  price: number;
  subtotal: number;
  cost_price_at_sale: number;
  gross_profit: number;
}

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
  status: string;
  items: SaleItem[];
  customer: Customer;
}
