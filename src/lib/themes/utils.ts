/**
 * Theme utility functions
 */

/**
 * Adjust brightness of a hex color by a percentage
 * @param hex - Hex color string (e.g., "#3B82F6")
 * @param percent - Percentage to adjust (-100 to 100)
 * @returns Adjusted hex color
 */
export function adjustBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, Math.max(0, (num >> 16) + amt));
  const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt));
  const B = Math.min(255, Math.max(0, (num & 0x0000ff) + amt));
  return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
}

/**
 * Validate a hex color string
 * @param hex - String to validate
 * @returns Whether the string is a valid hex color
 */
export function isValidHex(hex: string): boolean {
  return /^#[0-9A-F]{6}$/i.test(hex);
}

/**
 * Convert hex to RGB object
 * @param hex - Hex color string
 * @returns RGB object with r, g, b values
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Convert RGB to hex
 * @param r - Red value (0-255)
 * @param g - Green value (0-255)
 * @param b - Blue value (0-255)
 * @returns Hex color string
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

/**
 * Convert hex to HSL
 * @param hex - Hex color string
 * @returns HSL string for CSS (e.g., "210 100% 50%")
 */
export function hexToHsl(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return "0 0% 0%";

  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/**
 * Generate accent colors from a single primary color
 * @param primary - Primary hex color
 * @returns Object with primary, hover, muted, and gradient colors
 */
export function generateAccentFromPrimary(primary: string): {
  primary: string;
  primaryHover: string;
  primaryMuted: string;
  primaryGradient: string;
} {
  return {
    primary,
    primaryHover: adjustBrightness(primary, -15),
    primaryMuted: adjustBrightness(primary, -40),
    primaryGradient: `linear-gradient(135deg, ${primary} 0%, ${adjustBrightness(primary, -15)} 100%)`,
  };
}

/**
 * Get contrast color (black or white) for a given background
 * @param hex - Background hex color
 * @returns "#000000" or "#FFFFFF" depending on contrast
 */
export function getContrastColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return "#000000";

  // Calculate relative luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;

  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}
