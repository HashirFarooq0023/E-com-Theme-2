import { NextResponse } from "next/server";
import { getAllUsers } from "@/lib/user";
import { getSession } from "@/lib/auth";

// GET all users (Admin only)
export async function GET() {
  try {
    // Check Admin Auth
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await getAllUsers();
    return NextResponse.json(users);

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}