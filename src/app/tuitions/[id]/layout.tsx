import { Suspense, type ReactNode } from "react";

export default function TuitionDetailsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <main className="container min-h-screen animate-pulse py-8 sm:py-12">
          <div className="mb-6 h-5 w-32 rounded bg-muted" />
          <div className="h-64 rounded-2xl bg-muted sm:h-96" />

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_350px]">
            <div className="space-y-5">
              <div className="h-8 w-3/4 rounded bg-muted" />
              <div className="h-5 w-1/2 rounded bg-muted" />
              <div className="h-32 rounded-2xl bg-muted" />
            </div>

            <div className="h-64 rounded-2xl bg-muted" />
          </div>
        </main>
      }
    >
      {children}
    </Suspense>
  );
}
