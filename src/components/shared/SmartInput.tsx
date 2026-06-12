"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Sparkles, Check, X, Loader2 } from "lucide-react";
import { useI18n, useCurrency } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";
import type { ParsedExpense } from "@/lib/validations/parse";

export function SmartInput() {
  const { t, language } = useI18n();
  const { currency } = useCurrency();
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const [preview, setPreview] = useState<ParsedExpense | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const parseMutation = useMutation({
    mutationFn: async (input: string) => {
      const res = await fetch("/api/parse-expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input, language }),
      });

      if (!res.ok) {
        const error = await res.json();
        if (error.redirect) {
          window.location.href = error.redirect;
          return;
        }
        throw new Error(error.error || "Parse failed");
      }

      return res.json() as Promise<ParsedExpense>;
    },
    onSuccess: (data) => {
      if (data) setPreview(data);
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: ParsedExpense) => {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Save failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setText("");
      setPreview(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    parseMutation.mutate(text);
  };

  const handleApprove = () => {
    if (preview) {
      saveMutation.mutate(preview);
    }
  };

  const handleReject = () => {
    setPreview(null);
    inputRef.current?.focus();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && preview) {
        handleReject();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [preview]);

  const isLoading = parseMutation.isPending || saveMutation.isPending;

  return (
    <div className="relative">
      {/* Input */}
      <form onSubmit={handleSubmit}>
        <div
          className={`flex items-center gap-3 rounded-[4px] border bg-card p-2 transition-colors ${
            isFocused ? "border-primary" : "border-border"
          }`}
        >
          <Sparkles
            className={`ml-2 h-5 w-5 transition-colors ${isFocused ? "text-primary" : "text-muted"}`}
          />
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={t("smartInputPlaceholder")}
            className="flex-1 bg-transparent px-2 py-3 font-sans text-foreground placeholder:text-muted focus:outline-none"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!text.trim() || isLoading}
            className="flex h-10 w-10 items-center justify-center rounded-[3px] bg-primary text-primary-foreground transition-opacity hover:opacity-85 disabled:opacity-50 cursor-pointer"
          >
            {parseMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
          </button>
        </div>
      </form>

      {/* Preview Popup */}
      {preview && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 animate-in">
          <div className="rounded-[4px] border border-border bg-card p-6">
            <p className="mb-3 font-mono text-[0.7rem] uppercase tracking-[0.15em] text-muted">
              {t("previewTitle")}
            </p>

            <div className="space-y-3 rounded-[3px] border border-border bg-background p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-muted">
                  {t(preview.type === "expense" ? "expense" : "income")}
                </span>
                <span
                  className={`font-mono text-lg font-medium ${
                    preview.type === "expense"
                      ? "text-destructive"
                      : "text-success"
                  }`}
                >
                  {preview.type === "expense" ? "-" : "+"}
                  {formatCurrency(preview.amount, currency)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-muted">
                  {t("category")}
                </span>
                <span className="text-foreground">{preview.category}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-muted">
                  Mô tả
                </span>
                <span className="text-foreground">{preview.description}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-muted">
                  Ngày
                </span>
                <span className="font-mono text-[0.8rem] text-foreground">
                  {preview.transactionDate}
                </span>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={handleApprove}
                disabled={saveMutation.isPending}
                className="flex flex-1 items-center justify-center gap-2 rounded-[3px] bg-primary py-3 font-mono text-[0.8rem] uppercase tracking-[0.08em] text-primary-foreground transition-opacity hover:opacity-85 disabled:opacity-50 cursor-pointer"
              >
                {saveMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                {t("approve")}
              </button>
              <button
                onClick={handleReject}
                className="flex items-center justify-center gap-2 rounded-[3px] border border-border px-5 py-3 font-mono text-[0.8rem] uppercase tracking-[0.08em] text-muted transition-colors hover:border-primary hover:text-primary cursor-pointer"
              >
                <X className="h-4 w-4" />
                {t("reject")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
