import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg+div]:ml-10",
  {
    variants: {
      variant: {
        info: "border-primary/20 bg-primary/10 text-primary",
        success: "border-success/20 bg-success/10 text-success",
        warning: "border-warning/20 bg-warning/10 text-warning",
        danger: "border-danger/20 bg-danger/10 text-danger",
        neutral: "border-neutral-muted bg-surface text-neutral-foreground",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
);

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(({ className, variant, ...props }, ref) => (
  <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
));

Alert.displayName = "Alert";

export const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => (
  <h5 ref={ref} className={cn("mb-1 font-semibold leading-none tracking-tight", className)} {...props} />
));

AlertTitle.displayName = "AlertTitle";

export const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-sm leading-relaxed text-neutral-foreground", className)} {...props} />
));

AlertDescription.displayName = "AlertDescription";
