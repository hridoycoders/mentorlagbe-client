"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  Loader2,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";

import { apiRequest } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

interface StudentApplication {
  _id: string;
  tuitionId: string;
  tuitionTitle: string;
  tutorId: string;
  tutorName: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  message: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  updatedAt: string;
}

interface ApplicationsResponse {
  success: boolean;
  message: string;
  total: number;
  data: StudentApplication[];
}

type StatusFilter = "all" | "pending" | "accepted" | "rejected";

const statusConfig = {
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-brand-amber/10 text-brand-amber border-brand-amber/20",
  },
  accepted: {
    label: "Accepted",
    icon: CheckCircle2,
    className:
      "bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("all");
  const [cancellingId, setCancellingId] = useState<string | null>(null);



  const loadApplications = useCallback(async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
      setError("");
    }

    try {
      const { data: tokenData, error: tokenError } = await authClient.token();

      if (tokenError || !tokenData?.token) {
        throw new Error(
          "Your login session could not be verified. Please sign in again.",
        );
      }

      const response = await apiRequest<ApplicationsResponse>(
        "/api/applications/student",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${tokenData.token}`,
          },
        },
      );

      if (!response.success) {
        throw new Error(
          response.message || "Failed to load your applications.",
        );
      }

      setApplications(response.data || []);
      setError("");
    } catch (requestError) {
      console.error("Load Student Applications Error:", requestError);

      setError(
        requestError instanceof Error
          ? requestError.message
          : "Something went wrong while loading applications.",
      );
    } finally {
      setLoading(false);
    }
  }, []);


useEffect(() => {
  let cancelled = false;

  async function fetchApplications() {
    try {
      const { data: tokenData, error: tokenError } = await authClient.token();

      if (tokenError || !tokenData?.token) {
        throw new Error(
          "Your login session could not be verified. Please sign in again.",
        );
      }

      const response = await apiRequest<ApplicationsResponse>(
        "/api/applications/student",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${tokenData.token}`,
          },
        },
      );

      if (!response.success) {
        throw new Error(
          response.message || "Failed to load your applications.",
        );
      }

      if (!cancelled) {
        setApplications(response.data || []);
        setError("");
      }
    } catch (requestError) {
      console.error("Load Student Applications Error:", requestError);

      if (!cancelled) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Something went wrong while loading applications.",
        );
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  }

  void fetchApplications();

  return () => {
    cancelled = true;
  };
}, []);




  const filteredApplications = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return applications.filter((application) => {
      const matchesStatus =
        activeFilter === "all" || application.status === activeFilter;

      const matchesSearch =
        !normalizedSearch ||
        application.tuitionTitle?.toLowerCase().includes(normalizedSearch) ||
        application.tutorName?.toLowerCase().includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [applications, activeFilter, searchTerm]);

  const counts = useMemo(
    () => ({
      all: applications.length,
      pending: applications.filter((item) => item.status === "pending").length,
      accepted: applications.filter((item) => item.status === "accepted")
        .length,
      rejected: applications.filter((item) => item.status === "rejected")
        .length,
    }),
    [applications],
  );

  const formatDate = (date: string) => {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filters: { label: string; value: StatusFilter }[] = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Accepted", value: "accepted" },
    { label: "Rejected", value: "rejected" },
  ];

  const handleCancelApplication = async (applicationId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this pending application?",
    );

    if (!confirmed) return;

    if (cancellingId) return;

    setCancellingId(applicationId);

    try {
      const { data: tokenData, error: tokenError } = await authClient.token();

      if (tokenError || !tokenData?.token) {
        throw new Error(
          "Your login session could not be verified. Please sign in again.",
        );
      }

      const response = await apiRequest<{ success: boolean; message: string }>(
        `/api/applications/${applicationId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${tokenData.token}`,
          },
        },
      );

      if (!response.success) {
        throw new Error(response.message || "Failed to cancel application.");
      }

      await loadApplications(false);

      toast.success("Application cancelled successfully.");
    } catch (requestError) {
      console.error("Cancel Application Error:", requestError);

      toast.error(
        requestError instanceof Error
          ? requestError.message
          : "Something went wrong while cancelling the application.",
      );
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page Heading */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
            <BookOpen size={16} />
            Student Workspace
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            My Applications
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Track your tuition applications and stay updated on tutor responses.
          </p>
        </div>

        <Link
          href="/tuitions"
          className="inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Browse Tuitions
          <ArrowRight size={16} />
        </Link>
      </section>

      {/* Summary Cards */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-muted-foreground sm:text-sm">
              Total Applications
            </p>
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <BookOpen size={17} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-foreground sm:text-3xl">
            {loading ? "—" : counts.all}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            All submitted applications
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-muted-foreground sm:text-sm">
              Pending
            </p>
            <div className="rounded-lg bg-brand-amber/10 p-2 text-brand-amber">
              <Clock size={17} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-foreground sm:text-3xl">
            {loading ? "—" : counts.pending}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Waiting for tutor response
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-muted-foreground sm:text-sm">
              Accepted
            </p>
            <div className="rounded-lg bg-green-500/10 p-2 text-green-600 dark:text-green-400">
              <CheckCircle2 size={17} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-foreground sm:text-3xl">
            {loading ? "—" : counts.accepted}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Applications approved
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-muted-foreground sm:text-sm">
              Rejected
            </p>
            <div className="rounded-lg bg-destructive/10 p-2 text-destructive">
              <XCircle size={17} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-foreground sm:text-3xl">
            {loading ? "—" : counts.rejected}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Applications declined
          </p>
        </div>
      </section>

      {/* Application List */}
      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="border-b border-border p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Application History
              </h2>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                Review the status of every tuition you applied for.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadApplications()}
              disabled={loading}
              className="inline-flex w-fit items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {/* Search */}
          <div className="relative mt-5">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by tuition title or tutor name..."
              className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>

          {/* Status Filters */}
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {filters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setActiveFilter(filter.value)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors ${
                  activeFilter === filter.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {filter.label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                    activeFilter === filter.value
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {counts[filter.value]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-6">
            <Loader2 size={30} className="animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Loading your applications...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex min-h-64 flex-col items-center justify-center p-6 text-center">
            <div className="mb-4 rounded-full bg-destructive/10 p-3 text-destructive">
              <AlertCircle size={25} />
            </div>
            <h3 className="font-semibold text-foreground">
              Could not load applications
            </h3>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              {error}
            </p>
            <button
              type="button"
              onClick={() => void loadApplications()}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <RefreshCw size={15} />
              Try Again
            </button>
          </div>
        )}

        {/* Empty / Filtered Empty */}
        {!loading && !error && filteredApplications.length === 0 && (
          <div className="flex min-h-64 flex-col items-center justify-center p-6 text-center">
            <div className="mb-4 rounded-full bg-primary/10 p-4 text-primary">
              {applications.length === 0 ? (
                <BookOpen size={30} />
              ) : (
                <Search size={30} />
              )}
            </div>

            <h3 className="text-base font-semibold text-foreground">
              {applications.length === 0
                ? "No applications yet"
                : "No matching applications"}
            </h3>

            <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
              {applications.length === 0
                ? "You haven't applied to any tuition yet. Explore available tuition opportunities and submit your first application."
                : "Try another search term or select a different application status."}
            </p>

            {applications.length === 0 && (
              <Link
                href="/tuitions"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Explore Tuitions
                <ArrowRight size={16} />
              </Link>
            )}
          </div>
        )}

        {/* Application Cards */}
        {!loading && !error && filteredApplications.length > 0 && (
          <div className="divide-y divide-border">
            {filteredApplications.map((application) => {
              const status =
                statusConfig[application.status] || statusConfig.pending;
              const StatusIcon = status.icon;

              return (
                <article
                  key={application._id}
                  className="p-4 transition-colors hover:bg-muted/20 sm:p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-foreground sm:text-lg">
                          {application.tuitionTitle || "Untitled Tuition"}
                        </h3>

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${status.className}`}
                        >
                          <StatusIcon size={13} />
                          {status.label}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-muted-foreground">
                        Tutor:{" "}
                        <span className="font-medium text-foreground">
                          {application.tutorName || "Not available"}
                        </span>
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays size={14} />
                          Applied on {formatDate(application.createdAt)}
                        </span>

                        <span className="inline-flex items-center gap-1.5">
                          <Clock size={14} />
                          Updated on {formatDate(application.updatedAt)}
                        </span>
                      </div>

                      {application.message && (
                        <div className="mt-4 rounded-xl bg-muted/60 p-3 sm:p-4">
                          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                            Your Message
                          </p>
                          <p className="whitespace-pre-wrap break-words text-sm leading-6 text-foreground">
                            {application.message}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                      {application.status === "pending" && (
                        <button
                          type="button"
                          onClick={() =>
                            void handleCancelApplication(application._id)
                          }
                          disabled={cancellingId === application._id}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-destructive/30 px-3.5 py-2.5 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {cancellingId === application._id ? (
                            <>
                              <Loader2 size={15} className="animate-spin" />
                              Cancelling...
                            </>
                          ) : (
                            <>
                              <XCircle size={15} />
                              Cancel
                            </>
                          )}
                        </button>
                      )}

                      <Link
                        href={`/tuitions/${application.tuitionId}`}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-border px-3.5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
                      >
                        View Tuition
                        <ArrowRight size={15} />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
