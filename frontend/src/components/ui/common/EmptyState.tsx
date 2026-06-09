"use client";

import React from "react";
import { FolderOpen } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({
  title = "No Data Available",
  description = "There is no information to display at the moment.",
  icon,
  actionButton,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 md:p-12 border border-dashed border-zinc-200 bg-zinc-50/30 rounded-2xl transition-all">
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-100 text-zinc-400 mb-4 border border-zinc-200/50">
        {icon ? icon : <FolderOpen className="w-6 h-6 stroke-1.5" />}
      </div>
      <div className="max-w-sm space-y-1">
        <h4 className="text-sm font-bold text-zinc-800">{title}</h4>
        <p className="text-xs text-zinc-400 leading-relaxed">{description}</p>
      </div>
      {actionButton && (
        <button
          type="button"
          onClick={actionButton.onClick}
          className="mt-5 px-4 py-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl shadow-sm transition-all cursor-pointer"
        >
          {actionButton.label}
        </button>
      )}
    </div>
  );
}
