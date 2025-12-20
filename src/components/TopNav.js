'use client';

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ShoppingBag, User, Home, LayoutGrid, ChevronDown, 
  Settings, List, Package, Users, LogIn, LogOut 
} from "lucide-react"; 
import { ROLE_NAVIGATION } from "@/config/navigation";

const ICON_MAP = { Home, LayoutGrid, Settings, Package, List, Users, LogIn };

export default function TopNav({
  categories = [],
  selectedCategory,
  onSelectCategory,
  cartCount = 0,
  user,
  role = "guest" // Default to guest if not provided
}) {
  const pathname = usePathname();
  
  // State for dropdowns
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  const navItems = ROLE_NAVIGATION[role] || ROLE_NAVIGATION.guest;

  function handleSelect(category) {
    if (onSelectCategory) onSelectCategory(category);
    setIsCatOpen(false);
  }

  return (
    <nav className="top-nav">
      {/* 👈 LEFT: Branding + Dynamic Nav Items */}
      <div className="nav-left">
        <Link href="/" className="logo">ShopLite</Link>

        {navItems.map((item, idx) => {
          const Icon = ICON_MAP[item.icon];
          
          // --- TYPE 1: STANDARD LINK ---
          if (item.type === "link") {
            const isActive = pathname === item.href && !selectedCategory;
            return (
              <Link key={idx} href={item.href} className={`nav-pill-btn ${isActive ? "active" : ""}`}>
                <Icon size={18} strokeWidth={2.5} />
                <span>{item.label}</span>
              </Link>
            );
          }

          // --- TYPE 2: CATEGORIES DROPDOWN ---
          if (item.type === "cat_dropdown") {
            return (
              <div key={idx} className="nav-dropdown-wrapper">
                <button 
                  className={`nav-pill-btn ${selectedCategory ? "active" : ""} ${isCatOpen ? "open" : ""}`}
                  onClick={() => { setIsCatOpen(!isCatOpen); setIsAdminOpen(false); }}
                >
                  <LayoutGrid size={18} strokeWidth={2.5} />
                  <span>Categories</span>
                  <ChevronDown size={14} className="pill-caret" style={{ transform: isCatOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                </button>
                <div className={`nav-dropdown-menu ${isCatOpen ? "open" : ""}`}>
                  <div className="dropdown-arrow"></div>
                  <button className={`dropdown-item ${!selectedCategory ? "active" : ""}`} onClick={() => handleSelect(null)}>
                    All Products
                  </button>
                  <div className="dropdown-divider"></div>
                  {categories.map((cat) => (
                    <button key={cat} className={`dropdown-item ${selectedCategory === cat ? "active" : ""}`} onClick={() => handleSelect(cat)}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            );
          }

          return null;
        })}
      </div>

      {/* 👉 RIGHT: Actions + Admin Settings Dropdown */}
      <div className="nav-right">
        {/* Cart Link (Visible to Customers/Guests) */}
        {role !== "admin" && (
          <Link href="/cart" className={`icon-btn ${pathname === "/cart" ? "active" : ""}`}>
            <ShoppingBag size={20} strokeWidth={2.5} />
            {cartCount > 0 && <span className="icon-badge">{cartCount}</span>}
          </Link>
        )}

        {/* User Account Link */}
        <Link href="/auth" className="icon-btn">
          {user?.imageUrl ? <img src={user.imageUrl} className="nav-avatar-img" /> : <User size={20} />}
        </Link>

        {/* --- TYPE 3: ADMIN SETTINGS DROPDOWN --- */}
        {navItems.some(i => i.type === "admin_dropdown") && (
          <>
            <div className="nav-divider"></div>
            <div className="nav-dropdown-wrapper">
              <button 
                className={`nav-pill-btn ${isAdminOpen ? "active" : ""}`}
                onClick={() => { setIsAdminOpen(!isAdminOpen); setIsCatOpen(false); }}
              >
                <Settings size={18} strokeWidth={2.5} />
                <span>Admin</span>
                <ChevronDown size={14} className="pill-caret" style={{ transform: isAdminOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
              </button>
              <div className={`nav-dropdown-menu admin-menu ${isAdminOpen ? "open" : ""}`}>
                <div className="dropdown-arrow" style={{ right: '20px', left: 'auto' }}></div>
                <div className="menu-header">Inventory</div>
                <Link href="/admin/products" className="dropdown-item" onClick={() => setIsAdminOpen(false)}>
                  <Package size={16} style={{ marginRight: '8px' }} /> View Products
                </Link>
                <div className="dropdown-divider"></div>
                <div className="menu-header">Users</div>
                <Link href="/admin/customers" className="dropdown-item" onClick={() => setIsAdminOpen(false)}>
                  <Users size={16} style={{ marginRight: '8px' }} /> Customers
                </Link>
                <button className="dropdown-item" style={{color: '#ef4444'}}>
                  <LogOut size={16} style={{ marginRight: '8px' }} /> Sign Out
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}