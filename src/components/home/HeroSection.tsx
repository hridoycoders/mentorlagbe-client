import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  MapPin,
  MonitorPlay,
  Sparkles,
} from "lucide-react";

const features = [
  "Subject-wise Tuition",
  "Online & Home Learning",
  "Personalized Mentorship",
];

export default function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden border-b border-border bg-background">
      {/* Background Decorations */}
      <div className="pointer-events-none absolute -right-40 -top-40 -z-10 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[110px]" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 -z-10 h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-[100px]" />

      <div className="container py-16 sm:py-20 lg:py-24">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-12">
          {/* Left Content */}
          <div className="relative z-10 max-w-2xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-xs font-bold text-primary sm:text-sm">
              <Sparkles size={16} />
              Welcome to MentorLagbe
            </div>

            <h1 className="text-4xl font-extrabold leading-[1.15] tracking-tight sm:text-5xl lg:text-6xl xl:text-[68px]">
              Find Your Ideal
              <br />
              Tutor or
              <br />
              <span className="brand-text-gradient">Mentorship Today.</span>
            </h1>

            <p className="mt-6 max-w-xl text-sm leading-8 text-muted-foreground sm:text-base">
              Your learning journey deserves the right guidance. Explore
              subject-wise tuition opportunities, connect with tutors, and
              discover a smarter way to achieve your academic goals.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/tuitions"
                className="brand-gradient group inline-flex h-12 items-center justify-center gap-3 rounded-xl px-6 text-sm font-bold text-white shadow-lg shadow-primary/20 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                Explore Tuitions
                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>

              <Link
                href="/sign-up"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 text-sm font-bold text-foreground transition duration-300 hover:-translate-y-1 hover:border-primary/50 hover:bg-accent"
              >
                <GraduationCap size={18} />
                Join as a Tutor
              </Link>
            </div>

            {/* Platform Features */}
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-6">
              {features.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <CheckCircle2
                    size={16}
                    className="shrink-0 text-emerald-500"
                  />
                  {feature}
                </div>
              ))}
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative mx-auto w-full max-w-xl lg:ml-auto">
            {/* Main Image */}
            <div className="relative aspect-[4/4.2] overflow-hidden rounded-[2rem] border border-border bg-muted shadow-2xl shadow-primary/10 sm:aspect-[4/3.8]">
              <Image
                src="/images/mentorship-hero.webp"
                alt="A tutor helping a student with learning"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-transparent" />

              <div className="absolute bottom-7 left-6 right-6 text-white sm:left-8 sm:right-8">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                  Learn. Grow. Succeed.
                </p>
                <h2 className="mt-2 max-w-sm text-2xl font-bold leading-tight sm:text-3xl">
                  The Right Guidance Makes All the Difference.
                </h2>
              </div>
            </div>

            {/* Floating Card - Online Learning */}
            <div className="absolute -left-3 top-8 flex items-center gap-3 rounded-2xl border border-border bg-card/95 p-3 shadow-xl backdrop-blur-md sm:-left-8 sm:p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <MonitorPlay size={22} />
              </div>
              <div>
                <p className="text-sm font-bold">Flexible Learning</p>
                <p className="text-xs text-muted-foreground">
                  Online & Offline
                </p>
              </div>
            </div>

            {/* Floating Card - Tuition */}
            <div className="absolute -bottom-6 right-3 flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-xl sm:-right-6 sm:p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <BookOpen size={22} />
              </div>
              <div>
                <p className="text-sm font-bold">Find Your Tuition</p>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin size={13} />
                  Explore Opportunities
                </div>
              </div>
            </div>

            {/* Decorative Shape */}
            <div className="absolute -right-3 -top-5 -z-10 h-24 w-24 rounded-3xl border-2 border-dashed border-primary/30 sm:-right-5 sm:-top-7 sm:h-32 sm:w-32" />
          </div>
        </div>
      </div>
    </section>
  );
}
