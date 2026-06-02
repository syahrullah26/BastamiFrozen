import React from "react";
interface ButtonLoadProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export default function ButtonLoad({
  children,
  isLoading,
  loadingText = "Loading...",
  icon,
  type = "button",
  fullWidth = true,
  className = "",
  disabled,
  ...props
}: ButtonLoadProps) {
  return (
    <button
      type={type}
      disabled={isLoading || disabled}
      className={`
        group py-3  rounded-xl font-bold text-sm tracking-wide shadow-md 
        transition-all duration-300 relative overflow-hidden flex items-center justify-center gap-2
        ${fullWidth ? "w-full" : "px-6"}
        ${
          isLoading || disabled
            ? "bg-gray-400 text-gray-200 cursor-not-allowed"
            : "bg-primary-brand text-background hover:bg-brand-dark cursor-pointer active:scale-[0.98]"
        }
        ${className} 
      `}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <svg
            className="animate-spin h-5 w-5 text-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {loadingText}
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          {children}
          {icon && (
            <span className="transition-transform duration-300 ease-out transform group-hover:translate-x-1">
              {icon}
            </span>
          )}
        </span>
      )}
    </button>
  );
}
