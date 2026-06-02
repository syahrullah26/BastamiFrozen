import { CustomerPayment } from "./payment";
import { Sale } from "./sale";

// export interface CustomerInformation {
//   location: string;
//   phone: string;
// }

export interface Customer {
  id: number;
  name: string;
  location: string;
  phone: string;
  remaining_bill: number;
  sale: Sale[];
  customer_payment: CustomerPayment[];
}

export interface CustomerRequest {
  name: string;
  location: string;
  phone: string;
}

export interface CustomerStats {
  total_unpaid: number;
  total_remaining_bills: number;
}
