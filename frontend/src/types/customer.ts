import { CustomerPayment } from "./payment";
import { Sale } from "./sale";

export interface CustomerInformation {
  location: string;
  phone: string;
}

export interface Customer {
  id: number;
  name: string;
  information: CustomerInformation;
  remaining_bill: number;
  sale: Sale[];
  customer_payment: CustomerPayment[];
}
