"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Lightbulb, Loader2 } from "lucide-react";
import { createIdea } from "@/lib/api/ideas";
import { useVoiceCapture } from "@/hooks";
import {
  VoiceRecorderButton,
  VoiceReviewPanel,
  AudioWaveform,
} from "@/components/voice";

interface QuickCaptureProps {
  onSuccess?: () => void;
}

/**
 * Format duration in seconds to MM:SS format
 */
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function QuickCapture({ onSuccess }: QuickCaptureProps) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [savingVoiceIdea, setSavingVoiceIdea] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Voice capture hook
  const { state: voiceState, duration, startRecording, stopRecording, reset: resetVoice } =
    useVoiceCapture();

  // Determine if voice UI should be shown
  const isRecording = voiceState.status === "recording";
  const isProcessing = voiceState.status === "processing";
  const isReview = voiceState.status === "review";
  const isVoiceError =
    voiceState.status === "error" || voiceState.status === "permission_denied";
  // Voice is "active" only during recording/processing/review - errors should allow retry
  const isVoiceActive = isRecording || isProcessing || isReview;

  // Global keyboard shortcut Cmd/Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (!isVoiceActive) {
          inputRef.current?.focus();
        }
      }
      // Escape to cancel voice recording
      if (e.key === "Escape" && isVoiceActive) {
        resetVoice();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVoiceActive, resetVoice]);

  // Clear success message after 2 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Handle text form submission
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

  // Handle voice button click
  const handleVoiceClick = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else if (!isVoiceActive) {
      // Reset any previous error state before starting new recording
      if (isVoiceError) {
        resetVoice();
      }
      setError(null);
      startRecording();
    }
  }, [isRecording, isVoiceActive, isVoiceError, startRecording, stopRecording, resetVoice]);

  // Handle saving voice-generated idea
  const handleSaveVoiceIdea = useCallback(async () => {
    if (voiceState.status !== "review") return;

    setSavingVoiceIdea(true);
    setError(null);

    try {
      await createIdea({
        title: voiceState.idea.title,
        description: voiceState.idea.description,
      });
      resetVoice();
      setSuccess(true);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save idea");
    } finally {
      setSavingVoiceIdea(false);
    }
  }, [voiceState, resetVoice, onSuccess]);

  // Handle discarding voice idea
  const handleDiscardVoiceIdea = useCallback(() => {
    resetVoice();
  }, [resetVoice]);

  // Get voice error message
  const voiceErrorMessage =
    voiceState.status === "error"
      ? voiceState.error
      : voiceState.status === "permission_denied"
        ? voiceState.error
        : null;

  // Determine button status for VoiceRecorderButton
  const buttonStatus = isRecording
    ? "recording"
    : isProcessing
      ? "processing"
      : voiceState.status === "requesting_permission"
        ? "requesting_permission"
        : "idle";

  return (
    <div className="card" data-testid="quick-capture">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        <Lightbulb className="h-4 w-4" />
        <span className="text-sm font-medium">Quick Capture</span>
        {!isVoiceActive && (
          <span className="badge badge-primary text-[10px]">Cmd/Ctrl+K</span>
        )}
      </div>

      {/* Review panel for voice-generated idea */}
      {isReview && voiceState.status === "review" && (
        <VoiceReviewPanel
          idea={voiceState.idea}
          onSave={handleSaveVoiceIdea}
          onDiscard={handleDiscardVoiceIdea}
          isSaving={savingVoiceIdea}
        />
      )}

      {/* Normal input or recording state */}
      {!isReview && (
        <>
          <form onSubmit={handleSubmit}>
            <div className="relative">
              {isRecording || isProcessing ? (
                // Recording/Processing state
                <div className="flex items-center gap-3 h-10 px-3 bg-bg-tertiary border border-border rounded-md">
                  {isRecording ? (
                    <>
                      <div className="flex items-center gap-2 text-red-400">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-sm font-medium">
                          {formatDuration(duration)}
                        </span>
                      </div>
                      <AudioWaveform
                        isActive={true}
                        className="text-red-400 flex-1"
                      />
                      <button
                        type="button"
                        onClick={stopRecording}
                        className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      >
                        Stop
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Processing audio...</span>
                    </div>
                  )}
                </div>
              ) : (
                // Normal text input
                <>
                  <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Type an idea or click mic to speak..."
                    className="input w-full pr-12"
                    disabled={loading || isVoiceActive}
                    data-testid="quick-capture-input"
                  />
                  <div className="absolute right-1 top-1/2 -translate-y-1/2">
                    {loading ? (
                      <div className="p-2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <VoiceRecorderButton
                        status={buttonStatus}
                        onClick={handleVoiceClick}
                        disabled={loading || !!value.trim()}
                      />
                    )}
                  </div>
                </>
              )}
            </div>
          </form>

          {/* Error messages */}
          {(error || voiceErrorMessage) && (
            <p className="mt-2 text-xs text-error">
              {error || voiceErrorMessage}
            </p>
          )}

          {/* Success message */}
          {success && (
            <p className="mt-2 text-xs text-success" data-testid="quick-capture-success">
              Idea captured! View it in the Ideas page.
            </p>
          )}

          {/* Help text */}
          {!error && !success && !isRecording && !isProcessing && (
            <p className="mt-2 text-xs text-muted-foreground">
              {voiceErrorMessage
                ? "Click mic to try again or type your idea."
                : "Press Enter to save or click mic to speak."}
            </p>
          )}

          {/* Recording help text */}
          {isRecording && (
            <p className="mt-2 text-xs text-muted-foreground">
              Speak your automation idea... Press Escape to cancel.
            </p>
          )}
        </>
      )}
    </div>
  );
}
