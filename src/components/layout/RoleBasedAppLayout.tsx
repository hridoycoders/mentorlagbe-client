"use client";

import type { ReactNode } from "react";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";

import { useSession } from "@/lib/auth-client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import StudentLayout from "@/components/dashboard-layouts/StudentLayout";
import TutorLayout from "@/components/dashboard-layouts/TutorLayout";
import AdminLayout from "@/components/dashboard-layouts/AdminLayout";

interface RoleBasedAppLayoutProps {
  children: ReactNode;
}

export default function RoleBasedAppLayout({
  children,
}: RoleBasedAppLayoutProps) {
  const pathname = usePathname();
  const { data: session, isPending } = useSession();

  const isDashboardRoute = pathname.startsWith("/dashboard");

  // Dashboard routes: wait for authentication state
  if (isDashboardRoute && isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-primary" size={32} />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const user = session?.user as
    | {
        role?: string;
      }
    | undefined;

  const role = user?.role?.toLowerCase();

  // Student dashboard layout
  if (isDashboardRoute && role === "student") {
    return <StudentLayout>{children}</StudentLayout>;
  }

  // Tutor dashboard layout
  if (isDashboardRoute && role === "tutor") {
    return <TutorLayout>{children}</TutorLayout>;
  }

  // Admin dashboard layout
  if (isDashboardRoute && role === "admin") {
    return <AdminLayout>{children}</AdminLayout>;
  }

  // Public website layout for every other route
  return (
    <div className="flex min-h-screen flex-col">
      <Suspense
        fallback={
          <div className="h-17 w-full animate-pulse border-b border-border bg-background" />
        }
      >
        <Navbar />
      </Suspense>

      <main className="flex-1">{children}</main>

      <Footer />
    </div>
  );
}
