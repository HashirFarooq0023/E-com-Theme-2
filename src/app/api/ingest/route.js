
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const apiUrl = process.env.AI_SERVICE_URL || "http://localhost:8000";
        const apiKey = process.env.AI_SERVICE_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: "AI Service misconfigured" }, { status: 500 });
        }

        // Call Python Backend
        const res = await fetch(`${apiUrl}/sync-products`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-API-KEY": apiKey,
            },
            body: JSON.stringify({ admin_key: apiKey }), // identifying self
        });

        if (!res.ok) {
            const errorText = await res.text();
            return NextResponse.json(
                { error: "AI Service Failed", details: errorText },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error("Ingestion Proxy Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
