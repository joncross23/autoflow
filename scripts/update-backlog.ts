/**
 * Update Project Backlog Script
 * - Creates a "Bugs" column
 * - Adds missing features from mockups
 * - Moves completed items to Done
 * - Adds known bugs
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Load environment variables from .env.local
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const [key, ...valueParts] = line.split("=");
    if (key && valueParts.length > 0) {
      const value = valueParts.join("=").trim();
      process.env[key.trim()] = value;
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing environment variables!");
  console.error("   NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✓" : "✗");
  console.error("   SUPABASE_SERVICE_ROLE_KEY:", supabaseServiceKey ? "✓" : "✗");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Feature categories for backlog items
const MISSING_FEATURES = {
  "Task Detail Modal": [
    { title: "Add start date and due date fields to tasks", labels: ["feature", "high"] },
    { title: "Add attachments support (upload files/images)", labels: ["feature", "high"] },
    { title: "Add links section with URL previews", labels: ["feature", "medium"] },
    { title: "Add comments/threaded discussion", labels: ["feature", "medium"] },
    { title: "Add activity log (change history)", labels: ["feature", "low"] },
    { title: "Add members/assignees to tasks", labels: ["feature", "medium"] },
    { title: "Add card cover (image or color)", labels: ["feature", "low"] },
    { title: "Add custom fields (text, number, dropdown)", labels: ["feature", "low"] },
    { title: "Add watch/subscribe for notifications", labels: ["feature", "low"] },
    { title: "Add archive (soft delete) instead of hard delete", labels: ["feature", "medium"] },
    { title: "Add card templates", labels: ["feature", "low"] },
    { title: "Add copy/move task between projects", labels: ["feature", "low"] },
  ],
  "Checklists": [
    { title: "Add checklist item due dates", labels: ["feature", "medium"] },
    { title: "Add new checklist items from modal", labels: ["feature", "high"] },
    { title: "Add new checklists to tasks", labels: ["feature", "high"] },
    { title: "Delete checklist items", labels: ["feature", "high"] },
    { title: "Checklist quick-add (paste multi-line → separate items)", labels: ["feature", "low"] },
    { title: "Reorder checklist items via drag-drop", labels: ["feature", "low"] },
  ],
  "Column Features": [
    { title: "Add column drag-drop reordering", labels: ["feature", "high"] },
    { title: "Add collapse/expand columns", labels: ["feature", "low"] },
    { title: "Add new column button", labels: ["feature", "high"] },
    { title: "Sort cards within column (by date, name, etc.)", labels: ["feature", "medium"] },
    { title: "Bulk column actions (move/copy all cards)", labels: ["feature", "low"] },
    { title: "Edit column name inline", labels: ["feature", "medium"] },
    { title: "Change column color", labels: ["feature", "low"] },
  ],
  "Board Features": [
    { title: "Add view toggle (Board/Table/Timeline)", labels: ["feature", "medium"] },
    { title: "Add filter panel for tasks", labels: ["feature", "high"] },
    { title: "Add search within project", labels: ["feature", "high"] },
    { title: "Multi-select tasks with Shift+Click", labels: ["feature", "medium"] },
    { title: "Batch operations on selected tasks", labels: ["feature", "medium"] },
  ],
  "Project Features": [
    { title: "Edit project title inline", labels: ["feature", "high"] },
    { title: "Edit project description", labels: ["feature", "medium"] },
    { title: "Project settings page", labels: ["feature", "medium"] },
    { title: "Project archive/restore", labels: ["feature", "low"] },
  ],
  "AI Features": [
    { title: "AI analysis on tasks (not just ideas)", labels: ["feature", "ai", "medium"] },
    { title: "AI suggest tasks from description", labels: ["feature", "ai", "medium"] },
    { title: "AI estimate hours for tasks", labels: ["feature", "ai", "low"] },
    { title: "Re-run AI analysis button", labels: ["feature", "ai", "low"] },
  ],
  "Dashboard": [
    { title: "Add recent activity feed widget", labels: ["feature", "high"] },
    { title: "Add completed projects stats widget", labels: ["feature", "medium"] },
    { title: "Add total impact widget (hours saved, £ value)", labels: ["feature", "medium"] },
    { title: "Ideas pipeline widget (counts by status)", labels: ["feature", "medium"] },
  ],
  "Auth & Users": [
    { title: "Add magic link authentication", labels: ["feature", "auth", "low"] },
    { title: "Add MFA/TOTP support", labels: ["feature", "auth", "low"] },
    { title: "Add user roles (Admin, Editor, Viewer)", labels: ["feature", "auth", "medium"] },
    { title: "User profile settings page", labels: ["feature", "auth", "low"] },
  ],
  "PWA & Offline": [
    { title: "Add service worker for PWA", labels: ["feature", "pwa", "low"] },
    { title: "Offline idea capture with sync", labels: ["feature", "pwa", "low"] },
    { title: "Offline indicator in UI", labels: ["feature", "pwa", "low"] },
  ],
  "Questionnaires": [
    { title: "Create questionnaire template builder", labels: ["feature", "forms", "medium"] },
    { title: "Public questionnaire submission forms", labels: ["feature", "forms", "medium"] },
    { title: "AI analysis of questionnaire responses", labels: ["feature", "forms", "ai", "medium"] },
    { title: "Response management dashboard", labels: ["feature", "forms", "low"] },
  ],
  "Data & Export": [
    { title: "Version history for ideas/projects", labels: ["feature", "low"] },
    { title: "Bulk import from CSV/Excel", labels: ["feature", "medium"] },
    { title: "GDPR export (JSON/CSV)", labels: ["feature", "compliance", "low"] },
    { title: "Time audit generation (Excel/PDF)", labels: ["feature", "medium"] },
  ],
};

const KNOWN_BUGS = [
  { title: "Task drag-drop position doesn't persist correctly", labels: ["bug", "high"] },
  { title: "Labels may fail to load silently (no error shown)", labels: ["bug", "medium"] },
  { title: "Checklist toggle may not save on slow connections", labels: ["bug", "medium"] },
  { title: "Modal closes on outside click during save", labels: ["bug", "low"] },
  { title: "WIP limit warning shown but not enforced", labels: ["bug", "low"] },
];

async function main() {
  console.log("🔄 Starting backlog update...\n");

  // 1. Find the AutoFlow Development project
  const { data: projects, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .ilike("title", "%AutoFlow%")
    .limit(1);

  if (projectError || !projects?.length) {
    console.error("❌ Could not find AutoFlow project:", projectError);
    process.exit(1);
  }

  const project = projects[0];
  console.log(`📋 Found project: ${project.title} (${project.id})\n`);

  // 2. Get existing columns
  const { data: columns, error: colError } = await supabase
    .from("columns")
    .select("*")
    .eq("project_id", project.id)
    .order("position");

  if (colError) {
    console.error("❌ Error fetching columns:", colError);
    process.exit(1);
  }

  console.log("📊 Existing columns:");
  columns?.forEach((c) => console.log(`   - ${c.name} (position: ${c.position})`));
  console.log();

  // Find key columns
  const backlogColumn = columns?.find((c) => c.name.toLowerCase().includes("backlog"));
  const doneColumn = columns?.find((c) => c.name.toLowerCase().includes("done"));
  let bugsColumn = columns?.find((c) => c.name.toLowerCase().includes("bug"));

  // 3. Create Bugs column if it doesn't exist
  if (!bugsColumn) {
    const maxPosition = Math.max(...(columns?.map((c) => c.position) || [0]));
    const { data: newCol, error: createError } = await supabase
      .from("columns")
      .insert({
        project_id: project.id,
        name: "Bugs",
        position: maxPosition + 1,
        color: "red",
      })
      .select()
      .single();

    if (createError) {
      console.error("❌ Error creating Bugs column:", createError);
    } else {
      bugsColumn = newCol;
      console.log("✅ Created Bugs column\n");
    }
  } else {
    console.log("✓ Bugs column already exists\n");
  }

  // 4. Get existing tasks to avoid duplicates
  const { data: existingTasks } = await supabase
    .from("tasks")
    .select("title")
    .eq("project_id", project.id);

  const existingTitles = new Set(existingTasks?.map((t) => t.title.toLowerCase()) || []);

  // 5. Add missing features to backlog
  if (backlogColumn) {
    console.log("📝 Adding missing features to backlog...\n");
    let addedCount = 0;
    let skippedCount = 0;

    for (const [category, features] of Object.entries(MISSING_FEATURES)) {
      for (const feature of features) {
        if (existingTitles.has(feature.title.toLowerCase())) {
          skippedCount++;
          continue;
        }

        const { error } = await supabase.from("tasks").insert({
          project_id: project.id,
          column_id: backlogColumn.id,
          title: feature.title,
          description: `Category: ${category}`,
          position: addedCount,
        });

        if (error) {
          console.error(`   ❌ Failed to add: ${feature.title}`, error.message);
        } else {
          console.log(`   ✅ ${feature.title}`);
          addedCount++;
        }
      }
    }

    console.log(`\n📊 Added ${addedCount} features, skipped ${skippedCount} duplicates\n`);
  }

  // 6. Add known bugs to Bugs column
  if (bugsColumn) {
    console.log("🐛 Adding known bugs...\n");
    let bugCount = 0;

    for (const bug of KNOWN_BUGS) {
      if (existingTitles.has(bug.title.toLowerCase())) {
        console.log(`   ⏭ Already exists: ${bug.title}`);
        continue;
      }

      const { error } = await supabase.from("tasks").insert({
        project_id: project.id,
        column_id: bugsColumn.id,
        title: bug.title,
        position: bugCount,
      });

      if (error) {
        console.error(`   ❌ Failed to add: ${bug.title}`, error.message);
      } else {
        console.log(`   ✅ ${bug.title}`);
        bugCount++;
      }
    }

    console.log(`\n📊 Added ${bugCount} bugs\n`);
  }

  // 7. List completed items that should be in Done
  console.log("📋 Checking for items to move to Done...\n");

  const completedKeywords = [
    "theme system",
    "authentication",
    "supabase",
    "next.js",
    "idea capture",
    "ai evaluation",
    "project kanban",
    "task kanban",
    "drag-drop",
    "quick capture",
    "cmd+k",
  ];

  const { data: allTasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("project_id", project.id);

  const tasksToMove: string[] = [];
  allTasks?.forEach((task) => {
    if (task.completed && task.column_id !== doneColumn?.id) {
      tasksToMove.push(task.title);
    }
  });

  if (tasksToMove.length > 0) {
    console.log("   Tasks marked complete but not in Done:");
    tasksToMove.forEach((t) => console.log(`   - ${t}`));

    if (doneColumn) {
      const { error } = await supabase
        .from("tasks")
        .update({ column_id: doneColumn.id })
        .eq("project_id", project.id)
        .eq("completed", true)
        .neq("column_id", doneColumn.id);

      if (!error) {
        console.log(`\n   ✅ Moved ${tasksToMove.length} completed tasks to Done`);
      }
    }
  } else {
    console.log("   ✓ All completed tasks are already in Done column\n");
  }

  // 8. Summary
  const { data: finalTasks } = await supabase
    .from("tasks")
    .select("column_id")
    .eq("project_id", project.id);

  const { data: finalCols } = await supabase
    .from("columns")
    .select("*")
    .eq("project_id", project.id)
    .order("position");

  console.log("\n📊 Final Summary:");
  finalCols?.forEach((col) => {
    const count = finalTasks?.filter((t) => t.column_id === col.id).length || 0;
    console.log(`   ${col.name}: ${count} tasks`);
  });

  console.log("\n✨ Backlog update complete!");
}

main().catch(console.error);
