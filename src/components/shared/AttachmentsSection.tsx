"use client";

/**
 * AttachmentsSection Component
 * File attachments for ideas and tasks
 * V1.3: Rich Cards feature
 */

import { useState, useEffect, useRef } from "react";
import { Paperclip, Plus, Trash2, Download, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getIdeaAttachments,
  getTaskAttachments,
  uploadIdeaAttachment,
  uploadTaskAttachment,
  deleteAttachment,
  getAttachmentUrl,
  getFileIcon,
  formatFileSize,
  validateFile,
} from "@/lib/api/attachments";
import type { DbAttachment } from "@/types/database";

interface AttachmentsSectionProps {
  /** ID of the idea (mutually exclusive with taskId) */
  ideaId?: string;
  /** ID of the task (mutually exclusive with ideaId) */
  taskId?: string;
  /** Custom class name */
  className?: string;
  /** Callback when attachments change */
  onAttachmentsChange?: (count: number) => void;
  /** Hide the section header (when wrapped in CollapsibleSection) */
  hideHeader?: boolean;
}

export function AttachmentsSection({
  ideaId,
  taskId,
  className,
  onAttachmentsChange,
  hideHeader = false,
}: AttachmentsSectionProps) {
  const [attachments, setAttachments] = useState<DbAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Load attachments on mount
  useEffect(() => {
    loadAttachments();
  }, [ideaId, taskId]);

  // Update callback when attachments change
  useEffect(() => {
    onAttachmentsChange?.(attachments.length);
  }, [attachments, onAttachmentsChange]);

  async function loadAttachments() {
    setIsLoading(true);
    try {
      let data: DbAttachment[] = [];
      if (ideaId) {
        data = await getIdeaAttachments(ideaId);
      } else if (taskId) {
        data = await getTaskAttachments(taskId);
      }
      setAttachments(data);
    } catch (error) {
      console.error("Error loading attachments:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate file
        const validation = validateFile(file);
        if (!validation.valid) {
          setError(validation.error || "Invalid file");
          continue;
        }

        // Upload file
        let attachment: DbAttachment;
        if (ideaId) {
          attachment = await uploadIdeaAttachment(ideaId, file);
        } else if (taskId) {
          attachment = await uploadTaskAttachment(taskId, file);
        } else {
          continue;
        }

        setAttachments((prev) => [attachment, ...prev]);
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      }
    } catch (error) {
      console.error("Error uploading:", error);
      setError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handleDelete(attachment: DbAttachment) {
    if (!confirm("Delete this attachment?")) return;

    try {
      await deleteAttachment(attachment.id);
      setAttachments(attachments.filter((a) => a.id !== attachment.id));
    } catch (error) {
      console.error("Error deleting:", error);
      setError("Failed to delete attachment");
    }
  }

  async function handleDownload(attachment: DbAttachment) {
    try {
      const url = await getAttachmentUrl(attachment);
      const link = document.createElement("a");
      link.href = url;
      link.download = attachment.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading:", error);
      setError("Failed to download attachment");
    }
  }

  // Drag and drop handlers
  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === dropZoneRef.current) {
      setIsDragging(false);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleUpload(e.dataTransfer.files);
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Section Header - hidden when wrapped in CollapsibleSection */}
      {!hideHeader && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
            <Paperclip className="w-4 h-4 text-zinc-500" />
            Attachments
            {attachments.length > 0 && (
              <span className="text-xs text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">
                {attachments.length}
              </span>
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 disabled:opacity-50"
          >
            <Plus className="w-3 h-3" />
            Add
          </button>
        </div>
      )}

      {/* Hidden file input - always present */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => handleUpload(e.target.files)}
      />

      {/* Error Message */}
      {error && (
        <div className="text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded">
          {error}
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Upload className="w-3 h-3 animate-pulse" />
            Uploading...
          </div>
          <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-500 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Drop Zone / Attachments List */}
      <div
        ref={dropZoneRef}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          "rounded-lg transition-colors",
          isDragging && "bg-cyan-500/10 border-2 border-dashed border-cyan-500"
        )}
      >
        {isDragging ? (
          <div className="flex items-center justify-center py-8 text-sm text-cyan-400">
            Drop files here
          </div>
        ) : isLoading ? (
          <div className="text-xs text-zinc-500">Loading...</div>
        ) : attachments.length === 0 ? (
          <div className="text-xs text-zinc-500">
            No attachments. Drag files here or click Add.
          </div>
        ) : (
          <div className="space-y-1">
            {attachments.map((attachment) => (
              <AttachmentRow
                key={attachment.id}
                attachment={attachment}
                onDownload={() => handleDownload(attachment)}
                onDelete={() => handleDelete(attachment)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// Attachment Row Component
// ============================================

interface AttachmentRowProps {
  attachment: DbAttachment;
  onDownload: () => void;
  onDelete: () => void;
}

function AttachmentRow({ attachment, onDownload, onDelete }: AttachmentRowProps) {
  const icon = getFileIcon(attachment.file_type);
  const size = formatFileSize(attachment.file_size);
  const date = new Date(attachment.created_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });

  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-zinc-800/50 rounded-lg group hover:bg-zinc-800">
      <span className="text-lg">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-zinc-300 truncate">{attachment.name}</div>
        <div className="text-xs text-zinc-500">
          {size} · {date}
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onDownload}
          className="p-1.5 text-zinc-400 hover:text-cyan-400"
          title="Download"
        >
          <Download className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 text-zinc-400 hover:text-red-400"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
