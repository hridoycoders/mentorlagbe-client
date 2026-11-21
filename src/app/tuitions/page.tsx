"use client";

import { useEffect, useMemo, useState } from "react";
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
import type { Tuition, TuitionApiResponse } from "@/types/tuition";

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

export default function TuitionsPage() {
  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedMode, setSelectedMode] = useState("all");

  useEffect(() => {
    let active = true;

    async function loadTuitions() {
      try {
        setError("");

        const response = await apiRequest<TuitionApiResponse>("/api/tuitions");

        if (active) {
          setTuitions(response.data || []);
        }
      } catch {
        if (active) {
          setError("Unable to load tuition opportunities. Please try again.");
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
  }, [retryCount]);

  const subjects = useMemo(
    () => [...new Set(tuitions.map((tuition) => tuition.subject))].sort(),
    [tuitions],
  );

  const classLevels = useMemo(
    () => [...new Set(tuitions.map((tuition) => tuition.classLevel))].sort(),
    [tuitions],
  );

  const filteredTuitions = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return tuitions.filter((tuition) => {
      const title = (tuition.title || "").toLowerCase();
      const subject = (tuition.subject || "").toLowerCase();
      const tutorName = (tuition.tutorName || "").toLowerCase();
      const description = (tuition.description || "").toLowerCase();
      const mode = (tuition.mode || "").toLowerCase();

      const matchesSearch =
        !keyword ||
        title.includes(keyword) ||
        subject.includes(keyword) ||
        tutorName.includes(keyword) ||
        description.includes(keyword);

      const matchesSubject =
        selectedSubject === "all" || tuition.subject === selectedSubject;

      const matchesClass =
        selectedClass === "all" || tuition.classLevel === selectedClass;

      const matchesMode = selectedMode === "all" || mode === selectedMode;

      return matchesSearch && matchesSubject && matchesClass && matchesMode;
    });
  }, [tuitions, searchTerm, selectedSubject, selectedClass, selectedMode]);

  function handleReset() {
    setSearchTerm("");
    setSelectedSubject("all");
    setSelectedClass("all");
    setSelectedMode("all");
  }

  function handleRetry() {
    setLoading(true);
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
            onSubmit={(event) => event.preventDefault()}
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
                <option value="online">Online</option>
                <option value="offline">Offline</option>
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
                {filteredTuitions.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-foreground">
                {tuitions.length}
              </span>{" "}
              tuitions
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
        ) : filteredTuitions.length === 0 ? (
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
            {filteredTuitions.map((tuition) => (
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
      </section>
    </main>
  );
}
