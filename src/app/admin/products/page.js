'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Edit, Trash2, Plus, Search, Loader2 } from "lucide-react";
import WaterButton from "@/components/WaterButton";
import TopNav from "@/components/TopNav";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // 1. Fetch Data when page loads
  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      // Ensure we always have an array
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load products", error);
    } finally {
      setLoading(false);
    }
  }

  // 2. Filter Logic (Search)
  const filteredProducts = products.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  // 3. Delete Logic
  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this product?")) return;

    // Optimistic Update: Remove from screen immediately
    const backup = [...products];
    setProducts(products.filter((p) => p._id !== id));

    try {
      const res = await fetch(`/api/products?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    } catch (error) {
      alert("Could not delete product.");
      setProducts(backup); // Put it back if error
    }
  }

  return (
    <div className="page">
      {/* Navigation */}
      <TopNav categories={[]} />

      <div style={{ maxWidth: '1000px', margin: '0 auto', marginTop: '20px' }}>
        
        {/* --- Header --- */}
        <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2>Inventory</h2>
            <p className="subtitle" style={{ margin: 0 }}>Manage your store catalog</p>
          </div>
          
        
          <Link href="/admin/addproducts">
            <WaterButton variant="primary">
              <Plus size={18} style={{ marginRight: '8px' }} />
              Add Product
            </WaterButton>
          </Link>
        </div>

        {/* --- Search Bar --- */}
        <div style={{ marginBottom: '20px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input 
            type="text" 
            placeholder="Search products..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 12px 12px 44px',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              color: '#fff',
              outline: 'none'
            }}
          />
        </div>

        {/* --- The Table Panel --- */}
        <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
              <Loader2 className="spin" size={24} style={{ marginBottom: '10px' }} />
              <p>Loading inventory...</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)', color: '#94a3b8', fontSize: '0.85rem', textAlign: 'left' }}>
                    <th style={{ padding: '16px' }}>Product</th>
                    <th style={{ padding: '16px' }}>Category</th>
                    <th style={{ padding: '16px' }}>Price</th>
                    <th style={{ padding: '16px' }}>Stock</th>
                    <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product._id} className="admin-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      
                      {/* Name & Image */}
                      <td style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', background: '#333' }}
                        />
                        <span style={{ fontWeight: 600 }}>{product.name}</span>
                      </td>

                      {/* Category */}
                      <td style={{ padding: '16px' }}>
                        <span className="chip" style={{ fontSize: '0.8rem' }}>{product.category}</span>
                      </td>

                      {/* Price */}
                      <td style={{ padding: '16px', fontWeight: 600 }}>${product.price}</td>

                      {/* Stock */}
                      <td style={{ padding: '16px' }}>
                        <span style={{ color: product.stock < 10 ? '#ef4444' : '#22c55e', fontSize: '0.9rem' }}>
                          {product.stock} left
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <Link href={`/admin/products/${product._id}`}>
                            <button className="action-btn edit" title="Edit">
                              <Edit size={16} />
                            </button>
                          </Link>
                          <button className="action-btn delete" onClick={() => handleDelete(product._id)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                        No products found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}