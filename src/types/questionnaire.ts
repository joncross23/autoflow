import { z } from "zod";

// Question types for form fields
export type QuestionType = 'short_text' | 'long_text' | 'number';

export interface Question {
  id: string;
  type: QuestionType;
  label: string;
  hint?: string; // Optional help text shown below the question
  required: boolean;
  position: number;
  placeholder?: string;
}

// Extraction status lifecycle
export type ExtractionStatus = 'pending' | 'processing' | 'complete' | 'failed';

// Database types
export interface DbQuestionnaire {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  slug: string;
  questions: Question[];
  questions_snapshot: Question[] | null;
  is_active: boolean;
  auto_extract: boolean;
  response_count: number;
  last_response_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbQuestionnaireResponse {
  id: string;
  questionnaire_id: string;
  questions_snapshot: Question[];
  answers: Record<string, string | number>;
  respondent_email: string | null;
  respondent_name: string | null;
  extraction_status: ExtractionStatus;
  extraction_error: string | null;
  ideas_extracted: number;
  extracted_at: string | null;
  processing_started_at: string | null;
  submitted_at: string;
}

export interface DbResponseIdea {
  response_id: string;
  idea_id: string;
  extraction_confidence: number;
  created_at: string;
}

// AI extraction output
export interface ExtractedIdea {
  title: string;
  description: string;
  pain_points?: string | null;
  desired_outcome?: string | null;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'adhoc' | null;
  time_spent?: number | null; // Minutes per occurrence
  owner?: string | null; // Role mentioned in answers
  confidence: number; // 0.0-1.0
}

// Zod validation schemas
export const QuestionSchema = z.object({
  id: z.string(),
  type: z.enum(['short_text', 'long_text', 'number']),
  label: z.string().min(1).max(500),
  hint: z.string().max(1000).optional(),
  required: z.boolean(),
  position: z.number().int().nonnegative(),
  placeholder: z.string().max(200).optional(),
});

export const ExtractedIdeaSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(10).max(2000),
  pain_points: z.string().max(1000).nullable().optional(),
  desired_outcome: z.string().max(1000).nullable().optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'adhoc']).nullable().optional(),
  time_spent: z.number().int().positive().nullable().optional(),
  owner: z.string().max(200).nullable().optional(),
  confidence: z.number().min(0).max(1),
});

export const ExtractionResultSchema = z.object({
  ideas: z.array(ExtractedIdeaSchema),
});

// Form submission validation
export const QuestionnaireSubmissionSchema = z.object({
  answers: z.record(z.union([z.string(), z.number()])),
  respondent_email: z.string().email().nullable().optional(),
  respondent_name: z.string().min(1).max(200).nullable().optional(),
});

// Questionnaire creation/update validation
export const QuestionnaireInsertSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(2000).nullable().optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/).min(3).max(100),
  questions: z.array(QuestionSchema).min(1).max(50),
  is_active: z.boolean().default(true),
  auto_extract: z.boolean().default(false),
});

export const QuestionnaireUpdateSchema = QuestionnaireInsertSchema.partial();
