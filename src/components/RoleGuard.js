'use client';

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react"; // Loading spinner

export default function RoleGuard({ children, user, allowedRoles = [] }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // 1. Check if User is Logged In
    if (!user) {
      console.warn(`⛔ Access Denied: User not logged in. Redirecting to Sign In.`);
      // Redirect to login, but remember where they were trying to go
      router.replace(`/auth/sign-in?redirect=${pathname}`); 
      return;
    }

    // 2. Check if User has the Right Role
    // If allowedRoles is empty, we assume ANY logged-in user is allowed.
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      console.warn(`⛔ Access Denied: User role '${user.role}' is not in [${allowedRoles}]. Redirecting to Home.`);
      router.replace("/"); // Send unauthorized users to Home
      return;
    }

    // ✅ Access Granted
    setIsAuthorized(true);
  }, [user, allowedRoles, router, pathname]);

  // 3. Show a Loading Screen while checking (Prevents "flashing" restricted content)
  if (!isAuthorized) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: '#030305', 
        color: '#94a3b8' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={40} className="spin" style={{ marginBottom: '16px' }} />
          <p>Verifying Access...</p>
        </div>
      </div>
    );
  }

  // 4. Render the Screen if authorized
  return <>{children}</>;
}