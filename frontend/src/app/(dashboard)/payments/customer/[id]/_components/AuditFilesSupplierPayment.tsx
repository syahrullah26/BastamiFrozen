"use client";

import React from "react";
import { ExternalLink, FileText } from "lucide-react";
import ButtonNav from "@/components/ui/button/ButtonNav";

interface AuditFilesCustomerPaymentProps {
  id: string | number;
}

export default function AuditFilesCustomerPayment({
  id,
}: AuditFilesCustomerPaymentProps) {
  return (
    <>
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs p-6 space-y-4">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
          Related Documents
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border border-zinc-100 bg-zinc-50/50 rounded-xl hover:border-zinc-200 transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 border border-blue-100 rounded-lg text-primary-brand">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-brand-dark">
                  Order Document
                </h5>
                <p className="text-[10px] text-zinc-400 font-medium">
                  Linked Customer Bill
                </p>
              </div>
            </div>
            <ButtonNav
              href={`/customers/${id}`}
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
                      System Invoice
                    </h5>
                    <p className="text-[10px] text-zinc-400 font-medium">
                      PDF Format
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
