"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CreditCard,
  GraduationCap,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Users,
  UserCheck,
  XCircle,
  Clock,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { apiRequest } from "@/lib/api";

interface AdminStats {
  users: {
    total: number;
    students: number;
    tutors: number;
    admins: number;
  };
  tuitions: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  applications: {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
  };
  payments: {
    totalTransactions: number;
    totalRevenue: number;
  };
}

interface AdminStatsResponse {
  success: boolean;
  message: string;
  data: AdminStats;
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconClass,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: typeof Users;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 break-words text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {value}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>

        <div
          className={`flex size-10 shrink-0 items-center justify-center rounded-xl sm:size-11 ${iconClass}`}
        >
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function BreakdownItem({
  label,
  value,
  icon: Icon,
  iconClass,
}: {
  label: string;
  value: number;
  icon: typeof Users;
  iconClass: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2.5">
        <span
          className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${iconClass}`}
        >
          <Icon size={16} />
        </span>
        <span className="truncate text-sm text-muted-foreground">{label}</span>
      </div>
      <span className="text-sm font-semibold tabular-nums text-foreground">
        {value.toLocaleString()}
      </span>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data: session } = useSession();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const adminName =
    (session?.user as { name?: string } | undefined)?.name?.split(" ")[0] ||
    "Admin";

  const loadStats = useCallback(async (): Promise<AdminStats> => {
    const tokenData = await authToken();

    if (!tokenData) {
      throw new Error("Authentication token পাওয়া যায়নি। আবার login করো।");
    }

    const response = await apiRequest<AdminStatsResponse>(
      "/api/dashboard/stats/admin",
      {
        headers: {
          Authorization: `Bearer ${tokenData}`,
        },
      },
    );

    if (!response?.success || !response.data) {
      throw new Error(
        response?.message || "Dashboard statistics load করা যায়নি।",
      );
    }

    return response.data;
  }, []);

  useEffect(() => {
    let cancelled = false;

    void loadStats()
      .then((data) => {
        if (cancelled) return;

        setStats(data);
        setError("");
      })
      .catch((err: unknown) => {
        if (cancelled) return;

        setError(
          err instanceof Error
            ? err.message
            : "Dashboard data load করতে সমস্যা হয়েছে।",
        );
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [loadStats, retryCount]);

  const handleRetry = () => {
    setError("");
    setLoading(true);
    setRetryCount((current) => current + 1);
  };

  if (loading) {
    return (
      <div className="flex min-h-[55vh] flex-col items-center justify-center gap-3">
        <Loader2 className="size-9 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          Loading admin dashboard...
        </p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="mx-auto flex min-h-[55vh] max-w-md flex-col items-center justify-center text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertCircle size={28} />
        </div>

        <h2 className="mt-4 text-lg font-bold text-foreground">
          Unable to load dashboard
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          {error || "কোনো dashboard data পাওয়া যায়নি।"}
        </p>

        <button
          type="button"
          onClick={handleRetry}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      </div>
    );
  }

  const quickActions = [
    {
      title: "Manage Users",
      description: "View and manage platform users",
      href: "/dashboard/admin/users",
      icon: Users,
    },
    {
      title: "Review Tuitions",
      description: "Approve or reject tuition posts",
      href: "/dashboard/admin/tuitions",
      icon: BookOpen,
    },
    {
      title: "Transactions",
      description: "View payment and subscription history",
      href: "/dashboard/admin/transactions",
      icon: CreditCard,
    },
  ];

  return (
    <div className="space-y-7">
      {/* Welcome */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/75 p-5 text-primary-foreground shadow-sm sm:p-7">
        <div className="relative z-10">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
            <ShieldCheck size={14} />
            Admin Control Center
          </div>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome back, {adminName}!
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-primary-foreground/80 sm:text-base">
            Monitor MentorLagbe, manage users, review tuition posts and track
            platform transactions from one place.
          </p>
        </div>

        <div className="pointer-events-none absolute -right-8 -top-12 size-48 rounded-full border-[24px] border-white/10 sm:size-64" />
        <div className="pointer-events-none absolute -bottom-20 right-24 size-40 rounded-full bg-white/10 blur-2xl" />
      </section>

      {/* Main Statistics */}
      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Platform Overview
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Overall platform statistics
            </p>
          </div>

          <button
            type="button"
            onClick={handleRetry}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Users"
            value={stats.users.total.toLocaleString()}
            description={`${stats.users.students} students · ${stats.users.tutors} tutors`}
            icon={Users}
            iconClass="bg-primary/10 text-primary"
          />

          <StatCard
            title="Total Tuitions"
            value={stats.tuitions.total.toLocaleString()}
            description={`${stats.tuitions.pending} awaiting review`}
            icon={BookOpen}
            iconClass="bg-brand-cyan/10 text-brand-cyan"
          />

          <StatCard
            title="Total Applications"
            value={stats.applications.total.toLocaleString()}
            description={`${stats.applications.pending} pending applications`}
            icon={GraduationCap}
            iconClass="bg-brand-amber/10 text-brand-amber"
          />

          <StatCard
            title="Total Revenue"
            value={`$${stats.payments.totalRevenue.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            description={`${stats.payments.totalTransactions} transactions`}
            icon={CreditCard}
            iconClass="bg-green-500/10 text-green-600"
          />
        </div>
      </section>

      {/* Detailed Breakdown */}
      <section>
        <h2 className="mb-4 text-lg font-bold text-foreground">
          Detailed Statistics
        </h2>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          {/* Users */}
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
            <div className="mb-2 flex items-center gap-2">
              <Users size={19} className="text-primary" />
              <h3 className="font-semibold text-foreground">Users</h3>
            </div>

            <BreakdownItem
              label="Total Users"
              value={stats.users.total}
              icon={Users}
              iconClass="bg-primary/10 text-primary"
            />
            <BreakdownItem
              label="Students"
              value={stats.users.students}
              icon={GraduationCap}
              iconClass="bg-brand-cyan/10 text-brand-cyan"
            />
            <BreakdownItem
              label="Tutors"
              value={stats.users.tutors}
              icon={UserCheck}
              iconClass="bg-brand-amber/10 text-brand-amber"
            />
            <BreakdownItem
              label="Admins"
              value={stats.users.admins}
              icon={ShieldCheck}
              iconClass="bg-green-500/10 text-green-600"
            />
          </div>

          {/* Tuitions */}
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
            <div className="mb-2 flex items-center gap-2">
              <BookOpen size={19} className="text-primary" />
              <h3 className="font-semibold text-foreground">Tuitions</h3>
            </div>

            <BreakdownItem
              label="Total Tuitions"
              value={stats.tuitions.total}
              icon={BookOpen}
              iconClass="bg-primary/10 text-primary"
            />
            <BreakdownItem
              label="Pending Review"
              value={stats.tuitions.pending}
              icon={Clock}
              iconClass="bg-brand-amber/10 text-brand-amber"
            />
            <BreakdownItem
              label="Approved"
              value={stats.tuitions.approved}
              icon={CheckCircle2}
              iconClass="bg-green-500/10 text-green-600"
            />
            <BreakdownItem
              label="Rejected"
              value={stats.tuitions.rejected}
              icon={XCircle}
              iconClass="bg-destructive/10 text-destructive"
            />
          </div>

          {/* Applications */}
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
            <div className="mb-2 flex items-center gap-2">
              <GraduationCap size={19} className="text-primary" />
              <h3 className="font-semibold text-foreground">Applications</h3>
            </div>

            <BreakdownItem
              label="Total Applications"
              value={stats.applications.total}
              icon={GraduationCap}
              iconClass="bg-primary/10 text-primary"
            />
            <BreakdownItem
              label="Pending"
              value={stats.applications.pending}
              icon={Clock}
              iconClass="bg-brand-amber/10 text-brand-amber"
            />
            <BreakdownItem
              label="Accepted"
              value={stats.applications.accepted}
              icon={CheckCircle2}
              iconClass="bg-green-500/10 text-green-600"
            />
            <BreakdownItem
              label="Rejected"
              value={stats.applications.rejected}
              icon={XCircle}
              iconClass="bg-destructive/10 text-destructive"
            />
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-foreground">Quick Actions</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage the important areas of your platform
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <Link
                key={action.href}
                href={action.href}
                className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md sm:p-5"
              >
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon size={21} />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-foreground">
                    {action.title}
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {action.description}
                  </p>
                </div>

                <ArrowRight
                  size={18}
                  className="shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary"
                />
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

async function authToken(): Promise<string | null> {
  const { authClient } = await import("@/lib/auth-client");

  const { data, error } = await authClient.token();

  if (error || !data?.token) {
    return null;
  }

  return data.token;
}
