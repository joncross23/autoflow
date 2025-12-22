"use client";

import * as React from "react";
import { Pipette } from "lucide-react";
import { cn } from "@/lib/utils";

// TypeScript type for EyeDropper API (not yet in standard lib)
interface EyeDropperResult {
  sRGBHex: string;
}

interface EyeDropperAPI {
  open(): Promise<EyeDropperResult>;
}

declare global {
  interface Window {
    EyeDropper?: new () => EyeDropperAPI;
  }
}

interface EyedropperButtonProps {
  onColorPicked: (hex: string) => void;
  className?: string;
  disabled?: boolean;
}

/**
 * Eyedropper button for picking colours from screen
 * Only renders in browsers that support EyeDropper API (Chrome/Edge)
 */
export function EyedropperButton({
  onColorPicked,
  className,
  disabled = false,
}: EyedropperButtonProps) {
  const [isSupported, setIsSupported] = React.useState(false);
  const [isPicking, setIsPicking] = React.useState(false);

  // Check if EyeDropper API is available
  React.useEffect(() => {
    setIsSupported("EyeDropper" in window);
  }, []);

  // Don't render if not supported
  if (!isSupported) {
    return null;
  }

  const handlePick = async () => {
    if (!window.EyeDropper || isPicking || disabled) return;

    try {
      setIsPicking(true);
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      onColorPicked(result.sRGBHex);
    } catch {
      // User cancelled or error - ignore
    } finally {
      setIsPicking(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handlePick}
      disabled={disabled || isPicking}
      className={cn(
        "flex items-center justify-center p-2 rounded-lg border transition-all",
        "hover:bg-[var(--bg-hover)] disabled:opacity-50 disabled:cursor-not-allowed",
        isPicking && "ring-2 ring-[var(--primary-color)]",
        className
      )}
      style={{
        borderColor: "var(--border-color)",
        color: "var(--text)",
      }}
      aria-label="Pick colour from screen"
      title="Pick colour from screen"
    >
      <Pipette className={cn("h-4 w-4", isPicking && "animate-pulse")} />
    </button>
  );
}
