import React, { useState, useEffect, useRef } from 'react';
import { MenuItem, CartItem } from '../types';
import { askGeminiChatbot } from '../services/geminiService';
import { Sparkles, X, Send, Bot, Plus, Check } from 'lucide-react';

export interface AiRecommendation {
  menuItem: MenuItem;
  reason: string;
  pairingSuggestion?: string;
}

interface AiDiningAssistantProps {
  menu: MenuItem[];
  cart: CartItem[];
  onAddToCart: (item: MenuItem) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  recommendations?: AiRecommendation[];
  timestamp: string;
}

export const AiDiningAssistant: React.FC<AiDiningAssistantProps> = ({
  menu,
  cart,
  onAddToCart
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: "👋 Welcome to The Velvet Fork! I'm Velvet Fork AI, your personal dining assistant. How can I help you customize your meal today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isThinking]);

  // Local AI recommendation engine
  const getAiRecommendation = (query: string): { text: string; recommendedItems: MenuItem[] } => {
    const q = query.toLowerCase();
    let matched: MenuItem[] = [];
    let text = "";

    if (q.includes('veg') || q.includes('spicy')) {
      matched = menu.filter(m => m.isVeg && m.isAvailable).slice(0, 2);
      text = "Here are our top vegetarian specialties crafted with fresh spices:";
    } else if (q.includes('drink') || q.includes('pair')) {
      matched = menu.filter(m => m.category === 'Beverages' && m.isAvailable).slice(0, 2);
      text = "Here are our guest-favorite beverage pairings to balance your meal:";
    } else if (q.includes('dessert') || q.includes('sweet')) {
      matched = menu.filter(m => m.category === 'Desserts' && m.isAvailable).slice(0, 2);
      text = "Satisfy your sweet tooth with these handcrafted desserts:";
    } else if (q.includes('chicken') || q.includes('non-veg') || q.includes('mutton') || q.includes('special')) {
      matched = menu.filter(m => !m.isVeg && m.isAvailable).slice(0, 2);
      text = "For non-vegetarian delicacies, I highly recommend these chef specials:";
    } else {
      matched = menu.filter(m => m.isAvailable).slice(0, 3);
      text = "Based on guest ratings, here are today's top recommended selections:";
    }

    return { text, recommendedItems: matched };
  };

  const handleSend = async (queryText: string) => {
    const query = queryText || inputQuery;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsThinking(true);

    try {
      const aiResponse = await askGeminiChatbot(query, menu, cart);

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: aiResponse.text,
        recommendations: aiResponse.recommendedItems.map((item: MenuItem) => ({
          menuItem: item,
          reason: 'Recommended for you',
          pairingSuggestion: 'Matches your preferences'
        })),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (e) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'bot',
          text: "I'm having a brief moment, but our chef specials like Pan-Seared Salmon and Truffle Fries are guest favorites today!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleAdd = (item: MenuItem) => {
    onAddToCart(item);
    setAddedItemIds(prev => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedItemIds(prev => ({ ...prev, [item.id]: false }));
    }, 2000);
  };

  const promptChips = [
    { label: '🌶️ Spicy Veg Dishes', query: 'Recommend spicy vegetarian dishes under ₹200' },
    { label: '🍹 Drink Pairings', query: 'What drink pairs best with my order?' },
    { label: '🍨 Top Desserts', query: 'Show me your best handcrafted desserts' },
    { label: '🍗 Chef Non-Veg Specials', query: 'Show me your top chef special chicken and mutton dishes' }
  ];

  return (
    <>
      {/* FLOATING CIRCULAR AI ASSISTANT TRIGGER BUTTON */}
      <div style={styles.floatingTriggerContainer}>
        <div style={styles.floatingLabelBadge}>
          <Sparkles size={12} color="#f59e0b" />
          <span>Velvet Fork AI</span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          style={styles.floatingCircleBtn}
          className="ai-bot-circle-btn shine-btn"
          title="Ask Velvet Fork AI"
          aria-label="Open Velvet Fork AI Assistant"
        >
          <div style={styles.botCircleInner}>
            <Bot size={28} color="#ffffff" strokeWidth={2.2} />
          </div>
        </button>
      </div>

      {/* CHAT DRAWER MODAL */}
      {isOpen && (
        <div style={styles.chatOverlay}>
          <div style={styles.chatContainer} className="animate-scale-in ai-assistant-drawer">
            {/* Header */}
            <div style={styles.chatHeader}>
              <div style={styles.chatHeaderTitleRow}>
                <div style={styles.botAvatar}>
                  <Bot size={20} color="#ffffff" />
                </div>
                <div>
                  <h3 style={styles.chatTitle}>Velvet Fork AI</h3>
                  <span style={styles.chatStatus}>● Smart Dining Concierge</span>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} style={styles.closeBtn}>
                <X size={20} color="#a1a1aa" />
              </button>
            </div>

            {/* Prompt Chips */}
            <div style={styles.chipsScroll}>
              {promptChips.map((chip, i) => (
                <button 
                  key={i} 
                  onClick={() => handleSend(chip.query)}
                  style={styles.chipBtn}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Messages Box */}
            <div style={styles.messagesBox}>
              {messages.map(msg => (
                <div 
                  key={msg.id}
                  style={{
                    ...styles.messageRow,
                    justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                  }}
                >
                  {msg.sender === 'bot' && (
                    <div style={styles.miniBotAvatar}>
                      <Bot size={14} color="#ea580c" />
                    </div>
                  )}
                  
                  <div style={{
                    ...styles.messageBubble,
                    ...(msg.sender === 'user' ? styles.userBubble : styles.botBubble)
                  }}>
                    <p style={styles.messageText}>{msg.text}</p>
                    <span style={styles.messageTime}>{msg.timestamp}</span>

                    {/* Recommendation Cards */}
                    {msg.recommendations && msg.recommendations.length > 0 && (
                      <div style={styles.recGrid}>
                        {msg.recommendations.map((rec, rIdx) => (
                          <div key={rIdx} style={styles.recCard}>
                            <img 
                              src={rec.menuItem.image} 
                              alt={rec.menuItem.name} 
                              style={styles.recImg}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80";
                              }}
                            />
                            <div style={styles.recBody}>
                              <div style={styles.recTitleRow}>
                                <span style={styles.recName}>{rec.menuItem.name}</span>
                                <span style={styles.recPrice}>₹{rec.menuItem.price}</span>
                              </div>
                              <p style={styles.recDesc}>{rec.menuItem.description}</p>
                              <button 
                                onClick={() => handleAdd(rec.menuItem)}
                                style={styles.addRecBtn}
                              >
                                {addedItemIds[rec.menuItem.id] ? (
                                  <> <Check size={14} /> Added </>
                                ) : (
                                  <> <Plus size={14} /> Add to Cart </>
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Thinking dots */}
              {isThinking && (
                <div style={styles.messageRow}>
                  <div style={styles.miniBotAvatar}>
                    <Bot size={14} color="#ea580c" />
                  </div>
                  <div style={styles.thinkingBubble}>
                    <span className="bouncing-dot dot-1"></span>
                    <span className="bouncing-dot dot-2"></span>
                    <span className="bouncing-dot dot-3"></span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(inputQuery);
              }}
              style={styles.inputForm}
            >
              <input 
                type="text"
                placeholder="Ask Velvet Fork AI for dish or drink recommendations..."
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                style={styles.chatInput}
              />
              <button type="submit" disabled={!inputQuery.trim()} style={styles.sendBtn}>
                <Send size={16} color="#ffffff" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

const styles: Record<string, React.CSSProperties> = {
  floatingTriggerContainer: {
    position: 'fixed',
    bottom: '88px',
    right: '24px',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    pointerEvents: 'auto',
  },
  floatingLabelBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    backgroundColor: 'rgba(15, 15, 18, 0.92)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(245, 158, 11, 0.45)',
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.4px',
    padding: '4px 10px',
    borderRadius: '20px',
    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
    whiteSpace: 'nowrap',
    userSelect: 'none',
  },
  floatingCircleBtn: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #ea580c 0%, #f97316 45%, #f59e0b 100%)',
    border: '2px solid rgba(255, 255, 255, 0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 8px 24px rgba(234, 88, 12, 0.55), inset 0 2px 4px rgba(255, 255, 255, 0.4)',
    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
    padding: 0,
  },
  botCircleInner: {
    width: '46px',
    height: '46px',
    borderRadius: '50%',
    backgroundColor: 'rgba(15, 15, 18, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
  },
  chatOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    backdropFilter: 'blur(8px)',
    zIndex: 10000,
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  chatContainer: {
    width: '100%',
    maxWidth: '420px',
    height: '90vh',
    maxHeight: '680px',
    backgroundColor: '#18181b',
    border: '1px solid #3f3f46',
    borderRadius: '24px 24px 0 0',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.5)',
  },
  chatHeader: {
    padding: '16px 20px',
    backgroundColor: '#09090b',
    borderBottom: '1px solid #27272a',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatHeaderTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  botAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #ea580c 0%, #f59e0b 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#fafafa',
  },
  chatStatus: {
    fontSize: '11px',
    color: '#10b981',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
  },
  chipsScroll: {
    display: 'flex',
    gap: '8px',
    padding: '12px 16px',
    overflowX: 'auto',
    backgroundColor: '#09090b',
    borderBottom: '1px solid #27272a',
  },
  chipBtn: {
    backgroundColor: '#27272a',
    color: '#d4d4d8',
    border: '1px solid #3f3f46',
    borderRadius: '20px',
    padding: '6px 14px',
    fontSize: '12px',
    fontWeight: 600,
    whiteSpace: 'nowrap',
    cursor: 'pointer',
  },
  messagesBox: {
    flex: 1,
    padding: '16px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  messageRow: {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start',
  },
  miniBotAvatar: {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    backgroundColor: 'rgba(234, 88, 12, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: '4px',
  },
  messageBubble: {
    maxWidth: '85%',
    padding: '12px 16px',
    borderRadius: '16px',
    fontSize: '14px',
    lineHeight: 1.5,
  },
  userBubble: {
    backgroundColor: '#ea580c',
    color: '#ffffff',
    borderRadius: '16px 16px 2px 16px',
  },
  botBubble: {
    backgroundColor: '#27272a',
    color: '#fafafa',
    border: '1px solid #3f3f46',
    borderRadius: '16px 16px 16px 2px',
  },
  messageText: {
    margin: 0,
  },
  messageTime: {
    fontSize: '10px',
    opacity: 0.6,
    display: 'block',
    marginTop: '4px',
    textAlign: 'right',
  },
  recGrid: {
    marginTop: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  recCard: {
    backgroundColor: '#18181b',
    border: '1px solid #3f3f46',
    borderRadius: '12px',
    overflow: 'hidden',
    display: 'flex',
    gap: '10px',
  },
  recImg: {
    width: '75px',
    height: '75px',
    objectFit: 'cover',
  },
  recBody: {
    padding: '8px 10px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  recTitleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recName: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#fafafa',
  },
  recPrice: {
    fontSize: '12px',
    fontWeight: 800,
    color: '#f59e0b',
  },
  recDesc: {
    fontSize: '11px',
    color: '#a1a1aa',
    margin: '4px 0',
  },
  addRecBtn: {
    backgroundColor: '#ea580c',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    padding: '4px 10px',
    fontSize: '11px',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    alignSelf: 'flex-start',
  },
  thinkingBubble: {
    backgroundColor: '#27272a',
    padding: '12px 18px',
    borderRadius: '16px',
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
  },
  inputForm: {
    padding: '14px 16px',
    backgroundColor: '#09090b',
    borderTop: '1px solid #27272a',
    display: 'flex',
    gap: '10px',
  },
  chatInput: {
    flex: 1,
    padding: '12px 16px',
    borderRadius: '12px',
    backgroundColor: '#18181b',
    border: '1px solid #3f3f46',
    color: '#fafafa',
    fontSize: '14px',
    outline: 'none',
  },
  sendBtn: {
    backgroundColor: '#ea580c',
    border: 'none',
    borderRadius: '12px',
    padding: '0 16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
};
