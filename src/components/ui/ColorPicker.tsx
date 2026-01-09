"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Pipette } from "lucide-react";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  defaultColors?: { name: string; hex: string }[];
}

const DEFAULT_PALETTE = [
  { name: "Cyan", hex: "#06B6D4" },
  { name: "Green", hex: "#22C55E" },
  { name: "Blue", hex: "#3B82F6" },
  { name: "Yellow", hex: "#EAB308" },
  { name: "Red", hex: "#EF4444" },
  { name: "Orange", hex: "#F97316" },
];

// Convert HSB to RGB
function hsbToRgb(h: number, s: number, b: number): [number, number, number] {
  s /= 100;
  b /= 100;

  const c = b * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = b - c;

  let r = 0,
    g = 0,
    bl = 0;
  if (h < 60) [r, g, bl] = [c, x, 0];
  else if (h < 120) [r, g, bl] = [x, c, 0];
  else if (h < 180) [r, g, bl] = [0, c, x];
  else if (h < 240) [r, g, bl] = [0, x, c];
  else if (h < 300) [r, g, bl] = [x, 0, c];
  else [r, g, bl] = [c, 0, x];

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((bl + m) * 255),
  ];
}

// Convert RGB to Hex
function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b].map((x) => x.toString(16).padStart(2, "0").toUpperCase()).join("")
  );
}

// Convert Hex to RGB
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : [59, 130, 246];
}

// Get hue from hex color
function getHueFromColor(hexColor: string): number {
  const [r, g, b] = hexToRgb(hexColor);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let h = 0;

  if (delta === 0) h = 0;
  else if (max === r) h = ((60 * ((g - b) / delta)) + 360) % 360;
  else if (max === g) h = (60 * ((b - r) / delta)) + 120;
  else h = (60 * ((r - g) / delta)) + 240;

  return h;
}

// Get saturation and brightness from hex
function getSatBrightFromColor(hexColor: string): { sat: number; bright: number } {
  const [r, g, b] = hexToRgb(hexColor);
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  const bright = max * 100;
  const sat = max === 0 ? 0 : ((max - min) / max) * 100;
  return { sat, bright };
}

export function ColorPicker({
  value,
  onChange,
  defaultColors = DEFAULT_PALETTE,
}: ColorPickerProps) {
  const [hue, setHue] = useState(() => getHueFromColor(value));
  const [sat, setSat] = useState(() => getSatBrightFromColor(value).sat);
  const [bright, setBright] = useState(() => getSatBrightFromColor(value).bright);
  const [hex, setHex] = useState(value.toUpperCase());
  const [selectedDefault, setSelectedDefault] = useState<string | null>(null);

  const gradientCanvasRef = useRef<HTMLCanvasElement>(null);
  const hueCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDraggingGradient = useRef(false);
  const isDraggingHue = useRef(false);

  // Update color from HSB
  const updateFromHSB = useCallback(
    (h: number, s: number, b: number) => {
      const [r, g, bl] = hsbToRgb(h, s, b);
      const newHex = rgbToHex(r, g, bl);
      setHex(newHex);
      onChange(newHex);
    },
    [onChange]
  );

  // Update from hex input
  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.toUpperCase();
    if (!val.startsWith("#")) val = "#" + val;
    setHex(val);

    if (/^#[0-9A-F]{6}$/.test(val)) {
      const newHue = getHueFromColor(val);
      const { sat: newSat, bright: newBright } = getSatBrightFromColor(val);
      setHue(newHue);
      setSat(newSat);
      setBright(newBright);
      setSelectedDefault(null);
      onChange(val);
    }
  };

  // Handle gradient interaction
  const handleGradientInteraction = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | MouseEvent) => {
      const canvas = gradientCanvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

      const newSat = x * 100;
      const newBright = (1 - y) * 100;
      setSat(newSat);
      setBright(newBright);
      updateFromHSB(hue, newSat, newBright);
      setSelectedDefault(null);
    },
    [hue, updateFromHSB]
  );

  // Handle hue slider interaction
  const handleHueInteraction = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | MouseEvent) => {
      const canvas = hueCanvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const newHue = Math.max(
        0,
        Math.min(360, ((e.clientX - rect.left) / rect.width) * 360)
      );
      setHue(newHue);
      updateFromHSB(newHue, sat, bright);
      setSelectedDefault(null);
    },
    [sat, bright, updateFromHSB]
  );

  // Mouse event handlers for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingGradient.current) {
        handleGradientInteraction(e);
      } else if (isDraggingHue.current) {
        handleHueInteraction(e);
      }
    };

    const handleMouseUp = () => {
      isDraggingGradient.current = false;
      isDraggingHue.current = false;
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleGradientInteraction, handleHueInteraction]);

  // Draw gradient square
  useEffect(() => {
    const canvas = gradientCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Draw saturation/brightness gradient
    const [baseR, baseG, baseB] = hsbToRgb(hue, 100, 100);
    const baseColor = `rgb(${baseR}, ${baseG}, ${baseB})`;

    // Horizontal: saturation (left white → right color)
    const satGradient = ctx.createLinearGradient(0, 0, width, 0);
    satGradient.addColorStop(0, "#FFFFFF");
    satGradient.addColorStop(1, baseColor);
    ctx.fillStyle = satGradient;
    ctx.fillRect(0, 0, width, height);

    // Vertical: brightness (top bright → bottom black)
    const brightGradient = ctx.createLinearGradient(0, 0, 0, height);
    brightGradient.addColorStop(0, "rgba(255, 255, 255, 0)");
    brightGradient.addColorStop(1, "rgba(0, 0, 0, 1)");
    ctx.fillStyle = brightGradient;
    ctx.fillRect(0, 0, width, height);

    // Draw selector circle
    const selX = (sat / 100) * width;
    const selY = ((100 - bright) / 100) * height;

    ctx.strokeStyle = bright > 50 ? "#000000" : "#FFFFFF";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(selX, selY, 6, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = bright > 50 ? "#FFFFFF" : "#000000";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(selX, selY, 6, 0, Math.PI * 2);
    ctx.stroke();
  }, [hue, sat, bright]);

  // Draw hue slider
  useEffect(() => {
    const canvas = hueCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    for (let x = 0; x < width; x++) {
      const h = (x / width) * 360;
      const [r, g, b] = hsbToRgb(h, 100, 100);
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(x, 0, 1, height);
    }

    // Draw slider indicator
    const sliderX = (hue / 360) * width;
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(sliderX - 3, 0, 6, height, 2);
    ctx.stroke();
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1;
    ctx.stroke();
  }, [hue]);

  // Handle eyedropper
  const handleEyedropper = async () => {
    if (!("EyeDropper" in window)) {
      alert("Eyedropper not supported in this browser");
      return;
    }

    try {
      // @ts-expect-error EyeDropper is not in TypeScript types yet
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      const newHex = result.sRGBHex.toUpperCase();
      const newHue = getHueFromColor(newHex);
      const { sat: newSat, bright: newBright } = getSatBrightFromColor(newHex);
      setHue(newHue);
      setSat(newSat);
      setBright(newBright);
      setHex(newHex);
      setSelectedDefault(null);
      onChange(newHex);
    } catch {
      // User cancelled
    }
  };

  // Select default color
  const selectDefaultColor = (color: { name: string; hex: string }) => {
    const newHue = getHueFromColor(color.hex);
    const { sat: newSat, bright: newBright } = getSatBrightFromColor(color.hex);
    setHue(newHue);
    setSat(newSat);
    setBright(newBright);
    setHex(color.hex);
    setSelectedDefault(color.hex);
    onChange(color.hex);
  };

  return (
    <div className="bg-bg-secondary border border-border rounded-lg p-4 w-full max-w-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Color Picker</h3>
        {"EyeDropper" in window && (
          <button
            onClick={handleEyedropper}
            className="p-2 rounded hover:bg-bg-tertiary transition-colors"
            title="Pick color from screen"
          >
            <Pipette className="w-4 h-4 text-foreground-muted" />
          </button>
        )}
      </div>

      {/* Saturation/Brightness Gradient */}
      <div className="space-y-1">
        <p className="text-xs font-medium text-foreground-muted">
          Saturation & Brightness
        </p>
        <canvas
          ref={gradientCanvasRef}
          width={280}
          height={160}
          onMouseDown={(e) => {
            isDraggingGradient.current = true;
            handleGradientInteraction(e);
          }}
          className="w-full border border-border rounded cursor-crosshair"
        />
      </div>

      {/* Hue Slider */}
      <div className="space-y-1">
        <p className="text-xs font-medium text-foreground-muted">Hue</p>
        <canvas
          ref={hueCanvasRef}
          width={280}
          height={16}
          onMouseDown={(e) => {
            isDraggingHue.current = true;
            handleHueInteraction(e);
          }}
          className="w-full border border-border rounded cursor-pointer"
        />
      </div>

      {/* Hex Input + Preview */}
      <div className="flex gap-3 items-end">
        <div className="flex-1 space-y-1">
          <p className="text-xs font-medium text-foreground-muted">Hex Value</p>
          <input
            type="text"
            value={hex}
            onChange={handleHexChange}
            maxLength={7}
            className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded font-mono text-sm text-center"
          />
        </div>
        <div
          className="w-12 h-10 rounded border border-border shrink-0"
          style={{ backgroundColor: hex }}
          title="Preview"
        />
      </div>

      {/* Default Colors Palette */}
      <div className="space-y-1">
        <p className="text-xs font-medium text-foreground-muted">
          Default Palette
        </p>
        <div className="grid grid-cols-6 gap-2">
          {defaultColors.map((color) => (
            <button
              key={color.hex}
              onClick={() => selectDefaultColor(color)}
              className={`aspect-square rounded border-2 transition-all ${
                selectedDefault === color.hex
                  ? "border-foreground scale-110"
                  : "border-transparent hover:border-border"
              }`}
              title={color.name}
              style={{ backgroundColor: color.hex }}
            />
          ))}
        </div>
      </div>

      {/* HSB Values */}
      <div className="text-xs text-foreground-muted">
        H: {Math.round(hue)}° S: {Math.round(sat)}% B: {Math.round(bright)}%
      </div>
    </div>
  );
}
