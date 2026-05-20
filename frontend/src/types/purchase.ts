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
  cost_price: number;
  remaining_qty: number;
  batch_statis: string;
  product: Product;
}
export interface Purchase {
  id: number;
  invoice_number: string;
  supplier_id: number;
  transaction_date: string;
  total_amount: number;
  remaining_bill: number;
  supplier: Supplier;
  items: PurchaseItem[];
}
