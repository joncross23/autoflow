/**
 * Supabase Database Types
 * These types map to the actual database schema
 */

export type IdeaStatus = "new" | "evaluating" | "prioritised" | "converting" | "archived";
export type IdeaFrequency = "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "adhoc";

export interface DbIdea {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: IdeaStatus;
  frequency: IdeaFrequency | null;
  time_spent: number | null; // minutes per occurrence
  owner: string | null;
  pain_points: string | null;
  desired_outcome: string | null;
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
  pain_points?: string | null;
  desired_outcome?: string | null;
}

export interface DbIdeaUpdate {
  title?: string;
  description?: string | null;
  status?: IdeaStatus;
  frequency?: IdeaFrequency | null;
  time_spent?: number | null;
  owner?: string | null;
  pain_points?: string | null;
  desired_outcome?: string | null;
  updated_at?: string;
}

// Helper to convert DB row to app type
// AI Evaluation types
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
  overall_priority: "low" | "medium" | "high" | "critical";
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
  overall_priority: "low" | "medium" | "high" | "critical";
  overall_summary: string;
  created_at: string;
}

// Project types
export type ProjectStatus = "backlog" | "planning" | "in_progress" | "review" | "done" | "archived";
export type Priority = "low" | "medium" | "high" | "critical";

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

// Task types (project subtasks)
export interface DbTask {
  id: string;
  project_id: string;
  title: string;
  completed: boolean;
  position: number;
  created_at: string;
}

export interface DbTaskInsert {
  project_id: string;
  title: string;
  completed?: boolean;
  position?: number;
}

export interface DbTaskUpdate {
  title?: string;
  completed?: boolean;
  position?: number;
}

export function dbIdeaToIdea(db: DbIdea): {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  status: IdeaStatus;
  frequency: IdeaFrequency | null;
  timeSpent: number | null;
  owner: string | null;
  painPoints: string | null;
  desiredOutcome: string | null;
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
    painPoints: db.pain_points,
    desiredOutcome: db.desired_outcome,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}
