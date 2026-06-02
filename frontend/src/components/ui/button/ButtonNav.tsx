import React from "react";
import Link from "next/link";

interface ButtonNavProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  variant?: "primary" | "secondary" | "danger" | "neutral";
}

export default function ButtonNav({
  children,
  href,
  icon,
  iconPosition = "right",
  fullWidth = true,
  variant = "primary",
  className = "",
  ...props
}: ButtonNavProps) {
  const baseStyle = `
    group py-3 rounded-xl font-bold text-sm tracking-wide shadow-md 
    transition-all duration-300 relative overflow-hidden flex items-center justify-center gap-2
    cursor-pointer active:scale-[0.98]
    border border-foreground/30
    ${fullWidth ? "w-full" : "px-6"}
  `;
  const variants = {
    primary: "bg-primary-brand text-background hover:bg-brand-dark ",
    secondary:
      "bg-gray-100 text-gray-800 hover:bg-gray-200 border border-foreground/30 shadow-sm",
    danger: "bg-red-600 text-white hover:bg-red-700",
    neutral: "bg-surface text-gray-800   hover:bg-brand-surface/80",
  };

  const combinedClassName = `${baseStyle} ${variants[variant]} ${className}`;

  const renderIcon = () => {
    if (!icon) return null;
    return (
      <span
        className={`
        transition-transform duration-300 ease-out transform
        ${iconPosition === "right" ? "group-hover:translate-x-1" : "group-hover:-translate-x-1"}
      `}
      >
        {icon}
      </span>
    );
  };

  if (href) {
    return (
      <Link href={href} className={combinedClassName}>
        {icon && iconPosition === "left" && renderIcon()}
        {children}
        {icon && iconPosition === "right" && renderIcon()}
      </Link>
    );
  }
  return (
    <button type="button" className={combinedClassName} {...props}>
      {icon && iconPosition === "left" && renderIcon()}
      {children}
      {icon && iconPosition === "right" && renderIcon()}
    </button>
  );
}
