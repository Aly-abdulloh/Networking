"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { CheckCircle2, X, XCircle } from "lucide-react";
import { cn } from "../lib/utils";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const value = useMemo(
    () => ({
      toast(message, type = "success") {
        const id = Date.now() + Math.random();
        setToasts((current) => [...current, { id, message, type }]);
        setTimeout(
          () => setToasts((current) => current.filter((toast) => toast.id !== id)),
          3500
        );
      },
    }),
    []
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
        {toasts.map((item) => {
          const Icon = item.type === "error" ? XCircle : CheckCircle2;
          return (
            <div
              key={item.id}
              className={cn(
                "flex items-center gap-3 rounded-lg border bg-background p-4 text-sm shadow-lg",
                item.type === "error" && "border-destructive/40"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4",
                  item.type === "error" ? "text-destructive" : "text-foreground"
                )}
              />
              <span className="flex-1">{item.message}</span>
              <button
                onClick={() =>
                  setToasts((current) =>
                    current.filter((toast) => toast.id !== item.id)
                  )
                }
                aria-label="Yopish"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
