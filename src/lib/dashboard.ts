export type UserRole = "student" | "tutor" | "admin";

export function getDashboardPath(role?: string): string {
  switch (role) {
    case "admin":
      return "/dashboard/admin";

    case "tutor":
      return "/dashboard/tutor";

    case "student":
    default:
      return "/dashboard/student";
  }
}
