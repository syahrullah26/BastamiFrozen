"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function DCBack() {
  const router = useRouter();
  return (
    <div className="flex-none">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-brand-dark hover:text-brand-primary cursor-pointer transition-colors group"
      >
        <div className="p-2 rounded-xl group-hover:bg-brand-primary/10 transition-all duration-300">
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        </div>
        <span className="text-xs font-black uppercase tracking-[0.2em] pl-1 hidden xs:inline">
          Back
        </span>
      </button>
    </div>
  );
}
