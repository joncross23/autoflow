"use client";

import { cn } from "@/lib/utils";
import { useState, useRef, useEffect, type ReactNode } from "react";

export type TooltipPosition = "top" | "bottom" | "left" | "right";

interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  position?: TooltipPosition;
  delay?: number;
  className?: string;
}

export function Tooltip({
  children,
  content,
  position = "top",
  delay = 300,
  className,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    if (!isVisible || !triggerRef.current || !tooltipRef.current) return;

    const trigger = triggerRef.current.getBoundingClientRect();
    const tooltip = tooltipRef.current.getBoundingClientRect();
    const gap = 8;

    let x = 0;
    let y = 0;

    switch (position) {
      case "top":
        x = trigger.left + trigger.width / 2 - tooltip.width / 2;
        y = trigger.top - tooltip.height - gap;
        break;
      case "bottom":
        x = trigger.left + trigger.width / 2 - tooltip.width / 2;
        y = trigger.bottom + gap;
        break;
      case "left":
        x = trigger.left - tooltip.width - gap;
        y = trigger.top + trigger.height / 2 - tooltip.height / 2;
        break;
      case "right":
        x = trigger.right + gap;
        y = trigger.top + trigger.height / 2 - tooltip.height / 2;
        break;
    }

    // Keep tooltip within viewport
    x = Math.max(8, Math.min(x, window.innerWidth - tooltip.width - 8));
    y = Math.max(8, Math.min(y, window.innerHeight - tooltip.height - 8));

    setCoords({ x, y });
  }, [isVisible, position]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="inline-block"
      >
        {children}
      </div>
      {isVisible && (
        <div
          ref={tooltipRef}
          className={cn("tooltip fixed animate-fade-in", className)}
          style={{
            left: coords.x,
            top: coords.y,
          }}
          role="tooltip"
        >
          {content}
        </div>
      )}
    </>
  );
}

/** Simple text-only tooltip wrapper */
interface SimpleTooltipProps {
  children: ReactNode;
  text: string;
  position?: TooltipPosition;
}

export function SimpleTooltip({ children, text, position }: SimpleTooltipProps) {
  return (
    <Tooltip content={text} position={position}>
      {children}
    </Tooltip>
  );
}
