-- ==============================================================================
-- TRJTA 24 - OFFICIAL DATABASE SCHEMA & ROW LEVEL SECURITY (SUPABASE POSTGRESQL)
-- Program Studi: Teknologi Rekayasa Jaringan Telekomunikasi
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. TABLES DEFINITIONS
-- ==============================================================================

-- A. Profiles (Menyimpan Role Admin, terhubung ke auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- B. Members (17 Mahasiswa TRJTA 24)
CREATE TABLE IF NOT EXISTS public.members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nim TEXT, -- Boleh NULL untuk Muhammad Haikal
  name TEXT NOT NULL,
  nickname TEXT,
  description TEXT,
  instagram TEXT,
  github TEXT,
  linkedin TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index untuk mempercepat pencarian nama dan NIM
CREATE INDEX IF NOT EXISTS idx_members_name ON public.members (name);
CREATE INDEX IF NOT EXISTS idx_members_nim ON public.members (nim);
CREATE INDEX IF NOT EXISTS idx_members_is_active ON public.members (is_active);

-- C. Class Roles / Pengurus Kelas (Menggunakan Foreign Key ke members.id)
CREATE TABLE IF NOT EXISTS public.class_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- Contoh: 'Komisaris', 'Wakil', 'Bendahara'
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_class_roles_member_id ON public.class_roles (member_id);

-- D. Announcements (Pengumuman Kelas)
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_published BOOLEAN NOT NULL DEFAULT true,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_announcements_published ON public.announcements (is_published, is_pinned, date DESC);

-- E. Events (Agenda / Kegiatan Kelas)
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_events_published ON public.events (is_published, date ASC);

-- F. Gallery Items (Dokumentasi Kegiatan Tanpa Upload Foto di Tahap Pertama)
CREATE TABLE IF NOT EXISTS public.gallery_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Kegiatan Kelas',
  date TEXT,
  description TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_gallery_published ON public.gallery_items (is_published, category);

-- G. Site Settings (Pengaturan Umum Website)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'general',
  site_name TEXT NOT NULL DEFAULT 'TRJTA 24',
  program_name TEXT NOT NULL DEFAULT 'Teknologi Rekayasa Jaringan Telekomunikasi',
  tagline TEXT NOT NULL DEFAULT 'Connect • Learn • Grow Together',
  class_description TEXT NOT NULL DEFAULT 'TRJTA 24 merupakan keluarga mahasiswa Teknologi Rekayasa Jaringan Telekomunikasi yang belajar, berkembang, berkolaborasi, dan membangun kebersamaan bersama.',
  batch_year TEXT NOT NULL DEFAULT '2024',
  hero_title TEXT NOT NULL DEFAULT 'TRJTA 24',
  hero_subtitle TEXT NOT NULL DEFAULT 'Teknologi Rekayasa Jaringan Telekomunikasi',
  instagram_url TEXT DEFAULT 'https://instagram.com',
  whatsapp_url TEXT DEFAULT 'https://whatsapp.com',
  email TEXT DEFAULT 'trjta24@pnl.ac.id',
  footer_text TEXT NOT NULL DEFAULT 'Ilal ilhamdi.',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 3. FUNCTIONS & TRIGGERS
-- ==============================================================================

-- A. Trigger untuk otomatis update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_profiles ON public.profiles;
CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_members ON public.members;
CREATE TRIGGER set_updated_at_members BEFORE UPDATE ON public.members FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_class_roles ON public.class_roles;
CREATE TRIGGER set_updated_at_class_roles BEFORE UPDATE ON public.class_roles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_announcements ON public.announcements;
CREATE TRIGGER set_updated_at_announcements BEFORE UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_events ON public.events;
CREATE TRIGGER set_updated_at_events BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_gallery_items ON public.gallery_items;
CREATE TRIGGER set_updated_at_gallery_items BEFORE UPDATE ON public.gallery_items FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_site_settings ON public.site_settings;
CREATE TRIGGER set_updated_at_site_settings BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- B. Auto-create profile saat ada user signup via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'member')
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- C. Helper function untuk memeriksa apakah user saat ini adalah ADMIN
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Aktifkan RLS di seluruh tabel
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- A. Policies untuk Profiles
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "User dapat membaca profilnya sendiri" ON public.profiles;
CREATE POLICY "User dapat membaca profilnya sendiri" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admin dapat membaca semua profil" ON public.profiles;
CREATE POLICY "Admin dapat membaca semua profil" ON public.profiles
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admin dapat mengelola profil" ON public.profiles;
CREATE POLICY "Admin dapat mengelola profil" ON public.profiles
  FOR ALL USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- B. Policies untuk Members
-- ------------------------------------------------------------------------------
-- Publik hanya dapat membaca anggota aktif (is_active = true)
DROP POLICY IF EXISTS "Publik dapat membaca anggota aktif" ON public.members;
CREATE POLICY "Publik dapat membaca anggota aktif" ON public.members
  FOR SELECT USING (is_active = true OR public.is_admin());

-- Hanya Admin yang boleh INSERT, UPDATE, DELETE anggota
DROP POLICY IF EXISTS "Admin memiliki akses penuh pada members" ON public.members;
CREATE POLICY "Admin memiliki akses penuh pada members" ON public.members
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- C. Policies untuk Class Roles
-- ------------------------------------------------------------------------------
-- Publik dapat melihat struktur pengurus
DROP POLICY IF EXISTS "Publik dapat membaca struktur pengurus" ON public.class_roles;
CREATE POLICY "Publik dapat membaca struktur pengurus" ON public.class_roles
  FOR SELECT USING (true);

-- Hanya Admin yang boleh mengubah pengurus
DROP POLICY IF EXISTS "Admin memiliki akses penuh pada class_roles" ON public.class_roles;
CREATE POLICY "Admin memiliki akses penuh pada class_roles" ON public.class_roles
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- D. Policies untuk Announcements
-- ------------------------------------------------------------------------------
-- Publik hanya membaca pengumuman yang diterbitkan (is_published = true)
DROP POLICY IF EXISTS "Publik dapat membaca pengumuman terbit" ON public.announcements;
CREATE POLICY "Publik dapat membaca pengumuman terbit" ON public.announcements
  FOR SELECT USING (is_published = true OR public.is_admin());

-- Hanya Admin yang boleh mengelola pengumuman
DROP POLICY IF EXISTS "Admin memiliki akses penuh pada announcements" ON public.announcements;
CREATE POLICY "Admin memiliki akses penuh pada announcements" ON public.announcements
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- E. Policies untuk Events
-- ------------------------------------------------------------------------------
-- Publik hanya membaca agenda yang diterbitkan
DROP POLICY IF EXISTS "Publik dapat membaca agenda terbit" ON public.events;
CREATE POLICY "Publik dapat membaca agenda terbit" ON public.events
  FOR SELECT USING (is_published = true OR public.is_admin());

-- Hanya Admin yang boleh mengelola agenda
DROP POLICY IF EXISTS "Admin memiliki akses penuh pada events" ON public.events;
CREATE POLICY "Admin memiliki akses penuh pada events" ON public.events
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- F. Policies untuk Gallery Items
-- ------------------------------------------------------------------------------
-- Publik hanya membaca item galeri terbit
DROP POLICY IF EXISTS "Publik dapat membaca item galeri terbit" ON public.gallery_items;
CREATE POLICY "Publik dapat membaca item galeri terbit" ON public.gallery_items
  FOR SELECT USING (is_published = true OR public.is_admin());

-- Hanya Admin yang boleh mengelola galeri
DROP POLICY IF EXISTS "Admin memiliki akses penuh pada gallery_items" ON public.gallery_items;
CREATE POLICY "Admin memiliki akses penuh pada gallery_items" ON public.gallery_items
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- G. Policies untuk Site Settings
-- ------------------------------------------------------------------------------
-- Publik dapat membaca pengaturan umum website
DROP POLICY IF EXISTS "Publik dapat membaca pengaturan website" ON public.site_settings;
CREATE POLICY "Publik dapat membaca pengaturan website" ON public.site_settings
  FOR SELECT USING (true);

-- Hanya Admin yang boleh mengubah pengaturan
DROP POLICY IF EXISTS "Admin dapat mengubah pengaturan website" ON public.site_settings;
CREATE POLICY "Admin dapat mengubah pengaturan website" ON public.site_settings
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());


-- ==============================================================================
-- 5. INITIAL SEED DATA
-- ==============================================================================

-- A. Pengaturan Website Default
INSERT INTO public.site_settings (id, site_name, program_name, tagline, class_description, batch_year, hero_title, hero_subtitle, instagram_url, whatsapp_url, email, footer_text)
VALUES (
  'general',
  'TRJTA 24',
  'Teknologi Rekayasa Jaringan Telekomunikasi',
  'Connect • Learn • Grow Together',
  'TRJTA 24 merupakan keluarga mahasiswa Teknologi Rekayasa Jaringan Telekomunikasi yang belajar, berkembang, berkolaborasi, dan membangun kebersamaan bersama.',
  '2024',
  'TRJTA 24',
  'Teknologi Rekayasa Jaringan Telekomunikasi',
  'https://instagram.com',
  'https://whatsapp.com',
  'trjta24@pnl.ac.id',
  'Ilal ilhamdi.'
)
ON CONFLICT (id) DO NOTHING;

-- B. 17 Mahasiswa TRJTA 24 (Data Awal Resmi)
-- Catatan: Muhammad Haikal NIM: NULL (Sesuai instruksi mutlak jangan mengarang NIM)
INSERT INTO public.members (id, nim, name, nickname, description, display_order, is_active)
VALUES
  ('c0000001-0000-0000-0000-000000000001', '2024203020028', 'Aqil Ocean Difra', 'Aqil', 'Komisaris kelas TRJTA 24 yang mengkoordinasikan kegiatan perkuliahan.', 1, true),
  ('c0000001-0000-0000-0000-000000000002', '2024203020011', 'Durratul Hikmah', 'Durratul', 'Mahasiswa aktif TRJTA 24 Politeknik Negeri Lhokseumawe.', 2, true),
  ('c0000001-0000-0000-0000-000000000003', '2024203020025', 'Farhan Alfarisyi', 'Farhan', 'Mahasiswa aktif TRJTA 24 Politeknik Negeri Lhokseumawe.', 3, true),
  ('c0000001-0000-0000-0000-000000000004', '2024203020009', 'Firlita Afianti', 'Firlita', 'Mahasiswa aktif TRJTA 24 Politeknik Negeri Lhokseumawe.', 4, true),
  ('c0000001-0000-0000-0000-000000000005', '2024203020001', 'Ilal Ilhamdi', 'Ilal', 'Mahasiswa aktif TRJTA 24 Politeknik Negeri Lhokseumawe.', 5, true),
  ('c0000001-0000-0000-0000-000000000006', '2024203020019', 'Khairul Fajar Sidiq', 'Khairul', 'Mahasiswa aktif TRJTA 24 Politeknik Negeri Lhokseumawe.', 6, true),
  ('c0000001-0000-0000-0000-000000000007', '2024203020032', 'Lunna Auamara', 'Lunna', 'Mahasiswa aktif TRJTA 24 Politeknik Negeri Lhokseumawe.', 7, true),
  ('c0000001-0000-0000-0000-000000000008', '2024203020022', 'Muhammad Halfi Al Barizi', 'Halfi', 'Mahasiswa aktif TRJTA 24 Politeknik Negeri Lhokseumawe.', 8, true),
  ('c0000001-0000-0000-0000-000000000009', '2024203020029', 'Muhammad Rais', 'Rais', 'Mahasiswa aktif TRJTA 24 Politeknik Negeri Lhokseumawe.', 9, true),
  ('c0000001-0000-0000-0000-000000000010', '2024203020036', 'Nazar Al Farabi', 'Nazar', 'Mahasiswa aktif TRJTA 24 Politeknik Negeri Lhokseumawe.', 10, true),
  ('c0000001-0000-0000-0000-000000000011', '2024203020020', 'Nesya Zikriya', 'Nesya', 'Mahasiswa aktif TRJTA 24 Politeknik Negeri Lhokseumawe.', 11, true),
  ('c0000001-0000-0000-0000-000000000012', '2024203020008', 'Rahmat Haikal', 'Rahmat', 'Wakil komisaris kelas TRJTA 24 yang mendampingi koordinasi kelas.', 12, true),
  ('c0000001-0000-0000-0000-000000000013', '2024203020016', 'Renka Laura', 'Renka', 'Bendahara kelas TRJTA 24 yang mengelola administrasi keuangan kelas.', 13, true),
  ('c0000001-0000-0000-0000-000000000014', '2024203020003', 'Sarah Fonna', 'Sarah', 'Mahasiswa aktif TRJTA 24 Politeknik Negeri Lhokseumawe.', 14, true),
  ('c0000001-0000-0000-0000-000000000015', '2024203020006', 'Suheil Maulana', 'Suheil', 'Mahasiswa aktif TRJTA 24 Politeknik Negeri Lhokseumawe.', 15, true),
  ('c0000001-0000-0000-0000-000000000016', '2024203020031', 'Syawal Fitriyadi', 'Syawal', 'Mahasiswa aktif TRJTA 24 Politeknik Negeri Lhokseumawe.', 16, true),
  ('c0000001-0000-0000-0000-000000000017', NULL, 'Muhammad Haikal', 'Haikal', 'Mahasiswa aktif TRJTA 24 Politeknik Negeri Lhokseumawe (NIM belum diberikan).', 17, true)
ON CONFLICT (id) DO NOTHING;

-- C. Pengurus Kelas (3 Posisi Awal Terhubung Foreign Key ke members.id)
INSERT INTO public.class_roles (id, member_id, role, display_order)
VALUES
  ('d0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 'Komisaris', 1),
  ('d0000001-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000012', 'Wakil', 2),
  ('d0000001-0000-0000-0000-000000000003', 'c0000001-0000-0000-0000-000000000013', 'Bendahara', 3)
ON CONFLICT (id) DO NOTHING;

-- D. Pengumuman Awal
INSERT INTO public.announcements (id, title, content, date, is_published, is_pinned)
VALUES
  ('e0000001-0000-0000-0000-000000000001', 'Modul Praktikum Jaringan Komputer Semester Ganjil', 'Modul praktikum konfigurasi VLAN dan routing statis telah diunggah ke Google Drive kelas. Diharapkan seluruh mahasiswa mempelajari modul sebelum masuk ke laboratorium.', '2026-09-20', true, true),
  ('e0000001-0000-0000-0000-000000000002', 'Batas Waktu Pengumpulan Tugas Sistem Telekomunikasi', 'Pengumpulan laporan analisis spektrum frekuensi seluler paling lambat hari Jumat pukul 23:59 WIB melalui portal e-learning kampus.', '2026-09-18', true, false),
  ('e0000001-0000-0000-0000-000000000003', 'Jadwal Kuliah Pengganti Matematika Terapan', 'Kuliah pengganti Matematika Terapan akan diadakan pada hari Sabtu pukul 08:30 WIB di Ruang Kuliah Gedung Teknik Elektro lantai 2.', '2026-09-15', true, false)
ON CONFLICT (id) DO NOTHING;

-- E. Agenda / Kegiatan Awal
INSERT INTO public.events (id, title, description, date, location, is_published)
VALUES
  ('f0000001-0000-0000-0000-000000000001', 'Praktikum Penyambungan Fiber Optic', 'Pelatihan dan praktik langsung fusion splicing serta pengukuran redaman OTDR.', '2026-09-25 09:00:00+00', 'Lab Telekomunikasi PNL', true),
  ('f0000001-0000-0000-0000-000000000002', 'Workshop Antena Mikrostrip & Propagasi Gelombang', 'Sesi workshop perancangan antena mikrostrip dengan perangkat lunak simulasi elektromagnetik.', '2026-10-02 13:30:00+00', 'Gedung Serbaguna PNL', true),
  ('f0000001-0000-0000-0000-000000000003', 'Study Group Persiapan Ujian Tengah Semester (UTS)', 'Diskusi bersama materi Jaringan Data, Transmisi Sinyal, dan Pemrograman Python Jaringan.', '2026-10-10 14:00:00+00', 'Ruang Belajar Perpustakaan', true)
ON CONFLICT (id) DO NOTHING;

-- F. Item Galeri Awal (Placeholder Dokumentasi Tanpa Foto)
INSERT INTO public.gallery_items (id, title, category, date, description, is_published)
VALUES
  ('b0000001-0000-0000-0000-000000000001', 'Praktikum Jaringan Komputer di Lab', 'Praktikum', 'September 2026', 'Sesi konfigurasi perangkat router dan switch manageable Cisco bersama seluruh mahasiswa kelas TRJTA 24.', true),
  ('b0000001-0000-0000-0000-000000000002', 'Kunjungan Industri Telekomunikasi', 'Acara Kampus', 'Agustus 2026', 'Kegiatan pengenalan sistem stasiun bumi dan transmisi satelit bersama tim teknisi telekomunikasi.', true),
  ('b0000001-0000-0000-0000-000000000003', 'Sesi Diskusi Kelompok & Kebersamaan', 'Kegiatan Kelas', 'September 2026', 'Momen belajar kelompok dan sharing session mengenai materi analisis spektrum gelombang radio.', true),
  ('b0000001-0000-0000-0000-000000000004', 'Pengukuran Sinyal Antena Seluler', 'Praktikum', 'September 2026', 'Praktik penggunaan spectrum analyzer dalam mengukur daya dan frekuensi sinyal seluler di area kampus.', true),
  ('b0000001-0000-0000-0000-000000000005', 'Foto Bersama Pengenalan Kampus', 'Foto Bersama', 'Agustus 2026', 'Momen awal kebersamaan seluruh mahasiswa angkatan TRJTA 24 di pelataran Jurusan Teknik Elektro.', true),
  ('b0000001-0000-0000-0000-000000000006', 'Sosialisasi Sertifikasi Kompetensi Jaringan', 'Acara Kampus', 'September 2026', 'Sosialisasi program sertifikasi kompetensi bidang jaringan nirkabel dan fiber optic tingkat nasional.', true)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- PANDUAN PENYIAPAN AKUN ADMIN PERTAMA
-- ==============================================================================
-- 1. Buka Supabase Dashboard -> Authentication -> Users.
-- 2. Klik "Add user" -> "Create user".
--    Masukkan Email (misal: admin@trjta24.com) dan Password yang aman.
-- 3. Buka Supabase SQL Editor, jalankan perintah berikut untuk mengangkat user menjadi ADMIN:
--
--    UPDATE public.profiles
--    SET role = 'admin'
--    WHERE email = 'admin@trjta24.com';
--
-- 4. Verifikasi dengan query:
--    SELECT * FROM public.profiles WHERE role = 'admin';
-- ==============================================================================
