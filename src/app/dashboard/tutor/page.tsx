"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Crown,
  GraduationCap,
  Lightbulb,
  PlusCircle,
  Users,
} from "lucide-react";

const quickActions = [
  {
    title: "Post a Tuition",
    description:
      "Create a tuition post with subject, class, teaching mode, location, and monthly budget.",
    href: "/dashboard/tutor/post-tuition",
    action: "Create Tuition",
    icon: PlusCircle,
    iconStyle: "bg-primary/10 text-primary",
  },
  {
    title: "My Tuitions",
    description:
      "View and manage your tuition posts and check their approval status.",
    href: "/dashboard/tutor/my-tuitions",
    action: "Manage Tuitions",
    icon: BookOpen,
    iconStyle: "bg-emerald-500/10 text-emerald-600",
  },
  {
    title: "Applicants",
    description:
      "Review student applications and choose suitable students for your tuition.",
    href: "/dashboard/tutor/applicants",
    action: "View Applicants",
    icon: Users,
    iconStyle: "bg-amber-500/10 text-amber-600",
  },
];

export default function TutorDashboardPage() {
  const { data: session } = useSession();

  const user = session?.user as
    | {
        name?: string;
        plan?: string;
      }
    | undefined;

  const tutorName = user?.name?.trim().split(" ")[0] || "Tutor";
  const plan = user?.plan?.toLowerCase() || "free";
  const isPro = plan === "pro";

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-20 right-32 h-40 w-40 rounded-full bg-brand-cyan/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <GraduationCap size={26} />
            </div>

            <p className="text-sm font-semibold text-primary">
              Tutor Dashboard
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Welcome back, {tutorName}!
            </h1>

            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Manage your tuition posts, review student applications, and build
              meaningful learning connections through MentorLagbe.
            </p>

            <Link
              href="/dashboard/tutor/post-tuition"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              <PlusCircle size={17} />
              Post a Tuition
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="flex shrink-0 items-center gap-3 self-start rounded-xl border border-border bg-background/80 p-4 sm:self-center">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Crown size={23} />
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Current Plan</p>
              <p className="text-lg font-bold capitalize text-foreground">
                {isPro ? "Pro Plan" : "Free Plan"}
              </p>
              <p className="text-xs text-muted-foreground">
                {isPro ? "Unlimited tuition posts" : "Up to 2 tuition posts"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tuition Posting Plan */}
      <section>
        <div className="mb-5">
          <h2 className="text-xl font-bold text-foreground">
            Your Teaching Plan
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Understand your tuition posting benefits.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div
            className={`rounded-xl border p-5 shadow-sm ${
              !isPro
                ? "border-primary/40 bg-primary/5"
                : "border-border bg-card"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="text-primary" size={21} />
                <h3 className="font-bold text-foreground">Free Plan</h3>
              </div>

              {!isPro && (
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  Current Plan
                </span>
              )}
            </div>

            <p className="mt-4 text-2xl font-bold text-foreground">
              $0
              <span className="text-sm font-normal text-muted-foreground">
                {" "}
                / free
              </span>
            </p>

            <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={17} className="shrink-0 text-emerald-600" />
                Up to 2 tuition posts
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={17} className="shrink-0 text-emerald-600" />
                Manage your tuition posts
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={17} className="shrink-0 text-emerald-600" />
                Review student applications
              </li>
            </ul>
          </div>

          <div
            className={`rounded-xl border p-5 shadow-sm ${
              isPro ? "border-primary/40 bg-primary/5" : "border-border bg-card"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Crown className="text-brand-amber" size={21} />
                <h3 className="font-bold text-foreground">Pro Plan</h3>
              </div>

              {isPro && (
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  Current Plan
                </span>
              )}
            </div>

            <p className="mt-4 text-2xl font-bold text-foreground">
              $15
              <span className="text-sm font-normal text-muted-foreground">
                {" "}
                / month
              </span>
            </p>

            <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={17} className="shrink-0 text-emerald-600" />
                Unlimited tuition posts
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={17} className="shrink-0 text-emerald-600" />
                Manage your tuition posts
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={17} className="shrink-0 text-emerald-600" />
                Review student applications
              </li>
            </ul>

            {!isPro && (
              <Link
                href="/pricing"
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                Explore Pro Plan
                <ArrowRight size={16} />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <div className="mb-5">
          <h2 className="text-xl font-bold text-foreground">
            Manage Your Teaching
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Everything you need to manage your teaching activities.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {quickActions.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div
                  className={`flex size-12 items-center justify-center rounded-xl ${item.iconStyle}`}
                >
                  <Icon size={23} />
                </div>

                <h3 className="mt-5 text-lg font-bold text-foreground">
                  {item.title}
                </h3>

                <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">
                  {item.description}
                </p>

                <Link
                  href={item.href}
                  className="mt-5 inline-flex w-fit items-center gap-2 text-sm font-semibold text-primary transition hover:gap-3"
                >
                  {item.action}
                  <ArrowRight size={16} />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* Teaching Tips */}
      <section className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-7">
        <div className="flex items-start gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
            <Lightbulb size={22} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-foreground">
              Tips for Successful Teaching
            </h2>

            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              Write clear tuition descriptions, select the correct subject and
              class level, provide your preferred teaching mode, and set a
              reasonable monthly budget. Keep your profile updated so students
              can learn more about your teaching experience.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
