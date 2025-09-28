
"use client";

import { ArrowRight, Play } from 'lucide-react';
import CTAButton from './CTAButton';

const Hero = () => (
  <section className="relative min-h-screen flex items-center justify-center pt-20">
    <div className="absolute inset-0 bg-gradient-to-b from-background to-muted"></div>
    <div className="relative z-10 text-center px-6 space-y-8 max-w-4xl mx-auto">
      <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground">
        Get Documents Signed in Minutes, Not Days
      </h1>
      <p className="max-w-2xl mx-auto text-xl text-muted-foreground">
        BuffrSign&apos;s AI-powered platform makes digital signatures lightning-fast. Upload, sign, and send documents in minutes with ETA 2019 compliance built-in.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
        <CTAButton primary>
          Start Signing Free <ArrowRight className="w-5 h-5 ml-2" />
        </CTAButton>
        <CTAButton>
          Watch Demo <Play className="w-5 h-5 ml-2" />
        </CTAButton>
      </div>
    </div>
  </section>
);

export default Hero;
