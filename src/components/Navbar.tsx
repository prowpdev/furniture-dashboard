import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  TrendingUp, 
  History, 
  PlusCircle, 
  ShoppingCart,
  AlertTriangle,
  Settings,
  Download,
  Store
} from 'lucide-react';
import { BusinessProfile } from '../types';

interface NavbarProps {
  activeTab: 'overview' | 'inventory' | 'sales' | 'pos' | 'analytics' | 'movements';
  setActiveTab: (tab: 'overview' | 'inventory' | 'sales' | 'pos' | 'analytics' | 'movements') => void;
  lowStockCount: number;
  onNewSaleClick: () => void;
  onAddProductClick: () => void;
  onSettingsClick: () => void;
  onExportClick: () => void;
  businessProfile: BusinessProfile;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  lowStockCount,
  onNewSaleClick,
  onAddProductClick,
  onSettingsClick,
  onExportClick,
  businessProfile,
}) => {
  return (
    <header className="bg-stone-900 text-stone-100 border-b border-stone-800 sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('overview')}>
            <div className="w-10 h-10 rounded-lg bg-amber-600/90 text-stone-950 flex items-center justify-center font-serif font-bold text-xl shadow-inner">
              <Store className="w-5 h-5 text-stone-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif font-bold text-lg text-amber-50 tracking-tight">
                  {businessProfile.storeName}
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Dashboard
                </span>
              </div>
              <p className="text-xs text-stone-400 font-sans hidden sm:block">
                Inventory & Sales Suite
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              id="nav-tab-overview"
              onClick={() => setActiveTab('overview')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              id="nav-tab-inventory"
              onClick={() => setActiveTab('inventory')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors relative ${
                activeTab === 'inventory'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Inventory</span>
              {lowStockCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 text-[11px] font-bold rounded-full bg-red-500 text-white animate-pulse">
                  {lowStockCount}
                </span>
              )}
            </button>

            <button
              id="nav-tab-sales"
              onClick={() => setActiveTab('sales')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'sales'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Orders & Sales</span>
            </button>

            <button
              id="nav-tab-analytics"
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'analytics'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Analytics</span>
            </button>

            <button
              id="nav-tab-movements"
              onClick={() => setActiveTab('movements')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'movements'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Stock Logs</span>
            </button>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              id="btn-quick-new-sale"
              onClick={onNewSaleClick}
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 sm:px-3.5 py-1.5 rounded-lg text-sm font-semibold shadow-sm transition-all hover:shadow hover:scale-[1.02] active:scale-[0.98]"
              title="Open Point of Sale / Create New Furniture Sale"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">New Sale (POS)</span>
              <span className="sm:hidden">Sale</span>
            </button>

            <button
              id="btn-quick-add-item"
              onClick={onAddProductClick}
              className="hidden lg:flex items-center space-x-1.5 bg-stone-800 hover:bg-stone-700 text-amber-200 border border-amber-500/30 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              title="Add New Furniture Item to Inventory"
            >
              <PlusCircle className="w-4 h-4 text-amber-400" />
              <span>Add Furniture</span>
            </button>

            <button
              id="btn-export-reports"
              onClick={onExportClick}
              className="p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors"
              title="Export Inventory & Sales Data"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              id="btn-business-settings"
              onClick={onSettingsClick}
              className="p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors"
              title="Store Settings & Taxes"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-between py-2 border-t border-stone-800 text-xs overflow-x-auto space-x-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'overview' ? 'bg-amber-600 text-white font-medium' : 'text-stone-400'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'inventory' ? 'bg-amber-600 text-white font-medium' : 'text-stone-400'}`}
          >
            Inventory {lowStockCount > 0 && `(${lowStockCount})`}
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'sales' ? 'bg-amber-600 text-white font-medium' : 'text-stone-400'}`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'analytics' ? 'bg-amber-600 text-white font-medium' : 'text-stone-400'}`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'movements' ? 'bg-amber-600 text-white font-medium' : 'text-stone-400'}`}
          >
            Logs
          </button>
        </div>
      </div>
    </header>
  );
};
