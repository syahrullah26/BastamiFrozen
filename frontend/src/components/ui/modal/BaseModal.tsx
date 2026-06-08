import React from "react";
import { X } from "lucide-react";

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export const BaseModal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}: BaseModalProps) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-2xl",
    xl: "max-w-5xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        className={`bg-ghost-white border border-foreground/30 w-full ${sizeClasses[size]} max-h-[calc(100vh-2rem)] flex flex-col rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200`}
      >
        {/* Header Modal - Tetap Diam di Atas (Sticky/Fixed) */}
        <div className="flex justify-between items-center p-6 border-b border-white/5 shrink-0">
          <h3 className="text-lg font-bold text-gold-luxury">{title}</h3>
          <button
            onClick={onClose}
            className="text-zinc-400 cursor-pointer hover:text-red-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};
