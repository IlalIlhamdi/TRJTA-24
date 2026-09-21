# TRJTA 24

### Website Kelas Teknologi Rekayasa Jaringan Telekomunikasi

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![Cloudflare Pages](https://img.shields.io/badge/Cloudflare_Pages-F38020?style=flat-square&logo=cloudflare&logoColor=white)

TRJTA 24 merupakan website kelas mahasiswa Teknologi Rekayasa Jaringan Telekomunikasi yang digunakan sebagai media informasi, profil anggota, dokumentasi kegiatan, dan identitas digital kelas.

---

## Tentang Project

Website ini dibangun untuk mempererat kebersamaan dan komunikasi seluruh mahasiswa kelas TRJTA 24 (Teknologi Rekayasa Jaringan Telekomunikasi - Politeknik Negeri Lhokseumawe). Melalui platform ini, mahasiswa, dosen, maupun pihak luar dapat melihat profil seluruh anggota kelas, struktur kepengurusan, pengumuman akademik terbaru, agenda kegiatan kelas/praktikum, serta dokumentasi galeri kenangan.

Selain antarmuka publik, website ini dilengkapi dengan **Panel Admin Berbasis Supabase** untuk memudahkan pengurus kelas mengelola konten secara dinamis, cepat, dan aman langsung dari web browser.

---

## Fitur

### Fitur Publik (Aktif)
- **Home**: Halaman utama dengan hero section interaktif, tagline kelas, ringkasan KPI, dan kartu jalan pintas navigasi.
- **Daftar Anggota**: Menampilkan profil lengkap 17 mahasiswa TRJTA 24 dengan fitur pencarian instan (*search filter*), status aktif, serta tautan media sosial (Instagram, GitHub, LinkedIn). Muhammad Haikal terdaftar dengan penanganan NIM khusus (*null-safe*).
- **Informasi Kelas**:
  - **Struktur Pengurus**: Bagan kepengurusan kelas (Ketua, Wakil Ketua, Sekretaris, Bendahara) beserta kontak resminya.
  - **Pengumuman**: Papan pengumuman akademik, perkuliahan, dan tugas kelas dengan label prioritas.
  - **Agenda**: Kalender kegiatan kelas, jadwal praktikum, dan tenggat penting.
- **Galeri**: Dokumentasi foto kegiatan praktikum dan kebersamaan kelas dengan filter kategori serta penampil foto (*lightbox*).
- **Tentang TRJTA 24**: Informasi jurusan, visi misi kelas, nilai kebersamaan, dan identitas resmi.
- **Responsive Design**: Tampilan fleksibel dan proporsional untuk seluruh ukuran layar (ponsel pintar, tablet, dan desktop) dilengkapi *mobile drawer navigation*.
- **Optimasi SEO**: Dilengkapi `robots.txt`, `sitemap.xml`, Open Graph, Twitter Cards, dan Schema.org JSON-LD untuk mempermudah perayapan mesin pencari Google.

### Fitur Admin Panel (Aktif)
- **Admin Authentication**: Sistem masuk (*login*) aman berbasis Supabase Auth dengan verifikasi peran (*role-based access control*).
- **Admin Dashboard**: Panel kendali statistik ringkas (jumlah anggota, pengurus, pengumuman, agenda, galeri).
- **CRUD Anggota**: Tambah, ubah data (*edit*), dan hapus data anggota kelas.
- **CRUD Pengurus**: Kelola struktur jabatan dan penugasan pengurus kelas.
- **CRUD Pengumuman**: Publikasikan atau arsipkan pengumuman dengan tingkat prioritas (Penting, Info, Akademik).
- **CRUD Agenda**: Kelola jadwal kegiatan, praktikum, dan acara mendatang.
- **CRUD Galeri**: Tambah dan atur dokumentasi galeri kegiatan kelas.
- **Pengaturan Website**: Panel kontrol untuk mengubah nama website, pengumuman berjalan, kontak resmi, dan tautan sosial media kelas.

---

## Planned Features

Fitur yang direncanakan untuk tahap pengembangan berikutnya:
- **Upload Foto Anggota**: Integrasi langsung formulir unggah gambar ke Supabase Storage.
- **Supabase Storage Management**: Manajemen penyimpanan file mandiri untuk foto kegiatan resolusi tinggi.
- **Album Galeri Interaktif**: Pengelompokan dokumentasi foto berdasarkan album dan tahun akademik.
- **Notifikasi Terjadwal**: Pengingat otomatis agenda praktikum dan tugas kelas.

---

## Teknologi

Website ini dikembangkan menggunakan teknologi berbasis web standar yang ringan, cepat, dan tidak memerlukan proses kompilasi (*build-step*) yang rumit:

- **HTML5**: Struktur semantik yang bersih dan ramah mesin pencari (SEO-friendly).
- **Vanilla CSS3**: Sistem tata letak modern menggunakan Flexbox, CSS Grid, CSS Variables, efek glassmorphism, serta transisi interaktif.
- **JavaScript (ES6+)**: Logika aplikasi modular sisi klien (*Single Page Application* behavior).
- **Supabase**: Backend-as-a-Service (BaaS) berbasis PostgreSQL untuk basis data, otentikasi admin, dan keamanan data tingkat baris (Row Level Security).
- **Cloudflare Pages / Vercel**: Layanan hosting statis global dengan CDN berkecepatan tinggi dan otomatisasi CI/CD dari repositori GitHub.
- **Google Fonts**: Tipografi modern menggunakan keluarga fon *Inter* dan *Poppins*.

---

## Struktur Project

```text
TRJTA-24/
├── admin/
│   ├── dashboard/
│   │   └── index.html       # Antarmuka Dashboard Admin & Modul CRUD
│   ├── login/
│   │   └── index.html       # Halaman Masuk (Login) Otentikasi Admin
│   └── index.html           # Pengalihan rute otomatis ke /admin/login
├── assets/
│   ├── css/
│   │   ├── admin.css        # Stylesheet khusus panel admin & dashboard
│   │   └── style.css        # Stylesheet utama website publik
│   ├── icons/
│   │   └── favicon.png      # Favicon resmi website
│   ├── images/
│   │   ├── gallery/         # Aset foto galeri kegiatan
│   │   └── trjta24-logo.png # Logo resmi TRJTA 24
│   └── js/
│       ├── admin.js         # Logika pengontrol panel admin & CRUD
│       ├── config.js        # Konfigurasi client Supabase (URL & Anon Key)
│       ├── data.js          # Data cadangan lokal awal (fallback data)
│       ├── main.js          # Navigasi SPA, render data, filter, & interaksi
│       └── supabase.js      # Klien API Supabase (AuthAPI, PublicAPI, AdminAPI)
├── supabase/
│   └── schema.sql           # Skema tabel PostgreSQL, RLS Policies, & Seed Data
├── .env.example             # Contoh format environment variable (tanpa credential)
├── .gitignore               # Daftar berkas & folder yang diabaikan oleh Git
├── CHANGELOG.md             # Riwayat catatan perubahan versi project
├── CONTRIBUTING.md          # Panduan berkontribusi untuk anggota kelas
├── index.html               # Halaman utama website publik TRJTA 24
├── README.md                # Dokumentasi utama project
├── robots.txt               # Instruksi perayapan robot mesin pencari
├── sitemap.xml              # Peta situs untuk Google Search Console
└── vercel.json              # Konfigurasi routing & URL bersih
```

---

## Cara Menjalankan Project

### 1. Clone Repository
Buka terminal atau Git Bash, lalu jalankan:

```bash
git clone https://github.com/IlalIlhamdi/TRJTA-24.git
cd TRJTA-24
```

### 2. Konfigurasi Kredensial Supabase
Buka file `assets/js/config.js` di editor kode (misal VS Code), lalu sesuaikan URL dan Anon Key project Supabase Anda:

```javascript
const SUPABASE_CONFIG = {
  url: 'https://zxendvmqadzqrdvnvpqw.supabase.co',
  anonKey: 'sb_publishable_du5-3G0bsb-jE_aARC7GEg_0AHOar2v'
};
```

> **Catatan**: HANYA masukkan **anon public key** (`sb_publishable_...`). JANGAN PERNAH memasukkan `service_role` key ke dalam file ini!

### 3. Menjalankan Website Secara Lokal
Karena proyek ini berbasis web statis standar, Anda **tidak memerlukan `npm install`**. Anda dapat menjalankannya dengan beberapa opsi sederhana:

* **Opsi A (VS Code Live Server)**:
  Buka folder project di VS Code, klik kanan pada file `index.html`, lalu pilih **"Open with Live Server"**.
* **Opsi B (Laragon / XAMPP)**:
  Tempatkan folder di `c:/laragon/www/TRJTA24` atau `htdocs`, lalu buka melalui peramban: `http://localhost/TRJTA24`.
* **Opsi C (Python HTTP Server)**:
  Jalankan perintah berikut di terminal:
  ```bash
  python -m http.server 8000
  ```
  Kemudian akses `http://localhost:8000`.

---

## Environment Variables

Kredensial sensitif tidak boleh dimasukkan langsung ke repositori publik.

Jika Anda menggunakan build tool, platform CI/CD, atau pipeline deployment, gunakan file `.env` dengan format:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-public-key-here
```

### Langkah Penggunaan:
1. Salin file template:
   ```bash
   cp .env.example .env
   ```
2. Buka file `.env` dan masukkan kredensial Supabase project Anda.
3. Pastikan file `.env` **tidak di-commit** ke repositori Git (sudah otomatis dilindungi oleh `.gitignore`).

---

## Deployment

Proyek ini dirancang dengan alur kerja modern:

```text
GitHub
  ↓
Cloudflare Pages / Vercel
  ↓
Website TRJTA 24 (Frontend)
  ↓
Supabase (Database & Auth)
```

### Panduan Deployment ke Cloudflare Pages:
1. Masuk ke dashboard [Cloudflare Pages](https://pages.cloudflare.com/).
2. Pilih menu **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
3. Pilih repositori **`TRJTA-24`**.
4. Pada menu pengaturan build:
   - **Framework preset**: `None`
   - **Build command**: *(kosongkan)*
   - **Build output directory**: `.` *(titik atau biarkan kosong untuk root)*
5. Klik **Save and Deploy**.
6. Website akan langsung aktif secara global dengan proteksi HTTPS otomatis.

---

## Security

Keamanan data adalah prioritas utama:

- **Jangan Commit `.env`**: File konfigurasi lokal dan rahasia tidak boleh masuk ke riwayat Git.
- **Jangan Expose `service_role` Key**: Kunci master `service_role` memiliki hak penuh untuk mengabaikan keamanan basis data. Kunci ini dilarang keras diletakkan di frontend.
- **Supabase Row Level Security (RLS)**: Seluruh tabel basis data (`members`, `class_roles`, `announcements`, `events`, `gallery`, `site_settings`) dilindungi kebijakan RLS. Pengunjung publik hanya memiliki izin baca (*read-only*) untuk konten terbit, sedangkan hak tulis/ubah (*write/edit/delete*) dibatasi secara ketat hanya untuk admin yang sah.
- **Frontend Safe Key**: Frontend hanya diperbolehkan berkomunikasi menggunakan *publishable/anon key*.

---

## Kontributor

Project ini dikembangkan dan dikelola secara bersama oleh mahasiswa kelas **TRJTA 24**:
- Pengembang Utama & Pengelola Repositori: **Ilal Ilhamdi** (`IlalIlhamdi`)
- Keluarga Besar Mahasiswa TRJTA 24

---

## License

Project ini dibuat untuk kebutuhan kelas TRJTA 24.

---

## Copyright

© 2026 TRJTA 24  
Teknologi Rekayasa Jaringan Telekomunikasi
