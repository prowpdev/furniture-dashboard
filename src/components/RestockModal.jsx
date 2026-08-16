import React, { useState, useEffect } from 'react';
import { X, PlusCircle, Truck } from 'lucide-react';

export const RestockModal = ({
  isOpen,
  onClose,
  item,
  profile,
  onConfirmRestock,
}) => {
  const [quantity, setQuantity] = useState(5);
  const [costPrice, setCostPrice] = useState(item?.costPrice || 0);
  const [supplierNote, setSupplierNote] = useState('');

  useEffect(() => {
    if (item) {
      setCostPrice(item.costPrice);
      setQuantity(Math.max(item.minStockAlert * 2, 5));
      setSupplierNote(`PO restock batch from ${item.supplier}`);
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const currentStock = item.stock;
  const projectedStock = currentStock + quantity;
  const totalCost = quantity * costPrice;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (quantity <= 0) return;
    onConfirmRestock(item, quantity, supplierNote, costPrice);
    onClose();
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
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-serif font-bold text-stone-900">Restock Furniture Inventory</h2>
            <p className="text-xs text-stone-500">Record incoming shipment and stock arrival</p>
          </div>
        </div>

        {/* Product Snapshot */}
        <div className="flex items-center space-x-3 p-3 bg-stone-50 rounded-xl border border-stone-200 mb-5">
          <img 
            src={item.imageUrl} 
            alt={item.name} 
            className="w-14 h-14 rounded-lg object-cover border border-stone-200 flex-shrink-0"
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-stone-900 truncate">{item.name}</h3>
            <p className="text-xs text-stone-500 font-mono">{item.sku} • {item.category}</p>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs text-stone-600">Current Stock: <strong className="text-stone-900">{currentStock}</strong></span>
              <span className="text-xs text-stone-400">|</span>
              <span className="text-xs text-stone-600">Min Alert: <strong>{item.minStockAlert}</strong></span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Units Received *
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-base font-bold text-stone-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Unit Cost ({profile.currency})
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={costPrice}
                onChange={e => setCostPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Restock Calculation Summary */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-xs space-y-1.5">
            <div className="flex justify-between text-stone-700">
              <span>New Projected Stock Level:</span>
              <span className="font-bold text-amber-950 text-sm">{projectedStock} units (+{quantity})</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Total Restock Expenditure:</span>
              <span className="font-semibold text-stone-900">{profile.currency}{totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-stone-500 text-[11px]">
              <span>Supplier on Record:</span>
              <span>{item.supplier}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Purchase Order / Reference Note
            </label>
            <input
              type="text"
              value={supplierNote}
              onChange={e => setSupplierNote(e.target.value)}
              placeholder="e.g. PO #8820 - Received via Pacific Freight"
              className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl shadow-md transition-all hover:scale-[1.02] flex items-center space-x-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Confirm Restock (+{quantity})</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
