import * as React from "react";
import { cn } from "./lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type = "text", ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      "flex h-10 w-full rounded-md border border-neutral-muted/50 bg-surface px-3 py-2 text-sm ring-offset-background placeholder:text-neutral-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  />
));

Input.displayName = "Input";
