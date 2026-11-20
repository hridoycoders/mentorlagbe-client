import { GraduationCap } from "lucide-react";

export default function StudentDashboardPage() {
  return (
    <div className="container py-10">
      <div className="flex items-center gap-3">
        <GraduationCap className="text-primary" size={32} />
        <div>
          <h1 className="text-2xl font-bold">Student Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your student dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
