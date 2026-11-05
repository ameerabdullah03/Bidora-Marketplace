-- Upgrade an existing project that already uses the canonical database/schema.sql.
-- Back up first. Do not run against schema-simplified.sql.
BEGIN;
ALTER TABLE orders ALTER COLUMN product_id DROP NOT NULL;
ALTER TABLE products ALTER COLUMN category_id DROP NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_one_per_auction ON orders(auction_id) WHERE auction_id IS NOT NULL;
CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, account_type)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    CASE WHEN NEW.raw_user_meta_data->>'account_type' = 'seller' THEN 'seller' ELSE 'buyer' END)
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email,
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.users.full_name);
  RETURN NEW;
END;
$$;
CREATE OR REPLACE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_auth_user();
INSERT INTO public.users (id, email, full_name, account_type)
SELECT id, email, COALESCE(raw_user_meta_data->>'full_name', ''),
       CASE WHEN raw_user_meta_data->>'account_type' = 'seller' THEN 'seller' ELSE 'buyer' END
FROM auth.users ON CONFLICT (id) DO NOTHING;
CREATE TABLE IF NOT EXISTS admins (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS favorites (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, product_id)
);

CREATE OR REPLACE VIEW public_profiles AS
SELECT id, full_name, avatar_url, bio, account_type, is_verified,
       rating, total_reviews, total_sales, seller_since, created_at
FROM users;
GRANT SELECT ON public_profiles TO anon, authenticated;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
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
DROP POLICY IF EXISTS "listing_images_insert_owned_product" ON storage.objects;
DROP POLICY IF EXISTS "listing_images_update_owned_product" ON storage.objects;
DROP POLICY IF EXISTS "listing_images_delete_owned_product" ON storage.objects;
CREATE POLICY "listing_images_insert_owned_product" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id='listing-images' AND EXISTS(SELECT 1 FROM products WHERE products.id::text=(storage.foldername(name))[1] AND products.seller_id=auth.uid()));
CREATE POLICY "listing_images_update_owned_product" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id='listing-images' AND EXISTS(SELECT 1 FROM products WHERE products.id::text=(storage.foldername(name))[1] AND products.seller_id=auth.uid())) WITH CHECK (bucket_id='listing-images' AND EXISTS(SELECT 1 FROM products WHERE products.id::text=(storage.foldername(name))[1] AND products.seller_id=auth.uid()));
CREATE POLICY "listing_images_delete_owned_product" ON storage.objects FOR DELETE TO authenticated USING (bucket_id='listing-images' AND EXISTS(SELECT 1 FROM products WHERE products.id::text=(storage.foldername(name))[1] AND products.seller_id=auth.uid()));
DROP POLICY IF EXISTS "admins_view_self" ON admins;
CREATE POLICY "admins_view_self" ON admins FOR SELECT USING (user_id=auth.uid());
DROP POLICY IF EXISTS "users_view_public" ON users;
DROP POLICY IF EXISTS "users_view_self_or_admin" ON users;
CREATE POLICY "users_view_self_or_admin" ON users FOR SELECT USING (auth.uid()=id OR EXISTS(SELECT 1 FROM admins WHERE admins.user_id=auth.uid()));
DROP POLICY IF EXISTS "favorites_view_self" ON favorites;
CREATE POLICY "favorites_view_self" ON favorites FOR SELECT USING (user_id=auth.uid());
DROP POLICY IF EXISTS "favorites_insert_self" ON favorites;
CREATE POLICY "favorites_insert_self" ON favorites FOR INSERT WITH CHECK (user_id=auth.uid());
DROP POLICY IF EXISTS "favorites_delete_self" ON favorites;
CREATE POLICY "favorites_delete_self" ON favorites FOR DELETE USING (user_id=auth.uid());
DROP POLICY IF EXISTS "products_view_admin" ON products;
CREATE POLICY "products_view_admin" ON products FOR SELECT USING (EXISTS(SELECT 1 FROM admins WHERE admins.user_id=auth.uid()));
DROP POLICY IF EXISTS "products_update_admin" ON products;
CREATE POLICY "products_update_admin" ON products FOR UPDATE USING (EXISTS(SELECT 1 FROM admins WHERE admins.user_id=auth.uid())) WITH CHECK (EXISTS(SELECT 1 FROM admins WHERE admins.user_id=auth.uid()));
DROP POLICY IF EXISTS "products_delete_admin" ON products;
CREATE POLICY "products_delete_admin" ON products FOR DELETE USING (EXISTS(SELECT 1 FROM admins WHERE admins.user_id=auth.uid()));
DROP POLICY IF EXISTS "products_insert_seller" ON products;
CREATE POLICY "products_insert_seller" ON products FOR INSERT WITH CHECK (
  auth.uid()=seller_id AND EXISTS(SELECT 1 FROM users WHERE users.id=auth.uid() AND users.account_type='seller')
);
DROP POLICY IF EXISTS "auctions_view_active" ON auctions;
CREATE POLICY "auctions_view_active" ON auctions FOR SELECT USING (seller_id=auth.uid() OR (status IN ('active','ended') AND EXISTS(SELECT 1 FROM products WHERE products.id=auctions.product_id AND products.status='approved')));
DROP POLICY IF EXISTS "auctions_insert_seller" ON auctions;
CREATE POLICY "auctions_insert_seller" ON auctions FOR INSERT WITH CHECK (auth.uid()=seller_id AND EXISTS(SELECT 1 FROM products WHERE products.id=auctions.product_id AND products.seller_id=auth.uid() AND products.is_auction=true));
DROP POLICY IF EXISTS "bids_insert_authenticated" ON bids;
DROP POLICY IF EXISTS "bids_view_active" ON bids;
CREATE POLICY "bids_view_active" ON bids FOR SELECT USING (
  EXISTS(SELECT 1 FROM auctions WHERE auctions.id=bids.auction_id AND auctions.status IN ('active','ended')
    AND EXISTS(SELECT 1 FROM products WHERE products.id=auctions.product_id AND products.status='approved'))
);
DROP POLICY IF EXISTS "orders_insert_authenticated" ON orders;
DROP POLICY IF EXISTS "orders_update_own" ON orders;
DROP POLICY IF EXISTS "reviews_insert_authenticated" ON reviews;
DROP POLICY IF EXISTS "reviews_insert_verified_purchase" ON reviews;
CREATE POLICY "reviews_insert_verified_purchase" ON reviews FOR INSERT WITH CHECK (auth.uid()=reviewer_id AND is_seller_review=true AND EXISTS(SELECT 1 FROM orders WHERE orders.id=reviews.order_id AND orders.buyer_id=auth.uid() AND orders.product_id=reviews.product_id AND orders.seller_id=reviews.reviewed_user_id AND orders.order_status='delivered'));
DROP POLICY IF EXISTS "messages_insert_authenticated" ON messages;
CREATE POLICY "messages_insert_authenticated" ON messages FOR INSERT WITH CHECK (auth.uid()=sender_id AND EXISTS(SELECT 1 FROM conversations WHERE conversations.id=messages.conversation_id AND (conversations.buyer_id=auth.uid() OR conversations.seller_id=auth.uid())));
DROP POLICY IF EXISTS "messages_update_read_status" ON messages;
CREATE POLICY "messages_update_read_status" ON messages FOR UPDATE USING (EXISTS(SELECT 1 FROM conversations WHERE conversations.id=messages.conversation_id AND (conversations.buyer_id=auth.uid() OR conversations.seller_id=auth.uid()))) WITH CHECK (EXISTS(SELECT 1 FROM conversations WHERE conversations.id=messages.conversation_id AND (conversations.buyer_id=auth.uid() OR conversations.seller_id=auth.uid())));

COMMIT;
