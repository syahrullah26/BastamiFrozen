/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { FloatingInput } from "../input/FloatingInput";
import { Plus, Trash2, Image as ImageIcon, Loader2, Save } from "lucide-react";
import { ProductRequest, ProductUnitRequest } from "@/types/product";
import { ProductService } from "@/services/productService";
import { toast } from "sonner";
import ButtonNav from "@/components/ui/button/ButtonNav";
import ButtonLoad from "@/components/ui/button/ButtonLoad";

interface ProductFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const ProductForm = ({ onSuccess, onCancel }: ProductFormProps) => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [stock, setStock] = useState<number>(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [units, setUnits] = useState<ProductUnitRequest[]>([
    { unit_name: "", conversion_factor: 1, price: 0 },
  ]);
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      const targetFile = files[0];
      setImageFile(targetFile);
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview(URL.createObjectURL(targetFile));
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleAddUnit = () => {
    setUnits([...units, { unit_name: "", conversion_factor: 1, price: 0 }]);
  };

  const handleRemoveUnit = (index: number) => {
    setUnits(units.filter((_, i) => i !== index));
  };

  const handleUnitChange = (
    index: number,
    field: keyof ProductUnitRequest,
    value: string | number,
  ) => {
    setUnits(
      units.map((unit, i) =>
        i === index ? { ...unit, [field]: value } : unit,
      ),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload: ProductRequest = {
      name,
      image: imageFile as any,
      stock,
      units,
    };

    try {
      await ProductService.createProduct(payload);
      toast.success("Product Created", {
        description: `${name} has been added successfully.`,
      });
      onSuccess();
      onCancel();
    } catch (error: any) {
      toast.error("Failed to Create Product", {
        description: error.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-ghost-white/30 rounded-2xl border-t border-foreground/30 p-6"
    >
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-brand-dark">
          Basic Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FloatingInput
            label="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <FloatingInput
            label="Initial Stock"
            type="number"
            value={stock}
            onChange={(e) => setStock(parseInt(e.target.value) || 0)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase text-brand-dark tracking-widest">
            Product Image
          </label>
          <div className="flex items-center gap-4 p-4 border border-primary/40 rounded-xl bg-ghost-white/30">
            <div className="relative w-16 h-16 rounded-xl border border-primary/40 bg-snow-white flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon className="w-5 h-5 brand-dark" />
              )}
            </div>
            <div className="flex flex-col gap-1">
              <input
                type="file"
                id="product-image"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
              <label
                htmlFor="product-image"
                className="px-3 py-1.5 bg-brand-dark border border-primary-brand/40 rounded-lg text-xs font-bold text-snow-white hover:bg-primary/60 shadow-sm cursor-pointer w-max transition-all"
              >
                Choose Image
              </label>
              <span className="text-[10px] text-brand-dark/50 font-medium">
                Supports JPG, PNG, or WEBP. Max 2MB.
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-primary/40">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-brand-dark">
            Units & Pricing Tier
          </h3>
          <button
            type="button"
            onClick={handleAddUnit}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-ghost-white bg-brand-dark hover:bg-foreground rounded-xl transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Add Unit Tier
          </button>
        </div>
        <div className="space-y-3 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
          {units.map((unit, index) => (
            <div
              key={index}
              className="flex flex-row items-end gap-3 p-3 rounded-xl bg-ghost-white/30 border border-primary/40"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                <FloatingInput
                  label="Unit Name"
                  value={unit.unit_name}
                  onChange={(e) =>
                    handleUnitChange(index, "unit_name", e.target.value)
                  }
                  required
                />
                <FloatingInput
                  label="Conversion"
                  type="number"
                  value={unit.conversion_factor}
                  onChange={(e) =>
                    handleUnitChange(
                      index,
                      "conversion_factor",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  required
                />
                <FloatingInput
                  label="Price (IDR)"
                  type="number"
                  value={unit.price}
                  onChange={(e) =>
                    handleUnitChange(
                      index,
                      "price",
                      parseFloat(e.target.value) || 0,
                    )
                  }
                  required
                />
              </div>

              {units.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveUnit(index)}
                  className="h-11 w-11 flex items-center justify-center rounded-xl bg-red-950/20 hover:bg-red-900/40 text-red-400 border border-red-900/30 transition-colors cursor-pointer shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t border-primary/40 mt-6">
        <ButtonLoad
          isLoading={loading}
          fullWidth={false}
          loadingText="Saving..."
          icon={<Save className="w-4 h-4" />}
          type="submit"
        >
          {" "}
          Save Product
        </ButtonLoad>
      </div>
    </form>
  );
};
