
export const routes = {

  // ADMIN ONLY ROUTES

  '/admin/products': 'admin',
  '/admin/orders': 'admin',
  '/admin/customers': 'admin',
  '/admin/addproducts': 'admin',


  // AUTHENTICATED USER ROUTES (User Only)
  '/': 'user',
  '/cart': 'user',
  '/checkout': 'user',
  '/auth': 'user',
  '/products': 'user',

  // PUBLIC/GUEST ROUTES 
  '/': 'guest',
  '/cart': 'guest',
  '/checkout': 'guest',
  '/auth': 'guest',
  '/products': 'guest',

};

/**
 * Get the required role for a route
 * @param {string} pathname 
 * @returns {string|null} - The required role or null if route not found
 */
export function getRequiredRole(pathname) {
  // Exact match first
  if (routes[pathname]) {
    return routes[pathname];
  }

  // Check for dynamic routes (e.g., '/products/123')
  // Match parent route if dynamic segment exists
  const pathSegments = pathname.split('/').filter(Boolean);
  if (pathSegments.length > 0) {
    const parentPath = '/' + pathSegments[0];
    if (routes[parentPath]) {
      return routes[parentPath];
    }
  }

  // Default: if route not in config, allow guest access
  return 'guest';
}

/**
 * Check if a user role can access a route
 * @param {string} userRole - The user's role 
 * @param {string} pathname - The route path
 * @returns {boolean} - True if access is allowed
 */
export function canAccess(userRole, pathname) {
  const requiredRole = getRequiredRole(pathname);

  // Guest routes: everyone can access
  if (requiredRole === 'guest') {
    return true;
  }

  // No user role but route requires authentication
  if (!userRole && requiredRole !== 'guest') {
    return false;
  }

  // Admin can access everything
  if (userRole === 'admin') {
    return true;
  }

  // User role can access 'user' routes
  if (userRole === 'user' && requiredRole === 'user') {
    return true;
  }

  // User cannot access admin routes
  if (userRole === 'user' && requiredRole === 'admin') {
    return false;
  }

  return false;
}
