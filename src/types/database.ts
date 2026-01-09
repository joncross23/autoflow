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

// Planning horizon (Now/Next/Later roadmap planning)
export type PlanningHorizon = "now" | "next" | "later" | null;

export const PLANNING_HORIZON_LABELS: Record<NonNullable<PlanningHorizon>, string> = {
  now: "Now",
  next: "Next",
  later: "Later",
};

// Content type categorisation (extensible - add new types here)
export type ContentType = "idea" | "read" | "watch" | "listen" | "note";

export const CONTENT_TYPE_OPTIONS: { value: ContentType; label: string; emoji: string }[] = [
  { value: "idea", label: "Idea", emoji: "💡" },
  { value: "read", label: "To Read", emoji: "📖" },
  { value: "watch", label: "To Watch", emoji: "🎬" },
  { value: "listen", label: "To Listen", emoji: "🎧" },
  { value: "note", label: "Note", emoji: "📝" },
];

// RICE Impact levels (standard RICE methodology)
export type RiceImpact = 0.25 | 0.5 | 1 | 2 | 3;

// RICE Impact labels for UI
export const RICE_IMPACT_LABELS: Record<RiceImpact, string> = {
  0.25: "Minimal",
  0.5: "Low",
  1: "Medium",
  2: "High",
  3: "Massive",
};

// ============================================
// METADATA TYPES (V1.8: Guided Capture)
// ============================================

// Guided Capture metadata structure
export interface GuidedCaptureMetadata {
  version: "1.0";
  captured_at: string;
  started_at?: string;
  time_to_complete_seconds?: number;
  questions: Array<{
    id: string;
    question: string;
    answer: string;
  }>;
}

// Idea metadata can contain various structured data
export interface IdeaMetadata {
  guided_capture?: GuidedCaptureMetadata;
  // Future: Add other metadata types here
  // import?: { source: string; imported_at: string };
  // voice?: { transcript: string; confidence: number };
}

export interface DbIdea {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: IdeaStatus;
  frequency: IdeaFrequency | null;
  time_spent: number | null;    // minutes per occurrence
  owner: string | null;         // Legacy text field
  owner_id: string | null;      // FK to auth.users (future)
  team_id: string | null;       // Future: team-based access
  pain_points: string | null;
  desired_outcome: string | null;
  effort_estimate: EffortEstimate | null;
  horizon: PlanningHorizon;       // V1.1: Now/Next/Later planning
  position: number;
  archived: boolean;
  started_at: string | null;
  completed_at: string | null;
  // RICE scoring fields (V1.1)
  rice_reach: number | null;      // 1-10: How many users/processes affected
  rice_impact: RiceImpact | null; // 0.25-3: Impact per instance
  rice_confidence: number | null; // 0-100: Confidence percentage
  rice_effort: number | null;     // 1-10: Person-weeks equivalent
  rice_score: number | null;      // Calculated: (R×I×C%)/E
  content_type: ContentType | null;  // V1.x: idea/read/watch/listen/note
  // Source tracking (V1.8: guided capture)
  source_type: "manual" | "guided" | "import" | "voice";
  source_id: string | null;        // Reference to source (e.g., response ID)
  intended_owner_id: string | null; // For extracted ideas: who should see this
  metadata: IdeaMetadata | null;   // V1.8: Structured metadata (guided capture Q&A, etc.)
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
  horizon?: PlanningHorizon;
  position?: number;
  archived?: boolean;
  started_at?: string | null;
  completed_at?: string | null;
  // RICE scoring fields (V1.1)
  rice_reach?: number | null;
  rice_impact?: RiceImpact | null;
  rice_confidence?: number | null;
  rice_effort?: number | null;
  rice_score?: number | null;
  content_type?: ContentType | null;
  // Source tracking (V1.8: guided capture)
  source_type?: "manual" | "guided" | "import" | "voice";
  source_id?: string | null;
  intended_owner_id?: string | null;
  metadata?: IdeaMetadata | null;
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
  horizon?: PlanningHorizon;
  position?: number;
  archived?: boolean;
  started_at?: string | null;
  completed_at?: string | null;
  // RICE scoring fields (V1.1)
  rice_reach?: number | null;
  rice_impact?: RiceImpact | null;
  rice_confidence?: number | null;
  rice_effort?: number | null;
  rice_score?: number | null;
  content_type?: ContentType | null;
  metadata?: IdeaMetadata | null;
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

// V1.3: Labels store hex colors directly for flexibility
// 6 WCAG AA compliant colours (4.5:1 contrast with white text)
export const LABEL_COLORS = [
  "#06b6d4", // Cyan
  "#22c55e", // Green
  "#3b82f6", // Blue
  "#eab308", // Yellow
  "#ef4444", // Red
  "#f97316", // Orange
] as const;

// Map hex colours to Tailwind classes (shared across components)
export const LABEL_COLOR_CLASSES: Record<string, string> = {
  "#ef4444": "bg-red-500",
  "#f97316": "bg-orange-500",
  "#eab308": "bg-yellow-500",
  "#22c55e": "bg-green-500",
  "#3b82f6": "bg-blue-500",
  "#06b6d4": "bg-cyan-500",
};

export type LabelColorHex = (typeof LABEL_COLORS)[number];

export interface DbLabel {
  id: string;
  user_id: string;
  name: string;
  color: string; // Hex color e.g. '#3B82F6'
  created_at: string;
}

export interface DbLabelInsert {
  name: string;
  color: string;
}

export interface DbLabelUpdate {
  name?: string;
  color?: string;
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
// ATTACHMENT TYPES (V1.3)
// ============================================

export interface DbAttachment {
  id: string;
  idea_id: string | null;
  task_id: string | null;
  name: string;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  uploaded_by: string | null;
  created_at: string;
}

export interface DbAttachmentInsert {
  idea_id?: string | null;
  task_id?: string | null;
  name: string;
  file_path: string;
  file_type?: string | null;
  file_size?: number | null;
  uploaded_by?: string | null;
}

// ============================================
// LINK TYPES (V1.3)
// ============================================

// Relationship types for task-to-task links (V1.4)
export type LinkRelationshipType =
  | "related"
  | "blocks"
  | "is_blocked_by"
  | "duplicates"
  | "is_duplicated_by"
  | "split_to"
  | "split_from";

// Maps each relationship to its inverse (for displaying in backlinks)
export const RELATIONSHIP_TYPE_PAIRS: Record<LinkRelationshipType, LinkRelationshipType> = {
  related: "related",
  blocks: "is_blocked_by",
  is_blocked_by: "blocks",
  duplicates: "is_duplicated_by",
  is_duplicated_by: "duplicates",
  split_to: "split_from",
  split_from: "split_to",
};

// Human-readable labels for relationship types
export const RELATIONSHIP_TYPE_LABELS: Record<LinkRelationshipType, string> = {
  related: "related to",
  blocks: "blocks",
  is_blocked_by: "is blocked by",
  duplicates: "duplicates",
  is_duplicated_by: "is duplicated by",
  split_to: "split to",
  split_from: "split from",
};

// All available relationship type options for dropdown
export const RELATIONSHIP_TYPE_OPTIONS: { value: LinkRelationshipType; label: string }[] = [
  { value: "is_blocked_by", label: "is blocked by" },
  { value: "blocks", label: "blocks" },
  { value: "is_duplicated_by", label: "is duplicated by" },
  { value: "duplicates", label: "duplicates" },
  { value: "split_from", label: "split from" },
  { value: "split_to", label: "split to" },
  { value: "related", label: "related to" },
];

export interface DbLink {
  id: string;
  idea_id: string | null;
  task_id: string | null;
  url: string;
  title: string | null;
  favicon: string | null;
  relationship_type: LinkRelationshipType | null; // null for URL and idea links
  created_at: string;
}

export interface DbLinkInsert {
  idea_id?: string | null;
  task_id?: string | null;
  url: string;
  title?: string | null;
  favicon?: string | null;
  relationship_type?: LinkRelationshipType | null;
}

export interface DbLinkUpdate {
  url?: string;
  title?: string | null;
  favicon?: string | null;
  relationship_type?: LinkRelationshipType | null;
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
  horizon: PlanningHorizon;
  position: number;
  archived: boolean;
  startedAt: string | null;
  completedAt: string | null;
  // RICE scoring (V1.1)
  riceReach: number | null;
  riceImpact: RiceImpact | null;
  riceConfidence: number | null;
  riceEffort: number | null;
  riceScore: number | null;
  contentType: ContentType | null;
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
    horizon: db.horizon,
    position: db.position,
    archived: db.archived,
    startedAt: db.started_at,
    completedAt: db.completed_at,
    riceReach: db.rice_reach,
    riceImpact: db.rice_impact,
    riceConfidence: db.rice_confidence,
    riceEffort: db.rice_effort,
    riceScore: db.rice_score,
    contentType: db.content_type,
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
  { id: "horizon", visible: true, width: 100, order: 2 },  // V1.1: Now/Next/Later
  { id: "rice_score", visible: true, width: 100, order: 3 },  // V1.1: RICE score
  { id: "updated_at", visible: true, width: 140, order: 4 },
  { id: "created_at", visible: false, width: 140, order: 5 },
  { id: "description", visible: false, width: 200, order: 6 },
  { id: "effort_estimate", visible: false, width: 100, order: 7 },
  { id: "owner", visible: false, width: 100, order: 8 },
  { id: "started_at", visible: false, width: 140, order: 9 },
  { id: "completed_at", visible: false, width: 140, order: 10 },
  { id: "themes", visible: false, width: 150, order: 11 },
  // RICE components (V1.1)
  { id: "rice_reach", visible: false, width: 80, order: 12 },
  { id: "rice_impact", visible: false, width: 80, order: 13 },
  { id: "rice_confidence", visible: false, width: 100, order: 14 },
  { id: "rice_effort", visible: false, width: 80, order: 15 },
  { id: "content_type", visible: false, width: 100, order: 16 },
];

// ============================================
// SAVED VIEWS TYPES (V1.1)
// ============================================

export interface IdeaFilters {
  status?: IdeaStatus[];
  archived?: boolean;
  minScore?: number;
  maxScore?: number;
  minRiceScore?: number;
  maxRiceScore?: number;
  dateRange?: {
    start?: string;
    end?: string;
  };
  themes?: string[];
  contentTypes?: ContentType[];
  search?: string;
}

// Generic filter type for saved views (stores any UI filter structure as JSONB)
export type SavedViewFilters = Record<string, unknown>;

export interface DbSavedView {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  filters: SavedViewFilters;
  column_config: ColumnConfig[] | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbSavedViewInsert {
  name: string;
  description?: string | null;
  filters: SavedViewFilters;
  column_config?: ColumnConfig[] | null;
  is_default?: boolean;
}

export interface DbSavedViewUpdate {
  name?: string;
  description?: string | null;
  filters?: SavedViewFilters;
  column_config?: ColumnConfig[] | null;
  is_default?: boolean;
  updated_at?: string;
}

// ============================================
// PUBLISHED VIEWS TYPES (V1.1)
// ============================================

export interface DbPublishedView {
  id: string;
  user_id: string;
  saved_view_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  filters: SavedViewFilters;
  column_config: ColumnConfig[] | null;
  is_active: boolean;
  expires_at: string | null;
  password_hash: string | null;
  view_count: number;
  last_viewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbPublishedViewInsert {
  saved_view_id?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  filters: SavedViewFilters;
  column_config?: ColumnConfig[] | null;
  is_active?: boolean;
  expires_at?: string | null;
  password_hash?: string | null;
}

export interface DbPublishedViewUpdate {
  name?: string;
  slug?: string;
  description?: string | null;
  filters?: SavedViewFilters;
  column_config?: ColumnConfig[] | null;
  is_active?: boolean;
  expires_at?: string | null;
  password_hash?: string | null;
  updated_at?: string;
}
