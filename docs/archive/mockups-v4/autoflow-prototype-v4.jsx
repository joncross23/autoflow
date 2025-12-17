import { useState, useEffect, useRef } from 'react';

// AutoFlow Complete Prototype v3
// All views connected: Dashboard, Ideas, Projects, Card Detail, Forms, Settings
// Full card editing with labels, checklists, comments, AI analysis

// ============================================================================
// THEME SYSTEM
// ============================================================================

const accentThemes = {
  midnight: { name: 'Midnight Blue', primary: '#3B82F6', primaryHover: '#2563EB', primaryMuted: '#1E3A5F' },
  emerald: { name: 'Emerald Green', primary: '#10B981', primaryHover: '#059669', primaryMuted: '#064E3B' },
  sunset: { name: 'Sunset Orange', primary: '#F59E0B', primaryHover: '#D97706', primaryMuted: '#78350F' },
  royal: { name: 'Royal Purple', primary: '#8B5CF6', primaryHover: '#7C3AED', primaryMuted: '#4C1D95' },
  rose: { name: 'Rose Pink', primary: '#EC4899', primaryHover: '#DB2777', primaryMuted: '#831843' },
  slate: { name: 'Slate Grey', primary: '#64748B', primaryHover: '#475569', primaryMuted: '#1E293B' },
};

const modeThemes = {
  dark: {
    bg: '#0A0A0B', bgSecondary: '#131316', bgTertiary: '#1A1A1F', bgElevated: '#1F1F26',
    border: '#27272A', borderSubtle: '#1F1F23',
    text: '#FAFAFA', textSecondary: '#A1A1AA', textMuted: '#71717A',
  },
  light: {
    bg: '#FAFAFA', bgSecondary: '#F4F4F5', bgTertiary: '#E4E4E7', bgElevated: '#FFFFFF',
    border: '#D4D4D8', borderSubtle: '#E4E4E7',
    text: '#09090B', textSecondary: '#52525B', textMuted: '#A1A1AA',
  },
};

const labelColors = [
  { id: 'green', color: '#22C55E', bg: '#22C55E' },
  { id: 'yellow', color: '#EAB308', bg: '#EAB308' },
  { id: 'orange', color: '#F97316', bg: '#F97316' },
  { id: 'red', color: '#EF4444', bg: '#EF4444' },
  { id: 'purple', color: '#A855F7', bg: '#A855F7' },
  { id: 'blue', color: '#3B82F6', bg: '#3B82F6' },
  { id: 'cyan', color: '#06B6D4', bg: '#06B6D4' },
  { id: 'pink', color: '#EC4899', bg: '#EC4899' },
  { id: 'lime', color: '#84CC16', bg: '#84CC16' },
  { id: 'grey', color: '#64748B', bg: '#64748B' },
];

const statusConfig = {
  new: { label: 'New', color: '#6366F1', bg: '#6366F120' },
  evaluating: { label: 'Evaluating', color: '#F59E0B', bg: '#F59E0B20' },
  prioritised: { label: 'Prioritised', color: '#3B82F6', bg: '#3B82F620' },
  converting: { label: 'Converting', color: '#8B5CF6', bg: '#8B5CF620' },
  archived: { label: 'Archived', color: '#64748B', bg: '#64748B20' },
};

const projectStatusConfig = {
  active: { label: 'Active', color: '#22C55E', bg: '#22C55E20' },
  'on-hold': { label: 'On Hold', color: '#F59E0B', bg: '#F59E0B20' },
  completed: { label: 'Completed', color: '#3B82F6', bg: '#3B82F620' },
  archived: { label: 'Archived', color: '#64748B', bg: '#64748B20' },
};

const projectBackgrounds = [
  { id: 'none', name: 'None', color: null },
  { id: 'slate', name: 'Slate', color: '#1E293B' },
  { id: 'zinc', name: 'Zinc', color: '#27272A' },
  { id: 'stone', name: 'Stone', color: '#292524' },
  { id: 'blue', name: 'Ocean', color: '#0C4A6E' },
  { id: 'indigo', name: 'Indigo', color: '#312E81' },
  { id: 'purple', name: 'Purple', color: '#4C1D95' },
  { id: 'pink', name: 'Rose', color: '#4C0519' },
  { id: 'emerald', name: 'Forest', color: '#064E3B' },
  { id: 'amber', name: 'Amber', color: '#451A03' },
  { id: 'cyan', name: 'Teal', color: '#083344' },
  { id: 'red', name: 'Wine', color: '#450A0A' },
];

// ============================================================================
// SAMPLE DATA
// ============================================================================

const initialLabels = [
  { id: 'l1', name: '', colorId: 'green' },
  { id: 'l2', name: '', colorId: 'yellow' },
  { id: 'l3', name: '', colorId: 'orange' },
  { id: 'l4', name: '', colorId: 'red' },
  { id: 'l5', name: '', colorId: 'purple' },
  { id: 'l6', name: 'Local', colorId: 'blue' },
  { id: 'l7', name: 'Feature', colorId: 'cyan' },
  { id: 'l8', name: 'Bug', colorId: 'pink' },
  { id: 'l9', name: 'Enhancement', colorId: 'lime' },
  { id: 'l10', name: 'Documentation', colorId: 'grey' },
];

const initialIdeas = [
  {
    id: 'IDEA-001', title: 'Automate weekly report generation', status: 'prioritised',
    description: 'Currently spending 3 hours every Monday compiling data from multiple sources into a PDF report for leadership.',
    owner: 'Operations Manager', frequency: 'Weekly', timeSpent: '3 hours',
    painPoints: 'Manual data collection, formatting inconsistencies, delays when sick/on leave',
    desiredOutcome: 'Automatic report generation and distribution by 9am Monday',
    labelIds: ['l1', 'l7'], createdAt: '2024-12-14',
    aiEvaluation: { rank: 1, complexity: 'Medium', estimatedHours: 12, businessValue: 9, annualHoursSaved: 156, annualValue: 4680 },
  },
  {
    id: 'IDEA-002', title: 'Customer onboarding email sequence', status: 'evaluating',
    description: 'Manually sending 5 onboarding emails to each new customer over their first 2 weeks.',
    owner: 'Customer Success', frequency: 'Daily', timeSpent: '45 mins',
    painPoints: 'Easy to forget, inconsistent timing, no tracking of opens/clicks',
    desiredOutcome: 'Automated email sequence triggered by signup with analytics',
    labelIds: ['l5'], createdAt: '2024-12-15',
    aiEvaluation: { rank: 2, complexity: 'Low', estimatedHours: 6, businessValue: 8, annualHoursSaved: 195, annualValue: 5850 },
  },
  {
    id: 'IDEA-003', title: 'Invoice data entry to accounting', status: 'new',
    description: 'Receiving invoices via email, manually entering into Xero, filing PDFs in folders.',
    owner: 'Finance Assistant', frequency: 'Daily', timeSpent: '1 hour',
    painPoints: 'Tedious, error-prone, backlog builds up during holidays',
    desiredOutcome: 'Auto-extract invoice data and create draft entries in Xero',
    labelIds: [], createdAt: '2024-12-16', aiEvaluation: null,
  },
  {
    id: 'IDEA-004', title: 'Social media content scheduling', status: 'new',
    description: 'Creating and posting content manually across 4 platforms every day.',
    owner: 'Marketing', frequency: 'Daily', timeSpent: '2 hours',
    painPoints: 'Time-consuming, inconsistent posting times, hard to plan ahead',
    desiredOutcome: 'Batch create and auto-schedule a week of content in one session',
    labelIds: ['l9'], createdAt: '2024-12-16', aiEvaluation: null,
  },
];

const initialProjects = [
  {
    id: 'proj-1', name: 'AutoFlow Development', description: 'Building AutoFlow — an AI & Automation Discovery Platform. This project tracks its own development.',
    status: 'active', labelIds: ['l7', 'l9'], createdAt: '2024-12-01', dueDate: '2025-03-01', backgroundColor: 'indigo',
    members: [{ id: 'm1', name: 'Jon Cross', initials: 'JC' }, { id: 'm2', name: 'Sarah Miller', initials: 'SM' }],
    columns: [
      { id: 'backlog', title: 'Backlog', color: '#6366F1', cards: [
        { id: 'AF-008', title: 'Git repository setup', labelIds: ['l10'], description: 'Create GitHub repository with full structure.', checklists: [], comments: [], dueDate: null, members: ['m1'], archived: false },
        { id: 'AF-009', title: 'Next.js project init', labelIds: ['l7'], description: 'Initialize Next.js 14+ with App Router, TypeScript, Tailwind.', checklists: [], comments: [], dueDate: null, members: [], archived: false },
      ]},
      { id: 'sprint', title: 'Current Sprint', color: '#F59E0B', cards: [
        { id: 'AF-001', title: 'Theme system mockup', labelIds: ['l7', 'l9'], description: 'Create the CSS custom properties architecture for theme switching. Dark mode default.', 
          checklists: [
            { id: 'cl1', name: 'Implementation', items: [
              { id: 'cli1', text: 'Define CSS custom properties', done: true },
              { id: 'cli2', text: 'Create dark theme variables', done: true },
              { id: 'cli3', text: 'Create light theme variables', done: true },
              { id: 'cli4', text: 'Build theme toggle component', done: false },
              { id: 'cli5', text: 'Persist to localStorage', done: false },
            ]}
          ], 
          comments: [
            { id: 'c1', author: 'JC', text: 'Started with the mockup, looking good so far!', date: '2024-12-15' }
          ], 
          aiAnalysis: {
            complexity: 'medium',
            estimatedHours: 8,
            businessValue: 9,
            lastRun: '2024-12-15T10:30:00Z',
            suggestions: ['Consider CSS-in-JS for better DX', 'Add system preference detection', 'Include transition animations']
          },
          attachments: [
            { id: 'att1', name: 'theme-reference.png', type: 'image', size: '245 KB', addedAt: 'Dec 14' },
            { id: 'att2', name: 'color-palette.pdf', type: 'pdf', size: '1.2 MB', addedAt: 'Dec 13' }
          ],
          links: [
            { id: 'link1', url: 'https://tailwindcss.com/docs/dark-mode', title: 'Tailwind Dark Mode Docs', favicon: '🎨' },
            { id: 'link2', url: 'https://github.com/shadcn/ui', title: 'shadcn/ui Components', favicon: '📦' }
          ],
          activity: [
            { id: 'act1', type: 'moved', from: 'Backlog', to: 'Current Sprint', at: '2024-12-14T09:00:00Z' },
            { id: 'act2', type: 'label_added', label: 'Design', at: '2024-12-14T09:05:00Z' },
            { id: 'act3', type: 'checklist_complete', text: 'Completed: Define CSS custom properties', at: '2024-12-15T14:00:00Z' }
          ],
          dueDate: 'Dec 18', members: ['m1', 'm2'], archived: false },
        { id: 'AF-004', title: 'Kanban board mockup', labelIds: ['l7', 'l8'], description: 'Create Trello-style kanban board with emphasis on smooth drag-and-drop UX.',
          checklists: [
            { id: 'cl2', name: 'Board Features', items: [
              { id: 'cli6', text: 'Column layout with colored headers', done: true },
              { id: 'cli7', text: 'Card components', done: true },
              { id: 'cli8', text: 'Drag ghost preview', done: false },
              { id: 'cli9', text: 'Drop zone highlighting', done: false },
            ]}
          ],
          aiAnalysis: {
            complexity: 'high',
            estimatedHours: 16,
            businessValue: 10,
            lastRun: '2024-12-16T08:00:00Z',
            suggestions: ['Use dnd-kit for accessibility', 'Add keyboard navigation', 'Consider touch device support']
          },
          comments: [], dueDate: 'Dec 19', members: ['m1'], archived: false },
      ]},
      { id: 'in-progress', title: 'In Progress', color: '#3B82F6', wipLimit: 3, cards: [
        { id: 'AF-002', title: 'Colour theme selector', labelIds: ['l7'], description: 'Allow users to choose from accent colour themes.', checklists: [], comments: [], dueDate: null, members: ['m2'], archived: false },
      ]},
      { id: 'review', title: 'Review / QA', color: '#8B5CF6', cards: [] },
      { id: 'done', title: 'Done', color: '#22C55E', cards: [
        { id: 'AF-006', title: 'Requirements gathering', labelIds: ['l10'], description: 'Define full project specification.', checklists: [], comments: [], dueDate: null, members: ['m1'], archived: false },
        { id: 'AF-007', title: 'Tech stack decisions', labelIds: ['l10'], description: 'Choose technologies for the project.', checklists: [], comments: [], dueDate: null, members: ['m1', 'm2'], archived: false },
      ]},
    ],
  },
  {
    id: 'proj-2', name: 'Marketing Automation', description: 'Automating social media and email marketing campaigns.',
    status: 'active', labelIds: ['l5'], createdAt: '2024-12-10', dueDate: '2025-02-15', backgroundColor: 'emerald',
    members: [{ id: 'm1', name: 'Jon Cross', initials: 'JC' }],
    columns: [
      { id: 'backlog', title: 'Backlog', color: '#6366F1', cards: [
        { id: 'MK-001', title: 'Email template design', labelIds: ['l7'], description: '', checklists: [], comments: [], dueDate: null, members: [], archived: false },
      ]},
      { id: 'in-progress', title: 'In Progress', color: '#3B82F6', cards: [] },
      { id: 'done', title: 'Done', color: '#22C55E', cards: [] },
    ],
  },
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getProjectStats(project) {
  const allCards = project.columns?.flatMap(col => col.cards.filter(c => !c.archived)) || [];
  const doneCards = project.columns?.find(c => c.id === 'done')?.cards.filter(c => !c.archived) || [];
  const inProgressCards = project.columns?.find(c => c.id === 'in-progress')?.cards.filter(c => !c.archived) || [];
  return {
    totalCards: allCards.length,
    completed: doneCards.length,
    inProgress: inProgressCards.length,
  };
}

function getLabelColor(colorId) {
  return labelColors.find(c => c.id === colorId) || labelColors[0];
}

// ============================================================================
// THEME PROVIDER
// ============================================================================

function ThemeProvider({ children, mode, accent }) {
  const m = modeThemes[mode];
  const a = accentThemes[accent];
  const cssVars = {
    '--bg': m.bg, '--bg-secondary': m.bgSecondary, '--bg-tertiary': m.bgTertiary, '--bg-elevated': m.bgElevated,
    '--border': m.border, '--border-subtle': m.borderSubtle,
    '--text': m.text, '--text-secondary': m.textSecondary, '--text-muted': m.textMuted,
    '--primary': a.primary, '--primary-hover': a.primaryHover, '--primary-muted': a.primaryMuted,
  };
  return <div style={cssVars}>{children}</div>;
}

// ============================================================================
// SHARED COMPONENTS
// ============================================================================

function MenuItem({ icon, label, onClick, danger, active, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px',
      background: active ? 'var(--primary-muted)' : 'transparent', border: 'none', borderRadius: 6,
      color: danger ? '#EF4444' : disabled ? 'var(--text-muted)' : active ? 'var(--primary)' : 'var(--text)',
      fontSize: 13, cursor: disabled ? 'not-allowed' : 'pointer', textAlign: 'left', opacity: disabled ? 0.5 : 1,
    }}
    onMouseEnter={(e) => !active && !disabled && (e.currentTarget.style.background = danger ? '#EF444415' : 'var(--bg-tertiary)')}
    onMouseLeave={(e) => !active && (e.currentTarget.style.background = 'transparent')}
    ><span style={{ width: 16, textAlign: 'center' }}>{icon}</span>{label}</button>
  );
}

function MenuDivider() {
  return <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 0' }} />;
}

function ActionMenu({ isOpen, onToggle, onClose, children }) {
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={(e) => { e.stopPropagation(); onToggle(); }} style={{
        width: 28, height: 28, borderRadius: 6,
        background: isOpen ? 'var(--bg-tertiary)' : 'transparent',
        border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
      }}>⋮</button>
      {isOpen && (
        <>
          <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />
          <div style={{
            position: 'absolute', top: '100%', right: 0, marginTop: 4,
            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            borderRadius: 8, padding: 4, minWidth: 180, boxShadow: '0 8px 24px rgba(0,0,0,0.3)', zIndex: 100,
          }}>{children}</div>
        </>
      )}
    </div>
  );
}

function Avatar({ initials, size = 28 }) {
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
  const idx = initials ? initials.charCodeAt(0) % colors.length : 0;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: colors[idx],
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.4, fontWeight: 600, color: 'white', flexShrink: 0,
      border: '2px solid var(--bg-secondary)',
    }}>{initials}</div>
  );
}

function ConfirmModal({ title, message, confirmLabel, danger, onConfirm, onCancel }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1002, padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 400, background: 'var(--bg-secondary)', borderRadius: 12 }}>
        <div style={{ padding: 24 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: danger ? '#EF444420' : 'var(--primary-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 16 }}>
            {danger ? '🗑' : '?'}
          </div>
          <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>{title}</h2>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{message}</p>
          {danger && <p style={{ margin: '8px 0 0', fontSize: 13, color: '#EF4444' }}>⚠ This action cannot be undone.</p>}
        </div>
        <div style={{ padding: '16px 24px', background: 'var(--bg-tertiary)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onCancel} style={{ padding: '10px 18px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={onConfirm} style={{ padding: '10px 18px', background: danger ? '#EF4444' : 'var(--primary)', border: 'none', borderRadius: 6, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

function ArchivedBanner({ itemType, onRestore, onDelete }) {
  return (
    <div style={{ background: '#F59E0B20', borderBottom: '1px solid #F59E0B40', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#F59E0B', fontSize: 13, fontWeight: 500 }}>
        <span>▣</span> This {itemType} is archived
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onRestore} style={{ padding: '6px 14px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>↩ Restore</button>
        <button onClick={onDelete} style={{ padding: '6px 14px', background: '#EF444420', border: '1px solid #EF444440', borderRadius: 6, color: '#EF4444', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>🗑 Delete</button>
      </div>
    </div>
  );
}

function ProgressBar({ value, size = 'md' }) {
  const height = size === 'sm' ? 4 : 6;
  return (
    <div style={{ height, background: 'var(--bg-tertiary)', borderRadius: height / 2, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${Math.min(100, Math.max(0, value))}%`, background: value >= 100 ? '#22C55E' : 'var(--primary)', borderRadius: height / 2, transition: 'width 0.3s ease' }} />
    </div>
  );
}

// ============================================================================
// DRAG-DROP COMPONENTS (RESTORED from original mockup)
// ============================================================================

function DropPlaceholder() {
  return (
    <div style={{
      height: 60,
      background: 'var(--bg-tertiary)',
      borderRadius: 10,
      border: '2px dashed var(--primary)',
      margin: '4px 0',
      opacity: 0.7,
    }} />
  );
}

function DragPreview({ card, labels, position }) {
  if (!card || !position) return null;
  const cardLabels = (card.labelIds || []).map(id => labels.find(l => l.id === id)).filter(Boolean);
  return (
    <div style={{ position: 'fixed', left: position.x - 130, top: position.y - 30, width: 260, pointerEvents: 'none', zIndex: 10000 }}>
      <div style={{ background: 'var(--bg-elevated)', borderRadius: 10, padding: 12, border: '1px solid var(--primary)', boxShadow: '0 8px 24px rgba(0,0,0,0.25)', transform: 'rotate(1.5deg)' }}>
        {cardLabels.length > 0 && (
          <div style={{ display: 'flex', gap: 4, marginBottom: 8, flexWrap: 'wrap' }}>
            {cardLabels.map(label => {
              const colorData = getLabelColor(label.colorId);
              return <span key={label.id} style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: colorData.color + '30', color: colorData.color }}>{label.name || ''}</span>;
            })}
          </div>
        )}
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', lineHeight: 1.4 }}>{card.title}</div>
      </div>
    </div>
  );
}

function ColumnDragPreview({ column, position }) {
  if (!column || !position) return null;
  return (
    <div style={{ position: 'fixed', left: position.x - 140, top: position.y - 24, width: 280, pointerEvents: 'none', zIndex: 10000 }}>
      <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: '12px 14px', border: '1px solid var(--border)', boxShadow: '0 12px 28px rgba(0,0,0,0.2)', transform: 'rotate(1deg)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 12, height: 12, borderRadius: 3, background: column.color }} />
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{column.title}</span>
      </div>
    </div>
  );
}

// ============================================================================
// AI ANALYSIS PANEL (RESTORED from original mockup)
// ============================================================================

function AIAnalysisPanel({ analysis, onRerun }) {
  if (!analysis) return null;
  return (
    <div style={{ background: 'var(--primary-muted)', borderRadius: 10, padding: 16, marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0, fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.95)' }}>
          <span>✦</span> AI Analysis
        </h3>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>
          Last run: {analysis.lastRun ? new Date(analysis.lastRun).toLocaleDateString() : 'N/A'}
        </span>
      </div>

      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'Complexity', value: analysis.complexity || 'N/A', color: analysis.complexity === 'high' ? '#EF4444' : analysis.complexity === 'medium' ? '#F59E0B' : '#22C55E' },
          { label: 'Est. Hours', value: analysis.estimatedHours || '—', color: '#F59E0B' },
          { label: 'Value', value: analysis.businessValue ? `${analysis.businessValue}/10` : '—', color: '#22C55E' },
        ].map(metric => (
          <div key={metric.label} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 6, padding: '10px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 4, textTransform: 'uppercase' }}>{metric.label}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: metric.color, textTransform: 'capitalize' }}>{metric.value}</div>
          </div>
        ))}
      </div>

      {/* Suggestions */}
      {analysis.suggestions && analysis.suggestions.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 8, textTransform: 'uppercase' }}>Suggestions</div>
          {analysis.suggestions.map((suggestion, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: 'rgba(255,255,255,0.85)', marginBottom: 6, lineHeight: 1.4 }}>
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>→</span>
              {suggestion}
            </div>
          ))}
        </div>
      )}

      <button onClick={onRerun} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 6, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
        ↻ Re-run Analysis
      </button>
    </div>
  );
}

// ============================================================================
// UNIFIED LABELS SYSTEM
// ============================================================================

// Single source of truth for label operations - use this everywhere
function useLabelsManager(labels, setLabels) {
  const createLabel = (newLabel) => {
    const id = `l${Date.now()}`;
    setLabels(prev => [...prev, { ...newLabel, id }]);
    return id;
  };
  
  const updateLabel = (updatedLabel) => {
    setLabels(prev => prev.map(l => l.id === updatedLabel.id ? updatedLabel : l));
  };
  
  const deleteLabel = (labelId) => {
    setLabels(prev => prev.filter(l => l.id !== labelId));
  };
  
  return { createLabel, updateLabel, deleteLabel };
}

// Unified Labels Popover - use this single component everywhere
function LabelsPopover({ isOpen, onClose, selectedIds = [], onToggle, labels, onCreateLabel, onEditLabel, onDeleteLabel, position = 'below' }) {
  const [search, setSearch] = useState('');
  const [editingLabel, setEditingLabel] = useState(null);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('green');
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const filteredLabels = labels.filter(l => 
    l.name.toLowerCase().includes(search.toLowerCase()) || l.colorId.toLowerCase().includes(search.toLowerCase())
  );
  
  const resetAndClose = () => {
    setSearch('');
    setEditingLabel(null);
    setNewLabelName('');
    setNewLabelColor('green');
    setShowCreateForm(false);
    onClose();
  };
  
  if (!isOpen) return null;
  
  const popoverStyle = {
    position: 'absolute',
    [position === 'above' ? 'bottom' : 'top']: '100%',
    left: 0,
    [position === 'above' ? 'marginBottom' : 'marginTop']: 4,
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
    zIndex: 100,
    width: 300,
  };
  
  // Edit label form
  if (editingLabel) {
    return (
      <div style={popoverStyle}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => setEditingLabel(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14 }}>←</button>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Edit Label</span>
          <button onClick={resetAndClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>×</button>
        </div>
        <div style={{ padding: 16 }}>
          {/* Preview */}
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
            <div style={{ padding: '8px 16px', borderRadius: 6, background: getLabelColor(editingLabel.colorId).bg, color: 'white', fontSize: 14, fontWeight: 500, minWidth: 120, textAlign: 'center' }}>{editingLabel.name || '(no name)'}</div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Title</label>
            <input type="text" value={editingLabel.name} onChange={(e) => setEditingLabel({ ...editingLabel, name: e.target.value })} placeholder="Add a title..." autoFocus style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 14, color: 'var(--text)', outline: 'none' }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Color</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
              {labelColors.map(c => (
                <button key={c.id} onClick={() => setEditingLabel({ ...editingLabel, colorId: c.id })} style={{ height: 32, borderRadius: 6, background: c.bg, border: 'none', cursor: 'pointer', outline: editingLabel.colorId === c.id ? '2px solid var(--text)' : 'none', outlineOffset: 2 }} />
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => { onEditLabel(editingLabel); setEditingLabel(null); }} style={{ flex: 1, padding: '10px', background: 'var(--primary)', border: 'none', borderRadius: 6, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Save</button>
            {onDeleteLabel && (
              <button onClick={() => { onDeleteLabel(editingLabel.id); setEditingLabel(null); }} style={{ padding: '10px 16px', background: '#EF444420', border: 'none', borderRadius: 6, color: '#EF4444', fontSize: 13, cursor: 'pointer' }}>Delete</button>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // Create new label form
  if (showCreateForm) {
    return (
      <div style={popoverStyle}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => setShowCreateForm(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14 }}>←</button>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Create Label</span>
          <button onClick={resetAndClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>×</button>
        </div>
        <div style={{ padding: 16 }}>
          {/* Live preview */}
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
            <div style={{ padding: '8px 16px', borderRadius: 6, background: getLabelColor(newLabelColor).bg, color: 'white', fontSize: 14, fontWeight: 500, minWidth: 120, textAlign: 'center' }}>{newLabelName || '(no name)'}</div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Title</label>
            <input type="text" value={newLabelName} onChange={(e) => setNewLabelName(e.target.value)} placeholder="Add a title..." autoFocus style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 14, color: 'var(--text)', outline: 'none' }} onKeyDown={(e) => { if (e.key === 'Enter' && newLabelName.trim()) { const id = onCreateLabel({ name: newLabelName, colorId: newLabelColor }); onToggle(id); setNewLabelName(''); setNewLabelColor('green'); setShowCreateForm(false); }}} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Color</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
              {labelColors.map(c => (
                <button key={c.id} onClick={() => setNewLabelColor(c.id)} style={{ height: 32, borderRadius: 6, background: c.bg, border: 'none', cursor: 'pointer', outline: newLabelColor === c.id ? '2px solid var(--text)' : 'none', outlineOffset: 2 }} />
              ))}
            </div>
          </div>
          <button onClick={() => { 
            const id = onCreateLabel({ name: newLabelName, colorId: newLabelColor }); 
            onToggle(id); // Auto-select the new label
            setNewLabelName(''); 
            setNewLabelColor('green'); 
            setShowCreateForm(false); 
          }} style={{ width: '100%', padding: '10px', background: 'var(--primary)', border: 'none', borderRadius: 6, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Create</button>
        </div>
      </div>
    );
  }
  
  // Main labels list
  return (
    <div style={popoverStyle}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Labels</span>
        <button onClick={resetAndClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>×</button>
      </div>
      <div style={{ padding: '12px 16px' }}>
        <input type="text" placeholder="Search labels..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-tertiary)', border: '1px solid var(--primary)', borderRadius: 6, fontSize: 14, color: 'var(--text)', outline: 'none' }} />
      </div>
      <div style={{ padding: '0 16px 12px', maxHeight: 300, overflowY: 'auto' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Labels</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {filteredLabels.map(label => {
            const color = getLabelColor(label.colorId);
            const isSelected = selectedIds.includes(label.id);
            return (
              <div key={label.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button onClick={() => onToggle(label.id)} style={{ width: 20, height: 20, borderRadius: 4, border: '2px solid var(--border)', background: isSelected ? 'var(--primary)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, flexShrink: 0 }}>{isSelected && '✓'}</button>
                <button onClick={() => onToggle(label.id)} style={{ flex: 1, height: 36, borderRadius: 6, background: color.bg, border: 'none', cursor: 'pointer', textAlign: 'left', paddingLeft: 12, color: 'white', fontSize: 14, fontWeight: 500 }}>{label.name || ' '}</button>
                <button onClick={() => setEditingLabel({ ...label })} style={{ width: 28, height: 28, borderRadius: 6, background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14, flexShrink: 0 }}>✎</button>
              </div>
            );
          })}
          {filteredLabels.length === 0 && search && (
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '8px 0' }}>No labels found</p>
          )}
        </div>
      </div>
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-subtle)' }}>
        <button onClick={() => setShowCreateForm(true)} style={{ width: '100%', padding: '10px', background: 'var(--bg-tertiary)', border: 'none', borderRadius: 6, color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer' }}>Create a new label</button>
      </div>
    </div>
  );
}

// Unified Labels Field component - use for consistent UI anywhere you need to display/edit labels
function LabelsField({ labelIds = [], labels, onToggle, onCreateLabel, onEditLabel, onDeleteLabel, size = 'md', showLabel = true }) {
  const [showPopover, setShowPopover] = useState(false);
  
  return (
    <div style={{ position: 'relative' }}>
      {showLabel && <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Labels</label>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <LabelsDisplay labelIds={labelIds} labels={labels} size={size} />
        <button onClick={() => setShowPopover(true)} style={{ padding: size === 'sm' ? '4px 8px' : '8px 12px', background: 'var(--bg-tertiary)', border: 'none', borderRadius: 6, color: 'var(--text-muted)', fontSize: size === 'sm' ? 11 : 13, cursor: 'pointer' }}>+ Add</button>
      </div>
      <LabelsPopover 
        isOpen={showPopover} 
        onClose={() => setShowPopover(false)} 
        selectedIds={labelIds} 
        onToggle={onToggle} 
        labels={labels} 
        onCreateLabel={onCreateLabel} 
        onEditLabel={onEditLabel}
        onDeleteLabel={onDeleteLabel}
      />
    </div>
  );
}

function LabelBadge({ label, size = 'md' }) {
  const color = getLabelColor(label.colorId);
  const height = size === 'sm' ? 8 : 24;
  const minWidth = size === 'sm' ? 40 : 48;
  
  if (size === 'sm' || !label.name) {
    return <div style={{ height, minWidth, borderRadius: 4, background: color.bg }} title={label.name || label.colorId} />;
  }
  
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', height, padding: '0 10px', borderRadius: 4, background: color.bg, color: 'white', fontSize: 12, fontWeight: 500 }}>{label.name}</span>
  );
}

function LabelsDisplay({ labelIds = [], labels, size = 'md', showAdd = false, onAddClick }) {
  const displayLabels = labelIds.map(id => labels.find(l => l.id === id)).filter(Boolean);
  
  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
      {displayLabels.map(label => <LabelBadge key={label.id} label={label} size={size} />)}
      {showAdd && (
        <button onClick={onAddClick} style={{ width: size === 'sm' ? 24 : 32, height: size === 'sm' ? 8 : 24, borderRadius: 4, background: 'var(--bg-tertiary)', border: 'none', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
      )}
    </div>
  );
}

// ============================================================================
// SIDEBAR NAVIGATION
// ============================================================================

function Sidebar({ currentView, setCurrentView, ideas, projects, collapsed, setCollapsed }) {
  const activeIdeas = ideas.filter(i => i.status !== 'archived').length;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  
  const navItems = [
    { id: 'dashboard', icon: '◉', label: 'Dashboard' },
    { id: 'ideas', icon: '💡', label: 'Ideas', badge: activeIdeas },
    { id: 'projects', icon: '▦', label: 'Projects', badge: activeProjects },
    { id: 'forms', icon: '◱', label: 'Forms' },
    { id: 'settings', icon: '⚙', label: 'Settings' },
  ];
  
  const baseView = currentView.split(':')[0];
  
  return (
    <div style={{ 
      width: collapsed ? 64 : 240, 
      background: 'var(--bg-secondary)', 
      borderRight: '1px solid var(--border-subtle)', 
      display: 'flex', 
      flexDirection: 'column', 
      flexShrink: 0,
      transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ 
        padding: collapsed ? '20px 12px' : '20px 16px', 
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        minHeight: 73,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
          <div style={{ 
            width: 32, height: 32, borderRadius: 8, background: 'var(--primary)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            fontSize: 16, color: 'white', fontWeight: 700, flexShrink: 0 
          }}>A</div>
          <span style={{ 
            fontSize: 16, fontWeight: 700, color: 'var(--text)',
            opacity: collapsed ? 0 : 1,
            transition: 'opacity 0.15s ease',
            whiteSpace: 'nowrap',
          }}>AutoFlow</span>
        </div>
        {!collapsed && (
          <button 
            onClick={() => setCollapsed(true)}
            style={{ 
              background: 'transparent', border: 'none', color: 'var(--text-muted)', 
              cursor: 'pointer', padding: 4, borderRadius: 4, fontSize: 14,
              opacity: 0.6, transition: 'opacity 0.15s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
          >
            ◂
          </button>
        )}
      </div>
      
      {/* Expand button when collapsed */}
      {collapsed && (
        <button 
          onClick={() => setCollapsed(false)}
          style={{ 
            margin: '12px 12px 0', padding: 8, background: 'var(--bg-tertiary)', 
            border: 'none', borderRadius: 6, color: 'var(--text-muted)', 
            cursor: 'pointer', fontSize: 12, transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = 'white'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-tertiary)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          ▸
        </button>
      )}
      
      {/* Navigation */}
      <nav style={{ flex: 1, padding: collapsed ? '12px 8px' : '12px 8px' }}>
        {navItems.map(item => (
          <button 
            key={item.id} 
            onClick={() => setCurrentView(item.id)} 
            title={collapsed ? item.label : undefined}
            style={{
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: 10, 
              width: '100%', 
              padding: collapsed ? '10px' : '10px 12px', 
              marginBottom: 4, 
              borderRadius: 8, 
              border: 'none',
              background: baseView === item.id ? 'var(--primary)' : 'transparent',
              color: baseView === item.id ? 'white' : 'var(--text-secondary)',
              fontSize: 14, 
              fontWeight: 500, 
              cursor: 'pointer', 
              textAlign: 'left',
              transition: 'all 0.15s ease',
              position: 'relative',
            }}
            onMouseEnter={(e) => { if (baseView !== item.id) e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
            onMouseLeave={(e) => { if (baseView !== item.id) e.currentTarget.style.background = 'transparent'; }}
          >
            <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
            <span style={{ 
              flex: 1, 
              opacity: collapsed ? 0 : 1,
              width: collapsed ? 0 : 'auto',
              overflow: 'hidden',
              transition: 'opacity 0.15s ease',
              whiteSpace: 'nowrap',
            }}>{item.label}</span>
            {item.badge !== undefined && !collapsed && (
              <span style={{ 
                padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600, 
                background: baseView === item.id ? 'rgba(255,255,255,0.2)' : 'var(--bg-tertiary)', 
                color: baseView === item.id ? 'white' : 'var(--text-muted)',
                transition: 'opacity 0.15s ease',
              }}>{item.badge}</span>
            )}
            {/* Tooltip for collapsed state */}
            {collapsed && item.badge !== undefined && (
              <span style={{
                position: 'absolute',
                top: 2, right: 2,
                width: 8, height: 8,
                borderRadius: '50%',
                background: 'var(--primary)',
                border: '2px solid var(--bg-secondary)',
              }} />
            )}
          </button>
        ))}
      </nav>
      
      {/* Keyboard hint at bottom */}
      {!collapsed && (
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <kbd style={{ padding: '2px 5px', background: 'var(--bg-tertiary)', borderRadius: 3, fontSize: 10 }}>⌘K</kbd>
            <span>Quick capture</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// DASHBOARD VIEW
// ============================================================================

function DashboardView({ ideas, projects, setCurrentView, setShowQuickCapture }) {
  const stats = [
    { label: 'Active Ideas', value: ideas.filter(i => i.status !== 'archived').length, icon: '💡' },
    { label: 'Active Projects', value: projects.filter(p => p.status === 'active').length, icon: '▦' },
    { label: 'Tasks Done', value: projects.reduce((acc, p) => acc + getProjectStats(p).completed, 0), icon: '✓' },
    { label: 'Hours Saved', value: '127', icon: '◔' },
  ];
  
  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>Dashboard</h1>
        <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--text-muted)' }}>Welcome back. Here's your automation overview.</p>
      </div>
      
      <div onClick={() => setShowQuickCapture(true)} style={{ padding: '16px 20px', background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border-subtle)', marginBottom: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 20 }}>💡</span>
        <span style={{ color: 'var(--text-muted)', flex: 1 }}>Capture a new automation idea...</span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg-tertiary)', padding: '4px 8px', borderRadius: 4 }}>⌘K</span>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {stats.map(stat => (
          <div key={stat.label} style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: 20, border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{stat.label}</span>
              <span style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{stat.icon}</span>
            </div>
            <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)' }}>{stat.value}</span>
          </div>
        ))}
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: 20, border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>Recent Ideas</h2>
            <button onClick={() => setCurrentView('ideas')} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>View all →</button>
          </div>
          {ideas.filter(i => i.status !== 'archived').slice(0, 3).map(idea => (
            <div key={idea.id} onClick={() => setCurrentView('ideas')} style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer' }}>
              <span style={{ padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 500, marginRight: 12, background: statusConfig[idea.status].bg, color: statusConfig[idea.status].color }}>{statusConfig[idea.status].label}</span>
              <span style={{ flex: 1, fontSize: 14, color: 'var(--text)' }}>{idea.title}</span>
              {idea.aiEvaluation && <span style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>#{idea.aiEvaluation.rank}</span>}
            </div>
          ))}
        </div>
        
        <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: 20, border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>Active Projects</h2>
            <button onClick={() => setCurrentView('projects')} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>View all →</button>
          </div>
          {projects.filter(p => p.status === 'active').slice(0, 3).map(project => {
            const stats = getProjectStats(project);
            const progress = stats.totalCards > 0 ? Math.round((stats.completed / stats.totalCards) * 100) : 0;
            return (
              <div key={project.id} onClick={() => setCurrentView(`projects:${project.id}`)} style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500 }}>{project.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{stats.completed}/{stats.totalCards} tasks</div>
                </div>
                <div style={{ width: 80 }}><ProgressBar value={progress} size="sm" /></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// IDEAS VIEW
// ============================================================================

// Separate IdeaRow component to properly handle state
function IdeaRow({ idea, labels, isLast, onSelect, onConvert, onArchive, onRestore, onDelete, onRunAI }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isArchived = idea.status === 'archived';
  
  return (
    <div onClick={() => onSelect(idea)} style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', cursor: 'pointer', borderBottom: isLast ? 'none' : '1px solid var(--border-subtle)', opacity: isArchived ? 0.6 : 1 }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
      <span style={{ padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 500, marginRight: 12, background: statusConfig[idea.status].bg, color: statusConfig[idea.status].color }}>{statusConfig[idea.status].label}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>{idea.title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <LabelsDisplay labelIds={idea.labelIds || []} labels={labels} size="sm" />
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{idea.owner}{idea.frequency && ` • ${idea.frequency}`}</span>
        </div>
      </div>
      {idea.aiEvaluation && <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)', marginRight: 12 }}>#{idea.aiEvaluation.rank}</span>}
      <div onClick={(e) => e.stopPropagation()}>
        <ActionMenu isOpen={menuOpen} onToggle={() => setMenuOpen(!menuOpen)} onClose={() => setMenuOpen(false)}>
          {!isArchived ? (
            <>
              <MenuItem icon="✎" label="Edit" onClick={() => { setMenuOpen(false); onSelect(idea); }} />
              <MenuItem icon="◫" label="Duplicate" onClick={() => setMenuOpen(false)} />
              <MenuItem icon="→" label="Convert to Project" onClick={() => { setMenuOpen(false); onConvert(idea); }} />
              <MenuItem icon="✦" label="Run AI Evaluation" onClick={() => { setMenuOpen(false); onRunAI(idea); }} />
              <MenuDivider />
              <MenuItem icon="▣" label="Archive" onClick={() => { setMenuOpen(false); onArchive(idea); }} />
            </>
          ) : (
            <>
              <MenuItem icon="↩" label="Restore" onClick={() => { setMenuOpen(false); onRestore(idea); }} />
              <MenuDivider />
              <MenuItem icon="🗑" label="Delete permanently" onClick={() => { setMenuOpen(false); onDelete(idea); }} danger />
            </>
          )}
        </ActionMenu>
      </div>
    </div>
  );
}

function IdeasView({ ideas, setIdeas, labels, setLabels, projects, setProjects, setCurrentView, showQuickCapture, setShowQuickCapture }) {
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [showStructuredCapture, setShowStructuredCapture] = useState(false);
  const [showConvert, setShowConvert] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  
  const filteredIdeas = ideas.filter(i => filterStatus === 'all' || i.status === filterStatus);
  const statusCounts = Object.keys(statusConfig).reduce((acc, s) => { acc[s] = ideas.filter(i => i.status === s).length; return acc; }, {});
  
  const handleQuickSubmit = (title) => {
    const newIdea = { id: `IDEA-${String(ideas.length + 1).padStart(3, '0')}`, title, description: '', status: 'new', owner: '', frequency: '', timeSpent: '', painPoints: '', desiredOutcome: '', labelIds: [], createdAt: new Date().toISOString().split('T')[0], aiEvaluation: null };
    setIdeas(prev => [newIdea, ...prev]);
    setShowQuickCapture(false);
  };
  
  const handleRunAI = (idea) => {
    setIdeas(prev => prev.map(i => i.id === idea.id ? { 
      ...i, 
      aiEvaluation: { rank: Math.floor(Math.random() * 5) + 1, complexity: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)], estimatedHours: Math.floor(Math.random() * 20) + 4, businessValue: Math.floor(Math.random() * 4) + 6, annualHoursSaved: Math.floor(Math.random() * 200) + 50, annualValue: Math.floor(Math.random() * 5000) + 1500 }
    } : i));
  };
  
  const handleConvert = (options) => {
    const idea = showConvert;
    if (options.mode === 'new') {
      const newProject = {
        id: `proj-${projects.length + 1}`,
        name: options.projectName,
        description: idea.description,
        status: 'active',
        labelIds: idea.labelIds || [],
        createdAt: new Date().toISOString().split('T')[0],
        dueDate: null,
        members: [{ id: 'm1', name: 'Jon Cross', initials: 'JC' }],
        columns: [
          { id: 'backlog', title: 'Backlog', color: '#6366F1', cards: [
            { id: `${options.projectName.substring(0,2).toUpperCase()}-001`, title: idea.title, labelIds: idea.labelIds || [], description: idea.description, checklists: [], comments: [], dueDate: null, members: ['m1'], archived: false }
          ]},
          { id: 'in-progress', title: 'In Progress', color: '#3B82F6', cards: [] },
          { id: 'done', title: 'Done', color: '#22C55E', cards: [] },
        ],
      };
      setProjects(prev => [...prev, newProject]);
      setCurrentView(`projects:${newProject.id}`);
    } else {
      const project = projects.find(p => p.id === options.projectId);
      if (project) {
        const cardCount = project.columns.reduce((acc, col) => acc + col.cards.length, 0);
        const newCard = {
          id: `${project.name.substring(0,2).toUpperCase()}-${String(cardCount + 1).padStart(3, '0')}`,
          title: idea.title,
          labelIds: idea.labelIds || [],
          description: idea.description,
          checklists: [],
          comments: [],
          dueDate: null,
          members: [],
          archived: false,
        };
        setProjects(prev => prev.map(p => p.id === project.id ? {
          ...p,
          columns: p.columns.map(col => col.id === 'backlog' ? { ...col, cards: [...col.cards, newCard] } : col)
        } : p));
        setCurrentView(`projects:${project.id}`);
      }
    }
    setIdeas(prev => prev.map(i => i.id === idea.id ? { ...i, status: 'converting' } : i));
    setShowConvert(null);
    setSelectedIdea(null);
  };
  
  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>Ideas</h1>
        <button onClick={() => setShowQuickCapture(true)} style={{ padding: '10px 16px', background: 'var(--primary)', border: 'none', borderRadius: 8, color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>+</span> Capture Idea <span style={{ opacity: 0.7, fontSize: 11 }}>⌘K</span>
        </button>
      </div>
      
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <button onClick={() => setFilterStatus('all')} style={{ padding: '8px 16px', borderRadius: 20, border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer', background: filterStatus === 'all' ? 'var(--primary)' : 'var(--bg-tertiary)', color: filterStatus === 'all' ? 'white' : 'var(--text-secondary)' }}>All ({ideas.length})</button>
        {Object.entries(statusConfig).map(([key, cfg]) => (
          <button key={key} onClick={() => setFilterStatus(key)} style={{ padding: '8px 16px', borderRadius: 20, border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer', background: filterStatus === key ? cfg.color : cfg.bg, color: filterStatus === key ? 'white' : cfg.color }}>{cfg.label} ({statusCounts[key] || 0})</button>
        ))}
      </div>
      
      <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
        {filteredIdeas.map((idea, idx) => (
          <IdeaRow 
            key={idea.id}
            idea={idea}
            labels={labels}
            isLast={idx === filteredIdeas.length - 1}
            onSelect={setSelectedIdea}
            onConvert={setShowConvert}
            onArchive={(idea) => setIdeas(prev => prev.map(i => i.id === idea.id ? { ...i, status: 'archived' } : i))}
            onRestore={(idea) => setIdeas(prev => prev.map(i => i.id === idea.id ? { ...i, status: 'new' } : i))}
            onDelete={setConfirmDelete}
            onRunAI={handleRunAI}
          />
        ))}
        {filteredIdeas.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No ideas found. Click "Capture Idea" to add one.</div>}
      </div>
      
      {showQuickCapture && <QuickCaptureModal onClose={() => setShowQuickCapture(false)} onSubmit={handleQuickSubmit} onExpand={() => { setShowQuickCapture(false); setShowStructuredCapture(true); }} />}
      {showStructuredCapture && <StructuredCaptureModal labels={labels} setLabels={setLabels} onClose={() => setShowStructuredCapture(false)} onSubmit={(form) => { setIdeas(prev => [{ id: `IDEA-${String(prev.length + 1).padStart(3, '0')}`, ...form, status: 'new', createdAt: new Date().toISOString().split('T')[0], aiEvaluation: null }, ...prev]); setShowStructuredCapture(false); }} />}
      {selectedIdea && <IdeaDetailModal idea={selectedIdea} labels={labels} setLabels={setLabels} onClose={() => setSelectedIdea(null)} onUpdate={(updated) => { setIdeas(prev => prev.map(i => i.id === updated.id ? updated : i)); setSelectedIdea(updated); }} onConvert={() => setShowConvert(selectedIdea)} onArchive={() => { setIdeas(prev => prev.map(i => i.id === selectedIdea.id ? { ...i, status: 'archived' } : i)); setSelectedIdea(null); }} onRestore={() => { setIdeas(prev => prev.map(i => i.id === selectedIdea.id ? { ...i, status: 'new' } : i)); setSelectedIdea({ ...selectedIdea, status: 'new' }); }} onDelete={() => setConfirmDelete(selectedIdea)} />}
      {showConvert && <ConvertToProjectModal idea={showConvert} projects={projects} onClose={() => setShowConvert(null)} onConvert={handleConvert} />}
      {confirmDelete && <ConfirmModal title="Delete Idea?" message={`Are you sure you want to permanently delete "${confirmDelete.title}"?`} confirmLabel="Delete Permanently" danger onConfirm={() => { setIdeas(prev => prev.filter(i => i.id !== confirmDelete.id)); setConfirmDelete(null); setSelectedIdea(null); }} onCancel={() => setConfirmDelete(null)} />}
    </div>
  );
}

function QuickCaptureModal({ onClose, onSubmit, onExpand }) {
  const [title, setTitle] = useState('');
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '20vh', zIndex: 1000 }}>
      <div style={{ width: '100%', maxWidth: 600, background: 'var(--bg-elevated)', borderRadius: 12, border: '1px solid var(--border)', boxShadow: '0 20px 50px rgba(0,0,0,0.4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', gap: 12, borderBottom: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: 20 }}>💡</span>
          <input type="text" placeholder="Capture your automation idea..." value={title} onChange={(e) => setTitle(e.target.value)} autoFocus style={{ flex: 1, background: 'transparent', border: 'none', fontSize: 16, color: 'var(--text)', outline: 'none' }} onKeyDown={(e) => { if (e.key === 'Enter' && title.trim()) onSubmit(title); else if (e.key === 'Escape') onClose(); }} />
          <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-tertiary)', padding: '4px 8px', borderRadius: 4 }}>⏎ Save</span>
        </div>
        <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', background: 'var(--bg-secondary)' }}>
          <button onClick={onExpand} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 13, cursor: 'pointer' }}>⊕ Add more details</button>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Press <kbd style={{ padding: '2px 6px', background: 'var(--bg-tertiary)', borderRadius: 3 }}>Esc</kbd> to close</span>
        </div>
      </div>
    </div>
  );
}

function StructuredCaptureModal({ labels, setLabels, onClose, onSubmit }) {
  const [form, setForm] = useState({ title: '', description: '', owner: '', frequency: '', timeSpent: '', painPoints: '', desiredOutcome: '', labelIds: [] });
  const { createLabel, updateLabel, deleteLabel } = useLabelsManager(labels, setLabels);
  
  const handleLabelToggle = (labelId) => {
    setForm(prev => ({
      ...prev,
      labelIds: prev.labelIds.includes(labelId) 
        ? prev.labelIds.filter(id => id !== labelId) 
        : [...prev.labelIds, labelId]
    }));
  };
  
  const handleCreateLabel = (newLabel) => {
    return createLabel(newLabel);
  };
  
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 20px', overflowY: 'auto', zIndex: 1000 }}>
      <div style={{ width: '100%', maxWidth: 600, background: 'var(--bg-secondary)', borderRadius: 12 }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>💡 Capture New Idea</h2>
          <button onClick={onClose} style={{ background: 'var(--bg-tertiary)', border: 'none', color: 'var(--text-muted)', width: 32, height: 32, borderRadius: 6, cursor: 'pointer', fontSize: 18 }}>×</button>
        </div>
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>What task could be automated? *</label>
            <input type="text" value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g., Weekly report generation" style={{ width: '100%', padding: '12px 14px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, color: 'var(--text)', outline: 'none' }} />
          </div>
          <LabelsField 
            labelIds={form.labelIds}
            labels={labels}
            onToggle={handleLabelToggle}
            onCreateLabel={handleCreateLabel}
            onEditLabel={updateLabel}
            onDeleteLabel={deleteLabel}
          />
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Describe the current process</label>
            <textarea value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} placeholder="What steps are involved?" rows={2} style={{ width: '100%', padding: '12px 14px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, color: 'var(--text)', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Who does this?</label>
              <input type="text" value={form.owner} onChange={(e) => setForm(p => ({ ...p, owner: e.target.value }))} placeholder="e.g., Operations Manager" style={{ width: '100%', padding: '12px 14px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, color: 'var(--text)', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>How often?</label>
              <select value={form.frequency} onChange={(e) => setForm(p => ({ ...p, frequency: e.target.value }))} style={{ width: '100%', padding: '12px 14px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, color: form.frequency ? 'var(--text)' : 'var(--text-muted)', cursor: 'pointer' }}>
                <option value="">Select frequency</option>
                {['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Ad-hoc'].map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Time spent per occurrence</label>
            <input type="text" value={form.timeSpent} onChange={(e) => setForm(p => ({ ...p, timeSpent: e.target.value }))} placeholder="e.g., 2 hours" style={{ width: '100%', padding: '12px 14px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, color: 'var(--text)', outline: 'none' }} />
          </div>
        </div>
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: 10, background: 'var(--bg-tertiary)' }}>
          <button onClick={onClose} style={{ padding: '10px 18px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => onSubmit(form)} disabled={!form.title.trim()} style={{ padding: '10px 18px', background: form.title.trim() ? 'var(--primary)' : 'var(--bg-tertiary)', border: 'none', borderRadius: 6, color: form.title.trim() ? 'white' : 'var(--text-muted)', fontSize: 13, fontWeight: 600, cursor: form.title.trim() ? 'pointer' : 'not-allowed' }}>Save Idea</button>
        </div>
      </div>
    </div>
  );
}

function IdeaDetailModal({ idea, labels, setLabels, onClose, onUpdate, onConvert, onArchive, onRestore, onDelete }) {
  const isArchived = idea.status === 'archived';
  const { createLabel, updateLabel, deleteLabel } = useLabelsManager(labels, setLabels);
  
  const handleLabelToggle = (labelId) => {
    const currentIds = idea.labelIds || [];
    const newIds = currentIds.includes(labelId) 
      ? currentIds.filter(id => id !== labelId) 
      : [...currentIds, labelId];
    onUpdate({ ...idea, labelIds: newIds });
  };
  
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 20px', overflowY: 'auto', zIndex: 1000 }}>
      <div style={{ width: '100%', maxWidth: 800, background: 'var(--bg-secondary)', borderRadius: 12 }}>
        {isArchived && <ArchivedBanner itemType="idea" onRestore={onRestore} onDelete={onDelete} />}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 500, background: statusConfig[idea.status].bg, color: statusConfig[idea.status].color }}>{statusConfig[idea.status].label}</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{idea.id}</span>
            </div>
            <h2 style={{ margin: '0 0 12px', fontSize: 20, fontWeight: 600, color: 'var(--text)' }}>{idea.title}</h2>
            <LabelsField 
              labelIds={idea.labelIds || []}
              labels={labels}
              onToggle={handleLabelToggle}
              onCreateLabel={createLabel}
              onEditLabel={updateLabel}
              onDeleteLabel={deleteLabel}
              showLabel={false}
            />
          </div>
          <button onClick={onClose} style={{ background: 'var(--bg-tertiary)', border: 'none', color: 'var(--text-muted)', width: 32, height: 32, borderRadius: 6, cursor: 'pointer', fontSize: 18 }}>×</button>
        </div>
        <div style={{ display: 'flex' }}>
          <div style={{ flex: 1, padding: 24 }}>
            {idea.description && <div style={{ marginBottom: 24 }}><h3 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Description</h3><p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{idea.description}</p></div>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
              {[{ label: 'Owner', value: idea.owner }, { label: 'Frequency', value: idea.frequency }, { label: 'Time Spent', value: idea.timeSpent }, { label: 'Created', value: idea.createdAt }].filter(f => f.value).map(field => (
                <div key={field.label} style={{ padding: '12px 16px', background: 'var(--bg-tertiary)', borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{field.label}</div>
                  <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500 }}>{field.value}</div>
                </div>
              ))}
            </div>
            {idea.aiEvaluation && (
              <div style={{ background: 'var(--primary-muted)', borderRadius: 10, padding: 20 }}>
                <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.95)' }}>✦ AI Evaluation</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                  {[{ label: 'Rank', value: `#${idea.aiEvaluation.rank}`, color: 'var(--primary)' }, { label: 'Complexity', value: idea.aiEvaluation.complexity, color: '#F59E0B' }, { label: 'Value', value: `${idea.aiEvaluation.businessValue}/10`, color: '#22C55E' }, { label: 'Hours/Year', value: idea.aiEvaluation.annualHoursSaved, color: '#3B82F6' }].map(m => (
                    <div key={m.label} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{m.label}</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: m.color }}>{m.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div style={{ width: 180, padding: 24, background: 'var(--bg-tertiary)', borderLeft: '1px solid var(--border-subtle)' }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8, fontWeight: 600 }}>Status</div>
              <select value={idea.status} onChange={(e) => onUpdate({ ...idea, status: e.target.value })} disabled={isArchived} style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)', fontSize: 13, cursor: 'pointer' }}>
                {Object.entries(statusConfig).filter(([k]) => k !== 'archived').map(([key, cfg]) => <option key={key} value={key}>{cfg.label}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <MenuItem icon="✎" label="Edit Details" onClick={() => {}} />
              <MenuItem icon="◫" label="Duplicate" onClick={() => {}} />
              {!isArchived && <MenuItem icon="→" label="Convert to Project" onClick={onConvert} />}
              <MenuDivider />
              {!isArchived ? <MenuItem icon="▣" label="Archive" onClick={onArchive} /> : <><MenuItem icon="↩" label="Restore" onClick={onRestore} /><MenuItem icon="🗑" label="Delete" onClick={onDelete} danger /></>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConvertToProjectModal({ idea, projects, onClose, onConvert }) {
  const [mode, setMode] = useState('new');
  const [projectName, setProjectName] = useState(idea.title);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const activeProjects = projects.filter(p => p.status === 'active');
  
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001, padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 500, background: 'var(--bg-secondary)', borderRadius: 12 }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>→ Convert to Project</h2>
        </div>
        <div style={{ padding: 24 }}>
          {idea.aiEvaluation && (
            <div style={{ background: 'var(--primary-muted)', borderRadius: 8, padding: 16, marginBottom: 20, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, textAlign: 'center' }}>
              <div><div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Rank</div><div style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary)' }}>#{idea.aiEvaluation.rank}</div></div>
              <div><div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Est. Hours</div><div style={{ fontSize: 18, fontWeight: 700, color: '#F59E0B' }}>{idea.aiEvaluation.estimatedHours}</div></div>
              <div><div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Hours/Year</div><div style={{ fontSize: 18, fontWeight: 700, color: '#22C55E' }}>{idea.aiEvaluation.annualHoursSaved}</div></div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            <button onClick={() => setMode('new')} style={{ flex: 1, padding: '12px', borderRadius: 8, border: 'none', cursor: 'pointer', background: mode === 'new' ? 'var(--primary)' : 'var(--bg-tertiary)', color: mode === 'new' ? 'white' : 'var(--text-secondary)', fontSize: 14, fontWeight: 600 }}>Create New Project</button>
            <button onClick={() => setMode('existing')} style={{ flex: 1, padding: '12px', borderRadius: 8, border: 'none', cursor: 'pointer', background: mode === 'existing' ? 'var(--primary)' : 'var(--bg-tertiary)', color: mode === 'existing' ? 'white' : 'var(--text-secondary)', fontSize: 14, fontWeight: 600 }}>Add to Existing</button>
          </div>
          {mode === 'new' ? (
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Project Name</label>
              <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} style={{ width: '100%', padding: '12px 14px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, color: 'var(--text)', outline: 'none' }} />
              <p style={{ margin: '12px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>This will create a new project with "{idea.title}" as the first task.</p>
            </div>
          ) : (
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Select Project</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 200, overflowY: 'auto' }}>
                {activeProjects.map(project => (
                  <button key={project.id} onClick={() => setSelectedProjectId(project.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: selectedProjectId === project.id ? 'var(--primary-muted)' : 'var(--bg-tertiary)', border: selectedProjectId === project.id ? '2px solid var(--primary)' : '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', textAlign: 'left' }}>
                    <div style={{ width: 20, height: 20, borderRadius: 4, border: '2px solid var(--border)', background: selectedProjectId === project.id ? 'var(--primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, flexShrink: 0 }}>{selectedProjectId === project.id && '✓'}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{project.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{getProjectStats(project).totalCards} tasks</div>
                    </div>
                  </button>
                ))}
                {activeProjects.length === 0 && <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>No active projects. Create a new project instead.</p>}
              </div>
            </div>
          )}
        </div>
        <div style={{ padding: '16px 24px', background: 'var(--bg-tertiary)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} style={{ padding: '10px 18px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => onConvert({ mode, projectId: mode === 'existing' ? selectedProjectId : null, projectName: mode === 'new' ? projectName : null })} disabled={mode === 'existing' && !selectedProjectId} style={{ padding: '10px 18px', background: (mode === 'new' || selectedProjectId) ? 'var(--primary)' : 'var(--bg-tertiary)', border: 'none', borderRadius: 6, color: (mode === 'new' || selectedProjectId) ? 'white' : 'var(--text-muted)', fontSize: 13, fontWeight: 600, cursor: (mode === 'new' || selectedProjectId) ? 'pointer' : 'not-allowed' }}>{mode === 'new' ? 'Create Project' : 'Add to Project'}</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PROJECTS VIEW
// ============================================================================

function ProjectsView({ projects, setProjects, labels, setLabels, currentProjectId, setCurrentView }) {
  if (currentProjectId) {
    const project = projects.find(p => p.id === currentProjectId);
    if (project) return <ProjectDetailView project={project} projects={projects} setProjects={setProjects} labels={labels} setLabels={setLabels} onBack={() => setCurrentView('projects')} />;
  }
  
  const projectGroups = [
    { label: 'Active', status: 'active', projects: projects.filter(p => p.status === 'active') },
    { label: 'On Hold', status: 'on-hold', projects: projects.filter(p => p.status === 'on-hold') },
    { label: 'Completed', status: 'completed', projects: projects.filter(p => p.status === 'completed') },
    { label: 'Archived', status: 'archived', projects: projects.filter(p => p.status === 'archived') },
  ].filter(g => g.projects.length > 0);
  
  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>Projects</h1>
        <button style={{ padding: '10px 16px', background: 'var(--primary)', border: 'none', borderRadius: 8, color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}><span>+</span> New Project</button>
      </div>
      {projectGroups.map(group => (
        <div key={group.status} style={{ marginBottom: 32 }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: projectStatusConfig[group.status].color }} />
            {group.label} ({group.projects.length})
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 16 }}>
            {group.projects.map(project => {
              const stats = getProjectStats(project);
              const progress = stats.totalCards > 0 ? Math.round((stats.completed / stats.totalCards) * 100) : 0;
              return (
                <div key={project.id} onClick={() => setCurrentView(`projects:${project.id}`)} style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: 20, border: '1px solid var(--border-subtle)', cursor: 'pointer', transition: 'all 0.15s ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.transform = 'none'; }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <span style={{ padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 500, background: projectStatusConfig[project.status].bg, color: projectStatusConfig[project.status].color }}>{projectStatusConfig[project.status].label}</span>
                  </div>
                  <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>{project.name}</h3>
                  {project.description && <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{project.description}</p>}
                  {project.labelIds?.length > 0 && <div style={{ marginBottom: 12 }}><LabelsDisplay labelIds={project.labelIds} labels={labels} size="sm" /></div>}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{stats.completed}/{stats.totalCards} tasks</span><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{progress}%</span></div>
                    <ProgressBar value={progress} size="sm" />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex' }}>
                      {project.members?.slice(0, 3).map((member, i) => <div key={member.id} style={{ marginLeft: i > 0 ? -8 : 0 }}><Avatar initials={member.initials} size={24} /></div>)}
                    </div>
                    {project.dueDate && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Due {project.dueDate}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function ProjectDetailView({ project, projects, setProjects, labels, setLabels, onBack }) {
  const [viewMode, setViewMode] = useState('kanban');
  const [selectedCard, setSelectedCard] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const { createLabel, updateLabel, deleteLabel } = useLabelsManager(labels, setLabels);
  
  // DRAG STATE (RESTORED)
  const [dragType, setDragType] = useState(null); // 'card' | 'column'
  const [draggingCard, setDraggingCard] = useState(null);
  const [draggingColumn, setDraggingColumn] = useState(null);
  const [sourceColumnId, setSourceColumnId] = useState(null);
  const [sourceCardIndex, setSourceCardIndex] = useState(null);
  const [mousePos, setMousePos] = useState(null);
  const [dropTarget, setDropTarget] = useState({ columnId: null, insertIndex: null });
  const [columnInsertIndex, setColumnInsertIndex] = useState(null);
  const [isAddingCard, setIsAddingCard] = useState(null);
  const [newCardText, setNewCardText] = useState('');
  
  const stats = getProjectStats(project);
  const progress = stats.totalCards > 0 ? Math.round((stats.completed / stats.totalCards) * 100) : 0;
  const bgColor = projectBackgrounds.find(b => b.id === project.backgroundColor)?.color;
  
  const updateProject = (updated) => setProjects(prev => prev.map(p => p.id === project.id ? updated : p));
  const updateCard = (columnId, cardId, updates) => {
    updateProject({
      ...project,
      columns: project.columns.map(col => col.id === columnId ? { ...col, cards: col.cards.map(c => c.id === cardId ? { ...c, ...updates } : c) } : col)
    });
    if (selectedCard?.id === cardId) setSelectedCard(prev => ({ ...prev, ...updates }));
  };

  // Card drag handlers
  const handleCardMouseDown = (e, card, columnId, cardIndex) => {
    e.preventDefault();
    e.stopPropagation();
    setDragType('card');
    setDraggingCard(card);
    setSourceColumnId(columnId);
    setSourceCardIndex(cardIndex);
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  // Column drag handlers  
  const handleColumnMouseDown = (e, columnId) => {
    e.preventDefault();
    const column = project.columns.find(c => c.id === columnId);
    setDragType('column');
    setDraggingColumn(column);
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  // Drag effect
  useEffect(() => {
    if (!dragType) return;

    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });

      if (dragType === 'card') {
        const columnElements = document.querySelectorAll('[data-column-id]');
        let foundColumn = null;
        let foundIndex = null;

        columnElements.forEach(colEl => {
          const rect = colEl.getBoundingClientRect();
          if (e.clientX >= rect.left && e.clientX <= rect.right) {
            foundColumn = colEl.getAttribute('data-column-id');
            const cardsContainer = colEl.querySelector('[data-cards-container]');
            if (cardsContainer) {
              const cardEls = cardsContainer.querySelectorAll('[data-card-index]');
              foundIndex = cardEls.length;
              for (let i = 0; i < cardEls.length; i++) {
                const cardRect = cardEls[i].getBoundingClientRect();
                const cardMidY = cardRect.top + cardRect.height / 2;
                if (e.clientY < cardMidY) { foundIndex = i; break; }
              }
            }
          }
        });
        setDropTarget({ columnId: foundColumn, insertIndex: foundIndex });
      }

      if (dragType === 'column') {
        const columnElements = document.querySelectorAll('[data-column-id]');
        let insertIdx = project.columns.length;
        for (let i = 0; i < columnElements.length; i++) {
          const rect = columnElements[i].getBoundingClientRect();
          const midX = rect.left + rect.width / 2;
          if (e.clientX < midX) { insertIdx = i; break; }
        }
        setColumnInsertIndex(insertIdx);
      }
    };

    const handleMouseUp = () => {
      if (dragType === 'card' && draggingCard && dropTarget.columnId) {
        // Move card to new position
        const newColumns = project.columns.map(col => ({
          ...col,
          cards: col.cards.filter(c => c.id !== draggingCard.id)
        }));
        
        const targetCol = newColumns.find(c => c.id === dropTarget.columnId);
        if (targetCol) {
          const insertAt = dropTarget.insertIndex ?? targetCol.cards.length;
          targetCol.cards.splice(insertAt, 0, draggingCard);
          updateProject({ ...project, columns: newColumns });
        }
      }

      if (dragType === 'column' && draggingColumn && columnInsertIndex !== null) {
        const newColumns = [...project.columns];
        const currentIndex = newColumns.findIndex(c => c.id === draggingColumn.id);
        if (currentIndex !== -1 && currentIndex !== columnInsertIndex) {
          const [removed] = newColumns.splice(currentIndex, 1);
          const adjustedIndex = columnInsertIndex > currentIndex ? columnInsertIndex - 1 : columnInsertIndex;
          newColumns.splice(adjustedIndex, 0, removed);
          updateProject({ ...project, columns: newColumns });
        }
      }

      // Reset drag state
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
  }, [dragType, draggingCard, draggingColumn, dropTarget, columnInsertIndex, project]);

  const addCard = (columnId) => {
    if (!newCardText.trim()) return;
    const newCard = { id: `card-${Date.now()}`, title: newCardText.trim(), labelIds: [], checklists: [], comments: [] };
    updateProject({
      ...project,
      columns: project.columns.map(col => col.id === columnId ? { ...col, cards: [...col.cards, newCard] } : col)
    });
    setNewCardText('');
    setIsAddingCard(null);
  };

  // Helper to check if placeholder should show
  const shouldShowPlaceholder = (columnId, index) => {
    if (dragType !== 'card' || dropTarget.columnId !== columnId) return false;
    if (dropTarget.insertIndex !== index) return false;
    if (columnId === sourceColumnId) {
      return index !== sourceCardIndex && index !== sourceCardIndex + 1;
    }
    return true;
  };
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: bgColor || 'var(--bg)', cursor: dragType ? 'grabbing' : 'default' }}>
      {/* Compact toolbar */}
      <div style={{ padding: '12px 24px', borderBottom: '1px solid var(--border-subtle)', background: bgColor ? 'rgba(0,0,0,0.3)' : 'var(--bg-secondary)', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={onBack} style={{ background: 'var(--bg-tertiary)', border: 'none', borderRadius: 6, padding: '6px 10px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13 }}>←</button>
        <h1 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text)', flex: 1 }}>{project.name}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-muted)' }}>
          <span>{stats.completed}/{stats.totalCards}</span>
          <div style={{ width: 60 }}><ProgressBar value={progress} size="sm" /></div>
        </div>
        <div style={{ display: 'flex', gap: 2, background: 'var(--bg-tertiary)', borderRadius: 6, padding: 2 }}>
          {['kanban', 'table'].map(view => (
            <button key={view} onClick={() => setViewMode(view)} style={{ padding: '6px 12px', borderRadius: 4, border: 'none', fontSize: 12, fontWeight: 500, cursor: 'pointer', background: viewMode === view ? 'var(--bg-elevated)' : 'transparent', color: viewMode === view ? 'var(--text)' : 'var(--text-muted)' }}>
              {view === 'kanban' ? 'Board' : 'Table'}
            </button>
          ))}
        </div>
        <button onClick={() => setShowSettings(true)} style={{ padding: '6px 10px', background: 'var(--bg-tertiary)', border: 'none', borderRadius: 6, color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14 }}>⚙</button>
      </div>
      
      <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
        {viewMode === 'kanban' ? (
          <div style={{ display: 'flex', gap: 12, height: '100%', overflow: 'auto', alignItems: 'flex-start' }}>
            {project.columns?.map((column, colIndex) => {
              const columnCards = column.cards.filter(c => !c.archived);
              const isOverLimit = column.wipLimit && columnCards.length >= column.wipLimit;
              const isBeingDragged = dragType === 'column' && draggingColumn?.id === column.id;
              
              return (
                <div key={column.id} style={{ display: 'flex', alignItems: 'flex-start' }}>
                  {/* Column insert indicator */}
                  {dragType === 'column' && columnInsertIndex === colIndex && draggingColumn?.id !== column.id && (
                    <div style={{ width: 3, alignSelf: 'stretch', background: 'var(--primary)', borderRadius: 2, marginRight: 8, minHeight: 200 }} />
                  )}
                  
                  <div data-column-id={column.id} style={{ 
                    width: 280, flexShrink: 0, background: 'var(--bg-secondary)', borderRadius: 10, 
                    display: 'flex', flexDirection: 'column', maxHeight: '100%',
                    opacity: isBeingDragged ? 0.5 : 1,
                    transform: isBeingDragged ? 'rotate(1deg)' : 'none',
                    transition: isBeingDragged ? 'none' : 'transform 0.15s ease'
                  }}>
                    {/* Column Header - Draggable */}
                    <div 
                      onMouseDown={(e) => handleColumnMouseDown(e, column.id)}
                      style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 10, cursor: 'grab', userSelect: 'none' }}>
                      <div style={{ width: 12, height: 12, borderRadius: 3, background: column.color }} />
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', flex: 1 }}>{column.title}</span>
                      <span style={{ fontSize: 12, color: isOverLimit ? '#EF4444' : 'var(--text-muted)', fontWeight: isOverLimit ? 600 : 400 }}>
                        {columnCards.length}{column.wipLimit && `/${column.wipLimit}`}
                      </span>
                    </div>
                    
                    {/* Cards Container */}
                    <div data-cards-container={column.id} style={{ padding: 8, flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, minHeight: 100 }}>
                      {columnCards.map((card, cardIndex) => {
                        const isGhost = draggingCard?.id === card.id;
                        const checklistProgress = card.checklists?.reduce((acc, cl) => ({ done: acc.done + cl.items.filter(i => i.done).length, total: acc.total + cl.items.length }), { done: 0, total: 0 });
                        const cardProgress = checklistProgress?.total > 0 ? Math.round((checklistProgress.done / checklistProgress.total) * 100) : null;
                        
                        return (
                          <div key={card.id} data-card-index={cardIndex}>
                            {shouldShowPlaceholder(column.id, cardIndex) && <DropPlaceholder />}
                            <div 
                              onMouseDown={(e) => handleCardMouseDown(e, card, column.id, cardIndex)}
                              onClick={() => !dragType && setSelectedCard({ ...card, columnId: column.id })} 
                              style={{ 
                                background: isGhost ? 'var(--bg-tertiary)' : 'var(--bg-elevated)', 
                                borderRadius: 8, padding: 12, 
                                border: `1px solid ${isGhost ? 'var(--border)' : 'var(--border-subtle)'}`,
                                cursor: dragType ? 'grabbing' : 'grab',
                                opacity: isGhost ? 0.4 : 1,
                                userSelect: 'none',
                                transition: dragType ? 'none' : 'all 0.12s ease'
                              }}
                              onMouseEnter={(e) => { if (!dragType && !isGhost) { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}}
                              onMouseLeave={(e) => { if (!dragType && !isGhost) { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.transform = 'none'; }}}>
                              
                              {card.labelIds?.length > 0 && (
                                <div style={{ display: 'flex', gap: 4, marginBottom: 8, flexWrap: 'wrap' }}>
                                  <LabelsDisplay labelIds={card.labelIds} labels={labels} size="sm" />
                                </div>
                              )}
                              <div style={{ fontSize: 14, fontWeight: 500, color: isGhost ? 'var(--text-muted)' : 'var(--text)', marginBottom: 8 }}>{card.title}</div>
                              
                              {/* Progress bar */}
                              {cardProgress !== null && (
                                <div style={{ marginBottom: 8 }}>
                                  <div style={{ height: 4, background: isGhost ? 'var(--border)' : 'var(--bg-tertiary)', borderRadius: 2, overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${cardProgress}%`, background: isGhost ? 'var(--text-muted)' : (cardProgress === 100 ? '#22C55E' : 'var(--primary)'), borderRadius: 2 }} />
                                  </div>
                                </div>
                              )}
                              
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                                  {checklistProgress?.total > 0 && <span>☑ {checklistProgress.done}/{checklistProgress.total}</span>}
                                  {card.dueDate && <span>◷ {card.dueDate}</span>}
                                  {card.comments?.length > 0 && <span>💬 {card.comments.length}</span>}
                                  {card.attachments?.length > 0 && <span>📎 {card.attachments.length}</span>}
                                </div>
                                {card.members?.length > 0 && (
                                  <div style={{ display: 'flex' }}>
                                    {card.members.slice(0, 2).map((mId, i) => { 
                                      const member = project.members?.find(m => m.id === mId); 
                                      return member ? <div key={mId} style={{ marginLeft: i > 0 ? -6 : 0 }}><Avatar initials={member.initials} size={20} /></div> : null; 
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* End placeholder */}
                      {shouldShowPlaceholder(column.id, columnCards.length) && <DropPlaceholder />}
                      
                      {/* Quick Add Card */}
                      {isAddingCard === column.id ? (
                        <div style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: 12, border: '1px solid var(--primary)', boxShadow: '0 0 0 3px var(--primary-muted)' }}>
                          <textarea autoFocus value={newCardText} onChange={(e) => setNewCardText(e.target.value)} 
                            placeholder="Enter card title..."
                            onKeyDown={(e) => { 
                              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addCard(column.id); } 
                              if (e.key === 'Escape') { setIsAddingCard(null); setNewCardText(''); } 
                            }}
                            style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text)', fontSize: 13, resize: 'none', outline: 'none', fontFamily: 'inherit', minHeight: 60 }} />
                          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                            <button onClick={() => addCard(column.id)} style={{ flex: 1, padding: '8px 12px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Add Card</button>
                            <button onClick={() => { setIsAddingCard(null); setNewCardText(''); }} style={{ padding: '8px 12px', background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setIsAddingCard(column.id)} style={{ padding: '10px 12px', background: 'transparent', border: '1px dashed var(--border)', borderRadius: 8, color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s ease' }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                          + Add card
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* End column insert indicator */}
            {dragType === 'column' && columnInsertIndex === project.columns?.length && (
              <div style={{ width: 3, alignSelf: 'stretch', background: 'var(--primary)', borderRadius: 2, minHeight: 200 }} />
            )}
            
            {/* Add Column Button */}
            {!dragType && (
              <button style={{ width: 280, flexShrink: 0, background: 'var(--bg-tertiary)', borderRadius: 10, border: '2px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer', minHeight: 100, padding: 20 }}>+ Add Column</button>
            )}
          </div>
        ) : (
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 150px 100px 100px', padding: '12px 16px', background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-subtle)', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              <span>Task</span><span>Status</span><span>Labels</span><span>Progress</span><span>Due</span>
            </div>
            {project.columns?.flatMap(col => col.cards.filter(c => !c.archived).map(card => {
              const checklistProgress = card.checklists?.reduce((acc, cl) => ({ done: acc.done + cl.items.filter(i => i.done).length, total: acc.total + cl.items.length }), { done: 0, total: 0 });
              const cardProgress = checklistProgress?.total > 0 ? Math.round((checklistProgress.done / checklistProgress.total) * 100) : 0;
              return (
                <div key={card.id} onClick={() => setSelectedCard({ ...card, columnId: col.id })} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 150px 100px 100px', padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)', alignItems: 'center', cursor: 'pointer' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <span style={{ fontSize: 14, color: 'var(--text)' }}>{card.title}</span>
                  <span style={{ padding: '4px 8px', borderRadius: 12, fontSize: 11, fontWeight: 500, width: 'fit-content', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>{col.title}</span>
                  <LabelsDisplay labelIds={card.labelIds || []} labels={labels} size="sm" />
                  <div style={{ width: 60 }}><ProgressBar value={cardProgress} size="sm" /></div>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{card.dueDate || '—'}</span>
                </div>
              );
            }))}
          </div>
        )}
      </div>
      
      {/* Drag Previews */}
      {dragType === 'card' && <DragPreview card={draggingCard} labels={labels} position={mousePos} />}
      {dragType === 'column' && <ColumnDragPreview column={draggingColumn} position={mousePos} />}
      
      {/* Drag instructions hint */}
      {!dragType && viewMode === 'kanban' && (
        <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 12, padding: '10px 16px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', zIndex: 100 }}>
          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
            <strong style={{ color: 'var(--primary)' }}>Drag cards</strong> between columns • <strong style={{ color: 'var(--primary)' }}>Drag headers</strong> to reorder columns
          </span>
        </div>
      )}
      
      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          project={project}
          labels={labels}
          setLabels={setLabels}
          onClose={() => setSelectedCard(null)}
          onUpdate={(updates) => updateCard(selectedCard.columnId, selectedCard.id, updates)}
          onArchive={() => { updateCard(selectedCard.columnId, selectedCard.id, { archived: true }); setSelectedCard(null); }}
          onRestore={() => updateCard(selectedCard.columnId, selectedCard.id, { archived: false })}
          onDelete={() => setConfirmDelete(selectedCard)}
        />
      )}
      
      {showSettings && (
        <ProjectSettingsModal
          project={project}
          labels={labels}
          setLabels={setLabels}
          onClose={() => setShowSettings(false)}
          onUpdate={updateProject}
          onArchive={() => { updateProject({ ...project, status: 'archived' }); setShowSettings(false); }}
          onDelete={() => setConfirmDelete({ type: 'project', ...project })}
        />
      )}
      
      {confirmDelete && (
        <ConfirmModal
          title={confirmDelete.type === 'project' ? 'Delete Project?' : 'Delete Card?'}
          message={`Are you sure you want to permanently delete "${confirmDelete.name || confirmDelete.title}"?`}
          confirmLabel="Delete Permanently"
          danger
          onConfirm={() => {
            if (confirmDelete.type === 'project') {
              setProjects(prev => prev.filter(p => p.id !== project.id));
              onBack();
            } else {
              updateProject({
                ...project,
                columns: project.columns.map(col => col.id === confirmDelete.columnId ? { ...col, cards: col.cards.filter(c => c.id !== confirmDelete.id) } : col)
              });
              setSelectedCard(null);
            }
            setConfirmDelete(null);
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

function CardDetailModal({ card, project, labels, setLabels, onClose, onUpdate, onArchive, onRestore, onDelete }) {
  const [newComment, setNewComment] = useState('');
  const [showAddChecklist, setShowAddChecklist] = useState(false);
  const [newChecklistName, setNewChecklistName] = useState('');
  const [editingDescription, setEditingDescription] = useState(false);
  const [description, setDescription] = useState(card.description || '');
  const [addingItemToChecklist, setAddingItemToChecklist] = useState(null);
  const [newItemText, setNewItemText] = useState('');
  const { createLabel, updateLabel, deleteLabel } = useLabelsManager(labels, setLabels);
  
  const column = project.columns?.find(c => c.id === card.columnId);
  const checklistProgress = card.checklists?.reduce((acc, cl) => ({ done: acc.done + cl.items.filter(i => i.done).length, total: acc.total + cl.items.length }), { done: 0, total: 0 });
  const progress = checklistProgress?.total > 0 ? Math.round((checklistProgress.done / checklistProgress.total) * 100) : 0;
  
  const handleLabelToggle = (labelId) => {
    const currentIds = card.labelIds || [];
    const newIds = currentIds.includes(labelId) 
      ? currentIds.filter(id => id !== labelId) 
      : [...currentIds, labelId];
    onUpdate({ labelIds: newIds });
  };
  
  const addChecklist = () => {
    if (!newChecklistName.trim()) return;
    onUpdate({ checklists: [...(card.checklists || []), { id: `cl-${Date.now()}`, name: newChecklistName, items: [] }] });
    setNewChecklistName('');
    setShowAddChecklist(false);
  };
  
  const toggleChecklistItem = (checklistId, itemId) => {
    onUpdate({
      checklists: card.checklists.map(cl => cl.id === checklistId ? { ...cl, items: cl.items.map(item => item.id === itemId ? { ...item, done: !item.done } : item) } : cl)
    });
  };
  
  const addChecklistItem = (checklistId, text = newItemText) => {
    if (!text.trim()) return;
    // Check if text contains multiple lines (paste detection)
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length > 1) {
      // Multi-line paste: create item for each line
      const newItems = lines.map((line, i) => ({ id: `cli-${Date.now()}-${i}`, text: line, done: false }));
      onUpdate({
        checklists: card.checklists.map(cl => cl.id === checklistId ? { ...cl, items: [...cl.items, ...newItems] } : cl)
      });
    } else {
      // Single item
      onUpdate({
        checklists: card.checklists.map(cl => cl.id === checklistId ? { ...cl, items: [...cl.items, { id: `cli-${Date.now()}`, text: text.trim(), done: false }] } : cl)
      });
    }
    setNewItemText('');
    setAddingItemToChecklist(null);
  };
  
  const deleteChecklist = (checklistId) => {
    onUpdate({
      checklists: card.checklists.filter(cl => cl.id !== checklistId)
    });
  };
  
  const deleteChecklistItem = (checklistId, itemId) => {
    onUpdate({
      checklists: card.checklists.map(cl => cl.id === checklistId ? { ...cl, items: cl.items.filter(i => i.id !== itemId) } : cl)
    });
  };
  
  const addComment = () => {
    if (!newComment.trim()) return;
    onUpdate({ comments: [...(card.comments || []), { id: `c-${Date.now()}`, author: 'JC', text: newComment, date: new Date().toISOString().split('T')[0] }] });
    setNewComment('');
  };
  
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 20px', overflowY: 'auto', zIndex: 1000 }}>
      <div style={{ width: '100%', maxWidth: 800, background: 'var(--bg-secondary)', borderRadius: 12 }}>
        {card.archived && <ArchivedBanner itemType="card" onRestore={onRestore} onDelete={onDelete} />}
        
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ marginBottom: 12 }}>
              <LabelsField 
                labelIds={card.labelIds || []}
                labels={labels}
                onToggle={handleLabelToggle}
                onCreateLabel={createLabel}
                onEditLabel={updateLabel}
                onDeleteLabel={deleteLabel}
                showLabel={false}
              />
            </div>
            <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 600, color: 'var(--text)' }}>{card.title}</h2>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>in column <strong style={{ color: 'var(--text-secondary)' }}>{column?.title}</strong></p>
          </div>
          <button onClick={onClose} style={{ background: 'var(--bg-tertiary)', border: 'none', color: 'var(--text-muted)', width: 32, height: 32, borderRadius: 6, cursor: 'pointer', fontSize: 18 }}>×</button>
        </div>
        
        <div style={{ display: 'flex' }}>
          <div style={{ flex: 1, padding: 24 }}>
            {/* Description */}
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>≡ Description</h3>
              {editingDescription ? (
                <div>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} autoFocus style={{ width: '100%', padding: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--primary)', borderRadius: 8, fontSize: 14, color: 'var(--text)', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button onClick={() => { onUpdate({ description }); setEditingDescription(false); }} style={{ padding: '8px 16px', background: 'var(--primary)', border: 'none', borderRadius: 6, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Save</button>
                    <button onClick={() => { setDescription(card.description || ''); setEditingDescription(false); }} style={{ padding: '8px 16px', background: 'var(--bg-tertiary)', border: 'none', borderRadius: 6, color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div onClick={() => setEditingDescription(true)} style={{ padding: 12, background: 'var(--bg-tertiary)', borderRadius: 8, fontSize: 14, color: card.description ? 'var(--text-secondary)' : 'var(--text-muted)', lineHeight: 1.6, cursor: 'pointer', minHeight: 60 }}>
                  {card.description || 'Add a more detailed description...'}
                </div>
              )}
            </div>
            
            {/* AI Analysis Panel (RESTORED) */}
            {card.aiAnalysis && (
              <AIAnalysisPanel 
                analysis={card.aiAnalysis} 
                onRerun={() => {
                  const newAnalysis = {
                    complexity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
                    estimatedHours: Math.floor(Math.random() * 40) + 4,
                    businessValue: Math.floor(Math.random() * 5) + 6,
                    lastRun: new Date().toISOString(),
                    suggestions: ['Consider breaking into smaller tasks', 'Add acceptance criteria', 'Schedule a review meeting']
                  };
                  onUpdate({ aiAnalysis: newAnalysis });
                }}
              />
            )}
            
            {/* Attachments (RESTORED) */}
            {card.attachments && card.attachments.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>📎 Attachments</h3>
                {card.attachments.map(att => (
                  <div key={att.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'var(--bg-tertiary)', borderRadius: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 20 }}>{att.type === 'image' ? '🖼' : att.type === 'pdf' ? '📕' : '📄'}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{att.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{att.size} • Added {att.addedAt}</div>
                    </div>
                    <button style={{ padding: '4px 8px', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer' }}>⋮</button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Links (RESTORED) */}
            {card.links && card.links.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>🔗 Links</h3>
                {card.links.map(link => (
                  <div key={link.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--bg-tertiary)', borderRadius: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 16 }}>{link.favicon || '🔗'}</span>
                    <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ flex: 1, fontSize: 13, color: 'var(--primary)', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {link.title || link.url}
                    </a>
                    <button style={{ padding: '4px 8px', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer' }}>×</button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Checklists */}
            {card.checklists?.map(checklist => (
              <div key={checklist.id} style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>☑ {checklist.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{checklist.items.filter(i => i.done).length}/{checklist.items.length}</span>
                    <button onClick={() => deleteChecklist(checklist.id)} style={{ padding: '4px 10px', background: 'var(--bg-tertiary)', border: 'none', borderRadius: 4, color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#EF444420'; e.currentTarget.style.color = '#EF4444'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-tertiary)'; e.currentTarget.style.color = 'var(--text-muted)'; }}>Delete</button>
                  </div>
                </div>
                <ProgressBar value={checklist.items.length > 0 ? (checklist.items.filter(i => i.done).length / checklist.items.length) * 100 : 0} size="sm" />
                <div style={{ marginTop: 12 }}>
                  {checklist.items.map(item => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'var(--bg-tertiary)', borderRadius: 6, marginBottom: 4, cursor: 'pointer', position: 'relative' }}
                      onMouseEnter={(e) => e.currentTarget.querySelector('.delete-item')?.style && (e.currentTarget.querySelector('.delete-item').style.opacity = '1')}
                      onMouseLeave={(e) => e.currentTarget.querySelector('.delete-item')?.style && (e.currentTarget.querySelector('.delete-item').style.opacity = '0')}>
                      <div onClick={() => toggleChecklistItem(checklist.id, item.id)} style={{ width: 18, height: 18, borderRadius: 4, border: item.done ? 'none' : '2px solid var(--border)', background: item.done ? 'var(--primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, flexShrink: 0 }}>{item.done && '✓'}</div>
                      <span onClick={() => toggleChecklistItem(checklist.id, item.id)} style={{ flex: 1, fontSize: 13, color: item.done ? 'var(--text-muted)' : 'var(--text)', textDecoration: item.done ? 'line-through' : 'none' }}>{item.text}</span>
                      <button className="delete-item" onClick={(e) => { e.stopPropagation(); deleteChecklistItem(checklist.id, item.id); }} style={{ opacity: 0, padding: '2px 6px', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer', transition: 'opacity 0.15s' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#EF4444'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>×</button>
                    </div>
                  ))}
                  {addingItemToChecklist === checklist.id ? (
                    <div style={{ marginTop: 8 }}>
                      <textarea 
                        placeholder="Add an item... (paste multiple lines to create many items)" 
                        value={newItemText} 
                        onChange={(e) => setNewItemText(e.target.value)} 
                        autoFocus 
                        rows={1}
                        style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-tertiary)', border: '1px solid var(--primary)', borderRadius: 6, fontSize: 13, color: 'var(--text)', outline: 'none', resize: 'none', fontFamily: 'inherit', minHeight: 36 }} 
                        onKeyDown={(e) => { 
                          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addChecklistItem(checklist.id); } 
                          else if (e.key === 'Escape') { setAddingItemToChecklist(null); setNewItemText(''); } 
                        }}
                        onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                      />
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <button onClick={() => addChecklistItem(checklist.id)} style={{ padding: '8px 12px', background: 'var(--primary)', border: 'none', borderRadius: 6, color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Add</button>
                        <button onClick={() => { setAddingItemToChecklist(null); setNewItemText(''); }} style={{ padding: '8px 12px', background: 'var(--bg-tertiary)', border: 'none', borderRadius: 6, color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer' }}>Cancel</button>
                      </div>
                      {newItemText.includes('\n') && <p style={{ margin: '8px 0 0', fontSize: 11, color: 'var(--primary)' }}>📋 {newItemText.split('\n').filter(l => l.trim()).length} items will be created</p>}
                    </div>
                  ) : (
                    <button onClick={() => setAddingItemToChecklist(checklist.id)} style={{ padding: '8px 10px', background: 'transparent', border: 'none', borderRadius: 6, color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', textAlign: 'left', width: '100%', marginTop: 4 }}>+ Add an item</button>
                  )}
                </div>
              </div>
            ))}
            
            {/* Add checklist */}
            {showAddChecklist ? (
              <div style={{ marginBottom: 24, padding: 12, background: 'var(--bg-tertiary)', borderRadius: 8 }}>
                <input type="text" placeholder="Checklist name..." value={newChecklistName} onChange={(e) => setNewChecklistName(e.target.value)} autoFocus style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 14, color: 'var(--text)', outline: 'none', marginBottom: 8 }} onKeyDown={(e) => e.key === 'Enter' && addChecklist()} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={addChecklist} style={{ padding: '8px 16px', background: 'var(--primary)', border: 'none', borderRadius: 6, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Add</button>
                  <button onClick={() => { setShowAddChecklist(false); setNewChecklistName(''); }} style={{ padding: '8px 16px', background: 'var(--bg-secondary)', border: 'none', borderRadius: 6, color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
                </div>
              </div>
            ) : null}
            
            {/* Activity Log (RESTORED) */}
            {card.activity && card.activity.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>📋 Activity</h3>
                <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                  {card.activity.map(act => (
                    <div key={act.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', fontSize: 12, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)' }}>
                      <span style={{ fontSize: 10, color: act.type === 'moved' ? 'var(--primary)' : act.type === 'checklist_complete' ? '#22C55E' : 'var(--text-muted)' }}>●</span>
                      <span style={{ flex: 1 }}>
                        {act.type === 'moved' && `Moved from ${act.from} to ${act.to}`}
                        {act.type === 'label_added' && `Label added: ${act.label}`}
                        {act.type === 'checklist_complete' && act.text}
                        {act.type === 'comment' && `Comment by ${act.author}`}
                        {!['moved', 'label_added', 'checklist_complete', 'comment'].includes(act.type) && act.text}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{act.at ? new Date(act.at).toLocaleDateString() : ''}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Comments */}
            <div>
              <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>💬 Comments</h3>
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <Avatar initials="JC" />
                <div style={{ flex: 1 }}>
                  <textarea placeholder="Write a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, color: 'var(--text)', resize: 'none', minHeight: 60, fontFamily: 'inherit', outline: 'none' }} />
                  {newComment.trim() && <button onClick={addComment} style={{ marginTop: 8, padding: '8px 16px', background: 'var(--primary)', border: 'none', borderRadius: 6, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Save</button>}
                </div>
              </div>
              {card.comments?.map(comment => {
                const member = project.members?.find(m => m.initials === comment.author);
                return (
                  <div key={comment.id} style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                    <Avatar initials={comment.author} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{member?.name || comment.author}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{comment.date}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{comment.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Sidebar */}
          <div style={{ width: 180, padding: 24, background: 'var(--bg-tertiary)', borderLeft: '1px solid var(--border-subtle)' }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8, fontWeight: 600 }}>Add to card</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <MenuItem icon="◉" label="Members" onClick={() => {}} />
                <MenuItem icon="☑" label="Checklist" onClick={() => setShowAddChecklist(true)} />
                <MenuItem icon="◷" label="Dates" onClick={() => {}} />
                <MenuItem icon="◫" label="Attachment" onClick={() => {}} />
                <MenuItem icon="🔗" label="Link" onClick={() => {}} />
              </div>
            </div>
            
            {/* AI Analysis Button */}
            <div style={{ marginBottom: 20 }}>
              <button 
                onClick={() => {
                  const newAnalysis = {
                    complexity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
                    estimatedHours: Math.floor(Math.random() * 40) + 4,
                    businessValue: Math.floor(Math.random() * 5) + 6,
                    lastRun: new Date().toISOString(),
                    suggestions: ['Break down into smaller tasks', 'Consider dependencies', 'Add detailed acceptance criteria']
                  };
                  onUpdate({ aiAnalysis: newAnalysis });
                }}
                style={{ width: '100%', padding: '10px 12px', background: 'var(--primary-muted)', border: 'none', borderRadius: 8, color: 'var(--primary)', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                ✦ Run AI Analysis
              </button>
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8, fontWeight: 600 }}>Actions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <MenuItem icon="↗" label="Move" onClick={() => {}} />
                <MenuItem icon="◫" label="Copy" onClick={() => {}} />
                <MenuItem icon="◎" label="Make template" onClick={() => {}} />
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8, fontWeight: 600 }}>AI</div>
              <button style={{ width: '100%', padding: '10px 12px', background: 'var(--primary-muted)', border: 'none', borderRadius: 6, color: 'var(--primary)', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>✦</span> Analyse
              </button>
            </div>
            <MenuDivider />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 12 }}>
              {!card.archived ? <MenuItem icon="▣" label="Archive" onClick={onArchive} /> : <><MenuItem icon="↩" label="Restore" onClick={onRestore} /><MenuItem icon="🗑" label="Delete" onClick={onDelete} danger /></>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectSettingsModal({ project, labels, setLabels, onClose, onUpdate, onArchive, onDelete }) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [status, setStatus] = useState(project.status);
  const [backgroundColor, setBackgroundColor] = useState(project.backgroundColor || 'none');
  const [projectLabels, setProjectLabels] = useState(project.labelIds || []);
  const { createLabel, updateLabel, deleteLabel } = useLabelsManager(labels, setLabels);
  
  const handleLabelToggle = (labelId) => {
    setProjectLabels(prev => prev.includes(labelId) 
      ? prev.filter(id => id !== labelId) 
      : [...prev, labelId]
    );
  };
  
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 20px', overflowY: 'auto', zIndex: 1000 }}>
      <div style={{ width: '100%', maxWidth: 500, background: 'var(--bg-secondary)', borderRadius: 12 }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>Project Settings</h2>
          <button onClick={onClose} style={{ background: 'var(--bg-tertiary)', border: 'none', color: 'var(--text-muted)', width: 32, height: 32, borderRadius: 6, cursor: 'pointer', fontSize: 18 }}>×</button>
        </div>
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Project Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '12px 14px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, color: 'var(--text)', outline: 'none' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={{ width: '100%', padding: '12px 14px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, color: 'var(--text)', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Status</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {Object.entries(projectStatusConfig).filter(([k]) => k !== 'archived').map(([key, cfg]) => (
                <button key={key} onClick={() => setStatus(key)} style={{ padding: '8px 16px', borderRadius: 20, border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer', background: status === key ? cfg.color : cfg.bg, color: status === key ? 'white' : cfg.color }}>{cfg.label}</button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Background</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
              {projectBackgrounds.map(bg => (
                <button key={bg.id} onClick={() => setBackgroundColor(bg.id)} title={bg.name} style={{ 
                  height: 40, borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: bg.color || 'var(--bg-tertiary)',
                  outline: backgroundColor === bg.id ? '2px solid var(--primary)' : 'none',
                  outlineOffset: 2,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-muted)', fontSize: 12
                }}>
                  {bg.id === 'none' && '✕'}
                </button>
              ))}
            </div>
            <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>{projectBackgrounds.find(b => b.id === backgroundColor)?.name || 'None'}</p>
          </div>
          <LabelsField 
            labelIds={projectLabels}
            labels={labels}
            onToggle={handleLabelToggle}
            onCreateLabel={createLabel}
            onEditLabel={updateLabel}
            onDeleteLabel={deleteLabel}
          />
          <MenuDivider />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onArchive} style={{ flex: 1, padding: '10px', background: '#F59E0B20', border: 'none', borderRadius: 6, color: '#F59E0B', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>▣ Archive</button>
            <button onClick={onDelete} style={{ flex: 1, padding: '10px', background: '#EF444420', border: 'none', borderRadius: 6, color: '#EF4444', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>🗑 Delete</button>
          </div>
        </div>
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: 10, background: 'var(--bg-tertiary)' }}>
          <button onClick={onClose} style={{ padding: '10px 18px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => { onUpdate({ ...project, name, description, status, backgroundColor, labelIds: projectLabels }); onClose(); }} style={{ padding: '10px 18px', background: 'var(--primary)', border: 'none', borderRadius: 6, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// FORMS & SETTINGS VIEWS
// ============================================================================

// ============================================================================
// QUESTIONNAIRE FORM (RESTORED from original mockup)
// ============================================================================

const defaultQuestions = [
  { id: 'q1', question: "What's one task you personally do every single week that you absolutely shouldn't, but it has to get done?", hint: "Think repetitive, time-consuming tasks", placeholder: "e.g., Manually updating spreadsheets, copying data between systems..." },
  { id: 'q2', question: "Describe one process in your business that's a bit of a mess right now.", hint: "Where do things fall through the cracks?", placeholder: "e.g., Our invoice approval process has too many steps and..." },
  { id: 'q3', question: "On a typical week, how many hours do YOU personally spend on things that aren't revenue-generating or strategic?", hint: "Be honest – it's usually more than you think", placeholder: "e.g., Around 15 hours on admin tasks like..." },
  { id: 'q4', question: "If you had an extra 20 hours per week back, what would you actually do with it? Be specific.", hint: "Dream a little here", placeholder: "e.g., Focus on business development, finally launch..." },
  { id: 'q5', question: "What's the most annoying handoff between team members or systems?", hint: "Where does communication break down?", placeholder: "e.g., When sales passes leads to customer success, we often..." },
  { id: 'q6', question: "Which reports or updates do you create manually that feel like they should be automatic?", hint: "The 'why am I still doing this?' tasks", placeholder: "e.g., Weekly status reports, monthly analytics summaries..." },
];

function QuestionnairePreview({ onClose }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  
  const question = defaultQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / defaultQuestions.length) * 100;
  
  const handleNext = () => {
    if (currentQuestion < defaultQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setSubmitted(true);
    }
  };
  
  const handlePrev = () => {
    if (currentQuestion > 0) setCurrentQuestion(prev => prev - 1);
  };

  if (submitted) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
        <div style={{ width: '100%', maxWidth: 500, background: 'var(--bg-secondary)', borderRadius: 16, textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 64, marginBottom: 24 }}>✨</div>
          <h2 style={{ margin: '0 0 12px', fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>Thank You!</h2>
          <p style={{ margin: '0 0 32px', fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Your responses have been submitted. Our AI will analyze your answers and generate personalized automation recommendations within 24 hours.
          </p>
          <button onClick={onClose} style={{ padding: '14px 32px', background: 'var(--primary)', border: 'none', borderRadius: 10, color: 'white', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
            Back to Forms
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 640, background: 'var(--bg-secondary)', borderRadius: 16, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>AF</div>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>AutoFlow</span>
            </div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'white' }}>AI & Automation Audit</h2>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', fontSize: 18 }}>×</button>
        </div>

        {/* Progress */}
        <div style={{ padding: '16px 32px', background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Question {currentQuestion + 1} of {defaultQuestions.length}</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{Math.round(progress)}% complete</span>
          </div>
          <div style={{ height: 4, background: 'var(--bg-secondary)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'var(--primary)', borderRadius: 2, transition: 'width 0.3s ease' }} />
          </div>
        </div>

        {/* Question */}
        <div style={{ padding: 32 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 24 }}>
            <span style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 16, fontWeight: 700, flexShrink: 0 }}>{currentQuestion + 1}</span>
            <div>
              <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 600, color: 'var(--text)', lineHeight: 1.4 }}>{question.question}</h3>
              {question.hint && <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>{question.hint}</p>}
            </div>
          </div>

          <textarea
            value={answers[question.id] || ''}
            onChange={(e) => setAnswers(prev => ({ ...prev, [question.id]: e.target.value }))}
            placeholder={question.placeholder}
            rows={5}
            style={{ width: '100%', padding: 16, background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 15, color: 'var(--text)', outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{(answers[question.id] || '').length > 0 ? `${(answers[question.id] || '').length} characters` : 'Required'}</span>
            <span style={{ fontSize: 12, color: (answers[question.id] || '').length >= 20 ? '#22C55E' : 'var(--text-muted)' }}>{(answers[question.id] || '').length >= 20 ? '✓ Good detail' : 'Tip: More detail helps our AI'}</span>
          </div>
        </div>

        {/* Navigation */}
        <div style={{ padding: '16px 32px 32px', display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={currentQuestion === 0 ? onClose : handlePrev} style={{ padding: '12px 20px', background: 'var(--bg-tertiary)', border: 'none', borderRadius: 8, color: 'var(--text-secondary)', fontSize: 14, cursor: 'pointer' }}>
            {currentQuestion === 0 ? 'Cancel' : '← Previous'}
          </button>
          <button onClick={handleNext} style={{ padding: '12px 24px', background: 'var(--primary)', border: 'none', borderRadius: 8, color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            {currentQuestion === defaultQuestions.length - 1 ? 'Submit' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}

function FormsView() {
  const [showPreview, setShowPreview] = useState(false);
  
  const templates = [
    { id: 't1', name: 'AI & Automation Audit', description: 'Discover automation opportunities in your business', questions: 6, responses: 12, isDefault: true },
    { id: 't2', name: 'Process Pain Points', description: 'Identify bottlenecks and inefficiencies', questions: 4, responses: 5, isDefault: false },
    { id: 't3', name: 'Tech Stack Assessment', description: 'Evaluate current tools and integrations', questions: 8, responses: 3, isDefault: false },
  ];

  return (
    <div style={{ flex: 1, padding: 32, overflowY: 'auto' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 700, color: 'var(--text)' }}>Forms</h1>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)' }}>Create and manage questionnaire templates</p>
          </div>
          <button style={{ padding: '10px 16px', background: 'var(--primary)', border: 'none', borderRadius: 8, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ New Template</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {templates.map(template => (
            <div key={template.id} style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: 20, border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                {template.isDefault && <span style={{ padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 500, background: 'var(--primary-muted)', color: 'var(--primary)' }}>Default</span>}
                {!template.isDefault && <span />}
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{template.questions} questions</span>
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>{template.name}</h3>
              <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{template.description}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{template.responses} responses</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setShowPreview(true)} style={{ padding: '8px 12px', background: 'var(--bg-tertiary)', border: 'none', borderRadius: 6, color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer' }}>Preview</button>
                  <button style={{ padding: '8px 12px', background: 'var(--primary)', border: 'none', borderRadius: 6, color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Share</button>
                </div>
              </div>
            </div>
          ))}
          
          {/* Add New Template Card */}
          <div style={{ background: 'var(--bg-tertiary)', borderRadius: 12, padding: 20, border: '2px dashed var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 180, cursor: 'pointer' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'var(--bg-secondary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-tertiary)'; }}>
            <span style={{ fontSize: 32, marginBottom: 8, opacity: 0.5 }}>+</span>
            <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>Create New Template</span>
          </div>
        </div>
      </div>
      
      {showPreview && <QuestionnairePreview onClose={() => setShowPreview(false)} />}
    </div>
  );
}

function SettingsView({ accent, setAccent, mode, setMode }) {
  return (
    <div style={{ padding: 24, maxWidth: 600 }}>
      <h1 style={{ margin: '0 0 24px', fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>Settings</h1>
      <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 20, border: '1px solid var(--border-subtle)', marginBottom: 16 }}>
        <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>Appearance</h2>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Mode</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {['dark', 'light'].map(m => <button key={m} onClick={() => setMode(m)} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer', background: mode === m ? 'var(--primary)' : 'var(--bg-tertiary)', color: mode === m ? 'white' : 'var(--text-secondary)', textTransform: 'capitalize' }}>{m}</button>)}
          </div>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Accent Colour</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Object.entries(accentThemes).map(([key, theme]) => <button key={key} onClick={() => setAccent(key)} style={{ width: 48, height: 48, borderRadius: 10, background: theme.primary, border: accent === key ? '3px solid var(--text)' : '3px solid transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 16 }}>{accent === key && '✓'}</button>)}
          </div>
          <p style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>{accentThemes[accent].name}</p>
        </div>
      </div>
      <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 20, border: '1px solid var(--border-subtle)' }}>
        <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>Account</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar initials="JC" size={48} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Jon Cross</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>jon@example.com</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN APP
// ============================================================================

export default function AutoFlowPrototype() {
  const [mode, setMode] = useState('dark');
  const [accent, setAccent] = useState('midnight');
  const [currentView, setCurrentView] = useState('dashboard');
  const [ideas, setIdeas] = useState(initialIdeas);
  const [projects, setProjects] = useState(initialProjects);
  const [labels, setLabels] = useState(initialLabels);
  const [showQuickCapture, setShowQuickCapture] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const [baseView, currentProjectId] = currentView.includes(':') ? currentView.split(':') : [currentView, null];
  
  useEffect(() => {
    const handler = (e) => { 
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setShowQuickCapture(true); }
      // Toggle sidebar with Cmd/Ctrl + B
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') { e.preventDefault(); setSidebarCollapsed(prev => !prev); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
  
  return (
    <ThemeProvider mode={mode} accent={accent}>
      <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', display: 'flex' }}>
        <Sidebar currentView={currentView} setCurrentView={setCurrentView} ideas={ideas} projects={projects} collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        
        <main style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          {baseView === 'dashboard' && <DashboardView ideas={ideas} projects={projects} setCurrentView={setCurrentView} setShowQuickCapture={setShowQuickCapture} />}
          {baseView === 'ideas' && <IdeasView ideas={ideas} setIdeas={setIdeas} labels={labels} setLabels={setLabels} projects={projects} setProjects={setProjects} setCurrentView={setCurrentView} showQuickCapture={showQuickCapture} setShowQuickCapture={setShowQuickCapture} />}
          {baseView === 'projects' && <ProjectsView projects={projects} setProjects={setProjects} labels={labels} setLabels={setLabels} currentProjectId={currentProjectId} setCurrentView={setCurrentView} />}
          {baseView === 'forms' && <FormsView />}
          {baseView === 'settings' && <SettingsView accent={accent} setAccent={setAccent} mode={mode} setMode={setMode} />}
        </main>
        
        {showQuickCapture && baseView !== 'ideas' && (
          <QuickCaptureModal onClose={() => setShowQuickCapture(false)} onSubmit={(title) => { setIdeas(prev => [{ id: `IDEA-${String(prev.length + 1).padStart(3, '0')}`, title, description: '', status: 'new', owner: '', frequency: '', timeSpent: '', painPoints: '', desiredOutcome: '', labelIds: [], createdAt: new Date().toISOString().split('T')[0], aiEvaluation: null }, ...prev]); setShowQuickCapture(false); }} onExpand={() => { setShowQuickCapture(false); setCurrentView('ideas'); }} />
        )}
        
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'var(--text-muted)', zIndex: 50 }}>
          <span>Press <kbd style={{ padding: '2px 6px', background: 'var(--bg-tertiary)', borderRadius: 3 }}>⌘K</kbd> to capture</span>
          <span style={{ padding: '2px 8px', background: 'var(--primary)', color: 'white', borderRadius: 4, fontWeight: 600 }}>PROTOTYPE v3</span>
        </div>
      </div>
    </ThemeProvider>
  );
}
