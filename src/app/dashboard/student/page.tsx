"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import { authClient, useSession } from "@/lib/auth-client";
import { useCheckout } from "@/lib/use-checkout";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Clock,
  Crown,
  GraduationCap,
  Lightbulb,
  Loader2,
  Search,
} from "lucide-react";

interface StudentStats {
  plan: string;
  totalApplications: number;
  pendingApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;
}

interface StudentStatsResponse {
  success: boolean;
  message: string;
  data: StudentStats;
}

const EMPTY_STATS: StudentStats = {
  plan: "free",
  totalApplications: 0,
  pendingApplications: 0,
  acceptedApplications: 0,
  rejectedApplications: 0,
};

const quickActions = [
  {
    title: "Browse Tuitions",
    description:
      "Search approved tuition batches and 1-on-1 mentorship by subject, class level, and teaching mode.",
    href: "/tuitions",
    action: "Find a Tutor",
    icon: Search,
    iconStyle: "bg-primary/10 text-primary",
    checkout: false,
  },
  {
    title: "My Applications",
    description:
      "Track your submitted tuition applications in real time or cancel pending requests.",
    href: "/dashboard/student/my-applications",
    action: "View Applications",
    icon: ClipboardList,
    iconStyle: "bg-emerald-500/10 text-emerald-600",
    checkout: false,
  },
  {
    title: "Student Pro Plan",
    description:
      "Upgrade to Pro ($10/month) via Stripe for priority tuition booking and added student benefits.",
    href: "/pricing",
    action: "Explore Pro Plan",
    icon: Crown,
    iconStyle: "bg-amber-500/10 text-amber-600",
    checkout: true,
  },
];

export default function StudentDashboardPage() {
  const { data: session } = useSession();
  const { startCheckout, isProcessing } = useCheckout();

  const [stats, setStats] = useState<StudentStats>(EMPTY_STATS);
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState("");

  const user = session?.user as
    | {
        name?: string;
        plan?: string;
      }
    | undefined;

  const studentName = user?.name?.trim().split(" ")[0] || "Student";
  const plan = (user?.plan || stats.plan || "free").toLowerCase();
  const isPro = plan === "pro";

  useEffect(() => {
    let active = true;

    const loadStats = async () => {
      try {
        setStatsError("");

        const { data: tokenData, error: tokenError } = await authClient.token();

        if (tokenError || !tokenData?.token) {
          throw new Error(
            "Your login session could not be verified. Please sign in again.",
          );
        }

        const response = await apiRequest<StudentStatsResponse>(
          "/api/dashboard/stats/student",
          {
            headers: {
              Authorization: `Bearer ${tokenData.token}`,
            },
          },
        );

        if (!response.success || !response.data) {
          throw new Error(
            response.message || "Could not load dashboard statistics.",
          );
        }

        if (active) {
          setStats({
            plan: response.data.plan || "free",
            totalApplications: response.data.totalApplications ?? 0,
            pendingApplications: response.data.pendingApplications ?? 0,
            acceptedApplications: response.data.acceptedApplications ?? 0,
            rejectedApplications: response.data.rejectedApplications ?? 0,
          });
        }
      } catch (err) {
        if (active) {
          setStats(EMPTY_STATS);
          setStatsError(
            err instanceof Error
              ? err.message
              : "Could not load dashboard statistics.",
          );
        }
      } finally {
        if (active) setLoadingStats(false);
      }
    };

    void loadStats();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-20 right-32 h-40 w-40 rounded-full bg-brand-cyan/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <GraduationCap size={26} />
            </div>

            <p className="text-sm font-semibold text-primary">
              Student Dashboard
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Welcome back, {studentName}!
            </h1>

            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Find verified tutors, apply for matching tuition sessions, and
              track your application progress smoothly on MentorLagbe.
            </p>

            <Link
              href="/tuitions"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              <BookOpen size={17} />
              Browse Tuitions
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="flex shrink-0 items-center gap-3 self-start rounded-xl border border-border bg-background/80 p-4 sm:self-center">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Crown size={23} />
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Current Plan</p>
              <p className="text-lg font-bold capitalize text-foreground">
                {isPro ? "Pro Plan" : "Free Plan"}
              </p>
              <p className="text-xs text-muted-foreground">
                {isPro ? "Priority booking enabled" : "Standard student access"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <section aria-label="Student overview metrics">
        {statsError && !loadingStats && (
          <div
            role="alert"
            className="mb-4 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-700 dark:text-amber-300"
          >
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{statsError}</span>
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">
                Total Applied Tuitions
              </p>
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ClipboardList size={18} />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground">
              {loadingStats ? "..." : stats.totalApplications}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Total applications submitted
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">
                Accepted Applications
              </p>
              <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 size={18} />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground">
              {loadingStats ? "..." : stats.acceptedApplications}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Approved by tutors
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">
                Pending Applications
              </p>
              <div className="flex size-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                <Clock size={18} />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground">
              {loadingStats ? "..." : stats.pendingApplications}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Waiting for tutor review
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">
                Current Plan
              </p>
              <div className="flex size-9 items-center justify-center rounded-lg bg-brand-amber/15 text-brand-amber">
                <Crown size={18} />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold capitalize text-foreground">
              {isPro ? "Pro" : "Free"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {isPro ? "Active Pro Plan" : "Free Plan"}
            </p>
          </div>
        </div>
      </section>

      {/* Learning Plan */}
      <section>
        <div className="mb-5">
          <h2 className="text-xl font-bold text-foreground">
            Your Learning Plan
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Understand your student subscription benefits.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div
            className={`rounded-xl border p-5 shadow-sm ${
              !isPro
                ? "border-primary/40 bg-primary/5"
                : "border-border bg-card"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="text-primary" size={21} />
                <h3 className="font-bold text-foreground">Free Plan</h3>
              </div>

              {!isPro && (
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  Current Plan
                </span>
              )}
            </div>

            <p className="mt-4 text-2xl font-bold text-foreground">
              $0
              <span className="text-sm font-normal text-muted-foreground">
                {" "}
                / free
              </span>
            </p>

            <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={17} className="shrink-0 text-emerald-600" />
                Browse approved tuition posts
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={17} className="shrink-0 text-emerald-600" />
                Apply for tuition sessions
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={17} className="shrink-0 text-emerald-600" />
                Track applications & cancel pending ones
              </li>
            </ul>
          </div>

          <div
            className={`rounded-xl border p-5 shadow-sm ${
              isPro ? "border-primary/40 bg-primary/5" : "border-border bg-card"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Crown className="text-brand-amber" size={21} />
                <h3 className="font-bold text-foreground">Pro Plan</h3>
              </div>

              {isPro && (
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  Current Plan
                </span>
              )}
            </div>

            <p className="mt-4 text-2xl font-bold text-foreground">
              $10
              <span className="text-sm font-normal text-muted-foreground">
                {" "}
                / month
              </span>
            </p>

            <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={17} className="shrink-0 text-emerald-600" />
                Priority tuition booking requests
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={17} className="shrink-0 text-emerald-600" />
                Manage all tuition applications
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={17} className="shrink-0 text-emerald-600" />
                Pro student badge & support
              </li>
            </ul>

            {!isPro && (
              <button
                type="button"
                onClick={() => void startCheckout()}
                disabled={isProcessing}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Preparing checkout...
                  </>
                ) : (
                  <>
                    Upgrade to Pro
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <div className="mb-5">
          <h2 className="text-xl font-bold text-foreground">
            Manage Your Learning
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Everything you need to find tutors and track your applications.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {quickActions.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div
                  className={`flex size-12 items-center justify-center rounded-xl ${item.iconStyle}`}
                >
                  <Icon size={23} />
                </div>

                <h3 className="mt-5 text-lg font-bold text-foreground">
                  {item.title}
                </h3>

                <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">
                  {item.description}
                </p>

                {item.checkout ? (
                  <button
                    type="button"
                    onClick={() => void startCheckout()}
                    disabled={isProcessing}
                    className="mt-5 inline-flex w-fit items-center gap-2 text-sm font-semibold text-primary transition hover:gap-3 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Preparing checkout...
                      </>
                    ) : (
                      <>
                        {item.action}
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className="mt-5 inline-flex w-fit items-center gap-2 text-sm font-semibold text-primary transition hover:gap-3"
                  >
                    {item.action}
                    <ArrowRight size={16} />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Study Tips */}
      <section className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-7">
        <div className="flex items-start gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
            <Lightbulb size={22} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-foreground">
              Tips for Choosing the Right Tutor
            </h2>

            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              Check subject, class level, weekly days, and Online or Offline
              mode carefully before applying. Mention a clear preferred schedule
              and study note so tutors can review your application quickly.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
