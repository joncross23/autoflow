"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";

export type AvatarSize = "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  className?: string;
}

const sizeStyles: Record<AvatarSize, string> = {
  sm: "avatar-sm",
  md: "avatar-md",
  lg: "avatar-lg",
  xl: "h-16 w-16 text-lg",
};

const imageSizes: Record<AvatarSize, number> = {
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
};

/** Get initials from a name (max 2 characters) */
function getInitials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Generate a consistent colour based on name */
function getAvatarColor(name?: string): string {
  if (!name) return "#64748B";
  const colors = [
    "#3B82F6", // blue
    "#10B981", // emerald
    "#F59E0B", // orange
    "#8B5CF6", // purple
    "#EC4899", // pink
    "#06B6D4", // cyan
    "#EF4444", // red
    "#22C55E", // green
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function Avatar({
  src,
  alt,
  name,
  size = "md",
  className,
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const showFallback = !src || imageError;

  return (
    <div className={cn("avatar", sizeStyles[size], className)}>
      {showFallback ? (
        <div
          className="avatar-fallback"
          style={{ backgroundColor: getAvatarColor(name) }}
          title={name}
        >
          {getInitials(name)}
        </div>
      ) : (
        <Image
          src={src}
          alt={alt || name || "Avatar"}
          width={imageSizes[size]}
          height={imageSizes[size]}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      )}
    </div>
  );
}

interface AvatarGroupProps {
  children: React.ReactNode;
  max?: number;
  size?: AvatarSize;
  className?: string;
}

/** Stack multiple avatars with overlap */
export function AvatarGroup({
  children,
  max = 4,
  size = "md",
  className,
}: AvatarGroupProps) {
  const childArray = Array.isArray(children) ? children : [children];
  const visible = childArray.slice(0, max);
  const remaining = childArray.length - max;

  return (
    <div className={cn("flex -space-x-2", className)}>
      {visible.map((child, index) => (
        <div key={index} className="ring-2 ring-background rounded-full">
          {child}
        </div>
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            "avatar ring-2 ring-background",
            sizeStyles[size]
          )}
        >
          <div className="avatar-fallback text-xs">+{remaining}</div>
        </div>
      )}
    </div>
  );
}
