import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Sparkles, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-amber-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Film className="w-6 h-6 text-gray-950" />
            </div>
            <div>
              <span className="font-cinzel text-2xl font-bold tracking-wider gold-gradient-text">TEMPO</span>
              <span className="block text-[10px] uppercase tracking-widest text-amber-400/80 font-medium">Cinematic Invitations</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <a href="#templates" className="text-sm font-medium text-gray-300 hover:text-amber-400 transition-colors">
              Ganesh Aagman
            </a>
            <a href="#templates" className="text-sm font-medium text-gray-300 hover:text-amber-400 transition-colors">
              Ganesh Visarjan
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-gray-300 hover:text-amber-400 transition-colors">
              How It Works
            </a>
          </div>

          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Ultra 4K Render
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
