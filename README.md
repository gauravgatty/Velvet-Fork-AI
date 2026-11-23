# 🍽️ Velvet Fork — AI-Integrated Smart Restaurant & Hotel Management System

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express%205-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20%26%20Local-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini%201.5%20Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)

> **Velvet Fork** is a full-stack, enterprise-grade restaurant and hotel dining management platform powered by **Google Gemini AI**. It bridges the gap between dine-in customers, kitchen staff, and restaurant administrators with real-time multi-round table ordering, dynamic kitchen display systems (KDS), and intelligent conversational food recommendations.

---

## 📑 Table of Contents

- [Key Highlights](#-key-highlights)
- [System Architecture](#-system-architecture)
- [Module Walkthrough](#-module-walkthrough)
  - [1. Customer Ordering & Dine-in Portal](#1-customer-ordering--dine-in-portal)
  - [2. AI Dining Concierge (Gemini 1.5 Flash)](#2-ai-dining-concierge-gemini-15-flash)
  - [3. Kitchen Display System (KDS)](#3-kitchen-display-system-kds)
  - [4. Admin & POS Management Suite](#4-admin--pos-management-suite)
- [Tech Stack](#-tech-stack)
- [Directory Structure](#-directory-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Running the Project](#running-the-project)
- [Live Demo Switcher](#-live-demo-switcher)
- [API Endpoints](#-api-endpoints)
- [Author & Acknowledgments](#-author--acknowledgments)

---

## 🌟 Key Highlights

- 📱 **QR & Table-Based Multi-Round Ordering**: Guests browse categorized menus, place multiple rounds of appetizers, mains, and drinks, all consolidated under a unified table session.
- 🤖 **AI-Powered Sommelier & Concierge**: Conversational assistant tailored to dietary constraints, mood, and budget, with instant one-click cart additions.
- 🍳 **Paperless Kitchen Display System (KDS)**: Live kitchen workflow tracking order states (`received` ➔ `preparing` ➔ `ready` ➔ `served`) with AI bottleneck prediction.
- 📊 **Executive Analytics & Sentiment Analysis**: Real-time sales telemetry, revenue breakdown, table occupancy heatmaps, and NLP-driven customer feedback analysis.
- 💳 **Integrated Mock Payment Gateway**: Supports UPI (QR simulation), Debit/Credit Cards, and Cash settlements with itemized digital billing.
- 🔄 **Autonomous Database Seeding**: Pre-configured menu catalogs, floor sections, and authentic reviews automatically seed into MongoDB on first boot.

---

## 🏗️ System Architecture

```text
 ┌────────────────────────────────────────────────────────┐
 │                   VELVET FORK CLIENT                   │
 │                  (React 19 + TypeScript)               │
 ├───────────────────┬───────────────────┬────────────────┤
 │   Customer View   │   Kitchen View    │   Admin View   │
 │   - QR Ordering   │   - Live KDS      │   - Analytics  │
 │   - AI Assistant  │   - Status Track  │   - Table/Menu │
 │   - Mock Checkout │   - AI Insights   │   - Sentiment  │
 └─────────┬─────────┴─────────┬─────────┴────────┬───────┘
           │                   │                  │
           ▼                   ▼                  ▼
 ┌────────────────────────────────────────────────────────┐
 │                    EXPRESS 5 BACKEND                   │
 │                   (Node.js + TSX Server)               │
 ├────────────────────────────────────────────────────────┤
 │  REST Endpoints: /api/menu, /api/orders, /api/sessions │
 └──────────────┬─────────────────────────┬───────────────┘
                │                         │
                ▼                         ▼
   ┌─────────────────────────┐  ┌─────────────────────────┐
   │    MONGODB DATABASE     │  │  GOOGLE GEMINI 1.5 API  │
   │ (Atlas Cloud / Local)   │  │   (LLM Concierge & NLP) │
   └─────────────────────────┘  └─────────────────────────┘
```

---

## 🚀 Module Walkthrough

### 1. Customer Ordering & Dine-in Portal
- **Table Session Management**: Select table or scan simulated QR to bind order to table ID (e.g., `AC-T1`, `Rooftop-T4`).
- **Dynamic Catalog**: Filter by dietary preference (*Veg*, *Non-Veg*, *Chef Specials*), categories (*Tandoori*, *Biryanis*, *Desserts*), and search by keywords.
- **Multi-Round Ordering**: Keep tabs open; order starters in Round 1 and main courses in Round 2 without bill fragmentation.
- **Settlement**: Review tax calculations, apply discount codes, and simulate payments via UPI QR, credit card, or pay-at-counter.

### 2. AI Dining Concierge (Gemini 1.5 Flash)
- **Natural Language Recommendations**: Prompt the AI: *"Suggest a romantic dinner for two under ₹1000"* or *"I'm allergic to dairy, what can I have?"*.
- **Smart Pairings**: Recommends drinks and desserts that complement selected entrees.
- **Fail-Safe Mode**: Built-in intelligent heuristic fallback ensures flawless recommendations even without an active internet connection or API key.

### 3. Kitchen Display System (KDS)
- **Real-Time Kanban View**: Organizes incoming tickets across statuses:
  - 🟡 **Received**: Freshly ordered, awaiting prep.
  - 🔵 **Preparing**: Active cooking in progress.
  - 🟢 **Ready**: Plated and staged for service.
  - ⚪ **Served**: Delivered to the table.
- **AI Kitchen Insights**: Analyzes ticket load, highlights high-delay items, and suggests kitchen prep optimizations.

### 4. Admin & POS Management Suite
- **Floor & Section Control**: Manage sections (*Main AC*, *Rooftop Garden*, *Banquet Hall*), change table statuses (*Free*, *Occupied*, *Billing Requested*), and merge tables for large parties.
- **Live Menu Engineering**: Add new dishes, upload images, alter prices, and toggle real-time availability on the fly.
- **Customer Sentiment Analysis**: AI aggregates customer star ratings and textual reviews to extract top praises, operational bottlenecks, and actionable business strategies.

---

## 💻 Tech Stack

| Domain | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite 8, Lucide React, HTML5 Canvas QR Generator |
| **Styling** | Modern Vanilla CSS & Tailwind styling with luxury Velvet/Gold theme |
| **Backend** | Express 5, Node.js, `tsx` (TypeScript Execute), CORS, Dotenv |
| **Database** | MongoDB with Mongoose 9 ODM (compatible with MongoDB Atlas & Local) |
| **AI / Machine Learning** | Google Gemini 1.5 Flash API (Structured JSON & Chat Completions) |
| **Tooling & Quality** | Oxlint, TypeScript Compiler (`tsc`) |

---

## 📁 Directory Structure

```bash
Velvet-Fork_(AI_Integrated)/
├── server/
│   ├── models.ts              # Mongoose schemas (Menu, Order, Session, Section, Review)
│   └── server.ts              # Express 5 REST API & MongoDB connection logic
├── src/
│   ├── assets/                # Logos, hero images, and branding assets
│   ├── components/
│   │   ├── ai/
│   │   │   ├── AiAdminAnalytics.tsx    # Sentiment & executive intelligence
│   │   │   ├── AiDiningAssistant.tsx   # Floating concierge widget
│   │   │   └── AiKitchenInsights.tsx   # Kitchen load & delay predictor
│   │   ├── AdminView.tsx               # Manager dashboard & menu CRUD
│   │   ├── CustomerView.tsx            # Digital menu, cart & checkout
│   │   ├── KitchenView.tsx             # Interactive Kitchen Display System
│   │   ├── MockPayment.tsx             # Payment gateway simulation
│   │   ├── RestaurantHomePage.tsx      # Welcome landing & table chooser
│   │   └── RestaurantLogo.tsx          # Brand identity SVG component
│   ├── context/
│   │   └── AppContext.tsx              # Global state management & polling
│   ├── services/
│   │   └── geminiService.ts            # Gemini 1.5 Flash client + heuristic engine
│   ├── mockData.ts                     # Initial menu, sections, and review seeds
│   ├── types.ts                        # Unified TypeScript interfaces
│   ├── App.tsx                         # Client-side routing & view switcher
│   └── main.tsx                        # Application mount point
├── .env.example                        # Template for environment credentials
├── index.html                          # Single Page Application HTML shell
├── package.json                        # Scripts and dependencies
├── tsconfig.json                       # TypeScript compiler options
└── vite.config.ts                      # Vite configuration & server ports
```

---

## 🛠️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (either running locally on port 27017 or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster URL)
- *(Optional)* [Google Gemini API Key](https://aistudio.google.com/) for live AI responses

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/gauravgatty/Velvet-Fork-AI-Integrated.git
   cd Velvet-Fork-AI-Integrated
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

### Environment Configuration

Create a `.env` file in the root directory by copying `.env.example`:

```bash
cp .env.example .env
```

Edit your `.env` file:

```env
# MongoDB Connection (Atlas Cloud or Local)
MONGODB_URI=mongodb://localhost:27017/velvet_fork

# Backend Port
PORT=5000

# Optional: Google Gemini API Key
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

> **Note**: If `VITE_GEMINI_API_KEY` is not provided, the application automatically engages its built-in rule-based recommendation fallback engine.

---

### Running the Project

Run both the backend Express server and the Vite frontend simultaneously:

```bash
npm run dev:all
```

Alternatively, you can run them in separate terminals:

```bash
# Terminal 1 - Backend Server (Port 5000)
npm run server

# Terminal 2 - Frontend Client (Port 5173)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🎛️ Live Demo Switcher

Velvet Fork includes a built-in **Demo Panel** (accessible via the floating gear icon in the bottom-right corner). This allows evaluators, professors, or clients to effortlessly toggle between:
- 📱 **Customer Portal** (`/`)
- 👨‍🍳 **Kitchen Display System** (`/kitchen`)
- 📈 **Admin & POS Dashboard** (`/admin`)

Test real-time workflow by opening `/` in one browser tab and `/kitchen` in another to observe orders updating instantaneously!

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Server and database connectivity status |
| `GET` | `/api/menu` | Fetch complete restaurant menu |
| `POST` | `/api/menu` | Create a new menu item |
| `PUT` | `/api/menu/:id` | Update an existing item |
| `DELETE` | `/api/menu/:id` | Remove an item from the menu |
| `GET` | `/api/orders` | Fetch active and historical orders |
| `POST` | `/api/orders` | Place a new order or round |
| `PUT` | `/api/orders/:id/status` | Update kitchen status (`preparing`, `ready`, etc.) |
| `GET` | `/api/sections` | Fetch restaurant floor layout and table statuses |
| `GET` | `/api/reviews` | Retrieve customer ratings and reviews |

---

## 📄 License & Author

Developed by **[Gaurav Gatty](https://github.com/gauravgatty)**.  
Released under the **MIT License**. Contributions and suggestions are welcome!
