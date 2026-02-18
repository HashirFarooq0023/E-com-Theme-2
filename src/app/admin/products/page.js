'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Edit, Trash2, Plus, Search, Loader2, ImageIcon, UploadCloud } from "lucide-react";
import WaterButton from "@/components/WaterButton";
import TopNav from "@/components/TopNav";
import { useRouteAccess } from "@/hooks/useRouteAccess";

const EMPTY_CATEGORIES = [];

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

  // AI Ingestion Logic
  const [ingesting, setIngesting] = useState(false);

  async function handleIngest() {
    setIngesting(true);
    try {
      const res = await fetch("/api/ingest", { method: "POST" });
      if (!res.ok) throw new Error("Failed to refresh AI");
      alert("✅ AI Knowledge Updated Successfully!");
    } catch (error) {
      console.error(error);
      alert("❌ Error updating AI: " + error.message);
    } finally {
      setIngesting(false);
    }
  }

  // Show nothing or a loader while checking permission
  if (authLoading) return null;

  return (
    <div className="page-wrapper">
      <TopNav categories={EMPTY_CATEGORIES} user={user} />

      <div className="products-admin-container">

        {/* --- Header --- */}
        <div className="products-header">
          <div className="header-info">
            <h1 className="page-title">INVENTORY</h1>
            <div className="header-line"></div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <WaterButton
              variant="ghost"
              onClick={handleIngest}
              disabled={ingesting}
              style={{ borderColor: '#c4a775', color: '#c4a775', height: '42px', fontSize: '0.75rem' }}
            >
              {ingesting ? (
                <><Loader2 className="spin" size={16} /> REFRESHING AI...</>
              ) : (
                <><UploadCloud size={16} /> REFRESH AI</>
              )}
            </WaterButton>

            <Link href="/admin/addproducts">
              <WaterButton variant="primary" className="add-product-btn">
                <Plus size={16} />
                ADD PRODUCT
              </WaterButton>
            </Link>
          </div>
        </div>

        {/* --- Search Bar --- */}
        <div className="search-wrapper">
          <Search size={16} className="search-icon" color="#c4a775" />
          <input
            type="text"
            placeholder="SEARCH PRODUCTS BY NAME OR CATEGORY..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        {/* --- The Table Panel --- */}
        <div className="products-table-panel">
          {loading ? (
            <div className="loading-state">
              <Loader2 className="spin" size={32} color="#c4a775" />
              <p>LOADING INVENTORY...</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>PRODUCT</th>
                    <th>CATEGORY</th>
                    <th>PRICE</th>
                    <th>STOCK</th>
                    <th className="actions-header">ACTIONS</th>
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
                            <span className="product-id">ID: {product._id.slice(0, 8)}</span>
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
                        <span className="price-value">PKR {Number(product.price).toLocaleString()}</span>
                      </td>

                      {/* Stock */}
                      <td className="stock-cell">
                        {product.stock === 0 ? (
                          <span className="stock-badge out-of-stock">OUT OF STOCK</span>
                        ) : (
                          <span className={`stock-badge ${product.stock < 10 ? 'low-stock' : 'in-stock'}`}>
                            {product.stock} IN STOCK
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="actions-cell">
                        <div className="action-buttons">
                          <Link href={`/admin/products/${product._id}`}>
                            <button className="action-btn edit-btn" title="Edit">
                              <Edit size={14} />
                            </button>
                          </Link>
                          <button
                            className="action-btn delete-btn"
                            onClick={() => handleDelete(product._id)}
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan="5" className="empty-state">
                        <ImageIcon size={48} className="empty-icon" color="#c4a775" />
                        <p>NO PRODUCTS FOUND MATCHING YOUR SEARCH.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        /* --- Layout --- */
        .page-wrapper { 
          background: transparent; 
          color: #e2e8f0; 
          min-height: 100vh; 
          padding: 0 5%;
          width: 100%; 
          font-family: var(--font-serif, serif); 
        }

        .products-admin-container {
          max-width: 100%;
          margin: 0 auto;
          padding: 0 24px 80px;
        }

        /* --- Header --- */
        .products-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .header-info {
          flex: 1;
        }

        .page-title {
          font-family: var(--font, sans-serif);
          font-size: 2rem;
          margin: 0;
          color: white;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 2px;
        }

        .header-line {
          width: 60px;
          height: 2px;
          background: #c4a775;
          margin-top: 15px;
        }

        .add-product-btn {
          height: 42px !important;
          padding: 0 24px !important;
          font-size: 0.75rem !important;
          letter-spacing: 1.5px !important;
        }

        /* --- Search --- */
        .search-wrapper {
          position: relative;
          margin-bottom: 40px;
        }

        .search-icon {
          position: absolute;
          left: 18px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 1;
        }

        .search-input {
          width: 100%;
          padding: 14px 18px 14px 48px;
          background: #000;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 0; /* Square edges */
          color: white;
          font-size: 0.85rem;
          outline: none;
          font-family: var(--font, sans-serif);
          letter-spacing: 1px;
          transition: all 0.3s;
        }

        .search-input:focus {
          border-color: #c4a775;
          background: rgba(196, 167, 117, 0.02);
        }

        .search-input::placeholder {
          color: #64748b;
        }

        /* --- Table --- */
        .products-table-panel {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0;
          overflow: hidden;
        }

        .loading-state {
          padding: 80px;
          text-align: center;
          color: #c4a775;
          font-size: 0.8rem;
          letter-spacing: 2px;
          font-family: var(--font, sans-serif);
        }

        .loading-state p {
          margin-top: 16px;
        }

        .table-container {
          overflow-x: auto;
        }

        .products-table {
          width: 100%;
          border-collapse: collapse;
        }

        .products-table th {
          padding: 20px 24px;
          text-align: left;
          background: #111;
          color: #c4a775;
          font-weight: 600;
          font-size: 0.75rem;
          letter-spacing: 1px;
          text-transform: uppercase;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          font-family: var(--font, sans-serif);
        }

        .actions-header {
          text-align: right !important;
        }

        .product-row {
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.2s;
        }

        .product-row:hover {
          background: rgba(196, 167, 117, 0.05);
        }

        .product-row:last-child {
          border-bottom: none;
        }

        .products-table td {
          padding: 20px 24px;
          vertical-align: middle;
          font-size: 0.9rem;
        }

        .product-cell {
          min-width: 300px;
        }

        .product-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        /* Square Image Wrapper */
        .product-image-wrapper {
          position: relative;
          width: 56px;
          height: 56px;
          border-radius: 0;
          overflow: hidden;
          background: #000;
          border: 1px solid rgba(255, 255, 255, 0.1);
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
          color: #fff;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-family: var(--font, sans-serif);
        }

        .product-id {
          font-size: 0.75rem;
          color: #888;
          font-family: var(--font-serif, serif);
        }

        .category-cell {
          min-width: 150px;
        }

        .category-badge {
          display: inline-block;
          font-size: 0.7rem;
          padding: 6px 12px;
          border-radius: 0;
          background: rgba(255,255,255,0.05);
          color: #ccc;
          border: 1px solid rgba(255,255,255,0.1);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-family: var(--font, sans-serif);
        }

        .price-cell {
          min-width: 120px;
        }

        .price-value {
          font-weight: 500;
          color: #c4a775;
          font-size: 1rem;
          font-family: var(--font-serif, serif);
          letter-spacing: 0.5px;
        }

        .stock-cell {
          min-width: 140px;
        }

        .stock-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 0;
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-family: var(--font, sans-serif);
        }

        .stock-badge.out-of-stock {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .stock-badge.low-stock {
          background: rgba(196, 167, 117, 0.1); /* Gold tint */
          color: #c4a775;
          border: 1px solid rgba(196, 167, 117, 0.3);
        }

        .stock-badge.in-stock {
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.2);
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
          border-radius: 0; /* Square */
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          border: 1px solid rgba(255,255,255,0.2);
          background: transparent;
        }

        .edit-btn {
          color: #fff;
        }

        .edit-btn:hover {
          background: #c4a775;
          border-color: #c4a775;
          color: #000;
        }

        .delete-btn {
          color: #888;
        }

        .delete-btn:hover {
          background: #7f1d1d;
          border-color: #7f1d1d;
          color: #fff;
        }

        .empty-state {
          text-align: center;
          padding: 80px 40px;
          color: #c4a775;
          font-family: var(--font, sans-serif);
          text-transform: uppercase;
          letter-spacing: 1px;
          font-size: 0.8rem;
        }

        .empty-icon {
          margin-bottom: 16px;
          opacity: 0.8;
        }

        .empty-state p {
          margin: 0;
        }

        /* --- Responsive --- */
        @media (max-width: 768px) {
          .products-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 20px;
          }

          .products-table th,
          .products-table td {
            padding: 16px;
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