"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  MapPin,
  Wallet,
  UserRound,
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

// Subject অনুযায়ী আলাদা fallback image
function getTuitionImage(subject: string) {
  const value = subject.toLowerCase();

  if (value.includes("math")) {
    return "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80";
  }

  if (value.includes("english") || value.includes("language")) {
    return "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80";
  }

  if (value.includes("science") || value.includes("physics")) {
    return "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80";
  }

  if (value.includes("computer") || value.includes("programming")) {
    return "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80";
  }

  if (value.includes("biology")) {
    return "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&q=80";
  }

  if (value.includes("chemistry")) {
    return "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=800&q=80";
  }

  return "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80";
}

function TuitionSkeleton() {
  return (
    <div className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-[400px] animate-pulse rounded-2xl border border-border bg-card"
        />
      ))}
    </div>
  );
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
          setTuitions((response.data || []).slice(0, 6));
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
    <section className="container py-12 sm:py-16">
      {/* Section Heading */}
      <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-bold tracking-wider text-primary sm:text-sm">
            EXPLORE OPPORTUNITIES
          </p>

          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Featured <span className="brand-text-gradient">Tuitions</span>
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Discover the latest tuition opportunities and connect with the right
            tutor for your academic journey.
          </p>
        </div>

        <Link
          href="/tuitions"
          className="group inline-flex items-center gap-2 text-sm font-bold text-primary"
        >
          View All Tuitions
          <ArrowRight
            size={16}
            className="transition-transform group-hover:translate-x-1"
          />
        </Link>
      </div>

      {/* Loading */}
      {loading ? (
        <TuitionSkeleton />
      ) : error ? (
        <div className="rounded-2xl border border-border bg-card px-5 py-10 text-center">
          <BookOpen className="mx-auto mb-3 text-destructive" size={32} />
          <h3 className="font-bold">Unable to Load Tuitions</h3>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        </div>
      ) : tuitions.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card px-5 py-10 text-center">
          <BookOpen className="mx-auto mb-3 text-muted-foreground" size={34} />
          <h3 className="font-bold">No Tuitions Available Yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            New approved tuition opportunities will appear here.
          </p>
        </div>
      ) : (
        <div className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tuitions.map((tuition) => (
            <article
              key={tuition._id}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-3.5 transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg sm:p-4"
            >
              {/* Tuition Banner Image */}
              <div className="relative mb-3 h-36 w-full overflow-hidden rounded-xl bg-muted sm:h-40">
                <img
                  src={tuition.bannerImage || getTuitionImage(tuition.subject)}
                  alt={`${tuition.subject} tuition`}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>

              {/* Badges */}
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <span className="max-w-[65%] truncate rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                  {tuition.subject}
                </span>

                <span className="rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  {tuition.mode}
                </span>
              </div>

              {/* Title */}
              <div className="min-h-[65px]">
                <h3 className="line-clamp-2 text-base font-extrabold leading-snug transition-colors group-hover:text-primary sm:text-lg">
                  {tuition.title}
                </h3>

                <p className="mt-1.5 text-xs font-medium text-muted-foreground">
                  {tuition.classLevel}
                </p>
              </div>

              {/* Tuition Information */}
              <div className="mt-3 flex-1 space-y-2.5 text-sm text-muted-foreground">
                <div className="flex items-center gap-2.5">
                  <BookOpen size={15} className="shrink-0 text-primary" />
                  <span className="truncate">{tuition.subject}</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <MapPin size={15} className="shrink-0 text-primary" />
                  <span className="truncate">{tuition.location}</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <CalendarDays size={15} className="shrink-0 text-primary" />
                  <span>{tuition.daysPerWeek} days per week</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <UserRound size={15} className="shrink-0 text-primary" />
                  <span className="truncate">
                    {tuition.tutorName || "Tutor"}
                  </span>
                </div>
              </div>

              {/* Monthly Fee */}
              <div className="mt-3 border-t border-border pt-3">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Wallet size={14} />
                  Monthly Tuition Fee
                </div>

                <p className="mt-1 text-base font-extrabold text-primary sm:text-lg">
                  {formatFee(tuition)}
                </p>
              </div>

              {/* Details Button */}
              <div className="pt-3">
                <Link
                  href={`/tuitions/${tuition._id}`}
                  className="brand-gradient group/button inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold text-white transition hover:opacity-90"
                >
                  View Details
                  <ArrowRight
                    size={15}
                    className="transition-transform group-hover/button:translate-x-1"
                  />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
