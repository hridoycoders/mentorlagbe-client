import Link from "next/link";
import {
  Atom,
  Calculator,
  Code2,
  FlaskConical,
  Languages,
  Monitor,
  Palette,
  BookOpen,
  ArrowRight,
} from "lucide-react";

const categories = [
  {
    name: "Mathematics",
    description: "Math and problem solving",
    icon: Calculator,
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    name: "Science",
    description: "Explore scientific knowledge",
    icon: Atom,
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    name: "Physics",
    description: "Understand the world of physics",
    icon: FlaskConical,
    color: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
  {
    name: "English",
    description: "Improve English skills",
    icon: Languages,
    color: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  },
  {
    name: "ICT",
    description: "Technology and computing",
    icon: Monitor,
    color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  },
  {
    name: "Programming",
    description: "Learn coding and development",
    icon: Code2,
    color: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  },
  {
    name: "Chemistry",
    description: "Discover chemical science",
    icon: FlaskConical,
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  {
    name: "Others",
    description: "Explore more subjects",
    icon: Palette,
    color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  },
];

export default function TuitionCategories() {
  return (
    <section className="container py-14">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-sm font-semibold text-primary">
            FIND YOUR SUBJECT
          </p>

          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Browse by Category
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Explore tuition opportunities based on your favorite subjects.
          </p>
        </div>

        <Link
          href="/tuitions"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          Explore All
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((category) => {
          const Icon = category.icon;

          return (
            <Link
              key={category.name}
              href={`/tuitions?subject=${encodeURIComponent(category.name)}`}
              className="group rounded-2xl border border-border bg-card p-4 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-md sm:p-5"
            >
              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${category.color}`}
              >
                <Icon size={23} />
              </div>

              <h3 className="font-bold transition group-hover:text-primary">
                {category.name}
              </h3>

              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {category.description}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
