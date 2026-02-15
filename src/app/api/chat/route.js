import { NextResponse } from "next/server";
import { chatSchema } from "@/lib/schemas";

export async function POST(req) {
    try {
        const body = await req.json();

        // 🛡️ Zod Validation
        const validation = chatSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ error: "Invalid Input", details: validation.error.format() }, { status: 400 });
        }

        const { message, session_id } = validation.data;

        // Use internal docker/localhost URL for server-to-server communication
        const apiUrl = process.env.AI_SERVICE_URL || "http://localhost:8000";
        const apiKey = process.env.AI_SERVICE_KEY;

        if (!apiKey) {
            console.error("❌ AI_SERVICE_KEY not set in .env.local");
            return NextResponse.json({ error: "AI Service misconfigured" }, { status: 500 });
        }

        // Call Python Backend with Secret Key
        const res = await fetch(`${apiUrl}/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-API-KEY": apiKey,
            },
            body: JSON.stringify({ message, session_id }),
        });

        if (!res.ok) {
            // Log detailed error from Python backend
            const errorText = await res.text();
            console.error(`❌ AI Backend Error (${res.status}):`, errorText);
            return NextResponse.json(
                { error: "AI Service Unavailable", details: errorText },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error("❌ Chat Proxy Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
