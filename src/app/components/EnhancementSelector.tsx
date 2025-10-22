// /Users/arthurjaspar/Projects/SketchToCad/SketchToCad/frontend/src/app/components/EnhancementSelector.tsx
"use client";

import { useState } from 'react';
import { ProcessingResult } from '../types/processing/ProcessingResult';

interface EnhancementSelectorProps {
  processingResult: ProcessingResult;
  onSelection: (method: string) => void;
  onBack: () => void;
}

const ENHANCEMENT_METHODS = [
  {
    key: 'original',
    title: 'Original Colors',
    description: 'Raw RGB color values from plant beds'
  },
  {
    key: 'enhanced_saturation',
    title: 'Enhanced Saturation',
    description: 'Increased color saturation for better separation'
  },
  {
    key: 'contrast_stretched',
    title: 'Contrast Stretched',
    description: 'Stretched color range for maximum contrast'
  },
  {
    key: 'color_ratios',
    title: 'Color Ratios',
    description: 'Normalized color ratios, lighting-independent'
  },
  {
    key: 'pca_features',
    title: 'PCA Features',
    description: 'Principal component analysis of color space'
  }
];

export default function EnhancementSelector({ 
  processingResult, 
  onSelection, 
  onBack 
}: EnhancementSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('original');
  const [hoveredMethod, setHoveredMethod] = useState<string | null>(null);

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method);
  };

  const handleContinue = () => {
    onSelection(selectedMethod);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Choose Color Enhancement Method
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Different color enhancement methods can help identify plant clusters more effectively. 
          Compare the scatter plots below and choose the method that shows the clearest separation between different plant types.
        </p>
      </div>

      {/* Enhancement Previews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {ENHANCEMENT_METHODS.map((method) => {
          const preview = processingResult.enhancement_previews?.[method.key];
          const isSelected = selectedMethod === method.key;
          const isHovered = hoveredMethod === method.key;

          return (
            <div
              key={method.key}
              className={`
                relative cursor-pointer rounded-lg border-2 transition-all duration-200
                ${isSelected 
                  ? 'border-blue-500 bg-blue-50 shadow-lg' 
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }
              `}
              onClick={() => handleMethodSelect(method.key)}
              onMouseEnter={() => setHoveredMethod(method.key)}
              onMouseLeave={() => setHoveredMethod(null)}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3 z-10">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}

              <div className="p-4">
                <h3 className={`text-lg font-semibold mb-2 ${
                  isSelected ? 'text-blue-900' : 'text-gray-900'
                }`}>
                  {method.title}
                </h3>
                
                {preview && (
                  <div className="mb-3 rounded overflow-hidden">
                    <img 
                      src={`data:image/png;base64,${preview.image}`}
                      alt={method.title}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}
                
                <p className={`text-sm ${
                  isSelected ? 'text-blue-700' : 'text-gray-600'
                }`}>
                  {method.description}
                </p>

                {(isSelected || isHovered) && (
                  <div className="mt-3 text-xs text-gray-500">
                    <p>Beds detected: {processingResult.bed_data.length}</p>
                    <p>Click to select this method</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Method Details */}
      {selectedMethod && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Selected: {ENHANCEMENT_METHODS.find(m => m.key === selectedMethod)?.title}
          </h3>
          <p className="text-blue-800">
            {ENHANCEMENT_METHODS.find(m => m.key === selectedMethod)?.description}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          ← Back to Upload
        </button>
        
        <button
          onClick={handleContinue}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Continue to Clustering →
        </button>
      </div>

      {/* Additional Info */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-3">💡 Tips for Choosing Enhancement Methods:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <strong>Original Colors:</strong> Use when plant colors are already well-separated
          </div>
          <div>
            <strong>Enhanced Saturation:</strong> Better for distinguishing subtle color differences
          </div>
          <div>
            <strong>Contrast Stretched:</strong> Good when colors appear washed out or similar
          </div>
          <div>
            <strong>Color Ratios:</strong> Best for varying lighting conditions
          </div>
          <div>
            <strong>PCA Features:</strong> Captures the most significant color variations
          </div>
        </div>
      </div>
    </div>
  );
}