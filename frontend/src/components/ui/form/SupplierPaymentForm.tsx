"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { PaymentService } from "@/services/paymentService";
import { SupplierPaymentRequest } from "@/types/payment";
import { FloatingInput } from "@/components/ui/input/FloatingInput";
import { Save } from "lucide-react";
import ButtonLoad from "@/components/ui/button/ButtonLoad";
import { Supplier } from "@/types/supplier";
import { SupplierService } from "@/services/supplierService";
import SearchableSelect from "../input/select/SearchableOptions";

import { formatRupiah } from "@/utils/helper";

interface SupplierPaymentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  supplierId?: number;
  amount?: number;
}

export const SupplierPaymentForm = ({
  onSuccess,
  onCancel,
  supplierId,
  amount,
}: SupplierPaymentFormProps) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [supplier, setSupplier] = useState<Supplier[]>([]);
  const [formData, setFormData] = useState<SupplierPaymentRequest>({
    supplier_id: supplierId || 0,
    amount: 0,
    payment_date: "",
    notes: "",
  });

  useEffect(() => {
    if (supplierId) return;

    const fetchSuppliers = async () => {
      try {
        setLoading(true);
        const data = await SupplierService.getAllSuppliers();
        setSupplier(data);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) return;
        toast.error("Failed to load supplier select options");
      } finally {
        setLoading(false);
      }
    };
    fetchSuppliers();
  }, [supplierId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.supplier_id || !formData.amount || !formData.payment_date) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (amount && formData.amount > amount) {
      toast.error("Payment amount cannot be greater than due amount");
      return;
    }
    try {
      setSubmitting(true);
      await PaymentService.createSupplierPayment(formData);
      toast.success("Supplier payment successful", {
        description: "Supplier has been paid successfully.",
      });
      onSuccess();
      onCancel();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) return;
      toast.error("Failed to create supplier payment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-ghost-white/30 rounded-2xl border-t border-foreground/30 border-b border-b-foreground/30 p-6 shadow-xl"
    >
      <div className="flex flex-col gap-2 w-full">
        {!supplierId && (
          <div className="flex flex-col gap-1.5 w-full">
            <SearchableSelect
              label="Supplier"
              placeholder="Select Supplier"
              searchPlaceholder="Search Supplier..."
              options={supplier
                .filter((supp) => Number(supp.remaining_bill || 0) > 0)
                .map((sup) => ({
                  id: sup.id,
                  name: sup.name,
                }))}
              value={formData.supplier_id}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, supplier_id: Number(value) }))
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
            setFormData((prev) => ({ ...prev, payment_date: e.target.value }))
          }
          type="date"
          required
        />
        <FloatingInput
          label="Notes (optional)"
          value={formData.notes}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, notes: e.target.value }))
          }
          type="text"
        />
      </div>
      <div className="flex justify-end gap-2 pt-4 border-t border-foreground/30 mt-6">
        <ButtonLoad
          isLoading={loading || submitting}
          fullWidth={false}
          loadingText="Paying..."
          icon={<Save className="w-4 h-4" />}
          type="submit"
        >
          Pay Now
        </ButtonLoad>
      </div>
    </form>
  );
};
