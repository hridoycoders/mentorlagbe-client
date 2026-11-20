"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useSession } from "@/lib/auth-client";
import { getDashboardPath } from "@/lib/dashboard";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      router.replace("/sign-in");
      return;
    }

    const user = session.user as { role?: string };

    router.replace(getDashboardPath(user.role));
  }, [session, isPending, router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={32} />
    </div>
  );
}
