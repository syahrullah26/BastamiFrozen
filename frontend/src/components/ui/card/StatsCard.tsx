/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";

interface StatsCardProps {
  title: string;
  subtitle?: string;
  subvalue?: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  bgColor?: string;
  textColor?: string;
  className?: string;
}

export default function StatsCard({
  title,
  subtitle,
  subvalue,
  value,
  icon,
  iconBgColor = "bg-blue-50",
  iconColor = "text-blue-600",
  bgColor = "bg-white",
  textColor = "text-zinc-900",
  className = "",
}: StatsCardProps) {
  return (
    <div
      className={`flex items-center gap-4 p-5 ${bgColor} rounded-xl border border-zinc-200 shadow-sm transition-all duration-300 hover:shadow-md ${className}`}
    >
      <div
        className={`flex items-center justify-center w-14 h-14 rounded-xl shrink-0 ${iconBgColor} ${iconColor}`}
      >
        {React.isValidElement(icon)
          ? React.cloneElement(icon as React.ReactElement<any>, {
              className: "w-6 h-6 stroke-",
            })
          : icon}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[11px] font-bold tracking-wider text-gray-500 uppercase">
          {title}
        </span>
        <p className="text-xs tracking-wider text-zinc-400">{subtitle}</p>
        <span
          className={`text-2xl font-extrabold ${textColor} mt-0.5 tracking-tight truncate`}
        >
          {typeof value === "number" ? value.toLocaleString("id-ID") : value}{" "}
          <span className="text-xl font-bold text-brand-dark">{subvalue}</span>
        </span>
      </div>
    </div>
  );
}
