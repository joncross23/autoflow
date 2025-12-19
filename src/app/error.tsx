"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-bg">
      <div className="text-center max-w-md">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-error/10 p-4">
            <AlertCircle className="h-8 w-8 text-error" />
          </div>
        </div>
        <h1 className="mb-2 text-2xl font-bold">Something went wrong</h1>
        <p className="mb-6 text-muted-foreground">
          An unexpected error occurred. Please try again or return to the home
          page.
        </p>
        {error.message && (
          <pre className="mb-6 overflow-auto rounded-lg bg-bg-secondary p-4 text-left text-xs text-muted-foreground max-h-32">
            {error.message}
          </pre>
        )}
        <div className="flex justify-center gap-4">
          <button onClick={reset} className="btn btn-outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </button>
          <a href="/" className="btn btn-primary">
            <Home className="mr-2 h-4 w-4" />
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}
