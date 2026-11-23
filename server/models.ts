import mongoose from 'mongoose';

// --- MENU ITEM ---
const MenuItemSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, default: '' },
  category: { type: String, required: true },
  isVeg: { type: Boolean, default: true },
  isAvailable: { type: Boolean, default: true },
  image: { type: String, default: '' }
}, { timestamps: true });

export const MenuItemModel = mongoose.model('MenuItem', MenuItemSchema);

// --- CART ITEM SUB-SCHEMA ---
const CartItemSchema = new mongoose.Schema({
  menuItem: {
    id: String,
    name: String,
    price: Number,
    category: String,
    isVeg: Boolean,
    image: String,
    description: String
  },
  quantity: { type: Number, required: true, min: 1 },
  notes: { type: String, default: '' }
}, { _id: false });

// --- ORDER ROUND SUB-SCHEMA ---
const OrderRoundSchema = new mongoose.Schema({
  roundNumber: { type: Number, required: true },
  items: [CartItemSchema],
  timestamp: { type: String, default: () => new Date().toISOString() },
  notes: { type: String, default: '' }
}, { _id: false });

// --- TABLE SESSION (Running tab for a single table or joint tables) ---
const TableSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  primaryTableId: { type: String, required: true },
  sectionName: { type: String, required: true },
  joinedTableIds: { type: [String], default: [] },
  guestCount: { type: Number, default: 2 },
  rounds: [OrderRoundSchema],
  activeOrderIds: { type: [String], default: [] },
  subtotal: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'billing_requested', 'completed'], default: 'active' },
  createdAt: { type: String, default: () => new Date().toISOString() }
}, { timestamps: true });

export const TableSessionModel = mongoose.model('TableSession', TableSessionSchema);

// --- ORDER (Individual kitchen ticket per round) ---
const OrderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  tableId: { type: String, required: true },
  sectionName: { type: String, required: true },
  sessionId: { type: String, default: '' },
  roundNumber: { type: Number, default: 1 },
  items: [CartItemSchema],
  status: { type: String, enum: ['received', 'preparing', 'ready', 'served', 'completed'], default: 'received' },
  timestamp: { type: String, default: () => new Date().toISOString() },
  totalAmount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  paymentMethod: { type: String, enum: ['UPI', 'Card', 'Cash'] },
  billingRequested: { type: Boolean, default: false }
}, { timestamps: true });

export const OrderModel = mongoose.model('Order', OrderSchema);

// --- SECTIONS & TABLES ---
const TableSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  status: { type: String, enum: ['free', 'occupied', 'billing_requested'], default: 'free' },
  currentOrderId: { type: String },
  currentSessionId: { type: String },
  joinedWith: { type: String }
}, { _id: false });

const SectionSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  tables: [TableSchema]
}, { timestamps: true });

export const SectionModel = mongoose.model('Section', SectionSchema);

// --- CUSTOMER REVIEW ---
const ReviewSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  orderId: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '' },
  timestamp: { type: String, default: () => new Date().toISOString() },
  tableId: { type: String },
  sentiment: { type: String, enum: ['positive', 'neutral', 'negative'], default: 'positive' }
}, { timestamps: true });

export const ReviewModel = mongoose.model('Review', ReviewSchema);
