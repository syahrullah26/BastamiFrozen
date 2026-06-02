import React, { InputHTMLAttributes, useId } from "react";

interface FloatingInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const FloatingInput = React.forwardRef<
  HTMLInputElement,
  FloatingInputProps
>(
  (
    { label, className = "", type = "text", placeholder = " ", ...props },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = props.id || generatedId;

    return (
      <div className="relative mt-2 w-full">
        <input
          {...props}
          ref={ref}
          type={type}
          id={inputId}
          placeholder={placeholder}
          className={`peer w-full px-4 py-3 rounded-xl bg-snow-white border border-border text-foreground placeholder-transparent focus:outline-none focus:ring-2 focus:ring-brand-dark focus:border-transparent transition-all duration-200 text-sm ${className}`}
        />
        <label
          htmlFor={inputId}
          className="absolute left-4 top-3 text-sm font-medium text-muted-foreground transition-all duration-200 pointer-events-none 
            peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-brand-dark peer-focus:bg-surface peer-focus:px-1.5 peer-focus:rounded-2xl 
            peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-snow-white peer-[:not(:placeholder-shown)]:px-1.5"
        >
          {label}
        </label>
      </div>
    );
  },
);

FloatingInput.displayName = "FloatingInput";
