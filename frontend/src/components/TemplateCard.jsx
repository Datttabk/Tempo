import React from 'react';
import { Play, Sparkles, Lock, Clock } from 'lucide-react';

export default function TemplateCard({ template, onSelect }) {
  const isActive = template.status === 'ACTIVE';

  return (
    <div className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
      isActive 
        ? 'cinematic-card hover:-translate-y-1' 
        : 'bg-gray-900/40 border border-gray-800 opacity-75'
    }`}>
      {/* Aspect Ratio 9:16 Video Preview Container */}
      <div className="relative aspect-[9/16] bg-gray-950 overflow-hidden group">
        {isActive ? (
          <video
            src={`/assets/templates/${template.slug}/master.mp4`}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900/80 p-6 text-center">
            <Clock className="w-12 h-12 text-gray-600 mb-3" />
            <span className="font-cinzel text-lg font-bold text-gray-400">COMING SOON</span>
            <p className="text-xs text-gray-500 mt-1">In Development</p>
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/20 to-transparent pointer-events-none" />

        {/* Badge */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-950/80 backdrop-blur-md text-amber-400 border border-amber-500/30">
            {template.occasion}
          </span>
          {isActive ? (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500 text-gray-950 shadow-md shadow-amber-500/20">
              4K HD
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-800 text-gray-400 border border-gray-700">
              UPCOMING
            </span>
          )}
        </div>
      </div>

      {/* Details Footer */}
      <div className="p-5">
        <h3 className="font-cinzel text-lg font-bold text-gray-100 mb-1 line-clamp-1">{template.name}</h3>
        <p className="text-xs text-gray-400 mb-4 line-clamp-2">{template.description || "Cinematic 4K festival invitation video."}</p>

        <div className="flex items-center justify-between pt-3 border-t border-gray-800">
          <div>
            <span className="block text-[10px] uppercase text-gray-500 font-semibold">Special Price</span>
            <span className="font-cinzel text-xl font-bold gold-gradient-text">₹{template.price_inr}</span>
          </div>

          {isActive ? (
            <button
              onClick={() => onSelect(template)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-gray-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center space-x-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personalize</span>
            </button>
          ) : (
            <button
              disabled
              className="px-4 py-2 rounded-xl bg-gray-800 text-gray-500 font-bold text-xs cursor-not-allowed flex items-center space-x-1.5 border border-gray-700"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Coming Soon</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
