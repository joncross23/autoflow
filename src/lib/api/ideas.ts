/**
 * Ideas API
 * V1.0: Unified model (Ideas + Projects merged)
 * V1.1: RICE scoring support
 */

import { createClient } from "@/lib/supabase/client";
import { escapeIlikePattern } from "@/lib/security/sanitise";
import type { DbIdea, DbIdeaInsert, DbIdeaUpdate, IdeaStatus, RiceImpact } from "@/types/database";

// ============================================
// Filter Types
// ============================================

export interface IdeaFilters {
  status?: IdeaStatus | IdeaStatus[];
  archived?: boolean;
  search?: string;
  // RICE score filters (V1.1)
  minRiceScore?: number;
  maxRiceScore?: number;
  hasRiceScore?: boolean;  // Filter to only show scored/unscored ideas
  // Sorting
  sortBy?:
    | "created_at"
    | "updated_at"
    | "title"
    | "status"
    | "rice_score"
    | "horizon"
    | "rice_reach"
    | "rice_impact"
    | "rice_confidence"
    | "rice_effort"
    | "effort_estimate";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

// RICE score input for updates
export interface RiceScoreInput {
  reach: number;      // 1-10
  impact: RiceImpact; // 0.25, 0.5, 1, 2, 3
  confidence: number; // 0-100
  effort: number;     // 1-10
}

// ============================================
// Read Operations
// ============================================

/**
 * Fetch all ideas for the current user with optional filters
 */
export async function getIdeas(filters?: IdeaFilters): Promise<DbIdea[]> {
  const supabase = createClient();

  let query = supabase.from("ideas").select("*");

  // Status filter
  if (filters?.status) {
    if (Array.isArray(filters.status)) {
      query = query.in("status", filters.status);
    } else {
      query = query.eq("status", filters.status);
    }
  }

  // Archived filter (default: hide archived)
  if (filters?.archived !== undefined) {
    query = query.eq("archived", filters.archived);
  } else {
    query = query.eq("archived", false);
  }

  // Search filter (title and description)
  // Escape special ILIKE characters to prevent SQL injection
  if (filters?.search) {
    const escapedSearch = escapeIlikePattern(filters.search);
    query = query.or(
      `title.ilike.%${escapedSearch}%,description.ilike.%${escapedSearch}%`
    );
  }

  // RICE score filters (V1.1)
  if (filters?.minRiceScore !== undefined) {
    query = query.gte("rice_score", filters.minRiceScore);
  }
  if (filters?.maxRiceScore !== undefined) {
    query = query.lte("rice_score", filters.maxRiceScore);
  }
  if (filters?.hasRiceScore !== undefined) {
    if (filters.hasRiceScore) {
      query = query.not("rice_score", "is", null);
    } else {
      query = query.is("rice_score", null);
    }
  }

  // Sorting
  const sortBy = filters?.sortBy || "created_at";
  const sortOrder = filters?.sortOrder || "desc";

  // Special handling for rice_score - nulls should be last when sorting desc
  if (sortBy === "rice_score") {
    query = query.order(sortBy, { ascending: sortOrder === "asc", nullsFirst: sortOrder === "asc" });
  } else {
    query = query.order(sortBy, { ascending: sortOrder === "asc" });
  }

  // Pagination
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

/**
 * Fetch a single idea by ID
 */
export async function getIdea(id: string): Promise<DbIdea | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("ideas")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(error.message);
  }

  return data;
}

/**
 * Get idea counts by status
 */
export async function getIdeaCounts(): Promise<Record<IdeaStatus, number>> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("ideas")
    .select("status")
    .eq("archived", false);

  if (error) {
    throw new Error(error.message);
  }

  const counts: Record<IdeaStatus, number> = {
    new: 0,
    evaluating: 0,
    accepted: 0,
    doing: 0,
    complete: 0,
    parked: 0,
    dropped: 0,
  };

  data?.forEach((idea) => {
    counts[idea.status as IdeaStatus]++;
  });

  return counts;
}

/**
 * Get ideas for task board (accepted or doing status)
 */
export async function getDeliveryIdeas(): Promise<DbIdea[]> {
  return getIdeas({
    status: ["accepted", "doing"],
    archived: false,
    sortBy: "updated_at",
    sortOrder: "desc",
  });
}

// ============================================
// Write Operations
// ============================================

/**
 * Create a new idea
 */
export async function createIdea(idea: DbIdeaInsert): Promise<DbIdea> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase
    .from("ideas")
    .insert({
      ...idea,
      user_id: user.id,
      status: idea.status || "new",
      archived: idea.archived || false,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Update an existing idea
 */
export async function updateIdea(id: string, updates: DbIdeaUpdate): Promise<DbIdea> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("ideas")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Delete an idea
 */
export async function deleteIdea(id: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("ideas")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

// ============================================
// Status Transitions
// ============================================

/**
 * Update idea status with automatic timestamp handling
 */
export async function updateIdeaStatus(id: string, status: IdeaStatus): Promise<DbIdea> {
  const updates: DbIdeaUpdate = { status };

  // Set started_at when moving to doing
  if (status === "doing") {
    const idea = await getIdea(id);
    if (idea && !idea.started_at) {
      updates.started_at = new Date().toISOString();
    }
  }

  // Set completed_at when completing
  if (status === "complete") {
    updates.completed_at = new Date().toISOString();
  }

  return updateIdea(id, updates);
}

/**
 * Accept an idea (move to accepted status)
 */
export async function acceptIdea(id: string): Promise<DbIdea> {
  return updateIdeaStatus(id, "accepted");
}

/**
 * Start working on an idea (move to doing status)
 */
export async function startIdea(id: string): Promise<DbIdea> {
  return updateIdeaStatus(id, "doing");
}

/**
 * Complete an idea
 */
export async function completeIdea(id: string): Promise<DbIdea> {
  return updateIdeaStatus(id, "complete");
}

/**
 * Park an idea (put on hold)
 */
export async function parkIdea(id: string): Promise<DbIdea> {
  return updateIdeaStatus(id, "parked");
}

/**
 * Drop an idea (won't do)
 */
export async function dropIdea(id: string): Promise<DbIdea> {
  return updateIdeaStatus(id, "dropped");
}

// ============================================
// Archive Operations
// ============================================

/**
 * Archive an idea
 */
export async function archiveIdea(id: string): Promise<DbIdea> {
  return updateIdea(id, { archived: true });
}

/**
 * Unarchive an idea
 */
export async function unarchiveIdea(id: string): Promise<DbIdea> {
  return updateIdea(id, { archived: false });
}

/**
 * Get archived ideas
 */
export async function getArchivedIdeas(): Promise<DbIdea[]> {
  return getIdeas({ archived: true });
}

// ============================================
// Bulk Operations
// ============================================

/**
 * Archive multiple ideas
 */
export async function bulkArchiveIdeas(ids: string[]): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("ideas")
    .update({ archived: true, updated_at: new Date().toISOString() })
    .in("id", ids);

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Update status for multiple ideas
 */
export async function bulkUpdateStatus(ids: string[], status: IdeaStatus): Promise<void> {
  const supabase = createClient();

  const updates: DbIdeaUpdate = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === "complete") {
    updates.completed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("ideas")
    .update(updates)
    .in("id", ids);

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Delete multiple ideas
 */
export async function bulkDeleteIdeas(ids: string[]): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("ideas")
    .delete()
    .in("id", ids);

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Update effort estimate for multiple ideas
 */
export async function bulkUpdateEffort(ids: string[], effort: DbIdea["effort_estimate"]): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("ideas")
    .update({ effort_estimate: effort, updated_at: new Date().toISOString() })
    .in("id", ids);

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Update planning horizon for multiple ideas
 */
export async function bulkUpdateHorizon(ids: string[], horizon: DbIdea["horizon"]): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("ideas")
    .update({ horizon: horizon, updated_at: new Date().toISOString() })
    .in("id", ids);

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Add a label to multiple ideas
 */
export async function bulkAddLabel(ideaIds: string[], labelId: string): Promise<void> {
  const supabase = createClient();

  // Create idea_labels entries for each idea
  const insertData = ideaIds.map((ideaId) => ({
    idea_id: ideaId,
    label_id: labelId,
  }));

  const { error } = await supabase
    .from("idea_labels")
    .upsert(insertData, { onConflict: "idea_id,label_id" });

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Remove a label from multiple ideas
 */
export async function bulkRemoveLabel(ideaIds: string[], labelId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("idea_labels")
    .delete()
    .in("idea_id", ideaIds)
    .eq("label_id", labelId);

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Duplicate an existing idea
 * Creates a new idea with all fields copied except id, created_at, updated_at
 * Appends " (Copy)" to the title
 */
export async function duplicateIdea(id: string): Promise<DbIdea> {
  const supabase = createClient();

  // Fetch the original idea
  const original = await getIdea(id);

  if (!original) {
    throw new Error("Idea not found");
  }

  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  // Create a new idea with copied fields (excluding id, created_at, updated_at, user_id)
  const { data, error } = await supabase
    .from("ideas")
    .insert({
      user_id: user.id,
      title: `${original.title} (Copy)`,
      description: original.description,
      status: original.status,
      frequency: original.frequency,
      time_spent: original.time_spent,
      owner: original.owner,
      owner_id: original.owner_id,
      team_id: original.team_id,
      pain_points: original.pain_points,
      desired_outcome: original.desired_outcome,
      effort_estimate: original.effort_estimate,
      horizon: original.horizon,
      position: original.position,
      archived: false, // Reset archived status for the copy
      started_at: null, // Reset timestamps for the copy
      completed_at: null,
      rice_reach: original.rice_reach,
      rice_impact: original.rice_impact,
      rice_confidence: original.rice_confidence,
      rice_effort: original.rice_effort,
      rice_score: original.rice_score, // Copy the calculated score
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

// ============================================
// RICE Scoring Operations (V1.1)
// ============================================

/**
 * Calculate RICE score client-side (for preview before saving)
 * RICE = (Reach × Impact × Confidence%) / Effort
 */
export function calculateRiceScore(input: RiceScoreInput): number {
  const { reach, impact, confidence, effort } = input;

  if (!reach || !impact || confidence === undefined || !effort || effort === 0) {
    return 0;
  }

  return Math.round(((reach * impact * (confidence / 100)) / effort) * 100) / 100;
}

/**
 * Update RICE scores for an idea
 * The database trigger will automatically calculate rice_score
 */
export async function updateRiceScore(id: string, input: RiceScoreInput): Promise<DbIdea> {
  return updateIdea(id, {
    rice_reach: input.reach,
    rice_impact: input.impact,
    rice_confidence: input.confidence,
    rice_effort: input.effort,
  });
}

/**
 * Clear RICE scores for an idea
 */
export async function clearRiceScore(id: string): Promise<DbIdea> {
  return updateIdea(id, {
    rice_reach: null,
    rice_impact: null,
    rice_confidence: null,
    rice_effort: null,
  });
}

/**
 * Get ideas sorted by RICE score (highest first)
 */
export async function getIdeasByRiceScore(limit?: number): Promise<DbIdea[]> {
  return getIdeas({
    hasRiceScore: true,
    sortBy: "rice_score",
    sortOrder: "desc",
    archived: false,
    limit,
  });
}

/**
 * Get ideas needing RICE scoring
 */
export async function getIdeasNeedingRiceScore(): Promise<DbIdea[]> {
  return getIdeas({
    hasRiceScore: false,
    status: ["new", "evaluating", "accepted"],
    archived: false,
    sortBy: "created_at",
    sortOrder: "desc",
  });
}

/**
 * Get RICE score statistics
 */
export async function getRiceScoreStats(): Promise<{
  scored: number;
  unscored: number;
  avgScore: number;
  maxScore: number;
  minScore: number;
}> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("ideas")
    .select("rice_score")
    .eq("archived", false);

  if (error) {
    throw new Error(error.message);
  }

  const scored = data?.filter((i) => i.rice_score !== null) || [];
  const unscored = data?.filter((i) => i.rice_score === null) || [];

  const scores = scored.map((i) => i.rice_score as number);

  return {
    scored: scored.length,
    unscored: unscored.length,
    avgScore: scores.length > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100 : 0,
    maxScore: scores.length > 0 ? Math.max(...scores) : 0,
    minScore: scores.length > 0 ? Math.min(...scores) : 0,
  };
}

// ============================================
// Time Audit Operations (V1.1)
// ============================================

// Effort estimate to hours mapping (per week)
const EFFORT_TO_HOURS: Record<string, number> = {
  trivial: 1,    // Less than an hour
  small: 4,      // Half day
  medium: 16,    // 2 days
  large: 40,     // 1 week
  xlarge: 80,    // 2 weeks
};

// RICE effort (1-10) to hours mapping
const RICE_EFFORT_TO_HOURS: Record<number, number> = {
  1: 4,    // Half day
  2: 8,    // 1 day
  3: 16,   // 2 days
  4: 24,   // 3 days
  5: 40,   // 1 week
  6: 60,   // 1.5 weeks
  7: 80,   // 2 weeks
  8: 120,  // 3 weeks
  9: 160,  // 4 weeks
  10: 200, // 5 weeks
};

// Calculate recoverable hours per instance (based on RICE reach * impact)
// Reach = how many people/processes affected
// Impact = significance (0.25=minimal, 0.5=low, 1=medium, 2=high, 3=massive)
// Estimated hours saved per period = reach * impact * base_hours (4hrs)
function calculateRecoverableHours(reach: number | null, impact: number | null): number {
  if (!reach || !impact) return 0;
  // Base assumption: each unit of reach saves 4 hours per month when fully automated
  const baseHours = 4;
  return Math.round(reach * impact * baseHours);
}

export interface TimeAuditItem {
  id: string;
  title: string;
  status: IdeaStatus;
  horizon: string | null;
  effortHours: number;
  recoverableHoursPerMonth: number;
  riceScore: number | null;
  confidence: number | null;
  paybackMonths: number | null;
}

export interface TimeAuditSummary {
  totalIdeas: number;
  totalEffortHours: number;
  totalRecoverableHoursPerMonth: number;
  annualRecoverableHours: number;
  avgPaybackMonths: number;
  byHorizon: {
    now: { count: number; effortHours: number; recoverableHours: number };
    next: { count: number; effortHours: number; recoverableHours: number };
    later: { count: number; effortHours: number; recoverableHours: number };
    unplanned: { count: number; effortHours: number; recoverableHours: number };
  };
  byStatus: Record<IdeaStatus, { count: number; effortHours: number; recoverableHours: number }>;
  items: TimeAuditItem[];
}

/**
 * Get Time Audit report data
 * Calculates effort investment and recoverable time for all ideas
 */
export async function getTimeAudit(): Promise<TimeAuditSummary> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("ideas")
    .select("*")
    .eq("archived", false)
    .not("status", "in", "(dropped)")
    .order("rice_score", { ascending: false, nullsFirst: false });

  if (error) {
    throw new Error(error.message);
  }

  const ideas = data || [];

  const items: TimeAuditItem[] = ideas.map((idea) => {
    // Calculate effort hours from either RICE effort or effort_estimate
    let effortHours = 0;
    if (idea.rice_effort) {
      effortHours = RICE_EFFORT_TO_HOURS[idea.rice_effort] || 0;
    } else if (idea.effort_estimate) {
      effortHours = EFFORT_TO_HOURS[idea.effort_estimate] || 0;
    }

    // Calculate recoverable hours based on RICE reach/impact
    const recoverableHoursPerMonth = calculateRecoverableHours(
      idea.rice_reach,
      idea.rice_impact
    );

    // Calculate payback period in months
    let paybackMonths: number | null = null;
    if (effortHours > 0 && recoverableHoursPerMonth > 0) {
      paybackMonths = Math.round((effortHours / recoverableHoursPerMonth) * 10) / 10;
    }

    return {
      id: idea.id,
      title: idea.title,
      status: idea.status as IdeaStatus,
      horizon: idea.horizon,
      effortHours,
      recoverableHoursPerMonth,
      riceScore: idea.rice_score,
      confidence: idea.rice_confidence,
      paybackMonths,
    };
  });

  // Calculate totals
  const totalEffortHours = items.reduce((sum, i) => sum + i.effortHours, 0);
  const totalRecoverableHoursPerMonth = items.reduce((sum, i) => sum + i.recoverableHoursPerMonth, 0);

  // Calculate average payback (only for items with valid payback)
  const itemsWithPayback = items.filter((i) => i.paybackMonths !== null);
  const avgPaybackMonths = itemsWithPayback.length > 0
    ? Math.round((itemsWithPayback.reduce((sum, i) => sum + (i.paybackMonths || 0), 0) / itemsWithPayback.length) * 10) / 10
    : 0;

  // Group by horizon
  const byHorizon = {
    now: { count: 0, effortHours: 0, recoverableHours: 0 },
    next: { count: 0, effortHours: 0, recoverableHours: 0 },
    later: { count: 0, effortHours: 0, recoverableHours: 0 },
    unplanned: { count: 0, effortHours: 0, recoverableHours: 0 },
  };

  items.forEach((item) => {
    const horizon = (item.horizon as "now" | "next" | "later") || "unplanned";
    const key = horizon === "now" || horizon === "next" || horizon === "later" ? horizon : "unplanned";
    byHorizon[key].count++;
    byHorizon[key].effortHours += item.effortHours;
    byHorizon[key].recoverableHours += item.recoverableHoursPerMonth;
  });

  // Group by status
  const byStatus: Record<IdeaStatus, { count: number; effortHours: number; recoverableHours: number }> = {
    new: { count: 0, effortHours: 0, recoverableHours: 0 },
    evaluating: { count: 0, effortHours: 0, recoverableHours: 0 },
    accepted: { count: 0, effortHours: 0, recoverableHours: 0 },
    doing: { count: 0, effortHours: 0, recoverableHours: 0 },
    complete: { count: 0, effortHours: 0, recoverableHours: 0 },
    parked: { count: 0, effortHours: 0, recoverableHours: 0 },
    dropped: { count: 0, effortHours: 0, recoverableHours: 0 },
  };

  items.forEach((item) => {
    byStatus[item.status].count++;
    byStatus[item.status].effortHours += item.effortHours;
    byStatus[item.status].recoverableHours += item.recoverableHoursPerMonth;
  });

  return {
    totalIdeas: items.length,
    totalEffortHours,
    totalRecoverableHoursPerMonth,
    annualRecoverableHours: totalRecoverableHoursPerMonth * 12,
    avgPaybackMonths,
    byHorizon,
    byStatus,
    items,
  };
}

// ============================================
// Task Progress Operations (V1.5)
// ============================================

/**
 * Progress information for an idea's tasks
 */
export interface IdeaTaskProgress {
  totalTasks: number;
  completedTasks: number;
  percentage: number;
}

/**
 * Get task progress for a single idea
 */
export async function getIdeaTaskProgress(ideaId: string): Promise<IdeaTaskProgress> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("tasks")
    .select("id, completed")
    .eq("idea_id", ideaId);

  if (error) {
    throw new Error(error.message);
  }

  const tasks = data || [];
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    totalTasks,
    completedTasks,
    percentage,
  };
}

/**
 * Get task progress for all ideas (for ideas table)
 * Returns a map of ideaId -> progress
 */
export async function getAllIdeasTaskProgress(): Promise<Record<string, IdeaTaskProgress>> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("tasks")
    .select("id, idea_id, completed")
    .not("idea_id", "is", null);

  if (error) {
    throw new Error(error.message);
  }

  const tasks = data || [];
  const progressMap: Record<string, IdeaTaskProgress> = {};

  // Group tasks by idea_id
  tasks.forEach((task) => {
    if (!task.idea_id) return;

    if (!progressMap[task.idea_id]) {
      progressMap[task.idea_id] = {
        totalTasks: 0,
        completedTasks: 0,
        percentage: 0,
      };
    }

    progressMap[task.idea_id].totalTasks++;
    if (task.completed) {
      progressMap[task.idea_id].completedTasks++;
    }
  });

  // Calculate percentages
  Object.keys(progressMap).forEach((ideaId) => {
    const progress = progressMap[ideaId];
    progress.percentage = progress.totalTasks > 0
      ? Math.round((progress.completedTasks / progress.totalTasks) * 100)
      : 0;
  });

  return progressMap;
}
