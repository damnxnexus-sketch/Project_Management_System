'use client';

import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';

interface FileUploadZoneProps {
  onUpload: (file: File) => void;
  isUploading: boolean;
}

export function FileUploadZone({ onUpload, isUploading }: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File size exceeds 10MB limit');
      return;
    }
    
    setSelectedFile(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
          ${isDragging 
            ? 'border-[var(--accent)] bg-[var(--accent)]/10' 
            : 'border-[var(--border-color)] hover:border-[var(--accent)] hover:bg-[var(--surface-raised)]'
          }
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileInputChange}
          disabled={isUploading}
          className="hidden"
        />
        
        <div className="flex flex-col items-center gap-2">
          <Upload className="text-[var(--muted)]" size={32} />
          <div>
            <p className="text-sm font-medium text-[var(--foreground)]">
              {isDragging ? 'Drop file here' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-xs text-[var(--muted)] mt-1">
              Maximum file size: 10MB
            </p>
          </div>
        </div>
      </div>

      {selectedFile && (
        <div className="flex items-center justify-between p-3 bg-[var(--surface-raised)] rounded-lg border border-[var(--border-color)]">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--foreground)] truncate">
              {selectedFile.name}
            </p>
            <p className="text-xs text-[var(--muted)]">
              {(selectedFile.size / 1024).toFixed(2)} KB
            </p>
          </div>
          
          <div className="flex gap-2 ml-4">
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <Spinner size="sm" />
                  Uploading...
                </>
              ) : (
                'Upload'
              )}
            </button>
            <button
              onClick={handleCancel}
              disabled={isUploading}
              className="p-2 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)] rounded-lg transition-colors disabled:opacity-50"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
