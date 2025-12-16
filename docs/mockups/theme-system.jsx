import { useState, useEffect } from 'react';

// AutoFlow Theme System Mockup
// Phase 0.5 - Design Sprint
// Features: Dark mode default, Light/System toggle, 6 accent colour themes

const accentThemes = {
  midnight: {
    name: 'Midnight Blue',
    primary: '#3B82F6',
    primaryHover: '#2563EB',
    primaryMuted: '#1E3A5F',
    gradient: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
  },
  emerald: {
    name: 'Emerald Green',
    primary: '#10B981',
    primaryHover: '#059669',
    primaryMuted: '#064E3B',
    gradient: 'linear-gradient(135deg, #064E3B 0%, #10B981 100%)',
  },
  sunset: {
    name: 'Sunset Orange',
    primary: '#F59E0B',
    primaryHover: '#D97706',
    primaryMuted: '#78350F',
    gradient: 'linear-gradient(135deg, #92400E 0%, #F59E0B 100%)',
  },
  royal: {
    name: 'Royal Purple',
    primary: '#8B5CF6',
    primaryHover: '#7C3AED',
    primaryMuted: '#4C1D95',
    gradient: 'linear-gradient(135deg, #4C1D95 0%, #8B5CF6 100%)',
  },
  rose: {
    name: 'Rose Pink',
    primary: '#EC4899',
    primaryHover: '#DB2777',
    primaryMuted: '#831843',
    gradient: 'linear-gradient(135deg, #831843 0%, #EC4899 100%)',
  },
  slate: {
    name: 'Slate Grey',
    primary: '#64748B',
    primaryHover: '#475569',
    primaryMuted: '#1E293B',
    gradient: 'linear-gradient(135deg, #1E293B 0%, #64748B 100%)',
  },
};

const modeThemes = {
  dark: {
    bg: '#0A0A0B',
    bgSecondary: '#131316',
    bgTertiary: '#1A1A1F',
    bgElevated: '#1F1F26',
    border: '#27272A',
    borderSubtle: '#1F1F23',
    text: '#FAFAFA',
    textSecondary: '#A1A1AA',
    textMuted: '#71717A',
  },
  light: {
    bg: '#FAFAFA',
    bgSecondary: '#F4F4F5',
    bgTertiary: '#E4E4E7',
    bgElevated: '#FFFFFF',
    border: '#D4D4D8',
    borderSubtle: '#E4E4E7',
    text: '#09090B',
    textSecondary: '#52525B',
    textMuted: '#A1A1AA',
  },
};

function ThemeProvider({ children, mode, accent }) {
  const modeColors = modeThemes[mode];
  const accentColors = accentThemes[accent];
  
  const cssVars = {
    '--bg': modeColors.bg,
    '--bg-secondary': modeColors.bgSecondary,
    '--bg-tertiary': modeColors.bgTertiary,
    '--bg-elevated': modeColors.bgElevated,
    '--border': modeColors.border,
    '--border-subtle': modeColors.borderSubtle,
    '--text': modeColors.text,
    '--text-secondary': modeColors.textSecondary,
    '--text-muted': modeColors.textMuted,
    '--primary': accentColors.primary,
    '--primary-hover': accentColors.primaryHover,
    '--primary-muted': accentColors.primaryMuted,
    '--primary-gradient': accentColors.gradient,
  };
  
  return (
    <div style={cssVars} className="theme-root">
      {children}
    </div>
  );
}

function ModeToggle({ mode, setMode }) {
  const modes = [
    { key: 'dark', icon: '◐', label: 'Dark' },
    { key: 'light', icon: '○', label: 'Light' },
    { key: 'system', icon: '◑', label: 'System' },
  ];
  
  return (
    <div style={{
      display: 'flex',
      gap: '4px',
      padding: '4px',
      background: 'var(--bg-tertiary)',
      borderRadius: '12px',
      border: '1px solid var(--border-subtle)',
    }}>
      {modes.map(m => (
        <button
          key={m.key}
          onClick={() => setMode(m.key)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 500,
            transition: 'all 0.2s ease',
            background: mode === m.key ? 'var(--bg-elevated)' : 'transparent',
            color: mode === m.key ? 'var(--text)' : 'var(--text-muted)',
            boxShadow: mode === m.key ? '0 1px 3px rgba(0,0,0,0.2)' : 'none',
          }}
        >
          <span style={{ fontSize: '14px' }}>{m.icon}</span>
          {m.label}
        </button>
      ))}
    </div>
  );
}

function AccentPicker({ accent, setAccent }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    }}>
      <span style={{
        fontSize: '12px',
        fontWeight: 600,
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}>Accent Colour</span>
      <div style={{
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
      }}>
        {Object.entries(accentThemes).map(([key, theme]) => (
          <button
            key={key}
            onClick={() => setAccent(key)}
            title={theme.name}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              border: accent === key ? '2px solid var(--text)' : '2px solid transparent',
              background: theme.gradient,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              transform: accent === key ? 'scale(1.1)' : 'scale(1)',
              boxShadow: accent === key 
                ? `0 0 0 2px var(--bg), 0 4px 12px ${theme.primary}40`
                : '0 2px 4px rgba(0,0,0,0.2)',
            }}
          />
        ))}
      </div>
      <span style={{
        fontSize: '13px',
        color: 'var(--text-secondary)',
      }}>{accentThemes[accent].name}</span>
    </div>
  );
}

function StatCard({ label, value, trend, icon }) {
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      borderRadius: '16px',
      padding: '20px',
      border: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}>
        <span style={{
          fontSize: '13px',
          color: 'var(--text-muted)',
          fontWeight: 500,
        }}>{label}</span>
        <span style={{
          fontSize: '18px',
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--primary-muted)',
          borderRadius: '8px',
          color: 'rgba(255, 255, 255, 0.9)',
        }}>{icon}</span>
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: '8px',
      }}>
        <span style={{
          fontSize: '28px',
          fontWeight: 700,
          color: 'var(--text)',
          letterSpacing: '-0.02em',
        }}>{value}</span>
        {trend && (
          <span style={{
            fontSize: '12px',
            fontWeight: 600,
            color: trend > 0 ? '#10B981' : '#EF4444',
            background: trend > 0 ? '#10B98115' : '#EF444415',
            padding: '2px 8px',
            borderRadius: '6px',
          }}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  );
}

function QuickCapture() {
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      borderRadius: '16px',
      padding: '20px',
      border: '1px solid var(--border-subtle)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 16px',
        background: 'var(--bg-secondary)',
        borderRadius: '12px',
        border: '1px solid var(--border)',
        cursor: 'text',
      }}>
        <span style={{ color: 'var(--primary)', fontSize: '18px' }}>+</span>
        <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Capture a new idea...
        </span>
        <span style={{
          marginLeft: 'auto',
          fontSize: '11px',
          fontFamily: 'ui-monospace, monospace',
          color: 'var(--text-muted)',
          background: 'var(--bg-tertiary)',
          padding: '4px 8px',
          borderRadius: '6px',
          border: '1px solid var(--border-subtle)',
        }}>⌘K</span>
      </div>
    </div>
  );
}

function KanbanColumn({ title, color, cards }) {
  return (
    <div style={{
      minWidth: '260px',
      maxWidth: '260px',
      background: 'var(--bg-secondary)',
      borderRadius: '12px',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        padding: '12px 14px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <div style={{
          width: '10px',
          height: '10px',
          borderRadius: '3px',
          background: color,
        }} />
        <span style={{
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--text)',
        }}>{title}</span>
        <span style={{
          fontSize: '12px',
          color: 'var(--text-muted)',
          marginLeft: 'auto',
        }}>{cards.length}</span>
      </div>
      <div style={{
        padding: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        flex: 1,
      }}>
        {cards.map((card, i) => (
          <div
            key={i}
            style={{
              background: 'var(--bg-elevated)',
              borderRadius: '10px',
              padding: '12px',
              border: '1px solid var(--border-subtle)',
              cursor: 'grab',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {card.labels && (
              <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                {card.labels.map((label, j) => (
                  <span key={j} style={{
                    fontSize: '10px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: label.color + '20',
                    color: label.color,
                    fontWeight: 600,
                  }}>{label.text}</span>
                ))}
              </div>
            )}
            <span style={{
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--text)',
              lineHeight: 1.4,
            }}>{card.title}</span>
            {card.progress !== undefined && (
              <div style={{ marginTop: '10px' }}>
                <div style={{
                  height: '4px',
                  background: 'var(--bg-tertiary)',
                  borderRadius: '2px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${card.progress}%`,
                    background: 'var(--primary)',
                    borderRadius: '2px',
                    transition: 'width 0.3s ease',
                  }} />
                </div>
              </div>
            )}
          </div>
        ))}
        <button style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 12px',
          background: 'transparent',
          border: '1px dashed var(--border)',
          borderRadius: '10px',
          color: 'var(--text-muted)',
          fontSize: '13px',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'var(--primary)';
          e.currentTarget.style.color = 'var(--primary)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.color = 'var(--text-muted)';
        }}
        >
          <span>+</span> Add card
        </button>
      </div>
    </div>
  );
}

function Sidebar({ accent }) {
  const navItems = [
    { icon: '⌂', label: 'Dashboard', active: true },
    { icon: '◎', label: 'Ideas', badge: 12 },
    { icon: '▦', label: 'Projects' },
    { icon: '📋', label: 'Questionnaires' },
    { icon: '◔', label: 'Analytics' },
  ];
  
  return (
    <div style={{
      width: '240px',
      height: '100%',
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 12px',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px 12px',
        marginBottom: '24px',
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: 'var(--primary-gradient)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          fontWeight: 700,
          color: 'white',
        }}>A</div>
        <span style={{
          fontSize: '17px',
          fontWeight: 700,
          color: 'var(--text)',
          letterSpacing: '-0.02em',
        }}>AutoFlow</span>
      </div>
      
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map((item, i) => (
          <a
            key={i}
            href="#"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 12px',
              borderRadius: '10px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 500,
              transition: 'all 0.15s ease',
              background: item.active ? 'var(--primary)' : 'transparent',
              color: item.active ? '#FFFFFF' : 'var(--text-secondary)',
            }}
          >
            <span style={{ fontSize: '16px' }}>{item.icon}</span>
            {item.label}
            {item.badge && (
              <span style={{
                marginLeft: 'auto',
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '10px',
                background: item.active ? 'rgba(255,255,255,0.2)' : 'var(--primary)',
                color: 'white',
              }}>{item.badge}</span>
            )}
          </a>
        ))}
      </nav>
      
      <div style={{ marginTop: 'auto', padding: '0 8px' }}>
        <div style={{
          padding: '16px',
          background: 'var(--primary-muted)',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
        }}>
          <div style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'rgba(255, 255, 255, 0.85)',
            marginBottom: '4px',
          }}>Hours Saved</div>
          <div style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#FFFFFF',
            letterSpacing: '-0.02em',
          }}>127.5h</div>
          <div style={{
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.7)',
            marginTop: '4px',
          }}>≈ £3,825 value</div>
        </div>
      </div>
    </div>
  );
}

export default function AutoFlowThemeMockup() {
  const [modePreference, setModePreference] = useState('dark');
  const [accent, setAccent] = useState('midnight');
  
  // Resolve actual mode (system preference or explicit)
  const [systemMode, setSystemMode] = useState('dark');
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemMode(mediaQuery.matches ? 'dark' : 'light');
    const handler = (e) => setSystemMode(e.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  const resolvedMode = modePreference === 'system' ? systemMode : modePreference;
  
  const kanbanData = [
    {
      title: 'Backlog',
      color: '#6366F1',
      cards: [
        { title: 'Voice-to-text capture for mobile', labels: [{ text: 'Phase 8', color: '#8B5CF6' }] },
        { title: 'Calendar view for cards', labels: [{ text: 'View', color: '#F59E0B' }] },
      ],
    },
    {
      title: 'In Progress',
      color: '#3B82F6',
      cards: [
        { title: 'Theme system with dark mode default', labels: [{ text: 'Design', color: '#EC4899' }], progress: 65 },
        { title: 'Colour theme selector component', labels: [{ text: 'UI', color: '#10B981' }], progress: 40 },
      ],
    },
    {
      title: 'Review',
      color: '#8B5CF6',
      cards: [
        { title: 'Project bootstrap files', labels: [{ text: 'Docs', color: '#64748B' }], progress: 90 },
      ],
    },
    {
      title: 'Done',
      color: '#22C55E',
      cards: [
        { title: 'Initial requirements gathering', labels: [{ text: 'Planning', color: '#06B6D4' }] },
      ],
    },
  ];

  return (
    <ThemeProvider mode={resolvedMode} accent={accent}>
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--text)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex',
        transition: 'background 0.3s ease, color 0.3s ease',
      }}>
        <Sidebar accent={accent} />
        
        <main style={{
          flex: 1,
          padding: '24px 32px',
          overflow: 'auto',
        }}>
          {/* Header with Theme Controls */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '32px',
            flexWrap: 'wrap',
            gap: '20px',
          }}>
            <div>
              <h1 style={{
                fontSize: '28px',
                fontWeight: 700,
                color: 'var(--text)',
                margin: 0,
                letterSpacing: '-0.02em',
              }}>Dashboard</h1>
              <p style={{
                fontSize: '14px',
                color: 'var(--text-muted)',
                margin: '6px 0 0 0',
              }}>Welcome back. Here's your automation overview.</p>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '24px',
              flexWrap: 'wrap',
            }}>
              <AccentPicker accent={accent} setAccent={setAccent} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>Appearance</span>
                <ModeToggle mode={modePreference} setMode={setModePreference} />
              </div>
            </div>
          </div>
          
          {/* Quick Capture */}
          <QuickCapture />
          
          {/* Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginTop: '24px',
          }}>
            <StatCard label="Active Ideas" value="24" trend={12} icon="◉" />
            <StatCard label="Projects" value="8" trend={25} icon="▦" />
            <StatCard label="Completed" value="47" trend={8} icon="✓" />
            <StatCard label="Hours Saved" value="127.5" trend={15} icon="◔" />
          </div>
          
          {/* Kanban Preview */}
          <div style={{ marginTop: '32px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: 600,
                color: 'var(--text)',
                margin: 0,
              }}>Current Sprint</h2>
              <button style={{
                padding: '8px 16px',
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--primary)'}
              >
                View Board →
              </button>
            </div>
            
            <div style={{
              display: 'flex',
              gap: '12px',
              overflowX: 'auto',
              paddingBottom: '16px',
            }}>
              {kanbanData.map((col, i) => (
                <KanbanColumn key={i} {...col} />
              ))}
            </div>
          </div>
          
          {/* CSS Variables Display */}
          <div style={{
            marginTop: '32px',
            padding: '20px',
            background: 'var(--bg-secondary)',
            borderRadius: '12px',
            border: '1px solid var(--border-subtle)',
          }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--text)',
              margin: '0 0 16px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span style={{
                fontSize: '10px',
                padding: '2px 8px',
                background: 'var(--primary)',
                color: '#FFFFFF',
                borderRadius: '4px',
                fontWeight: 700,
              }}>DEV</span>
              CSS Custom Properties Architecture
            </h3>
            <div style={{
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: '12px',
              lineHeight: 1.8,
              color: 'var(--text-secondary)',
            }}>
              <div><span style={{ color: 'var(--text-muted)' }}>// Mode: </span><span style={{ color: 'var(--primary)' }}>{resolvedMode}</span></div>
              <div><span style={{ color: 'var(--text-muted)' }}>// Accent: </span><span style={{ color: 'var(--primary)' }}>{accentThemes[accent].name}</span></div>
              <div style={{ marginTop: '8px' }}>
                --primary: <span style={{ color: accentThemes[accent].primary }}>{accentThemes[accent].primary}</span>
              </div>
              <div>--bg: <span style={{ color: 'var(--text-muted)' }}>{modeThemes[resolvedMode].bg}</span></div>
              <div>--text: <span style={{ color: 'var(--text-muted)' }}>{modeThemes[resolvedMode].text}</span></div>
            </div>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}
