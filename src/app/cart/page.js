'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TopNav from "@/components/TopNav";
import WaterButton from "@/components/WaterButton";
import Link from "next/link";
import { Trash2, MapPin, Phone, User, Home, ArrowRight, Loader2, ArrowDown } from "lucide-react";

// 🇵🇰 Pakistan Data for Dropdowns
const PROVINCES = [
  "Punjab", "Sindh", "Khyber Pakhtunkhwa", "Balochistan",
  "Islamabad Capital Territory", "Gilgit-Baltistan", "Azad Kashmir"
];

const CITIES = [
  "Karachi", "Lahore", "Faisalabad", "Rawalpindi", "Gujranwala", "Peshawar", "Multan",
  "Hyderabad", "Islamabad", "Quetta", "Bahawalpur", "Sargodha", "Sialkot", "Sukkur",
  "Larkana", "Sheikhupura", "Rahim Yar Khan", "Jhang", "Dera Ghazi Khan", "Gujrat"
];

import Toast from "@/components/Toast";

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', id: 0 });

  // State for categories
  const [categories, setCategories] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    phone1: "",
    phone2: "",
    house: "",
    street: "",
    area: "",
    city: "",
    province: "",
    landmark: "",
  });

  // 1. Load Data
  useEffect(() => {
    if (typeof window === "undefined") return;

    // A. Load Cart
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);
    calculateTotal(savedCart);

    // B. Load User Session
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
          setFormData(prev => ({ ...prev, name: data.user.name || "" }));
        }
      })
      .catch(() => { });

    // C. Fetch Categories
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch(err => console.error("Failed to load categories", err));

  }, []);

  function calculateTotal(items) {
    const sum = items.reduce((acc, item) => acc + (Number(item.price) * (item.quantity || 1)), 0);
    setTotal(sum);
  }

  function updateQuantity(id, newQty) {
    if (newQty < 1) return;
    const nextCart = cart.map(item => item._id === id ? { ...item, quantity: newQty } : item);
    setCart(nextCart);
    localStorage.setItem("cart", JSON.stringify(nextCart));
    calculateTotal(nextCart);
  }

  function removeItem(id) {
    const nextCart = cart.filter(item => item._id !== id);
    setCart(nextCart);
    localStorage.setItem("cart", JSON.stringify(nextCart));
    calculateTotal(nextCart);
    setToast({ show: true, message: "Removed from Cart", id: Date.now() });
  }

  function handleInputChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handlePlaceOrder(e) {
    e.preventDefault();
    setLoading(true);

    const orderData = {
      items: cart,
      totalAmount: total,
      shippingAddress: formData,
      customerName: formData.name,
      userId: user?.id || "guest",
      email: user?.email || formData.email || "guest@example.com",
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        localStorage.removeItem("cart");
        setCart([]);
        setToast({ show: true, message: "Order Placed Successfully!", id: Date.now() });
        setTimeout(() => router.push("/"), 3500); // Allow Toast to show fully
      } else {
        alert("Failed to place order. Please try again.");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const cartCount = cart.length;

  return (
    <div className="page-wrapper">
      <Toast
        message={toast.message}
        isVisible={toast.show}
        id={toast.id}
        onClose={() => setToast(prev => ({ ...prev, show: false }))}
      />
      <div style={{ maxWidth: '98%', margin: '0 auto', padding: '0 12px' }}>
        <TopNav
          cartCount={cartCount}
          user={user}
          categories={categories}
          onSelectCategory={(cat) => router.push(`/?category=${encodeURIComponent(cat)}`)}
        />
      </div>

      <main className="cart-container" style={{ paddingTop: '20px' }}>

        <div className="breadcrumb-nav" style={{ marginBottom: '20px' }}>
          <Link href="/" className="back-link">
            <ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} />
            <span>BACK TO HOME</span>
          </Link>
        </div>

        <div className="header-section" >
          <h1>CHECKOUT</h1>
          <div className="header-line"></div>
        </div>
        {cart.length === 0 ? (
          <div className="empty-cart-panel">
            <p className="empty-msg">YOUR CART IS EMPTY.</p>
            <Link href="/">
              <WaterButton variant="primary" style={{ padding: '14px 40px', letterSpacing: '2px' }}>
                BROWSE COLLECTION
              </WaterButton>
            </Link>
          </div>
        ) : (
          <div className="checkout-grid">

            {/* LEFT COLUMN: CART ITEMS */}
            <section className="luxury-panel cart-section">
              <div className="panel-header">
                <h3>ORDER SUMMARY</h3>
                <span className="pill">{cartCount} ITEMS</span>
              </div>

              <div className="cart-list">
                {cart.map((item) => (
                  <div key={item._id || Math.random()} className="cart-row-enhanced">
                    <div className="cart-img-wrapper">
                      <img src={item.image} alt={item.name} />
                    </div>

                    <div className="cart-info">
                      <h4>{item.name}</h4>
                      <p className="muted">{item.category}</p>
                      <div className="price-tag">PKR {Number(item.price).toLocaleString()}</div>
                    </div>

                    <div className="cart-controls">
                      <div className="qty-selector">
                        <button onClick={() => updateQuantity(item._id, item.quantity - 1)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
                      </div>
                      <button className="delete-btn" onClick={() => removeItem(item._id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="cart-footer">
                <div className="total-row">
                  <span>SUBTOTAL</span>
                  <span style={{ fontFamily: 'var(--font-serif, serif)' }}>PKR {total.toLocaleString()}</span>
                </div>
                <div className="total-row">
                  <span>SHIPPING</span>
                  <span style={{ fontFamily: 'var(--font-serif, serif)' }}>COMPLIMENTARY</span>
                </div>
                <div className="total-row grand-total">
                  <span>TOTAL</span>
                  <span>PKR {total.toLocaleString()}</span>
                </div>
              </div>
            </section>

            {/* Mobile Scroll Indicator */}
            <div className="mobile-scroll-indicator">
              <span>SCROLL FOR CHECKOUT</span>
              <ArrowDown size={20} className="bounce" />
            </div>

            {/* RIGHT COLUMN: SHIPPING FORM */}
            <section className="luxury-panel form-section">
              <div className="panel-header">
                <h3>SHIPPING DETAILS</h3>
                <MapPin size={18} color="#c4a775" style={{ opacity: 0.8 }} />
              </div>

              <form onSubmit={handlePlaceOrder} className="shipping-form">

                <h4 className="form-heading"><User size={14} color="#c4a775" /> CONTACT INFORMATION</h4>
                <div className="form-group">
                  <label>FULL NAME</label>
                  <input name="name" required placeholder="Ali Khan" value={formData.name} onChange={handleInputChange} />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>PHONE NUMBER 1</label>
                    <input name="phone1" required type="tel" placeholder="0300-1234567" value={formData.phone1} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label>PHONE NUMBER 2 <span className="muted-label">(OPTIONAL)</span></label>
                    <input name="phone2" type="tel" placeholder="Secondary number" value={formData.phone2} onChange={handleInputChange} />
                  </div>
                </div>

                <h4 className="form-heading" style={{ marginTop: '30px' }}><Home size={14} color="#c4a775" /> DELIVERY ADDRESS</h4>

                <div className="form-row">
                  <div className="form-group">
                    <label>HOUSE / APARTMENT NO.</label>
                    <input name="house" required placeholder="H# 123, Block A" value={formData.house} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label>STREET / ROAD</label>
                    <input name="street" required placeholder="Main Boulevard" value={formData.street} onChange={handleInputChange} />
                  </div>
                </div>

                <div className="form-group">
                  <label>AREA / SOCIETY</label>
                  <input name="area" required placeholder="DHA, Gulberg, etc." value={formData.area} onChange={handleInputChange} />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>CITY</label>
                    <input list="cities" name="city" required placeholder="Select or type city" value={formData.city} onChange={handleInputChange} />
                    <datalist id="cities">
                      {CITIES.map(c => <option key={c} value={c} />)}
                    </datalist>
                  </div>

                  <div className="form-group">
                    <label>PROVINCE</label>
                    <input list="provinces" name="province" required placeholder="Select or type province" value={formData.province} onChange={handleInputChange} />
                    <datalist id="provinces">
                      {PROVINCES.map(p => <option key={p} value={p} />)}
                    </datalist>
                  </div>
                </div>

                <div className="form-group">
                  <label>DELIVERY NOTES / LANDMARK</label>
                  <textarea name="landmark" rows="2" placeholder="Near famous landmark, etc." value={formData.landmark} onChange={handleInputChange}></textarea>
                </div>

                <div style={{ marginTop: '20px' }}>
                  <WaterButton variant="primary" type="submit" className="w-full submit-btn" disabled={loading}>
                    {loading ? <Loader2 className="spin" size={18} color="#000" /> : <>CONFIRM ORDER <ArrowRight size={16} style={{ marginLeft: '8px' }} /></>}
                  </WaterButton>
                </div>

              </form>
            </section>

          </div>
        )}
      </main>

      <style dangerouslySetInnerHTML={{
        __html: `
        /* --- Layout & Background --- */
        :global(body) {
          background-color: #0e0e0e !important; 
        }

        .page-wrapper {
          background-color: transparent; 
          color: #e2e8f0;
          min-height: 100vh;
          width: 100%;
          padding: 0 1%; /* Matched to Home Page */
          font-family: var(--font-serif, serif);
        }

        .cart-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px 12px 80px; /* Matched side padding */
        }

        /* --- Back Link --- */
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #888;
          font-size: 0.8rem;
          letter-spacing: 1px;
          text-transform: uppercase;
          transition: color 0.3s ease;
        }

        .back-link:hover {
          color: #c4a775;
        }

        /* --- Header --- */
        .header-section {
          margin-bottom: 40px;
          margin-top: 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 20px;
        }

        .header-section h1 {
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
          /* Left aligned implicitly by removal of auto margin */
        }

        /* --- Empty State --- */
        .empty-cart-panel {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0;
          text-align: center;
          padding: 80px 20px;
          margin-top: 40px;
        }
        
        .empty-msg {
          font-size: 0.9rem;
          margin-bottom: 30px;
          color: #c4a775;
          letter-spacing: 2px;
          text-transform: uppercase;
          font-family: var(--font, sans-serif);
        }

        /* --- Grid Layout --- */
        .checkout-grid { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 40px; 
          align-items: start;
        }
        
        /* --- Panels --- */
        .luxury-panel {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0; /* Square edges */
          padding: 32px;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(196, 167, 117, 0.3); /* Gold tint border */
          padding-bottom: 16px;
          margin-bottom: 24px;
        }

        .panel-header h3 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: white;
          text-transform: uppercase;
          letter-spacing: 2px;
          font-family: var(--font, sans-serif);
        }

        .pill {
          font-size: 0.7rem;
          color: #c4a775;
          font-weight: 600;
          letter-spacing: 1px;
          border: 1px solid #c4a775;
          padding: 4px 10px;
          text-transform: uppercase;
        }

        /* --- Cart List --- */
        .cart-list { display: flex; flex-direction: column; gap: 0; margin-bottom: 20px; }
        
        .cart-row-enhanced { 
          display: flex; 
          align-items: center; 
          gap: 20px; 
          padding: 20px 0; 
          border-bottom: 1px solid rgba(255,255,255,0.05); 
        }

        .cart-img-wrapper { 
          width: 80px; 
          height: 80px; 
          border-radius: 0; /* Square */
          overflow: hidden; 
          background: #000; 
          flex-shrink: 0; 
          border: 1px solid rgba(255,255,255,0.1);
        }

        .cart-img-wrapper img { width: 100%; height: 100%; object-fit: cover; }
        
        .cart-info { flex: 1; }
        .cart-info h4 { 
          margin: 0 0 6px 0; 
          font-size: 0.9rem; 
          font-weight: 600; 
          text-transform: uppercase; 
          letter-spacing: 0.5px;
          color: #fff;
          font-family: var(--font, sans-serif);
        }
        
        .muted { color: #888; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; margin: 0; }
        
        .price-tag { 
          color: #c4a775; 
          font-weight: 500; 
          margin-top: 8px; 
          font-size: 1rem;
          font-family: var(--font-serif, serif);
        }
        
        .cart-controls { display: flex; flex-direction: column; align-items: flex-end; gap: 12px; }
        
        .qty-selector { 
          display: flex; 
          align-items: center; 
          background: transparent; 
          border: 1px solid rgba(255,255,255,0.2); 
          border-radius: 0; 
        }

        .qty-selector button { 
          background: transparent; 
          border: none; 
          color: white; 
          width: 28px; 
          height: 28px; 
          cursor: pointer; 
          transition: 0.2s;
        }

        .qty-selector button:hover { background: rgba(196,167,117,0.2); color: #c4a775; }
        .qty-selector span { font-size: 0.85rem; padding: 0 12px; font-family: var(--font-serif, serif); }
        
        .delete-btn { 
          background: transparent; 
          border: none; 
          color: #666; 
          cursor: pointer; 
          transition: 0.2s; 
          padding: 0;
        }
        .delete-btn:hover { color: #ef4444; }
        
        /* --- Cart Footer --- */
        .cart-footer { padding-top: 20px; }
        .total-row { 
          display: flex; 
          justify-content: space-between; 
          margin-bottom: 12px; 
          font-size: 0.85rem; 
          color: #a0a0a0; 
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 600;
        }

        .grand-total { 
          font-size: 1.2rem; 
          color: #c4a775; 
          font-weight: 600; 
          margin-top: 20px; 
          padding-top: 20px; 
          border-top: 1px solid rgba(255,255,255,0.1); 
        }
        .grand-total span:last-child {
          font-family: var(--font-serif, serif);
          font-size: 1.5rem;
        }
        
        /* --- Form Styling --- */
        .shipping-form { display: flex; flex-direction: column; gap: 20px; }
        
        .form-heading { 
          margin: 0 0 10px 0; 
          font-size: 0.85rem; 
          text-transform: uppercase; 
          letter-spacing: 1.5px; 
          color: #fff; 
          display: flex; 
          align-items: center; 
          gap: 10px; 
          border-bottom: 1px solid rgba(255,255,255,0.05); 
          padding-bottom: 12px; 
          font-family: var(--font, sans-serif);
        }

        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        
        .form-group label { 
          font-size: 0.75rem; 
          color: #c4a775; 
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 600;
        }

        .muted-label { opacity: 0.5; font-size: 0.65rem; color: #fff;}
        
        .form-group input, .form-group textarea { 
          background: rgba(0,0,0,0.5); 
          border: 1px solid rgba(255,255,255,0.2); 
          color: white; 
          padding: 14px 16px; 
          border-radius: 0; /* Square edges */
          font-size: 1rem; /* Slightly larger */
          outline: none; 
          transition: border 0.2s; 
          font-family: var(--font, sans-serif); /* CHANGED TO SANS-SERIF */
          letter-spacing: 0.5px;
        }

        .form-group input:focus, .form-group textarea:focus { 
          border-color: #c4a775; 
          background: #000; 
        }

        .form-group input::placeholder, .form-group textarea::placeholder {
          color: #666;
          font-style: italic;
        }
        
        .submit-btn { 
          width: 100%;
          justify-content: center; 
          height: 54px !important; 
          font-size: 0.85rem !important; 
          letter-spacing: 2px !important;
        }
        
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 900px) { 
          .checkout-grid { grid-template-columns: 1fr; } 
          .luxury-panel { padding: 24px; }
          .form-row { grid-template-columns: 1fr; gap: 20px; }
        }

        @media (max-width: 600px) {
          .page-wrapper { padding: 0 2% 2%  0 !important; } /* Full width */
          .cart-container { padding: 10px 12px 80px; } /* Small side gaps */
          
          .header-section h1 { font-size: 1.5rem; }
          
          /* Grid layout: Image Left | Content Right */
          .cart-row-enhanced { 
            display: grid; 
            grid-template-columns: 80px 1fr; 
            gap: 15px; 
            align-items: start;
            position: relative;
            padding-bottom: 20px; 
            flex-direction: unset; 
          }
          
          .cart-img-wrapper { 
            width: 80px; 
            height: 80px; 
            margin-bottom: 0;
          }
          
          .cart-info { width: 100%; }
          .cart-info h4 { font-size: 0.9rem; }
          .price-tag { font-size: 1rem; }
          
          /* Controls below the text */
          .cart-controls {
            grid-column: 2;
            flex-direction: row;
            justify-content: space-between;
            width: 100%;
            padding-top: 10px;
            align-items: center;
          }
          
          .qty-selector button { width: 28px; height: 28px; font-size: 1rem; }
          .qty-selector span { font-size: 0.9rem; padding: 0 10px; }
          
          .delete-btn { color: #ef4444; }
          
          /* Click / Scroll Prompt */
          .mobile-scroll-indicator {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
            margin: 30px 0 10px;
            color: #c4a775;
            font-size: 0.8rem;
            letter-spacing: 2px;
            font-weight: 600;
            opacity: 0.8;
          }
          
          .bounce { animation: bounce 2s infinite; }
          
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
            40% {transform: translateY(-6px);}
            60% {transform: translateY(-3px);}
          }
        }
        
        /* Default hidden on desktop */
        .mobile-scroll-indicator { display: none; }
      `}} />
    </div>
  );
}