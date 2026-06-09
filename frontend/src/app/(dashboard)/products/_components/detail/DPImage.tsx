"use client";

import React from "react";
import Image from "next/image";

interface DPImageProps {
  image: string;
  productName: string;
}

export default function DPImage({ image, productName }: DPImageProps) {
  return (
    <div className="md:col-span-5 border border-brand-dark/10 rounded-2xl overflow-hidden bg-ivory-white/30 backdrop-blur-md shadow-xl transition-all duration-300 hover:shadow-2xl group">
      <div className="relative w-full aspect-square bg-ivory-white/20 flex items-center justify-center p-4">
        <Image
          src={image}
          alt={productName}
          fill
          priority
          sizes="(max-w-768px) 100vw, 400px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
    </div>
  );
}
