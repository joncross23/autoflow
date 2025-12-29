"use client";

/**
 * LinkCapturePanel Component
 * Quick capture panel for URLs - appears when a URL is detected
 * Saves links as ideas for AI/automation opportunities
 */

import { useState, useEffect } from "react";
import {
  Link2,
  Loader2,
  ExternalLink,
  X,
} from "lucide-react";
import { createIdea } from "@/lib/api/ideas";
import { createIdeaLink } from "@/lib/api/links";

interface LinkCapturePanelProps {
  url: string;
  onSuccess?: () => void;
  onCancel: () => void;
}

/**
 * Extracts the domain from a URL
 */
function extractDomain(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname.replace("www.", "");
  } catch {
    return url;
  }
}

/**
 * Normalises a URL (adds https:// if missing)
 */
function normaliseUrl(input: string): string {
  let url = input.trim();
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
}

export function LinkCapturePanel({ url, onSuccess, onCancel }: LinkCapturePanelProps) {
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMeta, setIsFetchingMeta] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalisedUrl = normaliseUrl(url);
  const domain = extractDomain(normalisedUrl);

  // Attempt to fetch metadata from URL
  useEffect(() => {
    async function fetchMetadata() {
      setIsFetchingMeta(true);
      try {
        // Try to fetch title from our API
        const response = await fetch(`/api/links/metadata?url=${encodeURIComponent(normalisedUrl)}`);
        if (response.ok) {
          const data = await response.json();
          if (data.title) {
            setTitle(data.title);
          }
        }
      } catch {
        // Silently fail - user can enter title manually
      } finally {
        setIsFetchingMeta(false);
      }
    }

    fetchMetadata();
  }, [normalisedUrl]);

  async function handleSave() {
    setIsLoading(true);
    setError(null);

    try {
      // Create the idea with title
      const ideaTitle = title.trim() || `${domain} link`;

      const idea = await createIdea({
        title: ideaTitle,
        description: note.trim() || null,
      });

      // Attach the URL as a link
      await createIdeaLink(idea.id, {
        url: normalisedUrl,
        title: title.trim() || null,
        favicon: "🔗",
      });

      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save link");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* URL Preview */}
      <div className="flex items-center gap-3 p-3 bg-bg-tertiary/50 rounded-lg">
        <div className="p-2 rounded-lg bg-primary/10">
          <Link2 className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <a
            href={normalisedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-foreground hover:text-primary flex items-center gap-1"
          >
            {domain}
            <ExternalLink className="w-3 h-3 opacity-50" />
          </a>
          <p className="text-xs text-foreground-muted truncate">{normalisedUrl}</p>
        </div>
        <button
          onClick={onCancel}
          className="p-1 text-foreground-muted hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Title Input */}
      <div>
        <label className="block text-xs font-medium text-foreground-muted mb-1.5">
          Title
        </label>
        <div className="relative">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={isFetchingMeta ? "Fetching title..." : "Enter a title"}
            className="w-full px-3 py-2 text-sm bg-bg-tertiary border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
            disabled={isFetchingMeta}
          />
          {isFetchingMeta && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="w-4 h-4 animate-spin text-foreground-muted" />
            </div>
          )}
        </div>
      </div>

      {/* Optional Note */}
      <div>
        <label className="block text-xs font-medium text-foreground-muted mb-1.5">
          Note (optional)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note..."
          rows={2}
          className="w-full px-3 py-2 text-sm bg-bg-tertiary border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary resize-none"
        />
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-xs text-error">{error}</p>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm text-foreground-muted hover:text-foreground transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Link2 className="w-4 h-4" />
              Save Link
            </>
          )}
        </button>
      </div>
    </div>
  );
}
