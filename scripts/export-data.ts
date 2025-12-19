/**
 * Export current database data to JSON files
 * Run this BEFORE migration to create a manual backup
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function exportData() {
  const backupDir = path.join(process.cwd(), "backup-" + new Date().toISOString().split("T")[0]);

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  console.log(`Creating backup in: ${backupDir}`);

  // Export ideas
  const { data: ideas, error: ideasError } = await supabase
    .from("ideas")
    .select("*");

  if (ideasError) throw ideasError;
  fs.writeFileSync(
    path.join(backupDir, "ideas.json"),
    JSON.stringify(ideas, null, 2)
  );
  console.log(`✓ Exported ${ideas?.length || 0} ideas`);

  // Export projects
  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select("*");

  if (projectsError) throw projectsError;
  fs.writeFileSync(
    path.join(backupDir, "projects.json"),
    JSON.stringify(projects, null, 2)
  );
  console.log(`✓ Exported ${projects?.length || 0} projects`);

  // Export tasks
  const { data: tasks, error: tasksError } = await supabase
    .from("tasks")
    .select("*");

  if (tasksError) throw tasksError;
  fs.writeFileSync(
    path.join(backupDir, "tasks.json"),
    JSON.stringify(tasks, null, 2)
  );
  console.log(`✓ Exported ${tasks?.length || 0} tasks`);

  // Export evaluations
  const { data: evaluations, error: evalsError } = await supabase
    .from("evaluations")
    .select("*");

  if (evalsError) throw evalsError;
  fs.writeFileSync(
    path.join(backupDir, "evaluations.json"),
    JSON.stringify(evaluations, null, 2)
  );
  console.log(`✓ Exported ${evaluations?.length || 0} evaluations`);

  console.log(`\n✅ Backup complete! Files saved to: ${backupDir}`);
  console.log("\nTo restore, you can manually insert this data back via Supabase SQL Editor");
}

exportData().catch(console.error);
