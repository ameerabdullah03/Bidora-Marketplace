-- Bidora Database Schema
-- PostgreSQL + Supabase
-- Created: 2026-11-01

-- ============================================
-- 1. USERS TABLE (extends Supabase auth)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  avatar_url TEXT,
  bio TEXT,
  account_type VARCHAR(20) NOT NULL DEFAULT 'buyer' CHECK (account_type IN ('buyer', 'seller')),
  is_verified BOOLEAN DEFAULT false,
  verification_date TIMESTAMP,
  rating DECIMAL(3, 2) DEFAULT 0.0,
  total_reviews INT DEFAULT 0,
  total_sales INT DEFAULT 0,
  seller_since TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create the marketplace profile from Supabase Auth metadata on signup.
CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, account_type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    CASE WHEN NEW.raw_user_meta_data->>'account_type' = 'seller' THEN 'seller' ELSE 'buyer' END
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.users.full_name);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_auth_user();

-- Admin access is granted manually by a project owner; clients cannot self-promote.
CREATE TABLE IF NOT EXISTS admins (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE VIEW public_profiles AS
SELECT id, full_name, avatar_url, bio, account_type, is_verified,
       rating, total_reviews, total_sales, seller_since, created_at
FROM users;
GRANT SELECT ON public_profiles TO anon, authenticated;

CREATE TABLE IF NOT EXISTS favorites (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, product_id)
);

-- ============================================
-- 2. CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon_emoji VARCHAR(10),
  display_order INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. PRODUCTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(12, 2) NOT NULL,
  condition VARCHAR(50), -- 'new', 'like_new', 'excellent', 'good', 'fair'
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'sold', 'delisted'
  is_auction BOOLEAN DEFAULT false,
  stock_quantity INT DEFAULT 1,
  location VARCHAR(255),
  rating DECIMAL(3, 2) DEFAULT 0.0,
  total_reviews INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP WITH TIME ZONE
);

CREATE OR REPLACE FUNCTION protect_listing_moderation_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() = OLD.seller_id
    AND NOT EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
    AND (NEW.status IS DISTINCT FROM OLD.status OR NEW.approved_at IS DISTINCT FROM OLD.approved_at) THEN
    RAISE EXCEPTION 'Only marketplace admins can change listing moderation status';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER products_protect_moderation_fields
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION protect_listing_moderation_fields();

-- ============================================
-- 4. PRODUCT IMAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS product_images (
  id BIGSERIAL PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  storage_path VARCHAR(255),
  display_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 5. AUCTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS auctions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  starting_price DECIMAL(12, 2) NOT NULL,
  current_bid DECIMAL(12, 2) DEFAULT 0.0,
  minimum_increment DECIMAL(12, 2) NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'ended', 'cancelled'
  winner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  total_bids INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 6. BIDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS bids (
  id BIGSERIAL PRIMARY KEY,
  auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
  bidder_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  is_winner BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 7. ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  auction_id UUID REFERENCES auctions(id) ON DELETE SET NULL,
  amount DECIMAL(12, 2) NOT NULL,
  payment_method VARCHAR(50), -- 'cod', 'jazz_cash', 'easy_paisa', 'bank_transfer'
  payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
  order_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'
  delivery_address TEXT,
  tracking_number VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_one_per_auction
  ON orders(auction_id) WHERE auction_id IS NOT NULL;

-- ============================================
-- 8. REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
  id BIGSERIAL PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewed_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  content TEXT,
  is_seller_review BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_one_seller_review_per_order
  ON reviews(order_id, reviewer_id, is_seller_review);

CREATE OR REPLACE FUNCTION refresh_marketplace_ratings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_product_id UUID;
  v_seller_id UUID;
BEGIN
  v_product_id := COALESCE(NEW.product_id, OLD.product_id);
  v_seller_id := COALESCE(NEW.reviewed_user_id, OLD.reviewed_user_id);

  IF v_product_id IS NOT NULL THEN
    UPDATE products SET
      rating = COALESCE((SELECT AVG(rating)::DECIMAL(3,2) FROM reviews WHERE product_id = v_product_id), 0),
      total_reviews = (SELECT COUNT(*) FROM reviews WHERE product_id = v_product_id)
    WHERE id = v_product_id;
  END IF;

  IF v_seller_id IS NOT NULL THEN
    UPDATE users SET
      rating = COALESCE((SELECT AVG(rating)::DECIMAL(3,2) FROM reviews WHERE reviewed_user_id = v_seller_id AND is_seller_review = true), 0),
      total_reviews = (SELECT COUNT(*) FROM reviews WHERE reviewed_user_id = v_seller_id AND is_seller_review = true)
    WHERE id = v_seller_id;
  END IF;
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER reviews_refresh_ratings
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION refresh_marketplace_ratings();

-- ============================================
-- 9. REPORTS TABLE (for moderation)
-- ============================================
CREATE TABLE IF NOT EXISTS reports (
  id BIGSERIAL PRIMARY KEY,
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  auction_id UUID REFERENCES auctions(id) ON DELETE CASCADE,
  reason VARCHAR(100) NOT NULL, -- 'counterfeit', 'fake_listing', 'fraud', 'inappropriate', 'other'
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'investigating', 'resolved', 'dismissed'
  moderator_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- 10. CONVERSATIONS TABLE (messaging)
-- ============================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  last_message TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 11. MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES (for performance)
-- ============================================
CREATE INDEX idx_products_seller ON products(seller_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_product_images_product ON product_images(product_id);
CREATE INDEX idx_auctions_seller ON auctions(seller_id);
CREATE INDEX idx_auctions_product ON auctions(product_id);
CREATE INDEX idx_auctions_status ON auctions(status);
CREATE INDEX idx_auctions_end_time ON auctions(end_time);
CREATE INDEX idx_bids_auction ON bids(auction_id);
CREATE INDEX idx_bids_bidder ON bids(bidder_id);
CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_seller ON orders(seller_id);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_reviews_reviewed_user ON reviews(reviewed_user_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_conversations_buyers ON conversations(buyer_id);
CREATE INDEX idx_conversations_seller ON conversations(seller_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);

-- Place a bid and update the auction atomically. Clients must call this function
-- instead of writing to bids/auctions separately.
CREATE OR REPLACE FUNCTION place_auction_bid(p_auction_id UUID, p_amount NUMERIC)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_auction auctions%ROWTYPE;
  v_minimum NUMERIC;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT * INTO v_auction
  FROM auctions
  WHERE id = p_auction_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Auction not found';
  END IF;
  IF v_auction.seller_id = auth.uid() THEN
    RAISE EXCEPTION 'Sellers cannot bid on their own auction';
  END IF;
  IF v_auction.status <> 'active' OR v_auction.end_time <= NOW() THEN
    RAISE EXCEPTION 'Auction is no longer active';
  END IF;

  v_minimum := CASE
    WHEN v_auction.total_bids = 0 THEN v_auction.starting_price
    ELSE v_auction.current_bid + v_auction.minimum_increment
  END;
  IF p_amount < v_minimum THEN
    RAISE EXCEPTION 'Minimum bid is %', v_minimum;
  END IF;

  INSERT INTO bids (auction_id, bidder_id, amount)
  VALUES (p_auction_id, auth.uid(), p_amount);

  UPDATE auctions
  SET current_bid = p_amount,
      winner_id = auth.uid(),
      total_bids = total_bids + 1,
      updated_at = NOW()
  WHERE id = p_auction_id;
END;
$$;

REVOKE ALL ON FUNCTION place_auction_bid(UUID, NUMERIC) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION place_auction_bid(UUID, NUMERIC) TO authenticated;

-- Place a fixed-price order using the current database price and reserve stock.
CREATE OR REPLACE FUNCTION place_product_order(p_product_id UUID, p_delivery_address TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_product products%ROWTYPE;
  v_order_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF length(trim(coalesce(p_delivery_address, ''))) < 10 THEN
    RAISE EXCEPTION 'Enter a complete delivery address';
  END IF;

  SELECT * INTO v_product FROM products
  WHERE id = p_product_id FOR UPDATE;

  IF NOT FOUND OR v_product.status <> 'approved' OR v_product.is_auction THEN
    RAISE EXCEPTION 'Product is unavailable for purchase';
  END IF;
  IF v_product.seller_id = auth.uid() THEN
    RAISE EXCEPTION 'You cannot order your own product';
  END IF;
  IF v_product.stock_quantity < 1 THEN
    RAISE EXCEPTION 'Product is out of stock';
  END IF;

  INSERT INTO orders (buyer_id, seller_id, product_id, amount, payment_method, order_status, delivery_address)
  VALUES (auth.uid(), v_product.seller_id, v_product.id, v_product.price, 'cod', 'pending', trim(p_delivery_address))
  RETURNING id INTO v_order_id;

  UPDATE products SET stock_quantity = stock_quantity - 1, updated_at = NOW()
  WHERE id = v_product.id;

  RETURN v_order_id;
END;
$$;

REVOKE ALL ON FUNCTION place_product_order(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION place_product_order(UUID, TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION place_auction_order(p_auction_id UUID, p_delivery_address TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_auction auctions%ROWTYPE;
  v_product products%ROWTYPE;
  v_order_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  IF length(trim(coalesce(p_delivery_address, ''))) < 10 THEN
    RAISE EXCEPTION 'Enter a complete delivery address';
  END IF;

  SELECT * INTO v_auction FROM auctions WHERE id = p_auction_id FOR UPDATE;
  IF NOT FOUND OR v_auction.status = 'cancelled' OR v_auction.end_time > NOW() THEN
    RAISE EXCEPTION 'Auction has not ended or is unavailable';
  END IF;
  IF v_auction.winner_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Only the winning bidder can place this order';
  END IF;

  SELECT * INTO v_product FROM products WHERE id = v_auction.product_id FOR UPDATE;
  IF NOT FOUND OR v_product.status <> 'approved' OR v_product.stock_quantity < 1 THEN
    RAISE EXCEPTION 'Auction item is unavailable';
  END IF;

  INSERT INTO orders (buyer_id, seller_id, product_id, auction_id, amount, payment_method, order_status, delivery_address)
  VALUES (auth.uid(), v_auction.seller_id, v_product.id, v_auction.id, v_auction.current_bid, 'cod', 'pending', trim(p_delivery_address))
  RETURNING id INTO v_order_id;

  UPDATE products SET stock_quantity = stock_quantity - 1, updated_at = NOW() WHERE id = v_product.id;
  UPDATE auctions SET status = 'ended', updated_at = NOW() WHERE id = v_auction.id;
  RETURN v_order_id;
END;
$$;

REVOKE ALL ON FUNCTION place_auction_order(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION place_auction_order(UUID, TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION advance_order_status(
  p_order_id UUID,
  p_new_status TEXT,
  p_tracking_number TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order orders%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  SELECT * INTO v_order FROM orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Order not found'; END IF;

  IF p_new_status = 'confirmed' THEN
    IF auth.uid() <> v_order.seller_id OR v_order.order_status <> 'pending' THEN
      RAISE EXCEPTION 'Only the seller can confirm a pending order';
    END IF;
  ELSIF p_new_status = 'shipped' THEN
    IF auth.uid() <> v_order.seller_id OR v_order.order_status <> 'confirmed'
      OR length(trim(coalesce(p_tracking_number, ''))) < 3 THEN
      RAISE EXCEPTION 'Seller must provide tracking details for a confirmed order';
    END IF;
  ELSIF p_new_status = 'delivered' THEN
    IF auth.uid() <> v_order.buyer_id OR v_order.order_status <> 'shipped' THEN
      RAISE EXCEPTION 'Only the buyer can confirm a shipped order as delivered';
    END IF;
  ELSIF p_new_status = 'cancelled' THEN
    IF auth.uid() NOT IN (v_order.buyer_id, v_order.seller_id) OR v_order.order_status <> 'pending' THEN
      RAISE EXCEPTION 'Only a participant can cancel a pending order';
    END IF;
    UPDATE products SET stock_quantity = stock_quantity + 1 WHERE id = v_order.product_id;
  ELSE
    RAISE EXCEPTION 'Unsupported order status transition';
  END IF;

  UPDATE orders SET
    order_status = p_new_status,
    tracking_number = CASE WHEN p_new_status = 'shipped' THEN trim(p_tracking_number) ELSE tracking_number END,
    updated_at = NOW(),
    completed_at = CASE WHEN p_new_status = 'delivered' THEN NOW() ELSE completed_at END
  WHERE id = p_order_id;
END;
$$;

REVOKE ALL ON FUNCTION advance_order_status(UUID, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION advance_order_status(UUID, TEXT, TEXT) TO authenticated;

-- Keep the conversation preview current after a message is sent.
CREATE OR REPLACE FUNCTION update_conversation_preview()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE conversations
  SET last_message = NEW.content,
      last_message_at = NEW.created_at,
      updated_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER messages_update_conversation_preview
AFTER INSERT ON messages
FOR EACH ROW EXECUTE FUNCTION update_conversation_preview();

-- ============================================
-- INITIAL CATEGORIES DATA
-- ============================================
INSERT INTO categories (name, slug, description, icon_emoji, display_order) VALUES
  ('Phones & Tablets', 'phones-tablets', 'Smartphones and tablet devices', '📱', 1),
  ('Laptops & Computers', 'laptops-computers', 'Laptops, desktops, and computers', '💻', 2),
  ('Audio & Headphones', 'audio-headphones', 'Headphones, speakers, and audio equipment', '🎧', 3),
  ('Wearables', 'wearables', 'Smartwatches and wearable devices', '⌚', 4),
  ('Cameras & Photography', 'cameras-photography', 'Cameras and photography equipment', '📷', 5),
  ('Gaming & Consoles', 'gaming-consoles', 'Gaming consoles and accessories', '🎮', 6)
ON CONFLICT DO NOTHING;
