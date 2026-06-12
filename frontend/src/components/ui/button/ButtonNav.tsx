import React from "react";
import Link from "next/link";

interface ButtonNavProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  variant?: "primary" | "secondary" | "danger" | "neutral";
  disabled?: boolean;
}

export default function ButtonNav({
  children,
  href,
  icon,
  iconPosition = "right",
  fullWidth = true,
  variant = "primary",
  disabled = false,
  className = "",
  ...props
}: ButtonNavProps) {
  const baseStyle = `
    group relative overflow-hidden flex items-center justify-center gap-2
    py-2.5 font-semibold text-xs uppercase tracking-wider
    rounded-xl shadow-[0_2px_8px_-3px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.12)]
    transition-all duration-300 ease-in-out  
    active:scale-[0.97] select-none border
    ${fullWidth ? "w-full" : "px-5"}
  `;

  const variants = {
    primary: "bg-brand-dark text-white border-brand-dark hover:bg-zinc-800",
    secondary:
      "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 shadow-2xs",
    danger:
      "bg-rose-500 text-white border-rose-500 hover:bg-rose-600 shadow-rose-100",
    neutral:
      "bg-zinc-100 text-zinc-600 border-zinc-100 hover:bg-zinc-200/70 hover:text-zinc-800 shadow-none",
  };

  const combinedClassName = `${baseStyle} ${variants[variant]} ${className}`;

  const renderIcon = () => {
    if (!icon) return null;
    return (
      <span
        className={`
          inline-flex items-center justify-center w-4 h-4
          transition-transform duration-300 ease-out transform shrink-0
          ${iconPosition === "right" ? "group-hover:translate-x-0.5" : "group-hover:-translate-x-0.5"}
        `}
      >
        {icon}
      </span>
    );
  };

  const shimmerElement = (
    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-linear-to-r from-transparent via-white/15 to-transparent transition-transform duration-1000 ease-in-out pointer-events-none" />
  );

  if (href) {
    return (
      <Link href={href} className={combinedClassName}>
        {shimmerElement}
        {icon && iconPosition === "left" && renderIcon()}
        <span className="relative z-10">{children}</span>
        {icon && iconPosition === "right" && renderIcon()}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={combinedClassName}
      disabled={disabled}
      {...props}
    >
      {shimmerElement}
      {icon && iconPosition === "left" && renderIcon()}
      <span className="relative z-10">{children}</span>
      {icon && iconPosition === "right" && renderIcon()}
    </button>
  );
}
