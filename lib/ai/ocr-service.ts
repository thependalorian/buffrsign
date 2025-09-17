// BuffrSign Platform - OCR Service
// Optical Character Recognition for document text extraction and field detection

'use client';


// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface OCRResult {
  text: string;
  confidence: number;
  language: string;
  pages: OCRPage[];
  processing_time_ms: number;
  metadata: OCRMetadata;
}

export interface OCRPage {
  page_number: number;
  text: string;
  confidence: number;
  width: number;
  height: number;
  blocks: OCRBlock[];
}

export interface OCRBlock {
  id: string;
  type: 'text' | 'table' | 'image' | 'signature_field';
  text: string;
  confidence: number;
  bounding_box: BoundingBox;
  properties: OCRBlockProperties;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface OCRBlockProperties {
  font_size?: number;
  font_family?: string;
  is_bold?: boolean;
  is_italic?: boolean;
  color?: string;
  alignment?: 'left' | 'center' | 'right' | 'justify';
}

export interface OCRMetadata {
  document_type: string;
  file_size: number;
  image_quality: number;
  text_density: number;
  has_tables: boolean;
  has_images: boolean;
  has_signatures: boolean;
  languages_detected: string[];
}

export interface FieldDetectionResult {
  fields: DetectedField[];
  confidence: number;
  processing_time_ms: number;
}

export interface DetectedField {
  id: string;
  type: 'signature' | 'date' | 'name' | 'address' | 'phone' | 'email' | 'amount' | 'checkbox';
  label: string;
  value?: string;
  confidence: number;
  bounding_box: BoundingBox;
  page_number: number;
  is_required: boolean;
  validation_rules?: ValidationRule[];
}

export interface ValidationRule {
  type: 'format' | 'required' | 'range' | 'pattern';
  value: string;
  message: string;
}

export interface TableExtractionResult {
  tables: ExtractedTable[];
  confidence: number;
  processing_time_ms: number;
}

export interface ExtractedTable {
  id: string;
  page_number: number;
  bounding_box: BoundingBox;
  rows: TableRow[];
  headers: string[];
  confidence: number;
}

export interface TableRow {
  cells: TableCell[];
  row_index: number;
}

export interface TableCell {
  text: string;
  column_index: number;
  confidence: number;
  bounding_box: BoundingBox;
}

// ============================================================================
// OCR SERVICE
// ============================================================================

export class OCRService {
  private apiBaseUrl: string;
  private apiKey: string;

  constructor(apiBaseUrl: string = '/api/ai', apiKey?: string) {
    this.apiBaseUrl = apiBaseUrl;
    this.apiKey = apiKey || '';
  }

  // ============================================================================
  // DOCUMENT TEXT EXTRACTION
  // ============================================================================

  /**
   * Extract text from document using OCR
   */
  async extractText(
    documentId: string,
    options: {
      language?: string;
      enhance_image?: boolean;
      detect_orientation?: boolean;
      preserve_layout?: boolean;
    } = {}
  ): Promise<{ success: boolean; result?: OCRResult; error?: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/ocr/extract-text`, {
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
      return { success: true, result: result.ocr_result };
    } catch (error) {
      console.error('OCR text extraction error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'OCR text extraction failed' };
    }
  }

  /**
   * Extract text from image file
   */
  async extractTextFromImage(
    imageFile: File,
    options: {
      language?: string;
      enhance_image?: boolean;
      detect_orientation?: boolean;
    } = {}
  ): Promise<{ success: boolean; result?: OCRResult; error?: string }> {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('options', JSON.stringify(options));

      const response = await fetch(`${this.apiBaseUrl}/ocr/extract-from-image`, {
        method: 'POST',
        headers: {
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, result: result.ocr_result };
    } catch (error) {
      console.error('OCR image extraction error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'OCR image extraction failed' };
    }
  }

  // ============================================================================
  // FIELD DETECTION
  // ============================================================================

  /**
   * Detect form fields in document
   */
  async detectFields(
    documentId: string,
    fieldTypes: string[] = ['signature', 'date', 'name', 'address', 'phone', 'email', 'amount']
  ): Promise<{ success: boolean; result?: FieldDetectionResult; error?: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/ocr/detect-fields`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify({
          document_id: documentId,
          field_types: fieldTypes
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, result: result.field_detection };
    } catch (error) {
      console.error('Field detection error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Field detection failed' };
    }
  }

  /**
   * Detect signature fields specifically
   */
  async detectSignatureFields(
    documentId: string
  ): Promise<{ success: boolean; fields?: DetectedField[]; error?: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/ocr/detect-signature-fields`, {
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
      return { success: true, fields: result.signature_fields };
    } catch (error) {
      console.error('Signature field detection error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Signature field detection failed' };
    }
  }

  // ============================================================================
  // TABLE EXTRACTION
  // ============================================================================

  /**
   * Extract tables from document
   */
  async extractTables(
    documentId: string
  ): Promise<{ success: boolean; result?: TableExtractionResult; error?: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/ocr/extract-tables`, {
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
      return { success: true, result: result.table_extraction };
    } catch (error) {
      console.error('Table extraction error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Table extraction failed' };
    }
  }

  // ============================================================================
  // DOCUMENT ANALYSIS
  // ============================================================================

  /**
   * Analyze document structure
   */
  async analyzeDocumentStructure(
    documentId: string
  ): Promise<{ success: boolean; structure?: Record<string, unknown>; error?: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/ocr/analyze-structure`, {
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
      return { success: true, structure: result.document_structure };
    } catch (error) {
      console.error('Document structure analysis error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Document structure analysis failed' };
    }
  }

  /**
   * Detect document type
   */
  async detectDocumentType(
    documentId: string
  ): Promise<{ success: boolean; documentType?: string; confidence?: number; error?: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/ocr/detect-document-type`, {
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
      return { 
        success: true, 
        documentType: result.document_type,
        confidence: result.confidence
      };
    } catch (error) {
      console.error('Document type detection error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Document type detection failed' };
    }
  }

  // ============================================================================
  // BATCH PROCESSING
  // ============================================================================

  /**
   * Process multiple documents with OCR
   */
  async batchProcessDocuments(
    documentIds: string[],
    operations: string[] = ['extract_text', 'detect_fields']
  ): Promise<{ success: boolean; results?: Record<string, unknown>; error?: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/ocr/batch-process`, {
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
      console.error('OCR batch processing error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'OCR batch processing failed' };
    }
  }
}

// ============================================================================
// REACT HOOKS FOR OCR SERVICE
// ============================================================================

import { useState, useEffect, useCallback, useMemo } from 'react';

export function useOCRTextExtraction(documentId: string) {
  const [result, setResult] = useState<OCRResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ocrService = useMemo(() => new OCRService(), []);

  const extractText = useCallback(async () => {
    if (!documentId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await ocrService.extractText(documentId);
      if (response.success && response.result) {
        setResult(response.result);
      } else {
        setError(response.error || 'Text extraction failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Text extraction failed');
    } finally {
      setLoading(false);
    }
  }, [documentId, ocrService]);

  useEffect(() => {
    extractText();
  }, [extractText]);

  return {
    result,
    loading,
    error,
    refetch: extractText
  };
}

export function useFieldDetection(documentId: string, fieldTypes?: string[]) {
  const [fields, setFields] = useState<DetectedField[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ocrService = useMemo(() => new OCRService(), []);

  const detectFields = useCallback(async () => {
    if (!documentId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await ocrService.detectFields(documentId, fieldTypes);
      if (response.success && response.result) {
        setFields(response.result.fields);
      } else {
        setError(response.error || 'Field detection failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Field detection failed');
    } finally {
      setLoading(false);
    }
  }, [documentId, fieldTypes, ocrService]);

  useEffect(() => {
    detectFields();
  }, [detectFields]);

  return {
    fields,
    loading,
    error,
    refetch: detectFields
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export const ocrService = new OCRService();
export default ocrService;
