'use client';

import { Expand, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import type { Suggestion } from '@/types/crops/cropHealth';

interface SuggestionCardProps {
  suggestion: Suggestion;
  type: 'crop' | 'disease';
  onImageClick: (url: string, alt: string) => void;
}

export default function SuggestionCard({ suggestion, type, onImageClick }: SuggestionCardProps) {
  const probabilityPercentage = Math.round(suggestion.probability * 100);
  
  const getConfidenceColor = (probability: number) => {
    if (probability > 0.7) return 'bg-green-100 text-green-800 border-green-200';
    if (probability > 0.4) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getConfidenceLevel = (probability: number) => {
    if (probability > 0.8) return 'Very High';
    if (probability > 0.6) return 'High';
    if (probability > 0.4) return 'Medium';
    return 'Low';
  };

  const getProgressColor = (probability: number) => {
    if (probability > 0.7) return 'bg-green-500';
    if (probability > 0.4) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Extract treatment information from details
  const getTreatmentInfo = () => {
    if (type !== 'disease' || !suggestion.details?.treatment) return null;
    
    const treatment = suggestion.details.treatment;
    const treatments = [];
    
    if (treatment.biological && Array.isArray(treatment.biological)) {
      treatments.push(...treatment.biological.map(t => ({ type: 'Biological', method: t })));
    }
    if (treatment.chemical && Array.isArray(treatment.chemical)) {
      treatments.push(...treatment.chemical.map(t => ({ type: 'Chemical', method: t })));
    }
    if (treatment.prevention && Array.isArray(treatment.prevention)) {
      treatments.push(...treatment.prevention.map(t => ({ type: 'Prevention', method: t })));
    }
    
    return treatments.length > 0 ? treatments : null;
  };

  const treatments = getTreatmentInfo();

  return (
    <div className={`border rounded-lg p-4 space-y-4 ${
      type === 'disease' 
        ? 'border-red-200 bg-red-50/50' 
        : 'border-green-200 bg-green-50/50'
    }`}>
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 text-lg mb-1">
            {suggestion.name}
          </h4>
          {suggestion.scientific_name && (
            <p className="text-sm text-gray-600 italic">
              {suggestion.scientific_name}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge className={getConfidenceColor(suggestion.probability)}>
            {probabilityPercentage}% Match
          </Badge>
          <span className="text-xs text-gray-500 font-medium">
            {getConfidenceLevel(suggestion.probability)} Confidence
          </span>
        </div>
      </div>
      
      {/* Confidence Progress */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Confidence Level</span>
          <span className="text-sm font-medium">{probabilityPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(suggestion.probability)}`}
            style={{ width: `${probabilityPercentage}%` }}
          />
        </div>
      </div>

      {/* Description */}
      {suggestion.details?.description && (
        <div className="bg-white p-3 rounded-md border">
          <p className="text-sm text-gray-700 leading-relaxed">
            {suggestion.details.description}
          </p>
        </div>
      )}

      {/* Treatment Information for Diseases */}
      {treatments && treatments.length > 0 && (
        <div className="bg-white p-3 rounded-md border">
          <h5 className="font-medium text-gray-800 mb-2">Recommended Actions:</h5>
          <div className="space-y-2">
            {treatments.slice(0, 3).map((treatment, index) => (
              <div key={index} className="flex items-start gap-2">
                <Badge variant="outline" className="text-xs">
                  {treatment.type}
                </Badge>
                <span className="text-sm text-gray-700 flex-1">
                  {treatment.method}
                </span>
              </div>
            ))}
            {treatments.length > 3 && (
              <p className="text-xs text-gray-500 mt-2">
                +{treatments.length - 3} more treatment options available
              </p>
            )}
          </div>
        </div>
      )}

      {/* Common Names */}
      {suggestion.details?.common_names && suggestion.details.common_names.length > 0 && (
        <div className="flex flex-wrap gap-1">
          <span className="text-sm text-gray-600">Also known as:</span>
          {suggestion.details.common_names.slice(0, 3).map((name, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {name}
            </Badge>
          ))}
        </div>
      )}

      {/* Similar Images */}
      {suggestion.similar_images && suggestion.similar_images.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="font-medium text-gray-800">Reference Images</h5>
            <span className="text-xs text-gray-500">
              Click to view larger
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {suggestion.similar_images.slice(0, 4).map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image.url}
                  alt={`Reference for ${suggestion.name}`}
                  className="w-full h-16 sm:h-20 object-cover rounded-md border cursor-pointer transition-transform duration-200 group-hover:scale-105"
                  onClick={() => onImageClick(image.url, `Reference image for ${suggestion.name}`)}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-md flex items-center justify-center">
                  <Expand className="w-4 h-4 text-white" />
                </div>
              </div>
            ))}
          </div>
          {suggestion.similar_images.length > 4 && (
            <p className="text-xs text-gray-500 text-center">
              +{suggestion.similar_images.length - 4} more reference images
            </p>
          )}
        </div>
      )}

      {/* External Link */}
      {suggestion.details?.wiki_url && (
        <div className="pt-2 border-t border-gray-200">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => window.open(suggestion.details?.wiki_url, '_blank')}
          >
            <ExternalLink className="w-3 h-3 mr-2" />
            Learn More
          </Button>
        </div>
      )}
    </div>
  );
}