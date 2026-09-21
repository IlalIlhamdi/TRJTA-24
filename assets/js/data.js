/**
 * TRJTA 24 - Data Store
 * File terpisah untuk seluruh data profil, anggota, pengumuman, agenda, dan galeri.
 * Memudahkan penambahan, pengeditan, atau pembaharuan data tanpa merusak struktur UI.
 */

const TRJTA24_DATA = {
  // Identitas Website Resmi
  siteInfo: {
    name: "TRJTA 24",
    fullName: "Teknologi Rekayasa Jaringan Telekomunikasi Angkatan 2024",
    program: "Teknologi Rekayasa Jaringan Telekomunikasi",
    degree: "Sarjana Terapan (D4)",
    department: "Jurusan Teknik Elektro",
    institution: "Politeknik Negeri Lhokseumawe",
    tagline: "Connect • Learn • Grow Together",
    description: "TRJTA 24 merupakan keluarga mahasiswa Teknologi Rekayasa Jaringan Telekomunikasi yang belajar, berkembang, berkolaborasi, dan membangun kebersamaan bersama.",
    aboutClass: "TRJTA 24 adalah kelas mahasiswa Teknologi Rekayasa Jaringan Telekomunikasi yang memiliki semangat untuk belajar, berkembang, berkolaborasi, serta membangun kebersamaan.",
    togethernessQuote: "Kami percaya bahwa proses perkuliahan bukan hanya tentang mempelajari teknologi dan telekomunikasi, tetapi juga tentang membangun pengalaman, kerja sama, persahabatan, dan kebersamaan.",
    logoPath: "assets/images/trjta24-logo.png",
    totalMembers: 17,
    memberBadge: "17 Mahasiswa • 1 Keluarga • TRJTA 24"
  },

  // 17 Mahasiswa TRJTA 24 (Persis sesuai data resmi)
  members: [
    { id: 1, name: "Aqil Ocean Difra", nim: "2024203020028", role: "Komisaris Kelas", photo: "" },
    { id: 2, name: "Durratul Hikmah", nim: "2024203020011", role: "Mahasiswa", photo: "" },
    { id: 3, name: "Farhan Alfarisyi", nim: "2024203020025", role: "Mahasiswa", photo: "" },
    { id: 4, name: "Firlita Afianti", nim: "2024203020009", role: "Mahasiswa", photo: "" },
    { id: 5, name: "Ilal Ilhamdi", nim: "2024203020001", role: "Mahasiswa", photo: "" },
    { id: 6, name: "Khairul Fajar Sidiq", nim: "2024203020019", role: "Mahasiswa", photo: "" },
    { id: 7, name: "Lunna Auamara", nim: "2024203020032", role: "Mahasiswa", photo: "" },
    { id: 8, name: "Muhammad Halfi Al Barizi", nim: "2024203020022", role: "Mahasiswa", photo: "" },
    { id: 9, name: "Muhammad Rais", nim: "2024203020029", role: "Mahasiswa", photo: "" },
    { id: 10, name: "Nazar Al Farabi", nim: "2024203020036", role: "Mahasiswa", photo: "" },
    { id: 11, name: "Nesya Zikriya", nim: "2024203020020", role: "Mahasiswa", photo: "" },
    { id: 12, name: "Rahmat Haikal", nim: "2024203020008", role: "Wakil Komisaris", photo: "" },
    { id: 13, name: "Renka Laura", nim: "2024203020016", role: "Bendahara", photo: "" },
    { id: 14, name: "Sarah Fonna", nim: "2024203020003", role: "Mahasiswa", photo: "" },
    { id: 15, name: "Suheil Maulana", nim: "2024203020006", role: "Mahasiswa", photo: "" },
    { id: 16, name: "Syawal Fitriyadi", nim: "2024203020031", role: "Mahasiswa", photo: "" },
    { id: 17, name: "Muhammad Haikal", nim: "Belum diberikan", role: "Mahasiswa", photo: "" }
  ],

  // 3 Pengurus Kelas (Komisaris, Wakil, Bendahara)
  officers: [
    {
      id: 1,
      title: "Komisaris",
      name: "Aqil Ocean Difra",
      nim: "2024203020028",
      photo: ""
    },
    {
      id: 2,
      title: "Wakil",
      name: "Rahmat Haikal",
      nim: "2024203020008",
      photo: ""
    },
    {
      id: 3,
      title: "Bendahara",
      name: "Renka Laura",
      nim: "2024203020016",
      photo: ""
    }
  ],

  // Pengumuman Kelas Terbaru (Maksimal 3 untuk preview di Home)
  announcements: [
    {
      id: 1,
      title: "Perubahan Jadwal Perkuliahan",
      date: "21 September 2026",
      category: "Akademik",
      description: "Informasi terbaru mengenai penyesuaian jadwal ruang praktikum dan perkuliahan teori semester ganjil TRJTA 24."
    },
    {
      id: 2,
      title: "Persiapan Praktikum Jaringan Komputer Lanjut",
      date: "18 September 2026",
      category: "Praktikum",
      description: "Seluruh mahasiswa diharapkan mempersiapkan topologi simulasi router Cisco dan mengunduh jobsheet modul 3."
    },
    {
      id: 3,
      title: "Batas Akhir Pengumpulan Laporan Antena",
      date: "15 September 2026",
      category: "Tugas",
      description: "Pengumpulan laporan praktikum antena dipole dan pengukuran VSWR diserahkan ke asisten laboratorium tepat waktu."
    }
  ],

  // Agenda Kegiatan Kelas
  events: [
    {
      id: 1,
      title: "Kegiatan Kelas TRJTA 24",
      date: "25 September 2026",
      time: "14.00 - 17.00 WIB",
      location: "Politeknik Negeri Lhokseumawe",
      description: "Pertemuan konsolidasi seluruh mahasiswa TRJTA 24 untuk evaluasi perkuliahan dan persiapan agenda bersama."
    },
    {
      id: 2,
      title: "Workshop Splicing Fiber Optic & OTDR",
      date: "02 Oktober 2026",
      time: "08.30 - 12.00 WIB",
      location: "Lab. Transmisi & Fiber Optic (L23)",
      description: "Sesi hands-on teknik penyambungan kabel fiber optik, pengukuran redaman, dan troubleshooting jaringan optik."
    },
    {
      id: 3,
      title: "Study Group Persiapan Ujian Tengah Semester",
      date: "10 Oktober 2026",
      time: "10.00 - 15.00 WIB",
      location: "Gedung III Teknik Elektro Lt. 2",
      description: "Belajar bersama mata kuliah Sistem Komunikasi Seluler, Antena Propagasi, dan Jaringan Komputer."
    }
  ],

  // Galeri Dokumentasi (Kategori: Semua | Kegiatan Kelas | Praktikum | Acara Kampus | Foto Bersama)
  // Sesuai instruksi: menggunakan container/badge placeholder terstruktur tanpa foto asli dulu
  gallery: [
    {
      id: 1,
      title: "Praktikum Pengukuran Antena & Propagasi",
      date: "12 September 2026",
      category: "Praktikum",
      description: "Dokumentasi sesi pengujian parameter antena, pola radiasi, dan analisis frekuensi di Lab HF & Propagasi.",
      badge: "Lab Praktikum"
    },
    {
      id: 2,
      title: "Simulasi Jaringan & Konfigurasi Switch VLAN",
      date: "08 September 2026",
      category: "Praktikum",
      description: "Kegiatan hands-on mahasiswa dalam membangun arsitektur jaringan lokal dan segmentasi keamanan subnet.",
      badge: "Lab Jaringan"
    },
    {
      id: 3,
      title: "Konsolidasi & Diskusi Perdana Semester Ganjil",
      date: "01 September 2026",
      category: "Kegiatan Kelas",
      description: "Momen berkumpul bersama mahasiswa kelas TRJTA 24 untuk menyepakati jadwal kelompok dan struktur piket.",
      badge: "Pertemuan Kelas"
    },
    {
      id: 4,
      title: "Partisipasi Kegiatan Jurusan Teknik Elektro",
      date: "25 Agustus 2026",
      category: "Acara Kampus",
      description: "Keikutsertaan perwakilan TRJTA 24 dalam seminar pengenalan teknologi telekomunikasi generasi 5G/6G.",
      badge: "Acara Kampus"
    },
    {
      id: 5,
      title: "Dokumentasi Bersama Usai Jam Kuliah",
      date: "20 Agustus 2026",
      category: "Foto Bersama",
      description: "Momen kebersamaan dan kekeluargaan mahasiswa TRJTA 24 di pelataran Gedung Teknik Elektro PNL.",
      badge: "Kebersamaan"
    },
    {
      id: 6,
      title: "Praktikum Pengkabelan UTP & Pengujian Sinyal",
      date: "15 Agustus 2026",
      category: "Praktikum",
      description: "Praktik pembuatan kabel straight-through dan crossover serta pengujian throughput transfer data.",
      badge: "Lab Praktikum"
    }
  ]
};

// Pastikan data dapat diakses baik di browser maupun di Node.js jika diperlukan
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TRJTA24_DATA;
}
