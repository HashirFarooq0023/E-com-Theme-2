// src/app/api/users/route.js
import { NextResponse } from "next/server";
import { clientPromise } from "@/lib/mongodb"; // Adjust path to your mongo client

export async function POST(request) {
  try {
    const { clerkId, email, name } = await request.json();
    const client = await clientPromise;
    const db = client.db();

    // 1. Check if user already exists
    const existingUser = await db.collection("users").findOne({ clerkId });

    if (!existingUser) {
      // 2. Determine Role: If email matches your admin email, set role to admin
      const role = email === "your-admin-email@example.com" ? "admin" : "customer";

      const newUser = {
        clerkId,
        email,
        name,
        role,
        createdAt: new Date(),
      };

      await db.collection("users").insertOne(newUser);
      return NextResponse.json({ message: "User created", role }, { status: 201 });
    }

    return NextResponse.json({ message: "User exists", role: existingUser.role }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}