/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { PawPrint, Menu, X } from 'lucide-react';
import { Button } from './UI';

export const Navbar = ({ 
  activePage, 
  onNavigate 
}: { 
  activePage: string, 
  onNavigate: (page: string) => void 
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'guide', label: 'Guide' },
    { id: 'verify', label: 'Verify' },
    { id: 'apply', label: 'Apply' },
    { id: 'members', label: 'Members' }
  ];

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'glass-effect py-3 shadow-sm' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <button 
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 group"
        >
          <div className="bg-brand-primary p-2 rounded-lg group-hover:rotate-12 transition-transform">
            <PawPrint className="w-6 h-6 text-brand-accent-light" />
          </div>
          <span className={`font-bold text-xl ${!isScrolled ? 'text-white' : 'text-brand-primary'}`}>
            ADI <span className="hidden sm:inline">North America</span>
          </span>
        </button>

        <nav className="hidden md:flex items-center gap-8">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`font-semibold text-sm transition-all hover:text-brand-accent ${
                activePage === item.id 
                  ? 'text-brand-accent border-b-2 border-brand-accent' 
                  : !isScrolled ? 'text-white' : 'text-brand-primary'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <button 
            className={`font-bold text-sm ${!isScrolled ? 'text-white' : 'text-brand-primary'}`}
            onClick={() => onNavigate('login')}
          >
            Login
          </button>
          <Button 
            variant="secondary" 
            className="px-6 py-2 text-sm rounded-full"
            onClick={() => onNavigate('apply')}
          >
            Apply Now
          </Button>
        </div>

        <button 
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6 text-brand-primary" /> : <Menu className={`w-6 h-6 ${!isScrolled ? 'text-white' : 'text-brand-primary'}`} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-xl p-6 flex flex-col gap-4 animate-in slide-in-from-top duration-300">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`text-left font-bold text-lg ${activePage === item.id ? 'text-brand-accent' : 'text-brand-primary'}`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-4 border-t border-brand-primary/10 flex flex-col gap-4">
            <Button 
              variant="outline"
              onClick={() => {
                onNavigate('login');
                setIsMobileMenuOpen(false);
              }}
            >
              Login
            </Button>
            <Button 
              variant="secondary"
              onClick={() => {
                onNavigate('apply');
                setIsMobileMenuOpen(false);
              }}
            >
              Apply Now
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export const Footer = ({ onNavigate }: { onNavigate?: (page: string) => void }) => (
  <footer className="bg-brand-primary text-white pt-20 pb-10">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        <div className="lg:col-span-1">
          <div className="flex items-center gap-2 mb-6">
            <PawPrint className="w-8 h-8 text-brand-accent" />
            <span className="font-bold text-2xl">ADI North America</span>
          </div>
          <p className="text-white/60 leading-relaxed mb-8">
            Adina is dedicated to verifying and registering service animals through ADI standards worldwide. Not affiliated with Assistance Dogs International.
          </p>
        </div>
        
        <div>
          <h4 className="font-bold text-lg mb-6 text-brand-accent">Quick Links</h4>
          <ul className="space-y-4 text-white/70">
            <li><button onClick={() => onNavigate?.('home')} className="hover:text-white transition-colors">Home</button></li>
            <li><button onClick={() => onNavigate?.('verify')} className="hover:text-white transition-colors">Verify</button></li>
            <li><button onClick={() => onNavigate?.('apply')} className="hover:text-white transition-colors">Apply</button></li>
            <li><button onClick={() => onNavigate?.('guide')} className="hover:text-white transition-colors">Guide</button></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-lg mb-6 text-brand-accent">Resources</h4>
          <ul className="space-y-4 text-white/70">
            <li><button onClick={() => onNavigate?.('members')} className="hover:text-white transition-colors">Members</button></li>
            <li><a href="https://assistancedogsinternational.org/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">ADI Official</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Latest News</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-lg mb-6 text-brand-accent">Admin</h4>
          <ul className="space-y-4 text-white/70">
            <li><button onClick={() => onNavigate?.('admin')} className="hover:text-white transition-colors">Admin Panel</button></li>
            <li><button onClick={() => onNavigate?.('admin')} className="hover:text-white transition-colors">Dashboard</button></li>
          </ul>
        </div>
      </div>

      <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/40">
        <p>© 2024 Assistance Dogs International. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white">Privacy Policy</a>
          <a href="#" className="hover:text-white">Terms of Service</a>
          <a href="#" className="hover:text-white">Accessibility</a>
        </div>
      </div>
    </div>
  </footer>
);
