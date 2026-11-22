"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  DollarSign,
  Download,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
  GraduationCap,
  Loader2,
  Receipt,
  XCircle,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import { apiRequest } from "@/lib/api";

type PaymentStatus = "paid" | "pending" | "failed" | "refunded";

interface Transaction {
  _id: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  userRole?: "student" | "tutor" | "admin";
  planName?: string;
  amount: number;
  currency?: string;
  paymentStatus: PaymentStatus;
  sessionId?: string;
  paymentIntentId?: string;
  createdAt: string;
}

interface TransactionResponse {
  success: boolean;
  message?: string;
  data: {
    transactions: Transaction[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

interface TransactionStats {
  total: number;
  revenue: number;
  paid: number;
  pending: number;
  failed: number;
}

const PAGE_SIZE = 10;

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: PAGE_SIZE,
    totalPages: 1,
  });

  const loadTransactions = useCallback(
    async (showToast = false, isRefresh = false) => {
      try {
        if (isRefresh) setRefreshing(true);
        setError("");

        const tokenData = await authToken();

        if (!tokenData) {
          throw new Error("Authentication token পাওয়া যায়নি। আবার login করো।");
        }

        const response = await apiRequest<TransactionResponse>(
          `/api/dashboard/transactions?page=${page}&limit=${PAGE_SIZE}`,
          {
            headers: {
              Authorization: `Bearer ${tokenData}`,
            },
          },
        );

        if (!response.success || !response.data) {
          throw new Error(response.message || "Transactions load করা যায়নি।");
        }

        setTransactions(response.data.transactions || []);
        setPagination(response.data.pagination);

        if (showToast) {
          toast.success("Transactions refreshed successfully.");
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Something went wrong.";

        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page],
  );

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (cancelled) return;
      await loadTransactions();
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [loadTransactions]);

  const filteredTransactions = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const matchesSearch =
        !keyword ||
        transaction.userName?.toLowerCase().includes(keyword) ||
        transaction.userEmail?.toLowerCase().includes(keyword) ||
        transaction.planName?.toLowerCase().includes(keyword) ||
        transaction.paymentIntentId?.toLowerCase().includes(keyword) ||
        transaction.sessionId?.toLowerCase().includes(keyword) ||
        transaction._id?.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "all" || transaction.paymentStatus === statusFilter;

      const matchesRole =
        roleFilter === "all" || transaction.userRole === roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [transactions, search, statusFilter, roleFilter]);

  const stats: TransactionStats = useMemo(() => {
    const paidTransactions = transactions.filter(
      (item) => item.paymentStatus === "paid",
    );

    return {
      total: pagination.total,
      revenue: paidTransactions.reduce(
        (total, item) => total + Number(item.amount || 0),
        0,
      ),
      paid: transactions.filter((item) => item.paymentStatus === "paid").length,
      pending: transactions.filter((item) => item.paymentStatus === "pending")
        .length,
      failed: transactions.filter((item) => item.paymentStatus === "failed")
        .length,
    };
  }, [transactions, pagination.total]);

  const formatAmount = (amount: number, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));
  };

  const formatDate = (date: string) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-BD", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const statusClass = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
      case "failed":
        return "bg-red-500/10 text-red-600 dark:text-red-400";
      case "refunded":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400";
      default:
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
    }
  };

  const exportCSV = () => {
    if (filteredTransactions.length === 0) {
      toast.error("No transactions available to export.");
      return;
    }

    const headers = [
      "Transaction ID",
      "Name",
      "Email",
      "Role",
      "Plan",
      "Amount",
      "Currency",
      "Status",
      "Date",
    ];

    const rows = filteredTransactions.map((item) => [
      item._id,
      item.userName || "",
      item.userEmail || "",
      item.userRole || "",
      item.planName || "",
      item.amount,
      item.currency || "USD",
      item.paymentStatus,
      formatDate(item.createdAt),
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `mentorlagbe-transactions-page-${page}.csv`;
    anchor.click();

    URL.revokeObjectURL(url);
    toast.success("Transaction CSV exported successfully.");
  };

  const goToPage = (nextPage: number) => {
    if (nextPage < 1 || nextPage > pagination.totalPages) return;
    setPage(nextPage);
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
              <span className="text-foreground">Transactions</span>
            </div>

            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              Payment Transactions
            </h1>

            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Monitor platform payments, revenue, and transaction history.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={exportCSV}
              disabled={loading || filteredTransactions.length === 0}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 text-xs font-semibold transition hover:bg-muted disabled:opacity-50"
            >
              <Download size={14} />
              Export CSV
            </button>

            <button
              type="button"
              onClick={() => void loadTransactions(true, true)}
              disabled={loading || refreshing}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 text-xs font-semibold transition hover:bg-muted disabled:opacity-60"
            >
              <RefreshCw
                size={14}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <StatCard
            title="Total Transactions"
            value={stats.total.toLocaleString()}
            description="All platform payments"
            icon={<Receipt size={18} />}
            color="text-primary"
            background="bg-primary/10"
          />

          <StatCard
            title="Page Revenue"
            value={formatAmount(stats.revenue)}
            description="Paid transactions on this page"
            icon={<DollarSign size={18} />}
            color="text-emerald-600"
            background="bg-emerald-500/10"
          />

          <StatCard
            title="Successful"
            value={stats.paid}
            description="Paid transactions on this page"
            icon={<CheckCircle2 size={18} />}
            color="text-emerald-600"
            background="bg-emerald-500/10"
          />

          <StatCard
            title="Pending / Failed"
            value={`${stats.pending} / ${stats.failed}`}
            description="Current page transactions"
            icon={<Clock3 size={18} />}
            color="text-amber-600"
            background="bg-amber-500/10"
          />
        </div>

        {/* Search and filters */}
        <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-card p-3 sm:flex-row sm:flex-wrap">
          <div className="relative min-w-0 flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email, transaction ID..."
              className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-xs outline-none transition placeholder:text-muted-foreground focus:border-primary sm:text-sm"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-9 rounded-lg border border-border bg-background px-3 text-xs outline-none focus:border-primary sm:w-40 sm:text-sm"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>

          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            className="h-9 rounded-lg border border-border bg-background px-3 text-xs outline-none focus:border-primary sm:w-40 sm:text-sm"
          >
            <option value="all">All Roles</option>
            <option value="student">Student</option>
            <option value="tutor">Tutor</option>
          </select>
        </div>

        {/* Transactions */}
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex flex-col gap-1.5 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-bold">All Transactions</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Showing {filteredTransactions.length} of {pagination.total}{" "}
                transactions on this page
              </p>
            </div>

            <span className="text-xs text-muted-foreground">
              Page {pagination.page} of {Math.max(1, pagination.totalPages)}
            </span>
          </div>

          {loading ? (
            <div className="flex min-h-52 flex-col items-center justify-center gap-2">
              <Loader2 size={26} className="animate-spin text-primary" />
              <p className="text-xs text-muted-foreground">
                Loading transactions...
              </p>
            </div>
          ) : error ? (
            <div className="flex min-h-52 flex-col items-center justify-center px-4 text-center">
              <XCircle size={28} className="text-red-500" />
              <p className="mt-2 text-sm font-semibold">
                Unable to load transactions
              </p>
              <p className="mt-1 max-w-md text-xs text-muted-foreground">
                {error}
              </p>
              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  void loadTransactions();
                }}
                className="mt-3 inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground"
              >
                <RefreshCw size={13} />
                Try Again
              </button>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="flex min-h-52 flex-col items-center justify-center px-4 text-center">
              <div className="mb-3 rounded-xl bg-muted p-3">
                <CreditCard size={25} className="text-muted-foreground" />
              </div>
              <h3 className="text-sm font-semibold">No transactions found</h3>
              <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                Try changing your search or filters. New payments will appear
                here.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/40 text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Customer</th>
                      <th className="px-4 py-3 font-semibold">Plan</th>
                      <th className="px-4 py-3 font-semibold">Amount</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Date</th>
                      <th className="px-4 py-3 font-semibold">
                        Transaction ID
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-border">
                    {filteredTransactions.map((transaction) => (
                      <tr
                        key={transaction._id}
                        className="transition hover:bg-muted/20"
                      >
                        <td className="px-4 py-3">
                          <p className="font-semibold">
                            {transaction.userName || "Unknown user"}
                          </p>
                          <p className="mt-0.5 text-[10px] text-muted-foreground">
                            {transaction.userEmail || "No email"}
                          </p>
                          <span className="mt-1 inline-flex items-center gap-1 text-[10px] capitalize text-muted-foreground">
                            {transaction.userRole === "tutor" ? (
                              <GraduationCap size={11} />
                            ) : (
                              <Users size={11} />
                            )}
                            {transaction.userRole || "Unknown"}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <span className="font-semibold">
                            {transaction.planName || "N/A"}
                          </span>
                        </td>

                        <td className="px-4 py-3 font-bold text-primary">
                          {formatAmount(
                            transaction.amount,
                            transaction.currency,
                          )}
                        </td>

                        <td className="px-4 py-3">
                          <StatusBadge
                            status={transaction.paymentStatus}
                            className={statusClass(transaction.paymentStatus)}
                          />
                        </td>

                        <td className="px-4 py-3 text-muted-foreground">
                          {formatDate(transaction.createdAt)}
                        </td>

                        <td className="max-w-44 px-4 py-3">
                          <p
                            className="truncate font-mono text-[10px] text-muted-foreground"
                            title={
                              transaction.paymentIntentId ||
                              transaction.sessionId ||
                              transaction._id
                            }
                          >
                            {transaction.paymentIntentId ||
                              transaction.sessionId ||
                              transaction._id}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile and tablet cards */}
              <div className="divide-y divide-border lg:hidden">
                {filteredTransactions.map((transaction) => (
                  <article
                    key={transaction._id}
                    className="space-y-3 p-3 sm:p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          {transaction.userRole === "tutor" ? (
                            <GraduationCap size={17} />
                          ) : (
                            <Users size={17} />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold">
                            {transaction.userName || "Unknown user"}
                          </p>
                          <p className="truncate text-[10px] text-muted-foreground">
                            {transaction.userEmail || "No email"}
                          </p>
                        </div>
                      </div>

                      <StatusBadge
                        status={transaction.paymentStatus}
                        className={statusClass(transaction.paymentStatus)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 rounded-lg bg-muted/30 p-3">
                      <div>
                        <p className="text-[10px] text-muted-foreground">
                          Plan
                        </p>
                        <p className="mt-1 text-xs font-semibold">
                          {transaction.planName || "N/A"}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] text-muted-foreground">
                          Amount
                        </p>
                        <p className="mt-1 text-xs font-bold text-primary">
                          {formatAmount(
                            transaction.amount,
                            transaction.currency,
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] text-muted-foreground">
                          Role
                        </p>
                        <p className="mt-1 text-xs font-medium capitalize">
                          {transaction.userRole || "Unknown"}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] text-muted-foreground">
                          Date
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-xs font-medium">
                          <CalendarDays size={12} />
                          {formatDate(transaction.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] text-muted-foreground">
                        Transaction ID
                      </p>
                      <p className="mt-1 break-all font-mono text-[10px] text-muted-foreground">
                        {transaction.paymentIntentId ||
                          transaction.sessionId ||
                          transaction._id}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}

          {/* Pagination */}
          {!loading && !error && pagination.totalPages > 1 && (
            <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages} ·{" "}
                {pagination.total} transactions
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => goToPage(page - 1)}
                  disabled={page <= 1}
                  className="inline-flex h-8 items-center gap-1 rounded-lg border border-border px-3 text-xs font-semibold transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowLeft size={13} />
                  Previous
                </button>

                <button
                  type="button"
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= pagination.totalPages}
                  className="inline-flex h-8 items-center gap-1 rounded-lg border border-border px-3 text-xs font-semibold transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/20 p-3">
          <ShieldCheck
            size={15}
            className="mt-0.5 shrink-0 text-muted-foreground"
          />
          <p className="text-[10px] leading-5 text-muted-foreground">
            Transaction records are read-only. Only authorized administrators
            can access payment history.
          </p>
        </div>
      </div>
    </>
  );
}

function StatCard({
  title,
  value,
  description,
  icon,
  color,
  background,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  color: string;
  background: string;
}) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-2 rounded-xl border border-border bg-card p-3 sm:p-4">
      <div className="min-w-0">
        <p className="truncate text-[10px] font-medium text-muted-foreground sm:text-xs">
          {title}
        </p>
        <p className="mt-1.5 break-words text-lg font-bold tracking-tight sm:text-2xl">
          {value}
        </p>
        <p className="mt-1 text-[10px] text-muted-foreground">{description}</p>
      </div>

      <div className={`shrink-0 rounded-lg p-2 ${background} ${color}`}>
        {icon}
      </div>
    </div>
  );
}

function StatusBadge({
  status,
  className,
}: {
  status: string;
  className: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold capitalize ${className}`}
    >
      {status === "paid" ? (
        <CheckCircle2 size={11} />
      ) : status === "failed" ? (
        <XCircle size={11} />
      ) : (
        <Clock3 size={11} />
      )}
      {status || "Unknown"}
    </span>
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
