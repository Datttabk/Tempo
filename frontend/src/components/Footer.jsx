import React from 'react';
import { Film, Shield, Sparkles, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-950 border-t border-amber-500/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Film className="w-6 h-6 text-amber-500" />
            <span className="font-cinzel text-xl font-bold gold-gradient-text">TEMPO</span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Personalized 4K cinematic festival invitation platform. Create stunning ready-to-share invitation videos for Ganesh Aagman & Visarjan in minutes.
          </p>
        </div>

        <div>
          <h4 className="font-cinzel text-sm font-semibold text-amber-400 mb-3">Festival Templates</h4>
          <ul className="space-y-2 text-xs text-gray-400">
            <li><a href="#templates" className="hover:text-amber-300">Ganesh Aagman Invitation</a></li>
            <li><a href="#templates" className="hover:text-amber-300">Ganesh Visarjan Invitation</a></li>
            <li><span className="text-gray-600">Ganesh Sthapana (Coming Soon)</span></li>
            <li><span className="text-gray-600">Navratri Dandiya (Coming Soon)</span></li>
          </ul>
        </div>

        <div>
          <h4 className="font-cinzel text-sm font-semibold text-amber-400 mb-3">Guarantees</h4>
          <ul className="space-y-2 text-xs text-gray-400">
            <li className="flex items-center"><Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-500" /> 4K Ultra HD Resolution</li>
            <li className="flex items-center"><Shield className="w-3.5 h-3.5 mr-1.5 text-amber-500" /> Instant Download Access</li>
            <li className="flex items-center"><Shield className="w-3.5 h-3.5 mr-1.5 text-amber-500" /> Safe & Secure Payments</li>
          </ul>
        </div>

        <div>
          <h4 className="font-cinzel text-sm font-semibold text-amber-400 mb-3">Customer Support</h4>
          <p className="text-xs text-gray-400 mb-2">Need help with your invitation video order?</p>
          <a href="mailto:support@tempoinvites.com" className="text-xs text-amber-400 hover:underline">support@tempoinvites.com</a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500">
        <p>© 2026 Tempo Cinematic Invitations. All rights reserved.</p>
        <p className="flex items-center mt-2 md:mt-0">
          Crafted with <Heart className="w-3 h-3 mx-1 text-red-500 fill-current" /> for Festive Celebrations
        </p>
      </div>
    </footer>
  );
}
