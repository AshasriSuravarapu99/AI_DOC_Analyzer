import { useState, useRef } from 'react';
import { UploadCloud, File, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function UploadSection({ onUploadSuccess }) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
        setError(null);
      } else {
        setError('Please upload a PDF file only.');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      onUploadSuccess(response.data.filename, response.data.document_id);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to upload and process document.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full glass-panel rounded-2xl p-8 flex flex-col items-center">
      <div 
        className={`w-full border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer ${isDragging ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-dark-border hover:border-dark-muted hover:bg-dark-bg/50'} ${file ? 'border-green-500/50 bg-green-500/5' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept=".pdf"
          onChange={handleFileChange}
        />
        
        {file ? (
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4 text-green-400">
              <File className="w-8 h-8" />
            </div>
            <p className="text-lg font-medium text-dark-text mb-1">{file.name}</p>
            <p className="text-sm text-dark-muted">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-dark-bg flex items-center justify-center mb-4 text-primary">
              <UploadCloud className="w-8 h-8" />
            </div>
            <p className="text-lg font-medium text-dark-text mb-2">Click or drag your PDF here</p>
            <p className="text-sm text-dark-muted">Maximum file size 50MB</p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 w-full rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <button 
        onClick={handleUpload}
        disabled={!file || uploading}
        className={`mt-6 w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${!file ? 'bg-dark-border text-dark-muted cursor-not-allowed' : uploading ? 'bg-primary/70 text-white cursor-wait' : 'bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-[0.98]'}`}
      >
        {uploading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing Document...
          </>
        ) : (
          'Analyze Document'
        )}
      </button>
    </div>
  );
}
