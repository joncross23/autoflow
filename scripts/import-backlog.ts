/**
 * Import backlog data from docs/backlog/project.json
 * Creates the "AutoFlow Development" project with all tasks, columns, labels, and checklists
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Load environment variables from .env.local
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach(line => {
    const [key, ...valueParts] = line.split("=");
    if (key && valueParts.length > 0) {
      const value = valueParts.join("=").trim();
      process.env[key.trim()] = value;
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Use service role key for admin operations (bypasses RLS)
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing environment variables!");
  console.error("   NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✓" : "✗");
  console.error("   SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "✓" : "✗");
  console.log("\n💡 Tip: Add SUPABASE_SERVICE_ROLE_KEY to .env.local to bypass RLS");
  console.log("   Find it in: Supabase Dashboard > Project Settings > API > service_role key\n");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Get user_id from command line or fetch first user from database
async function getUserId(): Promise<string> {
  // Check for command line argument
  const userIdArg = process.argv[2];
  if (userIdArg) {
    console.log(`📧 Using provided user ID: ${userIdArg}`);
    return userIdArg;
  }

  // Fetch the first user from auth.users
  const { data: users, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error("❌ Error fetching users:", error.message);
    console.log("\n💡 Tip: Run with user ID as argument: npx tsx scripts/import-backlog.ts <user-id>");
    process.exit(1);
  }

  if (!users?.users || users.users.length === 0) {
    console.error("❌ No users found in database!");
    console.log("\n💡 Tip: Create a user account first by registering at http://localhost:3000/register");
    process.exit(1);
  }

  const user = users.users[0];
  console.log(`📧 Using first user: ${user.email} (${user.id})`);
  return user.id;
}

// Color mapping from backlog hex colors to our ColumnColor type
const colorMapping: Record<string, "slate" | "blue" | "green" | "orange" | "purple" | "red" | "yellow" | "pink"> = {
  "#6366f1": "blue",    // Backlog (indigo) -> blue
  "#f59e0b": "orange",  // Current Sprint (amber) -> orange
  "#3b82f6": "blue",    // In Progress (blue) -> blue
  "#8b5cf6": "purple",  // Review/QA (purple) -> purple
  "#22c55e": "green",   // Done (green) -> green
};

// Label color mapping
const labelColors: Record<string, "red" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink" | "slate" | "emerald" | "indigo"> = {
  "phase-0": "slate",
  "phase-0.5": "indigo",
  "phase-2": "blue",
  "phase-3": "emerald",
  "phase-4": "green",
  "phase-5": "yellow",
  "phase-6": "orange",
  "phase-7": "red",
  "phase-8": "purple",
  "design": "pink",
  "ui": "indigo",
  "mockup": "purple",
  "critical": "red",
  "mobile": "blue",
  "infrastructure": "slate",
  "database": "emerald",
  "devops": "slate",
  "auth": "orange",
  "security": "red",
  "feature": "green",
  "ideas": "yellow",
  "ai": "purple",
  "integration": "blue",
  "kanban": "indigo",
  "forms": "pink",
  "dashboard": "emerald",
  "export": "slate",
  "pwa": "blue",
  "offline": "slate",
  "import": "green",
};

interface BacklogData {
  project: {
    id: string;
    name: string;
    description: string;
    status: string;
  };
  columns: Array<{
    id: string;
    name: string;
    colour: string;
    order: number;
  }>;
  cards: Array<{
    id: string;
    title: string;
    description?: string;
    columnId: string;
    order: number;
    labels?: string[];
    priority?: string;
    phase?: string;
    checklists?: Array<{
      id: string;
      name: string;
      items: Array<{
        id: string;
        text: string;
        done: boolean;
      }>;
    }>;
    aiEvaluation?: {
      complexity: string;
      estimatedHours: number;
      businessValue: number;
    };
    createdAt: string;
  }>;
}

async function importBacklog() {
  console.log("🚀 Starting backlog import...\n");

  // Get user ID for ownership
  const userId = await getUserId();
  console.log("");

  // Read the backlog file
  const backlogPath = path.join(process.cwd(), "docs/backlog/project.json");
  const backlogData: BacklogData = JSON.parse(fs.readFileSync(backlogPath, "utf-8"));

  console.log(`📁 Project: ${backlogData.project.name}`);
  console.log(`📊 Columns: ${backlogData.columns.length}`);
  console.log(`📝 Tasks: ${backlogData.cards.length}\n`);

  // Step 1: Create the project
  console.log("1️⃣ Creating project...");
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      user_id: userId,
      title: backlogData.project.name,
      description: backlogData.project.description,
      status: "in_progress" as const,  // Using ProjectStatus enum
    })
    .select()
    .single();

  if (projectError) {
    console.error("❌ Error creating project:", projectError);
    throw projectError;
  }

  console.log(`✅ Project created: ${project.id}\n`);

  // Step 2: Delete default columns that were auto-created by trigger
  console.log("2️⃣ Removing default columns...");
  const { error: deleteError } = await supabase
    .from("columns")
    .delete()
    .eq("project_id", project.id);

  if (deleteError) {
    console.error("❌ Error deleting default columns:", deleteError);
    throw deleteError;
  }
  console.log("✅ Default columns removed\n");

  // Step 3: Create custom columns from backlog
  console.log("3️⃣ Creating custom columns...");
  const columnMapping: Record<string, string> = {};

  for (const col of backlogData.columns) {
    const { data: column, error: colError } = await supabase
      .from("columns")
      .insert({
        project_id: project.id,
        name: col.name,
        position: col.order,
        color: colorMapping[col.colour] || "slate",
      })
      .select()
      .single();

    if (colError) {
      console.error(`❌ Error creating column ${col.name}:`, colError);
      throw colError;
    }

    columnMapping[col.id] = column.id;
    console.log(`  ✅ ${col.name} (${col.colour} -> ${colorMapping[col.colour] || "slate"})`);
  }
  console.log("");

  // Step 4: Extract unique labels from all cards
  console.log("4️⃣ Creating labels...");
  const allLabels = new Set<string>();
  backlogData.cards.forEach(card => {
    card.labels?.forEach(label => allLabels.add(label));
  });

  const labelMapping: Record<string, string> = {};

  for (const labelName of Array.from(allLabels)) {
    const { data: label, error: labelError } = await supabase
      .from("labels")
      .insert({
        user_id: userId,
        name: labelName,
        color: labelColors[labelName] || "slate",
      })
      .select()
      .single();

    if (labelError) {
      console.error(`❌ Error creating label ${labelName}:`, labelError);
      throw labelError;
    }

    labelMapping[labelName] = label.id;
    console.log(`  ✅ ${labelName} (${labelColors[labelName] || "slate"})`);
  }
  console.log("");

  // Step 5: Import tasks
  console.log("5️⃣ Importing tasks...");
  let importedCount = 0;

  for (const card of backlogData.cards) {
    // Create task
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .insert({
        project_id: project.id,
        column_id: columnMapping[card.columnId],
        title: card.title,
        description: card.description || null,
        completed: false,
        position: card.order,
      })
      .select()
      .single();

    if (taskError) {
      console.error(`❌ Error creating task ${card.id}:`, taskError);
      throw taskError;
    }

    // Add labels to task
    if (card.labels && card.labels.length > 0) {
      const taskLabels = card.labels.map(labelName => ({
        task_id: task.id,
        label_id: labelMapping[labelName],
      }));

      const { error: labelLinkError } = await supabase
        .from("task_labels")
        .insert(taskLabels);

      if (labelLinkError) {
        console.error(`❌ Error linking labels to task ${card.id}:`, labelLinkError);
        throw labelLinkError;
      }
    }

    // Create checklists and items
    if (card.checklists && card.checklists.length > 0) {
      for (let checklistIndex = 0; checklistIndex < card.checklists.length; checklistIndex++) {
        const checklistData = card.checklists[checklistIndex];

        const { data: checklist, error: checklistError } = await supabase
          .from("checklists")
          .insert({
            task_id: task.id,
            title: checklistData.name,
            position: checklistIndex,
          })
          .select()
          .single();

        if (checklistError) {
          console.error(`❌ Error creating checklist:`, checklistError);
          throw checklistError;
        }

        // Create checklist items
        if (checklistData.items && checklistData.items.length > 0) {
          const items = checklistData.items.map((item, itemIndex) => ({
            checklist_id: checklist.id,
            title: item.text,
            done: item.done,
            position: itemIndex,
          }));

          const { error: itemsError } = await supabase
            .from("checklist_items")
            .insert(items);

          if (itemsError) {
            console.error(`❌ Error creating checklist items:`, itemsError);
            throw itemsError;
          }
        }
      }
    }

    importedCount++;
    console.log(`  ✅ ${card.id}: ${card.title}`);
  }

  console.log("");
  console.log("=" .repeat(60));
  console.log("🎉 Import Complete!");
  console.log("=" .repeat(60));
  console.log(`📁 Project: ${backlogData.project.name} (ID: ${project.id})`);
  console.log(`📊 Columns: ${backlogData.columns.length} custom columns`);
  console.log(`🏷️  Labels: ${allLabels.size} unique labels`);
  console.log(`📝 Tasks: ${importedCount}/${backlogData.cards.length} imported`);
  console.log("");
  console.log(`🔗 View at: /dashboard/projects/${project.id}`);
  console.log("");
}

importBacklog().catch(console.error);
