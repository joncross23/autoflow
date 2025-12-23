"use client";

import { Mic, Square, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceRecorderButtonProps {
  status: "idle" | "requesting_permission" | "recording" | "processing";
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Voice recorder toggle button
 * Shows different states: idle (mic), recording (stop), processing (spinner)
 */
export function VoiceRecorderButton({
  status,
  onClick,
  disabled,
  className,
}: VoiceRecorderButtonProps) {
  const isRecording = status === "recording";
  const isProcessing = status === "processing" || status === "requesting_permission";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isProcessing}
      className={cn(
        "relative flex items-center justify-center rounded-md transition-all",
        "w-9 h-9",
        "focus:outline-none focus:ring-2 focus:ring-primary/50",
        isRecording
          ? "bg-red-500 text-white hover:bg-red-600"
          : "text-muted-foreground hover:text-foreground hover:bg-bg-hover",
        isProcessing && "opacity-50 cursor-not-allowed",
        className
      )}
      title={
        isRecording
          ? "Stop recording"
          : isProcessing
            ? "Processing..."
            : "Start voice capture"
      }
      aria-label={
        isRecording
          ? "Stop recording"
          : isProcessing
            ? "Processing audio"
            : "Start voice capture"
      }
    >
      {isProcessing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isRecording ? (
        <>
          <Square className="h-3.5 w-3.5 fill-current" />
          {/* Pulsing ring animation */}
          <span className="absolute inset-0 rounded-md animate-ping bg-red-500/30" />
        </>
      ) : (
        <Mic className="h-4 w-4" />
      )}
    </button>
  );
}
