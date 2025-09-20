/**
 * Document Viewer/Editor Page
 * 
 * Purpose: View and edit documents with signature fields and collaboration
 * Location: /app/protected/documents/[id]/page.tsx
 * Features: Document viewing, signature field placement, collaboration, real-time updates
 */

"use client";

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { 
  FileText, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Edit3, 
  Eye, 
  Download,
  Share2,
  MessageSquare,
  History,
  Shield
} from 'lucide-react';

export default function DocumentViewerPage() {
  const params = useParams();
  const documentId = params.id;
  
  const [activeTab, setActiveTab] = useState('view');
  const [_document] = useState({
    id: documentId,
    title: 'Employment Contract - John Doe',
    status: 'pending',
    type: 'Employment Contract',
    created: '2025-01-15',
    deadline: '2025-01-22',
    participants: [
      { name: 'John Doe', email: 'john.doe@example.com', role: 'Employee', status: 'signed' },
      { name: 'Jane Smith', email: 'jane.smith@company.com', role: 'Employer', status: 'pending' },
      { name: 'HR Manager', email: 'hr@company.com', role: 'Witness', status: 'pending' }
    ],
    signatureFields: [
      { id: 1, name: 'Employee Signature', x: 100, y: 300, width: 200, height: 60, required: true, signed: true },
      { id: 2, name: 'Employer Signature', x: 100, y: 400, width: 200, height: 60, required: true, signed: false },
      { id: 3, name: 'Witness Signature', x: 100, y: 500, width: 200, height: 60, required: false, signed: false },
      { id: 4, name: 'Date', x: 100, y: 600, width: 150, height: 40, required: true, signed: true }
    ]
  });

  const [isEditing, setIsEditing] = useState(false);
  const [selectedField, setSelectedField] = useState<{ id: number; name: string; x: number; y: number; width: number; height: number; required: boolean; signed: boolean } | null>(null);

  const renderTab = (id: string, label: string, icon: React.ReactNode) => (
    <button
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
        activeTab === id ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
      }`}
      onClick={() => setActiveTab(id)}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'signed': return 'badge-success';
      case 'pending': return 'badge-warning';
      case 'overdue': return 'badge-error';
      default: return 'badge-neutral';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'signed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'overdue': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{_document.title}</h1>
                <p className="text-sm text-gray-600">Document ID: {_document.id}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="btn btn-outline btn-sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </button>
              <button className="btn btn-outline btn-sm">
                <Download className="w-4 h-4 mr-2" />
                Download
              </button>
              <button 
                className={`btn btn-sm ${isEditing ? 'btn-error' : 'btn-primary'}`}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel Edit' : 'Edit Document'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Document Area */}
          <div className="lg:col-span-2">
            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex space-x-2">
                {renderTab('view', 'View', <Eye className="w-4 h-4" />)}
                {renderTab('edit', 'Edit', <Edit3 className="w-4 h-4" />)}
                {renderTab('collaboration', 'Collaboration', <Users className="w-4 h-4" />)}
                {renderTab('history', 'History', <History className="w-4 h-4" />)}
              </div>
            </div>

            {/* Document Content */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              {activeTab === 'view' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">EMPLOYMENT AGREEMENT</h2>
                    <p className="text-gray-600">This agreement is made between the parties listed below</p>
                  </div>

                  {/* Document Content */}
                  <div className="border rounded-lg p-6 min-h-[600px] relative">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold">Employee Details</h3>
                        <p><strong>Name:</strong> John Doe</p>
                        <p><strong>Position:</strong> Software Developer</p>
                        <p><strong>Start Date:</strong> January 15, 2025</p>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold">Employer Details</h3>
                        <p><strong>Company:</strong> Tech Solutions Ltd</p>
                        <p><strong>Address:</strong> 123 Business Street, Windhoek</p>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold">Terms and Conditions</h3>
                        <p>This employment agreement outlines the terms and conditions of employment...</p>
                      </div>
                    </div>

                    {/* Signature Fields Overlay */}
                    {_document.signatureFields.map((field) => (
                      <div
                        key={field.id}
                        className={`absolute border-2 rounded-lg p-2 cursor-pointer transition-all ${
                          field.signed 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-blue-500 bg-blue-50'
                        } ${selectedField?.id === field.id ? 'ring-2 ring-blue-400' : ''}`}
                        style={{
                          left: field.x,
                          top: field.y,
                          width: field.width,
                          height: field.height
                        }}
                        onClick={() => setSelectedField(field)}
                      >
                        <div className="text-xs font-medium text-center">
                          {field.signed ? (
                            <div className="flex items-center justify-center h-full">
                              <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                              Signed
                            </div>
                          ) : (
                            <div className="text-center">
                              <div className="text-xs text-gray-600">{field.name}</div>
                              <div className="text-xs text-blue-600">Click to sign</div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Document Actions */}
                  <div className="flex justify-center space-x-4">
                    <button className="btn btn-primary">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Sign Document
                    </button>
                    <button className="btn btn-outline">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Add Comment
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'edit' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Edit Document</h3>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                      <p className="text-yellow-800">
                        Document editing features are available with SME and higher plans.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'collaboration' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Collaboration</h3>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      <p className="text-blue-800">
                        Real-time collaboration features are available with SME and higher plans.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Document History</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Document signed by John Doe</p>
                        <p className="text-xs text-gray-600">January 15, 2025 at 2:30 PM</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Document uploaded</p>
                        <p className="text-xs text-gray-600">January 15, 2025 at 2:00 PM</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Document Status */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Document Status</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm font-medium text-blue-600">40%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{width: '40%'}}></div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Signed Fields</span>
                    <span className="text-green-600">2 of 4</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Participants</span>
                    <span className="text-blue-600">1 of 3</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>ETA 2019 Compliance</span>
                    <span className="text-green-600">✓ Verified</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Participants */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Participants</h3>
              
              <div className="space-y-3">
                {_document.participants.map((participant, _index) => (
                  <div key={_index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{participant.name}</p>
                      <p className="text-xs text-gray-600">{participant.role}</p>
                    </div>
                    <span className={`badge badge-sm ${getStatusColor(participant.status)}`}>
                      {getStatusIcon(participant.status)}
                      {participant.status}
                    </span>
                  </div>
                ))}
              </div>
              
              <button className="btn btn-outline btn-sm w-full mt-4">
                <Users className="w-4 h-4 mr-2" />
                Add Participant
              </button>
            </div>

            {/* Document Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Document Information</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium">{_document.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">{_document.created}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Deadline:</span>
                  <span className="font-medium">{_document.deadline}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`badge badge-sm ${getStatusColor(_document.status)}`}>
                    {_document.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Security & Compliance */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Security & Compliance</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>ETA 2019 Compliant</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>256-bit Encryption</span>
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
          </div>
        </div>
      </div>
    </div>
  );
}
