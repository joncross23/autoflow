/**
 * Comments API
 * V1.2: Threaded comments for ideas and tasks
 */

import { createClient } from "@/lib/supabase/client";

// ============================================
// Types
// ============================================

export interface DbComment {
  id: string;
  user_id: string;
  idea_id: string | null;
  task_id: string | null;
  parent_id: string | null;
  content: string;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommentWithReplies extends DbComment {
  replies: CommentWithReplies[];
  user_email?: string;
}

export interface CreateCommentInput {
  content: string;
  idea_id?: string;
  task_id?: string;
  parent_id?: string;
}

// ============================================
// Read Operations
// ============================================

/**
 * Get comments for an idea (with nested replies)
 */
export async function getIdeaComments(ideaId: string): Promise<CommentWithReplies[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("idea_id", ideaId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return buildCommentTree(data || []);
}

/**
 * Get comments for a task (with nested replies)
 */
export async function getTaskComments(taskId: string): Promise<CommentWithReplies[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("task_id", taskId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return buildCommentTree(data || []);
}

/**
 * Get a single comment by ID
 */
export async function getComment(id: string): Promise<DbComment | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("comments")
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
 * Get comment count for an idea
 */
export async function getIdeaCommentCount(ideaId: string): Promise<number> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from("comments")
    .select("*", { count: "exact", head: true })
    .eq("idea_id", ideaId);

  if (error) {
    throw new Error(error.message);
  }

  return count || 0;
}

/**
 * Get comment count for a task
 */
export async function getTaskCommentCount(taskId: string): Promise<number> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from("comments")
    .select("*", { count: "exact", head: true })
    .eq("task_id", taskId);

  if (error) {
    throw new Error(error.message);
  }

  return count || 0;
}

// ============================================
// Write Operations
// ============================================

/**
 * Create a new comment
 */
export async function createComment(input: CreateCommentInput): Promise<DbComment> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  // Validate that either idea_id or task_id is provided
  if (!input.idea_id && !input.task_id) {
    throw new Error("Comment must be associated with an idea or task");
  }

  if (input.idea_id && input.task_id) {
    throw new Error("Comment cannot be associated with both an idea and task");
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({
      user_id: user.id,
      idea_id: input.idea_id || null,
      task_id: input.task_id || null,
      parent_id: input.parent_id || null,
      content: input.content,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Update a comment
 */
export async function updateComment(id: string, content: string): Promise<DbComment> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("comments")
    .update({ content })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Delete a comment
 */
export async function deleteComment(id: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

// ============================================
// Helper Functions
// ============================================

/**
 * Build a nested comment tree from flat list
 */
function buildCommentTree(comments: DbComment[]): CommentWithReplies[] {
  const commentMap = new Map<string, CommentWithReplies>();
  const rootComments: CommentWithReplies[] = [];

  // First pass: create map of all comments with empty replies array
  comments.forEach((comment) => {
    commentMap.set(comment.id, { ...comment, replies: [] });
  });

  // Second pass: build tree structure
  comments.forEach((comment) => {
    const commentWithReplies = commentMap.get(comment.id)!;

    if (comment.parent_id) {
      const parent = commentMap.get(comment.parent_id);
      if (parent) {
        parent.replies.push(commentWithReplies);
      } else {
        // Parent was deleted, treat as root
        rootComments.push(commentWithReplies);
      }
    } else {
      rootComments.push(commentWithReplies);
    }
  });

  return rootComments;
}

/**
 * Flatten a comment tree back to a list
 */
export function flattenComments(comments: CommentWithReplies[]): CommentWithReplies[] {
  const result: CommentWithReplies[] = [];

  function traverse(comment: CommentWithReplies) {
    result.push(comment);
    comment.replies.forEach(traverse);
  }

  comments.forEach(traverse);
  return result;
}
