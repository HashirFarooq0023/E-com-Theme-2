import { getSession } from "./auth";
import { canAccess, getRequiredRole } from "@/config/routes";
import { redirect } from "next/navigation";

/**
 * Check if current user can access a route (Server-side)
 * Use this in Server Components or API routes
 * 
 * @param {string} pathname - The route path to check
 * @returns {Promise<{allowed: boolean, user: object|null, role: string|null}>}
 */
export async function checkRouteAccess(pathname) {
  const session = await getSession();
  const userRole = session?.role || null;
  const allowed = canAccess(userRole, pathname);

  return {
    allowed,
    user: session ? {
      id: session.userId,
      email: session.email,
      name: session.name,
      role: session.role
    } : null,
    role: userRole
  };
}

/**
 * Protect a server component/page
 * Redirects to home if access is denied
 * 
 * @param {string} pathname - The route path
 * @returns {Promise<object>} - User object if allowed, otherwise redirects
 */
export async function requireAccess(pathname) {
  const { allowed, user, role } = await checkRouteAccess(pathname);

  if (!allowed) {
    // Redirect to home page if access denied
    redirect('/');
  }

  return { user, role };
}

/**
 * Get redirect path based on user role
 * @param {string} userRole - User's role
 * @returns {string} - Redirect path
 */
export function getRedirectPath(userRole) {
  if (!userRole) {
    return '/auth'; // Guest -> Login page
  }
  if (userRole === 'admin') {
    return '/'; // Admin -> Home page
  }
  return '/'; // User -> Home page
}

