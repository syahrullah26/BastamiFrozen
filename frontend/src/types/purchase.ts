import { Supplier } from "./supplier";
import { Product } from "./product";

export interface PurchaseItem {
  id: number;
  purchase_id: number;
  product_id: number;
  product_unit_id: number;

  product_name: string;
  product_unit_name: string;

  quantity: string;
  price: number;
  subtotal: number;
  pricePerUnit: number;
  cost_price: number;
  remaining_qty: number;
  batch_status: string;
  product: Product;
}
export type statusPurchase = "unpaid" | "paid";
export interface Purchase {
  id: number;
  invoice_number: string;
  supplier_id: number;
  transaction_date: string;
  total_amount: number;
  status: statusPurchase;
  remaining_bill: number;
  supplier: Supplier;
  items: PurchaseItem[];
}

export interface PurchaseItemRequest {
  product_id: number;
  product_unit_id: number;
  quantity: number;
  price: number;
}
export interface PurchaseRequest {
  supplier_id: number;
  transaction_date: string;
  status: string;
  items: PurchaseItemRequest[];
}

export interface PurchaseStats {
  total_monthly_purchase: number;
  total_pending_purchase: number;
  total_monthly_paid_purchase: number;
  total_remaining_bill: number;
}
export type BatchStatus = "all" | "out-of-stock" | "available";
