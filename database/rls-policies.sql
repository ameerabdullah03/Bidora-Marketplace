-- Bidora Row-Level Security (RLS) Policies
-- Secure database access at the row level

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================
-- Users can view all public user profiles
CREATE POLICY "users_view_public"
  ON users FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "users_update_self"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Authenticated users can insert (for new signups)
CREATE POLICY "users_insert_authenticated"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- CATEGORIES TABLE POLICIES
-- ============================================
-- Anyone can view categories
CREATE POLICY "categories_view_all"
  ON categories FOR SELECT
  USING (true);

-- ============================================
-- PRODUCTS TABLE POLICIES
-- ============================================
-- Anyone can view approved products
CREATE POLICY "products_view_approved"
  ON products FOR SELECT
  USING (status = 'approved' OR seller_id = auth.uid());

-- Sellers can view their own pending products
CREATE POLICY "products_view_own"
  ON products FOR SELECT
  USING (seller_id = auth.uid());

-- Sellers can create products
CREATE POLICY "products_insert_seller"
  ON products FOR INSERT
  WITH CHECK (
    auth.uid() = seller_id
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.account_type = 'seller'
    )
  );

-- Sellers can update their own products
CREATE POLICY "products_update_own"
  ON products FOR UPDATE
  USING (seller_id = auth.uid())
  WITH CHECK (seller_id = auth.uid());

-- ============================================
-- PRODUCT IMAGES TABLE POLICIES
-- ============================================
-- Anyone can view product images for approved products
CREATE POLICY "product_images_view"
  ON product_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_images.product_id
      AND (products.status = 'approved' OR products.seller_id = auth.uid())
    )
  );

-- Sellers can upload images for their products
CREATE POLICY "product_images_insert"
  ON product_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_images.product_id
      AND products.seller_id = auth.uid()
    )
  );

-- ============================================
-- AUCTIONS TABLE POLICIES
-- ============================================
-- Anyone can view active auctions
CREATE POLICY "auctions_view_active"
  ON auctions FOR SELECT
  USING (status = 'active' OR seller_id = auth.uid());

-- Sellers can create auctions
CREATE POLICY "auctions_insert_seller"
  ON auctions FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

-- ============================================
-- BIDS TABLE POLICIES
-- ============================================
-- Anyone can view bids on active auctions
CREATE POLICY "bids_view_active"
  ON bids FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auctions
      WHERE auctions.id = bids.auction_id
      AND auctions.status = 'active'
    )
  );

-- Authenticated users can place bids
CREATE POLICY "bids_insert_authenticated"
  ON bids FOR INSERT
  WITH CHECK (auth.uid() = bidder_id);

-- ============================================
-- ORDERS TABLE POLICIES
-- ============================================
-- Users can view their own orders
CREATE POLICY "orders_view_own"
  ON orders FOR SELECT
  USING (buyer_id = auth.uid() OR seller_id = auth.uid());

-- Authenticated users can create orders
CREATE POLICY "orders_insert_authenticated"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

-- Buyer and seller can update their orders
CREATE POLICY "orders_update_own"
  ON orders FOR UPDATE
  USING (buyer_id = auth.uid() OR seller_id = auth.uid())
  WITH CHECK (buyer_id = auth.uid() OR seller_id = auth.uid());

-- ============================================
-- REVIEWS TABLE POLICIES
-- ============================================
-- Anyone can view reviews
CREATE POLICY "reviews_view_all"
  ON reviews FOR SELECT
  USING (true);

-- Authenticated users can create reviews
CREATE POLICY "reviews_insert_authenticated"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);

-- ============================================
-- REPORTS TABLE POLICIES
-- ============================================
-- Users can view their own reports
CREATE POLICY "reports_view_own"
  ON reports FOR SELECT
  USING (reporter_id = auth.uid());

-- Authenticated users can create reports
CREATE POLICY "reports_insert_authenticated"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- ============================================
-- CONVERSATIONS TABLE POLICIES
-- ============================================
-- Users can view their own conversations
CREATE POLICY "conversations_view_own"
  ON conversations FOR SELECT
  USING (buyer_id = auth.uid() OR seller_id = auth.uid());

-- Authenticated users can create conversations
CREATE POLICY "conversations_insert_authenticated"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

-- ============================================
-- MESSAGES TABLE POLICIES
-- ============================================
-- Users can view messages in their conversations
CREATE POLICY "messages_view_own"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
    )
  );

-- Authenticated users can send messages
CREATE POLICY "messages_insert_authenticated"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);
