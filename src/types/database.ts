/**
 * Supabase Database Types
 * These types map to the actual database schema
 *
 * V1.0 Pivot: Unified Ideas model (Projects merged into Ideas)
 */

// ============================================
// IDEA TYPES (V1.0 Unified Model)
// ============================================

// V1.0 Unified status workflow
export type IdeaStatus =
  | "new"           // Just captured
  | "evaluating"    // AI analysis in progress
  | "accepted"      // Ready to work on (was "project")
  | "doing"         // In progress
  | "complete"      // Done
  | "parked"        // On hold
  | "dropped";      // Won't do

export type IdeaFrequency = "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "adhoc";

export type EffortEstimate = "trivial" | "small" | "medium" | "large" | "xlarge";

export type Priority = "low" | "medium" | "high" | "critical";

export interface DbIdea {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: IdeaStatus;
  frequency: IdeaFrequency | null;
  time_spent: number | null;    // minutes per occurrence
  owner: string | null;         // Legacy text field
  owner_id: string | null;      // FK to auth.users
  team_id: string | null;       // Future: team-based access
  pain_points: string | null;
  desired_outcome: string | null;
  effort_estimate: EffortEstimate | null;
  priority: Priority;
  position: number;
  archived: boolean;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbIdeaInsert {
  title: string;
  description?: string | null;
  status?: IdeaStatus;
  frequency?: IdeaFrequency | null;
  time_spent?: number | null;
  owner?: string | null;
  owner_id?: string | null;
  pain_points?: string | null;
  desired_outcome?: string | null;
  effort_estimate?: EffortEstimate | null;
  priority?: Priority;
  position?: number;
  archived?: boolean;
  started_at?: string | null;
  completed_at?: string | null;
}

export interface DbIdeaUpdate {
  title?: string;
  description?: string | null;
  status?: IdeaStatus;
  frequency?: IdeaFrequency | null;
  time_spent?: number | null;
  owner?: string | null;
  owner_id?: string | null;
  pain_points?: string | null;
  desired_outcome?: string | null;
  effort_estimate?: EffortEstimate | null;
  priority?: Priority;
  position?: number;
  archived?: boolean;
  started_at?: string | null;
  completed_at?: string | null;
  updated_at?: string;
}

// ============================================
// AI EVALUATION TYPES
// ============================================

export interface AiEvaluation {
  id: string;
  idea_id: string;
  complexity_score: number; // 1-5
  complexity_rationale: string;
  roi_score: number; // 1-5
  roi_rationale: string;
  time_saved_hours: number; // estimated hours saved per year
  time_saved_rationale: string;
  recommendations: string[];
  risks: string[];
  overall_priority: Priority;
  overall_summary: string;
  created_at: string;
}

export interface DbAiEvaluation {
  id: string;
  idea_id: string;
  complexity_score: number;
  complexity_rationale: string;
  roi_score: number;
  roi_rationale: string;
  time_saved_hours: number;
  time_saved_rationale: string;
  recommendations: string[];
  risks: string[];
  overall_priority: Priority;
  overall_summary: string;
  created_at: string;
}

// ============================================
// PROJECT TYPES (DEPRECATED - Use Ideas with status='accepted')
// ============================================

/** @deprecated Projects are now Ideas with status='accepted' or 'doing' */
export type ProjectStatus = "backlog" | "planning" | "in_progress" | "review" | "done" | "archived";

/** @deprecated Projects are now Ideas with status='accepted' or 'doing' */
export interface DbProject {
  id: string;
  user_id: string;
  idea_id: string | null;
  title: string;
  description: string | null;
  status: ProjectStatus;
  priority: Priority;
  position: number;
  due_date: string | null;
  estimated_hours: number | null;
  actual_hours: number;
  created_at: string;
  updated_at: string;
}

/** @deprecated Projects are now Ideas with status='accepted' or 'doing' */
export interface DbProjectInsert {
  title: string;
  idea_id?: string | null;
  description?: string | null;
  status?: ProjectStatus;
  priority?: Priority;
  position?: number;
  due_date?: string | null;
  estimated_hours?: number | null;
}

/** @deprecated Projects are now Ideas with status='accepted' or 'doing' */
export interface DbProjectUpdate {
  title?: string;
  description?: string | null;
  status?: ProjectStatus;
  priority?: Priority;
  position?: number;
  due_date?: string | null;
  estimated_hours?: number | null;
  actual_hours?: number;
  updated_at?: string;
}

// ============================================
// TASK TYPES (V1.0: Reference idea_id, not project_id)
// ============================================

export interface DbTask {
  id: string;
  idea_id: string | null;       // V1.0: Primary reference (nullable for orphans)
  project_id: string | null;    // Legacy: kept for migration
  column_id: string | null;
  title: string;
  description: string | null;
  completed: boolean;
  position: number;
  due_date: string | null;
  priority: Priority | null;
  created_at: string;
  updated_at: string;
}

export interface DbTaskInsert {
  idea_id?: string | null;      // V1.0: Primary reference
  project_id?: string | null;   // Legacy: kept for migration
  column_id?: string | null;
  title: string;
  description?: string | null;
  completed?: boolean;
  position?: number;
  due_date?: string | null;
  priority?: Priority | null;
}

export interface DbTaskUpdate {
  idea_id?: string | null;
  title?: string;
  description?: string | null;
  column_id?: string | null;
  completed?: boolean;
  position?: number;
  due_date?: string | null;
  priority?: Priority | null;
  updated_at?: string;
}

// ============================================
// COLUMN TYPES (V1.0: Global columns, user-scoped)
// ============================================

export type ColumnColor = "slate" | "blue" | "green" | "orange" | "purple" | "red" | "yellow" | "pink";

export interface DbColumn {
  id: string;
  user_id: string | null;       // V1.0: Global columns are user-scoped
  project_id: string | null;    // Legacy: kept for migration
  name: string;
  position: number;
  color: ColumnColor | null;
  wip_limit: number | null;
  created_at: string;
  updated_at: string;
}

export interface DbColumnInsert {
  user_id?: string;             // V1.0: Required for new columns
  project_id?: string | null;   // Legacy: kept for migration
  name: string;
  position: number;
  color?: ColumnColor | null;
  wip_limit?: number | null;
}

export interface DbColumnUpdate {
  name?: string;
  position?: number;
  color?: ColumnColor | null;
  wip_limit?: number | null;
  updated_at?: string;
}

// ============================================
// LABEL TYPES
// ============================================

export type LabelColor =
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "purple"
  | "pink"
  | "slate"
  | "emerald"
  | "indigo";

export interface DbLabel {
  id: string;
  user_id: string;
  name: string;
  color: LabelColor;
  created_at: string;
}

export interface DbLabelInsert {
  name: string;
  color: LabelColor;
}

export interface DbLabelUpdate {
  name?: string;
  color?: LabelColor;
}

// Label junction tables
export interface DbIdeaLabel {
  idea_id: string;
  label_id: string;
  created_at: string;
}

/** @deprecated Use idea_labels instead */
export interface DbProjectLabel {
  project_id: string;
  label_id: string;
  created_at: string;
}

export interface DbTaskLabel {
  task_id: string;
  label_id: string;
  created_at: string;
}

// ============================================
// THEME TYPES (V1.0: Multi-select categories)
// ============================================

export interface DbTheme {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface DbThemeInsert {
  name: string;
  color?: string;
}

export interface DbThemeUpdate {
  name?: string;
  color?: string;
}

export interface DbIdeaTheme {
  idea_id: string;
  theme_id: string;
  created_at: string;
}

// ============================================
// CHECKLIST TYPES
// ============================================

export interface DbChecklist {
  id: string;
  task_id: string | null;       // Tasks can have checklists
  idea_id: string | null;       // V1.0: Ideas can also have checklists
  title: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface DbChecklistInsert {
  task_id?: string | null;
  idea_id?: string | null;
  title: string;
  position: number;
}

export interface DbChecklistUpdate {
  title?: string;
  position?: number;
  updated_at?: string;
}

export interface DbChecklistItem {
  id: string;
  checklist_id: string;
  title: string;
  done: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface DbChecklistItemInsert {
  checklist_id: string;
  title: string;
  done?: boolean;
  position: number;
}

export interface DbChecklistItemUpdate {
  title?: string;
  done?: boolean;
  position?: number;
  updated_at?: string;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export function dbIdeaToIdea(db: DbIdea): {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  status: IdeaStatus;
  frequency: IdeaFrequency | null;
  timeSpent: number | null;
  owner: string | null;
  ownerId: string | null;
  teamId: string | null;
  painPoints: string | null;
  desiredOutcome: string | null;
  effortEstimate: EffortEstimate | null;
  priority: Priority;
  position: number;
  archived: boolean;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
} {
  return {
    id: db.id,
    userId: db.user_id,
    title: db.title,
    description: db.description,
    status: db.status,
    frequency: db.frequency,
    timeSpent: db.time_spent,
    owner: db.owner,
    ownerId: db.owner_id,
    teamId: db.team_id,
    painPoints: db.pain_points,
    desiredOutcome: db.desired_outcome,
    effortEstimate: db.effort_estimate,
    priority: db.priority,
    position: db.position,
    archived: db.archived,
    startedAt: db.started_at,
    completedAt: db.completed_at,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}

// ============================================
// COLUMN CONFIG TYPES (localStorage)
// ============================================

export interface ColumnConfig {
  id: string;
  visible: boolean;
  width: number;
  order: number;
}

export const DEFAULT_IDEA_COLUMNS: ColumnConfig[] = [
  { id: "title", visible: true, width: 300, order: 0 },
  { id: "status", visible: true, width: 120, order: 1 },
  { id: "score", visible: true, width: 80, order: 2 },
  { id: "updated_at", visible: true, width: 140, order: 3 },
  { id: "created_at", visible: false, width: 140, order: 4 },
  { id: "description", visible: false, width: 200, order: 5 },
  { id: "effort_estimate", visible: false, width: 100, order: 6 },
  { id: "owner", visible: false, width: 100, order: 7 },
  { id: "started_at", visible: false, width: 140, order: 8 },
  { id: "completed_at", visible: false, width: 140, order: 9 },
  { id: "themes", visible: false, width: 150, order: 10 },
];
