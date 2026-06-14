import * as React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`flex h-12 w-full rounded-sm border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-accent disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
