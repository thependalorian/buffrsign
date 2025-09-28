"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, FileSignature } from 'lucide-react';
// Assuming NavLink and CTAButton are in the components directory
import NavLink from './NavLink';
import CTAButton from './CTAButton';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-card/80 backdrop-blur-lg shadow-sm' : 'bg-transparent'}`}>
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-chart-1 rounded-lg flex items-center justify-center">
              <FileSignature className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-foreground">BuffrSign</span>
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#demo">Demo</NavLink>
            <NavLink href="#knowledge-graph">AI Intelligence</NavLink>
            <NavLink href="#pricing">Pricing</NavLink>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <NavLink href="/login">Sign In</NavLink>
            <CTAButton primary>Start Free Trial</CTAButton>
          </div>
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-foreground">
              {isMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden mt-4 bg-card rounded-lg shadow-lg p-4">
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#demo">Demo</NavLink>
            <NavLink href="#knowledge-graph">AI Intelligence</NavLink>
            <NavLink href="#pricing">Pricing</NavLink>
            <div className="pt-4 mt-4 border-t border-border">
              <NavLink href="/login">Sign In</NavLink>
              <CTAButton primary className="w-full mt-2">Start Free Trial</CTAButton>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
