"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  X,
  Loader2,
  Camera,
  Upload,
  ImageIcon,
  Sparkles,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n";
import { formatNumberInput, parseNumberInput } from "@/lib/utils";
import { parseText, parseImage } from "@/lib/api";
import { useTransactions } from "@/hooks/use-transactions";
import { useSuggestRecurring } from "@/hooks/use-suggest-recurring";
import {
  buildCandidateTransaction,
  getRecentHistoryForSuggestion,
} from "@/lib/transaction-helpers";
import type { ParsedExpense } from "@/lib/validations/parse";
import type { RecurringFrequency, RecurringSuggestion } from "@/types";

const CATEGORIES = [
  "Ăn uống",
  "Di chuyển",
  "Mua sắm",
  "Giải trí",
  "Hóa đơn",
  "Sức khỏe",
  "Học tập",
  "Lương",
  "Khác",
];

const RECURRING_FREQUENCIES: RecurringFrequency[] = [
  "daily",
  "weekly",
  "monthly",
  "yearly",
];

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB (matches Groq backend limit)

export function SmartInput() {
  const { t, language } = useI18n();
  const queryClient = useQueryClient();
  const { data: transactions = [] } = useTransactions();

  // State
  const [text, setText] = useState("");
  const [preview, setPreview] = useState<ParsedExpense | null>(null);
  const [editedData, setEditedData] = useState<ParsedExpense | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<RecurringSuggestion | null>(
    null,
  );
  const [showSuggestion, setShowSuggestion] = useState(false);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const imageUrlRef = useRef<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse mutation - handles both text and image input
  const parseMutation = useMutation({
    mutationFn: async (): Promise<ParsedExpense | null> => {
      try {
        if (selectedImage) {
          return await parseImage(selectedImage);
        }
        return await parseText(text, language);
      } catch (err) {
        // Handle redirect errors thrown by the API client
        const message = err instanceof Error ? err.message : "";
        try {
          const parsed = JSON.parse(message);
          if (parsed.redirect) {
            window.location.href = parsed.redirect;
            return null;
          }
        } catch {
          // Not a redirect error - re-throw
        }
        throw err;
      }
    },
    onSuccess: (data) => {
      if (data) {
        setPreview(data);
        setEditedData({ ...data, recurring: false, recurringFreq: undefined });
        setSuggestion(null);
        setShowSuggestion(false);
      }
    },
    onError: (err) => {
      // Show actual error message for debugging
      const message = err instanceof Error ? err.message : t("parseError");
      console.error("[SmartInput] Parse error:", message, err);
      setError(message);
    },
  });

  const suggestRecurringMutation = useSuggestRecurring();

  // Trigger recurring suggestion after preview is set
  useEffect(() => {
    if (!editedData) return;

    const candidate = buildCandidateTransaction({
      type: editedData.type,
      amount: editedData.amount,
      category: editedData.category,
      description: editedData.description,
      transactionDate: editedData.transactionDate,
    });

    const history = getRecentHistoryForSuggestion(
      transactions,
      editedData.transactionDate,
    );

    suggestRecurringMutation.mutate(
      { candidate, history, language },
      {
        onSuccess: (data) => {
          setSuggestion(data);
          if (
            data.recurring &&
            data.recurringFreq &&
            data.confidence !== "low"
          ) {
            setEditedData((prev) =>
              prev
                ? {
                    ...prev,
                    recurring: true,
                    recurringFreq: data.recurringFreq,
                  }
                : prev,
            );
            setShowSuggestion(true);
          } else {
            setShowSuggestion(false);
          }
        },
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preview?.description, preview?.amount, preview?.transactionDate]);

  // Save mutation (unchanged - still uses Next.js API route)
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
      setEditedData(null);
      setSuggestion(null);
      setShowSuggestion(false);
      // Clear image state
      if (imageUrlRef.current) {
        URL.revokeObjectURL(imageUrlRef.current);
        imageUrlRef.current = null;
      }
      setSelectedImage(null);
    },
  });

  // --- Image validation helper ---

  const validateAndSetImage = useCallback(
    (file: File) => {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError(t("invalidFileType"));
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        setError(t("fileTooLarge"));
        return;
      }

      // Validate image dimensions (must be at least 2x2 for Groq)
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        if (img.width < 2 || img.height < 2) {
          setError("Image too small (minimum 2x2 pixels)");
          return;
        }
        if (img.width > 8000 || img.height > 8000) {
          setError("Image too large (maximum 8000x8000 pixels)");
          return;
        }

        // All validations passed
        setError(null);
        if (imageUrlRef.current) {
          URL.revokeObjectURL(imageUrlRef.current);
        }
        imageUrlRef.current = objectUrl;
        setSelectedImage(file);
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        setError("Failed to load image");
      };
      img.src = objectUrl;
    },
    [t],
  );

  // --- Handlers ---

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !selectedImage) return;
    setError(null);
    parseMutation.mutate();
  };

  const handleApprove = () => {
    if (editedData) {
      saveMutation.mutate(editedData);
    }
  };

  const handleReject = () => {
    setPreview(null);
    setEditedData(null);
    setSuggestion(null);
    setShowSuggestion(false);
    inputRef.current?.focus();
  };

  const updateField = <K extends keyof ParsedExpense>(
    field: K,
    value: ParsedExpense[K],
  ) => {
    setEditedData((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  const handleUploadClick = () => {
    uploadInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    validateAndSetImage(file);
    // Reset file input so the same file can be selected again
    e.target.value = "";
  };

  const handleRemoveImage = () => {
    if (imageUrlRef.current) {
      URL.revokeObjectURL(imageUrlRef.current);
      imageUrlRef.current = null;
    }
    setSelectedImage(null);
    setError(null);
    inputRef.current?.focus();
  };

  // Paste handler - extract image from clipboard
  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            console.log("[SmartInput] Pasted image:", {
              name: file.name,
              type: file.type,
              size: file.size,
            });
            validateAndSetImage(file);
          }
          return;
        }
      }
      // If no image in clipboard, allow normal text paste (only if no image attached)
      if (selectedImage) {
        e.preventDefault();
      }
    },
    [validateAndSetImage, selectedImage],
  );

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (imageUrlRef.current) {
        URL.revokeObjectURL(imageUrlRef.current);
      }
    };
  }, []);

  // Escape key to reject preview
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
  const canSubmit = text.trim() !== "" || selectedImage !== null;
  const hasImage = selectedImage !== null;

  return (
    <div ref={containerRef} className="relative" onPaste={handlePaste}>
      {/* Input row */}
      <form onSubmit={handleSubmit}>
        <div
          className={`flex items-center gap-2 rounded-[4px] border bg-card p-2 transition-colors ${
            isFocused ? "border-primary" : "border-border"
          }`}
        >
          {/* Camera / Upload buttons - hidden when image is attached */}
          {!hasImage && (
            <>
              <button
                type="button"
                onClick={handleCameraClick}
                disabled={isLoading}
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[3px] border transition-colors cursor-pointer disabled:opacity-50 ${
                  isFocused
                    ? "border-primary text-primary"
                    : "border-border text-muted hover:border-primary hover:text-primary"
                }`}
                aria-label={t("cameraButtonAria")}
              >
                <Camera className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={handleUploadClick}
                disabled={isLoading}
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[3px] border transition-colors cursor-pointer disabled:opacity-50 ${
                  isFocused
                    ? "border-primary text-primary"
                    : "border-border text-muted hover:border-primary hover:text-primary"
                }`}
                aria-label={t("uploadButtonAria")}
              >
                <Upload className="h-4 w-4" />
              </button>
            </>
          )}

          {/* Inline image attached indicator - fills input width, replaces camera + upload */}
          {hasImage && (
            <div className="flex flex-1 items-center gap-2 rounded-[3px] border border-primary/30 bg-primary/5 px-3 py-2.5">
              <ImageIcon className="h-4 w-4 shrink-0 text-primary" />
              <span className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-primary">
                Image attached
              </span>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-destructive/10 text-muted hover:text-destructive cursor-pointer"
                aria-label={t("removeImage")}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Hidden file inputs - one for camera, one for upload */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
            aria-hidden="true"
            tabIndex={-1}
          />
          <input
            ref={uploadInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            aria-hidden="true"
            tabIndex={-1}
          />

          {/* Text input - hidden when image is attached */}
          {!hasImage && (
            <input
              ref={inputRef}
              type="text"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (error) setError(null);
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={t("smartInputPlaceholder")}
              className="flex-1 bg-transparent px-1 py-3 font-sans text-foreground placeholder:text-muted focus:outline-none"
              disabled={isLoading}
            />
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={!canSubmit || isLoading}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[3px] bg-primary text-primary-foreground transition-opacity hover:opacity-85 disabled:opacity-50 cursor-pointer"
            aria-label={t("send")}
          >
            {parseMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
          </button>
        </div>
      </form>

      {/* Error message */}
      {error && (
        <p className="mt-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {/* Preview popup - identical for both text and image parsing results */}
      {preview && editedData && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 animate-in">
          <div className="rounded-[4px] border border-border bg-card p-6">
            <p className="mb-3 font-mono text-[0.7rem] uppercase tracking-[0.15em] text-foreground">
              {t("previewTitle")}
            </p>

            {/* Recurring suggestion banner */}
            {showSuggestion && suggestion && (
              <div className="mb-3 rounded-[3px] border border-primary/30 bg-primary/5 p-3">
                <div className="flex items-start gap-2">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <p className="font-sans text-sm text-foreground">
                      {t("recurringSuggestion")}
                    </p>
                    <p className="mt-1 font-sans text-xs text-muted">
                      {suggestion.reason}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {suggestRecurringMutation.isPending && (
              <div className="mb-3 flex items-center gap-2 text-muted">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span className="font-sans text-xs">
                  {t("analyzingPattern")}
                </span>
              </div>
            )}

            <div className="space-y-3 rounded-[3px] border border-border bg-background p-4">
              {/* Row 1: Type toggle */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-foreground">
                  {t("type")}
                </span>
                <div className="flex gap-1 rounded-[3px] border border-border p-0.5">
                  <button
                    type="button"
                    onClick={() => updateField("type", "expense")}
                    className={`rounded-[2px] px-3 py-1 font-mono text-[0.7rem] uppercase tracking-[0.08em] transition-colors cursor-pointer ${
                      editedData.type === "expense"
                        ? "bg-destructive/15 text-destructive"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    {t("expense")}
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField("type", "income")}
                    className={`rounded-[2px] px-3 py-1 font-mono text-[0.7rem] uppercase tracking-[0.08em] transition-colors cursor-pointer ${
                      editedData.type === "income"
                        ? "bg-success/15 text-success"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    {t("income")}
                  </button>
                </div>
              </div>

              {/* Row 2: Amount */}
              <div className="flex items-center justify-between text-sm">
                <label
                  htmlFor="edit-amount"
                  className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-foreground"
                >
                  {t("amount")}
                </label>
                <input
                  id="edit-amount"
                  type="text"
                  inputMode="decimal"
                  value={formatNumberInput(editedData.amount, language)}
                  onChange={(e) =>
                    updateField("amount", parseNumberInput(e.target.value))
                  }
                  className={`w-40 rounded-[3px] border border-border bg-transparent px-2 py-1 text-right font-mono text-sm focus:border-primary focus:outline-none ${
                    editedData.type === "expense"
                      ? "text-destructive"
                      : "text-success"
                  }`}
                />
              </div>

              {/* Row 3: Category */}
              <div className="flex items-center justify-between text-sm">
                <label
                  htmlFor="edit-category"
                  className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-foreground"
                >
                  {t("category")}
                </label>
                <select
                  id="edit-category"
                  value={editedData.category}
                  onChange={(e) => updateField("category", e.target.value)}
                  className="w-40 rounded-[3px] border border-border bg-transparent px-2 py-1 text-right font-mono text-sm text-foreground focus:border-primary focus:outline-none"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Row 4: Description */}
              <div className="flex items-center justify-between text-sm">
                <label
                  htmlFor="edit-description"
                  className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-foreground"
                >
                  {t("description")}
                </label>
                <input
                  id="edit-description"
                  type="text"
                  value={editedData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  className="w-40 rounded-[3px] border border-border bg-transparent px-2 py-1 text-right font-mono text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* Row 5: Date */}
              <div className="flex items-center justify-between text-sm">
                <label
                  htmlFor="edit-date"
                  className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-foreground"
                >
                  {t("date")}
                </label>
                <input
                  id="edit-date"
                  type="date"
                  value={editedData.transactionDate}
                  onChange={(e) =>
                    updateField("transactionDate", e.target.value)
                  }
                  className="w-40 rounded-[3px] border border-border bg-transparent px-2 py-1 text-right font-mono text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* Row 6: Recurring toggle */}
              <div className="flex items-center justify-between text-sm">
                <span className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-foreground">
                  {t("recurring")}
                </span>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={editedData.recurring}
                    onChange={(e) => updateField("recurring", e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="h-5 w-9 rounded-full bg-border peer-checked:bg-primary peer-focus:ring-2 peer-focus:ring-primary/30 transition-colors" />
                  <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-background transition-transform peer-checked:translate-x-4" />
                </label>
              </div>

              {/* Row 7: Recurring frequency */}
              {editedData.recurring && (
                <div className="flex items-center justify-between text-sm">
                  <label
                    htmlFor="edit-recurring-freq"
                    className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-foreground"
                  >
                    {t("recurringFrequency")}
                  </label>
                  <select
                    id="edit-recurring-freq"
                    value={editedData.recurringFreq ?? "monthly"}
                    onChange={(e) =>
                      updateField(
                        "recurringFreq",
                        e.target.value as RecurringFrequency,
                      )
                    }
                    className="w-40 rounded-[3px] border border-border bg-transparent px-2 py-1 text-right font-mono text-sm text-foreground focus:border-primary focus:outline-none"
                  >
                    {RECURRING_FREQUENCIES.map((freq) => (
                      <option key={freq} value={freq}>
                        {t(
                          `recurring${
                            freq.charAt(0).toUpperCase() + freq.slice(1)
                          }` as TranslationKey,
                        )}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Row 8: Recurring end date */}
              {editedData.recurring && (
                <div className="flex items-center justify-between text-sm">
                  <label
                    htmlFor="edit-recurring-end"
                    className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-foreground"
                  >
                    {t("recurringEndDate")}
                  </label>
                  <input
                    id="edit-recurring-end"
                    type="date"
                    value={editedData.recurringEndDate ?? ""}
                    onChange={(e) =>
                      updateField(
                        "recurringEndDate",
                        e.target.value || undefined,
                      )
                    }
                    className="w-40 rounded-[3px] border border-border bg-transparent px-2 py-1 text-right font-mono text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              )}
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
