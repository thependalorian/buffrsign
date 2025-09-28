"use client";

import React, { useState, ComponentType } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Shield, 
  Scale, 
  Globe, 
  Gavel,
  MapPin,
  Network,
  ZoomIn,
  ZoomOut,
  Brain,
  PenTool
} from 'lucide-react';

interface KnowledgeNode {
  id: string;
  label: string;
  type: string;
  x: number;
  y: number;
  size: number;
  category: string;
  description: string;
  sections?: string[];
  requirements?: string[];
  documents?: string[];
}

interface Connection {
  from: string;
  to: string;
  strength: number;
}

const BuffrSignKnowledgeGraph = () => {
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1.1);
  const [panOffset, setPanOffset] = useState({ x: -50, y: -10 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Comprehensive legal documents and frameworks based on all documents in the /documents folder
  const nodes: KnowledgeNode[] = [
    // BuffrSign AI (Center)
    { 
      id: 'buffrsign-ai', 
      label: 'BuffrSign AI', 
      type: 'ai', 
      x: 400, 
      y: 300, 
      size: 45,
      category: 'ai',
      description: 'Central AI system for intelligent document analysis and legal compliance'
    },
    
    // Primary Legal Framework - ETA 2019 (Top center)
    { 
      id: 'eta-2019', 
      label: 'ETA 2019\nElectronic Transactions Act', 
      type: 'legal', 
      x: 400, 
      y: 180, 
      size: 35,
      category: 'legal',
      description: 'Electronic Transactions Act 2019 - Core legal framework for digital signatures in Namibia',
      sections: ['Section 17: Legal Recognition', 'Section 20: Electronic Signatures', 'Section 21: Original Information', 'Section 24: Retention']
    },
    
    // ETA 2019 Sections (Around ETA 2019 with better spacing)
    { 
      id: 'section-17', 
      label: 'Section 17\nLegal Recognition', 
      type: 'legal-section', 
      x: 200, 
      y: 80, 
      size: 25,
      category: 'legal',
      description: 'Legal recognition of electronic transactions and digital documents under Namibian law'
    },
    { 
      id: 'section-20', 
      label: 'Section 20\nElectronic Signatures', 
      type: 'legal-section', 
      x: 300, 
      y: 60, 
      size: 25,
      category: 'legal',
      description: 'Requirements and validity of electronic signatures in Namibia'
    },
    { 
      id: 'section-21', 
      label: 'Section 21\nOriginal Information', 
      type: 'legal-section', 
      x: 500, 
      y: 80, 
      size: 25,
      category: 'legal',
      description: 'Requirements for maintaining original information integrity'
    },
    { 
      id: 'section-24', 
      label: 'Section 24\nRetention', 
      type: 'legal-section', 
      x: 600, 
      y: 120, 
      size: 25,
      category: 'legal',
      description: 'Document retention and archival requirements'
    },

    // CRAN Requirements (Right side - expanded with better spacing)
    { 
      id: 'cran-requirements', 
      label: 'CRAN\nRequirements', 
      type: 'compliance', 
      x: 550, 
      y: 300, 
      size: 32,
      category: 'compliance',
      description: 'Communications Regulatory Authority of Namibia digital signature standards',
      requirements: ['Security Service Standards', 'Audit Trail Requirements', 'Digital Certificate Management']
    },
    { 
      id: 'cran-security-service', 
      label: 'CRAN Security\nService Requirements', 
      type: 'compliance', 
      x: 550, 
      y: 190, 
      size: 24,
      category: 'compliance',
      description: 'Comprehensive security service requirements for digital signature platforms'
    },
    { 
      id: 'cran-audit-trail', 
      label: 'CRAN Audit Trail\nRequirements', 
      type: 'compliance', 
      x: 600, 
      y: 380, 
      size: 24,
      category: 'compliance',
      description: 'Audit trail requirements for digital signature operations'
    },
    { 
      id: 'cran-digital-certificates', 
      label: 'CRAN Digital\nCertificate Standards', 
      type: 'compliance', 
      x: 700, 
      y: 350, 
      size: 24,
      category: 'compliance',
      description: 'Digital certificate standards and management requirements'
    },

    // International Standards (Top right - expanded with better spacing)
    { 
      id: 'iso-27001', 
      label: 'ISO 27001\nInformation Security', 
      type: 'international', 
      x: 740, 
      y: 100, 
      size: 28,
      category: 'international',
      description: 'International security management standard for information security'
    },
    { 
      id: 'iso-14533', 
      label: 'ISO 14533\nDigital Signatures', 
      type: 'international', 
      x: 720, 
      y: 200, 
      size: 28,
      category: 'international',
      description: 'ISO standard for digital signatures and related services'
    },
    { 
      id: 'eidas-regulation', 
      label: 'eIDAS\nRegulation', 
      type: 'international', 
      x: 820, 
      y: 200, 
      size: 28,
      category: 'international',
      description: 'European electronic identification and trust services regulation'
    },
    { 
      id: 'uncitral-model', 
      label: 'UNCITRAL\nModel Law', 
      type: 'international', 
      x: 790, 
      y: 280, 
      size: 28,
      category: 'international',
      description: 'UNCITRAL Model Law on Electronic Signatures (2001)'
    },

    // SADC Framework (Left side - expanded)
    { 
      id: 'sadc-framework', 
      label: 'SADC Digital\nSignature Framework', 
      type: 'regional', 
      x: 150, 
      y: 300, 
      size: 28,
      category: 'regional',
      description: 'Southern African Development Community digital signature framework'
    },
    { 
      id: 'cross-border-recognition', 
      label: 'Cross-Border\nRecognition', 
      type: 'regional', 
      x: 220, 
      y: 250, 
      size: 24,
      category: 'regional',
      description: 'Cross-border recognition framework for digital signatures'
    },

    // Namibian Legal Framework (Bottom left - expanded)
    { 
      id: 'contract-law', 
      label: 'Contract Law\nNamibia', 
      type: 'legal', 
      x: 200, 
      y: 380, 
      size: 26,
      category: 'legal',
      description: 'Namibian contract law framework and principles'
    },
    { 
      id: 'consumer-protection', 
      label: 'Consumer\nProtection Act', 
      type: 'legal', 
      x: 300, 
      y: 380, 
      size: 26,
      category: 'legal',
      description: 'Consumer protection law compliance in Namibia'
    },
    { 
      id: 'employment-clauses', 
      label: 'Employment\nContract Clauses', 
      type: 'legal', 
      x: 250, 
      y: 450, 
      size: 24,
      category: 'legal',
      description: 'Namibian law compliant employment contract clauses'
    },

    // Best Practices and Guidelines (Bottom center - expanded)
    { 
      id: 'digital-signature-best-practices', 
      label: 'Digital Signature\nBest Practices', 
      type: 'compliance', 
      x: 400, 
      y: 400, 
      size: 26,
      category: 'compliance',
      description: 'International best practices for digital signature implementation'
    },
    { 
      id: 'legal-compliance-guidelines', 
      label: 'Legal Compliance\nGuidelines', 
      type: 'compliance', 
      x: 500, 
      y: 400, 
      size: 26,
      category: 'compliance',
      description: 'Comprehensive legal compliance guidelines for digital signatures'
    },

    // Digital Signature Technology (Center right - new)
    { 
      id: 'digital-signature-technology', 
      label: 'Digital Signature\nTechnology', 
      type: 'digital-signature', 
      x: 650, 
      y: 300, 
      size: 30,
      category: 'digital-signature',
      description: 'Advanced digital signature technology and cryptographic implementation'
    },

    // Regional Documents (Left side - expanded)
    { 
      id: 'fica-requirements', 
      label: 'FICA\nRequirements', 
      type: 'regional', 
      x: 150, 
      y: 200, 
      size: 22,
      category: 'regional',
      description: 'Financial Intelligence Centre Act requirements (South Africa)'
    },
    { 
      id: 'ecta-2002', 
      label: 'ECTA 2002\nSouth Africa', 
      type: 'regional', 
      x: 250, 
      y: 150, 
      size: 22,
      category: 'regional',
      description: 'Electronic Communications and Transactions Act 2002 (South Africa)'
    }
  ];

  // Define comprehensive connections between legal documents and frameworks
  const connections: Connection[] = [
    // BuffrSign AI central connections
    { from: 'buffrsign-ai', to: 'eta-2019', strength: 5 },
    { from: 'buffrsign-ai', to: 'cran-requirements', strength: 5 },
    { from: 'buffrsign-ai', to: 'contract-law', strength: 4 },
    { from: 'buffrsign-ai', to: 'consumer-protection', strength: 4 },
    { from: 'buffrsign-ai', to: 'digital-signature-best-practices', strength: 4 },
    { from: 'buffrsign-ai', to: 'legal-compliance-guidelines', strength: 4 },
    { from: 'buffrsign-ai', to: 'digital-signature-technology', strength: 5 },
    
    // ETA 2019 section connections
    { from: 'eta-2019', to: 'section-17', strength: 4 },
    { from: 'eta-2019', to: 'section-20', strength: 4 },
    { from: 'eta-2019', to: 'section-21', strength: 4 },
    { from: 'eta-2019', to: 'section-24', strength: 4 },
    
    // CRAN requirements connections
    { from: 'cran-requirements', to: 'cran-security-service', strength: 4 },
    { from: 'cran-requirements', to: 'cran-audit-trail', strength: 4 },
    { from: 'cran-requirements', to: 'cran-digital-certificates', strength: 4 },
    
    // CRAN connections to international standards
    { from: 'cran-requirements', to: 'iso-27001', strength: 3 },
    { from: 'cran-requirements', to: 'iso-14533', strength: 3 },
    { from: 'cran-requirements', to: 'eidas-regulation', strength: 3 },
    { from: 'cran-security-service', to: 'iso-27001', strength: 3 },
    { from: 'cran-audit-trail', to: 'iso-27001', strength: 3 },
    { from: 'cran-digital-certificates', to: 'iso-14533', strength: 3 },
    
    // International standards connections
    { from: 'eidas-regulation', to: 'uncitral-model', strength: 3 },
    { from: 'iso-27001', to: 'iso-14533', strength: 2 },
    { from: 'iso-14533', to: 'uncitral-model', strength: 2 },
    
    // Regional connections
    { from: 'eta-2019', to: 'sadc-framework', strength: 3 },
    { from: 'sadc-framework', to: 'cross-border-recognition', strength: 3 },
    { from: 'sadc-framework', to: 'ecta-2002', strength: 2 },
    { from: 'sadc-framework', to: 'fica-requirements', strength: 2 },
    
    // Namibian legal framework connections
    { from: 'contract-law', to: 'consumer-protection', strength: 2 },
    { from: 'eta-2019', to: 'contract-law', strength: 3 },
    { from: 'contract-law', to: 'employment-clauses', strength: 3 },
    { from: 'consumer-protection', to: 'employment-clauses', strength: 2 },
    
    // Best practices connections
    { from: 'digital-signature-best-practices', to: 'legal-compliance-guidelines', strength: 3 },
    { from: 'iso-14533', to: 'digital-signature-best-practices', strength: 2 },
    { from: 'cran-requirements', to: 'legal-compliance-guidelines', strength: 3 },
    { from: 'uncitral-model', to: 'digital-signature-best-practices', strength: 2 },
    
    // Digital signature technology connections
    { from: 'digital-signature-technology', to: 'eta-2019', strength: 4 },
    { from: 'digital-signature-technology', to: 'cran-requirements', strength: 4 },
    { from: 'digital-signature-technology', to: 'iso-14533', strength: 3 },
    { from: 'digital-signature-technology', to: 'digital-signature-best-practices', strength: 3 },
    { from: 'digital-signature-technology', to: 'section-20', strength: 3 },
    
    // Cross-border and regional connections
    { from: 'cross-border-recognition', to: 'eidas-regulation', strength: 2 },
    { from: 'cross-border-recognition', to: 'uncitral-model', strength: 2 },
    { from: 'ecta-2002', to: 'eta-2019', strength: 2 },
    { from: 'fica-requirements', to: 'cran-requirements', strength: 2 }
  ];

  // Color schemes for different node types - using design system colors
  const nodeColors: Record<string, string> = {
    'ai': 'hsl(var(--chart-4))', // AI Purple
    'legal': 'hsl(var(--chart-5))', // Security Red
    'legal-section': 'hsl(var(--chart-5))', // Security Red (lighter)
    'compliance': 'hsl(var(--chart-2))', // Compliance Green
    'international': 'hsl(var(--chart-4))', // AI Purple
    'regional': 'hsl(var(--chart-3))', // Warning Orange
    'digital-signature': 'hsl(var(--chart-1))' // Primary Blue
  };

  // Get node icon based on type
  const getNodeIcon = (type: string) => {
    const iconMap: Record<string, ComponentType<{ className: string }>> = {
      'ai': Brain,
      'legal': Gavel,
      'legal-section': Scale,
      'compliance': Shield,
      'international': Globe,
      'regional': MapPin,
      'digital-signature': PenTool
    };
    return iconMap[type] || FileText;
  };

  // Show all nodes (no filtering)
  const filteredNodes: KnowledgeNode[] = nodes;
  const filteredConnections: Connection[] = connections;

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl overflow-hidden">
      <Card className="shadow-lg border-0 h-full overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Network className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">Legal Knowledge Graph</CardTitle>
              <p className="text-indigo-100 text-sm">Interactive legal framework visualization</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 flex-1 flex flex-col overflow-hidden">
          {/* Zoom Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                state="default"
                onClick={() => {
                  setZoomLevel(0.8);
                  setPanOffset({ x: -50, y: -30 });
                }}
                className="h-8 px-3 text-xs"
              >
                Reset View
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                state="default"
                onClick={() => setZoomLevel(Math.max(0.3, zoomLevel - 0.1))}
                className="h-8 w-8 p-0"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground min-w-[60px] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <Button
                variant="outline"
                size="sm"
                state="default"
                onClick={() => setZoomLevel(Math.min(1.5, zoomLevel + 0.1))}
                className="h-8 w-8 p-0"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Graph Visualization - Compact */}
          <div className="relative bg-background rounded-lg border border-border overflow-hidden flex-1 min-h-0">
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 900 600"
              className="w-full h-full cursor-grab active:cursor-grabbing"
              style={{ 
                transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`, 
                transformOrigin: 'center' 
              }}
              onMouseDown={(e) => {
                setIsDragging(true);
                setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
              }}
              onMouseMove={(e) => {
                if (isDragging) {
                  setPanOffset({
                    x: e.clientX - dragStart.x,
                    y: e.clientY - dragStart.y
                  });
                }
              }}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
            >
              {/* Background Grid */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f1f5f9" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Connections */}
              {filteredConnections.map((connection, index) => {
                const fromNode = filteredNodes.find(n => n.id === connection.from);
                const toNode = filteredNodes.find(n => n.id === connection.to);
                if (!fromNode || !toNode) return null;

                return (
                  <line
                    key={index}
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke="#e2e8f0"
                    strokeWidth={connection.strength}
                    opacity={0.6}
                  />
                );
              })}

              {/* Nodes */}
              {filteredNodes.map((node) => {
                const IconComponent = getNodeIcon(node.type);
                const isSelected = selectedNode?.id === node.id;
                
                return (
                  <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                    {/* Node Circle */}
                    <circle
                      r={node.size / 2}
                      fill={nodeColors[node.type] || '#64748b'}
                      stroke={isSelected ? '#fbbf24' : 'white'}
                      strokeWidth={isSelected ? 4 : 2}
                      className="cursor-pointer transition-all duration-200 hover:opacity-80"
                      onClick={() => setSelectedNode(isSelected ? null : node)}
                    />
                    
                    {/* Node Icon */}
                    <foreignObject x={-8} y={-8} width="16" height="16">
                      <div className="flex items-center justify-center w-4 h-4">
                        <IconComponent className="h-3 w-3 text-white" />
                      </div>
                    </foreignObject>
                    
                    {/* Node Label */}
                    <text
                      y={node.size / 2 + 25}
                      textAnchor="middle"
                      fontSize="9"
                      fill="#374151"
                      fontWeight="500"
                      className="pointer-events-none"
                    >
                      {node.label.split('\n').map((line, i) => (
                        <tspan key={i} x="0" dy={i === 0 ? 0 : 10}>
                          {line}
                        </tspan>
                      ))}
                    </text>
                  </g>
                );
              })}
            </svg>

          </div>

          {/* Node Details Panel */}
          {selectedNode && (
            <div className="mt-6 p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                    style={{ backgroundColor: nodeColors[selectedNode.type] }}
                  >
                    {React.createElement(getNodeIcon(selectedNode.type), { className: "h-6 w-6" })}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{selectedNode.label}</h3>
                    <p className="text-muted-foreground capitalize">{selectedNode.type.replace('-', ' ')}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  state="default"
                  onClick={() => setSelectedNode(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ×
                </Button>
              </div>
              
              <p className="text-muted-foreground mb-4">{selectedNode.description}</p>
              
              {selectedNode.sections && (
                <div className="mb-4">
                  <h4 className="font-semibold text-foreground mb-2">Legal Sections:</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {selectedNode.sections.map((section, i) => (
                      <li key={i}>{section}</li>
                    ))}
                  </ul>
                </div>
              )}
              

              {selectedNode.requirements && (
                <div className="mb-4">
                  <h4 className="font-semibold text-foreground mb-2">Requirements:</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {selectedNode.requirements.map((requirement, i) => (
                      <li key={i}>{requirement}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedNode.documents && (
                <div className="mb-4">
                  <h4 className="font-semibold text-foreground mb-2">Legal Documents:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedNode.documents.map((document, i) => (
                      <span key={i} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                        {document}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
};

export default BuffrSignKnowledgeGraph;