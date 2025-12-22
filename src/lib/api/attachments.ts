/**
 * Attachments API
 * File upload/download operations for ideas and tasks
 * V1.3: Rich Cards feature
 */

import { createClient } from "@/lib/supabase/client";
import type { DbAttachment, DbAttachmentInsert } from "@/types/database";

// Storage bucket name
const STORAGE_BUCKET = "attachments";

// Max file size in bytes (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed MIME types
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get file icon emoji based on MIME type
 */
export function getFileIcon(mimeType: string | null): string {
  if (!mimeType) return "📁";
  if (mimeType.startsWith("image/")) return "🖼️";
  if (mimeType === "application/pdf") return "📄";
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return "📊";
  if (mimeType.includes("document") || mimeType.includes("word")) return "📝";
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) return "📽️";
  if (mimeType.startsWith("video/")) return "🎬";
  if (mimeType.startsWith("audio/")) return "🎵";
  if (mimeType === "text/plain" || mimeType === "text/csv") return "📃";
  return "📁";
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number | null): string {
  if (!bytes || bytes === 0) return "0 B";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

/**
 * Validate file before upload
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}` };
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: "File type not allowed" };
  }
  return { valid: true };
}

// ============================================
// IDEA ATTACHMENTS
// ============================================

/**
 * Get attachments for an idea
 */
export async function getIdeaAttachments(ideaId: string): Promise<DbAttachment[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("attachments")
    .select("*")
    .eq("idea_id", ideaId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching idea attachments:", error);
    throw new Error(`Failed to fetch attachments: ${error.message}`);
  }

  return data || [];
}

/**
 * Upload an attachment to an idea
 */
export async function uploadIdeaAttachment(
  ideaId: string,
  file: File
): Promise<DbAttachment> {
  const supabase = createClient();

  // Validate file
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Generate storage path
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const filePath = `${user.id}/${ideaId}/${timestamp}_${sanitizedName}`;

  // Convert file to ArrayBuffer to avoid "request body stream exhausted" error
  const arrayBuffer = await file.arrayBuffer();

  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, arrayBuffer, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    console.error("Error uploading file:", uploadError);
    throw new Error(`Failed to upload file: ${uploadError.message}`);
  }

  // Create attachment record
  const attachmentData: DbAttachmentInsert = {
    idea_id: ideaId,
    name: file.name,
    file_path: filePath,
    file_type: file.type,
    file_size: file.size,
    uploaded_by: user.id,
  };

  const { data, error } = await supabase
    .from("attachments")
    .insert(attachmentData)
    .select()
    .single();

  if (error) {
    // Clean up uploaded file if record creation fails
    await supabase.storage.from(STORAGE_BUCKET).remove([filePath]);
    console.error("Error creating attachment record:", error);
    throw new Error(`Failed to create attachment: ${error.message}`);
  }

  return data;
}

/**
 * Upload an attachment to an idea with pre-read data (Safari fix)
 */
export async function uploadIdeaAttachmentWithData(
  ideaId: string,
  file: File,
  data: ArrayBuffer
): Promise<DbAttachment> {
  const supabase = createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Generate storage path
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const filePath = `${user.id}/${ideaId}/${timestamp}_${sanitizedName}`;

  // Upload to storage with pre-read data
  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, data, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    console.error("Error uploading file:", uploadError);
    throw new Error(`Failed to upload file: ${uploadError.message}`);
  }

  // Create attachment record
  const attachmentData: DbAttachmentInsert = {
    idea_id: ideaId,
    name: file.name,
    file_path: filePath,
    file_type: file.type,
    file_size: file.size,
    uploaded_by: user.id,
  };

  const { data: attachment, error } = await supabase
    .from("attachments")
    .insert(attachmentData)
    .select()
    .single();

  if (error) {
    await supabase.storage.from(STORAGE_BUCKET).remove([filePath]);
    console.error("Error creating attachment record:", error);
    throw new Error(`Failed to create attachment: ${error.message}`);
  }

  return attachment;
}

// ============================================
// TASK ATTACHMENTS
// ============================================

/**
 * Get attachments for a task
 */
export async function getTaskAttachments(taskId: string): Promise<DbAttachment[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("attachments")
    .select("*")
    .eq("task_id", taskId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching task attachments:", error);
    throw new Error(`Failed to fetch attachments: ${error.message}`);
  }

  return data || [];
}

/**
 * Upload an attachment to a task
 */
export async function uploadTaskAttachment(
  taskId: string,
  file: File
): Promise<DbAttachment> {
  const supabase = createClient();

  // Validate file
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Generate storage path
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const filePath = `${user.id}/tasks/${taskId}/${timestamp}_${sanitizedName}`;

  // Convert file to ArrayBuffer to avoid "request body stream exhausted" error
  const arrayBuffer = await file.arrayBuffer();

  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, arrayBuffer, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    console.error("Error uploading file:", uploadError);
    throw new Error(`Failed to upload file: ${uploadError.message}`);
  }

  // Create attachment record
  const attachmentData: DbAttachmentInsert = {
    task_id: taskId,
    name: file.name,
    file_path: filePath,
    file_type: file.type,
    file_size: file.size,
    uploaded_by: user.id,
  };

  const { data, error } = await supabase
    .from("attachments")
    .insert(attachmentData)
    .select()
    .single();

  if (error) {
    // Clean up uploaded file if record creation fails
    await supabase.storage.from(STORAGE_BUCKET).remove([filePath]);
    console.error("Error creating attachment record:", error);
    throw new Error(`Failed to create attachment: ${error.message}`);
  }

  return data;
}

/**
 * Upload an attachment to a task with pre-read data (Safari fix)
 */
export async function uploadTaskAttachmentWithData(
  taskId: string,
  file: File,
  data: ArrayBuffer
): Promise<DbAttachment> {
  const supabase = createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Generate storage path
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const filePath = `${user.id}/tasks/${taskId}/${timestamp}_${sanitizedName}`;

  // Upload to storage with pre-read data
  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, data, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    console.error("Error uploading file:", uploadError);
    throw new Error(`Failed to upload file: ${uploadError.message}`);
  }

  // Create attachment record
  const attachmentData: DbAttachmentInsert = {
    task_id: taskId,
    name: file.name,
    file_path: filePath,
    file_type: file.type,
    file_size: file.size,
    uploaded_by: user.id,
  };

  const { data: attachment, error } = await supabase
    .from("attachments")
    .insert(attachmentData)
    .select()
    .single();

  if (error) {
    await supabase.storage.from(STORAGE_BUCKET).remove([filePath]);
    console.error("Error creating attachment record:", error);
    throw new Error(`Failed to create attachment: ${error.message}`);
  }

  return attachment;
}

// ============================================
// SHARED OPERATIONS
// ============================================

/**
 * Get a single attachment by ID
 */
export async function getAttachment(attachmentId: string): Promise<DbAttachment | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("attachments")
    .select("*")
    .eq("id", attachmentId)
    .single();

  if (error) {
    console.error("Error fetching attachment:", error);
    return null;
  }

  return data;
}

/**
 * Get download URL for an attachment
 */
export async function getAttachmentUrl(attachment: DbAttachment): Promise<string> {
  const supabase = createClient();

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(attachment.file_path, 3600); // 1 hour expiry

  if (error) {
    console.error("Error creating signed URL:", error);
    throw new Error(`Failed to get download URL: ${error.message}`);
  }

  return data.signedUrl;
}

/**
 * Delete an attachment
 */
export async function deleteAttachment(attachmentId: string): Promise<void> {
  const supabase = createClient();

  // Get attachment to find file path
  const attachment = await getAttachment(attachmentId);
  if (!attachment) {
    throw new Error("Attachment not found");
  }

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([attachment.file_path]);

  if (storageError) {
    console.error("Error deleting file from storage:", storageError);
    // Continue to delete record even if storage delete fails
  }

  // Delete record
  const { error } = await supabase
    .from("attachments")
    .delete()
    .eq("id", attachmentId);

  if (error) {
    console.error("Error deleting attachment:", error);
    throw new Error(`Failed to delete attachment: ${error.message}`);
  }
}
