"use client";

import { useState, useEffect, useRef } from "react";
import { Lightbulb, Loader2 } from "lucide-react";
import { createIdea } from "@/lib/api/ideas";

interface QuickCaptureProps {
  onSuccess?: () => void;
}

export function QuickCapture({ onSuccess }: QuickCaptureProps) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global keyboard shortcut Cmd/Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Clear success message after 2 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = value.trim();

    if (!title) return;

    setLoading(true);
    setError(null);

    try {
      await createIdea({ title });
      setValue("");
      setSuccess(true);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to capture idea");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        <Lightbulb className="h-4 w-4" />
        <span className="text-sm font-medium">Quick Capture</span>
        <span className="badge badge-primary text-[10px]">Cmd/Ctrl+K</span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Type an automation idea and press Enter..."
            className="input w-full pr-10"
            disabled={loading}
          />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      </form>

      {error && (
        <p className="mt-2 text-xs text-error">{error}</p>
      )}

      {success && (
        <p className="mt-2 text-xs text-success">Idea captured! View it in the Ideas page.</p>
      )}

      {!error && !success && (
        <p className="mt-2 text-xs text-muted-foreground">
          Press Enter to save. Add details later in the Ideas page.
        </p>
      )}
    </div>
  );
}
