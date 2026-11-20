import Link from "next/link";
import { ArrowRight, Check, Crown, Sparkles, Users } from "lucide-react";

const plans = [
  {
    name: "Starter Plan",
    badge: "Free Forever",
    description:
      "Perfect for students and tutors looking to test the platform.",
    icon: Users,
    price: "$0",
    period: "/ month",
    subPrice: null,
    paymentNote: "No payment required",
    features: [
      { text: "Up to 2 tuition posts (Tutor)", bold: false },
      { text: "Up to 5 tuition bookmarks (Student)", bold: false },
      { text: "Direct tuition applications", bold: false },
      { text: "Basic profile & search filters", bold: false },
    ],
    buttonText: "Get Started Free",
    href: "/sign-up",
    popular: false,
  },
  {
    name: "Pro Plan",
    badge: "PRO Badge",
    description:
      "Unlimited reach, verified credential badges, and priority matching.",
    icon: Crown,
    price: "$15",
    period: "/mo for Tutors",
    subPrice: {
      price: "$10",
      period: "/mo for Students",
    },
    paymentNote: "Paid in USD through Stripe",
    features: [
      { text: "Unlimited tuition posts & bookmarks", bold: true },
      { text: "Golden PRO verification badge", bold: false },
      { text: "Priority listing in search & category filters", bold: false },
      { text: "Priority applicant notifications & reviews", bold: false },
    ],
    buttonText: "Upgrade to Pro",
    href: "/pricing",
    popular: true,
  },
];

export default function PricingSection() {
  return (
    <section className="container py-9 sm:py-12 lg:py-16">
      {/* Section Heading */}
      <div className="mx-auto mb-7 max-w-2xl text-center sm:mb-9 lg:mb-12">
        <p className="mb-1.5 text-xs font-semibold tracking-wide text-primary sm:mb-2 sm:text-sm">
          SIMPLE AND TRANSPARENT PRICING
        </p>

        <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          Choose Your Plan
        </h2>

        <p className="mx-auto mt-2 max-w-xl text-xs leading-6 text-muted-foreground sm:mt-3 sm:text-sm sm:leading-7">
          Simple, transparent plans designed for committed students and
          ambitious academic tutors.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="mx-auto grid max-w-4xl grid-cols-1 items-stretch gap-4 sm:gap-5 md:grid-cols-2 lg:gap-6">
        {plans.map((plan) => {
          const Icon = plan.icon;

          return (
            <article
              key={plan.name}
              className={`relative flex min-w-0 flex-col rounded-xl border p-4 transition duration-200 hover:-translate-y-1 hover:shadow-lg sm:rounded-2xl sm:p-6 lg:p-8 ${
                plan.popular
                  ? "border-primary bg-primary/5 shadow-sm sm:shadow-md"
                  : "border-border bg-card"
              }`}
            >
              {/* Recommended Badge */}
              {plan.popular && (
                <span className="absolute -top-3 right-4 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground shadow-sm sm:right-6 sm:text-xs">
                  <Sparkles size={12} />
                  Recommended
                </span>
              )}

              {/* Plan Header */}
              <div className="mb-4 sm:mb-5 lg:mb-6">
                <div className="mb-3 flex items-center justify-between gap-2 sm:mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary sm:h-11 sm:w-11 sm:rounded-xl">
                    <Icon size={21} />
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold sm:px-3 sm:text-xs ${
                      plan.popular
                        ? "border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {plan.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold sm:text-xl">{plan.name}</h3>

                <p className="mt-1 text-xs leading-5 text-muted-foreground sm:mt-1.5 sm:text-sm sm:leading-6">
                  {plan.description}
                </p>
              </div>

              {/* Price Section */}
              <div className="mb-4 border-b border-border pb-4 sm:mb-5 sm:pb-5 lg:mb-6 lg:pb-6">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-2 sm:gap-x-3">
                  <div className="flex items-baseline gap-1.5">
                    <span
                      className={`text-3xl font-extrabold tracking-tight sm:text-4xl ${
                        plan.popular ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {plan.price}
                    </span>

                    <span className="text-[10px] text-muted-foreground sm:text-xs">
                      {plan.period}
                    </span>
                  </div>

                  {plan.subPrice && (
                    <>
                      <span className="text-[10px] font-medium text-muted-foreground sm:text-xs">
                        or
                      </span>

                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                          {plan.subPrice.price}
                        </span>

                        <span className="text-[10px] text-muted-foreground sm:text-xs">
                          {plan.subPrice.period}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <p className="mt-2 text-[10px] text-muted-foreground sm:text-xs sm:mt-2.5">
                  {plan.paymentNote}
                </p>
              </div>

              {/* Features */}
              <ul className="mb-5 flex-1 space-y-2.5 sm:mb-7 sm:space-y-3 lg:mb-8 lg:space-y-3.5">
                {plan.features.map((feature) => (
                  <li
                    key={feature.text}
                    className="flex items-start gap-2 text-xs leading-5 sm:gap-2.5 sm:text-sm sm:leading-6"
                  >
                    <Check
                      size={16}
                      className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                    />

                    <span
                      className={
                        feature.bold
                          ? "font-semibold text-foreground"
                          : "text-muted-foreground"
                      }
                    >
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={plan.href}
                className={`inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg px-3 text-xs font-semibold transition sm:h-11 sm:rounded-xl sm:px-4 sm:text-sm ${
                  plan.popular
                    ? "bg-primary text-primary-foreground hover:opacity-90"
                    : "border border-border bg-background text-foreground hover:border-primary hover:text-primary"
                }`}
              >
                {plan.buttonText}
                <ArrowRight size={15} />
              </Link>
            </article>
          );
        })}
      </div>

      {/* Bottom Note */}
      <p className="mt-5 text-center text-[10px] leading-5 text-muted-foreground sm:mt-7 sm:text-xs">
        Subscription prices are in USD. Monthly tuition fees are separate and
        displayed in BDT.
      </p>
    </section>
  );
}
