import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { cn } from "./lib/utils";

type Toast = {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  duration?: number;
  type?: "default" | "success" | "danger";
};

type ToastContextValue = {
  toasts: Toast[];
  toast: (toast: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: React.PropsWithChildren) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const toast = React.useCallback((toast: Omit<Toast, "id">) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((current) => [
      ...current,
      {
        id,
        duration: toast.duration ?? 4000,
        type: toast.type ?? "default",
        ...toast,
      },
    ]);
  }, []);

  const dismiss = React.useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id != id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        <ToastPrimitive.Viewport className="fixed right-4 top-4 z-[100] flex w-[320px] flex-col gap-3" />
        {toasts.map((toast) => (
          <ToastPrimitive.Root
            key={toast.id}
            className={cn(
              "pointer-events-auto relative flex w-full flex-col gap-1 rounded-lg border border-neutral-muted/40 bg-surface p-4 shadow-lg",
              toast.type === "success" && "border-success/30 bg-success/10 text-success",
              toast.type === "danger" && "border-danger/30 bg-danger/10 text-danger"
            )}
            duration={toast.duration}
            onOpenChange={(open) => {
              if (!open) dismiss(toast.id);
            }}
          >
            {toast.title ? <ToastPrimitive.Title className="text-sm font-semibold">{toast.title}</ToastPrimitive.Title> : null}
            {toast.description ? (
              <ToastPrimitive.Description className="text-sm text-neutral-foreground-secondary">
                {toast.description}
              </ToastPrimitive.Description>
            ) : null}
            {toast.action ? <div className="mt-2 flex items-center gap-2">{toast.action}</div> : null}
          </ToastPrimitive.Root>
        ))}
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
