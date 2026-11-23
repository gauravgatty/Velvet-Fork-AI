import { MenuItem, Section } from './types';

export const HOTEL_INFO = {
  name: "The Velvet Fork",
  tagline: "A Symphony of Gourmet Flavors",
  description: "Experience premium culinary dining where heritage recipes meet modern innovation. Located in the heart of the city, we offer multiple unique dining environments including our elegant Classic Hall, the breezy Rooftop Oasis, and the serene Garden Lounge.",
  address: "102 Culinary Boulevard, Sector 5, Metro City",
  phone: "+91 98765 43210",
  email: "reservations@velvetfork.com",
  timings: "11:00 AM - 11:30 PM Everyday",
  rating: 4.8,
  reviewsCount: 1420
};

export const INITIAL_SECTIONS: Section[] = [
  {
    name: "Classic Hall",
    tables: [
      { id: "CH-T1", name: "Table 1", status: "free" },
      { id: "CH-T2", name: "Table 2", status: "free" },
      { id: "CH-T3", name: "Table 3", status: "free" },
      { id: "CH-T4", name: "Table 4", status: "free" }
    ]
  },
  {
    name: "Rooftop Oasis",
    tables: [
      { id: "RT-T1", name: "Rooftop 1", status: "free" },
      { id: "RT-T2", name: "Rooftop 2", status: "free" },
      { id: "RT-T3", name: "Rooftop 3", status: "free" },
      { id: "RT-T4", name: "Rooftop 4", status: "free" }
    ]
  },
  {
    name: "Garden Lounge",
    tables: [
      { id: "GL-T1", name: "Garden 1", status: "free" },
      { id: "GL-T2", name: "Garden 2", status: "free" },
      { id: "GL-T3", name: "Garden 3", status: "free" },
      { id: "GL-T4", name: "Garden 4", status: "free" }
    ]
  }
];

export const INITIAL_MENU: MenuItem[] = [
  // --- STARTERS & APPETIZERS ---
  {
    id: "str-1",
    name: "Crispy Truffle Fries",
    price: 129,
    description: "Golden fries tossed in white truffle oil, grated parmesan cheese, and fresh parsley, served with garlic aioli.",
    category: "Starters",
    isVeg: true,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "str-2",
    name: "Mediterranean Spiced Chicken Skewers",
    price: 179,
    description: "Tender chicken chunks marinated in Greek yogurt and spices, charcoal grilled, served with mint tzatziki.",
    category: "Starters",
    isVeg: false,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "str-3",
    name: "Avocado Sourdough Bruschetta",
    price: 149,
    description: "Toasted sourdough bread topped with creamy smashed avocado, heirloom cherry tomatoes, fresh basil, and aged balsamic reduction.",
    category: "Starters",
    isVeg: true,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "str-4",
    name: "Crispy Salt & Pepper Chili Corn",
    price: 139,
    description: "Golden fried sweet corn tossed with spring onions, crushed black pepper, fresh garlic, and bell peppers.",
    category: "Starters",
    isVeg: true,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1514944288352-fffac99f0bdf?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "str-5",
    name: "Fiery Firecracker Dynamite Shrimp",
    price: 209,
    description: "Crispy battered jumbo prawns coated in a tangy, spicy, creamy sriracha glaze served on crunchy lettuce.",
    category: "Starters",
    isVeg: false,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80"
  },

  // --- RICE & BIRYANIS ---
  {
    id: "rc-1",
    name: "Hyderabadi Chicken Dum Biryani",
    price: 219,
    description: "Fragrant long-grain Basmati rice dum-cooked with secret spices, mint, saffron, and tender marinated chicken.",
    category: "Rice & Biryanis",
    isVeg: false,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "rc-2",
    name: "Kashmiri Mutton Dum Biryani",
    price: 249,
    description: "Slow-simmered juicy mutton, caramelized onions, kewra water, and saffron layered basmati rice served with raita.",
    category: "Rice & Biryanis",
    isVeg: false,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "rc-4",
    name: "Schezwan Chicken Fried Rice",
    price: 169,
    description: "High-flame wok tossed rice with shredded chicken, crunchy capsicum, scallions, and fiery Schezwan chili sauce.",
    category: "Rice & Biryanis",
    isVeg: false,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80"
  },

  // --- TANDOORI & GRILLS ---
  {
    id: "td-1",
    name: "Classic Tandoori Chicken (Half)",
    price: 229,
    description: "Bone-in chicken marinated in hung curd, mustard oil, garlic, and traditional tandoori masala, roasted in clay bhatti.",
    category: "Tandoori & Grills",
    isVeg: false,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "td-2",
    name: "Coastal Chicken Ghee Roast",
    price: 219,
    description: "Mangalorean specialty succulent chicken chunks roasted in pure desi ghee and fiery Byadgi chili paste.",
    category: "Tandoori & Grills",
    isVeg: false,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80"
  },

  // --- CHEF SPECIALS ---
  {
    id: "spf-1",
    name: "Pan-Seared Atlantic Herb Salmon",
    price: 299,
    description: "Crispy skin Atlantic salmon fillet served over garlic mashed potatoes, tender asparagus spears, and lemon-caper butter sauce.",
    category: "Chef Specials",
    isVeg: false,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "spf-2",
    name: "Wild Mushroom & Truffle Risotto",
    price: 229,
    description: "Slow-cooked Italian Arborio rice cooked with porcini and wild chanterelle mushrooms, finished with Reggiano parmesan.",
    category: "Chef Specials",
    isVeg: true,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "spf-3",
    name: "Smoked Coal Butter Chicken",
    price: 239,
    description: "Tandoori charred chicken tikka simmered in a velvet tomato gravy infused with smoky coal dungar essence.",
    category: "Chef Specials",
    isVeg: false,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80"
  },

  // --- MAIN COURSE ---
  {
    id: "mc-1",
    name: "Royal Paneer Butter Masala",
    price: 189,
    description: "Succulent cottage cheese cubes simmered in a rich cream gravy with sun-ripened tomatoes and cashews.",
    category: "Main Course",
    isVeg: true,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "mc-2",
    name: "Dal Makhani with Garlic Naan",
    price: 159,
    description: "Black lentils slow-simmered overnight over clay oven charcoal with butter, cream, served with fresh garlic naan.",
    category: "Main Course",
    isVeg: true,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "mc-3",
    name: "Kashmiri Mutton Rogan Josh",
    price: 269,
    description: "Slow-braised tender lamb shanks cooked in a rich aromatic gravy flavored with Kashmiri chili and fennel.",
    category: "Main Course",
    isVeg: false,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1545247181-516773cae754?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "mc-4",
    name: "Malai Kofta Royale",
    price: 199,
    description: "Melt-in-mouth cottage cheese and potato dumplings stuffed with dry fruits, served in a rich cashew velvet cream.",
    category: "Main Course",
    isVeg: true,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80"
  },

  // --- DESSERTS ---
  {
    id: "des-1",
    name: "Molten Chocolate Lava Cake",
    price: 119,
    description: "Rich dark chocolate cake with a warm liquid lava center, accompanied by a scoop of Madagascar vanilla bean ice cream.",
    category: "Desserts",
    isVeg: true,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "des-2",
    name: "Classic New York Cheesecake",
    price: 139,
    description: "Dense, velvety smooth cream cheese filling on a buttery graham cracker crust, topped with fresh strawberry compote.",
    category: "Desserts",
    isVeg: true,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80"
  },

  // --- BEVERAGES & MOCKTAILS ---
  {
    id: "bev-1",
    name: "Fresh Mint Lime Mojito",
    price: 79,
    description: "Invigorating muddled fresh mint leaves, lime juice, simple syrup, topped with crushed ice and sparkling soda.",
    category: "Beverages",
    isVeg: true,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "bev-2",
    name: "Iced Caramel Macchiato",
    price: 99,
    description: "Rich dark espresso poured over cold whole milk and vanilla syrup, crowned with handcrafted caramel drizzle.",
    category: "Beverages",
    isVeg: true,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80"
  }
];

export const INITIAL_REVIEWS = [
  {
    id: "rev-1",
    orderId: "ord-mock-1",
    rating: 5,
    comment: "The Smoked Butter Chicken was extraordinary! Loved the smoky aroma and quick table service.",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    tableId: "CH-T2",
    sentiment: "positive" as const
  },
  {
    id: "rev-2",
    orderId: "ord-mock-2",
    rating: 5,
    comment: "Crispy Truffle Fries were fresh and parmesan was delightful. Gemini AI recommended a great mint mojito pairing!",
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    tableId: "RT-T1",
    sentiment: "positive" as const
  }
];
