import Link from "next/link";
import {
  Atom,
  Calculator,
  Code2,
  FlaskConical,
  Languages,
  Monitor,
  Palette,
  ArrowRight,
} from "lucide-react";

const categories = [
  {
    name: "Mathematics",
    description: "Math and problem solving",
    icon: Calculator,
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    hover: "group-hover:bg-blue-500 group-hover:text-white",
  },
  {
    name: "Science",
    description: "Explore scientific knowledge",
    icon: Atom,
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    hover: "group-hover:bg-emerald-500 group-hover:text-white",
  },
  {
    name: "Physics",
    description: "Understand the world of physics",
    icon: FlaskConical,
    color: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    hover: "group-hover:bg-violet-500 group-hover:text-white",
  },
  {
    name: "English",
    description: "Improve English skills",
    icon: Languages,
    color: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    hover: "group-hover:bg-orange-500 group-hover:text-white",
  },
  {
    name: "ICT",
    description: "Technology and computing",
    icon: Monitor,
    color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
    hover: "group-hover:bg-cyan-500 group-hover:text-white",
  },
  {
    name: "Programming",
    description: "Learn coding and development",
    icon: Code2,
    color: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
    hover: "group-hover:bg-pink-500 group-hover:text-white",
  },
  {
    name: "Chemistry",
    description: "Discover chemical science",
    icon: FlaskConical,
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    hover: "group-hover:bg-amber-500 group-hover:text-white",
  },
  {
    name: "Others",
    description: "Explore more subjects",
    icon: Palette,
    color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    hover: "group-hover:bg-indigo-500 group-hover:text-white",
  },
];

export default function TuitionCategories() {
  return (
    <section className="container py-12 sm:py-16">
      {/* Section Heading */}
      <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-bold tracking-wider text-primary sm:text-sm">
            FIND YOUR SUBJECT
          </p>

          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Browse by <span className="brand-text-gradient">Category</span>
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Explore tuition opportunities based on your favorite subjects.
          </p>
        </div>

        <Link
          href="/tuitions"
          className="group inline-flex items-center gap-2 text-sm font-bold text-primary"
        >
          Explore All
          <ArrowRight
            size={16}
            className="transition-transform group-hover:translate-x-1"
          />
        </Link>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {categories.map((category) => {
          const Icon = category.icon;

          return (
            <Link
              key={category.name}
              href={`/tuitions?subject=${encodeURIComponent(category.name)}`}
              className="group flex min-h-[145px] flex-col rounded-2xl border border-border bg-card p-3.5 transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg sm:min-h-[160px] sm:p-5"
            >
              <div
                className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl transition duration-300 sm:mb-4 sm:h-12 sm:w-12 ${category.color} ${category.hover}`}
              >
                <Icon size={21} className="sm:hidden" />
                <Icon size={24} className="hidden sm:block" />
              </div>

              <div className="mt-auto">
                <h3 className="text-sm font-bold transition-colors group-hover:text-primary sm:text-base">
                  {category.name}
                </h3>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {category.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
