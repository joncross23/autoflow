import { useState } from 'react';

// AutoFlow Dashboard Mockup
// Phase 0.5 - Design Sprint
// Features: Quick capture, stats, pipeline, projects, activity feed

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

// Sample data
const pipelineData = {
  new: 12,
  evaluating: 8,
  prioritised: 15,
  converting: 3,
  archived: 24,
};

const activeProjects = [
  {
    id: 'p1',
    name: 'Email Automation System',
    progress: 72,
    dueDate: '2024-12-20',
    tasks: { done: 18, total: 25 },
    members: ['JC', 'AI'],
    priority: 'high',
  },
  {
    id: 'p2',
    name: 'Invoice Processing Bot',
    progress: 45,
    dueDate: '2024-12-28',
    tasks: { done: 9, total: 20 },
    members: ['JC'],
    priority: 'medium',
  },
  {
    id: 'p3',
    name: 'Customer Onboarding Flow',
    progress: 88,
    dueDate: '2024-12-18',
    tasks: { done: 22, total: 25 },
    members: ['JC', 'AI', 'TM'],
    priority: 'high',
  },
  {
    id: 'p4',
    name: 'Report Generation System',
    progress: 15,
    dueDate: '2025-01-15',
    tasks: { done: 3, total: 20 },
    members: ['AI'],
    priority: 'low',
  },
];

const recentActivity = [
  { id: 1, type: 'idea', action: 'captured', title: 'Automate weekly team updates', time: '5m ago', icon: '💡' },
  { id: 2, type: 'task', action: 'completed', title: 'Set up email triggers', time: '23m ago', icon: '✓' },
  { id: 3, type: 'project', action: 'updated', title: 'Email Automation System', time: '1h ago', icon: '▦' },
  { id: 4, type: 'ai', action: 'analysed', title: '3 ideas evaluated', time: '2h ago', icon: '✦' },
  { id: 5, type: 'idea', action: 'converted', title: 'CRM data sync → Project', time: '3h ago', icon: '↗' },
  { id: 6, type: 'comment', action: 'added', title: 'on Invoice Processing Bot', time: '4h ago', icon: '◬' },
  { id: 7, type: 'task', action: 'completed', title: 'Design API endpoints', time: '5h ago', icon: '✓' },
  { id: 8, type: 'project', action: 'created', title: 'Report Generation System', time: '1d ago', icon: '▦' },
];

const completedStats = {
  thisWeek: 5,
  thisMonth: 18,
  total: 47,
  hoursSaved: 127.5,
  valueGenerated: 3825,
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

function Sidebar({ accent, currentPage }) {
  const navItems = [
    { icon: '◫', label: 'Dashboard', id: 'dashboard', active: true },
    { icon: '💡', label: 'Ideas', id: 'ideas', badge: 12 },
    { icon: '▦', label: 'Projects', id: 'projects', badge: 4 },
    { icon: '☑', label: 'Forms', id: 'forms' },
    { icon: '◔', label: 'Analytics', id: 'analytics' },
    { icon: '⚙', label: 'Settings', id: 'settings' },
  ];
  
  return (
    <div style={{
      width: 240,
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{
        padding: '20px 16px',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: `linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 700,
            fontSize: 16,
          }}>A</div>
          <span style={{
            fontSize: 18,
            fontWeight: 700,
            color: 'var(--text)',
            letterSpacing: '-0.02em',
          }}>AutoFlow</span>
        </div>
      </div>
      
      {/* Navigation */}
      <nav style={{ padding: '12px 8px', flex: 1 }}>
        {navItems.map(item => (
          <a
            key={item.id}
            href="#"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 12px',
              borderRadius: 8,
              marginBottom: 2,
              textDecoration: 'none',
              transition: 'all 0.15s ease',
              background: item.active ? 'var(--primary)' : 'transparent',
              color: item.active ? '#FFFFFF' : 'var(--text-secondary)',
            }}
          >
            <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{item.icon}</span>
            <span style={{ 
              flex: 1, 
              fontSize: 14, 
              fontWeight: item.active ? 600 : 500 
            }}>{item.label}</span>
            {item.badge && (
              <span style={{
                fontSize: 11,
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: 10,
                background: item.active ? 'rgba(255,255,255,0.2)' : 'var(--primary)',
                color: 'white',
              }}>{item.badge}</span>
            )}
          </a>
        ))}
      </nav>
      
      {/* Impact Summary */}
      <div style={{ padding: '16px' }}>
        <div style={{
          padding: '16px',
          background: 'var(--primary-muted)',
          borderRadius: 12,
        }}>
          <div style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.7)',
            marginBottom: 8,
            textTransform: 'uppercase',
          }}>Total Impact</div>
          <div style={{
            fontSize: 28,
            fontWeight: 700,
            color: '#FFFFFF',
            letterSpacing: '-0.02em',
          }}>{completedStats.hoursSaved}h</div>
          <div style={{
            fontSize: 13,
            color: 'rgba(255,255,255,0.7)',
            marginTop: 4,
          }}>≈ £{completedStats.valueGenerated.toLocaleString()} saved</div>
        </div>
      </div>
      
      {/* User */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: '#3B82F6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: 12,
          fontWeight: 600,
        }}>JC</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Jon Cross</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Admin</div>
        </div>
        <button style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          fontSize: 14,
        }}>⋮</button>
      </div>
    </div>
  );
}

function QuickCapture() {
  const [value, setValue] = useState('');
  
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      borderRadius: 12,
      padding: '16px 20px',
      border: '1px solid var(--border-subtle)',
      marginBottom: 24,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <span style={{ fontSize: 20 }}>💡</span>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Capture an idea... (⌘K)"
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            fontSize: 15,
            color: 'var(--text)',
            outline: 'none',
          }}
        />
        <span style={{
          padding: '4px 8px',
          background: 'var(--bg-tertiary)',
          borderRadius: 4,
          fontSize: 11,
          color: 'var(--text-muted)',
          fontFamily: 'monospace',
        }}>⌘K</span>
        <button style={{
          padding: '8px 16px',
          background: 'var(--primary)',
          border: 'none',
          borderRadius: 6,
          color: 'white',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          opacity: value ? 1 : 0.5,
        }}>Capture</button>
      </div>
    </div>
  );
}

function StatCard({ label, value, trend, icon, color }) {
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      borderRadius: 12,
      padding: '20px',
      border: '1px solid var(--border-subtle)',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
      }}>
        <span style={{
          fontSize: 13,
          color: 'var(--text-muted)',
          fontWeight: 500,
        }}>{label}</span>
        <span style={{
          fontSize: 18,
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: color ? `${color}20` : 'var(--primary-muted)',
          borderRadius: 8,
          color: color || 'rgba(255,255,255,0.9)',
        }}>{icon}</span>
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 10,
      }}>
        <span style={{
          fontSize: 32,
          fontWeight: 700,
          color: 'var(--text)',
          letterSpacing: '-0.02em',
        }}>{value}</span>
        {trend !== undefined && (
          <span style={{
            fontSize: 12,
            fontWeight: 600,
            color: trend >= 0 ? '#22C55E' : '#EF4444',
            background: trend >= 0 ? '#22C55E15' : '#EF444415',
            padding: '3px 8px',
            borderRadius: 6,
          }}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  );
}

function PipelineWidget() {
  const stages = [
    { key: 'new', label: 'New', color: '#3B82F6' },
    { key: 'evaluating', label: 'Evaluating', color: '#F59E0B' },
    { key: 'prioritised', label: 'Prioritised', color: '#8B5CF6' },
    { key: 'converting', label: 'Converting', color: '#10B981' },
  ];
  
  const total = stages.reduce((sum, s) => sum + pipelineData[s.key], 0);
  
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      borderRadius: 12,
      padding: '20px',
      border: '1px solid var(--border-subtle)',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
      }}>
        <h3 style={{
          margin: 0,
          fontSize: 15,
          fontWeight: 600,
          color: 'var(--text)',
        }}>Ideas Pipeline</h3>
        <span style={{
          fontSize: 12,
          color: 'var(--text-muted)',
        }}>{total} active</span>
      </div>
      
      {/* Progress bar */}
      <div style={{
        display: 'flex',
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 16,
      }}>
        {stages.map(stage => (
          <div key={stage.key} style={{
            flex: pipelineData[stage.key],
            background: stage.color,
          }} />
        ))}
      </div>
      
      {/* Legend */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '8px 16px',
      }}>
        {stages.map(stage => (
          <div key={stage.key} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <div style={{
              width: 10,
              height: 10,
              borderRadius: 3,
              background: stage.color,
            }} />
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1 }}>{stage.label}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{pipelineData[stage.key]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectCard({ project }) {
  const priorityColors = {
    high: '#EF4444',
    medium: '#F59E0B',
    low: '#22C55E',
  };
  
  const daysLeft = Math.ceil((new Date(project.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysLeft < 0;
  const isUrgent = daysLeft <= 3 && daysLeft >= 0;
  
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      borderRadius: 10,
      padding: '16px',
      border: '1px solid var(--border-subtle)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        marginBottom: 12,
      }}>
        <div style={{
          width: 4,
          height: 40,
          borderRadius: 2,
          background: priorityColors[project.priority],
          flexShrink: 0,
        }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{
            margin: '0 0 4px 0',
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--text)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>{project.name}</h4>
          <div style={{
            fontSize: 12,
            color: isOverdue ? '#EF4444' : isUrgent ? '#F59E0B' : 'var(--text-muted)',
          }}>
            {isOverdue ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d remaining`}
          </div>
        </div>
      </div>
      
      {/* Progress */}
      <div style={{ marginBottom: 12 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 6,
        }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Progress</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)' }}>{project.progress}%</span>
        </div>
        <div style={{
          height: 4,
          background: 'var(--bg-tertiary)',
          borderRadius: 2,
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${project.progress}%`,
            background: project.progress >= 80 ? '#22C55E' : 'var(--primary)',
            borderRadius: 2,
          }} />
        </div>
      </div>
      
      {/* Footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {project.tasks.done}/{project.tasks.total} tasks
        </span>
        <div style={{ display: 'flex' }}>
          {project.members.map((m, i) => (
            <div key={m} style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: ['#3B82F6', '#10B981', '#F59E0B'][i % 3],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              fontWeight: 600,
              color: 'white',
              marginLeft: i > 0 ? -8 : 0,
              border: '2px solid var(--bg-elevated)',
            }}>{m}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ActivityFeed() {
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      borderRadius: 12,
      padding: '20px',
      border: '1px solid var(--border-subtle)',
      height: '100%',
    }}>
      <h3 style={{
        margin: '0 0 16px 0',
        fontSize: 15,
        fontWeight: 600,
        color: 'var(--text)',
      }}>Recent Activity</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {recentActivity.map(item => (
          <div key={item.id} style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            padding: '10px 0',
            borderBottom: '1px solid var(--border-subtle)',
          }}>
            <span style={{
              fontSize: 14,
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--bg-tertiary)',
              borderRadius: 6,
            }}>{item.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 13,
                color: 'var(--text)',
                marginBottom: 2,
              }}>
                <span style={{ color: 'var(--text-muted)' }}>{item.action}</span>
                {' '}
                <span style={{ fontWeight: 500 }}>{item.title}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.time}</div>
            </div>
          </div>
        ))}
      </div>
      
      <button style={{
        width: '100%',
        marginTop: 12,
        padding: '10px',
        background: 'var(--bg-tertiary)',
        border: 'none',
        borderRadius: 6,
        color: 'var(--text-muted)',
        fontSize: 12,
        cursor: 'pointer',
      }}>View all activity →</button>
    </div>
  );
}

function CompletedWidget() {
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      borderRadius: 12,
      padding: '20px',
      border: '1px solid var(--border-subtle)',
    }}>
      <h3 style={{
        margin: '0 0 16px 0',
        fontSize: 15,
        fontWeight: 600,
        color: 'var(--text)',
      }}>Completed Projects</h3>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 12,
      }}>
        {[
          { label: 'This Week', value: completedStats.thisWeek },
          { label: 'This Month', value: completedStats.thisMonth },
          { label: 'All Time', value: completedStats.total },
        ].map(item => (
          <div key={item.label} style={{
            textAlign: 'center',
            padding: '12px',
            background: 'var(--bg-tertiary)',
            borderRadius: 8,
          }}>
            <div style={{
              fontSize: 24,
              fontWeight: 700,
              color: 'var(--text)',
              marginBottom: 4,
            }}>{item.value}</div>
            <div style={{
              fontSize: 11,
              color: 'var(--text-muted)',
            }}>{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Header({ mode, setMode, accent, setAccent }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 24,
    }}>
      <div>
        <h1 style={{
          margin: 0,
          fontSize: 28,
          fontWeight: 700,
          color: 'var(--text)',
          letterSpacing: '-0.02em',
        }}>Dashboard</h1>
        <p style={{
          margin: '6px 0 0 0',
          fontSize: 14,
          color: 'var(--text-muted)',
        }}>Welcome back, Jon. Here's your automation overview.</p>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
              transition: 'transform 0.1s ease',
              transform: accent === key ? 'scale(1.1)' : 'scale(1)',
            }}
          />
        ))}
        <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 8px' }} />
        <button
          onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'var(--bg-tertiary)',
            border: 'none',
            color: 'var(--text)',
            cursor: 'pointer',
            fontSize: 16,
          }}
        >
          {mode === 'dark' ? '◐' : '○'}
        </button>
      </div>
    </div>
  );
}

export default function DashboardMockup() {
  const [mode, setMode] = useState('dark');
  const [accent, setAccent] = useState('midnight');
  
  return (
    <ThemeProvider mode={mode} accent={accent}>
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex',
      }}>
        <Sidebar accent={accent} />
        
        <main style={{
          flex: 1,
          padding: '24px 32px',
          overflowY: 'auto',
        }}>
          <Header mode={mode} setMode={setMode} accent={accent} setAccent={setAccent} />
          
          {/* Quick Capture */}
          <QuickCapture />
          
          {/* Stats Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 16,
            marginBottom: 24,
          }}>
            <StatCard 
              label="Active Ideas" 
              value={Object.values(pipelineData).reduce((a, b) => a + b, 0) - pipelineData.archived} 
              trend={12} 
              icon="💡"
              color="#3B82F6"
            />
            <StatCard 
              label="Active Projects" 
              value={activeProjects.length} 
              trend={25} 
              icon="▦"
              color="#8B5CF6"
            />
            <StatCard 
              label="Completed" 
              value={completedStats.total} 
              trend={8} 
              icon="✓"
              color="#22C55E"
            />
            <StatCard 
              label="Hours Saved" 
              value={completedStats.hoursSaved} 
              trend={15} 
              icon="◔"
              color="#F59E0B"
            />
          </div>
          
          {/* Main Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 340px',
            gap: 24,
          }}>
            {/* Left Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Pipeline + Completed Row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 16,
              }}>
                <PipelineWidget />
                <CompletedWidget />
              </div>
              
              {/* Active Projects */}
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 16,
                }}>
                  <h3 style={{
                    margin: 0,
                    fontSize: 15,
                    fontWeight: 600,
                    color: 'var(--text)',
                  }}>Active Projects</h3>
                  <button style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}>View all →</button>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 12,
                }}>
                  {activeProjects.map(project => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              </div>
            </div>
            
            {/* Right Column - Activity Feed */}
            <ActivityFeed />
          </div>
        </main>
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
        zIndex: 100,
      }}>
        <span><strong style={{ color: 'var(--primary)' }}>Dashboard</strong> — Full layout with widgets</span>
        <span style={{
          padding: '2px 8px',
          background: 'var(--primary)',
          color: 'white',
          borderRadius: 4,
          fontWeight: 600,
        }}>MOCKUP</span>
      </div>
    </ThemeProvider>
  );
}
