import React from 'react';
import { 
  DollarSign, 
  Package, 
  AlertCircle, 
  Truck, 
  ArrowUpRight, 
  ShoppingCart,
  Boxes,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell
} from 'recharts';

const CATEGORY_COLORS = ['#d97706', '#059669', '#2563eb', '#7c3aed', '#db2777', '#4b5563'];

export const DashboardOverview = ({
  inventory,
  orders,
  profile,
  onNavigateToInventory,
  onNavigateToSales,
  onNavigateToPOS,
  onOpenRestockModal,
  onViewOrderInvoice,
}) => {
  // Aggregate KPIs
  const totalRevenue = orders.reduce((sum, o) => sum + (o.orderStatus !== 'cancelled' ? o.total : 0), 0);
  const totalProfit = orders.reduce((sum, o) => sum + (o.orderStatus !== 'cancelled' ? o.profit : 0), 0);
  const profitMarginPct = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0';

  const totalStockUnits = inventory.reduce((sum, i) => sum + i.stock, 0);
  const inventoryCostValue = inventory.reduce((sum, i) => sum + (i.stock * i.costPrice), 0);
  const inventoryRetailValue = inventory.reduce((sum, i) => sum + (i.stock * i.retailPrice), 0);
  
  const lowStockItems = inventory.filter(i => i.stock <= i.minStockAlert && i.status !== 'discontinued');
  const activeDeliveries = orders.filter(o => o.orderStatus === 'in_transit' || o.orderStatus === 'scheduled');

  // Chart Data: Monthly Performance
  const monthlyData = [
    { month: 'Apr', sales: 14200, profit: 8100 },
    { month: 'May', sales: 18900, profit: 10400 },
    { month: 'Jun', sales: 22400, profit: 12800 },
    { month: 'Jul', sales: 19800, profit: 11200 },
    { month: 'Aug', sales: Math.max(16500, Math.round(totalRevenue)), profit: Math.max(9200, Math.round(totalProfit)) },
  ];

  // Category breakdown data
  const categoryMap = {};
  orders.forEach(ord => {
    if (ord.orderStatus === 'cancelled') return;
    ord.items.forEach(item => {
      const found = inventory.find(i => i.id === item.furnitureId);
      const cat = found ? found.category : 'Living Room';
      categoryMap[cat] = (categoryMap[cat] || 0) + item.total;
    });
  });

  const categoryPieData = Object.keys(categoryMap).map(cat => ({
    name: cat,
    value: categoryMap[cat],
  }));

  // Top selling products
  const productSalesMap = {};
  orders.forEach(ord => {
    if (ord.orderStatus === 'cancelled') return;
    ord.items.forEach(item => {
      if (!productSalesMap[item.furnitureId]) {
        productSalesMap[item.furnitureId] = {
          name: item.name,
          count: 0,
          revenue: 0,
          image: item.imageUrl,
          sku: item.sku,
        };
      }
      productSalesMap[item.furnitureId].count += item.quantity;
      productSalesMap[item.furnitureId].revenue += item.total;
    });
  });

  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 4);

  // Recent 5 orders
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner / Business Header */}
      <div className="bg-stone-900 rounded-2xl p-6 sm:p-8 text-stone-100 shadow-xl border border-stone-800 relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real-time Retail Overview</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-50 tracking-tight">
              {profile.storeName}
            </h1>
            <p className="text-stone-300 text-sm mt-1 leading-relaxed">
              {profile.tagline}. Managing <span className="font-semibold text-amber-300">{inventory.length} furniture items</span> across showroom and warehouse storage.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onNavigateToPOS}
              className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold px-4 py-2.5 rounded-xl text-sm flex items-center space-x-2 shadow-lg shadow-amber-950/40 transition-all hover:scale-105"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Point of Sale Terminal</span>
            </button>
            <button
              onClick={onNavigateToInventory}
              className="bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-medium px-4 py-2.5 rounded-xl text-sm flex items-center space-x-2 transition-colors"
            >
              <Boxes className="w-4 h-4 text-amber-400" />
              <span>Manage Catalog</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Revenue */}
        <div className="bg-white rounded-xl p-5 border border-stone-200 shadow-sm hover:border-amber-400/60 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Total Sales Revenue</span>
            <div className="p-2 bg-amber-50 rounded-lg text-amber-700">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
              {profile.currency}{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex items-center space-x-1.5 mt-1.5 text-xs text-emerald-700 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{profitMarginPct}% profit margin</span>
              <span className="text-stone-400">({profile.currency}{totalProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })} net)</span>
            </div>
          </div>
        </div>

        {/* Inventory Stock Count & Valuation */}
        <div className="bg-white rounded-xl p-5 border border-stone-200 shadow-sm hover:border-amber-400/60 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Inventory In Stock</span>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-700">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
              {totalStockUnits} <span className="text-base font-normal text-stone-500">units</span>
            </div>
            <div className="mt-1.5 text-xs text-stone-600">
              <span>Valuation: </span>
              <span className="font-semibold text-stone-900">{profile.currency}{inventoryRetailValue.toLocaleString()}</span>
              <span className="text-stone-400 text-[11px] ml-1">({profile.currency}{inventoryCostValue.toLocaleString()} cost)</span>
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div 
          onClick={onNavigateToInventory}
          className={`rounded-xl p-5 border shadow-sm cursor-pointer transition-all ${
            lowStockItems.length > 0
              ? 'bg-amber-50/70 border-amber-300 hover:bg-amber-50'
              : 'bg-white border-stone-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider">Low Stock Alerts</span>
            <div className={`p-2 rounded-lg ${lowStockItems.length > 0 ? 'bg-amber-500 text-white' : 'bg-stone-100 text-stone-500'}`}>
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
              {lowStockItems.length} <span className="text-base font-normal text-stone-500">items</span>
            </div>
            <p className="mt-1.5 text-xs text-amber-800 font-medium">
              {lowStockItems.length > 0 ? 'Requires reorder attention' : 'All stock levels healthy'}
            </p>
          </div>
        </div>

        {/* Active Deliveries & Assembly */}
        <div 
          onClick={onNavigateToSales}
          className="bg-white rounded-xl p-5 border border-stone-200 shadow-sm hover:border-amber-400/60 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Active Deliveries</span>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
              {activeDeliveries.length} <span className="text-base font-normal text-stone-500">orders</span>
            </div>
            <p className="mt-1.5 text-xs text-stone-600">
              Scheduled & in-transit shipments
            </p>
          </div>
        </div>
      </div>

      {/* Critical Reorder Alert Box (if any items low) */}
      {lowStockItems.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500 text-white rounded-lg flex-shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-amber-950">
                Low Inventory Warning ({lowStockItems.length} Products Below Reorder Threshold)
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                {lowStockItems.map(i => `${i.name} (${i.stock} left)`).join(' • ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenRestockModal(lowStockItems[0])}
            className="whitespace-nowrap px-3.5 py-1.5 bg-amber-700 hover:bg-amber-800 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
          >
            Quick Restock {lowStockItems[0].name.split(' ')[0]}
          </button>
        </div>
      )}

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales & Profit Trend */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif font-bold text-stone-900 text-base">Revenue & Gross Profit Performance</h3>
              <p className="text-xs text-stone-500">Monthly furniture retail trajectory</p>
            </div>
            <div className="flex items-center space-x-4 text-xs font-medium">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-sm bg-amber-500 inline-block" />
                <span className="text-stone-700">Gross Sales</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-sm bg-emerald-600 inline-block" />
                <span className="text-stone-700">Net Profit</span>
              </div>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0ece6" />
                <XAxis dataKey="month" stroke="#78716c" fontSize={12} tickLine={false} />
                <YAxis stroke="#78716c" fontSize={12} tickFormatter={(val) => `$${val / 1000}k`} tickLine={false} />
                <Tooltip 
                  formatter={(val) => [`${profile.currency}${Number(val).toLocaleString()}`, '']}
                  contentStyle={{ backgroundColor: '#1c1917', borderColor: '#292524', borderRadius: '8px', color: '#f5f5f4', fontSize: '12px' }}
                  itemStyle={{ color: '#fed7aa' }}
                />
                <Area type="monotone" dataKey="sales" name="Sales" stroke="#d97706" strokeWidth={2.5} fillOpacity={1} fill="url(#salesGrad)" />
                <Area type="monotone" dataKey="profit" name="Profit" stroke="#059669" strokeWidth={2.5} fillOpacity={1} fill="url(#profitGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Sales Distribution */}
        <div className="bg-white rounded-xl p-5 border border-stone-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-serif font-bold text-stone-900 text-base">Sales by Category</h3>
            <p className="text-xs text-stone-500">Revenue split across room collections</p>
          </div>

          <div className="h-56 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryPieData.length > 0 ? categoryPieData : [{ name: 'Living Room', value: 100 }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val) => [`${profile.currency}${Number(val).toLocaleString()}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#1c1917', borderColor: '#292524', borderRadius: '8px', color: '#f5f5f4', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-stone-100">
            {categoryPieData.map((item, idx) => (
              <div key={item.name} className="flex items-center space-x-1.5">
                <span 
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }} 
                />
                <span className="text-stone-600 truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two-Column Lower Section: Top Products & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Furniture Pieces */}
        <div className="bg-white rounded-xl p-5 border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif font-bold text-stone-900 text-base">Top Selling Pieces</h3>
              <p className="text-xs text-stone-500">Highest grossing catalog items</p>
            </div>
            <button 
              onClick={onNavigateToInventory}
              className="text-xs text-amber-700 hover:text-amber-800 font-semibold flex items-center space-x-1"
            >
              <span>View Catalog</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {topProducts.map((prod, i) => (
              <div key={prod.name} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-stone-50 border border-stone-100 transition-colors">
                <div className="flex items-center space-x-3 min-w-0">
                  <span className="text-xs font-bold text-stone-400 w-4">{i + 1}</span>
                  <img 
                    src={prod.image} 
                    alt={prod.name}
                    className="w-12 h-12 rounded-lg object-cover border border-stone-200 flex-shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-stone-900 truncate">{prod.name}</h4>
                    <p className="text-xs text-stone-500">{prod.sku} • {prod.count} units sold</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <span className="text-sm font-bold text-stone-900">
                    {profile.currency}{prod.revenue.toLocaleString()}
                  </span>
                  <span className="block text-[11px] text-emerald-600 font-medium">In demand</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders & Delivery Tracking */}
        <div className="bg-white rounded-xl p-5 border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif font-bold text-stone-900 text-base">Recent Sales & Deliveries</h3>
              <p className="text-xs text-stone-500">Latest customer orders</p>
            </div>
            <button 
              onClick={onNavigateToSales}
              className="text-xs text-amber-700 hover:text-amber-800 font-semibold flex items-center space-x-1"
            >
              <span>All Orders ({orders.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentOrders.map(order => (
              <div 
                key={order.id}
                onClick={() => onViewOrderInvoice(order)}
                className="p-3 rounded-lg border border-stone-100 hover:border-amber-300 hover:bg-stone-50/80 transition-all cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-stone-900">{order.orderNumber}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      order.orderStatus === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                      order.orderStatus === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                      order.orderStatus === 'scheduled' ? 'bg-amber-100 text-amber-800' :
                      'bg-stone-100 text-stone-800'
                    }`}>
                      {order.orderStatus.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mt-0.5 truncate">
                    {order.customer.name} • {order.items.length} item(s) ({order.deliveryType.replace('_', ' ')})
                  </p>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-bold text-stone-900">
                    {profile.currency}{order.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[11px] text-stone-400">
                    {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
