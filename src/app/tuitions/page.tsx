"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  GraduationCap,
  MapPin,
  RefreshCw,
  Search,
  Wallet,
  UserRound,
  RotateCcw,
} from "lucide-react";

import { apiRequest } from "@/lib/api";
import type {
  Tuition,
  TuitionApiResponse,
  TuitionPagination,
} from "@/types/tuition";

function formatFee(tuition: Tuition) {
  const { min, max } = tuition.monthlyFee;

  const formatter = new Intl.NumberFormat("en-BD", {
    maximumFractionDigits: 0,
  });

  const taka = "\u09F3";
  const separator = "\u2013";

  const minimum = `${taka}${formatter.format(min)}`;
  const maximum = `${taka}${formatter.format(max)}`;

  return min === max
    ? `${minimum}/mo`
    : `${minimum} ${separator} ${maximum}/mo`;
}

function getTuitionImage(tuition: Tuition) {
  if (tuition.bannerImage?.trim()) {
    return tuition.bannerImage;
  }

  const subject = (tuition.subject || "").toLowerCase();

  if (subject.includes("math")) {
    return "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=900";
  }

  if (subject.includes("english")) {
    return "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=900";
  }

  if (subject.includes("physics") || subject.includes("chemistry")) {
    return "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=900";
  }

  if (subject.includes("biology")) {
    return "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=900";
  }

  if (subject.includes("science")) {
    return "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=900";
  }

  if (subject.includes("computer") || subject.includes("programming")) {
    return "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900";
  }

  return "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=900";
}

function TuitionSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-[430px] animate-pulse rounded-2xl border border-border bg-card"
        />
      ))}
    </div>
  );
}

const PAGE_SIZE = 12;

export default function TuitionsPage() {
  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pagination, setPagination] = useState<TuitionPagination | null>(null);

  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const [searchTerm, setSearchTerm] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");

  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedMode, setSelectedMode] = useState("all");

  // Read the subject query from homepage category links
  useEffect(() => {
    async function readInitialSubject() {
      await Promise.resolve();

      const params = new URLSearchParams(window.location.search);
      const subject = params.get("subject");

      if (subject?.trim()) {
        setSelectedSubject(subject.trim());
      }
    }

    readInitialSubject();
  }, []);

  const prevFiltersRef = useRef({
    submittedSearch,
    selectedSubject,
    selectedClass,
    selectedMode,
  });

  // Fetch filtered tuition data from the backend
  useEffect(() => {
    const prev = prevFiltersRef.current;
    const filtersChanged =
      prev.submittedSearch !== submittedSearch ||
      prev.selectedSubject !== selectedSubject ||
      prev.selectedClass !== selectedClass ||
      prev.selectedMode !== selectedMode;

    prevFiltersRef.current = {
      submittedSearch,
      selectedSubject,
      selectedClass,
      selectedMode,
    };

    // Reset to first page whenever filters change (avoids fetching an empty page).
    if (filtersChanged && page !== 1) {
      setPage(1);
      return;
    }

    let active = true;

    async function loadTuitions() {
      try {
        await Promise.resolve();

        if (!active) return;

        setLoading(true);
        setError("");

        const params = new URLSearchParams();

        if (submittedSearch.trim()) {
          params.set("search", submittedSearch.trim());
        }

        if (selectedSubject !== "all") {
          params.set("subject", selectedSubject);
        }

        if (selectedClass !== "all") {
          params.set("classLevel", selectedClass);
        }

        if (selectedMode !== "all") {
          params.set("mode", selectedMode);
        }

        params.set("page", String(page));
        params.set("limit", String(PAGE_SIZE));

        const queryString = params.toString();

        const endpoint = `/api/tuitions/search?${queryString}`;

        const response = await apiRequest<TuitionApiResponse>(endpoint);

        if (active) {
          setTuitions(response.data || []);
          setTotalCount(response.total || 0);
          setPagination(response.pagination || null);
        }
      } catch (requestError) {
        console.error("Tuition Search Error:", requestError);

        if (active) {
          setError("Unable to load tuition opportunities. Please try again.");
          setTuitions([]);
          setTotalCount(0);
          setPagination(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadTuitions();

    return () => {
      active = false;
    };
  }, [
    submittedSearch,
    selectedSubject,
    selectedClass,
    selectedMode,
    page,
    retryCount,
  ]);

  // Build dropdown options from available tuition data
  const subjects = useMemo(() => {
    const availableSubjects = tuitions.map((tuition) => tuition.subject);

    if (selectedSubject !== "all") {
      availableSubjects.push(selectedSubject);
    }

    return [...new Set(availableSubjects)].sort();
  }, [tuitions, selectedSubject]);

  const classLevels = useMemo(
    () => [...new Set(tuitions.map((tuition) => tuition.classLevel))].sort(),
    [tuitions],
  );

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedSearch(searchTerm.trim());
  }

  function handleReset() {
    setSearchTerm("");
    setSubmittedSearch("");
    setSelectedSubject("all");
    setSelectedClass("all");
    setSelectedMode("all");

    // Remove old category query from the URL
    window.history.replaceState({}, "", window.location.pathname);
  }

  function handleRetry() {
    setRetryCount((previous) => previous + 1);
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Page Header */}
      <section className="border-b border-border bg-muted/30">
        <div className="container py-12 sm:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              <GraduationCap size={18} />
              Find Your Perfect Tuition
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Explore Tuition{" "}
              <span className="text-primary">Opportunities</span>
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              Discover tuition opportunities, connect with experienced tutors,
              and find the right learning opportunity for you.
            </p>
          </div>
        </div>
      </section>

      {/* All Tuitions */}
      <section className="container py-10 sm:py-14">
        {/* Section Heading */}
        <div className="mb-7">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Available Opportunities
          </p>

          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Browse All Tuitions
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Search and filter tuition opportunities based on your preference.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
          <form
            onSubmit={handleSearch}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />

              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by title, tutor, or keyword..."
                aria-label="Search tuition opportunities"
                className="h-11 w-full rounded-xl border border-border bg-muted/40 pl-10 pr-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>

            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              <Search size={16} />
              Search
            </button>
          </form>

          <div className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Subject Filter */}
            <div>
              <label
                htmlFor="subject-filter"
                className="mb-1.5 block text-xs font-medium text-muted-foreground"
              >
                Subject
              </label>

              <select
                id="subject-filter"
                value={selectedSubject}
                onChange={(event) => setSelectedSubject(event.target.value)}
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              >
                <option value="all">All Subjects</option>

                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            {/* Class Filter */}
            <div>
              <label
                htmlFor="class-filter"
                className="mb-1.5 block text-xs font-medium text-muted-foreground"
              >
                Class Level
              </label>

              <select
                id="class-filter"
                value={selectedClass}
                onChange={(event) => setSelectedClass(event.target.value)}
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              >
                <option value="all">All Levels</option>

                {classLevels.map((classLevel) => (
                  <option key={classLevel} value={classLevel}>
                    {classLevel}
                  </option>
                ))}
              </select>
            </div>

            {/* Mode Filter */}
            <div>
              <label
                htmlFor="mode-filter"
                className="mb-1.5 block text-xs font-medium text-muted-foreground"
              >
                Mode
              </label>

              <select
                id="mode-filter"
                value={selectedMode}
                onChange={(event) => setSelectedMode(event.target.value)}
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              >
                <option value="all">All Modes</option>
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
              </select>
            </div>

            {/* Reset */}
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border text-sm font-medium text-muted-foreground transition hover:border-primary hover:text-primary"
              >
                <RotateCcw size={15} />
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Result Count */}
        {!loading && !error && (
          <div className="mb-5 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-foreground">
                {totalCount}
              </span>{" "}
              {totalCount === 1 ? "tuition" : "tuitions"}
            </p>
          </div>
        )}

        {/* Loading, Error, Empty and Results */}
        {loading ? (
          <TuitionSkeleton />
        ) : error ? (
          <div className="rounded-2xl border border-border bg-card px-5 py-12 text-center">
            <BookOpen className="mx-auto mb-4 text-destructive" size={36} />

            <h3 className="text-lg font-semibold">Something Went Wrong</h3>

            <p className="mt-2 text-sm text-muted-foreground">{error}</p>

            <button
              type="button"
              onClick={handleRetry}
              className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        ) : tuitions.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card px-5 py-14 text-center">
            <Search className="mx-auto mb-4 text-muted-foreground" size={40} />

            <h3 className="text-lg font-semibold">
              No Matching Tuitions Found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              We could not find any tuition matching your search or filters. Try
              changing your search or resetting the filters.
            </p>

            <button
              type="button"
              onClick={handleReset}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              <RotateCcw size={15} />
              Clear Filters
            </button>
          </div>
        ) : (
          /* Tuition Cards */
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tuitions.map((tuition) => (
              <article
                key={tuition._id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-0 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl"
              >
                {/* Tuition Image */}
                <div className="relative h-52 overflow-hidden bg-muted">
                  <img
                    src={getTuitionImage(tuition)}
                    alt={tuition.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <span className="absolute left-3 top-3 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
                    {tuition.mode}
                  </span>
                </div>

                {/* Card Content */}
                <div className="flex flex-1 flex-col p-5">
                  {/* Subject and Class */}
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                      {tuition.subject}
                    </span>

                    <span className="text-xs font-medium text-muted-foreground">
                      {tuition.classLevel}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="line-clamp-2 min-h-12 text-lg font-bold leading-snug transition group-hover:text-primary">
                    {tuition.title}
                  </h3>

                  {/* Tutor and Schedule */}
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <UserRound size={14} className="text-primary" />
                      {tuition.tutorName}
                    </span>

                    <span className="text-border">|</span>

                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays size={14} className="text-primary" />
                      {tuition.daysPerWeek}d/week
                    </span>
                  </div>

                  {/* Location */}
                  <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin size={14} className="shrink-0 text-primary" />
                    <span className="line-clamp-1">{tuition.location}</span>
                  </div>

                  {/* Fee and Details */}
                  <div className="mt-auto flex items-end justify-between gap-3 border-t border-border pt-5">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Wallet size={14} />
                        Monthly Fee
                      </div>

                      <p className="mt-1 text-lg font-bold">
                        {formatFee(tuition)}
                      </p>
                    </div>

                    <Link
                      href={`/tuitions/${tuition._id}`}
                      className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
                    >
                      View Details
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && pagination && pagination.totalPages > 1 && (
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Page{" "}
              <span className="font-semibold text-foreground">
                {pagination.page}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-foreground">
                {pagination.totalPages}
              </span>{" "}
              · {pagination.total}{" "}
              {pagination.total === 1 ? "tuition" : "tuitions"}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!pagination.hasPrevPage || loading}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-border px-4 text-sm font-medium text-foreground transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>

              <button
                type="button"
                onClick={() =>
                  setPage((p) =>
                    Math.min(pagination.totalPages, p + 1),
                  )
                }
                disabled={!pagination.hasNextPage || loading}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-border px-4 text-sm font-medium text-foreground transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
