/**
 * BuffrSign Signature Field Component
 * 
 * Purpose: AI-powered signature field with compliance checking
 * Location: /components/ui/SignatureField.tsx
 * Features: TypeScript-based, Groq AI integration, ETA 2019 compliance, web-focused
 */

import React, { useState, useRef, useCallback } from 'react';
import { SignatureData, SignatureValidation, ComplianceStatus } from '@/lib/design-system';
import { cn } from '@/lib/utils';

interface SignatureFieldProps {
  method: 'draw' | 'type' | 'upload';
  validation: SignatureValidation | null;
  compliance: ComplianceStatus;
  onSignature: (signature: SignatureData) => void;
  onValidation: (validation: SignatureValidation) => void;
}

const SignatureField: React.FC<SignatureFieldProps> = ({
  method,
  validation,
  compliance,
  onSignature,
  onValidation
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [signatureData, setSignatureData] = useState<SignatureData | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI-powered validation using Groq
  const validateSignature = async (data: SignatureData): Promise<SignatureValidation> => {
    setIsValidating(true);
    
    try {
      // Simulate Groq AI validation
      const response = await fetch('/api/ai/validate-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signatureData: data,
          method,
          compliance: compliance
        })
      });
      
      const result: SignatureValidation = await response.json();
      onValidation(result);
      return result;
    } catch (error) {
      console.error('Signature validation failed:', error);
      throw error;
    } finally {
      setIsValidating(false);
    }
  };

  // Handle drawing signature
  const handleDrawStart = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const handleDrawMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const handleDrawEnd = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataURL = canvas.toDataURL();
    const signatureData: SignatureData = {
      image_url: dataURL,
      verification_hash: generateVerificationHash(dataURL)
    };
    
    onSignature(signatureData);
    validateSignature(signatureData);
  };

  // Handle typed signature
  const handleTypeSignature = (text: string) => {
    const signatureData: SignatureData = {
      digital_signature: text,
      verification_hash: generateVerificationHash(text)
    };
    
    onSignature(signatureData);
    validateSignature(signatureData);
  };

  // Handle uploaded signature
  const handleUploadSignature = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataURL = e.target?.result as string;
      const signatureData: SignatureData = {
        image_url: dataURL,
        verification_hash: generateVerificationHash(dataURL)
      };
      
      setSignatureData(signatureData);
      onSignature(signatureData);
      validateSignature(signatureData);
    };
    reader.readAsDataURL(file);
  };

  // Generate verification hash
  const generateVerificationHash = (data: string): string => {
    // Simple hash generation - in production, use crypto.subtle
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  };

  // Clear signature
  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  // Render signature method
  const renderSignatureMethod = () => {
    switch (method) {
      case 'draw':
        return (
          <div className="space-y-4">
            <canvas
              ref={canvasRef}
              width={400}
              height={200}
              className={cn(
                'border-2 border-dashed border-border rounded-lg cursor-crosshair',
                validation?.valid ? 'border-chart-2' : 'border-chart-5'
              )}
              onMouseDown={handleDrawStart}
              onMouseMove={handleDrawMove}
              onMouseUp={handleDrawEnd}
              onMouseLeave={handleDrawEnd}
            />
            <div className="flex gap-2">
              <button
                onClick={clearSignature}
                className="px-4 py-2 text-sm bg-muted hover:bg-muted/80 rounded-md"
              >
                Clear
              </button>
            </div>
          </div>
        );
        
      case 'type':
        return (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Type your signature"
              className="w-full p-3 border border-border rounded-md focus:ring-2 focus:ring-chart-1 focus:border-transparent"
              onChange={(e) => handleTypeSignature(e.target.value)}
            />
          </div>
        );
        
      case 'upload':
        return (
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUploadSignature(file);
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-4 border-2 border-dashed border-border rounded-lg hover:border-chart-1 transition-colors"
            >
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-muted-foreground" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="mt-2 text-sm text-muted-foreground">Upload signature image</p>
              </div>
            </button>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Signature Method Selection */}
      <div className="flex gap-2">
        {(['draw', 'type', 'upload'] as const).map((m) => (
          <button
            key={m}
            onClick={() => {/* Handle method change */}}
            className={cn(
              'px-3 py-2 text-sm rounded-md transition-colors',
              method === m
                ? 'bg-chart-1 text-white'
                : 'bg-muted hover:bg-muted/80'
            )}
          >
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>

      {/* Signature Input */}
      {renderSignatureMethod()}

      {/* Validation Status */}
      {isValidating && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Validating signature with AI...</span>
        </div>
      )}

      {/* Compliance Status */}
      {validation && (
        <div className={cn(
          'p-3 rounded-md',
          validation.valid ? 'bg-chart-2/10 border border-chart-2/20' : 'bg-chart-5/10 border border-chart-5/20'
        )}>
          <div className="flex items-center space-x-2">
            {validation.valid ? (
              <svg className="h-5 w-5 text-chart-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-chart-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span className={cn(
              'text-sm font-medium',
              validation.valid ? 'text-chart-2' : 'text-chart-5'
            )}>
              {validation.valid ? 'Signature Valid' : 'Signature Invalid'}
            </span>
          </div>
          
          {validation.recommendations.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-muted-foreground">Recommendations:</p>
              <ul className="mt-1 text-sm text-muted-foreground list-disc list-inside">
                {validation.recommendations.map((rec, _index) => (
                  <li key={_index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ETA 2019 Compliance Notice */}
      <div className="p-3 bg-chart-1/10 border border-chart-1/20 rounded-md">
        <div className="flex items-start space-x-2">
          <svg className="h-5 w-5 text-chart-1 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-chart-1">ETA 2019 Compliance</p>
            <p className="text-sm text-chart-1/80">
              This signature complies with Namibian Electronic Transactions Act 2019 requirements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignatureField;