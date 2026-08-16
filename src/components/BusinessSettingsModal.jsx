import React, { useState, useEffect } from 'react';
import { X, Settings, RotateCcw, Check } from 'lucide-react';

export const BusinessSettingsModal = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  onResetData,
}) => {
  const [formData, setFormData] = useState(profile);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setFormData(profile);
  }, [profile, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-serif font-bold text-stone-900">Furniture Store Settings</h2>
            <p className="text-xs text-stone-500">Configure business branding, sales tax, and fulfillment rates</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Store / Brand Name
            </label>
            <input
              type="text"
              required
              value={formData.storeName}
              onChange={e => setFormData({ ...formData, storeName: e.target.value })}
              className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Brand Tagline
            </label>
            <input
              type="text"
              value={formData.tagline}
              onChange={e => setFormData({ ...formData, tagline: e.target.value })}
              className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Store Phone
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Store Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Showroom / Warehouse Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Rates and Fees */}
          <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200 space-y-3">
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
              Fulfillment & Tax Rates
            </span>
            
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-stone-600 mb-1">Currency Symbol</label>
                <input
                  type="text"
                  value={formData.currency}
                  onChange={e => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs font-bold text-center bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-600 mb-1">Sales Tax (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="50"
                  value={Number((formData.taxRate * 100).toFixed(1))}
                  onChange={e => setFormData({ ...formData, taxRate: (parseFloat(e.target.value) || 0) / 100 })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs font-bold text-center bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-600 mb-1">White Glove ($)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.whiteGloveFee}
                  onChange={e => setFormData({ ...formData, whiteGloveFee: parseInt(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs font-bold text-center bg-white"
                />
              </div>
            </div>
          </div>

          {/* Reset button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                if (confirm('Reset all catalog inventory, orders, and logs to initial sample showroom data?')) {
                  onResetData();
                  onClose();
                }
              }}
              className="text-xs text-stone-500 hover:text-red-700 flex items-center space-x-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Database to Sample Furniture Catalog</span>
            </button>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center space-x-1.5"
            >
              {savedSuccess ? <Check className="w-4 h-4" /> : null}
              <span>{savedSuccess ? 'Saved!' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
