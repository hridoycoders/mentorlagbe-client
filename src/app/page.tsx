import Link from "next/link";
import HeroSection from "@/components/home/HeroSection";
import FeaturedTuitions from "@/components/home/FeaturedTuitions";
import TuitionCategories from "@/components/home/TuitionCategories";
import { ArrowRight, Users } from "lucide-react";
import PricingSection from "@/components/home/PricingSection";
import HowItWorks from "@/components/home/HowItWorks";

const stats = [
  { value: "500+", label: "Expert Tutors" },
  { value: "2K+", label: "Happy Students" },
  { value: "4.9/5", label: "User Rating" },
];

export default function Home() {
  return (
    <div className="bg-background text-foreground">
      <HeroSection />

      <FeaturedTuitions />

      <TuitionCategories />
      <HowItWorks />

      <PricingSection />

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
