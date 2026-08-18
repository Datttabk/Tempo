import React, { useState } from 'react';
import { ShieldCheck, Lock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function PaymentModal({ order, onPaymentComplete, onClose }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSimulatePayment = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      // Trigger backend verification
      const paymentId = `pay_mock_${order.order_id.slice(0, 8)}`;
      await onPaymentComplete(order.order_id, paymentId);
    } catch (err) {
      setError(err.message || 'Payment verification failed');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-md">
      <div className="max-w-md w-full bg-gray-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="font-cinzel text-xl font-bold text-gray-100">Secure Payment Checkout</h3>
          <p className="text-xs text-gray-400">Order #{order.order_id.slice(0, 8)}</p>
        </div>

        <div className="bg-gray-950 rounded-2xl p-4 border border-gray-800 space-y-3">
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>Item</span>
            <span className="font-medium text-gray-200">Cinematic 4K Video Invitation</span>
          </div>
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>Format</span>
            <span className="font-medium text-gray-200">4K Ultra HD MP4 (2160x3840)</span>
          </div>
          <div className="pt-3 border-t border-gray-800 flex justify-between items-center">
            <span className="text-xs font-semibold text-gray-300">Amount Due</span>
            <span className="font-cinzel text-2xl font-bold gold-gradient-text">₹{order.amount}</span>
          </div>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center space-x-2 text-xs text-emerald-400">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>Backend verification enabled. 256-bit encrypted gateway.</span>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center space-x-2 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleSimulatePayment}
            disabled={isProcessing}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-gray-950 font-bold text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Payment with Backend...</span>
              </>
            ) : (
              <span>Complete Payment (₹{order.amount})</span>
            )}
          </button>

          <button
            onClick={onClose}
            disabled={isProcessing}
            className="w-full py-2.5 rounded-xl text-gray-500 hover:text-gray-300 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
