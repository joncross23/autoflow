"use client";

/**
 * AttachmentsSection Component
 * File attachments for ideas and tasks
 * V1.3: Rich Cards feature
 */

import { useState, useEffect, useRef } from "react";
import { Paperclip, Plus, Trash2, Download, Upload, Eye, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getIdeaAttachments,
  getTaskAttachments,
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
  const [previewAttachment, setPreviewAttachment] = useState<DbAttachment | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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

  // Upload files via XMLHttpRequest - Safari/WebKit compatible
  // XHR has different implementation than fetch and may handle files better
  function uploadViaXHR(files: File[]) {
    if (files.length === 0) return;

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    let currentIndex = 0;

    function uploadNext() {
      if (currentIndex >= files.length) {
        setIsUploading(false);
        setUploadProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      const file = files[currentIndex];
      const formData = new FormData();
      formData.append("file", file);
      if (ideaId) formData.append("ideaId", ideaId);
      if (taskId) formData.append("taskId", taskId);

      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const fileProgress = (e.loaded / e.total) * 100;
          const overallProgress = ((currentIndex + fileProgress / 100) / files.length) * 100;
          setUploadProgress(Math.round(overallProgress));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            if (response.attachment) {
              setAttachments((prev) => [response.attachment, ...prev]);
            }
            currentIndex++;
            uploadNext();
          } catch {
            setError("Invalid server response");
            setIsUploading(false);
          }
        } else {
          try {
            const response = JSON.parse(xhr.responseText);
            setError(response.error || "Upload failed");
          } catch {
            setError(`Upload failed (${xhr.status})`);
          }
          setIsUploading(false);
        }
      };

      xhr.onerror = () => {
        console.error("XHR error during upload");
        setError("Upload failed - network error");
        setIsUploading(false);
      };

      xhr.open("POST", "/api/attachments/upload");
      xhr.send(formData);
    }

    // Start uploading immediately - no async/await to avoid Safari GC
    uploadNext();
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

  // Check if file type supports preview
  function isPreviewable(fileType: string): boolean {
    return fileType.startsWith("image/") || fileType === "application/pdf";
  }

  async function handlePreview(attachment: DbAttachment) {
    try {
      const url = await getAttachmentUrl(attachment);
      if (attachment.file_type && isPreviewable(attachment.file_type)) {
        setPreviewAttachment(attachment);
        setPreviewUrl(url);
      } else {
        // For non-previewable files, open in new tab
        window.open(url, "_blank");
      }
    } catch (error) {
      console.error("Error previewing:", error);
      setError("Failed to preview attachment");
    }
  }

  function closePreview() {
    setPreviewAttachment(null);
    setPreviewUrl(null);
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

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    // Validate and collect files
    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validation = validateFile(file);
      if (!validation.valid) {
        setError(validation.error || "Invalid file");
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    uploadViaXHR(validFiles);
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
        onChange={(e) => {
          const files = e.target.files;
          if (!files || files.length === 0) return;

          // Validate and collect files
          const validFiles: File[] = [];
          for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const validation = validateFile(file);
            if (!validation.valid) {
              setError(validation.error || "Invalid file");
              continue;
            }
            validFiles.push(file);
          }

          if (validFiles.length === 0) return;

          // Upload via API route - browser handles file reading
          uploadViaXHR(validFiles);
        }}
      />

      {/* Add Button - shown when header is hidden */}
      {hideHeader && !isUploading && (
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full px-3 py-2 text-xs font-medium text-foreground-muted hover:text-foreground border border-dashed border-border rounded-lg hover:border-primary hover:bg-bg-hover flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Attachment
        </button>
      )}

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
                onPreview={() => handlePreview(attachment)}
                onDownload={() => handleDownload(attachment)}
                onDelete={() => handleDelete(attachment)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewAttachment && previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={closePreview}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            {/* Close button */}
            <button
              onClick={closePreview}
              className="absolute -top-10 right-0 p-2 text-white/70 hover:text-white transition-colors"
              title="Close"
            >
              <X className="w-6 h-6" />
            </button>

            {/* File name */}
            <div className="absolute -top-10 left-0 text-sm text-white/70 truncate max-w-[50vw]">
              {previewAttachment.name}
            </div>

            {/* Preview content */}
            {previewAttachment.file_type?.startsWith("image/") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt={previewAttachment.name}
                className="max-w-full max-h-[85vh] object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            ) : previewAttachment.file_type === "application/pdf" ? (
              <iframe
                src={previewUrl}
                title={previewAttachment.name}
                className="w-[80vw] h-[85vh] rounded-lg bg-white"
                onClick={(e) => e.stopPropagation()}
              />
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// Attachment Row Component
// ============================================

interface AttachmentRowProps {
  attachment: DbAttachment;
  onPreview: () => void;
  onDownload: () => void;
  onDelete: () => void;
}

function AttachmentRow({ attachment, onPreview, onDownload, onDelete }: AttachmentRowProps) {
  const icon = getFileIcon(attachment.file_type);
  const size = formatFileSize(attachment.file_size);
  const date = new Date(attachment.created_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });

  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-zinc-800/50 rounded-lg group hover:bg-zinc-800">
      <button
        onClick={onPreview}
        className="text-lg hover:scale-110 transition-transform"
        title="Preview"
      >
        {icon}
      </button>
      <div className="flex-1 min-w-0 cursor-pointer" onClick={onPreview}>
        <div className="text-sm text-zinc-300 truncate">{attachment.name}</div>
        <div className="text-xs text-zinc-500">
          {size} · {date}
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onPreview}
          className="p-1.5 text-zinc-400 hover:text-cyan-400"
          title="Preview"
        >
          <Eye className="w-4 h-4" />
        </button>
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
