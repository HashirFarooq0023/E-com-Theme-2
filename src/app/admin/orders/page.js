'use client';

import React, { useState, useEffect, useCallback } from "react";
import TopNav from "@/components/TopNav";
import WaterButton from "@/components/WaterButton";
import { useRouteAccess } from "@/hooks/useRouteAccess";
import { 
  Loader2, Calendar, Filter, Package, MapPin, 
  ChevronDown, ChevronUp, Clock, CheckCircle, XCircle, Settings 
} from "lucide-react";

export default function AdminOrdersPage() {
  // Use centralized permission check
  const { user, loading: authLoading } = useRouteAccess();
  
  // Data
  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null); 
  const [loading, setLoading] = useState(true);

  // Filter State
  const [activeFilter, setActiveFilter] = useState("all"); 
  const [customDates, setCustomDates] = useState({ start: "", end: "" });

  // 1. Stable Fetch Function
  const fetchOrders = useCallback(async (filterType, startDate = null, endDate = null) => {
    setLoading(true);
    setActiveFilter(filterType);
    
    try {
      let url = `/api/orders?filter=${filterType}`;
      if (filterType === 'custom' && startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load orders", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Fetch Orders when user is authenticated
  useEffect(() => {
    if (!authLoading && user) {
      fetchOrders("all");
    }
  }, [authLoading, user, fetchOrders]);

  // 3. Status Update Handler
  async function handleUpdateStatus(orderId, newStatus) {
    try {
      const res = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
  
      if (res.ok) {
        fetchOrders(activeFilter); 
      } else {
        const err = await res.json();
        alert(`Error: ${err.error || "Failed to update status"}`);
      }
    } catch (error) {
      console.error("Status update frontend error:", error);
      alert("Network error. Please try again.");
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#22c55e'; 
      case 'pending': return '#f59e0b';   
      case 'cancelled': return '#ef4444'; 
      default: return '#94a3b8';          
    }
  };

  if (!user && loading) return null; 

  return (
    <div className="page-wrapper"> {/* ✅ Changed from "page" to "page-wrapper" */}
      <TopNav categories={[]} user={user} />

      <div className="container">
        
        <div className="header-section">
          <div>
            <h1>Orders Management</h1>
            <p className="subtitle">Track and update customer order statuses.</p>
          </div>
          <div className="total-badge">
            Total Orders: {orders.length}
          </div>
        </div>

        {/* FILTERS */}
        <div className="filters-panel">
          <div className="filter-group">
            <Filter size={18} className="filter-icon" color="#c4a775" />
            <span className="filter-label">Quick Filters:</span>
            <button className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => fetchOrders('all')}>All</button>
            <button className={`filter-btn ${activeFilter === 'today' ? 'active' : ''}`} onClick={() => fetchOrders('today')}>Today</button>
            <button className={`filter-btn ${activeFilter === 'week' ? 'active' : ''}`} onClick={() => fetchOrders('week')}>Week</button>
            <button className={`filter-btn ${activeFilter === 'month' ? 'active' : ''}`} onClick={() => fetchOrders('month')}>Month</button>
          </div>
          <div className="divider"></div>
          <form onSubmit={(e) => { e.preventDefault(); fetchOrders('custom', customDates.start, customDates.end); }} className="date-group">
            <Calendar size={18} className="filter-icon" color="#c4a775" />
            <input type="date" className="date-input" value={customDates.start} onChange={(e) => setCustomDates({...customDates, start: e.target.value})} />
            <input type="date" className="date-input" value={customDates.end} onChange={(e) => setCustomDates({...customDates, end: e.target.value})} />
            
            {/* ✅ FIXED: Corrected Variant and added a specific class to fix the cramping */}
            <WaterButton variant="primary" type="submit" className="apply-date-btn">
              APPLY
            </WaterButton>
          </form>
        </div>

        <div className="orders-list">
          {loading ? (
            <div className="loading-state"><Loader2 className="spin" size={32} color="#c4a775" /><p>Loading...</p></div>
          ) : orders.length === 0 ? (
            <div className="empty-state"><Package size={48} color="#c4a775" /><p>No orders found.</p></div>
          ) : (
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th style={{textAlign: 'right'}}>Details</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const isExpanded = expandedOrderId === order.id;
                  const address = order.shipping_address || {};
                  const items = Array.isArray(order.items) ? order.items : [];

                  return (
                    <React.Fragment key={order.id}>
                      <tr className={`order-row ${isExpanded ? 'expanded' : ''}`} onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}>
                        <td className="mono">#{String(order.id).slice(0, 8)}</td>
                        <td>{new Date(order.created_at).toLocaleDateString()}</td>
                        <td>
                          <div className="customer-cell">
                            <span className="name">{address.name || "Guest"}</span>
                          </div>
                        </td>
                        <td className="order-total">PKR {Number(order.total_amount).toLocaleString()}</td>
                        <td>
                          <span className="status-badge" style={{ color: getStatusColor(order.status), borderColor: getStatusColor(order.status) }}>
                            {order.status}
                          </span>
                        </td>
                        <td style={{textAlign: 'right', color: '#c4a775'}}>{isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</td>
                      </tr>

                      {isExpanded && (
                        <tr className="details-row">
                          <td colSpan="6" style={{ padding: 0 }}> 
                            <div className="details-wrapper"> 
                              <div className="details-container">
                                {/* 1. Items */}
                                <div className="detail-col">
                                  <h4><Package size={14} color="#c4a775" /> Items</h4>
                                  <ul className="item-list">
                                    {items.map((item, idx) => (
                                      <li key={idx}>
                                        <div className="item-thumb-wrapper">
                                          {item.image ? (
                                            <img src={item.image} alt="p" className="item-thumb" />
                                          ) : (
                                            <div className="item-thumb-placeholder" />
                                          )}
                                        </div>
                                        <div className="item-info">
                                          <span className="item-name">{item.name}</span>
                                          <span className="item-meta">Qty: {item.quantity}</span>
                                        </div>
                                        <div style={{ marginLeft: 'auto' }}>
                                           <span className="item-total">PKR {(item.quantity * item.price).toLocaleString()}</span>
                                        </div>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                {/* 2. Shipping */}
                                <div className="detail-col">
                                  <h4><MapPin size={14} color="#c4a775" /> Shipping</h4>
                                  <div className="address-box">
                                    <p><strong>{address.name}</strong></p>
                                    <p>{address.house}, {address.street}</p>
                                    <p>{address.city}, {address.province}</p>
                                    <p style={{color: '#888'}}>{address.phone1}</p>
                                  </div>
                                </div>
                                {/* 3. Actions */}
                                <div className="detail-col actions-col">
                                  <h4><Settings size={14} color="#c4a775" /> Management</h4>
                                  <div className="action-buttons-stack">
                                    <button className="status-btn complete" onClick={() => handleUpdateStatus(order.id, 'completed')} disabled={order.status === 'completed'}>
                                      <CheckCircle size={14} /> Mark Completed
                                    </button>
                                    <button className="status-btn cancel" onClick={() => handleUpdateStatus(order.id, 'cancelled')} disabled={order.status === 'cancelled'}>
                                      <XCircle size={14} /> Cancel Order
                                    </button>
                                    <button className="status-btn reset" onClick={() => handleUpdateStatus(order.id, 'pending')} disabled={order.status === 'pending'}>
                                      <Clock size={14} /> Set Pending
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        /* ✅ FIXED: Force body background and let wrapper span 100% */
        :global(body) {
          background-color: #0e0e0e !important;
          margin: 0;
          padding: 0;
        }

        .page-wrapper { 
          background: transparent; 
          color: #e2e8f0; 
          min-height: 100vh; 
          padding: 0 5%;
          width: 100%; 
          font-family: var(--font-serif, serif); 
        }

        .container { 
          max-width: 1400px; 
          margin: 0 auto; 
          padding: 40px 24px; 
        }
        
        .header-section { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 20px; }
        h1 { margin: 0; font-size: 2rem; font-family: var(--font, sans-serif); text-transform: uppercase; letter-spacing: 2px; color: white; }
        .subtitle { color: #888; margin: 8px 0 0 0; font-size: 0.95rem; }
        
        .total-badge { background: transparent; color: #c4a775; padding: 8px 16px; border-radius: 0; border: 1px solid #c4a775; font-weight: 600; font-size: 0.75rem; letter-spacing: 1px; font-family: var(--font, sans-serif); }
        
        .filters-panel { background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 0; padding: 20px; display: flex; flex-wrap: wrap; align-items: center; gap: 24px; margin-bottom: 40px; }
        .filter-group, .date-group { display: flex; align-items: center; gap: 12px; }
        .filter-label { font-size: 0.75rem; color: #a0a0a0; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; font-family: var(--font, sans-serif); }
        
        .filter-btn { background: transparent; border: 1px solid rgba(255, 255, 255, 0.2); color: #cbd5e1; padding: 8px 16px; border-radius: 0; cursor: pointer; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; transition: all 0.2s; font-family: var(--font, sans-serif); }
        .filter-btn:hover { border-color: #c4a775; color: #c4a775; }
        .filter-btn.active { background: #c4a775; border-color: #c4a775; color: #000; font-weight: 600; }
        
        .date-input { background: #000; border: 1px solid rgba(255, 255, 255, 0.2); color: white; padding: 8px 12px; border-radius: 0; outline: none; font-size: 0.8rem; font-family: var(--font-serif, serif); height: 36px;}
        .date-input:focus { border-color: #c4a775; }
        
        /* Apply Date Button styling */
        .apply-date-btn {
          height: 36px !important;
          padding: 0 24px !important;
          font-size: 0.75rem !important;
          letter-spacing: 1.5px !important;
          font-style: normal !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        .divider { width: 1px; height: 30px; background: rgba(255, 255, 255, 0.1); }
        
        .orders-list { background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 0; overflow: hidden; }
        .orders-table { width: 100%; border-collapse: collapse; }
        .orders-table th { text-align: left; padding: 20px 24px; background: #111; color: #c4a775; font-size: 0.75rem; letter-spacing: 1px; text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.1); font-family: var(--font, sans-serif); }
        
        .order-row { border-bottom: 1px solid rgba(255, 255, 255, 0.05); cursor: pointer; transition: background 0.2s; }
        .order-row:hover { background: rgba(196, 167, 117, 0.05); }
        .order-row td { padding: 20px 24px; vertical-align: middle; font-size: 0.9rem; }
        
        .details-row td { background: #0a0a0a; border-bottom: 1px solid rgba(196, 167, 117, 0.2); }
        .details-wrapper { padding: 30px; animation: slideDown 0.3s ease-out; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }

        .details-container { display: grid; grid-template-columns: 1.5fr 1fr 0.8fr; gap: 40px; align-items: start; }

        .detail-col h4 { margin: 0 0 20px 0; color: #fff; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 2px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 12px; display: flex; align-items: center; gap: 10px; font-family: var(--font, sans-serif); }
        
        .item-list { list-style: none; padding: 0; margin: 0; }
        .item-list li { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .item-list li:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
        
        .item-thumb-wrapper { width: 50px; height: 50px; border-radius: 0; overflow: hidden; background: #000; flex-shrink: 0; border: 1px solid rgba(255,255,255,0.1); }
        .item-thumb { width: 100%; height: 100%; object-fit: cover; }
        .item-thumb-placeholder { width: 100%; height: 100%; background: #111; }
        
        .item-info { display: flex; flex-direction: column; gap: 4px; }
        .item-name { font-size: 0.85rem; font-weight: 600; color: white; text-transform: uppercase; letter-spacing: 0.5px; font-family: var(--font, sans-serif); }
        .item-meta { font-size: 0.75rem; color: #888; letter-spacing: 1px; font-family: var(--font, sans-serif); }
        .item-total { font-weight: 600; color: #c4a775; font-size: 0.95rem; }

        .address-box p { margin: 6px 0; font-size: 0.85rem; line-height: 1.6; color: #ccc; }
        .actions-col { border-left: 1px solid rgba(255,255,255,0.1); padding-left: 30px; }
        .action-buttons-stack { display: flex; flex-direction: column; gap: 12px; }
        
        .status-btn { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-radius: 0; border: 1px solid rgba(255,255,255,0.2); background: transparent; color: white; cursor: pointer; font-size: 0.7rem; letter-spacing: 1px; transition: all 0.3s ease; width: 100%; justify-content: flex-start; text-transform: uppercase; font-family: var(--font, sans-serif); }
        .status-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .status-btn.complete:hover:not(:disabled) { background: #fff; border-color: #fff; color: #000; }
        .status-btn.cancel:hover:not(:disabled) { background: #7f1d1d; border-color: #7f1d1d; color: #fff; }
        .status-btn.reset:hover:not(:disabled) { background: #c4a775; border-color: #c4a775; color: #000; }

        .order-total { font-weight: bold; color: #c4a775; }
        .mono { font-family: var(--font-serif, serif); color: #888; font-size: 0.85rem; }
        .customer-cell .name { font-weight: 600; color: #fff; letter-spacing: 0.5px; text-transform: uppercase; }
        .status-badge { padding: 6px 12px; border-radius: 0; border: 1px solid; font-size: 0.65rem; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; font-family: var(--font, sans-serif); }
        .loading-state, .empty-state { text-align: center; padding: 80px; color: #c4a775; font-size: 0.8rem; letter-spacing: 2px; text-transform: uppercase; font-family: var(--font, sans-serif); }
        .spin { animation: spin 2s linear infinite; margin-bottom: 16px; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        
        @media (max-width: 900px) { 
          .details-container { grid-template-columns: 1fr; gap: 30px; } 
          .actions-col { border-left: none; padding-left: 0; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 30px; } 
          .filters-panel { flex-direction: column; align-items: flex-start; }
          .divider { width: 100%; height: 1px; }
        }
      `}} />
    </div>
  );
}