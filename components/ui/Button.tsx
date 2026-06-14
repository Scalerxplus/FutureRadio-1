import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

export interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50";
    
    const variants = {
      primary: "brutalist-border bg-neutral-950 text-white hover:bg-black uppercase tracking-widest relative overflow-hidden group",
      secondary: "bg-white text-black hover:bg-gray-200 uppercase tracking-widest",
      outline: "border border-red-accent text-red-accent hover:bg-red-accent/10 uppercase tracking-widest",
    };

    const sizes = {
      sm: "h-9 px-4 text-xs font-mono",
      md: "h-11 px-8 text-sm font-display",
      lg: "h-14 px-10 text-xl font-display pt-1",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
Button.displayName = "Button";
