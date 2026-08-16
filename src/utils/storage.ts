import { FurnitureItem, Order, StockMovement, BusinessProfile } from '../types';
import { initialFurnitureCatalog, initialOrders, initialStockMovements, initialBusinessProfile } from '../data/initialData';

const INVENTORY_KEY = 'furn_inventory_data_v1';
const ORDERS_KEY = 'furn_orders_data_v1';
const MOVEMENTS_KEY = 'furn_movements_data_v1';
const PROFILE_KEY = 'furn_profile_data_v1';

export const loadInventory = (): FurnitureItem[] => {
  try {
    const saved = localStorage.getItem(INVENTORY_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load inventory from localStorage', e);
  }
  return initialFurnitureCatalog;
};

export const saveInventory = (items: FurnitureItem[]) => {
  try {
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save inventory to localStorage', e);
  }
};

export const loadOrders = (): Order[] => {
  try {
    const saved = localStorage.getItem(ORDERS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load orders from localStorage', e);
  }
  return initialOrders;
};

export const saveOrders = (orders: Order[]) => {
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  } catch (e) {
    console.error('Failed to save orders to localStorage', e);
  }
};

export const loadMovements = (): StockMovement[] => {
  try {
    const saved = localStorage.getItem(MOVEMENTS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load stock movements from localStorage', e);
  }
  return initialStockMovements;
};

export const saveMovements = (movements: StockMovement[]) => {
  try {
    localStorage.setItem(MOVEMENTS_KEY, JSON.stringify(movements));
  } catch (e) {
    console.error('Failed to save stock movements to localStorage', e);
  }
};

export const loadBusinessProfile = (): BusinessProfile => {
  try {
    const saved = localStorage.getItem(PROFILE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load profile from localStorage', e);
  }
  return initialBusinessProfile;
};

export const saveBusinessProfile = (profile: BusinessProfile) => {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile to localStorage', e);
  }
};

export const resetToSampleData = () => {
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(initialFurnitureCatalog));
  localStorage.setItem(ORDERS_KEY, JSON.stringify(initialOrders));
  localStorage.setItem(MOVEMENTS_KEY, JSON.stringify(initialStockMovements));
  localStorage.setItem(PROFILE_KEY, JSON.stringify(initialBusinessProfile));
};

export const exportDataAsJSON = (inventory: FurnitureItem[], orders: Order[], movements: StockMovement[], profile: BusinessProfile) => {
  const data = {
    exportedAt: new Date().toISOString(),
    profile,
    inventory,
    orders,
    movements,
  };
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', `furniture_business_backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

export const exportInventoryAsCSV = (inventory: FurnitureItem[]) => {
  const headers = ['SKU', 'Name', 'Category', 'Material', 'Stock', 'MinAlert', 'CostPrice', 'RetailPrice', 'MarginPct', 'Status', 'Supplier'];
  const rows = inventory.map(item => {
    const margin = item.retailPrice > 0 ? (((item.retailPrice - item.costPrice) / item.retailPrice) * 100).toFixed(1) : '0';
    return [
      `"${item.sku}"`,
      `"${item.name.replace(/"/g, '""')}"`,
      `"${item.category}"`,
      `"${item.material.replace(/"/g, '""')}"`,
      item.stock,
      item.minStockAlert,
      item.costPrice,
      item.retailPrice,
      `${margin}%`,
      `"${item.status}"`,
      `"${item.supplier.replace(/"/g, '""')}"`,
    ].join(',');
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `furniture_inventory_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const exportSalesAsCSV = (orders: Order[]) => {
  const headers = ['OrderNumber', 'Date', 'Customer', 'Phone', 'ItemsCount', 'Subtotal', 'Discount', 'Tax', 'DeliveryFee', 'Total', 'Profit', 'PaymentMethod', 'OrderStatus'];
  const rows = orders.map(o => {
    return [
      `"${o.orderNumber}"`,
      `"${o.createdAt.slice(0, 10)}"`,
      `"${o.customer.name.replace(/"/g, '""')}"`,
      `"${o.customer.phone}"`,
      o.items.reduce((s, i) => s + i.quantity, 0),
      o.subtotal,
      o.discount,
      o.taxAmount,
      o.deliveryFee,
      o.total,
      o.profit,
      `"${o.paymentMethod}"`,
      `"${o.orderStatus}"`,
    ].join(',');
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `furniture_sales_orders_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};
