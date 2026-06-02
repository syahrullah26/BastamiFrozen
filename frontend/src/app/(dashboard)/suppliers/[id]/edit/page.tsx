"use client";

import React, { useState, useEffect } from "react";
import { FloatingInput } from "@/components/ui/input/FloatingInput";
import { Save, Loader2, ArrowLeft } from "lucide-react";
import { SupplierRequest } from "@/types/supplier";
import { SupplierService } from "@/services/supplierService";

import { toast } from "sonner";
import axios from "axios";
import ButtonLoad from "@/components/ui/button/ButtonLoad";
import { useRouter, useParams } from "next/navigation";

export default function EditSupplierPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<SupplierRequest>({
    name: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    const fetchSupplier = async () => {
      if (!id || id === "undefined") return;
      try {
        setLoading(true);
        const data = await SupplierService.getSupplier(id);
        setFormData({
          name: data.name,
          phone: data.information.phone,
          address: data.information.address,
        });
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          return;
        }
        toast.error("Failed to load supplier");
        router.push("/suppliers");
      } finally {
        setLoading(false);
      }
    };
    fetchSupplier();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await SupplierService.updateSupplier(id, formData);
      toast.success("Perubahan Disimpan", {
        description: `${formData.name} telah diperbarui.`,
      });
      router.push("/suppliers");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return;
      }
      toast.error("Failed to update supplier");
      router.push("/suppliers");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-brand-dark" />
      </div>
    );
  }
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gold-luxury cursor-pointer hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-bold uppercase cursor-pointer  tracking-widest">
            Back
          </span>
        </button>
      </div>
      <div className="flex flex-wrap items-center justify-start">
        <span className="text-2xl font-bold text-brand-dark">
          Edit Supplier
        </span>
      </div>
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-ghost-white/30 rounded-2xl border-t border-foreground/30 border-b border-b-foreground/30 p-6 shadow-xl"
      >
        <FloatingInput
          label="Name"
          type="text"
          name="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <FloatingInput
          label="Phone Number"
          type="text"
          name="phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
        <FloatingInput
          label="Location"
          type="text"
          name="location"
          value={formData.address}
          onChange={(e) =>
            setFormData({ ...formData, address: e.target.value })
          }
        />
        <ButtonLoad
          type="submit"
          isLoading={submitting}
          disabled={submitting}
          className="w-full"
        >
          <Save className="w-4 h-4 mr-2" />
          <span>Save</span>
        </ButtonLoad>
      </form>
    </div>
  );
}
