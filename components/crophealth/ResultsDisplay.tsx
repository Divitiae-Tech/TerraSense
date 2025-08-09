// components/crophealth/ResultsDisplay.tsx

import type { IdentificationResult, Suggestion } from '@/types/crops/cropHealth';

interface ResultsDisplayProps {
  results: IdentificationResult;
}

export default function ResultsDisplay({ results }: ResultsDisplayProps) {
  return (
    <div className="mt-8 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 text-center">
        🔬 Identification Results
      </h2>

      {/* Crop Suggestions */}
      {results.result?.crop?.suggestions && results.result.crop.suggestions.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex justify-between items-center mb-4 pb-4 border-b-2 border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800">🌱 Plant Identification</h3>
            <span className="bg-gradient-to-r from-green-600 to-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
              Crop
            </span>
          </div>
          <div className="space-y-4">
            {results.result.crop.suggestions.map((suggestion: Suggestion, index: number) => (
              <SuggestionCard key={`crop-${index}`} suggestion={suggestion} />
            ))}
          </div>
        </div>
      )}

      {/* Disease Suggestions */}
      {results.result?.disease?.suggestions && results.result.disease.suggestions.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex justify-between items-center mb-4 pb-4 border-b-2 border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800">🏥 Health Analysis</h3>
            <span className="bg-gradient-to-r from-red-500 to-red-400 text-white px-4 py-2 rounded-full text-sm font-semibold">
              Disease/Health
            </span>
          </div>
          <div className="space-y-4">
            {results.result.disease.suggestions.map((suggestion: Suggestion, index: number) => (
              <SuggestionCard key={`disease-${index}`} suggestion={suggestion} isDiseaseAnalysis />
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {(!results.result?.crop?.suggestions || results.result.crop.suggestions.length === 0) &&
       (!results.result?.disease?.suggestions || results.result.disease.suggestions.length === 0) && (
        <div className="text-center p-8 bg-gray-50 rounded-2xl">
          <div className="text-4xl mb-4">🤔</div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Results Found</h3>
          <p className="text-gray-500">
            We couldn't identify this image. Please try uploading a clearer photo of a crop or plant.
          </p>
        </div>
      )}

      {/* Access Token */}
      {results.access_token && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <p className="text-sm text-gray-600">
            <strong>🔑 Access Token:</strong> <code className="bg-gray-200 px-2 py-1 rounded text-xs">{results.access_token}</code>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Use this token to access detailed results later through the API
          </p>
        </div>
      )}
    </div>
  );
}

interface SuggestionCardProps {
  suggestion: Suggestion;
  isDiseaseAnalysis?: boolean;
}

function SuggestionCard({ suggestion, isDiseaseAnalysis = false }: SuggestionCardProps) {
  const probabilityColor = suggestion.probability > 0.7 
    ? 'from-green-500 to-green-400'
    : suggestion.probability > 0.4 
    ? 'from-yellow-500 to-yellow-400'
    : 'from-red-500 to-red-400';

  const borderColor = isDiseaseAnalysis ? 'border-red-500' : 'border-green-500';
  const titleColor = isDiseaseAnalysis ? 'text-red-700' : 'text-green-700';

  return (
    <div className={`bg-gray-50 p-5 rounded-xl border-l-4 ${borderColor} hover:bg-gray-100 transition-colors duration-300`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className={`text-lg font-semibold ${titleColor} mb-1`}>
            {suggestion.name}
          </h4>
          {suggestion.scientific_name && (
            <p className="text-gray-600 italic text-sm">
              {suggestion.scientific_name}
            </p>
          )}
        </div>
        <span className={`bg-gradient-to-r ${probabilityColor} text-white px-3 py-1 rounded-full text-sm font-semibold ml-4 flex-shrink-0`}>
          {Math.round(suggestion.probability * 100)}%
        </span>
      </div>
      
      {suggestion.id && (
        <p className="text-xs text-gray-500">
          ID: {suggestion.id}
        </p>
      )}

      {/* Similar Images Preview */}
      {suggestion.similar_images && suggestion.similar_images.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-600 mb-2">Similar Images:</p>
          <div className="flex space-x-2 overflow-x-auto">
            {suggestion.similar_images.slice(0, 3).map((image, index) => (
              <img
                key={index}
                src={image.url}
                alt={`Similar to ${suggestion.name}`}
                className="w-16 h-16 object-cover rounded-lg border flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}