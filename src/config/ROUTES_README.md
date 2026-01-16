# Route Access Control System

This system provides centralized role-based access control (RBAC) for your application.

## Files

- **`src/config/routes.js`** - Configuration file where you define route permissions
- **`src/lib/permissions.js`** - Server-side permission utilities
- **`src/hooks/useRouteAccess.js`** - Client-side React hook for permission checks

## How to Use

### 1. Adding/Removing Routes

Edit `src/config/routes.js` and modify the `routes` object:

```javascript
export const routes = {
  // Admin only
  '/admin/products': 'admin',
  '/admin/orders': 'admin',
  
  // Authenticated users (user + admin)
  '/cart': 'user',
  '/checkout': 'user',
  
  // Public/Guest routes
  '/': 'guest',
  '/auth': 'guest',
  '/products': 'guest',
};
```

### 2. Role Types

- **`'admin'`** - Only admin users can access
- **`'user'`** - Authenticated users (both admin and regular users) can access
- **`'guest'`** - Anyone can access (including unauthenticated users)

### 3. Using in Client Components

```javascript
'use client';

import { useRouteAccess } from '@/hooks/useRouteAccess';

export default function MyPage() {
  const { user, loading, allowed } = useRouteAccess();
  
  if (loading) return <div>Loading...</div>;
  if (!allowed) return null; // Will redirect automatically
  
  // Your page content here
  return <div>Protected content</div>;
}
```

### 4. Using in Server Components

```javascript
import { requireAccess } from '@/lib/permissions';

export default async function MyPage() {
  const { user, role } = await requireAccess('/admin/products');
  
  // Your page content here
  return <div>Protected content</div>;
}
```

## How It Works

1. When a user tries to access a route, the system checks their role from the session
2. It compares the user's role with the required role in the config
3. If access is denied, the user is automatically redirected to the home page (`/`)
4. Admin users can access all routes
5. Regular users can access 'user' and 'guest' routes
6. Guests can only access 'guest' routes

## Current Route Configuration

See `src/config/routes.js` for the complete list of configured routes.

## Notes

- Routes not in the config default to 'guest' (public access)
- Dynamic routes (e.g., `/products/123`) automatically check the parent route (`/products`)
- The system automatically redirects unauthorized users to prevent access
