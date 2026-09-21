# Changelog

Semua perubahan penting pada project TRJTA 24 dicatat di file ini.

Format pencatatan berpedoman pada [Keep a Changelog](https://keepachangelog.com/id-ID/1.0.0/) dan mengikuti standar penomoran versi [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### Added
- Rencana integrasi formulir unggah gambar langsung ke Supabase Storage.
- Rencana sistem manajemen album foto kegiatan kelas.

### Changed
- 

### Fixed
- 

---

## [1.0.0] - 2026-09-21

### Added
- **Website Publik TRJTA 24**:
  - Halaman Home dengan hero section interaktif, tagline resmi kelas, dan kartu rangkuman KPI.
  - Halaman Anggota yang memuat 17 profil mahasiswa TRJTA 24 lengkap dengan fitur pencarian real-time dan tautan sosial media.
  - Penanganan khusus NIM bernilai `NULL` untuk mahasiswa Muhammad Haikal agar tetap tersaji rapi dan aman.
  - Halaman Informasi mencakup bagan kepengurusan kelas, papan pengumuman prioritas, dan jadwal agenda kegiatan.
  - Halaman Galeri foto dokumentasi praktikum dan aktivitas kelas dilengkapi fitur filter kategori.
  - Halaman Tentang memuat visi, misi, dan identitas kelas TRJTA 24.
  - Sistem tata letak responsif penuh (*mobile navigation drawer*) untuk perangkat ponsel, tablet, dan desktop.
- **Backend Supabase & Keamanan Database**:
  - Skema PostgreSQL lengkap (`profiles`, `members`, `class_roles`, `announcements`, `events`, `gallery`, `site_settings`).
  - Implementasi Row Level Security (RLS) pada seluruh tabel untuk menjamin integritas data publik vs admin.
  - Otentikasi admin berbasis Supabase Auth dengan hak akses peran (*role-based authorization*).
- **Panel Admin**:
  - Halaman login admin modern dengan validasi kredensial langsung ke Supabase.
  - Dashboard admin interaktif untuk mengelola (CRUD) Anggota, Pengurus, Pengumuman, Agenda, Galeri, dan Pengaturan Website.
- **Optimasi SEO & Deployment**:
  - Berkas `robots.txt` dan `sitemap.xml` untuk perayapan Google Search.
  - Meta tags, Open Graph, Twitter Cards, serta Schema.org JSON-LD Structured Data.
  - Konfigurasi routing bersih (`vercel.json`) dan integrasi GitHub CI/CD.
  - Berkas dokumentasi repositori (`README.md`, `.gitignore`, `.env.example`, `CONTRIBUTING.md`, `CHANGELOG.md`).

### Fixed
- Memperbaiki kontras tombol sekunder hero section ("Lihat Informasi") dari transparan menjadi berlatar solid putih dengan garis tepi 2px Dark Navy yang tegas.
