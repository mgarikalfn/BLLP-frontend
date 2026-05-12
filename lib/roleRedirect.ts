/**
 * Determines the primary landing page for a user based on their role.
 */
export function getRedirectPath(role?: string): string {
  switch (role?.toUpperCase()) {
    case "ADMIN":
      return "/admin";
    case "EXPERT":
      return "/expert";
    case "LEARNER":
    default:
      return "/dashboard";
  }
}
