"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useSession } from "@/lib/auth-client";
import { getDashboardPath } from "@/lib/dashboard";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const { data: session, isPending } = useSession();

  const user = session?.user as
    | {
        role?: string;
      }
    | undefined;

  const role = user?.role;
  const dashboardPath = getDashboardPath(role);

  const isProfilePage = pathname === "/dashboard/profile";
  const isRoleDashboard =
    pathname === "/dashboard/student" ||
    pathname === "/dashboard/tutor" ||
    pathname === "/dashboard/admin";

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      router.replace("/sign-in");
      return;
    }

    if (pathname === "/dashboard") {
      router.replace(dashboardPath);
      return;
    }

    if (isRoleDashboard && pathname !== dashboardPath) {
      router.replace(dashboardPath);
    }
  }, [isPending, session, pathname, dashboardPath, isRoleDashboard, router]);

  if (
    isPending ||
    !session?.user ||
    (!isProfilePage && (!isRoleDashboard || pathname !== dashboardPath))
  ) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return <>{children}</>;
}
