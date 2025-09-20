// BuffrSign Platform - Computer Vision Service
// Computer Vision for signature detection, _document security, and image analysis

'use client';


// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface VisionAnalysisResult {
  document_id: string;
  analysis_type: string;
  confidence: number;
  processing_time_ms: number;
  results: VisionResult[];
  metadata: VisionMetadata;
}

export interface VisionResult {
  type: 'signature' | 'text' | 'image' | 'table' | 'security_feature' | 'anomaly';
  confidence: number;
  bounding_box: BoundingBox;
  properties: VisionProperties;
  page_number: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface VisionProperties {
  signature_type?: 'handwritten' | 'digital' | 'stamp' | 'seal';
  text_content?: string;
  font_size?: number;
  color?: string;
  security_level?: 'low' | 'medium' | 'high';
  anomaly_type?: string;
  quality_score?: number;
}

export interface VisionMetadata {
  image_quality: number;
  resolution: { width: number; height: number };
  color_space: string;
  compression_ratio: number;
  has_watermarks: boolean;
  has_tampering: boolean;
  security_features: string[];
}

export interface SignatureDetectionResult {
  signatures: DetectedSignature[];
  confidence: number;
  processing_time_ms: number;
}

export interface DetectedSignature {
  id: string;
  type: 'handwritten' | 'digital' | 'stamp' | 'seal';
  confidence: number;
  bounding_box: BoundingBox;
  page_number: number;
  quality_score: number;
  is_valid: boolean;
  validation_details: SignatureValidation;
}

export interface SignatureValidation {
  is_complete: boolean;
  is_legible: boolean;
  matches_template: boolean;
  security_features: string[];
  risk_score: number;
}

export interface DocumentSecurityResult {
  security_score: number;
  threats_detected: SecurityThreat[];
  recommendations: string[];
  processing_time_ms: number;
}

export interface SecurityThreat {
  type: 'tampering' | 'forgery' | 'manipulation' | 'unauthorized_access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  confidence: number;
  location: BoundingBox;
  page_number: number;
}

export interface ImageQualityResult {
  overall_quality: number;
  metrics: QualityMetrics;
  recommendations: string[];
  processing_time_ms: number;
}

export interface QualityMetrics {
  sharpness: number;
  brightness: number;
  contrast: number;
  noise_level: number;
  resolution_score: number;
  compression_artifacts: number;
}

export interface AnomalyDetectionResult {
  anomalies: DetectedAnomaly[];
  confidence: number;
  processing_time_ms: number;
}

export interface DetectedAnomaly {
  type: 'inconsistency' | 'manipulation' | 'missing_content' | 'unusual_pattern';
  description: string;
  confidence: number;
  bounding_box: BoundingBox;
  page_number: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// ============================================================================
// COMPUTER VISION SERVICE
// ============================================================================

export class ComputerVisionService {
  private apiBaseUrl: string;
  private apiKey: string;

  constructor(apiBaseUrl: string = '/api/ai', apiKey?: string) {
    this.apiBaseUrl = apiBaseUrl;
    this.apiKey = apiKey || '';
  }

  // ============================================================================
  // SIGNATURE DETECTION
  // ============================================================================

  /**
   * Detect signatures in document
   */
  async detectSignatures(
    documentId: string,
    options: {
      signature_types?: string[];
      min_confidence?: number;
      validate_signatures?: boolean;
    } = {}
  ): Promise<{ success: boolean; result?: SignatureDetectionResult; error?: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/cv/detect-signatures`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify({
          document_id: documentId,
          options
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, result: result.signature_detection };
    } catch (error) {
      console.error('Signature detection error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Signature detection failed' };
    }
  }

  /**
   * Validate signature authenticity
   */
  async validateSignature(
    documentId: string,
    signatureId: string
  ): Promise<{ success: boolean; validation?: SignatureValidation; error?: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/cv/validate-signature`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify({
          document_id: documentId,
          signature_id: signatureId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, validation: result.validation };
    } catch (error) {
      console.error('Signature validation error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Signature validation failed' };
    }
  }

  // ============================================================================
  // DOCUMENT SECURITY
  // ============================================================================

  /**
   * Analyze _document security
   */
  async analyzeDocumentSecurity(
    documentId: string
  ): Promise<{ success: boolean; result?: DocumentSecurityResult; error?: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/cv/analyze-security`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify({
          document_id: documentId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, result: result.security_analysis };
    } catch (error) {
      console.error('Document security analysis error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Document security analysis failed' };
    }
  }

  /**
   * Detect _document tampering
   */
  async detectTampering(
    documentId: string
  ): Promise<{ success: boolean; tampering?: SecurityThreat[]; error?: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/cv/detect-tampering`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify({
          document_id: documentId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, tampering: result.tampering_detected };
    } catch (error) {
      console.error('Tampering detection error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Tampering detection failed' };
    }
  }

  // ============================================================================
  // IMAGE QUALITY ANALYSIS
  // ============================================================================

  /**
   * Analyze image quality
   */
  async analyzeImageQuality(
    documentId: string
  ): Promise<{ success: boolean; result?: ImageQualityResult; error?: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/cv/analyze-quality`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify({
          document_id: documentId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, result: result.quality_analysis };
    } catch (error) {
      console.error('Image quality analysis error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Image quality analysis failed' };
    }
  }

  /**
   * Enhance image quality
   */
  async enhanceImageQuality(
    documentId: string,
    enhancementType: 'denoise' | 'sharpen' | 'contrast' | 'brightness' | 'all' = 'all'
  ): Promise<{ success: boolean; enhancedImageUrl?: string; error?: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/cv/enhance-quality`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify({
          document_id: documentId,
          enhancement_type: enhancementType
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, enhancedImageUrl: result.enhanced_image_url };
    } catch (error) {
      console.error('Image enhancement error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Image enhancement failed' };
    }
  }

  // ============================================================================
  // ANOMALY DETECTION
  // ============================================================================

  /**
   * Detect anomalies in document
   */
  async detectAnomalies(
    documentId: string
  ): Promise<{ success: boolean; result?: AnomalyDetectionResult; error?: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/cv/detect-anomalies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify({
          document_id: documentId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, result: result.anomaly_detection };
    } catch (error) {
      console.error('Anomaly detection error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Anomaly detection failed' };
    }
  }

  // ============================================================================
  // COMPREHENSIVE VISION ANALYSIS
  // ============================================================================

  /**
   * Perform comprehensive vision analysis
   */
  async performComprehensiveAnalysis(
    documentId: string,
    analysisTypes: string[] = ['signatures', 'security', 'quality', 'anomalies']
  ): Promise<{ success: boolean; analysis?: VisionAnalysisResult; error?: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/cv/comprehensive-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify({
          document_id: documentId,
          analysis_types: analysisTypes
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, analysis: result.comprehensive_analysis };
    } catch (error) {
      console.error('Comprehensive vision analysis error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Comprehensive vision analysis failed' };
    }
  }

  // ============================================================================
  // BATCH PROCESSING
  // ============================================================================

  /**
   * Process multiple documents with computer vision
   */
  async batchProcessDocuments(
    documentIds: string[],
    operations: string[] = ['detect_signatures', 'analyze_security']
  ): Promise<{ success: boolean; results?: Record<string, unknown>; error?: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/cv/batch-process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify({
          document_ids: documentIds,
          operations
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, results: result.results };
    } catch (error) {
      console.error('Computer vision batch processing error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Computer vision batch processing failed' };
    }
  }
}

// ============================================================================
// REACT HOOKS FOR COMPUTER VISION SERVICE
// ============================================================================

import { useState, useEffect, useCallback, useMemo } from 'react';

export function useSignatureDetection(documentId: string) {
  const [signatures, setSignatures] = useState<DetectedSignature[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cvService = useMemo(() => new ComputerVisionService(), []);

  const detectSignatures = useCallback(async () => {
    if (!documentId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await cvService.detectSignatures(documentId);
      if (response.success && response.result) {
        setSignatures(response.result.signatures);
      } else {
        setError(response.error || 'Signature detection failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signature detection failed');
    } finally {
      setLoading(false);
    }
  }, [documentId, cvService]);

  useEffect(() => {
    detectSignatures();
  }, [detectSignatures]);

  return {
    signatures,
    loading,
    error,
    refetch: detectSignatures
  };
}

export function useDocumentSecurity(documentId: string) {
  const [security, setSecurity] = useState<DocumentSecurityResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cvService = useMemo(() => new ComputerVisionService(), []);

  const analyzeSecurity = useCallback(async () => {
    if (!documentId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await cvService.analyzeDocumentSecurity(documentId);
      if (response.success && response.result) {
        setSecurity(response.result);
      } else {
        setError(response.error || 'Security analysis failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Security analysis failed');
    } finally {
      setLoading(false);
    }
  }, [documentId, cvService]);

  useEffect(() => {
    analyzeSecurity();
  }, [analyzeSecurity]);

  return {
    security,
    loading,
    error,
    refetch: analyzeSecurity
  };
}

export function useImageQuality(documentId: string) {
  const [quality, setQuality] = useState<ImageQualityResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cvService = useMemo(() => new ComputerVisionService(), []);

  const analyzeQuality = useCallback(async () => {
    if (!documentId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await cvService.analyzeImageQuality(documentId);
      if (response.success && response.result) {
        setQuality(response.result);
      } else {
        setError(response.error || 'Quality analysis failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Quality analysis failed');
    } finally {
      setLoading(false);
    }
  }, [documentId, cvService]);

  useEffect(() => {
    analyzeQuality();
  }, [analyzeQuality]);

  return {
    quality,
    loading,
    error,
    refetch: analyzeQuality
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export const computerVisionService = new ComputerVisionService();
export default computerVisionService;
