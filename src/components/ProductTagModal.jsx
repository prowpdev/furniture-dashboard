import React from 'react';
import { X, Printer, Tag } from 'lucide-react';

export const ProductTagModal = ({
  isOpen,
  onClose,
  item,
  profile,
}) => {
  if (!isOpen || !item) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors print:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 text-amber-700 text-xs font-semibold uppercase tracking-wider mb-2 print:hidden">
          <Tag className="w-4 h-4" />
          <span>Showroom Floor Tag & Specs</span>
        </div>

        {/* Printable Card */}
        <div className="border-2 border-stone-800 rounded-xl p-5 bg-stone-50/50 space-y-4 my-2 text-stone-900 print:border-black print:m-0">
          {/* Header */}
          <div className="border-b border-stone-300 pb-3 text-center">
            <h4 className="font-serif font-bold text-base uppercase tracking-widest text-stone-950">
              {profile.storeName}
            </h4>
            <p className="text-[10px] text-stone-500 tracking-wider uppercase">
              Handcrafted Solid Wood & Artisan Living
            </p>
          </div>

          {/* Item details */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider bg-amber-100/70 px-2 py-0.5 rounded">
              {item.category}
            </span>
            <h3 className="font-serif font-bold text-lg text-stone-950 leading-snug">
              {item.name}
            </h3>
            <p className="text-xs text-stone-600 italic">
              Finish: {item.finish}
            </p>
          </div>

          {/* Specs grid */}
          <div className="grid grid-cols-2 gap-2 text-xs py-2.5 border-y border-stone-200">
            <div>
              <span className="block text-[10px] text-stone-500 uppercase font-semibold">Material</span>
              <span className="font-medium text-stone-900 text-[11px] leading-tight block">{item.material}</span>
            </div>
            <div>
              <span className="block text-[10px] text-stone-500 uppercase font-semibold">Dimensions</span>
              <span className="font-medium text-stone-900 text-[11px]">
                {item.dimensions.width}W × {item.dimensions.depth}D × {item.dimensions.height}H cm
              </span>
            </div>
            <div>
              <span className="block text-[10px] text-stone-500 uppercase font-semibold">Weight</span>
              <span className="font-medium text-stone-900 text-[11px]">{item.weightKg} kg</span>
            </div>
            <div>
              <span className="block text-[10px] text-stone-500 uppercase font-semibold">Warranty</span>
              <span className="font-medium text-stone-900 text-[11px]">5-Year Structural</span>
            </div>
          </div>

          {/* Price & Barcode */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <span className="text-[10px] text-stone-500 uppercase font-bold tracking-wider block">Retail Price</span>
              <span className="text-2xl font-serif font-bold text-stone-950">
                {profile.currency}{item.retailPrice.toLocaleString()}
              </span>
            </div>

            <div className="text-right">
              {/* Simulated barcode */}
              <div className="font-mono text-[9px] tracking-widest text-stone-400">||| | |||| || | ||||| |</div>
              <span className="font-mono text-xs font-bold text-stone-800 block">{item.sku}</span>
            </div>
          </div>
        </div>

        {/* Footer CTAs */}
        <div className="flex items-center justify-end space-x-2 pt-4 print:hidden">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs text-stone-600 hover:bg-stone-100 rounded-lg"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-semibold rounded-lg flex items-center space-x-1.5 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print Showroom Tag</span>
          </button>
        </div>
      </div>
    </div>
  );
};
