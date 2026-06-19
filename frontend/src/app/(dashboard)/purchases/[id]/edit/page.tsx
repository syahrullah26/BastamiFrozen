/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
import { useRouter, useParams } from "next/navigation";
import { PurchaseService } from "@/services/purchaseService";
import { PurchaseRequest } from "@/types/purchase";
import { toast } from "sonner";
import axios from "axios";
import { ProductService } from "@/services/productService";
import { Product } from "@/types/product";
import { SupplierService } from "@/services/supplierService";
import { Supplier } from "@/types/supplier";
import ButtonLoad from "@/components/ui/button/ButtonLoad";
import ButtonNav from "@/components/ui/button/ButtonNav";
import { FloatingInput } from "@/components/ui/input/FloatingInput";
import { ArrowLeft, Trash2, Plus, ShoppingBag, Save } from "lucide-react";
import SearchableSelect from "@/components/ui/input/select/SearchableOptions";

interface FormItem {
  product_id: string;
  product_unit_id: string;
  quantity: number;
  price: number;
}

const emptySubscribe = () => () => {};

export default function PurchaseUpdatePage() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id : (params?.id as string);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [supplierOption, setSupplierOption] = useState<string>("");
  const [transactionDate, setTransactionDate] = useState<string>("");
  const [statusOption, setStatusOption] = useState<string>("unpaid");
  const [invoiceNumber, setInvoiceNumber] = useState<string>("");
  const [items, setItems] = useState<FormItem[]>([
    {
      product_id: "",
      product_unit_id: "",
      quantity: 1,
      price: 0,
    },
  ]);

  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!id || id === "undefined") return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [supplierData, productData] = await Promise.all([
          SupplierService.getAllSuppliers(),
          ProductService.getAllProducts(),
        ]);
        setSuppliers(supplierData);
        setProducts(productData);

        const res = await PurchaseService.getPurchase(String(id));
        setSupplierOption(res.supplier_id.toString());
        setInvoiceNumber(res.invoice_number);
        setStatusOption(res.status || "unpaid");
        if (res.transaction_date) {
          setTransactionDate(res.transaction_date);
        }
        setItems(
          res.items.map((item: any) => ({
            product_id: item.product_id.toString(),
            product_unit_id: item.product_unit_id.toString(),
            quantity: item.quantity,
            price: Number(item.cost_price),
          })),
        );
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) return;
        toast.error("Failed to load purchase transaction data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

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

    try {
      setSubmitting(true);
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

      await PurchaseService.updatePurchase(Number(id), payload);
      toast.success("Purchase Updated Successfully");
      router.push(`/purchases/${id}`);
      router.refresh();
    } catch (error) {
      toast.error("Failed to update purchase transaction: " + error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-800 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-5xl mx-auto">
      <div className="w-full border-b border-slate-100 pb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="group flex items-center gap-1 text-brand-dark hover:text-brand-primary cursor-pointer transition-colors"
            >
              <div className="p-2 rounded-xl group-hover:bg-brand-primary/10 transition-all duration-300">
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              </div>
            </button>
            <div>
              <h1 className="text-xl font-black tracking-tight text-zinc-800">
                Edit Purchase Transaction
              </h1>
              <p className="text-xs font-mono text-zinc-400 mt-0.5">
                #{invoiceNumber || "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 rounded-2xl border border-zinc-200/60 bg-white shadow-3xs items-end">
          <div>
            <FloatingInput
              label="Transaction Date"
              type="date"
              value={isClient ? transactionDate : ""}
              onChange={(e) => setTransactionDate(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <SearchableSelect
              label="Supplier"
              placeholder="Select Supplier"
              searchPlaceholder="Search Supplier..."
              options={suppliers.map((s) => ({ id: s.id, name: s.name }))}
              value={isClient ? supplierOption : ""}
              onChange={(val) => setSupplierOption(val)}
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-sans mb-1 pl-0.5">
              Payment Status *
            </label>
            <select
              value={isClient ? statusOption : "unpaid"}
              onChange={(e) => setStatusOption(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-700 focus:outline-none focus:border-zinc-400 transition-all"
              required
            >
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>

        <div className="bg-white border border-zinc-200/60 rounded-2xl shadow-3xs overflow-hidden">
          <div className="p-4 border-b border-zinc-100 bg-zinc-50/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-zinc-500" />
              <h2 className="text-xs font-black uppercase tracking-wider text-zinc-700">
                Purchase Items Configuration
              </h2>
            </div>
            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" /> Add Row
            </button>
          </div>

          <div className="p-4 space-y-3">
            {items.map((item, index) => {
              const currentSelectedProduct = products.find(
                (p) => p.id === Number(item.product_id),
              );
              const availableUnits = currentSelectedProduct?.units || [];

              return (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3.5 rounded-xl border border-zinc-100 bg-zinc-50/20 items-end relative group"
                >
                  <div className="md:col-span-4 flex flex-col gap-1">
                    <SearchableSelect
                      label={`Product Name #${index + 1}`}
                      placeholder="Select Product"
                      searchPlaceholder="Search product..."
                      options={products.map((p) => ({
                        id: p.id,
                        name: p.name,
                      }))}
                      value={isClient ? item.product_id : ""}
                      onChange={(val) =>
                        handleItemChange(index, "product_id", val)
                      }
                      required
                    />
                  </div>

                  <div className="md:col-span-3 flex flex-col gap-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1 pl-0.5">
                      Measurement Unit *
                    </label>
                    <select
                      value={isClient ? item.product_unit_id : ""}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "product_unit_id",
                          e.target.value,
                        )
                      }
                      className="w-full text-xs font-semibold text-zinc-700 bg-white border border-zinc-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-zinc-400 disabled:bg-zinc-50 disabled:text-zinc-400 disabled:cursor-not-allowed transition-all"
                      disabled={!item.product_id}
                      required
                    >
                      <option value="">Select Unit</option>
                      {availableUnits.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.unit_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <FloatingInput
                      label="Qty"
                      type="number"
                      min={1}
                      value={isClient ? item.quantity : 1}
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
                      value={isClient ? item.price : 0}
                      onChange={(e) =>
                        handleItemChange(index, "price", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="md:col-span-1 flex justify-end pb-1">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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

        <div className="flex items-center justify-end gap-3 pt-2">
          <ButtonNav
            icon={<ArrowLeft className="w-4 h-4" />}
            iconPosition="left"
            fullWidth={false}
            type="button"
            variant="secondary"
            onClick={() => router.back()}
            className="px-4 py-2 text-xs font-semibold hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </ButtonNav>

          <ButtonLoad
            type="submit"
            isLoading={submitting}
            className="px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
            loadingText="Saving..."
            fullWidth={false}
            icon={<Save className="w-4 h-4" />}
          >
            Save Updates
          </ButtonLoad>
        </div>
      </form>
    </div>
  );
}
