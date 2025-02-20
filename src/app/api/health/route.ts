import { validateConnection } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const isConnected = await validateConnection();
        if (!isConnected) {
            return NextResponse.json({ status: "error", message: "Database connection failed" }, { status: 503 });
        }
        return NextResponse.json({ status: "ok" }, { status: 200 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
        return NextResponse.json({ status: "error", message: errorMessage }, { status: 500 });
    }
}
