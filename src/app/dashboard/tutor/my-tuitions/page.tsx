"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  AlertCircle,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  Edit,
  Eye,
  Loader2,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Wallet,
  X,
  XCircle,
} from "lucide-react";
import Link from "next/link";

import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

interface Tuition {
  _id: string;
  title: string;
  subject: string;
  classLevel: string;
  mode: string;
  location: string;
  monthlyFee: {
    min: number;
    max: number;
    currency?: string;
    period?: string;
  };
  daysPerWeek: number;
  description: string;
  bannerImage?: string;
  status: "pending" | "approved" | "rejected";
  isActive: boolean;
  createdAt: string;
}

interface TuitionFormData {
  title: string;
  subject: string;
  classLevel: string;
  mode: string;
  location: string;
  minFee: string;
  maxFee: string;
  daysPerWeek: string;
  description: string;
  bannerImage: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const initialFormData: TuitionFormData = {
  title: "",
  subject: "",
  classLevel: "",
  mode: "online",
  location: "",
  minFee: "",
  maxFee: "",
  daysPerWeek: "3",
  description: "",
  bannerImage: "",
};

const getStatusStyles = (status: Tuition["status"]) => {
  switch (status) {
    case "approved":
      return {
        label: "Approved",
        className:
          "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
        icon: CheckCircle2,
      };

    case "rejected":
      return {
        label: "Rejected",
        className:
          "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
        icon: XCircle,
      };

    default:
      return {
        label: "Pending",
        className:
          "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
        icon: Clock,
      };
  }
};

const formatDate = (date: string) => {
  if (!date) return "N/A";

  return new Date(date).toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// Shared authenticated API request helper
const apiRequest = async <T,>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> => {
  const tokenResponse = await authClient.token();

  if (tokenResponse.error || !tokenResponse.data) {
    throw new Error("Unable to get access token. Please login again.");
  }

  const token = tokenResponse.data.token;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
    cache: "no-store",
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      result?.message || `Request failed with status ${response.status}`,
    );
  }

  return result as T;
};

export default function MyTuitionsPage() {
  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [editingTuition, setEditingTuition] = useState<Tuition | null>(null);
  const [formData, setFormData] = useState<TuitionFormData>(initialFormData);

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Initial tuition loading
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const result = await apiRequest<{
          success: boolean;
          data: Tuition[];
        }>("/api/tuitions/my");

        if (!cancelled) {
          setTuitions(result.data || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load your tuitions.",
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

  // Refresh tuition list
  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await apiRequest<{
        success: boolean;
        data: Tuition[];
      }>("/api/tuitions/my");

      setTuitions(result.data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load your tuitions.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Search and status filtering
  const filteredTuitions = useMemo(() => {
    return tuitions.filter((tuition) => {
      const keyword = search.toLowerCase().trim();

      const matchesSearch =
        !keyword ||
        tuition.title.toLowerCase().includes(keyword) ||
        tuition.subject.toLowerCase().includes(keyword) ||
        tuition.location.toLowerCase().includes(keyword) ||
        tuition.classLevel.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "all" || tuition.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [tuitions, search, statusFilter]);

  // Dashboard statistics
  const stats = useMemo(
    () => ({
      total: tuitions.length,
      approved: tuitions.filter((item) => item.status === "approved").length,
      pending: tuitions.filter((item) => item.status === "pending").length,
      rejected: tuitions.filter((item) => item.status === "rejected").length,
      active: tuitions.filter((item) => item.isActive).length,
    }),
    [tuitions],
  );

  // Open edit modal
  const openEditModal = (tuition: Tuition) => {
    setEditingTuition(tuition);

    setFormData({
      title: tuition.title,
      subject: tuition.subject,
      classLevel: tuition.classLevel,
      mode: tuition.mode.toLowerCase(),
      location: tuition.location,
      minFee: String(tuition.monthlyFee?.min ?? ""),
      maxFee: String(tuition.monthlyFee?.max ?? ""),
      daysPerWeek: String(tuition.daysPerWeek),
      description: tuition.description,
      bannerImage: tuition.bannerImage || "",
    });
  };

  // Close edit modal
  const closeEditModal = () => {
    if (saving) return;

    setEditingTuition(null);
    setFormData(initialFormData);
  };

  // Update tuition
  const handleEditSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingTuition) return;

    try {
      setSaving(true);
      setError("");

      const payload: Record<string, unknown> = {
        title: formData.title.trim(),
        subject: formData.subject.trim(),
        classLevel: formData.classLevel.trim(),
        mode: formData.mode,
        location: formData.location.trim(),
        monthlyFee: {
          min: Number(formData.minFee),
          max: Number(formData.maxFee),
        },
        daysPerWeek: Number(formData.daysPerWeek),
        description: formData.description.trim(),
      };

      if (formData.bannerImage.trim()) {
        payload.bannerImage = formData.bannerImage.trim();
      }

      const result = await apiRequest<{
        success: boolean;
        data: Tuition;
      }>(`/api/tuitions/${editingTuition._id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      setTuitions((previous) =>
        previous.map((item) =>
          item._id === editingTuition._id ? result.data : item,
        ),
      );

      setEditingTuition(null);
      setFormData(initialFormData);

      toast.success("Tuition updated successfully.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update tuition.",
      );
    } finally {
      setSaving(false);
    }
  };

  // Toggle tuition active status
  const handleToggleActive = async (tuition: Tuition) => {
    try {
      setTogglingId(tuition._id);
      setError("");

      const result = await apiRequest<{
        success: boolean;
        data: Tuition;
      }>(`/api/tuitions/${tuition._id}`, {
        method: "PATCH",
        body: JSON.stringify({
          isActive: !tuition.isActive,
        }),
      });

      setTuitions((previous) =>
        previous.map((item) => (item._id === tuition._id ? result.data : item)),
      );

      toast.success(
        tuition.isActive
          ? "Tuition closed successfully."
          : "Tuition activated successfully.",
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update tuition status.",
      );
    } finally {
      setTogglingId(null);
    }
  };

  // Delete tuition
  const handleDelete = async (tuition: Tuition) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${tuition.title}"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      setDeletingId(tuition._id);
      setError("");

      await apiRequest<{ success: boolean }>(`/api/tuitions/${tuition._id}`, {
        method: "DELETE",
      });

      setTuitions((previous) =>
        previous.filter((item) => item._id !== tuition._id),
      );

      toast.success("Tuition deleted successfully.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete tuition.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  // Update edit form fields
  const updateFormField = (field: keyof TuitionFormData, value: string) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  return (
    <div className="min-h-screen space-y-6 bg-gray-50 p-4 text-gray-900 dark:bg-gray-950 dark:text-gray-100 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <BookOpen size={16} />
            <span>Tutor Dashboard</span>
            <span>/</span>
            <span className="text-primary font-medium">My Tuitions</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            My Tuitions
          </h1>

          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Manage your tuition posts, update details and track their status.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold transition hover:bg-gray-100 disabled:opacity-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          <Link
            href="/dashboard/tutor/post-tuition"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <Plus size={17} />
            Post Tuition
          </Link>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          <AlertCircle size={19} className="mt-0.5 shrink-0" />

          <div className="flex-1">{error}</div>

          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            label: "Total Tuitions",
            value: stats.total,
            icon: BookOpen,
            color:
              "text-blue-600 bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400",
          },
          {
            label: "Approved",
            value: stats.approved,
            icon: CheckCircle2,
            color:
              "text-green-600 bg-green-100 dark:bg-green-500/10 dark:text-green-400",
          },
          {
            label: "Pending",
            value: stats.pending,
            icon: Clock,
            color:
              "text-amber-600 bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400",
          },
          {
            label: "Active Posts",
            value: stats.active,
            icon: Eye,
            color:
              "text-purple-600 bg-purple-100 dark:bg-purple-500/10 dark:text-purple-400",
          },
        ].map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-5"
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 sm:text-sm">
                    {stat.label}
                  </p>

                  <p className="mt-2 text-2xl font-bold sm:text-3xl">
                    {loading ? "—" : stat.value}
                  </p>
                </div>

                <div className={`rounded-xl p-3 ${stat.color}`}>
                  <Icon size={21} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title, subject or location..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-primary dark:border-gray-700 dark:bg-gray-950"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-primary dark:border-gray-700 dark:bg-gray-950 sm:w-48"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Tuition List */}
      {loading ? (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <Loader2 size={34} className="animate-spin text-primary" />

          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            Loading your tuitions...
          </p>
        </div>
      ) : filteredTuitions.length === 0 ? (
        <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-5 text-center dark:border-gray-700 dark:bg-gray-900">
          <div className="rounded-2xl bg-gray-100 p-4 dark:bg-gray-800">
            <BookOpen size={32} className="text-gray-400" />
          </div>

          <h3 className="mt-4 text-lg font-bold">
            {tuitions.length === 0 ? "No Tuitions Yet" : "No Matching Tuitions"}
          </h3>

          <p className="mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
            {tuitions.length === 0
              ? "You haven't posted any tuition yet. Create your first tuition post and connect with students."
              : "Try changing your search keyword or selected status filter."}
          </p>

          {tuitions.length === 0 && (
            <Link
              href="/dashboard/tutor/post-tuition"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
            >
              <Plus size={17} />
              Post Your First Tuition
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {filteredTuitions.map((tuition) => {
            const status = getStatusStyles(tuition.status);
            const StatusIcon = status.icon;

            return (
              <article
                key={tuition._id}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
              >
                {tuition.bannerImage && (
                  <div className="h-40 overflow-hidden bg-gray-100 dark:bg-gray-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={tuition.bannerImage}
                      alt={tuition.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                <div className="space-y-4 p-5">
                  {/* Title and Status */}
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div className="min-w-0">
                      <h2 className="text-lg font-bold sm:text-xl">
                        {tuition.title}
                      </h2>

                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {tuition.subject} · {tuition.classLevel}
                      </p>
                    </div>

                    <span
                      className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${status.className}`}
                    >
                      <StatusIcon size={14} />
                      {status.label}
                    </span>
                  </div>

                  {/* Tuition Details */}
                  <div className="grid grid-cols-2 gap-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/60">
                    <div className="flex items-center gap-2 text-sm">
                      <Wallet size={16} className="shrink-0 text-primary" />

                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Monthly Fee
                        </p>

                        <p className="font-semibold">
                          ৳{tuition.monthlyFee?.min?.toLocaleString("en-BD")} -
                          ৳{tuition.monthlyFee?.max?.toLocaleString("en-BD")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <CalendarDays
                        size={16}
                        className="shrink-0 text-primary"
                      />

                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Schedule
                        </p>

                        <p className="font-semibold">
                          {tuition.daysPerWeek} Days / Week
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <MapPin size={16} className="shrink-0 text-primary" />

                      <div className="min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Location
                        </p>

                        <p className="truncate font-semibold">
                          {tuition.location}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <BookOpen size={16} className="shrink-0 text-primary" />

                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Teaching Mode
                        </p>

                        <p className="font-semibold capitalize">
                          {tuition.mode}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="line-clamp-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                    {tuition.description}
                  </p>

                  {/* Date and Active Status */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Posted: {formatDate(tuition.createdAt)}
                    </p>

                    <button
                      type="button"
                      onClick={() => handleToggleActive(tuition)}
                      disabled={togglingId === tuition._id}
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
                        tuition.isActive
                          ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                          : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {togglingId === tuition._id ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <span
                          className={`h-2 w-2 rounded-full ${
                            tuition.isActive ? "bg-green-500" : "bg-gray-400"
                          }`}
                        />
                      )}

                      {tuition.isActive ? "Active" : "Closed"}
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(tuition)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-semibold transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                    >
                      <Edit size={15} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(tuition)}
                      disabled={deletingId === tuition._id}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-900/50 dark:hover:bg-red-950/30"
                    >
                      {deletingId === tuition._id ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <Trash2 size={15} />
                      )}
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Edit Tuition Modal */}
      {editingTuition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-2xl rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 p-5 dark:border-gray-800">
              <div>
                <h2 className="text-xl font-bold">Edit Tuition</h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Update your tuition information.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditModal}
                disabled={saving}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Close edit modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold">
                    Tuition Title
                  </label>

                  <input
                    required
                    value={formData.title}
                    onChange={(e) => updateFormField("title", e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-primary dark:border-gray-700 dark:bg-gray-950"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Subject
                  </label>

                  <input
                    required
                    value={formData.subject}
                    onChange={(e) => updateFormField("subject", e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-primary dark:border-gray-700 dark:bg-gray-950"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Class Level
                  </label>

                  <input
                    required
                    value={formData.classLevel}
                    onChange={(e) =>
                      updateFormField("classLevel", e.target.value)
                    }
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-primary dark:border-gray-700 dark:bg-gray-950"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Teaching Mode
                  </label>

                  <select
                    value={formData.mode}
                    onChange={(e) => updateFormField("mode", e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-primary dark:border-gray-700 dark:bg-gray-950"
                  >
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Location
                  </label>

                  <input
                    required
                    value={formData.location}
                    onChange={(e) =>
                      updateFormField("location", e.target.value)
                    }
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-primary dark:border-gray-700 dark:bg-gray-950"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Minimum Monthly Fee (৳)
                  </label>

                  <input
                    required
                    type="number"
                    min="1"
                    value={formData.minFee}
                    onChange={(e) => updateFormField("minFee", e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-primary dark:border-gray-700 dark:bg-gray-950"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Maximum Monthly Fee (৳)
                  </label>

                  <input
                    required
                    type="number"
                    min="1"
                    value={formData.maxFee}
                    onChange={(e) => updateFormField("maxFee", e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-primary dark:border-gray-700 dark:bg-gray-950"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Days Per Week
                  </label>

                  <select
                    value={formData.daysPerWeek}
                    onChange={(e) =>
                      updateFormField("daysPerWeek", e.target.value)
                    }
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-primary dark:border-gray-700 dark:bg-gray-950"
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                      <option key={day} value={day}>
                        {day} Days
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold">
                    Banner Image URL
                  </label>

                  <input
                    type="url"
                    value={formData.bannerImage}
                    onChange={(e) =>
                      updateFormField("bannerImage", e.target.value)
                    }
                    placeholder="https://example.com/image.jpg"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-primary dark:border-gray-700 dark:bg-gray-950"
                  />

                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Leave empty to keep the existing image unchanged.
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold">
                    Description
                  </label>

                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) =>
                      updateFormField("description", e.target.value)
                    }
                    className="w-full resize-y rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-primary dark:border-gray-700 dark:bg-gray-950"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse justify-end gap-3 border-t border-gray-100 pt-4 dark:border-gray-800 sm:flex-row">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={saving}
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
