"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { TaskBoard } from "@/components/tasks";

function TasksContent() {
  const searchParams = useSearchParams();
  const ideaFilter = searchParams.get("idea");
  const taskId = searchParams.get("task");

  return (
    <div className="h-[calc(100vh-4rem)] pb-16 md:pb-0">
      <TaskBoard
        initialIdeaFilter={ideaFilter || undefined}
        initialTaskId={taskId || undefined}
      />
    </div>
  );
}

export default function TasksPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <TasksContent />
    </Suspense>
  );
}
