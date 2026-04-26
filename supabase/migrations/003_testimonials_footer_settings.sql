-- ============================================================
-- MIGRATION 003: Testimonials + Footer Settings
-- ============================================================

-- ============================================================
-- TESTIMONIALS
-- ============================================================

CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name TEXT NOT NULL,
  customer_image_url TEXT,
  quote TEXT NOT NULL,
  rating INT NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  product_name TEXT,
  location TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_testimonials_active ON testimonials(is_active);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "testimonials_public_read" ON testimonials FOR SELECT USING (is_active = true OR is_admin());
CREATE POLICY "testimonials_admin_all" ON testimonials FOR ALL USING (is_admin());
CREATE POLICY "testimonials_service_role" ON testimonials FOR ALL USING (auth.role() = 'service_role');

CREATE TRIGGER testimonials_updated_at BEFORE UPDATE ON testimonials FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Storage bucket for testimonial images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('testimonial-images', 'testimonial-images', true, 5242880, ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT DO NOTHING;

CREATE POLICY "testimonial_images_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'testimonial-images');
CREATE POLICY "testimonial_images_admin_upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'testimonial-images' AND (is_admin() OR auth.role() = 'service_role'));
CREATE POLICY "testimonial_images_admin_delete" ON storage.objects FOR DELETE USING (bucket_id = 'testimonial-images' AND (is_admin() OR auth.role() = 'service_role'));

-- ============================================================
-- FOOTER & SITE SETTINGS (extend existing settings table)
-- ============================================================

INSERT INTO settings (key, value) VALUES
  ('brand_name', 'Vela Intimates'),
  ('brand_tagline', 'Luxury lingerie crafted for the modern woman who appreciates beauty, comfort, and confidence.'),
  ('show_instagram', 'true'),
  ('show_facebook', 'true'),
  ('footer_whatsapp', '+1 (234) 567-890'),
  ('show_whatsapp', 'true'),
  ('show_newsletter', 'true'),
  ('footer_copyright', 'Vela Intimates. All rights reserved.'),
  ('footer_shop_links', '[{"label":"All Products","href":"/shop","visible":true},{"label":"Bras","href":"/shop?category=bras","visible":true},{"label":"Panties","href":"/shop?category=panties","visible":true},{"label":"Sets","href":"/shop?category=sets","visible":true},{"label":"Sleepwear","href":"/shop?category=sleepwear","visible":true},{"label":"Loungewear","href":"/shop?category=loungewear","visible":true},{"label":"New Arrivals","href":"/shop?filter=new","visible":true},{"label":"Sale","href":"/shop?filter=sale","visible":true}]'),
  ('footer_help_links', '[{"label":"Size Guide","href":"/size-guide","visible":true},{"label":"Shipping Info","href":"/shipping","visible":true},{"label":"Returns & Exchanges","href":"/returns","visible":true},{"label":"Care Guide","href":"/care","visible":true},{"label":"FAQs","href":"/faqs","visible":true},{"label":"Contact Us","href":"/contact","visible":true}]')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- SEED TESTIMONIALS
-- ============================================================

INSERT INTO testimonials (customer_name, quote, rating, product_name, location, is_active, sort_order) VALUES
  ('Sophie M.', 'Vela Intimates has completely transformed my lingerie drawer. The quality is extraordinary — the silk feels like a dream and the lace is so delicate yet surprisingly durable. Worth every single penny.', 5, 'Silk & Lace Matching Set', 'New York, USA', true, 1),
  ('Emma L.', 'The packaging alone made me feel pampered — like opening a gift from a luxury boutique. The bra fits perfectly and the lace is absolutely gorgeous. I''ve received so many compliments.', 5, 'Rose Petal Lace Bra', 'London, UK', true, 2),
  ('Isabelle D.', 'As a Parisian woman with high standards for lingerie, I am thoroughly impressed. The craftsmanship rivals the finest French labels but at a fraction of the price.', 5, 'Midnight Silk Chemise', 'Paris, France', true, 3),
  ('Mia R.', 'Finding lingerie that is both beautiful and comfortable has always been a struggle. Vela Intimates solved that problem beautifully. The cashmere lounge set is my weekend uniform now.', 5, 'Cashmere Lounge Set', 'Sydney, Australia', true, 4)
ON CONFLICT DO NOTHING;
