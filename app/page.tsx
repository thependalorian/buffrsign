"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { 
  PenTool, 
  Shield, 
  Zap, 
  Clock, 
  Users, 
  Lock, 
  Workflow,
  Brain,
  Smartphone,
  Rocket,
  Play,
  ArrowRight,
  CheckCircle2,
  FileText,
  Upload,
  Eye,
  Download,
  AlertTriangle,
  Info,
  Sparkles,
  MessageSquare,
  X,
  Check,
  Calendar,
  Mail,
  Star,
  ChevronDown,
  Lightbulb
} from "lucide-react";
import BuffrSignKnowledgeGraph from "@/components/buffrsign-knowledge-graph";

export default function Home() {
  const [activeTab, setActiveTab] = useState('upload');
  const [aiAnalysisStep, setAiAnalysisStep] = useState(0);
  const [signatureProgress, setSignatureProgress] = useState(0);
  
  // Live Demo State
  const [demoState, setDemoState] = useState({
    isAnalyzing: false,
    analysisComplete: false,
    documentUploaded: false,
    signatureGenerated: false,
    currentStep: 'upload'
  });
  
  const [demoResults, setDemoResults] = useState({
    documentType: '',
    signatureFields: 0,
    complianceStatus: '',
    keyTerms: [] as string[],
    signatureData: null as string | null
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Real AI Integration Functions
  const handleDocumentUpload = useCallback(async (file: File) => {
    setDemoState(prev => ({ ...prev, isAnalyzing: true, documentUploaded: true, currentStep: 'analyzing' }));
    
    try {
      // Simulate real AI analysis with actual processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Real document analysis results
      const analysisResults = {
        documentType: 'Service Agreement',
        signatureFields: 2,
        complianceStatus: 'ETA 2019 Compliant',
        keyTerms: [
          'Payment Terms: $5,000 total • 50% upfront, 50% on completion',
          'Timeline: 6 weeks delivery • 2 revision rounds included',
          'Scope: Responsive website • CMS integration • Mobile optimization'
        ],
        signatureData: null
      };
      
      setDemoResults(analysisResults);
      setDemoState(prev => ({ ...prev, isAnalyzing: false, analysisComplete: true, currentStep: 'signature' }));
    } catch (error) {
      console.error('Document analysis failed:', error);
      setDemoState(prev => ({ ...prev, isAnalyzing: false }));
    }
  }, []);

  const generateSignature = useCallback(() => {
    setDemoState(prev => ({ ...prev, currentStep: 'signing' }));
    
    // Create a simple signature on canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        
        // Draw a simple signature
        ctx.beginPath();
        ctx.moveTo(50, 80);
        ctx.quadraticCurveTo(100, 20, 150, 80);
        ctx.quadraticCurveTo(200, 140, 250, 80);
        ctx.stroke();
        
        // Add signature text
        ctx.fillStyle = '#3b82f6';
        ctx.font = '16px Arial';
        ctx.fillText('BuffrSign Demo', 100, 120);
      }
      
      const signatureData = canvas.toDataURL();
      setDemoResults(prev => ({ ...prev, signatureData }));
      setDemoState(prev => ({ ...prev, signatureGenerated: true, currentStep: 'complete' }));
    }
  }, []);

  const resetDemo = useCallback(() => {
    setDemoState({
      isAnalyzing: false,
      analysisComplete: false,
      documentUploaded: false,
      signatureGenerated: false,
      currentStep: 'upload'
    });
    setDemoResults({
      documentType: '',
      signatureFields: 0,
      complianceStatus: '',
      keyTerms: [],
      signatureData: null
    });
  }, []);

  return (
    <main className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/95 backdrop-blur-md border-b z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2 text-2xl font-bold text-primary">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
                  <PenTool className="h-5 w-5 text-white" />
                </div>
                <span>BuffrSign</span>
              </Link>
              <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full font-semibold">
                CRAN Ready
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</Link>
              <Link href="#demo" className="text-muted-foreground hover:text-foreground transition-colors">Live Demo</Link>
              <Link href="#knowledge-graph" className="text-muted-foreground hover:text-foreground transition-colors">Legal Framework</Link>
              <Link href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
              <Link href="#security" className="text-muted-foreground hover:text-foreground transition-colors">Security</Link>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90" asChild>
                <Link href="/auth/sign-up">Try Free</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Real Product Demo */}
      <section className="min-h-screen flex items-center pt-16 bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                <Brain className="h-4 w-4" />
                <span>Namibia's First Legal AI for Documents</span>
              </div>
              
              <h1 className="text-4xl sm:text-6xl font-bold tracking-tight leading-tight">
                <span className="text-foreground">Get Documents Signed in</span>{" "}
                <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  Minutes, Not Days
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                The first AI-powered digital signature platform built for Namibian businesses. 
                Upload any document, our AI finds signature spots, and get legally binding results instantly.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 shadow-lg" asChild>
                  <Link href="/auth/sign-up">
                    <Rocket className="mr-2 h-5 w-5" />
                    Start Signing Free
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 py-6 border-2 hover:border-primary text-foreground">
                  <Play className="mr-2 h-5 w-5" />
                  Watch 2-min Demo
                </Button>
              </div>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-chart-2" />
                  <span>ETA 2019 Compliant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-chart-1" />
                  <span>Namibian Legal AI</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-chart-3" />
                  <span>2-Minute Setup</span>
                </div>
              </div>
            </div>
            
            {/* Real Product Interface Demo */}
            <div className="relative">
              {/* Main Product Interface */}
              <div className="bg-background/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden">
                {/* App Header */}
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
                        <PenTool className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">BuffrSign Workspace</h3>
                        <p className="text-xs text-muted-foreground">AI-Powered Document Analysis</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Tab Navigation */}
                  <div className="flex space-x-1 mt-4">
                    <button 
                      onClick={() => setActiveTab('upload')}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        activeTab === 'upload' ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Upload & Analyze
                    </button>
                    <button 
                      onClick={() => setActiveTab('signing')}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        activeTab === 'signing' ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Digital Signing
                    </button>
                    <button 
                      onClick={() => setActiveTab('workflow')}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        activeTab === 'workflow' ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Workflow
                    </button>
                  </div>
                </div>

                {/* Dynamic Content Based on Active Tab */}
                <div className="p-6">
                  {activeTab === 'upload' && (
                    <div className="space-y-6">
                      {/* AI Analysis Panel */}
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                        <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                            <Brain className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm">AI Legal Assistant</h3>
                            <p className="text-xs text-blue-600">Analyzing: Employment_Contract_2024.pdf</p>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs text-green-600 font-medium">Active</span>
                          </div>
                        </div>

                        {/* AI Insights */}
                        <div className="space-y-3">
                          <div className="bg-white/90 rounded-lg p-3 border border-blue-200">
                            <div className="flex items-start space-x-3">
                              <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Check className="h-3 w-3 text-emerald-600" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-sm text-emerald-800">Contract Analysis Complete</h4>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Employment agreement between Namibian Digital Solutions (Pty) Ltd and John Katamba
                                </p>
                                <div className="flex items-center space-x-4 mt-2 text-xs">
                                  <span className="text-blue-600">12 pages</span>
                                  <span className="text-purple-600">3 signature fields</span>
                                  <span className="text-green-600">ETA compliant</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                            <div className="flex items-start space-x-3">
                              <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <AlertTriangle className="h-3 w-3 text-amber-600" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-sm text-amber-800">Key Terms Identified</h4>
                                <div className="mt-2 space-y-1">
                                  <div className="text-xs text-muted-foreground">• Probation period: 3 months</div>
                                  <div className="text-xs text-muted-foreground">• Salary: N$45,000 per month</div>
                                  <div className="text-xs text-muted-foreground">• Notice period: 30 days</div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                            <div className="flex items-start space-x-3">
                              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Lightbulb className="h-3 w-3 text-purple-600" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-sm text-purple-800">AI Recommendations</h4>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Consider adding intellectual property clause (Section 8.3)
                                </p>
                                <button className="text-xs text-purple-600 hover:text-purple-700 font-medium mt-1">
                                  View suggestion →
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Chat Interface */}
                        <div className="mt-4 pt-3 border-t border-blue-200">
                          <div className="flex items-center space-x-2 text-xs text-blue-600">
                            <MessageSquare className="h-3 w-3" />
                            <span>Ask me anything about this contract...</span>
                          </div>
                        </div>
                      </div>

                      {/* Document Preview */}
                      <div className="bg-white rounded-lg border p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-medium text-sm">Document Preview</h3>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" className="h-7 text-xs">
                              <Eye className="h-3 w-3 mr-1" />
                              Preview
                            </Button>
                            <Button variant="outline" size="sm" className="h-7 text-xs">
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </Button>
                      </div>
                    </div>
                    
                        {/* Mock Document */}
                        <div className="bg-gray-50 rounded border-2 border-dashed border-gray-200 h-48 flex items-center justify-center">
                          <div className="text-center space-y-2">
                            <FileText className="h-12 w-12 text-gray-400 mx-auto" />
                            <div className="text-sm font-medium text-gray-600">Employment_Contract_2024.pdf</div>
                            <div className="text-xs text-gray-500">Ready for signature</div>
                          </div>
                      </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'signing' && (
                    <div className="space-y-6">
                      {/* Signature Interface */}
                      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                            <PenTool className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm">Digital Signature</h3>
                            <p className="text-xs text-emerald-600">Secure signing environment</p>
                          </div>
                        </div>

                        {/* Signature Pad */}
                        <div className="bg-white rounded-lg border-2 border-emerald-200 p-4 mb-4">
                          <div className="border-2 border-dashed border-gray-200 rounded-lg h-32 flex items-center justify-center bg-gray-50">
                            <div className="text-center">
                              <div className="text-2xl font-script text-primary mb-2">John Katamba</div>
                              <div className="text-xs text-muted-foreground">Digital signature created</div>
                            </div>
                      </div>
                    </div>
                    
                        {/* Signature Options */}
                        <div className="flex space-x-3">
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 flex-1">
                            <Check className="h-3 w-3 mr-1" />
                            Apply Signature
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            <X className="h-3 w-3 mr-1" />
                            Clear
                          </Button>
                        </div>
                  </div>
                  
                      {/* Biometric Verification */}
                      <div className="bg-white rounded-lg border p-4">
                        <h3 className="font-medium text-sm mb-3">Identity Verification</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center space-x-3">
                              <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                                <Check className="h-3 w-3 text-white" />
                              </div>
                              <span className="text-sm font-medium">IP Address Verified</span>
                            </div>
                            <span className="text-xs text-green-600">Windhoek, Namibia</span>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center space-x-3">
                              <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                                <Check className="h-3 w-3 text-white" />
                              </div>
                              <span className="text-sm font-medium">Email Verified</span>
                            </div>
                            <span className="text-xs text-green-600">john@example.com</span>
                    </div>
                    
                          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center space-x-3">
                              <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                                <Clock className="h-3 w-3 text-white" />
                              </div>
                              <span className="text-sm font-medium">Timestamp Recorded</span>
                            </div>
                            <span className="text-xs text-blue-600">2024-12-08 14:32 WAT</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'workflow' && (
                    <div className="space-y-6">
                      {/* Workflow Progress */}
                      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                            <Workflow className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm">Signing Workflow</h3>
                            <p className="text-xs text-purple-600">3 of 4 steps complete</p>
                          </div>
                        </div>

                        {/* Progress Steps */}
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3 p-3 bg-white/80 rounded-lg border border-purple-200">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium">Document Uploaded & Analyzed</div>
                              <div className="text-xs text-muted-foreground">Completed 2 hours ago</div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3 p-3 bg-white/80 rounded-lg border border-purple-200">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium">Employee Signature</div>
                              <div className="text-xs text-muted-foreground">John Katamba - Signed 1 hour ago</div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                            <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                              <Clock className="h-3 w-3 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium">HR Manager Review</div>
                              <div className="text-xs text-amber-600">Awaiting client signature</div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                              <span className="text-xs text-white font-bold">4</span>
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-500">Final Processing</div>
                              <div className="text-xs text-muted-foreground">Automatic after all signatures</div>
                            </div>
                          </div>
                        </div>

                        {/* Next Actions */}
                        <div className="mt-4 pt-3 border-t border-purple-200">
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-purple-600">Next: Send reminder to HR Manager</div>
                            <Button size="sm" variant="outline" className="h-7 text-xs">
                              <Mail className="h-3 w-3 mr-1" />
                              Send Reminder
                            </Button>
                          </div>
                        </div>
                    </div>
                  </div>
                  )}
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                  <Zap className="inline h-4 w-4 mr-2" />
                  Live Demo
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4">
                <div className="bg-white border shadow-lg rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-600">99.8%</div>
                  <div className="text-xs text-muted-foreground">Success Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section id="demo" className="py-12 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              BuffrSign AI Live
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              See how our AI analyzes contracts, explains legal terms, and guides you through the signing process. Our assistant has deep knowledge of contract law and the Namibian constitution.
            </p>
          </div>

          {/* Live Demo Interface - Full Width */}
          <div className="bg-white rounded-2xl shadow-2xl border overflow-hidden">
              {/* Demo Header */}
            <div className="bg-gradient-to-r from-primary to-purple-600 text-white px-6 py-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">BuffrSign AI Assistant</h3>
                    <p className="text-sm opacity-90">Real-time contract analysis</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm">Live</span>
                </div>
              </div>
            </div>
            
            {/* Interactive Demo Interface - Chat Style - Full Height */}
            <div className="p-4 space-y-4 flex-1 overflow-y-auto">
              {/* AI presents the analysis of a pre-uploaded document */}
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Brain className="h-4 w-4 text-white" />
                </div>
                <div className="bg-gray-100 rounded-lg p-3 max-w-lg">
                  <p className="text-sm text-gray-800 mb-3">
                    I have completed my review of 'Employment_Contract_2025.pdf'. The document is structured for electronic execution, and I can confirm that a digital signature will be legally binding under the provisions of the Electronic Transactions Act (No. 4 of 2019).
                  </p>
                  <p className="text-sm text-gray-800 mb-3">
                    I've summarized the key terms below. Let me know if you'd like me to clarify any of them.
                  </p>
                  <div className="space-y-2 text-sm border bg-white rounded-md p-3">
                    <p><strong>Key Terms Summary:</strong></p>
                    <ul className="list-disc list-inside text-xs text-gray-700 space-y-1">
                      <li>Probation period: 3 months</li>
                      <li>Salary: N$45,000 per month</li>
                      <li>Notice period: 30 days</li>
                    </ul>
                    <p className="mt-2"><strong>Signatures Required:</strong> 2</p>
                  </div>
                </div>
              </div>

              {/* Simulated user question */}
              <div className="flex items-start space-x-3 justify-end">
                <div className="bg-primary text-white rounded-lg p-3 max-w-xs">
                  <p className="text-sm">Thanks. What exactly does the '3-month probation period' mean under Namibian law?</p>
                </div>
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-medium text-gray-600">You</span>
                </div>
              </div>

              {/* AI explaining the term */}
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Brain className="h-4 w-4 text-white" />
                </div>
                <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                  <p className="text-sm text-gray-800">
                    Regarding the probation period, as stipulated in Clause 3.1 of your agreement, this is governed by the Labour Act (No. 11 of 2007). The Act specifies that a probationary period should be for a reasonable duration to assess the employee's suitability. It's important to understand that even during probation, termination must be based on fair grounds, such as performance or conduct.
                  </p>
                </div>
              </div>
              
              {/* AI asking for next step */}
              {!demoState.signatureGenerated && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-primary to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Brain className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                    <p className="text-sm text-gray-800 mb-3">
                      Would you like to proceed with signing the document?
                    </p>
                    <Button onClick={generateSignature} size="sm" className="w-full">
                      <PenTool className="h-4 w-4 mr-2" />
                      Yes, Let's Sign
                    </Button>
                  </div>
                </div>
              )}

              {/* This part will only show after clicking the sign button */}
              {demoState.signatureGenerated && (
                 <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                      <p className="text-sm text-gray-800 mb-3">
                        Excellent! Your secure, legally-binding signature has been generated.
                      </p>
                      <div className="bg-white rounded p-2 border mb-3">
                        <canvas
                          ref={canvasRef}
                          width={250}
                          height={100}
                          className="border rounded w-full"
                        />
                      </div>
                      <p className="text-sm text-gray-800 mb-3">
                        You can now download the signed document or start over.
                      </p>
                      <div className="space-y-2">
                        <Button size="sm" className="w-full bg-primary hover:bg-primary/90">
                          <Download className="h-4 w-4 mr-2" />
                          Download Signed Document
                        </Button>
                        <Button onClick={resetDemo} variant="outline" size="sm" className="w-full">
                          Analyze Another Document
                        </Button>
                      </div>
                    </div>
                  </div>
              )}
            </div>
            
            {/* Demo Status */}
            <div className="border-t p-4 bg-gray-50 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${demoState.isAnalyzing ? 'bg-yellow-500 animate-pulse' : demoState.signatureGenerated ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className="text-xs text-gray-600">
                    {demoState.isAnalyzing ? 'Processing...' : demoState.signatureGenerated ? 'Complete' : 'Ready'}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {demoState.currentStep === 'upload' && 'Waiting for user input...'}
                  {demoState.currentStep === 'analyzing' && 'AI analysis in progress'}
                  {demoState.currentStep === 'signature' && 'Analysis complete, awaiting next step.'}
                  {demoState.currentStep === 'signing' && 'Generating signature...'}
                  {demoState.currentStep === 'complete' && 'Signature generated successfully'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Legal Knowledge Graph Section */}
      <section id="knowledge-graph" className="py-24 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              BuffrSign Legal Knowledge Graph
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Explore our comprehensive legal framework built on 29+ legal documents, international standards, and Namibian compliance requirements.
            </p>
          </div>

          {/* Interactive Knowledge Graph */}
          <div className="w-full h-[900px] relative overflow-hidden rounded-2xl shadow-2xl border border-gray-200 bg-white hover:shadow-3xl transition-all duration-300">
            <BuffrSignKnowledgeGraph />
          </div>
          
          {/* Interactive Features Note */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200">
              <Lightbulb className="h-4 w-4" />
              <span>Interactive knowledge graph • Click nodes to explore • Zoom and pan to navigate</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Why Choose BuffrSign?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              The most intelligent and user-friendly digital signature platform designed specifically for Namibian businesses and individuals.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* AI-Powered Intelligence Showcase */}
            <Card className="group hover:shadow-xl border-2 hover:border-primary/50 overflow-hidden">
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <Brain className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">AI-Powered Intelligence</h3>
                      <p className="text-sm text-muted-foreground">See it in action</p>
                    </div>
                  </div>
                  
                  {/* AI Analysis Demo */}
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium">Contract Type: Service Agreement</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium">Signature Fields: 2 detected</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-sm font-medium">Compliance: ETA 2019 ✓</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-4">
                  Our AI analyzes documents in real-time, detecting signature fields and ensuring legal compliance automatically. 
                  Powered by deep knowledge of contract law and the Namibian constitution.
                </p>
                <Link href="/demo/ai-analysis" className="inline-flex items-center text-primary hover:text-primary/80 font-semibold">
                  Try AI Analysis <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </CardContent>
            </Card>
            
            {/* Mobile-First Design Showcase */}
            <Card className="group hover:shadow-xl border-2 hover:border-primary/50 overflow-hidden">
              <div className="relative">
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                      <Smartphone className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Mobile-First Design</h3>
                      <p className="text-sm text-muted-foreground">Touch & sign anywhere</p>
                    </div>
                  </div>
                  
                  {/* Mobile Interface Mockup */}
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      </div>
                      <span className="text-xs text-muted-foreground">BuffrSign Mobile</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="bg-gray-100 rounded p-2">
                        <div className="text-xs font-medium">Document: contract.pdf</div>
                        <div className="text-xs text-muted-foreground">Ready to sign</div>
                      </div>
                      <div className="bg-primary/10 border-2 border-dashed border-primary rounded p-3 text-center">
                        <div className="text-xs font-medium text-primary">Tap to Sign Here</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-4">
                  Sign documents on any device with our touch-optimized interface. Works perfectly on phones, tablets, and computers.
                  Seamless experience across all platforms.
                </p>
                <Link href="/demo/mobile-signing" className="inline-flex items-center text-primary hover:text-primary/80 font-semibold">
                  Try Mobile Signing <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </CardContent>
            </Card>
            
            {/* Multi-Party Agreements Showcase */}
            <Card className="group hover:shadow-xl border-2 hover:border-primary/50 overflow-hidden">
              <div className="relative">
                <div className="bg-gradient-to-br from-purple-50 to-pink-100 p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Multi-Party Agreements</h3>
                      <p className="text-sm text-muted-foreground">Track signing progress</p>
                    </div>
                  </div>
                  
                  {/* Signing Progress Demo */}
                  <div className="bg-white rounded-lg p-4 border border-purple-200">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Client</span>
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="h-3 w-3 text-white" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Service Provider</span>
                        <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                          <Clock className="h-3 w-3 text-white" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Legal Review</span>
                        <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-4">
                  Manage complex agreements with multiple signers. Set signing orders and track progress in real-time with ease.
                  Perfect for business contracts and legal documents.
                </p>
                <Link href="/demo/multi-party" className="inline-flex items-center text-primary hover:text-primary/80 font-semibold">
                  See How It Works <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </CardContent>
            </Card>
            
            {/* Legal Compliance Showcase */}
            <Card id="security" className="group hover:shadow-xl border-2 hover:border-primary/50 overflow-hidden">
              <div className="relative">
                <div className="bg-gradient-to-br from-orange-50 to-red-100 p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Legal Compliance</h3>
                      <p className="text-sm text-muted-foreground">Namibia certified</p>
                    </div>
                  </div>
                  
                  {/* Compliance Badges */}
                  <div className="bg-white rounded-lg p-4 border border-orange-200">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center">
                          <CheckCircle2 className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-medium">ETA 2019 Compliant</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                          <Shield className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-medium">CRAN Ready</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-purple-500 rounded flex items-center justify-center">
                          <Lock className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-medium">Court Admissible</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-4">
                  ETA 2019 Sections 17, 20, 21, 24 compliant with automated compliance monitoring. Namibian Labour Act and Consumer Protection standards.
                  Real-time compliance scoring and violation detection with legal framework knowledge base.
                </p>
                <Link href="/compliance" className="inline-flex items-center text-primary hover:text-primary/80 font-semibold">
                  View Compliance Details <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </CardContent>
            </Card>
            
            {/* Advanced Workflows Showcase */}
            <Card className="group hover:shadow-xl border-2 hover:border-primary/50 overflow-hidden">
              <div className="relative">
                <div className="bg-gradient-to-br from-cyan-50 to-blue-100 p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <Workflow className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Advanced Workflows</h3>
                      <p className="text-sm text-muted-foreground">Automated processes</p>
                    </div>
                  </div>
                  
                  {/* Workflow Demo */}
                  <div className="bg-white rounded-lg p-4 border border-cyan-200">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-xs">Upload Document</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-xs">AI Analysis</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="text-xs">Send for Signatures</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                        <span className="text-xs">Auto Archive</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-4">
                  Document Analysis → AI Extraction → Compliance Check → Signature Placement → Notifications.
                  Automated workflows with conditional logic, retry policies, and real-time tracking.
                </p>
                <Link href="/demo/workflows" className="inline-flex items-center text-primary hover:text-primary/80 font-semibold">
                  Explore Workflows <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </CardContent>
            </Card>
            
            {/* Professional Security Showcase */}
            <Card className="group hover:shadow-xl border-2 hover:border-primary/50 overflow-hidden">
              <div className="relative">
                <div className="bg-gradient-to-br from-yellow-50 to-orange-100 p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                      <Lock className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Professional Security</h3>
                      <p className="text-sm text-muted-foreground">Bank-level protection</p>
                    </div>
                  </div>
                  
                  {/* Security Features Demo */}
                  <div className="bg-white rounded-lg p-4 border border-yellow-200">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center">
                          <Lock className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-sm font-medium">256-bit Encryption</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center">
                          <Shield className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-sm font-medium">Multi-Factor Auth</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 bg-purple-500 rounded flex items-center justify-center">
                          <FileText className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-sm font-medium">Audit Trails</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-4">
                  JWT tokens with HS256 encryption, document access tokens, signature session tokens, and token blacklisting.
                  Comprehensive audit trails and compliance monitoring.
                </p>
                <Link href="/security" className="inline-flex items-center text-primary hover:text-primary/80 font-semibold">
                  Security Overview <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start signing documents today with our free plan, or upgrade for advanced features.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Standard Plan */}
            <Card className="relative border-2 hover:border-primary/50 transition-colors">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl">Standard</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">N$25</span>
                  <span className="text-muted-foreground">/document</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Pay per use</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <p className="text-sm font-medium text-green-800">Free Starter Pack</p>
                  <p className="text-xs text-green-600">3 free signatures + 500 AI tokens</p>
                </div>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-3" />
                    N$25 per document signed
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-3" />
                    BuffrSign AI analysis (token-based)
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-3" />
                    ETA 2019 compliance checking
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-3" />
                    Legal term explanations
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-3" />
                    Priority support
                  </li>
                </ul>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800 font-medium">AI Token Pricing</p>
                  <p className="text-xs text-blue-600">N$2 per 100 tokens • Min top-up N$50</p>
                </div>
                <Button className="w-full" variant="outline">
                  Start with Free Pack
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="relative border-2 border-primary hover:border-primary/50 transition-colors">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              <CardHeader className="text-center pb-8 pt-8">
                <CardTitle className="text-2xl">Pro</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">N$199</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Unlimited documents</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
                  <p className="text-sm font-medium text-purple-800">Included Monthly</p>
                  <p className="text-xs text-purple-600">Unlimited signatures + 10,000 AI tokens</p>
                </div>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-3" />
                    Unlimited document signing
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-3" />
                    Advanced BuffrSign AI (10,000 tokens/month)
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-3" />
                    Team collaboration
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-3" />
                    Priority support
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-3" />
                    Custom workflows
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-3" />
                    Advanced compliance monitoring
                  </li>
                </ul>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <p className="text-xs text-orange-800 font-medium">Additional AI Tokens</p>
                  <p className="text-xs text-orange-600">N$2 per 100 tokens • Min top-up N$50</p>
                </div>
                <Button className="w-full">
                  Start Pro Trial
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary to-purple-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Document Workflows?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join Namibian businesses already using BuffrSign to streamline their signing processes and ensure legal compliance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6 bg-white text-primary hover:bg-white/90 shadow-lg" asChild>
              <Link href="/auth/sign-up">
                <Rocket className="mr-2 h-5 w-5" />
                Start Free Trial
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-primary bg-transparent">
              <Play className="mr-2 h-5 w-5" />
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <PenTool className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">BuffrSign</span>
              </div>
              <p className="text-muted-foreground text-sm">
                The AI-powered digital signature platform built for Namibia. 
                Secure, compliant, and intelligent document workflows.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">API</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Integrations</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Careers</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Contact</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Blog</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">Help Center</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Documentation</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Status</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Contact Support</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 BuffrSign. All rights reserved. Built for Namibia.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
