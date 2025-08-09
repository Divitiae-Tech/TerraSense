'use client';

import { useState } from 'react';
import { identifyCrop } from '@/lib/cropHealthAPI';
import type { IdentificationResult } from '@/types/crops/cropHealth';

// Components
import PageHeader from '@/components/pestdisease/PageHeader';
import ImageUpload from '@/components/pestdisease/ImageUpload';
import AnalysisOptions from '@/components/pestdisease/AnalysisOptions';
import ImagePreview from '@/components/pestdisease/ImagePreview';
import AnalyzeButton from '@/components/pestdisease/AnalyzeButton';
import ErrorDisplay from '@/components/pestdisease/ErrorDisplay';
import ResultsDisplay from '@/components/pestdisease/ResultsDisplay';

export default function PestDiseasePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<IdentificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Form options
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [datetime, setDatetime] = useState('');
  const [similarImages, setSimilarImages] = useState(true);

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
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSelectedFile(file);
    setResults(null);
    
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

  const handleSubmit = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);
    setResults(null);

    try {
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

      const result = await identifyCrop(selectedFile, options);
      setResults(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Clean up preview URL on component unmount
  const cleanupPreviewUrl = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  // Reset form function
  const handleReset = () => {
    setSelectedFile(null);
    cleanupPreviewUrl();
    setPreviewUrl(null);
    setResults(null);
    setError(null);
    setLatitude('');
    setLongitude('');
    setDatetime('');
    setSimilarImages(true);
    setIsDragOver(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <PageHeader />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Upload & Options */}
        <div className="space-y-6">
          <ImageUpload
            onFileSelect={handleFileSelect}
            loading={loading}
            isDragOver={isDragOver}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          />

          <AnalysisOptions
            latitude={latitude}
            longitude={longitude}
            datetime={datetime}
            similarImages={similarImages}
            onLatitudeChange={setLatitude}
            onLongitudeChange={setLongitude}
            onDatetimeChange={setDatetime}
            onSimilarImagesChange={setSimilarImages}
            loading={loading}
          />
        </div>

        {/* Right Column - Preview & Analysis */}
        <div className="space-y-6">
          <ImagePreview previewUrl={previewUrl} />
          
          <ErrorDisplay error={error} />

          {selectedFile && (
            <AnalyzeButton
              onAnalyze={handleSubmit}
              loading={loading}
              disabled={!selectedFile}
            />
          )}

          {/* Reset Button */}
          {(selectedFile || results || error) && !loading && (
            <button
              onClick={handleReset}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
              Start New Analysis
            </button>
          )}
        </div>
      </div>

      {/* Results Section */}
      {results && (
        <div className="mt-8">
          <ResultsDisplay 
            results={results} 
            onReset={handleReset}
          />
        </div>
      )}
    </div>
  );
}