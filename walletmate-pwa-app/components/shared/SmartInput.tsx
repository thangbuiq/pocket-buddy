"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, X, Loader2, Camera, Upload } from "lucide-react";
import { useI18n, useCurrency } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";
import { parseText, parseImage } from "@/lib/api";
import type { ParsedExpense } from "@/lib/validations/parse";

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB (matches Groq backend limit)

export function SmartInput() {
  const { t, language } = useI18n();
  const { currency } = useCurrency();
  const queryClient = useQueryClient();

  // State
  const [text, setText] = useState("");
  const [preview, setPreview] = useState<ParsedExpense | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const imageUrlRef = useRef<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse mutation — handles both text and image input
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
          // Not a redirect error — re-throw
        }
        throw err;
      }
    },
    onSuccess: (data) => {
      if (data) setPreview(data);
    },
    onError: (err) => {
      // Show actual error message for debugging
      const message = err instanceof Error ? err.message : t("parseError");
      console.error("[SmartInput] Parse error:", message, err);
      setError(message);
    },
  });

  // Save mutation (unchanged — still uses Next.js API route)
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
      // Clear image state
      if (imageUrlRef.current) {
        URL.revokeObjectURL(imageUrlRef.current);
        imageUrlRef.current = null;
      }
      setSelectedImage(null);
      setImagePreviewUrl(null);
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
        setImagePreviewUrl(objectUrl);
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
    if (preview) {
      saveMutation.mutate(preview);
    }
  };

  const handleReject = () => {
    setPreview(null);
    inputRef.current?.focus();
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
    setImagePreviewUrl(null);
    setError(null);
    inputRef.current?.focus();
  };

  // Paste handler — extract image from clipboard
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
          {/* Camera button — opens camera directly on mobile */}
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

          {/* Upload button — opens file picker (gallery on mobile) */}
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

          {/* Hidden file inputs — one for camera, one for upload */}
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

          {/* Text input — disabled when image is attached */}
          <input
            ref={inputRef}
            type="text"
            value={hasImage ? "" : text}
            onChange={(e) => {
              if (!hasImage) {
                setText(e.target.value);
                if (error) setError(null);
              }
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={
              hasImage
                ? t("imageAttachedPlaceholder")
                : t("smartInputPlaceholder")
            }
            className="flex-1 bg-transparent px-1 py-3 font-sans text-foreground placeholder:text-muted focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoading || hasImage}
          />

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

      {/* Image preview thumbnail */}
      {imagePreviewUrl && (
        <div className="mt-2">
          <div className="relative inline-block">
            <img
              src={imagePreviewUrl}
              alt={t("imagePreviewAlt")}
              className="h-20 w-20 rounded-[4px] border border-border object-cover"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm transition-opacity hover:opacity-85 cursor-pointer"
              aria-label={t("removeImage")}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="mt-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {/* Preview popup — identical for both text and image parsing results */}
      {preview && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 animate-in">
          <div className="rounded-[4px] border border-border bg-card p-6">
            <p className="mb-3 font-mono text-[0.7rem] uppercase tracking-[0.15em] text-foreground">
              {t("previewTitle")}
            </p>

            <div className="space-y-3 rounded-[3px] border border-border bg-background p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-foreground">
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
                <span className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-foreground">
                  {t("category")}
                </span>
                <span className="text-foreground">{preview.category}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-foreground">
                  Mô tả
                </span>
                <span className="text-foreground">{preview.description}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-foreground">
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
