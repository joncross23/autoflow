import { createClient } from "@/lib/supabase/client";
import type {
  DbProject,
  DbProjectInsert,
  DbProjectUpdate,
  ProjectStatus,
  DbIdea,
  Priority,
} from "@/types/database";

export async function getProjects(): Promise<DbProject[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .neq("status", "archived")
    .order("position", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data as DbProject[];
}

export async function getProjectsByStatus(status: ProjectStatus): Promise<DbProject[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("status", status)
    .order("position", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data as DbProject[];
}

export async function getProject(id: string): Promise<DbProject | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as DbProject | null;
}

export async function createProject(project: DbProjectInsert): Promise<DbProject> {
  const supabase = createClient();

  // Get the max position for the target status (default: backlog)
  const status = project.status || "backlog";
  const { data: maxPosData } = await supabase
    .from("projects")
    .select("position")
    .eq("status", status)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextPosition = maxPosData ? maxPosData.position + 1 : 0;

  const { data, error } = await supabase
    .from("projects")
    .insert({ ...project, position: nextPosition })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as DbProject;
}

export async function updateProject(
  id: string,
  updates: DbProjectUpdate
): Promise<DbProject> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("projects")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as DbProject;
}

export async function deleteProject(id: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from("projects").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function moveProject(
  id: string,
  newStatus: ProjectStatus,
  newPosition: number
): Promise<DbProject> {
  const supabase = createClient();

  // Get current project
  const { data: project, error: fetchError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !project) {
    throw new Error("Project not found");
  }

  const oldStatus = project.status;
  const oldPosition = project.position;

  // If moving within same column
  if (oldStatus === newStatus) {
    // Update positions of affected projects
    if (newPosition > oldPosition) {
      // Moving down: shift items up
      await supabase
        .from("projects")
        .update({ position: supabase.rpc("decrement_position") })
        .eq("status", newStatus)
        .gt("position", oldPosition)
        .lte("position", newPosition);
    } else if (newPosition < oldPosition) {
      // Moving up: shift items down
      await supabase
        .from("projects")
        .update({ position: supabase.rpc("increment_position") })
        .eq("status", newStatus)
        .gte("position", newPosition)
        .lt("position", oldPosition);
    }
  } else {
    // Moving to different column
    // Shift items up in old column
    await supabase.rpc("shift_positions_up", {
      p_status: oldStatus,
      p_from_position: oldPosition,
    });

    // Shift items down in new column
    await supabase.rpc("shift_positions_down", {
      p_status: newStatus,
      p_from_position: newPosition,
    });
  }

  // Update the project
  const { data, error } = await supabase
    .from("projects")
    .update({
      status: newStatus,
      position: newPosition,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as DbProject;
}

// Simplified move function that just updates status and position directly
export async function updateProjectPosition(
  id: string,
  status: ProjectStatus,
  position: number
): Promise<DbProject> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("projects")
    .update({
      status,
      position,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as DbProject;
}

// Batch update positions after drag and drop
export async function reorderProjects(
  updates: { id: string; status: ProjectStatus; position: number }[]
): Promise<void> {
  const supabase = createClient();

  // Update each project's position
  for (const update of updates) {
    const { error } = await supabase
      .from("projects")
      .update({
        status: update.status,
        position: update.position,
        updated_at: new Date().toISOString(),
      })
      .eq("id", update.id);

    if (error) {
      throw new Error(error.message);
    }
  }
}

// Convert an idea to a project
export async function convertIdeaToProject(
  idea: DbIdea,
  priority?: Priority
): Promise<DbProject> {
  const supabase = createClient();

  // Get max position for backlog
  const { data: maxPosData } = await supabase
    .from("projects")
    .select("position")
    .eq("status", "backlog")
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextPosition = maxPosData ? maxPosData.position + 1 : 0;

  // Create project from idea
  const { data, error } = await supabase
    .from("projects")
    .insert({
      idea_id: idea.id,
      title: idea.title,
      description: idea.description,
      status: "backlog" as ProjectStatus,
      priority: priority || "medium",
      position: nextPosition,
      estimated_hours: idea.time_spent
        ? Math.round((idea.time_spent / 60) * 10) // Convert minutes to rough hours
        : null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Update idea status to "converting"
  await supabase
    .from("ideas")
    .update({ status: "converting", updated_at: new Date().toISOString() })
    .eq("id", idea.id);

  return data as DbProject;
}
