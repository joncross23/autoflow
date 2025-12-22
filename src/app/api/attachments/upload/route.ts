/**
 * Attachments Upload API Route
 * Handles file uploads for ideas and tasks
 * Safari/WebKit compatible - browser sends file via FormData
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
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

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse form data - browser handles file reading
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const ideaId = formData.get("ideaId") as string | null;
    const taskId = formData.get("taskId") as string | null;

    // Validate file
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is 10MB` },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "File type not allowed" },
        { status: 400 }
      );
    }

    // Must have either ideaId or taskId
    if (!ideaId && !taskId) {
      return NextResponse.json(
        { error: "Must provide ideaId or taskId" },
        { status: 400 }
      );
    }

    // Verify ownership before uploading
    if (ideaId) {
      const { data: idea } = await supabase
        .from("ideas")
        .select("id")
        .eq("id", ideaId)
        .eq("user_id", user.id)
        .single();

      if (!idea) {
        return NextResponse.json(
          { error: "Idea not found or access denied" },
          { status: 403 }
        );
      }
    }

    if (taskId) {
      // Tasks table has RLS - if we can fetch it, user has access via project ownership
      const { data: task, error: taskError } = await supabase
        .from("tasks")
        .select("id")
        .eq("id", taskId)
        .single();

      if (taskError || !task) {
        return NextResponse.json(
          { error: "Task not found or access denied" },
          { status: 403 }
        );
      }
    }

    // Generate storage path
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filePath = taskId
      ? `${user.id}/tasks/${taskId}/${timestamp}_${sanitizedName}`
      : `${user.id}/${ideaId}/${timestamp}_${sanitizedName}`;

    // Read file as ArrayBuffer (server-side, no Safari GC issues)
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
      return NextResponse.json(
        { error: `Failed to upload file: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Create attachment record
    const attachmentData: DbAttachmentInsert = {
      idea_id: ideaId || undefined,
      task_id: taskId || undefined,
      name: file.name,
      file_path: filePath,
      file_type: file.type,
      file_size: file.size,
      uploaded_by: user.id,
    };

    const { data: attachment, error: insertError } = await supabase
      .from("attachments")
      .insert(attachmentData)
      .select()
      .single();

    if (insertError) {
      // Clean up uploaded file if record creation fails
      await supabase.storage.from(STORAGE_BUCKET).remove([filePath]);
      console.error("Error creating attachment record:", insertError);
      return NextResponse.json(
        { error: `Failed to create attachment: ${insertError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ attachment });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
