import React, { createContext, useContext, useState, useEffect } from 'react';
import { MenuItem, Order, Section, Table, CartItem, CustomerReview, TableSession } from '../types';
import { INITIAL_MENU, INITIAL_SECTIONS, INITIAL_REVIEWS } from '../mockData';

interface AppContextType {
  menu: MenuItem[];
  sections: Section[];
  orders: Order[];
  reviews: CustomerReview[];
  tableSessions: TableSession[];
  getActiveSession: (tableId: string, sectionName: string) => TableSession | undefined;
  placeOrderRound: (tableId: string, sectionName: string, items: CartItem[], notes?: string) => Promise<{ order: Order; session: TableSession }>;
  requestBillForSession: (tableId: string, sectionName: string) => Promise<TableSession | undefined>;
  settleSessionBill: (sessionId: string, paymentMethod: 'UPI' | 'Card' | 'Cash') => Promise<void>;
  joinTables: (primaryTableId: string, joinTableIds: string[], sectionName: string, guestCount?: number) => Promise<void>;
  unjoinTable: (tableIdToFree: string, sectionName: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (item: MenuItem) => void;
  deleteMenuItem: (id: string) => void;
  // Legacy compatibility helpers
  placeOrder: (tableId: string, sectionName: string, items: CartItem[]) => Order;
  requestBill: (tableId: string, sectionName: string) => void;
  settleBill: (orderId: string, paymentMethod: 'UPI' | 'Card' | 'Cash') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'hms_system_state';
const CHANNEL_NAME = 'hms_broadcast_channel';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from local storage or defaults
  const [menu, setMenu] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_menu`);
    return saved ? JSON.parse(saved) : INITIAL_MENU;
  });

  const [sections, setSections] = useState<Section[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_sections`);
    return saved ? JSON.parse(saved) : INITIAL_SECTIONS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_orders`);
    return saved ? JSON.parse(saved) : [];
  });

  const [reviews] = useState<CustomerReview[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_reviews`);
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  const [tableSessions, setTableSessions] = useState<TableSession[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_sessions`);
    return saved ? JSON.parse(saved) : [];
  });

  // --- SYNC WITH MONGODB BACKEND ON MOUNT ---
  useEffect(() => {
    const syncWithBackend = async () => {
      try {
        const [menuRes, secRes, ordRes] = await Promise.all([
          fetch('/api/menu').catch(() => null),
          fetch('/api/sections').catch(() => null),
          fetch('/api/orders').catch(() => null)
        ]);

        if (menuRes && menuRes.ok) {
          const dbMenu = await menuRes.json();
          if (dbMenu.length > 0) {
            setMenu(dbMenu);
            localStorage.setItem(`${LOCAL_STORAGE_KEY}_menu`, JSON.stringify(dbMenu));
          } else {
            // Seed MongoDB with initial menu & sections
            await fetch('/api/seed', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ menu: INITIAL_MENU, sections: INITIAL_SECTIONS, reviews: INITIAL_REVIEWS })
            }).catch(() => {});
          }
        }

        if (secRes && secRes.ok) {
          const dbSections = await secRes.json();
          if (dbSections.length > 0) {
            setSections(dbSections);
            localStorage.setItem(`${LOCAL_STORAGE_KEY}_sections`, JSON.stringify(dbSections));
          }
        }

        if (ordRes && ordRes.ok) {
          const dbOrders = await ordRes.json();
          if (dbOrders.length > 0) {
            setOrders(dbOrders);
            localStorage.setItem(`${LOCAL_STORAGE_KEY}_orders`, JSON.stringify(dbOrders));
          }
        }
      } catch (err) {
        console.log('MongoDB server sync note: Running in synchronized hybrid mode.');
      }
    };

    syncWithBackend();
  }, []);

  // Broadcast Channel for live cross-tab updates
  useEffect(() => {
    const channel = new BroadcastChannel(CHANNEL_NAME);

    const handleMessage = (event: MessageEvent) => {
      const { type, payload } = event.data;
      if (type === 'STATE_UPDATE') {
        if (payload.menu) setMenu(payload.menu);
        if (payload.sections) setSections(payload.sections);
        if (payload.orders) setOrders(payload.orders);
        if (payload.tableSessions) setTableSessions(payload.tableSessions);
      }
    };

    channel.addEventListener('message', handleMessage);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `${LOCAL_STORAGE_KEY}_menu` && e.newValue) setMenu(JSON.parse(e.newValue));
      if (e.key === `${LOCAL_STORAGE_KEY}_sections` && e.newValue) setSections(JSON.parse(e.newValue));
      if (e.key === `${LOCAL_STORAGE_KEY}_orders` && e.newValue) setOrders(JSON.parse(e.newValue));
      if (e.key === `${LOCAL_STORAGE_KEY}_sessions` && e.newValue) setTableSessions(JSON.parse(e.newValue));
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      channel.removeEventListener('message', handleMessage);
      channel.close();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const saveAndBroadcast = (
    updatedMenu: MenuItem[], 
    updatedSections: Section[], 
    updatedOrders: Order[], 
    updatedSessions: TableSession[]
  ) => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_menu`, JSON.stringify(updatedMenu));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_sections`, JSON.stringify(updatedSections));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_orders`, JSON.stringify(updatedOrders));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_sessions`, JSON.stringify(updatedSessions));

    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.postMessage({
      type: 'STATE_UPDATE',
      payload: { 
        menu: updatedMenu, 
        sections: updatedSections, 
        orders: updatedOrders,
        tableSessions: updatedSessions 
      }
    });
    channel.close();
  };

  // Helper to find the active running session for a table (or joint table)
  const getActiveSession = (tableId: string, sectionName: string): TableSession | undefined => {
    return tableSessions.find(s => 
      s.sectionName === sectionName && 
      (s.status === 'active' || s.status === 'billing_requested') &&
      (s.primaryTableId === tableId || (s.joinedTableIds && s.joinedTableIds.includes(tableId)))
    );
  };

  // --- 1. RUNNING TAB: ORDER ANYTIME WITHOUT PAYING FIRST ---
  const placeOrderRound = async (
    tableId: string, 
    sectionName: string, 
    items: CartItem[], 
    notes?: string
  ): Promise<{ order: Order; session: TableSession }> => {
    let activeSession = getActiveSession(tableId, sectionName);

    const roundTotal = items.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
    const roundNumber = activeSession ? activeSession.rounds.length + 1 : 1;

    if (!activeSession) {
      activeSession = {
        sessionId: `sess-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
        primaryTableId: tableId,
        sectionName,
        joinedTableIds: [],
        guestCount: 2,
        rounds: [],
        activeOrderIds: [],
        subtotal: 0,
        status: 'active',
        createdAt: new Date().toISOString()
      };
    }

    const newOrder: Order = {
      id: `ord-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
      tableId,
      sectionName,
      sessionId: activeSession.sessionId,
      roundNumber,
      items,
      status: 'received',
      timestamp: new Date().toISOString(),
      totalAmount: roundTotal,
      paymentStatus: 'pending',
      billingRequested: false
    };

    // Update the running tab session
    const updatedSession: TableSession = {
      ...activeSession,
      status: 'active', // If they order more, keep tab active
      subtotal: activeSession.subtotal + roundTotal,
      rounds: [
        ...activeSession.rounds,
        {
          roundNumber,
          items,
          timestamp: new Date().toISOString(),
          notes: notes || ''
        }
      ],
      activeOrderIds: [...activeSession.activeOrderIds, newOrder.id]
    };

    const newOrders = [newOrder, ...orders];
    const newSessions = tableSessions.some(s => s.sessionId === updatedSession.sessionId)
      ? tableSessions.map(s => s.sessionId === updatedSession.sessionId ? updatedSession : s)
      : [...tableSessions, updatedSession];

    // Mark the table (and any joined tables) as occupied
    const newSections = sections.map(section => {
      if (section.name === sectionName) {
        return {
          ...section,
          tables: section.tables.map(table => {
            if (table.id === updatedSession.primaryTableId || (updatedSession.joinedTableIds && updatedSession.joinedTableIds.includes(table.id))) {
              return { 
                ...table, 
                status: 'occupied' as const, 
                currentOrderId: newOrder.id,
                currentSessionId: updatedSession.sessionId
              };
            }
            return table;
          })
        };
      }
      return section;
    });

    setOrders(newOrders);
    setTableSessions(newSessions);
    setSections(newSections);
    saveAndBroadcast(menu, newSections, newOrders, newSessions);

    // Sync to MongoDB server in background
    fetch('/api/orders/place', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableId, sectionName, items, notes })
    }).catch(() => {});

    return { order: newOrder, session: updatedSession };
  };

  // --- 2. REQUEST BILL (CALLED ONCE AT THE END OF DINING) ---
  const requestBillForSession = async (tableId: string, sectionName: string): Promise<TableSession | undefined> => {
    const session = getActiveSession(tableId, sectionName);
    if (!session) return undefined;

    const updatedSession: TableSession = {
      ...session,
      status: 'billing_requested'
    };

    const newSessions = tableSessions.map(s => s.sessionId === session.sessionId ? updatedSession : s);

    // Mark orders in this session as billingRequested
    const newOrders = orders.map(order => {
      if (order.sessionId === session.sessionId) {
        return { ...order, billingRequested: true };
      }
      return order;
    });

    // Mark tables as billing_requested
    const newSections = sections.map(section => {
      if (section.name === sectionName) {
        return {
          ...section,
          tables: section.tables.map(table => {
            if (table.id === session.primaryTableId || (session.joinedTableIds && session.joinedTableIds.includes(table.id))) {
              return { ...table, status: 'billing_requested' as const };
            }
            return table;
          })
        };
      }
      return section;
    });

    setTableSessions(newSessions);
    setOrders(newOrders);
    setSections(newSections);
    saveAndBroadcast(menu, newSections, newOrders, newSessions);

    // Sync to MongoDB server in background
    fetch('/api/sessions/request-bill', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableId, sectionName })
    }).catch(() => {});

    return updatedSession;
  };

  // --- 3. SETTLE BILL (PAY ONCE FOR THE ENTIRE RUNNING TAB / JOINT GROUP) ---
  const settleSessionBill = async (sessionId: string, paymentMethod: 'UPI' | 'Card' | 'Cash') => {
    const session = tableSessions.find(s => s.sessionId === sessionId);
    if (!session) return;

    const updatedSession: TableSession = {
      ...session,
      status: 'completed'
    };

    const newSessions = tableSessions.map(s => s.sessionId === sessionId ? updatedSession : s);

    // Mark all orders for this table session as completed and paid
    const newOrders = orders.map(order => {
      if (order.sessionId === sessionId || (order.tableId === session.primaryTableId && order.status !== 'completed')) {
        return {
          ...order,
          status: 'completed' as const,
          paymentStatus: 'completed' as const,
          paymentMethod
        };
      }
      return order;
    });

    // Free up primary table AND all joint tables together!
    const allTableIdsToFree = [session.primaryTableId, ...(session.joinedTableIds || [])];
    const newSections = sections.map(section => {
      if (section.name === session.sectionName) {
        return {
          ...section,
          tables: section.tables.map(table => {
            if (allTableIdsToFree.includes(table.id)) {
              return { 
                ...table, 
                status: 'free' as const, 
                currentOrderId: undefined,
                currentSessionId: undefined,
                joinedWith: undefined
              };
            }
            return table;
          })
        };
      }
      return section;
    });

    setTableSessions(newSessions);
    setOrders(newOrders);
    setSections(newSections);
    saveAndBroadcast(menu, newSections, newOrders, newSessions);

    // Sync to MongoDB backend
    fetch('/api/sessions/settle-bill', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, paymentMethod })
    }).catch(() => {});
  };

  // --- 4. JOINT TABLES: MERGE MULTIPLE TABLES TOGETHER (CONSOLIDATES BILLS & ROUNDS) ---
  const joinTables = async (primaryTableId: string, joinTableIds: string[], sectionName: string, guestCount: number = 4) => {
    let session = getActiveSession(primaryTableId, sectionName);

    const mergedJoinedIds = Array.from(new Set([...(session?.joinedTableIds || []), ...joinTableIds]));

    if (!session) {
      session = {
        sessionId: `sess-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
        primaryTableId,
        sectionName,
        joinedTableIds: mergedJoinedIds,
        guestCount,
        rounds: [],
        activeOrderIds: [],
        subtotal: 0,
        status: 'active',
        createdAt: new Date().toISOString()
      };
    } else {
      session = {
        ...session,
        joinedTableIds: mergedJoinedIds,
        guestCount
      };
    }

    let updatedSession = { ...session };
    let retiredSessionIds: string[] = [];
    let updatedOrders = [...orders];

    // Merge in rounds and bills from the joined tables
    for (const jId of joinTableIds) {
      const otherSession = tableSessions.find(s => 
        s.sectionName === sectionName && 
        (s.primaryTableId === jId || (s.joinedTableIds && s.joinedTableIds.includes(jId))) &&
        s.sessionId !== updatedSession.sessionId &&
        s.status !== 'completed'
      );

      if (otherSession) {
        retiredSessionIds.push(otherSession.sessionId);
        const currentRoundCount = updatedSession.rounds.length;

        const mergedRounds = otherSession.rounds.map((rnd, idx) => ({
          ...rnd,
          roundNumber: currentRoundCount + idx + 1,
          notes: rnd.notes ? `${rnd.notes} (From ${jId})` : `(From ${jId})`
        }));

        updatedSession.rounds = [...updatedSession.rounds, ...mergedRounds];
        updatedSession.subtotal += otherSession.subtotal;
        updatedSession.activeOrderIds = Array.from(new Set([...updatedSession.activeOrderIds, ...otherSession.activeOrderIds]));

        // Reassign orders
        updatedOrders = updatedOrders.map(ord => {
          if (ord.sessionId === otherSession.sessionId) {
            return { ...ord, sessionId: updatedSession.sessionId };
          }
          return ord;
        });
      }

      // Check any orders directly for this table
      const pendingOrdersForTable = updatedOrders.filter(
        o => o.tableId === jId && o.status !== 'completed' && o.sessionId !== updatedSession.sessionId
      );

      for (const ord of pendingOrdersForTable) {
        if (!updatedSession.activeOrderIds.includes(ord.id)) {
          updatedSession.activeOrderIds.push(ord.id);
          updatedSession.rounds.push({
            roundNumber: updatedSession.rounds.length + 1,
            items: ord.items,
            timestamp: ord.timestamp,
            notes: `(From ${jId})`
          });
          updatedSession.subtotal += ord.totalAmount;
        }
        updatedOrders = updatedOrders.map(o => o.id === ord.id ? { ...o, sessionId: updatedSession.sessionId } : o);
      }
    }

    const newSessions = tableSessions
      .filter(s => !retiredSessionIds.includes(s.sessionId))
      .map(s => s.sessionId === updatedSession.sessionId ? updatedSession : s);

    if (!newSessions.some(s => s.sessionId === updatedSession.sessionId)) {
      newSessions.push(updatedSession);
    }

    // Mark primary table and all joined tables as occupied, pointing joinedWith to primaryTableId
    const newSections = sections.map(section => {
      if (section.name === sectionName) {
        return {
          ...section,
          tables: section.tables.map(table => {
            if (table.id === primaryTableId) {
              return { 
                ...table, 
                status: 'occupied' as const, 
                currentSessionId: updatedSession.sessionId,
                joinedWith: undefined 
              };
            }
            if (mergedJoinedIds.includes(table.id)) {
              return { 
                ...table, 
                status: 'occupied' as const, 
                currentSessionId: updatedSession.sessionId,
                joinedWith: primaryTableId 
              };
            }
            return table;
          })
        };
      }
      return section;
    });

    setTableSessions(newSessions);
    setOrders(updatedOrders);
    setSections(newSections);
    saveAndBroadcast(menu, newSections, updatedOrders, newSessions);

    fetch('/api/tables/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ primaryTableId, joinTableIds: mergedJoinedIds, sectionName, guestCount })
    }).catch(() => {});
  };

  // Unjoin a table from a group
  const unjoinTable = async (tableIdToFree: string, sectionName: string) => {
    const session = tableSessions.find(s => 
      s.sectionName === sectionName && 
      s.joinedTableIds && s.joinedTableIds.includes(tableIdToFree) &&
      s.status === 'active'
    );

    let newSessions = tableSessions;
    if (session) {
      const updatedSession: TableSession = {
        ...session,
        joinedTableIds: session.joinedTableIds?.filter(id => id !== tableIdToFree) || []
      };
      newSessions = tableSessions.map(s => s.sessionId === session.sessionId ? updatedSession : s);
    }

    const newSections = sections.map(section => {
      if (section.name === sectionName) {
        return {
          ...section,
          tables: section.tables.map(table => {
            if (table.id === tableIdToFree) {
              return { 
                ...table, 
                status: 'free' as const, 
                currentSessionId: undefined, 
                currentOrderId: undefined, 
                joinedWith: undefined 
              };
            }
            return table;
          })
        };
      }
      return section;
    });

    setTableSessions(newSessions);
    setSections(newSections);
    saveAndBroadcast(menu, newSections, orders, newSessions);

    fetch('/api/tables/unjoin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableIdToFree, sectionName })
    }).catch(() => {});
  };

  // --- 5. UPDATE ORDER STATUS (KITCHEN KDS) ---
  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    const newOrders = orders.map(order => {
      if (order.id === orderId) {
        return { ...order, status };
      }
      return order;
    });

    let newSections = [...sections];
    let newSessions = [...tableSessions];

    if (status === 'completed') {
      const targetOrder = orders.find(o => o.id === orderId);
      if (targetOrder) {
        // If order belongs to a session and all orders in session are completed, free table
        const session = targetOrder.sessionId ? tableSessions.find(s => s.sessionId === targetOrder.sessionId) : null;
        if (session) {
          const allCompleted = session.activeOrderIds.every(id => {
            const ord = newOrders.find(o => o.id === id);
            return ord ? ord.status === 'completed' : true;
          });
          if (allCompleted) {
            newSessions = tableSessions.map(s => s.sessionId === session.sessionId ? { ...s, status: 'completed' as const } : s);
            const tablesToFree = [session.primaryTableId, ...(session.joinedTableIds || [])];
            newSections = sections.map(sec => {
              if (sec.name === session.sectionName) {
                return {
                  ...sec,
                  tables: sec.tables.map(t => tablesToFree.includes(t.id) ? { ...t, status: 'free' as const, currentOrderId: undefined, currentSessionId: undefined, joinedWith: undefined } : t)
                };
              }
              return sec;
            });
          }
        } else {
          newSections = sections.map(section => {
            if (section.name === targetOrder.sectionName) {
              return {
                ...section,
                tables: section.tables.map(table => {
                  if (table.id === targetOrder.tableId) {
                    return { ...table, status: 'free' as const, currentOrderId: undefined, currentSessionId: undefined };
                  }
                  return table;
                })
              };
            }
            return section;
          });
        }
      }
    }

    setOrders(newOrders);
    setSections(newSections);
    setTableSessions(newSessions);
    saveAndBroadcast(menu, newSections, newOrders, newSessions);

    fetch(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    }).catch(() => {});
  };

  // --- LEGACY HELPERS ---
  const placeOrder = (tableId: string, sectionName: string, items: CartItem[]): Order => {
    let placedOrder: Order | null = null;
    placeOrderRound(tableId, sectionName, items).then(res => {
      placedOrder = res.order;
    });
    return placedOrder || {
      id: `ord-${Date.now()}`,
      tableId,
      sectionName,
      items,
      status: 'received',
      timestamp: new Date().toISOString(),
      totalAmount: items.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0),
      paymentStatus: 'pending',
      billingRequested: false
    };
  };

  const requestBill = (tableId: string, sectionName: string) => {
    requestBillForSession(tableId, sectionName);
  };

  const settleBill = (orderId: string, paymentMethod: 'UPI' | 'Card' | 'Cash') => {
    const ord = orders.find(o => o.id === orderId);
    if (ord && ord.sessionId) {
      settleSessionBill(ord.sessionId, paymentMethod);
    } else if (ord) {
      const activeSession = getActiveSession(ord.tableId, ord.sectionName);
      if (activeSession) {
        settleSessionBill(activeSession.sessionId, paymentMethod);
      }
    }
  };

  // --- MENU MANAGEMENT ---
  const addMenuItem = (item: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...item,
      id: `menu-${Math.random().toString(36).substr(2, 9)}`
    };
    const newMenu = [...menu, newItem];
    setMenu(newMenu);
    saveAndBroadcast(newMenu, sections, orders, tableSessions);

    fetch('/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem)
    }).catch(() => {});
  };

  const updateMenuItem = (updatedItem: MenuItem) => {
    const newMenu = menu.map(item => item.id === updatedItem.id ? updatedItem : item);
    setMenu(newMenu);
    saveAndBroadcast(newMenu, sections, orders, tableSessions);

    fetch(`/api/menu/${updatedItem.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedItem)
    }).catch(() => {});
  };

  const deleteMenuItem = (id: string) => {
    const newMenu = menu.filter(item => item.id !== id);
    setMenu(newMenu);
    saveAndBroadcast(newMenu, sections, orders, tableSessions);

    fetch(`/api/menu/${id}`, {
      method: 'DELETE'
    }).catch(() => {});
  };

  return (
    <AppContext.Provider value={{
      menu,
      sections,
      orders,
      reviews,
      tableSessions,
      getActiveSession,
      placeOrderRound,
      requestBillForSession,
      settleSessionBill,
      joinTables,
      unjoinTable,
      updateOrderStatus,
      addMenuItem,
      updateMenuItem,
      deleteMenuItem,
      placeOrder,
      requestBill,
      settleBill
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
