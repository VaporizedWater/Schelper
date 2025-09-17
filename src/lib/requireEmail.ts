// lib/server/requireEmail.ts
import "server-only";
import { auth } from "@/lib/auth";

/**
 * Ensures the caller is authenticated and returns the user's email.
 * Throws a Response(401) you can return directly if not authenticated.
 */
export async function requireEmail(): Promise<string> {
    const session = await auth();
    const email = session?.user?.email;

    if (typeof email !== "string" || email.length === 0) {
        throw new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    return email;
}
