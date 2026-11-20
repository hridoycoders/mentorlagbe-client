import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  GraduationCap,
  Search,
  UserPlus,
} from "lucide-react";

const studentSteps = [
  {
    number: "01",
    title: "Create Your Account",
    description:
      "Sign up as a student and complete your basic profile information.",
    icon: UserPlus,
  },
  {
    number: "02",
    title: "Find a Tuition",
    description:
      "Browse available tuition opportunities and find the right match.",
    icon: Search,
  },
  {
    number: "03",
    title: "Apply for Tuition",
    description:
      "Submit your application and track its status from your dashboard.",
    icon: ClipboardList,
  },
];

const tutorSteps = [
  {
    number: "01",
    title: "Join as a Tutor",
    description:
      "Create your tutor account and showcase your teaching experience.",
    icon: UserPlus,
  },
  {
    number: "02",
    title: "Post a Tuition",
    description:
      "Create tuition listings with subject, location, schedule and fee.",
    icon: ClipboardList,
  },
  {
    number: "03",
    title: "Connect with Students",
    description:
      "Review applications and choose suitable students for your tuition.",
    icon: GraduationCap,
  },
];

export default function HowItWorks() {
  return (
    <section className="border-y border-border bg-muted/30">
      <div className="container py-8 sm:py-11 lg:py-14">
        {/* Section Heading */}
        <div className="mx-auto mb-6 max-w-2xl text-center sm:mb-8 lg:mb-10">
          <p className="mb-1.5 text-[10px] font-semibold tracking-wider text-primary sm:mb-2 sm:text-xs">
            SIMPLE STEPS TO GET STARTED
          </p>

          <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl lg:text-3xl">
            How MentorLagbe Works
          </h2>

          <p className="mx-auto mt-2 max-w-xl text-xs leading-5 text-muted-foreground sm:mt-2.5 sm:text-sm sm:leading-6">
            A simple platform that connects students with the right tutors.
            Start your journey in just three easy steps.
          </p>
        </div>

        {/* Student and Tutor Steps */}
        <div className="grid grid-cols-1 gap-3.5 sm:gap-5 lg:grid-cols-2 lg:gap-6">
          {/* Student */}
          <div className="flex min-w-0 flex-col rounded-xl border border-border bg-card p-3.5 sm:rounded-2xl sm:p-5 lg:p-6">
            <div className="mb-4 flex items-center gap-2.5 sm:mb-5 sm:gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:h-11 sm:w-11 sm:rounded-xl">
                <GraduationCap size={20} className="sm:hidden" />
                <GraduationCap size={23} className="hidden sm:block" />
              </div>

              <div className="min-w-0">
                <h3 className="text-base font-bold sm:text-lg">For Students</h3>
                <p className="text-[11px] leading-4 text-muted-foreground sm:text-xs">
                  Find the perfect tutor for your needs.
                </p>
              </div>
            </div>

            <div className="space-y-3.5 sm:space-y-5">
              {studentSteps.map((step, index) => {
                const Icon = step.icon;

                return (
                  <div key={step.number} className="flex gap-3 sm:gap-3.5">
                    <div className="flex shrink-0 flex-col items-center">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary sm:h-10 sm:w-10 sm:rounded-xl">
                        <Icon size={18} />
                      </div>

                      {index !== studentSteps.length - 1 && (
                        <div className="mt-1.5 h-5 w-px bg-border sm:mt-2 sm:h-7" />
                      )}
                    </div>

                    <div className="min-w-0 pb-1">
                      <span className="text-[10px] font-bold tracking-wide text-primary sm:text-xs">
                        STEP {step.number}
                      </span>

                      <h4 className="mt-0.5 text-sm font-bold sm:mt-1 sm:text-base">
                        {step.title}
                      </h4>

                      <p className="mt-0.5 text-xs leading-5 text-muted-foreground sm:mt-1 sm:text-sm sm:leading-6">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <Link
              href="/sign-up"
              className="mt-4 inline-flex h-9 w-fit items-center gap-1.5 rounded-lg bg-primary px-3.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90 sm:mt-5 sm:h-10 sm:gap-2 sm:px-4 sm:text-sm"
            >
              Join as Student
              <ArrowRight size={15} />
            </Link>
          </div>

          {/* Tutor */}
          <div className="flex min-w-0 flex-col rounded-xl border border-border bg-card p-3.5 sm:rounded-2xl sm:p-5 lg:p-6">
            <div className="mb-4 flex items-center gap-2.5 sm:mb-5 sm:gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 sm:h-11 sm:w-11 sm:rounded-xl">
                <UserPlus size={19} />
              </div>

              <div className="min-w-0">
                <h3 className="text-base font-bold sm:text-lg">For Tutors</h3>
                <p className="text-[11px] leading-4 text-muted-foreground sm:text-xs">
                  Share your knowledge and grow your career.
                </p>
              </div>
            </div>

            <div className="space-y-3.5 sm:space-y-5">
              {tutorSteps.map((step, index) => {
                const Icon = step.icon;

                return (
                  <div key={step.number} className="flex gap-3 sm:gap-3.5">
                    <div className="flex shrink-0 flex-col items-center">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 sm:h-10 sm:w-10 sm:rounded-xl">
                        <Icon size={18} />
                      </div>

                      {index !== tutorSteps.length - 1 && (
                        <div className="mt-1.5 h-5 w-px bg-border sm:mt-2 sm:h-7" />
                      )}
                    </div>

                    <div className="min-w-0 pb-1">
                      <span className="text-[10px] font-bold tracking-wide text-emerald-600 dark:text-emerald-400 sm:text-xs">
                        STEP {step.number}
                      </span>

                      <h4 className="mt-0.5 text-sm font-bold sm:mt-1 sm:text-base">
                        {step.title}
                      </h4>

                      <p className="mt-0.5 text-xs leading-5 text-muted-foreground sm:mt-1 sm:text-sm sm:leading-6">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <Link
              href="/sign-up"
              className="mt-4 inline-flex h-9 w-fit items-center gap-1.5 rounded-lg border border-border bg-background px-3.5 text-xs font-semibold text-foreground transition hover:border-primary hover:text-primary sm:mt-5 sm:h-10 sm:gap-2 sm:px-4 sm:text-sm"
            >
              Join as Tutor
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
