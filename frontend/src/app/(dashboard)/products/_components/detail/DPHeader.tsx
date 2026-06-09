"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function DPHEader() {
  const router = useRouter();
  return (
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
  );
}
