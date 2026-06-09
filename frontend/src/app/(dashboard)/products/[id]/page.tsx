"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ProductService } from "@/services/productService";
import { Product } from "@/types/product";
import axios from "axios";
import { toast } from "sonner";
import { formatRupiah } from "@/utils/helper";
import GlobalLoader from "@/components/ui/common/GlobalLoading";
import DPHEader from "../_components/detail/DPHeader";
import DPImage from "../_components/detail/DPImage";
import DPInformations from "../_components/detail/DPInformations";
import DPUnitTable from "../_components/detail/DPUnitTable";

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
        <GlobalLoader message="Loading..." />
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4 md:p-6">
      <DPHEader />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        <DPImage image={imageUrl} productName={product.name} />
        <div className="md:col-span-7">
          <DPInformations
            id={id as string}
            product={product}
            smallestUnit={smallestUnit}
            formatRupiah={formatRupiah}
          />
        </div>
      </div>
      <DPUnitTable units={product.units} formatRupiah={formatRupiah} />
    </div>
  );
}
