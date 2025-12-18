/**
 * Core TypeScript types for AutoFlow
 */

// Base entity with common fields
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// User
export interface User extends BaseEntity {
  email: string;
  name: string;
  avatarUrl?: string;
  role: "admin" | "editor" | "viewer";
}

// Label
export interface Label extends BaseEntity {
  name: string;
  color: string;
  boardId?: string;
}

// Checklist item
export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string;
}

// Checklist
export interface Checklist {
  id: string;
  title: string;
  items: ChecklistItem[];
}

// Attachment
export interface Attachment extends BaseEntity {
  name: string;
  url: string;
  type: "image" | "file" | "link";
  size?: number;
}

// Comment
export interface Comment extends BaseEntity {
  text: string;
  authorId: string;
  author?: User;
}

// Idea (unified model - includes projects)
export interface Idea extends BaseEntity {
  title: string;
  description?: string;
  status: "new" | "evaluating" | "accepted" | "doing" | "complete" | "parked" | "dropped";
  frequency?: "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "adhoc";
  timeSpent?: number; // minutes per occurrence
  owner?: string;
  ownerId?: string;
  teamId?: string;
  painPoints?: string;
  desiredOutcome?: string;
  effortEstimate?: "trivial" | "small" | "medium" | "large" | "xlarge";
  priority: "low" | "medium" | "high" | "critical";
  position: number;
  archived: boolean;
  startedAt?: string;
  completedAt?: string;
  labels: Label[];
  aiEvaluation?: AIEvaluation;
}

// AI Evaluation result
export interface AIEvaluation {
  id: string;
  ideaId: string;
  score: number; // 1-10
  complexity: "low" | "medium" | "high" | "very_high";
  estimatedTimeSaved: number; // hours per week
  estimatedCost: number;
  estimatedROI: number;
  reasons: string[];
  suggestedSolutions: string[];
  evaluatedAt: string;
}

// Project Card
export interface Card extends BaseEntity {
  title: string;
  description?: string;
  columnId: string;
  boardId: string;
  position: number;
  labels: Label[];
  checklists: Checklist[];
  attachments: Attachment[];
  comments: Comment[];
  members: string[]; // User IDs
  dueDate?: string;
  startDate?: string;
  coverImage?: string;
  coverColor?: string;
  isArchived: boolean;
  sourceIdeaId?: string;
}

// Kanban Column
export interface Column extends BaseEntity {
  title: string;
  boardId: string;
  position: number;
  color?: string;
  wipLimit?: number;
  isCollapsed: boolean;
}

// Kanban Board
export interface Board extends BaseEntity {
  title: string;
  description?: string;
  columns: Column[];
  labels: Label[];
  isArchived: boolean;
}

// Activity log entry
export interface Activity extends BaseEntity {
  type: "create" | "update" | "delete" | "move" | "comment" | "evaluation";
  entityType: "idea" | "card" | "board" | "column";
  entityId: string;
  userId: string;
  user?: User;
  metadata: Record<string, unknown>;
}

// Dashboard stats
export interface DashboardStats {
  totalIdeas: number;
  ideasByStatus: Record<string, number>;
  totalProjects: number;
  projectsByStatus: Record<string, number>;
  totalTimeSaved: number;
  totalValueSaved: number;
  recentActivity: Activity[];
}

// Questionnaire template
export interface QuestionnaireTemplate extends BaseEntity {
  title: string;
  description?: string;
  questions: QuestionnaireQuestion[];
  isPublic: boolean;
  isArchived: boolean;
}

// Questionnaire question
export interface QuestionnaireQuestion {
  id: string;
  text: string;
  type: "text" | "textarea" | "select" | "multiselect" | "number" | "date";
  options?: string[];
  required: boolean;
  order: number;
}

// Questionnaire response
export interface QuestionnaireResponse extends BaseEntity {
  templateId: string;
  answers: Record<string, string | string[] | number>;
  submittedAt: string;
  aiAnalysis?: AIResponseAnalysis;
}

// AI analysis of questionnaire response
export interface AIResponseAnalysis {
  extractedIdeas: Partial<Idea>[];
  summary: string;
  recommendations: string[];
  analyzedAt: string;
}

// Theme preferences
export interface ThemePreferences {
  mode: "dark" | "light" | "system";
  accent: "blue" | "emerald" | "orange" | "purple" | "pink" | "slate";
}
