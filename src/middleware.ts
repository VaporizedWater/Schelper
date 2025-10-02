// middleware.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth"; // NextAuth v5 entrypoint

export default auth((req) => {
    const isAuthed = !!req.auth;
    const { pathname } = req.nextUrl;

    // allow home page when logged out
    if (!isAuthed && pathname !== "/") {
        const url = new URL("/", req.url);
        // Optional: url.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
});

// Apply to everything except assets, auth endpoints, and the home page
export const config = {
    matcher: [
        // Negative lookahead to exclude: _next, images, favicon, auth routes, and the exact "/"
        "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|api/auth|$).*)",
    ],
};
