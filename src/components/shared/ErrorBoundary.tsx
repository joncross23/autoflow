"use client";

import { Component, ReactNode } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

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
              An unexpected error occurred. Please try again or return to the
              dashboard.
            </p>
            {this.state.error && (
              <pre className="mb-6 overflow-auto rounded-lg bg-bg-secondary p-4 text-left text-xs text-muted-foreground">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex justify-center gap-4">
              <button onClick={this.handleRetry} className="btn btn-outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try again
              </button>
              <a href="/dashboard" className="btn btn-primary">
                <Home className="mr-2 h-4 w-4" />
                Go to Dashboard
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
