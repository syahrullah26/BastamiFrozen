"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { PaymentService } from "@/services/paymentService";
import { CustomerPaymentRequest } from "@/types/payment";
import { CustomerService } from "@/services/customerService";
import { Customer } from "@/types/customer";
import { FloatingInput } from "@/components/ui/input/FloatingInput";
import { Save } from "lucide-react";
import ButtonLoad from "@/components/ui/button/ButtonLoad";
import SearchableSelect from "../input/select/SearchableOptions";
import { formatRupiah } from "@/utils/helper";

interface CustomerPaymentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  customerId?: number;
  amount?: number;
}

export const CustomerPaymentForm = ({
  onSuccess,
  onCancel,
  customerId,
  amount,
}: CustomerPaymentFormProps) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [customer, setCustomer] = useState<Customer[]>([]);
  const [formData, setFormData] = useState<CustomerPaymentRequest>({
    customer_id: customerId || 0,
    amount: 0,
    payment_date: "",
    notes: "",
  });

  useEffect(() => {
    if (customerId) return;
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const data = await CustomerService.getAllCustomers();
        setCustomer(data);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          return;
        }
        toast.error("Failed to load customers");
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, [customerId]);

  // const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   const selectedId = parseInt(e.target.value, 10);
  //   setFormData((prev) => ({ ...prev, customer_id: selectedId }));
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CustomerPaymentRequest = {
      customer_id: formData.customer_id,
      amount: formData.amount,
      payment_date: formData.payment_date,
      notes: formData.notes,
    };
    if (!payload.customer_id || !payload.amount || !payload.payment_date) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (amount && payload.amount > amount) {
      toast.error("Payment amount cannot be greater than due amount");
      return;
    }
    try {
      setSubmitting(true);
      await PaymentService.createCustomerPayment(payload);
      toast.success("Customer payment successful", {
        description: `Customer has been Pay ${formatRupiah(payload.amount)}, successfully.`,
      });
      onSuccess();
      onCancel();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return;
      }
      toast.error("Failed to create customer payment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-ghost-white/30 rounded-2xl border-t border-foreground/30 border-b border-b-foreground/30 p-6 shadow-xl"
    >
      <div className="flex flex-col gap-2 w-full ">
        {!customerId && (
          <div className="flex flex-col gap-1.5 w-full">
            <SearchableSelect
              label="Customer"
              placeholder="Select Customer"
              searchPlaceholder="Search Customer..."
              options={customer
                .filter((cust) => Number(cust.remaining_bill || 0) > 0)
                .map((cust) => ({
                  id: cust.id,
                  name: cust.name,
                }))}
              value={formData.customer_id}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  customer_id: Number(value),
                }))
              }
              required
            />
          </div>
        )}
        <div className="space-y-1.5">
          <FloatingInput
            label="Amount"
            type="number"
            value={formData.amount || ""}
            max={amount}
            required
            onChange={(e) => {
              const inputValue = parseFloat(e.target.value) || 0;
              const finalValue =
                amount && inputValue > amount ? amount : inputValue;

              setFormData((prev) => ({
                ...prev,
                amount: finalValue,
              }));
            }}
          />
          {amount !== undefined && amount !== null && (
            <span
              className={`text-[11px] font-medium tracking-wide block px-1 ${
                formData.amount >= amount
                  ? "text-rose-500 font-bold"
                  : "text-zinc-400"
              }`}
            >
              *max amount is:{" "}
              <span className="font-mono">{formatRupiah(amount)}</span>
            </span>
          )}
        </div>
        <FloatingInput
          label="Payment Date"
          value={formData.payment_date}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              payment_date: e.target.value,
            }))
          }
          type="date"
        />
        <FloatingInput
          label="Notes (optional)"
          value={formData.notes}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              notes: e.target.value,
            }))
          }
          type="text"
        />
      </div>
      <div className="flex justify-end gap-2 pt-4 border-t border-foreground/30  mt-6">
        <ButtonLoad
          isLoading={loading || submitting}
          fullWidth={false}
          loadingText="Paying..."
          icon={<Save className="w-4 h-4" />}
          type="submit"
        >
          {" "}
          Pay Now
        </ButtonLoad>
      </div>
    </form>
  );
};
