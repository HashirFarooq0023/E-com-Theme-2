import { NextResponse } from "next/server";
import { getProductById, updateProduct } from "@/lib/products";
import { getSession } from "@/lib/auth";

// GET single product by ID
export async function GET(request, { params }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const product = await getProductById(id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("API GET Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch product" }, { status: 500 });
  }
}

// PUT/UPDATE product by ID
export async function PUT(request, { params }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    if (!body.name || !body.price) {
      return NextResponse.json({ error: "Name and Price are required" }, { status: 400 });
    }

    const result = await updateProduct(id, body);

    if (result.success) {
      return NextResponse.json({ message: "Product updated successfully" }, { status: 200 });
    } else {
      return NextResponse.json({ 
        error: result.error || "Failed to update product" 
      }, { status: 500 });
    }
  } catch (error) {
    console.error("API PUT Error:", error);
    return NextResponse.json({ 
      error: error.message || "Internal Server Error" 
    }, { status: 500 });
  }
}
