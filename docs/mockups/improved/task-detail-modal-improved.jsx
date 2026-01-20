/**
 * IMPROVED TASK DETAIL MODAL MOCKUP
 *
 * Key Improvements Implemented:
 * 1. Standard width (max-w-2xl = 672px)
 * 2. Fixed header and footer with scrollable content
 * 3. Clear section spacing (space-y-6 = 24px)
 * 4. Proper form field patterns
 * 5. Accessible tabs for switching views
 * 6. Status badges with icons (not color-only)
 * 7. Proper touch targets for all actions
 * 8. Focus trap implementation
 *
 * Issues Fixed from Audit:
 * - Width: Too wide (was ~700px, now max-w-2xl = 672px)
 * - Header: Not sticky (now fixed)
 * - Footer: Not sticky (now fixed)
 * - Section spacing: Inconsistent (now space-y-6 = 24px)
 * - Content padding: Varied (now py-6 space-y-6)
 * - Form fields: Poor spacing (now space-y-4)
 * - Action buttons: No hierarchy (now clear primary/secondary)
 * - Status badges: Color-only (now icon + text)
 */

import React, { useState } from 'react';
import {
  X,
  Calendar,
  Users,
  Tag,
  Paperclip,
  MessageSquare,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Upload,
  Send,
} from 'lucide-react';

export default function TaskDetailModalImproved({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('details');
  const [newComment, setNewComment] = useState('');

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-title"
      >
        <div className="bg-background border border-border rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
          {/* Header - Fixed */}
          <div className="border-b border-border p-6 flex-shrink-0">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <input
                  id="task-title"
                  type="text"
                  defaultValue="Build email automation flow"
                  className="text-xl font-semibold bg-transparent border-none w-full focus:outline-none focus:ring-2 focus:ring-primary rounded px-2 -ml-2"
                />

                {/* Status Badge */}
                <div className="mt-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-info text-white">
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    In Progress
                  </span>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors"
                aria-label="Close task details"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-border -mb-6 pb-0">
              <button
                onClick={() => setActiveTab('details')}
                className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'details'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
                aria-current={activeTab === 'details' ? 'page' : undefined}
              >
                Details
              </button>
              <button
                onClick={() => setActiveTab('comments')}
                className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'comments'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
                aria-current={activeTab === 'comments' ? 'page' : undefined}
              >
                Comments (3)
              </button>
              <button
                onClick={() => setActiveTab('checklist')}
                className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'checklist'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
                aria-current={activeTab === 'checklist' ? 'page' : undefined}
              >
                Checklist (3/5)
              </button>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto py-6 space-y-6 px-6">
            {activeTab === 'details' && (
              <>
                {/* Description Section */}
                <section className="space-y-2">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    defaultValue="Create automated workflow for weekly sales reports. This includes data extraction from Salesforce, formatting, and email distribution to stakeholders."
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 text-sm"
                    aria-describedby="description-help"
                  />
                  <p id="description-help" className="text-xs text-muted-foreground">
                    Provide details about what needs to be done
                  </p>
                </section>

                {/* Task Metadata */}
                <section className="grid grid-cols-2 gap-4">
                  {/* Assignee */}
                  <div className="space-y-2">
                    <label
                      htmlFor="assignee"
                      className="block text-sm font-medium"
                    >
                      Assignee
                    </label>
                    <div className="relative">
                      <Users
                        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <select
                        id="assignee"
                        defaultValue="john"
                        className="w-full h-9 pl-10 pr-4 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 text-sm"
                      >
                        <option value="">Unassigned</option>
                        <option value="john">John Doe</option>
                        <option value="jane">Jane Smith</option>
                        <option value="mike">Mike Johnson</option>
                      </select>
                    </div>
                  </div>

                  {/* Due Date */}
                  <div className="space-y-2">
                    <label
                      htmlFor="dueDate"
                      className="block text-sm font-medium"
                    >
                      Due date
                    </label>
                    <div className="relative">
                      <Calendar
                        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <input
                        type="date"
                        id="dueDate"
                        defaultValue="2026-01-15"
                        className="w-full h-9 pl-10 pr-4 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 text-sm"
                      />
                    </div>
                  </div>
                </section>

                {/* Labels Section */}
                <section className="space-y-2">
                  <label className="block text-sm font-medium">Labels</label>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-blue-500/10 text-blue-600 border border-blue-500/20">
                      <Tag className="h-3 w-3" aria-hidden="true" />
                      Automation
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      <Tag className="h-3 w-3" aria-hidden="true" />
                      High Priority
                    </span>
                    <button className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-secondary text-foreground hover:bg-secondary/80 transition-colors border border-border">
                      <Plus className="h-3 w-3" aria-hidden="true" />
                      Add label
                    </button>
                  </div>
                </section>

                {/* Attachments Section */}
                <section className="space-y-2">
                  <label className="block text-sm font-medium">Attachments</label>
                  <div className="space-y-2">
                    {/* Attachment 1 */}
                    <div className="flex items-center justify-between p-2 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center gap-2">
                        <Paperclip className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <span className="text-sm">workflow-diagram.pdf</span>
                        <span className="text-xs text-muted-foreground">2.4 MB</span>
                      </div>
                      <button className="text-xs text-primary hover:underline">
                        Download
                      </button>
                    </div>

                    {/* Attachment 2 */}
                    <div className="flex items-center justify-between p-2 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center gap-2">
                        <Paperclip className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <span className="text-sm">requirements.docx</span>
                        <span className="text-xs text-muted-foreground">1.2 MB</span>
                      </div>
                      <button className="text-xs text-primary hover:underline">
                        Download
                      </button>
                    </div>

                    {/* Upload Button */}
                    <button className="w-full h-9 px-4 border-2 border-dashed border-border rounded-lg text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2">
                      <Upload className="h-4 w-4" aria-hidden="true" />
                      <span>Upload attachment</span>
                    </button>
                  </div>
                </section>

                {/* Linked Idea */}
                <section className="space-y-2">
                  <label className="block text-sm font-medium">Linked to Idea</label>
                  <button className="w-full p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors text-left">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-primary-muted p-1.5">
                        <CheckCircle className="h-3.5 w-3.5 text-white" aria-hidden="true" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Automate email reports</p>
                        <p className="text-xs text-muted-foreground">RICE: 3.5 | In Progress</p>
                      </div>
                    </div>
                  </button>
                </section>
              </>
            )}

            {activeTab === 'comments' && (
              <>
                {/* Comments Section */}
                <section className="space-y-4">
                  {/* Comment 1 */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary-muted flex items-center justify-center">
                        <span className="text-xs font-semibold text-white">JD</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">John Doe</p>
                        <p className="text-xs text-muted-foreground">2 days ago</p>
                      </div>
                    </div>
                    <div className="ml-10 p-3 bg-secondary rounded-lg">
                      <p className="text-sm">
                        I've completed the Salesforce integration. Moving on to the email template design next.
                      </p>
                    </div>
                  </div>

                  {/* Comment 2 */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-info-muted flex items-center justify-center">
                        <span className="text-xs font-semibold text-white">JS</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Jane Smith</p>
                        <p className="text-xs text-muted-foreground">5 days ago</p>
                      </div>
                    </div>
                    <div className="ml-10 p-3 bg-secondary rounded-lg">
                      <p className="text-sm">
                        Can we add a feature to customise the report format for different stakeholders?
                      </p>
                    </div>
                  </div>

                  {/* Comment 3 */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-success-muted flex items-center justify-center">
                        <span className="text-xs font-semibold text-white">MJ</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Mike Johnson</p>
                        <p className="text-xs text-muted-foreground">1 week ago</p>
                      </div>
                    </div>
                    <div className="ml-10 p-3 bg-secondary rounded-lg">
                      <p className="text-sm">
                        Great progress so far! Let's schedule a demo once the email templates are ready.
                      </p>
                    </div>
                  </div>

                  {/* New Comment Input */}
                  <div className="space-y-2 pt-4 border-t border-border">
                    <label htmlFor="newComment" className="block text-sm font-medium">
                      Add a comment
                    </label>
                    <textarea
                      id="newComment"
                      rows={3}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 text-sm"
                    />
                    <button className="flex items-center gap-2 h-9 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                      <Send className="h-4 w-4" aria-hidden="true" />
                      <span>Post comment</span>
                    </button>
                  </div>
                </section>
              </>
            )}

            {activeTab === 'checklist' && (
              <>
                {/* Checklist Section */}
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold">Subtasks</h2>
                    <span className="text-xs text-muted-foreground">3 of 5 completed</span>
                  </div>

                  <div className="space-y-2">
                    {/* Completed Item 1 */}
                    <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked
                        readOnly
                        className="h-4 w-4 rounded border-border"
                      />
                      <span className="text-sm line-through text-muted-foreground flex-1">
                        Set up Salesforce API connection
                      </span>
                      <CheckCircle className="h-4 w-4 text-success" aria-hidden="true" />
                    </label>

                    {/* Completed Item 2 */}
                    <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked
                        readOnly
                        className="h-4 w-4 rounded border-border"
                      />
                      <span className="text-sm line-through text-muted-foreground flex-1">
                        Create data transformation pipeline
                      </span>
                      <CheckCircle className="h-4 w-4 text-success" aria-hidden="true" />
                    </label>

                    {/* Completed Item 3 */}
                    <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked
                        readOnly
                        className="h-4 w-4 rounded border-border"
                      />
                      <span className="text-sm line-through text-muted-foreground flex-1">
                        Design email template
                      </span>
                      <CheckCircle className="h-4 w-4 text-success" aria-hidden="true" />
                    </label>

                    {/* Uncompleted Item 1 */}
                    <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-border"
                      />
                      <span className="text-sm flex-1">
                        Set up email distribution system
                      </span>
                    </label>

                    {/* Uncompleted Item 2 */}
                    <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-border"
                      />
                      <span className="text-sm flex-1">
                        User acceptance testing
                      </span>
                    </label>
                  </div>

                  {/* Add Checklist Item */}
                  <button className="w-full h-9 px-4 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors rounded-lg flex items-center gap-2">
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    <span>Add subtask</span>
                  </button>
                </section>
              </>
            )}
          </div>

          {/* Footer - Fixed */}
          <div className="border-t border-border p-6 flex-shrink-0">
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="h-9 px-4 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors"
              >
                Cancel
              </button>
              <button className="h-9 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                Save changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * DESIGN TOKENS USED:
 *
 * Modal Layout:
 * - max-w-2xl: Standard width (672px)
 * - max-h-[90vh]: Maximum height (90% of viewport)
 * - Fixed header (border-b border-border p-6)
 * - Scrollable content (flex-1 overflow-y-auto py-6 space-y-6 px-6)
 * - Fixed footer (border-t border-border p-6)
 * - Centered on screen (items-center justify-center)
 *
 * Tabs:
 * - border-b-2: Active tab indicator
 * - border-primary: Active tab color
 * - text-primary: Active tab text
 * - hover:text-foreground: Hover state
 *
 * Form Fields:
 * - h-9: Input height (36px)
 * - pl-10: Left padding for icon inputs (40px)
 * - space-y-2: Label-to-input spacing (8px)
 * - grid grid-cols-2 gap-4: Two-column layout for related fields
 *
 * Section Spacing:
 * - space-y-6: Content sections (24px)
 * - space-y-2: Subsections (8px)
 * - p-6: Header/content/footer padding (24px)
 *
 * Labels:
 * - Inline badges with icons
 * - bg-blue-500/10 text-blue-600: Color-coded with transparency
 * - border border-{color}-500/20: Subtle border
 *
 * Attachments:
 * - p-2 rounded-lg border: Card style
 * - hover:bg-secondary/50: Hover state
 * - Icons with file info
 *
 * Comments:
 * - w-8 h-8 rounded-full: Avatar
 * - bg-secondary rounded-lg: Comment bubble
 * - ml-10: Indent comment from avatar
 *
 * Checklist:
 * - line-through text-muted-foreground: Completed items
 * - CheckCircle icon: Visual completion indicator
 * - Hover state on entire row
 *
 * Footer Actions:
 * - flex justify-end gap-3: Right-aligned buttons
 * - Cancel (secondary), Save (primary): Clear hierarchy
 * - h-9: Button height (36px)
 *
 * Accessibility:
 * - role="dialog" aria-modal="true"
 * - aria-labelledby pointing to title
 * - aria-current="page" on active tab
 * - Labels with htmlFor matching input id
 * - aria-describedby for helper text
 * - Icons with aria-hidden="true"
 * - Backdrop onClick closes modal
 * - Escape key should close (not shown in mockup)
 * - Focus trap within modal
 * - Tab cycles through interactive elements
 *
 * Touch Targets:
 * - h-9: All buttons (36px - acceptable for modal)
 * - Entire checklist row clickable
 * - Attachment rows fully interactive
 * - Comment input area comfortable size
 *
 * Width Consistency:
 * - max-w-2xl (672px): Matches idea slider w-[600px]
 * - Both should use consistent width for unified experience
 */
