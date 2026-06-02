/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ProductService } from "@/services/productService";
import { Product, ProductRequest } from "@/types/product";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { imageUrl } from "@/utils/helper";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import Image from "next/image";

import { FloatingInput } from "@/components/ui/input/FloatingInput";
import ButtonLoad from "@/components/ui/button/ButtonLoad";

interface EditProductFormInput {
  name: string;
  stock: number;
  image?: FileList;
  units: {
    unit_name: string;
    conversion_factor: number;
    price: number;
  }[];
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [isImagePreview, setisImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      const targetFile = files[0];
      setImageFile(targetFile);
      if (isImagePreview) URL.revokeObjectURL(isImagePreview);
      setisImagePreview(URL.createObjectURL(targetFile));
    } else {
      setImageFile(null);
      setisImagePreview(null);
    }
  };

  const {
    register,
    control,
    handleSubmit,
    setValue,

    formState: { errors },
  } = useForm<EditProductFormInput>({
    defaultValues: {
      name: "",
      stock: 0,
      units: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "units",
  });

  const watchedImage = useWatch({
    control,
    name: "image",
  });

  const imagePreview = React.useMemo(() => {
    const imageList = watchedImage as FileList | undefined;
    if (imageList && imageList.length > 0) {
      const file = imageList[0];
      return URL.createObjectURL(file);
    }
    return null;
  }, [watchedImage]);

  useEffect(() => {
    const loadProductData = async () => {
      if (!id || id === "undefined") return;
      try {
        setLoading(true);
        const product: Product = await ProductService.getProduct(id);

        setValue("name", product.name);
        setValue("stock", product.stock);
        const mappedUnits = (product.units || []).map((u) => ({
          unit_name: u.unit_name,
          conversion_factor: u.conversion_factor,
          price: u.price,
        }));
        setValue("units", mappedUnits);

        if (product.image) {
          setCurrentImageUrl(`http://127.0.0.1:8000/storage/${product.image}`);
        }
      } catch (error) {
        toast.error("Gagal mengambil data produk");
        router.back();
      } finally {
        setLoading(false);
      }
    };
    loadProductData();
  }, [id, setValue, router]);

  const onSubmit = async (data: EditProductFormInput) => {
    try {
      setSubmitting(true);
      const payload: ProductRequest = {
        name: data.name,
        stock: data.stock,
        image: imageFile as any,
        units: data.units,
      };

      await ProductService.updateProduct(id, payload);

      toast.success("Produk berhasil diperbarui!");
      router.push(`/products/${id}`);
      router.refresh();
    } catch (error) {
      toast.error("Gagal memperbarui data produk" + error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-ghost-white">
        <div className="animate-spin text-brand-dark font-bold text-xs uppercase tracking-widest">
          <Loader2 className="animate-spin text-brand-dark w-8 h-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4 md:p-6 text-brand-dark">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-brand-dark hover:text-brand-dark/80 cursor-pointer transition-colors group"
        >
          <div className="p-2 rounded-full group-hover:bg-brand-dark/5 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest">
            Cancel
          </span>
        </button>
        <h2 className="text-sm font-black uppercase tracking-widest text-primary">
          Edit Form
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-5 border border-brand-dark/10 rounded-2xl overflow-hidden bg-ivory-white/30 backdrop-blur-md p-5 shadow-xl space-y-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-dark/40">
              Product Image
            </span>

            <div className="relative w-full aspect-square bg-ivory-white/20 border border-dashed border-brand-dark/20 rounded-xl flex items-center justify-center overflow-hidden">
              {isImagePreview ? (
                <Image
                  src={isImagePreview}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="text-center p-4 space-y-2">
                  <ImageIcon className="w-8 h-8 mx-auto text-brand-dark/30" />
                  <p className="text-xs text-brand-dark/40 font-medium">
                    No Image Uploaded
                  </p>
                </div>
              )}
            </div>

            <label className="block w-full text-center px-4 py-2.5 rounded-xl text-xs font-bold bg-brand-dark/5 hover:bg-brand-dark/10 border border-brand-dark/10 cursor-pointer transition-all">
              Choose New Image
              <input
                type="file"
                id="product-image"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          <div className="md:col-span-7 p-6 border border-brand-dark/10 rounded-2xl shadow-xl bg-ivory-white/30 backdrop-blur-md space-y-5">
            <div className="pb-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                Primary Information
              </span>
            </div>

            <div className="relative">
              <FloatingInput
                id="name"
                label="Product Name"
                type="text"
                {...register("name", { required: "Product name is required" })}
              />
              {errors.name && (
                <span className="text-[10px] text-red-500 font-bold mt-1 block">
                  {errors.name.message}
                </span>
              )}
            </div>

            <div>
              <FloatingInput
                id="stock"
                label="Base Stock (Pcs)"
                type="number"
                {...register("stock", { required: true, valueAsNumber: true })}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-3.5 bg-primary rounded-full" />
              <h4 className="text-[11px] font-black uppercase tracking-widest text-brand-dark/80">
                Configure Pricing Tiers
              </h4>
            </div>

            <button
              type="button"
              onClick={() =>
                append({ unit_name: "", conversion_factor: 1, price: 0 })
              }
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase bg-primary text-ivory-white hover:opacity-90 transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-3 h-3" /> Add Tier
            </button>
          </div>

          <div className="w-full border border-brand-dark/10 rounded-2xl overflow-hidden bg-ivory-white/30 backdrop-blur-md shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-brand-dark/10 bg-ivory-white/50 text-[10px] font-black uppercase tracking-wider text-brand-dark/60">
                    <th className="py-4 px-6 w-16 text-center">No</th>
                    <th className="py-4 px-4">Unit Name</th>
                    <th className="py-4 px-4 w-44 text-center">
                      Conversion Factor
                    </th>
                    <th className="py-4 px-4 w-52 text-right">Price (IDR)</th>
                    <th className="py-4 px-4 text-center w-16">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-dark/5 text-xs">
                  {fields.map((field, i) => (
                    <tr
                      key={field.id}
                      className="hover:bg-ivory-white/10 transition-colors"
                    >
                      <td className="py-5 px-6 text-center font-mono font-bold text-brand-dark/40">
                        {String(i + 1).padStart(2, "0")}
                      </td>
                      <td className="py-5 px-4">
                        <FloatingInput
                          id={`unit_name_${i}`}
                          label="Unit Name"
                          type="text"
                          {...register(`units.${i}.unit_name` as const, {
                            required: true,
                          })}
                        />
                      </td>

                      <td className="py-5 px-4">
                        <FloatingInput
                          id={`conversion_factor_${i}`}
                          label="Factor"
                          type="number"
                          className="text-center font-mono"
                          {...register(
                            `units.${i}.conversion_factor` as const,
                            { required: true, valueAsNumber: true },
                          )}
                        />
                      </td>
                      <td className="py-5 px-4">
                        <FloatingInput
                          id={`price_${i}`}
                          label="Price Amount"
                          type="number"
                          className="text-right"
                          {...register(`units.${i}.price` as const, {
                            required: true,
                            valueAsNumber: true,
                          })}
                        />
                      </td>

                      <td className="py-5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => remove(i)}
                          className="p-2 text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-lg transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {fields.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-8 text-center text-xs text-brand-dark/40 font-medium"
                      >
                        No pricing tiers defined. Click &quot;Add Tier&quot; to
                        add data.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <ButtonLoad
            type="submit"
            isLoading={submitting}
            className="px-6 py-3 rounded-xl text-xs font-black uppercase text-ivory-white bg-brand-dark hover:bg-brand-dark/90 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-md"
          >
            Save Changes
          </ButtonLoad>
        </div>
      </form>
    </div>
  );
}
