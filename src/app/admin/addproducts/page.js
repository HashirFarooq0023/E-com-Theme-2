'use client';

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, UploadCloud, X, Loader2, ChevronDown } from "lucide-react"; 
import WaterButton from "@/components/WaterButton";
import TopNav from "@/components/TopNav";
import { useRouteAccess } from "@/hooks/useRouteAccess";

const CATEGORIES = [
  "Clothing", "Electronics", "Accessories", "Jewellery",
  "Skin Care", "Home & Garden", "Beauty", "Sports", "Others"
];

export default function AddProductPage() {
  // Use centralized permission check
  const { user, loading: checkingAuth } = useRouteAccess();
  const router = useRouter();

  // Form State
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const dropdownRef = useRef(null);

  // Close dropdown if clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "", 
    stock: "",
    rating: 4.5,
    images: [], 
    description: "",
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function selectCategory(cat) {
    setFormData((prev) => ({ ...prev, category: cat }));
    setIsDropdownOpen(false);
  }

  // --- IMAGE UPLOAD HANDLERS ---
  function handleDrag(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }

  function handleFileSelect(e) {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  }

  function handleFiles(files) {
    const currentCount = formData.images.length;
    const newCount = files.length;

    if (currentCount + newCount > 5) {
      alert("You can only upload a maximum of 5 images per product.");
      return;
    }

    Array.from(files).forEach(file => {
      if (!file.type.startsWith("image/")) {
        alert(`${file.name} is not an image file.`);
        return;
      }

      // Check file size (max 2MB per image to prevent timeout)
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        alert(`${file.name} is too large. Maximum size is 2MB per image.`);
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, reader.result]
        }));
      };
      reader.onerror = () => {
        alert(`Failed to read ${file.name}. Please try again.`);
      };
    });
  }

  function removeImage(indexToRemove) {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove)
    }));
  }

  // --- SUBMIT TO DATABASE ---
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    if (formData.images.length === 0) {
      alert("Please upload at least one image.");
      setLoading(false);
      return;
    }

    const payload = {
      name: formData.name,
      price: parseFloat(formData.price),
      category: formData.category || "Others",
      stock: parseInt(formData.stock) || 0,
      rating: parseFloat(formData.rating) || 0,
      description: formData.description || "",
      images: formData.images 
    };

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create product");
      }
      
      router.push("/admin/products");
      router.refresh(); 
    } catch (error) {
      console.error(error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  // 3. RENDER LOADER WHILE CHECKING
  if (checkingAuth) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0e0e0e' }}>
        <Loader2 className="spin" size={40} color="#c4a775" />
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <TopNav categories={[]} user={user} /> 

      <div className="product-form-container">
        
        <div className="form-header">
          <Link href="/admin/products">
            <button className="back-btn">
              <ArrowLeft size={20} />
            </button>
          </Link>
          <div className="header-content">
            <h1>Add New Product</h1>
          </div>
        </div>

        <form className="product-form-panel" onSubmit={handleSubmit}>
          <div className="form-grid">
            
            {/* --- IMAGE SECTION --- */}
            <div className="form-section image-section">
              <label className="section-label">
                Product Images 
                <span className="image-count">{formData.images.length} / 5 Uploaded</span>
              </label>

              {/* File Size Warning */}
              <div className="file-warning">
                <strong>⚠️ File Size Limits:</strong>
                <ul>
                  <li>Maximum <strong>2MB per image</strong></li>
                </ul>
              </div>

              {/* Upload Box */}
              {formData.images.length < 5 && (
                <div 
                  className={`drop-zone ${dragActive ? "active" : ""}`}
                  onDragEnter={handleDrag} 
                  onDragLeave={handleDrag} 
                  onDragOver={handleDrag} 
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('file-upload').click()}
                >
                  <input 
                    type="file" 
                    id="file-upload" 
                    multiple 
                    style={{ display: 'none' }} 
                    accept="image/*" 
                    onChange={handleFileSelect} 
                  />
                  <div>
                    <UploadCloud size={40} className="upload-icon" />
                    <p>Click or Drag images here (Max 5)</p>
                  </div>
                </div>
              )}

              {/* Image Preview Grid */}
              {formData.images.length > 0 && (
                <div className="image-grid">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="image-preview">
                      <img src={img} alt={`Preview ${idx}`} />
                      <button 
                        type="button" 
                        onClick={() => removeImage(idx)} 
                        className="remove-image-btn"
                      >
                        <X size={14} />
                      </button>
                      {idx === 0 && (
                        <div className="main-cover-badge">Main Cover</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Inputs */}
            <div className="form-field">
              <label>Product Name</label>
              <input 
                name="name" 
                required 
                placeholder="e.g. Classic Gold Timepiece" 
                value={formData.name} 
                onChange={handleChange} 
              />
            </div>

            <div ref={dropdownRef} className="form-field category-field">
              <label>Category</label>
              <button 
                type="button" 
                className="custom-select-trigger"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span className={formData.category ? 'selected' : 'placeholder'}>
                  {formData.category || "Select a category..."}
                </span>
                <ChevronDown size={16} className={`chevron ${isDropdownOpen ? 'open' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="custom-options-list">
                  {CATEGORIES.map((cat, idx) => (
                    <div 
                      key={`${cat}-${idx}`} 
                      className={`custom-option ${formData.category === cat ? 'selected' : ''}`} 
                      onClick={() => selectCategory(cat)}
                    >
                      {cat}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Price (PKR)</label>
                <input 
                  name="price" 
                  type="number" 
                  step="0.01" 
                  required 
                  placeholder="0.00" 
                  value={formData.price} 
                  onChange={handleChange} 
                />
              </div>
              <div className="form-field">
                <label>Stock</label>
                <input 
                  name="stock" 
                  type="number" 
                  required 
                  placeholder="0" 
                  value={formData.stock} 
                  onChange={handleChange} 
                />
              </div>
              <div className="form-field">
                <label>Rating</label>
                <input 
                  name="rating" 
                  type="number" 
                  step="0.1" 
                  max="5" 
                  value={formData.rating} 
                  onChange={handleChange} 
                />
              </div>
            </div>

            <div className="form-field full-width">
              <label>Description</label>
              <textarea 
                name="description" 
                rows="4" 
                required 
                placeholder="Product details..." 
                value={formData.description} 
                onChange={handleChange} 
              />
            </div>

            <div className="form-actions">
              <WaterButton variant="primary" type="submit" disabled={loading}>
                {loading ? (
                  <Loader2 className="spin" size={18} />
                ) : (
                  <>
                    <Save size={18} style={{ marginRight: '8px' }} /> 
                    Save Product
                  </>
                )}
              </WaterButton>
            </div>
          </div>
        </form>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        /* Let the wrapper span 100% of the viewport width */
        :global(body) {
          background-color: #0e0e0e !important; 
        }

        .page-wrapper { 
          background: transparent; 
          color: #e2e8f0; 
          min-height: 100vh; 
          padding: 0 5%;
          width: 100%; 
          font-family: var(--font-serif, serif); 
        }

        /* Restrict the content width like the rest of the site */
        .product-form-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px 24px 80px;
        }

        .form-header {
          display: flex;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 32px;
          margin-top: 20px;
        }

        .back-btn {
          width: 44px;
          height: 44px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: white;
          transition: all 0.2s;
        }

        .back-btn:hover {
          background: rgba(196, 167, 117, 0.1);
          border-color: #c4a775;
          color: #c4a775;
        }

        .header-content {
          flex: 1;
        }

        .header-content h1 {
          font-size: 2rem;
          margin: 0 0 4px 0;
          color: white;
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: var(--font, sans-serif);
          text-transform: uppercase;
          letter-spacing: 2px;
        }

        .product-form-panel {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0px; 
          padding: 32px;
          backdrop-filter: blur(10px);
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }

        .form-section {
          grid-column: 1 / -1;
        }

        .section-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          font-weight: 600;
          color: #c4a775; /* Gold text */
          font-size: 0.95rem;
          font-family: var(--font, sans-serif);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .image-count {
          font-size: 0.85rem;
          opacity: 0.7;
          font-weight: 400;
          color: #888;
        }

        .file-warning {
          background: rgba(196, 167, 117, 0.05);
          border: 1px solid rgba(196, 167, 117, 0.3);
          border-radius: 0px;
          padding: 16px;
          margin-bottom: 20px;
          font-size: 0.85rem;
          color: #c4a775;
        }

        .file-warning strong {
          display: block;
          margin-bottom: 8px;
        }

        .file-warning ul {
          margin: 8px 0 0 0;
          padding-left: 24px;
          line-height: 1.8;
        }

        .drop-zone {
          border: 2px dashed rgba(255, 255, 255, 0.2);
          border-radius: 0px;
          padding: 40px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s;
          background: rgba(255, 255, 255, 0.02);
          margin-bottom: 20px;
        }

        .drop-zone:hover,
        .drop-zone.active {
          border-color: #c4a775;
          background: rgba(196, 167, 117, 0.05);
        }

        .upload-icon {
          margin: 0 auto 16px;
          color: #c4a775;
        }

        .drop-zone p {
          margin: 0;
          font-weight: 500;
          color: #cbd5e1;
        }

        .image-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 16px;
        }

        .image-preview {
          position: relative;
          aspect-ratio: 1;
          border-radius: 0px;
          overflow: hidden;
          border: 2px solid rgba(255, 255, 255, 0.1);
          background: #000;
        }

        .image-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .remove-image-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          background: rgba(0, 0, 0, 0.8);
          border: none;
          color: #ff4d4d;
          border-radius: 0%;
          width: 28px;
          height: 28px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .remove-image-btn:hover {
          background: rgba(255, 77, 77, 0.2);
          transform: scale(1.1);
        }

        .main-cover-badge {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(196, 167, 117, 0.8); /* Gold background */
          color: #000;
          font-size: 10px;
          text-align: center;
          padding: 4px 0;
          font-weight: 700;
          text-transform: uppercase;
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-field.full-width {
          grid-column: 1 / -1;
        }

        .form-field label {
          font-weight: 500;
          color: #c4a775;
          font-size: 0.9rem;
          font-family: var(--font, sans-serif);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .form-field input,
        .form-field textarea {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0px;
          padding: 12px 16px;
          color: white;
          font-size: 1rem;
          outline: none;
          transition: all 0.2s;
          font-family: var(--font-serif, serif);
        }

        .form-field input:focus,
        .form-field textarea:focus {
          border-color: #c4a775;
          background: rgba(255, 255, 255, 0.08);
        }

        .form-field input::placeholder,
        .form-field textarea::placeholder {
          color: #64748b;
        }

        .form-field textarea {
          resize: vertical;
          min-height: 100px;
        }

        .form-row {
          grid-column: 1 / -1;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .category-field {
          position: relative;
        }

        .custom-select-trigger {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0px;
          padding: 12px 16px;
          color: white;
          font-size: 1rem;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.2s;
          width: 100%;
          font-family: var(--font-serif, serif);
        }

        .custom-select-trigger:hover {
          border-color: #c4a775;
          background: rgba(255, 255, 255, 0.08);
        }

        .custom-select-trigger .placeholder {
          color: #94a3b8;
        }

        .custom-select-trigger .selected {
          color: white;
        }

        .chevron {
          transition: transform 0.2s;
        }

        .chevron.open {
          transform: rotate(180deg);
          color: #c4a775;
        }

        .custom-options-list {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          background: rgba(20, 20, 25, 0.95);
          border: 1px solid rgba(196, 167, 117, 0.5); /* Gold border */
          border-radius: 0px;
          overflow: hidden;
          z-index: 100;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
          max-height: 250px;
          overflow-y: auto;
        }

        .custom-option {
          padding: 12px 16px;
          color: #cbd5e1;
          cursor: pointer;
          transition: all 0.2s;
          font-family: var(--font-serif, serif);
        }

        .custom-option:hover {
          background: rgba(255, 255, 255, 0.05);
          color: white;
        }

        .custom-option.selected {
          background: rgba(196, 167, 117, 0.1); /* Gold tint */
          color: #c4a775;
          font-weight: 600;
        }

        .form-actions {
          grid-column: 1 / -1;
          margin-top: 20px;
          display: flex;
          justify-content: flex-end;
        }

        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .product-form-panel {
            padding: 24px;
          }

          .header-content h1 {
            font-size: 1.5rem;
          }
        }
      `}} />
    </div>
  );
}