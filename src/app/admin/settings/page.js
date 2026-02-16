'use client';

import { useState, useEffect } from "react";
import { Save, Loader2, Globe, Phone, Mail, FileText, Share2 } from "lucide-react";
import WaterButton from "@/components/WaterButton";
import TopNav from "@/components/TopNav";
import Toast from "@/components/Toast";
import ImageUpload from "@/components/ImageUpload"; // Added import
import { useRouteAccess } from "@/hooks/useRouteAccess";

const EMPTY_CATEGORIES = [];

export default function AdminSettingsPage() {
    const { user, loading: authLoading } = useRouteAccess();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settingsLoaded, setSettingsLoaded] = useState(false); // Track if fetched
    const [toast, setToast] = useState({ show: false, message: '', id: 0 });

    const [formData, setFormData] = useState({
        brand_name: "",
        brand_description: "",
        logo_url: "",
        email_address: "",
        helpline_number: "",
        whatsapp_number: "",
        facebook_url: "",
        instagram_url: "",
        tiktok_url: "",
        snapchat_url: ""
    });

    // Fetch Settings (Only Once)
    useEffect(() => {
        if (!authLoading && user && !settingsLoaded) {
            async function fetchSettings() {
                try {
                    const res = await fetch("/api/settings");
                    const data = await res.json();
                    if (res.ok) {
                        setFormData({
                            brand_name: data.brand_name || "",
                            brand_description: data.brand_description || "",
                            logo_url: data.logo_url || "",
                            email_address: data.email_address || "",
                            helpline_number: data.helpline_number || "",
                            whatsapp_number: data.whatsapp_number || "",
                            facebook_url: data.facebook_url || "",
                            instagram_url: data.instagram_url || "",
                            tiktok_url: data.tiktok_url || "",
                            snapchat_url: data.snapchat_url || ""
                        });
                    }
                } catch (error) {
                    console.error("Failed to fetch settings", error);
                    setToast({ show: true, message: "Failed to load settings", id: Date.now() });
                } finally {
                    setLoading(false);
                    setSettingsLoaded(true); // Mark as loaded
                }
            }
            fetchSettings();
        }
    }, [authLoading, user, settingsLoaded]);

    async function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setToast({ show: true, message: "Settings Saved Successfully", id: Date.now() });
            } else {
                throw new Error("Failed to save");
            }
        } catch (error) {
            setToast({ show: true, message: "Error Saving Settings", id: Date.now() });
        } finally {
            setSaving(false);
        }
    }

    function handleChange(e) {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    if (authLoading) return null;

    return (
        <div className="page-wrapper">
            <TopNav categories={EMPTY_CATEGORIES} user={user} />

            <Toast
                message={toast.message}
                isVisible={toast.show}
                id={toast.id}
                onClose={() => setToast(prev => ({ ...prev, show: false }))}
            />

            <div className="settings-container">

                {/* Header */}
                <div className="header-section">
                    <div className="header-info">
                        <h1 className="page-title">STORE SETTINGS</h1>
                        <div className="header-line"></div>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-state">
                        <Loader2 className="spin" size={32} color="#c4a775" />
                        <p>LOADING SETTINGS...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="settings-form">

                        {/* BRAND SECTION */}
                        <div className="form-section">
                            <div className="section-title">
                                <Globe size={18} color="#c4a775" />
                                <h3>BRAND IDENTITY</h3>
                            </div>

                            <div className="form-group full-width">
                                <label>STORE NAME</label>
                                <input name="brand_name" value={formData.brand_name} onChange={handleChange} placeholder="e.g. THE LUXURY" />
                            </div>

                            <div className="form-group full-width">
                                <label>DESCRIPTION (SEO)</label>
                                <textarea
                                    name="brand_description"
                                    value={formData.brand_description}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="Short description of your store..."
                                />
                            </div>

                            <div className="form-group full-width">
                                <label>LOGO IMAGE</label>
                                <div style={{ marginTop: '10px', marginBottom: '10px' }}>
                                    <ImageUpload
                                        value={formData.logo_url}
                                        onChange={(url) => setFormData(prev => ({ ...prev, logo_url: url }))}
                                        placeholder="Click or Drag Logo Here"
                                        base64={true}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* CONTACT SECTION */}
                        <div className="form-section">
                            <div className="section-title">
                                <Mail size={18} color="#c4a775" />
                                <h3>CONTACT DETAILS</h3>
                            </div>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label>EMAIL ADDRESS</label>
                                    <input name="email_address" value={formData.email_address} onChange={handleChange} placeholder="support@store.com" />
                                </div>
                                <div className="form-group">
                                    <label>HELPLINE NUMBER</label>
                                    <input name="helpline_number" value={formData.helpline_number} onChange={handleChange} placeholder="+92 300 1234567" />
                                </div>
                                <div className="form-group">
                                    <label>WHATSAPP NUMBER</label>
                                    <input name="whatsapp_number" value={formData.whatsapp_number} onChange={handleChange} placeholder="+92 300 1234567" />
                                </div>
                            </div>
                        </div>

                        {/* SOCIAL MEDIA SECTION */}
                        <div className="form-section">
                            <div className="section-title">
                                <Share2 size={18} color="#c4a775" />
                                <h3>SOCIAL LINKS</h3>
                            </div>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label>FACEBOOK URL</label>
                                    <input name="facebook_url" value={formData.facebook_url} onChange={handleChange} placeholder="https://facebook.com/..." />
                                </div>
                                <div className="form-group">
                                    <label>INSTAGRAM URL</label>
                                    <input name="instagram_url" value={formData.instagram_url} onChange={handleChange} placeholder="https://instagram.com/..." />
                                </div>
                                <div className="form-group">
                                    <label>TIKTOK URL</label>
                                    <input name="tiktok_url" value={formData.tiktok_url} onChange={handleChange} placeholder="https://tiktok.com/@..." />
                                </div>
                                <div className="form-group">
                                    <label>SNAPCHAT URL</label>
                                    <input name="snapchat_url" value={formData.snapchat_url} onChange={handleChange} placeholder="https://snapchat.com/add/..." />
                                </div>
                            </div>
                        </div>

                        {/* ACTION BAR */}
                        <div className="action-bar">
                            <WaterButton variant="primary" type="submit" disabled={saving} className="save-btn">
                                {saving ? <Loader2 className="spin" size={18} /> : <><Save size={18} style={{ marginRight: 8 }} /> SAVE CHANGES</>}
                            </WaterButton>
                        </div>

                    </form>
                )}
            </div>

            <style jsx>{`
        /* --- Layout --- */
        .page-wrapper { 
          background: transparent; 
          color: #e2e8f0; 
          min-height: 100vh; 
          padding: 0 5%;
          width: 100%; 
          font-family: var(--font-serif, serif); 
        }

        .settings-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 0 24px 80px;
        }

        /* --- Header --- */
        .header-section {
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
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

        /* --- Form Sections --- */
        .settings-form {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        .form-section {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 32px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .section-title h3 {
          margin: 0;
          font-size: 1rem;
          color: white;
          font-family: var(--font, sans-serif);
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .full-width {
          grid-column: span 2;
        }

        .form-group label {
          color: #c4a775;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .form-group input, .form-group textarea {
          background: #000;
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 14px 16px;
          color: white;
          font-size: 0.95rem;
          outline: none;
          font-family: var(--font, sans-serif);
          letter-spacing: 0.5px;
          transition: all 0.2s;
          border-radius: 0;
        }

        .form-group input:focus, .form-group textarea:focus {
          border-color: #c4a775;
          background: rgba(196, 167, 117, 0.05);
        }

        /* --- Action Bar --- */
        .action-bar {
          display: flex;
          justify-content: flex-end;
          padding-top: 20px;
        }

        .save-btn {
          height: 48px !important;
          padding: 0 40px !important;
          font-size: 0.85rem !important;
          letter-spacing: 2px !important;
        }

        .loading-state {
          padding: 80px;
          text-align: center;
          color: #c4a775;
          font-size: 0.8rem;
          letter-spacing: 2px;
          font-family: var(--font, sans-serif);
        }

        .loading-state p { margin-top: 16px; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 768px) {
          .form-grid { grid-template-columns: 1fr; }
          .full-width { grid-column: span 1; }
          .settings-container { padding: 0 12px 40px; }
          .form-section { padding: 20px; }
        }
      `}</style>
        </div>
    );
}
