-- ============================================================
-- MIGRATION 004: Instagram Posts
-- ============================================================

CREATE TABLE instagram_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT NOT NULL,
  post_url TEXT,
  caption TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_instagram_posts_active ON instagram_posts(is_active);

ALTER TABLE instagram_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "instagram_posts_public_read" ON instagram_posts FOR SELECT USING (is_active = true OR is_admin());
CREATE POLICY "instagram_posts_admin_all" ON instagram_posts FOR ALL USING (is_admin());
CREATE POLICY "instagram_posts_service_role" ON instagram_posts FOR ALL USING (auth.role() = 'service_role');

CREATE TRIGGER instagram_posts_updated_at BEFORE UPDATE ON instagram_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Storage bucket for instagram images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('instagram-images', 'instagram-images', true, 10485760, ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT DO NOTHING;

CREATE POLICY "instagram_images_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'instagram-images');
CREATE POLICY "instagram_images_admin_upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'instagram-images' AND (is_admin() OR auth.role() = 'service_role'));
CREATE POLICY "instagram_images_admin_delete" ON storage.objects FOR DELETE USING (bucket_id = 'instagram-images' AND (is_admin() OR auth.role() = 'service_role'));

-- Add instagram_handle to settings
INSERT INTO settings (key, value) VALUES
  ('instagram_handle', '@velaintimate')
ON CONFLICT (key) DO NOTHING;
