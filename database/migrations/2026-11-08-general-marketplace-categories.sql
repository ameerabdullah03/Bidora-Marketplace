-- Expand Bidora to a grouped, general-purpose marketplace taxonomy.
-- Existing category IDs are retained and their listing rows are not rewritten.
-- Apply after a current database backup.
BEGIN;

ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS parent_id BIGINT REFERENCES public.categories(id) ON DELETE RESTRICT;
CREATE INDEX IF NOT EXISTS idx_categories_parent_order ON public.categories(parent_id, display_order);

-- Reuse the original category rows where possible so existing listings remain attached.
UPDATE public.categories SET name = 'Mobile Phones', slug = 'mobile-phones', description = 'Mobile phones and smartphones'
  WHERE slug = 'phones-tablets';
UPDATE public.categories SET name = 'Laptops', slug = 'laptops', description = 'Laptop computers'
  WHERE slug = 'laptops-computers';
UPDATE public.categories SET name = 'Video-Audio', slug = 'video-audio', description = 'Video, television, and audio equipment'
  WHERE slug = 'audio-headphones';
UPDATE public.categories SET name = 'Smart Watches', slug = 'smart-watches', description = 'Smart watches and wearable devices'
  WHERE slug = 'wearables';
UPDATE public.categories SET name = 'Cameras & Accessories', slug = 'cameras-accessories', description = 'Cameras and photography accessories'
  WHERE slug = 'cameras-photography';
UPDATE public.categories SET name = 'Games & Entertainment', slug = 'games-entertainment', description = 'Games, consoles, and entertainment equipment'
  WHERE slug = 'gaming-consoles';

-- Reconcile the earlier broad-category seed if it has already been installed.
UPDATE public.categories SET name = 'Furniture & Home Decor', slug = 'furniture-home-decor'
  WHERE slug = 'home-garden';
UPDATE public.categories SET name = 'Fashion & Beauty', slug = 'fashion-beauty'
  WHERE slug = 'fashion-accessories';
UPDATE public.categories SET name = 'Books, Sports & Hobbies', slug = 'books-sports-hobbies'
  WHERE slug = 'books-media';
UPDATE public.categories SET name = 'Kids', slug = 'kids'
  WHERE slug = 'toys-baby';
UPDATE public.categories SET name = 'Sports Equipment', slug = 'sports-equipment'
  WHERE slug = 'sports-outdoors';
UPDATE public.categories SET name = 'Musical Instruments', slug = 'musical-instruments'
  WHERE slug = 'music-instruments';

CREATE TEMP TABLE bidora_category_seed (
  name TEXT NOT NULL,
  slug TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  parent_slug TEXT,
  depth INTEGER NOT NULL,
  display_order INTEGER NOT NULL
) ON COMMIT DROP;

INSERT INTO bidora_category_seed (name, slug, description, parent_slug, depth, display_order) VALUES
  ('Electronics & Home Appliances', 'electronics-home-appliances', 'Electronics, appliances, and related equipment', NULL, 0, 1),
  ('Mobiles', 'mobiles', 'Mobile phones, tablets, and wearable devices', NULL, 0, 2),
  ('Vehicles', 'vehicles', 'Cars, motorcycles, bicycles, and other vehicles', NULL, 0, 3),
  ('Business, Industrial & Agriculture', 'business-industrial-agriculture', 'Commercial, industrial, and agricultural goods', NULL, 0, 4),
  ('Services', 'services', 'Local and professional services', NULL, 0, 5),
  ('Jobs', 'jobs', 'Full-time, part-time, and specialist roles', NULL, 0, 6),
  ('Real Estate', 'real-estate', 'Property for sale and rent', NULL, 0, 7),
  ('Animals', 'animals', 'Pets, birds, livestock, and animal supplies', NULL, 0, 8),
  ('Furniture & Home Decor', 'furniture-home-decor', 'Furniture, household goods, and home decor', NULL, 0, 9),
  ('Fashion & Beauty', 'fashion-beauty', 'Clothing, accessories, beauty, and personal care', NULL, 0, 10),
  ('Books, Sports & Hobbies', 'books-sports-hobbies', 'Books, sports gear, music, and hobbies', NULL, 0, 11),
  ('Kids', 'kids', 'Toys, baby goods, and children’s items', NULL, 0, 12),
  ('Collectibles & Antiques', 'collectibles-antiques', 'Antiques, collectibles, and rare finds', NULL, 0, 13),

  ('Computers & Accessories', 'computers-accessories', 'Computers and related accessories', 'electronics-home-appliances', 1, 1),
  ('Laptops', 'laptops', 'Laptop computers', 'electronics-home-appliances', 1, 2),
  ('Televisions & Accessories', 'televisions-accessories', 'Televisions and related accessories', 'electronics-home-appliances', 1, 3),
  ('Refrigerators & Freezers', 'refrigerators-freezers', 'Refrigerators and freezers', 'electronics-home-appliances', 1, 4),
  ('Games & Entertainment', 'games-entertainment', 'Games, consoles, and entertainment equipment', 'electronics-home-appliances', 1, 5),
  ('Kitchen Appliances', 'kitchen-appliances', 'Small and large kitchen appliances', 'electronics-home-appliances', 1, 6),
  ('Cameras & Accessories', 'cameras-accessories', 'Cameras and photography accessories', 'electronics-home-appliances', 1, 7),
  ('Video-Audio', 'video-audio', 'Video and audio equipment', 'electronics-home-appliances', 1, 8),
  ('AC & Coolers', 'ac-coolers', 'Air conditioners and room coolers', 'electronics-home-appliances', 1, 9),
  ('Generators, UPS & Power Solutions', 'generators-ups-power-solutions', 'Generators, UPS units, and power equipment', 'electronics-home-appliances', 1, 10),
  ('Solar Appliances', 'solar-appliances', 'Solar-powered appliances and equipment', 'electronics-home-appliances', 1, 11),
  ('Washing Machines & Dryers', 'washing-machines-dryers', 'Washing machines and clothes dryers', 'electronics-home-appliances', 1, 12),
  ('Heaters & Geysers', 'heaters-geysers', 'Heaters and water geysers', 'electronics-home-appliances', 1, 13),
  ('Other Home Appliances', 'other-home-appliances', 'Other household appliances', 'electronics-home-appliances', 1, 14),
  ('Tools & DIY Equipment', 'tools-diy-equipment', 'Tools and do-it-yourself equipment', 'electronics-home-appliances', 1, 15),
  ('Fans', 'fans', 'Ceiling, pedestal, and other fans', 'electronics-home-appliances', 1, 16),
  ('Microwaves & Ovens', 'microwaves-ovens', 'Microwave ovens and cooking ovens', 'electronics-home-appliances', 1, 17),
  ('Sewing Machines', 'sewing-machines', 'Sewing machines and accessories', 'electronics-home-appliances', 1, 18),
  ('Water Dispensers', 'water-dispensers', 'Water dispensers and coolers', 'electronics-home-appliances', 1, 19),
  ('Irons & Steamers', 'irons-steamers', 'Clothes irons and garment steamers', 'electronics-home-appliances', 1, 20),
  ('Vacuum Cleaners', 'vacuum-cleaners', 'Vacuum cleaners and floor-care equipment', 'electronics-home-appliances', 1, 21),
  ('Air Purifiers & Humidifiers', 'air-purifiers-humidifiers', 'Air purifiers and humidifiers', 'electronics-home-appliances', 1, 22),

  ('Mobile Phones', 'mobile-phones', 'Mobile phones and smartphones', 'mobiles', 1, 1),
  ('Accessories', 'mobile-accessories', 'Mobile phone accessories', 'mobiles', 1, 2),
  ('Tablets', 'tablets', 'Tablets and e-readers', 'mobiles', 1, 3),
  ('Smart Watches', 'smart-watches', 'Smart watches and wearable devices', 'mobiles', 1, 4),
  ('Landline Phones', 'landline-phones', 'Landline telephones', 'mobiles', 1, 5),
  ('Other Wearables', 'other-wearables', 'Other wearable devices', 'mobiles', 1, 6),
  ('Mobile Numbers', 'mobile-numbers', 'Mobile numbers and SIM offers', 'mobiles', 1, 7),

  ('Cars', 'cars', 'Cars for sale', 'vehicles', 1, 1),
  ('Cars Accessories', 'cars-accessories', 'Accessories for cars', 'vehicles', 1, 2),
  ('Vehicle Spare Parts', 'vehicle-spare-parts', 'Spare parts for cars and vehicles', 'vehicles', 1, 3),
  ('Car Care', 'car-care', 'Car cleaning and care products', 'vehicles', 1, 4),
  ('Rickshaw & Chingchi', 'rickshaw-chingchi', 'Rickshaws and chingchi vehicles', 'vehicles', 1, 5),
  ('Buses, Vans & Trucks', 'buses-vans-trucks', 'Buses, vans, and trucks', 'vehicles', 1, 6),
  ('Tractors & Trailers', 'tractors-trailers', 'Tractors and trailers', 'vehicles', 1, 7),
  ('Oil & Lubricants', 'oil-lubricants', 'Vehicle oils and lubricants', 'vehicles', 1, 8),
  ('Cars on Installments', 'cars-on-installments', 'Cars offered on installment plans', 'vehicles', 1, 9),
  ('Boats', 'boats', 'Boats and marine vehicles', 'vehicles', 1, 10),
  ('Other Vehicles', 'other-vehicles', 'Other vehicles', 'vehicles', 1, 11),
  ('Bikes', 'bikes', 'Motorcycles, bicycles, and related goods', 'vehicles', 1, 12),
  ('Motorcycles', 'motorcycles', 'Motorcycles and motorbikes', 'bikes', 2, 1),
  ('Bicycles', 'bicycles', 'Bicycles and cycling gear', 'bikes', 2, 2),
  ('Scooters', 'scooters', 'Scooters and mopeds', 'bikes', 2, 3),
  ('Bike Spare Parts', 'bike-spare-parts', 'Motorcycle and bicycle spare parts', 'bikes', 2, 4),
  ('Bikes Accessories', 'bikes-accessories', 'Accessories for motorcycles and bicycles', 'bikes', 2, 5),
  ('ATV & Quads', 'atv-quads', 'All-terrain vehicles and quad bikes', 'bikes', 2, 6),
  ('Bike Care', 'bike-care', 'Motorcycle and bicycle care products', 'bikes', 2, 7),

  ('Other Business & Industry', 'other-business-industry', 'Other business and industrial goods', 'business-industrial-agriculture', 1, 1),
  ('Food & Restaurants', 'food-restaurants-business', 'Food business and restaurant supplies', 'business-industrial-agriculture', 1, 2),
  ('Medical & Pharma', 'medical-pharma', 'Medical and pharmaceutical equipment and supplies', 'business-industrial-agriculture', 1, 3),
  ('Trade & Industrial Machinery', 'trade-industrial-machinery', 'Trade and industrial machinery', 'business-industrial-agriculture', 1, 4),
  ('Construction & Heavy Machinery', 'construction-heavy-machinery', 'Construction and heavy machinery', 'business-industrial-agriculture', 1, 5),
  ('Business for Sale', 'business-for-sale', 'Businesses offered for sale', 'business-industrial-agriculture', 1, 6),
  ('Agriculture', 'agriculture', 'Agricultural goods and equipment', 'business-industrial-agriculture', 1, 7),

  ('Other Services', 'other-services', 'Other local and professional services', 'services', 1, 1),
  ('Tuitions & Academies', 'tuitions-academies', 'Tutoring, tuition, and academy services', 'services', 1, 2),
  ('Car Rental', 'car-rental', 'Car and vehicle rental services', 'services', 1, 3),
  ('Home & Office Repair', 'home-office-repair', 'Home and office repair services', 'services', 1, 4),
  ('Domestic Help', 'domestic-help-services', 'Domestic help services', 'services', 1, 5),
  ('Web Development', 'web-development', 'Website and web application development services', 'services', 1, 6),
  ('Drivers & Taxi', 'drivers-taxi', 'Driver and taxi services', 'services', 1, 7),
  ('Construction Services', 'construction-services', 'Construction and contracting services', 'services', 1, 8),
  ('Electronics & Computer Repair', 'electronics-computer-repair', 'Electronics and computer repair services', 'services', 1, 9),
  ('Event Services', 'event-services', 'Event planning and event services', 'services', 1, 10),
  ('Farm & Fresh Food', 'farm-fresh-food', 'Farm products and fresh food', 'services', 1, 11),
  ('Movers & Packers', 'movers-packers', 'Moving and packing services', 'services', 1, 12),
  ('Consultancy Services', 'consultancy-services', 'Business and personal consultancy', 'services', 1, 13),
  ('Travel & Visa', 'travel-visa', 'Travel planning and visa services', 'services', 1, 14),
  ('Camera Installation', 'camera-installation', 'Security camera installation services', 'services', 1, 15),
  ('Architecture & Interior Design Services', 'architecture-interior-design-services', 'Architecture and interior design services', 'services', 1, 16),
  ('Health & Beauty Services', 'health-beauty-services', 'Health, beauty, and personal care services', 'services', 1, 17),
  ('Video & Photography', 'video-photography-services', 'Video production and photography services', 'services', 1, 18),
  ('Renting Services', 'renting-services', 'Equipment and item rental services', 'services', 1, 19),
  ('Marriage Bureau', 'marriage-bureau', 'Marriage bureau services', 'services', 1, 20),
  ('Catering & Restaurant', 'catering-restaurant-services', 'Catering and restaurant services', 'services', 1, 21),
  ('Car Services', 'car-services', 'Vehicle servicing and maintenance', 'services', 1, 22),
  ('Tailor Services', 'tailor-services', 'Tailoring and clothing alteration', 'services', 1, 23),
  ('Insurance Services', 'insurance-services', 'Insurance services', 'services', 1, 24),

  ('Other Jobs', 'other-jobs', 'Other jobs and vacancies', 'jobs', 1, 1),
  ('Online', 'online-jobs', 'Remote and online jobs', 'jobs', 1, 2),
  ('Sales', 'sales-jobs', 'Sales jobs', 'jobs', 1, 3),
  ('Part Time', 'part-time-jobs', 'Part-time jobs', 'jobs', 1, 4),
  ('Restaurants & Hospitality', 'restaurants-hospitality-jobs', 'Restaurant and hospitality jobs', 'jobs', 1, 5),
  ('Driver', 'driver-jobs', 'Driver jobs', 'jobs', 1, 6),
  ('Education', 'education-jobs', 'Teaching and education jobs', 'jobs', 1, 7),
  ('Domestic Staff', 'domestic-staff-jobs', 'Domestic staff jobs', 'jobs', 1, 8),
  ('Marketing', 'marketing-jobs', 'Marketing jobs', 'jobs', 1, 9),
  ('Customer Service', 'customer-service-jobs', 'Customer service jobs', 'jobs', 1, 10),
  ('Medical', 'medical-jobs', 'Medical jobs', 'jobs', 1, 11),
  ('Accounting & Finance', 'accounting-finance-jobs', 'Accounting and finance jobs', 'jobs', 1, 12),
  ('Call Center', 'call-center-jobs', 'Call center jobs', 'jobs', 1, 13),
  ('Delivery Riders', 'delivery-riders-jobs', 'Delivery rider jobs', 'jobs', 1, 14),
  ('Graphic Design', 'graphic-design-jobs', 'Graphic design jobs', 'jobs', 1, 15),
  ('IT & Networking', 'it-networking-jobs', 'IT and networking jobs', 'jobs', 1, 16),
  ('Hotels & Tourism', 'hotels-tourism-jobs', 'Hotel and tourism jobs', 'jobs', 1, 17),
  ('Security', 'security-jobs', 'Security jobs', 'jobs', 1, 18),
  ('Engineering', 'engineering-jobs', 'Engineering jobs', 'jobs', 1, 19),
  ('Manufacturing', 'manufacturing-jobs', 'Manufacturing jobs', 'jobs', 1, 20),
  ('Clerical & Administration', 'clerical-administration-jobs', 'Clerical and administration jobs', 'jobs', 1, 21),
  ('Real Estate Jobs', 'real-estate-jobs', 'Real estate jobs', 'jobs', 1, 22),
  ('Content Writing', 'content-writing-jobs', 'Content writing jobs', 'jobs', 1, 23),
  ('Advertising & PR', 'advertising-pr-jobs', 'Advertising and public relations jobs', 'jobs', 1, 24),
  ('Human Resources', 'human-resources-jobs', 'Human resources jobs', 'jobs', 1, 25),
  ('Internships', 'internships', 'Internships and trainee roles', 'jobs', 1, 26),
  ('Architecture & Interior Design Jobs', 'architecture-interior-design-jobs', 'Architecture and interior design jobs', 'jobs', 1, 27),

  ('Property for Sale', 'property-for-sale', 'Property listings for sale', 'real-estate', 1, 1),
  ('Property for Rent', 'property-for-rent', 'Property listings for rent', 'real-estate', 1, 2),
  ('Land & Plots for Sale', 'land-plots-for-sale', 'Land and plots offered for sale', 'property-for-sale', 2, 1),
  ('Houses for Sale', 'houses-for-sale', 'Houses offered for sale', 'property-for-sale', 2, 2),
  ('Apartments & Flats for Sale', 'apartments-flats-for-sale', 'Apartments and flats offered for sale', 'property-for-sale', 2, 3),
  ('Shops, Offices & Commercial Space for Sale', 'commercial-property-for-sale', 'Commercial property offered for sale', 'property-for-sale', 2, 4),
  ('Portions & Floors for Sale', 'portions-floors-for-sale', 'Property portions and floors offered for sale', 'property-for-sale', 2, 5),
  ('Apartments & Flats for Rent', 'apartments-flats-for-rent', 'Apartments and flats offered for rent', 'property-for-rent', 2, 1),
  ('Houses for Rent', 'houses-for-rent', 'Houses offered for rent', 'property-for-rent', 2, 2),
  ('Shops, Offices & Commercial Space for Rent', 'commercial-property-for-rent', 'Commercial property offered for rent', 'property-for-rent', 2, 3),
  ('Portions & Floors for Rent', 'portions-floors-for-rent', 'Property portions and floors offered for rent', 'property-for-rent', 2, 4),
  ('Rooms', 'rooms-for-rent', 'Rooms offered for rent', 'property-for-rent', 2, 5),
  ('Roommates & Paying Guests', 'roommates-paying-guests', 'Roommates and paying guest listings', 'property-for-rent', 2, 6),
  ('Vacation Rentals & Guest Houses', 'vacation-rentals-guest-houses', 'Vacation rentals and guest houses', 'property-for-rent', 2, 7),
  ('Land & Plots for Rent', 'land-plots-for-rent', 'Land and plots offered for rent', 'property-for-rent', 2, 8),

  ('Hens', 'hens', 'Hens and poultry', 'animals', 1, 1),
  ('Cats', 'cats', 'Cats and kittens', 'animals', 1, 2),
  ('Parrots', 'parrots', 'Parrots', 'animals', 1, 3),
  ('Pet Food & Accessories', 'pet-food-accessories', 'Food and accessories for pets', 'animals', 1, 4),
  ('Livestock', 'livestock', 'Livestock and farm animals', 'animals', 1, 5),
  ('Dogs', 'dogs', 'Dogs and puppies', 'animals', 1, 6),
  ('Pigeons', 'pigeons', 'Pigeons', 'animals', 1, 7),
  ('Fish', 'fish', 'Aquarium fish and fish supplies', 'animals', 1, 8),
  ('Other Birds', 'other-birds', 'Other birds', 'animals', 1, 9),
  ('Rabbits', 'rabbits', 'Rabbits', 'animals', 1, 10),
  ('Finches', 'finches', 'Finches', 'animals', 1, 11),
  ('Ducks', 'ducks', 'Ducks', 'animals', 1, 12),
  ('Fertile Eggs', 'fertile-eggs', 'Fertile eggs', 'animals', 1, 13),
  ('Other Animals', 'other-animals', 'Other animals', 'animals', 1, 14),
  ('Peacocks', 'peacocks', 'Peacocks', 'animals', 1, 15),
  ('Doves', 'doves', 'Doves', 'animals', 1, 16),
  ('Horses', 'horses', 'Horses', 'animals', 1, 17),

  ('Beds & Wardrobes', 'beds-wardrobes', 'Beds and wardrobes', 'furniture-home-decor', 1, 1),
  ('Sofas & Chairs', 'sofas-chairs', 'Sofas and chairs', 'furniture-home-decor', 1, 2),
  ('Other Household Items', 'other-household-items', 'Other household items', 'furniture-home-decor', 1, 3),
  ('Tables & Dining', 'tables-dining', 'Tables and dining furniture', 'furniture-home-decor', 1, 4),
  ('Office Furniture', 'office-furniture', 'Office furniture', 'furniture-home-decor', 1, 5),
  ('Home Decoration', 'home-decoration', 'Home decoration', 'furniture-home-decor', 1, 6),
  ('Kitchen Essentials', 'kitchen-essentials', 'Kitchen essentials and utensils', 'furniture-home-decor', 1, 7),
  ('Garden & Outdoor', 'garden-outdoor', 'Garden and outdoor furniture and goods', 'furniture-home-decor', 1, 8),
  ('Home DIY & Renovations', 'home-diy-renovations', 'Home improvement and renovation goods', 'furniture-home-decor', 1, 9),
  ('Bathroom Accessories', 'bathroom-accessories', 'Bathroom accessories', 'furniture-home-decor', 1, 10),
  ('Painting & Mirrors', 'painting-mirrors', 'Paintings, wall art, and mirrors', 'furniture-home-decor', 1, 11),
  ('Lighting', 'lighting', 'Indoor and outdoor lighting', 'furniture-home-decor', 1, 12),
  ('Curtains & Blinds', 'curtains-blinds', 'Curtains and blinds', 'furniture-home-decor', 1, 13),
  ('Rugs & Carpets', 'rugs-carpets', 'Rugs and carpets', 'furniture-home-decor', 1, 14),
  ('Home Essentials', 'home-essentials', 'Everyday home essentials', 'furniture-home-decor', 1, 15),
  ('Restaurant & Marquee Furniture', 'restaurant-marquee-furniture', 'Restaurant and marquee furniture', 'furniture-home-decor', 1, 16),
  ('School Furniture', 'school-furniture', 'School and classroom furniture', 'furniture-home-decor', 1, 17),

  ('Clothes', 'clothes', 'Clothing and apparel', 'fashion-beauty', 1, 1),
  ('Watches', 'watches', 'Watches', 'fashion-beauty', 1, 2),
  ('Wedding', 'wedding-fashion', 'Wedding clothing and accessories', 'fashion-beauty', 1, 3),
  ('Skin & Hair', 'skin-hair', 'Skin and hair products', 'fashion-beauty', 1, 4),
  ('Footwear', 'footwear', 'Shoes and footwear', 'fashion-beauty', 1, 5),
  ('Jewellery', 'jewellery', 'Jewellery', 'fashion-beauty', 1, 6),
  ('Fragrance', 'fragrance', 'Perfumes and fragrances', 'fashion-beauty', 1, 7),
  ('Bags', 'bags', 'Bags and luggage', 'fashion-beauty', 1, 8),
  ('Fashion Accessories', 'fashion-accessories-items', 'Fashion accessories', 'fashion-beauty', 1, 9),
  ('Makeup', 'makeup', 'Makeup and cosmetics', 'fashion-beauty', 1, 10),
  ('Bath & Body', 'bath-body', 'Bath and body products', 'fashion-beauty', 1, 11),
  ('Other Fashion', 'other-fashion', 'Other fashion items', 'fashion-beauty', 1, 12),
  ('DIY Jewellery', 'diy-jewellery', 'Jewellery-making materials and supplies', 'fashion-beauty', 1, 13),

  ('Gym & Fitness', 'gym-fitness', 'Gym and fitness equipment', 'books-sports-hobbies', 1, 1),
  ('Sports Equipment', 'sports-equipment', 'Sports equipment', 'books-sports-hobbies', 1, 2),
  ('Books & Magazines', 'books-magazines', 'Books and magazines', 'books-sports-hobbies', 1, 3),
  ('Other Hobbies', 'other-hobbies', 'Hobbies and leisure goods', 'books-sports-hobbies', 1, 4),
  ('Musical Instruments', 'musical-instruments', 'Musical instruments and equipment', 'books-sports-hobbies', 1, 5),
  ('Arts & Crafts', 'arts-crafts', 'Art and craft supplies', 'books-sports-hobbies', 1, 6),
  ('Camping & Hiking', 'camping-hiking', 'Camping and hiking equipment', 'books-sports-hobbies', 1, 7),
  ('Crafts & DIY Supplies', 'crafts-diy-supplies', 'Craft and do-it-yourself supplies', 'books-sports-hobbies', 1, 8),
  ('Calendars', 'calendars', 'Calendars and planners', 'books-sports-hobbies', 1, 9),

  ('Toys', 'toys', 'Toys and games for children', 'kids', 1, 1),
  ('Kids Vehicles', 'kids-vehicles', 'Ride-on toys and children’s vehicles', 'kids', 1, 2),
  ('Baby Gear', 'baby-gear', 'Baby equipment and gear', 'kids', 1, 3),
  ('Kids Accessories', 'kids-accessories', 'Accessories for children', 'kids', 1, 4),
  ('Swings & Slides', 'swings-slides', 'Children’s swings and slides', 'kids', 1, 5),
  ('Bath & Diapers', 'bath-diapers', 'Baby bath products and diapers', 'kids', 1, 6),

  ('Antiques', 'antiques', 'Antique items and furniture', 'collectibles-antiques', 1, 1),
  ('Collectables', 'collectables', 'Collectable and vintage items', 'collectibles-antiques', 1, 2),
  ('Rare & Vintage Finds', 'rare-vintage-finds', 'Rare and vintage items suitable for auction', 'collectibles-antiques', 1, 3);

INSERT INTO public.categories (name, slug, description, icon_emoji, display_order, parent_id)
SELECT seed.name, seed.slug, seed.description, NULL, seed.display_order, NULL
FROM bidora_category_seed AS seed
WHERE seed.depth = 0
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  parent_id = NULL;

DO $$
DECLARE
  current_depth INTEGER;
BEGIN
  FOR current_depth IN 1..2 LOOP
    INSERT INTO public.categories (name, slug, description, icon_emoji, display_order, parent_id)
    SELECT seed.name, seed.slug, seed.description, NULL, seed.display_order, parent.id
    FROM bidora_category_seed AS seed
    JOIN public.categories AS parent ON parent.slug = seed.parent_slug
    WHERE seed.depth = current_depth
    ON CONFLICT (slug) DO UPDATE SET
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      display_order = EXCLUDED.display_order,
      parent_id = EXCLUDED.parent_id;
  END LOOP;
END
$$;

-- Listings in jobs, services, and real estate use seller contact instead of
-- parcel-style checkout or timed auctions. Enforce the rule at the database
-- boundary as well as in the frontend.
CREATE OR REPLACE FUNCTION public.category_allows_item_transaction(p_category_id BIGINT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  WITH RECURSIVE category_path AS (
    SELECT id, slug, parent_id FROM public.categories WHERE id = p_category_id
    UNION ALL
    SELECT parent.id, parent.slug, parent.parent_id
    FROM public.categories AS parent
    JOIN category_path AS child ON child.parent_id = parent.id
  )
  SELECT COALESCE(BOOL_AND(slug NOT IN ('services', 'jobs', 'real-estate')), FALSE)
  FROM category_path;
$$;
REVOKE ALL ON FUNCTION public.category_allows_item_transaction(BIGINT) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.enforce_category_transaction_rules()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_category_id BIGINT;
BEGIN
  IF TG_TABLE_NAME = 'products' AND NEW.is_auction IS TRUE THEN
    IF NOT public.category_allows_item_transaction(NEW.category_id) THEN
      RAISE EXCEPTION 'Jobs, services, and property listings cannot be auctioned';
    END IF;
  ELSIF TG_TABLE_NAME = 'orders' AND NEW.product_id IS NOT NULL THEN
    SELECT category_id INTO v_category_id FROM public.products WHERE id = NEW.product_id;
    IF NOT public.category_allows_item_transaction(v_category_id) THEN
      RAISE EXCEPTION 'Cash-on-delivery checkout is unavailable for jobs, services, and property listings';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.enforce_category_transaction_rules() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS products_enforce_category_transaction_rules ON public.products;
CREATE TRIGGER products_enforce_category_transaction_rules
  BEFORE INSERT OR UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.enforce_category_transaction_rules();

DROP TRIGGER IF EXISTS orders_enforce_category_transaction_rules ON public.orders;
CREATE TRIGGER orders_enforce_category_transaction_rules
  BEFORE INSERT OR UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.enforce_category_transaction_rules();

COMMIT;
