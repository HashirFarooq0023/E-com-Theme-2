'use client';

import Link from "next/link";
import { useSettings } from "@/providers/SettingsProvider";
import {
  Facebook, Instagram, Twitter, Phone,
  MessageCircle, Mail, Ghost, Video, MapPin
} from "lucide-react";

export default function Footer() {
  const settings = useSettings();

  const config = settings || {
    brand_name: "THE LUXURY",
    brand_description: "Exclusive Limited Edition Timepieces and Accessories.",
  };

  return (
    <footer className="site-footer">
      {/* Golden Glow Effect */}
      <div className="glow-effect" />

      <div className="container">
        <div className="footer-grid">

          {/* Brand Info */}
          <div className="col-brand">
            {config.logo_url ? (
              <img src={config.logo_url} alt={config.brand_name} className="footer-logo" />
            ) : (
              <h2 className="brand-name">{config.brand_name}</h2>
            )}

            <p className="brand-desc">{config.brand_description}</p>

            <div className="contact-list">
              {config.email_address && (
                <div className="contact-item">
                  <Mail size={16} color="#c4a775" /> <span>{config.email_address}</span>
                </div>
              )}
              {config.helpline_number && (
                <div className="contact-item">
                  <Phone size={16} color="#c4a775" /> <span>{config.helpline_number}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-links">
            <h3>Shop</h3>
            <ul>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/cart">My Cart</Link></li>
              <li><Link href="/auth">Login</Link></li>
            </ul>
          </div>

          {/* Help & Policies */}
          <div className="col-links">
            <h3>Policies</h3>
            <div className="policy-block">
              <h4>Shipping</h4>
              <p>Shipping time 3 to 4 working days (can delay due to some circumstances).</p>
            </div>
            <div className="policy-block">
              <h4>Returns & Exchange</h4>
              <p>Return and exchange only if mentioned in product description.</p>
            </div>
          </div>

          {/* Social Media */}
          <div className="col-social">
            <h3>Follow Us</h3>
            <div className="social-row">
              {config.facebook_url && (
                <a href={config.facebook_url} target="_blank" className="social-btn fb"><Facebook size={18} /></a>
              )}
              {config.instagram_url && (
                <a href={config.instagram_url} target="_blank" className="social-btn insta"><Instagram size={18} /></a>
              )}
              {config.tiktok_url && (
                <a href={config.tiktok_url} target="_blank" className="social-btn tiktok"><Video size={18} /></a>
              )}
              {config.snapchat_url && (
                <a href={config.snapchat_url} target="_blank" className="social-btn snap"><Ghost size={18} /></a>
              )}
              {config.whatsapp_number && (
                <a href={`https://wa.me/${config.whatsapp_number}`} target="_blank" className="social-btn wa"><MessageCircle size={18} /></a>
              )}
            </div>
          </div>

        </div>

        <div className="copyright">
          © {new Date().getFullYear()} {config.brand_name}. ALL RIGHTS RESERVED.
        </div>
      </div>

      {/* ✅ FIXED: Luxury Theme CSS */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .site-footer {
          background: #0e0e0e;
          border-top: 1px solid rgba(196, 167, 117, 0.2); /* Subtle gold border */
          padding: 100px 20px 40px;
          color: #a0a0a0;
          position: relative;
          overflow: hidden;
          margin-top: auto;
          font-family: var(--font-serif, serif);
        }
        
        /* Golden Glow */
        .glow-effect {
          position: absolute;
          bottom: 0; left: 50%; transform: translateX(-50%);
          width: 80%; height: 300px;
          background: radial-gradient(circle, rgba(196, 167, 117, 0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        .container { max-width: 1400px; margin: 0 auto; position: relative; z-index: 1; }
        
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1.5fr;
          gap: 60px;
          margin-bottom: 80px;
        }

        /* Typography Updates */
        .brand-name { 
          font-family: var(--font, sans-serif);
          color: white; 
          font-size: 1.5rem; 
          margin-bottom: 20px; 
          font-weight: 700; 
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .footer-logo {
          height: 60px;
          object-fit: contain;
          margin-bottom: 20px;
          display: block;
          border-radius: 50%;
        }
        
        .brand-desc { 
          line-height: 1.8; 
          margin-bottom: 30px; 
          font-size: 0.95rem; 
          max-width: 300px;
          color: #888;
        }
        
        .contact-item { 
          display: flex; 
          align-items: center; 
          gap: 12px; 
          margin-bottom: 12px; 
          color: #ccc; 
          font-size: 0.9rem;
        }
        
        .col-links h3, .col-social h3 { 
          font-family: var(--font, sans-serif);
          color: white; 
          margin-bottom: 24px; 
          font-size: 0.9rem; 
          font-weight: 700; 
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }

        .col-links ul { list-style: none; padding: 0; margin: 0; }
        .col-links li { margin-bottom: 14px; }
        
        .col-links a { 
          color: #a0a0a0; 
          text-decoration: none; 
          transition: all 0.3s ease;
          font-size: 0.9rem;
          letter-spacing: 0.5px;
        }
        
        .col-links a:hover { 
          color: #c4a775; 
          padding-left: 5px; 
        }

        .policy-block {
          margin-bottom: 20px;
        }

        .policy-block h4 {
          color: #fff;
          font-size: 0.85rem;
          margin-bottom: 5px;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-family: var(--font, sans-serif);
        }

        .policy-block p {
          color: #888;
          font-size: 0.85rem;
          line-height: 1.5;
          margin: 0;
        }

        /* Social Icons - Sharp & Gold */
        .social-row { display: flex; gap: 12px; flex-wrap: wrap; }
        
        .social-btn {
          width: 44px; height: 44px;
          border-radius: 0; /* Square corners */
          background: transparent;
          display: flex; align-items: center; justify-content: center;
          color: #fff; 
          border: 1px solid rgba(255,255,255,0.15);
          transition: all 0.3s ease;
        }
        
        .social-btn:hover { 
          background: #c4a775; 
          border-color: #c4a775;
          color: #000; /* Black icon on gold bg */
          transform: translateY(-2px); 
        }
        
        .copyright { 
          text-align: center; 
          border-top: 1px solid rgba(255,255,255,0.05); 
          padding-top: 30px; 
          font-size: 0.75rem; 
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #666;
        }

        @media (max-width: 900px) {
          .footer-grid { grid-template-columns: 1fr; gap: 50px; }
          .brand-desc { max-width: 100%; }
        }
      `}} />
    </footer>
  );
}