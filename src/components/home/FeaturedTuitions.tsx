"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  MapPin,
  Wallet,
} from "lucide-react";
import { apiRequest } from "@/lib/api";
import type { Tuition, TuitionApiResponse } from "@/types/tuition";

function formatFee(tuition: Tuition) {
  const { min, max, currency, period } = tuition.monthlyFee;

  const formatter = new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: currency || "BDT",
    maximumFractionDigits: 0,
  });

  return `${formatter.format(min)} – ${formatter.format(max)} / ${period}`;
}

export default function FeaturedTuitions() {
  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadTuitions() {
      try {
        const response = await apiRequest<TuitionApiResponse>("/api/tuitions");

        if (active) {
          setTuitions(response.data || []);
          setError("");
        }
      } catch {
        if (active) {
          setError("Unable to load tuitions. Please try again later.");
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
  }, []);

  return (
    <section className="container py-14">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-sm font-semibold text-primary">
            EXPLORE OPPORTUNITIES
          </p>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Featured Tuitions
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Find the right tuition opportunity for your learning journey.
          </p>
        </div>

        <Link
          href="/tuitions"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          View All Tuitions
          <ArrowRight size={16} />
        </Link>
      </div>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-64 animate-pulse rounded-2xl border border-border bg-card"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : tuitions.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center">
          <BookOpen className="mx-auto mb-3 text-muted-foreground" size={32} />
          <h3 className="font-semibold">No Tuitions Available Yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            New tuition opportunities will appear here when available.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tuitions.slice(0, 3).map((tuition) => (
            <article
              key={tuition._id}
              className="flex flex-col rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <span className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                  {tuition.classLevel}
                </span>

                <span className="rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  {tuition.mode}
                </span>
              </div>

              <h3 className="text-lg font-bold leading-snug">
                {tuition.title}
              </h3>

              <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                {tuition.description}
              </p>

              <div className="mt-5 space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <BookOpen size={16} className="shrink-0 text-primary" />
                  <span>{tuition.subject}</span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin size={16} className="shrink-0 text-primary" />
                  <span>{tuition.location}</span>
                </div>

                <div className="flex items-center gap-2">
                  <CalendarDays size={16} className="shrink-0 text-primary" />
                  <span>{tuition.daysPerWeek} days per week</span>
                </div>
              </div>

              <div className="mt-5 border-t border-border pt-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Wallet size={15} />
                  Monthly Tuition Fee
                </div>

                <p className="mt-1 text-lg font-bold text-primary">
                  {formatFee(tuition)}
                </p>
              </div>

              <div className="mt-auto pt-5">
                <Link
                  href={`/tuitions/${tuition._id}`}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                >
                  View Details
                  <ArrowRight size={16} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
