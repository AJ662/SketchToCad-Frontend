// /Users/arthurjaspar/Projects/SketchToCad/SketchToCad/frontend/src/app/page.tsx
"use client";

import { useState } from "react";
import axios from "axios";
import { ProcessingResult } from "./types/processing/ProcessingResult";
import { ClusteringResult } from "./types/clustering/ClusteringResult";
import ImageUploader from "./components/ImageUploader";
import ResultsDashboard from "./components/ResultsDashboard";
import EnhancementSelector from "./components/EnhancementSelector";
import dynamic from "next/dynamic";

// Dynamically import ClusteringCanvas with no SSR
const ClusteringCanvas = dynamic(
  () => import("./components/ClusteringCanvas"),
  { 
    ssr: false,
    loading: () => (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-lg text-gray-600">Loading clustering interface...</span>
      </div>
    )
  }
);

// Add enhancement selection types
interface EnhancementPreview {
  image: string;
  title: string;
  xlabel: string;
  ylabel: string;
}

interface EnhancementSelection {
  method: string;
  plot_data: number[][];
  xlabel: string;
  ylabel: string;
  original_colors: number[][];
}

export default function Home() {
  const [currentStep, setCurrentStep] = useState<'upload' | 'enhancement' | 'clustering' | 'results'>('upload');
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null);
  const [enhancementSelection, setEnhancementSelection] = useState<EnhancementSelection | null>(null);
  const [clusteringResult, setClusteringResult] = useState<ClusteringResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await axios.post<ProcessingResult>(
        "http://localhost:8000/process-image", 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      setProcessingResult(response.data);
      setCurrentStep('enhancement');
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to process image");
      console.error("Upload error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnhancementSelection = async (method: string) => {
    if (!processingResult) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post<EnhancementSelection>(
        "http://localhost:8000/select-enhancement-method",
        {
          session_id: processingResult.session_id,
          method: method
        }
      );
      
      setEnhancementSelection(response.data);
      setCurrentStep('clustering');
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to select enhancement method");
      console.error("Enhancement selection error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClustering = async (clustersData: Record<string, number[]>) => {
    if (!processingResult) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post<ClusteringResult>(
        "http://localhost:8000/manual-cluster",
        {
          session_id: processingResult.session_id,
          clusters: clustersData
        }
      );
      
      setClusteringResult(response.data);
      setCurrentStep('results');
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to process clustering");
      console.error("Clustering error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentStep('upload');
    setProcessingResult(null);
    setEnhancementSelection(null);
    setClusteringResult(null);
    setError(null);
  };

  const handleBack = () => {
    if (currentStep === 'enhancement') {
      setCurrentStep('upload');
    } else if (currentStep === 'clustering') {
      setCurrentStep('enhancement');
    }
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Plant Bed Clustering Tool
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Upload an image, choose color enhancement method, draw polygons to cluster similar plants, 
              and analyze the results with detailed statistics.
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              <StepIndicator 
                step={1} 
                title="Upload Image" 
                isActive={currentStep === 'upload'}
                isCompleted={processingResult !== null}
              />
              <div className="w-8 h-0.5 bg-gray-300"></div>
              <StepIndicator 
                step={2} 
                title="Color Enhancement" 
                isActive={currentStep === 'enhancement'}
                isCompleted={enhancementSelection !== null}
              />
              <div className="w-8 h-0.5 bg-gray-300"></div>
              <StepIndicator 
                step={3} 
                title="Manual Clustering" 
                isActive={currentStep === 'clustering'}
                isCompleted={clusteringResult !== null}
              />
              <div className="w-8 h-0.5 bg-gray-300"></div>
              <StepIndicator 
                step={4} 
                title="Results" 
                isActive={currentStep === 'results'}
                isCompleted={false}
              />
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 max-w-4xl mx-auto">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Loading Spinner */}
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-lg text-gray-600">
                {currentStep === 'upload' ? 'Processing image...' : 
                 currentStep === 'enhancement' ? 'Generating enhancements...' : 
                 'Analyzing clusters...'}
              </span>
            </div>
          )}

          {/* Step Content */}
          {!isLoading && (
            <>
              {currentStep === 'upload' && (
                <ImageUploader onUpload={handleImageUpload} />
              )}

              {currentStep === 'enhancement' && processingResult && (
                <EnhancementSelector 
                  processingResult={processingResult}
                  onSelection={handleEnhancementSelection}
                  onBack={handleBack}
                />
              )}

              {currentStep === 'clustering' && enhancementSelection && (
                <ClusteringCanvas 
                  enhancementSelection={enhancementSelection}
                  onClustering={handleClustering}
                  onBack={handleBack}
                />
              )}

              {currentStep === 'results' && clusteringResult && processingResult && (
                <ResultsDashboard 
                  clusteringResult={clusteringResult}
                  processingResult={processingResult}
                  onReset={handleReset}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// StepIndicator component (unchanged)
function StepIndicator({ 
  step, 
  title, 
  isActive, 
  isCompleted 
}: { 
  step: number; 
  title: string; 
  isActive: boolean; 
  isCompleted: boolean; 
}) {
  return (
    <div className="flex items-center">
      <div className={`
        flex items-center justify-center w-8 h-8 rounded-full border-2 
        ${isCompleted 
          ? 'bg-green-600 border-green-600 text-white' 
          : isActive 
            ? 'bg-blue-600 border-blue-600 text-white' 
            : 'bg-white border-gray-300 text-gray-500'
        }
      `}>
        {isCompleted ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        ) : (
          <span className="text-sm font-medium">{step}</span>
        )}
      </div>
      <span className={`ml-2 text-sm font-medium ${
        isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
      }`}>
        {title}
      </span>
    </div>
  );
}