// BuffrSign Platform - Advanced Loading States Component
// Comprehensive loading indicators with progress tracking and animations

'use client';

import React from 'react';
import { 
  Loader2, 
  Brain, 
  FileText, 
  Shield, 
  TrendingUp, 
  Eye, 
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface LoadingState {
  stage: string;
  progress: number;
  message: string;
  icon?: React.ComponentType<{ className?: string }>;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

interface ProgressIndicatorProps {
  currentStage: number;
  totalStages: number;
  stages: LoadingState[];
  className?: string;
}

interface AILoadingProps {
  isProcessing: boolean;
  currentStage: string;
  progress: number;
  message: string;
  stages?: LoadingState[];
  className?: string;
}

interface DocumentProcessingProps {
  documentName: string;
  processingStage: 'upload' | 'ocr' | 'analysis' | 'compliance' | 'complete';
  progress: number;
  estimatedTime?: number;
  className?: string;
}

// ============================================================================
// LOADING STAGES CONFIGURATION
// ============================================================================

export const AI_PROCESSING_STAGES: LoadingState[] = [
  {
    stage: 'Initializing',
    progress: 10,
    message: 'Setting up AI processing environment...',
    icon: Zap,
    color: 'blue'
  },
  {
    stage: 'OCR Processing',
    progress: 25,
    message: 'Extracting text and detecting fields...',
    icon: FileText,
    color: 'green'
  },
  {
    stage: 'Computer Vision',
    progress: 40,
    message: 'Analyzing signatures and document security...',
    icon: Eye,
    color: 'purple'
  },
  {
    stage: 'Document Classification',
    progress: 55,
    message: 'Classifying document type and structure...',
    icon: Brain,
    color: 'blue'
  },
  {
    stage: 'Compliance Check',
    progress: 70,
    message: 'Validating ETA 2019 compliance requirements...',
    icon: Shield,
    color: 'yellow'
  },
  {
    stage: 'Risk Assessment',
    progress: 85,
    message: 'Calculating risk factors and recommendations...',
    icon: TrendingUp,
    color: 'red'
  },
  {
    stage: 'Generating Insights',
    progress: 95,
    message: 'Creating analysis summary and action items...',
    icon: CheckCircle,
    color: 'green'
  },
  {
    stage: 'Complete',
    progress: 100,
    message: 'Analysis complete!',
    icon: CheckCircle,
    color: 'green'
  }
];

// ============================================================================
// PROGRESS INDICATOR COMPONENT
// ============================================================================

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStage,
  totalStages,
  stages,
  className = ''
}) => {
  const progressPercentage = (currentStage / totalStages) * 100;

  return (
    <div className={`progress-indicator ${className}`}>
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Stage Indicators */}
      <div className="flex justify-between items-center">
        {stages.map((stage, index) => {
          const isActive = index <= currentStage;
          const isCurrent = index === currentStage;
          const Icon = stage.icon || CheckCircle;
          
          return (
            <div
              key={index}
              className={`flex flex-col items-center space-y-2 ${
                isActive ? 'opacity-100' : 'opacity-40'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isCurrent
                    ? `bg-${stage.color}-600 border-${stage.color}-600 text-white`
                    : isActive
                    ? `bg-${stage.color}-100 border-${stage.color}-600 text-${stage.color}-600`
                    : 'bg-gray-100 border-gray-300 text-gray-400'
                }`}
              >
                {isActive ? (
                  <Icon className="h-4 w-4" />
                ) : (
                  <div className="w-2 h-2 bg-gray-400 rounded-full" />
                )}
              </div>
              <div className="text-center">
                <p className={`text-xs font-medium ${
                  isCurrent ? `text-${stage.color}-600` : 'text-gray-500'
                }`}>
                  {stage.stage}
                </p>
                <p className="text-xs text-gray-400">
                  {stage.progress}%
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// AI LOADING COMPONENT
// ============================================================================

export const AILoading: React.FC<AILoadingProps> = ({
  isProcessing,
  currentStage,
  progress,
  message,
  stages = AI_PROCESSING_STAGES,
  className = ''
}) => {
  const currentStageIndex = stages.findIndex(stage => stage.stage === currentStage);
  const currentStageData = stages[currentStageIndex] || stages[0];

  if (!isProcessing) return null;

  return (
    <div className={`ai-loading bg-white rounded-lg border border-blue-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="flex-shrink-0">
          <div className="relative">
            <Brain className="h-8 w-8 text-blue-600" />
            <div className="absolute -top-1 -right-1">
              <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            AI Document Analysis
          </h3>
          <p className="text-sm text-gray-600">
            Processing your document with advanced AI capabilities
          </p>
        </div>
      </div>

      {/* Progress Section */}
      <div className="space-y-4">
        {/* Current Stage */}
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {currentStageData.icon && (
              <currentStageData.icon className={`h-5 w-5 text-${currentStageData.color}-600`} />
            )}
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">{currentStage}</p>
            <p className="text-sm text-gray-600">{message}</p>
          </div>
          <div className="text-sm font-medium text-gray-500">
            {progress}%
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`bg-${currentStageData.color}-600 h-3 rounded-full transition-all duration-500 ease-out`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Stage Progress */}
        <ProgressIndicator
          currentStage={currentStageIndex}
          totalStages={stages.length - 1}
          stages={stages}
        />
      </div>

      {/* Estimated Time */}
      <div className="mt-6 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-center space-x-2 text-sm text-blue-700">
          <Clock className="h-4 w-4" />
          <span>Estimated time remaining: 2-3 minutes</span>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// DOCUMENT PROCESSING COMPONENT
// ============================================================================

export const DocumentProcessing: React.FC<DocumentProcessingProps> = ({
  documentName,
  processingStage,
  progress,
  estimatedTime,
  className = ''
}) => {
  const getStageInfo = (stage: string) => {
    switch (stage) {
      case 'upload':
        return {
          icon: FileText,
          color: 'blue',
          message: 'Uploading document to secure storage...'
        };
      case 'ocr':
        return {
          icon: Eye,
          color: 'green',
          message: 'Extracting text and detecting form fields...'
        };
      case 'analysis':
        return {
          icon: Brain,
          color: 'purple',
          message: 'Analyzing document with AI intelligence...'
        };
      case 'compliance':
        return {
          icon: Shield,
          color: 'yellow',
          message: 'Checking compliance and legal requirements...'
        };
      case 'complete':
        return {
          icon: CheckCircle,
          color: 'green',
          message: 'Document processing complete!'
        };
      default:
        return {
          icon: FileText,
          color: 'blue',
          message: 'Processing document...'
        };
    }
  };

  const stageInfo = getStageInfo(processingStage);
  const Icon = stageInfo.icon;

  return (
    <div className={`document-processing bg-white rounded-lg border p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="flex-shrink-0">
          <Icon className={`h-6 w-6 text-${stageInfo.color}-600`} />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">
            Processing Document
          </h3>
          <p className="text-sm text-gray-600 truncate max-w-xs">
            {documentName}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">
            {stageInfo.message}
          </span>
          <span className="text-sm text-gray-500">
            {progress}%
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`bg-${stageInfo.color}-600 h-2 rounded-full transition-all duration-300`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {estimatedTime && processingStage !== 'complete' && (
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            <span>Estimated time: {estimatedTime}s</span>
          </div>
        )}
      </div>

      {/* Success State */}
      {processingStage === 'complete' && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2 text-green-700">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">
              Document processed successfully!
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// SIMPLE LOADING SPINNER
// ============================================================================

export const LoadingSpinner: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  className?: string;
}> = ({ size = 'md', color = 'blue', className = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
    purple: 'text-purple-600'
  };

  return (
    <Loader2 
      className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
    />
  );
};

// ============================================================================
// LOADING OVERLAY
// ============================================================================

export const LoadingOverlay: React.FC<{
  isVisible: boolean;
  message?: string;
  children?: React.ReactNode;
  className?: string;
}> = ({ isVisible, message = 'Loading...', children, className = '' }) => {
  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}>
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <div className="flex flex-col items-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-gray-700 font-medium">{message}</p>
          {children}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// SKELETON LOADING
// ============================================================================

export const SkeletonLoader: React.FC<{
  lines?: number;
  className?: string;
}> = ({ lines = 3, className = '' }) => {
  return (
    <div className={`animate-pulse space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`h-4 bg-gray-200 rounded ${
            index === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

const LoadingStates = {
  AILoading,
  DocumentProcessing,
  ProgressIndicator,
  LoadingSpinner,
  LoadingOverlay,
  SkeletonLoader,
  AI_PROCESSING_STAGES
};

export default LoadingStates;
