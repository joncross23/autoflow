"use client";

import { useState, useMemo } from "react";
import { Search, Filter, CheckCircle2, Circle, ChevronDown, X } from "lucide-react";
import type { DbTask, DbColumn, DbLabel } from "@/types/database";

interface TaskListViewProps {
  tasks: DbTask[];
  columns: DbColumn[];
  taskLabels?: Record<string, DbLabel[]>;
  onTaskClick?: (task: DbTask) => void;
  onToggleTask?: (task: DbTask) => void;
}

type FilterStatus = "all" | "pending" | "completed";

export function TaskListView({
  tasks,
  columns,
  taskLabels = {},
  onTaskClick,
  onToggleTask,
}: TaskListViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterColumn, setFilterColumn] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Get column map for display
  const columnMap = useMemo(() => {
    const map: Record<string, DbColumn> = {};
    columns.forEach((col) => {
      map[col.id] = col;
    });
    return map;
  }, [columns]);

  // Filter and search tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDesc = task.description?.toLowerCase().includes(query);
        const labels = taskLabels[task.id] || [];
        const matchesLabel = labels.some((l) => l.name.toLowerCase().includes(query));
        if (!matchesTitle && !matchesDesc && !matchesLabel) {
          return false;
        }
      }

      // Status filter
      if (filterStatus === "pending" && task.completed) return false;
      if (filterStatus === "completed" && !task.completed) return false;

      // Column filter
      if (filterColumn !== "all" && task.column_id !== filterColumn) return false;

      return true;
    });
  }, [tasks, searchQuery, filterStatus, filterColumn, taskLabels]);

  // Group tasks by column
  const groupedTasks = useMemo(() => {
    const groups: Record<string, DbTask[]> = {};
    columns.forEach((col) => {
      groups[col.id] = [];
    });
    filteredTasks.forEach((task) => {
      if (task.column_id && groups[task.column_id]) {
        groups[task.column_id].push(task);
      }
    });
    return groups;
  }, [filteredTasks, columns]);

  const columnColorClasses: Record<string, string> = {
    slate: "bg-slate-500",
    blue: "bg-blue-500",
    green: "bg-green-500",
    orange: "bg-orange-500",
    purple: "bg-purple-500",
    red: "bg-red-500",
    yellow: "bg-yellow-500",
    pink: "bg-pink-500",
  };

  const labelColorClasses: Record<string, string> = {
    red: "bg-red-500/20 text-red-400",
    orange: "bg-orange-500/20 text-orange-400",
    yellow: "bg-yellow-500/20 text-yellow-400",
    green: "bg-green-500/20 text-green-400",
    blue: "bg-blue-500/20 text-blue-400",
    purple: "bg-purple-500/20 text-purple-400",
    pink: "bg-pink-500/20 text-pink-400",
    slate: "bg-slate-500/20 text-slate-400",
  };

  const activeFiltersCount =
    (filterStatus !== "all" ? 1 : 0) + (filterColumn !== "all" ? 1 : 0);

  return (
    <div className="flex flex-col h-full">
      {/* Search and Filter Bar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-9 pr-4 py-2 bg-bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
            showFilters || activeFiltersCount > 0
              ? "bg-primary/10 border-primary text-primary"
              : "bg-bg-secondary border-border text-foreground-secondary hover:text-foreground"
          }`}
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="px-1.5 py-0.5 bg-primary text-white text-xs rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {/* Quick status filters */}
        <div className="flex items-center gap-1 bg-bg-secondary rounded-lg p-1">
          {(["all", "pending", "completed"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                filterStatus === status
                  ? "bg-bg-tertiary text-foreground font-medium"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              {status === "all" ? "All" : status === "pending" ? "To Do" : "Done"}
            </button>
          ))}
        </div>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="flex items-center gap-4 mb-4 p-3 bg-bg-secondary rounded-lg">
          {/* Column Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground-muted">Column:</span>
            <select
              value={filterColumn}
              onChange={(e) => setFilterColumn(e.target.value)}
              className="px-3 py-1.5 bg-bg-tertiary border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All columns</option>
              {columns.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.name}
                </option>
              ))}
            </select>
          </div>

          {/* Clear filters */}
          {activeFiltersCount > 0 && (
            <button
              onClick={() => {
                setFilterStatus("all");
                setFilterColumn("all");
              }}
              className="text-sm text-foreground-muted hover:text-foreground"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Results count */}
      <div className="text-sm text-foreground-muted mb-3">
        {filteredTasks.length} of {tasks.length} tasks
        {searchQuery && ` matching "${searchQuery}"`}
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto space-y-6">
        {columns
          .sort((a, b) => a.position - b.position)
          .map((column) => {
            const columnTasks = groupedTasks[column.id] || [];
            if (columnTasks.length === 0 && filterColumn !== "all" && filterColumn !== column.id) {
              return null;
            }

            return (
              <div key={column.id}>
                {/* Column Header */}
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`w-3 h-3 rounded ${
                      columnColorClasses[column.color || "slate"] || columnColorClasses.slate
                    }`}
                  />
                  <span className="font-medium text-sm">{column.name}</span>
                  <span className="text-xs text-foreground-muted">
                    ({columnTasks.length})
                  </span>
                </div>

                {/* Tasks */}
                {columnTasks.length === 0 ? (
                  <div className="text-sm text-foreground-muted py-2 pl-5">
                    No tasks in this column
                  </div>
                ) : (
                  <div className="space-y-1">
                    {columnTasks.map((task) => {
                      const labels = taskLabels[task.id] || [];
                      return (
                        <div
                          key={task.id}
                          className="flex items-start gap-3 p-3 bg-bg-secondary hover:bg-bg-tertiary rounded-lg cursor-pointer transition-colors group"
                          onClick={() => onTaskClick?.(task)}
                        >
                          {/* Checkbox */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleTask?.(task);
                            }}
                            className="mt-0.5 text-foreground-muted hover:text-primary"
                          >
                            {task.completed ? (
                              <CheckCircle2 className="h-5 w-5 text-success" />
                            ) : (
                              <Circle className="h-5 w-5" />
                            )}
                          </button>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm ${
                                task.completed
                                  ? "line-through text-foreground-muted"
                                  : "text-foreground"
                              }`}
                            >
                              {task.title}
                            </p>
                            {task.description && (
                              <p className="text-xs text-foreground-muted mt-1 line-clamp-1">
                                {task.description}
                              </p>
                            )}
                            {/* Labels */}
                            {labels.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {labels.map((label) => (
                                  <span
                                    key={label.id}
                                    className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${
                                      labelColorClasses[label.color] || labelColorClasses.slate
                                    }`}
                                  >
                                    {label.name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}
