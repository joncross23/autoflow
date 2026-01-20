"use client";

import { useState, useRef, useEffect } from "react";
import { Edit2, Palette, Hash, Trash2 } from "lucide-react";

interface ColumnMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onRename: () => void;
  onChangeColor: () => void;
  onSetWipLimit: () => void;
  onDelete: () => void;
  anchorEl?: HTMLButtonElement | null;
}

export function ColumnMenu({
  isOpen,
  onClose,
  onRename,
  onChangeColor,
  onSetWipLimit,
  onDelete,
  anchorEl,
}: ColumnMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        anchorEl &&
        !anchorEl.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose, anchorEl]);

  // Close on escape
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const menuItems = [
    {
      icon: Edit2,
      label: "Rename column",
      onClick: () => {
        onRename();
        onClose();
      },
    },
    {
      icon: Palette,
      label: "Change colour",
      onClick: () => {
        onChangeColor();
        onClose();
      },
    },
    {
      icon: Hash,
      label: "Set WIP limit",
      onClick: () => {
        onSetWipLimit();
        onClose();
      },
    },
    {
      icon: Trash2,
      label: "Delete column",
      onClick: () => {
        onDelete();
        onClose();
      },
      variant: "danger" as const,
    },
  ];

  return (
    <div
      ref={menuRef}
      className="absolute top-12 right-3 z-50 w-48 rounded-lg border border-border bg-bg-elevated shadow-lg py-1 animate-in fade-in slide-in-from-top-2"
      role="menu"
      aria-label="Column actions"
    >
      {menuItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <button
            key={index}
            onClick={item.onClick}
            className={`
              flex items-center gap-2 w-full px-3 py-2 text-sm text-left
              transition-colors hover:bg-bg-hover
              ${item.variant === "danger" ? "text-error" : "text-foreground"}
            `}
            role="menuitem"
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
