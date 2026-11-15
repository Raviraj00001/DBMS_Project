# Entity-Relationship (ER) Diagram & Relational Model
**Project:** Wedding Planning & Booking Management System  
**Course:** Database Management Systems (DBMS) Capstone Group Project  
**Team Members:** Ravi Raj, Manpreet, Perirt, Raj Tripathi  

---

## 1. Visual Entity-Relationship Diagram (Mermaid)

```mermaid
erDiagram
    USERS ||--o| VENDORS : "has profile (1:1)"
    USERS ||--o{ BOOKINGS : "places reservation (1:N)"
    USERS ||--o{ REVIEWS : "writes review (1:N)"

    VENUES ||--o{ VENUE_AVAILABILITY : "has calendar dates (1:N)"
    VENUES ||--o{ BOOKINGS : "is reserved for (1:N)"
    VENUES ||--o{ REVIEWS : "is reviewed in (1:N)"

    VENDORS ||--o{ VENDOR_SERVICES : "offers (1:N)"
    VENDORS ||--o{ REVIEWS : "is reviewed in (1:N)"

    SERVICES ||--o{ VENDOR_SERVICES : "is cataloged in (1:N)"
    SERVICES ||--o{ PACKAGE_SERVICES : "is bundled in (1:N)"

    PACKAGES ||--o{ PACKAGE_SERVICES : "contains (1:N)"
    PACKAGES ||--o{ BOOKINGS : "is selected in (1:N)"

    BOOKINGS ||--o{ BOOKING_SERVICES : "includes custom items (1:N)"
    BOOKINGS ||--o{ PAYMENTS : "generates transactions (1:N)"
    BOOKINGS ||--o{ REVIEWS : "yields feedback (1:N)"
    BOOKINGS ||--o{ VENUE_AVAILABILITY : "locks calendar date (1:1)"

    VENDOR_SERVICES ||--o{ BOOKING_SERVICES : "is booked as (1:N)"

    USERS {
        int id PK
        varchar full_name
        varchar email UK
        varchar password_hash
        varchar phone
        user_role role
        text avatar_url
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    VENUES {
        int id PK
        varchar name
        text description
        text address
        varchar city
        varchar state
        int capacity_min
        int capacity_max
        numeric price_per_day
        venue_type venue_type
        numeric rating
        text[] image_urls
        text[] amenities
        boolean is_available
        timestamp created_at
        timestamp updated_at
    }

    VENUE_AVAILABILITY {
        int id PK
        int venue_id FK
        date available_date UK
        varchar status
        int booking_id FK
        varchar notes
        timestamp created_at
    }

    VENDORS {
        int id PK
        int user_id FK,UK
        varchar business_name
        vendor_category category
        text description
        int experience_years
        text address
        varchar city
        numeric rating
        numeric starting_price
        boolean is_verified
        text[] portfolio_images
        timestamp created_at
        timestamp updated_at
    }

    SERVICES {
        int id PK
        varchar name UK
        vendor_category category
        text description
        numeric standard_price
        boolean is_active
        timestamp created_at
    }

    VENDOR_SERVICES {
        int id PK
        int vendor_id FK
        int service_id FK
        varchar custom_title
        text custom_description
        numeric price
        int duration_hours
        boolean is_active
        timestamp created_at
    }

    PACKAGES {
        int id PK
        varchar name UK
        varchar tier
        text description
        int guest_count
        numeric base_price
        numeric discount_percent
        boolean is_active
        text image_url
        text[] features
        timestamp created_at
    }

    PACKAGE_SERVICES {
        int id PK
        int package_id FK
        int service_id FK
        int quantity
        varchar notes
    }

    BOOKINGS {
        int id PK
        varchar booking_reference UK
        int customer_id FK
        int venue_id FK
        int package_id FK
        date wedding_date
        int guest_count
        numeric total_amount
        numeric paid_amount
        booking_status status
        text special_requests
        timestamp created_at
        timestamp updated_at
    }

    BOOKING_SERVICES {
        int id PK
        int booking_id FK
        int vendor_service_id FK
        numeric price_at_booking
        int quantity
        date service_date
        varchar status
        text notes
        timestamp created_at
    }

    PAYMENTS {
        int id PK
        int booking_id FK
        varchar transaction_reference UK
        numeric amount
        payment_method payment_method
        payment_status payment_status
        timestamp payment_date
        varchar notes
        timestamp created_at
    }

    REVIEWS {
        int id PK
        int booking_id FK
        int user_id FK
        int venue_id FK
        int vendor_id FK
        int rating
        text comment
        timestamp created_at
    }
```

---

## 2. Relational Mapping & Cardinality Summary

| Parent Entity | Child Entity | Cardinality | Foreign Key in Child | Delete Rule | Description |
|---|---|---|---|---|---|
| `users` | `vendors` | 1:1 | `vendors.user_id` | `ON DELETE CASCADE` | Vendor accounts extend base user identities |
| `users` | `bookings` | 1:N | `bookings.customer_id` | `ON DELETE RESTRICT` | Prevents deleting customer with active bookings |
| `venues` | `bookings` | 1:N | `bookings.venue_id` | `ON DELETE SET NULL` | Bookings preserve history if venue archived |
| `venues` | `venue_availability` | 1:N | `venue_availability.venue_id` | `ON DELETE CASCADE` | Calendar dates belong to respective venue |
| `packages` | `bookings` | 1:N | `bookings.package_id` | `ON DELETE SET NULL` | Package selection in wedding contract |
| `vendors` | `vendor_services` | 1:N | `vendor_services.vendor_id` | `ON DELETE CASCADE` | Specific menu or service items offered by vendor |
| `services` | `vendor_services` | 1:N | `vendor_services.service_id` | `ON DELETE RESTRICT` | Standard catalog classification |
| `packages` | `package_services`| 1:N | `package_services.package_id`| `ON DELETE CASCADE` | Package bundles multiple master services |
| `bookings`| `booking_services`| 1:N | `booking_services.booking_id`| `ON DELETE CASCADE` | Custom vendor services assigned to an event |
| `bookings`| `payments` | 1:N | `payments.booking_id` | `ON DELETE CASCADE` | Installment ledger for each booking |
| `users` | `reviews` | 1:N | `reviews.user_id` | `ON DELETE CASCADE` | Reviewer identity tracking |
| `venues` | `reviews` | 1:N | `reviews.venue_id` | `ON DELETE CASCADE` | Reviews submitted specifically for venues |
| `vendors` | `reviews` | 1:N | `reviews.vendor_id` | `ON DELETE CASCADE` | Reviews submitted specifically for vendors |

