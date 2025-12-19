import { useState } from 'react';

// AutoFlow Card Detail Modal Mockup
// Phase 0.5 - Design Sprint
// Features: Full card editing, checklists, comments, AI analysis, attachments

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

const labelOptions = [
  { id: 'l1', name: 'Design', color: '#EC4899' },
  { id: 'l2', name: 'Critical', color: '#EF4444' },
  { id: 'l3', name: 'Feature', color: '#3B82F6' },
  { id: 'l4', name: 'UI', color: '#10B981' },
  { id: 'l5', name: 'Backend', color: '#F59E0B' },
  { id: 'l6', name: 'Docs', color: '#64748B' },
];

const sampleCard = {
  id: 'AF-005',
  title: 'Kanban board mockup with drag-drop visuals',
  description: `Create Trello-style kanban board mockup with emphasis on smooth drag-and-drop UX.

## Requirements
- Ghost card preview while dragging
- Clear visual drop zones
- Insertion line indicator
- Column reordering
- Touch-friendly for mobile

## Notes
Reference Trello's implementation for animation timing and visual feedback patterns.`,
  columnName: 'Current Sprint',
  labels: ['l1', 'l2'],
  members: [
    { id: 'm1', name: 'Jon Cross', initials: 'JC' },
    { id: 'm2', name: 'AI Assistant', initials: 'AI' },
  ],
  dueDate: '2024-12-18',
  startDate: '2024-12-16',
  cover: null, // or { type: 'color', value: '#3B82F6' } or { type: 'image', value: 'url' }
  checklists: [
    {
      id: 'cl1',
      name: 'Board Features',
      items: [
        { id: 'i1', text: 'Column layout with coloured headers', done: true },
        { id: 'i2', text: 'Card components with labels/avatars', done: true },
        { id: 'i3', text: 'Drag ghost preview', done: true },
        { id: 'i4', text: 'Drop zone highlighting', done: true },
        { id: 'i5', text: 'Insertion line indicator', done: false, dueDate: '2024-12-17' },
        { id: 'i6', text: 'Column drag-to-reorder', done: false },
        { id: 'i7', text: 'Quick add card', done: false },
        { id: 'i8', text: 'Smooth animations (60fps)', done: false },
      ],
    },
  ],
  attachments: [
    { id: 'a1', name: 'trello-reference.gif', type: 'image', size: '2.4 MB', addedAt: '2024-12-16' },
    { id: 'a2', name: 'dnd-kit-docs.pdf', type: 'file', size: '156 KB', addedAt: '2024-12-16' },
  ],
  links: [
    { id: 'lk1', url: 'https://dndkit.com', title: 'dnd kit – Documentation', favicon: '📦' },
  ],
  comments: [
    {
      id: 'c1',
      author: { name: 'Jon Cross', initials: 'JC' },
      text: 'Focus on the insertion indicator - needs to be subtle but clear.',
      createdAt: '2024-12-16T10:30:00Z',
    },
    {
      id: 'c2',
      author: { name: 'AI Assistant', initials: 'AI' },
      text: 'Updated to use card-sized placeholder instead of a line. Much cleaner!',
      createdAt: '2024-12-16T14:45:00Z',
    },
  ],
  activity: [
    { id: 'act1', type: 'moved', from: 'Backlog', to: 'Current Sprint', at: '2024-12-16T09:00:00Z' },
    { id: 'act2', type: 'label_added', label: 'Critical', at: '2024-12-16T09:05:00Z' },
    { id: 'act3', type: 'checklist_item', text: 'Completed "Column layout"', at: '2024-12-16T11:00:00Z' },
  ],
  customFields: [
    { id: 'cf1', name: 'Complexity', type: 'dropdown', value: 'High' },
    { id: 'cf2', name: 'Estimated Hours', type: 'number', value: 16 },
    { id: 'cf3', name: 'Business Value', type: 'number', value: 10 },
  ],
  watching: true,
  aiAnalysis: {
    lastRun: '2024-12-16T08:00:00Z',
    complexity: 'high',
    estimatedHours: 16,
    businessValue: 10,
    suggestions: [
      'Consider using Framer Motion for smoother animations',
      'Add keyboard accessibility for drag operations',
      'Test touch interactions on mobile devices',
    ],
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

function Avatar({ initials, name, size = 32 }) {
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
  const colorIndex = initials.charCodeAt(0) % colors.length;
  
  return (
    <div 
      title={name}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: colors[colorIndex],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.4,
        fontWeight: 600,
        color: 'white',
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

function Label({ label, onRemove }) {
  const labelData = labelOptions.find(l => l.id === label) || { name: label, color: '#64748B' };
  
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '4px 10px',
      borderRadius: 4,
      background: labelData.color + '25',
      color: labelData.color,
      fontSize: 12,
      fontWeight: 600,
    }}>
      {labelData.name}
      {onRemove && (
        <button 
          onClick={onRemove}
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            padding: 0,
            fontSize: 14,
            lineHeight: 1,
            opacity: 0.7,
          }}
        >×</button>
      )}
    </span>
  );
}

function SidebarButton({ icon, label, onClick, active }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        width: '100%',
        padding: '8px 12px',
        background: active ? 'var(--primary-muted)' : 'var(--bg-tertiary)',
        border: 'none',
        borderRadius: 6,
        color: active ? 'var(--primary)' : 'var(--text-secondary)',
        fontSize: 13,
        fontWeight: 500,
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.1s ease',
      }}
    >
      <span style={{ fontSize: 14, width: 18, textAlign: 'center' }}>{icon}</span>
      {label}
    </button>
  );
}

function Section({ icon, title, children, onAdd, addLabel }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
      }}>
        <h3 style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          margin: 0,
          fontSize: 14,
          fontWeight: 600,
          color: 'var(--text)',
        }}>
          <span style={{ fontSize: 16 }}>{icon}</span>
          {title}
        </h3>
        {onAdd && (
          <button
            onClick={onAdd}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: 12,
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: 4,
            }}
          >
            + {addLabel || 'Add'}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function Checklist({ checklist, onToggle }) {
  const doneCount = checklist.items.filter(i => i.done).length;
  const progress = Math.round((doneCount / checklist.items.length) * 100);
  
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 8,
      }}>
        <span style={{ fontSize: 14 }}>☑</span>
        <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{checklist.name}</span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>
          {doneCount}/{checklist.items.length}
        </span>
      </div>
      
      {/* Progress bar */}
      <div style={{
        height: 4,
        background: 'var(--bg-tertiary)',
        borderRadius: 2,
        marginBottom: 12,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: progress === 100 ? '#22C55E' : 'var(--primary)',
          borderRadius: 2,
          transition: 'width 0.2s ease',
        }} />
      </div>
      
      {/* Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {checklist.items.map(item => (
          <div
            key={item.id}
            onClick={() => onToggle(checklist.id, item.id)}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              padding: '8px 10px',
              background: 'var(--bg-tertiary)',
              borderRadius: 6,
              cursor: 'pointer',
              transition: 'background 0.1s ease',
            }}
          >
            <div style={{
              width: 18,
              height: 18,
              borderRadius: 4,
              border: item.done ? 'none' : '2px solid var(--border)',
              background: item.done ? 'var(--primary)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 12,
              flexShrink: 0,
              marginTop: 1,
            }}>
              {item.done && '✓'}
            </div>
            <div style={{ flex: 1 }}>
              <span style={{
                fontSize: 13,
                color: item.done ? 'var(--text-muted)' : 'var(--text)',
                textDecoration: item.done ? 'line-through' : 'none',
              }}>
                {item.text}
              </span>
              {item.dueDate && (
                <span style={{
                  display: 'inline-block',
                  marginLeft: 8,
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  background: 'var(--bg-secondary)',
                  padding: '2px 6px',
                  borderRadius: 3,
                }}>
                  ◷ {item.dueDate}
                </span>
              )}
            </div>
          </div>
        ))}
        
        {/* Add item input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 10px',
          color: 'var(--text-muted)',
          fontSize: 13,
          cursor: 'pointer',
        }}>
          <span style={{ fontSize: 14 }}>+</span>
          Add an item
        </div>
      </div>
    </div>
  );
}

function Comment({ comment }) {
  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + 
           ' at ' + date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
      <Avatar initials={comment.author.initials} name={comment.author.name} size={32} />
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
          <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>
            {comment.author.name}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {formatTime(comment.createdAt)}
          </span>
        </div>
        <div style={{
          padding: '10px 12px',
          background: 'var(--bg-tertiary)',
          borderRadius: 8,
          fontSize: 13,
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
        }}>
          {comment.text}
        </div>
      </div>
    </div>
  );
}

function ActivityItem({ activity }) {
  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };
  
  const getMessage = () => {
    switch (activity.type) {
      case 'moved':
        return <>moved this card from <strong>{activity.from}</strong> to <strong>{activity.to}</strong></>;
      case 'label_added':
        return <>added label <strong>{activity.label}</strong></>;
      case 'checklist_item':
        return <>{activity.text}</>;
      default:
        return 'updated this card';
    }
  };
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontSize: 12,
      color: 'var(--text-muted)',
      padding: '6px 0',
    }}>
      <span style={{ fontSize: 10 }}>●</span>
      <span>{getMessage()}</span>
      <span style={{ marginLeft: 'auto' }}>{formatTime(activity.at)}</span>
    </div>
  );
}

function AIAnalysisPanel({ analysis }) {
  return (
    <div style={{
      background: 'var(--primary-muted)',
      borderRadius: 10,
      padding: 16,
      marginBottom: 24,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
      }}>
        <h3 style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          margin: 0,
          fontSize: 14,
          fontWeight: 600,
          color: 'rgba(255,255,255,0.95)',
        }}>
          <span>✦</span> AI Analysis
        </h3>
        <span style={{
          fontSize: 11,
          color: 'rgba(255,255,255,0.6)',
        }}>
          Last run: {new Date(analysis.lastRun).toLocaleDateString()}
        </span>
      </div>
      
      {/* Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 12,
        marginBottom: 16,
      }}>
        {[
          { label: 'Complexity', value: analysis.complexity, color: '#EF4444' },
          { label: 'Est. Hours', value: analysis.estimatedHours, color: '#F59E0B' },
          { label: 'Value', value: `${analysis.businessValue}/10`, color: '#22C55E' },
        ].map(metric => (
          <div key={metric.label} style={{
            background: 'rgba(0,0,0,0.2)',
            borderRadius: 6,
            padding: '10px 12px',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: 11,
              color: 'rgba(255,255,255,0.6)',
              marginBottom: 4,
              textTransform: 'uppercase',
            }}>{metric.label}</div>
            <div style={{
              fontSize: 16,
              fontWeight: 700,
              color: metric.color,
              textTransform: 'capitalize',
            }}>{metric.value}</div>
          </div>
        ))}
      </div>
      
      {/* Suggestions */}
      <div>
        <div style={{
          fontSize: 11,
          color: 'rgba(255,255,255,0.6)',
          marginBottom: 8,
          textTransform: 'uppercase',
        }}>Suggestions</div>
        {analysis.suggestions.map((suggestion, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 8,
            fontSize: 12,
            color: 'rgba(255,255,255,0.85)',
            marginBottom: 6,
            lineHeight: 1.4,
          }}>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>→</span>
            {suggestion}
          </div>
        ))}
      </div>
      
      <button style={{
        width: '100%',
        marginTop: 12,
        padding: '10px',
        background: 'rgba(255,255,255,0.15)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: 6,
        color: 'white',
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
      }}>
        ↻ Re-run Analysis
      </button>
    </div>
  );
}

function Attachment({ attachment }) {
  const icons = {
    image: '🖼',
    file: '📄',
    pdf: '📕',
  };
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '10px 12px',
      background: 'var(--bg-tertiary)',
      borderRadius: 8,
      marginBottom: 8,
    }}>
      <span style={{ fontSize: 20 }}>{icons[attachment.type] || '📎'}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13,
          fontWeight: 500,
          color: 'var(--text)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>{attachment.name}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {attachment.size} • Added {attachment.addedAt}
        </div>
      </div>
      <button style={{
        background: 'none',
        border: 'none',
        color: 'var(--text-muted)',
        cursor: 'pointer',
        padding: 4,
      }}>⋮</button>
    </div>
  );
}

function LinkPreview({ link }) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 12px',
        background: 'var(--bg-tertiary)',
        borderRadius: 8,
        marginBottom: 8,
        textDecoration: 'none',
        transition: 'background 0.1s ease',
      }}
    >
      <span style={{ fontSize: 18 }}>{link.favicon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13,
          fontWeight: 500,
          color: 'var(--primary)',
        }}>{link.title}</div>
        <div style={{
          fontSize: 11,
          color: 'var(--text-muted)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>{link.url}</div>
      </div>
    </a>
  );
}

function CustomField({ field }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 0',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{field.name}</span>
      <span style={{
        fontSize: 13,
        fontWeight: 500,
        color: 'var(--text)',
        padding: '4px 10px',
        background: 'var(--bg-tertiary)',
        borderRadius: 4,
      }}>{field.value}</span>
    </div>
  );
}

function CardModal({ card, onClose }) {
  const [checklists, setChecklists] = useState(card.checklists);
  const [showActivity, setShowActivity] = useState(false);
  
  const toggleChecklistItem = (checklistId, itemId) => {
    setChecklists(prev => prev.map(cl => {
      if (cl.id !== checklistId) return cl;
      return {
        ...cl,
        items: cl.items.map(item => 
          item.id === itemId ? { ...item, done: !item.done } : item
        ),
      };
    }));
  };
  
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: '40px 20px',
      overflowY: 'auto',
      zIndex: 1000,
    }}>
      <div style={{
        width: '100%',
        maxWidth: 900,
        background: 'var(--bg-secondary)',
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Cover */}
        {card.cover && card.cover.type === 'color' && (
          <div style={{
            height: 100,
            background: card.cover.value,
          }} />
        )}
        
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: card.cover ? 108 : 12,
            right: 12,
            width: 32,
            height: 32,
            borderRadius: 6,
            background: 'var(--bg-tertiary)',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: 18,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          ×
        </button>
        
        <div style={{
          display: 'flex',
          padding: 20,
          gap: 24,
        }}>
          {/* Main Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Header */}
            <div style={{ marginBottom: 20 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 8,
                color: 'var(--text-muted)',
                fontSize: 12,
              }}>
                <span>▦</span>
                <span>in list <strong style={{ color: 'var(--text-secondary)' }}>{card.columnName}</strong></span>
                <span style={{
                  marginLeft: 8,
                  padding: '2px 8px',
                  background: 'var(--bg-tertiary)',
                  borderRadius: 4,
                  fontFamily: 'monospace',
                }}>{card.id}</span>
              </div>
              <input
                type="text"
                defaultValue={card.title}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  fontSize: 20,
                  fontWeight: 700,
                  color: 'var(--text)',
                  outline: 'none',
                  padding: '4px 0',
                }}
              />
            </div>
            
            {/* Labels */}
            {card.labels.length > 0 && (
              <Section icon="◐" title="Labels">
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {card.labels.map(labelId => (
                    <Label key={labelId} label={labelId} onRemove={() => {}} />
                  ))}
                  <button style={{
                    padding: '4px 10px',
                    background: 'var(--bg-tertiary)',
                    border: '1px dashed var(--border)',
                    borderRadius: 4,
                    color: 'var(--text-muted)',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}>+ Add</button>
                </div>
              </Section>
            )}
            
            {/* Members */}
            <Section icon="◉" title="Members" onAdd={() => {}} addLabel="Add">
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {card.members.map(member => (
                  <Avatar key={member.id} initials={member.initials} name={member.name} size={36} />
                ))}
              </div>
            </Section>
            
            {/* Dates */}
            <Section icon="◷" title="Dates">
              <div style={{ display: 'flex', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Start</div>
                  <div style={{
                    padding: '6px 12px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 6,
                    fontSize: 13,
                    color: 'var(--text)',
                  }}>{card.startDate}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Due</div>
                  <div style={{
                    padding: '6px 12px',
                    background: '#F59E0B25',
                    borderRadius: 6,
                    fontSize: 13,
                    color: '#F59E0B',
                    fontWeight: 500,
                  }}>{card.dueDate}</div>
                </div>
              </div>
            </Section>
            
            {/* Description */}
            <Section icon="≡" title="Description">
              <div style={{
                padding: 12,
                background: 'var(--bg-tertiary)',
                borderRadius: 8,
                fontSize: 13,
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
              }}>
                {card.description}
              </div>
            </Section>
            
            {/* AI Analysis */}
            {card.aiAnalysis && <AIAnalysisPanel analysis={card.aiAnalysis} />}
            
            {/* Checklists */}
            <Section icon="☑" title="Checklists" onAdd={() => {}} addLabel="Add checklist">
              {checklists.map(checklist => (
                <Checklist 
                  key={checklist.id} 
                  checklist={checklist} 
                  onToggle={toggleChecklistItem}
                />
              ))}
            </Section>
            
            {/* Attachments */}
            {card.attachments.length > 0 && (
              <Section icon="◫" title="Attachments" onAdd={() => {}} addLabel="Add">
                {card.attachments.map(att => (
                  <Attachment key={att.id} attachment={att} />
                ))}
              </Section>
            )}
            
            {/* Links */}
            {card.links.length > 0 && (
              <Section icon="◈" title="Links" onAdd={() => {}} addLabel="Add">
                {card.links.map(link => (
                  <LinkPreview key={link.id} link={link} />
                ))}
              </Section>
            )}
            
            {/* Custom Fields */}
            {card.customFields.length > 0 && (
              <Section icon="▤" title="Custom Fields">
                {card.customFields.map(field => (
                  <CustomField key={field.id} field={field} />
                ))}
              </Section>
            )}
            
            {/* Comments */}
            <Section icon="◬" title="Comments">
              {/* Comment input */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <Avatar initials="JC" name="Jon Cross" size={32} />
                <div style={{ flex: 1 }}>
                  <textarea
                    placeholder="Write a comment..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      color: 'var(--text)',
                      fontSize: 13,
                      resize: 'none',
                      minHeight: 60,
                      outline: 'none',
                      fontFamily: 'inherit',
                    }}
                  />
                  <button style={{
                    marginTop: 8,
                    padding: '8px 16px',
                    background: 'var(--primary)',
                    border: 'none',
                    borderRadius: 6,
                    color: 'white',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}>Save</button>
                </div>
              </div>
              
              {card.comments.map(comment => (
                <Comment key={comment.id} comment={comment} />
              ))}
            </Section>
            
            {/* Activity */}
            <Section icon="◴" title="Activity">
              <button
                onClick={() => setShowActivity(!showActivity)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: 12,
                  cursor: 'pointer',
                  marginBottom: 8,
                  padding: 0,
                }}
              >
                {showActivity ? 'Hide' : 'Show'} details
              </button>
              {showActivity && card.activity.map(act => (
                <ActivityItem key={act.id} activity={act} />
              ))}
            </Section>
          </div>
          
          {/* Sidebar */}
          <div style={{ width: 180, flexShrink: 0 }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{
                fontSize: 11,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                marginBottom: 8,
                fontWeight: 600,
              }}>Add to card</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <SidebarButton icon="◉" label="Members" />
                <SidebarButton icon="◐" label="Labels" />
                <SidebarButton icon="☑" label="Checklist" />
                <SidebarButton icon="◷" label="Dates" />
                <SidebarButton icon="◫" label="Attachment" />
                <SidebarButton icon="◈" label="Link" />
                <SidebarButton icon="▤" label="Custom Field" />
              </div>
            </div>
            
            <div style={{ marginBottom: 20 }}>
              <div style={{
                fontSize: 11,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                marginBottom: 8,
                fontWeight: 600,
              }}>AI</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <SidebarButton icon="✦" label="Analyse" active />
                <SidebarButton icon="◇" label="Suggest Tasks" />
                <SidebarButton icon="◆" label="Estimate" />
              </div>
            </div>
            
            <div style={{ marginBottom: 20 }}>
              <div style={{
                fontSize: 11,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                marginBottom: 8,
                fontWeight: 600,
              }}>Actions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <SidebarButton icon="↗" label="Move" />
                <SidebarButton icon="◫" label="Copy" />
                <SidebarButton icon="◎" label="Make Template" />
                <SidebarButton icon={card.watching ? '◉' : '○'} label="Watch" active={card.watching} />
                <SidebarButton icon="▣" label="Cover" />
              </div>
            </div>
            
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <SidebarButton icon="▤" label="Archive" />
                <SidebarButton icon="◌" label="Share" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BoardHeader({ mode, setMode, accent, setAccent }) {
  return (
    <div style={{
      padding: '12px 20px',
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <div style={{
        fontSize: 16,
        fontWeight: 600,
        color: 'var(--text)',
      }}>AutoFlow Development</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {Object.entries(accentThemes).map(([key, theme]) => (
          <button
            key={key}
            onClick={() => setAccent(key)}
            style={{
              width: 18,
              height: 18,
              borderRadius: 4,
              background: theme.primary,
              border: accent === key ? '2px solid var(--text)' : '2px solid transparent',
              cursor: 'pointer',
            }}
          />
        ))}
        <button
          onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
          style={{
            marginLeft: 8,
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
  );
}

export default function CardDetailModalMockup() {
  const [mode, setMode] = useState('dark');
  const [accent, setAccent] = useState('midnight');
  const [showModal, setShowModal] = useState(true);
  
  return (
    <ThemeProvider mode={mode} accent={accent}>
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}>
        <BoardHeader mode={mode} setMode={setMode} accent={accent} setAccent={setAccent} />
        
        {/* Background board preview */}
        <div style={{
          padding: 24,
          display: 'flex',
          gap: 16,
          filter: showModal ? 'blur(2px)' : 'none',
          opacity: showModal ? 0.5 : 1,
          transition: 'all 0.2s ease',
        }}>
          {['Backlog', 'Current Sprint', 'In Progress', 'Done'].map(col => (
            <div key={col} style={{
              width: 260,
              background: 'var(--bg-secondary)',
              borderRadius: 10,
              padding: 12,
            }}>
              <div style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--text)',
                marginBottom: 12,
              }}>{col}</div>
              {[1, 2].map(i => (
                <div key={i} style={{
                  height: 60,
                  background: 'var(--bg-elevated)',
                  borderRadius: 8,
                  marginBottom: 8,
                }} />
              ))}
            </div>
          ))}
        </div>
        
        {/* Modal */}
        {showModal && (
          <CardModal card={sampleCard} onClose={() => setShowModal(false)} />
        )}
        
        {/* Reopen button */}
        {!showModal && (
          <button
            onClick={() => setShowModal(true)}
            style={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              padding: '12px 20px',
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}
          >
            Open Card Modal
          </button>
        )}
        
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
          zIndex: 1001,
        }}>
          <span><strong style={{ color: 'var(--primary)' }}>Card Detail Modal</strong> — Click sections to interact</span>
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
