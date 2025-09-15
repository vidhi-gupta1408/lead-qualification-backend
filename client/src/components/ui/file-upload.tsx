import React, { useRef, useState } from 'react';
import { Button } from './button';
import { Card } from './card';
import { Upload, FileText, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number;
  className?: string;
}

export function FileUpload({ onFileSelect, accept = ".csv", maxSize = 5 * 1024 * 1024, className }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    if (file.size > maxSize) {
      alert(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
      return;
    }
    
    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Card
        className={cn(
          "border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-300",
          isDragOver && "border-primary bg-primary/5 scale-102",
          !isDragOver && "border-border bg-muted/30 hover:border-primary hover:bg-primary/5"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        data-testid="file-upload-area"
      >
        <div className="space-y-4">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Upload className="text-primary text-xl" />
          </div>
          <div>
            <p className="text-foreground font-medium">Drop your CSV file here</p>
            <p className="text-muted-foreground text-sm">or click to browse</p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            data-testid="button-browse-files"
          >
            Browse Files
          </Button>
        </div>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
        data-testid="input-csv-file"
      />

      <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
        <strong>Required CSV format:</strong><br />
        <code>name,role,company,industry,location,linkedin_bio</code>
      </div>

      {selectedFile && (
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="text-chart-2" />
              <div>
                <p className="text-sm font-medium" data-testid="text-filename">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground" data-testid="text-filesize">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFile}
              data-testid="button-clear-file"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
