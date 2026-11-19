"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  MapPin,
  Search,
  Users,
} from "lucide-react";

const stats = [
  { value: "500+", label: "Expert Tutors" },
  { value: "2K+", label: "Happy Students" },
  { value: "4.9/5", label: "User Rating" },
];

const benefits = [
  "Experienced Tutors",
  "Flexible Learning",
  "Personalized Guidance",
];

function MentorshipImage() {
  return (
    <div className="relative mx-auto aspect-[3/2] w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <Image
        src="/images/mentorship-hero.webp"
        alt="A tutor helping a student with learning"
        fill
        priority
        sizes="(max-width: 768px) 100vw, 40vw"
        className="object-cover"
      />
    </div>
  );
}

export default function Home() {
  const router = useRouter();

  const [subject, setSubject] = useState("");
  const [medium, setMedium] = useState("");
  const [location, setLocation] = useState("");

  function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const params = new URLSearchParams();

    if (subject) params.set("subject", subject);
    if (medium) params.set("medium", medium);
    if (location) params.set("location", location);

    const query = params.toString();

    router.push(query ? `/tuitions?${query}` : "/tuitions");
  }

  return (
    <div className="bg-background text-foreground">
      {/* Hero Section */}
      <section className="border-b border-border">
        <div className="container py-12 md:py-16">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            {/* Hero Content */}
            <div className="lg:col-span-7">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary sm:text-sm">
                <GraduationCap size={16} />
                Learn Better, Grow Faster
              </div>

              <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
                Find the Right Tutor for Your
                <span className="brand-text-gradient"> Future.</span>
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
                Find experienced tutors, explore tuition opportunities, and get
                personalized guidance to achieve your learning goals.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/tuitions"
                  className="brand-gradient inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold text-white transition hover:opacity-90"
                >
                  Find a Tuition
                  <ArrowRight size={16} />
                </Link>

                <Link
                  href="/sign-up"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-card px-5 text-sm font-bold text-foreground transition hover:bg-accent"
                >
                  Join as a Tutor
                </Link>
              </div>

              {/* Benefits */}
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
                {benefits.map((benefit) => (
                  <div
                    key={benefit}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <CheckCircle2
                      size={16}
                      className="shrink-0 text-emerald-600 dark:text-emerald-400"
                    />
                    {benefit}
                  </div>
                ))}
              </div>
            </div>

            {/* Tutor Student Illustration */}
            <div className="lg:col-span-5">
              <MentorshipImage />
            </div>
          </div>

          {/* Search Card */}
          <div className="mt-10 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Search size={19} />
              </div>

              <div>
                <h2 className="text-lg font-bold sm:text-xl">
                  Find Your Perfect Tuition
                </h2>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  Search available tuition opportunities by subject, medium and
                  location.
                </p>
              </div>
            </div>

            <form
              onSubmit={handleSearch}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end"
            >
              {/* Subject */}
              <div>
                <label
                  htmlFor="subject"
                  className="mb-1.5 block text-xs font-semibold sm:text-sm"
                >
                  Subject or Skill
                </label>

                <div className="relative">
                  <BookOpen
                    size={17}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />

                  <select
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="h-11 w-full appearance-none rounded-xl border border-border bg-background pl-10 pr-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                  >
                    <option value="">All Subjects</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="English">English</option>
                    <option value="ICT">ICT</option>
                  </select>
                </div>
              </div>

              {/* Medium */}
              <div>
                <label
                  htmlFor="medium"
                  className="mb-1.5 block text-xs font-semibold sm:text-sm"
                >
                  Medium / Class
                </label>

                <div className="relative">
                  <GraduationCap
                    size={18}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />

                  <select
                    id="medium"
                    value={medium}
                    onChange={(e) => setMedium(e.target.value)}
                    className="h-11 w-full appearance-none rounded-xl border border-border bg-background pl-10 pr-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                  >
                    <option value="">Any Medium</option>
                    <option value="Bangla Medium">Bangla Medium</option>
                    <option value="English Version">English Version</option>
                    <option value="English Medium">English Medium</option>
                  </select>
                </div>
              </div>

              {/* Location */}
              <div>
                <label
                  htmlFor="location"
                  className="mb-1.5 block text-xs font-semibold sm:text-sm"
                >
                  Location
                </label>

                <div className="relative">
                  <MapPin
                    size={17}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />

                  <select
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="h-11 w-full appearance-none rounded-xl border border-border bg-background pl-10 pr-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                  >
                    <option value="">All Locations</option>
                    <option value="Online">Online</option>
                    <option value="Dhaka">Dhaka</option>
                    <option value="Bogura">Bogura</option>
                    <option value="Chattogram">Chattogram</option>
                    <option value="Rajshahi">Rajshahi</option>
                  </select>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="brand-gradient flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-white transition hover:opacity-90"
              >
                <Search size={17} />
                Search Tuitions
              </button>
            </form>

            <p className="mt-3 text-xs text-muted-foreground">
              Find the right learning opportunity for you.
            </p>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="container py-10">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-border bg-card p-5 text-center transition hover:border-primary/40"
            >
              <h3 className="text-2xl font-extrabold text-primary sm:text-3xl">
                {item.value}
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Join Community */}
      <section className="container pb-14">
        <div className="flex flex-col items-center justify-between gap-5 rounded-2xl bg-primary/5 p-6 sm:p-8 md:flex-row">
          <div>
            <div className="mb-1.5 flex items-center gap-2 text-primary">
              <Users size={18} />
              <span className="text-sm font-semibold">
                Join Our Learning Community
              </span>
            </div>

            <h2 className="text-xl font-bold sm:text-2xl">Are You a Tutor?</h2>

            <p className="mt-1.5 max-w-lg text-sm leading-6 text-muted-foreground">
              Create your account, post tuition opportunities and connect with
              students.
            </p>
          </div>

          <Link
            href="/sign-up"
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:opacity-90"
          >
            Join as a Tutor
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
