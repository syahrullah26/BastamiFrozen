"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { CustomerService } from "@/services/customerService";
import { CustomerRequest } from "@/types/customer";
import { toast } from "sonner";
import { Save, Loader2, ArrowLeft } from "lucide-react";
import axios from "axios";

import { FloatingInput } from "@/components/ui/input/FloatingInput";
import ButtonLoad from "@/components/ui/button/ButtonLoad";

export default function EditCustomerPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<CustomerRequest>({
    name: "",
    location: "",
    phone: "",
  });

  useEffect(() => {
    const fetchCustomer = async () => {
      if (!id || id === "undefined") return;
      try {
        setLoading(true);
        const data = await CustomerService.getCustomer(id);

        setFormData({
          name: data.name,
          location: data.location,
          phone: data.phone,
        });
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          return;
        }
        toast.error("Failed to load customer");
        router.push("/customers");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await CustomerService.updateCustomer(id, formData);
      toast.success("Perubahan Disimpan", {
        description: `${formData.name} telah diperbarui.`,
      });
      router.push("/customers");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return;
      }
      toast.error("Failed to update customer");
      router.push("/customers");
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
          value={formData.location}
          onChange={(e) =>
            setFormData({ ...formData, location: e.target.value })
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
