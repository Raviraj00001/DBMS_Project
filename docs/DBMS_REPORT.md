# Wedding Planning & Booking Management System
## Comprehensive College DBMS Project Report & Technical Documentation
**Academic Year:** 2026–2027  
**Course:** Database Management Systems (DBMS) Laboratory & Theory  
**Technology Stack:** PostgreSQL, Node.js, Express.js, React, Vite, Tailwind CSS  
**Team Members:**  
1. **Ravi Raj** — Full-Stack Lead & System Architecture  
2. **Manpreet** — DBMS Schema, Normalization & Constraints  
3. **Perirt** — Backend APIs, Stored Functions & Procedures  
4. **Raj Tripathi** — Frontend UI/UX, Dashboards & SQL Query Demonstrator  

---

## 1. Executive Summary & Problem Definition

Wedding planning is an intricate multi-stakeholder enterprise involving venue reservations, caterers, photographers, florists, music entertainers, and multi-tier installment payments. Traditional unorganized booking approaches suffer from critical flaws:
1. **Double Booking Anomalies:** Venues getting booked for overlapping dates due to concurrent manual bookings.
2. **Data Redundancy & Inconsistency:** Vendor contact details, pricing structures, and package inclusions stored redundantly across multiple spreadsheets.
3. **Financial Discrepancies:** Inability to reconcile installment payments with contractual booking values.
4. **Lack of ACID Guarantees:** Partial updates where a venue is booked but custom services fail to register.

### Solution Overview
The **Wedding Planning & Booking Management System (Wedding Bliss)** is a normalized, production-grade web application powered by **PostgreSQL** in Third Normal Form (3NF). It enforces data integrity through **foreign key cascades, check constraints, unique indexes, database views, stored functions, and triggers**, coupled with an intuitive responsive UI styled in ivory, champagne, and gold.

---

## 2. Relational Schema & 3NF Normalization Proofs

The database consists of **12 normalized relational tables**:
1. `users`
2. `venues`
3. `venue_availability`
4. `vendors`
5. `services`
6. `vendor_services`
7. `packages`
8. `package_services`
9. `bookings`
10. `booking_services`
11. `payments`
12. `reviews`

### Proof of First Normal Form (1NF)
- **Atomicity:** All attributes contain single atomic values. For example, arrays (`image_urls`, `amenities`) are used strictly as leaf display representations, while relations like services, packages, and bookings are decomposed into normalized associative tables (`vendor_services`, `package_services`, `booking_services`).
- **Primary Keys:** Every relation defines an explicit primary key (`id`).
- **No Repeating Groups:** Multi-valued attributes such as package inclusions and booked services are factored into child tables.

### Proof of Second Normal Form (2NF)
- A relation is in 2NF if it is in 1NF and every non-prime attribute is **fully functionally dependent** on the primary key (no partial dependencies on composite keys).
- In associative bridge tables (`vendor_services`, `package_services`, `booking_services`), each record uses a surrogate synthetic primary key `id` with a candidate key `UNIQUE(vendor_id, service_id)` or `UNIQUE(package_id, service_id)`. Non-prime attributes like `price`, `quantity`, and `notes` depend on the full composite identifier.

### Proof of Third Normal Form (3NF)
- A relation is in 3NF if it is in 2NF and **no non-prime attribute is transitively dependent on the primary key** ($X \to Y$ and $Y \to Z$).
- *Example 1 (Vendors vs Users):* Vendor contact person name, email, and phone are **not** duplicated in `vendors`. Instead, `vendors.user_id` references `users(id)`, ensuring contact attributes depend strictly on `users.id`.
- *Example 2 (Bookings vs Customers vs Venues):* Venue name, city, and daily rate are **not** stored in `bookings`. `bookings` stores solely `venue_id` as a foreign key; historical line-item prices for vendor services are recorded explicitly in `booking_services.price_at_booking` to preserve immutability.

---

## 3. Database Integrity Constraints & Business Rules

| Table | Constraint Name | Type | Specification / Rule |
|---|---|---|---|
| `users` | `users_email_key` | UNIQUE | Enforces unique email per account |
| `users` | `chk_user_email` | CHECK | RegEx validation for valid RFC email format |
| `venues` | `chk_venue_capacity` | CHECK | `capacity_max >= capacity_min` |
| `venues` | `venues_price_chk` | CHECK | `price_per_day >= 0` |
| `venue_availability` | `uq_venue_date` | UNIQUE | `UNIQUE(venue_id, available_date)` prevents duplicate calendar slots |
| `vendors` | `vendors_user_id_key`| UNIQUE | Guarantees strict 1:1 relationship with user accounts |
| `services` | `services_name_key` | UNIQUE | Ensures unique catalog service definitions |
| `vendor_services` | `uq_vendor_service` | UNIQUE | `UNIQUE(vendor_id, service_id)` prevents redundant service listing |
| `package_services` | `uq_package_service`| UNIQUE | `UNIQUE(package_id, service_id)` prevents duplicate service inclusion |
| `bookings` | `bookings_reference_key` | UNIQUE | Guarantees unique booking reference numbers (e.g. `WB-2026-8801`) |
| `bookings` | `chk_paid_vs_total` | CHECK | `paid_amount <= total_amount + 0.01` prevents overpayment anomaly |
| `payments` | `payments_txn_key` | UNIQUE | `UNIQUE(transaction_reference)` guarantees idempotency |
| `reviews` | `chk_review_target` | CHECK | Enforces review targets either venue or vendor, not both |

---

## 4. Stored Routines: Functions, Triggers & Views

### 4.1 Database Views
1. **`view_booking_details`**: 5-table join aggregating booking, customer, venue, package, and service count data for quick dashboard and manifest rendering.
2. **`view_venue_performance`**: Analytical aggregation showing occupancy count, confirmed vs. completed events, gross revenue generated, and dynamic user ratings per venue.
3. **`view_vendor_analytics`**: Vendor business intelligence view reporting completed orders, total earnings, review counts, and computed average ratings.
4. **`view_upcoming_weddings`**: Operational log prioritizing upcoming events by days remaining (`wedding_date - CURRENT_DATE`).
5. **`view_monthly_revenue`**: Financial reporting view grouping payments by month and payment method.

### 4.2 Stored Functions (PL/pgSQL)
- **`fn_check_venue_availability(p_venue_id INT, p_wedding_date DATE) RETURNS BOOLEAN`**:
  Queries both `venue_availability` and active `bookings` to dynamically check if a venue can accept a reservation on a given date.
- **`fn_calculate_booking_total(p_booking_id INT) RETURNS NUMERIC`**:
  Calculates venue daily price + discounted package cost + sum of all booked custom services.

### 4.3 Automated Database Triggers
- **`trg_booking_prevent_double_booking`** (`BEFORE INSERT OR UPDATE` on `bookings`):
  Intercepts booking creation. If a venue has an active pending/confirmed reservation on that date, it raises an exception (`RAISE EXCEPTION`) to immediately abort the transaction.
- **`trg_payment_after_insert_update`** (`AFTER INSERT OR UPDATE` on `payments`):
  Whenever a payment is recorded with status `'completed'`, this trigger recalculates the booking's `paid_amount`, transitions status to `'confirmed'`, and locks the date in `venue_availability`.
- **`trg_users_updated_at` / `trg_venues_updated_at`**:
  Automatically updates the `updated_at` timestamp.

---

## 5. 20+ SQL Queries for Viva Demonstration

The system includes 23 documented, production SQL queries accessible through the **DBMS Showcase Explorer** (`/dbms-showcase`):
1. **Basic Filtering:** Query active high-capacity venues (`capacity_max >= 400`).
2. **Multi-Condition Filters:** Verified vendors in specific categories using `IN` and boolean conditions.
3. **Multi-Table Inner/Left Joins:** 4-table join connecting `bookings`, `booking_services`, `vendor_services`, and `vendors`.
4. **Unused Inventory Detection:** `LEFT OUTER JOIN ... WHERE b.id IS NULL` to find venues with zero bookings.
5. **Group By & Having Aggregations:** Revenue generated per venue with `HAVING COUNT(b.id) >= 1`.
6. **Multi-table Aggregations:** Vendor earnings calculation using `COALESCE(SUM(...), 0)`.
7. **Conditional Aggregations:** Payment method success ratios using `CASE WHEN ... THEN 1 END`.
8. **Correlated Subqueries:** Venues priced higher than their respective state average.
9. **Non-Correlated Subqueries:** Customers spending above the platform average wedding value.
10. **EXISTS Operator:** Identify customers having active reservations.
11. **Window Functions (`DENSE_RANK`):** Rank venues within each venue type by daily rental price.
12. **Running Totals (`SUM() OVER`):** Cumulative platform cash inflow timeline.
13. **Common Table Expressions (CTEs):** Multi-CTE query calculating customer outstanding balances.
14. **Package Matrix CTE:** Cross-tabulation of package popularity and attached service counts.
15. **Set Operations (`UNION` & `INTERSECT`):** Geographical presence footprint analysis.
16. **View & Function Execution:** Direct queries against `view_venue_performance`, `fn_check_venue_availability()`, and `fn_calculate_booking_total()`.

---

## 6. Security & Transaction Integrity

- **Password Security:** Salted bcrypt hashing with 10 rounds (`bcryptjs`). Raw passwords are never persisted.
- **JWT Authentication:** Stateless, signed JSON Web Tokens containing user identity and role.
- **Role-Based Authorization (RBAC):** Middleware guards enforcing strict role separation:
  - `admin`: Full platform control, vendor verification, venue creation.
  - `vendor`: Catalog and service pricing management, assigned work orders.
  - `customer`: Booking reservation, installment payments, reviews.
- **SQL Injection Prevention:** 100% of queries use **parameterized queries (`$1, $2, ...`)** via the node-postgres connection pool.
- **ACID Transactions:** Complex operations such as booking creation (booking + venue reservation + custom services line items) execute inside atomic `BEGIN ... COMMIT` blocks. If any sub-operation fails, the entire transaction is rolled back via `ROLLBACK`.

---

## 7. Team Contributions

- **Ravi Raj (Full-Stack Lead):** Overall system architecture, Express server setup, database connection pool, JWT authentication and role-based middleware, booking transaction flow, and integration testing.
- **Manpreet (DBMS & Data Architect):** Relational schema design, normalization to 3NF, primary/foreign key cascading rules, uniqueness/check constraints, seed dataset creation, and database views.
- **Perirt (Backend & Procedures Specialist):** PL/pgSQL stored procedures, triggers for double-booking prevention and payment reconciliation, query optimization, and REST API controller development.
- **Raj Tripathi (Frontend & UI/UX Specialist):** Premium wedding theme design in Tailwind CSS, responsive customer, vendor, and admin dashboards, and the interactive DBMS Live Query Explorer.

---

## 8. Viva & Faculty Evaluation Q&A Guide

**Q1: Why did you choose PostgreSQL over MySQL or MongoDB?**  
*Answer:* PostgreSQL offers advanced support for strict SQL standards, native PL/pgSQL stored procedures and triggers, rich data types (`TEXT[]`, `ENUM`), exceptional transaction isolation levels (ACID), and robust window functions (`DENSE_RANK()`, `SUM() OVER`). A relational database is optimal here because wedding planning requires strict relational consistency (e.g. booking references, payments, and calendar reservations).

**Q2: How does your application prevent double bookings?**  
*Answer:* Double booking prevention is enforced at two distinct layers:
1. *Application / Transaction layer:* Before inserting, the application checks `fn_check_venue_availability(venue_id, date)`.
2. *Database Trigger layer:* Even if concurrent requests bypass the API, the database trigger `trg_booking_prevent_double_booking` fires `BEFORE INSERT`, checks for active overlapping bookings on that date, and raises an exception that aborts the transaction. In addition, `venue_availability` has a `UNIQUE(venue_id, available_date)` constraint.

**Q3: Can you demonstrate 3NF in your schema?**  
*Answer:* In our `vendors` table, we do not store customer or user contact details redundantly. We store `user_id` referencing `users(id)`. If a vendor changes their phone number or email, it is updated in a single tuple in `users`, completely preventing update anomalies. Similarly, package service inclusions are factored into `package_services` rather than stored in a delimited string in `packages`.

**Q4: How are payments linked to booking status updates?**  
*Answer:* Payments are recorded in the `payments` table with `booking_id`. An automated database trigger (`trg_payment_after_insert_update`) fires after every completed payment, aggregates all completed payments for that booking, updates `bookings.paid_amount`, and automatically transitions `bookings.status` to `'confirmed'`.

