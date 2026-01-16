'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Edit, Trash2, Plus, Search, Loader2, ImageIcon } from "lucide-react";
import WaterButton from "@/components/WaterButton";
import TopNav from "@/components/TopNav";
import { useRouteAccess } from "@/hooks/useRouteAccess";

export default function AdminProductsPage() {
  // Use centralized permission check
  const { user, loading: authLoading } = useRouteAccess();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Fetch Products (Only if authorized)
  useEffect(() => {
    if (!authLoading && user) {
      async function fetchProducts() {
        try {
          const productRes = await fetch("/api/products");
          const productData = await productRes.json();
          setProducts(Array.isArray(productData) ? productData : []);
        } catch (error) {
          console.error("Failed to fetch products", error);
        } finally {
          setLoading(false);
        }
      }
      fetchProducts();
    }
  }, [authLoading, user]);

  // 4. Filter Logic
  const filteredProducts = products.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  // 5. Delete Logic
  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this product?")) return;

    const backup = [...products];
    setProducts(products.filter((p) => (p._id || p.id) !== id));

    try {
      const res = await fetch(`/api/products?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete");
      }
    } catch (error) {
      alert(`Could not delete product: ${error.message}`);
      setProducts(backup);
    }
  }

  // Show nothing or a loader while checking permission
  if (authLoading) return null; 

  return (
    <div className="page">
      <TopNav categories={[]} user={user} />

      <div className="products-admin-container">
        
        {/* --- Header --- */}
        <div className="products-header">
          <div className="header-info">
            <h1 className="page-title">Inventory</h1>
            <p className="page-subtitle">Manage your store catalog</p>
          </div>
          
          <Link href="/admin/addproducts">
            <WaterButton variant="primary" className="add-product-btn">
              <Plus size={18} style={{ marginRight: '8px' }} />
              Add Product
            </WaterButton>
          </Link>
        </div>

        {/* --- Search Bar --- */}
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search products by name or category..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        {/* --- The Table Panel --- */}
        <div className="products-table-panel">
          {loading ? (
            <div className="loading-state">
              <Loader2 className="spin" size={32} />
              <p>Loading inventory...</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th className="actions-header">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product._id} className="product-row">
                      
                      {/* Name & Image */}
                      <td className="product-cell">
                        <div className="product-info">
                          <div className="product-image-wrapper">
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="product-thumbnail"
                            />
                          </div>
                          <div className="product-details">
                            <span className="product-name">{product.name}</span>
                            <span className="product-id">ID: {product._id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="category-cell">
                        <span className="category-badge">
                          {product.category}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="price-cell">
                        <span className="price-value">PKR {Number(product.price).toFixed(2)}</span>
                      </td>

                      {/* Stock */}
                      <td className="stock-cell">
                        {product.stock === 0 ? (
                          <span className="stock-badge out-of-stock">Out of Stock</span>
                        ) : (
                          <span className={`stock-badge ${product.stock < 10 ? 'low-stock' : 'in-stock'}`}>
                            {product.stock} in stock
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="actions-cell">
                        <div className="action-buttons">
                          <Link href={`/admin/products/${product._id}`}> 
                            <button className="action-btn edit-btn" title="Edit">
                              <Edit size={16} />
                            </button>
                          </Link>
                          <button 
                            className="action-btn delete-btn" 
                            onClick={() => handleDelete(product._id)}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan="5" className="empty-state">
                        <ImageIcon size={48} className="empty-icon" />
                        <p>No products found matching your search.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .products-admin-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          padding-bottom: 60px;
        }

        .products-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          padding: 24px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          backdrop-filter: blur(10px);
        }

        .header-info {
          flex: 1;
        }

        .page-title {
          font-size: 2rem;
          margin: 0 0 8px 0;
          color: white;
          font-weight: 700;
          background: linear-gradient(135deg, #fff, #94a3b8);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .page-subtitle {
          margin: 0;
          color: #94a3b8;
          font-size: 0.95rem;
        }

        .add-product-btn {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .search-wrapper {
          position: relative;
          margin-bottom: 24px;
        }

        .search-icon {
          position: absolute;
          left: 18px;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
          z-index: 1;
        }

        .search-input {
          width: 100%;
          padding: 14px 18px 14px 48px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 14px;
          color: white;
          font-size: 1rem;
          outline: none;
          transition: all 0.3s;
        }

        .search-input:focus {
          border-color: #3b82f6;
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .search-input::placeholder {
          color: #64748b;
        }

        .products-table-panel {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          overflow: hidden;
          backdrop-filter: blur(10px);
        }

        .loading-state {
          padding: 80px;
          text-align: center;
          color: #94a3b8;
        }

        .loading-state p {
          margin-top: 16px;
          font-size: 0.95rem;
        }

        .table-container {
          overflow-x: auto;
        }

        .products-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
        }

        .products-table thead {
          background: rgba(255, 255, 255, 0.05);
        }

        .products-table th {
          padding: 20px;
          text-align: left;
          font-weight: 600;
          font-size: 0.85rem;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .actions-header {
          text-align: right;
        }

        .product-row {
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.2s;
        }

        .product-row:hover {
          background: rgba(255, 255, 255, 0.03);
        }

        .product-row:last-child {
          border-bottom: none;
        }

        .products-table td {
          padding: 20px;
          vertical-align: middle;
        }

        .product-cell {
          min-width: 300px;
        }

        .product-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .product-image-wrapper {
          position: relative;
          width: 56px;
          height: 56px;
          border-radius: 12px;
          overflow: hidden;
          background: #000;
          border: 2px solid rgba(255, 255, 255, 0.1);
          flex-shrink: 0;
        }

        .product-thumbnail {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }

        .product-row:hover .product-thumbnail {
          transform: scale(1.05);
        }

        .product-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .product-name {
          font-weight: 600;
          color: #f8fafc;
          font-size: 0.95rem;
          display: block;
        }

        .product-id {
          font-size: 0.75rem;
          color: #64748b;
          font-family: monospace;
        }

        .category-cell {
          min-width: 150px;
        }

        .category-badge {
          display: inline-block;
          font-size: 0.8rem;
          padding: 6px 14px;
          border-radius: 20px;
          background: rgba(59, 130, 246, 0.15);
          color: #3b82f6;
          border: 1px solid rgba(59, 130, 246, 0.3);
          font-weight: 500;
        }

        .price-cell {
          min-width: 120px;
        }

        .price-value {
          font-weight: 700;
          color: #22c55e;
          font-size: 1rem;
        }

        .stock-cell {
          min-width: 140px;
        }

        .stock-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .stock-badge.out-of-stock {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .stock-badge.low-stock {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
          border: 1px solid rgba(245, 158, 11, 0.3);
        }

        .stock-badge.in-stock {
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
          border: 1px solid rgba(34, 197, 94, 0.3);
        }

        .actions-cell {
          text-align: right;
          min-width: 120px;
        }

        .action-buttons {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        .action-btn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          border: none;
        }

        .edit-btn {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          color: #3b82f6;
        }

        .edit-btn:hover {
          background: rgba(59, 130, 246, 0.2);
          border-color: #3b82f6;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
        }

        .delete-btn {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
        }

        .delete-btn:hover {
          background: rgba(239, 68, 68, 0.2);
          border-color: #ef4444;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
        }

        .empty-state {
          text-align: center;
          padding: 80px 40px;
          color: #64748b;
        }

        .empty-icon {
          opacity: 0.2;
          margin-bottom: 16px;
          color: #64748b;
        }

        .empty-state p {
          margin: 0;
          font-size: 0.95rem;
        }

        @media (max-width: 768px) {
          .products-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 20px;
          }

          .page-title {
            font-size: 1.5rem;
          }

          .products-table {
            font-size: 0.85rem;
          }

          .products-table th,
          .products-table td {
            padding: 12px;
          }

          .product-image-wrapper {
            width: 48px;
            height: 48px;
          }
        }
      `}} />
    </div>
  );
}