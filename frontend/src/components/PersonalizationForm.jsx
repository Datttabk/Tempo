import React, { useState } from 'react';
import { AlertCircle, ArrowRight, CheckCircle2, Info } from 'lucide-react';

export default function PersonalizationForm({ template, initialData, onSubmit, onBack }) {
  const [formData, setFormData] = useState({
    mandal_name: initialData.mandal_name || '',
    date: initialData.date || '',
    time: initialData.time || '',
    location: initialData.location || ''
  });

  const [errors, setErrors] = useState({});

  const fields = template.fields || [];

  const handleInputChange = (fieldId, value) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
      setErrors(prev => ({ ...prev, [fieldId]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    fields.forEach(field => {
      if (field.static_value !== undefined && field.static_value !== null) return;

      const val = (formData[field.id] || '').trim();

      if (field.required && !val) {
        newErrors[field.id] = `${field.label} is required.`;
        return;
      }

      if (val) {
        if (field.max_chars && val.length > field.max_chars) {
          newErrors[field.id] = `Exceeds maximum character limit of ${field.max_chars} characters. Please shorten this information to fit the video template.`;
        } else if (field.max_words && val.split(/\s+/).length > field.max_words) {
          newErrors[field.id] = `Exceeds maximum word count of ${field.max_words} words. Please shorten this information to fit the video template.`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-gray-900/90 border border-amber-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
      <div className="flex items-center justify-between pb-6 border-b border-gray-800 mb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">Step 1 of 3</span>
          <h2 className="font-cinzel text-2xl font-bold text-gray-100">Personalize Your Video</h2>
        </div>
        <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold rounded-full">
          {template.name}
        </span>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-6 flex items-start space-x-3">
        <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-200/90 leading-relaxed">
          Please enter your details carefully. Your text will be dynamically overlaid on the cinematic 4K video template.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {fields.filter(f => f.static_value === undefined || f.static_value === null).map((field) => {
          const value = formData[field.id] || '';
          const maxChars = field.max_chars;
          const charCount = value.length;
          const isOverLimit = maxChars && charCount > maxChars;
          const error = errors[field.id];

          return (
            <div key={field.id} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor={field.id} className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  {field.label} {field.required && <span className="text-amber-500">*</span>}
                </label>
                {maxChars && (
                  <span className={`text-[11px] font-mono ${isOverLimit ? 'text-red-400 font-bold' : 'text-gray-500'}`}>
                    {charCount}/{maxChars} chars
                  </span>
                )}
              </div>

              <input
                type="text"
                id={field.id}
                value={value}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                placeholder={field.placeholder || `Enter ${field.label}`}
                className={`w-full px-4 py-3 rounded-xl bg-gray-950/80 border text-sm text-gray-100 placeholder-gray-600 focus:outline-none transition-colors ${
                  error || isOverLimit
                    ? 'border-red-500 focus:border-red-400'
                    : 'border-gray-800 focus:border-amber-500'
                }`}
              />

              {error && (
                <div className="flex items-center space-x-1.5 text-xs text-red-400 pt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          );
        })}

        <div className="pt-6 border-t border-gray-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:text-gray-200 text-xs font-semibold transition-colors"
          >
            Back to Templates
          </button>

          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-gray-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center space-x-2 transition-all"
          >
            <span>Review Information</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
