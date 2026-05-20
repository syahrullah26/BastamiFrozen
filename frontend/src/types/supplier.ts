import { SupplierPayment } from "./payment";
import { Purchase } from "./purchase";

export interface SupplierInformation {
  phone: string;
  address: string;
}

export interface Supplier {
  id: number;
  name: string;
  information: SupplierInformation;
  remaining_bill: number;
  purchases: Purchase[];
  supplier_payments: SupplierPayment[];
}
