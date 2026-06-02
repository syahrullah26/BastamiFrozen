"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
import { useRouter, useParams } from "next/navigation";
import { SaleService } from "@/services/saleService";
import { SaleRequest } from "@/types/sale";
import { toast } from "sonner";
import axios from "axios";
import { ProductService } from "@/services/productService";
import { Product } from "@/types/product";
import { CustomerService } from "@/services/customerService";
import { Customer } from "@/types/customer";
import ButtonLoad from "@/components/ui/button/ButtonLoad";
import ButtonNav from "@/components/ui/button/ButtonNav";
import { FloatingInput } from "@/components/ui/input/FloatingInput";
import { ArrowLeft, Trash2, Plus, ShoppingBag, User, Save } from "lucide-react";
import SearchableSelect from "@/components/ui/input/select/SearchableOptions";

interface FormItem {
  product_id: string;
  product_unit_id: string;
  quantity: number;
}

const emptySubscribe = () => () => {};

export default function SaleUpdatePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [customerId, setCustomerId] = useState<string>("");
  const [transactionDate, setTransactionDate] = useState<string>("");
  const [invoiceNumber, setInvoiceNumber] = useState<string>("");
  const [items, setItems] = useState<FormItem[]>([
    {
      product_id: "",
      product_unit_id: "",
      quantity: 1,
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
        const [customerData, productData] = await Promise.all([
          CustomerService.getAllCustomers(),
          ProductService.getAllProducts(),
        ]);
        setCustomers(customerData);
        setProducts(productData);

        const res = await SaleService.getSale(id);
        setCustomerId(res.customer_id.toString());
        setInvoiceNumber(res.invoice_number);
        if (res.transaction_date) {
          setTransactionDate(res.transaction_date);
        }
        setItems(
          res.items.map((item) => ({
            product_id: item.product_id.toString(),
            product_unit_id: item.product_unit_id.toString(),
            quantity: item.quantity,
          })),
        );
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) return;
        toast.error("Failed to load sale data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAddItem = () => {
    setItems([...items, { product_id: "", product_unit_id: "", quantity: 1 }]);
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
    }

    setItems(updatedItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerId) {
      toast.error("Please select a customer");
      return;
    }

    if (!transactionDate) {
      toast.error("Please select a transaction date");
      return;
    }

    const invalidItem = items.some(
      (item) => !item.product_id || !item.product_unit_id || item.quantity <= 0,
    );
    if (invalidItem) {
      toast.error("Please complete all product items configuration");
      return;
    }

    try {
      setSubmitting(true);
      const payload: SaleRequest = {
        customer_id: Number(customerId),
        transaction_date: transactionDate,
        items: items.map((item) => ({
          product_id: Number(item.product_id),
          product_unit_id: Number(item.product_unit_id),
          quantity: item.quantity,
        })),
      };

      await SaleService.updateSale(Number(id), payload);
      toast.success("Sale transaction updated successfully");
      router.push(`/sales/${id}`);
      router.refresh();
    } catch (error) {
      toast.error("Failed to update sale transaction :" + error);
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
              <h1 className="text-xl font-black tracking-tight text-brand-dark">
                Edit Sale Transaction
              </h1>
              <p className="text-xs font-semibold text-zinc-400 mt-0.5">
                #{invoiceNumber || "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-2xl border border-zinc-200/60 bg-white shadow-3xs">
          <div className="flex flex-col gap-1.5">
            <SearchableSelect
              label="Customer"
              placeholder="Select Customer"
              searchPlaceholder="Search Customer..."
              options={customers.map((c) => ({ id: c.id, name: c.name }))}
              value={isClient ? customerId : ""}
              onChange={(val) => setCustomerId(val)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <FloatingInput
              label="Transaction Date"
              type="date"
              value={isClient ? transactionDate : ""}
              onChange={(e) => setTransactionDate(e.target.value)}
              className="w-full text-xs font-medium font-mono text-zinc-800 bg-zinc-50/50 border border-zinc-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-zinc-400 transition-colors"
            />
          </div>
        </div>

        <div className="bg-white border border-zinc-200/60 rounded-2xl shadow-3xs overflow-hidden">
          <div className="p-4 border-b border-zinc-100 bg-zinc-50/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-primary-brand    " />
              <h2 className="text-xs font-black uppercase tracking-wider text-primary-brand">
                Product Items
              </h2>
            </div>
            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-primary-brand text-white hover:bg-brand-dark rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" /> Add Row
            </button>
          </div>

          <div className="p-4 space-y-3">
            {items.map((item, index) => {
              const selectedProduct = products.find(
                (p) => String(p.id) === item.product_id,
              );
              const units = selectedProduct?.units || [];

              return (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3.5 rounded-xl border border-zinc-100 bg-zinc-50/20 items-end"
                >
                  <div className="md:col-span-5 flex flex-col gap-1">
                    <SearchableSelect
                      label={`Product Name #${index + 1}`}
                      placeholder="Select Product"
                      searchPlaceholder="Search Product..."
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
                    <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                      Measurement Unit
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
                      disabled={!item.product_id}
                      className="w-full text-xs font-medium text-zinc-700 bg-white border border-zinc-200 rounded-lg px-2.5 py-2 focus:outline-none focus:border-zinc-400 disabled:bg-zinc-100 disabled:text-zinc-400"
                    >
                      <option value="">Select Unit</option>
                      {units.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.unit_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-3 flex flex-col gap-1">
                    <FloatingInput
                      label="Quantity"
                      type="number"
                      min="1"
                      value={isClient ? item.quantity : 1}
                      onChange={(e) =>
                        handleItemChange(index, "quantity", e.target.value)
                      }
                      className="w-full text-xs font-semibold font-mono text-zinc-800 bg-white border border-zinc-200 rounded-lg px-2.5 py-2 focus:outline-none focus:border-zinc-400"
                    />
                  </div>

                  <div className="md:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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
