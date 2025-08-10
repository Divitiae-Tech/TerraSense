'use client';

import { useState } from 'react';
import { identifyCrop } from '@/lib/cropHealthAPI';
import type { IdentificationResult } from '@/types/crops/cropHealth';

// Components
import PageHeader from '@/components/pestdisease/PageHeader';
import ImageUpload from '@/components/pestdisease/ImageUpload';
import AnalysisOptions from '@/components/pestdisease/AnalysisOptions';
import AnalyzeButton from '@/components/pestdisease/AnalyzeButton';
import ErrorDisplay from '@/components/pestdisease/ErrorDisplay';
import ResultsDisplay from '@/components/pestdisease/ResultsDisplay';

// Country coordinates mapping
const countryCoordinates = {
  'US': { lat: 39.8283, lng: -98.5795 },
  'CA': { lat: 56.1304, lng: -106.3468 },
  'MX': { lat: 23.6345, lng: -102.5528 },
  'BR': { lat: -14.2350, lng: -51.9253 },
  'AR': { lat: -38.4161, lng: -63.6167 },
  'AU': { lat: -25.2744, lng: 133.7751 },
  'IN': { lat: 20.5937, lng: 78.9629 },
  'CN': { lat: 35.8617, lng: 104.1954 },
  'RU': { lat: 61.5240, lng: 105.3188 },
  'DE': { lat: 51.1657, lng: 10.4515 },
  'FR': { lat: 46.2276, lng: 2.2137 },
  'UK': { lat: 55.3781, lng: -3.4360 },
  'IT': { lat: 41.8719, lng: 12.5674 },
  'ES': { lat: 40.4637, lng: -3.7492 },
  'ZA': { lat: -30.5595, lng: 22.9375 },
  'KE': { lat: -0.0236, lng: 37.9062 },
  'NG': { lat: 9.0820, lng: 8.6753 },
  'EG': { lat: 26.0975, lng: 31.2357 },
  'JP': { lat: 36.2048, lng: 138.2529 },
  'KR': { lat: 35.9078, lng: 127.7669 },
  'TH': { lat: 15.8700, lng: 100.9925 },
  'VN': { lat: 14.0583, lng: 108.2772 },
  'ID': { lat: -0.7893, lng: 113.9213 },
  'PH': { lat: 12.8797, lng: 121.7740 },
  'MY': { lat: 4.2105, lng: 101.9758 }
};

export default function PestDiseasePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<IdentificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Form options - updated for country-based selection
  const [selectedCountry, setSelectedCountry] = useState('');
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

  const handleClearImage = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setResults(null);
    setError(null);
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
      
      // Get coordinates from selected country
      if (selectedCountry && countryCoordinates[selectedCountry as keyof typeof countryCoordinates]) {
        const coords = countryCoordinates[selectedCountry as keyof typeof countryCoordinates];
        options.latitude = coords.lat;
        options.longitude = coords.lng;
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
    setSelectedCountry('');
    setDatetime('');
    setSimilarImages(true);
    setIsDragOver(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
        <PageHeader />

        {/* Mobile-first single column layout */}
        <div className="space-y-6">
          {/* Image Upload Section */}
          <ImageUpload
            onFileSelect={handleFileSelect}
            onClearImage={handleClearImage}
            loading={loading}
            isDragOver={isDragOver}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            previewUrl={previewUrl}
          />

          {/* Analysis Options */}
          <AnalysisOptions
            selectedCountry={selectedCountry}
            datetime={datetime}
            similarImages={similarImages}
            onCountryChange={setSelectedCountry}
            onDatetimeChange={setDatetime}
            onSimilarImagesChange={setSimilarImages}
            loading={loading}
          />

          {/* Error Display */}
          <ErrorDisplay error={error} />

          {/* Action Buttons */}
          {selectedFile && (
            <div className="space-y-3">
              <AnalyzeButton
                onAnalyze={handleSubmit}
                loading={loading}
                disabled={!selectedFile}
              />
              
              {/* Reset Button */}
              {(results || error) && !loading && (
                <button
                  onClick={handleReset}
                  className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                >
                  🔄 Start New Analysis
                </button>
              )}
            </div>
          )}

          {/* Quick Tips for Better Results */}
          {!selectedFile && !loading && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2">📸 Tips for Better Results</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Take photos in bright, natural light</li>
                <li>• Focus on affected leaves, stems, or fruits</li>
                <li>• Keep the camera steady for clear images</li>
                <li>• Include multiple angles if possible</li>
                <li>• Avoid shadows covering the problem areas</li>
              </ul>
            </div>
          )}

          {/* Results Section */}
          {results && (
            <ResultsDisplay results={results} />
          )}
        </div>

        {/* Footer Information */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="text-center text-sm text-gray-500 space-y-2">
            <p>
              🌾 Powered by AI technology to help farmers identify crop health issues
            </p>
            <p className="text-xs">
              This tool provides suggestions only. For serious issues, consult with agricultural experts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}