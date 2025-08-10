'use client';

import { useRef } from 'react';
import { Camera, Upload, ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ImageUploadProps {
  onFileSelect: (file: File) => void;
  onClearImage: () => void;
  loading: boolean;
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  previewUrl: string | null;
}

export default function ImageUpload({
  onFileSelect,
  onClearImage,
  loading,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  previewUrl,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      onFileSelect(files[0]);
    }
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      onFileSelect(files[0]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          Upload Crop Image
        </CardTitle>
        <CardDescription>
          Take a clear photo of your crop showing any affected areas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!previewUrl ? (
          <>
            {/* Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 cursor-pointer
                ${isDragOver 
                  ? 'border-primary bg-primary/10 scale-102' 
                  : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50'
                }`}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
                disabled={loading}
              />
              
              <div className="space-y-4">
                <Upload className="w-12 h-12 mx-auto text-gray-400" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Choose Image</h3>
                  <p className="text-gray-500">Drag and drop or click to select</p>
                </div>
              </div>
            </div>

            {/* Camera and Upload Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => cameraInputRef.current?.click()}
                disabled={loading}
                className="w-full"
              >
                <Camera className="w-4 h-4 mr-2" />
                Take Photo
              </Button>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                Browse Files
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Image Preview */}
            <div className="relative">
              <img
                src={previewUrl}
                alt="Uploaded crop image"
                className="w-full h-48 sm:h-64 object-cover rounded-lg shadow-md"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={onClearImage}
                disabled={loading}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Change Image Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => cameraInputRef.current?.click()}
                disabled={loading}
                className="w-full"
              >
                <Camera className="w-4 h-4 mr-2" />
                Retake Photo
              </Button>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose Different
              </Button>
            </div>
          </>
        )}

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleCameraCapture}
          className="hidden"
          disabled={loading}
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={loading}
        />

        <p className="text-sm text-gray-500 text-center">
          Supported formats: JPG, PNG, GIF, WebP (Max 10MB)
        </p>
      </CardContent>
    </Card>
  );
}