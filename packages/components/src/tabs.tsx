import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "./lib/utils";

export const Tabs = TabsPrimitive.Root;
export const TabsList = TabsPrimitive.List;
export const TabsTrigger = TabsPrimitive.Trigger;
export const TabsContent = TabsPrimitive.Content;

export function StyledTabsList({ className, ...props }: React.ComponentPropsWithoutRef<typeof TabsList>) {
  return (
    <TabsList className={cn("inline-flex h-10 items-center rounded-md bg-muted p-1 text-muted-foreground", className)} {...props} />
  );
}

export function StyledTabsTrigger({ className, ...props }: React.ComponentPropsWithoutRef<typeof TabsTrigger>) {
  return (
    <TabsTrigger
      className={cn(
        "inline-flex min-w-[120px] items-center justify-center rounded-md px-3 py-1 text-sm font-medium transition-all data-[state=active]:bg-surface data-[state=active]:text-primary data-[state=active]:shadow-sm",
        className
      )}
      {...props}
    />
  );
}

export function StyledTabsContent({ className, ...props }: React.ComponentPropsWithoutRef<typeof TabsContent>) {
  return <TabsContent className={cn("mt-4 focus-visible:outline-none", className)} {...props} />;
}
