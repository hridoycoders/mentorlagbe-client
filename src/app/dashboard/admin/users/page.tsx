"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  Search,
  Users,
  GraduationCap,
  BookOpen,
  ShieldCheck,
  RefreshCw,
  UserRound,
  Mail,
  CalendarDays,
  Crown,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

type UserRole = "student" | "tutor" | "admin";

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  image?: string;
  role: UserRole;
  plan?: string;
  createdAt: string;
}

interface UsersResponse {
  success: boolean;
  message: string;
  total: number;
  data: AdminUser[];
}

interface MutationResponse {
  success: boolean;
  message: string;
  data?: {
    _id?: string;
    userId?: string;
    role?: UserRole;
    isActive?: boolean;
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [statusOverrides, setStatusOverrides] = useState<
    Record<string, boolean>
  >({});

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [error, setError] = useState("");

  // Authentication headers
  const getAuthHeaders = useCallback(async () => {
    const { data: tokenData, error: tokenError } = await authClient.token();

    if (tokenError || !tokenData?.token) {
      throw new Error("Authentication failed. Please sign in again.");
    }

    return {
      Authorization: `Bearer ${tokenData.token}`,
      "Content-Type": "application/json",
    };
  }, []);

  // Load all users
  const loadUsers = useCallback(async () => {
    try {
      const headers = await getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}/api/users/admin`, {
        method: "GET",
        headers,
        cache: "no-store",
      });

      const result: UsersResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load users.");
      }

      setUsers(Array.isArray(result.data) ? result.data : []);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  // Initial API request
  useEffect(() => {
    let cancelled = false;

    const loadInitialUsers = async () => {
      try {
        const headers = await getAuthHeaders();

        const response = await fetch(`${API_BASE_URL}/api/users/admin`, {
          method: "GET",
          headers,
          cache: "no-store",
        });

        const result: UsersResponse = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load users.");
        }

        if (!cancelled) {
          setUsers(Array.isArray(result.data) ? result.data : []);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Something went wrong.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadInitialUsers();

    return () => {
      cancelled = true;
    };
  }, [getAuthHeaders]);

  // Refresh users
  const handleRefresh = () => {
    setLoading(true);
    setError("");
    void loadUsers();
  };

  // Search and filter
  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !normalizedSearch ||
        user.name?.toLowerCase().includes(normalizedSearch) ||
        user.email?.toLowerCase().includes(normalizedSearch);

      const matchesRole = roleFilter === "all" || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  // Statistics
  const stats = useMemo(
    () => ({
      total: users.length,
      students: users.filter((user) => user.role === "student").length,
      tutors: users.filter((user) => user.role === "tutor").length,
      admins: users.filter((user) => user.role === "admin").length,
    }),
    [users],
  );

  // Update user role
  const updateRole = async (user: AdminUser, role: "student" | "tutor") => {
    if (user.role === role) return;

    const confirmed = window.confirm(`Change ${user.name}'s role to ${role}?`);

    if (!confirmed) return;

    setUpdatingId(user._id);
    setError("");

    try {
      const headers = await getAuthHeaders();

      const response = await fetch(
        `${API_BASE_URL}/api/users/admin/${user._id}/role`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({ role }),
        },
      );

      const result: MutationResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update user role.");
      }

      setUsers((currentUsers) =>
        currentUsers.map((item) =>
          item._id === user._id ? { ...item, role } : item,
        ),
      );

      toast.success(`${user.name}'s role updated to ${role}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update role.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Update account status
  const updateStatus = async (user: AdminUser, isActive: boolean) => {
    const action = isActive ? "activate" : "deactivate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${user.name}'s account?`,
    );

    if (!confirmed) return;

    setUpdatingId(user._id);
    setError("");

    try {
      const headers = await getAuthHeaders();

      const response = await fetch(
        `${API_BASE_URL}/api/users/admin/${user._id}/status`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({ isActive }),
        },
      );

      const result: MutationResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update account status.");
      }

      setStatusOverrides((current) => ({
        ...current,
        [user._id]: isActive,
      }));

      toast.success(
        `${user.name}'s account ${
          isActive ? "activated" : "deactivated"
        } successfully.`,
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Format date
  const formatDate = (date: string) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "—";

    return parsedDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Role badge styles
  const getRoleStyle = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400";

      case "tutor":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400";

      default:
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck size={16} />
            <span>Admin Dashboard</span>
            <span>/</span>
            <span className="text-foreground">Users</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            User Management
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage platform users, roles and account access.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats.total}
          icon={<Users size={20} />}
          iconClass="bg-primary/10 text-primary"
        />

        <StatCard
          title="Students"
          value={stats.students}
          icon={<GraduationCap size={20} />}
          iconClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />

        <StatCard
          title="Tutors"
          value={stats.tutors}
          icon={<BookOpen size={20} />}
          iconClass="bg-blue-500/10 text-blue-600 dark:text-blue-400"
        />

        <StatCard
          title="Admins"
          value={stats.admins}
          icon={<ShieldCheck size={20} />}
          iconClass="bg-purple-500/10 text-purple-600 dark:text-purple-400"
        />
      </div>

      {/* Users Section */}
      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">All Users</h2>

              <p className="mt-1 text-xs text-muted-foreground">
                {filteredUsers.length} of {users.length} users
              </p>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative min-w-0 flex-1 sm:w-64">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />

                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search name or email..."
                  className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
                aria-label="Filter users by role"
                className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              >
                <option value="all">All Roles</option>
                <option value="student">Students</option>
                <option value="tutor">Tutors</option>
                <option value="admin">Admins</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-8">
            <Loader2 size={30} className="animate-spin text-primary" />

            <p className="text-sm text-muted-foreground">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          /* Empty State */
          <div className="flex min-h-64 flex-col items-center justify-center px-5 py-12 text-center">
            <div className="mb-3 flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <UserRound size={26} />
            </div>

            <h3 className="font-semibold text-foreground">No users found</h3>

            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {search || roleFilter !== "all"
                ? "Try changing your search or role filter."
                : "There are no registered users yet."}
            </p>

            {(search || roleFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setRoleFilter("all");
                }}
                className="mt-4 rounded-lg px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/10"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[850px] text-left">
                <thead className="bg-muted/40">
                  <tr className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <th className="px-5 py-4">User</th>
                    <th className="px-5 py-4">Role</th>
                    <th className="px-5 py-4">Plan</th>
                    <th className="px-5 py-4">Joined</th>
                    <th className="px-5 py-4">Account</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border">
                  {filteredUsers.map((user) => {
                    const accountStatus = statusOverrides[user._id];

                    return (
                      <tr
                        key={user._id}
                        className="transition-colors hover:bg-muted/30"
                      >
                        <td className="px-5 py-4">
                          <div className="flex min-w-0 items-center gap-3">
                            {user.image ? (
                              <img
                                src={user.image}
                                alt={user.name}
                                className="size-10 shrink-0 rounded-full border border-border object-cover"
                              />
                            ) : (
                              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                                {user.name?.charAt(0)?.toUpperCase() || "U"}
                              </div>
                            )}

                            <div className="min-w-0">
                              <p className="max-w-52 truncate text-sm font-semibold text-foreground">
                                {user.name || "Unnamed User"}
                              </p>

                              <p className="mt-0.5 max-w-52 truncate text-xs text-muted-foreground">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getRoleStyle(user.role)}`}
                          >
                            {user.role}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 text-sm capitalize text-foreground">
                            {user.plan?.toLowerCase() === "pro" && (
                              <Crown size={14} className="text-amber-500" />
                            )}

                            {user.plan || "Free"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm text-muted-foreground">
                            <CalendarDays size={14} />
                            {formatDate(user.createdAt)}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          {accountStatus === undefined ? (
                            <span className="text-xs text-muted-foreground">
                              Not loaded
                            </span>
                          ) : (
                            <span
                              className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                                accountStatus
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-destructive"
                              }`}
                            >
                              {accountStatus ? (
                                <CheckCircle2 size={14} />
                              ) : (
                                <XCircle size={14} />
                              )}

                              {accountStatus ? "Active" : "Inactive"}
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {user.role !== "admin" && (
                              <select
                                aria-label={`Change role for ${user.name}`}
                                value={user.role}
                                disabled={updatingId === user._id}
                                onChange={(event) =>
                                  void updateRole(
                                    user,
                                    event.target.value as "student" | "tutor",
                                  )
                                }
                                className="h-9 max-w-28 rounded-lg border border-border bg-background px-2 text-xs font-medium text-foreground outline-none focus:border-primary disabled:opacity-50"
                              >
                                <option value="student">Student</option>
                                <option value="tutor">Tutor</option>
                              </select>
                            )}

                            <button
                              type="button"
                              disabled={updatingId === user._id}
                              onClick={() => void updateStatus(user, true)}
                              className="rounded-lg border border-emerald-500/20 px-2.5 py-2 text-xs font-semibold text-emerald-600 transition-colors hover:bg-emerald-500/10 disabled:opacity-50 dark:text-emerald-400"
                            >
                              Activate
                            </button>

                            <button
                              type="button"
                              disabled={updatingId === user._id}
                              onClick={() => void updateStatus(user, false)}
                              className="rounded-lg border border-destructive/20 px-2.5 py-2 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
                            >
                              Deactivate
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="divide-y divide-border md:hidden">
              {filteredUsers.map((user) => {
                const accountStatus = statusOverrides[user._id];

                return (
                  <article key={user._id} className="space-y-4 p-4">
                    <div className="flex items-start gap-3">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt={user.name}
                          className="size-11 shrink-0 rounded-full border border-border object-cover"
                        />
                      ) : (
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                          {user.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-semibold text-foreground">
                          {user.name || "Unnamed User"}
                        </h3>

                        <p className="mt-1 flex items-center gap-1.5 break-all text-xs text-muted-foreground">
                          <Mail size={12} className="shrink-0" />
                          {user.email}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getRoleStyle(user.role)}`}
                          >
                            {user.role}
                          </span>

                          <span className="text-xs capitalize text-muted-foreground">
                            {user.plan || "Free"} plan
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays size={14} />
                        Joined {formatDate(user.createdAt)}
                      </span>

                      {accountStatus === undefined ? (
                        <span>Account status not loaded</span>
                      ) : (
                        <span
                          className={
                            accountStatus
                              ? "font-semibold text-emerald-600 dark:text-emerald-400"
                              : "font-semibold text-destructive"
                          }
                        >
                          {accountStatus ? "Active" : "Inactive"}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {user.role !== "admin" && (
                        <select
                          aria-label={`Change role for ${user.name}`}
                          value={user.role}
                          disabled={updatingId === user._id}
                          onChange={(event) =>
                            void updateRole(
                              user,
                              event.target.value as "student" | "tutor",
                            )
                          }
                          className="col-span-2 h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary disabled:opacity-50"
                        >
                          <option value="student">Student</option>
                          <option value="tutor">Tutor</option>
                        </select>
                      )}

                      <button
                        type="button"
                        disabled={updatingId === user._id}
                        onClick={() => void updateStatus(user, true)}
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-500/20 px-3 py-2.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-500/10 disabled:opacity-50 dark:text-emerald-400"
                      >
                        <CheckCircle2 size={14} />
                        Activate
                      </button>

                      <button
                        type="button"
                        disabled={updatingId === user._id}
                        onClick={() => void updateStatus(user, false)}
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-destructive/20 px-3 py-2.5 text-xs font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-50"
                      >
                        <XCircle size={14} />
                        Deactivate
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>

      <p className="text-xs leading-relaxed text-muted-foreground">
        Role changes are available for Student and Tutor accounts. Admin
        accounts cannot be changed through this interface.
      </p>
    </div>
  );
}

// Statistics Card
interface StatCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  iconClass: string;
}

function StatCard({ title, value, icon, iconClass }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground sm:text-sm">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold tabular-nums text-foreground sm:text-3xl">
            {value}
          </p>
        </div>

        <div
          className={`flex size-10 shrink-0 items-center justify-center rounded-xl sm:size-12 ${iconClass}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
