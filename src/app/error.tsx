"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, Home, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  const message =
    error?.message?.trim() ||
    "Something went wrong while loading this page. Please try again.";

  return (
    <main
      className="flex min-h-[70vh] items-center justify-center bg-background px-4 py-12"
      role="alert"
    >
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card px-6 py-12 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertCircle size={30} />
        </div>

        <h1 className="text-2xl font-bold text-foreground">
          Something Went Wrong
        </h1>

        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {message}
        </p>

        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <RefreshCw size={16} />
            Try Again
          </button>

          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Home size={16} />
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
