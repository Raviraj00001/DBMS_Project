# Wedding Planning & Booking Management System (Wedding Bliss)

> **College DBMS Capstone Group Project**  
> **Team:** Ravi Raj, Manpreet, Perirt, and Raj Tripathi  
> **Tech Stack:** React (Vite) + Tailwind CSS, Node.js + Express.js, PostgreSQL (`pg`)

---

## 🌟 Overview

The **Wedding Planning & Booking Management System** is a complete, working, production-quality full-stack web application designed for comprehensive wedding management. It combines normalized 3NF PostgreSQL data modeling with modern transactional web architecture, providing dedicated portals for **Customers**, **Vendors**, and **Administrators**.

### Key Highlights
- **Normalized 3NF PostgreSQL Database:** 12 normalized tables with Primary Keys, Foreign Keys (`ON DELETE CASCADE / SET NULL`), `UNIQUE`, `CHECK`, and `NOT NULL` constraints.
- **Enterprise ACID Transactions:** Booking creation, date reservation, and custom vendor service attachments execute inside atomic transactions (`BEGIN ... COMMIT / ROLLBACK`).
- **Database Triggers & Stored Functions:** Automated trigger for **double-booking prevention** (`trg_booking_prevent_double_booking`) and **payment reconciliation** (`trg_payment_after_insert_update`).
- **Live 20+ SQL Query Explorer:** Protected administrative console (`/admin/dbms`) allowing faculty and administrators to run joins, subqueries, CTEs, and window functions live against the database with execution timing.
- **Commercial Luxury Wedding UI:** Styled in ivory, champagne gold, and warm white with responsive customer navigation, real wedding testimonials, and "How It Works" workflow.
- **Strict Role Separation:** Customers experience a pure commercial wedding booking website; DBMS and evaluation features are strictly partitioned to `/admin/dbms`.

---

## 👥 Project Team & Contributions

| Member | Role | Core Contributions |
|---|---|---|
| **Ravi Raj** | Full-Stack Lead | API Architecture, JWT & RBAC Middleware, Transaction Safety, Routing |
| **Manpreet** | DBMS Architect | 3NF Schema Design, Constraints, Database Views, Seed Data |
| **Perirt** | Backend Specialist | Stored Procedures (`plpgsql`), Triggers, Multi-table Joins |
| **Raj Tripathi** | Frontend & UI/UX | Wedding Theme Design, Dashboards, Interactive DBMS Query Demonstrator |

---

## 🗄️ Database Architecture (3NF)

The database schema is defined in [`database/schema.sql`](file:///c:/Users/Ravi%20raj%20kumar/DBMSPROJECT/database/schema.sql) and contains 12 core tables:
1. `users` — Customer, Vendor, and Admin accounts with hashed passwords.
2. `venues` — Palaces, lawns, beach resorts, banquet halls with pricing and capacities.
3. `venue_availability` — Live calendar dates with `UNIQUE(venue_id, available_date)`.
4. `vendors` — Verified business profiles linked 1:1 to user accounts.
5. `services` — Master catalog of wedding service categories.
6. `vendor_services` — Associative bridge table mapping vendors to custom service pricing.
7. `packages` — Curated wedding tiers (Silver, Gold, Platinum, Royal Bespoke).
8. `package_services` — Associative bridge table mapping packages to included services.
9. `bookings` — Main wedding contracts with wedding dates, guest counts, and balances.
10. `booking_services` — Specific vendor line items assigned to an event.
11. `payments` — Ledger of financial installments with unique transaction references.
12. `reviews` — Customer reviews and ratings (1–5 stars) for venues and vendors.

### Database Views
- `view_booking_details` — 5-table join presenting full booking manifests.
- `view_venue_performance` — Venue revenue, event counts, and average customer ratings.
- `view_vendor_analytics` — Vendor orders fulfilled, total earnings, and reviews.
- `view_upcoming_weddings` — Operational calendar showing days remaining until the wedding.
- `view_monthly_revenue` — Monthly revenue breakdown by payment method.

---

## 🚀 Quickstart & Setup Guide

### 1. Prerequisites
- **Node.js** (v18 or higher installed — tested on v24.11)
- **npm** (v9 or higher — tested on v11.6)
- **PostgreSQL** (v14 or higher)

### 2. Configure Database Credentials
Edit [`backend/.env`](file:///c:/Users/Ravi%20raj%20kumar/DBMSPROJECT/backend/.env):
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# PostgreSQL Credentials
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=wedding_db

# JWT Secret
JWT_SECRET=super_secret_wedding_bliss_jwt_key_2026_xyz
JWT_EXPIRES_IN=7d
```

> **Note on PostgreSQL:**
> - If PostgreSQL is installed locally on Windows, start the service in `services.msc`.
> - Or run with Docker:
>   ```bash
>   docker run --name postgres-wedding -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=wedding_db -p 5432:5432 -d postgres:16
>   ```
> - Or supply a cloud PostgreSQL connection string via `DATABASE_URL` (Supabase, Neon, Render).

### 3. Provision Schema & Seed Data
Run the automated initialization script from the project root:
```bash
npm run db:init --prefix backend
```
This executes `database/schema.sql` and `database/seed.sql` to create all 12 tables, indexes, views, triggers, functions, and rich seed data.

---

## 🏃 Running the Application

### Start Backend API Server
Open a terminal in the project directory:
```bash
npm start --prefix backend
```
*Backend runs on: `http://localhost:5000`*  
*Health Check: `http://localhost:5000/api/health`*  
*DBMS Catalog: `http://localhost:5000/api/reports/queries`*

### Start Frontend Application
Open a second terminal in the project directory:
```bash
npm run dev --prefix frontend
```
*Frontend runs on: `http://localhost:5173`*

---

## 🔑 Demo Login Credentials

Enter the matching email and password on the **Login Page** (`/login`). Dashboard access requires a successful sign-in.

| Role | Email | Password | Access Rights |
|---|---|---|---|
| **Admin** | `admin@weddingbliss.com` | `password123` | System stats, verify vendors, add venues, update all bookings |
| **Vendor** | `catering@royalcatering.com` | `password123` | Assigned work orders, manage services & custom pricing, earnings |
| **Customer** | `raj.tripathi@gmail.com` | `password123` | Book venues, select packages, pay installments, write reviews |

---
## 🧪 Testing & Verification

Run the backend integration test suite:
```bash
npm test --prefix backend
```
*Tests verify:*
- Express app configuration and router initialization
- Bcrypt password hashing and salt verification
- JWT token signing and payload expiration validation
- DBMS 20+ query catalog integrity

Build the frontend for production:
```bash
npm run build --prefix frontend
```
*Builds production assets to `frontend/dist/` in under 15 seconds.*

---

## 📂 Project Directory Structure

```
DBMSPROJECT/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # pg connection pool & query logger
│   │   ├── controllers/
│   │   │   ├── authController.js     # User registration, login, profile
│   │   │   ├── venueController.js    # Venues CRUD & live date check
│   │   │   ├── vendorController.js   # Vendor profiles & custom services
│   │   │   ├── packageController.js  # Package tiers & service bundles
│   │   │   ├── bookingController.js  # ACID booking transactions
│   │   │   ├── paymentController.js  # Installment ledger & trigger updates
│   │   │   ├── reviewController.js   # Customer reviews & ratings
│   │   │   ├── dashboardController.js# Real SQL aggregated dashboard stats
│   │   │   └── reportController.js   # 20+ SQL live query demonstration runner
│   │   ├── middlewares/
│   │   │   ├── auth.js               # JWT verification & RBAC guard
│   │   │   ├── errorHandler.js       # Centralized error & SQL code mapper
│   │   │   └── validator.js          # Input validation
│   │   ├── routes/                   # REST route definitions
│   │   ├── app.js                    # Express app configuration
│   │   └── server.js                 # Server listener & startup diagnostics
│   ├── test/
│   │   └── api.test.js               # Unit and smoke test suite
│   ├── .env.example                  # Template configuration
│   ├── .env                          # Active configuration
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/               # Navbar, Footer, VenueCard, VendorCard, Modal, StatusBadge
│   │   ├── context/                  # AuthContext with 1-click demo logins
│   │   ├── pages/
│   │   │   ├── HomePage.jsx          # Hero search, featured venues, packages, testimonials
│   │   │   ├── VenuesPage.jsx        # Venue search, city & capacity filters
│   │   │   ├── VenueDetailPage.jsx   # Live date availability checker & booking modal
│   │   │   ├── VendorsPage.jsx       # Category filters & verified vendor cards
│   │   │   ├── VendorDetailPage.jsx  # Vendor services catalog & portfolio
│   │   │   ├── PackagesPage.jsx      # Comparison matrix across 4 tiers
│   │   │   ├── LoginPage.jsx         # 1-click evaluation logins
│   │   │   ├── RegisterPage.jsx      # Customer and Vendor registration
│   │   │   ├── CustomerDashboard.jsx # My Bookings, payment installments, receipts
│   │   │   ├── VendorDashboard.jsx   # Assigned work orders & service editor
│   │   │   ├── AdminDashboard.jsx    # System KPIs, vendor verifications, venue creation
│   │   │   ├── DbmsShowcasePage.jsx  # Live 20+ SQL query runner & viva evaluator
│   │   │   └── AboutPage.jsx         # Team attribution & architecture overview
│   │   ├── services/                 # Universal API client
│   │   ├── App.jsx                   # React Router with protected routes
│   │   ├── index.css                 # Custom wedding theme styling
│   │   └── main.jsx
│   ├── index.html                    # Cormorant Garamond & Plus Jakarta Sans
│   ├── tailwind.config.js            # Ivory, Champagne, Gold palette
│   ├── vite.config.js                # Vite config with backend proxy
│   └── package.json
│
├── database/
│   ├── schema.sql                    # 3NF DDL (Tables, Views, Triggers, Functions)
│   ├── seed.sql                      # Realistic DML (Users, Venues, Vendors, Bookings)
│   ├── queries.sql                   # 23 documented SQL queries for viva
│   ├── init.js                       # Node.js automated provisioning script
│   └── test-connection.js            # Connection test utility
│
├── docs/
│   ├── ERD.md                        # Mermaid ER diagram & relational cardinality
│   └── DBMS_REPORT.md                # Comprehensive academic project report & viva guide
│
├── .gitignore
└── README.md
```

---

## 🎓 Academic Viva & Faculty Demonstration Route (`/admin/dbms`)

Log in as **Admin** (`admin@weddingbliss.com` / `password123`) and visit **`/admin/dbms`**:
1. **Interactive Query Runner:** Select from 23 categorized queries (Joins, Aggregations, Correlated Subqueries, Window Functions, CTEs, Transactions).
2. **Execution Timing:** Displays actual query runtime in milliseconds from PostgreSQL.
3. **Dynamic Results Grid:** Renders dynamic table columns and rows returned by the query.
4. **Ad-Hoc SQL Editor:** Allows examiners to type any custom `SELECT` query and run it against the database.
5. **3NF Normalization Proofs:** Step-by-step documentation of 1NF, 2NF, 3NF, and BCNF characteristics.
6. **Database Relationships:** Visual cardinality mapping (1:1, 1:N, M:N) and FK constraint rules.
7. **Live Table Audit:** Visualizes live row counts across all 12 tables.

---

## 📄 License
Academic Project developed for College DBMS evaluation by **Ravi Raj, Manpreet, Perirt, and Raj Tripathi**.

