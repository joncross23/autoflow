import { useState, useRef, useEffect } from 'react';

// AutoFlow Kanban Board Mockup
// Phase 0.5 - Design Sprint
// Features: Working drag-drop, ghost cards, insertion lines, column reordering

const accentThemes = {
  midnight: {
    name: 'Midnight Blue',
    primary: '#3B82F6',
    primaryHover: '#2563EB',
    primaryMuted: '#1E3A5F',
  },
  emerald: {
    name: 'Emerald Green',
    primary: '#10B981',
    primaryHover: '#059669',
    primaryMuted: '#064E3B',
  },
  sunset: {
    name: 'Sunset Orange',
    primary: '#F59E0B',
    primaryHover: '#D97706',
    primaryMuted: '#78350F',
  },
  royal: {
    name: 'Royal Purple',
    primary: '#8B5CF6',
    primaryHover: '#7C3AED',
    primaryMuted: '#4C1D95',
  },
  rose: {
    name: 'Rose Pink',
    primary: '#EC4899',
    primaryHover: '#DB2777',
    primaryMuted: '#831843',
  },
  slate: {
    name: 'Slate Grey',
    primary: '#64748B',
    primaryHover: '#475569',
    primaryMuted: '#1E293B',
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

const labelColors = {
  design: { bg: '#EC489920', text: '#EC4899' },
  ui: { bg: '#10B98120', text: '#10B981' },
  feature: { bg: '#3B82F620', text: '#3B82F6' },
  critical: { bg: '#EF444420', text: '#EF4444' },
  docs: { bg: '#64748B20', text: '#64748B' },
  ai: { bg: '#8B5CF620', text: '#8B5CF6' },
  phase: { bg: '#F59E0B20', text: '#F59E0B' },
};

const createInitialColumns = () => [
  {
    id: 'backlog',
    title: 'Backlog',
    color: '#6366F1',
    cards: [
      { id: 'c1', title: 'Voice-to-text capture for mobile', labels: ['feature', 'phase'], dueDate: 'Jan 15', assignees: ['JC'] },
      { id: 'c2', title: 'Calendar view for cards', labels: ['feature'], assignees: ['JC', 'AI'] },
      { id: 'c3', title: 'Card dependencies (blocked by)', labels: ['feature'], dueDate: 'Jan 20' },
    ],
  },
  {
    id: 'sprint',
    title: 'Current Sprint',
    color: '#F59E0B',
    cards: [
      { id: 'c4', title: 'Theme system with dark mode default', labels: ['design', 'ui'], progress: 100, assignees: ['JC'] },
      { id: 'c5', title: 'Kanban board mockup with drag-drop', labels: ['design', 'critical'], progress: 60, assignees: ['JC', 'AI'] },
      { id: 'c6', title: 'Card detail modal mockup', labels: ['design'], progress: 0 },
    ],
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    color: '#3B82F6',
    wipLimit: 3,
    cards: [
      { id: 'c7', title: 'Colour theme selector component', labels: ['ui'], progress: 85, assignees: ['AI'] },
      { id: 'c8', title: 'Dashboard layout mockup', labels: ['design'], progress: 25, dueDate: 'Dec 18', assignees: ['JC'] },
    ],
  },
  {
    id: 'review',
    title: 'Review / QA',
    color: '#8B5CF6',
    cards: [
      { id: 'c9', title: 'Project bootstrap documentation', labels: ['docs'], assignees: ['JC'] },
    ],
  },
  {
    id: 'done',
    title: 'Done',
    color: '#22C55E',
    cards: [
      { id: 'c10', title: 'Initial requirements gathering', labels: ['docs'], assignees: ['JC', 'AI'] },
      { id: 'c11', title: 'Technology stack decisions', labels: ['docs'] },
    ],
  },
];

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

function Avatar({ initials, size = 24 }) {
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
  const colorIndex = initials.charCodeAt(0) % colors.length;
  
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: colors[colorIndex],
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: size * 0.45,
      fontWeight: 600,
      color: 'white',
      border: '2px solid var(--bg-elevated)',
      marginLeft: size > 20 ? 0 : -8,
      flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

function Card({ card, isDragging, isGhost, isDragActive }) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Disable hover effects when any drag is active
  const showHover = isHovered && !isDragActive && !isGhost;
  
  return (
    <div
      onMouseEnter={() => !isDragging && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: isGhost ? 'var(--bg-tertiary)' : 'var(--bg-elevated)',
        borderRadius: 10,
        padding: 12,
        border: `1px solid ${showHover ? 'var(--primary)' : 'var(--border-subtle)'}`,
        cursor: isDragging ? 'grabbing' : 'grab',
        transition: isDragging ? 'none' : 'all 0.12s ease-out',
        transform: isDragging ? 'rotate(1.5deg)' : (showHover ? 'translateY(-1px)' : 'none'),
        boxShadow: isDragging 
          ? '0 8px 24px rgba(0,0,0,0.25)'
          : showHover 
            ? '0 4px 8px rgba(0,0,0,0.1)' 
            : 'none',
        opacity: isGhost ? 0.4 : 1,
        userSelect: 'none',
      }}
    >
      {/* Labels */}
      {card.labels && card.labels.length > 0 && (
        <div style={{ display: 'flex', gap: 4, marginBottom: 8, flexWrap: 'wrap' }}>
          {card.labels.map((label, i) => (
            <span key={i} style={{
              fontSize: 10,
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 4,
              background: isGhost ? 'var(--border)' : (labelColors[label]?.bg || '#64748B20'),
              color: isGhost ? 'var(--text-muted)' : (labelColors[label]?.text || '#64748B'),
            }}>
              {label}
            </span>
          ))}
        </div>
      )}
      
      {/* Title */}
      <div style={{
        fontSize: 13,
        fontWeight: 500,
        color: isGhost ? 'var(--text-muted)' : 'var(--text)',
        lineHeight: 1.4,
        marginBottom: (card.progress !== undefined || card.dueDate || card.assignees) ? 10 : 0,
      }}>
        {card.title}
      </div>
      
      {/* Progress bar */}
      {card.progress !== undefined && (
        <div style={{ marginBottom: 8 }}>
          <div style={{
            height: 4,
            background: isGhost ? 'var(--border)' : 'var(--bg-tertiary)',
            borderRadius: 2,
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${card.progress}%`,
              background: isGhost ? 'var(--text-muted)' : (card.progress === 100 ? '#22C55E' : 'var(--primary)'),
              borderRadius: 2,
            }} />
          </div>
        </div>
      )}
      
      {/* Footer */}
      {(card.dueDate || card.assignees) && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          {card.dueDate ? (
            <span style={{
              fontSize: 11,
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}>
              <span>◷</span> {card.dueDate}
            </span>
          ) : <span />}
          
          {card.assignees && (
            <div style={{ display: 'flex', paddingLeft: 8 }}>
              {card.assignees.map((a, i) => (
                <Avatar key={i} initials={a} size={22} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DropPlaceholder() {
  return (
    <div style={{
      height: 60,
      background: 'var(--bg-tertiary)',
      borderRadius: 10,
      border: '2px dashed var(--border)',
      margin: '4px 0',
      opacity: 0.6,
    }} />
  );
}

function Column({ 
  column, 
  isDragOver, 
  isBeingDragged,
  insertIndex,
  onCardMouseDown,
  onColumnMouseDown,
  draggingCardId,
  isDragActive,
  sourceColumnId,
  sourceCardIndex,
}) {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardText, setNewCardText] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  
  const isOverLimit = column.wipLimit && column.cards.length >= column.wipLimit;
  
  // Don't show placeholder if we're dropping card back to same position
  const isSourceColumn = column.id === sourceColumnId;
  const shouldShowPlaceholder = (index) => {
    if (insertIndex !== index) return false;
    if (!isSourceColumn) return true;
    // In source column, don't show if dropping at same position
    // (insertIndex === sourceCardIndex means before the card, 
    //  insertIndex === sourceCardIndex + 1 means after, both are "same position")
    return insertIndex !== sourceCardIndex && insertIndex !== sourceCardIndex + 1;
  };
  
  return (
    <div
      data-column-id={column.id}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        minWidth: 280,
        maxWidth: 280,
        background: 'var(--bg-secondary)',
        borderRadius: 12,
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 'calc(100vh - 180px)',
        transition: isBeingDragged ? 'none' : 'all 0.15s ease-out',
        transform: isBeingDragged ? 'rotate(1deg)' : 'none',
        boxShadow: isBeingDragged ? '0 12px 28px rgba(0,0,0,0.2)' : 'none',
        border: '2px solid transparent',
        opacity: isBeingDragged ? 0.95 : 1,
      }}
    >
      {/* Column Header */}
      <div
        onMouseDown={(e) => onColumnMouseDown(e, column.id)}
        style={{
          padding: '12px 14px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          cursor: 'grab',
          userSelect: 'none',
        }}
      >
        <div style={{
          width: 12,
          height: 12,
          borderRadius: 3,
          background: column.color,
          flexShrink: 0,
        }} />
        <span style={{
          fontSize: 14,
          fontWeight: 600,
          color: 'var(--text)',
          flex: 1,
        }}>{column.title}</span>
        <span style={{
          fontSize: 12,
          color: isOverLimit ? '#EF4444' : 'var(--text-muted)',
          fontWeight: isOverLimit ? 600 : 400,
        }}>
          {column.cards.length}
          {column.wipLimit && `/${column.wipLimit}`}
        </span>
        <button style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: 4,
          fontSize: 14,
          opacity: isHovered ? 1 : 0,
          pointerEvents: isHovered ? 'auto' : 'none',
          width: 20,
        }}>⋮</button>
      </div>
      
      {/* Cards Container */}
      <div 
        data-cards-container={column.id}
        style={{
          padding: 8,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          flex: 1,
          overflowY: 'auto',
          minHeight: 100,
        }}
      >
        {column.cards.map((card, index) => (
          <div key={card.id} data-card-index={index}>
            {shouldShowPlaceholder(index) && <DropPlaceholder />}
            <div onMouseDown={(e) => onCardMouseDown(e, card, column.id, index)}>
              <Card
                card={card}
                isDragging={false}
                isGhost={draggingCardId === card.id}
                isDragActive={isDragActive}
              />
            </div>
          </div>
        ))}
        {shouldShowPlaceholder(column.cards.length) && <DropPlaceholder />}
        
        {/* Quick Add Card */}
        {isAddingCard ? (
          <div style={{
            background: 'var(--bg-elevated)',
            borderRadius: 10,
            padding: 12,
            border: '1px solid var(--primary)',
            boxShadow: '0 0 0 3px var(--primary-muted)',
          }}>
            <textarea
              autoFocus
              value={newCardText}
              onChange={(e) => setNewCardText(e.target.value)}
              placeholder="Enter card title..."
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: 'var(--text)',
                fontSize: 13,
                resize: 'none',
                outline: 'none',
                fontFamily: 'inherit',
                minHeight: 60,
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  setIsAddingCard(false);
                  setNewCardText('');
                }
                if (e.key === 'Escape') {
                  setIsAddingCard(false);
                  setNewCardText('');
                }
              }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button
                onClick={() => { setIsAddingCard(false); setNewCardText(''); }}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  background: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >Add Card</button>
              <button
                onClick={() => { setIsAddingCard(false); setNewCardText(''); }}
                style={{
                  padding: '8px 12px',
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >Cancel</button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingCard(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 12px',
              background: 'transparent',
              border: '1px dashed var(--border)',
              borderRadius: 10,
              color: 'var(--text-muted)',
              fontSize: 13,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.color = 'var(--primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            <span style={{ fontSize: 16 }}>+</span> Add card
          </button>
        )}
      </div>
    </div>
  );
}

function DragPreview({ card, position }) {
  if (!card || !position) return null;
  
  return (
    <div style={{
      position: 'fixed',
      left: position.x - 140,
      top: position.y - 40,
      width: 280,
      pointerEvents: 'none',
      zIndex: 10000,
    }}>
      <Card card={card} isDragging={true} />
    </div>
  );
}

function ColumnDragPreview({ column, position }) {
  if (!column || !position) return null;
  
  return (
    <div style={{
      position: 'fixed',
      left: position.x - 140,
      top: position.y - 24,
      width: 280,
      pointerEvents: 'none',
      zIndex: 10000,
    }}>
      <div style={{
        background: 'var(--bg-secondary)',
        borderRadius: 12,
        padding: '12px 14px',
        border: '1px solid var(--border)',
        boxShadow: '0 12px 28px rgba(0,0,0,0.2)',
        transform: 'rotate(1deg)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <div style={{
          width: 12,
          height: 12,
          borderRadius: 3,
          background: column.color,
        }} />
        <span style={{
          fontSize: 14,
          fontWeight: 600,
          color: 'var(--text)',
        }}>{column.title}</span>
        <span style={{
          fontSize: 12,
          color: 'var(--text-muted)',
          marginLeft: 'auto',
        }}>{column.cards.length} cards</span>
      </div>
    </div>
  );
}

function BoardHeader({ mode, setMode, accent, setAccent }) {
  return (
    <div style={{
      padding: '16px 24px',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'var(--bg-secondary)',
      flexWrap: 'wrap',
      gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button style={{
          background: 'var(--bg-tertiary)',
          border: 'none',
          color: 'var(--text-secondary)',
          padding: '8px 12px',
          borderRadius: 8,
          cursor: 'pointer',
          fontSize: 14,
        }}>← Back</button>
        <div>
          <h1 style={{
            fontSize: 20,
            fontWeight: 700,
            color: 'var(--text)',
            margin: 0,
            letterSpacing: '-0.02em',
          }}>AutoFlow Development</h1>
          <p style={{
            fontSize: 12,
            color: 'var(--text-muted)',
            margin: '4px 0 0 0',
          }}>Phase 0.5 — Design Sprint</p>
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        {/* View toggles */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-tertiary)',
          borderRadius: 8,
          padding: 2,
        }}>
          {['Board', 'Table', 'Timeline'].map((view, i) => (
            <button key={view} style={{
              padding: '6px 12px',
              background: i === 0 ? 'var(--bg-elevated)' : 'transparent',
              border: 'none',
              borderRadius: 6,
              color: i === 0 ? 'var(--text)' : 'var(--text-muted)',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
            }}>{view}</button>
          ))}
        </div>
        
        {/* Filter */}
        <button style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 12px',
          background: 'var(--bg-tertiary)',
          border: 'none',
          borderRadius: 8,
          color: 'var(--text-secondary)',
          fontSize: 12,
          cursor: 'pointer',
        }}>
          <span>◇</span> Filter
        </button>
        
        {/* Theme selector */}
        <div style={{ display: 'flex', gap: 4 }}>
          {Object.entries(accentThemes).map(([key, theme]) => (
            <button
              key={key}
              onClick={() => setAccent(key)}
              style={{
                width: 20,
                height: 20,
                borderRadius: 4,
                background: theme.primary,
                border: accent === key ? '2px solid var(--text)' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'transform 0.1s',
                transform: accent === key ? 'scale(1.1)' : 'scale(1)',
              }}
            />
          ))}
        </div>
        
        {/* Mode toggle */}
        <button
          onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'var(--bg-tertiary)',
            border: 'none',
            color: 'var(--text)',
            fontSize: 16,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {mode === 'dark' ? '◐' : '○'}
        </button>
      </div>
    </div>
  );
}

function DragInstructions() {
  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: '12px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      zIndex: 100,
    }}>
      <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>
        <strong style={{ color: 'var(--primary)' }}>Try it:</strong> Drag cards between columns • Drag column headers to reorder
      </span>
      <span style={{
        fontSize: 11,
        padding: '4px 8px',
        background: 'var(--primary)',
        color: 'white',
        borderRadius: 4,
        fontWeight: 600,
      }}>MOCKUP</span>
    </div>
  );
}

export default function AutoFlowKanbanMockup() {
  const [mode, setMode] = useState('dark');
  const [accent, setAccent] = useState('midnight');
  const [columns, setColumns] = useState(createInitialColumns);
  
  // Drag state
  const [dragType, setDragType] = useState(null); // 'card' | 'column' | null
  const [draggingCard, setDraggingCard] = useState(null);
  const [draggingColumn, setDraggingColumn] = useState(null);
  const [sourceColumnId, setSourceColumnId] = useState(null);
  const [sourceCardIndex, setSourceCardIndex] = useState(null);
  const [mousePos, setMousePos] = useState(null);
  const [dropTarget, setDropTarget] = useState({ columnId: null, insertIndex: null });
  const [columnInsertIndex, setColumnInsertIndex] = useState(null);

  // Card drag handlers
  const handleCardMouseDown = (e, card, columnId, cardIndex) => {
    e.preventDefault();
    setDragType('card');
    setDraggingCard(card);
    setSourceColumnId(columnId);
    setSourceCardIndex(cardIndex);
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  // Column drag handlers  
  const handleColumnMouseDown = (e, columnId) => {
    e.preventDefault();
    const column = columns.find(c => c.id === columnId);
    setDragType('column');
    setDraggingColumn(column);
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  // Global mouse handlers
  useEffect(() => {
    if (!dragType) return;

    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      
      if (dragType === 'card') {
        // Find which column we're over
        const columnElements = document.querySelectorAll('[data-column-id]');
        let foundColumn = null;
        let foundIndex = null;
        
        columnElements.forEach(colEl => {
          const rect = colEl.getBoundingClientRect();
          if (e.clientX >= rect.left && e.clientX <= rect.right) {
            foundColumn = colEl.getAttribute('data-column-id');
            
            // Find insert position within column
            const cardsContainer = colEl.querySelector('[data-cards-container]');
            if (cardsContainer) {
              const cardEls = cardsContainer.querySelectorAll('[data-card-index]');
              foundIndex = cardEls.length; // Default to end
              
              for (let i = 0; i < cardEls.length; i++) {
                const cardRect = cardEls[i].getBoundingClientRect();
                const cardMidY = cardRect.top + cardRect.height / 2;
                if (e.clientY < cardMidY) {
                  foundIndex = i;
                  break;
                }
              }
            }
          }
        });
        
        setDropTarget({ columnId: foundColumn, insertIndex: foundIndex });
      }
      
      if (dragType === 'column') {
        // Find column insert position
        const columnElements = document.querySelectorAll('[data-column-id]');
        let insertIdx = columns.length;
        
        for (let i = 0; i < columnElements.length; i++) {
          const rect = columnElements[i].getBoundingClientRect();
          const midX = rect.left + rect.width / 2;
          if (e.clientX < midX) {
            insertIdx = i;
            break;
          }
        }
        
        setColumnInsertIndex(insertIdx);
      }
    };

    const handleMouseUp = () => {
      // Perform the drop
      if (dragType === 'card' && draggingCard && dropTarget.columnId) {
        setColumns(prev => {
          const newColumns = prev.map(col => ({
            ...col,
            cards: col.cards.filter(c => c.id !== draggingCard.id)
          }));
          
          const targetColIndex = newColumns.findIndex(c => c.id === dropTarget.columnId);
          if (targetColIndex !== -1) {
            const insertAt = dropTarget.insertIndex ?? newColumns[targetColIndex].cards.length;
            newColumns[targetColIndex].cards.splice(insertAt, 0, draggingCard);
          }
          
          return newColumns;
        });
      }
      
      if (dragType === 'column' && draggingColumn && columnInsertIndex !== null) {
        setColumns(prev => {
          const newColumns = [...prev];
          const currentIndex = newColumns.findIndex(c => c.id === draggingColumn.id);
          if (currentIndex !== -1 && currentIndex !== columnInsertIndex) {
            const [removed] = newColumns.splice(currentIndex, 1);
            const adjustedIndex = columnInsertIndex > currentIndex ? columnInsertIndex - 1 : columnInsertIndex;
            newColumns.splice(adjustedIndex, 0, removed);
          }
          return newColumns;
        });
      }
      
      // Reset all drag state
      setDragType(null);
      setDraggingCard(null);
      setDraggingColumn(null);
      setSourceColumnId(null);
      setSourceCardIndex(null);
      setMousePos(null);
      setDropTarget({ columnId: null, insertIndex: null });
      setColumnInsertIndex(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragType, draggingCard, draggingColumn, dropTarget, columnInsertIndex, columns]);

  return (
    <ThemeProvider mode={mode} accent={accent}>
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--text)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        transition: 'background 0.3s ease, color 0.3s ease',
        cursor: dragType ? 'grabbing' : 'default',
      }}>
        <BoardHeader 
          mode={mode} 
          setMode={setMode} 
          accent={accent} 
          setAccent={setAccent} 
        />
        
        {/* Board Area */}
        <div style={{
          flex: 1,
          padding: 24,
          overflowX: 'auto',
        }}>
          <div style={{
            display: 'flex',
            gap: 16,
            minWidth: 'max-content',
            alignItems: 'flex-start',
          }}>
            {columns.map((column, colIndex) => (
              <div key={column.id} style={{ display: 'flex', alignItems: 'flex-start' }}>
                {/* Column insert indicator */}
                {dragType === 'column' && columnInsertIndex === colIndex && draggingColumn?.id !== column.id && (
                  <div style={{
                    width: 3,
                    alignSelf: 'stretch',
                    background: 'var(--primary)',
                    borderRadius: 2,
                    marginRight: 8,
                    minHeight: 200,
                    opacity: 0.7,
                  }} />
                )}
                <Column
                  column={column}
                  isDragOver={dragType === 'card' && dropTarget.columnId === column.id}
                  isBeingDragged={dragType === 'column' && draggingColumn?.id === column.id}
                  insertIndex={dragType === 'card' && dropTarget.columnId === column.id ? dropTarget.insertIndex : null}
                  onCardMouseDown={handleCardMouseDown}
                  onColumnMouseDown={handleColumnMouseDown}
                  draggingCardId={draggingCard?.id}
                  isDragActive={dragType === 'card'}
                  sourceColumnId={sourceColumnId}
                  sourceCardIndex={sourceCardIndex}
                />
              </div>
            ))}
            
            {/* Column insert indicator at end */}
            {dragType === 'column' && columnInsertIndex === columns.length && (
              <div style={{
                width: 3,
                alignSelf: 'stretch',
                background: 'var(--primary)',
                borderRadius: 2,
                minHeight: 200,
                opacity: 0.7,
              }} />
            )}
            
            {/* Add Column Button */}
            {!dragType && (
              <button style={{
                minWidth: 280,
                height: 48,
                background: 'var(--bg-secondary)',
                border: '2px dashed var(--border)',
                borderRadius: 12,
                color: 'var(--text-muted)',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all 0.15s ease',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.color = 'var(--primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
              >
                <span style={{ fontSize: 18 }}>+</span> Add Column
              </button>
            )}
          </div>
        </div>
        
        {/* Floating drag previews */}
        {dragType === 'card' && draggingCard && mousePos && (
          <DragPreview card={draggingCard} position={mousePos} />
        )}
        {dragType === 'column' && draggingColumn && mousePos && (
          <ColumnDragPreview column={draggingColumn} position={mousePos} />
        )}
        
        <DragInstructions />
      </div>
    </ThemeProvider>
  );
}
