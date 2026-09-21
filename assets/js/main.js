/**
 * TRJTA 24 - Main Application Logic
 * Mengatur Router SPA (Home, Anggota, Informasi, Galeri, Tentang),
 * Pencarian Real-Time Anggota, Filter Galeri, Lightbox Modal, dan Navigasi Mobile.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Pastikan data tersedia
  if (typeof TRJTA24_DATA === 'undefined') {
    console.error('TRJTA24_DATA tidak ditemukan! Pastikan assets/js/data.js dimuat sebelum main.js.');
    return;
  }

  let { siteInfo, members, officers, announcements, events, gallery } = TRJTA24_DATA;

  // Elemen DOM Utama
  const navbar = document.getElementById('siteNavbar');
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerBackdrop = document.getElementById('drawerBackdrop');
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
  const viewSections = document.querySelectorAll('.view-section');

  // =========================================================================
  // 1. ROUTER SPA (HASH-BASED NAVIGATION)
  // =========================================================================
  const validViews = ['home', 'anggota', 'informasi', 'galeri', 'tentang'];

  function switchView(viewName, updateHash = true) {
    const target = validViews.includes(viewName) ? viewName : 'home';

    // Perbarui section yang aktif
    viewSections.forEach((section) => {
      if (section.id === `view-${target}`) {
        section.classList.add('active');
      } else {
        section.classList.remove('active');
      }
    });

    // Perbarui indikator menu aktif di navbar & drawer
    navLinks.forEach((link) => {
      const linkView = link.getAttribute('data-view');
      if (linkView === target) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Perbarui URL Hash jika diminta
    if (updateHash && window.location.hash !== `#${target}`) {
      window.location.hash = target;
    }

    // Perbarui judul halaman di browser tab
    const viewTitles = {
      home: 'TRJTA 24 — Profil Kelas Resmi Teknologi Rekayasa Jaringan Telekomunikasi',
      anggota: 'Anggota TRJTA 24 — 17 Mahasiswa • 1 Keluarga',
      informasi: 'Informasi & Agenda TRJTA 24',
      galeri: 'Galeri Dokumentasi TRJTA 24',
      tentang: 'Tentang TRJTA 24 — Profil & Struktur Pengurus'
    };
    document.title = viewTitles[target] || 'TRJTA 24';

    // Tutup mobile drawer jika terbuka
    closeMobileDrawer();

    // Scroll mulus ke atas
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Tangani klik link navigasi
  document.querySelectorAll('[data-view]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const targetView = el.getAttribute('data-view');
      if (targetView) {
        switchView(targetView);
      }
    });
  });

  // Tangani navigasi via browser Back/Forward (hashchange)
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    switchView(hash, false);
  });

  // =========================================================================
  // 2. NAVBAR STICKY & MOBILE DRAWER
  // =========================================================================
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  function toggleMobileDrawer() {
    const isOpen = hamburgerBtn.classList.contains('is-active');
    if (isOpen) {
      closeMobileDrawer();
    } else {
      hamburgerBtn.classList.add('is-active');
      mobileDrawer.classList.add('open');
      if (drawerBackdrop) drawerBackdrop.classList.add('open');
      document.body.style.overflow = 'hidden'; // Mencegah scrolling saat menu terbuka
    }
  }

  function closeMobileDrawer() {
    hamburgerBtn.classList.remove('is-active');
    mobileDrawer.classList.remove('open');
    if (drawerBackdrop) drawerBackdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', toggleMobileDrawer);
  }

  if (drawerBackdrop) {
    drawerBackdrop.addEventListener('click', closeMobileDrawer);
  }

  // Tutup drawer jika jendela di-resize ke ukuran desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      closeMobileDrawer();
    }
  });

  // =========================================================================
  // 3. UTILITY & HELPER FUNCTIONS
  // =========================================================================
  // Mengambil inisial nama (maks 2 huruf) untuk avatar placeholder
  function getInitials(name) {
    if (!name) return 'TR';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  // Escape HTML untuk mencegah injeksi karakter aneh
  function escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // =========================================================================
  // 4. RENDERING: HOME SECTION
  // =========================================================================
  function renderHomeView() {
    // Dynamic KPI Badge
    const memberKpiBadge = document.querySelector('.summary-card[data-view="anggota"] .card-kpi-badge');
    if (memberKpiBadge) {
      memberKpiBadge.textContent = `${members.length} Mahasiswa`;
    }

    // 1. Informasi Terbaru (Maks 3 item)
    const homeInfoContainer = document.getElementById('homeLatestInfo');
    if (homeInfoContainer) {
      const previewAnnouncements = announcements.slice(0, 3);
      homeInfoContainer.innerHTML = previewAnnouncements
        .map((item) => `
          <div class="info-card">
            <div class="info-card-meta">
              <span class="info-category-pill">${escapeHTML(item.category || 'Informasi')}</span>
              <span class="info-date">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                ${escapeHTML(item.date)}
              </span>
            </div>
            <h3 class="info-card-title">${escapeHTML(item.title)}</h3>
            <p class="info-card-desc">${escapeHTML(item.description)}</p>
            <div class="info-card-badge">
              <span style="color: var(--color-accent-red);">●</span> Pengumuman Resmi
            </div>
          </div>
        `)
        .join('');
    }

    // 2. Galeri Terbaru (Maks 3 item)
    const homeGalleryContainer = document.getElementById('homeLatestGallery');
    if (homeGalleryContainer) {
      const previewGallery = gallery.slice(0, 3);
      homeGalleryContainer.innerHTML = previewGallery
        .map((item) => `
          <div class="gallery-card" data-gallery-id="${item.id}">
            <div class="gallery-placeholder-thumb">
              <span class="gallery-thumb-tag">${escapeHTML(item.category)}</span>
              <div class="gallery-thumb-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
              </div>
              <span style="font-size: 0.78rem; letter-spacing: 0.5px; opacity: 0.9; text-transform: uppercase;">${escapeHTML(item.badge || 'Dokumentasi')}</span>
            </div>
            <div class="gallery-card-body">
              <h3 class="gallery-card-title">${escapeHTML(item.title)}</h3>
              <div class="gallery-card-date">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                ${escapeHTML(item.date)}
              </div>
              <p class="gallery-card-desc">${escapeHTML(item.description)}</p>
              <div class="gallery-card-action">
                <span>Lihat Detail</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </div>
            </div>
          </div>
        `)
        .join('');
    }
  }

  // =========================================================================
  // 5. RENDERING: ANGGOTA (17 MAHASISWA & REAL-TIME SEARCH)
  // =========================================================================
  const membersGrid = document.getElementById('membersGrid');
  const memberSearchInput = document.getElementById('memberSearchInput');
  const searchResultCount = document.getElementById('searchResultCount');

  function renderMembers(filteredMembers) {
    if (!membersGrid) return;

    if (searchResultCount) {
      searchResultCount.textContent = `Menampilkan ${filteredMembers.length} dari ${members.length} mahasiswa`;
    }

    if (filteredMembers.length === 0) {
      membersGrid.innerHTML = `
        <div class="empty-search-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <h4 style="margin-top: 14px; color: var(--color-primary-navy);">Tidak Ada Anggota yang Cocok</h4>
          <p>Coba gunakan kata kunci pencarian nama atau NIM yang lain.</p>
        </div>
      `;
      return;
    }

    membersGrid.innerHTML = filteredMembers
      .map((member) => {
        const initials = getInitials(member.name);
        const isOfficer = member.role && member.role !== 'Mahasiswa';
        const isPendingNim = member.nim === 'Belum diberikan';

        return `
          <div class="member-card">
            ${isOfficer ? `<span class="member-card-badge officer">${escapeHTML(member.role)}</span>` : `<span class="member-card-badge">TRJTA 24</span>`}
            
            <div class="member-avatar-wrap">
              <span class="member-avatar-initials">${initials}</span>
            </div>

            <h3 class="member-name">${escapeHTML(member.name)}</h3>

            <div class="member-nim-pill ${isPendingNim ? 'pending' : ''}">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              <span>NIM: ${escapeHTML(member.nim)}</span>
            </div>
          </div>
        `;
      })
      .join('');
  }

  // Real-time Search Handler
  if (memberSearchInput) {
    memberSearchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      if (!query) {
        renderMembers(members);
        return;
      }

      const filtered = members.filter((m) => {
        const matchName = m.name.toLowerCase().includes(query);
        const matchNim = m.nim.toLowerCase().includes(query);
        return matchName || matchNim;
      });

      renderMembers(filtered);
    });
  }

  // =========================================================================
  // 6. RENDERING: INFORMASI (PENGUMUMAN & AGENDA KELAS)
  // =========================================================================
  function renderInfoView() {
    // 1. Pengumuman Lengkap
    const fullAnnouncementsContainer = document.getElementById('fullAnnouncementsList');
    if (fullAnnouncementsContainer) {
      fullAnnouncementsContainer.innerHTML = announcements
        .map((item) => `
          <div class="info-card">
            <div class="info-card-meta">
              <span class="info-category-pill">${escapeHTML(item.category || 'Akademik')}</span>
              <span class="info-date">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                ${escapeHTML(item.date)}
              </span>
            </div>
            <h3 class="info-card-title">${escapeHTML(item.title)}</h3>
            <p class="info-card-desc">${escapeHTML(item.description)}</p>
            <div class="info-card-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-red)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              <span>Resmi Kelas TRJTA 24</span>
            </div>
          </div>
        `)
        .join('');
    }

    // 2. Agenda Kelas
    const agendaListContainer = document.getElementById('agendaEventsList');
    if (agendaListContainer) {
      agendaListContainer.innerHTML = events
        .map((evt) => `
          <div class="agenda-card">
            <div class="agenda-header">
              <span class="agenda-date-badge">${escapeHTML(evt.date)}</span>
              <span style="font-size: 0.8rem; font-weight: 600; color: var(--color-text-light);">${escapeHTML(evt.time || 'WIB')}</span>
            </div>
            <h3 class="agenda-title">${escapeHTML(evt.title)}</h3>
            <div class="agenda-location">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-red)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <span>${escapeHTML(evt.location)}</span>
            </div>
            <p class="agenda-desc">${escapeHTML(evt.description)}</p>
          </div>
        `)
        .join('');
    }
  }

  // =========================================================================
  // 7. RENDERING: GALERI & LIGHTBOX
  // =========================================================================
  const fullGalleryGrid = document.getElementById('fullGalleryGrid');
  const galleryFilterBtns = document.querySelectorAll('.filter-btn');
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxCloseBtn = document.getElementById('lightboxCloseBtn');

  function renderGallery(filterCategory = 'Semua') {
    if (!fullGalleryGrid) return;

    const filteredItems = filterCategory === 'Semua'
      ? gallery
      : gallery.filter((item) => item.category === filterCategory);

    fullGalleryGrid.innerHTML = filteredItems
      .map((item) => `
        <div class="gallery-card" data-gallery-id="${item.id}">
          <div class="gallery-placeholder-thumb">
            <span class="gallery-thumb-tag">${escapeHTML(item.category)}</span>
            <div class="gallery-thumb-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            </div>
            <span style="font-size: 0.78rem; letter-spacing: 0.5px; opacity: 0.9; text-transform: uppercase;">${escapeHTML(item.badge || 'Dokumentasi')}</span>
          </div>
          <div class="gallery-card-body">
            <h3 class="gallery-card-title">${escapeHTML(item.title)}</h3>
            <div class="gallery-card-date">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              ${escapeHTML(item.date)}
            </div>
            <p class="gallery-card-desc">${escapeHTML(item.description)}</p>
            <div class="gallery-card-action">
              <span>Buka Lightbox</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </div>
          </div>
        </div>
      `)
      .join('');
  }

  // Filter Buttons Handler
  galleryFilterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      galleryFilterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const category = btn.getAttribute('data-filter');
      renderGallery(category);
    });
  });

  // Lightbox Modal Handlers
  function openLightbox(galleryItem) {
    if (!lightboxModal || !galleryItem) return;

    document.getElementById('lightboxCategory').textContent = galleryItem.category;
    document.getElementById('lightboxTitle').textContent = galleryItem.title;
    document.getElementById('lightboxDate').textContent = galleryItem.date;
    document.getElementById('lightboxDesc').textContent = galleryItem.description;
    document.getElementById('lightboxBadge').textContent = galleryItem.badge || 'Dokumentasi Kelas';

    lightboxModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightboxModal) return;
    lightboxModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Event delegation untuk klik item galeri (baik di Home maupun di Halaman Galeri)
  document.addEventListener('click', (e) => {
    const card = e.target.closest('.gallery-card');
    if (card) {
      const id = String(card.getAttribute('data-gallery-id') || '');
      const foundItem = gallery.find((g) => String(g.id) === id);
      if (foundItem) {
        openLightbox(foundItem);
      }
    }
  });

  if (lightboxCloseBtn) {
    lightboxCloseBtn.addEventListener('click', closeLightbox);
  }

  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) {
        closeLightbox();
      }
    });
  }

  // Tutup modal dengan tombol keyboard Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeLightbox();
      closeMobileDrawer();
    }
  });

  // =========================================================================
  // 8. RENDERING: TENTANG (STRUKTUR PENGURUS KELAS)
  // =========================================================================
  function renderAboutView() {
    const officersGrid = document.getElementById('officersGrid');
    if (!officersGrid) return;

    officersGrid.innerHTML = officers
      .map((officer) => {
        const initials = getInitials(officer.name);
        return `
          <div class="officer-card">
            <span class="officer-badge-role">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              ${escapeHTML(officer.title)}
            </span>

            <div class="officer-avatar-frame">
              <span class="officer-initials">${initials}</span>
            </div>

            <h3 class="officer-name">${escapeHTML(officer.name)}</h3>
            <span class="officer-nim">NIM: ${escapeHTML(officer.nim)}</span>
          </div>
        `;
      })
      .join('');
  }

  // =========================================================================
  // 9. SINKRONISASI DATA DARI SUPABASE (DENGAN FALLBACK STATIS)
  // =========================================================================
  async function loadFromSupabase() {
    if (typeof isSupabaseConfigured !== 'function' || !isSupabaseConfigured() || !window.PublicAPI) {
      return;
    }

    try {
      const [sbMembers, sbRoles, sbAnnouncements, sbEvents, sbGallery, sbSettings] = await Promise.allSettled([
        window.PublicAPI.getMembers(),
        window.PublicAPI.getClassRoles(),
        window.PublicAPI.getAnnouncements(10),
        window.PublicAPI.getEvents(10),
        window.PublicAPI.getGallery(),
        window.PublicAPI.getSiteSettings()
      ]);

      let updated = false;

      if (sbMembers.status === 'fulfilled' && Array.isArray(sbMembers.value) && sbMembers.value.length > 0) {
        members = sbMembers.value.map((m) => ({
          id: m.id,
          name: m.name || m.full_name,
          nim: m.nim || 'Belum diberikan',
          role: m.role || 'Mahasiswa',
          is_active: m.is_active
        }));
        updated = true;
      }

      if (sbRoles.status === 'fulfilled' && Array.isArray(sbRoles.value) && sbRoles.value.length > 0) {
        officers = sbRoles.value.map((r) => {
          const memberObj = r.member || r.members;
          return {
            id: r.id,
            title: r.role || r.role_title,
            name: memberObj ? (memberObj.name || memberObj.full_name) : 'Mahasiswa',
            nim: memberObj && memberObj.nim ? memberObj.nim : 'Belum diberikan'
          };
        });
        updated = true;
      }

      if (sbAnnouncements.status === 'fulfilled' && Array.isArray(sbAnnouncements.value) && sbAnnouncements.value.length > 0) {
        announcements = sbAnnouncements.value.map((a) => {
          let dateStr = a.date || a.published_at || 'Terbaru';
          try {
            if (dateStr && dateStr.includes('-')) {
              dateStr = new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
            }
          } catch (_) {}
          return {
            id: a.id,
            title: a.title,
            category: a.category || 'Akademik',
            date: dateStr,
            description: a.content
          };
        });
        updated = true;
      }

      if (sbEvents.status === 'fulfilled' && Array.isArray(sbEvents.value) && sbEvents.value.length > 0) {
        events = sbEvents.value.map((e) => {
          let dateStr = e.date || e.event_date || 'Akan Datang';
          try {
            if (dateStr && dateStr.includes('-')) {
              dateStr = new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
            }
          } catch (_) {}
          return {
            id: e.id,
            title: e.title,
            date: dateStr,
            time: e.time || 'WIB',
            location: e.location || 'Kampus',
            description: e.description || ''
          };
        });
        updated = true;
      }

      if (sbGallery.status === 'fulfilled' && Array.isArray(sbGallery.value) && sbGallery.value.length > 0) {
        gallery = sbGallery.value.map((g) => ({
          id: g.id,
          title: g.title,
          category: g.category || 'Praktikum',
          date: g.date || g.event_date || '2026',
          description: g.description || '',
          badge: g.badge || g.category || 'Dokumentasi'
        }));
        updated = true;
      }

      if (sbSettings.status === 'fulfilled' && sbSettings.value) {
        siteInfo = { ...siteInfo, ...sbSettings.value };
        if (siteInfo.instagram_url) {
          const igLink = document.querySelector('.footer-social-simple a');
          if (igLink) igLink.href = siteInfo.instagram_url;
        }
      }

      if (updated) {
        renderHomeView();
        renderMembers(members);
        renderInfoView();
        renderGallery('Semua');
        renderAboutView();
      }
    } catch (err) {
      console.warn('Sinkronisasi data Supabase dilewati (menggunakan data statis):', err);
    }
  }

  // =========================================================================
  // 10. INISIALISASI AWAL
  // =========================================================================
  function init() {
    // Render seluruh komponen data awal secara sinkron
    renderHomeView();
    renderMembers(members);
    renderInfoView();
    renderGallery('Semua');
    renderAboutView();

    // Baca initial route dari URL Hash
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash && validViews.includes(initialHash)) {
      switchView(initialHash, false);
    } else {
      switchView('home', false);
    }

    // Ambil data terbaru secara asinkron jika Supabase telah dikonfigurasi
    loadFromSupabase();
  }

  init();
});
