import React, { useState, useEffect } from 'react';
import { 
  loadInventory, 
  saveInventory, 
  loadOrders, 
  saveOrders, 
  loadMovements, 
  saveMovements, 
  loadBusinessProfile, 
  saveBusinessProfile,
  resetToSampleData,
  exportDataAsJSON,
  exportInventoryAsCSV,
  exportSalesAsCSV
} from './utils/storage';
import { FurnitureItem, Order, StockMovement, BusinessProfile } from './types';
import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { InventoryManager } from './components/InventoryManager';
import { SalesManager } from './components/SalesManager';
import { AnalyticsReports } from './components/AnalyticsReports';
import { StockMovementsView } from './components/StockMovementsView';
import { ProductModal } from './components/ProductModal';
import { RestockModal } from './components/RestockModal';
import { ProductTagModal } from './components/ProductTagModal';
import { InvoiceModal } from './components/InvoiceModal';
import { BusinessSettingsModal } from './components/BusinessSettingsModal';
import { CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export default function App() {
  // Primary State loaded from persistent storage
  const [inventory, setInventory] = useState<FurnitureItem[]>(() => loadInventory());
  const [orders, setOrders] = useState<Order[]>(() => loadOrders());
  const [movements, setMovements] = useState<StockMovement[]>(() => loadMovements());
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(() => loadBusinessProfile());

  // Navigation State
  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'sales' | 'pos' | 'analytics' | 'movements'>('overview');
  const [salesSubTab, setSalesSubTab] = useState<'pos' | 'orders'>('pos');

  // Modal States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<FurnitureItem | null>(null);

  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [restockingItem, setRestockingItem] = useState<FurnitureItem | null>(null);

  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [tagItem, setTagItem] = useState<FurnitureItem | null>(null);

  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'info' | 'warning'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Sync to localStorage
  useEffect(() => {
    saveInventory(inventory);
  }, [inventory]);

  useEffect(() => {
    saveOrders(orders);
  }, [orders]);

  useEffect(() => {
    saveMovements(movements);
  }, [movements]);

  useEffect(() => {
    saveBusinessProfile(businessProfile);
  }, [businessProfile]);

  // Inventory Handlers
  const handleSaveProduct = (item: FurnitureItem) => {
    setInventory(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) {
        return prev.map(i => i.id === item.id ? item : i);
      } else {
        // Log movement for initial stock
        if (item.stock > 0) {
          const newMovement: StockMovement = {
            id: `mov-${Date.now()}`,
            furnitureId: item.id,
            sku: item.sku,
            name: item.name,
            type: 'restock',
            quantityChange: item.stock,
            previousStock: 0,
            newStock: item.stock,
            reason: 'Initial catalog creation & warehouse stock intake',
            date: new Date().toISOString(),
          };
          setMovements(m => [newMovement, ...m]);
        }
        return [item, ...prev];
      }
    });

    showToast(editingProduct ? `Updated "${item.name}" specifications.` : `Added "${item.name}" to inventory.`);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (itemId: string) => {
    const item = inventory.find(i => i.id === itemId);
    setInventory(prev => prev.filter(i => i.id !== itemId));
    showToast(`Removed "${item?.name || 'Item'}" from catalog.`, 'info');
  };

  const handleQuickStockChange = (itemId: string, delta: number) => {
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;

    const newStock = Math.max(0, item.stock + delta);
    if (newStock === item.stock) return;

    let newStatus: FurnitureItem['status'] = 'in_stock';
    if (newStock === 0) newStatus = 'out_of_stock';
    else if (newStock <= item.minStockAlert) newStatus = 'low_stock';

    const updatedItem: FurnitureItem = {
      ...item,
      stock: newStock,
      status: newStatus,
    };

    setInventory(prev => prev.map(i => i.id === itemId ? updatedItem : i));

    // Log movement
    const newMovement: StockMovement = {
      id: `mov-${Date.now()}`,
      furnitureId: item.id,
      sku: item.sku,
      name: item.name,
      type: delta > 0 ? 'adjustment' : 'adjustment',
      quantityChange: delta,
      previousStock: item.stock,
      newStock: newStock,
      reason: delta > 0 ? 'Quick stock count increment' : 'Showroom floor adjustment / damaged unit deduction',
      date: new Date().toISOString(),
    };
    setMovements(prev => [newMovement, ...prev]);

    showToast(`Adjusted ${item.name} stock to ${newStock} units.`, delta > 0 ? 'success' : 'info');
  };

  const handleConfirmRestock = (
    item: FurnitureItem, 
    addedUnits: number, 
    supplierNote: string, 
    newCostPrice?: number
  ) => {
    const prevStock = item.stock;
    const newStock = prevStock + addedUnits;
    let newStatus: FurnitureItem['status'] = 'in_stock';
    if (newStock <= item.minStockAlert) newStatus = 'low_stock';

    const updatedItem: FurnitureItem = {
      ...item,
      stock: newStock,
      status: newStatus,
      costPrice: newCostPrice !== undefined ? newCostPrice : item.costPrice,
    };

    setInventory(prev => prev.map(i => i.id === item.id ? updatedItem : i));

    const newMovement: StockMovement = {
      id: `mov-${Date.now()}`,
      furnitureId: item.id,
      sku: item.sku,
      name: item.name,
      type: 'restock',
      quantityChange: addedUnits,
      previousStock: prevStock,
      newStock: newStock,
      reason: supplierNote || `Incoming restock from ${item.supplier}`,
      date: new Date().toISOString(),
    };
    setMovements(prev => [newMovement, ...prev]);

    showToast(`Restocked ${addedUnits} units of ${item.name}. (New stock: ${newStock})`, 'success');
  };

  // Sales Handlers
  const handleCompleteSale = (newOrder: Order) => {
    // 1. Deduct stock for all items
    const newMovements: StockMovement[] = [];
    const updatedInventory = [...inventory];

    newOrder.items.forEach(orderItem => {
      const idx = updatedInventory.findIndex(i => i.id === orderItem.furnitureId);
      if (idx !== -1) {
        const item = updatedInventory[idx];
        const prevStock = item.stock;
        const newStock = Math.max(0, prevStock - orderItem.quantity);
        
        let newStatus: FurnitureItem['status'] = 'in_stock';
        if (newStock === 0) newStatus = 'out_of_stock';
        else if (newStock <= item.minStockAlert) newStatus = 'low_stock';

        updatedInventory[idx] = {
          ...item,
          stock: newStock,
          status: newStatus,
        };

        newMovements.push({
          id: `mov-${Date.now()}-${orderItem.furnitureId}`,
          furnitureId: item.id,
          sku: item.sku,
          name: item.name,
          type: 'sale',
          quantityChange: -orderItem.quantity,
          previousStock: prevStock,
          newStock: newStock,
          reason: `Customer Sale #${newOrder.orderNumber} (${newOrder.customer.name})`,
          referenceOrderNumber: newOrder.orderNumber,
          date: new Date().toISOString(),
        });
      }
    });

    setInventory(updatedInventory);
    setMovements(prev => [...newMovements, ...prev]);
    setOrders(prev => [newOrder, ...prev]);

    // Open receipt modal immediately
    setInvoiceOrder(newOrder);
    setIsInvoiceModalOpen(true);
    showToast(`Sale confirmed! Order #${newOrder.orderNumber} recorded and inventory deducted.`, 'success');
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['orderStatus']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, orderStatus: newStatus } : o));
    showToast(`Order status updated to "${newStatus.replace('_', ' ')}".`, 'info');
  };

  const handleCancelOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order || order.orderStatus === 'cancelled') return;

    if (confirm(`Are you sure you want to cancel Order #${order.orderNumber}? This will restore the items back to inventory.`)) {
      // Restore inventory items
      const updatedInventory = [...inventory];
      const returnMovements: StockMovement[] = [];

      order.items.forEach(orderItem => {
        const idx = updatedInventory.findIndex(i => i.id === orderItem.furnitureId);
        if (idx !== -1) {
          const item = updatedInventory[idx];
          const prevStock = item.stock;
          const newStock = prevStock + orderItem.quantity;
          
          let newStatus: FurnitureItem['status'] = 'in_stock';
          if (newStock <= item.minStockAlert) newStatus = 'low_stock';

          updatedInventory[idx] = {
            ...item,
            stock: newStock,
            status: newStatus,
          };

          returnMovements.push({
            id: `mov-ret-${Date.now()}-${orderItem.furnitureId}`,
            furnitureId: item.id,
            sku: item.sku,
            name: item.name,
            type: 'return',
            quantityChange: orderItem.quantity,
            previousStock: prevStock,
            newStock: newStock,
            reason: `Order Cancelled / Returned #${order.orderNumber}`,
            referenceOrderNumber: order.orderNumber,
            date: new Date().toISOString(),
          });
        }
      });

      setInventory(updatedInventory);
      setMovements(prev => [...returnMovements, ...prev]);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, orderStatus: 'cancelled' } : o));
      showToast(`Order #${order.orderNumber} cancelled and ${order.items.length} item(s) returned to stock.`, 'warning');
    }
  };

  const handleResetData = () => {
    resetToSampleData();
    setInventory(loadInventory());
    setOrders(loadOrders());
    setMovements(loadMovements());
    setBusinessProfile(loadBusinessProfile());
    showToast('Database reset to authentic showroom catalog & order history.', 'info');
  };

  const lowStockCount = inventory.filter(i => i.stock <= i.minStockAlert).length;

  return (
    <div className="min-h-screen bg-stone-100/90 text-stone-900 flex flex-col font-sans selection:bg-amber-200">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab === 'pos' ? 'sales' : activeTab}
        setActiveTab={(tab) => {
          if (tab === 'pos') {
            setActiveTab('sales');
            setSalesSubTab('pos');
          } else if (tab === 'sales') {
            setActiveTab('sales');
            setSalesSubTab('orders');
          } else {
            setActiveTab(tab);
          }
        }}
        lowStockCount={lowStockCount}
        onNewSaleClick={() => {
          setActiveTab('sales');
          setSalesSubTab('pos');
        }}
        onAddProductClick={() => {
          setEditingProduct(null);
          setIsProductModalOpen(true);
        }}
        onSettingsClick={() => setIsSettingsModalOpen(true)}
        onExportClick={() => exportDataAsJSON(inventory, orders, movements, businessProfile)}
        businessProfile={businessProfile}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Dynamic Views */}
        {activeTab === 'overview' && (
          <DashboardOverview
            inventory={inventory}
            orders={orders}
            profile={businessProfile}
            onNavigateToInventory={() => setActiveTab('inventory')}
            onNavigateToSales={() => {
              setActiveTab('sales');
              setSalesSubTab('orders');
            }}
            onNavigateToPOS={() => {
              setActiveTab('sales');
              setSalesSubTab('pos');
            }}
            onOpenRestockModal={(item) => {
              setRestockingItem(item);
              setIsRestockModalOpen(true);
            }}
            onViewOrderInvoice={(order) => {
              setInvoiceOrder(order);
              setIsInvoiceModalOpen(true);
            }}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryManager
            inventory={inventory}
            profile={businessProfile}
            onAddProduct={() => {
              setEditingProduct(null);
              setIsProductModalOpen(true);
            }}
            onEditProduct={(item) => {
              setEditingProduct(item);
              setIsProductModalOpen(true);
            }}
            onRestockProduct={(item) => {
              setRestockingItem(item);
              setIsRestockModalOpen(true);
            }}
            onPrintTag={(item) => {
              setTagItem(item);
              setIsTagModalOpen(true);
            }}
            onDeleteProduct={handleDeleteProduct}
            onQuickStockChange={handleQuickStockChange}
            onExportCSV={() => exportInventoryAsCSV(inventory)}
          />
        )}

        {(activeTab === 'sales' || activeTab === 'pos') && (
          <SalesManager
            inventory={inventory}
            orders={orders}
            profile={businessProfile}
            activeSubTab={salesSubTab}
            setActiveSubTab={setSalesSubTab}
            onCompleteSale={handleCompleteSale}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onCancelOrder={handleCancelOrder}
            onViewInvoice={(order) => {
              setInvoiceOrder(order);
              setIsInvoiceModalOpen(true);
            }}
            onExportOrdersCSV={() => exportSalesAsCSV(orders)}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsReports
            inventory={inventory}
            orders={orders}
            profile={businessProfile}
            onExportSalesCSV={() => exportSalesAsCSV(orders)}
            onExportInventoryCSV={() => exportInventoryAsCSV(inventory)}
          />
        )}

        {activeTab === 'movements' && (
          <StockMovementsView
            movements={movements}
            profile={businessProfile}
          />
        )}
      </main>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center space-x-2.5 text-xs font-semibold ${
            toastMessage.type === 'success' ? 'bg-stone-900 text-emerald-300 border-emerald-500/40' :
            toastMessage.type === 'warning' ? 'bg-stone-900 text-amber-300 border-amber-500/40' :
            'bg-stone-900 text-stone-100 border-stone-700'
          }`}>
            {toastMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-amber-400" />}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Modals */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        editingItem={editingProduct}
        profile={businessProfile}
      />

      <RestockModal
        isOpen={isRestockModalOpen}
        onClose={() => {
          setIsRestockModalOpen(false);
          setRestockingItem(null);
        }}
        item={restockingItem}
        profile={businessProfile}
        onConfirmRestock={handleConfirmRestock}
      />

      <ProductTagModal
        isOpen={isTagModalOpen}
        onClose={() => {
          setIsTagModalOpen(false);
          setTagItem(null);
        }}
        item={tagItem}
        profile={businessProfile}
      />

      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => {
          setIsInvoiceModalOpen(false);
          setInvoiceOrder(null);
        }}
        order={invoiceOrder}
        profile={businessProfile}
      />

      <BusinessSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        profile={businessProfile}
        onSaveProfile={(prof) => {
          setBusinessProfile(prof);
          showToast('Updated store settings and tax profile.');
        }}
        onResetData={handleResetData}
      />
    </div>
  );
}
