"use client";

import { cn } from "@/lib/utils";

interface AudioWaveformProps {
  isActive?: boolean;
  barCount?: number;
  className?: string;
}

/**
 * Animated audio waveform visualisation
 * CSS-only animation with randomised bar heights
 */
export function AudioWaveform({
  isActive = true,
  barCount = 5,
  className,
}: AudioWaveformProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-0.5 h-4",
        className
      )}
      role="img"
      aria-label={isActive ? "Recording in progress" : "Recording paused"}
    >
      {Array.from({ length: barCount }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "w-0.5 rounded-full bg-current transition-all",
            isActive ? "animate-waveform" : "h-1"
          )}
          style={{
            animationDelay: isActive ? `${i * 0.1}s` : undefined,
            height: isActive ? undefined : "4px",
          }}
        />
      ))}

      {/* CSS for waveform animation */}
      <style jsx>{`
        @keyframes waveform {
          0%, 100% {
            height: 4px;
          }
          50% {
            height: 16px;
          }
        }
        .animate-waveform {
          animation: waveform 0.6s ease-in-out infinite;
        }
        .animate-waveform:nth-child(1) { animation-delay: 0s; }
        .animate-waveform:nth-child(2) { animation-delay: 0.1s; }
        .animate-waveform:nth-child(3) { animation-delay: 0.2s; }
        .animate-waveform:nth-child(4) { animation-delay: 0.15s; }
        .animate-waveform:nth-child(5) { animation-delay: 0.05s; }
      `}</style>
    </div>
  );
}
