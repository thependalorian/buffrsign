'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowRight,
  FileSignature,
  ShieldCheck,
  Zap,
  CheckCircle,
  Users,
  FileText,
  Cpu,
  Lock,
  Sparkles,
  Play,
  Menu,
  X,
  Smartphone,
  BadgeCheck,
  Download,
  Settings,
  TrendingUp
} from 'lucide-react';
import BuffrSignKnowledgeGraph from '../components/buffrsign-knowledge-graph';
import ThemeToggle from '../components/ui/ThemeToggle';
import NavLink from '../components/landing/NavLink';
import CTAButton from '../components/landing/CTAButton';
import FeatureCard from '../components/landing/FeatureCard';
import PricingCard from '../components/landing/PricingCard';
import Button from '../components/ui/button';
import { useRouter } from 'next/navigation';

export default function BuffrSignLandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-background text-foreground font-sans" data-theme="buffrsign">
      {/* Navigation */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-background/80 backdrop-blur-lg shadow-sm border-b border-border' : 'bg-transparent'}`}>
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-chart-4 rounded-lg flex items-center justify-center shadow-md">
                  <FileSignature className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-foreground">BuffrSign</span>
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-10">
              <NavLink href="#features">Features</NavLink>
              <NavLink href="#legal-framework">Legal Framework</NavLink>
              <NavLink href="#pricing">Pricing</NavLink>
              <NavLink href="#security">Security</NavLink>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <ThemeToggle />
              <Button variant="ghost" size="md" onClick={() => router.push('/auth/login')}>Sign In</Button>
              <Button 
                variant="primary"
                size="md"
                onClick={() => router.push('/auth/signup')}
              >
                Try Free
              </Button>
            </div>
            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-foreground">
                {isMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
              </button>
            </div>
          </div>
          {isMenuOpen && (
            <div className="md:hidden mt-4 bg-card rounded-lg shadow-lg p-4 border border-border">
              <a href="#features" className="block py-2 text-lg">Features</a>
              <a href="#legal-framework" className="block py-2 text-lg">Legal Framework</a>
              <a href="#pricing" className="block py-2 text-lg">Pricing</a>
              <a href="#security" className="block py-2 text-lg">Security</a>
              <div className="pt-4 mt-4 border-t border-border space-y-3">
                <div className="flex justify-center">
                  <ThemeToggle />
                </div>
                <Button variant="ghost" size="md" className="w-full" onClick={() => router.push('/auth/login')}>Sign In</Button>
                <Button 
                  variant="primary"
                  size="md"
                  className="w-full"
                  onClick={() => router.push('/auth/signup')}
                >
                  Try Free
                </Button>
              </div>
            </div>
          )}
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 pt-20">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-chart-4/5"></div>
          <div className="relative z-10 text-center px-6 space-y-8 max-w-6xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              CRAN Ready
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
                <span className="block text-foreground mb-4">Namibia&apos;s First Legal AI for Documents</span>
              <span className="block gradient-text-brand">Get Documents Signed in Minutes, Not Days</span>
        </h1>
            
            <p className="max-w-3xl mx-auto text-xl text-muted-foreground mb-10">
              The first AI-powered digital signature platform built for Namibian businesses. 
              Upload any document, our AI finds signature spots, and get legally binding results instantly.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <CTAButton 
                primary
                onClick={() => router.push('/auth/signup')}
              >
                Start Signing Free <ArrowRight className="w-5 h-5 ml-2" />
              </CTAButton>
              <CTAButton onClick={() => setShowVideoModal(true)}>
                Watch 2-min Demo <Play className="w-5 h-5 ml-2" />
              </CTAButton>
            </div>

            <div className="flex flex-wrap justify-center gap-6 mt-12">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BadgeCheck className="w-5 h-5 text-primary" />
                ETA 2019 Compliant
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Cpu className="w-5 h-5 text-primary" />
                Namibian Legal AI
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="w-5 h-5 text-primary" />
                2-Minute Setup
              </div>
            </div>
          </div>
        </section>

        {/* BuffrSign Workspace Section */}
        <section className="py-24 md:py-32 bg-muted/30">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-chart-4/10 text-chart-4 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Cpu className="w-4 h-4" />
                Real BuffrSign Interface
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">BuffrSign Workspace</h2>
              <p className="max-w-3xl mx-auto text-xl text-muted-foreground mb-8">
                This is exactly what you&apos;ll see when using BuffrSign. Our AI-powered document analysis, 
                signature fields, and compliance checking in action.
              </p>
              
            </div>
            
            {/* Real BuffrSign Interface */}
            <div className="max-w-7xl mx-auto">
              {/* Dashboard Layout Simulation */}
              <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-2xl">
                {/* Top Navigation */}
                <div className="bg-muted/50 px-6 py-4 border-b border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-chart-1 rounded-lg flex items-center justify-center">
                        <FileSignature className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-foreground">BuffrSign Dashboard</h3>
                        <p className="text-sm text-muted-foreground">Document Analysis & Signing</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-chart-2 rounded-full animate-pulse"></div>
                        <span className="text-sm text-chart-2 font-medium">AI Active</span>
                      </div>
                      <div className="avatar placeholder">
                        <div className="bg-chart-1 text-white rounded-full w-8">
                          <span className="text-xs">JD</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-0">
                  {/* Left Sidebar - Navigation */}
                  <div className="bg-muted/30 p-4 border-r border-border">
                    <nav className="space-y-2">
                      <div className="flex items-center gap-3 p-3 bg-chart-1/10 rounded-lg border border-chart-1/20">
                        <FileText className="w-5 h-5 text-chart-1" />
                        <span className="font-medium text-chart-1">Documents</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 text-muted-foreground hover:text-foreground cursor-pointer">
                        <ShieldCheck className="w-5 h-5" />
                        <span>Compliance</span>
                </div>
                      <div className="flex items-center gap-3 p-3 text-muted-foreground hover:text-foreground cursor-pointer">
                        <Users className="w-5 h-5" />
                        <span>Team</span>
                </div>
                      <div className="flex items-center gap-3 p-3 text-muted-foreground hover:text-foreground cursor-pointer">
                        <Settings className="w-5 h-5" />
                        <span>Settings</span>
              </div>
                    </nav>
                    
                    {/* Recent Documents */}
                    <div className="mt-6">
                      <h4 className="font-semibold mb-3 text-foreground">Recent Documents</h4>
                      <div className="space-y-2">
                        <div className="bg-card p-3 rounded-lg border border-border cursor-pointer hover:border-chart-1 transition-colors">
                          <div className="flex items-center gap-3">
                            <FileText className="w-4 h-4 text-chart-1" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">Employment_Contract.pdf</p>
                              <p className="text-xs text-muted-foreground">Ready to sign</p>
                  </div>
                            <div className="w-2 h-2 bg-chart-2 rounded-full"></div>
                  </div>
                </div>
                        <div className="bg-card p-3 rounded-lg border border-border opacity-60">
                          <div className="flex items-center gap-3">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">Service_Agreement.pdf</p>
                              <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
                            <CheckCircle className="w-4 h-4 text-chart-2" />
                  </div>
                </div>
              </div>
            </div>
          </div>

                  {/* Center - AI Document Analysis */}
                  <div className="p-6">
                    <div className="space-y-6">
                      {/* AI Analysis Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Cpu className="w-6 h-6 text-chart-4" />
                          <h3 className="text-xl font-bold text-foreground">AI Document Analysis</h3>
            </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-1" />
                            Export
                          </Button>
                          <Button variant="outline" size="sm">
                            <Settings className="w-4 h-4" />
                          </Button>
                    </div>
                  </div>
                  
                      {/* Analysis Progress */}
                      <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="loading loading-spinner loading-sm text-primary"></div>
                            <span className="font-medium text-primary">Compliance Check</span>
                          </div>
                          <span className="text-sm text-primary">85%</span>
                        </div>
                        <div className="w-full bg-primary/20 rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: '85%' }} />
                        </div>
                        <div className="text-sm text-primary mt-2">
                          Validating ETA 2019 compliance...
                    </div>
                  </div>
                  
                      {/* Analysis Results */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-card p-4 rounded-lg border border-border">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-5 w-5 text-chart-1" />
                            <span className="font-medium">Document Type</span>
                    </div>
                          <p className="text-sm text-muted-foreground mt-1">Employment Contract</p>
                          <p className="text-xs text-muted-foreground">Confidence: 95%</p>
                  </div>
                  
                        <div className="bg-card p-4 rounded-lg border border-border">
                          <div className="flex items-center space-x-2">
                            <ShieldCheck className="h-5 w-5 text-chart-2" />
                            <span className="font-medium">Compliance Score</span>
                    </div>
                          <p className="text-sm text-muted-foreground mt-1">95%</p>
                          <p className="text-xs text-muted-foreground">ETA 2019 Compliant</p>
                  </div>
                  
                        <div className="bg-card p-4 rounded-lg border border-border">
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="h-5 w-5 text-chart-3" />
                            <span className="font-medium">Risk Level</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">Low</p>
                          <p className="text-xs text-muted-foreground">Score: 20/100</p>
                    </div>
                  </div>
                  
                      {/* AI Insights */}
                      <div className="bg-card p-6 rounded-lg border border-border">
                        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                          <Cpu className="h-5 w-5 text-chart-4" />
                          <span>AI Insights</span>
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-foreground">Summary</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              This employment contract is well-structured and compliant with Namibian labour laws. 
                              All key terms are clearly defined and legally sound.
                            </p>
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground">Key Findings</h4>
                            <ul className="list-disc list-inside text-sm text-muted-foreground mt-1 space-y-1">
                              <li>Probation period: 3 months (Labour Act compliant)</li>
                              <li>Salary: N$45,000/month with performance bonus</li>
                              <li>Notice period: 30 days (standard practice)</li>
                              <li>3 signature fields identified and validated</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right Panel - Signature Fields */}
                  <div className="bg-muted/30 p-4 border-l border-border">
                    <div className="space-y-6">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-chart-1" />
                        <h4 className="font-semibold text-foreground">Signature Fields</h4>
                      </div>
                      
                      {/* Signature Field 1 */}
                      <div className="bg-card rounded-lg p-4 border border-border">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-medium">Employee Signature</p>
                            <p className="text-sm text-muted-foreground">Page 1 • Required</p>
                          </div>
                          <span className="px-2 py-1 text-xs bg-chart-5/20 text-chart-5 rounded">Required</span>
                        </div>
                        <div className="bg-muted rounded-lg p-4 border-2 border-dashed border-border">
                          <div className="text-center">
                            <div className="w-24 h-12 mx-auto bg-white rounded border border-border mb-2"></div>
                            <p className="text-xs text-muted-foreground">Signature Field</p>
                          </div>
                        </div>
                        <Button variant="primary" size="sm" className="w-full mt-3">
                          Sign Here
                        </Button>
                      </div>

                      {/* Signature Field 2 */}
                      <div className="bg-card rounded-lg p-4 border border-border">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-medium">Employer Signature</p>
                            <p className="text-sm text-muted-foreground">Page 1 • Required</p>
                          </div>
                          <span className="px-2 py-1 text-xs bg-chart-5/20 text-chart-5 rounded">Required</span>
                        </div>
                        <div className="bg-muted rounded-lg p-4 border-2 border-dashed border-border">
                          <div className="text-center">
                            <div className="w-24 h-12 mx-auto bg-white rounded border border-border mb-2"></div>
                            <p className="text-xs text-muted-foreground">Signature Field</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="w-full mt-3">
                          Pending
                        </Button>
                      </div>

                      {/* Signature Field 3 */}
                      <div className="bg-card rounded-lg p-4 border border-border">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-medium">Witness Signature</p>
                            <p className="text-sm text-muted-foreground">Page 2 • Optional</p>
                          </div>
                          <span className="px-2 py-1 text-xs bg-chart-2/20 text-chart-2 rounded">Optional</span>
                        </div>
                        <div className="bg-muted rounded-lg p-4 border-2 border-dashed border-border">
                          <div className="text-center">
                            <div className="w-24 h-12 mx-auto bg-white rounded border border-border mb-2"></div>
                            <p className="text-xs text-muted-foreground">Signature Field</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="w-full mt-3">
                          Skip
                        </Button>
                      </div>

                      {/* Compliance Status */}
                      <div className="bg-chart-2/10 p-4 rounded-lg border border-chart-2/20">
                        <div className="flex items-center gap-2 mb-2">
                          <ShieldCheck className="w-5 h-5 text-chart-2" />
                          <span className="text-sm font-medium text-chart-2">ETA 2019 Compliance</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <CheckCircle className="w-4 h-4 text-chart-2" /> Section 17: Electronic Signatures<br/>
                          <CheckCircle className="w-4 h-4 text-chart-2" /> Section 20: Data Integrity<br/>
                          <CheckCircle className="w-4 h-4 text-chart-2" /> Section 21: Authentication<br/>
                          <CheckCircle className="w-4 h-4 text-chart-2" /> Audit Trail Created
                        </div>
                      </div>
                      </div>
                    </div>
                  </div>
                </div>
                
              {/* Feature Highlights */}
              <div className="mt-16 grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-chart-1/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Cpu className="w-8 h-8 text-chart-1" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Real AI Analysis</h3>
                  <p className="text-muted-foreground">
                    Our actual AI components analyze documents with OCR, computer vision, and compliance checking.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-chart-2/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck className="w-8 h-8 text-chart-2" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Live Compliance</h3>
                  <p className="text-muted-foreground">
                    Real-time ETA 2019 validation using our actual compliance checking components.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-chart-4/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-chart-4" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Interactive Signing</h3>
                  <p className="text-muted-foreground">
                    Our actual signature field components with drawing, typing, and upload options.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* Legal Knowledge Graph Section */}
        <section id="legal-framework" className="py-24 md:py-32 bg-muted/30">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">BuffrSign Legal Knowledge Graph</h2>
              <p className="max-w-3xl mx-auto text-xl text-muted-foreground">
                Explore our comprehensive legal framework built on 29+ legal documents, 
                international standards, and Namibian compliance requirements.
              </p>
            </div>

            <div className="max-w-6xl mx-auto">
              <div className="h-[600px]">
                <BuffrSignKnowledgeGraph />
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose BuffrSign Section */}
        <section id="features" className="py-24 md:py-32">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Why Choose BuffrSign?</h2>
              <p className="max-w-3xl mx-auto text-xl text-muted-foreground">
                The most intelligent and user-friendly digital signature platform designed 
                specifically for Namibian businesses and individuals.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Cpu className="w-8 h-8" />}
                title="AI-Powered Intelligence"
                description="Our AI analyzes documents in real-time, detecting signature fields and ensuring legal compliance automatically. Powered by deep knowledge of contract law and the Namibian constitution."
                color="primary"
              />
              <FeatureCard
                icon={<Smartphone className="w-8 h-8" />}
                title="Mobile-First Design"
                description="Sign documents on any device with our touch-optimized interface. Works perfectly on phones, tablets, and computers. Seamless experience across all platforms."
                color="accent"
              />
              <FeatureCard
                icon={<Users className="w-8 h-8" />}
                title="Multi-Party Agreements"
                description="Manage complex agreements with multiple signers. Set signing orders and track progress in real-time with ease. Perfect for business contracts and legal documents."
                color="warning"
              />
              <FeatureCard
                icon={<ShieldCheck className="w-8 h-8" />}
                title="Legal Compliance"
                description="ETA 2019 Sections 17, 20, 21, 24 compliant with automated compliance monitoring. Namibian Labour Act and Consumer Protection standards. Real-time compliance scoring and violation detection."
                color="secondary"
              />
              <FeatureCard
                icon={<Settings className="w-8 h-8" />}
                title="Advanced Workflows"
                description="Document Analysis → AI Extraction → Compliance Check → Signature Placement → Notifications. Automated workflows with conditional logic, retry policies, and real-time tracking."
                color="error"
              />
              <FeatureCard
                icon={<Lock className="w-8 h-8" />}
                title="Professional Security"
                description="256-bit Encryption, Multi-Factor Auth, Audit Trails. JWT tokens with HS256 encryption, document access tokens, signature session tokens, and token blacklisting."
                color="primary"
              />
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 md:py-32 bg-muted/30">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-chart-2/10 text-chart-2 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-chart-2 rounded-full animate-pulse"></span>
                Trusted by 500+ Namibian businesses
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Simple, Transparent Pricing</h2>
              <p className="max-w-3xl mx-auto text-xl text-muted-foreground mb-8">
                Start signing documents today with our FREE standard plan until October 2025.
                No hidden fees, no surprises.
              </p>
              
              {/* Limited Time Offer */}
              <div className="flex items-center justify-center gap-4 mb-12">
                <div className="bg-chart-2/10 text-chart-2 px-4 py-2 rounded-full text-sm font-medium">
                  <span className="w-2 h-2 bg-chart-2 rounded-full animate-pulse mr-2 inline-block"></span>
                  Limited Time Offer
                </div>
              </div>
            </div>
            
            <div className="flex justify-center max-w-2xl mx-auto">
              {/* BuffrSign Beta - FREE until October 2025 */}
              <PricingCard
                title="BuffrSign Beta"
                price="FREE"
                period="until Oct 2025"
                popular={true}
                features={[
                  "10 free signatures + 2000 AI tokens",
                  "FREE document signing until October 2025",
                  "BuffrSign AI analysis (token-based)",
                  "ETA 2019 compliance checking",
                  "Legal term explanations",
                  "Priority support",
                  "Advanced templates",
                  "Mobile & desktop access"
                ]}
                ctaText="Start Free Now"
                ctaAction={() => setShowPricingModal(true)}
                className="border-2 border-chart-1"
              />
            </div>


          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-24 md:py-32">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Transform Your Document Workflows?</h2>
            <p className="max-w-2xl mx-auto text-xl text-muted-foreground mt-4 mb-10">
              Join Namibian businesses already using BuffrSign to streamline their signing processes and ensure legal compliance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <CTAButton 
                primary 
                className="w-full sm:w-auto"
                onClick={() => router.push('/auth/signup')}
              >
                Start Free Trial <ArrowRight className="w-5 h-5 ml-2" />
              </CTAButton>
              <CTAButton onClick={() => setShowVideoModal(true)}>
                Schedule Demo <Play className="w-5 h-5 ml-2" />
              </CTAButton>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted/50 border-t border-border">
        <div className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-chart-4 rounded-lg flex items-center justify-center shadow-md">
                  <FileSignature className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-foreground">BuffrSign</span>
              </div>
              <p className="text-muted-foreground max-w-md">
                The AI-powered digital signature platform built for Namibia. 
                Secure, compliant, and intelligent document workflows.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Product</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">API</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Company</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border pt-8 mt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-muted-foreground text-sm mb-4 md:mb-0">
              © 2025 BuffrSign. All rights reserved. Built for Namibia.
            </div>
            <div className="flex space-x-6 text-muted-foreground text-sm">
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-foreground transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {showDemoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl p-8 max-w-md w-full border border-border">
            <h3 className="text-2xl font-bold mb-4 text-foreground">Start Your Free Trial</h3>
            <p className="text-muted-foreground mb-6">
              Get started with BuffrSign today. No credit card required.
            </p>
            <div className="space-y-4">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
              />
              <input 
                type="text" 
                placeholder="Your company name" 
                className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
              />
              <select className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground">
                <option>Select industry</option>
                <option>Legal</option>
                <option>Real Estate</option>
                <option>Healthcare</option>
                <option>Finance</option>
                <option>Other</option>
              </select>
              <div className="flex gap-3">
                <Button 
                  variant="primary"
                  size="md"
                  className="flex-1"
                  onClick={() => {
                    setShowDemoModal(false);
                    router.push('/auth/signup');
                  }}
                >
                  Start Free Trial
                </Button>
                <Button 
                  variant="ghost"
                  size="md"
                  onClick={() => setShowDemoModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showVideoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl p-8 max-w-4xl w-full border border-border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-foreground">BuffrSign Demo Video</h3>
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => setShowVideoModal(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Video placeholder - Demo video would be embedded here</p>
            </div>
          </div>
        </div>
      )}

      {showPricingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl p-8 max-w-md w-full border border-border">
            <h3 className="text-2xl font-bold mb-4 text-foreground">Choose Your Plan</h3>
            <p className="text-muted-foreground mb-6">
              Select the plan that best fits your needs.
            </p>
            <div className="space-y-4">
              <Button 
                variant="outline"
                size="md"
                className="w-full"
                onClick={() => setShowPricingModal(false)}
              >
                Standard Plan - N$25/document
              </Button>
              <Button 
                variant="primary"
                size="md"
                className="w-full"
                onClick={() => setShowPricingModal(false)}
              >
                Pro Plan - N$199/month
              </Button>
              <Button 
                variant="ghost"
                size="md"
                className="w-full"
                onClick={() => setShowPricingModal(false)}
              >
                Cancel
              </Button>
            </div>
        </div>
      </div>
      )}
    </div>
  );
}