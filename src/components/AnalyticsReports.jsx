import React from 'react';
import { 
  Download, 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

const PALETTE = ['#d97706', '#059669', '#2563eb', '#7c3aed', '#db2777', '#ca8a04', '#0d9488'];

export const AnalyticsReports = ({
  inventory,
  orders,
  profile,
  onExportSalesCSV,
  onExportInventoryCSV,
}) => {
  const activeOrders = orders.filter(o => o.orderStatus !== 'cancelled');

  const totalRevenue = activeOrders.reduce((sum, o) => sum + o.total, 0);
  const totalCogs = activeOrders.reduce((sum, o) => sum + o.costTotal, 0);
  const totalProfit = activeOrders.reduce((sum, o) => sum + o.profit, 0);
  const overallMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0';
  const averageOrderValue = activeOrders.length > 0 ? (totalRevenue / activeOrders.length).toFixed(2) : '0';

  // Category sales aggregations
  const catRevenueMap = {};
  activeOrders.forEach(ord => {
    ord.items.forEach(item => {
      const found = inventory.find(i => i.id === item.furnitureId);
      const cat = found ? found.category : 'Living Room';
      if (!catRevenueMap[cat]) catRevenueMap[cat] = { revenue: 0, units: 0, profit: 0 };
      catRevenueMap[cat].revenue += item.total;
      catRevenueMap[cat].units += item.quantity;
      catRevenueMap[cat].profit += (item.total - (item.costPrice * item.quantity));
    });
  });

  const categoryBarData = Object.keys(catRevenueMap).map(cat => ({
    category: cat,
    Revenue: Math.round(catRevenueMap[cat].revenue),
    Profit: Math.round(catRevenueMap[cat].profit),
  }));

  // Material popularity split
  const materialMap = {};
  activeOrders.forEach(ord => {
    ord.items.forEach(item => {
      let simpleMat = 'Solid Oak';
      const m = item.material.toLowerCase();
      if (m.includes('oak')) simpleMat = 'White Oak';
      else if (m.includes('walnut')) simpleMat = 'Solid Walnut';
      else if (m.includes('leather')) simpleMat = 'Italian Leather';
      else if (m.includes('velvet')) simpleMat = 'Velvet Fabric';
      else if (m.includes('teak')) simpleMat = 'Teak Timber';
      else if (m.includes('marble')) simpleMat = 'Carrara Marble';
      else if (m.includes('brass')) simpleMat = 'Solid Brass';
      materialMap[simpleMat] = (materialMap[simpleMat] || 0) + item.total;
    });
  });

  const materialPieData = Object.keys(materialMap).map(mat => ({
    name: mat,
    value: materialMap[mat],
  }));

  // Velocity / Fast Moving vs Slow Moving
  const itemSoldCounts = {};
  activeOrders.forEach(ord => {
    ord.items.forEach(i => {
      itemSoldCounts[i.furnitureId] = (itemSoldCounts[i.furnitureId] || 0) + i.quantity;
    });
  });

  const rankedItems = inventory.map(item => ({
    ...item,
    unitsSold: itemSoldCounts[item.id] || 0,
    turnoverVelocity: (itemSoldCounts[item.id] || 0) > 2 ? 'Fast Moving' : (itemSoldCounts[item.id] || 0) > 0 ? 'Steady' : 'Low Velocity',
  })).sort((a, b) => b.unitsSold - a.unitsSold);

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Export CTAs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">Financial & Inventory Analytics</h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Holistic performance breakdown of woodcraft collections, margins, and sales velocity
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onExportSalesCSV}
            className="px-3.5 py-2 text-xs font-medium bg-white text-stone-700 hover:bg-stone-50 border border-stone-300 rounded-xl flex items-center space-x-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Sales Report (CSV)</span>
          </button>

          <button
            onClick={onExportInventoryCSV}
            className="px-3.5 py-2 text-xs font-medium bg-amber-600 hover:bg-amber-500 text-white rounded-xl flex items-center space-x-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Valuation Report (CSV)</span>
          </button>
        </div>
      </div>

      {/* High-Level Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-stone-200 shadow-sm">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Gross Sales Volume</div>
          <div className="text-2xl font-serif font-bold text-stone-900 mt-2">
            {profile.currency}{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-stone-500 mt-1">{activeOrders.length} confirmed sales</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-stone-200 shadow-sm">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Cost of Goods (COGS)</div>
          <div className="text-2xl font-serif font-bold text-stone-900 mt-2">
            {profile.currency}{totalCogs.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-stone-500 mt-1">Raw manufacturing & supplier costs</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-stone-200 shadow-sm">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Net Gross Margin</div>
          <div className="text-2xl font-serif font-bold text-emerald-700 mt-2">
            {overallMargin}%
          </div>
          <p className="text-xs text-emerald-800 mt-1">+{profile.currency}{totalProfit.toLocaleString()} net profit</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-stone-200 shadow-sm">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Average Order Value</div>
          <div className="text-2xl font-serif font-bold text-stone-900 mt-2">
            {profile.currency}{Number(averageOrderValue).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-stone-500 mt-1">Per customer transaction</p>
        </div>
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Revenue vs Profit Bar Chart */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif font-bold text-stone-900 text-base">Revenue & Profit by Room Collection</h3>
              <p className="text-xs text-stone-500">Comparing gross intake vs net margins</p>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center space-x-1">
                <span className="w-3 h-3 rounded-sm bg-amber-600" />
                <span className="text-stone-600">Revenue</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-3 h-3 rounded-sm bg-emerald-600" />
                <span className="text-stone-600">Profit</span>
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryBarData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0ece6" />
                <XAxis dataKey="category" stroke="#78716c" fontSize={11} angle={-15} textAnchor="end" />
                <YAxis stroke="#78716c" fontSize={11} tickFormatter={(v) => `$${v}`} />
                <Tooltip 
                  formatter={(val) => [`${profile.currency}${Number(val).toLocaleString()}`, '']}
                  contentStyle={{ backgroundColor: '#1c1917', borderColor: '#292524', borderRadius: '8px', color: '#f5f5f4', fontSize: '12px' }}
                />
                <Bar dataKey="Revenue" fill="#d97706" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Profit" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Material Popularity Donut */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-serif font-bold text-stone-900 text-base">Sales by Material / Finish</h3>
            <p className="text-xs text-stone-500">Customer preference across timber & upholstery types</p>
          </div>

          <div className="h-60 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={materialPieData.length > 0 ? materialPieData : [{ name: 'Solid Oak', value: 100 }]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {materialPieData.map((entry, index) => (
                    <Cell key={`mat-${index}`} fill={PALETTE[index % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val) => [`${profile.currency}${Number(val).toLocaleString()}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#1c1917', borderColor: '#292524', borderRadius: '8px', color: '#f5f5f4', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-2 border-t border-stone-100">
            {materialPieData.map((m, idx) => (
              <div key={m.name} className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PALETTE[idx % PALETTE.length] }} />
                <span className="text-stone-600 truncate">{m.name}: {profile.currency}{m.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Inventory Velocity Ranking Table */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-serif font-bold text-stone-900 text-base">Furniture Inventory Velocity & Health</h3>
            <p className="text-xs text-stone-500">Sales velocity tracking to optimize reorder cycles</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-500 uppercase text-[10px] tracking-wider font-semibold border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">Item & SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">In Stock</th>
                <th className="py-3 px-4 text-center">Units Sold</th>
                <th className="py-3 px-4">Velocity Tier</th>
                <th className="py-3 px-4 text-right">Inventory Asset Value (Cost)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {rankedItems.map(item => (
                <tr key={item.id} className="hover:bg-stone-50">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-stone-900">{item.name}</div>
                    <div className="text-[10px] text-stone-400 font-mono">{item.sku}</div>
                  </td>
                  <td className="py-3 px-4 text-stone-600">{item.category}</td>
                  <td className="py-3 px-4 text-center font-bold text-stone-900">{item.stock}</td>
                  <td className="py-3 px-4 text-center font-bold text-amber-800">{item.unitsSold}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.turnoverVelocity === 'Fast Moving' ? 'bg-emerald-100 text-emerald-800' :
                      item.turnoverVelocity === 'Steady' ? 'bg-blue-100 text-blue-800' :
                      'bg-stone-100 text-stone-600'
                    }`}>
                      {item.turnoverVelocity}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-medium text-stone-800">
                    {profile.currency}{(item.stock * item.costPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
