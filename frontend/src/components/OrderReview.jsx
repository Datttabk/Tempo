import React, { useState } from 'react';
import { ShieldCheck, Edit2, CreditCard, CheckSquare, Square, AlertTriangle } from 'lucide-react';

export default function OrderReview({ template, customerData, onConfirm, onEdit }) {
  const [confirmed, setConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleProceed = async () => {
    if (!confirmed) {
      setError("Please check the confirmation box to verify your information is correct.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await onConfirm(confirmed);
    } catch (err) {
      setError(err.message || "Failed to process order confirmation.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-gray-900/90 border border-amber-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
      <div className="flex items-center justify-between pb-6 border-b border-gray-800 mb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">Step 2 of 3</span>
          <h2 className="font-cinzel text-2xl font-bold text-gray-100">Review & Confirm Details</h2>
        </div>
        <button
          onClick={onEdit}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 text-xs font-semibold transition-colors"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>Edit Details</span>
        </button>
      </div>

      {/* Details Summary Card */}
      <div className="bg-gray-950/80 rounded-2xl p-5 border border-gray-800 space-y-4 mb-6">
        <div className="flex items-center justify-between pb-3 border-b border-gray-800/60">
          <span className="text-xs text-gray-400">Selected Template</span>
          <span className="font-cinzel text-sm font-bold text-amber-400">{template.name}</span>
        </div>

        {template.fields.filter(f => !f.static_value).map(field => (
          <div key={field.id} className="flex justify-between items-start text-xs">
            <span className="text-gray-400 uppercase tracking-wider font-medium">{field.label}:</span>
            <span className="font-bold text-gray-100 text-right max-w-[60%] font-serif">{customerData[field.id] || '-'}</span>
          </div>
        ))}

        <div className="pt-3 border-t border-gray-800/60 flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-300">Total Price</span>
          <span className="font-cinzel text-xl font-bold gold-gradient-text">₹{template.price_inr}</span>
        </div>
      </div>

      {/* Confirmation Box (Mandatory Checkbox) */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 mb-6">
        <label className="flex items-start space-x-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => {
              setConfirmed(e.target.checked);
              if (error) setError(null);
            }}
            className="mt-0.5 w-4 h-4 text-amber-500 rounded border-gray-700 bg-gray-950 focus:ring-amber-500 accent-amber-500"
          />
          <div className="text-xs text-amber-200/90 leading-relaxed">
            <span className="font-bold text-amber-400">Explicit Confirmation Required:</span>
            <p className="mt-1">
              I explicitly confirm that all entered details (Mandal Name, Date, Time, Location) are 100% correct. I understand that video rendering will be strictly generated using this exact information.
            </p>
          </div>
        </label>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center space-x-2 text-xs text-red-400">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={onEdit}
          className="px-5 py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:text-gray-200 text-xs font-semibold transition-colors"
        >
          Back
        </button>

        <button
          onClick={handleProceed}
          disabled={!confirmed || isSubmitting}
          className={`px-6 py-3 rounded-xl font-bold text-xs shadow-lg flex items-center space-x-2 transition-all ${
            confirmed && !isSubmitting
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-gray-950 shadow-amber-500/20'
              : 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>{isSubmitting ? 'Creating Order...' : `Pay ₹${template.price_inr} & Render`}</span>
        </button>
      </div>
    </div>
  );
}
