import Link from "next/link";
import { XCircle, ArrowRight } from "lucide-react";

export default function PaymentCancelPage() {
  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-sm sm:p-8">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
          <XCircle className="h-9 w-9 text-amber-600 dark:text-amber-400" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight">Payment Cancelled</h1>

        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Your payment process was cancelled. No payment was completed. You can
          return to pricing and try again whenever you are ready.
        </p>

        <div className="mt-7 flex flex-col gap-3">
          <Link
            href="/pricing"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Back to Pricing
            <ArrowRight size={16} />
          </Link>

          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground transition hover:text-primary"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
