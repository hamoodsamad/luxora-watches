# ✦ Luxore Watches — Timeless Luxury E-Commerce Experience (Full-Stack)

A premier luxury horology e-commerce web application inspired by Swiss watchmaking heritage. Built with modern web standards, refined dark & gold aesthetics, interactive 3D perspective animations, and a complete serverless backend ready for instant **Vercel** deployment.

---

## 🚀 Key Features & Full-Stack Capabilities

### 1. Full-Stack Serverless Architecture (Ready for Vercel)
- **`/api/products`**: REST API for inventory management (GET all/filtered/searched, POST new watch, DELETE watch).
- **`/api/orders`**: Real-time order processing, status tracking, courier dispatch, and refund management.
- **`/api/contact`**: Concierge inquiry handling for prospective collectors.
- **`/api/store`**: Dynamic store statistics and brand heritage content management.
- **`/api/auth`**: Administrative security verification and passcode rotation.
- **Dual-Mode Data Layer**: Automatically communicates with Vercel serverless endpoints when hosted, and seamlessly falls back to browser `localStorage` when running offline or statically.

### 2. "Back to Portfolio" Integration
Designed specifically to showcase on developer portfolios:
- **Navbar Button**: Dedicated `← Back to Portfolio` button in the navigation header across all pages (`index.html`, `product-detail.html`, `my-orders.html`, `order-success.html`, `admin.html`).
- **Floating Quick-Return Badge**: A discreet, luxury-themed floating pill (`← Back to Portfolio`) in the bottom-left corner.
- **Smart Return Logic**: Intelligently inspects `document.referrer` or browser history.
- **Custom Portfolio URL Configuration**: You can configure your own live portfolio URL by running in the browser console:
  ```javascript
  localStorage.setItem('luxore_portfolio_url', 'https://yourportfolio.com');
  ```

### 3. Collection Search & Precision Sorting
- Real-time search by model title, material, dial finish, or keywords.
- Dynamic sorting by:
  - Featured Curations
  - Price: Low to High
  - Price: High to Low
  - Model Name: A — Z
- Multi-category filtering (All, Men, Women, Limited Edition).

### 4. Interactive Concierge Contact Form
- Completely interactive contact section in `index.html`.
- Dispatches client inquiries to the `/api/contact` backend.
- Full administration viewer inside the Admin Dashboard (`admin.html`).

### 5. Secret Master Administration Console
- Access URL: `admin.html` (or press `Ctrl + Shift + A` on the storefront, or click the small lock icon 🔒 in the footer).
- Default administrative passcode: `admin123` (can be changed in the dashboard).
- View customer orders, verify merchant settlements, issue refunds, and print courier packing slips.
- View incoming concierge messages.
- Deploy new timepieces to the catalog and edit live boutique statistics.

### 6. Mobile Responsiveness & Luxury Micro-Interactions
- Smooth animated mobile navigation menu with hamburger toggle for tablets and smartphones.
- Interactive 3D mouse tilt on signature timepieces.
- Custom cursor ring & dot for high-end aesthetic feel.
- Luxury toast notifications replacing default browser alerts.

---

## 🛠️ Local Setup & Running

This project uses modern Node.js and ES Modules. No build tools or heavy packages required!

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended).

### 2. Start the Full-Stack Server
```bash
# Start local development server
npm start
# or
node server.js
```
The server will start at:
```
http://localhost:3000
```
(If port 3000 is occupied, it automatically picks the next available port: 3001, 3002, etc.)

---

## ☁️ How to Deploy on Vercel

This repository is pre-configured with `vercel.json` for one-click deployment:

### Option A: Via GitHub (Recommended)
1. Initialize git and push this folder to your GitHub account:
   ```bash
   git init
   git add .
   git commit -m "Luxore Watches Full-Stack Vercel Release"
   git branch -M main
   git remote add origin https://github.com/<your-username>/luxora-watches.git
   git push -u origin main
   ```
2. Go to [Vercel](https://vercel.com/) and click **"Add New Project"**.
3. Import your `luxora-watches` GitHub repository.
4. Leave framework preset as **Other** (Vercel automatically detects `vercel.json` and `/api` serverless functions).
5. Click **Deploy**. Your site will be live on a `*.vercel.app` domain in seconds!

### Option B: Via Vercel CLI
```bash
npm i -g vercel
vercel
```
Follow the simple prompts in your terminal to deploy immediately.

---

## 📁 Project Structure

```
luxora-watches/
├── api/                         # Vercel Serverless Functions
│   ├── _data.js                 # Shared in-memory data & seed catalog
│   ├── products.js              # REST API: Products catalog CRUD
│   ├── orders.js                # REST API: Customer orders CRUD
│   ├── contact.js               # REST API: Concierge messages
│   ├── store.js                 # REST API: Store info & stats
│   └── auth.js                  # REST API: Admin authentication
├── assets/
│   └── images/
│       └── tourbillon.png       # Imperium Tourbillon centerpiece asset
├── js-files/
│   ├── adminHandler.js          # Admin dashboard & sync engine
│   ├── confirmationHandler.js   # Order receipt & confirmation logic
│   ├── main.js                  # Storefront engine, search, sort & contact
│   ├── myOrdersHandler.js       # Customer orders & refund tracker
│   ├── portfolioHelper.js       # Dedicated Back to Portfolio handler
│   ├── productDetailHandler.js  # Product specs & simulated OTP checkout
│   ├── productsData.js          # Catalog data layer with API sync
│   ├── toastHelper.js           # Obsidian & Gold toast alerts
│   └── uiAnimations.js          # 3D tilt & cursor interactions
├── styles/
│   ├── admin.css                # Administration console styling
│   ├── confirmation.css         # Invoice & receipt styling
│   ├── detail.css               # Timepiece detail page styling
│   ├── luxora.css               # Main luxury design system
│   └── myorders.css             # Customer orders vault styling
├── admin.html                   # Secret owner console
├── index.html                   # Main luxury storefront
├── my-orders.html               # Customer order history
├── order-success.html           # Verified acquisition invoice
├── product-detail.html          # Individual watch specification page
├── package.json                 # Node.js project manifest & scripts
├── server.js                    # Local Full-Stack dev server
├── vercel.json                  # Vercel deployment configuration
└── .gitignore                   # Ignored files for clean repository
```

---

## 🔒 Administrative Credentials
- **Console URL**: `/admin.html`
- **Passcode**: `admin123`

---

© 2026 Luxore Watches. Crafted for luxury horology enthusiasts and showcase portfolios.
