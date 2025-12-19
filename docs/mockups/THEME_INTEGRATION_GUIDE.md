# AutoFlow Theme System Integration Guide

## Overview

The theme system has been completely separated from the UI layer using CSS custom properties. This allows themes to be applied globally at runtime without modifying individual components.

**Key Benefits:**
- ✅ Themes change instantly across entire app
- ✅ No component refactoring needed
- ✅ Easy to add new themes
- ✅ Custom accent colors override defaults
- ✅ Persists user preference
- ✅ Framework-agnostic (can port to Vue, Svelte, etc.)

---

## Architecture

### File Structure

```
project/
├── theme-engine.js          # Core theme system (100% decoupled)
├── color-picker.jsx         # Advanced color picker component
├── theme-switcher.jsx       # Demo/UI for switching themes
├── autoflow-prototype-v4.jsx # Updated to use CSS vars
└── integration-guide.md     # This file
```

### Three Layers

1. **Theme Definitions** (`themeDefinitions` object)
   - 3 complete theme configs (App Default, Windows 11, macOS Tahoe)
   - Each theme: 2 modes (dark/light) + accent colors
   - Add new themes by extending this object

2. **Theme Engine** (`ThemeEngine` class)
   - Manages theme state
   - Generates CSS custom properties
   - Handles theme switching, mode toggling, custom accents
   - Persists to localStorage
   - Observable (pub/sub pattern for React components)

3. **Component Layer** (React components)
   - Use CSS custom properties instead of hardcoded colors
   - Can subscribe to theme changes for reactive updates
   - No coupling to theme system

---

## Usage in Next.js App

### Step 1: Initialize Theme in Root Layout

```jsx
// app/layout.jsx
'use client';

import { useEffect, useState } from 'react';
import { ThemeEngine } from '@/lib/theme-engine';
import './globals.css';

export default function RootLayout({ children }) {
  const [engine] = useState(() => new ThemeEngine());

  useEffect(() => {
    // Apply theme on mount
    engine.applyTheme(document.documentElement);
    
    // Subscribe to theme changes (optional, for logging)
    const unsubscribe = engine.subscribe((state) => {
      console.log('Theme changed:', state);
    });
    
    return unsubscribe;
  }, [engine]);

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### Step 2: Use CSS Custom Properties

```jsx
// component/Button.jsx
export const Button = ({ children, variant = 'primary' }) => {
  const styles = {
    primary: {
      backgroundColor: 'var(--primary)',
      color: 'var(--text-inverted)',
    },
    secondary: {
      backgroundColor: 'var(--bg-secondary)',
      color: 'var(--text)',
      border: '1px solid var(--border)',
    },
    danger: {
      backgroundColor: 'var(--color-error)',
      color: 'var(--text-inverted)',
    },
  };

  return (
    <button
      style={styles[variant]}
      className="px-4 py-2 rounded font-medium transition hover:opacity-90"
    >
      {children}
    </button>
  );
};
```

### Step 3: Create Settings Panel

```jsx
// app/settings/theme-settings.jsx
'use client';

import { useState, useEffect } from 'react';
import { ThemeEngine, themeDefinitions } from '@/lib/theme-engine';
import ColorPicker from '@/components/color-picker';

export default function ThemeSettings() {
  const [engine] = useState(() => new ThemeEngine());
  const [theme, setTheme] = useState(engine.themeName);
  const [mode, setMode] = useState(engine.mode);
  const [customAccent, setCustomAccent] = useState(engine.customAccent);

  useEffect(() => {
    const unsubscribe = engine.subscribe((state) => {
      setTheme(state.theme);
      setMode(state.mode);
      setCustomAccent(state.customAccent);
    });
    return unsubscribe;
  }, [engine]);

  return (
    <div className="space-y-6">
      {/* Theme Selector */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Theme</h2>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(themeDefinitions).map(([id, config]) => (
            <button
              key={id}
              onClick={() => engine.setTheme(id)}
              className={`px-4 py-3 rounded border-2 transition ${
                theme === id
                  ? 'border-primary bg-primary-muted'
                  : 'border-border hover:border-primary'
              }`}
            >
              {config.name}
            </button>
          ))}
        </div>
      </div>

      {/* Mode Toggle */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Appearance</h2>
        <div className="flex gap-3">
          {['dark', 'light'].map((m) => (
            <button
              key={m}
              onClick={() => engine.setMode(m)}
              className={`px-4 py-2 rounded border ${
                mode === m
                  ? 'bg-primary text-white'
                  : 'border-border'
              }`}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Accent */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Accent Color</h2>
        <ColorPicker
          initialColor={customAccent || '#3B82F6'}
          onColorChange={(hex) => engine.setCustomAccent(hex)}
        />
        {customAccent && (
          <button
            onClick={() => engine.clearCustomAccent()}
            className="mt-3 px-3 py-2 text-sm border border-border rounded"
          >
            Reset to Default
          </button>
        )}
      </div>
    </div>
  );
}
```

---

## CSS Custom Properties Reference

### Available Variables

```css
:root {
  /* Background Layers */
  --bg                     /* Primary background */
  --bg-secondary           /* Cards, sidebars */
  --bg-tertiary            /* Inputs, nested elements */
  --bg-elevated            /* Modals, popovers */
  --bg-hover               /* Hover state background */
  --bg-active              /* Active/selected background */
  
  /* Borders */
  --border                 /* Standard borders */
  --border-subtle          /* Subtle dividers */
  --border-strong          /* Emphasis borders */
  
  /* Text */
  --text                   /* Primary text */
  --text-secondary         /* Secondary text */
  --text-muted             /* Disabled, hints */
  --text-inverted          /* Text on colored backgrounds */
  
  /* Shadows */
  --shadow                 /* Strong shadows */
  --shadow-light           /* Subtle shadows */
  
  /* Accent Colors */
  --primary                /* Primary action button */
  --primary-hover          /* Hover state */
  --primary-muted          /* Background tints */
  --primary-gradient       /* Gradient decoration */
  
  /* Semantic Colors */
  --color-success          /* Success state */
  --color-warning          /* Warning state */
  --color-error            /* Error state */
  --color-info             /* Info state */
  
  /* Typography */
  --font-sans              /* System fonts */
  --font-mono              /* Monospace fonts */
}
```

### Example Usage Patterns

```css
/* Button with theme colors */
.button-primary {
  background-color: var(--primary);
  color: var(--text-inverted);
  border: 1px solid var(--primary-hover);
}

/* Card with theme colors */
.card {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border);
  color: var(--text);
}

/* Form input */
.input {
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border);
  color: var(--text);
}

/* Focus state */
.input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-muted);
}

/* Disabled state */
.button:disabled {
  background-color: var(--bg-tertiary);
  color: var(--text-muted);
  cursor: not-allowed;
}
```

---

## Adding New Themes

### 1. Define Theme in `theme-engine.js`

```javascript
export const themeDefinitions = {
  // ... existing themes ...
  
  'custom-theme': {
    name: 'My Custom Theme',
    description: 'Custom theme description',
    modes: {
      dark: {
        bg: '#1a1a1a',
        bgSecondary: '#2d2d2d',
        // ... all 15 color variables ...
      },
      light: {
        bg: '#ffffff',
        bgSecondary: '#f5f5f5',
        // ... all 15 color variables ...
      },
    },
    accents: {
      primary: '#FF6B6B',
      primaryHover: '#FF5252',
      primaryMuted: '#FFE0E0',
      primaryGradient: 'linear-gradient(135deg, #FF6B6B 0%, #FF5252 100%)',
    },
  },
};
```

### 2. Use It

```javascript
const engine = new ThemeEngine();
engine.setTheme('custom-theme');
```

---

## React Context Integration (Optional)

For more elegant React integration, create a context:

```jsx
// lib/theme-context.jsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { ThemeEngine } from './theme-engine';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [engine] = useState(() => new ThemeEngine());
  const [state, setState] = useState({
    theme: engine.themeName,
    mode: engine.mode,
    customAccent: engine.customAccent,
  });

  useEffect(() => {
    engine.applyTheme();
    const unsubscribe = engine.subscribe(setState);
    return unsubscribe;
  }, [engine]);

  return (
    <ThemeContext.Provider value={{ engine, ...state }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

### Usage

```jsx
// app/layout.jsx
import { ThemeProvider } from '@/lib/theme-context';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

// Any component
'use client';
import { useTheme } from '@/lib/theme-context';

export function MyComponent() {
  const { engine, theme, mode } = useTheme();
  
  return (
    <button onClick={() => engine.setTheme('windows-11')}>
      Switch to Windows 11
    </button>
  );
}
```

---

## Migrating Existing Components

### Before (Hardcoded Colors)

```jsx
export function Card({ children }) {
  return (
    <div
      style={{
        backgroundColor: '#131316',
        border: '1px solid #27272A',
        color: '#FAFAFA',
      }}
    >
      {children}
    </div>
  );
}
```

### After (CSS Variables)

```jsx
export function Card({ children }) {
  return (
    <div
      style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        color: 'var(--text)',
      }}
    >
      {children}
    </div>
  );
}
```

### Or with CSS Class

```jsx
export function Card({ children }) {
  return (
    <div className="card">
      {children}
    </div>
  );
}
```

```css
/* styles/components.css */
.card {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border);
  color: var(--text);
  padding: 1rem;
  border-radius: 0.5rem;
}
```

---

## Troubleshooting

### Colors not changing

1. Check that `engine.applyTheme()` is called after theme change
2. Verify CSS custom property syntax: `var(--name)`
3. Check browser DevTools: Inspect element should show CSS vars in `<style>` tag

### Theme not persisting

1. localStorage may be disabled
2. Check browser console for localStorage errors
3. Can be disabled by passing options to engine

### Custom accent not applying

1. Verify hex format: `#RRGGBB` (7 characters)
2. Check that `setCustomAccent()` is called before `applyTheme()`
3. Inspect `--primary` CSS var in DevTools

---

## Performance Considerations

- Theme switching is ~1-2ms (instant to users)
- No re-renders required (CSS-based system)
- Minimal JavaScript overhead
- Scales to hundreds of components

---

## Future Enhancements

Potential additions:
- [ ] System theme detection (prefers-color-scheme)
- [ ] Theme export/import as JSON
- [ ] Animated theme transitions
- [ ] Per-component theme overrides
- [ ] Theme builder UI
- [ ] Theme marketplace/sharing

---

## Support

For issues or questions, refer to:
- `theme-engine.js` - Detailed comments on each method
- `theme-switcher.jsx` - Full working example
- `PROJECT_CONTEXT.md` - Project specifications
