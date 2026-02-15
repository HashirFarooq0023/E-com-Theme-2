'use client';

import { useState } from 'react';
import { UploadCloud, X, Loader2 } from 'lucide-react';

export default function ImageUpload({ value, onChange, placeholder = "Upload Image" }) {
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);

    async function handleFiles(files) {
        const file = files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert("Please upload an image file");
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            if (res.ok) {
                onChange(data.url);
            } else {
                alert(data.error || "Upload failed");
            }
        } catch (error) {
            console.error(error);
            alert("Upload error");
        } finally {
            setUploading(false);
        }
    }

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

    return (
        <div className="image-upload-wrapper">
            {value ? (
                <div className="preview-container">
                    <img src={value} alt="Uploaded logo" className="preview-image" />
                    <button
                        type="button"
                        onClick={() => onChange('')}
                        className="remove-btn"
                    >
                        <X size={14} />
                    </button>
                </div>
            ) : (
                <div
                    className={`drop-zone ${dragActive ? "active" : ""}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('logo-upload').click()}
                >
                    <input
                        type="file"
                        id="logo-upload"
                        style={{ display: 'none' }}
                        accept="image/*"
                        onChange={(e) => handleFiles(e.target.files)}
                    />
                    <div className="upload-content">
                        {uploading ? (
                            <Loader2 className="spin" size={24} color="#c4a775" />
                        ) : (
                            <UploadCloud size={32} className="upload-icon" />
                        )}
                        <p>{uploading ? "Uploading..." : placeholder}</p>
                    </div>
                </div>
            )}

            <style jsx>{`
        .image-upload-wrapper {
          width: 100%;
        }

        .drop-zone {
          border: 2px dashed rgba(255, 255, 255, 0.2);
          padding: 30px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          background: rgba(255, 255, 255, 0.02);
        }

        .drop-zone:hover, .drop-zone.active {
          border-color: #c4a775;
          background: rgba(196, 167, 117, 0.05);
        }

        .upload-icon {
          color: #c4a775;
          margin-bottom: 10px;
        }

        .upload-content p {
          margin: 0;
          color: #cbd5e1;
          font-size: 0.9rem;
        }

        .preview-container {
          position: relative;
          width: fit-content;
          border: 1px solid rgba(255,255,255,0.1);
          padding: 8px;
          background: #000;
        }

        .preview-image {
          height: 60px;
          object-fit: contain;
          display: block;
        }

        .remove-btn {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
}
