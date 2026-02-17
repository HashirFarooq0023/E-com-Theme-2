'use client';

import { useState, useEffect } from "react";
import TopNav from "@/components/TopNav";
import { useRouteAccess } from "@/hooks/useRouteAccess";

const EMPTY_CATEGORIES = [];
import { Loader2, Search, Users, Mail, Calendar, Phone, MapPin } from "lucide-react";

export default function AdminCustomersPage() {
  // Use centralized permission check
  const { user, loading: authLoading } = useRouteAccess();

  // State
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // 1. Fetch Customers when user is authenticated
  useEffect(() => {
    if (!authLoading && user) {
      async function fetchCustomers() {
        try {
          const res = await fetch("/api/customers");
          const data = await res.json();
          setCustomers(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error("Failed to load customers", error);
        } finally {
          setLoading(false);
        }
      }
      fetchCustomers();
    }
  }, [authLoading, user]);

  // 2. Search Filter (Updated to include Phone)
  const filteredCustomers = customers.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  // Helper: Format Date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  if (!user && loading) return null;
  return (
    <div className="page-wrapper">
      <TopNav categories={EMPTY_CATEGORIES} user={user} />

      <div className="main-container">

        {/* HEADER */}
        <div className="header-section">
          <div>
            <h1>CLIENT DIRECTORY</h1>
            <div className="header-line"></div>
          </div>
          <div className="total-badge">
            <Users size={14} color="#c4a775" />
            {customers.length} REGISTERED
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="search-wrapper">
          <Search size={16} className="search-icon" color="#c4a775" />
          <input
            type="text"
            placeholder="SEARCH BY NAME, EMAIL, OR PHONE..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* CUSTOMERS TABLE */}
        <div className="table-panel">
          {loading ? (
            <div className="loading-state">
              <Loader2 className="spin" size={32} color="#c4a775" />
              <p>LOADING CLIENTS...</p>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="empty-state">
              <Users size={48} color="#c4a775" />
              <p>NO CLIENTS FOUND.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>CUSTOMER</th>
                    <th>CONTACT INFO</th>
                    <th>LOCATION</th>
                    <th>JOINED</th>
                    <th style={{ textAlign: 'center' }}>ORDERS</th>
                    <th style={{ textAlign: 'right' }}>TOTAL SPENT</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id}>
                      {/* Name & Avatar */}
                      <td>
                        <div className="user-cell">
                          <div className="avatar-placeholder">
                            {customer.name ? customer.name.charAt(0).toUpperCase() : "U"}
                          </div>
                          <span className="user-name">{customer.name || "GUEST"}</span>
                        </div>
                      </td>

                      {/* Contact (Email + Phone) */}
                      <td>
                        <div className="contact-col">
                          <div className="icon-text">
                            <Mail size={12} color="#c4a775" /> {customer.email}
                          </div>
                          {customer.phone && (
                            <div className="icon-text sub-text">
                              <Phone size={12} color="#c4a775" /> {customer.phone}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Location (City + Province) */}
                      <td>
                        {customer.city ? (
                          <div className="icon-text">
                            <MapPin size={12} color="#c4a775" />
                            {customer.city}, {customer.province}
                          </div>
                        ) : (
                          <span className="no-data">-</span>
                        )}
                      </td>

                      {/* Joined Date */}
                      <td>
                        <div className="icon-text">
                          <Calendar size={12} color="#c4a775" /> {formatDate(customer.created_at)}
                        </div>
                      </td>

                      {/* Stats: Orders */}
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${customer.total_orders > 0 ? 'active' : ''}`}>
                          {customer.total_orders}
                        </span>
                      </td>

                      {/* Stats: Spent */}
                      <td className="spent-col">
                        PKR {Number(customer.total_spent).toLocaleString()}
                      </td>
                    </tr>
                  ))}
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

        .main-container { 
          max-width: 1400px; 
          margin: 0 auto; 
          padding: 40px 24px 80px; 
        }

        /* --- Header --- */
        .header-section { 
          display: flex; 
          justify-content: space-between; 
          align-items: flex-end; 
          margin-bottom: 40px; 
          border-bottom: 1px solid rgba(255,255,255,0.05);
          padding-bottom: 20px;
        }

        h1 { 
          font-family: var(--font, sans-serif);
          margin: 0; 
          font-size: 2rem; 
          font-weight: 700;
          letter-spacing: 2px;
          color: white;
        }
        
        .header-line {
          width: 60px;
          height: 2px;
          background: #c4a775;
          margin-top: 15px;
        }

        .total-badge { 
          display: flex;
          align-items: center;
          gap: 10px;
          background: transparent; 
          color: #c4a775; 
          padding: 8px 16px; 
          border: 1px solid #c4a775; 
          font-weight: 600; 
          font-size: 0.75rem;
          letter-spacing: 1px;
          font-family: var(--font, sans-serif);
        }

        /* --- SEARCH --- */
        .search-wrapper {
          position: relative;
          margin-bottom: 40px;
        }
        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
        }
        .search-wrapper input {
          width: 100%;
          padding: 14px 14px 14px 44px;
          background: #000;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 0; /* Square edges */
          color: white;
          outline: none;
          font-size: 0.85rem;
          font-family: var(--font, sans-serif);
          letter-spacing: 1px;
          transition: all 0.3s ease;
        }
        .search-wrapper input:focus {
          border-color: #c4a775;
          background: rgba(196, 167, 117, 0.02);
        }

        /* --- TABLE --- */
        .table-panel {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0;
          overflow: hidden;
        }
        
        .custom-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .custom-table th {
          text-align: left;
          padding: 20px 24px;
          background: #111;
          color: #c4a775;
          font-weight: 600;
          font-size: 0.75rem;
          letter-spacing: 1px;
          text-transform: uppercase;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          font-family: var(--font, sans-serif);
        }
        
        .custom-table td {
          padding: 20px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          color: #e2e8f0;
          font-size: 0.85rem;
        }
        
        .custom-table tr:hover {
          background: rgba(196, 167, 117, 0.05);
        }

        .user-cell { display: flex; align-items: center; gap: 16px; }
        
        /* Square Avatar for Luxury Theme */
        .avatar-placeholder {
          width: 36px; 
          height: 36px;
          background: transparent;
          color: #c4a775;
          border: 1px solid #c4a775;
          border-radius: 0; /* Square */
          display: flex; 
          align-items: center; 
          justify-content: center;
          font-weight: 600;
          font-size: 0.9rem;
          font-family: var(--font, sans-serif);
        }
        
        .user-name { 
          font-weight: 600; 
          color: #fff; 
          letter-spacing: 0.5px; 
          text-transform: uppercase; 
          font-family: var(--font, sans-serif);
        }
        
        .icon-text {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #ccc;
          font-family: var(--font-serif, serif);
        }
        .sub-text {
          margin-top: 6px;
          color: #888;
          font-size: 0.8rem;
        }
        .no-data { color: #555; font-style: italic; }

        .badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 0;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #888;
          font-size: 0.75rem;
          font-weight: 600;
          font-family: var(--font, sans-serif);
        }
        .badge.active {
          background: transparent;
          color: #c4a775;
          border-color: #c4a775;
        }

        .spent-col {
          text-align: right;
          font-weight: 500;
          color: #c4a775 !important;
          font-family: var(--font-serif, serif);
          font-size: 1rem !important;
          letter-spacing: 0.5px;
        }

        /* --- States --- */
        .loading-state, .empty-state {
          text-align: center;
          padding: 80px;
          color: #c4a775;
          font-size: 0.8rem;
          letter-spacing: 2px;
          text-transform: uppercase;
          font-family: var(--font, sans-serif);
        }
        .spin { animation: spin 2s linear infinite; margin-bottom: 16px; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </div>
  );
}