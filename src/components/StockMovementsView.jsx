import React, { useState } from 'react';
import { History, Search, ArrowDownRight, ArrowUpRight } from 'lucide-react';

export const StockMovementsView = ({
  movements,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');

  const filtered = movements.filter(m => {
    const matchesSearch = 
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.referenceOrderNumber && m.referenceOrderNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'All' || m.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">Inventory Stock Audit Logs</h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Immutable tracking of stock movements, automated sales decrements, and warehouse restocks
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search stock logs by SKU, product name, PO note, or Order number..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 text-stone-700 font-medium"
          >
            <option value="All">All Movement Types</option>
            <option value="sale">Customer Sales (Outflow)</option>
            <option value="restock">Shipment Restocks (Inflow)</option>
            <option value="adjustment">Manual Adjustments</option>
            <option value="return">Customer Returns</option>
          </select>
        </div>
      </div>

      {/* Movements Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-500 uppercase text-[10px] tracking-wider font-semibold border-b border-stone-200">
              <tr>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Item & SKU</th>
                <th className="py-3.5 px-4 text-center">Qty Change</th>
                <th className="py-3.5 px-4 text-center">Stock Before &rarr; After</th>
                <th className="py-3.5 px-4">Reason / Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400">
                    <History className="w-8 h-8 mx-auto text-stone-300 mb-2" />
                    No movement records match your search criteria.
                  </td>
                </tr>
              ) : (
                filtered.map(mov => {
                  const isPositive = mov.quantityChange > 0;
                  return (
                    <tr key={mov.id} className="hover:bg-stone-50">
                      <td className="py-3 px-4 whitespace-nowrap text-stone-500">
                        {new Date(mov.date).toLocaleString(undefined, { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          mov.type === 'sale' ? 'bg-amber-100 text-amber-900' :
                          mov.type === 'restock' ? 'bg-emerald-100 text-emerald-900' :
                          mov.type === 'return' ? 'bg-blue-100 text-blue-900' :
                          'bg-stone-100 text-stone-700'
                        }`}>
                          {mov.type}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-stone-900">{mov.name}</div>
                        <div className="text-[10px] text-stone-400 font-mono">{mov.sku}</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center space-x-0.5 font-bold font-mono text-xs ${
                          isPositive ? 'text-emerald-700' : 'text-amber-800'
                        }`}>
                          {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                          <span>{isPositive ? `+${mov.quantityChange}` : mov.quantityChange}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-stone-600">
                        <span>{mov.previousStock}</span>
                        <span className="text-stone-400 mx-1">&rarr;</span>
                        <span className="font-bold text-stone-900">{mov.newStock}</span>
                      </td>
                      <td className="py-3 px-4 text-stone-700">
                        <div>{mov.reason}</div>
                        {mov.referenceOrderNumber && (
                          <div className="text-[10px] text-amber-800 font-mono mt-0.5">
                            Ref: {mov.referenceOrderNumber}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
