import { useState } from 'react';

// AutoFlow Mobile Views Mockup
// Phase 0.5 - Design Sprint
// Features: Mobile navigation, dashboard, kanban, card modal, forms

const accentThemes = {
  midnight: { primary: '#3B82F6', primaryHover: '#2563EB', primaryMuted: '#1E3A5F' },
  emerald: { primary: '#10B981', primaryHover: '#059669', primaryMuted: '#064E3B' },
  sunset: { primary: '#F59E0B', primaryHover: '#D97706', primaryMuted: '#78350F' },
  royal: { primary: '#8B5CF6', primaryHover: '#7C3AED', primaryMuted: '#4C1D95' },
  rose: { primary: '#EC4899', primaryHover: '#DB2777', primaryMuted: '#831843' },
  slate: { primary: '#64748B', primaryHover: '#475569', primaryMuted: '#1E293B' },
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
  };
  
  return <div style={cssVars}>{children}</div>;
}

function PhoneFrame({ children, label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{
        width: 320,
        height: 640,
        background: '#000',
        borderRadius: 40,
        padding: 12,
        boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
      }}>
        {/* Notch */}
        <div style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          borderRadius: 30,
          overflow: 'hidden',
          background: 'var(--bg)',
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 120,
            height: 28,
            background: '#000',
            borderRadius: '0 0 20px 20px',
            zIndex: 100,
          }} />
          <div style={{
            height: '100%',
            paddingTop: 28,
            overflow: 'hidden',
          }}>
            {children}
          </div>
        </div>
      </div>
      <span style={{
        fontSize: 13,
        fontWeight: 600,
        color: 'var(--text)',
        background: 'var(--bg-elevated)',
        padding: '6px 14px',
        borderRadius: 6,
        border: '1px solid var(--border-subtle)',
      }}>{label}</span>
    </div>
  );
}

// Mobile Dashboard View
function MobileDashboard() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 700,
            fontSize: 14,
          }}>A</div>
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>AutoFlow</span>
        </div>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: '#3B82F6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: 11,
          fontWeight: 600,
        }}>JC</div>
      </div>
      
      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
        {/* Quick Capture */}
        <div style={{
          background: 'var(--bg-elevated)',
          borderRadius: 10,
          padding: '12px 14px',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          border: '1px solid var(--border-subtle)',
        }}>
          <span>💡</span>
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Capture an idea...</span>
          <span style={{ marginLeft: 'auto', fontSize: 16 }}>🎤</span>
        </div>
        
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          {[
            { label: 'Ideas', value: 24, icon: '💡' },
            { label: 'Projects', value: 4, icon: '▦' },
            { label: 'Completed', value: 47, icon: '✓' },
            { label: 'Hours', value: 127, icon: '◔' },
          ].map(stat => (
            <div key={stat.label} style={{
              background: 'var(--bg-elevated)',
              borderRadius: 10,
              padding: 14,
              border: '1px solid var(--border-subtle)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{stat.label}</span>
                <span style={{ fontSize: 14 }}>{stat.icon}</span>
              </div>
              <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>{stat.value}</span>
            </div>
          ))}
        </div>
        
        {/* Active Projects */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Active Projects</span>
            <span style={{ fontSize: 12, color: 'var(--primary)' }}>View all</span>
          </div>
          {['Email Automation', 'Invoice Bot'].map((name, i) => (
            <div key={name} style={{
              background: 'var(--bg-elevated)',
              borderRadius: 8,
              padding: 12,
              marginBottom: 8,
              border: '1px solid var(--border-subtle)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 3, height: 24, background: i === 0 ? '#EF4444' : '#F59E0B', borderRadius: 2 }} />
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{name}</span>
              </div>
              <div style={{ height: 4, background: 'var(--bg-tertiary)', borderRadius: 2 }}>
                <div style={{ height: '100%', width: i === 0 ? '72%' : '45%', background: 'var(--primary)', borderRadius: 2 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Bottom Nav */}
      <div style={{
        padding: '8px 16px 20px',
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        justifyContent: 'space-around',
      }}>
        {[
          { icon: '◫', label: 'Home', active: true },
          { icon: '💡', label: 'Ideas' },
          { icon: '▦', label: 'Projects' },
          { icon: '⚙', label: 'Settings' },
        ].map(item => (
          <div key={item.label} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            opacity: item.active ? 1 : 0.5,
          }}>
            <span style={{ fontSize: 18, color: item.active ? 'var(--primary)' : 'var(--text-muted)' }}>{item.icon}</span>
            <span style={{ fontSize: 10, color: item.active ? 'var(--primary)' : 'var(--text-muted)' }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Mobile Kanban View
function MobileKanban() {
  const columns = [
    { name: 'Backlog', color: '#6366F1', cards: 3 },
    { name: 'In Progress', color: '#3B82F6', cards: 2 },
    { name: 'Done', color: '#22C55E', cards: 4 },
  ];
  
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <span style={{ fontSize: 18, color: 'var(--text-muted)' }}>←</span>
        <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', flex: 1 }}>Sprint Board</span>
        <span style={{ fontSize: 18, color: 'var(--text-muted)' }}>⋮</span>
      </div>
      
      {/* Horizontal Scroll Columns */}
      <div style={{
        flex: 1,
        display: 'flex',
        overflowX: 'auto',
        padding: 12,
        gap: 12,
      }}>
        {columns.map(col => (
          <div key={col.name} style={{
            width: 260,
            flexShrink: 0,
            background: 'var(--bg-secondary)',
            borderRadius: 10,
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* Column Header */}
            <div style={{
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              borderBottom: '1px solid var(--border-subtle)',
            }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: col.color }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{col.name}</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>{col.cards}</span>
            </div>
            
            {/* Cards */}
            <div style={{ padding: 8, flex: 1 }}>
              {[...Array(Math.min(col.cards, 3))].map((_, i) => (
                <div key={i} style={{
                  background: 'var(--bg-elevated)',
                  borderRadius: 8,
                  padding: 10,
                  marginBottom: 8,
                  border: '1px solid var(--border-subtle)',
                }}>
                  {/* Drag Handle */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 6,
                  }}>
                    <span style={{
                      width: 20,
                      height: 20,
                      background: 'var(--bg-tertiary)',
                      borderRadius: 4,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10,
                      color: 'var(--text-muted)',
                    }}>⋮⋮</span>
                    <span style={{
                      fontSize: 11,
                      padding: '2px 6px',
                      background: '#EC489920',
                      color: '#EC4899',
                      borderRadius: 3,
                    }}>design</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text)', fontWeight: 500 }}>
                    Task {i + 1} for {col.name}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Add Card */}
            <div style={{
              padding: '10px 12px',
              borderTop: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
              fontSize: 12,
            }}>
              + Add card
            </div>
          </div>
        ))}
      </div>
      
      {/* Bottom hint */}
      <div style={{
        padding: '12px 16px',
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        justifyContent: 'center',
        gap: 8,
      }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>← Swipe to scroll →</span>
      </div>
    </div>
  );
}

// Mobile Card Modal
function MobileCardModal() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <span style={{ fontSize: 18, color: 'var(--text-muted)' }}>×</span>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>AF-005 • In Progress</span>
        </div>
        <span style={{ fontSize: 18, color: 'var(--text-muted)' }}>⋮</span>
      </div>
      
      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
        {/* Title */}
        <h2 style={{
          margin: '0 0 12px 0',
          fontSize: 18,
          fontWeight: 700,
          color: 'var(--text)',
          lineHeight: 1.3,
        }}>Kanban board mockup with drag-drop</h2>
        
        {/* Labels */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          <span style={{ padding: '4px 8px', background: '#EC489920', color: '#EC4899', fontSize: 11, borderRadius: 4 }}>design</span>
          <span style={{ padding: '4px 8px', background: '#EF444420', color: '#EF4444', fontSize: 11, borderRadius: 4 }}>critical</span>
        </div>
        
        {/* Quick Actions */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 8,
          marginBottom: 20,
        }}>
          {[
            { icon: '◉', label: 'Members' },
            { icon: '◷', label: 'Due' },
            { icon: '☑', label: 'Checklist' },
            { icon: '✦', label: 'AI' },
          ].map(action => (
            <div key={action.label} style={{
              background: 'var(--bg-tertiary)',
              borderRadius: 8,
              padding: '12px 8px',
              textAlign: 'center',
            }}>
              <span style={{ fontSize: 16, display: 'block', marginBottom: 4 }}>{action.icon}</span>
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{action.label}</span>
            </div>
          ))}
        </div>
        
        {/* Description */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Description</div>
          <div style={{
            padding: 12,
            background: 'var(--bg-tertiary)',
            borderRadius: 8,
            fontSize: 12,
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
          }}>
            Create Trello-style kanban board mockup with emphasis on smooth drag-and-drop UX...
          </div>
        </div>
        
        {/* Checklist */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>Board Features</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>4/8</span>
          </div>
          <div style={{ height: 4, background: 'var(--bg-tertiary)', borderRadius: 2, marginBottom: 10 }}>
            <div style={{ height: '100%', width: '50%', background: 'var(--primary)', borderRadius: 2 }} />
          </div>
          {['Column layout ✓', 'Card components ✓', 'Drag preview ✓', 'Drop zones ✓', 'Animations'].map((item, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 0',
              borderBottom: i < 4 ? '1px solid var(--border-subtle)' : 'none',
            }}>
              <div style={{
                width: 18,
                height: 18,
                borderRadius: 4,
                border: i < 4 ? 'none' : '2px solid var(--border)',
                background: i < 4 ? 'var(--primary)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: 10,
              }}>{i < 4 && '✓'}</div>
              <span style={{
                fontSize: 12,
                color: i < 4 ? 'var(--text-muted)' : 'var(--text)',
                textDecoration: i < 4 ? 'line-through' : 'none',
              }}>{item.replace(' ✓', '')}</span>
            </div>
          ))}
        </div>
        
        {/* Comments */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 10 }}>Comments</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: '#3B82F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 10,
              fontWeight: 600,
              flexShrink: 0,
            }}>JC</div>
            <div style={{
              flex: 1,
              padding: 10,
              background: 'var(--bg-tertiary)',
              borderRadius: 8,
              fontSize: 12,
              color: 'var(--text-secondary)',
            }}>
              Focus on the insertion indicator - needs to be subtle but clear.
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>2h ago</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Comment Input */}
      <div style={{
        padding: '12px 16px 24px',
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        gap: 10,
      }}>
        <input
          placeholder="Add a comment..."
          style={{
            flex: 1,
            padding: '10px 14px',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border)',
            borderRadius: 20,
            color: 'var(--text)',
            fontSize: 13,
            outline: 'none',
          }}
        />
        <button style={{
          width: 38,
          height: 38,
          borderRadius: '50%',
          background: 'var(--primary)',
          border: 'none',
          color: 'white',
          fontSize: 14,
          cursor: 'pointer',
        }}>↑</button>
      </div>
    </div>
  );
}

// Mobile Form View
function MobileForm() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-subtle)',
        textAlign: 'center',
      }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 700,
          fontSize: 14,
          margin: '0 auto 8px',
        }}>A</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>AI & Automation Audit</div>
      </div>
      
      {/* Progress */}
      <div style={{
        padding: '12px 16px',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Question 2 of 6</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>33%</span>
        </div>
        <div style={{ height: 4, background: 'var(--bg-tertiary)', borderRadius: 2 }}>
          <div style={{ height: '100%', width: '33%', background: 'var(--primary)', borderRadius: 2 }} />
        </div>
      </div>
      
      {/* Question */}
      <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
        <div style={{
          width: 28,
          height: 28,
          borderRadius: 6,
          background: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: 12,
          fontWeight: 700,
          marginBottom: 12,
        }}>2</div>
        
        <h3 style={{
          margin: '0 0 8px 0',
          fontSize: 16,
          fontWeight: 600,
          color: 'var(--text)',
          lineHeight: 1.4,
        }}>Describe one process in your business that's a bit of a mess right now.</h3>
        
        <p style={{
          margin: '0 0 16px 0',
          fontSize: 12,
          color: 'var(--text-muted)',
          fontStyle: 'italic',
        }}>Don't worry about sounding negative — we're looking for improvement opportunities.</p>
        
        <textarea
          placeholder="e.g., Our invoice approval process involves 5 different people..."
          style={{
            width: '100%',
            minHeight: 140,
            padding: 14,
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            color: 'var(--text)',
            fontSize: 14,
            lineHeight: 1.5,
            resize: 'none',
            outline: 'none',
            fontFamily: 'inherit',
          }}
        />
        
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginTop: 8,
        }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Tip: More detail helps our AI</span>
        </div>
      </div>
      
      {/* Navigation */}
      <div style={{
        padding: '12px 16px 24px',
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        gap: 12,
      }}>
        <button style={{
          flex: 1,
          padding: '14px',
          background: 'var(--bg-tertiary)',
          border: 'none',
          borderRadius: 10,
          color: 'var(--text)',
          fontSize: 14,
          fontWeight: 500,
        }}>← Previous</button>
        <button style={{
          flex: 1,
          padding: '14px',
          background: 'var(--primary)',
          border: 'none',
          borderRadius: 10,
          color: 'white',
          fontSize: 14,
          fontWeight: 600,
        }}>Next →</button>
      </div>
    </div>
  );
}

export default function MobileViewsMockup() {
  const [mode, setMode] = useState('dark');
  const [accent, setAccent] = useState('midnight');
  const [activeView, setActiveView] = useState(0);
  
  const views = [
    { component: <MobileDashboard />, label: 'Dashboard' },
    { component: <MobileKanban />, label: 'Kanban Board' },
    { component: <MobileCardModal />, label: 'Card Modal' },
    { component: <MobileForm />, label: 'Form' },
  ];
  
  return (
    <ThemeProvider mode={mode} accent={accent}>
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: '40px 20px',
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: 40,
        }}>
          <h1 style={{
            margin: '0 0 8px 0',
            fontSize: 28,
            fontWeight: 700,
            color: 'var(--text)',
          }}>Mobile Responsive Views</h1>
          <p style={{
            margin: '0 0 24px 0',
            fontSize: 14,
            color: 'var(--text-muted)',
          }}>Touch-optimised layouts for iOS and Android</p>
          
          {/* View Selector */}
          <div style={{
            display: 'inline-flex',
            gap: 4,
            padding: 4,
            background: 'var(--bg-tertiary)',
            borderRadius: 10,
            marginBottom: 16,
          }}>
            {views.map((view, i) => (
              <button
                key={view.label}
                onClick={() => setActiveView(i)}
                style={{
                  padding: '8px 16px',
                  background: activeView === i ? 'var(--bg-elevated)' : 'transparent',
                  border: 'none',
                  borderRadius: 8,
                  color: activeView === i ? 'var(--text)' : 'var(--text-muted)',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >{view.label}</button>
            ))}
          </div>
          
          {/* Theme Controls */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8,
          }}>
            {Object.entries(accentThemes).map(([key, theme]) => (
              <button
                key={key}
                onClick={() => setAccent(key)}
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 6,
                  background: theme.primary,
                  border: accent === key ? '2px solid var(--text)' : '2px solid transparent',
                  cursor: 'pointer',
                }}
              />
            ))}
            <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 8px' }} />
            <button
              onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: 'var(--bg-tertiary)',
                border: 'none',
                color: 'var(--text)',
                cursor: 'pointer',
              }}
            >
              {mode === 'dark' ? '◐' : '○'}
            </button>
          </div>
        </div>
        
        {/* Phone Display */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
        }}>
          <PhoneFrame label={views[activeView].label}>
            {views[activeView].component}
          </PhoneFrame>
        </div>
        
        {/* Features List */}
        <div style={{
          maxWidth: 600,
          margin: '40px auto 0',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 12,
        }}>
          {[
            { icon: '📱', label: 'Touch-friendly drag handles' },
            { icon: '↔️', label: 'Horizontal scroll for Kanban' },
            { icon: '🎤', label: 'Voice capture support' },
            { icon: '📍', label: 'Bottom navigation pattern' },
            { icon: '↕️', label: 'Full-screen card modals' },
            { icon: '⚡', label: 'Optimised for PWA' },
          ].map(feature => (
            <div key={feature.label} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 16px',
              background: 'var(--bg-elevated)',
              borderRadius: 8,
              border: '1px solid var(--border-subtle)',
            }}>
              <span style={{ fontSize: 18 }}>{feature.icon}</span>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{feature.label}</span>
            </div>
          ))}
        </div>
        
        {/* Mockup label */}
        <div style={{
          position: 'fixed',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontSize: 12,
          color: 'var(--text-muted)',
        }}>
          <span><strong style={{ color: 'var(--primary)' }}>Mobile Views</strong> — Responsive layouts</span>
          <span style={{
            padding: '2px 8px',
            background: 'var(--primary)',
            color: 'white',
            borderRadius: 4,
            fontWeight: 600,
          }}>MOCKUP</span>
        </div>
      </div>
    </ThemeProvider>
  );
}
