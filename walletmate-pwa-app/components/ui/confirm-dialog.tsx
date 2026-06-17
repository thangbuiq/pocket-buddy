"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { AlertTriangle } from "lucide-react";

type ConfirmOptions = {
  title?: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
};

type ConfirmContextType = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
};

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function ConfirmDialogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolver, setResolver] = useState<(value: boolean) => void>();

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve);
    });
  }, []);

  const handleConfirm = () => {
    resolver?.(true);
    setIsOpen(false);
  };

  const handleCancel = () => {
    resolver?.(false);
    setIsOpen(false);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {isOpen && options && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
            onClick={handleCancel}
          />
          <div className="relative z-50 w-full max-w-md scale-100 rounded-[4px] border border-border bg-card p-6 shadow-lg sm:rounded-lg">
            <div className="flex flex-col gap-4">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 shrink-0 text-destructive mt-0.5" />
                <div className="flex-1 space-y-2">
                  <h2 className="font-serif text-lg font-medium tracking-tight text-foreground">
                    {options.title || "Confirm Action"}
                  </h2>
                  <p className="font-sans text-sm text-muted">
                    {options.description}
                  </p>
                </div>
              </div>
              <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="inline-flex h-10 items-center justify-center rounded-[3px] border border-border bg-transparent px-4 font-mono text-[0.8rem] uppercase tracking-[0.08em] text-foreground transition-colors hover:bg-muted-background cursor-pointer"
                >
                  {options.cancelText || "Cancel"}
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="inline-flex h-10 items-center justify-center rounded-[3px] bg-destructive px-4 font-mono text-[0.8rem] uppercase tracking-[0.08em] text-primary-foreground transition-colors hover:opacity-90 cursor-pointer"
                >
                  {options.confirmText || "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context)
    throw new Error("useConfirm must be used within ConfirmDialogProvider");
  return context;
}
