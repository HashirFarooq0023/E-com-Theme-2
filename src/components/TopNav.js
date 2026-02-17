'use client';

// ✅ FIXED IMPORTS: Added useEffect and useRef
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, User, Home, LayoutGrid, ChevronDown, Settings, List, Package, Users, MessageSquare, Menu, X } from "lucide-react";
import ChatWidget from "./ChatWidget";
import { useSettings } from "@/providers/SettingsProvider";

const EMPTY_CATEGORIES = [];

export default function TopNav({
  categories = EMPTY_CATEGORIES,
  selectedCategory,
  onSelectCategory,
  cartCount = 0,
  user,
}) {
  const settings = useSettings();
  const brandName = settings?.brand_name || "THE LUXURY";

  const pathname = usePathname();
  const isHome = pathname === "/";

  // State for dropdowns
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Local state for categories if not provided via props
  const [fetchedCategories, setFetchedCategories] = useState([]);

  // Use props unique categories if available, else use fetched ones
  const finalCategories = categories.length > 0 ? categories : fetchedCategories;

  // 1. Create a Ref to track the navigation DOM element
  const navRef = useRef(null);

  // Auto-fetch categories if not provided (e.g. on Auth page)
  useEffect(() => {
    if (categories.length === 0) {
      fetch('/api/categories')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setFetchedCategories(data);
        })
        .catch(err => console.error("TopNav: Failed to load categories", err));
    }
  }, [categories]);

  // 2. Add Event Listener to detect clicks outside
  useEffect(() => {
    function handleClickOutside(event) {
      // If the nav exists and the click happened OUTSIDE of it
      if (navRef.current && !navRef.current.contains(event.target)) {
        setIsCatOpen(false);
        setIsAdminOpen(false);
        setIsChatOpen(false);
        // Do not close mobile menu on outside click, use X button
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);


  function handleSelect(category) {
    if (onSelectCategory) onSelectCategory(category);
    setIsCatOpen(false);
    setIsMobileMenuOpen(false); // Close mobile menu on selection
  }

  function getInitials(name) {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  const styles = {
    wrapper: {
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      overflow: 'hidden',
      border: '1px solid #c4a775',
    },
    initials: {
      width: '100%',
      height: '100%',
      background: '#0e0e0e',
      color: '#c4a775',
      fontSize: '10px',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
    },
    img: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    }
  };

  return (
    <nav className="top-nav" ref={navRef}>
      {/* --- LEFT: HAMBURGER (Mobile Only) --- */}
      <button
        className="icon-btn hide-on-desktop"
        style={{ marginRight: '15px', border: 'none' }}
        onClick={() => setIsMobileMenuOpen(true)}
      >
        <Menu size={24} />
      </button>


      {/* --- LEFT: Actions (Logo & Desktop Nav) --- */}
      <div className="nav-left">
        <Link href="/" className="logo logo-golden-wave">
          {brandName}
        </Link>

        {/* DESKTOP NAV ITEMS (Hidden on Mobile) */}
        <div className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
          <Link
            href="/"
            className={`nav-pill-btn ${isHome && !selectedCategory ? "active" : ""}`}
            onClick={() => handleSelect(null)}
          >
            <Home size={16} strokeWidth={1.5} style={{ opacity: 0.8 }} />
            <span>Home</span>
          </Link>

          <div className="nav-dropdown-wrapper">
            <button
              className={`nav-pill-btn ${selectedCategory ? "active" : ""} ${isCatOpen ? "open" : ""}`}
              onClick={() => { setIsCatOpen(!isCatOpen); setIsAdminOpen(false); }}
            >
              <LayoutGrid size={16} strokeWidth={1.5} style={{ opacity: 0.8 }} />
              <span>Categories</span>
              <ChevronDown
                size={12}
                className="pill-caret"
                style={{ transform: isCatOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
              />
            </button>

            <div className={`nav-dropdown-menu ${isCatOpen ? "open" : ""}`}>
              <button className={`dropdown-item ${!selectedCategory ? "active" : ""}`} onClick={() => handleSelect(null)}>
                All Products
              </button>
              <div className="dropdown-divider"></div>
              {finalCategories && finalCategories.length > 0 ? (
                finalCategories.map((cat) => (
                  <button key={cat} className={`dropdown-item ${selectedCategory === cat ? "active" : ""}`} onClick={() => handleSelect(cat)}>
                    {cat}
                  </button>
                ))
              ) : (
                <div style={{ padding: '14px 20px', fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>No categories</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- RIGHT: Actions --- */}
      <div className="nav-right">

        {/* Chat - Desktop Only (Mobile has toggle button) */}
        <div className="nav-dropdown-wrapper hide-on-mobile">
          <button
            className={`icon-btn ${isChatOpen ? "active" : ""}`}
            onClick={() => { setIsChatOpen(!isChatOpen); setIsAdminOpen(false); setIsCatOpen(false); }}
            title="Chat with AI"
          >
            <MessageSquare size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* --- MOVED CHAT WIDGET HERE (Outside hidden div) --- */}
        <ChatWidget isOpen={isChatOpen} setIsOpen={setIsChatOpen} />

        {/* Cart */}
        <Link href="/cart" className={`icon-btn ${pathname === "/cart" ? "active" : ""}`} title="Cart">
          <ShoppingBag size={18} strokeWidth={1.5} />
          {cartCount > 0 && <span className="icon-badge">{cartCount}</span>}
        </Link>

        {/* User - Desktop Only (Mobile in Menu) */}
        <Link href="/auth" className={`icon-btn hide-on-mobile ${pathname === "/auth" ? "active" : ""}`} title="Account">
          {user ? (
            <div style={styles.wrapper}>
              {user.imageUrl ? (
                <img src={user.imageUrl} alt="Profile" style={styles.img} />
              ) : (
                <div style={styles.initials}>{getInitials(user.name)}</div>
              )}
            </div>
          ) : (
            <User size={18} strokeWidth={1.5} />
          )}
        </Link>

        {/* Admin - Desktop Only */}
        {user && user.role === 'admin' && (
          <div className="nav-dropdown-wrapper hide-on-mobile">
            <div className="nav-divider" style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.1)', margin: '0 8px' }}></div>
            <button
              className={`nav-pill-btn ${isAdminOpen ? "active" : ""}`}
              onClick={() => { setIsAdminOpen(!isAdminOpen); setIsCatOpen(false); }}
              style={{ paddingLeft: '12px', paddingRight: '12px', color: '#c4a775', borderColor: 'rgba(196, 167, 117, 0.3)' }}
            >
              <Settings size={16} strokeWidth={1.5} />
              <span>Admin</span>
            </button>
            <div className={`nav-dropdown-menu admin-menu ${isAdminOpen ? "open" : ""}`}>
              <div className="menu-header">Management</div>
              <Link href="/admin/products" className="dropdown-item" onClick={() => setIsAdminOpen(false)}>Products</Link>
              <Link href="/admin/orders" className="dropdown-item" onClick={() => setIsAdminOpen(false)}>Orders</Link>
              <Link href="/admin/customers" className="dropdown-item" onClick={() => setIsAdminOpen(false)}>Customers</Link>
              <div className="dropdown-divider"></div>
              <Link href="/admin/settings" className="dropdown-item" onClick={() => setIsAdminOpen(false)}>Settings</Link>
            </div>
          </div>
        )}
      </div>

      {/* --- MOBILE MENU OVERLAY --- */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay animate-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
            <span className="logo logo-golden-wave" style={{ fontSize: '20px' }}>{brandName}</span>
            <button onClick={() => setIsMobileMenuOpen(false)} style={{ background: 'none', border: 'none', color: '#fff' }}>
              <X size={32} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Link href="/" className="nav-pill-btn" onClick={() => handleSelect(null)} style={{ fontSize: '1.2rem', padding: '15px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              HOME
            </Link>

            <div style={{ padding: '15px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '2px' }}>Categories</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', paddingLeft: '10px' }}>
                <button onClick={() => handleSelect(null)} style={{ textAlign: 'left', color: !selectedCategory ? '#c4a775' : '#fff', background: 'none', border: 'none', fontSize: '1rem', textTransform: 'uppercase' }}>
                  All Collection
                </button>
                {finalCategories.map(cat => (
                  <button key={cat} onClick={() => handleSelect(cat)} style={{ textAlign: 'left', color: selectedCategory === cat ? '#c4a775' : '#ccc', background: 'none', border: 'none', fontSize: '1rem', textTransform: 'uppercase' }}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={() => { setIsMobileMenuOpen(false); setIsChatOpen(true); }} style={{ fontSize: '1.2rem', padding: '15px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '10px', width: '100%', textAlign: 'left', background: 'none', border: 'none', color: '#fff' }}>
              <MessageSquare size={20} /> CHAT WITH AI
            </button>

            <Link href="/auth" onClick={() => setIsMobileMenuOpen(false)} style={{ fontSize: '1.2rem', padding: '15px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <User size={20} /> ACCOUNT
            </Link>

            {user && user.role === 'admin' && (
              <div style={{ marginTop: '20px' }}>
                <div style={{ color: '#c4a775', fontSize: '0.9rem', marginBottom: '15px', fontWeight: 'bold' }}>ADMINISTRATION</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', paddingLeft: '10px' }}>
                  <Link href="/admin/products" onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#ccc' }}>Products</Link>
                  <Link href="/admin/orders" onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#ccc' }}>Orders</Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}