import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  LayoutGrid, 
  Table as TableIcon, 
  Truck, 
  Edit, 
  Trash2, 
  Tag, 
  PlusCircle, 
  MinusCircle, 
  Download, 
  Box 
} from 'lucide-react';

export const InventoryManager = ({
  inventory,
  profile,
  onAddProduct,
  onEditProduct,
  onRestockProduct,
  onPrintTag,
  onDeleteProduct,
  onQuickStockChange,
  onExportCSV,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');

  const categories = ['All', 'Living Room', 'Dining Room', 'Bedroom', 'Home Office', 'Lighting & Accents', 'Outdoor'];

  // Filtered and sorted inventory
  const filteredInventory = inventory
    .filter(item => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplier.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;

      let matchesStatus = true;
      if (selectedStatus === 'in_stock') matchesStatus = item.stock > item.minStockAlert;
      else if (selectedStatus === 'low_stock') matchesStatus = item.stock > 0 && item.stock <= item.minStockAlert;
      else if (selectedStatus === 'out_of_stock') matchesStatus = item.stock === 0;

      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'stock_asc') return a.stock - b.stock;
      if (sortBy === 'stock_desc') return b.stock - a.stock;
      if (sortBy === 'price_desc') return b.retailPrice - a.retailPrice;
      if (sortBy === 'margin_desc') {
        const marginA = (a.retailPrice - a.costPrice) / a.retailPrice;
        const marginB = (b.retailPrice - b.costPrice) / b.retailPrice;
        return marginB - marginA;
      }
      return 0;
    });

  const lowStockCount = inventory.filter(i => i.stock <= i.minStockAlert).length;
  const outOfStockCount = inventory.filter(i => i.stock === 0).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Quick Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">Furniture Inventory</h1>
          <p className="text-xs text-stone-500 mt-0.5">
            {inventory.length} total products in catalog • {lowStockCount} low stock alerts
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={onExportCSV}
            className="px-3.5 py-2 text-xs font-medium bg-white text-stone-700 hover:bg-stone-50 border border-stone-300 rounded-xl flex items-center space-x-1.5 shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-stone-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onAddProduct}
            className="px-4 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-xl flex items-center space-x-1.5 shadow-md shadow-amber-950/20 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Add Furniture Item</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by furniture name, SKU, material, wood type, or supplier..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          {/* Status & Sort Controls */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
            >
              <option value="All">All Stock Levels</option>
              <option value="in_stock">Healthy Stock</option>
              <option value="low_stock">⚠️ Low Stock Alerts ({lowStockCount})</option>
              <option value="out_of_stock">🚫 Out of Stock ({outOfStockCount})</option>
            </select>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
            >
              <option value="name">Sort: Name (A-Z)</option>
              <option value="stock_asc">Sort: Stock (Lowest First)</option>
              <option value="stock_desc">Sort: Stock (Highest First)</option>
              <option value="price_desc">Sort: Retail Price (High to Low)</option>
              <option value="margin_desc">Sort: Profit Margin %</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'}`}
                title="Grid Card View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'}`}
                title="Data Table View"
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pt-1 pb-1 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-stone-900 text-stone-100 shadow-xs font-semibold'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* No Results state */}
      {filteredInventory.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 shadow-sm">
          <Box className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-stone-800">No furniture items match your filter</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms, changing the category, or adding a new furniture item.
          </p>
          <button
            onClick={() => { setSearchTerm(''); setSelectedCategory('All'); setSelectedStatus('All'); }}
            className="mt-4 px-4 py-2 bg-amber-600 text-white text-xs font-medium rounded-lg"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* GRID VIEW */}
      {viewMode === 'grid' && filteredInventory.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredInventory.map(item => {
            const isLowStock = item.stock <= item.minStockAlert && item.stock > 0;
            const isOutOfStock = item.stock === 0;
            const profitMargin = (((item.retailPrice - item.costPrice) / item.retailPrice) * 100).toFixed(0);

            return (
              <div 
                key={item.id}
                className={`bg-white rounded-2xl overflow-hidden border transition-all flex flex-col justify-between hover:shadow-md ${
                  isOutOfStock ? 'border-red-300 bg-red-50/10' :
                  isLowStock ? 'border-amber-300 bg-amber-50/10' :
                  'border-stone-200 hover:border-amber-300'
                }`}
              >
                {/* Image & Badges */}
                <div className="relative h-48 bg-stone-100 overflow-hidden group">
                  <img 
                    src={item.imageUrl} 
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Category Pill */}
                  <span className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-md text-amber-300 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                    {item.category}
                  </span>

                  {/* Stock Alert Badge */}
                  <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm ${
                    isOutOfStock ? 'bg-red-600 text-white animate-pulse' :
                    isLowStock ? 'bg-amber-500 text-stone-950 font-bold' :
                    'bg-emerald-600/90 text-white backdrop-blur-sm'
                  }`}>
                    {isOutOfStock ? 'Out of Stock' : `${item.stock} in stock`}
                  </span>

                  {/* Quick Action Overlay on Hover */}
                  <div className="absolute inset-0 bg-stone-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2 p-4">
                    <button
                      onClick={() => onPrintTag(item)}
                      className="p-2 bg-white text-stone-900 rounded-lg hover:bg-stone-100 shadow-md transition-transform hover:scale-110"
                      title="Showroom Price Tag"
                    >
                      <Tag className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEditProduct(item)}
                      className="p-2 bg-white text-stone-900 rounded-lg hover:bg-stone-100 shadow-md transition-transform hover:scale-110"
                      title="Edit Specifications"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onRestockProduct(item)}
                      className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 shadow-md transition-transform hover:scale-110"
                      title="Incoming Restock"
                    >
                      <Truck className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs text-stone-400 font-mono">
                      <span>{item.sku}</span>
                      <span className="text-[11px] text-emerald-700 font-semibold">{profitMargin}% margin</span>
                    </div>
                    
                    <h3 className="font-serif font-bold text-stone-900 text-sm mt-1 leading-snug line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">
                      {item.material}
                    </p>
                  </div>

                  {/* Specs Pill info */}
                  <div className="grid grid-cols-2 gap-1.5 py-2 border-y border-stone-100 text-[11px] text-stone-600">
                    <div>
                      <span className="text-stone-400 block text-[10px]">Dimensions:</span>
                      <span className="font-medium">{item.dimensions.width}×{item.dimensions.depth}×{item.dimensions.height} cm</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px]">Supplier:</span>
                      <span className="font-medium truncate block">{item.supplier}</span>
                    </div>
                  </div>

                  {/* Pricing & Stock Adjuster */}
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase font-semibold block">Retail</span>
                      <span className="text-base font-bold font-serif text-stone-900">
                        {profile.currency}{item.retailPrice.toLocaleString()}
                      </span>
                    </div>

                    {/* Fast Stock Stepper */}
                    <div className="flex items-center space-x-1.5 bg-stone-100 p-1 rounded-lg border border-stone-200">
                      <button
                        onClick={() => onQuickStockChange(item.id, -1)}
                        disabled={item.stock <= 0}
                        className="p-1 text-stone-600 hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-stone-200 rounded"
                        title="Reduce stock by 1"
                      >
                        <MinusCircle className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-bold text-xs text-stone-800 w-5 text-center">{item.stock}</span>
                      <button
                        onClick={() => onQuickStockChange(item.id, 1)}
                        className="p-1 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded"
                        title="Increase stock by 1"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Footer Action buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      onClick={() => onRestockProduct(item)}
                      className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1 transition-colors"
                    >
                      <Truck className="w-3 h-3 text-stone-600" />
                      <span>Restock</span>
                    </button>

                    <button
                      onClick={() => onEditProduct(item)}
                      className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1 transition-colors"
                    >
                      <Edit className="w-3 h-3 text-amber-700" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === 'table' && filteredInventory.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-600">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Item & SKU</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Material & Dimensions</th>
                  <th className="py-3.5 px-4 text-center">Stock / Alert</th>
                  <th className="py-3.5 px-4">Cost</th>
                  <th className="py-3.5 px-4">Retail Price</th>
                  <th className="py-3.5 px-4">Margin %</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredInventory.map(item => {
                  const isLow = item.stock <= item.minStockAlert && item.stock > 0;
                  const isOut = item.stock === 0;
                  const marginPct = (((item.retailPrice - item.costPrice) / item.retailPrice) * 100).toFixed(1);

                  return (
                    <tr key={item.id} className="hover:bg-stone-50/80 transition-colors">
                      {/* Name & Photo */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={item.imageUrl} 
                            alt={item.name} 
                            className="w-10 h-10 rounded-lg object-cover border border-stone-200 flex-shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0">
                            <div className="font-semibold text-stone-900 text-xs truncate max-w-xs">{item.name}</div>
                            <div className="text-[10px] text-stone-400 font-mono">{item.sku}</div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 text-[11px] font-medium">
                          {item.category}
                        </span>
                      </td>

                      {/* Material & Dims */}
                      <td className="py-3 px-4">
                        <div className="truncate max-w-[180px] text-stone-800">{item.material}</div>
                        <div className="text-[10px] text-stone-400">
                          {item.dimensions.width}×{item.dimensions.depth}×{item.dimensions.height} cm
                        </div>
                      </td>

                      {/* Stock Level & Quick Adjust */}
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => onQuickStockChange(item.id, -1)}
                            disabled={item.stock <= 0}
                            className="p-1 text-stone-400 hover:text-stone-800 disabled:opacity-20"
                          >
                            <MinusCircle className="w-3.5 h-3.5" />
                          </button>
                          
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            isOut ? 'bg-red-100 text-red-800' :
                            isLow ? 'bg-amber-100 text-amber-800' :
                            'bg-emerald-50 text-emerald-800'
                          }`}>
                            {item.stock}
                          </span>

                          <button
                            onClick={() => onQuickStockChange(item.id, 1)}
                            className="p-1 text-stone-400 hover:text-stone-800"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-center text-[10px] text-stone-400 mt-0.5">
                          min alert: {item.minStockAlert}
                        </div>
                      </td>

                      {/* Cost */}
                      <td className="py-3 px-4 font-mono text-stone-600">
                        {profile.currency}{item.costPrice.toFixed(2)}
                      </td>

                      {/* Retail Price */}
                      <td className="py-3 px-4 font-semibold text-stone-900 font-mono">
                        {profile.currency}{item.retailPrice.toFixed(2)}
                      </td>

                      {/* Margin */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-emerald-700">{marginPct}%</span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => onPrintTag(item)}
                            className="p-1.5 hover:bg-stone-100 rounded text-stone-500 hover:text-stone-900"
                            title="Showroom Tag"
                          >
                            <Tag className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onRestockProduct(item)}
                            className="p-1.5 hover:bg-emerald-50 rounded text-emerald-700 hover:text-emerald-800"
                            title="Restock"
                          >
                            <Truck className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onEditProduct(item)}
                            className="p-1.5 hover:bg-amber-50 rounded text-amber-700 hover:text-amber-800"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete ${item.name} from catalog?`)) {
                                onDeleteProduct(item.id);
                              }
                            }}
                            className="p-1.5 hover:bg-red-50 rounded text-red-500 hover:text-red-700"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
