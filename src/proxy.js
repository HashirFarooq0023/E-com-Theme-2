import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Make sure this matches the secret in src/lib/auth.js
const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || "default-secret-key-change-this");

export async function proxy(req) {
    const { pathname } = req.nextUrl;

    // 🛡️ PROTECT ADMIN ROUTES
    // Matches /admin, /admin/dashboard, /api/admin/*
    if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {

        const sessionCookie = req.cookies.get('session');

        if (!sessionCookie) {
            // ❌ No Session -> Redirect to Auth
            const loginUrl = new URL('/auth', req.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }

        try {
            // 🕵️ Verify Token & Role
            const { payload } = await jwtVerify(sessionCookie.value, SECRET_KEY);

            if (payload.role !== 'admin') {
                // ⛔ Not an Admin -> Redirect Home
                console.warn(`Unauthorized access attempt to ${pathname} by user ${payload.email}`);
                return NextResponse.redirect(new URL('/', req.url));
            }

        } catch (error) {
            // ❌ Invalid/Expired Token -> Redirect to Auth
            const loginUrl = new URL('/auth', req.url);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    // Apply to all admin routes
    matcher: ['/admin/:path*', '/api/admin/:path*'],
};
