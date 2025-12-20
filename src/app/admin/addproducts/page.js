'use client';

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, UploadCloud, X, Loader2, ChevronDown } from "lucide-react"; // ✨ Added ChevronDown
import WaterButton from "@/components/WaterButton";
import TopNav from "@/components/TopNav";

const CATEGORIES = [
  "Clothing",
  "Electronics",
  "Accessories",
  "Jewellery",
  "Skin Care",
  "Home & Garden",
  "Beauty",
  "Skin Care",
  "Sports",
  "Others"
];

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);


  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Close dropdown if clicking outside
  const dropdownRef = useRef(null);
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
    image: "",
    description: "",
    highlights: "",
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  // ✨ NEW: Function to handle custom category click
  function selectCategory(cat) {
    setFormData((prev) => ({ ...prev, category: cat }));
    setIsDropdownOpen(false);
  }

  // DRAG AND DROP 
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  }
  function handleFileSelect(e) {
    if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
  }
  function handleFile(file) {
    if (!file.type.startsWith("image/")) { alert("Please upload an image file"); return; }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => setFormData((prev) => ({ ...prev, image: reader.result }));
  }
  function removeImage() {
    setFormData((prev) => ({ ...prev, image: "" }));
  }
 


  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      highlights: formData.highlights.split(",").map(h => h.trim()).filter(h => h),
      category: formData.category || "Others" 
    };

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create product");
      router.push("/admin/products");
      router.refresh(); 
    } catch (error) {
      console.error(error);
      alert("Error creating product.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <TopNav categories={[]} /> 

      <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '40px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '30px' }}>
          <Link href="/admin/products">
            <button className="icon-btn" style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)' }}>
              <ArrowLeft size={20} />
            </button>
          </Link>
          <h1 style={{ fontSize: '1.8rem', margin: 0 }}>Add New Product</h1>
        </div>

        <form className="panel" onSubmit={handleSubmit}>
          <div className="form-grid">
            
            {/* Image Upload */}
            <div style={{ gridColumn: '1 / -1', marginBottom: '10px' }}>
              <label>Product Image</label>
              {!formData.image ? (
                <div 
                  className={`drop-zone ${dragActive ? "active" : ""}`}
                  onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                  onClick={() => document.getElementById('file-upload').click()}
                >
                  <input type="file" id="file-upload" style={{ display: 'none' }} accept="image/*" onChange={handleFileSelect} />
                  <div style={{ pointerEvents: 'none' }}>
                    <UploadCloud size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                    <p style={{ margin: 0, fontWeight: 500 }}>Click or Drag image here</p>
                  </div>
                </div>
              ) : (
                <div style={{ position: 'relative', width: '100%', height: '200px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <img src={formData.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button type="button" onClick={removeImage} style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            <div>
              <label>Product Name</label>
              <input name="name" required placeholder="e.g. Neon Cyber Jacket" value={formData.name} onChange={handleChange} />
            </div>

            {/*  Custom Category */}
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <label>Category</label>
              
              {/* The "Box" users click on */}
              <button 
                type="button" 
                className="custom-select-trigger"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span style={{ color: formData.category ? '#fff' : '#94a3b8' }}>
                  {formData.category || "Select a category..."}
                </span>
                <ChevronDown size={16} style={{ opacity: 0.7, transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.2s' }} />
              </button>

              {/* The "Menu" that drops down */}
              {isDropdownOpen && (
                <div className="custom-options-list">
                  {CATEGORIES.map((cat) => (
                    <div 
                      key={cat} 
                      className={`custom-option ${formData.category === cat ? 'selected' : ''}`} 
                      onClick={() => selectCategory(cat)}
                    >
                      {cat}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', gridColumn: '1 / -1' }}>
              <div><label>Price ($)</label><input name="price" type="number" step="0.01" required placeholder="0.00" value={formData.price} onChange={handleChange} /></div>
              <div><label>Stock</label><input name="stock" type="number" required placeholder="0" value={formData.stock} onChange={handleChange} /></div>
              <div><label>Rating</label><input name="rating" type="number" step="0.1" max="5" value={formData.rating} onChange={handleChange} /></div>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label>Highlights <span style={{fontSize:'0.8rem', opacity:0.6}}>(Comma separated)</span></label>
              <input name="highlights" placeholder="e.g. Waterproof, Lightweight" value={formData.highlights} onChange={handleChange} />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label>Description</label>
              <textarea name="description" rows="4" required placeholder="Product details..." value={formData.description} onChange={handleChange} />
            </div>

            <div style={{ gridColumn: '1 / -1', marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
              <WaterButton variant="primary" type="submit" disabled={loading} style={{ minWidth: '160px' }}>
                {loading ? <Loader2 className="spin" size={18} /> : ( <> <Save size={18} style={{ marginRight: '8px' }} /> Save Product </> )}
              </WaterButton>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}