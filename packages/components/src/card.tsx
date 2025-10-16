import * as React from "react";
import { cn } from "./lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(( { className, ...props }, ref) => (
  <div ref={ref} className={cn("rounded-lg border border-neutral-muted/40 bg-surface p-6 shadow-sm", className)} {...props} />
));

Card.displayName = "Card";

export const CardHeader = React.forwardRef<HTMLDivElement, CardProps>(( { className, ...props }, ref) => (
  <div ref={ref} className={cn("mb-4 flex flex-col gap-1 border-b border-neutral-muted/40 pb-4", className)} {...props} />
));

CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(( { className, ...props }, ref) => (
  <h3 ref={ref} className={cn("font-heading text-lg font-semibold text-primary", className)} {...props} />
));

CardTitle.displayName = "CardTitle";

export const CardContent = React.forwardRef<HTMLDivElement, CardProps>(( { className, ...props }, ref) => (
  <div ref={ref} className={cn("grid gap-4", className)} {...props} />
));

CardContent.displayName = "CardContent";
