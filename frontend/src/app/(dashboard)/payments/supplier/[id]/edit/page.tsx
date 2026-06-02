/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { PaymentService } from "@/services/paymentService";
import { SupplierPaymentRequest } from "@/types/payment";
import { SupplierService } from "@/services/supplierService";
import { Supplier } from "@/types/supplier";
import { FloatingInput } from "@/components/ui/input/FloatingInput";
import { Save, ArrowLeft } from "lucide-react";
import ButtonLoad from "@/components/ui/button/ButtonLoad";
import SearchableSelect from "@/components/ui/input/select/SearchableOptions";

export default function SupplierPaymentUpdatePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const [formData, setFormData] = useState<SupplierPaymentRequest>({
    supplier_id: 0,
    amount: 0,
    payment_date: "",
    notes: "",
  });

  useEffect(() => {
    if (!id || id === "undefined") return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const supplierData = await SupplierService.getAllSuppliers();
        setSuppliers(supplierData);

        const paymentData = await PaymentService.getSupplierPayment(id);

        setFormData({
          supplier_id: paymentData.supplier_id,
          amount: paymentData.amount,
          payment_date: paymentData.payment_date,
          notes: paymentData.notes || "",
        });
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          return;
        }
        toast.error("Failed to load payment data");
        router.push("/payments/supplier");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, router]);
  const handleSupplierSelect = (value: string) => {
    const val = parseInt(value, 10) || 0;
    setFormData((prev) => ({
      ...prev,
      supplier_id: val,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: SupplierPaymentRequest = {
      supplier_id: Number(formData.supplier_id),
      amount: Number(formData.amount),
      payment_date: formData.payment_date,
      notes: formData.notes || "",
    };

    if (!payload.supplier_id || !payload.amount || !payload.payment_date) {
      return toast.error("Please fill in all required fields");
    }

    try {
      setSubmitting(true);
      await PaymentService.updateSupplierPayment(id, payload);
      toast.success("Supplier payment updated successfully");
      router.push(`/payments/supplier/${id}`);
      router.refresh();
    } catch (error) {
      toast.error("Failed to update supplier payment: " + error);
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
          type="button"
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
          <div className="flex flex-col gap-1 w-full">
            <SearchableSelect
              label="Select Supplier"
              placeholder="Select Supplier"
              searchPlaceholder="Search Supplier..."
              options={suppliers.map((s) => ({ id: s.id, name: s.name }))}
              value={formData.supplier_id ? String(formData.supplier_id) : ""}
              onChange={handleSupplierSelect}
              required
            />
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
              required
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
              required
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
