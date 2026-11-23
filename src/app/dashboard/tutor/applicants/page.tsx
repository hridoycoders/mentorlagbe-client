"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Users,
  Clock3,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
  Mail,
  BookOpen,
  CalendarDays,
  MessageSquare,
  X,
  Loader2,
  GraduationCap,
  Filter,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type ApplicationStatus = "pending" | "accepted" | "rejected";

type Applicant = {
  _id: string;
  tuitionId: string;
  tuitionTitle: string;
  tutorId: string;
  tutorName: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  preferredSchedule?: string;
  studentNote?: string;
  message: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt?: string;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  total?: number;
  data: T;
};

type FilterStatus = "all" | ApplicationStatus;

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const { data: tokenData, error: tokenError } = await authClient.token();

  if (tokenError || !tokenData?.token) {
    throw new Error("Your session has expired. Please login again.");
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokenData.token}`,
      ...options.headers,
    },
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Something went wrong.");
  }

  return result as T;
}

const formatDate = (date: string) => {
  if (!date) return "N/A";

  return new Date(date).toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

const statusStyles: Record<ApplicationStatus, string> = {
  pending:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  accepted:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
};

export default function TutorApplicantsPage() {
  const [applications, setApplications] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("all");

  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(
    null,
  );

  const [detailsLoading, setDetailsLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState("");
  const [actionError, setActionError] = useState("");

  const fetchApplications = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) {
        setRefreshing(true);
      }

      setError("");

      const result = await apiRequest<ApiResponse<Applicant[]>>(
        "/api/applications/tutor",
      );

      setApplications(result.data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load applicants.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const result = await apiRequest<ApiResponse<Applicant[]>>(
          "/api/applications/tutor",
        );

        if (!cancelled) {
          setApplications(result.data || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load applicants.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    return {
      total: applications.length,
      pending: applications.filter((item) => item.status === "pending").length,
      accepted: applications.filter((item) => item.status === "accepted")
        .length,
      rejected: applications.filter((item) => item.status === "rejected")
        .length,
    };
  }, [applications]);

  const filteredApplications = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return applications.filter((item) => {
      const matchesStatus = filter === "all" || item.status === filter;

      const matchesSearch =
        !keyword ||
        item.studentName?.toLowerCase().includes(keyword) ||
        item.studentEmail?.toLowerCase().includes(keyword) ||
        item.tuitionTitle?.toLowerCase().includes(keyword);

      return matchesStatus && matchesSearch;
    });
  }, [applications, filter, search]);

  const handleViewDetails = async (id: string) => {
    try {
      setDetailsLoading(true);
      setActionError("");

      const result = await apiRequest<ApiResponse<Applicant>>(
        `/api/applications/tutor/${id}`,
      );

      setSelectedApplicant(result.data);
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Failed to load application details.",
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleStatusUpdate = async (
    id: string,
    status: "accepted" | "rejected",
  ) => {
    const action = status === "accepted" ? "accept" : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this application?`,
    );

    if (!confirmed) return;

    try {
      setUpdatingId(id);
      setActionError("");

      const result = await apiRequest<ApiResponse<Applicant>>(
        `/api/applications/tutor/${id}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status }),
        },
      );

      setApplications((previous) =>
        previous.map((item) => (item._id === id ? result.data : item)),
      );

      setSelectedApplicant((previous) =>
        previous?._id === id ? result.data : previous,
      );
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Failed to update application status.",
      );
    } finally {
      setUpdatingId("");
    }
  };

  const closeDetails = () => {
    setSelectedApplicant(null);
    setActionError("");
  };

  return (
    <div className="min-h-screen space-y-6 bg-gray-50 p-4 text-gray-900 dark:bg-[#0b1120] dark:text-gray-100 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400">
            <GraduationCap size={18} />
            Tutor Dashboard
          </div>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            My Applicants
          </h1>

          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Review student applications and manage your tuition requests.
          </p>
        </div>

        <button
          onClick={() => void fetchApplications(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard
          title="Total Applicants"
          value={stats.total}
          icon={<Users size={21} />}
          color="indigo"
        />

        <StatCard
          title="Pending"
          value={stats.pending}
          icon={<Clock3 size={21} />}
          color="amber"
        />

        <StatCard
          title="Accepted"
          value={stats.accepted}
          icon={<CheckCircle2 size={21} />}
          color="emerald"
        />

        <StatCard
          title="Rejected"
          value={stats.rejected}
          icon={<XCircle size={21} />}
          color="red"
        />
      </div>

      {/* Search and Filters */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by student or tuition..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-800 dark:focus:border-indigo-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 flex items-center gap-1.5 text-sm text-gray-500">
              <Filter size={15} />
              Filter:
            </span>

            {(["all", "pending", "accepted", "rejected"] as FilterStatus[]).map(
              (item) => (
                <button
                  key={item}
                  onClick={() => setFilter(item)}
                  className={`rounded-lg px-3.5 py-2 text-xs font-semibold capitalize transition sm:text-sm ${
                    filter === item
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  {item === "all" ? "All" : item}
                </button>
              ),
            )}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300 sm:flex-row sm:items-center sm:justify-between">
          <p>{error}</p>

          <button
            onClick={() => void fetchApplications(true)}
            className="font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Applicants */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-2 border-b border-gray-100 px-5 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold">Application List</h2>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {filteredApplications.length} application(s) found
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3">
            <Loader2 size={32} className="animate-spin text-indigo-600" />
            <p className="text-sm text-gray-500">Loading applicants...</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center px-5 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10">
              <Users size={30} />
            </div>

            <h3 className="text-lg font-bold">
              {applications.length === 0
                ? "No applicants yet"
                : "No matching applicants"}
            </h3>

            <p className="mt-2 max-w-sm text-sm text-gray-500 dark:text-gray-400">
              {applications.length === 0
                ? "When students apply to your tuition posts, their applications will appear here."
                : "Try changing your search keyword or selected status filter."}
            </p>

            {(search || filter !== "all") && (
              <button
                onClick={() => {
                  setSearch("");
                  setFilter("all");
                }}
                className="mt-4 text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredApplications.map((applicant) => (
              <div
                key={applicant._id}
                className="flex flex-col gap-4 p-5 transition hover:bg-gray-50/80 dark:hover:bg-gray-800/40 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
                    {getInitials(applicant.studentName || "Student")}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate font-bold">
                        {applicant.studentName || "Unknown Student"}
                      </h3>

                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${statusStyles[applicant.status]}`}
                      >
                        {applicant.status}
                      </span>
                    </div>

                    <p className="mt-1 flex items-center gap-1.5 break-all text-xs text-gray-500 dark:text-gray-400">
                      <Mail size={13} className="shrink-0" />
                      {applicant.studentEmail || "No email provided"}
                    </p>

                    <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                      <BookOpen size={14} className="shrink-0" />
                      <span className="truncate">
                        {applicant.tuitionTitle || "Untitled Tuition"}
                      </span>
                    </p>

                    <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-400">
                      <CalendarDays size={13} />
                      Applied on {formatDate(applicant.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 lg:shrink-0">
                  <button
                    onClick={() => void handleViewDetails(applicant._id)}
                    disabled={detailsLoading}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3.5 py-2 text-sm font-semibold transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-50 dark:border-gray-700 dark:hover:border-indigo-500/50 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-300"
                  >
                    <Eye size={15} />
                    Details
                  </button>

                  {applicant.status === "pending" && (
                    <>
                      <button
                        onClick={() =>
                          void handleStatusUpdate(applicant._id, "accepted")
                        }
                        disabled={updatingId === applicant._id}
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                      >
                        {updatingId === applicant._id ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <CheckCircle2 size={15} />
                        )}
                        Accept
                      </button>

                      <button
                        onClick={() =>
                          void handleStatusUpdate(applicant._id, "rejected")
                        }
                        disabled={updatingId === applicant._id}
                        className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3.5 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-950/30"
                      >
                        <XCircle size={15} />
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Applicant Details Modal */}
      {(selectedApplicant || detailsLoading || actionError) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={closeDetails}
        >
          <div
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 p-5 dark:border-gray-800">
              <div>
                <h2 className="text-lg font-bold">Application Details</h2>
                <p className="mt-1 text-xs text-gray-500">
                  Review the student&apos;s application
                </p>
              </div>

              <button
                onClick={closeDetails}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={20} />
              </button>
            </div>

            {detailsLoading ? (
              <div className="flex min-h-48 items-center justify-center">
                <Loader2 size={30} className="animate-spin text-indigo-600" />
              </div>
            ) : actionError && !selectedApplicant ? (
              <div className="p-6 text-sm text-red-600 dark:text-red-400">
                {actionError}
              </div>
            ) : selectedApplicant ? (
              <div className="space-y-5 p-5">
                {actionError && (
                  <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
                    {actionError}
                  </p>
                )}

                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
                    {getInitials(selectedApplicant.studentName || "Student")}
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-lg font-bold">
                      {selectedApplicant.studentName}
                    </h3>
                    <p className="break-all text-sm text-gray-500 dark:text-gray-400">
                      {selectedApplicant.studentEmail}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800/70">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Tuition
                  </p>
                  <p className="font-bold">{selectedApplicant.tuitionTitle}</p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Application status</p>
                    <span
                      className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold capitalize ${statusStyles[selectedApplicant.status]}`}
                    >
                      {selectedApplicant.status}
                    </span>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-gray-500">Applied on</p>
                    <p className="mt-1 text-sm font-semibold">
                      {formatDate(selectedApplicant.createdAt)}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-bold">
                    <MessageSquare size={16} className="text-indigo-500" />
                    Student&apos;s Message
                  </h4>

                  <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm leading-7 text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                    {selectedApplicant.message || "No message provided."}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Student Phone
                    </p>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                      {selectedApplicant.studentPhone || "Not provided"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                    <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <Clock3 size={13} />
                      Preferred Schedule
                    </p>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                      {selectedApplicant.preferredSchedule || "Not provided"}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-bold">
                    <MessageSquare size={16} className="text-indigo-500" />
                    Learning Note
                  </h4>

                  <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm leading-7 text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                    {selectedApplicant.studentNote || "Not provided"}
                  </div>
                </div>

                {selectedApplicant.status === "pending" && (
                  <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 dark:border-gray-800 sm:flex-row">
                    <button
                      onClick={() =>
                        void handleStatusUpdate(
                          selectedApplicant._id,
                          "accepted",
                        )
                      }
                      disabled={updatingId === selectedApplicant._id}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {updatingId === selectedApplicant._id ? (
                        <Loader2 size={17} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={17} />
                      )}
                      Accept Application
                    </button>

                    <button
                      onClick={() =>
                        void handleStatusUpdate(
                          selectedApplicant._id,
                          "rejected",
                        )
                      }
                      disabled={updatingId === selectedApplicant._id}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-950/30"
                    >
                      <XCircle size={17} />
                      Reject Application
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: "indigo" | "amber" | "emerald" | "red";
}) {
  const colorStyles = {
    indigo: {
      icon: "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400",
      value: "text-indigo-600 dark:text-indigo-400",
    },
    amber: {
      icon: "bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
      value: "text-amber-600 dark:text-amber-400",
    },
    emerald: {
      icon: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
      value: "text-emerald-600 dark:text-emerald-400",
    },
    red: {
      icon: "bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400",
      value: "text-red-600 dark:text-red-400",
    },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 sm:text-sm">
          {title}
        </p>

        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${colorStyles[color].icon}`}
        >
          {icon}
        </div>
      </div>

      <p className={`mt-3 text-2xl font-bold ${colorStyles[color].value}`}>
        {value}
      </p>
    </div>
  );
}
