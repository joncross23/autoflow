"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { DeliveryBoard } from "@/components/delivery";

function DeliveryContent() {
  const searchParams = useSearchParams();
  const ideaFilter = searchParams.get("idea");

  return (
    <div className="h-[calc(100vh-4rem)]">
      <DeliveryBoard initialIdeaFilter={ideaFilter || undefined} />
    </div>
  );
}

export default function DeliveryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <DeliveryContent />
    </Suspense>
  );
}
