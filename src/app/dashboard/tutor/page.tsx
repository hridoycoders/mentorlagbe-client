import { BookOpen } from "lucide-react";

export default function TutorDashboardPage() {
  return (
    <div className="container py-10">
      <div className="flex items-center gap-3">
        <BookOpen className="text-primary" size={32} />
        <div>
          <h1 className="text-2xl font-bold">Tutor Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your tutor dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
