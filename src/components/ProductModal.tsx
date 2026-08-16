import React, { useState, useEffect } from 'react';
import { X, Sparkles, Upload, DollarSign, Box, ShieldCheck, Tag } from 'lucide-react';
import { FurnitureItem, BusinessProfile } from '../types';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: FurnitureItem) => void;
  editingItem: FurnitureItem | null;
  profile: BusinessProfile;
}

const SAMPLE_FURNITURE_IMAGES = [
  { label: 'Green Velvet Sofa', url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80' },
  { label: 'Oak Dining Table', url: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=800&q=80' },
  { label: 'Leather Armchair', url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80' },
  { label: 'Walnut Platform Bed', url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80' },
  { label: 'Modern Office Desk', url: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80' },
  { label: 'Marble Coffee Table', url: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80' },
  { label: 'Fluted Oak Sideboard', url: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80' },
  { label: 'Brass Arc Lamp', url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80' },
  { label: 'Outdoor Teak Lounge', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80' },
];

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
  profile,
}) => {
  const [formData, setFormData] = useState<Partial<FurnitureItem>>({
    name: '',
    sku: '',
    category: 'Living Room',
    material: '',
    finish: '',
    stock: 5,
    minStockAlert: 2,
    costPrice: 250,
    retailPrice: 590,
    dimensions: { width: 120, depth: 80, height: 75 },
    weightKg: 25,
    roomType: 'Living Room',
    supplier: 'Artisan Woodcrafts',
    leadTimeDays: 14,
    status: 'in_stock',
    imageUrl: SAMPLE_FURNITURE_IMAGES[0].url,
    description: '',
  });

  useEffect(() => {
    if (editingItem) {
      setFormData(editingItem);
    } else {
      // Auto generate SKU for new item
      const rand = Math.floor(100 + Math.random() * 900);
      setFormData({
        name: '',
        sku: `FURN-LIV-${rand}`,
        category: 'Living Room',
        material: 'Solid European Oak',
        finish: 'Natural Matte Hardwax',
        stock: 6,
        minStockAlert: 2,
        costPrice: 320,
        retailPrice: 790,
        dimensions: { width: 140, depth: 80, height: 75 },
        weightKg: 32,
        roomType: 'Living Room',
        supplier: 'Nordic Craft Co.',
        leadTimeDays: 14,
        status: 'in_stock',
        imageUrl: SAMPLE_FURNITURE_IMAGES[0].url,
        description: 'Handcrafted solid wood furniture piece engineered for modern living and longevity.',
      });
    }
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  const cost = Number(formData.costPrice) || 0;
  const retail = Number(formData.retailPrice) || 0;
  const profitMargin = retail > 0 ? (((retail - cost) / retail) * 100).toFixed(1) : '0';
  const profitAmt = retail - cost;

  const handleCategoryChange = (cat: any) => {
    const prefixMap: any = {
      'Living Room': 'LIV',
      'Bedroom': 'BED',
      'Dining Room': 'DIN',
      'Home Office': 'OFC',
      'Lighting & Accents': 'LGT',
      'Outdoor': 'OUT',
    };
    const code = prefixMap[cat] || 'GEN';
    const rand = Math.floor(100 + Math.random() * 900);
    setFormData(prev => ({
      ...prev,
      category: cat,
      roomType: cat,
      sku: editingItem ? prev.sku : `FURN-${code}-${rand}`,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sku) return;

    const stock = Number(formData.stock) || 0;
    const minAlert = Number(formData.minStockAlert) || 2;
    
    let status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued' = 'in_stock';
    if (stock <= 0) {
      status = 'out_of_stock';
    } else if (stock <= minAlert) {
      status = 'low_stock';
    }

    const item: FurnitureItem = {
      id: editingItem ? editingItem.id : `furn-${Date.now()}`,
      sku: formData.sku || 'FURN-001',
      name: formData.name || 'Untitled Furniture',
      category: formData.category as any || 'Living Room',
      material: formData.material || 'Solid Wood',
      finish: formData.finish || 'Natural',
      stock: stock,
      minStockAlert: minAlert,
      costPrice: cost,
      retailPrice: retail,
      dimensions: {
        width: Number(formData.dimensions?.width) || 100,
        depth: Number(formData.dimensions?.depth) || 80,
        height: Number(formData.dimensions?.height) || 75,
      },
      weightKg: Number(formData.weightKg) || 20,
      roomType: formData.roomType || formData.category || 'Living Room',
      supplier: formData.supplier || 'Standard Supplier',
      leadTimeDays: Number(formData.leadTimeDays) || 14,
      status: status,
      imageUrl: formData.imageUrl || SAMPLE_FURNITURE_IMAGES[0].url,
      description: formData.description || '',
      dateAdded: editingItem ? editingItem.dateAdded : new Date().toISOString().slice(0, 10),
    };

    onSave(item);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative my-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <Box className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-serif font-bold text-stone-900">
              {editingItem ? 'Edit Furniture Item' : 'Add New Furniture Product'}
            </h2>
            <p className="text-xs text-stone-500">
              Enter product specifications, pricing, materials, and stock threshold
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Furniture Name *
              </label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Oslo Solid White Oak 6-Seater Dining Table"
                className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                SKU / Catalog Code *
              </label>
              <input
                type="text"
                required
                value={formData.sku || ''}
                onChange={e => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                placeholder="TBL-OAK-06"
                className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={e => handleCategoryChange(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
              >
                <option value="Living Room">Living Room</option>
                <option value="Dining Room">Dining Room</option>
                <option value="Bedroom">Bedroom</option>
                <option value="Home Office">Home Office</option>
                <option value="Lighting & Accents">Lighting & Accents</option>
                <option value="Outdoor">Outdoor</option>
              </select>
            </div>
          </div>

          {/* Materials and Finishes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Primary Material & Construction
              </label>
              <input
                type="text"
                value={formData.material || ''}
                onChange={e => setFormData({ ...formData, material: e.target.value })}
                placeholder="e.g. 100% Solid European White Oak, Brass fittings"
                className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Finish / Colorway
              </label>
              <input
                type="text"
                value={formData.finish || ''}
                onChange={e => setFormData({ ...formData, finish: e.target.value })}
                placeholder="e.g. Natural Matte Hardwax Oil"
                className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Pricing & Profit Margin Preview */}
          <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
            <h3 className="text-xs font-semibold text-stone-900 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
              <DollarSign className="w-4 h-4 text-amber-700" />
              <span>Pricing & Profit Calculations</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-stone-600 mb-1">Cost Price ({profile.currency})</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={formData.costPrice}
                  onChange={e => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm bg-white font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-stone-600 mb-1">Retail Price ({profile.currency})</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={formData.retailPrice}
                  onChange={e => setFormData({ ...formData, retailPrice: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm bg-white font-bold text-stone-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex flex-col justify-center bg-white p-3 rounded-lg border border-stone-200">
                <span className="text-[11px] text-stone-500">Gross Margin</span>
                <div className="flex items-baseline space-x-2">
                  <span className={`text-lg font-bold ${Number(profitMargin) >= 40 ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {profitMargin}%
                  </span>
                  <span className="text-xs text-stone-500">
                    (+{profile.currency}{profitAmt.toFixed(0)} / unit)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stock, Alert Threshold & Dimensions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Current Stock (Units)
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.stock}
                onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm font-semibold text-stone-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Min Stock Alert Level
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.minStockAlert}
                onChange={e => setFormData({ ...formData, minStockAlert: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Dimensions (W×D×H cm)
              </label>
              <div className="grid grid-cols-3 gap-1">
                <input
                  type="number"
                  placeholder="W"
                  value={formData.dimensions?.width}
                  onChange={e => setFormData({ ...formData, dimensions: { ...formData.dimensions!, width: Number(e.target.value) } })}
                  className="px-2 py-1.5 text-xs rounded border border-stone-300"
                  title="Width in cm"
                />
                <input
                  type="number"
                  placeholder="D"
                  value={formData.dimensions?.depth}
                  onChange={e => setFormData({ ...formData, dimensions: { ...formData.dimensions!, depth: Number(e.target.value) } })}
                  className="px-2 py-1.5 text-xs rounded border border-stone-300"
                  title="Depth in cm"
                />
                <input
                  type="number"
                  placeholder="H"
                  value={formData.dimensions?.height}
                  onChange={e => setFormData({ ...formData, dimensions: { ...formData.dimensions!, height: Number(e.target.value) } })}
                  className="px-2 py-1.5 text-xs rounded border border-stone-300"
                  title="Height in cm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Weight (Kg)
              </label>
              <input
                type="number"
                min="1"
                value={formData.weightKg}
                onChange={e => setFormData({ ...formData, weightKg: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Supplier & Lead Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Supplier / Manufacturer
              </label>
              <input
                type="text"
                value={formData.supplier || ''}
                onChange={e => setFormData({ ...formData, supplier: e.target.value })}
                placeholder="e.g. Nordic Forestry Mill"
                className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Supplier Lead Time (Days)
              </label>
              <input
                type="number"
                min="1"
                value={formData.leadTimeDays || 14}
                onChange={e => setFormData({ ...formData, leadTimeDays: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Product Image Selection */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Product Image URL
            </label>
            <div className="flex items-center space-x-3 mb-3">
              <input
                type="url"
                value={formData.imageUrl || ''}
                onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 px-3.5 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
              {formData.imageUrl && (
                <img 
                  src={formData.imageUrl} 
                  alt="Preview" 
                  className="w-10 h-10 rounded-lg object-cover border border-stone-300 shadow-sm"
                  referrerPolicy="no-referrer"
                />
              )}
            </div>
            
            <div className="text-[11px] text-stone-500 mb-1.5">Or choose a preset high-resolution image:</div>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_FURNITURE_IMAGES.map((img, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setFormData({ ...formData, imageUrl: img.url })}
                  className={`text-[11px] px-2.5 py-1 rounded-md border transition-all ${
                    formData.imageUrl === img.url
                      ? 'bg-amber-600 text-white border-amber-600 font-semibold'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200'
                  }`}
                >
                  {img.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Design & Craft Description
            </label>
            <textarea
              rows={2}
              value={formData.description || ''}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detail the wood grain, craftsmanship techniques, joinery, or ergonomic design features..."
              className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Footer CTAs */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold rounded-xl shadow-md transition-all hover:scale-[1.02]"
            >
              {editingItem ? 'Save Changes' : 'Add to Inventory'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
