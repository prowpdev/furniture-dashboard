import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle2, 
  FileText, 
  Package, 
  AlertCircle,
  Download
} from 'lucide-react';

export const SalesManager = ({
  inventory,
  orders,
  profile,
  activeSubTab,
  setActiveSubTab,
  onCompleteSale,
  onUpdateOrderStatus,
  onViewInvoice,
  onExportOrdersCSV,
}) => {
  // POS State
  const [catalogSearch, setCatalogSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState([]);
  
  // Customer details in POS
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [city] = useState('Portland');
  const [postalCode] = useState('97201');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [deliveryType, setDeliveryType] = useState('white_glove');
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().slice(0, 10);
  });
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [posError, setPosError] = useState(null);

  // Orders List State
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');

  const categories = ['All', 'Living Room', 'Dining Room', 'Bedroom', 'Home Office', 'Lighting & Accents', 'Outdoor'];

  // Filter catalog for POS
  const filteredCatalog = inventory.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      item.sku.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      item.material.toLowerCase().includes(catalogSearch.toLowerCase());
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Cart operations
  const addToCart = (item) => {
    setPosError(null);
    if (item.stock <= 0) {
      setPosError(`${item.name} is currently out of stock.`);
      return;
    }

    setCart(prev => {
      const existing = prev.find(i => i.furnitureId === item.id);
      if (existing) {
        if (existing.quantity >= item.stock) {
          setPosError(`Cannot add more: only ${item.stock} unit(s) available in inventory.`);
          return prev;
        }
        return prev.map(i => i.furnitureId === item.id 
          ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.unitPrice }
          : i
        );
      } else {
        const newItem = {
          furnitureId: item.id,
          sku: item.sku,
          name: item.name,
          material: item.material,
          quantity: 1,
          unitPrice: item.retailPrice,
          costPrice: item.costPrice,
          total: item.retailPrice,
          imageUrl: item.imageUrl,
        };
        return [...prev, newItem];
      }
    });
  };

  const updateCartQuantity = (furnitureId, newQty) => {
    setPosError(null);
    const item = inventory.find(i => i.id === furnitureId);
    if (!item) return;

    if (newQty <= 0) {
      removeFromCart(furnitureId);
      return;
    }

    if (newQty > item.stock) {
      setPosError(`Maximum available stock for ${item.name} is ${item.stock}.`);
      return;
    }

    setCart(prev => prev.map(i => i.furnitureId === furnitureId 
      ? { ...i, quantity: newQty, total: newQty * i.unitPrice }
      : i
    ));
  };

  const removeFromCart = (furnitureId) => {
    setCart(prev => prev.filter(i => i.furnitureId !== furnitureId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscountAmount(0);
    setPosError(null);
  };

  // Pricing calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const cartCostTotal = cart.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0);
  
  const deliveryFee = 
    deliveryType === 'pickup' ? 0 :
    deliveryType === 'white_glove' ? profile.whiteGloveFee :
    profile.standardShippingFee;

  const taxableAmount = Math.max(0, cartSubtotal - discountAmount);
  const taxAmount = Number((taxableAmount * profile.taxRate).toFixed(2));
  const cartTotal = Number((taxableAmount + taxAmount + deliveryFee).toFixed(2));
  const orderProfit = Number((cartTotal - cartCostTotal - taxAmount).toFixed(2));

  // Process and finalize sale
  const handleProcessSale = (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      setPosError('Please add at least one furniture item to the sale.');
      return;
    }
    if (!customerName || !customerPhone) {
      setPosError('Please provide customer name and phone number for delivery/order coordination.');
      return;
    }

    // Verify stock availability
    for (const cartItem of cart) {
      const stockItem = inventory.find(i => i.id === cartItem.furnitureId);
      if (!stockItem || stockItem.stock < cartItem.quantity) {
        setPosError(`Stock error: ${cartItem.name} does not have sufficient units in stock.`);
        return;
      }
    }

    const orderNum = `NORD-2026-${Math.floor(1050 + orders.length + Math.random() * 100)}`;
    const newOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      customer: {
        name: customerName,
        phone: customerPhone,
        email: customerEmail || `${customerName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        deliveryAddress: deliveryAddress || 'Showroom Self-Pickup',
        city: city || 'Portland',
        postalCode: postalCode || '97201',
        deliveryNotes: deliveryNotes,
      },
      items: [...cart],
      subtotal: cartSubtotal,
      discount: discountAmount,
      taxRate: profile.taxRate,
      taxAmount: taxAmount,
      deliveryType: deliveryType,
      deliveryFee: deliveryFee,
      total: cartTotal,
      costTotal: cartCostTotal,
      profit: orderProfit,
      paymentMethod: paymentMethod,
      paymentStatus: 'paid',
      orderStatus: deliveryType === 'pickup' ? 'processing' : 'scheduled',
      deliveryDate: deliveryDate,
      notes: deliveryNotes,
      createdAt: new Date().toISOString(),
    };

    onCompleteSale(newOrder);
    
    // Reset Form
    clearCart();
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setDeliveryAddress('');
    setDeliveryNotes('');
    setPosError(null);
  };

  // Orders list filter
  const filteredOrders = orders.filter(ord => {
    const matchesSearch = 
      ord.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
      ord.customer.name.toLowerCase().includes(orderSearch.toLowerCase()) ||
      ord.customer.phone.includes(orderSearch);
    const matchesStatus = orderStatusFilter === 'All' || ord.orderStatus === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Sub-navigation tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">
            {activeSubTab === 'pos' ? 'Point of Sale (POS) Terminal' : 'Sales & Orders Fulfillment'}
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            {activeSubTab === 'pos' 
              ? 'Process custom showroom orders with real-time stock deduction'
              : `Tracking ${orders.length} total customer orders and deliveries`}
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-stone-100 p-1 rounded-xl border border-stone-200 self-start sm:self-auto">
          <button
            onClick={() => setActiveSubTab('pos')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              activeSubTab === 'pos' 
                ? 'bg-amber-600 text-white shadow-xs' 
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>New Sale (POS)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('orders')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              activeSubTab === 'orders' 
                ? 'bg-amber-600 text-white shadow-xs' 
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Order History ({orders.length})</span>
          </button>
        </div>
      </div>

      {/* POS TERMINAL VIEW */}
      {activeSubTab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Product Selection Catalog */}
          <div className="lg:col-span-7 space-y-4">
            {/* Search & Category Filter */}
            <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={e => setCatalogSearch(e.target.value)}
                  placeholder="Quick scan / search furniture catalog by name or SKU..."
                  className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === cat
                        ? 'bg-stone-900 text-stone-100 font-semibold'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[600px] overflow-y-auto pr-1">
              {filteredCatalog.map(item => {
                const inCart = cart.find(c => c.furnitureId === item.id);
                const isOutOfStock = item.stock <= 0;

                return (
                  <div
                    key={item.id}
                    onClick={() => !isOutOfStock && addToCart(item)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isOutOfStock ? 'opacity-50 bg-stone-100 border-stone-200 cursor-not-allowed' :
                      inCart ? 'bg-amber-50/50 border-amber-400 ring-1 ring-amber-400/40' :
                      'bg-white border-stone-200 hover:border-amber-400 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <img 
                        src={item.imageUrl} 
                        alt={item.name}
                        className="w-14 h-14 rounded-lg object-cover border border-stone-200 flex-shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[10px] font-mono text-stone-400">{item.sku}</span>
                          <span className={`text-[10px] font-bold px-1.5 rounded ${
                            item.stock <= item.minStockAlert ? 'bg-amber-100 text-amber-900' : 'bg-emerald-50 text-emerald-800'
                          }`}>
                            {item.stock} in stock
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-stone-900 truncate mt-0.5">{item.name}</h4>
                        <p className="text-[11px] text-stone-500 truncate">{item.material}</p>
                        <div className="text-xs font-bold text-amber-900 mt-1">
                          {profile.currency}{item.retailPrice.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isOutOfStock}
                      className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
                        isOutOfStock ? 'bg-stone-200 text-stone-400' :
                        inCart ? 'bg-amber-600 text-white' :
                        'bg-stone-100 hover:bg-amber-600 hover:text-white text-stone-700'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Active Cart & Checkout Form */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-stone-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                  <h3 className="font-serif font-bold text-stone-900 text-base">Current Sale Order</h3>
                </div>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-xs text-red-600 hover:text-red-700 font-medium"
                  >
                    Clear Cart
                  </button>
                )}
              </div>

              {posError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{posError}</span>
                </div>
              )}

              {/* Cart items list */}
              {cart.length === 0 ? (
                <div className="py-10 text-center text-stone-400">
                  <ShoppingCart className="w-10 h-10 mx-auto text-stone-300 mb-2" />
                  <p className="text-xs font-medium">Cart is empty</p>
                  <p className="text-[11px] text-stone-400 mt-0.5">Click any furniture item on the left to add to order</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-56 overflow-y-auto pr-1 mb-4 divide-y divide-stone-100">
                  {cart.map(item => (
                    <div key={item.furnitureId} className="pt-2.5 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-stone-900 truncate">{item.name}</h4>
                        <div className="text-[11px] text-stone-500">
                          {profile.currency}{item.unitPrice.toLocaleString()} each
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <div className="flex items-center space-x-1 bg-stone-100 rounded-lg p-0.5 border border-stone-200">
                          <button
                            onClick={() => updateCartQuantity(item.furnitureId, item.quantity - 1)}
                            className="p-1 hover:bg-stone-200 rounded text-stone-700"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-5 text-center font-bold text-xs">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.furnitureId, item.quantity + 1)}
                            className="p-1 hover:bg-stone-200 rounded text-stone-700"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        
                        <span className="text-xs font-bold text-stone-900 w-16 text-right font-mono">
                          {profile.currency}{item.total.toLocaleString()}
                        </span>

                        <button
                          onClick={() => removeFromCart(item.furnitureId)}
                          className="p-1 text-stone-400 hover:text-red-600 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Customer & Delivery Form */}
              <form id="pos-sale-form" onSubmit={handleProcessSale} className="space-y-3 pt-3 border-t border-stone-200">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-stone-600 uppercase">Customer Name *</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      placeholder="e.g. Clara Montgomery"
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-stone-600 uppercase">Phone Number *</label>
                    <input
                      type="text"
                      required
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      placeholder="(503) 555-0199"
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-stone-600 uppercase">Email Address</label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={e => setCustomerEmail(e.target.value)}
                      placeholder="clara@example.com"
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-stone-600 uppercase">Delivery Date</label>
                    <input
                      type="date"
                      value={deliveryDate}
                      onChange={e => setDeliveryDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-stone-600 uppercase">Delivery Address</label>
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={e => setDeliveryAddress(e.target.value)}
                    placeholder="Street address (or leave empty for showroom pickup)"
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                {/* Delivery Type Radios */}
                <div>
                  <label className="block text-[10px] font-semibold text-stone-600 uppercase mb-1">Fulfillment Service</label>
                  <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setDeliveryType('pickup')}
                      className={`p-1.5 rounded-lg border text-center transition-colors ${
                        deliveryType === 'pickup' ? 'bg-amber-600 text-white border-amber-600 font-semibold' : 'bg-stone-50 border-stone-200 text-stone-700'
                      }`}
                    >
                      Store Pickup ($0)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryType('standard')}
                      className={`p-1.5 rounded-lg border text-center transition-colors ${
                        deliveryType === 'standard' ? 'bg-amber-600 text-white border-amber-600 font-semibold' : 'bg-stone-50 border-stone-200 text-stone-700'
                      }`}
                    >
                      Curbside (+${profile.standardShippingFee})
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryType('white_glove')}
                      className={`p-1.5 rounded-lg border text-center transition-colors ${
                        deliveryType === 'white_glove' ? 'bg-amber-600 text-white border-amber-600 font-semibold' : 'bg-stone-50 border-stone-200 text-stone-700'
                      }`}
                    >
                      White Glove (+${profile.whiteGloveFee})
                    </button>
                  </div>
                </div>

                {/* Payment Method & Discount */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-stone-600 uppercase">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={e => setPaymentMethod(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-300 bg-white"
                    >
                      <option value="credit_card">Credit Card (POS)</option>
                      <option value="bank_transfer">Wire / Bank Transfer</option>
                      <option value="cash">Cash Showroom</option>
                      <option value="financing">12-Mo 0% Financing</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-stone-600 uppercase">Store Discount ({profile.currency})</label>
                    <input
                      type="number"
                      min="0"
                      value={discountAmount}
                      onChange={e => setDiscountAmount(Number(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-300 font-mono"
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Calculations & Checkout Button */}
            <div className="mt-4 pt-3 border-t border-stone-200 space-y-2">
              <div className="space-y-1 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{profile.currency}{cartSubtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount:</span>
                    <span>-{profile.currency}{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery ({deliveryType.replace('_', ' ')}):</span>
                  <span>{profile.currency}{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Est. Tax ({(profile.taxRate * 100).toFixed(1)}%):</span>
                  <span>{profile.currency}{taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-stone-900 pt-1 border-t border-stone-100">
                  <span>Grand Total:</span>
                  <span className="text-amber-900 font-serif text-lg">
                    {profile.currency}{cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                form="pos-sale-form"
                disabled={cart.length === 0}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all hover:scale-[1.01]"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete Sale & Generate Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ORDERS & FULFILLMENT LIST VIEW */}
      {activeSubTab === 'orders' && (
        <div className="space-y-4">
          {/* Filters & Export */}
          <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={orderSearch}
                onChange={e => setOrderSearch(e.target.value)}
                placeholder="Search orders by customer name, order number, or phone..."
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={orderStatusFilter}
                onChange={e => setOrderStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 font-medium text-stone-700"
              >
                <option value="All">All Order Statuses</option>
                <option value="processing">Processing</option>
                <option value="scheduled">Delivery Scheduled</option>
                <option value="in_transit">In Transit</option>
                <option value="delivered">Delivered & Assembled</option>
                <option value="cancelled">Cancelled / Refunded</option>
              </select>

              <button
                onClick={onExportOrdersCSV}
                className="px-3.5 py-2 text-xs font-medium bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl flex items-center space-x-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
            </div>
          </div>

          {/* Orders Cards Grid */}
          <div className="space-y-3">
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-stone-200">
                <FileText className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-stone-800">No orders found</h3>
                <p className="text-xs text-stone-500 mt-1">Try changing your search or create a new sale.</p>
              </div>
            ) : (
              filteredOrders.map(order => (
                <div 
                  key={order.id}
                  className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm hover:border-amber-300 transition-all space-y-4"
                >
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-stone-100">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-stone-100 rounded-xl text-stone-700">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-sm text-stone-900">{order.orderNumber}</span>
                          <span className="text-xs text-stone-400">
                            • {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 font-medium">
                          Customer: <strong className="text-stone-900">{order.customer.name}</strong> ({order.customer.phone})
                        </p>
                      </div>
                    </div>

                    {/* Status dropdown & Invoice button */}
                    <div className="flex items-center space-x-2.5">
                      <select
                        value={order.orderStatus}
                        onChange={e => onUpdateOrderStatus(order.id, e.target.value)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg border ${
                          order.orderStatus === 'delivered' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                          order.orderStatus === 'in_transit' ? 'bg-blue-50 text-blue-800 border-blue-300' :
                          order.orderStatus === 'scheduled' ? 'bg-amber-50 text-amber-800 border-amber-300' :
                          order.orderStatus === 'cancelled' ? 'bg-red-50 text-red-800 border-red-300' :
                          'bg-stone-50 text-stone-800 border-stone-300'
                        }`}
                      >
                        <option value="processing">Processing</option>
                        <option value="scheduled">Delivery Scheduled</option>
                        <option value="in_transit">In Transit</option>
                        <option value="delivered">Delivered & Assembled</option>
                        <option value="cancelled">Cancelled</option>
                      </select>

                      <button
                        onClick={() => onViewInvoice(order)}
                        className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-medium rounded-lg flex items-center space-x-1 shadow-xs"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-400" />
                        <span>Receipt / Invoice</span>
                      </button>
                    </div>
                  </div>

                  {/* Order Items Snapshot */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-3 p-2 rounded-xl bg-stone-50 border border-stone-100">
                        <img 
                          src={item.imageUrl} 
                          alt={item.name} 
                          className="w-10 h-10 rounded-lg object-cover border border-stone-200 flex-shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <h5 className="text-xs font-bold text-stone-900 truncate">{item.name}</h5>
                          <p className="text-[11px] text-stone-500">
                            Qty: {item.quantity} × {profile.currency}{item.unitPrice} = <span className="font-semibold text-stone-800">{profile.currency}{item.total}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer summary */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-2 text-xs text-stone-500 gap-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <span>Delivery: <strong className="text-stone-800 capitalize">{order.deliveryType.replace('_', ' ')}</strong></span>
                      <span>Target Date: <strong className="text-stone-800">{order.deliveryDate}</strong></span>
                      <span>Payment: <strong className="text-stone-800 capitalize">{order.paymentMethod.replace('_', ' ')}</strong></span>
                      {order.customer.deliveryAddress && (
                        <span className="truncate max-w-xs text-stone-600">
                          Address: {order.customer.deliveryAddress}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="text-stone-400">Net Profit: <strong className="text-emerald-700">+{profile.currency}{order.profit.toFixed(2)}</strong></span>
                      <span className="text-sm font-serif font-bold text-stone-900">
                        Total: {profile.currency}{order.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
