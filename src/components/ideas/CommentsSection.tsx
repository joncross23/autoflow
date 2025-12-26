"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  MessageSquare,
  Send,
  MoreHorizontal,
  Edit2,
  Trash2,
  Reply,
  Loader2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import { useConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  getIdeaComments,
  createComment,
  updateComment,
  deleteComment,
  CommentWithReplies,
} from "@/lib/api/comments";

interface CommentsSectionProps {
  ideaId: string;
}

interface CommentItemProps {
  comment: CommentWithReplies;
  ideaId: string;
  onReply: (parentId: string) => void;
  onUpdate: () => void;
  depth?: number;
}

function CommentItem({
  comment,
  ideaId,
  onReply,
  onUpdate,
  depth = 0,
}: CommentItemProps) {
  const { confirm, dialog } = useConfirmDialog();
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEdit = async () => {
    if (!editContent.trim() || editContent === comment.content) {
      setIsEditing(false);
      return;
    }

    try {
      setIsSaving(true);
      await updateComment(comment.id, editContent.trim());
      setIsEditing(false);
      onUpdate();
    } catch (err) {
      console.error("Failed to update comment:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: "Delete Comment",
      message: "Are you sure you want to delete this comment?",
      confirmLabel: "Delete",
      variant: "danger",
      icon: "trash",
    });
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      await deleteComment(comment.id);
      onUpdate();
    } catch (err) {
      console.error("Failed to delete comment:", err);
      setIsDeleting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleEdit();
    }
    if (e.key === "Escape") {
      setIsEditing(false);
      setEditContent(comment.content);
    }
  };

  const hasReplies = comment.replies.length > 0;
  const maxDepth = 3;

  return (
    <div className={cn("group", depth > 0 && "ml-6 mt-2")}>
      <div className="flex gap-3">
        {/* Avatar placeholder */}
        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
          <span className="text-xs font-medium text-primary">
            {comment.user_email?.charAt(0).toUpperCase() || "U"}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium truncate">
              {comment.user_email || "User"}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(comment.created_at)}
            </span>
            {comment.is_edited && (
              <span className="text-xs text-muted-foreground">(edited)</span>
            )}
          </div>

          {/* Content */}
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={handleKeyDown}
                className="input w-full text-sm resize-none"
                rows={2}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleEdit}
                  disabled={isSaving}
                  className="btn btn-primary btn-sm"
                >
                  {isSaving ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    "Save"
                  )}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                  className="btn btn-outline btn-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-foreground whitespace-pre-wrap">
              {comment.content}
            </p>
          )}

          {/* Actions */}
          {!isEditing && (
            <div className="flex items-center gap-3 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {depth < maxDepth && (
                <button
                  onClick={() => onReply(comment.id)}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <Reply className="h-3 w-3" />
                  Reply
                </button>
              )}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="text-muted-foreground hover:text-foreground p-1"
                >
                  <MoreHorizontal className="h-3 w-3" />
                </button>
                {showMenu && (
                  <div className="absolute left-0 top-full mt-1 bg-bg-elevated border border-border rounded-lg shadow-lg z-10 py-1 min-w-[100px]">
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setShowMenu(false);
                      }}
                      className="w-full px-3 py-1.5 text-left text-sm hover:bg-bg-hover flex items-center gap-2"
                    >
                      <Edit2 className="h-3 w-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        handleDelete();
                        setShowMenu(false);
                      }}
                      disabled={isDeleting}
                      className="w-full px-3 py-1.5 text-left text-sm hover:bg-bg-hover flex items-center gap-2 text-error"
                    >
                      {isDeleting ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Replies */}
      {hasReplies && (
        <div className="mt-2">
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground ml-11 mb-2"
          >
            {showReplies ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
            {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
          </button>
          {showReplies && (
            <div className="border-l-2 border-border-subtle">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  ideaId={ideaId}
                  onReply={onReply}
                  onUpdate={onUpdate}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {dialog}
    </div>
  );
}

export function CommentsSection({ ideaId }: CommentsSectionProps) {
  const [comments, setComments] = useState<CommentWithReplies[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load comments function wrapped in useCallback
  const loadComments = useCallback(async () => {
    try {
      const data = await getIdeaComments(ideaId);
      setComments(data);
    } catch (err) {
      console.error("Failed to load comments:", err);
    } finally {
      setLoading(false);
    }
  }, [ideaId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  useEffect(() => {
    if (replyingTo && inputRef.current) {
      inputRef.current.focus();
    }
  }, [replyingTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    try {
      setSubmitting(true);
      await createComment({
        content: newComment.trim(),
        idea_id: ideaId,
        parent_id: replyingTo || undefined,
      });
      setNewComment("");
      setReplyingTo(null);
      loadComments();
    } catch (err) {
      console.error("Failed to create comment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
    if (e.key === "Escape" && replyingTo) {
      setReplyingTo(null);
    }
  };

  const totalComments = comments.reduce(
    (count, c) => count + 1 + c.replies.length,
    0
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-medium">
          Comments{" "}
          <span className="text-muted-foreground font-normal">
            ({totalComments})
          </span>
        </h3>
      </div>

      {/* Comment Input */}
      <form onSubmit={handleSubmit} className="space-y-2">
        {replyingTo && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Reply className="h-3 w-3" />
            Replying to comment
            <button
              type="button"
              onClick={() => setReplyingTo(null)}
              className="text-primary hover:underline"
            >
              Cancel
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={replyingTo ? "Write a reply..." : "Add a comment..."}
            className="input flex-1 text-sm resize-none"
            rows={2}
          />
          <button
            type="submit"
            disabled={!newComment.trim() || submitting}
            className="btn btn-primary self-end"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
      </form>

      {/* Comments List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No comments yet. Be the first to comment!
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              ideaId={ideaId}
              onReply={setReplyingTo}
              onUpdate={loadComments}
            />
          ))}
        </div>
      )}
    </div>
  );
}
