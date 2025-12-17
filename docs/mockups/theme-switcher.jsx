import { useState, useEffect } from 'react';
import ColorPicker from './color-picker';
import { ThemeEngine, themeDefinitions } from './theme-engine';

/**
 * Theme Switcher Component
 * 
 * Demonstrates:
 * - Switching between 3 themes (App Default, Windows 11, macOS Tahoe)
 * - Dark/Light mode toggle
 * - Custom accent color picker
 * - Real-time theme application via CSS custom properties
 * - Theme persistence
 */

const ThemeSwitcher = () => {
  const [engine] = useState(() => new ThemeEngine());
  const [currentTheme, setCurrentTheme] = useState(engine.themeName);
  const [currentMode, setCurrentMode] = useState(engine.mode);
  const [customAccent, setCustomAccent] = useState(engine.customAccent);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [themeState, setThemeState] = useState({});

  // Initialize theme on mount
  useEffect(() => {
    engine.applyTheme();
    
    // Subscribe to changes
    const unsubscribe = engine.subscribe((state) => {
      setCurrentTheme(state.theme);
      setCurrentMode(state.mode);
      setCustomAccent(state.customAccent);
      setThemeState(state);
    });
    
    return unsubscribe;
  }, [engine]);

  // Handle theme switch
  const handleThemeSwitch = (themeName) => {
    engine.setTheme(themeName);
  };

  // Handle mode toggle
  const handleModeToggle = () => {
    const newMode = currentMode === 'dark' ? 'light' : 'dark';
    engine.setMode(newMode);
  };

  // Handle custom accent
  const handleAccentChange = (hex) => {
    engine.setCustomAccent(hex);
  };

  // Handle clear custom accent
  const handleClearAccent = () => {
    engine.clearCustomAccent();
  };

  const isDark = currentMode === 'dark';
  const bgClass = isDark ? 'bg-zinc-950' : 'bg-white';
  const textClass = isDark ? 'text-white' : 'text-black';
  const borderClass = isDark ? 'border-zinc-800' : 'border-gray-200';
  const cardBgClass = isDark ? 'bg-zinc-900' : 'bg-gray-50';
  const hoverClass = isDark ? 'hover:bg-zinc-800' : 'hover:bg-gray-100';
  const activeClass = isDark ? 'bg-blue-600' : 'bg-blue-500';

  const themes = [
    { id: 'app-default', label: 'AutoFlow Default' },
    { id: 'windows-11', label: 'Windows 11' },
    { id: 'macos-tahoe', label: 'macOS Tahoe' },
  ];

  return (
    <div className={`${bgClass} ${textClass} min-h-screen transition-colors duration-200 p-8`}>
      {/* Main Container */}
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2">AutoFlow Theme System</h1>
          <p className={`${isDark ? 'text-zinc-400' : 'text-gray-600'}`}>
            Fully separable theme architecture with CSS custom properties
          </p>
        </div>

        {/* Main Controls */}
        <div className={`${cardBgClass} border ${borderClass} rounded-lg p-6 space-y-6`}>
          
          {/* Theme Selector */}
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Theme Selector</h2>
            <div className="grid grid-cols-3 gap-3">
              {themes.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => handleThemeSwitch(id)}
                  className={`px-4 py-3 rounded-lg font-medium transition ${
                    currentTheme === id
                      ? `${activeClass} text-white`
                      : `${borderClass} border ${hoverClass}`
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Appearance</h2>
            <button
              onClick={handleModeToggle}
              className={`px-4 py-3 rounded-lg font-medium border ${borderClass} ${hoverClass} transition flex items-center gap-2`}
            >
              {isDark ? (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                  Dark Mode
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v2a1 1 0 11-2 0V3a1 1 0 011-1zm0 10a3 3 0 100-6 3 3 0 000 6zm0-5a2 2 0 100 4 2 2 0 000-4zm7.07-2.93a1 1 0 11-1.414 1.414 1 1 0 011.414-1.414zM9.93 9.93a1 1 0 011.414 1.414 1 1 0 01-1.414-1.414zM16.07 16.07a1 1 0 11-1.414-1.414 1 1 0 011.414 1.414zm-9.144 0a1 1 0 010-1.414 1 1 0 010 1.414zM3.93 9.93a1 1 0 01-1.414-1.414 1 1 0 011.414 1.414zm0-7.072a1 1 0 110 1.414A1 1 0 013.93 2.858zM16.07 3.93a1 1 0 11-1.414-1.414 1 1 0 011.414 1.414zM10 18a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1zm0-13a1 1 0 01-1-1V3a1 1 0 112 0v2a1 1 0 01-1 1zM3 10a1 1 0 01-1-1V7a1 1 0 012 0v2a1 1 0 01-1 1zm14 0a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Light Mode
                </>
              )}
            </button>
          </div>

          {/* Custom Accent Color */}
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Accent Color</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className={`px-4 py-3 rounded-lg font-medium border ${borderClass} ${hoverClass} transition`}
              >
                {customAccent ? 'Edit Accent' : 'Set Custom Accent'}
              </button>
              {customAccent && (
                <>
                  <div
                    className="w-10 h-10 rounded border border-zinc-700"
                    style={{ backgroundColor: customAccent }}
                    title={customAccent}
                  />
                  <button
                    onClick={handleClearAccent}
                    className={`px-3 py-2 rounded text-sm border ${borderClass} ${hoverClass} transition`}
                  >
                    Reset to Default
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Color Picker Modal */}
        {showColorPicker && (
          <div className={`${cardBgClass} border ${borderClass} rounded-lg p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Custom Accent Color</h2>
              <button
                onClick={() => setShowColorPicker(false)}
                className={`${hoverClass} p-2 rounded transition`}
              >
                ✕
              </button>
            </div>
            <ColorPicker
              onColorChange={handleAccentChange}
              initialColor={customAccent || '#3B82F6'}
              darkMode={isDark}
              defaultColors={[
                { name: 'Midnight Blue', hex: '#3B82F6' },
                { name: 'Emerald Green', hex: '#10B981' },
                { name: 'Sunset Orange', hex: '#F59E0B' },
                { name: 'Royal Purple', hex: '#8B5CF6' },
                { name: 'Rose Pink', hex: '#EC4899' },
                { name: 'Slate Grey', hex: '#64748B' },
              ]}
            />
          </div>
        )}

        {/* Theme Information */}
        <div className={`${cardBgClass} border ${borderClass} rounded-lg p-6 space-y-4`}>
          <h2 className="text-xl font-semibold">Current Configuration</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-gray-600'}`}>Theme</p>
              <p className="font-mono text-lg">{currentTheme}</p>
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-gray-600'}`}>Mode</p>
              <p className="font-mono text-lg">{currentMode}</p>
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-gray-600'}`}>Custom Accent</p>
              <p className="font-mono text-lg">{customAccent || 'None'}</p>
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-gray-600'}`}>CSS Vars</p>
              <p className="font-mono text-lg">Active</p>
            </div>
          </div>
        </div>

        {/* Theme Previews */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Theme Descriptions</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {themes.map(({ id, label }) => {
              const theme = themeDefinitions[id];
              return (
                <div
                  key={id}
                  className={`${cardBgClass} border ${borderClass} rounded-lg p-6 cursor-pointer transition hover:border-blue-500`}
                  onClick={() => handleThemeSwitch(id)}
                >
                  <h3 className="font-semibold text-lg mb-2">{label}</h3>
                  <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-gray-600'} mb-4`}>
                    {theme.description}
                  </p>
                  <div className="flex gap-2">
                    {Object.entries(theme.modes.dark).slice(0, 3).map(([key, value]) => (
                      typeof value === 'string' && value.startsWith('#') && (
                        <div
                          key={key}
                          className="w-6 h-6 rounded border border-zinc-600"
                          style={{ backgroundColor: value }}
                          title={key}
                        />
                      )
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Component Examples */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Using CSS Custom Properties</h2>
          <div className="space-y-4">
            <p className={`${isDark ? 'text-zinc-400' : 'text-gray-600'}`}>
              All colors are now available as CSS custom properties (CSS variables). 
              Components use <code className={`font-mono text-sm px-2 py-1 ${cardBgClass} rounded`}>var(--primary)</code> 
              instead of hardcoded colors.
            </p>
            
            <div className={`${cardBgClass} border ${borderClass} rounded-lg p-6 space-y-3`}>
              <h3 className="font-semibold">Example: Button with Primary Accent</h3>
              <div className="flex gap-3">
                <button
                  className="px-4 py-2 rounded font-medium text-white transition hover:opacity-90"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  Primary Button
                </button>
                <button
                  className="px-4 py-2 rounded font-medium text-white transition hover:opacity-90"
                  style={{ backgroundColor: 'var(--primary-hover)' }}
                >
                  Hover State
                </button>
                <button
                  className="px-4 py-2 rounded font-medium transition"
                  style={{ backgroundColor: 'var(--primary-muted)', color: 'var(--text)' }}
                >
                  Muted State
                </button>
              </div>
              <pre className={`text-xs overflow-x-auto p-3 ${cardBgClass} border ${borderClass} rounded font-mono`}>
{`<button style={{ backgroundColor: 'var(--primary)' }}>
  Button
</button>`}
              </pre>
            </div>

            <div className={`${cardBgClass} border ${borderClass} rounded-lg p-6 space-y-3`}>
              <h3 className="font-semibold">Example: Component with All Colors</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg)' }}>--bg</div>
                <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>--bg-secondary</div>
                <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }}>--bg-tertiary</div>
                <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-elevated)' }}>--bg-elevated</div>
                <div className="p-3 rounded border" style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>--border</div>
                <div className="p-3 rounded border" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text)' }}>--border-subtle</div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Info */}
        <div className={`${cardBgClass} border ${borderClass} rounded-lg p-6 space-y-4`}>
          <h2 className="text-xl font-semibold">Technical Architecture</h2>
          <ul className={`space-y-2 text-sm ${isDark ? 'text-zinc-400' : 'text-gray-600'}`}>
            <li>✓ <strong>Fully Separable:</strong> Theme engine is independent of UI framework</li>
            <li>✓ <strong>CSS Custom Properties:</strong> All colors defined as CSS variables</li>
            <li>✓ <strong>Runtime Switching:</strong> Themes change instantly without reload</li>
            <li>✓ <strong>Persistence:</strong> User preferences saved to localStorage</li>
            <li>✓ <strong>Custom Accents:</strong> Any hex color can override theme primary</li>
            <li>✓ <strong>3 Built-in Themes:</strong> App Default, Windows 11, macOS Tahoe</li>
            <li>✓ <strong>Extensible:</strong> Add new themes by defining in themeDefinitions object</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ThemeSwitcher;
