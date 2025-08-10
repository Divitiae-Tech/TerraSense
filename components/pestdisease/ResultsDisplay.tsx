'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Expand, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogOverlay } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import SuggestionCard from './SuggestionCard';
import HealthAssessment from './HealthAssessment';
import type { IdentificationResult } from '@/types/crops/cropHealth';

interface ResultsDisplayProps {
  results: IdentificationResult;
}

interface ImageModalProps {
  imageUrl: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}

function ImageModal({ imageUrl, alt, isOpen, onClose }: ImageModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black border-0">
        <div className="relative w-full h-full flex items-center justify-center">
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-4 right-4 z-50 bg-white/10 hover:bg-white/20 text-white border-white/20"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
          <img
            src={imageUrl}
            alt={alt}
            className="max-w-full max-h-full object-contain"
            style={{ maxHeight: '90vh', maxWidth: '90vw' }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ResultsDisplay({ results }: ResultsDisplayProps) {
  const [modalImage, setModalImage] = useState<{ url: string; alt: string } | null>(null);

  const openImageModal = (url: string, alt: string) => {
    setModalImage({ url, alt });
  };

  const closeImageModal = () => {
    setModalImage(null);
  };

  return (
    <>
      <div className="mt-8 space-y-6">
        <Separator />
        
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            🔬 Analysis Results
          </h2>
          <p className="text-gray-600">
            AI-powered identification of your crop's health status
          </p>
        </div>

        {/* Health Overview */}
        <HealthAssessment diseasesSuggestions={results.result?.disease?.suggestions} />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
          {/* Plant Identification */}
          {results.result?.crop?.suggestions && results.result.crop.suggestions.length > 0 && (
            <Card className="border-green-200">
              <CardHeader className="bg-green-50">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Crop Identified
                </CardTitle>
                <CardDescription>
                  What we found in your image
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-4 md:p-6">
                {results.result.crop.suggestions.map((suggestion, index) => (
                  <SuggestionCard 
                    key={`crop-${index}`} 
                    suggestion={suggestion} 
                    type="crop"
                    onImageClick={openImageModal}
                  />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Disease/Pest Detection */}
          {results.result?.disease?.suggestions && results.result.disease.suggestions.length > 0 && (
            <Card className="border-red-200">
              <CardHeader className="bg-red-50">
                <CardTitle className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  Issues Detected
                </CardTitle>
                <CardDescription>
                  Potential problems and recommended actions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-4 md:p-6">
                {results.result.disease.suggestions.map((suggestion, index) => (
                  <SuggestionCard 
                    key={`disease-${index}`} 
                    suggestion={suggestion} 
                    type="disease"
                    onImageClick={openImageModal}
                  />
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* No Results */}
        {(!results.result?.crop?.suggestions || results.result.crop.suggestions.length === 0) &&
         (!results.result?.disease?.suggestions || results.result.disease.suggestions.length === 0) && (
          <Card>
            <CardContent className="text-center py-12">
              <XCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Issues Found</h3>
              <p className="text-gray-500 mb-4">
                We couldn't identify any specific problems in this image.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg text-left max-w-md mx-auto">
                <h4 className="font-medium text-blue-800 mb-2">Tips for better results:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Take photos in good natural light</li>
                  <li>• Focus on affected areas of the plant</li>
                  <li>• Ensure the image is clear and not blurry</li>
                  <li>• Include leaves, stems, or fruits showing symptoms</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Image Modal */}
      {modalImage && (
        <ImageModal
          imageUrl={modalImage.url}
          alt={modalImage.alt}
          isOpen={!!modalImage}
          onClose={closeImageModal}
        />
      )}
    </>
  );
}