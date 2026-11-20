import { ShieldCheck } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div className="container py-10">
      <div className="flex items-center gap-3">
        <ShieldCheck className="text-primary" size={32} />
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your admin dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
