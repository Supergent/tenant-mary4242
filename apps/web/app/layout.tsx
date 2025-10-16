import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@jn703s5hkkh7cm8dfq88ydf2y57sk5w4/components";
import { ConvexClientProvider } from "@/providers/convex-provider";

export const metadata: Metadata = {
  title: "Todo - Clean Task Management",
  description: "A clean, distraction-free todo list application with AI assistance",
};

export default function RootLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ConvexClientProvider>
          <AppProviders>{children}</AppProviders>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
