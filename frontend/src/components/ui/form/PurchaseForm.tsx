"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { FloatingInput } from "@/components/ui/input/FloatingInput";
import { Save, Plus, Trash2 } from "lucide-react";
import { PurchaseRequest } from "@/types/purchase";
import { PurchaseService } from "@/services/purchaseService";
import { ProductService } from "@/services/productService";
import { Product } from "@/types/product";
import { SupplierService } from "@/services/supplierService";
import { Supplier } from "@/types/supplier";
import { toast } from "sonner";
import ButtonLoad from "@/components/ui/button/ButtonLoad";
import SearchableSelect from "@/components/ui/input/select/SearchableOptions";

interface PurchaseFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface FormItem {
  product_id: string;
  product_unit_id: string;
  quantity: number;
  price: number;
}

export const PurchaseForm = ({ onSuccess, onCancel }: PurchaseFormProps) => {
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [supplierOption, setSupplierOption] = useState<string>("");
  const [transactionDate, setTransactionDate] = useState<string>("");
  const [statusOption, setStatusOption] = useState<string>("unpaid");

  const [items, setItems] = useState<FormItem[]>([
    { product_id: "", product_unit_id: "", quantity: 1, price: 0 },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [supplierData, productData] = await Promise.all([
          SupplierService.getAllSuppliers(),
          ProductService.getAllProducts(),
        ]);
        setSuppliers(supplierData);
        setProducts(productData);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) return;
        toast.error("Failed to load options");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddItem = () => {
    setItems([
      ...items,
      { product_id: "", product_unit_id: "", quantity: 1, price: 0 },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) {
      toast.warning("Aturannya minimal harus ada 1 item produk");
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: keyof FormItem,
    value: string | number,
  ) => {
    const updatedItems = [...items];

    if (field === "product_id") {
      updatedItems[index] = {
        ...updatedItems[index],
        product_id: String(value),
        product_unit_id: "",
      };
    } else if (field === "product_unit_id") {
      updatedItems[index] = {
        ...updatedItems[index],
        product_unit_id: String(value),
      };
    } else if (field === "quantity") {
      updatedItems[index] = {
        ...updatedItems[index],
        quantity: Number(value),
      };
    } else if (field === "price") {
      updatedItems[index] = {
        ...updatedItems[index],
        price: Number(value),
      };
    }

    setItems(updatedItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierOption || !transactionDate || !statusOption) {
      toast.error("Please fill all required fields");
      return;
    }
    const hasInvalidItem = items.some(
      (item) =>
        !item.product_id ||
        !item.product_unit_id ||
        item.quantity < 1 ||
        item.price < 0,
    );
    if (hasInvalidItem) {
      toast.error(
        "Please complete all product details, units, quantities, and prices",
      );
      return;
    }

    setLoading(true);
    const payload: PurchaseRequest = {
      supplier_id: Number(supplierOption),
      transaction_date: transactionDate,
      status: statusOption,
      items: items.map((item) => ({
        product_id: Number(item.product_id),
        product_unit_id: Number(item.product_unit_id),
        quantity: item.quantity,
        price: item.price,
      })),
    };

    try {
      await PurchaseService.createPurchase(payload);
      toast.success("Purchase Created", {
        description: "Purchase transaction has been added successfully.",
      });
      onSuccess();
      onCancel();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) return;
      toast.error("Failed to create Purchase");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <FloatingInput
            label="Transaction Date"
            type="date"
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            required
          />
        </div>
        <div>
          <SearchableSelect
            label="Supplier"
            placeholder="Select Supplier"
            searchPlaceholder="Search supplier name..."
            options={suppliers.map((s) => ({ id: s.id, name: s.name }))}
            value={supplierOption}
            onChange={(val) => setSupplierOption(val)}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1">
            Payment Status *
          </label>
          <select
            value={statusOption}
            onChange={(e) => setStatusOption(e.target.value)}
            className="w-full px-3 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs focus:outline-none focus:border-brand-dark transition-all font-semibold text-zinc-700"
            required
          >
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
          </select>
        </div>
      </div>
      <div className="border-t border-zinc-100 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Purchase Items
          </h3>
          <button
            type="button"
            onClick={handleAddItem}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-dark/5 hover:bg-brand-dark/10 text-brand-dark text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Product
          </button>
        </div>

        <div className="space-y-4">
          {items.map((item, index) => {
            const currentSelectedProduct = products.find(
              (p) => p.id === Number(item.product_id),
            );
            const availableUnits = currentSelectedProduct?.units || [];

            return (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-zinc-50/50 p-3 rounded-xl border border-zinc-100 relative group"
              >
                <div className="md:col-span-4">
                  <div className="flex flex-col gap-1">
                    <SearchableSelect
                      label={`Product #${index + 1}`}
                      placeholder="Select Product"
                      searchPlaceholder="Search product..."
                      options={products.map((p) => ({
                        id: p.id,
                        name: p.name,
                      }))}
                      value={item.product_id}
                      onChange={(val) =>
                        handleItemChange(index, "product_id", val)
                      }
                      required
                    />
                  </div>
                </div>

                <div className="md:col-span-3">
                  <label className="block text-[10px] font-bold text-zinc-500 mb-1">
                    Unit *
                  </label>
                  <select
                    value={item.product_unit_id}
                    onChange={(e) =>
                      handleItemChange(index, "product_unit_id", e.target.value)
                    }
                    className="w-full px-3 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-700 focus:outline-none focus:border-brand-dark transition-all disabled:bg-zinc-50 disabled:text-zinc-400"
                    disabled={!item.product_id}
                    required
                  >
                    <option value="">Select Unit</option>
                    {availableUnits.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.unit_name} (×{u.conversion_factor})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <FloatingInput
                    label="Qty"
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(index, "quantity", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <FloatingInput
                    label="Price"
                    type="number"
                    min={0}
                    value={item.price}
                    onChange={(e) =>
                      handleItemChange(index, "price", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="md:col-span-1 flex justify-center pb-1">
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Remove Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FOOTER ACTION BUTTONS */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-xs font-bold text-zinc-500 hover:bg-zinc-100 rounded-xl transition-all cursor-pointer"
        >
          Cancel
        </button>
        <ButtonLoad
          type="submit"
          isLoading={loading}
          disabled={loading}
          icon={<Save className="w-4 h-4" />}
        >
          Save Transaction
        </ButtonLoad>
      </div>
    </form>
  );
};
