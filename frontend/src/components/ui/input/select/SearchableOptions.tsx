"use client";

import React, { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { ChevronDown, Search, Check } from "lucide-react";

interface OptionItem {
  id: string | number;
  name: string;
}

interface SearchableSelectProps {
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  options: OptionItem[];
  value: string | number;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
}

export default function SearchableSelect({
  label,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  options,
  value,
  onChange,
  disabled = false,
  required = false,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const selectedItem = options.find((opt) => String(opt.id) === String(value));
  const filteredOptions = options.filter((opt) =>
    opt.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="block text-xs font-semibold text-zinc-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button
            type="button"
            disabled={disabled}
            aria-expanded={open}
            className="flex w-full items-center justify-between rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-xs font-semibold text-zinc-700 shadow-3xs transition-all hover:border-zinc-300 focus:outline-none focus:border-brand-dark focus:ring-4 focus:ring-brand-dark/5 disabled:bg-zinc-50 disabled:text-zinc-400 disabled:border-zinc-200 disabled:cursor-not-allowed text-left"
          >
            <span
              className={
                selectedItem ? "text-zinc-700 truncate" : "text-zinc-400"
              }
            >
              {selectedItem ? selectedItem.name : placeholder}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-zinc-400 shrink-0 transition-transform duration-200 ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={4}
            className="z-50 w-(--radix-popover-trigger-width) rounded-xl border border-zinc-200 bg-white p-1.5 shadow-lg animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="relative flex items-center border-b border-zinc-100 pb-1.5 mb-1 px-1">
              <Search className="absolute left-2.5 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg bg-zinc-50 pl-8 pr-3 py-1.5 text-xs text-zinc-700 placeholder:text-zinc-400 focus:outline-none border border-zinc-100 focus:border-zinc-200"
                autoFocus
              />
            </div>
            <div className="max-h-48 overflow-y-auto space-y-0.5 custom-scrollbar">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => {
                  const isSelected = String(value) === String(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        onChange(String(opt.id));
                        setOpen(false);
                        setSearchQuery("");
                      }}
                      className={`flex w-full items-center justify-between px-2.5 py-2 text-xs font-medium rounded-lg transition-colors text-left ${
                        isSelected
                          ? "bg-zinc-950 text-white"
                          : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                      }`}
                    >
                      <span className="truncate">{opt.name}</span>
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 text-white shrink-0" />
                      )}
                    </button>
                  );
                })
              ) : (
                <p className="text-[11px] text-zinc-400 text-center py-4">
                  No data found.
                </p>
              )}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
