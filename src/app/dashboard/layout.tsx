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
  const isDashboardRoot = pathname === "/dashboard";

  const isAllowedDashboardPath =
    pathname === dashboardPath || pathname.startsWith(`${dashboardPath}/`);

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      router.replace("/sign-in");
      return;
    }

    if (isDashboardRoot) {
      router.replace(dashboardPath);
      return;
    }

    if (!isProfilePage && !isAllowedDashboardPath) {
      router.replace(dashboardPath);
    }
  }, [
    isPending,
    session,
    isDashboardRoot,
    isProfilePage,
    isAllowedDashboardPath,
    dashboardPath,
    router,
  ]);

  if (
    isPending ||
    !session?.user ||
    (!isProfilePage && !isAllowedDashboardPath)
  ) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-primary" size={32} />
          <p className="text-sm text-muted-foreground">
            Verifying your dashboard access...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
