/**
 * AutoFlow Theme Engine
 * 
 * Complete separation of concerns: Theme definition, application, and persistence
 * This system is independent of any UI component library and can be applied to any React app
 * 
 * Usage:
 * 1. Import ThemeEngine and themeDefinitions
 * 2. Initialize: const engine = new ThemeEngine('app-default', 'dark')
 * 3. Apply: engine.applyTheme(document.documentElement)
 * 4. Subscribe: engine.subscribe(listener)
 * 5. Change theme: engine.setTheme('windows-11')
 * 6. Customize accent: engine.setCustomAccent('#FF5733')
 */

// ============================================================================
// THEME DEFINITIONS - Completely independent of UI
// ============================================================================

export const themeDefinitions = {
  'app-default': {
    name: 'AutoFlow Default',
    description: 'Modern, clean dark-first interface with vibrant accents',
    modes: {
      dark: {
        // Background layers
        bg: '#0A0A0B',
        bgSecondary: '#131316',
        bgTertiary: '#1A1A1F',
        bgElevated: '#1F1F26',
        bgHover: '#252530',
        bgActive: '#2D2D35',
        
        // Borders
        border: '#27272A',
        borderSubtle: '#1F1F23',
        borderStrong: '#3F3F46',
        
        // Text
        text: '#FAFAFA',
        textSecondary: '#A1A1AA',
        textMuted: '#71717A',
        textInverted: '#000000',
        
        // Utility
        shadow: 'rgba(0, 0, 0, 0.5)',
        shadowLight: 'rgba(0, 0, 0, 0.25)',
        successBase: '#22C55E',
        warningBase: '#F59E0B',
        errorBase: '#EF4444',
        infoBase: '#3B82F6',
      },
      light: {
        bg: '#FAFAFA',
        bgSecondary: '#F4F4F5',
        bgTertiary: '#E4E4E7',
        bgElevated: '#FFFFFF',
        bgHover: '#E4E4E7',
        bgActive: '#D4D4D8',
        
        border: '#D4D4D8',
        borderSubtle: '#E4E4E7',
        borderStrong: '#A1A1AA',
        
        text: '#09090B',
        textSecondary: '#52525B',
        textMuted: '#A1A1AA',
        textInverted: '#FFFFFF',
        
        shadow: 'rgba(0, 0, 0, 0.08)',
        shadowLight: 'rgba(0, 0, 0, 0.04)',
        successBase: '#16A34A',
        warningBase: '#D97706',
        errorBase: '#DC2626',
        infoBase: '#2563EB',
      },
    },
    accents: {
      primary: '#3B82F6',
      primaryHover: '#2563EB',
      primaryMuted: '#1E3A5F',
      primaryGradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
    },
  },
  
  'windows-11': {
    name: 'Windows 11',
    description: 'Clean, minimalist design inspired by Windows 11 Fluent Design',
    modes: {
      dark: {
        bg: '#0D0D0D',
        bgSecondary: '#1F1F1F',
        bgTertiary: '#2D2D2D',
        bgElevated: '#3A3A3A',
        bgHover: '#3F3F3F',
        bgActive: '#4A4A4A',
        
        border: '#5A5A5A',
        borderSubtle: '#353535',
        borderStrong: '#707070',
        
        text: '#FFFFFF',
        textSecondary: '#C5C5C5',
        textMuted: '#949494',
        textInverted: '#000000',
        
        shadow: 'rgba(0, 0, 0, 0.6)',
        shadowLight: 'rgba(0, 0, 0, 0.3)',
        successBase: '#34C759',
        warningBase: '#FF9500',
        errorBase: '#FF3B30',
        infoBase: '#0078D7',
      },
      light: {
        bg: '#FFFFFF',
        bgSecondary: '#F3F3F3',
        bgTertiary: '#ECECEC',
        bgElevated: '#FFFFFF',
        bgHover: '#E8E8E8',
        bgActive: '#DCDCDC',
        
        border: '#C0C0C0',
        borderSubtle: '#E0E0E0',
        borderStrong: '#7A7A7A',
        
        text: '#000000',
        textSecondary: '#595959',
        textMuted: '#8A8A8A',
        textInverted: '#FFFFFF',
        
        shadow: 'rgba(0, 0, 0, 0.1)',
        shadowLight: 'rgba(0, 0, 0, 0.05)',
        successBase: '#30B0C0',
        warningBase: '#FFB81C',
        errorBase: '#E81828',
        infoBase: '#0078D4',
      },
    },
    accents: {
      primary: '#0078D4',
      primaryHover: '#005A9E',
      primaryMuted: '#1084D7',
      primaryGradient: 'linear-gradient(135deg, #0078D4 0%, #005A9E 100%)',
    },
  },
  
  'macos-tahoe': {
    name: 'macOS Tahoe',
    description: 'Refined, sophisticated design inspired by macOS 15 Sequoia aesthetic',
    modes: {
      dark: {
        bg: '#1A1A1A',
        bgSecondary: '#252525',
        bgTertiary: '#303030',
        bgElevated: '#3C3C3C',
        bgHover: '#414141',
        bgActive: '#4A4A4A',
        
        border: '#424242',
        borderSubtle: '#2E2E2E',
        borderStrong: '#5A5A5A',
        
        text: '#F5F5F7',
        textSecondary: '#A1A1A6',
        textMuted: '#86868B',
        textInverted: '#000000',
        
        shadow: 'rgba(0, 0, 0, 0.4)',
        shadowLight: 'rgba(0, 0, 0, 0.15)',
        successBase: '#32DD50',
        warningBase: '#FFB817',
        errorBase: '#FF3B30',
        infoBase: '#34C7FF',
      },
      light: {
        bg: '#FFFFFF',
        bgSecondary: '#F6F6F6',
        bgTertiary: '#EFEFEF',
        bgElevated: '#FFFFFF',
        bgHover: '#E8E8E8',
        bgActive: '#DCDCDC',
        
        border: '#D8D8D8',
        borderSubtle: '#E8E8E8',
        borderStrong: '#888888',
        
        text: '#1D1D1D',
        textSecondary: '#666666',
        textMuted: '#8E8E93',
        textInverted: '#FFFFFF',
        
        shadow: 'rgba(0, 0, 0, 0.08)',
        shadowLight: 'rgba(0, 0, 0, 0.03)',
        successBase: '#30B0C0',
        warningBase: '#F5A623',
        errorBase: '#FF3B30',
        infoBase: '#00A4EF',
      },
    },
    accents: {
      primary: '#34C7FF',
      primaryHover: '#25B0E8',
      primaryMuted: '#1E6F8B',
      primaryGradient: 'linear-gradient(135deg, #34C7FF 0%, #25B0E8 100%)',
    },
  },
};

// ============================================================================
// THEME ENGINE - Core system
// ============================================================================

export class ThemeEngine {
  constructor(themeName = 'app-default', mode = 'dark', customAccent = null) {
    this.themeName = themeName;
    this.mode = mode;
    this.customAccent = customAccent;
    this.listeners = [];
    this.loadPersistedSettings();
  }

  // Get current theme definition
  getCurrentTheme() {
    return themeDefinitions[this.themeName];
  }

  // Get current mode colors
  getCurrentModeColors() {
    const theme = this.getCurrentTheme();
    return theme.modes[this.mode];
  }

  // Get current accents
  getCurrentAccents() {
    const theme = this.getCurrentTheme();
    if (this.customAccent) {
      return {
        primary: this.customAccent,
        primaryHover: this.adjustBrightness(this.customAccent, -15),
        primaryMuted: this.adjustBrightness(this.customAccent, -40),
        primaryGradient: `linear-gradient(135deg, ${this.customAccent} 0%, ${this.adjustBrightness(this.customAccent, -15)} 100%)`,
      };
    }
    return theme.accents;
  }

  // Generate CSS custom properties
  generateCSSVariables() {
    const modeColors = this.getCurrentModeColors();
    const accents = this.getCurrentAccents();
    
    let css = ':root {\n';
    
    // Mode colors
    Object.entries(modeColors).forEach(([key, value]) => {
      css += `  --${this.camelToKebab(key)}: ${value};\n`;
    });
    
    // Accent colors
    Object.entries(accents).forEach(([key, value]) => {
      css += `  --${this.camelToKebab(key)}: ${value};\n`;
    });
    
    // Semantic colors
    css += `  --color-success: ${modeColors.successBase};\n`;
    css += `  --color-warning: ${modeColors.warningBase};\n`;
    css += `  --color-error: ${modeColors.errorBase};\n`;
    css += `  --color-info: ${modeColors.infoBase};\n`;
    
    // Typography (can be extended per theme)
    css += `  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\n`;
    css += `  --font-mono: 'Fira Code', 'Monaco', monospace;\n`;
    
    css += '}';
    return css;
  }

  // Apply theme to DOM
  applyTheme(element = document.documentElement) {
    const css = this.generateCSSVariables();
    
    // Remove existing theme style if present
    let styleEl = document.getElementById('autoflow-theme-root');
    if (styleEl) {
      styleEl.remove();
    }
    
    // Create and inject new style
    styleEl = document.createElement('style');
    styleEl.id = 'autoflow-theme-root';
    styleEl.textContent = css;
    document.head.appendChild(styleEl);
    
    // Add data attributes for JavaScript selectors
    element.setAttribute('data-theme', this.themeName);
    element.setAttribute('data-mode', this.mode);
    element.setAttribute('data-custom-accent', this.customAccent || 'none');
  }

  // Set theme by name
  setTheme(themeName) {
    if (!themeDefinitions[themeName]) {
      console.error(`Theme "${themeName}" not found`);
      return;
    }
    this.themeName = themeName;
    this.customAccent = null; // Reset custom accent when switching themes
    this.notify();
  }

  // Set mode (dark/light)
  setMode(mode) {
    if (!['dark', 'light'].includes(mode)) {
      console.error(`Mode "${mode}" not valid. Use 'dark' or 'light'`);
      return;
    }
    this.mode = mode;
    this.notify();
  }

  // Set custom accent color
  setCustomAccent(hexColor) {
    if (!this.isValidHex(hexColor)) {
      console.error(`Invalid hex color: ${hexColor}`);
      return;
    }
    this.customAccent = hexColor;
    this.notify();
  }

  // Clear custom accent (use theme default)
  clearCustomAccent() {
    this.customAccent = null;
    this.notify();
  }

  // Subscribe to changes
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify subscribers
  notify() {
    this.applyTheme();
    this.persistSettings();
    this.listeners.forEach(listener => listener({
      theme: this.themeName,
      mode: this.mode,
      customAccent: this.customAccent,
    }));
  }

  // Persist to localStorage
  persistSettings() {
    try {
      localStorage.setItem('autoflow-theme-settings', JSON.stringify({
        themeName: this.themeName,
        mode: this.mode,
        customAccent: this.customAccent,
      }));
    } catch (e) {
      console.warn('Could not persist theme settings:', e);
    }
  }

  // Load from localStorage
  loadPersistedSettings() {
    try {
      const saved = localStorage.getItem('autoflow-theme-settings');
      if (saved) {
        const { themeName, mode, customAccent } = JSON.parse(saved);
        this.themeName = themeName || this.themeName;
        this.mode = mode || this.mode;
        this.customAccent = customAccent || null;
      }
    } catch (e) {
      console.warn('Could not load persisted theme settings:', e);
    }
  }

  // Utility: Get all available themes
  getAvailableThemes() {
    return Object.entries(themeDefinitions).map(([key, theme]) => ({
      id: key,
      ...theme,
    }));
  }

  // Utility: Adjust color brightness
  adjustBrightness(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, (num >> 8 & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return `#${(0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255))
      .toString(16).slice(1)}`;
  }

  // Utility: Validate hex color
  isValidHex(hex) {
    return /^#[0-9A-F]{6}$/i.test(hex);
  }

  // Utility: Convert camelCase to kebab-case
  camelToKebab(str) {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  }

  // Export theme as JSON (for sharing/saving)
  exportTheme() {
    return {
      theme: this.themeName,
      mode: this.mode,
      customAccent: this.customAccent,
      generatedAt: new Date().toISOString(),
    };
  }

  // Import theme from JSON
  importTheme(config) {
    if (config.theme && themeDefinitions[config.theme]) {
      this.setTheme(config.theme);
    }
    if (config.mode && ['dark', 'light'].includes(config.mode)) {
      this.setMode(config.mode);
    }
    if (config.customAccent && this.isValidHex(config.customAccent)) {
      this.setCustomAccent(config.customAccent);
    }
  }
}

// ============================================================================
// EXPORT FOR USE IN REACT
// ============================================================================

export const createThemeContext = () => {
  const React = require('react');
  const ThemeContext = React.createContext(null);
  
  return {
    ThemeContext,
    useTheme: () => {
      const context = React.useContext(ThemeContext);
      if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
      }
      return context;
    },
  };
};

export default ThemeEngine;
