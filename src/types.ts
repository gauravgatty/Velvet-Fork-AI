export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  category: 'Appetizers' | 'Mains' | 'Starters' | 'Chef Specials' | 'Main Course' | 'Rice & Biryanis' | 'Tandoori & Grills' | 'Desserts' | 'Beverages';

  isVeg: boolean;
  isAvailable: boolean;
  image: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

export interface OrderRound {
  roundNumber: number;
  items: CartItem[];
  timestamp: string;
  notes?: string;
}

export interface TableSession {
  sessionId: string;
  primaryTableId: string;
  sectionName: string;
  joinedTableIds?: string[]; // IDs of other tables joined with this one e.g. ["CH-T3"]
  guestCount?: number;
  rounds: OrderRound[];
  activeOrderIds: string[];
  subtotal: number;
  status: 'active' | 'billing_requested' | 'completed';
  createdAt: string;
}

export interface Order {
  id: string;
  tableId: string;
  sectionName: string;
  sessionId?: string;
  roundNumber?: number;
  items: CartItem[];
  status: 'received' | 'preparing' | 'ready' | 'served' | 'completed';
  timestamp: string; // ISO string
  totalAmount: number;
  paymentStatus: 'pending' | 'completed';
  paymentMethod?: 'UPI' | 'Card' | 'Cash';
  billingRequested: boolean;
}

export interface Table {
  id: string;
  name: string; // e.g. "T1", "T2"
  status: 'free' | 'occupied' | 'billing_requested';
  currentOrderId?: string;
  currentSessionId?: string;
  joinedWith?: string; // ID of the primary table this table is joined to
}

export interface Section {
  name: string; // e.g. "Classic Dining", "Rooftop", "Lounge"
  tables: Table[];
}

export interface CustomerReview {
  id: string;
  orderId: string;
  rating: number;
  comment: string;
  timestamp: string;
  tableId?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

export interface AiRecommendation {
  menuItem: MenuItem;
  reason: string;
  pairingSuggestion?: string;
}

export interface SystemState {
  orders: Order[];
  menu: MenuItem[];
  sections: Section[];
  reviews?: CustomerReview[];
}

