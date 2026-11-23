import React, { useState } from 'react';
import { Section, MenuItem } from '../types';
import { HOTEL_INFO } from '../mockData';
import { RestaurantLogo } from './RestaurantLogo';
import { 
  Utensils, Sparkles, MapPin, Clock, Phone, Mail, 
  ChevronRight, Star, Award, ArrowRight, ShieldCheck, Flame, Bot, Heart
} from 'lucide-react';

interface RestaurantHomePageProps {
  sections: Section[];
  menu: MenuItem[];
  onSelectTable: (sectionName: string, tableId: string) => void;
  onBrowseMenu: () => void;
}

export const RestaurantHomePage: React.FC<RestaurantHomePageProps> = ({
  sections,
  menu,
  onSelectTable,
  onBrowseMenu
}) => {
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [showTableModal, setShowTableModal] = useState<boolean>(false);

  const handleTableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSection && selectedTable) {
      onSelectTable(selectedSection, selectedTable);
    }
  };

  // Get top signature items for showcase
  const filteredSpecials = menu.filter(item => (item.category as string) === 'Chef Specials' || (item.category as string) === 'Rice & Biryanis' || (item.category as string) === 'Main Course' || (item.category as string) === 'Mains');
  const signatureDishes = filteredSpecials.length > 0 ? filteredSpecials.slice(0, 4) : menu.slice(0, 4);


  return (
    <div style={styles.container}>
      {/* Top Floating Announcement / Header Bar */}
      <header style={styles.navbar}>
        <div style={styles.navBrand}>
          <RestaurantLogo size={42} />
          <div>
            <span style={styles.brandTitle}>{HOTEL_INFO.name}</span>
            <span style={styles.brandTagline}>{HOTEL_INFO.tagline}</span>
          </div>
        </div>

        <div style={styles.navLinks}>
          <a href="#table-dining" style={styles.navLink}>Table Dining</a>
          <a href="#signature-menu" style={styles.navLink}>Chef Specials</a>
          <a href="#ambiance" style={styles.navLink}>Ambiance</a>
          <a href="#contact" style={styles.navLink}>Location & Info</a>
        </div>

        <div style={styles.navActions}>
          <button 
            onClick={() => setShowTableModal(true)} 
            style={styles.dineInBtn}
            className="shine-btn"
          >
            <RestaurantLogo size={20} /> Select Table
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section style={styles.heroSection}>
        <div style={styles.heroOverlay}></div>
        <div style={styles.heroContent} className="animate-fade-in">
          <div style={styles.heroBadge}>
            <Award size={14} color="#f59e0b" />
            <span>AWARD-WINNING GOURMET DINING</span>
          </div>

          <h1 style={styles.heroHeadline}>
            A Symphony of <span style={styles.goldText}>Gourmet Flavors</span>
          </h1>

          <p style={styles.heroSubtitle}>
            {HOTEL_INFO.description}
          </p>

          <div style={styles.heroCtaRow}>
            <button 
              onClick={() => setShowTableModal(true)} 
              style={styles.heroPrimaryBtn}
              className="shine-btn"
            >
              <RestaurantLogo size={24} /> Dine-In Order (Select Table)
            </button>
            
            <button 
              onClick={() => {
                if (sections.length > 0 && sections[0].tables.length > 0) {
                  onSelectTable(sections[0].name, sections[0].tables[0].id);
                } else {
                  onBrowseMenu();
                }
              }} 
              style={styles.heroSecondaryBtn}
            >
              Explore Full Menu <ArrowRight size={16} />
            </button>
          </div>

          <div style={styles.heroStatsRow}>
            <div style={styles.statBox}>
              <div style={styles.statNumber}>4.8 ★</div>
              <div style={styles.statLabel}>1,420+ Guest Reviews</div>
            </div>
            <div style={styles.statDivider}></div>
            <div style={styles.statBox}>
              <div style={styles.statNumber}>34+</div>
              <div style={styles.statLabel}>Artisanal Dishes</div>
            </div>
            <div style={styles.statDivider}></div>
            <div style={styles.statBox}>
              <div style={styles.statNumber}>✨ AI</div>
              <div style={styles.statLabel}>Smart Dining Assistant</div>
            </div>
          </div>
        </div>
      </section>

      {/* DINE-IN TABLE SELECTOR SECTION */}
      <section id="table-dining" style={styles.tablePickerSection}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionBadge}>CONTACTLESS TABLE DINING</span>
          <h2 style={styles.sectionTitle}>Seated at a Table? Order Instantly</h2>
          <p style={styles.sectionSubtitle}>
            Select your dining section and table number below to access the digital menu for your table.
          </p>
        </div>

        <form onSubmit={handleTableSubmit} style={styles.tablePickerForm} className="dashboard-glass-card">
          <div style={styles.pickerFormRow}>
            <div style={styles.pickerField}>
              <label style={styles.pickerLabel}>1. Dining Section</label>
              <select 
                value={selectedSection}
                onChange={(e) => {
                  setSelectedSection(e.target.value);
                  setSelectedTable('');
                }}
                style={styles.pickerSelect}
                required
              >
                <option value="">-- Select Section --</option>
                {sections.map(sec => (
                  <option key={sec.name} value={sec.name}>{sec.name}</option>
                ))}
              </select>
            </div>

            <div style={styles.pickerField}>
              <label style={styles.pickerLabel}>2. Table Number</label>
              <select 
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                style={styles.pickerSelect}
                disabled={!selectedSection}
                required
              >
                <option value="">-- Choose Table --</option>
                {selectedSection && sections.find(s => s.name === selectedSection)?.tables.map(tbl => (
                  <option key={tbl.id} value={tbl.id}>{tbl.name}</option>
                ))}
              </select>
            </div>

            <div style={{ ...styles.pickerField, justifyContent: 'flex-end' }}>
              <button 
                type="submit" 
                disabled={!selectedTable}
                style={{
                  ...styles.pickerSubmitBtn,
                  opacity: selectedTable ? 1 : 0.5,
                  cursor: selectedTable ? 'pointer' : 'not-allowed'
                }}
                className="shine-btn"
              >
                Open Digital Menu <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* CHEF SIGNATURE DISHES SHOWCASE */}
      <section id="signature-menu" style={styles.signatureSection}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionBadge}>CULINARY EXCELLENCE</span>
          <h2 style={styles.sectionTitle}>Chef's Signature Creations</h2>
          <p style={styles.sectionSubtitle}>Handcrafted daily using organic ingredients and authentic secret spice blends.</p>
        </div>

        <div style={styles.signatureGrid}>
          {signatureDishes.map((dish) => (
            <div key={dish.id} style={styles.signatureCard} className="dashboard-glass-card">
              <div style={styles.dishImageWrapper}>
                <img src={dish.image} alt={dish.name} style={styles.dishImage} />
                <span style={dish.isVeg ? styles.vegBadge : styles.nonVegBadge}>
                  {dish.isVeg ? 'Veg' : 'Non-Veg'}
                </span>
                <span style={styles.priceTag}>₹{dish.price}</span>
              </div>
              <div style={styles.dishBody}>
                <h3 style={styles.dishTitle}>{dish.name}</h3>
                <p style={styles.dishDesc}>{dish.description}</p>
                <div style={styles.dishFooter}>
                  <button 
                    onClick={() => {
                      if (sections.length > 0 && sections[0].tables.length > 0) {
                        onSelectTable(sections[0].name, sections[0].tables[0].id);
                      }
                    }}
                    style={styles.orderDishBtn}
                  >
                    Order Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AMBIANCE & SECTIONS SHOWCASE */}
      <section id="ambiance" style={styles.ambianceSection}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionBadge}>THE ATMOSPHERE</span>
          <h2 style={styles.sectionTitle}>3 Distinct Dining Environments</h2>
        </div>

        <div style={styles.ambianceGrid}>
          {sections.map((sec, idx) => {
            const images = [
              "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
              "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80",
              "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80"
            ];
            const descs = [
              "Grand chandelier lighting, warm mahogany accents, and classical dining elegance.",
              "Breezy skyline view under twilight stars with handcrafted mocktails and acoustic music.",
              "Serene botanical courtyard surrounded by lush greenery for tranquil culinary moments."
            ];
            return (
              <div key={sec.name} style={styles.ambianceCard}>
                <img src={images[idx % images.length]} alt={sec.name} style={styles.ambianceImg} />
                <div style={styles.ambianceOverlay}>
                  <h3 style={styles.ambianceTitle}>{sec.name}</h3>
                  <p style={styles.ambianceDesc}>{descs[idx % descs.length]}</p>
                  <button 
                    onClick={() => {
                      if (sec.tables.length > 0) {
                        onSelectTable(sec.name, sec.tables[0].id);
                      }
                    }}
                    style={styles.ambianceBtn}
                  >
                    Dine in {sec.name} →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* AI DINING ASSISTANT FEATURE HIGHLIGHT */}
      <section style={styles.aiFeatureSection}>
        <div style={styles.aiFeatureCard} className="dashboard-glass-card">
          <div style={styles.aiFeatureLeft}>
            <div style={styles.aiBadge}>
              <Bot size={16} color="#f97316" />
              <span>POWERED BY GOOGLE GEMINI AI</span>
            </div>
            <h2 style={styles.aiTitle}>Meet "Velvet Fork AI" Your Personal Dining Concierge</h2>
            <p style={styles.aiDesc}>
              Unsure what to order? Our built-in AI chatbot recommends food pairings, answers dietary & allergen questions, and tailors recommendations based on your budget.
            </p>
            <div style={styles.aiBullets}>
              <div style={styles.aiBulletItem}>
                <Flame size={16} color="#ea580c" /> Smart Dish & Drink Pairings
              </div>
              <div style={styles.aiBulletItem}>
                <ShieldCheck size={16} color="#10b981" /> Allergen & Veg/Non-Veg Filtering
              </div>
              <div style={styles.aiBulletItem}>
                <Clock size={16} color="#f59e0b" /> Real-time Kitchen Prep Estimations
              </div>
            </div>
          </div>
          <div style={styles.aiFeatureRight}>
            <div style={styles.aiMockCard}>
              <div style={styles.aiMockHeader}>
                <Bot size={18} color="#ea580c" />
                <span>Velvet Fork AI Assistant</span>
              </div>
              <div style={styles.aiMockBubble}>
                "Welcome to The Velvet Fork! Pair your Butter Chicken with our Tandoori Garlic Naan and a Fresh Mint Mojito for the ultimate dining experience."
              </div>
              <div style={styles.aiMockBtn}>Add Suggested Combo to Cart →</div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER & LOCATION */}
      <footer id="contact" style={styles.footer}>
        <div style={styles.footerGrid}>
          <div>
            <h3 style={styles.footerBrand}>{HOTEL_INFO.name}</h3>
            <p style={styles.footerDesc}>{HOTEL_INFO.description}</p>
          </div>

          <div>
            <h4 style={styles.footerTitle}>Opening Hours</h4>
            <div style={styles.footerInfoRow}>
              <Clock size={16} color="#ea580c" />
              <span>{HOTEL_INFO.timings}</span>
            </div>
            <div style={{ ...styles.footerInfoRow, marginTop: '8px' }}>
              <Star size={16} color="#f59e0b" />
              <span>Rating: {HOTEL_INFO.rating} / 5.0 ({HOTEL_INFO.reviewsCount} reviews)</span>
            </div>
          </div>

          <div>
            <h4 style={styles.footerTitle}>Contact & Location</h4>
            <div style={styles.footerInfoRow}>
              <MapPin size={16} color="#ea580c" />
              <span>{HOTEL_INFO.address}</span>
            </div>
            <div style={{ ...styles.footerInfoRow, marginTop: '8px' }}>
              <Phone size={16} color="#ea580c" />
              <span>{HOTEL_INFO.phone}</span>
            </div>
            <div style={{ ...styles.footerInfoRow, marginTop: '8px' }}>
              <Mail size={16} color="#ea580c" />
              <span>{HOTEL_INFO.email}</span>
            </div>
          </div>
        </div>

        <div style={styles.copyrightRow}>
          <p>© {new Date().getFullYear()} {HOTEL_INFO.name}. All Rights Reserved. Smart Restaurant Management System.</p>
          <p style={{ marginTop: '8px', fontSize: '13px', color: '#a1a1aa', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            Made with <Heart size={14} color="#ef4444" fill="#ef4444" /> by <strong style={{ color: '#f59e0b', fontWeight: 700 }}>Gaurav Gatty</strong> and <strong style={{ color: '#f59e0b', fontWeight: 700 }}>Dheeraj</strong>
          </p>
        </div>
      </footer>

      {/* MODAL FOR TABLE SELECTOR */}
      {showTableModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent} className="animate-scale-in">
            <h3 style={styles.modalTitle}>Select Your Dining Table</h3>
            <p style={styles.modalSubtitle}>Choose your section and table number to view the digital menu.</p>
            
            <form onSubmit={handleTableSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={styles.pickerLabel}>Dining Section</label>
                <select 
                  value={selectedSection}
                  onChange={(e) => {
                    setSelectedSection(e.target.value);
                    setSelectedTable('');
                  }}
                  style={styles.pickerSelect}
                  required
                >
                  <option value="">-- Choose Section --</option>
                  {sections.map(s => (
                    <option key={s.name} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              {selectedSection && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={styles.pickerLabel}>Table Number</label>
                  <select 
                    value={selectedTable}
                    onChange={(e) => setSelectedTable(e.target.value)}
                    style={styles.pickerSelect}
                    required
                  >
                    <option value="">-- Choose Table --</option>
                    {sections.find(s => s.name === selectedSection)?.tables.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div style={styles.modalActions}>
                <button type="button" onClick={() => setShowTableModal(false)} style={styles.modalCancelBtn}>
                  Cancel
                </button>
                <button type="submit" disabled={!selectedTable} style={styles.modalSubmitBtn}>
                  Open Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#09090b',
    color: '#fafafa',
    fontFamily: "'Outfit', sans-serif",
    minHeight: '100vh',
    overflowX: 'hidden',
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 40px',
    backgroundColor: 'rgba(9, 9, 11, 0.85)',
    backdropFilter: 'blur(16px)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  },
  navBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  brandLogoWrapper: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    backgroundColor: '#ea580c',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 14px rgba(234, 88, 12, 0.4)',
  },
  brandTitle: {
    fontSize: '20px',
    fontWeight: 800,
    fontFamily: "'Playfair Display', serif",
    display: 'block',
    letterSpacing: '0.5px',
  },
  brandTagline: {
    fontSize: '11px',
    color: '#a1a1aa',
    display: 'block',
  },
  navLinks: {
    display: 'flex',
    gap: '24px',
  },
  navLink: {
    color: '#d4d4d8',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'color 0.2s ease',
  },
  navActions: {
    display: 'flex',
    gap: '12px',
  },
  dineInBtn: {
    backgroundColor: '#ea580c',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    padding: '10px 18px',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 14px rgba(234, 88, 12, 0.3)',
  },
  heroSection: {
    position: 'relative',
    minHeight: '85vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundImage: `url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1920&q=80')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    padding: '60px 20px',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(9, 9, 11, 0.78)',
    backgroundImage: 'radial-gradient(ellipse at center, rgba(9, 9, 11, 0.4) 0%, rgba(9, 9, 11, 0.92) 100%)',
  },
  heroContent: {
    position: 'relative',
    zIndex: 2,
    maxWidth: '850px',
    textAlign: 'center',
    margin: '0 auto',
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    border: '1px solid rgba(245, 158, 11, 0.4)',
    color: '#f59e0b',
    padding: '6px 16px',
    borderRadius: '30px',
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '1px',
    marginBottom: '24px',
  },
  heroHeadline: {
    fontSize: '56px',
    fontWeight: 800,
    fontFamily: "'Playfair Display', serif",
    lineHeight: 1.15,
    marginBottom: '20px',
  },
  goldText: {
    color: '#f97316',
    background: 'linear-gradient(135deg, #f97316 0%, #fbbf24 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroSubtitle: {
    fontSize: '18px',
    color: '#d4d4d8',
    lineHeight: 1.6,
    marginBottom: '36px',
    maxWidth: '700px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  heroCtaRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    flexWrap: 'wrap',
    marginBottom: '48px',
  },
  heroPrimaryBtn: {
    backgroundColor: '#ea580c',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    padding: '16px 32px',
    fontSize: '16px',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    boxShadow: '0 6px 20px rgba(234, 88, 12, 0.4)',
  },
  heroSecondaryBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(8px)',
    color: '#ffffff',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    padding: '16px 32px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  heroStatsRow: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '32px',
    padding: '20px',
    backgroundColor: 'rgba(24, 24, 27, 0.6)',
    backdropFilter: 'blur(12px)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    maxWidth: '650px',
    margin: '0 auto',
  },
  statBox: {
    textAlign: 'center',
  },
  statNumber: {
    fontSize: '22px',
    fontWeight: 800,
    color: '#f59e0b',
  },
  statLabel: {
    fontSize: '12px',
    color: '#a1a1aa',
  },
  statDivider: {
    width: '1px',
    height: '30px',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  tablePickerSection: {
    padding: '80px 20px',
    maxWidth: '1100px',
    margin: '0 auto',
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  sectionBadge: {
    fontSize: '12px',
    fontWeight: 700,
    color: '#ea580c',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    display: 'block',
    marginBottom: '8px',
  },
  sectionTitle: {
    fontSize: '36px',
    fontWeight: 800,
    fontFamily: "'Playfair Display', serif",
    marginBottom: '12px',
  },
  sectionSubtitle: {
    fontSize: '15px',
    color: '#a1a1aa',
    maxWidth: '600px',
    margin: '0 auto',
  },
  tablePickerForm: {
    padding: '32px',
    borderRadius: '20px',
    border: '1px solid rgba(234, 88, 12, 0.3)',
    backgroundColor: 'rgba(24, 24, 27, 0.8)',
  },
  pickerFormRow: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  pickerField: {
    flex: 1,
    minWidth: '220px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  pickerLabel: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#d4d4d8',
  },
  pickerSelect: {
    padding: '14px 16px',
    borderRadius: '10px',
    backgroundColor: '#18181b',
    border: '1px solid #3f3f46',
    color: '#fafafa',
    fontSize: '15px',
    outline: 'none',
    width: '100%',
  },
  pickerSubmitBtn: {
    backgroundColor: '#ea580c',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    padding: '14px 24px',
    fontSize: '15px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 4px 14px rgba(234, 88, 12, 0.3)',
  },
  signatureSection: {
    padding: '80px 20px',
    backgroundColor: '#0c0a09',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  signatureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '24px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  signatureCard: {
    borderRadius: '16px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  dishImageWrapper: {
    position: 'relative',
    height: '200px',
  },
  dishImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  vegBadge: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    backgroundColor: '#ecfdf5',
    color: '#10b981',
    border: '1px solid #10b981',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: 700,
  },
  nonVegBadge: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    backgroundColor: '#fef2f2',
    color: '#ef4444',
    border: '1px solid #ef4444',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: 700,
  },
  priceTag: {
    position: 'absolute',
    bottom: '12px',
    right: '12px',
    backgroundColor: '#ea580c',
    color: '#ffffff',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: 800,
  },
  dishBody: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  dishTitle: {
    fontSize: '18px',
    fontWeight: 700,
    marginBottom: '8px',
  },
  dishDesc: {
    fontSize: '13px',
    color: '#a1a1aa',
    lineHeight: 1.5,
    marginBottom: '20px',
    flex: 1,
  },
  dishFooter: {
    marginTop: 'auto',
  },
  orderDishBtn: {
    width: '100%',
    backgroundColor: 'transparent',
    border: '1px solid #ea580c',
    color: '#ea580c',
    borderRadius: '8px',
    padding: '10px 0',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  ambianceSection: {
    padding: '80px 20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  ambianceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '24px',
  },
  ambianceCard: {
    position: 'relative',
    height: '350px',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
  },
  ambianceImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  ambianceOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(9, 9, 11, 0.7)',
    backgroundImage: 'linear-gradient(to top, rgba(9, 9, 11, 0.95) 0%, rgba(9, 9, 11, 0.2) 100%)',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  ambianceTitle: {
    fontSize: '24px',
    fontWeight: 800,
    fontFamily: "'Playfair Display', serif",
    color: '#f59e0b',
    marginBottom: '8px',
  },
  ambianceDesc: {
    fontSize: '13px',
    color: '#d4d4d8',
    lineHeight: 1.5,
    marginBottom: '16px',
  },
  ambianceBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#ea580c',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  aiFeatureSection: {
    padding: '60px 20px',
    maxWidth: '1100px',
    margin: '0 auto',
  },
  aiFeatureCard: {
    padding: '40px',
    borderRadius: '24px',
    display: 'flex',
    gap: '40px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  aiFeatureLeft: {
    flex: 1,
    minWidth: '280px',
  },
  aiBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'rgba(234, 88, 12, 0.15)',
    color: '#ea580c',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: 700,
    marginBottom: '16px',
  },
  aiTitle: {
    fontSize: '28px',
    fontWeight: 800,
    fontFamily: "'Playfair Display', serif",
    marginBottom: '16px',
    lineHeight: 1.25,
  },
  aiDesc: {
    fontSize: '14px',
    color: '#a1a1aa',
    lineHeight: 1.6,
    marginBottom: '24px',
  },
  aiBullets: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  aiBulletItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#fafafa',
  },
  aiFeatureRight: {
    flex: 1,
    minWidth: '280px',
  },
  aiMockCard: {
    backgroundColor: '#18181b',
    border: '1px solid #3f3f46',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
  },
  aiMockHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: 700,
    color: '#ea580c',
    marginBottom: '16px',
  },
  aiMockBubble: {
    backgroundColor: '#27272a',
    borderRadius: '12px',
    padding: '14px',
    fontSize: '13px',
    lineHeight: 1.5,
    color: '#d4d4d8',
    marginBottom: '16px',
  },
  aiMockBtn: {
    backgroundColor: '#ea580c',
    color: '#ffffff',
    borderRadius: '8px',
    padding: '10px',
    textAlign: 'center',
    fontSize: '13px',
    fontWeight: 700,
  },
  footer: {
    backgroundColor: '#050505',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '60px 40px 20px',
  },
  footerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '40px',
    maxWidth: '1200px',
    margin: '0 auto 40px',
  },
  footerBrand: {
    fontSize: '22px',
    fontWeight: 800,
    fontFamily: "'Playfair Display', serif",
    color: '#f59e0b',
    marginBottom: '12px',
  },
  footerDesc: {
    fontSize: '13px',
    color: '#71717a',
    lineHeight: 1.6,
  },
  footerTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#fafafa',
    marginBottom: '16px',
  },
  footerInfoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '13px',
    color: '#a1a1aa',
  },
  copyrightRow: {
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: '20px',
    textAlign: 'center',
    fontSize: '12px',
    color: '#52525b',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.75)',
    backdropFilter: 'blur(8px)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  modalContent: {
    backgroundColor: '#18181b',
    border: '1px solid #3f3f46',
    borderRadius: '20px',
    padding: '32px',
    maxWidth: '440px',
    width: '100%',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: 800,
    fontFamily: "'Playfair Display', serif",
    marginBottom: '8px',
  },
  modalSubtitle: {
    fontSize: '13px',
    color: '#a1a1aa',
    marginBottom: '20px',
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
  },
  modalCancelBtn: {
    backgroundColor: 'transparent',
    border: '1px solid #3f3f46',
    color: '#a1a1aa',
    borderRadius: '8px',
    padding: '10px 18px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  modalSubmitBtn: {
    backgroundColor: '#ea580c',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
  }
};
