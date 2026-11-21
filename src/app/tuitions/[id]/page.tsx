"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  GraduationCap,
  MapPin,
  UserRound,
  Wifi,
  Image as ImageIcon,
  LockKeyhole,
  Send,
} from "lucide-react";

import { apiRequest } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import type { Tuition } from "@/types/tuition";

interface TuitionDetails extends Tuition {
  tutorEmail?: string;
  createdAt?: string;
}

interface TuitionDetailsResponse {
  success: boolean;
  message: string;
  data: TuitionDetails;
}

function formatFee(tuition: TuitionDetails) {
  const { min, max, currency } = tuition.monthlyFee;

  const formatter = new Intl.NumberFormat("en-BD", {
    maximumFractionDigits: 0,
  });

  const symbol = currency === "BDT" ? "৳" : `${currency} `;
  const minimum = `${symbol}${formatter.format(min)}`;
  const maximum = `${symbol}${formatter.format(max)}`;

  return min === max ? `${minimum} / month` : `${minimum} – ${maximum} / month`;
}

function getTuitionImage(tuition: TuitionDetails) {
  if (tuition.bannerImage?.trim()) {
    return tuition.bannerImage;
  }

  const subject = (tuition.subject || "").toLowerCase();

  if (subject.includes("math")) {
    return "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=1200";
  }

  if (subject.includes("english")) {
    return "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200";
  }

  if (
    subject.includes("physics") ||
    subject.includes("chemistry") ||
    subject.includes("science")
  ) {
    return "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1200";
  }

  if (subject.includes("biology")) {
    return "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=1200";
  }

  if (subject.includes("computer") || subject.includes("programming")) {
    return "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200";
  }

  return "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200";
}

function DetailsSkeleton() {
  return (
    <main className="container min-h-screen animate-pulse py-8 sm:py-12">
      <div className="mb-6 h-5 w-32 rounded bg-muted" />
      <div className="h-64 rounded-2xl bg-muted sm:h-96" />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_350px]">
        <div className="space-y-5">
          <div className="h-8 w-3/4 rounded bg-muted" />
          <div className="h-5 w-1/2 rounded bg-muted" />
          <div className="h-32 rounded-2xl bg-muted" />
        </div>
        <div className="h-64 rounded-2xl bg-muted" />
      </div>
    </main>
  );
}

export default function TuitionDetailsPage() {
  const params = useParams<{ id: string }>();
  const tuitionId = params.id;

  const { data: session, isPending: authLoading } = useSession();

  const user = session?.user as
    | {
        role?: string;
      }
    | undefined;

  const role = user?.role;

  const [tuition, setTuition] = useState<TuitionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadTuitionDetails() {
      try {
        setLoading(true);
        setError("");

        const response = await apiRequest<TuitionDetailsResponse>(
          `/api/tuitions/${encodeURIComponent(tuitionId)}`,
        );

        if (active) {
          setTuition(response.data);
        }
      } catch (requestError) {
        console.error("Tuition Details Error:", requestError);

        if (active) {
          setTuition(null);
          setError(
            "This tuition could not be found or is no longer available.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    if (tuitionId) {
      loadTuitionDetails();
    }

    return () => {
      active = false;
    };
  }, [tuitionId]);

  if (loading || authLoading) {
    return <DetailsSkeleton />;
  }

  if (error || !tuition) {
    return (
      <main className="container flex min-h-[70vh] items-center justify-center py-12">
        <div className="w-full max-w-lg rounded-2xl border border-border bg-card px-6 py-12 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
            <BookOpen size={30} className="text-destructive" />
          </div>

          <h1 className="text-2xl font-bold">Tuition Not Available</h1>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {error || "We could not find the requested tuition."}
          </p>

          <Link
            href="/tuitions"
            className="mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            <ArrowLeft size={16} />
            Back to Tuitions
          </Link>
        </div>
      </main>
    );
  }

  const tuitionImage = getTuitionImage(tuition);
  const isStudent = role === "student";
  const isLoggedIn = Boolean(session?.user);
  const isGuest = !isLoggedIn;

  return (
    <main className="min-h-screen bg-background">
      <div className="container py-7 sm:py-10">
        <Link
          href="/tuitions"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-primary"
        >
          <ArrowLeft size={17} />
          Back to All Tuitions
        </Link>

        {/* Tuition Banner */}
        <section className="relative h-64 overflow-hidden rounded-2xl bg-muted sm:h-80 lg:h-[420px]">
          <img
            src={tuitionImage}
            alt={tuition.title}
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
            <div className="mb-3 flex flex-wrap gap-2">
              <span className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground">
                {tuition.subject}
              </span>

              <span className="rounded-lg bg-white/20 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
                {tuition.mode}
              </span>

              <span className="rounded-lg bg-emerald-500/90 px-3 py-1.5 text-xs font-bold text-white">
                <span className="inline-flex items-center gap-1">
                  <CheckCircle2 size={13} />
                  Approved
                </span>
              </span>
            </div>

            <h1 className="max-w-3xl text-2xl font-extrabold leading-tight text-white sm:text-3xl lg:text-4xl">
              {tuition.title}
            </h1>

            <p className="mt-2 flex items-center gap-2 text-sm text-white/80">
              <GraduationCap size={17} />
              {tuition.classLevel}
            </p>
          </div>
        </section>

        {/* Main Content */}
        <div className="mt-8 grid items-start gap-7 lg:grid-cols-[1fr_350px] lg:gap-10">
          <div className="min-w-0 space-y-7">
            {/* Overview */}
            <section className="rounded-2xl border border-border bg-card p-5 sm:p-7">
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-wider text-primary">
                  Tuition Overview
                </p>

                <h2 className="mt-2 text-xl font-bold sm:text-2xl">
                  About This Tuition
                </h2>
              </div>

              <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground sm:text-base">
                {tuition.description ||
                  "No additional description has been provided for this tuition."}
              </p>
            </section>

            {/* Tuition Information */}
            <section className="rounded-2xl border border-border bg-card p-5 sm:p-7">
              <h2 className="mb-5 text-xl font-bold">Tuition Information</h2>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-primary/10 p-3 text-primary">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Subject</p>
                    <p className="mt-1 font-semibold">{tuition.subject}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-primary/10 p-3 text-primary">
                    <GraduationCap size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Class Level</p>
                    <p className="mt-1 font-semibold">{tuition.classLevel}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-primary/10 p-3 text-primary">
                    {tuition.mode?.toLowerCase() === "online" ? (
                      <Wifi size={20} />
                    ) : (
                      <MapPin size={20} />
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Tuition Mode
                    </p>
                    <p className="mt-1 font-semibold">{tuition.mode}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-primary/10 p-3 text-primary">
                    <CalendarDays size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Schedule</p>
                    <p className="mt-1 font-semibold">
                      {tuition.daysPerWeek} days per week
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:col-span-2">
                  <div className="rounded-xl bg-primary/10 p-3 text-primary">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="mt-1 font-semibold">{tuition.location}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Tutor Information */}
            <section className="rounded-2xl border border-border bg-card p-5 sm:p-7">
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-wider text-primary">
                  Meet Your Tutor
                </p>
                <h2 className="mt-2 text-xl font-bold">Tutor Information</h2>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <UserRound size={28} />
                </div>

                <div className="min-w-0">
                  <h3 className="truncate text-lg font-bold">
                    {tuition.tutorName || "Experienced Tutor"}
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    MentorLagbe Tutor
                  </p>

                  {tuition.tutorEmail && (
                    <p className="mt-1 break-all text-xs text-muted-foreground">
                      {tuition.tutorEmail}
                    </p>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* Fee Sidebar */}
          <aside className="space-y-5 lg:sticky lg:top-24">
            <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-primary">
                Tuition Fee
              </p>

              <div className="mt-3">
                <p className="text-2xl font-extrabold text-primary sm:text-3xl">
                  {formatFee(tuition)}
                </p>

                <p className="mt-2 text-xs text-muted-foreground">
                  Monthly payment range
                </p>
              </div>

              <div className="my-5 border-t border-border" />

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <BookOpen size={16} />
                    Subject
                  </span>
                  <span className="font-semibold">{tuition.subject}</span>
                </div>

                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <CalendarDays size={16} />
                    Days / Week
                  </span>
                  <span className="font-semibold">
                    {tuition.daysPerWeek} days
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Clock size={16} />
                    Mode
                  </span>
                  <span className="font-semibold">{tuition.mode}</span>
                </div>
              </div>

              {/* Role Based Apply Section */}
              <div className="mt-6 rounded-xl bg-primary/5 p-4">
                {isStudent && (
                  <>
                    <div className="flex items-center gap-2">
                      <Send size={18} className="text-primary" />
                      <p className="text-sm font-semibold">
                        Interested in this tuition?
                      </p>
                    </div>

                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      Apply for this tuition and connect with the tutor.
                    </p>

                    <Link
                      href="#apply"
                      className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground transition hover:opacity-90"
                    >
                      <Send size={16} />
                      Apply for Tuition
                    </Link>
                  </>
                )}

                {isGuest && (
                  <>
                    <div className="flex items-center gap-2">
                      <LockKeyhole size={18} className="text-primary" />
                      <p className="text-sm font-semibold">Login Required</p>
                    </div>

                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      Sign in with your student account to apply for this
                      tuition.
                    </p>

                    <Link
                      href="/sign-in"
                      className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground transition hover:opacity-90"
                    >
                      Sign In to Apply
                    </Link>
                  </>
                )}

                {isLoggedIn && !isStudent && (
                  <>
                    <div className="flex items-center gap-2">
                      <LockKeyhole
                        size={18}
                        className="text-muted-foreground"
                      />
                      <p className="text-sm font-semibold">
                        Student Access Only
                      </p>
                    </div>

                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      Only student accounts can apply for tuition. Your current
                      account does not have permission to apply.
                    </p>

                    <div className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-muted text-sm font-semibold text-muted-foreground">
                      <LockKeyhole size={15} />
                      Application Unavailable
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* Platform Information */}
            <div className="rounded-2xl border border-border bg-muted/30 p-5">
              <div className="flex items-center gap-2">
                <ImageIcon size={18} className="text-primary" />
                <h3 className="text-sm font-bold">MentorLagbe</h3>
              </div>

              <p className="mt-2 text-xs leading-6 text-muted-foreground">
                Connecting students with the right tutors and better learning
                opportunities.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
