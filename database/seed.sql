-- ============================================================================
-- College DBMS Group Project: Wedding Planning & Booking Management System
-- Seed Data Script
-- Team Members: Ravi Raj, Manpreet, Perirt, Raj Tripathi
-- Password for all seed users is: password123
-- Hash: $2a$10$cFPqDtBG/ND/A/5Ew5hMSuNIJwvnJ1rUHEIYHjptsXct9umGAVTBC
-- ============================================================================

-- 1. USERS
INSERT INTO users (id, full_name, email, password_hash, phone, role, avatar_url) VALUES
(1, 'Admin Ravi Raj', 'admin@weddingbliss.com', '$2a$10$cFPqDtBG/ND/A/5Ew5hMSuNIJwvnJ1rUHEIYHjptsXct9umGAVTBC', '+91 98765 43210', 'admin', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'),
(2, 'Manpreet Singh', 'catering@royalcatering.com', '$2a$10$cFPqDtBG/ND/A/5Ew5hMSuNIJwvnJ1rUHEIYHjptsXct9umGAVTBC', '+91 98111 22334', 'vendor', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250'),
(3, 'Priya Sharma', 'priya@cinematicmemories.com', '$2a$10$cFPqDtBG/ND/A/5Ew5hMSuNIJwvnJ1rUHEIYHjptsXct9umGAVTBC', '+91 98222 33445', 'vendor', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250'),
(4, 'Rajesh Khanna', 'rajesh@imperialflora.com', '$2a$10$cFPqDtBG/ND/A/5Ew5hMSuNIJwvnJ1rUHEIYHjptsXct9umGAVTBC', '+91 98333 44556', 'vendor', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250'),
(5, 'Ananya Roy', 'ananya@glamourandgrace.com', '$2a$10$cFPqDtBG/ND/A/5Ew5hMSuNIJwvnJ1rUHEIYHjptsXct9umGAVTBC', '+91 98444 55667', 'vendor', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250'),
(6, 'DJ Kabir Sen', 'kabir@rhythmbeats.com', '$2a$10$cFPqDtBG/ND/A/5Ew5hMSuNIJwvnJ1rUHEIYHjptsXct9umGAVTBC', '+91 98555 66778', 'vendor', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=250'),
(7, 'Raj Tripathi', 'raj.tripathi@gmail.com', '$2a$10$cFPqDtBG/ND/A/5Ew5hMSuNIJwvnJ1rUHEIYHjptsXct9umGAVTBC', '+91 99100 11223', 'customer', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250'),
(8, 'Perirt Patel', 'perirt.patel@gmail.com', '$2a$10$cFPqDtBG/ND/A/5Ew5hMSuNIJwvnJ1rUHEIYHjptsXct9umGAVTBC', '+91 99200 22334', 'customer', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250'),
(9, 'Neha & Siddharth', 'neha.sid@example.com', '$2a$10$cFPqDtBG/ND/A/5Ew5hMSuNIJwvnJ1rUHEIYHjptsXct9umGAVTBC', '+91 99300 33445', 'customer', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250'),
(10, 'Aarav & Meera', 'aarav.meera@example.com', '$2a$10$cFPqDtBG/ND/A/5Ew5hMSuNIJwvnJ1rUHEIYHjptsXct9umGAVTBC', '+91 99400 44556', 'customer', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=250');

SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- 2. VENUES
INSERT INTO venues (id, name, description, address, city, state, capacity_min, capacity_max, price_per_day, venue_type, rating, image_urls, amenities) VALUES
(1, 'The Grand Umaid Palace', 
 'An opulent 19th-century royal heritage palace featuring sandstone arches, sprawling royal courtyards, luxury banquet suites and picturesque sunset terraces. Perfect for an unforgettable royal destination wedding.', 
 'Palace Road, Cantt Area', 'Jaipur', 'Rajasthan', 200, 1500, 350000.00, 'palace', 4.95, 
 ARRAY['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=1200', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200'], 
 ARRAY['Valet Parking', 'Bridal Suite', 'In-house Helipad', 'Swimming Pool', 'Central AC', 'Sound & Light Rigging', 'Power Backup']),

(2, 'Taj Lakeview Lawn & Resort', 
 'Breathtaking lakeside luxury resort offering manicured lawns overlooking pristine waters, elegant marble pavilions, and fairy-lit evening settings under starry skies.', 
 'Haridas Ji Ki Magri', 'Udaipur', 'Rajasthan', 150, 1000, 280000.00, 'lawn', 4.88, 
 ARRAY['https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=1200', 'https://images.unsplash.com/photo-1545232979-fbf68fe9f1f8?auto=format&fit=crop&q=80&w=1200'], 
 ARRAY['Lakeside View', 'Outdoor Amphitheatre', 'Bridal Dressing Rooms', 'Luxury Guest Cottages', 'Fireworks Permission', 'Valet Parking']),

(3, 'Emerald Palms Beachside Pavilion', 
 'Romantic tropical beach resort with direct golden sand access, coconut groves, sunset beach mandap setup, and tranquil ocean breezes.', 
 'Sunset Beach Way, Varca', 'Goa', 'Goa', 100, 600, 220000.00, 'beachside', 4.92, 
 ARRAY['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=1200'], 
 ARRAY['Private Beach Access', 'Oceanfront Dining', 'DJ Beach Stage', 'Honeymoon Suite', 'Bar & Lounge', 'Shuttle Service']),

(4, 'Royal Heritage Grand Ballroom', 
 'A grand architectural marvel situated in the capital city, featuring crystal chandeliers, Italian marble flooring, and world-class acoustic engineering.', 
 'Sardar Patel Marg, Chanakyapuri', 'New Delhi', 'Delhi', 250, 1200, 190000.00, 'banquet_hall', 4.82, 
 ARRAY['https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200', 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=80&w=1200'], 
 ARRAY['Centrally Air Conditioned', 'VVIP Lounge', 'Separate Groom & Bride Rooms', 'Underground Parking for 400 Cars', 'Kitchen Prep Area']),

(5, 'Oberoi Skyline Orchid Pavilion', 
 'Contemporary penthouse banquet and open-sky glass pavilion offering panoramic views of Mumbai skyline, ultra-modern ambient lighting, and bespoke decor options.', 
 'Nariman Point, Marine Drive', 'Mumbai', 'Maharashtra', 80, 500, 240000.00, 'hotel', 4.79, 
 ARRAY['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1200'], 
 ARRAY['Skyline View', 'Valet Parking', 'Luxury Suites', 'Infinity Pool Terrace', 'In-house Sommelier']),

(6, 'Mayflower Botanical Gardens & Villa', 
 'Lush green botanical paradise surrounded by exotic floral landscaping, glasshouse conservatory, and charming European-inspired pergolas.', 
 'Whitefield Main Road', 'Bengaluru', 'Karnataka', 120, 800, 175000.00, 'resort', 4.85, 
 ARRAY['https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2?auto=format&fit=crop&q=80&w=1200'], 
 ARRAY['Lush Greenery', 'Glasshouse Pavilion', 'Eco-friendly Lighting', 'Organic Catering Prep Station', 'Open Air Dance Floor']);

SELECT setval('venues_id_seq', (SELECT MAX(id) FROM venues));

-- 3. VENUE AVAILABILITY (Sample blocked & booked dates)
INSERT INTO venue_availability (venue_id, available_date, status, notes) VALUES
(1, '2026-12-15', 'booked', 'Confirmed Royal Destination Wedding'),
(1, '2026-12-16', 'booked', 'Reception Party'),
(1, '2026-12-25', 'blocked', 'Holiday VIP Maintenance'),
(2, '2026-11-28', 'booked', 'Lakeview Sangeet & Wedding'),
(2, '2026-12-20', 'booked', 'NRI Wedding Festivities'),
(3, '2026-12-10', 'booked', 'Goa Beachfront Ceremony'),
(4, '2026-12-05', 'booked', 'Corporate Gala & Wedding');

-- 4. VENDORS
INSERT INTO vendors (id, user_id, business_name, category, description, experience_years, address, city, rating, starting_price, is_verified, portfolio_images) VALUES
(1, 2, 'Royal Gourmet Catering & Banquets', 'catering', 
 'Award-winning authentic culinary experiences, multi-cuisine luxury buffets, interactive live counters (Chaat, Sushi, Mughlai, Italian), and bespoke silver-service dining.', 
 14, 'Civil Lines', 'Jaipur', 4.92, 1800.00, TRUE, 
 ARRAY['https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800']),

(2, 3, 'Cinematic Memories Photography', 'photography', 
 'Master wedding storytellers specializing in candid frames, pre-wedding destination shoots, cinematic 4K drone cinematography, and fine-art album curation.', 
 9, 'Indiranagar', 'Bengaluru', 4.96, 75000.00, TRUE, 
 ARRAY['https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&q=80&w=800']),

(3, 4, 'Imperial Flora & Dream Decor', 'decoration', 
 'Transforming dream visions into reality. Grand floral mandap arches, royal fairy light tunnels, thematic stage backdrops, exotic floral canopies and regal centerpieces.', 
 11, 'Defence Colony', 'New Delhi', 4.88, 120000.00, TRUE, 
 ARRAY['https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=80&w=800']),

(4, 5, 'Glamour & Grace Bridal Artistry', 'makeup_artist', 
 'Celebrity HD Airbrush bridal makeup, exquisite hair styling, traditional drapery, and pre-bridal skin therapy packages.', 
 8, 'Bandra West', 'Mumbai', 4.91, 25000.00, TRUE, 
 ARRAY['https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800']),

(5, 6, 'Rhythm & Melodies Live Band & DJ', 'music_dj', 
 'High-voltage entertainment with premier Bollywood & EDM DJs, live Punjabi Dhol ensembles, saxophonists, and synchronized intelligent concert lighting.', 
 7, 'Koregaon Park', 'Pune', 4.85, 45000.00, TRUE, 
 ARRAY['https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=800']);

SELECT setval('vendors_id_seq', (SELECT MAX(id) FROM vendors));

-- 5. SERVICES (Master Catalog)
INSERT INTO services (id, name, category, description, standard_price) VALUES
(1, 'Royal Multi-Cuisine Wedding Feast', 'catering', 'Extensive 7-course buffet with welcome mocktails, starters, main courses, and gourmet desserts.', 2200.00),
(2, 'Cocktail & Canapés Live Counter', 'catering', 'Interactive live food stations with artisan hors doeuvres and specialty mocktail mixologists.', 850.00),
(3, 'Full Wedding Day Candid Photography', 'photography', 'Two senior candid photographers capturing moments from getting ready till bidaai.', 85000.00),
(4, 'Cinematic 4K Wedding Film & Drone', 'videography', 'High-definition cinematic teaser, full documentary film, and licensed drone aerial shots.', 110000.00),
(5, 'Grand Royal Mandap & Stage Decor', 'decoration', 'Fresh imported floral canopy, royal throne seating, cascading crystal chandeliers, and carpeted walkway.', 250000.00),
(6, 'Fairytale Fairy-Light Canopy & Floral Entrances', 'decoration', 'Magical 100-meter tunnel of warm micro-lights with fresh rose petal urns.', 95000.00),
(7, 'Celebrity Bridal HD Airbrush Makeup', 'makeup_artist', 'Long-lasting HD airbrush makeup with lashes, hair styling, and professional jewelry setting.', 35000.00),
(8, 'Family & Bridesmaid Glam Styling', 'makeup_artist', 'Professional party makeup and hair styling for up to 5 family members or bridesmaids.', 40000.00),
(9, 'Sangeet DJ & Concert Stage Rigging', 'music_dj', 'Top-tier sound line arrays, bass bins, intelligent moving heads, haze machines, and master DJ.', 65000.00),
(10, 'Live Acoustic Sufi & Fusion Ensemble', 'music_dj', '4-piece live band performing soulful Bollywood, Sufi and acoustic wedding favorites.', 75000.00);

SELECT setval('services_id_seq', (SELECT MAX(id) FROM services));

-- 6. VENDOR SERVICES (Vendor-specific offerings)
INSERT INTO vendor_services (id, vendor_id, service_id, custom_title, custom_description, price, duration_hours) VALUES
(1, 1, 1, 'Maharaja Royal Feast (Per Plate)', 'Signature Rajasthani & Continental luxury buffet with 45+ gourmet items.', 2200.00, 6),
(2, 1, 2, 'Gourmet Sangeet Chaat & Tapas Station', 'Interactive live nitrogen ice cream, woodfired pizza & Delhi style chaat bazaar.', 950.00, 4),
(3, 2, 3, 'Signature Candid Storytelling (2 Photographers)', 'Unobtrusive photography capturing authentic emotions, raw expressions, and priceless candids.', 85000.00, 10),
(4, 2, 4, 'Cinematic Film + 4K Drone Aerial Showcase', 'A 5-minute heart-touching wedding trailer and 45-minute cinematic heirloom documentary.', 120000.00, 12),
(5, 3, 5, 'Imperial Grand Palace Floral Mandap', 'Handcrafted carved pillars adorned with fresh orchids, baby breath, and rajnigandha blooms.', 260000.00, 18),
(6, 3, 6, 'Enchanted Starlit Ceiling & Pathway Walkway', 'Overhead ceiling of 10,000 warm starlights with mirror aisle runner and floral pillars.', 110000.00, 14),
(7, 4, 7, 'HD Airbrush Bridal Glamour by Ananya', 'Flawless water-resistant airbrush application, contouring, premium lashes, and designer drape.', 32000.00, 4),
(8, 4, 8, 'Bridal Entourage Makeup Package (4 Persons)', 'Complete high-definition party makeup and hair design for mother of bride & sisters.', 36000.00, 5),
(9, 5, 9, 'Ultimate Sangeet Sound & Light Experience', 'Pioneer Nexus console, 15,000 watt sound system, 12 intelligent beams, and Punjabi dhol combo.', 70000.00, 6);

SELECT setval('vendor_services_id_seq', (SELECT MAX(id) FROM vendor_services));

-- 7. PACKAGES
INSERT INTO packages (id, name, tier, description, guest_count, base_price, discount_percent, image_url, features) VALUES
(1, 'Silver Elegance Package', 'Silver', 
 'An intimate and tastefully curated wedding celebration package designed for close family and friends with quality essentials included.', 
 250, 650000.00, 5.00, 
 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800', 
 ARRAY['Venue Coordination', 'Standard Floral Stage & Mandap', 'Buffet Dinner for 250 Guests', 'Candid Photography (1 Day)', 'DJ & Basic Sound Setup', 'Dedicated Event Coordinator']),

(2, 'Gold Grandeur Package', 'Gold', 
 'Our most popular comprehensive wedding experience featuring luxury floral decor, cinematic videography, gourmet catering, and bridal pampering.', 
 500, 1450000.00, 10.00, 
 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=800', 
 ARRAY['Heritage Venue Partner Priority', 'Royal Fresh Floral Mandap & Tunnel', 'Live Counters + Multi-Cuisine Feast (500 Pax)', 'Drone Videography + Candid Photography', 'Bridal HD Airbrush Makeup Session', 'Intelligent Concert Stage Lighting & DJ', 'Complimentary Pre-Wedding Teaser']),

(3, 'Platinum Royal Heirloom', 'Platinum', 
 'The pinnacle of luxury destination weddings. Complete royal palace arrangement, Michelin-caliber menu, celebrity artist management, and end-to-end concierge.', 
 800, 2800000.00, 15.00, 
 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800', 
 ARRAY['Full 3-Day Palace/Resort Buyout Assistance', 'Custom Architectural Lighting & Floral Sculptures', 'Unlimited Gourmet Dining & Royal Hospitality', '4-Crew Cinematic Team with Dual Drones', 'Complete Family Makeup Lounge', 'Sufi Band + Top DJ + Dhol Troupe', 'Personalized Wedding Mobile App & Website', 'VIP Airport Chauffeur Coordination']),

(4, 'Bespoke Coastal Dream', 'Royal Bespoke', 
 'Custom oceanfront wedding design crafted for lovers of the sea, barefoot luxury, sunset cocktail ceremonies, and beachside firework receptions.', 
 350, 1150000.00, 8.00, 
 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800', 
 ARRAY['Private Beach Boardwalk Setup', 'Tropical Driftwood & Orchid Mandap', 'Fresh Coastal Seafood & Vegan Grills', 'Sunset Golden-Hour Photography', 'Acoustic Beachside Music', 'Tiki Torch Pathway & Fire Pits']);

SELECT setval('packages_id_seq', (SELECT MAX(id) FROM packages));

-- 8. PACKAGE SERVICES
INSERT INTO package_services (package_id, service_id, quantity, notes) VALUES
(1, 1, 1, 'Feast for up to 250 guests'),
(1, 3, 1, 'Standard day coverage'),
(1, 6, 1, 'Pathway fairy lights'),
(2, 1, 1, 'Grand feast for 500 guests'),
(2, 2, 1, 'Appetizer cocktail counters'),
(2, 3, 1, 'Candid coverage with senior photographers'),
(2, 4, 1, 'Cinematic highlight film'),
(2, 5, 1, 'Royal grand mandap decor'),
(2, 7, 1, 'Bridal makeup package'),
(2, 9, 1, 'Sangeet DJ and line array'),
(3, 1, 1, 'Royal feast for 800 guests'),
(3, 2, 1, 'Exotic live stations'),
(3, 3, 1, 'Multi-angle photography'),
(3, 4, 1, 'Full 4K documentary and drone aerials'),
(3, 5, 1, 'Master floral architecture'),
(3, 7, 1, 'Bridal HD airbrush'),
(3, 8, 1, 'Entourage styling'),
(3, 9, 1, 'Concert DJ rig'),
(3, 10, 1, 'Live Sufi band');

-- 9. BOOKINGS
INSERT INTO bookings (id, booking_reference, customer_id, venue_id, package_id, wedding_date, guest_count, total_amount, paid_amount, status, special_requests) VALUES
(1, 'WB-2026-8801', 7, 1, 3, '2026-12-15', 750, 3150000.00, 3150000.00, 'confirmed', 'Couple requested traditional Rajasthani folk welcome dancers and rose petal shower upon entry.'),
(2, 'WB-2026-8802', 8, 2, 2, '2026-11-28', 450, 1730000.00, 800000.00, 'confirmed', 'Lakeside mandap setup with warm amber lighting; strict pure-vegetarian separate buffet counter.'),
(3, 'WB-2026-8803', 9, 3, 4, '2026-12-10', 300, 1370000.00, 500000.00, 'confirmed', 'Beach ceremony timed exactly for sunset at 5:45 PM; barefoot champagne toast on the shore.'),
(4, 'WB-2026-8804', 10, 4, 1, '2027-01-18', 250, 840000.00, 200000.00, 'pending', 'Awaiting finalized guest list; require additional wheelchair accessibility ramps.'),
(5, 'WB-2026-8805', 7, 5, NULL, '2027-02-14', 150, 420000.00, 0.00, 'pending', 'Valentine Day intimate rooftop reception with live jazz and bespoke skyline cocktail hour.');

SELECT setval('bookings_id_seq', (SELECT MAX(id) FROM bookings));

-- 10. BOOKING SERVICES (Custom/vendor service assignments)
INSERT INTO booking_services (id, booking_id, vendor_service_id, price_at_booking, quantity, service_date, status, notes) VALUES
(1, 1, 1, 2200.00, 750, '2026-12-15', 'confirmed', 'Royal Maharaja dining spread for 750 guests'),
(2, 1, 3, 85000.00, 1, '2026-12-15', 'confirmed', 'Senior photo crew assigned'),
(3, 1, 5, 260000.00, 1, '2026-12-15', 'confirmed', 'Full grand palace mandap construction'),
(4, 2, 1, 2200.00, 450, '2026-11-28', 'confirmed', 'Lakeside banquet menu for 450 guests'),
(5, 2, 4, 120000.00, 1, '2026-11-28', 'confirmed', 'Drone aerials approved by local authority'),
(6, 3, 9, 70000.00, 1, '2026-12-10', 'confirmed', 'Goa beachfront DJ setup');

SELECT setval('booking_services_id_seq', (SELECT MAX(id) FROM booking_services));

-- 11. PAYMENTS
INSERT INTO payments (id, booking_id, transaction_reference, amount, payment_method, payment_status, payment_date, notes) VALUES
(1, 1, 'TXN-UPI-9928172615', 1000000.00, 'upi', 'completed', '2026-10-01 14:30:00+00', 'Initial booking deposit via UPI'),
(2, 1, 'TXN-NB-4482910482', 1500000.00, 'net_banking', 'completed', '2026-10-15 11:15:00+00', 'Second milestone payment for venue and packages'),
(3, 1, 'TXN-CC-1192847192', 650000.00, 'credit_card', 'completed', '2026-11-01 16:45:00+00', 'Final balance clearance'),
(4, 2, 'TXN-UPI-3349182746', 800000.00, 'upi', 'completed', '2026-10-20 10:00:00+00', 'Advance booking deposit'),
(5, 3, 'TXN-CC-8827361524', 500000.00, 'credit_card', 'completed', '2026-10-25 18:20:00+00', 'Destination wedding deposit'),
(6, 4, 'TXN-UPI-7712394851', 200000.00, 'upi', 'completed', '2026-11-05 13:10:00+00', 'Token advance payment');

SELECT setval('payments_id_seq', (SELECT MAX(id) FROM payments));

-- 12. REVIEWS
INSERT INTO reviews (id, booking_id, user_id, venue_id, vendor_id, rating, comment) VALUES
(1, 1, 7, 1, NULL, 5, 'The Grand Umaid Palace was nothing short of a fairytale! Our guests were mesmerized by the hospitality, royal ambiance and magical courtyard sunset.'),
(2, 1, 7, NULL, 1, 5, 'Manpreet and his catering crew outdid themselves! The dal baati churma, live chaat and international desserts received nonstop praise.'),
(3, 2, 8, 2, NULL, 5, 'Taj Lakeview provided the most surreal backdrop for our wedding vows. The reflections on the water and lighting were phenomenal.'),
(4, 2, 8, NULL, 2, 5, 'Priya Sharma captured moments we didn’t even realize were happening. The wedding teaser brought tears of joy to our entire family!'),
(5, 3, 9, 3, NULL, 5, 'Emerald Palms delivered our dream beach wedding! The sound of waves during our pheras was truly unforgettable.'),
(6, 1, 7, NULL, 3, 4, 'Imperial Flora created breathtaking mandap decor. The fresh orchid chandeliers looked imperial.');

SELECT setval('reviews_id_seq', (SELECT MAX(id) FROM reviews));

