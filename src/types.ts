export interface FurnitureItem {
  id: string;
  sku: string;
  name: string;
  category: 'Living Room' | 'Bedroom' | 'Dining Room' | 'Home Office' | 'Lighting & Accents' | 'Outdoor';
  material: string; // e.g., 'Solid White Oak', 'Italian Top-Grain Leather', 'Walnut Veneer', 'Velvet Fabric'
  finish: string; // e.g., 'Natural Matte', 'Espresso Dark', 'Brass & Smoke Glass'
  stock: number;
  minStockAlert: number;
  costPrice: number;
  retailPrice: number;
  dimensions: {
    width: number; // in cm
    depth: number;
    height: number;
  };
  weightKg: number;
  roomType: string;
  supplier: string;
  leadTimeDays: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued';
  imageUrl: string;
  description: string;
  dateAdded: string;
}

export interface OrderItem {
  furnitureId: string;
  sku: string;
  name: string;
  material: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  total: number;
  imageUrl: string;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  deliveryAddress: string;
  city: string;
  postalCode: string;
  deliveryNotes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: CustomerInfo;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  deliveryType: 'pickup' | 'standard' | 'white_glove';
  deliveryFee: number;
  total: number;
  costTotal: number;
  profit: number;
  paymentMethod: 'credit_card' | 'bank_transfer' | 'cash' | 'financing';
  paymentStatus: 'paid' | 'pending' | 'refunded';
  orderStatus: 'processing' | 'scheduled' | 'in_transit' | 'delivered' | 'cancelled';
  deliveryDate: string;
  notes?: string;
  createdAt: string;
}

export interface StockMovement {
  id: string;
  furnitureId: string;
  sku: string;
  name: string;
  type: 'sale' | 'restock' | 'adjustment' | 'return';
  quantityChange: number; // e.g., -2 or +10
  previousStock: number;
  newStock: number;
  reason: string;
  referenceOrderNumber?: string;
  date: string;
}

export interface BusinessProfile {
  storeName: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  currency: string;
  taxRate: number; // e.g., 0.08 for 8%
  whiteGloveFee: number;
  standardShippingFee: number;
}
