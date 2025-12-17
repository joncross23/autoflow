"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-error/10 p-4">
            <AlertCircle className="h-8 w-8 text-error" />
          </div>
        </div>
        <h2 className="mb-2 text-xl font-semibold">Something went wrong</h2>
        <p className="mb-6 text-muted-foreground">
          An error occurred while loading the dashboard. Please try again.
        </p>
        {error.message && (
          <pre className="mb-6 overflow-auto rounded-lg bg-bg-secondary p-4 text-left text-xs text-muted-foreground">
            {error.message}
          </pre>
        )}
        <div className="flex justify-center gap-4">
          <button onClick={reset} className="btn btn-outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </button>
          <a href="/dashboard" className="btn btn-primary">
            <Home className="mr-2 h-4 w-4" />
            Refresh page
          </a>
        </div>
      </div>
    </div>
  );
}
