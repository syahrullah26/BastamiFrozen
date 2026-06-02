"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ProductService } from "@/services/productService";
import { Product } from "@/types/product";
import axios from "axios";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Package, Edit3, DollarSign } from "lucide-react";
import Image from "next/image";
import StatsCard from "@/components/ui/card/StatsCard";
import ButtonNav from "@/components/ui/button/ButtonNav";
import { formatRupiah } from "@/utils/helper";

export default function DetailProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id || id === "undefined") return;
      try {
        setLoading(true);
        const data = await ProductService.getProduct(id);
        setProduct(data);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          return;
        }
        toast.error("Gagal memuat data produk");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const smallestUnit =
    product?.units && product.units.length > 0
      ? product.units.reduce((prev, current) =>
          prev.price < current.price ? prev : current,
        )
      : null;

  const imageUrl = product?.image
    ? `http://127.0.0.1:8000/storage/${product.image}`
    : "/images/image-placeholder.png";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <Loader2 className="animate-spin text-brand-dark w-8 h-8" />
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-brand-dark hover:text-brand-dark/80 cursor-pointer transition-colors group"
        >
          <div className="p-2 rounded-full group-hover:bg-brand-dark/5 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest">
            Back
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        <div className="md:col-span-5 border border-brand-dark/10 rounded-2xl overflow-hidden bg-ivory-white/30 backdrop-blur-md shadow-xl transition-all duration-300 hover:shadow-2xl group">
          <div className="relative w-full aspect-square bg-ivory-white/20 flex items-center justify-center p-4">
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              priority
              sizes="(max-w-768px) 100vw, 400px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </div>

        <div className="md:col-span-7 flex flex-col justify-between p-6 border border-brand-dark/10 rounded-2xl shadow-xl bg-ivory-white/30 backdrop-blur-md min-h-75 md:min-h-100 transition-all duration-300 hover:shadow-2xl">
          <div className="space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                Product Details
              </span>
              <h1 className="text-2xl font-black text-brand-dark tracking-tight">
                {product.name}
              </h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StatsCard
                title="Total Stock"
                value={`${product.stock} Pcs`}
                icon={<Package className="w-4 h-4 text-primary" />}
                className="bg-ivory-white/40 border border-brand-dark/5 shadow-sm" // Menyesuaikan StatsCard ke Ivory style jika mendukung custom class
              />
              <StatsCard
                title={`Price (${smallestUnit?.unit_name || "Base Unit"})`}
                value={formatRupiah(smallestUnit?.price || 0)}
                icon={<DollarSign className="w-4 h-4 text-primary" />}
                className="bg-ivory-white/40 border border-brand-dark/5 shadow-sm"
              />
            </div>
          </div>

          <div className="pt-5 mt-6 border-t border-brand-dark/10 flex justify-end">
            <ButtonNav
              href={`/products/${id}/edit`}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-ivory-white bg-brand-dark hover:bg-brand-dark/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md group cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 transition-transform group-hover:rotate-12" />
              Edit Product Data
            </ButtonNav>
          </div>
        </div>
      </div>
      {product.units && product.units.length > 0 && (
        <div className="pt-4 space-y-3">
          <div className="flex items-center gap-2 px-1">
            <div className="w-1.5 h-3.5 bg-primary-brand rounded-full" />
            <h4 className="text-[11px] font-black uppercase tracking-widest text-brand-dark/80">
              Available Pricing Tiers
            </h4>
          </div>

          <div className="w-full border border-brand-dark/10 rounded-2xl overflow-hidden bg-ivory-white/30 backdrop-blur-md shadow-xl transition-all">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-brand-dark/10 bg-ivory-white/50 text-[10px] font-black uppercase tracking-wider text-brand-dark/60">
                    <th className="py-4 px-6 select-none w-16">No</th>
                    <th className="py-4 px-6 select-none">Unit Name</th>
                    <th className="py-4 px-6 select-none text-center">
                      Conversion Factor
                    </th>
                    <th className="py-4 px-6 text-right select-none">
                      Price Tier
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-dark/5 text-xs text-brand-dark/90">
                  {product.units.map((u, i) => (
                    <tr
                      key={i}
                      className="group hover:bg-ivory-white/40 transition-colors duration-150"
                    >
                      <td className="py-4 px-6 font-mono text-brand-dark/40 font-bold">
                        {String(i + 1).padStart(2, "0")}
                      </td>

                      <td className="py-4 px-6">
                        <span className="font-extrabold text-brand-dark tracking-tight">
                          {u.unit_name}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full font-mono font-bold text-[11px] bg-brand-dark/5 text-brand-dark border border-brand-dark/5">
                          {u.conversion_factor}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="font-black text-sm text-brand-dark tracking-tight group-hover:text-primary transition-colors">
                          {formatRupiah(u.price)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
