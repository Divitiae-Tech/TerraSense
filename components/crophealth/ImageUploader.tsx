// components/crophealth/ImageUploader.tsx

'use client';

import { useState, useRef } from 'react';

interface ImageUploaderProps {
  onIdentify: (
    file: File,
    options: {
      latitude?: number;
      longitude?: number;
      datetime?: string;
      similarImages?: boolean;
    }
  ) => void;
  loading: boolean;
}

export default function ImageUploader({ onIdentify, loading }: ImageUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [datetime, setDatetime] = useState<string>('');
  const [similarImages, setSimilarImages] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith('image/')) {
      return 'Please select an image file (JPG, PNG, GIF, WebP)';
    }
    if (file.size > 10 * 1024 * 1024) {
      return 'File size must be less than 10MB';
    }
    return null;
  };

  const handleFileSelect = (file: File) => {
    const error = validateFile(file);
    if (error) {
      setFileError(error);
      return;
    }

    setFileError(null);
    setSelectedFile(file);
    
    // Clean up previous preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

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
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleSubmit = () => {
    if (!selectedFile) return;

    const options: any = {};
    
    // Parse and validate coordinates
    if (latitude.trim() !== '') {
      const lat = parseFloat(latitude);
      if (!isNaN(lat) && lat >= -90 && lat <= 90) {
        options.latitude = lat;
      }
    }
    
    if (longitude.trim() !== '') {
      const lng = parseFloat(longitude);
      if (!isNaN(lng) && lng >= -180 && lng <= 180) {
        options.longitude = lng;
      }
    }
    
    if (datetime.trim() !== '') {
      options.datetime = datetime;
    }
    
    if (similarImages) {
      options.similarImages = true;
    }

    onIdentify(selectedFile, options);
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer
          ${isDragOver 
            ? 'border-green-500 bg-green-50 transform scale-102' 
            : 'border-gray-300 bg-gray-50 hover:border-green-400 hover:bg-green-50'
          }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
          disabled={loading}
        />
        
        <div className="space-y-4">
          <div className="text-5xl">📸</div>
          <h3 className="text-xl font-semibold text-gray-700">Upload Your Crop Image</h3>
          <p className="text-gray-500">Drag and drop an image here or click to select</p>
          <button
            type="button"
            className="bg-gradient-to-r from-green-600 to-green-500 text-white px-6 py-3 rounded-full font-medium hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            disabled={loading}
          >
            Choose Image
          </button>
          <p className="text-sm text-gray-400">
            Supported formats: JPG, PNG, GIF, WebP (Max 10MB)
          </p>
        </div>
      </div>

      {/* File Error */}
      {fileError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <p className="text-sm">{fileError}</p>
        </div>
      )}

      {/* Image Preview */}
      {previewUrl && (
        <div className="text-center space-y-4">
          <h4 className="text-lg font-medium">Image Preview:</h4>
          <div className="relative inline-block">
            <img
              src={previewUrl}
              alt="Preview"
              className="rounded-xl shadow-lg max-w-full h-auto object-contain"
              style={{ maxHeight: '300px', maxWidth: '400px' }}
            />
          </div>
        </div>
      )}

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-50 p-4 rounded-xl border-l-4 border-green-500">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📍 Latitude (optional)
          </label>
          <input
            type="number"
            step="any"
            placeholder="e.g., 40.7128"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={loading}
          />
        </div>

        <div className="bg-gray-50 p-4 rounded-xl border-l-4 border-green-500">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📍 Longitude (optional)
          </label>
          <input
            type="number"
            step="any"
            placeholder="e.g., -74.0060"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={loading}
          />
        </div>

        <div className="bg-gray-50 p-4 rounded-xl border-l-4 border-green-500">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📅 Date/Time (optional)
          </label>
          <input
            type="datetime-local"
            value={datetime}
            onChange={(e) => setDatetime(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={loading}
          />
        </div>

        <div className="bg-gray-50 p-4 rounded-xl border-l-4 border-green-500 flex items-center">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={similarImages}
              onChange={(e) => setSimilarImages(e.target.checked)}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              disabled={loading}
            />
            <span className="text-sm font-medium text-gray-700">
              Include similar images
            </span>
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <div className="text-center">
        <button
          onClick={handleSubmit}
          disabled={!selectedFile || loading}
          className="bg-gradient-to-r from-red-500 to-red-400 text-white px-8 py-4 rounded-full text-lg font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:hover:scale-100 disabled:hover:shadow-none min-w-[200px]"
        >
          {loading ? (
            <span className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Analyzing...</span>
            </span>
          ) : (
            '🔍 Identify Crop'
          )}
        </button>
      </div>
    </div>
  );
}