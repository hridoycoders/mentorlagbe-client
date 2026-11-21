"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  LayoutDashboard,
  Search,
  ClipboardList,
  UserRound,
  LogOut,
  Menu,
  X,
  Home,
  ChevronRight,
  BookOpen,
} from "lucide-react";

import { signOut, useSession } from "@/lib/auth-client";

const navigation = [
  {
    label: "Overview",
    href: "/dashboard/student",
    icon: LayoutDashboard,
  },
  {
    label: "Find Tuitions",
    href: "/tuitions",
    icon: Search,
  },
];

function StudentSidebar({
  pathname,
  userName,
  userEmail,
  onNavigate,
  onLogout,
  mobile = false,
}: {
  pathname: string;
  userName: string;
  userEmail: string;
  onNavigate?: () => void;
  onLogout: () => void;
  mobile?: boolean;
}) {
  return (
    <div className="flex h-full flex-col bg-card">
      {/* Brand */}
      <div className="flex h-20 items-center justify-between border-b border-border px-5">
        <Link href="/" onClick={onNavigate} className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <GraduationCap size={25} />
          </div>

          <div>
            <h2 className="text-lg font-bold tracking-tight">
              Mentor<span className="text-primary">Lagbe</span>
            </h2>
            <p className="text-xs text-muted-foreground">Student Portal</p>
          </div>
        </Link>

        {mobile && (
          <button
            type="button"
            onClick={onNavigate}
            aria-label="Close sidebar"
            className="rounded-lg p-2 transition hover:bg-muted"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Student Profile */}
      <div className="border-b border-border p-5">
        <div className="rounded-xl bg-primary/5 p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <GraduationCap size={23} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{userName}</p>
              <p className="truncate text-xs text-muted-foreground">
                {userEmail}
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 rounded-lg bg-background px-3 py-2">
            <span className="size-2 rounded-full bg-green-500" />
            <span className="text-xs font-medium text-muted-foreground">
              Student Account
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 overflow-y-auto p-4">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Student Menu
        </p>

        {navigation.map((item) => {
          const Icon = item.icon;

          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center justify-between rounded-xl px-3 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon size={19} />
                {item.label}
              </span>

              {isActive && <ChevronRight size={16} />}
            </Link>
          );
        })}

        <div className="my-5 border-t border-border" />

        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Coming Soon
        </p>

        <div className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-3 text-sm text-muted-foreground/60">
          <ClipboardList size={19} />
          My Applications
          <span className="ml-auto text-[10px]">Soon</span>
        </div>

        <div className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-3 text-sm text-muted-foreground/60">
          <BookOpen size={19} />
          My Borrows
          <span className="ml-auto text-[10px]">Soon</span>
        </div>

        <div className="my-5 border-t border-border" />

        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <Home size={19} />
          Back to Website
        </Link>
      </nav>

      {/* Logout */}
      <div className="border-t border-border p-4">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-500 transition hover:bg-red-500/10"
        >
          <LogOut size={19} />
          Sign Out
        </button>

        <p className="mt-3 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} MentorLagbe
        </p>
      </div>
    </div>
  );
}

export default function StudentDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const { data: session } = useSession();

  const user = session?.user as
    | {
        name?: string;
        email?: string;
      }
    | undefined;

  const userName = user?.name || "Student";
  const userEmail = user?.email || "";

  const handleLogout = async () => {
    if (loggingOut) return;

    try {
      setLoggingOut(true);
      await signOut();
      window.location.href = "/sign-in";
    } catch (error) {
      console.error("Student logout failed:", error);
      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-border lg:block">
          <StudentSidebar
            pathname={pathname}
            userName={userName}
            userEmail={userEmail}
            onLogout={handleLogout}
          />
        </aside>

        {/* Mobile Sidebar */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="Close sidebar overlay"
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            <aside className="relative z-10 h-full w-[min(300px,85vw)] border-r border-border shadow-2xl">
              <StudentSidebar
                pathname={pathname}
                userName={userName}
                userEmail={userEmail}
                onNavigate={() => setMobileOpen(false)}
                onLogout={handleLogout}
                mobile
              />
            </aside>
          </div>
        )}

        {/* Main Content */}
        <div className="flex min-w-0 flex-1 flex-col lg:pl-72">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-md sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="Open student menu"
                className="rounded-lg border border-border p-2 transition hover:bg-muted lg:hidden"
              >
                <Menu size={20} />
              </button>

              <div>
                <p className="text-sm font-semibold">Student Dashboard</p>
                <p className="hidden text-xs text-muted-foreground sm:block">
                  Manage your learning journey
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="hidden items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium transition hover:bg-muted sm:flex"
              >
                <Home size={16} />
                Website
              </Link>

              <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {userName.charAt(0).toUpperCase()}
              </div>
            </div>
          </header>

          <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>

      {loggingOut && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/70 backdrop-blur-sm">
          <div className="rounded-xl border border-border bg-card px-6 py-4 text-sm font-medium shadow-lg">
            Signing out...
          </div>
        </div>
      )}
    </div>
  );
}
