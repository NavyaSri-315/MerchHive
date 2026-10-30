# MerchHive B2B Wholesale E-Commerce Platform

> **"Connecting Verified Suppliers with Businesses for Seamless Bulk Trading."**

MerchHive is a complete, production-ready Full-Stack MERN B2B Wholesale Trading Platform engineered with 3-tier Role-Based Access Control (RBAC), live real-time RFQ negotiation via Socket.io, volume tiered pricing, automated PDF tax invoicing, and direct courier dispatch tracking.

---

## 🚀 Key Modules & Architecture

### 1. User Roles & 3-Tier RBAC
- **Super Admin (`superadmin`):**
  - Live Platform Analytics: Gross Merchandise Value (GMV), Settled Volume, Commission Earnings (avg 3.5%), and active network entities.
  - KYC Verification Queue: Review uploaded business proof documents (GST registration, PAN card, CIN incorporation), Approve or Reject with feedback, and assign authorized B2B credit limits (Net 30/60 financing lines).
  - Category & Commission Management: Define wholesale product classifications and custom commission rates.
- **Supplier / Manufacturer (`supplier`):**
  - Wholesale Product Builder: Create catalog SKUs with dynamic volume tiered price slabs (`{ minQuantity, maxQuantity, pricePerUnit }`), Minimum Order Quantities (MOQ), technical specifications key-value builder, and inventory tracking.
  - RFQ Manager & Real-Time Chat: Respond to buyer requests for quotations with back-and-forth counter-offers.
  - Order Dispatcher: Manage bulk consignments, assign courier tracking numbers (AWB, carrier), and update delivery milestones.
- **Buyer Enterprise (`buyer`):**
  - Wholesale Catalog & Dynamic Price Calculator: Filter by category, search by SKU, and view volume discounts.
  - Side-by-Side Product Comparison Matrix: Compare technical specifications, tiered prices, lead times, and MOQ across multiple products.
  - Live RFQ Negotiation: Negotiate custom prices directly with manufacturers via Socket.io. Upon agreement, lock in negotiated prices and directly add them to the procurement cart.
  - Bulk Checkout & Tax Invoices: Apply B2B trade coupons, select Net-30 commercial credit terms or gateways, and instantly download authenticated PDF Tax Invoices generated via PDFKit.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, Redux Toolkit, Tailwind CSS v4, Lucide Icons, React Router DOM v7, Axios, Socket.io-client.
- **Backend:** Node.js, Express.js, Socket.io, Mongoose (MongoDB), JWT Auth, Multer, PDFKit.
- **Database:** MongoDB.

---

## 🔑 Pre-Seeded Demo Credentials

The platform includes an evaluator demo switcher in the navigation bar to test all user roles with a single click:

| Role | Email | Password | Details |
|------|-------|----------|---------|
| **Super Admin** | `admin@bulkconnect.com` | `Admin@123` | Platform GMV, KYC queue, category management |
| **Verified Supplier 1** | `supplier@apexind.com` | `Supplier@123` | Apex Industrial Tools & Machinery Corp (Manufacturer) |
| **Verified Supplier 2** | `sales@vortexelec.com` | `Supplier@123` | Vortex Semiconductor & Electronics (Wholesaler) |
| **Pending Supplier 3** | `info@zenithmfg.com` | `Supplier@123` | Zenith Garments Ltd (Awaiting KYC verification in Admin queue) |
| **Verified Buyer** | `purchasing@metroretail.com` | `Buyer@123` | Metro Retail Mart Chain India Pvt Ltd |

---

## 💻 Running Locally

### 1. Backend Server
```bash
cd server
npm install
node seed.js    # Populates MongoDB with demo users, companies, products, RFQ, and orders
npm start       # Runs backend and Socket.io engine on http://localhost:5000
```

### 2. Frontend Client
```bash
cd client
npm install
npm run dev     # Runs Vite dev server on http://localhost:5173
```

---

## 📦 API Routes Summary

- `POST /api/auth/register` - Register user & linked business entity
- `POST /api/auth/login` - Authenticate and issue JWT token
- `GET /api/products` - Browse catalog with filters (category, search, MOQ, sort)
- `POST /api/products/:id/calculate-price` - Calculate volume tiered pricing for quantity
- `POST /api/products` - Create wholesale product (Verified Supplier)
- `POST /api/rfqs` - Create RFQ custom quotation inquiry
- `POST /api/rfqs/:id/counter` - Submit back-and-forth counter offer
- `POST /api/rfqs/:id/accept` - Lock in quotation price for checkout
- `GET /api/chat/rfq/:rfqId` - Fetch real-time negotiation chat history
- `POST /api/orders` - Place bulk procurement order
- `GET /api/orders/:id/invoice` - Stream generated PDF Tax Invoice
- `GET /api/admin/analytics` - Platform GMV and commission statistics
- `GET /api/admin/verification-queue` - List pending supplier and buyer company KYCs
- `PUT /api/admin/verify-company/:id` - Approve or reject business verification
