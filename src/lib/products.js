import { ObjectId } from "mongodb";
import clientPromise from "./mongodb";

let client;
let db;
let products;

async function init() {
  if (db) return;
  try {
    client = await clientPromise;
    db = client.db("imageprocessing"); 
    products = db.collection("products");
  } catch (error) {
    console.error("Failed to connect to database:", error);
    throw new Error("Failed to connect to database");
  }
}

// 1. GET ALL PRODUCTS (READ)
export async function getProducts() {
  try {
    await init();
    if (!products) return [];

    const data = await products.find({}).toArray();

    return data.map((p) => ({
      ...p,
      _id: p._id.toString(),
      name: p.name || "Untitled Product",
      price: p.price || 0,
      category: p.category || "Uncategorized",
      image: p.image || "https://placehold.co/600x400?text=No+Image",
      description: p.description || "No description available",
      stock: p.stock || 0, // Ensure stock is handled
      createdAt: p.createdAt ? p.createdAt.toString() : null,
      updatedAt: p.updatedAt ? p.updatedAt.toString() : null,
    }));
  } catch (error) {
    console.error("❌ Error in getProducts:", error);
    return [];
  }
}

// 2. GET SINGLE PRODUCT (READ)
export async function getProductById(id) {
  try {
    await init();
    if (!id) return null;

    const product = await products.findOne({ _id: new ObjectId(id) });
    
    if (!product) return null;

    return {
      ...product,
      _id: product._id.toString(),
      createdAt: product.createdAt ? product.createdAt.toString() : null,
      updatedAt: product.updatedAt ? product.updatedAt.toString() : null,
    };
  } catch (error) {
    console.error("❌ Error in getProductById:", error);
    return null;
  }
}

// 3. CREATE PRODUCT (CREATE)
export async function createProduct(productData) {
  try {
    await init();
    
    const newProduct = {
      ...productData,
      price: parseFloat(productData.price),
      stock: parseInt(productData.stock) || 0,
      rating: 0, 
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await products.insertOne(newProduct);
    
    return { success: true, newId: result.insertedId.toString() };
  } catch (error) {
    console.error("❌ Error in createProduct:", error);
    return { success: false, error: error.message };
  }
}

// 4. UPDATE PRODUCT (UPDATE)
export async function updateProduct(id, updateData) {
  try {
    await init();
    
    
    const { _id, ...fieldsToUpdate } = updateData;

    const result = await products.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: {
          ...fieldsToUpdate,
          price: parseFloat(fieldsToUpdate.price),
          stock: parseInt(fieldsToUpdate.stock),
          updatedAt: new Date()
        } 
      }
    );

    return { success: true, modifiedCount: result.modifiedCount };
  } catch (error) {
    console.error("❌ Error in updateProduct:", error);
    return { success: false, error: error.message };
  }
}

// 5. DELETE PRODUCT (DELETE)

export async function deleteProduct(id) {
  try {
    await init();
    
    const result = await products.deleteOne({ _id: new ObjectId(id) });
    
    return { success: true, deletedCount: result.deletedCount };
  } catch (error) {
    console.error("❌ Error in deleteProduct:", error);
    return { success: false, error: error.message };
  }
}