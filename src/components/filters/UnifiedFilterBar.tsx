"use client";

/**
 * UnifiedFilterBar
 * Modern chip-based filter system for Tasks & Ideas pages
 *
 * Features:
 * - Colour-coded filter chips
 * - Context-aware filter types (tasks vs ideas)
 * - Searchable entity dropdowns
 * - Multi-select with checkboxes
 * - Date presets
 * - Boolean toggles
 */

import { useState, useCallback, useRef } from "react";
import { Plus, Lightbulb, ListTodo, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DbIdea, DbLabel, DbColumn, DbTask } from "@/types/database";
import type { FilterValue, FilterContext, FilterDefinition } from "./types";
import {
  DUE_DATE_OPTIONS,
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
  HORIZON_OPTIONS,
  EFFORT_OPTIONS,
  DATE_CREATED_OPTIONS,
  STARTED_DATE_OPTIONS,
  COMPLETED_DATE_OPTIONS,
} from "./types";
import { getFiltersForContext, getFilterDefinition } from "./definitions";
import { FilterChip } from "./FilterChip";
import { AddFilterMenu } from "./AddFilterMenu";
import { MultiSelectControl } from "./controls/MultiSelectControl";
import { DateRangeControl } from "./controls/DateRangeControl";
import { EntitySearchControl } from "./controls/EntitySearchControl";
import { FilterDropdownPortal } from "./FilterDropdownPortal";

interface UnifiedFilterBarProps {
  context: FilterContext;
  filters: FilterValue[];
  onFiltersChange: (filters: FilterValue[]) => void;
  // Data sources for entity filters
  ideas?: DbIdea[];
  tasks?: DbTask[];
  labels?: DbLabel[];
  columns?: DbColumn[];
  owners?: string[];
  className?: string;
}

export function UnifiedFilterBar({
  context,
  filters,
  onFiltersChange,
  ideas = [],
  tasks = [],
  labels = [],
  columns = [],
  owners = [],
  className,
}: UnifiedFilterBarProps) {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [activeControl, setActiveControl] = useState<string | null>(null);
  const [controlData, setControlData] = useState<Record<string, string[]>>({});
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const chipRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [editingFilterId, setEditingFilterId] = useState<string | null>(null);

  const filterDefinitions = getFiltersForContext(context);
  const existingTypes = filters.map((f) => f.type);

  // ============================================
  // HANDLERS
  // ============================================

  const handleSelectFilterType = useCallback((definition: FilterDefinition) => {
    setShowAddMenu(false);

    // Boolean filters apply immediately
    if (definition.control === "boolean") {
      const newFilter: FilterValue = {
        id: `${definition.type}-${Date.now()}`,
        type: definition.type,
        value: true,
        displayLabel: definition.label,
      };
      onFiltersChange([...filters.filter((f) => f.type !== definition.type), newFilter]);
      return;
    }

    // Open the appropriate control
    setActiveControl(definition.type);

    // Pre-populate with existing filter values
    const existingFilter = filters.find((f) => f.type === definition.type);
    if (existingFilter && Array.isArray(existingFilter.value)) {
      setControlData((prev) => ({
        ...prev,
        [definition.type]: existingFilter.value as string[],
      }));
    } else {
      setControlData((prev) => ({
        ...prev,
        [definition.type]: [],
      }));
    }
  }, [filters, onFiltersChange]);

  const handleToggleOption = useCallback((type: string, value: string) => {
    setControlData((prev) => {
      const current = prev[type] || [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [type]: updated };
    });
  }, []);

  // Direct apply for date filters (avoids state race condition)
  const handleDateSelect = useCallback((type: "dueDate" | "createdAt" | "startedAt" | "completedAt", value: string) => {
    const optionsMap = {
      dueDate: DUE_DATE_OPTIONS,
      createdAt: DATE_CREATED_OPTIONS,
      startedAt: STARTED_DATE_OPTIONS,
      completedAt: COMPLETED_DATE_OPTIONS,
    };
    const options = optionsMap[type];
    const option = options.find((d) => d.value === value);

    const newFilter: FilterValue = {
      id: `${type}-${Date.now()}`,
      type,
      value: [value],
      displayLabel: option?.label || "Date",
    };

    onFiltersChange([...filters.filter((f) => f.type !== type), newFilter]);
    setActiveControl(null);
    setEditingFilterId(null);
    setControlData((prev) => ({ ...prev, [type]: [value] }));
  }, [filters, onFiltersChange]);

  const handleApplyFilter = useCallback((type: string) => {
    const values = controlData[type] || [];
    const definition = getFilterDefinition(type);

    if (values.length === 0 || !definition) {
      // Remove filter if no values selected
      onFiltersChange(filters.filter((f) => f.type !== type));
      setActiveControl(null);
      return;
    }

    // Build display label
    let displayLabel = "";
    let customColor: string | undefined;

    switch (type) {
      case "label": {
        const selectedLabels = values
          .map((v) => labels.find((l) => l.id === v))
          .filter(Boolean);
        displayLabel =
          selectedLabels.length === 1
            ? selectedLabels[0]?.name || "Label"
            : `${selectedLabels.length} labels`;
        if (selectedLabels.length === 1) {
          customColor = selectedLabels[0]?.color;
        }
        break;
      }
      case "priority": {
        const names = values
          .map((v) => PRIORITY_OPTIONS.find((p) => p.value === v)?.label)
          .filter(Boolean);
        displayLabel = names.join(", ");
        break;
      }
      case "status": {
        const names = values
          .map((v) => STATUS_OPTIONS.find((s) => s.value === v)?.label)
          .filter(Boolean);
        displayLabel =
          names.length === 1 ? names[0]! : `${names.length} statuses`;
        break;
      }
      case "horizon": {
        const names = values
          .map((v) => HORIZON_OPTIONS.find((h) => h.value === v)?.label)
          .filter(Boolean);
        displayLabel =
          names.length === 1 ? names[0]! : `${names.length} horizons`;
        break;
      }
      case "effort": {
        const names = values
          .map((v) => EFFORT_OPTIONS.find((e) => e.value === v)?.label)
          .filter(Boolean);
        displayLabel =
          names.length === 1 ? names[0]! : `${names.length} efforts`;
        break;
      }
      case "linkedIdea": {
        const selectedIdeas = values
          .map((v) => ideas.find((i) => i.id === v))
          .filter(Boolean);
        displayLabel =
          selectedIdeas.length === 1
            ? selectedIdeas[0]?.title || "Idea"
            : `${selectedIdeas.length} ideas`;
        break;
      }
      case "linkedTask": {
        const selectedTasks = values
          .map((v) => tasks.find((t) => t.id === v))
          .filter(Boolean);
        displayLabel =
          selectedTasks.length === 1
            ? selectedTasks[0]?.title || "Task"
            : `${selectedTasks.length} tasks`;
        break;
      }
      case "column": {
        const selectedCols = values
          .map((v) => columns.find((c) => c.id === v))
          .filter(Boolean);
        displayLabel =
          selectedCols.length === 1
            ? selectedCols[0]?.name || "Column"
            : `${selectedCols.length} columns`;
        break;
      }
      case "owner": {
        displayLabel =
          values.length === 1 ? values[0] : `${values.length} owners`;
        break;
      }
      case "dueDate": {
        const option = DUE_DATE_OPTIONS.find((d) => d.value === values[0]);
        displayLabel = option?.label || "Due Date";
        break;
      }
      case "createdAt": {
        const option = DATE_CREATED_OPTIONS.find((d) => d.value === values[0]);
        displayLabel = option?.label || "Date";
        break;
      }
      case "startedAt": {
        const option = STARTED_DATE_OPTIONS.find((d) => d.value === values[0]);
        displayLabel = option?.label || "Started";
        break;
      }
      case "completedAt": {
        const option = COMPLETED_DATE_OPTIONS.find((d) => d.value === values[0]);
        displayLabel = option?.label || "Completed";
        break;
      }
      default:
        displayLabel = values.join(", ");
    }

    const newFilter: FilterValue = {
      id: `${type}-${Date.now()}`,
      type: type as FilterValue["type"],
      value: values,
      displayLabel,
      color: customColor,
    };

    onFiltersChange([...filters.filter((f) => f.type !== type), newFilter]);
    setActiveControl(null);
    setEditingFilterId(null);
  }, [controlData, filters, labels, ideas, tasks, columns, onFiltersChange]);

  const handleRemoveFilter = useCallback((filterId: string) => {
    const filter = filters.find((f) => f.id === filterId);
    if (filter) {
      setControlData((prev) => ({ ...prev, [filter.type]: [] }));
    }
    onFiltersChange(filters.filter((f) => f.id !== filterId));
    setEditingFilterId(null);
  }, [filters, onFiltersChange]);

  const handleEditFilter = useCallback((filterId: string) => {
    const filter = filters.find((f) => f.id === filterId);
    if (!filter) return;

    setShowAddMenu(false);
    setEditingFilterId(filterId);
    setActiveControl(filter.type);

    // Pre-populate with existing values
    if (Array.isArray(filter.value)) {
      setControlData((prev) => ({
        ...prev,
        [filter.type]: filter.value as string[],
      }));
    } else if (typeof filter.value === "string") {
      setControlData((prev) => ({
        ...prev,
        [filter.type]: [filter.value as string],
      }));
    }
  }, [filters]);

  const handleClearAll = useCallback(() => {
    onFiltersChange([]);
    setControlData({});
  }, [onFiltersChange]);

  // ============================================
  // RENDER CONTROL
  // ============================================

  const renderActiveControl = () => {
    if (!activeControl) return null;

    const definition = getFilterDefinition(activeControl);
    if (!definition) return null;

    const currentValues = controlData[activeControl] || [];

    switch (activeControl) {
      case "label":
        return (
          <MultiSelectControl
            isOpen={true}
            onClose={() => setActiveControl(null)}
            options={labels.map((l) => ({
              value: l.id,
              label: l.name || "Unnamed",
              color: l.color,
            }))}
            selected={currentValues}
            onToggle={(v) => handleToggleOption("label", v)}
            onApply={() => handleApplyFilter("label")}
            title="Labels"
            searchable
          />
        );

      case "priority":
        return (
          <MultiSelectControl
            isOpen={true}
            onClose={() => setActiveControl(null)}
            options={PRIORITY_OPTIONS}
            selected={currentValues}
            onToggle={(v) => handleToggleOption("priority", v)}
            onApply={() => handleApplyFilter("priority")}
            title="Priority"
          />
        );

      case "status":
        return (
          <MultiSelectControl
            isOpen={true}
            onClose={() => setActiveControl(null)}
            options={STATUS_OPTIONS}
            selected={currentValues}
            onToggle={(v) => handleToggleOption("status", v)}
            onApply={() => handleApplyFilter("status")}
            title="Status"
          />
        );

      case "horizon":
        return (
          <MultiSelectControl
            isOpen={true}
            onClose={() => setActiveControl(null)}
            options={HORIZON_OPTIONS}
            selected={currentValues}
            onToggle={(v) => handleToggleOption("horizon", v)}
            onApply={() => handleApplyFilter("horizon")}
            title="Horizon"
          />
        );

      case "effort":
        return (
          <MultiSelectControl
            isOpen={true}
            onClose={() => setActiveControl(null)}
            options={EFFORT_OPTIONS}
            selected={currentValues}
            onToggle={(v) => handleToggleOption("effort", v)}
            onApply={() => handleApplyFilter("effort")}
            title="Effort"
          />
        );

      case "column":
        return (
          <MultiSelectControl
            isOpen={true}
            onClose={() => setActiveControl(null)}
            options={columns.map((c) => ({
              value: c.id,
              label: c.name,
            }))}
            selected={currentValues}
            onToggle={(v) => handleToggleOption("column", v)}
            onApply={() => handleApplyFilter("column")}
            title="Columns"
          />
        );

      case "dueDate":
        return (
          <DateRangeControl
            isOpen={true}
            onClose={() => setActiveControl(null)}
            options={DUE_DATE_OPTIONS}
            selected={currentValues[0] || null}
            onSelect={(v) => handleDateSelect("dueDate", v)}
          />
        );

      case "createdAt":
        return (
          <DateRangeControl
            isOpen={true}
            onClose={() => setActiveControl(null)}
            options={DATE_CREATED_OPTIONS}
            selected={currentValues[0] || null}
            onSelect={(v) => handleDateSelect("createdAt", v)}
          />
        );

      case "startedAt":
        return (
          <DateRangeControl
            isOpen={true}
            onClose={() => setActiveControl(null)}
            options={STARTED_DATE_OPTIONS}
            selected={currentValues[0] || null}
            onSelect={(v) => handleDateSelect("startedAt", v)}
          />
        );

      case "completedAt":
        return (
          <DateRangeControl
            isOpen={true}
            onClose={() => setActiveControl(null)}
            options={COMPLETED_DATE_OPTIONS}
            selected={currentValues[0] || null}
            onSelect={(v) => handleDateSelect("completedAt", v)}
          />
        );

      case "linkedIdea":
        return (
          <EntitySearchControl
            isOpen={true}
            onClose={() => setActiveControl(null)}
            entities={ideas.map((i) => ({
              id: i.id,
              label: i.title,
              sublabel: i.status,
            }))}
            selected={currentValues}
            onToggle={(v) => handleToggleOption("linkedIdea", v)}
            onApply={() => handleApplyFilter("linkedIdea")}
            title="Ideas"
            icon={Lightbulb}
            iconColor="text-amber-500"
          />
        );

      case "linkedTask":
        return (
          <EntitySearchControl
            isOpen={true}
            onClose={() => setActiveControl(null)}
            entities={tasks.map((t) => ({
              id: t.id,
              label: t.title,
            }))}
            selected={currentValues}
            onToggle={(v) => handleToggleOption("linkedTask", v)}
            onApply={() => handleApplyFilter("linkedTask")}
            title="Tasks"
            icon={ListTodo}
            iconColor="text-cyan-500"
          />
        );

      case "owner":
        return (
          <EntitySearchControl
            isOpen={true}
            onClose={() => setActiveControl(null)}
            entities={owners.map((o) => ({
              id: o,
              label: o,
            }))}
            selected={currentValues}
            onToggle={(v) => handleToggleOption("owner", v)}
            onApply={() => handleApplyFilter("owner")}
            title="Owners"
            icon={User}
            iconColor="text-slate-400"
          />
        );

      default:
        return null;
    }
  };

  // ============================================
  // RENDER
  // ============================================

  // Get anchor ref for portal positioning
  const getAnchorRef = () => {
    if (editingFilterId) {
      const el = chipRefs.current.get(editingFilterId);
      if (el) return { current: el };
    }
    return addButtonRef;
  };

  return (
    <div data-testid="filter-panel" className={cn("flex items-center gap-2 flex-wrap", className)}>
      {/* Active Filter Chips */}
      {filters.map((filter) => (
        <div
          key={filter.id}
          ref={(el) => {
            if (el) chipRefs.current.set(filter.id, el);
            else chipRefs.current.delete(filter.id);
          }}
        >
          <FilterChip
            type={filter.type}
            displayLabel={filter.displayLabel}
            customColor={filter.color}
            onRemove={() => handleRemoveFilter(filter.id)}
            onEdit={() => handleEditFilter(filter.id)}
          />
        </div>
      ))}

      {/* Add Filter Button */}
      <div className="relative">
        <button
          ref={addButtonRef}
          data-testid="filter-panel-toggle"
          onClick={() => {
            setShowAddMenu(!showAddMenu);
            setActiveControl(null);
            setEditingFilterId(null);
          }}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-foreground-muted border border-dashed border-border rounded-full hover:border-primary hover:text-primary transition-colors"
        >
          <Plus className="w-3 h-3" />
          Add Filter
        </button>
      </div>

      {/* Clear All Button */}
      {filters.length > 0 && (
        <button
          data-testid="filter-panel-clear"
          onClick={handleClearAll}
          className="text-xs text-foreground-muted hover:text-foreground transition-colors"
        >
          Clear all
        </button>
      )}

      {/* Add Filter Menu - Portal */}
      <FilterDropdownPortal isOpen={showAddMenu && !activeControl} anchorRef={addButtonRef}>
        <AddFilterMenu
          isOpen={true}
          onClose={() => setShowAddMenu(false)}
          filterDefinitions={filterDefinitions}
          existingTypes={existingTypes}
          onSelectType={handleSelectFilterType}
        />
      </FilterDropdownPortal>

      {/* Active Control - Portal */}
      <FilterDropdownPortal isOpen={!!activeControl} anchorRef={getAnchorRef()}>
        {renderActiveControl()}
      </FilterDropdownPortal>
    </div>
  );
}
