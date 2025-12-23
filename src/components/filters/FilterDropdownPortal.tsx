"use client";

/**
 * FilterDropdownPortal
 * Renders filter dropdowns in a portal to avoid z-index/overflow issues
 */

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface FilterDropdownPortalProps {
  isOpen: boolean;
  anchorRef: React.RefObject<HTMLElement>;
  children: ReactNode;
}

export function FilterDropdownPortal({
  isOpen,
  anchorRef,
  children,
}: FilterDropdownPortalProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen || !anchorRef.current) return;

    const updatePosition = () => {
      if (!anchorRef.current) return;
      const rect = anchorRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
      });
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, anchorRef]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
        zIndex: 9999,
      }}
    >
      {children}
    </div>,
    document.body
  );
}
