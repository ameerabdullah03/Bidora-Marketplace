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
SET search_path = ''
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
REVOKE ALL ON FUNCTION public.handle_new_auth_user() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_auth_user();

INSERT INTO public.users (id, email, full_name, account_type)
SELECT id, email, COALESCE(raw_user_meta_data->>'full_name', ''),
       CASE WHEN raw_user_meta_data->>'account_type' = 'seller' THEN 'seller' ELSE 'buyer' END
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Admin access is granted manually by a project owner; clients cannot self-promote.
CREATE TABLE IF NOT EXISTS admins (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION public.protect_user_managed_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF auth.uid() = OLD.id
    AND NOT EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = auth.uid())
    AND (
      NEW.id IS DISTINCT FROM OLD.id
      OR NEW.email IS DISTINCT FROM OLD.email
      OR NEW.account_type IS DISTINCT FROM OLD.account_type
      OR NEW.is_verified IS DISTINCT FROM OLD.is_verified
      OR NEW.verification_date IS DISTINCT FROM OLD.verification_date
      OR NEW.rating IS DISTINCT FROM OLD.rating
      OR NEW.total_reviews IS DISTINCT FROM OLD.total_reviews
      OR NEW.total_sales IS DISTINCT FROM OLD.total_sales
      OR NEW.seller_since IS DISTINCT FROM OLD.seller_since
      OR NEW.created_at IS DISTINCT FROM OLD.created_at
    ) THEN
    RAISE EXCEPTION 'Only trusted server-side flows can change account and rating fields';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.protect_user_managed_fields() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS users_protect_managed_fields ON users;
CREATE TRIGGER users_protect_managed_fields
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION public.protect_user_managed_fields();

CREATE TABLE IF NOT EXISTS public.user_action_counters (
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  action_key TEXT NOT NULL CHECK (action_key IN ('create_listing', 'new_conversation', 'send_message', 'place_bid', 'place_order')),
  window_started_at TIMESTAMPTZ NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1 CHECK (request_count > 0),
  PRIMARY KEY (user_id, action_key)
);
ALTER TABLE public.user_action_counters ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.user_action_counters FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.consume_user_action_quota(
  p_action_key TEXT,
  p_limit INTEGER,
  p_window_seconds INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_now TIMESTAMPTZ;
  v_count INTEGER;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF p_action_key NOT IN ('create_listing', 'new_conversation', 'send_message', 'place_bid', 'place_order')
    OR p_limit < 1 OR p_window_seconds < 1 THEN
    RAISE EXCEPTION 'Invalid rate limit configuration';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_user_id::TEXT || ':' || p_action_key, 0)
  );
  v_now := pg_catalog.clock_timestamp();

  INSERT INTO public.user_action_counters AS counter (
    user_id, action_key, window_started_at, request_count
  ) VALUES (v_user_id, p_action_key, v_now, 1)
  ON CONFLICT (user_id, action_key) DO UPDATE SET
    window_started_at = CASE
      WHEN counter.window_started_at + pg_catalog.make_interval(secs => p_window_seconds) <= v_now THEN v_now
      ELSE counter.window_started_at
    END,
    request_count = CASE
      WHEN counter.window_started_at + pg_catalog.make_interval(secs => p_window_seconds) <= v_now THEN 1
      ELSE counter.request_count + 1
    END
  RETURNING request_count INTO v_count;

  IF v_count > p_limit THEN
    RETURN FALSE;
  END IF;
  RETURN TRUE;
END;
$$;
REVOKE ALL ON FUNCTION public.consume_user_action_quota(TEXT, INTEGER, INTEGER) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.enforce_write_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_TABLE_NAME = 'products' THEN
    NEW.title := pg_catalog.btrim(NEW.title);
    IF pg_catalog.length(NEW.title) < 3 OR pg_catalog.length(NEW.title) > 255 THEN RAISE EXCEPTION 'Listing title must be 3 to 255 characters'; END IF;
    IF NEW.description IS NULL OR pg_catalog.length(NEW.description) > 10000 THEN RAISE EXCEPTION 'Listing description is required and must be at most 10000 characters'; END IF;
    IF NEW.price <= 0 OR NEW.stock_quantity < 0 THEN RAISE EXCEPTION 'Listing price and stock are invalid'; END IF;
    IF NOT public.consume_user_action_quota('create_listing', 5, 86400) THEN RETURN NULL; END IF;
    NEW.created_at := pg_catalog.now();
    NEW.updated_at := NEW.created_at;
  ELSIF TG_TABLE_NAME = 'conversations' THEN
    IF NOT public.consume_user_action_quota('new_conversation', 20, 3600) THEN RETURN NULL; END IF;
    NEW.last_message := NULL;
    NEW.last_message_at := NULL;
    NEW.is_archived := false;
    NEW.created_at := pg_catalog.now();
    NEW.updated_at := NEW.created_at;
  ELSIF TG_TABLE_NAME = 'messages' THEN
    NEW.content := pg_catalog.btrim(NEW.content);
    IF pg_catalog.length(NEW.content) < 1 OR pg_catalog.length(NEW.content) > 5000 THEN RAISE EXCEPTION 'Message must be 1 to 5000 characters'; END IF;
    IF NOT public.consume_user_action_quota('send_message', 30, 60) THEN RETURN NULL; END IF;
    NEW.is_read := false;
    NEW.read_at := NULL;
    NEW.created_at := pg_catalog.now();
  ELSE
    RAISE EXCEPTION 'Rate limit trigger is not configured for this table';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.enforce_write_rate_limit() FROM PUBLIC, anon, authenticated;

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
  parent_id BIGINT REFERENCES categories(id) ON DELETE RESTRICT,
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
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NOT EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = auth.uid()) THEN
      NEW.status := 'pending';
      NEW.approved_at := NULL;
      NEW.rating := 0;
      NEW.total_reviews := 0;
      NEW.created_at := pg_catalog.now();
      NEW.updated_at := NEW.created_at;
    END IF;
    RETURN NEW;
  END IF;

  IF auth.uid() = OLD.seller_id
    AND NOT EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = auth.uid())
    AND (
      NEW.status IS DISTINCT FROM OLD.status
      OR NEW.approved_at IS DISTINCT FROM OLD.approved_at
      OR NEW.rating IS DISTINCT FROM OLD.rating
      OR NEW.total_reviews IS DISTINCT FROM OLD.total_reviews
    ) THEN
    RAISE EXCEPTION 'Only trusted moderation and review flows can change listing status and ratings';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.protect_listing_moderation_fields() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS products_protect_moderation_fields ON products;
CREATE TRIGGER products_protect_moderation_fields
BEFORE INSERT OR UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION protect_listing_moderation_fields();

DROP TRIGGER IF EXISTS products_enforce_write_rate_limit ON products;
CREATE TRIGGER products_enforce_write_rate_limit
BEFORE INSERT ON products
FOR EACH ROW EXECUTE FUNCTION public.enforce_write_rate_limit();

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
SET search_path = ''
AS $$
DECLARE
  v_product_id UUID;
  v_seller_id UUID;
BEGIN
  v_product_id := COALESCE(NEW.product_id, OLD.product_id);
  v_seller_id := COALESCE(NEW.reviewed_user_id, OLD.reviewed_user_id);

  IF v_product_id IS NOT NULL THEN
    UPDATE public.products SET
      rating = COALESCE((SELECT AVG(rating)::DECIMAL(3,2) FROM public.reviews WHERE product_id = v_product_id), 0),
      total_reviews = (SELECT COUNT(*) FROM public.reviews WHERE product_id = v_product_id)
    WHERE id = v_product_id;
  END IF;

  IF v_seller_id IS NOT NULL THEN
    UPDATE public.users SET
      rating = COALESCE((SELECT AVG(rating)::DECIMAL(3,2) FROM public.reviews WHERE reviewed_user_id = v_seller_id AND is_seller_review = true), 0),
      total_reviews = (SELECT COUNT(*) FROM public.reviews WHERE reviewed_user_id = v_seller_id AND is_seller_review = true)
    WHERE id = v_seller_id;
  END IF;
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.refresh_marketplace_ratings() FROM PUBLIC, anon, authenticated;

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

-- Minimal, authenticated access, correction, and deletion request queue.
CREATE TABLE IF NOT EXISTS public.privacy_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL CHECK (request_type IN ('deletion', 'access', 'correction')),
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'in_review', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  CHECK ((status = 'completed') = (completed_at IS NOT NULL))
);
CREATE UNIQUE INDEX IF NOT EXISTS privacy_requests_one_open_per_user
  ON public.privacy_requests(user_id) WHERE status IN ('received', 'in_review');

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

CREATE OR REPLACE FUNCTION public.protect_message_updates()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.id IS DISTINCT FROM OLD.id
    OR NEW.conversation_id IS DISTINCT FROM OLD.conversation_id
    OR NEW.sender_id IS DISTINCT FROM OLD.sender_id
    OR NEW.content IS DISTINCT FROM OLD.content
    OR NEW.read_at IS DISTINCT FROM OLD.read_at
    OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Messages cannot be edited after they are sent';
  END IF;
  IF NEW.is_read IS DISTINCT FROM OLD.is_read
    AND (NEW.is_read IS FALSE OR auth.uid() = OLD.sender_id) THEN
    RAISE EXCEPTION 'Only the recipient can mark a message as read';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.protect_message_updates() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS messages_protect_updates ON messages;
CREATE TRIGGER messages_protect_updates
BEFORE UPDATE ON messages
FOR EACH ROW EXECUTE FUNCTION public.protect_message_updates();

DROP TRIGGER IF EXISTS conversations_enforce_write_rate_limit ON conversations;
CREATE TRIGGER conversations_enforce_write_rate_limit
BEFORE INSERT ON conversations
FOR EACH ROW EXECUTE FUNCTION public.enforce_write_rate_limit();

DROP TRIGGER IF EXISTS messages_enforce_write_rate_limit ON messages;
CREATE TRIGGER messages_enforce_write_rate_limit
BEFORE INSERT ON messages
FOR EACH ROW EXECUTE FUNCTION public.enforce_write_rate_limit();

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
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_auction public.auctions%ROWTYPE;
  v_minimum NUMERIC;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT * INTO v_auction
  FROM public.auctions
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

  IF NOT public.consume_user_action_quota('place_bid', 30, 60) THEN RETURN FALSE; END IF;
  INSERT INTO public.bids (auction_id, bidder_id, amount)
  VALUES (p_auction_id, auth.uid(), p_amount);

  UPDATE public.auctions
  SET current_bid = p_amount,
      winner_id = auth.uid(),
      total_bids = total_bids + 1,
      updated_at = NOW()
  WHERE id = p_auction_id;
  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.place_auction_bid(UUID, NUMERIC) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.place_auction_bid(UUID, NUMERIC) TO authenticated;

-- Place a fixed-price order using the current database price and reserve stock.
CREATE OR REPLACE FUNCTION place_product_order(p_product_id UUID, p_delivery_address TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_product public.products%ROWTYPE;
  v_order_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF length(trim(coalesce(p_delivery_address, ''))) < 10 THEN
    RAISE EXCEPTION 'Enter a complete delivery address';
  END IF;

  SELECT * INTO v_product FROM public.products
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

  IF NOT public.consume_user_action_quota('place_order', 10, 3600) THEN RETURN NULL; END IF;
  INSERT INTO public.orders (buyer_id, seller_id, product_id, amount, payment_method, order_status, delivery_address)
  VALUES (auth.uid(), v_product.seller_id, v_product.id, v_product.price, 'cod', 'pending', trim(p_delivery_address))
  RETURNING id INTO v_order_id;

  UPDATE public.products SET stock_quantity = stock_quantity - 1, updated_at = NOW()
  WHERE id = v_product.id;

  RETURN v_order_id;
END;
$$;

REVOKE ALL ON FUNCTION public.place_product_order(UUID, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.place_product_order(UUID, TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION place_auction_order(p_auction_id UUID, p_delivery_address TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_auction public.auctions%ROWTYPE;
  v_product public.products%ROWTYPE;
  v_order_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  IF length(trim(coalesce(p_delivery_address, ''))) < 10 THEN
    RAISE EXCEPTION 'Enter a complete delivery address';
  END IF;

  SELECT * INTO v_auction FROM public.auctions WHERE id = p_auction_id FOR UPDATE;
  IF NOT FOUND OR v_auction.status = 'cancelled' OR v_auction.end_time > NOW() THEN
    RAISE EXCEPTION 'Auction has not ended or is unavailable';
  END IF;
  IF v_auction.winner_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Only the winning bidder can place this order';
  END IF;
  IF v_auction.seller_id = auth.uid() THEN
    RAISE EXCEPTION 'Sellers cannot buy their own auction item';
  END IF;

  SELECT * INTO v_product FROM public.products WHERE id = v_auction.product_id FOR UPDATE;
  IF NOT FOUND OR v_product.status <> 'approved' OR v_product.stock_quantity < 1 THEN
    RAISE EXCEPTION 'Auction item is unavailable';
  END IF;

  IF NOT public.consume_user_action_quota('place_order', 10, 3600) THEN RETURN NULL; END IF;
  INSERT INTO public.orders (buyer_id, seller_id, product_id, auction_id, amount, payment_method, order_status, delivery_address)
  VALUES (auth.uid(), v_auction.seller_id, v_product.id, v_auction.id, v_auction.current_bid, 'cod', 'pending', trim(p_delivery_address))
  RETURNING id INTO v_order_id;

  UPDATE public.products SET stock_quantity = stock_quantity - 1, updated_at = NOW() WHERE id = v_product.id;
  UPDATE public.auctions SET status = 'ended', updated_at = NOW() WHERE id = v_auction.id;
  RETURN v_order_id;
END;
$$;

REVOKE ALL ON FUNCTION public.place_auction_order(UUID, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.place_auction_order(UUID, TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION advance_order_status(
  p_order_id UUID,
  p_new_status TEXT,
  p_tracking_number TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_order public.orders%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
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
    UPDATE public.products SET stock_quantity = stock_quantity + 1 WHERE id = v_order.product_id;
  ELSE
    RAISE EXCEPTION 'Unsupported order status transition';
  END IF;

  UPDATE public.orders SET
    order_status = p_new_status,
    tracking_number = CASE WHEN p_new_status = 'shipped' THEN trim(p_tracking_number) ELSE tracking_number END,
    updated_at = NOW(),
    completed_at = CASE WHEN p_new_status = 'delivered' THEN NOW() ELSE completed_at END
  WHERE id = p_order_id;
END;
$$;

REVOKE ALL ON FUNCTION public.advance_order_status(UUID, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.advance_order_status(UUID, TEXT, TEXT) TO authenticated;

-- Keep the conversation preview current after a message is sent.
CREATE OR REPLACE FUNCTION update_conversation_preview()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.conversations
  SET last_message = NEW.content,
      last_message_at = NEW.created_at,
      updated_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.update_conversation_preview() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE TRIGGER messages_update_conversation_preview
AFTER INSERT ON messages
FOR EACH ROW EXECUTE FUNCTION update_conversation_preview();

-- ============================================
-- INITIAL CATEGORIES DATA
-- ============================================
INSERT INTO categories (name, slug, description, icon_emoji, display_order) VALUES
  ('Phones & Tablets', 'phones-tablets', 'Smartphones and tablet devices', NULL, 1),
  ('Laptops & Computers', 'laptops-computers', 'Laptops, desktops, and computers', NULL, 2),
  ('Audio & Headphones', 'audio-headphones', 'Headphones, speakers, and audio equipment', NULL, 3),
  ('Wearables', 'wearables', 'Smartwatches and wearable devices', NULL, 4),
  ('Cameras & Photography', 'cameras-photography', 'Cameras and photography equipment', NULL, 5),
  ('Gaming & Consoles', 'gaming-consoles', 'Gaming consoles and accessories', NULL, 6)
ON CONFLICT DO NOTHING;

UPDATE public.categories SET display_order = CASE name
  WHEN 'Phones & Tablets' THEN 9
  WHEN 'Laptops & Computers' THEN 10
  WHEN 'Audio & Headphones' THEN 11
  WHEN 'Wearables' THEN 12
  WHEN 'Cameras & Photography' THEN 13
  WHEN 'Gaming & Consoles' THEN 14
  ELSE display_order
END
WHERE name IN ('Phones & Tablets', 'Laptops & Computers', 'Audio & Headphones', 'Wearables', 'Cameras & Photography', 'Gaming & Consoles');

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
