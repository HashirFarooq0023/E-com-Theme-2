'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { canAccess } from '@/config/routes';

/**
 * Custom hook to check route access for client components
 * Automatically redirects if access is denied
 * 
 * @returns {object} - { user, loading, allowed }
 */
export function useRouteAccess() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    async function checkAccess() {
      try {
        // Fetch session
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        
        const currentUser = data.user || null;
        const userRole = currentUser?.role || null;
        
        // Check if user can access this route
        const hasAccess = canAccess(userRole, pathname);
        
        setUser(currentUser);
        setAllowed(hasAccess);
        
        // Redirect if access denied
        if (!hasAccess) {
          router.push('/');
          return;
        }
        
      } catch (error) {
        console.error('Access check failed:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    }

    checkAccess();
  }, [pathname, router]);

  return { user, loading, allowed };
}
