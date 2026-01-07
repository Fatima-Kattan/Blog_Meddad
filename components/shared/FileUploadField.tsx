// src/components/auth/FileUploadField.tsx
import React, { useState } from 'react';

interface FileUploadFieldProps {
  label: string;
  name: string;
  onChange: (file: File | null) => void;
  accept?: string;
  error?: string;
}

const FileUploadField: React.FC<FileUploadFieldProps> = ({
  label,
  name,
  onChange,
  accept = 'image/*',
  error,
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
      setFileName(file.name);
      
      // إنشاء معاينة للصورة
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFileName('');
      setPreview(null);
    }
    
    onChange(file);
  };

  return (
    <div className="upload-group">
      <label className="upload-label">{label}</label>
      
      <div className="upload-area">
        <label htmlFor={name} className="upload-button">
          {preview ? 'edit image' : 'select image'}
          <input
            id={name}
            name={name}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
        
        {fileName && (
          <p className="file-name">{fileName}</p>
        )}
        
        {preview && (
          <div className="preview-container">
            <img 
              src={preview} 
              alt="Preview" 
              className="preview-image"
            />
          </div>
        )}
      </div>
      
      {error && <p className="error-message">{error}</p>}
      
      <style jsx>{`
        .upload-group {
          margin-bottom: 1rem;
        }
        
        .upload-label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #cfc3c3;
          font-size: 0.95rem;
        }
        
        .upload-area {
          border: 2px dashed #491f73ff;
          border-radius: 0.5rem;
          padding: 1.5rem;
          text-align: center;
          transition: all 0.3s ease;
        }
        
        .upload-area:hover {
          border-color: #b721ff;
        }
        
        .upload-button {
          display: inline-block;
          padding: 0.5rem 1.5rem;
          background-image: linear-gradient(to left, #7028e4 0%, #e5b2ca 100%);;
          color: white;
          border-radius: 0.375rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .upload-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(183, 33, 255, 0.3);
        }
        
        .hidden {
          display: none;
        }
        
        .file-name {
          margin-top: 0.5rem;
          color: #666;
          font-size: 0.875rem;
        }
        
        .preview-container {
          margin-top: 1rem;
          max-width: 200px;
          margin-left: auto;
          margin-right: auto;
        }
        
        .preview-image {
          width: 100%;
          height: auto;
          border-radius: 0.5rem;
          border: 1px solid #e5e7eb;
        }
        
        .error-message {
          color: #ef4444;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }
      `}</style>
    </div>
  );
};

export default FileUploadField;