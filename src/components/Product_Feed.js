'use client';

import { useState, useEffect } from "react";
import TopNav from "./TopNav"; 
import WaterButton from "./WaterButton";

export default function ProductFeed({ initialProducts, user }) {
  const [products] = useState(initialProducts);
  
  // State for interactivity
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(initialProducts[0] || null);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);

  // Derive categories
  const categories = [...new Set(products.map((p) => p.category))];

  // Filter logic
  const visibleProducts = !selectedCategory
    ? products
    : products.filter((p) => p.category === selectedCategory);

  // Load Cart
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
      updateCartState(savedCart);
    }
  }, []);

  function updateCartState(cart) {
    setCartCount(cart.length);
    const total = cart.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity || 1),
      0
    );
    setCartTotal(total);
  }

  function addToCart(product) {
    if (typeof window === "undefined") return;
    const existing = JSON.parse(localStorage.getItem("cart") || "[]");
    const next = [...existing, { ...product, quantity: 1 }];
    localStorage.setItem("cart", JSON.stringify(next));
    updateCartState(next);
  }

  function clearCart() {
    if (typeof window === "undefined") return;
    localStorage.removeItem("cart");
    updateCartState([]);
  }

  function scrollToProducts() {
    const el = document.querySelector(".products");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="page">
      <TopNav
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat === selectedCategory ? null : cat);
          setSelectedProduct(null); 
        }}
        cartCount={cartCount}
        user={user}
      />

    

      {/* MAIN CONTENT */}
      <main className="layout">
        
        {/* PRODUCT GRID */}
        <section className="panel products">
          <div className="panel-header">
            <div>
              <h2>{selectedCategory ? `${selectedCategory} Products` : "All Products"}</h2>
              <p style={{color: '#94a3b8'}}>Browse the catalog and add items to your cart.</p>
            </div>
            <span className="pill" style={{background: 'rgba(255,255,255,0.1)', padding:'4px 12px', borderRadius:'12px'}}>
              {visibleProducts.length} items
            </span>
          </div>
          
          <div className="product-grid">
            {visibleProducts.map((product) => (
              <article
                key={product._id}
                className={`product-card ${selectedProduct?._id === product._id ? "selected" : ""}`}
                onClick={() => setSelectedProduct(product)}
                // ✨ 1. Force card to take full height so they match
                style={{ height: '100%' }} 
              >
                <div className="product-thumb">
                  <img src={product.image} alt={product.name} />
                  <span className="badge">{product.category}</span>
                </div>
                
                {/* ✨ 2. Make body a flex column to control spacing */}
                <div className="product-body" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div className="product-top">
                    <h3>{product.name}</h3>
                    <span className="price">${product.price}</span>
                  </div>

                  {/* ⭐ RATING SECTION ⭐ */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '0.85rem', color: '#cbd5e1' }}>
                    <span style={{ color: '#fbbf24' }}>★</span>
                    <span style={{ fontWeight: 600 }}>{product.rating || "N/A"}</span>
                    {product.stock !== undefined && product.stock < 10 && (
                      <span style={{ fontSize: '0.75rem', color: '#f87171', marginLeft: 'auto', background: 'rgba(248,113,113,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                        Low Stock
                      </span>
                    )}
                  </div>

                  <p className="desc" style={{ marginBottom: '16px' }}>{product.description}</p>
                  
                  {/* ✨ 3. Pushes button to the very bottom */}
                  <div style={{ marginTop: 'auto' }}>
                    <WaterButton
                      variant="primary"
                      className="block"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product);
                      }}
                    >
                      Add to cart
                    </WaterButton>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* DETAILS PANEL */}
        <section className="panel detail">
          <h2>Product Details</h2>
          {selectedProduct ? (
            <div className="detail-body">
              <img
                className="detail-img"
                src={selectedProduct.image}
                alt={selectedProduct.name}
              />
              <div className="detail-info">
                <div className="detail-head">
                  <div>
                    <p className="eyebrow">{selectedProduct.category}</p>
                    <h3>{selectedProduct.name}</h3>
                  </div>
                  <span className="price">${selectedProduct.price}</span>
                </div>
                
                {/* Rating in details view */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                   <span style={{ color: '#fbbf24' }}>★★★★★</span>
                   <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                     ({selectedProduct.rating} Rating)
                   </span>
                </div>

                <p className="desc">{selectedProduct.description}</p>
                
                {selectedProduct.highlights && (
                   <div className="chips">
                     {selectedProduct.highlights.map((item) => (
                       <span key={item} className="chip">{item}</span>
                     ))}
                   </div>
                )}
                
                <WaterButton
                  variant="primary"
                  onClick={() => addToCart(selectedProduct)}
                >
                  Add to cart
                </WaterButton>
              </div>
            </div>
          ) : (
            <p className="muted" style={{textAlign:'center', padding:'40px'}}>
              Select a product above to see details.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}