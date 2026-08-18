import React from 'react';
import { Download, Share2, CheckCircle2, Sparkles, RefreshCw } from 'lucide-react';
import { getVideoDownloadUrl } from '../services/api';

export default function VideoReady({ order, onReset }) {
  const downloadUrl = getVideoDownloadUrl(order.order_id);
  const mandalName = order.customer_data?.mandal_name || 'Ganesh Utsav';

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `🚩 *${mandalName}* Cordially Invites You!\n\nHere is our official 4K invitation video for Ganesh Utsav:\n\n${window.location.origin}/video/${order.order_id}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="max-w-3xl mx-auto bg-gray-900/90 border border-amber-500/40 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4" />
          <span>4K Video Successfully Rendered!</span>
        </div>
        <h2 className="font-cinzel text-3xl font-bold gold-gradient-text">Your Invitation Video is Ready</h2>
        <p className="text-xs text-gray-400">Order ID: #{order.order_id.slice(0, 8)}</p>
      </div>

      {/* Video Player */}
      <div className="max-w-xs mx-auto aspect-[9/16] rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-2xl bg-gray-950">
        <video
          src={downloadUrl}
          controls
          autoPlay
          loop
          playsInline
          className="w-full h-full object-cover"
        />
      </div>

      {/* Action Buttons */}
      <div className="max-w-md mx-auto space-y-3">
        <a
          href={downloadUrl}
          download
          className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-gray-950 font-bold text-sm shadow-xl shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all"
        >
          <Download className="w-5 h-5" />
          <span>Download 4K Ultra HD MP4 Video</span>
        </a>

        <button
          onClick={handleShareWhatsApp}
          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg flex items-center justify-center space-x-2 transition-all"
        >
          <Share2 className="w-4 h-4" />
          <span>Share Invitation on WhatsApp</span>
        </button>

        <button
          onClick={onReset}
          className="w-full py-2.5 rounded-xl border border-gray-800 text-gray-400 hover:text-gray-200 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Create Another Invitation</span>
        </button>
      </div>
    </div>
  );
}
