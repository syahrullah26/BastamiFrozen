"use client";

import React from "react";

interface GlobalLoaderProps {
  message?: string;
  fullScreen?: boolean;
}

export default function GlobalLoader({
  message = "Loading...",
  fullScreen = false,
}: GlobalLoaderProps) {
  const containerStyles = fullScreen
    ? "fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-white/80 backdrop-blur-sm min-h-screen w-screen"
    : "flex flex-col items-center justify-center gap-3 py-12 w-full";

  return (
    <div className={containerStyles}>
      <div className="w-8 h-8 border-4 border-primary-brand/20 border-t-primary-brand rounded-full animate-spin" />
      <span className="text-sm font-bold text-brand-dark animate-pulse">
        {message}
      </span>
    </div>
  );
}
