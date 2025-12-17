import { useState, useRef, useEffect } from 'react';

/**
 * Advanced Color Picker Component
 * Features:
 * - Saturation/brightness gradient square
 * - Hue slider (bottom)
 * - Eyedropper tool
 * - Default color palette
 * - Hex input
 * - Real-time preview
 */

const ColorPicker = ({ 
  onColorChange, 
  initialColor = '#3B82F6',
  defaultColors = [
    { name: 'Midnight Blue', hex: '#3B82F6' },
    { name: 'Emerald Green', hex: '#10B981' },
    { name: 'Sunset Orange', hex: '#F59E0B' },
    { name: 'Royal Purple', hex: '#8B5CF6' },
    { name: 'Rose Pink', hex: '#EC4899' },
    { name: 'Slate Grey', hex: '#64748B' },
  ],
  darkMode = true,
}) => {
  const [hue, setHue] = useState(getHueFromColor(initialColor));
  const [sat, setSat] = useState(100);
  const [bright, setBright] = useState(100);
  const [hex, setHex] = useState(initialColor.toUpperCase());
  const [selectedDefault, setSelectedDefault] = useState(null);
  const [showEyedropper, setShowEyedropper] = useState(false);
  
  const gradientCanvasRef = useRef(null);
  const hueCanvasRef = useRef(null);
  const eyedropperRef = useRef(null);

  // Convert HSB to RGB
  function hsbToRgb(h, s, b) {
    s /= 100;
    b /= 100;
    
    const c = b * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = b - c;
    
    let r = 0, g = 0, bl = 0;
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
  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0').toUpperCase()).join('');
  }

  // Convert Hex to RGB
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16),
    ] : [59, 130, 246];
  }

  // Get hue from hex color
  function getHueFromColor(hexColor) {
    const [r, g, b] = hexToRgb(hexColor);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    let h = 0;
    
    if (delta === 0) h = 0;
    else if (max === r) h = (60 * ((g - b) / delta) + 360) % 360;
    else if (max === g) h = (60 * ((b - r) / delta) + 120) % 360;
    else h = (60 * ((r - g) / delta) + 240) % 360;
    
    return h;
  }

  // Update color from HSB
  const updateFromHSB = (h = hue, s = sat, b = bright) => {
    const [r, g, bl] = hsbToRgb(h, s, b);
    const newHex = rgbToHex(r, g, bl);
    setHex(newHex);
    onColorChange(newHex);
  };

  // Update from hex input
  const handleHexChange = (e) => {
    const val = e.target.value.toUpperCase();
    setHex(val);
    
    if (/^#[0-9A-F]{6}$/.test(val)) {
      const newHue = getHueFromColor(val);
      setHue(newHue);
      setHex(val);
      onColorChange(val);
    }
  };

  // Handle gradient click (saturation/brightness)
  const handleGradientClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    
    setSat(x * 100);
    setBright((1 - y) * 100);
    updateFromHSB(hue, x * 100, (1 - y) * 100);
  };

  // Handle hue slider
  const handleHueChange = (e) => {
    const newHue = (e.clientX - e.currentTarget.getBoundingClientRect().left) / e.currentTarget.offsetWidth * 360;
    setHue(newHue);
    updateFromHSB(newHue, sat, bright);
  };

  // Draw gradient square (saturation + brightness)
  useEffect(() => {
    const canvas = gradientCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Draw saturation/brightness gradient
    const [baseR, baseG, baseB] = hsbToRgb(hue, 100, 100);
    const baseColor = `rgb(${baseR}, ${baseG}, ${baseB})`;
    
    // Horizontal: saturation (left white → right color)
    const satGradient = ctx.createLinearGradient(0, 0, width, 0);
    satGradient.addColorStop(0, '#FFFFFF');
    satGradient.addColorStop(1, baseColor);
    ctx.fillStyle = satGradient;
    ctx.fillRect(0, 0, width, height);
    
    // Vertical: brightness (top bright → bottom black)
    const brightGradient = ctx.createLinearGradient(0, 0, 0, height);
    brightGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
    brightGradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
    ctx.fillStyle = brightGradient;
    ctx.fillRect(0, 0, width, height);
    
    // Draw selector circle
    const selX = (sat / 100) * width;
    const selY = ((100 - bright) / 100) * height;
    
    ctx.strokeStyle = bright > 50 ? '#000000' : '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(selX, selY, 6, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.strokeStyle = bright > 50 ? '#FFFFFF' : '#000000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(selX, selY, 6, 0, Math.PI * 2);
    ctx.stroke();
  }, [hue, sat, bright, hsbToRgb]);

  // Draw hue slider
  useEffect(() => {
    const canvas = hueCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
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
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sliderX, -4);
    ctx.lineTo(sliderX, height + 4);
    ctx.stroke();
  }, [hue, hsbToRgb]);

  // Handle eyedropper
  const handleEyedropper = async () => {
    if (!window.EyeDropper) {
      alert('Eyedropper not supported in this browser');
      return;
    }
    
    try {
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      const hex = result.sRGBHex.toUpperCase();
      const newHue = getHueFromColor(hex);
      setHue(newHue);
      setHex(hex);
      setSelectedDefault(null);
      onColorChange(hex);
    } catch (e) {
      console.log('Eyedropper cancelled');
    }
  };

  // Select default color
  const selectDefaultColor = (color) => {
    const newHue = getHueFromColor(color.hex);
    setHue(newHue);
    setHex(color.hex);
    setSelectedDefault(color.hex);
    setSat(100);
    setBright(100);
    onColorChange(color.hex);
  };

  const bgClass = darkMode ? 'bg-zinc-950' : 'bg-white';
  const borderClass = darkMode ? 'border-zinc-800' : 'border-gray-200';
  const textClass = darkMode ? 'text-white' : 'text-black';
  const inputBgClass = darkMode ? 'bg-zinc-900 text-white' : 'bg-gray-50 text-black';

  return (
    <div className={`${bgClass} border ${borderClass} rounded-lg p-6 max-w-sm space-y-4`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-semibold ${textClass}`}>Color Picker</h3>
        {window.EyeDropper && (
          <button
            onClick={handleEyedropper}
            className="p-2 rounded hover:bg-zinc-800 transition"
            title="Pick color from screen"
            ref={eyedropperRef}
          >
            <svg className={`w-5 h-5 ${textClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </button>
        )}
      </div>

      {/* Saturation/Brightness Gradient */}
      <div className="space-y-2">
        <p className={`text-sm font-medium ${textClass}`}>Saturation & Brightness</p>
        <canvas
          ref={gradientCanvasRef}
          width={280}
          height={180}
          onClick={handleGradientClick}
          className="w-full border border-zinc-700 rounded cursor-crosshair"
        />
      </div>

      {/* Hue Slider */}
      <div className="space-y-2">
        <p className={`text-sm font-medium ${textClass}`}>Hue</p>
        <canvas
          ref={hueCanvasRef}
          width={280}
          height={20}
          onClick={handleHueChange}
          className="w-full border border-zinc-700 rounded cursor-pointer"
        />
      </div>

      {/* Hex Input */}
      <div className="space-y-2">
        <p className={`text-sm font-medium ${textClass}`}>Hex Value</p>
        <input
          type="text"
          value={hex}
          onChange={handleHexChange}
          maxLength={7}
          className={`w-full px-3 py-2 border ${borderClass} rounded font-mono text-center ${inputBgClass}`}
        />
      </div>

      {/* Color Preview */}
      <div className="space-y-2">
        <p className={`text-sm font-medium ${textClass}`}>Preview</p>
        <div className={`w-full h-12 rounded border ${borderClass}`} style={{ backgroundColor: hex }} />
      </div>

      {/* Default Colors Palette */}
      <div className="space-y-2">
        <p className={`text-sm font-medium ${textClass}`}>Default Palette</p>
        <div className="grid grid-cols-3 gap-2">
          {defaultColors.map((color) => (
            <button
              key={color.hex}
              onClick={() => selectDefaultColor(color)}
              className={`p-3 rounded border-2 transition ${
                selectedDefault === color.hex
                  ? 'border-white'
                  : `border-transparent ${darkMode ? 'hover:border-zinc-700' : 'hover:border-gray-300'}`
              }`}
              title={color.name}
              style={{ backgroundColor: color.hex }}
            />
          ))}
        </div>
      </div>

      {/* Current Values */}
      <div className={`text-xs ${textClass} opacity-60 space-y-1`}>
        <p>H: {Math.round(hue)}° S: {Math.round(sat)}% B: {Math.round(bright)}%</p>
      </div>
    </div>
  );
};

export default ColorPicker;
