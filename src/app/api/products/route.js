import { NextResponse } from "next/server";
import { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from "@/lib/products"; 

// ---------------------------------------------------------
// 1. GET HANDLER (Fetches ALL products or SINGLE product)
// ---------------------------------------------------------
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      // Scenario A: Fetch Single Product (for Edit Page)
      const product = await getProductById(id);
      
      if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
      return NextResponse.json(product, { status: 200 });
    } 
    
    // Scenario B: Fetch All Products (for Admin List)
    const products = await getProducts();
    
    // We disable caching 'no-store' to ensure the admin list is always fresh
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
// 2. POST HANDLER (Creates a new product)
// ---------------------------------------------------------
export async function POST(request) {
  try {
    const body = await request.json();

    // Basic Validation
    if (!body.name || !body.price) {
      return NextResponse.json({ error: "Name and Price are required" }, { status: 400 });
    }

    const result = await createProduct(body);

    if (result.success) {
      return NextResponse.json({ message: "Product created", id: result.newId }, { status: 201 });
    } else {
      return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
    }
  } catch (error) {
    console.error("API POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ---------------------------------------------------------
// 3. PUT HANDLER (Updates an existing product)
// ---------------------------------------------------------
export async function PUT(request) {
  try {
    const body = await request.json();
    const { _id, ...updateData } = body;

    if (!_id) {
      return NextResponse.json({ error: "Product ID is required for update" }, { status: 400 });
    }

    const result = await updateProduct(_id, updateData);

    if (result.success) {
      return NextResponse.json({ message: "Updated successfully" }, { status: 200 });
    } else {
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
  } catch (error) {
    console.error("API PUT Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ---------------------------------------------------------
// 4. DELETE HANDLER (Removes a product)
// ---------------------------------------------------------
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const result = await deleteProduct(id);

    if (result.success) {
      return NextResponse.json({ message: "Deleted successfully" }, { status: 200 });
    } else {
      return NextResponse.json({ error: "Failed to delete from DB" }, { status: 500 });
    }
  } catch (error) {
    console.error("API DELETE Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}