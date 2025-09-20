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
  Settings
} from 'lucide-react';
import BuffrSignKnowledgeGraph from '@/components/buffrsign-knowledge-graph';

// Helper Components
const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a href={href} className="text-muted-foreground hover:text-foreground transition-colors duration-300 font-medium">
    {children}
  </a>
);

const CTAButton = ({ children, primary = false, className = '', onClick }: { 
  children: React.ReactNode; 
  primary?: boolean; 
  className?: string; 
  onClick?: () => void; 
}) => (
  <button 
    onClick={onClick}
    className={`btn btn-lg rounded-full shadow-lg transition-transform duration-300 hover:scale-105 ${primary ? 'btn-primary' : 'btn-outline'} ${className}`}
  >
    {children}
  </button>
);

const FeatureCard = ({ icon: Icon, title, description, color = "primary" }: { 
  icon: React.ComponentType<{ className?: string }>; 
  title: string; 
  description: string; 
  color?: string;
}) => (
  <div className="feature-card p-8 rounded-2xl">
    <div className={`w-16 h-16 bg-${color}/10 rounded-2xl flex items-center justify-center mb-6`}>
      <Icon className={`w-8 h-8 text-${color}`} />
    </div>
    <h3 className="text-2xl font-bold mb-4 text-foreground">{title}</h3>
    <p className="text-muted-foreground leading-relaxed">{description}</p>
  </div>
);

const PricingCard = ({ title, price, period, features, popular = false, ctaText, ctaAction }: {
  title: string;
  price: string;
  period: string;
  features: string[];
  popular?: boolean;
  ctaText: string;
  ctaAction: () => void;
}) => (
  <div className={`_document-card p-8 relative ${popular ? 'ring-2 ring-primary' : ''}`}>
    {popular && (
      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
        <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
          Most Popular
        </span>
      </div>
    )}
    <h3 className="text-2xl font-bold mb-2 text-foreground">{title}</h3>
    <div className="mb-6">
      <span className="text-4xl font-bold text-foreground">{price}</span>
      <span className="text-muted-foreground">/{period}</span>
    </div>
    <ul className="space-y-3 mb-8">
      {features.map((feature, _index) => (
        <li key={_index} className="flex items-center">
          <CheckCircle className="w-5 h-5 text-primary mr-3" />
          <span className="text-muted-foreground">{feature}</span>
        </li>
      ))}
    </ul>
    <button 
      onClick={ctaAction}
      className={`btn w-full ${popular ? 'btn-primary' : 'btn-outline'}`}
    >
      {ctaText}
    </button>
  </div>
);

export default function BuffrSignLandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);

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
              <NavLink href="#live-demo">Live Demo</NavLink>
              <NavLink href="#legal-framework">Legal Framework</NavLink>
              <NavLink href="#pricing">Pricing</NavLink>
              <NavLink href="#security">Security</NavLink>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <button className="btn btn-ghost">Sign In</button>
              <button 
                className="btn btn-primary rounded-full"
                onClick={() => setShowDemoModal(true)}
              >
                Try Free
              </button>
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
              <a href="#live-demo" className="block py-2 text-lg">Live Demo</a>
              <a href="#legal-framework" className="block py-2 text-lg">Legal Framework</a>
              <a href="#pricing" className="block py-2 text-lg">Pricing</a>
              <a href="#security" className="block py-2 text-lg">Security</a>
              <div className="pt-4 mt-4 border-t border-border space-y-3">
                <button className="btn btn-ghost w-full">Sign In</button>
                <button 
                  className="btn btn-primary w-full rounded-full"
                  onClick={() => setShowDemoModal(true)}
                >
                  Try Free
                </button>
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
              Upload any _document, our AI finds signature spots, and get legally binding results instantly.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <CTAButton 
                primary
                onClick={() => setShowDemoModal(true)}
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
              <h2 className="text-4xl md:text-5xl font-bold mb-6">BuffrSign Workspace</h2>
              <p className="max-w-3xl mx-auto text-xl text-muted-foreground">
                AI-Powered Document Analysis with Real-time Processing
              </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="_document-card p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 bg-chart-2 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-chart-2">Active</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Contract Analysis Complete</h3>
                  <p className="text-muted-foreground mb-4">
                    Employment agreement between Namibian Digital Solutions (Pty) Ltd and John Katamba
                  </p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Pages:</span>
                      <span className="font-medium ml-1">12 pages</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Signatures:</span>
                      <span className="font-medium ml-1">3 signature fields</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Compliance:</span>
                      <span className="font-medium ml-1 text-chart-2">ETA compliant</span>
                    </div>
                  </div>
                </div>

                <div className="_document-card p-6">
                  <h4 className="font-bold mb-3">Key Terms Identified</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      Probation period: 3 months
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      Salary: N$45,000 per month
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      Notice period: 30 days
                    </li>
                  </ul>
                </div>

                <div className="_document-card p-6">
                  <h4 className="font-bold mb-3">AI Recommendations</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Consider adding intellectual property clause (Section 8.3)
                  </p>
                  <button className="btn btn-primary btn-sm">View suggestion →</button>
                </div>
              </div>

              <div className="space-y-6">
                <div className="_document-card p-6">
                  <h3 className="font-bold mb-4">Document Preview</h3>
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <FileText className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">Employment_Contract_2024.pdf</p>
                    <p className="text-xs text-muted-foreground">Ready for signature</p>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button className="btn btn-outline btn-sm flex-1">Preview</button>
                    <button className="btn btn-outline btn-sm flex-1">Download</button>
                  </div>
                </div>

                <div className="_document-card p-6">
                  <h4 className="font-bold mb-3">Ask me anything about this contract...</h4>
                  <div className="space-y-3">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <p className="text-sm">&quot;What exactly does the &apos;3-month probation period&apos; mean under Namibian law?&quot;</p>
                    </div>
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Regarding the probation period, as stipulated in Clause 3.1 of your agreement, 
                        this is governed by the Labour Act (No. 11 of 2007). The Act specifies that a 
                        probationary period should be for a reasonable duration to assess the employee&apos;s suitability.
                      </p>
                    </div>
                    <button className="btn btn-primary btn-sm w-full">Yes, Let&apos;s Sign</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Live Demo Section */}
        <section id="live-demo" className="py-24 md:py-32">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Live Demo</h2>
              <p className="max-w-3xl mx-auto text-xl text-muted-foreground">
                See how our AI analyzes contracts, explains legal terms, and guides you through the signing process. 
                Our assistant has deep knowledge of contract law and the Namibian constitution.
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="_document-card p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 bg-chart-2 rounded-full animate-pulse"></div>
                  <span className="font-bold">BuffrSign AI Assistant</span>
                  <span className="text-sm text-muted-foreground">Live chat session</span>
                </div>
                
                {/* Chat Interface */}
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {/* User Message */}
                  <div className="flex justify-end">
                    <div className="bg-primary text-primary-foreground p-4 rounded-lg max-w-xs">
                      <p className="text-sm">
                        I just uploaded an employment contract. Can you help me understand the key terms?
                      </p>
                    </div>
                  </div>
                  
                  {/* AI Response */}
                  <div className="flex justify-start">
                    <div className="bg-muted p-4 rounded-lg max-w-lg">
                        <p className="text-sm mb-3">
                         I&apos;ve analyzed your employment contract. Here are the key terms I found:
                        </p>
                      <ul className="space-y-1 text-sm">
                        <li>• <strong>Probation period:</strong> 3 months</li>
                        <li>• <strong>Salary:</strong> N$45,000 per month</li>
                        <li>• <strong>Notice period:</strong> 30 days</li>
                        <li>• <strong>Signatures Required:</strong> 2 (employer & employee)</li>
                      </ul>
                    </div>
                  </div>
                  
                  {/* User Message */}
                  <div className="flex justify-end">
                    <div className="bg-primary text-primary-foreground p-4 rounded-lg max-w-xs">
                      <p className="text-sm">
                        What does the 3-month probation period mean under Namibian law?
                      </p>
                    </div>
                  </div>
                  
                  {/* AI Response */}
                  <div className="flex justify-start">
                    <div className="bg-muted p-4 rounded-lg max-w-lg">
                        <p className="text-sm">
                          Under the Labour Act (No. 11 of 2007), a probationary period is a trial period to assess 
                         the employee&apos;s suitability for the position. During probation:
                        </p>
                      <ul className="space-y-1 text-sm mt-2">
                        <li>• Either party can terminate with shorter notice</li>
                        <li>• Performance standards should be clearly communicated</li>
                        <li>• Regular feedback and evaluation are recommended</li>
                      </ul>
                      <p className="text-sm mt-2">
                        Your contract is compliant with Namibian law. Would you like me to proceed with signature placement?
                      </p>
                    </div>
                  </div>
                  
                  {/* User Message */}
                  <div className="flex justify-end">
                    <div className="bg-primary text-primary-foreground p-4 rounded-lg max-w-xs">
                        <p className="text-sm">
                         Yes, let&apos;s sign it! Is this legally binding?
                        </p>
                    </div>
                  </div>
                  
                  {/* AI Response */}
                  <div className="flex justify-start">
                    <div className="bg-muted p-4 rounded-lg max-w-lg">
                        <p className="text-sm">
                          Absolutely! Your digital signature will be legally binding under the Electronic Transactions Act (No. 4 of 2019). 
                         I&apos;ve placed signature fields in the appropriate locations. 
                        </p>
                      <div className="mt-3 p-3 bg-chart-2/10 rounded-lg">
                        <p className="text-sm text-chart-2 font-medium">
                          ✅ ETA 2019 Compliant • ✅ Legally Binding • ✅ Audit Trail Created
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Typing Indicator */}
                  <div className="flex justify-start">
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                        <span className="text-xs text-muted-foreground">BuffrSign AI is typing...</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-center mt-6">
                  <button 
                    className="btn btn-primary"
                    onClick={() => setShowDemoModal(true)}
                  >
                    Try This Live Demo <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
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
                The most intelligent and _user-friendly digital signature platform designed 
                specifically for Namibian businesses and individuals.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard 
                icon={Cpu}
                title="AI-Powered Intelligence"
                description="Our AI analyzes documents in real-time, detecting signature fields and ensuring legal compliance automatically. Powered by deep knowledge of contract law and the Namibian constitution."
                color="chart-1"
              />
              <FeatureCard 
                icon={Smartphone}
                title="Mobile-First Design"
                description="Sign documents on any device with our touch-optimized interface. Works perfectly on phones, tablets, and computers. Seamless experience across all platforms."
                color="chart-2"
              />
              <FeatureCard 
                icon={Users}
                title="Multi-Party Agreements"
                description="Manage complex agreements with multiple signers. Set signing orders and track progress in real-time with ease. Perfect for business contracts and legal documents."
                color="chart-3"
              />
              <FeatureCard 
                icon={ShieldCheck}
                title="Legal Compliance"
                description="ETA 2019 Sections 17, 20, 21, 24 compliant with automated compliance monitoring. Namibian Labour Act and Consumer Protection standards. Real-time compliance scoring and violation detection."
                color="chart-4"
              />
              <FeatureCard 
                icon={Settings}
                title="Advanced Workflows"
                description="Document Analysis → AI Extraction → Compliance Check → Signature Placement → Notifications. Automated workflows with conditional logic, retry policies, and real-time tracking."
                color="chart-5"
              />
              <FeatureCard 
                icon={Lock}
                title="Professional Security"
                description="256-bit Encryption, Multi-Factor Auth, Audit Trails. JWT tokens with HS256 encryption, _document access tokens, signature session tokens, and token blacklisting."
                color="chart-1"
              />
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 md:py-32 bg-muted/30">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Simple, Transparent Pricing</h2>
              <p className="max-w-3xl mx-auto text-xl text-muted-foreground">
                Start signing documents today with our free plan, or upgrade for advanced features.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <PricingCard
                title="Standard"
                price="N$25"
                period="_document"
                features={[
                  "Pay per use",
                  "3 free signatures + 500 AI tokens",
                  "N$25 per _document signed",
                  "BuffrSign AI analysis (token-based)",
                  "ETA 2019 compliance checking",
                  "Legal term explanations",
                  "Priority support"
                ]}
                ctaText="Start with Free Pack"
                ctaAction={() => setShowPricingModal(true)}
              />
              
              <PricingCard
                title="Pro"
                price="N$199"
                period="month"
                popular={true}
                features={[
                  "Unlimited documents",
                  "Unlimited signatures + 10,000 AI tokens",
                  "Unlimited _document signing",
                  "Advanced BuffrSign AI (10,000 tokens/month)",
                  "Team collaboration",
                  "Priority support",
                  "Custom workflows",
                  "Advanced compliance monitoring"
                ]}
                ctaText="Start Pro Trial"
                ctaAction={() => setShowPricingModal(true)}
              />
            </div>

            <div className="text-center mt-8">
              <p className="text-muted-foreground">
                AI Token Pricing: N$2 per 100 tokens • Min top-up N$50
              </p>
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
                onClick={() => setShowDemoModal(true)}
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
                Secure, compliant, and intelligent _document workflows.
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
                className="form-input w-full"
              />
              <input 
                type="text" 
                placeholder="Your company name" 
                className="form-input w-full"
              />
              <select className="form-input w-full">
                <option>Select industry</option>
                <option>Legal</option>
                <option>Real Estate</option>
                <option>Healthcare</option>
                <option>Finance</option>
                <option>Other</option>
              </select>
              <div className="flex gap-3">
                <button 
                  className="form-button flex-1"
                  onClick={() => setShowDemoModal(false)}
                >
                  Start Free Trial
                </button>
                <button 
                  className="btn btn-ghost"
                  onClick={() => setShowDemoModal(false)}
                >
                  Cancel
                </button>
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
              <button 
                onClick={() => setShowVideoModal(false)}
                className="btn btn-ghost btn-sm"
              >
                <X className="w-5 h-5" />
              </button>
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
              <button 
                className="btn btn-outline w-full"
                onClick={() => setShowPricingModal(false)}
              >
                Standard Plan - N$25/document
              </button>
              <button 
                className="btn btn-primary w-full"
                onClick={() => setShowPricingModal(false)}
              >
                Pro Plan - N$199/month
              </button>
              <button 
                className="btn btn-ghost w-full"
                onClick={() => setShowPricingModal(false)}
              >
                Cancel
              </button>
            </div>
        </div>
      </div>
      )}
    </div>
  );
}
