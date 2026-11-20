"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Menu,
  X,
  Sun,
  Moon,
  GraduationCap,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  UserRound,
} from "lucide-react";

import { authClient, signOut } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Browse Tuitions", href: "/tuitions" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Pricing / Pro Plans", href: "/pricing" },
];

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  return (
    <button
      type="button"
      disabled={!mounted}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-foreground transition hover:bg-accent"
    >
      {!mounted || resolvedTheme !== "dark" ? (
        <Moon size={18} className="shrink-0 text-foreground" />
      ) : (
        <Sun size={18} className="shrink-0 text-foreground" />
      )}
    </button>
  );
}

function Brand() {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2.5">
      <div className="brand-gradient flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-md">
        <GraduationCap size={24} className="shrink-0 text-white" />
      </div>
      <span className="text-xl font-extrabold tracking-tight text-foreground">
        Mentor<span className="brand-text-gradient">Lagbe</span>
      </span>
    </Link>
  );
}

function NavLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
        active
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      }`}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center justify-between rounded-xl px-4 py-3 text-base font-semibold transition ${
        active
          ? "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400"
          : "text-foreground hover:bg-accent"
      }`}
    >
      <span>{children}</span>
      {active && (
        <span className="h-2 w-2 rounded-full bg-emerald-600 dark:bg-emerald-400" />
      )}
    </Link>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();

  const user = session?.user as
    | {
        id: string;
        name: string;
        email: string;
        image?: string | null;
        role?: string;
      }
    | undefined;

  const role = user?.role || "student";

  const dashboardHref =
    role === "admin"
      ? "/dashboard/admin"
      : role === "tutor"
        ? "/dashboard/tutor"
        : "/dashboard/student";

  async function handleLogout() {
    try {
      await signOut();
      setMobileOpen(false);
      setProfileOpen(false);
      router.push("/sign-in");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-xl">
      <div className="container">
        <div className="flex h-17 items-center justify-between gap-3">
          <Brand />

          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <NavLink key={link.href} href={link.href}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <ThemeToggle />

            {isPending ? (
              <div className="h-10 w-24 animate-pulse rounded-lg bg-muted" />
            ) : user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 rounded-xl border border-border bg-card p-1.5 pr-3 text-foreground transition hover:bg-accent"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.image || ""} />
                    <AvatarFallback>
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="max-w-28 truncate text-sm font-semibold">
                      {user.name}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wide text-primary">
                      {role}
                    </span>
                  </div>
                  <ChevronDown size={15} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-14 w-56 rounded-xl border border-border bg-card p-2 text-foreground shadow-xl">
                    <Link
                      href={dashboardHref}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-accent"
                    >
                      <LayoutDashboard size={17} />
                      Dashboard
                    </Link>

                    <Link
                      href="/dashboard/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-accent"
                    >
                      <UserRound size={17} />
                      My Profile
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-red-500 hover:bg-red-500/10"
                    >
                      <LogOut size={17} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-accent"
                >
                  Login
                </Link>
                <Link
                  href="/sign-up"
                  className="brand-gradient rounded-lg px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Controls Only */}
          <div className="flex shrink-0 items-center gap-2 lg:hidden">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Toggle navigation"
              aria-expanded={mobileOpen}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-foreground transition hover:bg-accent"
            >
              {mobileOpen ? (
                <X
                  size={20}
                  strokeWidth={2.25}
                  className="shrink-0 text-foreground"
                />
              ) : (
                <Menu
                  size={20}
                  strokeWidth={2.25}
                  className="shrink-0 text-foreground"
                />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Drawer / Sheet Menu Only */}
        {mobileOpen && (
          <div className="border-t border-border py-4 lg:hidden">
            <nav className="flex flex-col gap-1.5">
              {navLinks.map((link) => (
                <MobileNavLink
                  key={link.href}
                  href={link.href}
                  onClick={closeMobile}
                >
                  {link.label}
                </MobileNavLink>
              ))}
            </nav>

            <div className="mt-4 pt-1">
              {isPending ? (
                <div className="h-24 animate-pulse rounded-2xl bg-muted" />
              ) : user ? (
                <div className="rounded-2xl border border-border bg-card p-3.5 shadow-xs">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-11 w-11 rounded-xl border border-emerald-500/40">
                      <AvatarImage src={user.image || ""} />
                      <AvatarFallback className="rounded-xl font-bold">
                        {user.name?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-bold text-foreground">
                          {user.name}
                        </p>
                        <span className="shrink-0 rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                          {role}
                        </span>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Link
                      href={dashboardHref}
                      onClick={closeMobile}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-accent"
                    >
                      <LayoutDashboard size={14} />
                      Dashboard
                    </Link>

                    <Link
                      href="/dashboard/profile"
                      onClick={closeMobile}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-accent"
                    >
                      <UserRound size={14} />
                      Profile
                    </Link>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold text-red-500 transition hover:bg-red-500/10"
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  <Link
                    href="/sign-up"
                    onClick={closeMobile}
                    className="brand-gradient flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:opacity-95"
                  >
                    Get Started
                  </Link>
                  <Link
                    href="/sign-in"
                    onClick={closeMobile}
                    className="flex w-full items-center justify-center rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-accent"
                  >
                    Login
                  </Link>
                </div>
              )}

              <p className="mt-4 text-center text-[11px] text-muted-foreground">
                MentorLagbe Bangladesh
              </p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
