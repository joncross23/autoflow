"use client";

interface AvatarProps {
  initials: string;
  name?: string;
  size?: number;
  className?: string;
}

const avatarColors = [
  "#3B82F6", // blue
  "#10B981", // green
  "#F59E0B", // orange
  "#8B5CF6", // purple
  "#EC4899", // pink
];

export function Avatar({ initials, name, size = 24, className = "" }: AvatarProps) {
  // Generate consistent color based on initials
  const colorIndex = initials.charCodeAt(0) % avatarColors.length;
  const bgColor = avatarColors[colorIndex];

  return (
    <div
      title={name}
      className={`inline-flex items-center justify-center rounded-full font-semibold text-white shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: bgColor,
        fontSize: size * 0.4,
        border: "2px solid var(--bg-elevated)",
      }}
    >
      {initials}
    </div>
  );
}

interface AvatarStackProps {
  avatars: { initials: string; name?: string }[];
  size?: number;
  max?: number;
  className?: string;
}

export function AvatarStack({ avatars, size = 22, max = 3, className = "" }: AvatarStackProps) {
  const displayAvatars = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <div className={`flex ${className}`} style={{ paddingLeft: size > 20 ? 0 : 8 }}>
      {displayAvatars.map((avatar, index) => (
        <div key={index} style={{ marginLeft: index > 0 ? -8 : 0 }}>
          <Avatar
            initials={avatar.initials}
            name={avatar.name}
            size={size}
          />
        </div>
      ))}
      {remaining > 0 && (
        <div
          className="inline-flex items-center justify-center rounded-full bg-bg-tertiary text-foreground-muted font-semibold shrink-0"
          style={{
            width: size,
            height: size,
            fontSize: size * 0.35,
            marginLeft: -8,
            border: "2px solid var(--bg-elevated)",
          }}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
