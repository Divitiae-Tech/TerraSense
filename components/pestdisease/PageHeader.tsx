'use client';

export default function PageHeader() {
  return (
    <div className="text-center mb-8">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
        <span className="text-2xl">🌱</span>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Crop Health Analyzer
      </h1>
      <p className="text-gray-600 max-w-2xl mx-auto">
        Upload a photo of your crop to instantly identify pests, diseases, and health issues with AI-powered analysis
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-6 text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          Instant Results
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          Expert Recommendations
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
          Reference Images
        </div>
      </div>
    </div>
  );
}