-- ============================================================
-- VELA INTIMATES - Complete Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE order_status AS ENUM (
  'pending', 'confirmed', 'processing', 'packed',
  'dispatched', 'delivered', 'cancelled'
);

CREATE TYPE payment_method AS ENUM ('cod', 'manual', 'stripe');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');

-- ============================================================
-- CATEGORIES
-- ============================================================

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_active ON categories(is_active);

-- ============================================================
-- PRODUCTS
-- ============================================================

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  short_description TEXT,
  price DECIMAL(10,2) NOT NULL,
  sale_price DECIMAL(10,2),
  cost_price DECIMAL(10,2),
  sku TEXT UNIQUE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  stock_quantity INT DEFAULT 0,
  low_stock_threshold INT DEFAULT 5,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_new_arrival BOOLEAN DEFAULT false,
  is_best_seller BOOLEAN DEFAULT false,
  sizes TEXT[] DEFAULT '{}',
  colors JSONB DEFAULT '[]',
  tags TEXT[] DEFAULT '{}',
  weight DECIMAL(8,2),
  materials TEXT,
  care_instructions TEXT,
  meta_title TEXT,
  meta_description TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_featured ON products(is_featured);
CREATE INDEX idx_products_new_arrival ON products(is_new_arrival);
CREATE INDEX idx_products_best_seller ON products(is_best_seller);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_name_trgm ON products USING gin(name gin_trgm_ops);

-- ============================================================
-- PRODUCT IMAGES
-- ============================================================

CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT,
  is_primary BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_product_images_product ON product_images(product_id);

-- ============================================================
-- CUSTOMERS (guest checkout, no auth required)
-- ============================================================

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  total_orders INT DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT customers_email_key UNIQUE (email)
);

CREATE INDEX idx_customers_email ON customers(email);

-- ============================================================
-- ORDERS
-- ============================================================

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  -- Shipping info (snapshot at order time)
  shipping_full_name TEXT NOT NULL,
  shipping_email TEXT NOT NULL,
  shipping_phone TEXT,
  shipping_address TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_country TEXT NOT NULL,
  shipping_postal_code TEXT,
  notes TEXT,
  -- Pricing
  subtotal DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  shipping_fee DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  -- Payment
  payment_method payment_method DEFAULT 'cod',
  payment_status payment_status DEFAULT 'pending',
  -- Status
  status order_status DEFAULT 'pending',
  -- Coupon
  coupon_code TEXT,
  -- Tracking
  tracking_number TEXT,
  tracking_url TEXT,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancel_reason TEXT
);

CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_email ON orders(shipping_email);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- ============================================================
-- ORDER ITEMS
-- ============================================================

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_sku TEXT,
  product_image TEXT,
  size TEXT,
  color TEXT,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- ============================================================
-- COUPONS
-- ============================================================

CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL DEFAULT 'percentage', -- 'percentage' | 'fixed'
  discount_value DECIMAL(10,2) NOT NULL,
  minimum_order DECIMAL(10,2) DEFAULT 0,
  usage_limit INT,
  usage_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_coupons_code ON coupons(code);

-- ============================================================
-- NEWSLETTER SUBSCRIBERS
-- ============================================================

CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  is_active BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ
);

CREATE INDEX idx_newsletter_email ON newsletter_subscribers(email);

-- ============================================================
-- PRODUCT REVIEWS
-- ============================================================

CREATE TABLE product_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  body TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reviews_product ON product_reviews(product_id);
CREATE INDEX idx_reviews_approved ON product_reviews(is_approved);

-- ============================================================
-- WISHLISTS (linked by session token, no login required)
-- ============================================================

CREATE TABLE wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_token TEXT NOT NULL,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_token, product_id)
);

CREATE INDEX idx_wishlists_session ON wishlists(session_token);

-- ============================================================
-- SETTINGS (key-value store for site settings)
-- ============================================================

CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ORDER STATUS HISTORY
-- ============================================================

CREATE TABLE order_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status order_status NOT NULL,
  note TEXT,
  created_by TEXT, -- 'admin' | 'system'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_status_history_order ON order_status_history(order_id);

-- ============================================================
-- ADMINS (tracks which Supabase Auth users are admins)
-- ============================================================

CREATE TABLE admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER coupons_updated_at BEFORE UPDATE ON coupons FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Order number generator (VI-YYYYMMDD-XXXX)
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  date_part TEXT;
  seq_part TEXT;
  order_num TEXT;
BEGIN
  date_part := TO_CHAR(NOW(), 'YYYYMMDD');
  SELECT LPAD(CAST(COUNT(*) + 1 AS TEXT), 4, '0')
  INTO seq_part
  FROM orders
  WHERE DATE(created_at) = DATE(NOW());
  order_num := 'VI-' || date_part || '-' || seq_part;
  RETURN order_num;
END;
$$ LANGUAGE plpgsql;

-- Update customer stats after order
CREATE OR REPLACE FUNCTION update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'delivered' AND (OLD.status IS NULL OR OLD.status != 'delivered') THEN
    UPDATE customers SET
      total_orders = total_orders + 1,
      total_spent = total_spent + NEW.total
    WHERE id = NEW.customer_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER order_delivered_update_customer
  AFTER UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_customer_stats();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins
    WHERE id = auth.uid() AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- CATEGORIES: public read, admin write
CREATE POLICY "categories_public_read" ON categories FOR SELECT USING (is_active = true OR is_admin());
CREATE POLICY "categories_admin_insert" ON categories FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "categories_admin_update" ON categories FOR UPDATE USING (is_admin());
CREATE POLICY "categories_admin_delete" ON categories FOR DELETE USING (is_admin());

-- PRODUCTS: public read active, admin all
CREATE POLICY "products_public_read" ON products FOR SELECT USING (is_active = true OR is_admin());
CREATE POLICY "products_admin_insert" ON products FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "products_admin_update" ON products FOR UPDATE USING (is_admin());
CREATE POLICY "products_admin_delete" ON products FOR DELETE USING (is_admin());

-- PRODUCT IMAGES: public read, admin write
CREATE POLICY "product_images_public_read" ON product_images FOR SELECT USING (true);
CREATE POLICY "product_images_admin_write" ON product_images FOR ALL USING (is_admin());

-- CUSTOMERS: admin all, service role all
CREATE POLICY "customers_admin_all" ON customers FOR ALL USING (is_admin());
CREATE POLICY "customers_service_role" ON customers FOR ALL USING (auth.role() = 'service_role');

-- ORDERS: anyone can insert (guest checkout), admin/service can read all
CREATE POLICY "orders_insert_public" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_admin_read" ON orders FOR SELECT USING (is_admin());
CREATE POLICY "orders_service_role" ON orders FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "orders_own_read" ON orders FOR SELECT USING (shipping_email = auth.jwt()->>'email');
CREATE POLICY "orders_admin_update" ON orders FOR UPDATE USING (is_admin());

-- ORDER ITEMS: follow orders
CREATE POLICY "order_items_insert_public" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "order_items_admin_read" ON order_items FOR SELECT USING (is_admin());
CREATE POLICY "order_items_service_role" ON order_items FOR ALL USING (auth.role() = 'service_role');

-- ORDER STATUS HISTORY
CREATE POLICY "status_history_admin" ON order_status_history FOR ALL USING (is_admin());
CREATE POLICY "status_history_service" ON order_status_history FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "status_history_insert" ON order_status_history FOR INSERT WITH CHECK (true);

-- COUPONS: public read active, admin write
CREATE POLICY "coupons_public_read" ON coupons FOR SELECT USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));
CREATE POLICY "coupons_admin_all" ON coupons FOR ALL USING (is_admin());
CREATE POLICY "coupons_service_role" ON coupons FOR ALL USING (auth.role() = 'service_role');

-- NEWSLETTER: public insert, admin read
CREATE POLICY "newsletter_public_insert" ON newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "newsletter_admin_all" ON newsletter_subscribers FOR ALL USING (is_admin());

-- REVIEWS: public read approved, insert public, admin all
CREATE POLICY "reviews_public_read" ON product_reviews FOR SELECT USING (is_approved = true OR is_admin());
CREATE POLICY "reviews_public_insert" ON product_reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "reviews_admin_all" ON product_reviews FOR ALL USING (is_admin());

-- WISHLISTS: session-based (service role only, managed via API)
CREATE POLICY "wishlists_service_role" ON wishlists FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "wishlists_public_all" ON wishlists FOR ALL USING (true);

-- SETTINGS: public read, admin write
CREATE POLICY "settings_public_read" ON settings FOR SELECT USING (true);
CREATE POLICY "settings_admin_write" ON settings FOR ALL USING (is_admin());

-- ADMINS: admin read self
CREATE POLICY "admins_read_self" ON admins FOR SELECT USING (id = auth.uid());
CREATE POLICY "admins_service_role" ON admins FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('product-images', 'product-images', true, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('category-images', 'category-images', true, 5242880, ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT DO NOTHING;

-- Storage policies
CREATE POLICY "product_images_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "product_images_admin_upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND (is_admin() OR auth.role() = 'service_role'));
CREATE POLICY "product_images_admin_delete" ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND (is_admin() OR auth.role() = 'service_role'));
CREATE POLICY "category_images_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'category-images');
CREATE POLICY "category_images_admin_upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'category-images' AND (is_admin() OR auth.role() = 'service_role'));

-- ============================================================
-- DEFAULT SETTINGS
-- ============================================================

INSERT INTO settings (key, value) VALUES
  ('site_name', 'Vela Intimates'),
  ('site_tagline', 'Luxury Intimates for Every Woman'),
  ('currency', 'USD'),
  ('currency_symbol', '$'),
  ('free_shipping_threshold', '75'),
  ('default_shipping_fee', '8'),
  ('maintenance_mode', 'false'),
  ('contact_email', 'hello@velaintimates.com'),
  ('instagram_url', 'https://instagram.com/velaintimates'),
  ('facebook_url', ''),
  ('whatsapp_number', '+1234567890')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- SEED CATEGORIES
-- ============================================================

INSERT INTO categories (id, name, slug, description, image_url, sort_order) VALUES
  (uuid_generate_v4(), 'Bras', 'bras', 'Beautiful and supportive bras for every occasion', 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&q=80', 1),
  (uuid_generate_v4(), 'Panties', 'panties', 'Elegant and comfortable everyday lingerie', 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80', 2),
  (uuid_generate_v4(), 'Sets', 'sets', 'Matching lingerie sets for the perfect look', 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80', 3),
  (uuid_generate_v4(), 'Loungewear', 'loungewear', 'Soft and luxurious loungewear for relaxing in style', 'https://images.unsplash.com/photo-1617118994648-f1e4b2f9fd8c?w=600&q=80', 4),
  (uuid_generate_v4(), 'Sleepwear', 'sleepwear', 'Dreamy sleepwear for the perfect night''s rest', 'https://images.unsplash.com/photo-1617119108161-2e4b6cb4e14f?w=600&q=80', 5),
  (uuid_generate_v4(), 'Bodysuits', 'bodysuits', 'Sleek and versatile bodysuits for every style', 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80', 6)
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED PRODUCTS (Sample data)
-- ============================================================

DO $$
DECLARE
  bras_id UUID;
  panties_id UUID;
  sets_id UUID;
  loungewear_id UUID;
  sleepwear_id UUID;
  p1 UUID; p2 UUID; p3 UUID; p4 UUID; p5 UUID; p6 UUID; p7 UUID; p8 UUID;
BEGIN
  SELECT id INTO bras_id FROM categories WHERE slug = 'bras';
  SELECT id INTO panties_id FROM categories WHERE slug = 'panties';
  SELECT id INTO sets_id FROM categories WHERE slug = 'sets';
  SELECT id INTO loungewear_id FROM categories WHERE slug = 'loungewear';
  SELECT id INTO sleepwear_id FROM categories WHERE slug = 'sleepwear';

  -- Product 1
  p1 := uuid_generate_v4();
  INSERT INTO products (id, name, slug, description, short_description, price, sale_price, sku, category_id, stock_quantity, is_active, is_featured, is_new_arrival, sizes, colors, tags) VALUES
  (p1, 'Rose Petal Lace Bra', 'rose-petal-lace-bra', 'This exquisite lace bra combines ethereal beauty with everyday comfort. Crafted from the finest European lace, it features underwire support, adjustable straps, and a secure back closure. The delicate floral pattern adds a touch of romance to your daily wardrobe.', 'Ethereal lace bra with underwire support and adjustable straps.', 68.00, 54.00, 'VI-BRA-001', bras_id, 45, true, true, true,
    ARRAY['32A','32B','32C','32D','34A','34B','34C','34D','36B','36C','36D'],
    '[{"name":"Blush Pink","hex":"#F2D0D6"},{"name":"Ivory","hex":"#FFFFF0"},{"name":"Black","hex":"#1C1C1C"}]',
    ARRAY['lace','underwire','romantic','bestseller']
  );
  INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order) VALUES
  (p1, 'https://images.unsplash.com/photo-1583846552345-f38b0c5d5b41?w=800&q=80', 'Rose Petal Lace Bra - Front', true, 0),
  (p1, 'https://images.unsplash.com/photo-1589465885857-44edb59bbff2?w=800&q=80', 'Rose Petal Lace Bra - Detail', false, 1),
  (p1, 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80', 'Rose Petal Lace Bra - Back', false, 2);

  -- Product 2
  p2 := uuid_generate_v4();
  INSERT INTO products (id, name, slug, description, short_description, price, sku, category_id, stock_quantity, is_active, is_featured, is_best_seller, sizes, colors, tags) VALUES
  (p2, 'Velvet Dreams Balconette', 'velvet-dreams-balconette', 'Elevate your lingerie collection with this sumptuous velvet balconette bra. The flattering cut creates a beautiful décolleté, while the velvet fabric provides a luxurious touch against the skin. Features include padded cups for lift and shaping.', 'Luxurious velvet balconette with flattering uplift.', 78.00, 'VI-BRA-002', bras_id, 30, true, true, true,
    ARRAY['32B','32C','32D','34B','34C','34D','36B','36C','36D','38C','38D'],
    '[{"name":"Wine Red","hex":"#7B2D3E"},{"name":"Midnight Black","hex":"#0D0D0D"},{"name":"Champagne","hex":"#F7E7CE"}]',
    ARRAY['velvet','balconette','luxury','uplift']
  );
  INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order) VALUES
  (p2, 'https://images.unsplash.com/photo-1617118994648-f1e4b2f9fd8c?w=800&q=80', 'Velvet Dreams Balconette', true, 0),
  (p2, 'https://images.unsplash.com/photo-1589465885857-44edb59bbff2?w=800&q=80', 'Velvet Dreams Balconette Detail', false, 1);

  -- Product 3
  p3 := uuid_generate_v4();
  INSERT INTO products (id, name, slug, description, short_description, price, sale_price, sku, category_id, stock_quantity, is_active, is_featured, is_best_seller, sizes, colors, tags) VALUES
  (p3, 'Silk & Lace Matching Set', 'silk-lace-matching-set', 'Our bestselling matching set combines delicate French lace with the smoothest silk-satin fabric. This complete set includes a plunge bra and matching high-cut panty. The perfect gift for yourself or a loved one, presented in our signature gift box.', 'French lace and silk-satin matching bra and panty set.', 128.00, 98.00, 'VI-SET-001', sets_id, 25, true, true, true,
    ARRAY['XS','S','M','L','XL'],
    '[{"name":"Dusty Rose","hex":"#D4A0A8"},{"name":"Champagne","hex":"#F7E7CE"},{"name":"Black","hex":"#1C1C1C"}]',
    ARRAY['matching set','silk','lace','gift','bestseller','romantic']
  );
  INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order) VALUES
  (p3, 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80', 'Silk & Lace Matching Set', true, 0),
  (p3, 'https://images.unsplash.com/photo-1583846552345-f38b0c5d5b41?w=800&q=80', 'Silk & Lace Matching Set Detail', false, 1);

  -- Product 4
  p4 := uuid_generate_v4();
  INSERT INTO products (id, name, slug, description, short_description, price, sku, category_id, stock_quantity, is_active, is_new_arrival, sizes, colors, tags) VALUES
  (p4, 'Cloud Comfort Cotton Panty', 'cloud-comfort-cotton-panty', 'Discover ultimate everyday comfort in our Cloud Comfort Cotton Panty. Made from GOTS certified organic cotton with a touch of elastane, these panties offer a second-skin feel with full coverage. The wide waistband sits gently on your skin without digging.', 'Organic cotton panty with cloud-soft comfort for every day.', 24.00, 'VI-PAN-001', panties_id, 120, true, false,
    ARRAY['XS','S','M','L','XL','XXL'],
    '[{"name":"Ivory","hex":"#FFFFF0"},{"name":"Blush","hex":"#F2D0D6"},{"name":"Sage","hex":"#B2C9AD"},{"name":"Black","hex":"#1C1C1C"}]',
    ARRAY['cotton','comfortable','everyday','organic']
  );
  INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order) VALUES
  (p4, 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80', 'Cloud Comfort Cotton Panty', true, 0);

  -- Product 5
  p5 := uuid_generate_v4();
  INSERT INTO products (id, name, slug, description, short_description, price, sku, category_id, stock_quantity, is_active, is_featured, is_new_arrival, sizes, colors, tags) VALUES
  (p5, 'Midnight Silk Chemise', 'midnight-silk-chemise', 'Indulge in the ultimate luxury with our Midnight Silk Chemise. Crafted from 100% pure Mulberry silk, this flowing chemise drapes beautifully over the body. Features include delicate lace trim, adjustable spaghetti straps, and a flattering A-line silhouette.', '100% Mulberry silk chemise with delicate lace trim.', 145.00, 'VI-SLP-001', sleepwear_id, 18, true, true, true,
    ARRAY['XS','S','M','L','XL'],
    '[{"name":"Midnight Black","hex":"#0D0D0D"},{"name":"Dusty Rose","hex":"#D4A0A8"},{"name":"Ivory","hex":"#FFFFF0"}]',
    ARRAY['silk','chemise','sleepwear','luxury','100% silk']
  );
  INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order) VALUES
  (p5, 'https://images.unsplash.com/photo-1617119108161-2e4b6cb4e14f?w=800&q=80', 'Midnight Silk Chemise', true, 0),
  (p5, 'https://images.unsplash.com/photo-1617118994648-f1e4b2f9fd8c?w=800&q=80', 'Midnight Silk Chemise Worn', false, 1);

  -- Product 6
  p6 := uuid_generate_v4();
  INSERT INTO products (id, name, slug, description, short_description, price, sale_price, sku, category_id, stock_quantity, is_active, is_best_seller, is_new_arrival, sizes, colors, tags) VALUES
  (p6, 'Cashmere Lounge Set', 'cashmere-lounge-set', 'The perfect set for luxurious relaxation. Our Cashmere Lounge Set features a ribbed long-sleeve top and matching wide-leg pants, both crafted from the softest cashmere blend. The elegant minimalist design makes this suitable for lounging at home or running quick errands.', 'Ultra-soft cashmere blend lounge set for effortless elegance.', 185.00, 148.00, 'VI-LNG-001', loungewear_id, 22, true, true, true,
    ARRAY['XS','S','M','L','XL'],
    '[{"name":"Oat","hex":"#E8DFD0"},{"name":"Taupe","hex":"#B5A89A"},{"name":"Blush","hex":"#F2D0D6"}]',
    ARRAY['cashmere','lounge','set','comfortable','luxury']
  );
  INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order) VALUES
  (p6, 'https://images.unsplash.com/photo-1571945192236-d7c3e9cd2e6e?w=800&q=80', 'Cashmere Lounge Set', true, 0),
  (p6, 'https://images.unsplash.com/photo-1617118994648-f1e4b2f9fd8c?w=800&q=80', 'Cashmere Lounge Set Detail', false, 1);

  -- Product 7
  p7 := uuid_generate_v4();
  INSERT INTO products (id, name, slug, description, short_description, price, sku, category_id, stock_quantity, is_active, is_new_arrival, sizes, colors, tags) VALUES
  (p7, 'Floral Embroidered Thong', 'floral-embroidered-thong', 'A romantic thong featuring delicate floral embroidery on soft microfiber fabric. The seamless design ensures no visible panty lines while the cotton-lined gusset provides all-day comfort.', 'Romantic floral embroidery on seamless microfiber thong.', 32.00, 'VI-PAN-002', panties_id, 85, true, true,
    ARRAY['XS','S','M','L','XL'],
    '[{"name":"Blush Pink","hex":"#F2D0D6"},{"name":"Black","hex":"#1C1C1C"},{"name":"Champagne","hex":"#F7E7CE"}]',
    ARRAY['thong','embroidered','seamless','romantic']
  );
  INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order) VALUES
  (p7, 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800&q=80', 'Floral Embroidered Thong', true, 0);

  -- Product 8
  p8 := uuid_generate_v4();
  INSERT INTO products (id, name, slug, description, short_description, price, sku, category_id, stock_quantity, is_active, is_featured, is_best_seller, sizes, colors, tags) VALUES
  (p8, 'Romantic Lace Bodysuit', 'romantic-lace-bodysuit', 'Our most sought-after piece — the Romantic Lace Bodysuit is a celebration of femininity. The all-over guipure lace provides beautiful coverage with a subtle peek-through effect. Features include a sweetheart neckline, adjustable straps, and a secure snap closure.', 'All-over guipure lace bodysuit with sweetheart neckline.', 98.00, 'VI-BST-001', sets_id, 35, true, true, true,
    ARRAY['XS','S','M','L','XL'],
    '[{"name":"Ivory","hex":"#FFFFF0"},{"name":"Black","hex":"#1C1C1C"},{"name":"Blush","hex":"#F2D0D6"}]',
    ARRAY['bodysuit','lace','romantic','bestseller']
  );
  INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order) VALUES
  (p8, 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80', 'Romantic Lace Bodysuit', true, 0),
  (p8, 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80', 'Romantic Lace Bodysuit Back', false, 1);

END $$;

-- ============================================================
-- SEED REVIEWS
-- ============================================================

DO $$
DECLARE
  p_id UUID;
BEGIN
  SELECT id INTO p_id FROM products WHERE slug = 'silk-lace-matching-set';
  INSERT INTO product_reviews (product_id, customer_name, customer_email, rating, title, body, is_verified, is_approved) VALUES
  (p_id, 'Sophie M.', 'sophie@example.com', 5, 'Absolutely stunning!', 'I bought this as a gift for myself and it exceeded every expectation. The silk feels like butter and the lace detail is just beautiful. Worth every penny!', true, true),
  (p_id, 'Emma L.', 'emma@example.com', 5, 'Best lingerie I own', 'The quality is outstanding. Fits perfectly and feels luxurious. I''ve already recommended Vela to all my friends.', true, true),
  (p_id, 'Mia R.', 'mia@example.com', 4, 'Beautiful quality', 'Gorgeous set, very true to size. The packaging alone made it feel special. Just wish there were more color options!', false, true);

  SELECT id INTO p_id FROM products WHERE slug = 'rose-petal-lace-bra';
  INSERT INTO product_reviews (product_id, customer_name, customer_email, rating, title, body, is_verified, is_approved) VALUES
  (p_id, 'Clara B.', 'clara@example.com', 5, 'My new favorite bra', 'Finally a lace bra that''s both gorgeous AND comfortable! Wore it all day with zero discomfort. The blush pink color is exactly as pictured.', true, true),
  (p_id, 'Lily S.', 'lily@example.com', 5, 'Perfect fit', 'True to size and so pretty. The lace is very delicate and feminine. Great support too.', true, true);
END $$;

-- ============================================================
-- SEED COUPONS
-- ============================================================

INSERT INTO coupons (code, description, discount_type, discount_value, minimum_order, usage_limit, is_active) VALUES
  ('WELCOME10', 'Welcome discount - 10% off your first order', 'percentage', 10, 0, NULL, true),
  ('VELA20', 'Special promo - 20% off orders over $100', 'percentage', 20, 100, 500, true),
  ('SAVE15', '$15 off orders over $75', 'fixed', 15, 75, 200, true)
ON CONFLICT DO NOTHING;
