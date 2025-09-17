"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeSwitcher } from "@/components/theme-switcher";
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
  CheckCircle2
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/95 backdrop-blur-md border-b z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2 text-2xl font-bold text-primary">
                <PenTool className="h-8 w-8" />
                <span>BuffrSign</span>
              </Link>
              <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full font-semibold">
                CRAN Ready
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</Link>
              <Link href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
              <Link href="#security" className="text-muted-foreground hover:text-foreground transition-colors">Security</Link>
              <Link href="#support" className="text-muted-foreground hover:text-foreground transition-colors">Support</Link>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeSwitcher />
              <Button variant="outline" size="sm" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center pt-16 bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                <Brain className="h-4 w-4 animate-pulse" />
                <span>Powered by Advanced AI</span>
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
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1" asChild>
                  <Link href="/auth/sign-up">
                    <Rocket className="mr-2 h-5 w-5" />
                    Start Signing Free
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 py-6 border-2 hover:border-primary transition-all duration-300">
                  <Play className="mr-2 h-5 w-5" />
                  Watch 2-min Demo
                </Button>
              </div>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span>ETA 2019 Compliant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span>10,000+ Users</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span>2-Minute Setup</span>
                </div>
              </div>
            </div>
            
            {/* Product Showcase */}
            <div className="relative">
              <div className="bg-background border rounded-2xl p-6 shadow-2xl transform -rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="bg-muted/50 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="flex space-x-1">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <span className="text-sm text-muted-foreground ml-2">sign.buffr.ai</span>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 mb-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <Brain className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">AI Document Analysis</div>
                        <div className="text-sm text-muted-foreground">Smart field detection complete</div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>2 signatures found</span>
                      </div>
                      <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Legal compliance verified</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      ✨ AI Summary: Service agreement between Sarah Johnson and Mike Thompson for website development. 
                      Payment terms: $5,000. Timeline: 6 weeks.
                    </p>
                  </div>
                  
                  <div className="bg-white border rounded-lg p-4 relative">
                    <h3 className="font-semibold mb-2">SERVICE AGREEMENT</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      This Service Agreement is entered into between Sarah Johnson (&quot;Service Provider&quot;) and Mike Thompson (&quot;Client&quot;) for web development services...
                    </p>
                    
                    <div className="bg-muted/30 rounded-lg p-3 mb-4">
                      <strong className="text-sm">Scope of Work:</strong>
                      <p className="text-xs text-muted-foreground mt-1">
                        Complete responsive website with modern design, CMS integration, and mobile optimization.
                      </p>
                    </div>
                    
                    <div className="absolute bottom-4 right-4 w-28 h-10 border-2 border-dashed border-primary rounded flex items-center justify-center bg-primary/10 text-primary text-xs font-semibold">
                      Sign Here
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Badge */}
              <div className="absolute -top-4 -right-4">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg animate-bounce">
                  <Zap className="inline h-4 w-4 mr-2" />
                  AI Powered
                </div>
              </div>
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
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/50">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Brain className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>AI-Powered Intelligence</CardTitle>
                <CardDescription>
                  Our advanced AI automatically detects signature fields, validates document compliance, and provides smart recommendations to ensure your documents are perfect.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="#" className="inline-flex items-center text-primary hover:text-primary/80 font-semibold group-hover:gap-2 transition-all">
                  Learn more <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/50">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Smartphone className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Mobile-First Design</CardTitle>
                <CardDescription>
                  Sign documents on any device, anywhere. Our mobile-optimized platform works perfectly on phones, tablets, and computers with touch-friendly interfaces.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="#" className="inline-flex items-center text-primary hover:text-primary/80 font-semibold group-hover:gap-2 transition-all">
                  Try mobile signing <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/50">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Multi-Party Agreements</CardTitle>
                <CardDescription>
                  Handle complex agreements with multiple signers effortlessly. Set signing orders, track progress in real-time, and manage up to 20 parties per document.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="#" className="inline-flex items-center text-primary hover:text-primary/80 font-semibold group-hover:gap-2 transition-all">
                  See how it works <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/50">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-orange-100 to-red-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>Legal Compliance</CardTitle>
                <CardDescription>
                  Fully compliant with Namibia&apos;s Electronic Transactions Act 2019 and CRAN accredited. Your signatures are legally binding and court-admissible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="#" className="inline-flex items-center text-primary hover:text-primary/80 font-semibold group-hover:gap-2 transition-all">
                  View compliance details <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/50">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Workflow className="h-6 w-6 text-cyan-600" />
                </div>
                <CardTitle>Advanced Workflows</CardTitle>
                <CardDescription>
                  Create complex signing workflows with conditional logic, automated reminders, and real-time tracking. Perfect for business and legal processes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="#" className="inline-flex items-center text-primary hover:text-primary/80 font-semibold group-hover:gap-2 transition-all">
                  Explore workflows <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/50">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Lock className="h-6 w-6 text-yellow-600" />
                </div>
                <CardTitle>Professional Security</CardTitle>
                <CardDescription>
                  Bank-level encryption, multi-factor authentication, and comprehensive audit trails. Your documents and signatures are protected with military-grade security.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="#" className="inline-flex items-center text-primary hover:text-primary/80 font-semibold group-hover:gap-2 transition-all">
                  Security overview <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
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
            Join thousands of Namibian businesses already using BuffrSign to streamline their signing processes and ensure legal compliance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6 bg-white text-primary hover:bg-white/90 shadow-lg" asChild>
              <Link href="/auth/sign-up">
                <Rocket className="mr-2 h-5 w-5" />
                Start Free Trial
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-primary">
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
            <p>© 2025 BuffrSign. All rights reserved. Built with ❤️ for Namibia.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
