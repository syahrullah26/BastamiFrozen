"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { PaymentService } from "@/services/paymentService";
import { SupplierPaymentRequest } from "@/types/payment";
import { FloatingInput } from "@/components/ui/input/FloatingInput";
import { Save, Loader2 } from "lucide-react";
import ButtonLoad from "@/components/ui/button/ButtonLoad";
import { Supplier } from "@/types/supplier";
import { SupplierService } from "@/services/supplierService";
import SearchableSelect from "../input/select/SearchableOptions";

interface SupplierPaymentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const SupplierPaymentForm = ({
  onSuccess,
  onCancel,
}: SupplierPaymentFormProps) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [supplier, setSupplier] = useState<Supplier[]>([]);
  const [formData, setFormData] = useState<SupplierPaymentRequest>({
    supplier_id: 0,
    amount: 0,
    payment_date: "",
    notes: "",
  });

  useEffect(() => {
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
  }, []);

  const handleSupplierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = parseInt(e.target.value, 10);
    setFormData((prev) => ({ ...prev, supplier_id: selectedId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: SupplierPaymentRequest = {
      supplier_id: formData.supplier_id,
      amount: formData.amount,
      payment_date: formData.payment_date,
      notes: formData.notes,
    };
    if (!payload.supplier_id || !payload.amount || !payload.payment_date) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      setSubmitting(true);
      await PaymentService.createSupplierPayment(payload);
      toast.success("Supplier payment successful", {
        description: "Supplier has been Pay successfully.",
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
      <div className="flex flex-col gap-2 w-full ">
        <div className="flex flex-col gap-1.5 w-full">
          <SearchableSelect
            label="Supplier"
            placeholder="Select Supplier"
            searchPlaceholder="Search Supplier..."
            options={supplier.map((sup) => ({ id: sup.id, name: sup.name }))}
            value={formData.supplier_id}
            onChange={(value) =>
              handleSupplierChange({
                target: { value },
              } as React.ChangeEvent<HTMLSelectElement>)
            }
            // onChange={(value) =>
            //   setFormData((prev) => ({ ...prev, supplier_id: Number(value) }))
            // }
            required
          />
        </div>
        <FloatingInput
          label="Amount"
          value={formData.amount}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              amount: parseFloat(e.target.value),
            }))
          }
          type="number"
        />
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
