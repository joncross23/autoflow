import { useState, useEffect, useRef } from 'react';
import { ThemeEngine, themeDefinitions } from './theme-engine';
import ColorPicker from './color-picker';

/**
 * AutoFlow Theme System Complete Demo
 * 
 * Shows:
 * 1. Completely separable theme architecture
 * 2. CSS custom properties for all styling
 * 3. Three complete themes (App Default, Windows 11, macOS Tahoe)
 * 4. Advanced color picker with saturation/hue/eyedropper
 * 5. Real-time theme switching and customization
 * 6. Full component showcase using theme colors
 */

// ============================================================================
// DEMO APPLICATION
// ============================================================================

export default function ThemedDemo() {
  const [engine] = useState(() => new ThemeEngine());
  const [currentTheme, setCurrentTheme] = useState(engine.themeName);
  const [currentMode, setCurrentMode] = useState(engine.mode);
  const [customAccent, setCustomAccent] = useState(engine.customAccent);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [activeTab, setActiveTab] = useState('themes');

  // Initialize and subscribe to theme changes
  useEffect(() => {
    engine.applyTheme(document.documentElement);
    
    const unsubscribe = engine.subscribe((state) => {
      setCurrentTheme(state.theme);
      setCurrentMode(state.mode);
      setCustomAccent(state.customAccent);
    });
    
    return unsubscribe;
  }, [engine]);

  // Theme control handlers
  const handleThemeChange = (themeName) => {
    engine.setTheme(themeName);
  };

  const handleModeChange = () => {
    const newMode = currentMode === 'dark' ? 'light' : 'dark';
    engine.setMode(newMode);
  };

  const handleAccentChange = (hex) => {
    engine.setCustomAccent(hex);
  };

  const handleClearAccent = () => {
    engine.clearCustomAccent();
  };

  // Styling classes
  const isDark = currentMode === 'dark';
  const rootStyle = {
    backgroundColor: 'var(--bg)',
    color: 'var(--text)',
    transition: 'background-color 0.2s, color 0.2s',
  };

  const cardStyle = {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: '0.5rem',
  };

  const headerStyle = {
    backgroundColor: 'var(--bg-tertiary)',
    borderBottom: '1px solid var(--border)',
  };

  const buttonPrimaryStyle = {
    backgroundColor: 'var(--primary)',
    color: 'var(--text-inverted)',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  };

  const buttonSecondaryStyle = {
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--text)',
    border: '1px solid var(--border)',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  };

  const inputStyle = {
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--text)',
    border: '1px solid var(--border)',
    padding: '0.5rem',
    borderRadius: '0.375rem',
    fontFamily: 'inherit',
    fontSize: 'inherit',
  };

  const themes = [
    { id: 'app-default', label: 'AutoFlow Default', emoji: '✨' },
    { id: 'windows-11', label: 'Windows 11', emoji: '🪟' },
    { id: 'macos-tahoe', label: 'macOS Tahoe', emoji: '🍎' },
  ];

  return (
    <div style={rootStyle} className="min-h-screen flex flex-col transition-colors duration-200">
      {/* Header */}
      <header style={headerStyle} className="sticky top-0 z-50 shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">AutoFlow</h1>
              <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
                Theme System Demonstration
              </p>
            </div>
            
            {/* Quick Controls */}
            <div className="flex gap-3">
              <button
                onClick={handleModeChange}
                style={buttonSecondaryStyle}
                className="hover:opacity-80"
              >
                {isDark ? '☀️ Light' : '🌙 Dark'}
              </button>
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                style={buttonSecondaryStyle}
                className="hover:opacity-80"
              >
                🎨 Colors
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8 space-y-8">
        
        {/* Color Picker Modal */}
        {showColorPicker && (
          <div style={cardStyle} className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Custom Accent Color</h2>
              <button
                onClick={() => setShowColorPicker(false)}
                style={buttonSecondaryStyle}
              >
                ✕ Close
              </button>
            </div>
            <ColorPicker
              onColorChange={handleAccentChange}
              initialColor={customAccent || '#3B82F6'}
              darkMode={isDark}
            />
            {customAccent && (
              <button
                onClick={handleClearAccent}
                style={buttonSecondaryStyle}
              >
                Reset to Theme Default
              </button>
            )}
          </div>
        )}

        {/* Theme Selector */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Select Theme</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {themes.map(({ id, label, emoji }) => (
              <button
                key={id}
                onClick={() => handleThemeChange(id)}
                style={{
                  ...cardStyle,
                  ...(currentTheme === id
                    ? {
                        backgroundColor: 'var(--primary)',
                        color: 'var(--text-inverted)',
                        border: '2px solid var(--primary)',
                      }
                    : {
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text)',
                        border: '2px solid transparent',
                      }),
                }}
                className="p-6 text-center cursor-pointer hover:opacity-80 transition text-lg font-semibold"
              >
                <div className="text-3xl mb-2">{emoji}</div>
                <div>{label}</div>
              </button>
            ))}
          </div>
          <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
            Current: <strong>{themeDefinitions[currentTheme].name}</strong> • 
            Mode: <strong>{currentMode}</strong> •
            Custom: <strong>{customAccent || 'None'}</strong>
          </p>
        </section>

        {/* Component Showcase */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Component Showcase</h2>
          
          <div style={cardStyle} className="p-6 space-y-6">
            
            {/* Buttons */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Buttons</h3>
              <div className="flex flex-wrap gap-3">
                <button style={buttonPrimaryStyle} className="hover:opacity-90">
                  Primary Button
                </button>
                <button
                  style={{
                    ...buttonPrimaryStyle,
                    backgroundColor: 'var(--primary-hover)',
                  }}
                  className="hover:opacity-90"
                >
                  Hover State
                </button>
                <button style={buttonSecondaryStyle} className="hover:opacity-80">
                  Secondary Button
                </button>
                <button
                  style={{
                    ...buttonPrimaryStyle,
                    backgroundColor: 'var(--color-success)',
                  }}
                  className="hover:opacity-90"
                >
                  Success
                </button>
                <button
                  style={{
                    ...buttonPrimaryStyle,
                    backgroundColor: 'var(--color-error)',
                  }}
                  className="hover:opacity-90"
                >
                  Error
                </button>
              </div>
            </div>

            {/* Form Elements */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Form Elements</h3>
              <div className="space-y-3">
                <div>
                  <label style={{ color: 'var(--text-secondary)' }} className="block text-sm mb-1">
                    Text Input
                  </label>
                  <input
                    type="text"
                    placeholder="Type something..."
                    style={inputStyle}
                    className="w-full"
                  />
                </div>
                <div>
                  <label style={{ color: 'var(--text-secondary)' }} className="block text-sm mb-1">
                    Select Dropdown
                  </label>
                  <select style={inputStyle} className="w-full">
                    <option>Option 1</option>
                    <option>Option 2</option>
                    <option>Option 3</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Status Badges */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Status Badges</h3>
              <div className="flex flex-wrap gap-3">
                {[
                  { label: 'Success', bg: 'var(--color-success)' },
                  { label: 'Warning', bg: 'var(--color-warning)' },
                  { label: 'Error', bg: 'var(--color-error)' },
                  { label: 'Info', bg: 'var(--color-info)' },
                ].map((badge) => (
                  <span
                    key={badge.label}
                    style={{
                      backgroundColor: badge.bg,
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                    }}
                  >
                    {badge.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Color Palette */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Current Color Palette</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                {[
                  { name: 'Primary', var: '--primary' },
                  { name: 'Primary Hover', var: '--primary-hover' },
                  { name: 'Primary Muted', var: '--primary-muted' },
                  { name: 'BG', var: '--bg' },
                  { name: 'BG Secondary', var: '--bg-secondary' },
                  { name: 'BG Tertiary', var: '--bg-tertiary' },
                  { name: 'Border', var: '--border' },
                  { name: 'Border Subtle', var: '--border-subtle' },
                ].map((color) => (
                  <div
                    key={color.var}
                    className="space-y-1"
                  >
                    <div
                      style={{ backgroundColor: `var(${color.var})` }}
                      className="w-full h-16 rounded border border-gray-600"
                    />
                    <div className="text-center">
                      <p className="font-mono" style={{ color: 'var(--text-secondary)' }}>
                        {color.name}
                      </p>
                      <p style={{ color: 'var(--text-muted)' }} className="font-mono text-xs">
                        {color.var}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Technical Information */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">How It Works</h2>
          
          <div style={cardStyle} className="p-6 space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Separable Architecture</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                The theme engine is completely independent of UI components. 
                It uses CSS custom properties (variables) to apply colors globally. 
                Components simply reference these variables instead of hardcoding colors.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">CSS Variables Example</h3>
              <pre
                style={{
                  ...inputStyle,
                  backgroundColor: 'var(--bg-tertiary)',
                  overflow: 'auto',
                  padding: '1rem',
                }}
                className="font-mono text-sm"
              >{`/* Before: Hardcoded colors */
backgroundColor: '#131316';

/* After: CSS variables */
backgroundColor: var(--bg-secondary);

/* Components automatically use the current theme */`}</pre>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Theme Switching Performance</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                ⚡ Themes switch instantly (CSS only, no re-renders) •
                📦 Minimal overhead •
                🎨 3 built-in themes •
                ✨ Infinite custom accents •
                💾 Persisted to localStorage
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Files Generated</h3>
              <ul style={{ color: 'var(--text-secondary)' }} className="list-disc list-inside space-y-1">
                <li><code className="font-mono" style={{ color: 'var(--primary)' }}>theme-engine.js</code> - Core system (280 lines)</li>
                <li><code className="font-mono" style={{ color: 'var(--primary)' }}>color-picker.jsx</code> - Advanced color picker (300+ lines)</li>
                <li><code className="font-mono" style={{ color: 'var(--primary)' }}>theme-switcher.jsx</code> - Demo UI component</li>
                <li><code className="font-mono" style={{ color: 'var(--primary)' }}>THEME_INTEGRATION_GUIDE.md</code> - Complete documentation</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Next Steps */}
        <section className="space-y-4 pb-12">
          <h2 className="text-2xl font-bold">Next Steps</h2>
          
          <div style={cardStyle} className="p-6 space-y-3">
            <p style={{ color: 'var(--text-secondary)' }} className="mb-4">
              To integrate this into the main AutoFlow application:
            </p>
            
            <ol style={{ color: 'var(--text-secondary)' }} className="space-y-2 list-decimal list-inside">
              <li>Move <code className="font-mono" style={{ color: 'var(--primary)' }}>theme-engine.js</code> to <code className="font-mono">lib/</code></li>
              <li>Add <code className="font-mono" style={{ color: 'var(--primary)' }}>ThemeEngine</code> initialization to root layout</li>
              <li>Replace all hardcoded colors with CSS variables</li>
              <li>Add settings panel for theme/mode/accent selection</li>
              <li>Update components to use <code className="font-mono" style={{ color: 'var(--primary)' }}>var(--color-name)</code></li>
            </ol>

            <div
              style={{
                backgroundColor: 'var(--primary-muted)',
                border: '1px solid var(--primary)',
                borderRadius: '0.375rem',
                padding: '1rem',
                marginTop: '1.5rem',
              }}
              className="text-sm"
            >
              ✅ <strong>Benefits:</strong> No component refactoring needed • 
              Instant theme switching • 
              Easy to add new themes •
              Extensible for custom colors
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
