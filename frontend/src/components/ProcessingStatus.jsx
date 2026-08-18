import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, AlertCircle, Film, Sparkles } from 'lucide-react';
import { fetchOrderStatus } from '../services/api';

export default function ProcessingStatus({ orderId, onReady }) {
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let intervalId;

    const pollStatus = async () => {
      try {
        const data = await fetchOrderStatus(orderId);
        setOrder(data);

        if (data.render_status === 'VIDEO_READY') {
          clearInterval(intervalId);
          onReady(data);
        } else if (data.render_status === 'RENDER_FAILED') {
          clearInterval(intervalId);
          setError(data.error_message || 'Video rendering failed. Please contact support.');
        }
      } catch (err) {
        console.error('Polling status error:', err);
      }
    };

    pollStatus();
    intervalId = setInterval(pollStatus, 2000);

    return () => clearInterval(intervalId);
  }, [orderId, onReady]);

  const stages = [
    { id: 'PAYMENT_SUCCESS', label: 'Payment Verified' },
    { id: 'RENDER_QUEUED', label: 'Preparing Clean Template Master' },
    { id: 'RENDERING', label: 'Rendering Dynamic 4K Text Layers & Animations' },
    { id: 'VIDEO_READY', label: 'Final 4K MP4 Ready' }
  ];

  const currentStatus = order?.render_status || 'RENDER_QUEUED';

  const getStageState = (stageId) => {
    if (currentStatus === 'VIDEO_READY') return 'completed';
    if (currentStatus === 'RENDER_FAILED') return 'failed';

    const orderStages = ['PAYMENT_SUCCESS', 'RENDER_QUEUED', 'RENDERING', 'VIDEO_READY'];
    const currentIdx = orderStages.indexOf(currentStatus);
    const stageIdx = orderStages.indexOf(stageId);

    if (stageIdx < currentIdx) return 'completed';
    if (stageIdx === currentIdx) return 'current';
    return 'pending';
  };

  return (
    <div className="max-w-2xl mx-auto bg-gray-900/90 border border-amber-500/30 rounded-3xl p-6 sm:p-10 backdrop-blur-xl shadow-2xl text-center space-y-8">
      <div className="space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
          <Film className="w-8 h-8 animate-pulse" />
        </div>
        <h2 className="font-cinzel text-2xl font-bold text-gray-100">Rendering Your 4K Video</h2>
        <p className="text-xs text-gray-400 max-w-md mx-auto">
          Our rendering engine is composing your personalized text onto the clean master video with hardware-accelerated 4K encoding.
        </p>
      </div>

      {error ? (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center justify-center space-x-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : (
        <div className="space-y-4 text-left max-w-md mx-auto bg-gray-950/80 p-6 rounded-2xl border border-gray-800">
          {stages.map((stage) => {
            const state = getStageState(stage.id);
            return (
              <div key={stage.id} className="flex items-center space-x-3 text-xs">
                {state === 'completed' && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                )}
                {state === 'current' && (
                  <Loader2 className="w-5 h-5 text-amber-400 animate-spin shrink-0" />
                )}
                {state === 'pending' && (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-800 shrink-0" />
                )}

                <span className={`font-medium ${
                  state === 'completed' ? 'text-gray-300' : state === 'current' ? 'text-amber-400 font-semibold' : 'text-gray-600'
                }`}>
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="pt-4 border-t border-gray-800/80 flex items-center justify-center space-x-2 text-xs text-gray-500">
        <Sparkles className="w-4 h-4 text-amber-500" />
        <span>Target Resolution: 2160 x 3840 (Ultra HD 9:16 Vertical)</span>
      </div>
    </div>
  );
}
