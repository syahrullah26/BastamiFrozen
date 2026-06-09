"use client";
import React, { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Column<T> {
  header: ReactNode;
  accessor: keyof T | ((item: T) => ReactNode);
  className?: string;
}

interface PaginationProps {
  currentPage: number;
  lastPage: number;
  totalItems?: number;
  onPageChange: (page: number) => void;
}

interface TableDataProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  pagination?: PaginationProps;
}

export default function TableData<T extends { id: string | number }>({
  columns,
  data,
  loading,
  pagination,
}: TableDataProps<T>) {
  const renderPageNumbers = () => {
    if (!pagination) return null;
    const { currentPage, lastPage, onPageChange } = pagination;
    const pages = [];

    for (let i = 1; i <= lastPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`w-8 h-8 rounded-lg text-xs font-bold transition-all duration-200 ${
            currentPage === i
              ? "bg-primary-brand text-ghost-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100 hover:text-brand-dark"
          }`}
        >
          {i}
        </button>,
      );
    }
    return pages;
  };

  return (
    <div className="w-full bg-white rounded-xl border border-foreground/10 shadow-sm overflow-hidden">
      <div className="w-full overflow-x-auto pb-2">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-foreground/10 bg-primary-brand/90">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`px-6 py-4 text-ghost-white text-xs font-bold tracking-wider uppercase ${
                    col.className || ""
                  }`}
                >
                  <div className="flex items-center gap-1.5 cursor-pointer hover:text-brand-dark transition-colors group/thead">
                    {col.header}
                    <span className="text-[10px] text-ghost-white/70 group-hover/thead:text-brand-dark transition-colors">
                      ▼
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="py-20 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="w-8 h-8 border-4 border-primary-brand/20 border-t-primary-brand rounded-full animate-spin"></div>
                    <span className="text-sm font-bold text-brand-dark animate-pulse">
                      Loading...
                    </span>
                  </div>
                </td>
              </tr>
            ) : data.length > 0 ? (
              data.map((item, index) => {
                const isEven = index % 2 === 0;

                return (
                  <tr
                    key={item.id || index}
                    className={`
                      group transition-colors duration-200 
                      hover:bg-slate-50
                      ${isEven ? "bg-ghost-white/40" : "bg-white"}
                    `}
                  >
                    {columns.map((col, idx) => (
                      <td
                        key={idx}
                        className={`px-6 py-4 text-sm text-slate-700 font-medium ${
                          col.className || ""
                        }`}
                      >
                        {typeof col.accessor === "function"
                          ? col.accessor(item)
                          : (item[col.accessor] as React.ReactNode)}
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-20 text-center text-sm font-medium text-zinc-400 bg-white"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="text-lg">📦</span>
                    <span>No Data Found.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination && !loading && data.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-white border-t border-slate-100">
          <div className="text-xs font-medium text-slate-500">
            Showing page{" "}
            <span className="font-bold text-brand-dark">
              {pagination.currentPage}
            </span>{" "}
            of{" "}
            <span className="font-bold text-brand-dark">
              {pagination.lastPage}
            </span>{" "}
            pages
            {pagination.totalItems !== undefined && (
              <> ({pagination.totalItems} total entries)</>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() =>
                pagination.onPageChange(pagination.currentPage - 1)
              }
              disabled={pagination.currentPage === 1}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1">{renderPageNumbers()}</div>
            <button
              onClick={() =>
                pagination.onPageChange(pagination.currentPage + 1)
              }
              disabled={pagination.currentPage === pagination.lastPage}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
