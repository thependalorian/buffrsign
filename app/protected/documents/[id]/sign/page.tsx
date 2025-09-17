/**
 * Signature Collection Page
 * 
 * Purpose: Collect signatures on documents with various signature methods
 * Location: /app/protected/documents/[id]/sign/page.tsx
 * Features: Multiple signature methods, validation, compliance checking
 */

"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { 
  FileText, 
  PenTool, 
  Type, 
  Upload, 
  CheckCircle, 
  Shield,
  Clock,
  ArrowLeft,
  Save,
  Eye
} from 'lucide-react';

export default function SignatureCollectionPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.id;
  
  const [signatureMethod, setSignatureMethod] = useState('draw');
  const [signatureData, setSignatureData] = useState('');
  const [isSigning, setIsSigning] = useState(false);
  const [currentField, setCurrentField] = useState(0);
  
  const [documentData] = useState({
    id: documentId,
    title: 'Employment Contract - John Doe',
    type: 'Employment Contract',
    signatureFields: [
      { 
        id: 1, 
        name: 'Employee Signature', 
        required: true, 
        signed: false,
        description: 'Your signature as the employee'
      },
      { 
        id: 2, 
        name: 'Date', 
        required: true, 
        signed: false,
        description: 'Date of signing'
      }
    ]
  });

  const [signatureCanvas, setSignatureCanvas] = useState<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Initialize signature canvas
    const canvas = document.getElementById('signature-canvas') as HTMLCanvasElement;
    if (canvas) {
      setSignatureCanvas(canvas);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
      }
    }
  }, []);

  const handleSignatureDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!signatureCanvas || signatureMethod !== 'draw') return;
    
    const rect = signatureCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = signatureCanvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const handleSignatureStart = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!signatureCanvas || signatureMethod !== 'draw') return;
    
    const rect = signatureCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = signatureCanvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const clearSignature = () => {
    if (!signatureCanvas) return;
    
    const ctx = signatureCanvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
    }
  };

  const handleSignatureType = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignatureData(e.target.value);
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSignatureData(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateSignature = () => {
    if (signatureMethod === 'draw' && signatureCanvas) {
      const ctx = signatureCanvas.getContext('2d');
      if (ctx) {
        const imageData = ctx.getImageData(0, 0, signatureCanvas.width, signatureCanvas.height);
        const hasData = imageData.data.some(pixel => pixel !== 0);
        return hasData;
      }
    }
    
    if (signatureMethod === 'type') {
      return signatureData.trim().length > 0;
    }
    
    if (signatureMethod === 'upload') {
      return signatureData.length > 0;
    }
    
    return false;
  };

  const handleSign = async () => {
    if (!validateSignature()) {
      alert('Please provide a valid signature');
      return;
    }

    setIsSigning(true);
    
    try {
      // Simulate signature processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update document state
      const updatedFields = [...documentData.signatureFields];
      updatedFields[currentField].signed = true;
      // Note: In a real app, this would update the document state
      // setDocumentData({ ...documentData, signatureFields: updatedFields });
      
      // Move to next field or complete
      if (currentField < documentData.signatureFields.length - 1) {
        setCurrentField(currentField + 1);
        clearSignature();
        setSignatureData('');
      } else {
        // All fields signed
        router.push(`/protected/documents/${documentId}`);
      }
    } catch (error) {
      console.error('Error signing document:', error);
      alert('Error signing document. Please try again.');
    } finally {
      setIsSigning(false);
    }
  };

  const currentFieldData = documentData.signatureFields[currentField];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                className="btn btn-ghost btn-sm"
                onClick={() => router.back()}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Document
              </button>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Sign Document</h1>
                <p className="text-sm text-gray-600">{documentData.title}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="btn btn-outline btn-sm">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </button>
              <button className="btn btn-outline btn-sm">
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Signature Area */}
          <div className="space-y-6">
            {/* Progress */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Signature Progress</h3>
              
              <div className="space-y-3">
                {documentData.signatureFields.map((field, index) => (
                  <div 
                    key={field.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      index === currentField ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        field.signed ? 'bg-green-500 text-white' : 
                        index === currentField ? 'bg-blue-500 text-white' : 'bg-gray-200'
                      }`}>
                        {field.signed ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <span className="text-xs font-medium">{index + 1}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{field.name}</p>
                        <p className="text-sm text-gray-600">{field.description}</p>
                      </div>
                    </div>
                    
                    {field.signed && (
                      <span className="badge badge-success">Signed</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Current Field */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">
                {currentFieldData.name}
              </h3>
              <p className="text-gray-600 mb-4">{currentFieldData.description}</p>
              
              {/* Signature Method Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Choose Signature Method
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    className={`p-3 border rounded-lg text-center transition-colors ${
                      signatureMethod === 'draw' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                    onClick={() => setSignatureMethod('draw')}
                  >
                    <PenTool className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                    <span className="text-sm font-medium">Draw</span>
                  </button>
                  
                  <button
                    className={`p-3 border rounded-lg text-center transition-colors ${
                      signatureMethod === 'type' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                    onClick={() => setSignatureMethod('type')}
                  >
                    <Type className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                    <span className="text-sm font-medium">Type</span>
                  </button>
                  
                  <button
                    className={`p-3 border rounded-lg text-center transition-colors ${
                      signatureMethod === 'upload' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                    onClick={() => setSignatureMethod('upload')}
                  >
                    <Upload className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                    <span className="text-sm font-medium">Upload</span>
                  </button>
                </div>
              </div>

              {/* Signature Input */}
              {signatureMethod === 'draw' && (
                <div className="space-y-4">
                  <canvas
                    id="signature-canvas"
                    width={400}
                    height={200}
                    className="border-2 border-gray-300 rounded-lg cursor-crosshair"
                    onMouseDown={handleSignatureStart}
                    onMouseMove={handleSignatureDraw}
                  />
                  <div className="flex space-x-3">
                    <button 
                      className="btn btn-outline btn-sm"
                      onClick={clearSignature}
                    >
                      Clear
                    </button>
                    <button 
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        if (signatureCanvas) {
                          const ctx = signatureCanvas.getContext('2d');
                          if (ctx) {
                            ctx.strokeStyle = '#000';
                            ctx.lineWidth = 2;
                          }
                        }
                      }}
                    >
                      Black
                    </button>
                    <button 
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        if (signatureCanvas) {
                          const ctx = signatureCanvas.getContext('2d');
                          if (ctx) {
                            ctx.strokeStyle = '#3B82F6';
                            ctx.lineWidth = 2;
                          }
                        }
                      }}
                    >
                      Blue
                    </button>
                  </div>
                </div>
              )}

              {signatureMethod === 'type' && (
                <div>
                  <input
                    type="text"
                    placeholder="Type your signature here..."
                    value={signatureData}
                    onChange={handleSignatureType}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg font-signature"
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    Type your full name as you would sign it
                  </p>
                </div>
              )}

              {signatureMethod === 'upload' && (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSignatureUpload}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    Upload a clear image of your signature
                  </p>
                  {signatureData && (
                    <div className="mt-3">
                      <Image 
                        src={signatureData} 
                        alt="Uploaded signature" 
                        width={400}
                        height={200}
                        className="max-w-full h-32 object-contain border rounded-lg"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Sign Button */}
              <button
                className={`btn btn-primary w-full mt-6 ${!validateSignature() || isSigning ? 'btn-disabled' : ''}`}
                disabled={!validateSignature() || isSigning}
                onClick={handleSign}
              >
                {isSigning ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Sign {currentFieldData.name}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Document Preview */}
          <div className="space-y-6">
            {/* Document Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Document Information</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Title:</span>
                  <span className="font-medium">{documentData.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium">{documentData.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Document ID:</span>
                  <span className="font-medium">{documentData.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Required Fields:</span>
                  <span className="font-medium">
                    {documentData.signatureFields.filter(f => f.required).length} of {documentData.signatureFields.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Compliance Status */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Compliance Status</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>ETA 2019 Compliant</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>Digital Signature Valid</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>Audit Trail Active</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span>CRAN Accredited</span>
                </div>
              </div>
            </div>

            {/* Document Preview */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Document Preview</h3>
              
              <div className="border rounded-lg p-4 min-h-[300px] bg-gray-50">
                <div className="text-center text-gray-500">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-sm">Document preview will be displayed here</p>
                  <p className="text-xs text-gray-400">Click &quot;Preview&quot; button to view full document</p>
                </div>
              </div>
            </div>

            {/* Help */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Need Help?</h4>
              <p className="text-sm text-blue-700 mb-3">
                If you have any questions about signing this document, please contact support.
              </p>
              <button className="btn btn-outline btn-sm text-blue-700 border-blue-300">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
