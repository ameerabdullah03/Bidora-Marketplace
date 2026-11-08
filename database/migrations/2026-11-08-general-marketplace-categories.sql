-- Expand Bidora beyond electronics while preserving existing category IDs.
-- Apply after taking a database backup. This is additive and safe for old listings.
BEGIN;

UPDATE public.categories
SET display_order = CASE name
  WHEN 'Phones & Tablets' THEN 9
  WHEN 'Laptops & Computers' THEN 10
  WHEN 'Audio & Headphones' THEN 11
  WHEN 'Wearables' THEN 12
  WHEN 'Cameras & Photography' THEN 13
  WHEN 'Gaming & Consoles' THEN 14
  ELSE display_order
END
WHERE name IN (
  'Phones & Tablets', 'Laptops & Computers', 'Audio & Headphones',
  'Wearables', 'Cameras & Photography', 'Gaming & Consoles'
);

INSERT INTO public.categories (name, slug, description, icon_emoji, display_order) VALUES
  ('Vehicles', 'vehicles', 'Cars, motorcycles, bicycles, and other vehicles', NULL, 1),
  ('Home & Garden', 'home-garden', 'Furniture, appliances, decor, and garden items', NULL, 2),
  ('Fashion & Accessories', 'fashion-accessories', 'Clothing, shoes, bags, and accessories', NULL, 3),
  ('Collectibles & Antiques', 'collectibles-antiques', 'Antiques, collectibles, vintage goods, and rare finds', NULL, 4),
  ('Books & Media', 'books-media', 'Books, records, films, and other media', NULL, 5),
  ('Sports & Outdoors', 'sports-outdoors', 'Sports equipment, outdoor gear, and fitness items', NULL, 6),
  ('Toys & Baby', 'toys-baby', 'Toys, games, and baby items', NULL, 7),
  ('Music & Instruments', 'music-instruments', 'Musical instruments and music equipment', NULL, 8)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order;

COMMIT;
