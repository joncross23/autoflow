/**
 * Unified Filter Bar Mockup
 * Modern chip-based filter system for Tasks & Ideas pages
 *
 * Preview this in Claude Artifacts or copy to a React playground
 */

import React, { useState } from 'react';

// Icons (inline SVGs for artifact compatibility)
const Icons = {
  Plus: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  X: () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  ChevronDown: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  ),
  Search: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Check: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  Tag: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  ),
  Lightbulb: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  Calendar: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  AlertCircle: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Paperclip: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
    </svg>
  ),
  User: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Columns: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
    </svg>
  ),
  CheckCircle: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

// Filter definitions
const FILTER_DEFINITIONS = {
  tasks: [
    { type: 'linkedIdea', label: 'Linked Idea', icon: Icons.Lightbulb, color: 'amber' },
    { type: 'label', label: 'Label', icon: Icons.Tag, color: 'blue' },
    { type: 'dueDate', label: 'Due Date', icon: Icons.Calendar, color: 'purple' },
    { type: 'priority', label: 'Priority', icon: Icons.AlertCircle, color: 'red' },
    { type: 'column', label: 'Column', icon: Icons.Columns, color: 'slate' },
    { type: 'assignee', label: 'Assignee', icon: Icons.User, color: 'cyan' },
    { type: 'hasAttachment', label: 'Has Attachment', icon: Icons.Paperclip, color: 'blue' },
    { type: 'completed', label: 'Completed', icon: Icons.CheckCircle, color: 'green' },
  ],
  ideas: [
    { type: 'status', label: 'Status', icon: Icons.CheckCircle, color: 'green' },
    { type: 'label', label: 'Label', icon: Icons.Tag, color: 'blue' },
    { type: 'horizon', label: 'Planning Horizon', icon: Icons.Calendar, color: 'blue' },
    { type: 'priority', label: 'Priority', icon: Icons.AlertCircle, color: 'red' },
    { type: 'owner', label: 'Owner', icon: Icons.User, color: 'slate' },
    { type: 'linkedTasks', label: 'Linked Tasks', icon: Icons.Columns, color: 'cyan' },
    { type: 'hasAttachment', label: 'Has Attachment', icon: Icons.Paperclip, color: 'blue' },
  ],
};

// Sample data
const SAMPLE_IDEAS = [
  { id: '1', title: 'Automated invoice processing' },
  { id: '2', title: 'Customer onboarding workflow' },
  { id: '3', title: 'Slack notification integration' },
];

const SAMPLE_LABELS = [
  { id: '1', name: 'Bug', color: '#ef4444' },
  { id: '2', name: 'Feature', color: '#3b82f6' },
  { id: '3', name: 'Urgent', color: '#f59e0b' },
  { id: '4', name: 'Documentation', color: '#8b5cf6' },
];

const DUE_DATE_OPTIONS = [
  { value: 'overdue', label: 'Overdue' },
  { value: 'today', label: 'Due Today' },
  { value: 'this-week', label: 'This Week' },
  { value: 'this-month', label: 'This Month' },
  { value: 'no-date', label: 'No Due Date' },
];

const PRIORITY_OPTIONS = [
  { value: 'critical', label: 'Critical', color: '#dc2626' },
  { value: 'high', label: 'High', color: '#ef4444' },
  { value: 'medium', label: 'Medium', color: '#f59e0b' },
  { value: 'low', label: 'Low', color: '#22c55e' },
];

const STATUS_OPTIONS = [
  { value: 'new', label: 'New', color: '#6b7280' },
  { value: 'evaluating', label: 'Evaluating', color: '#3b82f6' },
  { value: 'accepted', label: 'Accepted', color: '#22c55e' },
  { value: 'doing', label: 'Doing', color: '#8b5cf6' },
  { value: 'complete', label: 'Complete', color: '#10b981' },
  { value: 'parked', label: 'Parked', color: '#f59e0b' },
  { value: 'dropped', label: 'Dropped', color: '#ef4444' },
];

// Chip colour classes
const chipColors = {
  amber: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  blue: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  purple: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  red: 'bg-red-500/15 text-red-400 border-red-500/20',
  green: 'bg-green-500/15 text-green-400 border-green-500/20',
  cyan: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
  slate: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
};

// Filter Chip Component
function FilterChip({ filter, onRemove }) {
  const Icon = filter.icon;
  return (
    <div className={`
      inline-flex items-center gap-1.5 px-2.5 py-1.5
      text-xs font-medium rounded-full border
      ${chipColors[filter.chipColor] || chipColors.slate}
    `}>
      <Icon />
      <span className="max-w-[120px] truncate">{filter.displayLabel}</span>
      <button
        onClick={onRemove}
        className="ml-0.5 p-0.5 rounded-full hover:bg-white/10 transition-colors"
      >
        <Icons.X />
      </button>
    </div>
  );
}

// Add Filter Menu
function AddFilterMenu({ isOpen, onClose, filterDefs, onSelectType, existingTypes }) {
  if (!isOpen) return null;

  const availableFilters = filterDefs.filter(f => !existingTypes.includes(f.type));

  return (
    <div className="absolute left-0 top-full mt-1 w-56 bg-[#1e1e2e] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
      <div className="p-1">
        <div className="px-3 py-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
          Add Filter
        </div>
        {availableFilters.map((filter) => {
          const Icon = filter.icon;
          return (
            <button
              key={filter.type}
              onClick={() => onSelectType(filter)}
              className="flex items-center gap-3 w-full px-3 py-2 text-sm text-left rounded-md hover:bg-white/5 transition-colors"
            >
              <span className={`${chipColors[filter.color]} p-1.5 rounded`}>
                <Icon />
              </span>
              {filter.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Multi-Select Control (for labels, priorities, etc.)
function MultiSelectControl({ isOpen, onClose, options, selected, onToggle, title, searchable }) {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filtered = searchable && search
    ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  return (
    <div className="absolute left-0 top-full mt-1 w-64 bg-[#1e1e2e] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
      {searchable && (
        <div className="p-2 border-b border-white/5">
          <div className="flex items-center gap-2 px-2 py-1.5 bg-white/5 rounded-md">
            <Icons.Search />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${title.toLowerCase()}...`}
              className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-slate-500"
              autoFocus
            />
          </div>
        </div>
      )}
      <div className="max-h-48 overflow-y-auto p-1">
        {filtered.map((option) => {
          const isSelected = selected.includes(option.value);
          return (
            <button
              key={option.value}
              onClick={() => onToggle(option.value)}
              className="flex items-center gap-3 w-full px-3 py-2 text-sm text-left rounded-md hover:bg-white/5 transition-colors"
            >
              <div className={`
                w-4 h-4 rounded border flex items-center justify-center
                ${isSelected ? 'bg-cyan-500 border-cyan-500' : 'border-white/20'}
              `}>
                {isSelected && <Icons.Check />}
              </div>
              {option.color && (
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: option.color }}
                />
              )}
              <span className="flex-1">{option.label}</span>
            </button>
          );
        })}
      </div>
      <div className="p-2 border-t border-white/5">
        <button
          onClick={onClose}
          className="w-full px-3 py-1.5 text-sm font-medium bg-cyan-500/20 text-cyan-400 rounded-md hover:bg-cyan-500/30 transition-colors"
        >
          Apply
        </button>
      </div>
    </div>
  );
}

// Date Range Control
function DateRangeControl({ isOpen, onClose, selected, onSelect }) {
  if (!isOpen) return null;

  return (
    <div className="absolute left-0 top-full mt-1 w-48 bg-[#1e1e2e] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
      <div className="p-1">
        {DUE_DATE_OPTIONS.map((option) => {
          const isSelected = selected === option.value;
          return (
            <button
              key={option.value}
              onClick={() => {
                onSelect(option.value);
                onClose();
              }}
              className={`
                flex items-center justify-between w-full px-3 py-2 text-sm text-left rounded-md transition-colors
                ${isSelected ? 'bg-purple-500/20 text-purple-400' : 'hover:bg-white/5'}
              `}
            >
              {option.label}
              {isSelected && <Icons.Check />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Main Unified Filter Bar
function UnifiedFilterBar({ context = 'tasks' }) {
  const [filters, setFilters] = useState([]);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [activeControl, setActiveControl] = useState(null);
  const [controlData, setControlData] = useState({});

  const filterDefs = FILTER_DEFINITIONS[context];
  const existingTypes = filters.map(f => f.type);

  const handleSelectFilterType = (filterDef) => {
    setShowAddMenu(false);
    setActiveControl(filterDef.type);
    setControlData({ ...controlData, [filterDef.type]: controlData[filterDef.type] || [] });
  };

  const handleToggleOption = (type, value) => {
    const current = controlData[type] || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    setControlData({ ...controlData, [type]: updated });
  };

  const handleApplyFilter = (type) => {
    const values = controlData[type] || [];
    if (values.length === 0) {
      setActiveControl(null);
      return;
    }

    const def = filterDefs.find(f => f.type === type);
    let displayLabel = '';

    if (type === 'label') {
      const names = values.map(v => SAMPLE_LABELS.find(l => l.id === v)?.name).filter(Boolean);
      displayLabel = names.length === 1 ? names[0] : `${names.length} labels`;
    } else if (type === 'priority') {
      const names = values.map(v => PRIORITY_OPTIONS.find(p => p.value === v)?.label).filter(Boolean);
      displayLabel = names.join(', ');
    } else if (type === 'status') {
      const names = values.map(v => STATUS_OPTIONS.find(s => s.value === v)?.label).filter(Boolean);
      displayLabel = names.length === 1 ? names[0] : `${names.length} statuses`;
    } else if (type === 'linkedIdea') {
      const idea = SAMPLE_IDEAS.find(i => i.id === values[0]);
      displayLabel = idea?.title || 'Idea';
    } else if (type === 'dueDate') {
      displayLabel = DUE_DATE_OPTIONS.find(d => d.value === values[0])?.label || 'Date';
    } else if (type === 'hasAttachment' || type === 'completed') {
      displayLabel = def.label;
    }

    const newFilter = {
      id: `${type}-${Date.now()}`,
      type,
      values,
      displayLabel,
      icon: def.icon,
      chipColor: def.color,
    };

    setFilters([...filters.filter(f => f.type !== type), newFilter]);
    setActiveControl(null);
  };

  const handleRemoveFilter = (filterId) => {
    const filter = filters.find(f => f.id === filterId);
    if (filter) {
      setControlData({ ...controlData, [filter.type]: [] });
    }
    setFilters(filters.filter(f => f.id !== filterId));
  };

  const handleClearAll = () => {
    setFilters([]);
    setControlData({});
  };

  const renderControl = () => {
    if (!activeControl) return null;

    const def = filterDefs.find(f => f.type === activeControl);

    if (activeControl === 'label') {
      return (
        <MultiSelectControl
          isOpen={true}
          onClose={() => handleApplyFilter('label')}
          options={SAMPLE_LABELS.map(l => ({ value: l.id, label: l.name, color: l.color }))}
          selected={controlData.label || []}
          onToggle={(v) => handleToggleOption('label', v)}
          title="Labels"
          searchable
        />
      );
    }

    if (activeControl === 'priority') {
      return (
        <MultiSelectControl
          isOpen={true}
          onClose={() => handleApplyFilter('priority')}
          options={PRIORITY_OPTIONS}
          selected={controlData.priority || []}
          onToggle={(v) => handleToggleOption('priority', v)}
          title="Priority"
        />
      );
    }

    if (activeControl === 'status') {
      return (
        <MultiSelectControl
          isOpen={true}
          onClose={() => handleApplyFilter('status')}
          options={STATUS_OPTIONS}
          selected={controlData.status || []}
          onToggle={(v) => handleToggleOption('status', v)}
          title="Status"
        />
      );
    }

    if (activeControl === 'linkedIdea') {
      return (
        <MultiSelectControl
          isOpen={true}
          onClose={() => handleApplyFilter('linkedIdea')}
          options={SAMPLE_IDEAS.map(i => ({ value: i.id, label: i.title }))}
          selected={controlData.linkedIdea || []}
          onToggle={(v) => handleToggleOption('linkedIdea', v)}
          title="Ideas"
          searchable
        />
      );
    }

    if (activeControl === 'dueDate') {
      return (
        <DateRangeControl
          isOpen={true}
          onClose={() => handleApplyFilter('dueDate')}
          selected={(controlData.dueDate || [])[0]}
          onSelect={(v) => {
            setControlData({ ...controlData, dueDate: [v] });
            setTimeout(() => handleApplyFilter('dueDate'), 0);
          }}
        />
      );
    }

    // Boolean filters (hasAttachment, completed)
    if (activeControl === 'hasAttachment' || activeControl === 'completed') {
      setControlData({ ...controlData, [activeControl]: [true] });
      setTimeout(() => handleApplyFilter(activeControl), 0);
      return null;
    }

    return null;
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Active Filter Chips */}
      {filters.map((filter) => (
        <FilterChip
          key={filter.id}
          filter={filter}
          onRemove={() => handleRemoveFilter(filter.id)}
        />
      ))}

      {/* Add Filter Button */}
      <div className="relative">
        <button
          onClick={() => {
            setShowAddMenu(!showAddMenu);
            setActiveControl(null);
          }}
          className="
            inline-flex items-center gap-1.5 px-2.5 py-1.5
            text-xs font-medium text-slate-400
            border border-dashed border-slate-600 rounded-full
            hover:border-cyan-500 hover:text-cyan-400
            transition-colors
          "
        >
          <Icons.Plus />
          Add Filter
        </button>

        <AddFilterMenu
          isOpen={showAddMenu}
          onClose={() => setShowAddMenu(false)}
          filterDefs={filterDefs}
          existingTypes={existingTypes}
          onSelectType={handleSelectFilterType}
        />

        {renderControl()}
      </div>

      {/* Clear All Button */}
      {filters.length > 0 && (
        <button
          onClick={handleClearAll}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors ml-1"
        >
          Clear all
        </button>
      )}
    </div>
  );
}

// Demo App showing both contexts
export default function UnifiedFilterBarDemo() {
  const [activeTab, setActiveTab] = useState('tasks');

  return (
    <div className="min-h-screen bg-[#0f0f17] text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Unified Filter Bar</h1>
          <p className="text-slate-400">
            Modern chip-based filter system for Tasks & Ideas pages
          </p>
        </div>

        {/* Context Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${activeTab === 'tasks'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'bg-white/5 text-slate-400 border border-transparent hover:bg-white/10'}
            `}
          >
            Tasks View
          </button>
          <button
            onClick={() => setActiveTab('ideas')}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${activeTab === 'ideas'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'bg-white/5 text-slate-400 border border-transparent hover:bg-white/10'}
            `}
          >
            Ideas View
          </button>
        </div>

        {/* Filter Bar Demo */}
        <div className="bg-[#1a1a2e] border border-white/10 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-4 mb-4">
            {/* Search Input */}
            <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg flex-1 max-w-xs">
              <Icons.Search />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent text-sm focus:outline-none placeholder:text-slate-500 w-full"
              />
            </div>

            {/* Filter Bar */}
            <div className="flex-1">
              <UnifiedFilterBar context={activeTab} key={activeTab} />
            </div>
          </div>

          {/* Placeholder Content */}
          <div className="border-t border-white/5 pt-4 mt-2">
            <div className="text-sm text-slate-500 text-center py-8">
              {activeTab === 'tasks' ? 'Kanban board would appear here' : 'Ideas grid would appear here'}
            </div>
          </div>
        </div>

        {/* Feature List */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-[#1a1a2e] border border-white/10 rounded-xl p-4">
            <h3 className="font-medium mb-3 text-cyan-400">Tasks Filters</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>• Linked Idea (searchable)</li>
              <li>• Labels (multi-select)</li>
              <li>• Due Date (presets + range)</li>
              <li>• Priority (multi-select)</li>
              <li>• Column (multi-select)</li>
              <li>• Assignee (searchable)</li>
              <li>• Has Attachment (boolean)</li>
              <li>• Completed (boolean)</li>
            </ul>
          </div>
          <div className="bg-[#1a1a2e] border border-white/10 rounded-xl p-4">
            <h3 className="font-medium mb-3 text-cyan-400">Ideas Filters</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>• Status (multi-select)</li>
              <li>• Labels (multi-select)</li>
              <li>• Planning Horizon (multi-select)</li>
              <li>• Priority (multi-select)</li>
              <li>• Owner (searchable)</li>
              <li>• Linked Tasks (searchable)</li>
              <li>• Has Attachment (boolean)</li>
            </ul>
          </div>
        </div>

        {/* Design Notes */}
        <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <h3 className="font-medium text-amber-400 mb-2">Design Notes</h3>
          <ul className="space-y-1 text-sm text-amber-200/70">
            <li>• Colour-coded chips by filter type for quick scanning</li>
            <li>• Searchable dropdowns for large lists (ideas, labels)</li>
            <li>• Multi-select with checkboxes and Apply button</li>
            <li>• Date presets for common ranges</li>
            <li>• Boolean filters add immediately (no submenu)</li>
            <li>• Clear all button when filters active</li>
            <li>• Mobile: controls open as bottom sheets</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
