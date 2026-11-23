import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { CartItem, MenuItem, Order } from '../types';
import { HOTEL_INFO } from '../mockData';
import { MockPayment } from './MockPayment';
import { RestaurantHomePage } from './RestaurantHomePage';
import { AiDiningAssistant } from './AiDiningAssistant';
import { RestaurantLogo } from './RestaurantLogo';

import { 
  Search, Plus, Minus, ShoppingBag, Info, Clock, 
  Phone, MapPin, Coffee, Utensils, X, ChevronRight, 
  CreditCard, Sparkles, AlertCircle, CheckCircle, Heart
} from 'lucide-react';
import QRCode from 'qrcode';

export const CustomerView: React.FC = () => {
  const { 
    menu, 
    sections, 
    orders, 
    tableSessions,
    placeOrderRound, 
    requestBillForSession, 
    settleSessionBill, 
    getActiveSession 
  } = useApp();
  
  // Ref for landing screen QR code canvas
  const landingQrCanvasRef = useRef<HTMLCanvasElement>(null);

  // Extract table and section from URL query params
  const [tableId, setTableId] = useState<string | null>(null);
  const [sectionName, setSectionName] = useState<string | null>(null);

  // If no table/section selected in URL, let them select one (Mock Scan)
  const [tempSection, setTempSection] = useState('');
  const [tempTable, setTempTable] = useState('');


  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartNotes, setCartNotes] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Menu filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [vegOnly, setVegOnly] = useState(false);

  // Active Order state for this table
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  // Payment modal state
  const [showPayment, setShowPayment] = useState(false);

  // Parse URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sec = params.get('section');
    const tab = params.get('table');
    if (sec && tab) {
      setSectionName(sec);
      setTableId(tab);
    }
  }, []);

  // Generate QR code for landing screen
  useEffect(() => {
    if (!tableId || !sectionName) {
      setTimeout(() => {
        if (landingQrCanvasRef.current) {
          let url = window.location.origin + '/';
          if (tempSection && tempTable) {
            url = `${window.location.origin}/?section=${encodeURIComponent(tempSection)}&table=${encodeURIComponent(tempTable)}`;
          }
          QRCode.toCanvas(landingQrCanvasRef.current, url, {
            width: 140,
            margin: 1,
            color: {
              dark: '#ea580c',
              light: '#ffffff'
            }
          }, (err) => {
            if (err) console.error("Error generating landing QR", err);
          });
        }
      }, 50);
    }
  }, [tableId, sectionName, tempSection, tempTable]);

  // Sync active order for this table
  useEffect(() => {
    if (tableId && sectionName) {
      const active = orders.find(
        o => o.tableId === tableId && 
             o.sectionName === sectionName && 
             o.status !== 'completed'
      );
      setActiveOrder(active || null);
    }
  }, [orders, tableId, sectionName]);

  const handleMockScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempSection && tempTable) {
      setSectionName(tempSection);
      setTableId(tempTable);
      
      // Update URL without refreshing page
      const newUrl = `${window.location.origin}${window.location.pathname}?section=${encodeURIComponent(tempSection)}&table=${encodeURIComponent(tempTable)}`;
      window.history.pushState({ path: newUrl }, '', newUrl);
    }
  };

  const getTableName = () => {
    if (!sectionName || !tableId) return '';
    const section = sections.find(s => s.name === sectionName);
    const table = section?.tables.find(t => t.id === tableId);
    return table ? `${sectionName} - ${table.name}` : `${sectionName} - ${tableId}`;
  };

  // Add to cart logic
  const addToCart = (item: MenuItem) => {
    setCart(prevCart => {
      const existing = prevCart.find(i => i.menuItem.id === item.id);
      if (existing) {
        return prevCart.map(i => 
          i.menuItem.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevCart, { menuItem: item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => {
      const existing = prevCart.find(i => i.menuItem.id === itemId);
      if (existing && existing.quantity > 1) {
        return prevCart.map(i => 
          i.menuItem.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
        );
      }
      return prevCart.filter(i => i.menuItem.id !== itemId);
    });
  };

  const getCartCount = () => cart.reduce((sum, item) => sum + item.quantity, 0);
  const getCartTotal = () => cart.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);

  // 1. Instant Customer-Friendly Order ("Send to Kitchen" - Order Anytime Without Upfront Pay)
  const handleSendToKitchen = async () => {
    if (!tableId || !sectionName || cart.length === 0) return;

    const finalCart = cart.map(item => ({
      ...item,
      notes: cartNotes
    }));

    await placeOrderRound(tableId, sectionName, finalCart, cartNotes);

    // Reset current round cart
    setCart([]);
    setCartNotes('');
    setIsCartOpen(false);
  };

  // 2. Settle the Bill Once at the End of the Dining Session
  const handlePaymentSuccess = async (method: 'UPI' | 'Card') => {
    if (!tableId || !sectionName) return;
    const currentSession = getActiveSession(tableId, sectionName);

    if (currentSession) {
      await settleSessionBill(currentSession.sessionId, method);
    } else if (activeOrder) {
      // Fallback for single order
      await settleSessionBill(activeOrder.sessionId || activeOrder.id, method);
    }

    setCart([]);
    setCartNotes('');
    setIsCartOpen(false);
    setShowPayment(false);
  };

  // Filter menu items
  const filteredMenu = menu.filter(item => {
    if (!item.isAvailable) return false;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeCategory === 'All' || 
      (activeCategory === 'Appetizers' && (item.category === 'Appetizers' || item.category === 'Starters')) ||
      (activeCategory === 'Mains' && (item.category === 'Mains' || item.category === 'Main Course' || item.category === 'Chef Specials')) ||
      (activeCategory === 'Biryani & Grills' && (item.category === 'Rice & Biryanis' || item.category === 'Tandoori & Grills')) ||
      (activeCategory === 'Desserts' && item.category === 'Desserts') ||
      (activeCategory === 'Beverages' && item.category === 'Beverages') ||
      item.category === activeCategory;

    const matchesVeg = !vegOnly || item.isVeg;
    return matchesSearch && matchesCategory && matchesVeg;
  });

  const categories = ['All', 'Appetizers', 'Mains', 'Biryani & Grills', 'Desserts', 'Beverages'];

  // Authentic Restaurant Home Page (No QR Card)
  if (!tableId || !sectionName) {
    return (
      <RestaurantHomePage 
        sections={sections}
        menu={menu}
        onSelectTable={(sec, tbl) => {
          const newUrl = `${window.location.origin}${window.location.pathname}?section=${encodeURIComponent(sec)}&table=${encodeURIComponent(tbl)}`;
          window.history.pushState({}, '', newUrl);
          setSectionName(sec);
          setTableId(tbl);
        }}
        onBrowseMenu={() => {
          if (sections.length > 0 && sections[0].tables.length > 0) {
            const sec = sections[0].name;
            const tbl = sections[0].tables[0].id;
            const newUrl = `${window.location.origin}${window.location.pathname}?section=${encodeURIComponent(sec)}&table=${encodeURIComponent(tbl)}`;
            window.history.pushState({}, '', newUrl);
            setSectionName(sec);
            setTableId(tbl);
          }
        }}
      />
    );
  }


  return (
    <div className="customer-layout">
      {/* Animated Glowing Ambient Orbs Background */}
      <div className="orb-bg-container">
        <div className="glow-orb orb-orange" />
        <div className="glow-orb orb-rose" />
        <div className="glow-orb orb-purple" />
        <div className="glow-orb orb-amber" />
      </div>

      {/* Full Prominent Luxury Header */}
      <header style={styles.header}>
        <div style={styles.headerTop}>
          <div 
            onClick={() => {
              const newUrl = `${window.location.origin}${window.location.pathname}`;
              window.history.pushState({}, '', newUrl);
              setTableId(null);
              setSectionName(null);
            }}
            style={styles.brandClickable}
            title="Click to return to Home Page"
          >
            <div style={styles.headerLogoWrapper}>
              <RestaurantLogo size={52} />
            </div>
            <h1 style={styles.hotelTitle}>{HOTEL_INFO.name}</h1>
            <p style={styles.hotelSubTagline}>{HOTEL_INFO.tagline.toUpperCase()}</p>
          </div>
        </div>
      </header>


      {/* Main Container */}
      <div style={styles.mainContent}>
        
        {/* Running Tab & Joint Table Dining Banner */}
        {tableId && sectionName && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            backgroundColor: 'rgba(24, 24, 27, 0.85)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            borderRadius: '16px',
            padding: '14px 20px',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                backgroundColor: 'rgba(234, 88, 12, 0.15)',
                border: '1px solid #ea580c',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Utensils size={18} color="#ea580c" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#fafafa', margin: 0 }}>
                    {getTableName()}
                  </h4>
                  {getActiveSession(tableId, sectionName)?.joinedTableIds && getActiveSession(tableId, sectionName)!.joinedTableIds!.length > 0 && (
                    <span style={{
                      backgroundColor: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid #10b981',
                      color: '#10b981',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '12px'
                    }}>
                      👥 Joint Table with {getActiveSession(tableId, sectionName)!.joinedTableIds!.join(', ')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* If table has active running tab */}
            {getActiveSession(tableId, sectionName) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '11px', color: '#a1a1aa', display: 'block' }}>
                    {getActiveSession(tableId, sectionName)!.rounds.length} Round{getActiveSession(tableId, sectionName)!.rounds.length > 1 ? 's' : ''} Ordered
                  </span>
                  <span style={{ fontSize: '16px', fontWeight: 800, color: '#ea580c' }}>
                    Total: ₹{(getActiveSession(tableId, sectionName)!.subtotal * 1.05).toFixed(2)}
                  </span>
                </div>

                {!getActiveSession(tableId, sectionName)!.status.includes('billing') ? (
                  <button
                    onClick={() => requestBillForSession(tableId, sectionName)}
                    style={{
                      backgroundColor: '#ea580c',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '8px 16px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)'
                    }}
                  >
                    Request Bill & Pay
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setCart([]);
                      setShowPayment(true);
                    }}
                    style={{
                      backgroundColor: '#10b981',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '8px 16px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                    }}
                  >
                    Pay ₹{(getActiveSession(tableId, sectionName)!.subtotal * 1.05).toFixed(2)} Now
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Active Order Tracker (Latest Kitchen Round) */}
        {activeOrder && (
          <div style={styles.trackerCard} className="animate-slide-up">
            <div style={styles.trackerHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} color="#ea580c" />
                <h3 style={styles.trackerTitle}>
                  Latest Order Status {activeOrder.roundNumber ? `(Round #${activeOrder.roundNumber})` : ''}
                </h3>
              </div>
              <span style={{ ...styles.statusBadge, ...statusStyles[activeOrder.status] }}>
                {activeOrder.status}
              </span>
            </div>

            {/* Stepper progress */}
            <div style={styles.stepperContainer}>
              {['received', 'preparing', 'ready', 'served'].map((step, idx) => {
                const stepNames = ['Received', 'Preparing', 'Ready', 'Served'];
                const orderSteps = ['received', 'preparing', 'ready', 'served', 'completed'];
                const currentIdx = orderSteps.indexOf(activeOrder.status);
                const stepIdx = orderSteps.indexOf(step);
                const isCompleted = currentIdx >= stepIdx;
                const isActive = activeOrder.status === step;
                
                return (
                  <div key={step} style={styles.step}>
                    <div style={{
                      ...styles.stepCircle,
                      backgroundColor: isCompleted ? '#ea580c' : '#e7e5e4',
                      border: isActive ? '3px solid #ffedd5' : 'none',
                    }}>
                      {isCompleted && <CheckCircle size={14} color="#fff" />}
                    </div>
                    <span style={{ 
                      ...styles.stepLabel, 
                      color: isCompleted ? '#ea580c' : '#78716c',
                      fontWeight: isActive || isCompleted ? 600 : 400
                    }}>
                      {stepNames[idx]}
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={styles.trackerFooter}>
              <p style={styles.orderIdText}>Ticket: {activeOrder.id.toUpperCase()}</p>
              
              {!getActiveSession(tableId || '', sectionName || '')?.status.includes('billing') && (
                <button 
                  onClick={() => requestBillForSession(tableId!, sectionName!)} 
                  style={styles.requestBillBtn}
                >
                  Request Final Bill
                </button>
              )}

              {getActiveSession(tableId || '', sectionName || '')?.status === 'billing_requested' && (
                <div style={styles.billingAlert}>
                  <AlertCircle size={16} color="#d97706" />
                  <span>Waiter will arrive shortly with the bill. Or pay online below:</span>
                  <button 
                    onClick={() => {
                      setCart([]);
                      setShowPayment(true);
                    }}
                    style={styles.payNowBtn}
                  >
                    Pay ₹{((getActiveSession(tableId || '', sectionName || '')?.subtotal || activeOrder.totalAmount) * 1.05).toFixed(2)} Once
                  </button>
                </div>
              )}
            </div>
          </div>
        )}



        {/* Search & Filter Bar */}
        <div style={styles.filterSection}>
          <div style={styles.searchWrapper}>
            <Search size={18} color="#a8a29e" style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search delicious dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
            {searchQuery && (
              <X size={16} color="#78716c" onClick={() => setSearchQuery('')} style={styles.clearSearchIcon} />
            )}
          </div>

          <div style={styles.filterRow}>
            {/* Category horizontal scroll */}
            <div style={styles.categoriesScroll}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    ...styles.categoryTab,
                    ...(activeCategory === cat ? styles.activeCategoryTab : {})
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Veg Switch */}
            <button 
              onClick={() => setVegOnly(!vegOnly)}
              style={{
                ...styles.vegFilterBtn,
                borderColor: vegOnly ? '#10b981' : '#e7e5e4',
                color: vegOnly ? '#10b981' : '#78716c',
                backgroundColor: vegOnly ? '#ecfdf5' : '#ffffff'
              }}
            >
              Veg Only
            </button>
          </div>
        </div>

        {/* Menu Items Grid */}
        <div style={styles.menuGrid}>
          {filteredMenu.length > 0 ? (
            filteredMenu.map(item => {
              const cartItem = cart.find(c => c.menuItem.id === item.id);
              return (
                <div key={item.id} style={styles.menuCard} className="animate-scale-in">
                  <div style={styles.cardImageWrapper}>
                    <img src={item.image} alt={item.name} style={styles.cardImage} />
                    <span style={item.isVeg ? styles.vegBadge : styles.nonVegBadge}>
                      {item.isVeg ? 'Veg' : 'Non-Veg'}
                    </span>
                  </div>

                  <div style={styles.cardBody}>
                    <div style={styles.cardHeader}>
                      <h3 style={styles.itemName}>{item.name}</h3>
                      <span style={styles.itemPrice}>₹{item.price}</span>
                    </div>
                    <p style={styles.itemDesc}>{item.description}</p>
                    
                    <div style={styles.cardFooter}>
                      {cartItem ? (
                        <div style={styles.quantityWidget}>
                          <button onClick={() => removeFromCart(item.id)} style={styles.qtyBtn}>
                            <Minus size={14} color="#ea580c" />
                          </button>
                          <span style={styles.qtyText}>{cartItem.quantity}</span>
                          <button onClick={() => addToCart(item)} style={styles.qtyBtn}>
                            <Plus size={14} color="#ea580c" />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => addToCart(item)} style={styles.addCartBtn} className="shine-btn">
                          Add to Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={styles.noResults}>
              <Utensils size={36} color="#a8a29e" />
              <p style={{ marginTop: '8px', color: '#78716c', fontWeight: 500 }}>No items match your preferences.</p>
            </div>
          )}
        </div>

        {/* Footer Credit */}
        <footer style={{ marginTop: '40px', padding: '24px 0', borderTop: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: '#71717a' }}>
            © {new Date().getFullYear()} {HOTEL_INFO.name}. All Rights Reserved.
          </p>
          <p style={{ marginTop: '6px', fontSize: '13px', color: '#a1a1aa', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            Made with <Heart size={14} color="#ef4444" fill="#ef4444" /> by <strong style={{ color: '#f59e0b', fontWeight: 700 }}>Gaurav Gatty</strong> and <strong style={{ color: '#f59e0b', fontWeight: 700 }}>Dheeraj</strong>
          </p>
        </footer>
      </div>

      {/* Sticky Bottom Cart Bar */}
      {cart.length > 0 && (
        <div style={styles.stickyCartBar} className="glass-panel animate-slide-up">
          <div style={styles.stickyCartLeft}>
            <div style={styles.cartIconBadge}>
              <ShoppingBag size={20} color="#ffffff" />
              <span style={styles.cartBadgeCount}>{getCartCount()}</span>
            </div>
            <div>
              <p style={styles.cartSummaryText}>{getCartCount()} Item{getCartCount() > 1 ? 's' : ''} added</p>
              <p style={styles.cartPriceText}>₹{getCartTotal().toFixed(2)}</p>
            </div>
          </div>
          <button onClick={() => setIsCartOpen(true)} style={styles.viewCartBtn} className="shine-btn">
            View Cart <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Slide-over Cart Panel */}
      {isCartOpen && (
        <div style={styles.cartDrawerOverlay} onClick={() => setIsCartOpen(false)}>
          <div style={styles.cartDrawer} onClick={(e) => e.stopPropagation()} className="animate-slide-up">
            <div style={styles.drawerHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShoppingBag size={20} color="#ea580c" />
                <h2 style={styles.drawerTitle}>Your Cart</h2>
              </div>
              <button onClick={() => setIsCartOpen(false)} style={styles.drawerCloseBtn}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.drawerContent}>
              {cart.map(item => (
                <div key={item.menuItem.id} style={styles.cartItemRow}>
                  <div style={styles.cartItemLeft}>
                    <span style={item.menuItem.isVeg ? styles.vegSquare : styles.nonVegSquare}></span>
                    <div>
                      <h4 style={styles.cartItemName}>{item.menuItem.name}</h4>
                      <p style={styles.cartItemPrice}>₹{item.menuItem.price} &times; {item.quantity}</p>
                    </div>
                  </div>
                  <div style={styles.cartItemRight}>
                    <div style={styles.drawerQuantityWidget}>
                      <button onClick={() => removeFromCart(item.menuItem.id)} style={styles.drawerQtyBtn}>
                        <Minus size={12} color="#78716c" />
                      </button>
                      <span style={styles.drawerQtyText}>{item.quantity}</span>
                      <button onClick={() => addToCart(item.menuItem)} style={styles.drawerQtyBtn}>
                        <Plus size={12} color="#78716c" />
                      </button>
                    </div>
                    <span style={styles.cartItemRowTotal}>₹{item.menuItem.price * item.quantity}</span>
                  </div>
                </div>
              ))}

              <div style={styles.notesSection}>
                <label style={styles.notesLabel}>Special Cooking Instructions / Notes</label>
                <textarea
                  placeholder="e.g. make it extra spicy, no onions, etc."
                  value={cartNotes}
                  onChange={(e) => setCartNotes(e.target.value)}
                  style={styles.notesTextarea}
                />
              </div>

              <div style={styles.billDetails}>
                <div style={styles.billRow}>
                  <span>Item Total</span>
                  <span>₹{getCartTotal().toFixed(2)}</span>
                </div>
                <div style={styles.billRow}>
                  <span>Taxes & Charges (GST 5%)</span>
                  <span>₹{(getCartTotal() * 0.05).toFixed(2)}</span>
                </div>
                <div style={{ ...styles.billRow, borderTop: '1px dashed #e7e5e4', paddingTop: '12px', marginTop: '12px' }}>
                  <span style={{ fontWeight: 700, fontSize: '16px' }}>Grand Total</span>
                  <span style={{ fontWeight: 800, fontSize: '18px', color: '#ea580c' }}>
                    ₹{(getCartTotal() * 1.05).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div style={styles.drawerFooter}>
              <button onClick={handleSendToKitchen} style={styles.checkoutBtn} className="shine-btn">
                <Utensils size={18} /> Send to Kitchen (Add to Tab: ₹{(getCartTotal() * 1.05).toFixed(2)})
              </button>
              <p style={{ textAlign: 'center', fontSize: '11px', color: '#78716c', marginTop: '6px' }}>
                ✨ Pay once at the end of dining via Cash, UPI, or Card
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Online Mock Payment Gateway Modal (Pay Once for the entire dining tab) */}
      {showPayment && (
        <MockPayment
          amount={
            tableId && sectionName && getActiveSession(tableId, sectionName)
              ? (getActiveSession(tableId, sectionName)!.subtotal * 1.05)
              : (activeOrder ? activeOrder.totalAmount * 1.05 : getCartTotal() * 1.05)
          }
          onClose={() => setShowPayment(false)}
          onPaymentSuccess={(method) => {
            handlePaymentSuccess(method);
          }}
        />
      )}

      {/* Floating AI Dining Assistant Widget */}
      <AiDiningAssistant menu={menu} cart={cart} onAddToCart={addToCart} />
    </div>
  );
};


const statusStyles: Record<string, React.CSSProperties> = {
  received: { backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' },
  preparing: { backgroundColor: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' },
  ready: { backgroundColor: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' },
  served: { backgroundColor: '#fcf7ff', color: '#7e22ce', border: '1px solid #e9d5ff' },
};

const styles: Record<string, React.CSSProperties> = {
  qrScanContainer: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafaf9',
    padding: '16px',
  },
  qrScanCard: {
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    padding: '36px',
    maxWidth: '400px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    border: '1px solid #e7e5e4',
  },
  qrIconWrapper: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    backgroundColor: '#ffedd5',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  scanTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '28px',
    fontWeight: 700,
    color: '#1c1917',
  },
  scanSubtitle: {
    fontSize: '14px',
    color: '#78716c',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    fontWeight: 600,
    marginBottom: '24px',
  },
  qrBox: {
    width: '160px',
    height: '160px',
    border: '2px solid #fdba74',
    borderRadius: '16px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: '#fff7ed',
    marginBottom: '20px',
    overflow: 'hidden',
  },
  qrScanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: '2px',
    backgroundColor: '#ea580c',
    boxShadow: '0 0 8px #ea580c',
    animation: 'scanLineMove 2s linear infinite',
  },
  scanHint: {
    fontSize: '13px',
    color: '#78716c',
    lineHeight: '1.6',
    marginBottom: '24px',
  },
  scanForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    textAlign: 'left',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  formLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#78716c',
  },
  select: {
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1px solid #e7e5e4',
    backgroundColor: '#fafaf9',
    fontSize: '14px',
    outline: 'none',
    color: '#1c1917',
  },
  scanSubmitBtn: {
    backgroundColor: '#ea580c',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    padding: '14px',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: '8px',
    boxShadow: '0 4px 12px rgba(234, 88, 12, 0.2)',
  },
  header: {
    backgroundColor: 'rgba(15, 15, 18, 0.90)',
    backdropFilter: 'blur(16px)',
    borderBottom: '1px solid rgba(245, 158, 11, 0.25)',
    padding: '24px 20px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
    width: '100%',
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    textAlign: 'center',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  brandClickable: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    cursor: 'pointer',
    gap: '4px',
    width: '100%',
  },
  headerLogoWrapper: {
    marginBottom: '2px',
    transform: 'scale(1.15)',
  },
  hotelTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: 'clamp(28px, 5vw, 48px)',
    fontWeight: 900,
    letterSpacing: '3px',
    textTransform: 'uppercase',
    background: 'linear-gradient(135deg, #ffffff 0%, #f59e0b 50%, #ea580c 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: '6px 0 2px 0',
    width: '100%',
    lineHeight: '1.05',
    textShadow: '0 0 30px rgba(245, 158, 11, 0.25)',
  },
  hotelSubTagline: {
    fontSize: '11px',
    letterSpacing: '5px',
    color: '#f59e0b',
    fontWeight: 700,
    margin: '0 0 8px 0',
  },
  tableLocationPill: {
    fontSize: '11px',
    color: '#f59e0b',
    fontWeight: 600,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    border: '1px solid rgba(245, 158, 11, 0.3)',
    padding: '4px 14px',
    borderRadius: '20px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  },
  hotelStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#fef3c7',
    padding: '6px 12px',
    borderRadius: '20px',
  },
  mainContent: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    position: 'relative',
    zIndex: 1,
    maxWidth: '1280px',
    margin: '0 auto',
    width: '100%',
  },
  trackerCard: {
    backgroundColor: 'rgba(24, 24, 27, 0.85)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(245, 158, 11, 0.3)',
    borderRadius: '16px',
    padding: '16px',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
    color: '#ffffff',
  },
  trackerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  trackerTitle: {
    fontSize: '15px',
    fontWeight: 700,
    color: '#ffffff',
  },
  statusBadge: {
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase',
    padding: '2px 8px',
    borderRadius: '6px',
  },
  stepperContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    position: 'relative',
    margin: '12px 0 20px 0',
  },
  step: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    flex: 1,
    zIndex: 1,
  },
  stepCircle: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLabel: {
    fontSize: '11px',
  },
  trackerFooter: {
    borderTop: '1px solid rgba(255,255,255,0.1)',
    paddingTop: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
  },
  orderIdText: {
    fontSize: '11px',
    color: '#a1a1aa',
    fontWeight: 500,
  },
  requestBillBtn: {
    backgroundColor: '#f59e0b',
    color: '#000000',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  billingAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    border: '1px solid rgba(245, 158, 11, 0.4)',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    color: '#f59e0b',
    width: '100%',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  payNowBtn: {
    backgroundColor: '#ea580c',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    padding: '4px 8px',
    fontSize: '11px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  aboutDetails: {
    borderRadius: '16px',
    padding: '14px',
  },
  aboutSummary: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    listStyle: 'none',
    outline: 'none',
    color: '#ffffff',
  },
  chevron: {
    transition: 'transform 0.2s',
  },
  aboutContent: {
    marginTop: '12px',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    paddingTop: '12px',
  },
  aboutDesc: {
    fontSize: '13px',
    color: '#a1a1aa',
    lineHeight: '1.6',
    marginBottom: '12px',
  },
  aboutMetaGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  aboutMetaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: '#a1a1aa',
  },
  filterSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  searchWrapper: {
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: 14,
  },
  clearSearchIcon: {
    position: 'absolute',
    right: 14,
    cursor: 'pointer',
  },
  searchInput: {
    width: '100%',
    padding: '14px 14px 14px 44px',
    borderRadius: '14px',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    outline: 'none',
    fontSize: '14px',
    backgroundColor: 'rgba(24, 24, 27, 0.85)',
    color: '#ffffff',
    backdropFilter: 'blur(12px)',
  },
  filterRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
  },
  categoriesScroll: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    whiteSpace: 'nowrap',
    paddingBottom: '4px',
    flex: 1,
    scrollbarWidth: 'none',
  },
  categoryTab: {
    background: 'rgba(24, 24, 27, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '20px',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: 600,
    color: '#a1a1aa',
    cursor: 'pointer',
    backdropFilter: 'blur(8px)',
  },
  activeCategoryTab: {
    background: 'linear-gradient(135deg, #ea580c 0%, #f59e0b 100%)',
    borderColor: '#f59e0b',
    color: '#ffffff',
    boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)',
  },
  vegFilterBtn: {
    border: '1px solid',
    borderRadius: '20px',
    padding: '6px 14px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  menuGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
  },
  menuCard: {
    backgroundColor: 'rgba(24, 24, 27, 0.85)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
  },
  cardImageWrapper: {
    position: 'relative',
    height: '180px',
    backgroundColor: '#18181b',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  vegBadge: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    color: '#10b981',
    border: '1px solid #10b981',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: 700,
    textTransform: 'uppercase',
  },
  nonVegBadge: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    color: '#ef4444',
    border: '1px solid #ef4444',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: 700,
    textTransform: 'uppercase',
  },
  cardBody: {
    padding: '18px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '8px',
  },
  itemName: {
    fontSize: '17px',
    fontWeight: 700,
    color: '#ffffff',
  },
  itemPrice: {
    fontSize: '17px',
    fontWeight: 800,
    color: '#f59e0b',
  },
  itemDesc: {
    fontSize: '13px',
    color: '#a1a1aa',
    marginBottom: '16px',
    flex: 1,
    lineHeight: '1.5',
  },
  cardFooter: {
    marginTop: 'auto',
  },
  addCartBtn: {
    width: '100%',
    background: 'linear-gradient(135deg, #ea580c 0%, #f59e0b 100%)',
    border: 'none',
    color: '#ffffff',
    borderRadius: '12px',
    padding: '12px 0',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(234, 88, 12, 0.3)',
  },
  quantityWidget: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    border: '1px solid #ea580c',
    borderRadius: '10px',
    padding: '4px',
    backgroundColor: '#ffedd5',
  },
  qtyBtn: {
    background: 'none',
    border: 'none',
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  qtyText: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#ea580c',
  },
  noResults: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '40px 0',
  },
  stickyCartBar: {
    position: 'fixed',
    bottom: '16px',
    left: '16px',
    right: '16px',
    borderRadius: '16px',
    padding: '12px 18px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 999,
  },
  stickyCartLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  cartIconBadge: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: '#ea580c',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cartBadgeCount: {
    position: 'absolute',
    top: '-6px',
    right: '-6px',
    backgroundColor: '#1e1b4b',
    color: '#ffffff',
    fontSize: '10px',
    fontWeight: 700,
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartSummaryText: {
    fontSize: '12px',
    color: '#78716c',
    fontWeight: 500,
  },
  cartPriceText: {
    fontSize: '16px',
    fontWeight: 800,
    color: '#ea580c',
  },
  viewCartBtn: {
    backgroundColor: '#ea580c',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(234, 88, 12, 0.15)',
  },
  cartDrawerOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  cartDrawer: {
    backgroundColor: '#ffffff',
    color: '#1c1917',
    width: '100%',
    maxWidth: '480px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '-4px 0 20px rgba(0,0,0,0.1)',
  },
  drawerHeader: {
    padding: '20px',
    borderBottom: '1px solid #e7e5e4',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#1c1917',
  },
  drawerTitle: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#1c1917',
  },
  drawerCloseBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#78716c',
  },
  drawerContent: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    color: '#1c1917',
  },
  cartItemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '16px',
    borderBottom: '1px solid #f5f5f4',
  },
  cartItemLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  vegSquare: {
    width: '12px',
    height: '12px',
    border: '1px solid #10b981',
    backgroundColor: '#ffffff',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  nonVegSquare: {
    width: '12px',
    height: '12px',
    border: '1px solid #ef4444',
    backgroundColor: '#ffffff',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cartItemName: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#1c1917',
  },
  cartItemPrice: {
    fontSize: '12px',
    color: '#78716c',
  },
  cartItemRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  drawerQuantityWidget: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #d6d3d1',
    borderRadius: '6px',
    padding: '2px',
    backgroundColor: '#fafaf9',
  },
  drawerQtyBtn: {
    background: 'none',
    border: 'none',
    width: '22px',
    height: '22px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerQtyText: {
    fontSize: '12px',
    fontWeight: 600,
    width: '16px',
    textAlign: 'center',
    color: '#1c1917',
  },
  cartItemRowTotal: {
    fontSize: '14px',
    fontWeight: 700,
    width: '50px',
    textAlign: 'right',
    color: '#1c1917',
  },
  notesSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  notesLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#57534e',
  },
  notesTextarea: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #e7e5e4',
    outline: 'none',
    fontSize: '13px',
    resize: 'none',
    height: '60px',
    fontFamily: 'inherit',
    backgroundColor: '#ffffff',
    color: '#1c1917',
  },
  billDetails: {
    backgroundColor: '#fafaf9',
    borderRadius: '12px',
    padding: '16px',
    border: '1px solid #e7e5e4',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  billRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    color: '#78716c',
  },
  drawerFooter: {
    padding: '20px',
    borderTop: '1px solid #e7e5e4',
  },
  checkoutBtn: {
    width: '100%',
    backgroundColor: '#ea580c',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    padding: '14px 0',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(234, 88, 12, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  }
};

// Add standard styles for indicator square dot inside CSS
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = `
    .veg-dot::after {
      content: '';
      position: absolute;
      width: 6px;
      height: 6px;
      background-color: #10b981;
      border-radius: 50%;
    }
    .nonveg-dot::after {
      content: '';
      position: absolute;
      width: 6px;
      height: 6px;
      background-color: #ef4444;
      border-radius: 50%;
    }
    @keyframes scanLineMove {
      0% { top: 0; }
      50% { top: 100%; }
      100% { top: 0; }
    }
  `;
  document.head.appendChild(styleSheet);
}
