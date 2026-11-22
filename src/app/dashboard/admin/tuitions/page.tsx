"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  Check,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  X,
  XCircle,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import { authClient } from "@/lib/auth-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type TuitionStatus = "pending" | "approved" | "rejected";
type FilterStatus = "all" | TuitionStatus;

interface Tuition {
  _id: string;
  title: string;
  subject: string;
  classLevel: string;
  mode: string;
  location: string;
  monthlyFee?: {
    min?: number;
    max?: number;
    currency?: string;
    period?: string;
  };
  description: string;
  bannerImage?: string;
  tutorName: string;
  tutorEmail: string;
  status: TuitionStatus;
  isActive: boolean;
  createdAt: string;
}

interface TuitionResponse {
  success: boolean;
  message?: string;
  data: Tuition[];
}

export default function AdminTuitionsPage() {
  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("all");

  const getAuthHeaders = useCallback(async (): Promise<HeadersInit> => {
    const { data, error } = await authClient.token();

    if (error || !data?.token) {
      throw new Error(
        error?.message || "Unable to retrieve authentication token.",
      );
    }

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${data.token}`,
    };
  }, []);

  // Load all tuition listings
  const loadTuitions = useCallback(
    async (showSuccessToast = false) => {
      try {
        setLoading(true);

        const headers = await getAuthHeaders();

        const response = await fetch(`${API_BASE_URL}/api/tuitions/admin/all`, {
          method: "GET",
          headers,
          cache: "no-store",
        });

        const result: TuitionResponse = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load tuition listings.");
        }

        setTuitions(Array.isArray(result.data) ? result.data : []);

        if (showSuccessToast) {
          toast.success("Tuition listings refreshed successfully.");
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Something went wrong.";

        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders],
  );

  // Initial data loading
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadTuitions();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadTuitions]);

  // Approve or reject a tuition listing
  const updateStatus = async (
    tuitionId: string,
    status: "approved" | "rejected",
  ) => {
    try {
      setUpdatingId(tuitionId);

      const headers = await getAuthHeaders();

      const response = await fetch(
        `${API_BASE_URL}/api/tuitions/admin/${tuitionId}/status`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({ status }),
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            `Failed to ${status === "approved" ? "approve" : "reject"} tuition.`,
        );
      }

      setTuitions((previous) =>
        previous.map((tuition) =>
          tuition._id === tuitionId ? { ...tuition, status } : tuition,
        ),
      );

      toast.success(
        status === "approved"
          ? "Tuition approved successfully."
          : "Tuition rejected successfully.",
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Search and filter
  const filteredTuitions = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return tuitions.filter((tuition) => {
      const matchesSearch =
        !keyword ||
        tuition.title?.toLowerCase().includes(keyword) ||
        tuition.subject?.toLowerCase().includes(keyword) ||
        tuition.tutorName?.toLowerCase().includes(keyword) ||
        tuition.tutorEmail?.toLowerCase().includes(keyword);

      const matchesFilter = filter === "all" || tuition.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [tuitions, search, filter]);

  // Statistics
  const stats = {
    total: tuitions.length,
    pending: tuitions.filter((item) => item.status === "pending").length,
    approved: tuitions.filter((item) => item.status === "approved").length,
    rejected: tuitions.filter((item) => item.status === "rejected").length,
  };

  const formatFee = (fee?: Tuition["monthlyFee"]) => {
    if (!fee) return "Not specified";

    const min = fee.min ?? 0;
    const max = fee.max ?? min;

    return min === max
      ? `৳${min.toLocaleString()}`
      : `৳${min.toLocaleString()} - ৳${max.toLocaleString()}`;
  };

  const formatDate = (date: string) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-BD", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const statusStyle = (status: TuitionStatus) => {
    if (status === "approved") {
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
    }

    if (status === "rejected") {
      return "bg-red-500/10 text-red-600 dark:text-red-400";
    }

    return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
  };

  return (
    <>
      <Toaster
        position="top-right"
        richColors
        closeButton
        duration={3000}
        theme="system"
      />

      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <div className="mb-1.5 flex items-center gap-2 text-xs text-muted-foreground">
              <Link
                href="/dashboard/admin"
                className="transition hover:text-primary"
              >
                Admin Dashboard
              </Link>

              <span>/</span>

              <span className="text-foreground">Tuition Approval</span>
            </div>

            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              Tuition Management
            </h1>

            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Review, approve, or reject tuition listings submitted by tutors.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadTuitions(true)}
            disabled={loading}
            className="inline-flex h-9 items-center justify-center gap-2 self-start rounded-lg border border-border bg-card px-3 text-xs font-semibold transition hover:bg-muted disabled:opacity-60 sm:self-center"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <StatCard
            title="Total Listings"
            value={stats.total}
            icon={<BookOpen size={18} />}
            color="text-primary"
            background="bg-primary/10"
          />

          <StatCard
            title="Pending Review"
            value={stats.pending}
            icon={<Clock3 size={18} />}
            color="text-amber-600"
            background="bg-amber-500/10"
          />

          <StatCard
            title="Approved"
            value={stats.approved}
            icon={<CheckCircle2 size={18} />}
            color="text-emerald-600"
            background="bg-emerald-500/10"
          />

          <StatCard
            title="Rejected"
            value={stats.rejected}
            icon={<XCircle size={18} />}
            color="text-red-600"
            background="bg-red-500/10"
          />
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-card p-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title, subject, or tutor..."
              className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-xs outline-none transition placeholder:text-muted-foreground focus:border-primary sm:text-sm"
            />
          </div>

          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value as FilterStatus)}
            className="h-9 rounded-lg border border-border bg-background px-3 text-xs outline-none focus:border-primary sm:w-44 sm:text-sm"
          >
            <option value="all">All Listings</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Tuition Listings */}
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex flex-col gap-1.5 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-bold">All Tuition Listings</h2>

              <p className="mt-0.5 text-xs text-muted-foreground">
                Review tutor submissions and manage approval status.
              </p>
            </div>

            <span className="text-xs text-muted-foreground">
              {filteredTuitions.length} listing(s)
            </span>
          </div>

          {loading ? (
            <div className="flex min-h-48 flex-col items-center justify-center gap-2">
              <Loader2 size={25} className="animate-spin text-primary" />

              <p className="text-xs text-muted-foreground">
                Loading tuition listings...
              </p>
            </div>
          ) : filteredTuitions.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center px-4 text-center">
              <div className="mb-3 rounded-xl bg-muted p-3">
                <GraduationCap size={25} className="text-muted-foreground" />
              </div>

              <h3 className="text-sm font-semibold">
                No tuition listings found
              </h3>

              <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                Try changing your search or filter. New tutor submissions will
                appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredTuitions.map((tuition) => (
                <article
                  key={tuition._id}
                  className="p-3 transition hover:bg-muted/20 sm:p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row">
                    {/* Compact Image */}
                    <div className="h-32 w-full shrink-0 overflow-hidden rounded-lg bg-muted sm:h-28 sm:w-36 lg:w-40">
                      {tuition.bannerImage ? (
                        <img
                          src={tuition.bannerImage}
                          alt={tuition.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <BookOpen
                            size={28}
                            className="text-muted-foreground"
                          />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${statusStyle(
                            tuition.status,
                          )}`}
                        >
                          {tuition.status}
                        </span>

                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium">
                          {tuition.mode}
                        </span>

                        {tuition.isActive && (
                          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                            Active
                          </span>
                        )}
                      </div>

                      <h3 className="mt-1.5 text-sm font-bold sm:text-base">
                        {tuition.title}
                      </h3>

                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {tuition.subject} · {tuition.classLevel}
                      </p>

                      <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-muted-foreground">
                        {tuition.description}
                      </p>

                      {/* Compact Information Grid */}
                      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs sm:grid-cols-3">
                        <div className="min-w-0">
                          <p className="text-[10px] text-muted-foreground">
                            Tutor
                          </p>

                          <p className="mt-0.5 truncate font-semibold">
                            {tuition.tutorName || "Unknown tutor"}
                          </p>

                          <p className="truncate text-[10px] text-muted-foreground">
                            {tuition.tutorEmail}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] text-muted-foreground">
                            Monthly Fee
                          </p>

                          <p className="mt-0.5 font-bold text-primary">
                            {formatFee(tuition.monthlyFee)}
                          </p>
                        </div>

                        <div className="min-w-0">
                          <p className="text-[10px] text-muted-foreground">
                            Location
                          </p>

                          <p className="mt-0.5 flex items-center gap-1 font-medium">
                            <MapPin
                              size={12}
                              className="shrink-0 text-muted-foreground"
                            />

                            <span className="truncate">
                              {tuition.location || "Not specified"}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-3 flex flex-col gap-2 border-t border-border pt-2.5 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-[10px] text-muted-foreground">
                          Submitted: {formatDate(tuition.createdAt)}
                        </p>

                        <div className="flex flex-wrap gap-1.5">
                          {tuition.status !== "approved" && (
                            <button
                              type="button"
                              onClick={() =>
                                void updateStatus(tuition._id, "approved")
                              }
                              disabled={updatingId !== null}
                              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {updatingId === tuition._id ? (
                                <Loader2 size={13} className="animate-spin" />
                              ) : (
                                <Check size={13} />
                              )}
                              Approve
                            </button>
                          )}

                          {tuition.status !== "rejected" && (
                            <button
                              type="button"
                              onClick={() =>
                                void updateStatus(tuition._id, "rejected")
                              }
                              disabled={updatingId !== null}
                              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-red-500/30 px-3 text-xs font-semibold text-red-600 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400"
                            >
                              {updatingId === tuition._id ? (
                                <Loader2 size={13} className="animate-spin" />
                              ) : (
                                <X size={13} />
                              )}
                              Reject
                            </button>
                          )}

                          <Link
                            href={`/tuitions/${tuition._id}`}
                            target="_blank"
                            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-border px-3 text-xs font-semibold transition hover:bg-muted"
                          >
                            View
                            <ArrowUpRight size={13} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
  background,
}: {
  title: string;
  value: number;
  icon: ReactNode;
  color: string;
  background: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card p-3 sm:p-4">
      <div className="min-w-0">
        <p className="truncate text-[10px] font-medium text-muted-foreground sm:text-xs">
          {title}
        </p>

        <p className="mt-1.5 text-xl font-bold tracking-tight sm:text-2xl">
          {value}
        </p>
      </div>

      <div className={`shrink-0 rounded-lg p-2 ${background} ${color}`}>
        {icon}
      </div>
    </div>
  );
}
