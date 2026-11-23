import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  MenuItemModel, 
  OrderModel, 
  TableSessionModel, 
  SectionModel, 
  ReviewModel 
} from './models';
import { INITIAL_MENU, INITIAL_SECTIONS, INITIAL_REVIEWS } from '../src/mockData';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/velvet_fork';

app.use(cors());
app.use(express.json());

// Auto seed helper
const seedDatabaseIfEmpty = async () => {
  try {
    const menuCount = await MenuItemModel.countDocuments();
    if (menuCount === 0) {
      console.log('🌱 Seeding initial restaurant menu, tables, and reviews into MongoDB...');
      await MenuItemModel.insertMany(INITIAL_MENU);
      await SectionModel.insertMany(INITIAL_SECTIONS);
      await ReviewModel.insertMany(INITIAL_REVIEWS);
      console.log('✅ MongoDB initial data populated successfully!');
    }
  } catch (err: any) {
    console.error('Error auto-seeding MongoDB:', err.message);
  }
};

// --- CONNECT TO MONGODB (Atlas or Local fallback) ---
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log(`✅ MongoDB Connected successfully to: ${MONGODB_URI.includes('mongodb+srv') ? 'MongoDB Atlas (Cloud)' : 'Local MongoDB'}`);
    await seedDatabaseIfEmpty();
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
  });

// --- HEALTH CHECK ---
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'online', 
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    target: MONGODB_URI.includes('mongodb+srv') ? 'Atlas Cloud' : 'Local'
  });
});

// --- MENU APIS ---
app.get('/api/menu', async (req, res) => {
  try {
    const menu = await MenuItemModel.find();
    res.json(menu);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/menu', async (req, res) => {
  try {
    const item = new MenuItemModel(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/menu/:id', async (req, res) => {
  try {
    const updated = await MenuItemModel.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/menu/:id', async (req, res) => {
  try {
    await MenuItemModel.findOneAndDelete({ id: req.params.id });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- SECTIONS & TABLES APIS ---
app.get('/api/sections', async (req, res) => {
  try {
    const sections = await SectionModel.find();
    res.json(sections);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/sections', async (req, res) => {
  try {
    const { sections } = req.body;
    for (const sec of sections) {
      await SectionModel.findOneAndUpdate(
        { name: sec.name },
        sec,
        { upsert: true, new: true }
      );
    }
    const updated = await SectionModel.find();
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- TABLE SESSIONS (Running Tab & Joint Tables) ---
// 1. Get active session for a table (or joint table group)
app.get('/api/sessions/active', async (req, res) => {
  const { tableId, sectionName } = req.query;
  try {
    const session = await TableSessionModel.findOne({
      sectionName,
      status: { $in: ['active', 'billing_requested'] },
      $or: [
        { primaryTableId: tableId },
        { joinedTableIds: tableId }
      ]
    });
    res.json(session || null);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Join multiple tables together (e.g. Table 2 + Table 3 for a big group)
app.post('/api/tables/join', async (req, res) => {
  const { primaryTableId, joinTableIds, sectionName, guestCount } = req.body;
  try {
    // 1. Find or create master group session for primary table
    let session = await TableSessionModel.findOne({
      primaryTableId,
      sectionName,
      status: { $in: ['active', 'billing_requested'] }
    });

    const allJoinedIds = Array.from(new Set([...(session?.joinedTableIds || []), ...joinTableIds]));

    if (!session) {
      session = new TableSessionModel({
        sessionId: `sess-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        primaryTableId,
        sectionName,
        joinedTableIds: allJoinedIds,
        guestCount: guestCount || 4,
        rounds: [],
        activeOrderIds: [],
        subtotal: 0,
        status: 'active'
      });
    } else {
      session.joinedTableIds = allJoinedIds;
      if (guestCount) session.guestCount = guestCount;
    }

    // 2. MERGE BILLS & ROUNDS FROM JOINED TABLES
    for (const jId of joinTableIds) {
      // Find if joined table already has an active running session/bill
      const otherSession = await TableSessionModel.findOne({
        sectionName,
        status: { $in: ['active', 'billing_requested'] },
        primaryTableId: jId
      });

      if (otherSession && otherSession.sessionId !== session.sessionId) {
        // Merge rounds into primary table's session
        const currentRoundCount = session.rounds.length;
        otherSession.rounds.forEach((rnd: any, idx: number) => {
          session.rounds.push({
            roundNumber: currentRoundCount + idx + 1,
            items: rnd.items,
            timestamp: rnd.timestamp,
            notes: rnd.notes ? `${rnd.notes} (From ${jId})` : `(From ${jId})`
          });
        });

        // Add subtotal
        session.subtotal += otherSession.subtotal;
        session.activeOrderIds = Array.from(new Set([...session.activeOrderIds, ...otherSession.activeOrderIds]));

        // Reassign all database orders under otherSession to primary session
        await OrderModel.updateMany(
          { sessionId: otherSession.sessionId },
          { sessionId: session.sessionId }
        );

        // Retire otherSession as merged
        otherSession.status = 'completed';
        await otherSession.save();
      }

      // Check if there are any pending orders directly on this table
      const pendingOrders = await OrderModel.find({
        tableId: jId,
        sectionName,
        status: { $ne: 'completed' },
        sessionId: { $ne: session.sessionId }
      });

      for (const ord of pendingOrders) {
        ord.sessionId = session.sessionId;
        await ord.save();

        if (!session.activeOrderIds.includes(ord.id)) {
          session.activeOrderIds.push(ord.id);
          session.rounds.push({
            roundNumber: session.rounds.length + 1,
            items: ord.items,
            timestamp: ord.timestamp,
            notes: `(From ${jId})`
          });
          session.subtotal += ord.totalAmount;
        }
      }
    }

    await session.save();

    // 3. Update section tables: mark primary and joined tables as occupied & link joinedWith
    const section = await SectionModel.findOne({ name: sectionName });
    if (section) {
      section.tables = section.tables.map((t: any) => {
        if (t.id === primaryTableId) {
          return { ...t, status: 'occupied', currentSessionId: session.sessionId, joinedWith: undefined };
        }
        if (allJoinedIds.includes(t.id)) {
          return { ...t, status: 'occupied', currentSessionId: session.sessionId, joinedWith: primaryTableId };
        }
        return t;
      });
      await section.save();
    }

    res.json({ session, section });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Unjoin a table from group
app.post('/api/tables/unjoin', async (req, res) => {
  const { tableIdToFree, sectionName } = req.body;
  try {
    const session = await TableSessionModel.findOne({
      sectionName,
      status: 'active',
      joinedTableIds: tableIdToFree
    });

    if (session) {
      session.joinedTableIds = session.joinedTableIds.filter((id: string) => id !== tableIdToFree);
      await session.save();
    }

    const section = await SectionModel.findOne({ name: sectionName });
    if (section) {
      section.tables = section.tables.map((t: any) => {
        if (t.id === tableIdToFree) {
          return { ...t, status: 'free', currentSessionId: undefined, currentOrderId: undefined, joinedWith: undefined };
        }
        return t;
      });
      await section.save();
    }

    res.json({ success: true, session, section });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- ORDERS (Running Tab - Order Anytime Without Paying First) ---
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await OrderModel.find().sort({ timestamp: -1 });
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Customer clicks "Send to Kitchen" (Adds Round to Active Running Tab)
app.post('/api/orders/place', async (req, res) => {
  const { tableId, sectionName, items, notes } = req.body;
  try {
    // 1. Find or create the active table session (supports joint tables)
    let session = await TableSessionModel.findOne({
      sectionName,
      status: { $in: ['active', 'billing_requested'] },
      $or: [
        { primaryTableId: tableId },
        { joinedTableIds: tableId }
      ]
    });

    if (!session) {
      session = new TableSessionModel({
        sessionId: `sess-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        primaryTableId: tableId,
        sectionName,
        joinedTableIds: [],
        rounds: [],
        activeOrderIds: [],
        subtotal: 0,
        status: 'active'
      });
    }

    const roundNumber = (session.rounds?.length || 0) + 1;
    const roundTotal = items.reduce((sum: number, it: any) => sum + (it.menuItem.price * it.quantity), 0);

    // 2. Create the kitchen order ticket for this round
    const newOrder = new OrderModel({
      id: `ord-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
      tableId,
      sectionName,
      sessionId: session.sessionId,
      roundNumber,
      items,
      status: 'received',
      timestamp: new Date().toISOString(),
      totalAmount: roundTotal,
      paymentStatus: 'pending',
      billingRequested: false
    });
    await newOrder.save();

    // 3. Append round to the running tab session
    session.rounds.push({
      roundNumber,
      items,
      timestamp: new Date().toISOString(),
      notes: notes || ''
    });
    session.activeOrderIds.push(newOrder.id);
    session.subtotal += roundTotal;
    session.status = 'active'; // In case they ordered more after requesting bill
    await session.save();

    // 4. Update table status to occupied
    const section = await SectionModel.findOne({ name: sectionName });
    if (section) {
      section.tables = section.tables.map((t: any) => {
        if (t.id === session.primaryTableId || session.joinedTableIds.includes(t.id)) {
          return { ...t, status: 'occupied', currentSessionId: session.sessionId, currentOrderId: newOrder.id };
        }
        return t;
      });
      await section.save();
    }

    res.status(201).json({ order: newOrder, session });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update order status (Kitchen KDS: received -> preparing -> ready -> served)
app.put('/api/orders/:id/status', async (req, res) => {
  const { status } = req.body;
  try {
    const order = await OrderModel.findOneAndUpdate({ id: req.params.id }, { status }, { new: true });
    res.json(order);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Request Bill for the Running Tab (Once at the end of dining)
app.post('/api/sessions/request-bill', async (req, res) => {
  const { tableId, sectionName } = req.body;
  try {
    const session = await TableSessionModel.findOne({
      sectionName,
      status: 'active',
      $or: [
        { primaryTableId: tableId },
        { joinedTableIds: tableId }
      ]
    });

    if (!session) return res.status(404).json({ error: 'No active session found' });

    session.status = 'billing_requested';
    await session.save();

    // Mark all active orders under this session as billingRequested
    await OrderModel.updateMany(
      { sessionId: session.sessionId, status: { $ne: 'completed' } },
      { billingRequested: true }
    );

    // Update table status in sections
    const section = await SectionModel.findOne({ name: sectionName });
    if (section) {
      section.tables = section.tables.map((t: any) => {
        if (t.id === session.primaryTableId || session.joinedTableIds.includes(t.id)) {
          return { ...t, status: 'billing_requested' };
        }
        return t;
      });
      await section.save();
    }

    res.json({ session });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Settle Bill Once for the Whole Table / Joint Group (Cash / Card / UPI)
app.post('/api/sessions/settle-bill', async (req, res) => {
  const { sessionId, paymentMethod } = req.body;
  try {
    const session = await TableSessionModel.findOne({ sessionId });
    if (!session) return res.status(404).json({ error: 'Session not found' });

    session.status = 'completed';
    await session.save();

    // Mark all orders in this session as completed & paid
    await OrderModel.updateMany(
      { sessionId },
      { status: 'completed', paymentStatus: 'completed', paymentMethod: paymentMethod || 'UPI' }
    );

    // Free up primary table AND all joint tables together!
    const section = await SectionModel.findOne({ name: session.sectionName });
    if (section) {
      const allTableIdsToFree = [session.primaryTableId, ...(session.joinedTableIds || [])];
      section.tables = section.tables.map((t: any) => {
        if (allTableIdsToFree.includes(t.id)) {
          return { 
            ...t, 
            status: 'free', 
            currentOrderId: undefined, 
            currentSessionId: undefined, 
            joinedWith: undefined 
          };
        }
        return t;
      });
      await section.save();
    }

    res.json({ success: true, session });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- SEED DATABASE (Initial setup) ---
app.post('/api/seed', async (req, res) => {
  try {
    const menu = (req.body && req.body.menu && req.body.menu.length > 0) ? req.body.menu : INITIAL_MENU;
    const sections = (req.body && req.body.sections && req.body.sections.length > 0) ? req.body.sections : INITIAL_SECTIONS;
    const reviews = (req.body && req.body.reviews && req.body.reviews.length > 0) ? req.body.reviews : INITIAL_REVIEWS;
    
    if (menu && menu.length > 0) {
      await MenuItemModel.deleteMany({});
      await MenuItemModel.insertMany(menu);
    }
    
    if (sections && sections.length > 0) {
      await SectionModel.deleteMany({});
      await SectionModel.insertMany(sections);
    }

    if (reviews && reviews.length > 0) {
      await ReviewModel.deleteMany({});
      await ReviewModel.insertMany(reviews);
    }

    res.json({ success: true, message: 'Database seeded successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- SERVE STATIC FRONTEND IN PRODUCTION (SINGLE PORT MODE) ---
app.use(express.static(distPath));

// Fallback to index.html for client-side routing (Express 5 compatible)
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Velvet Fork Backend Server running on http://localhost:${PORT}`);
});
