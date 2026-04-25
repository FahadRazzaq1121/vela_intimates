-- Hero Slides table
CREATE TABLE hero_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  tag TEXT,
  title TEXT NOT NULL,
  subtitle TEXT,
  cta_text TEXT,
  cta_href TEXT,
  cta_secondary_text TEXT,
  cta_secondary_href TEXT,
  align TEXT DEFAULT 'left' CHECK (align IN ('left', 'center', 'right')),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER hero_slides_updated_at
  BEFORE UPDATE ON hero_slides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hero_slides_public_read" ON hero_slides
  FOR SELECT USING (is_active = true OR is_admin());

CREATE POLICY "hero_slides_admin_insert" ON hero_slides
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "hero_slides_admin_update" ON hero_slides
  FOR UPDATE USING (is_admin());

CREATE POLICY "hero_slides_admin_delete" ON hero_slides
  FOR DELETE USING (is_admin());

-- Storage bucket for hero images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('hero-images', 'hero-images', true, 10485760, ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "hero_images_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'hero-images');

CREATE POLICY "hero_images_admin_upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'hero-images' AND (is_admin() OR auth.role() = 'service_role'));

CREATE POLICY "hero_images_admin_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'hero-images' AND (is_admin() OR auth.role() = 'service_role'));

-- Seed with the existing 3 slides
INSERT INTO hero_slides (image_url, tag, title, subtitle, cta_text, cta_href, cta_secondary_text, cta_secondary_href, align, is_active, sort_order) VALUES
  ('https://images.unsplash.com/photo-1617118994648-f1e4b2f9fd8c?w=1600&q=90', 'New Collection', 'Wear Your Confidence', 'Discover our latest collection of luxurious lingerie, crafted for the woman who celebrates herself.', 'Shop Now', '/shop', 'View Lookbook', '/shop?filter=new', 'left', true, 1),
  ('https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1600&q=90', 'Best Sellers', 'Timeless Elegance', 'Our most-loved pieces, chosen by thousands of women who know what they want.', 'Shop Best Sellers', '/shop?filter=bestseller', NULL, NULL, 'center', true, 2),
  ('https://images.unsplash.com/photo-1583846552345-f38b0c5d5b41?w=1600&q=90', 'Limited Edition', 'The Rose Petal Edit', 'A curated selection of our most romantic and feminine pieces, available for a limited time.', 'Explore the Edit', '/shop?category=sets', NULL, NULL, 'right', true, 3);
