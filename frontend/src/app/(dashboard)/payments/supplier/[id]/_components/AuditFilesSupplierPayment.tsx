"use client";

import React from "react";
import { ExternalLink, FileText } from "lucide-react";
import ButtonNav from "@/components/ui/button/ButtonNav";

interface AuditFilesSupplierPaymentProps {
  id: string | number;
}

export default function AuditFilesSupplierPayment({
  id,
}: AuditFilesSupplierPaymentProps) {
  return (
    <>
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs p-6 space-y-4">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
          Linked Audit Files
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border border-zinc-100 bg-zinc-50/50 rounded-xl hover:border-zinc-200 transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-600">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-brand-dark">
                  Expense Log Ledger
                </h5>
                <p className="text-[10px] text-zinc-400 font-medium">
                  Automatic System Log
                </p>
              </div>
            </div>
            <ButtonNav
              href={`/suppliers/${id}`}
              icon={<ExternalLink className="w-4 h-4" />}
              fullWidth={false}
              variant="secondary"
              className="text-zinc-400 hover:text-brand-dark transition-colors cursor-pointer"
            />
          </div>

          {/* <div className="flex items-center justify-between p-3 border border-zinc-100 bg-zinc-50/50 rounded-xl hover:border-zinc-200 transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 border border-purple-100 rounded-lg text-purple-600">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-brand-dark">
                      Purchase Invoice
                    </h5>
                    <p className="text-[10px] text-zinc-400 font-medium">
                      PDF Document
                    </p>
                  </div>
                </div>
                <ButtonNav
                  onClick={() =>
                    toast.success("Button Print Pressed Successfully")
                  }
                  icon={<Download className="w-4 h-4" />}
                  fullWidth={false}
                  variant="secondary"
                  className="text-zinc-400 hover:text-brand-dark transition-colors cursor-pointer"
                />
              </div> */}
        </div>
      </div>
    </>
  );
}
