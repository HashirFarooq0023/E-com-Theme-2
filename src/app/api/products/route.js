import { NextResponse } from "next/server";
import { getProducts, createProduct, deleteProduct, updateProduct, getProductById } from "@/lib/products";
import { getSession } from "@/lib/auth"; 

// ---------------------------------------------------------
// 1. GET ALL PRODUCTS (GET /api/products)
// ---------------------------------------------------------
export async function GET() {
  try {
    const products = await getProducts();
    
    return NextResponse.json(products, { 
      status: 200, 
      headers: { 'Cache-Control': 'no-store' } 
    });

  } catch (error) {
    console.error("API GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

// ---------------------------------------------------------
// 2. CREATE PRODUCT (POST /api/products)
// ---------------------------------------------------------
export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.name || !body.price) {
      return NextResponse.json({ error: "Name and Price are required" }, { status: 400 });
    }

    const result = await createProduct(body);

    if (result.success) {
      return NextResponse.json({ message: "Product created", id: result.newId }, { status: 201 });
    } else {
      return NextResponse.json({ 
        error: result.error || "Failed to create product" 
      }, { status: 500 });
    }
  } catch (error) {
    console.error("API POST Error:", error);
    return NextResponse.json({ 
      error: error.message || "Internal Server Error" 
    }, { status: 500 });
  }
}

// ---------------------------------------------------------
// 3. DELETE PRODUCT (DELETE /api/products?id=...)
// ---------------------------------------------------------
export async function DELETE(request) {
  try {
    // 1. Auth Check
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Extract ID from query params
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    // 3. Delete the product
    const result = await deleteProduct(id);

    if (result.success) {
      return NextResponse.json({ message: "Product deleted successfully" }, { status: 200 });
    } else {
      return NextResponse.json({ 
        error: result.error || "Failed to delete product" 
      }, { status: 500 });
    }
  } catch (error) {
    console.error("API DELETE Error:", error);
    return NextResponse.json({ 
      error: error.message || "Internal Server Error" 
    }, { status: 500 });
  }
}