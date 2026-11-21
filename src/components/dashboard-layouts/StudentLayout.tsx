"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Bookmark,
  FileText,
  GraduationCap,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  X,
} from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";

interface StudentLayoutProps {
  children: ReactNode;
}

const navigation = [
  { label: "Overview", href: "/dashboard/student", icon: LayoutDashboard },
  {
    label: "My Applications",
    href: "/dashboard/student/applications",
    icon: FileText,
  },
  {
    label: "Saved Tuitions",
    href: "/dashboard/student/saved-tuitions",
    icon: Bookmark,
  },
  { label: "Home", href: "/", icon: Home },
];

export default function StudentLayout({ children }: StudentLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const user = session?.user as
    | { name?: string; email?: string; plan?: string }
    | undefined;

  const name = user?.name || "Student";
  const email = user?.email || "";
  const initials =
    name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "ST";

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  const handleGoHome = () => {
    setMobileOpen(false);
    router.push("/");
  };

  const handleSignOut = async () => {
    setMobileOpen(false);
    await signOut();
    router.push("/sign-in");
    router.refresh();
  };

  const SidebarContent = () => (
    <>
      <div className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border px-4">
        <button
          type="button"
          onClick={handleGoHome}
          aria-label="Go to MentorLagbe homepage"
          className="group flex min-w-0 items-center gap-2.5 rounded-lg text-left outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground transition-transform group-hover:scale-105 sm:size-10">
            ML
          </div>
          <span className="truncate text-base font-bold tracking-tight text-foreground sm:text-lg">
            Mentor<span className="text-primary">Lagbe</span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="shrink-0 rounded-lg p-2 text-muted-foreground hover:bg-muted lg:hidden"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-4 sm:py-5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary sm:size-11">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="truncate text-sm font-semibold text-foreground">
              {name}
            </p>
            {user?.plan?.toLowerCase() === "pro" && (
              <span className="rounded-full bg-brand-amber/15 px-2 py-0.5 text-[10px] font-bold text-brand-amber">
                PRO
              </span>
            )}
          </div>
          <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
            <GraduationCap size={12} /> Student
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 sm:py-5">
        <p className="mb-2.5 px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Main Menu
        </p>
        <nav className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-xl border-r-2 px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? "border-primary bg-primary/10 font-medium text-primary"
                    : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon size={18} className="shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <p className="mb-2.5 mt-6 px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground sm:mt-7">
          Preferences
        </p>
        <Link
          href="/dashboard/profile"
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-3 rounded-xl border-r-2 px-3 py-2.5 text-sm transition-colors ${
            isActive("/dashboard/profile")
              ? "border-primary bg-primary/10 font-medium text-primary"
              : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Settings size={18} className="shrink-0" />
          <span className="truncate">Update Profile</span>
        </Link>
      </div>

      <div className="shrink-0 border-t border-border p-3">
        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          <LogOut size={18} className="shrink-0" />
          <span className="truncate">Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-muted/30 text-foreground">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[245px] flex-col border-r border-border bg-card lg:flex">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar overlay"
          />
          <aside className="relative flex h-full w-[275px] max-w-[85vw] flex-col border-r border-border bg-card shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="min-h-screen lg:pl-[245px]">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-2 border-b border-border bg-card/95 px-3 backdrop-blur sm:px-6">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="shrink-0 rounded-lg p-2 text-muted-foreground hover:bg-muted lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={21} />
            </button>
            <h1 className="truncate text-sm font-semibold text-foreground sm:text-base">
              Student Workspace
            </h1>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full border border-border p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary sm:size-9">
                {initials}
              </div>
              <div className="hidden sm:block">
                <p className="max-w-36 truncate text-xs font-semibold text-foreground">
                  {name}
                </p>
                <p className="max-w-36 truncate text-[11px] text-muted-foreground">
                  {email}
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1440px] px-3 py-5 sm:px-6 sm:py-7 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
