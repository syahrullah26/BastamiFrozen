/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { FloatingInput } from "@/components/ui/input/FloatingInput";
import { Save } from "lucide-react";
import { CustomerRequest } from "@/types/customer";
import { CustomerService } from "@/services/customerService";
import { toast } from "sonner";
import ButtonLoad from "@/components/ui/button/ButtonLoad";

interface CustomerFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const CustomerForm = ({ onSuccess, onCancel }: CustomerFormProps) => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload: CustomerRequest = {
      name,
      phone,
      location,
    };

    try {
      await CustomerService.createCustomer(payload);
      toast.success("Customer Created", {
        description: `${name} has been added successfully.`,
      });
      onSuccess();
      onCancel();
    } catch (error: any) {
      toast.error("Failed to Create Customer", {
        description: error.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-ghost-white/30 rounded-2xl border-t border-foreground/30 border-b border-b-foreground/30 p-6 shadow-xl"
    >
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-brand-dar">
          Customer Details
        </h3>
        <div className="grid grid-cols-1 gap-4 ">
          <FloatingInput
            label="Customer Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <FloatingInput
            label="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <FloatingInput
            label="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t border-foreground/30  mt-6">
          <ButtonLoad
            isLoading={loading}
            fullWidth={false}
            loadingText="Saving..."
            icon={<Save className="w-4 h-4" />}
            type="submit"
          >
            {" "}
            Save Customer
          </ButtonLoad>
        </div>
      </div>
    </form>
  );
};
