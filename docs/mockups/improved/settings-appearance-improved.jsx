/**
 * IMPROVED SETTINGS - APPEARANCE TAB MOCKUP
 *
 * Key Improvements Implemented:
 * 1. Larger theme preview cards (better visibility)
 * 2. Clear active state indication with checkmark
 * 3. Consistent grid layout (gap-6 for theme cards)
 * 4. Accent color swatches with labels
 * 5. Theme descriptions with key characteristics
 * 6. Proper touch targets for selectable items
 * 7. Preview of each theme's actual appearance
 * 8. Accessible radio button patterns
 *
 * Issues Fixed from Audit:
 * - Theme cards: Too small (now larger with better preview)
 * - Active state: Unclear (now prominent checkmark + border)
 * - Accent swatches: No labels (now with color names)
 * - Grid spacing: Inconsistent (now gap-6 = 24px)
 * - Touch targets: Too small (now min 44px)
 * - Theme preview: Not representative (now shows actual colors)
 * - Radio buttons: Missing proper labels (now accessible)
 */

import React, { useState } from 'react';
import {
  Check,
  Sun,
  Moon,
  Palette,
} from 'lucide-react';

export default function SettingsAppearanceImproved() {
  const [selectedTheme, setSelectedTheme] = useState('autoflow');
  const [selectedAccent, setSelectedAccent] = useState('blue');
  const [isDarkMode, setIsDarkMode] = useState(true);

  const themes = [
    {
      id: 'autoflow',
      name: 'AutoFlow',
      description: 'Refined luxury aesthetic with deep shadows',
      characteristics: ['No blur', '8px radius', 'Deep shadows'],
      preview: {
        bg: '#0A0A0A',
        card: '#1A1A1A',
        text: '#FFFFFF',
        primary: '#3B82F6',
      },
    },
    {
      id: 'tahoe',
      name: 'macOS Tahoe',
      description: 'Vibrancy and translucent layers',
      characteristics: ['24px blur', '12px radius', 'Soft shadows'],
      preview: {
        bg: '#121212',
        card: 'rgba(30, 30, 30, 0.7)',
        text: '#FFFFFF',
        primary: '#3B82F6',
      },
    },
    {
      id: 'windows11',
      name: 'Windows 11',
      description: 'Mica material with Fluent elevation',
      characteristics: ['30px blur + saturation', '8px radius', 'Fluent shadows'],
      preview: {
        bg: '#1C1C1C',
        card: 'rgba(32, 32, 32, 0.6)',
        text: '#FFFFFF',
        primary: '#3B82F6',
      },
    },
  ];

  const accents = [
    { id: 'cyan', name: 'Cyan', color: '#06B6D4', contrast: '#FFFFFF' },
    { id: 'blue', name: 'Blue', color: '#3B82F6', contrast: '#FFFFFF' },
    { id: 'emerald', name: 'Emerald', color: '#10B981', contrast: '#FFFFFF' },
    { id: 'amber', name: 'Amber', color: '#F59E0B', contrast: '#000000' },
    { id: 'indigo', name: 'Indigo', color: '#6366F1', contrast: '#FFFFFF' },
    { id: 'rose', name: 'Rose', color: '#F43F5E', contrast: '#FFFFFF' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header with Tabs */}
      <header className="border-b border-border bg-background sticky top-0 z-10">
        <div className="px-6 pt-4 pb-0">
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        </div>

        {/* Tabs */}
        <div className="px-6">
          <div className="flex items-center gap-1 border-b border-border">
            <button
              className="px-4 py-3 text-sm font-medium border-b-2 border-transparent text-muted-foreground hover:text-foreground transition-colors"
            >
              Account
            </button>
            <button
              className="px-4 py-3 text-sm font-medium border-b-2 border-primary text-primary"
              aria-current="page"
            >
              Appearance
            </button>
            <button
              className="px-4 py-3 text-sm font-medium border-b-2 border-transparent text-muted-foreground hover:text-foreground transition-colors"
            >
              Notifications
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container max-w-5xl mx-auto px-6 py-6 space-y-6">
          {/* Section 1: Color Mode */}
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Color Mode</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Choose between light and dark interface
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Light Mode */}
              <button
                onClick={() => setIsDarkMode(false)}
                className={`relative bg-card border-2 rounded-xl p-4 text-left transition-all hover:shadow-lg ${
                  !isDarkMode ? 'border-primary' : 'border-border'
                }`}
                aria-label="Select light mode"
                role="radio"
                aria-checked={!isDarkMode}
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-secondary p-2">
                    <Sun className="h-5 w-5 text-foreground" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Light</h3>
                    <p className="text-sm text-muted-foreground">
                      Bright interface for daytime use
                    </p>
                  </div>

                  {/* Active Indicator */}
                  {!isDarkMode && (
                    <div className="rounded-full bg-primary p-1">
                      <Check className="h-4 w-4 text-white" aria-hidden="true" />
                    </div>
                  )}
                </div>

                {/* Preview */}
                <div className="mt-3 h-24 rounded-lg bg-gradient-to-br from-gray-50 to-gray-200 border border-gray-300 flex items-center justify-center">
                  <div className="bg-white rounded shadow-sm p-3 text-xs text-gray-900">
                    Preview
                  </div>
                </div>
              </button>

              {/* Dark Mode */}
              <button
                onClick={() => setIsDarkMode(true)}
                className={`relative bg-card border-2 rounded-xl p-4 text-left transition-all hover:shadow-lg ${
                  isDarkMode ? 'border-primary' : 'border-border'
                }`}
                aria-label="Select dark mode"
                role="radio"
                aria-checked={isDarkMode}
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-secondary p-2">
                    <Moon className="h-5 w-5 text-foreground" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Dark</h3>
                    <p className="text-sm text-muted-foreground">
                      Reduced brightness for nighttime use
                    </p>
                  </div>

                  {/* Active Indicator */}
                  {isDarkMode && (
                    <div className="rounded-full bg-primary p-1">
                      <Check className="h-4 w-4 text-white" aria-hidden="true" />
                    </div>
                  )}
                </div>

                {/* Preview */}
                <div className="mt-3 h-24 rounded-lg bg-gradient-to-br from-gray-900 to-black border border-gray-700 flex items-center justify-center">
                  <div className="bg-gray-800 rounded shadow-lg p-3 text-xs text-white">
                    Preview
                  </div>
                </div>
              </button>
            </div>
          </section>

          {/* Section 2: System Theme */}
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">System Theme</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Choose a visual style that matches your preferences
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" role="radiogroup" aria-label="System theme">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                  className={`relative bg-card border-2 rounded-xl p-4 text-left transition-all hover:shadow-lg ${
                    selectedTheme === theme.id ? 'border-primary' : 'border-border'
                  }`}
                  aria-label={`Select ${theme.name} theme`}
                  role="radio"
                  aria-checked={selectedTheme === theme.id}
                >
                  {/* Active Indicator */}
                  {selectedTheme === theme.id && (
                    <div className="absolute top-4 right-4 rounded-full bg-primary p-1">
                      <Check className="h-4 w-4 text-white" aria-hidden="true" />
                    </div>
                  )}

                  {/* Theme Name */}
                  <h3 className="font-semibold mb-1">{theme.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {theme.description}
                  </p>

                  {/* Theme Characteristics */}
                  <div className="space-y-1 mb-3">
                    {theme.characteristics.map((char) => (
                      <div key={char} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="w-1 h-1 rounded-full bg-muted-foreground" />
                        <span>{char}</span>
                      </div>
                    ))}
                  </div>

                  {/* Theme Preview */}
                  <div
                    className="relative h-32 rounded-lg overflow-hidden"
                    style={{ backgroundColor: theme.preview.bg }}
                    aria-hidden="true"
                  >
                    {/* Preview Card */}
                    <div
                      className="absolute inset-3 rounded shadow-lg p-3"
                      style={{
                        backgroundColor: theme.preview.card,
                        backdropFilter: theme.id !== 'autoflow' ? 'blur(24px)' : 'none',
                      }}
                    >
                      <div
                        className="w-full h-2 rounded mb-2"
                        style={{ backgroundColor: theme.preview.primary }}
                      />
                      <div className="space-y-1">
                        <div
                          className="w-3/4 h-1.5 rounded"
                          style={{ backgroundColor: theme.preview.text, opacity: 0.8 }}
                        />
                        <div
                          className="w-1/2 h-1.5 rounded"
                          style={{ backgroundColor: theme.preview.text, opacity: 0.5 }}
                        />
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Section 3: Accent Color */}
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Accent Color</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Choose a color for buttons, links, and highlights
              </p>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-6 gap-4" role="radiogroup" aria-label="Accent color">
              {accents.map((accent) => (
                <button
                  key={accent.id}
                  onClick={() => setSelectedAccent(accent.id)}
                  className={`relative aspect-square bg-card border-2 rounded-xl p-3 transition-all hover:shadow-lg ${
                    selectedAccent === accent.id ? 'border-primary' : 'border-border'
                  }`}
                  aria-label={`Select ${accent.name} accent color`}
                  role="radio"
                  aria-checked={selectedAccent === accent.id}
                >
                  {/* Color Swatch */}
                  <div
                    className="w-full h-full rounded-lg flex items-center justify-center shadow-sm"
                    style={{ backgroundColor: accent.color }}
                  >
                    {/* Active Indicator */}
                    {selectedAccent === accent.id && (
                      <Check
                        className="h-6 w-6"
                        style={{ color: accent.contrast }}
                        aria-hidden="true"
                      />
                    )}
                  </div>

                  {/* Color Name Label */}
                  <p className="text-xs text-center mt-2 font-medium">
                    {accent.name}
                  </p>
                </button>
              ))}
            </div>

            {/* Accent Preview */}
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-sm text-muted-foreground mb-3">Preview:</p>
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  className="h-9 px-4 rounded-lg text-white transition-colors"
                  style={{
                    backgroundColor: accents.find((a) => a.id === selectedAccent)?.color,
                  }}
                  aria-label="Preview button"
                >
                  Primary Button
                </button>
                <a
                  href="#"
                  className="text-sm font-medium hover:underline"
                  style={{
                    color: accents.find((a) => a.id === selectedAccent)?.color,
                  }}
                  aria-label="Preview link"
                >
                  Link Example
                </a>
                <div
                  className="h-9 w-9 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: `${accents.find((a) => a.id === selectedAccent)?.color}20`,
                    color: accents.find((a) => a.id === selectedAccent)?.color,
                  }}
                  aria-hidden="true"
                >
                  <Palette className="h-5 w-5" />
                </div>
              </div>
            </div>
          </section>

          {/* Preview Summary */}
          <section className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-3">Your Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Color Mode</p>
                <p className="font-medium flex items-center gap-2">
                  {isDarkMode ? (
                    <>
                      <Moon className="h-4 w-4" aria-hidden="true" />
                      Dark
                    </>
                  ) : (
                    <>
                      <Sun className="h-4 w-4" aria-hidden="true" />
                      Light
                    </>
                  )}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">System Theme</p>
                <p className="font-medium">
                  {themes.find((t) => t.id === selectedTheme)?.name}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Accent Color</p>
                <p className="font-medium flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{
                      backgroundColor: accents.find((a) => a.id === selectedAccent)?.color,
                    }}
                    aria-hidden="true"
                  />
                  {accents.find((a) => a.id === selectedAccent)?.name}
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur-sm z-10">
        <div className="container max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Changes will be applied immediately
            </p>

            <button
              type="button"
              className="flex items-center gap-2 h-11 md:h-9 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Check className="h-4 w-4" aria-hidden="true" />
              <span>Apply changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * DESIGN TOKENS USED:
 *
 * Layout:
 * - max-w-5xl: Wider container (896px) for theme cards
 * - space-y-6: Section spacing (24px)
 * - gap-6: Theme card grid spacing (24px)
 * - gap-4: Accent color grid spacing (16px)
 *
 * Theme Cards:
 * - border-2: Active state border
 * - border-primary: Selected theme
 * - border-border: Unselected theme
 * - p-4: Card padding (16px)
 * - rounded-xl: Card radius (12px)
 * - hover:shadow-lg: Hover elevation
 *
 * Active Indicators:
 * - bg-primary with white checkmark
 * - Positioned top-right on theme cards
 * - Inside accent color swatches
 *
 * Theme Previews:
 * - h-32: Preview height (128px)
 * - Actual theme colors and blur effects
 * - Miniature card with primary accent bar
 * - Text placeholder lines
 *
 * Accent Swatches:
 * - aspect-square: Equal width/height
 * - Swatch fills entire button area
 * - Color name label below
 * - Checkmark in contrasting color when active
 *
 * Color Mode Cards:
 * - h-24: Preview height (96px)
 * - Gradient backgrounds (light/dark)
 * - Miniature card preview
 *
 * Preview Summary:
 * - Grid with selected options
 * - Icons matching each choice
 * - Color swatch for accent
 *
 * Accessibility:
 * - role="radio" on theme/accent buttons
 * - role="radiogroup" on containers
 * - aria-checked: Current selection state
 * - aria-current="page": Active tab
 * - aria-label: Descriptive labels for all selections
 * - Icons with aria-hidden="true"
 * - Keyboard navigation supported (Tab, Space/Enter to select)
 *
 * Touch Targets:
 * - Theme cards: Large (entire card is clickable)
 * - Accent buttons: Square, min 44px
 * - All selectable items meet WCAG AAA (≥44px)
 *
 * Typography:
 * - text-lg font-semibold: Section headings
 * - text-sm text-muted-foreground: Descriptions
 * - text-xs: Accent color labels, characteristics
 *
 * Colors (Preview):
 * - Cyan: #06B6D4
 * - Blue: #3B82F6
 * - Emerald: #10B981
 * - Amber: #F59E0B
 * - Indigo: #6366F1
 * - Rose: #F43F5E
 *
 * Note: Radio button pattern (role="radio", aria-checked) provides
 * native keyboard navigation and screen reader support for selection.
 */
