import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function PaymentSuccessPage() {
  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-sm sm:p-8">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
          <CheckCircle2 className="h-9 w-9 text-emerald-600 dark:text-emerald-400" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight">
          Payment Successful!
        </h1>

        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Thank you for upgrading to MentorLagbe Pro. Your payment has been
          received. Your Pro plan will be activated after payment verification.
        </p>

        <div className="mt-7 flex flex-col gap-3">
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Go to Dashboard
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
