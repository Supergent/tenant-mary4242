"use client";

import * as React from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ToastProvider } from "./toast";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export const ThemeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <>{children}</>;
};

export const AppProviders: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <ConvexProvider client={convex}>
      <ThemeProvider>
        <ToastProvider>{children}</ToastProvider>
      </ThemeProvider>
    </ConvexProvider>
  );
};
