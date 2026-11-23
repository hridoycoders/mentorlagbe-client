import Link from "next/link";
import { BookOpen, Home } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card px-6 py-12 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <BookOpen size={30} />
        </div>

        <h1 className="text-2xl font-bold text-foreground">Page Not Found</h1>

        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          The page you are looking for may have moved, been removed, or never
          existed. Let&apos;s get you back to learning.
        </p>

        <Link
          href="/"
          className="mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Home size={16} />
          Back to Home
        </Link>
      </div>
    </main>
  );
}
