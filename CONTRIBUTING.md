# Kontribusi TRJTA 24

Terima kasih telah meluangkan waktu untuk berkontribusi pada pengembangan website kelas **TRJTA 24**! Panduan ini dibuat untuk memudahkan seluruh anggota kelas berkolaborasi secara rapi dan terstruktur melalui GitHub.

---

## Cara Berkontribusi

Ikuti langkah-langkah alur kerja standar berikut:

### 1. Clone Repository
Salin repositori ke komputer lokal Anda:
```bash
git clone https://github.com/IlalIlhamdi/TRJTA-24.git
cd TRJTA-24
```

### 2. Buat Branch Baru
Buat branch terpisah dari `main` sebelum memulai pekerjaan:
```bash
git checkout -b feature/nama-fitur
```
atau untuk perbaikan kendala:
```bash
git checkout -b fix/nama-perbaikan
```

### 3. Lakukan Perubahan
Edit file sesuai kebutuhan fitur atau perbaikan yang ingin Anda kerjakan. Pastikan kode tetap rapi dan tidak merusak fitur yang sudah ada.

### 4. Commit Perubahan
Simpan perubahan dengan pesan commit yang deskriptif:
```bash
git add .
git commit -m "feat: nama perubahan yang dilakukan"
```

### 5. Push Branch ke GitHub
Kirim branch Anda ke repositori jarak jauh (*remote repository*):
```bash
git push -u origin feature/nama-fitur
```

### 6. Buat Pull Request (PR)
Buka repositori di GitHub, lalu klik tombol **"Compare & pull request"**. Berikan penjelasan singkat mengenai apa yang Anda tambahkan atau perbaiki, lalu ajukan PR untuk ditinjau oleh pengelola repositori.

---

## Contoh Penamaan Branch

Gunakan format penamaan yang jelas dan menggunakan huruf kecil:
- `feature/tambah-tabel-agenda`
- `feature/desain-kartu-anggota`
- `fix/perbaikan-tombol-informasi`
- `fix/responsif-navbar-mobile`
- `docs/pembaruan-dokumentasi`

---

## Standar Pesan Commit

Gunakan awalan konvensional (*conventional commits*) agar riwayat perubahan mudah dipahami:
- `feat: menambahkan halaman anggota`
- `fix: memperbaiki navbar mobile`
- `docs: memperbarui README dan panduan kontribusi`
- `style: merapikan tata letak tombol hero section`
- `refactor: mengoptimalkan fungsi pembacaan data Supabase`

---

## Aturan Penting

Untuk menjaga stabilitas dan keamanan repositori kelas, harap perhatikan aturan berikut:

1. **Dilarang Commit Kredensial Sensitif**: Jangan pernah memasukkan file `.env`, password database, token rahasia, atau `service_role` key ke dalam riwayat commit.
2. **Jangan Mengubah Branch `main` Secara Langsung**: Jika bekerja secara tim, selalu gunakan branch fitur dan buat Pull Request.
3. **Uji Coba Sebelum Membuat PR**: Pastikan seluruh halaman website dapat dibuka dan berfungsi dengan normal tanpa pesan error pada peramban.
4. **Gunakan Pesan Commit yang Jelas**: Hindari pesan umum seperti *"update"* atau *"fix bug"*. Jelaskan secara spesifik apa yang Anda ubah.

---

Mari bersama-sama membangun dan mengembangkan identitas digital kelas **TRJTA 24**!
