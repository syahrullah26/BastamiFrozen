"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { PaymentService } from "@/services/paymentService";
import { CustomerPaymentRequest } from "@/types/payment";
import { CustomerService } from "@/services/customerService";
import { Customer } from "@/types/customer";
import { FloatingInput } from "@/components/ui/input/FloatingInput";
import { Save, ArrowLeft, Building2, Users } from "lucide-react";
import ButtonLoad from "@/components/ui/button/ButtonLoad";
import SearchableSelect from "@/components/ui/input/select/SearchableOptions";

export default function CustomerPaymentUpdatePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [formData, setFormData] = useState<CustomerPaymentRequest>({
    customer_id: 0,
    amount: 0,
    payment_date: "",
    notes: "",
  });

  useEffect(() => {
    if (!id || id === "undefined") return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const customerData = await CustomerService.getAllCustomers();
        setCustomers(customerData);
        const res = await PaymentService.getCustomerPayment(id);
        setFormData({
          customer_id: res.customer_id,
          amount: res.amount,
          payment_date: String(res.payment_date),
          notes: res.notes,
        });
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          return;
        }
        toast.error("Failed to load payment data");
        router.push("/payments/customer");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, router]);

  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = parseInt(e.target.value, 10);
    setFormData((prev) => ({
      ...prev,
      customer_id: val,
    }));
  };

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
    try {
      setSubmitting(true);
      await PaymentService.updateCustomerPayment(id, payload);
      toast.success("Customer payment updated successfully");
      router.push(`/payments/customer/${id}`);
      router.refresh();
    } catch (error) {
      toast.error("Failed to update customer payment: " + error);
    } finally {
      setSubmitting(false);
    }
  };
  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-dark border-t-transparent" />
      </div>
    );
  }
  return (
    <div className="space-y-6 p-2 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 border-b border-zinc-100 pb-5">
        <button
          onClick={() => router.back()}
          className="group flex items-center justify-center p-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-zinc-600 transition-transform group-hover:-translate-x-0.5" />
        </button>
        <div>
          <h1 className="text-xl font-black tracking-tight text-brand-dark">
            Edit Supplier Payment
          </h1>
          <p className="text-xs font-semibold text-zinc-400 mt-0.5">
            Modify ledger entry transaction details for ID #{id}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs p-6 space-y-6"
      >
        <div className="space-y-5">
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 pl-0.5">
              Select Supplier <span className="text-red-500">*</span>
            </label>

            <div className="group relative w-full rounded-xl border border-zinc-200 bg-white shadow-3xs transition-all duration-300 hover:border-zinc-300 focus-within:border-zinc-400 focus-within:ring-1 focus-within:ring-zinc-100/80 flex items-center">
              <SearchableSelect
                placeholder="Select Customer"
                searchPlaceholder="Search Customer..."
                options={customers.map((c) => ({ id: c.id, name: c.name }))}
                value={formData.customer_id}
                onChange={(value) =>
                  handleCustomerChange({
                    target: { value },
                  } as React.ChangeEvent<HTMLSelectElement>)
                }
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 pl-0.5 block">
              Payment Amount <span className="text-red-500">*</span>
            </label>
            <FloatingInput
              label=""
              placeholder="Enter amount paid"
              value={formData.amount || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  amount: parseFloat(e.target.value) || 0,
                }))
              }
              type="number"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 pl-0.5 block">
              Payment Date <span className="text-red-500">*</span>
            </label>
            <FloatingInput
              label=""
              value={formData.payment_date}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  payment_date: e.target.value,
                }))
              }
              type="date"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 pl-0.5 block">
              Notes (Optional)
            </label>
            <FloatingInput
              label="Add transactional reference or summary notes"
              value={formData.notes || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  notes: e.target.value,
                }))
              }
              type="text"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-zinc-100 mt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2.5 text-xs font-bold text-zinc-500 hover:bg-zinc-50 border border-zinc-200 rounded-xl transition-all cursor-pointer"
          >
            Cancel
          </button>

          <ButtonLoad
            isLoading={submitting}
            fullWidth={false}
            loadingText="Saving Updates..."
            icon={<Save className="w-4 h-4" />}
            type="submit"
          >
            Save Changes
          </ButtonLoad>
        </div>
      </form>
    </div>
  );
}
