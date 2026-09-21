/**
 * TRJTA 24 — ADMIN PANEL CONTROLLER
 * Mengelola Autentikasi, SPA Navigation, Modal, Toast, dan CRUD 6 Entitas:
 * Anggota, Pengurus, Pengumuman, Agenda, Galeri, dan Pengaturan Website.
 */

document.addEventListener('DOMContentLoaded', async () => {
  // ---------------------------------------------------------------------------
  // 1. CEK KONFIGURASI SUPABASE & AUTENTIKASI ADMIN
  // ---------------------------------------------------------------------------
  if (typeof isSupabaseConfigured !== 'function' || !isSupabaseConfigured()) {
    alert('Supabase belum dikonfigurasi. Harap periksa assets/js/config.js.');
    window.location.href = '../login/';
    return;
  }

  let currentAdmin = null;
  try {
    const authResult = await window.AuthAPI.requireAdmin();
    if (!authResult) {
      window.location.href = '../login/';
      return;
    }
    currentAdmin = authResult;
  } catch (err) {
    console.error('Pengecekan autentikasi admin gagal:', err);
    window.location.href = '../login/';
    return;
  }

  // Tampilkan data profil admin di antarmuka
  const adminEmailEl = document.getElementById('adminUserEmail');
  if (adminEmailEl && currentAdmin.user) {
    adminEmailEl.textContent = currentAdmin.user.email || 'Administrator';
  }

  // ---------------------------------------------------------------------------
  // 2. TOAST NOTIFICATIONS
  // ---------------------------------------------------------------------------
  const toastContainer = document.getElementById('adminToastContainer');

  function showToast(message, type = 'success') {
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `admin-toast ${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    } else if (type === 'error') {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
    } else {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `
      ${iconSvg}
      <span>${escapeHTML(message)}</span>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // ---------------------------------------------------------------------------
  // 3. UTILITY FUNCTIONS
  // ---------------------------------------------------------------------------
  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatDateID(dateStr) {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (_) {
      return dateStr;
    }
  }

  // ---------------------------------------------------------------------------
  // 4. SIDEBAR NAVIGATION & TAB SWITCHER
  // ---------------------------------------------------------------------------
  const sidebar = document.getElementById('adminSidebar');
  const sidebarBackdrop = document.getElementById('sidebarBackdrop');
  const menuToggleBtn = document.getElementById('menuToggleBtn');
  const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
  const navItems = document.querySelectorAll('.sidebar-nav-item[data-tab]');
  const tabPanes = document.querySelectorAll('.admin-tab-pane');
  const currentTabBreadcrumb = document.getElementById('currentTabBreadcrumb');

  function openSidebar() {
    if (sidebar) sidebar.classList.add('open');
    if (sidebarBackdrop) sidebarBackdrop.classList.add('show');
  }

  function closeSidebar() {
    if (sidebar) sidebar.classList.remove('open');
    if (sidebarBackdrop) sidebarBackdrop.classList.remove('show');
  }

  if (menuToggleBtn) menuToggleBtn.addEventListener('click', openSidebar);
  if (sidebarCloseBtn) sidebarCloseBtn.addEventListener('click', closeSidebar);
  if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeSidebar);

  const tabTitles = {
    dashboard: 'Ringkasan Dashboard',
    members: 'Kelola Anggota Kelas',
    roles: 'Kelola Pengurus Kelas',
    announcements: 'Kelola Pengumuman',
    events: 'Kelola Agenda & Kegiatan',
    gallery: 'Kelola Galeri Dokumentasi',
    settings: 'Pengaturan Website'
  };

  async function switchTab(tabName) {
    navItems.forEach((item) => {
      if (item.getAttribute('data-tab') === tabName) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    tabPanes.forEach((pane) => {
      if (pane.id === `tab-${tabName}`) {
        pane.classList.add('active');
      } else {
        pane.classList.remove('active');
      }
    });

    if (currentTabBreadcrumb) {
      currentTabBreadcrumb.textContent = tabTitles[tabName] || 'Dashboard';
    }

    closeSidebar();

    // Muat data spesifik tab
    if (tabName === 'dashboard') loadDashboard();
    else if (tabName === 'members') loadMembers();
    else if (tabName === 'roles') loadRoles();
    else if (tabName === 'announcements') loadAnnouncements();
    else if (tabName === 'events') loadEvents();
    else if (tabName === 'gallery') loadGallery();
    else if (tabName === 'settings') loadSettings();
  }

  navItems.forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = item.getAttribute('data-tab');
      if (tab) switchTab(tab);
    });
  });

  // Logout Handler
  const logoutBtn = document.getElementById('adminLogoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      if (confirm('Apakah Anda yakin ingin keluar dari panel admin?')) {
        await window.AuthAPI.logout();
        window.location.href = '../login/';
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 5. MODAL & CONFIRMATION MANAGEMENT
  // ---------------------------------------------------------------------------
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  document.querySelectorAll('.admin-modal-backdrop').forEach((backdrop) => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        backdrop.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  });

  document.querySelectorAll('[data-close-modal]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-close-modal');
      closeModal(modalId);
    });
  });

  // Modal Konfirmasi Hapus
  let pendingDeleteAction = null;
  const deleteModal = document.getElementById('deleteConfirmModal');
  const deleteDesc = document.getElementById('deleteConfirmDesc');
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

  function showDeleteConfirm(itemName, onConfirm) {
    pendingDeleteAction = onConfirm;
    if (deleteDesc) {
      deleteDesc.textContent = `Apakah Anda yakin ingin menghapus "${itemName}"? Tindakan ini tidak dapat dibatalkan.`;
    }
    openModal('deleteConfirmModal');
  }

  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', async () => {
      if (typeof pendingDeleteAction === 'function') {
        confirmDeleteBtn.disabled = true;
        try {
          await pendingDeleteAction();
          closeModal('deleteConfirmModal');
        } catch (err) {
          showToast('Gagal menghapus data: ' + err.message, 'error');
        } finally {
          confirmDeleteBtn.disabled = false;
          pendingDeleteAction = null;
        }
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 6. MODULE 1: DASHBOARD OVERVIEW
  // ---------------------------------------------------------------------------
  async function loadDashboard() {
    try {
      const stats = await window.AdminAPI.getStats();
      const elMembers = document.getElementById('kpiTotalMembers');
      const elAnnounce = document.getElementById('kpiTotalAnnounce');
      const elEvents = document.getElementById('kpiTotalEvents');
      const elGallery = document.getElementById('kpiTotalGallery');

      if (elMembers) elMembers.textContent = stats.totalMembers;
      if (elAnnounce) elAnnounce.textContent = stats.totalAnnouncements;
      if (elEvents) elEvents.textContent = stats.totalEvents;
      if (elGallery) elGallery.textContent = stats.totalGallery;

      // Update badge counts di sidebar nav
      const countMembers = document.getElementById('navCountMembers');
      if (countMembers) countMembers.textContent = stats.totalMembers;
    } catch (err) {
      console.error('Error load dashboard stats:', err);
    }
  }

  // Quick Action Buttons on Dashboard
  document.querySelectorAll('[data-goto-tab]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = btn.getAttribute('data-goto-tab');
      if (tab) switchTab(tab);
    });
  });

  // ---------------------------------------------------------------------------
  // 7. MODULE 2: KELOLA ANGGOTA KELAS (MEMBERS CRUD)
  // ---------------------------------------------------------------------------
  let cachedMembers = [];
  const membersTableBody = document.getElementById('membersTableBody');
  const searchMemberAdmin = document.getElementById('searchMemberAdmin');
  const memberForm = document.getElementById('memberForm');

  async function loadMembers() {
    if (!membersTableBody) return;
    membersTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 24px;"><div class="spinner" style="margin: 0 auto;"></div></td></tr>`;
    try {
      cachedMembers = await window.AdminAPI.getMembers();
      renderMembersTable(cachedMembers);
    } catch (err) {
      membersTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: var(--admin-danger); padding: 24px;">Gagal memuat data anggota: ${escapeHTML(err.message)}</td></tr>`;
    }
  }

  function renderMembersTable(membersList) {
    if (!membersTableBody) return;
    if (!membersList || membersList.length === 0) {
      membersTableBody.innerHTML = `
        <tr>
          <td colspan="6">
            <div class="empty-table-state">
              <h4>Tidak ada anggota</h4>
              <p>Belum ada data anggota yang ditemukan.</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    membersTableBody.innerHTML = membersList
      .map((m, idx) => {
        const nimText = m.nim ? escapeHTML(m.nim) : '<span class="badge badge-warning">Belum diberikan</span>';
        const statusBadge = m.is_active
          ? '<span class="badge badge-success">Aktif</span>'
          : '<span class="badge badge-muted">Nonaktif</span>';

        return `
          <tr>
            <td style="color: var(--admin-text-subtle); width: 48px; text-align: center;">${m.display_order || idx + 1}</td>
            <td style="font-weight: 600; color: var(--admin-text-main);">${escapeHTML(m.name)}</td>
            <td>${nimText}</td>
            <td>${escapeHTML(m.nickname || '-')}</td>
            <td>${statusBadge}</td>
            <td>
              <div class="table-actions">
                <button class="btn-icon" data-edit-member="${m.id}" title="Edit Data">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                </button>
                <button class="btn-icon danger" data-delete-member="${m.id}" data-member-name="${escapeHTML(m.name)}" title="Hapus Data">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            </td>
          </tr>
        `;
      })
      .join('');
  }

  if (searchMemberAdmin) {
    searchMemberAdmin.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      const filtered = cachedMembers.filter((m) => {
        const nameMatch = m.name && m.name.toLowerCase().includes(q);
        const nimMatch = m.nim && m.nim.toLowerCase().includes(q);
        return nameMatch || nimMatch;
      });
      renderMembersTable(filtered);
    });
  }

  // Tambah Anggota Button
  const btnAddMember = document.getElementById('btnAddMember');
  if (btnAddMember) {
    btnAddMember.addEventListener('click', () => {
      if (memberForm) {
        memberForm.reset();
        document.getElementById('memberId').value = '';
        document.getElementById('memberIsActive').checked = true;
        document.getElementById('memberDisplayOrder').value = (cachedMembers.length + 1) * 10;
        document.getElementById('memberModalTitle').textContent = 'Tambah Anggota Baru';
      }
      openModal('memberModal');
    });
  }

  // Edit & Delete Event Delegation on Members Table
  if (membersTableBody) {
    membersTableBody.addEventListener('click', (e) => {
      const editBtn = e.target.closest('[data-edit-member]');
      if (editBtn) {
        const id = editBtn.getAttribute('data-edit-member');
        const member = cachedMembers.find((m) => m.id === id);
        if (member) {
          document.getElementById('memberId').value = member.id;
          document.getElementById('memberName').value = member.name || '';
          document.getElementById('memberNim').value = member.nim || '';
          document.getElementById('memberNickname').value = member.nickname || '';
          document.getElementById('memberDescription').value = member.description || '';
          document.getElementById('memberInstagram').value = member.instagram || '';
          document.getElementById('memberGithub').value = member.github || '';
          document.getElementById('memberLinkedin').value = member.linkedin || '';
          document.getElementById('memberDisplayOrder').value = member.display_order || 0;
          document.getElementById('memberIsActive').checked = member.is_active !== false;
          document.getElementById('memberModalTitle').textContent = 'Edit Data Anggota';
          openModal('memberModal');
        }
        return;
      }

      const deleteBtn = e.target.closest('[data-delete-member]');
      if (deleteBtn) {
        const id = deleteBtn.getAttribute('data-delete-member');
        const name = deleteBtn.getAttribute('data-member-name') || 'anggota';
        showDeleteConfirm(name, async () => {
          await window.AdminAPI.deleteMember(id);
          showToast(`Anggota "${name}" berhasil dihapus.`, 'success');
          loadMembers();
          loadDashboard();
        });
      }
    });
  }

  // Simpan Anggota (Create / Update)
  if (memberForm) {
    memberForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('memberId').value;
      const name = document.getElementById('memberName').value.trim();
      const nimInput = document.getElementById('memberNim').value.trim();
      const nickname = document.getElementById('memberNickname').value.trim() || null;
      const description = document.getElementById('memberDescription').value.trim() || null;
      const instagram = document.getElementById('memberInstagram').value.trim() || null;
      const github = document.getElementById('memberGithub').value.trim() || null;
      const linkedin = document.getElementById('memberLinkedin').value.trim() || null;
      const displayOrder = parseInt(document.getElementById('memberDisplayOrder').value, 10) || 0;
      const isActive = document.getElementById('memberIsActive').checked;

      // NIM harus NULL jika dikosongkan (khususnya untuk menjaga data Muhammad Haikal)
      const nim = nimInput.length > 0 ? nimInput : null;

      if (!name) {
        showToast('Nama anggota wajib diisi!', 'error');
        return;
      }

      const payload = {
        name,
        nim,
        nickname,
        description,
        instagram,
        github,
        linkedin,
        display_order: displayOrder,
        is_active: isActive
      };

      const submitBtn = memberForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      try {
        if (id) {
          await window.AdminAPI.updateMember(id, payload);
          showToast('Data anggota berhasil diperbarui.', 'success');
        } else {
          await window.AdminAPI.createMember(payload);
          showToast('Anggota baru berhasil ditambahkan.', 'success');
        }
        closeModal('memberModal');
        loadMembers();
        loadDashboard();
      } catch (err) {
        showToast('Gagal menyimpan anggota: ' + err.message, 'error');
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 8. MODULE 3: KELOLA PENGURUS KELAS (CLASS ROLES CRUD)
  // ---------------------------------------------------------------------------
  let cachedRoles = [];
  const rolesTableBody = document.getElementById('rolesTableBody');
  const roleForm = document.getElementById('roleForm');
  const roleMemberSelect = document.getElementById('roleMemberId');

  async function populateRoleMemberDropdown(selectedId = '') {
    if (!roleMemberSelect) return;
    if (cachedMembers.length === 0) {
      try {
        cachedMembers = await window.AdminAPI.getMembers();
      } catch (_) {}
    }

    roleMemberSelect.innerHTML = `
      <option value="">-- Pilih Mahasiswa --</option>
      ${cachedMembers.map((m) => `
        <option value="${m.id}" ${m.id === selectedId ? 'selected' : ''}>
          ${escapeHTML(m.name)} (NIM: ${escapeHTML(m.nim || 'Belum diberikan')})
        </option>
      `).join('')}
    `;
  }

  async function loadRoles() {
    if (!rolesTableBody) return;
    rolesTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 24px;"><div class="spinner" style="margin: 0 auto;"></div></td></tr>`;
    try {
      cachedRoles = await window.AdminAPI.getClassRoles();
      renderRolesTable(cachedRoles);
    } catch (err) {
      rolesTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--admin-danger); padding: 24px;">Gagal memuat pengurus: ${escapeHTML(err.message)}</td></tr>`;
    }
  }

  function renderRolesTable(rolesList) {
    if (!rolesTableBody) return;
    if (!rolesList || rolesList.length === 0) {
      rolesTableBody.innerHTML = `
        <tr>
          <td colspan="5">
            <div class="empty-table-state">
              <h4>Tidak ada struktur pengurus</h4>
              <p>Tambahkan pengurus kelas melalui tombol di atas.</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    rolesTableBody.innerHTML = rolesList
      .map((r, idx) => {
        const memberName = r.member ? escapeHTML(r.member.name) : '<span style="color:red;">Mahasiswa tidak ditemukan</span>';
        const memberNim = r.member && r.member.nim ? escapeHTML(r.member.nim) : '-';

        return `
          <tr>
            <td style="color: var(--admin-text-subtle); width: 48px; text-align: center;">${r.display_order || idx + 1}</td>
            <td><span class="badge badge-red">${escapeHTML(r.role)}</span></td>
            <td style="font-weight: 600;">${memberName}</td>
            <td>${memberNim}</td>
            <td>
              <div class="table-actions">
                <button class="btn-icon" data-edit-role="${r.id}" title="Edit Jabatan">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                </button>
                <button class="btn-icon danger" data-delete-role="${r.id}" data-role-title="${escapeHTML(r.role)}" title="Hapus Pengurus">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            </td>
          </tr>
        `;
      })
      .join('');
  }

  // Tambah Pengurus Button
  const btnAddRole = document.getElementById('btnAddRole');
  if (btnAddRole) {
    btnAddRole.addEventListener('click', async () => {
      if (roleForm) {
        roleForm.reset();
        document.getElementById('roleId').value = '';
        document.getElementById('roleDisplayOrder').value = (cachedRoles.length + 1) * 10;
        await populateRoleMemberDropdown();
        document.getElementById('roleModalTitle').textContent = 'Tambah Pengurus Kelas';
      }
      openModal('roleModal');
    });
  }

  // Edit & Delete Event Delegation on Roles Table
  if (rolesTableBody) {
    rolesTableBody.addEventListener('click', async (e) => {
      const editBtn = e.target.closest('[data-edit-role]');
      if (editBtn) {
        const id = editBtn.getAttribute('data-edit-role');
        const role = cachedRoles.find((r) => r.id === id);
        if (role) {
          document.getElementById('roleId').value = role.id;
          await populateRoleMemberDropdown(role.member_id);
          document.getElementById('roleTitleInput').value = role.role || '';
          document.getElementById('roleDisplayOrder').value = role.display_order || 0;
          document.getElementById('roleModalTitle').textContent = 'Edit Pengurus Kelas';
          openModal('roleModal');
        }
        return;
      }

      const deleteBtn = e.target.closest('[data-delete-role]');
      if (deleteBtn) {
        const id = deleteBtn.getAttribute('data-delete-role');
        const title = deleteBtn.getAttribute('data-role-title') || 'pengurus';
        showDeleteConfirm(`Jabatan ${title}`, async () => {
          await window.AdminAPI.deleteClassRole(id);
          showToast(`Pengurus "${title}" berhasil dihapus.`, 'success');
          loadRoles();
        });
      }
    });
  }

  // Simpan Pengurus (Create / Update)
  if (roleForm) {
    roleForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('roleId').value;
      const memberId = document.getElementById('roleMemberId').value;
      const roleTitle = document.getElementById('roleTitleInput').value.trim();
      const displayOrder = parseInt(document.getElementById('roleDisplayOrder').value, 10) || 0;

      if (!memberId) {
        showToast('Pilih anggota terlebih dahulu!', 'error');
        return;
      }
      if (!roleTitle) {
        showToast('Nama jabatan harus diisi!', 'error');
        return;
      }

      const payload = {
        member_id: memberId,
        role: roleTitle,
        display_order: displayOrder
      };

      const submitBtn = roleForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      try {
        if (id) {
          await window.AdminAPI.updateClassRole(id, payload);
          showToast('Jabatan pengurus berhasil diperbarui.', 'success');
        } else {
          await window.AdminAPI.createClassRole(payload);
          showToast('Pengurus baru berhasil ditambahkan.', 'success');
        }
        closeModal('roleModal');
        loadRoles();
      } catch (err) {
        showToast('Gagal menyimpan pengurus: ' + err.message, 'error');
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 9. MODULE 4: KELOLA PENGUMUMAN (ANNOUNCEMENTS CRUD)
  // ---------------------------------------------------------------------------
  let cachedAnnouncements = [];
  const announcementsTableBody = document.getElementById('announcementsTableBody');
  const announcementForm = document.getElementById('announcementForm');

  async function loadAnnouncements() {
    if (!announcementsTableBody) return;
    announcementsTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 24px;"><div class="spinner" style="margin: 0 auto;"></div></td></tr>`;
    try {
      cachedAnnouncements = await window.AdminAPI.getAnnouncements();
      renderAnnouncementsTable(cachedAnnouncements);
    } catch (err) {
      announcementsTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--admin-danger); padding: 24px;">Gagal memuat pengumuman: ${escapeHTML(err.message)}</td></tr>`;
    }
  }

  function renderAnnouncementsTable(list) {
    if (!announcementsTableBody) return;
    if (!list || list.length === 0) {
      announcementsTableBody.innerHTML = `
        <tr>
          <td colspan="5">
            <div class="empty-table-state">
              <h4>Belum Ada Pengumuman</h4>
              <p>Publikasikan pengumuman baru melalui tombol di atas.</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    announcementsTableBody.innerHTML = list
      .map((a) => {
        const pinBadge = a.is_pinned
          ? '<span class="badge badge-warning" style="margin-left: 6px;">Pinned</span>'
          : '';
        const statusBadge = a.is_published
          ? '<span class="badge badge-success">Terbit</span>'
          : '<span class="badge badge-muted">Draft</span>';

        return `
          <tr>
            <td>${formatDateID(a.date)}</td>
            <td style="font-weight: 600; color: var(--admin-text-main);">
              ${escapeHTML(a.title)} ${pinBadge}
            </td>
            <td><span class="badge badge-red">${escapeHTML(a.content ? a.content.substring(0, 45) + '...' : '-')}</span></td>
            <td>${statusBadge}</td>
            <td>
              <div class="table-actions">
                <button class="btn-icon" data-edit-announce="${a.id}" title="Edit Pengumuman">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                </button>
                <button class="btn-icon danger" data-delete-announce="${a.id}" data-announce-title="${escapeHTML(a.title)}" title="Hapus Pengumuman">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            </td>
          </tr>
        `;
      })
      .join('');
  }

  // Tambah Pengumuman Button
  const btnAddAnnouncement = document.getElementById('btnAddAnnouncement');
  if (btnAddAnnouncement) {
    btnAddAnnouncement.addEventListener('click', () => {
      if (announcementForm) {
        announcementForm.reset();
        document.getElementById('announcementId').value = '';
        document.getElementById('announcementDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('announcementIsPublished').checked = true;
        document.getElementById('announcementIsPinned').checked = false;
        document.getElementById('announcementModalTitle').textContent = 'Buat Pengumuman Baru';
      }
      openModal('announcementModal');
    });
  }

  // Edit & Delete on Announcements Table
  if (announcementsTableBody) {
    announcementsTableBody.addEventListener('click', (e) => {
      const editBtn = e.target.closest('[data-edit-announce]');
      if (editBtn) {
        const id = editBtn.getAttribute('data-edit-announce');
        const item = cachedAnnouncements.find((a) => a.id === id);
        if (item) {
          document.getElementById('announcementId').value = item.id;
          document.getElementById('announcementTitle').value = item.title || '';
          document.getElementById('announcementContent').value = item.content || '';
          document.getElementById('announcementDate').value = item.date || new Date().toISOString().split('T')[0];
          document.getElementById('announcementIsPublished').checked = item.is_published !== false;
          document.getElementById('announcementIsPinned').checked = item.is_pinned === true;
          document.getElementById('announcementModalTitle').textContent = 'Edit Pengumuman';
          openModal('announcementModal');
        }
        return;
      }

      const deleteBtn = e.target.closest('[data-delete-announce]');
      if (deleteBtn) {
        const id = deleteBtn.getAttribute('data-delete-announce');
        const title = deleteBtn.getAttribute('data-announce-title') || 'pengumuman';
        showDeleteConfirm(title, async () => {
          await window.AdminAPI.deleteAnnouncement(id);
          showToast(`Pengumuman "${title}" berhasil dihapus.`, 'success');
          loadAnnouncements();
          loadDashboard();
        });
      }
    });
  }

  // Submit Pengumuman Form
  if (announcementForm) {
    announcementForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('announcementId').value;
      const title = document.getElementById('announcementTitle').value.trim();
      const content = document.getElementById('announcementContent').value.trim();
      const date = document.getElementById('announcementDate').value;
      const isPublished = document.getElementById('announcementIsPublished').checked;
      const isPinned = document.getElementById('announcementIsPinned').checked;

      if (!title || !content) {
        showToast('Judul dan isi pengumuman wajib diisi!', 'error');
        return;
      }

      const payload = {
        title,
        content,
        date: date || new Date().toISOString().split('T')[0],
        is_published: isPublished,
        is_pinned: isPinned
      };

      const submitBtn = announcementForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      try {
        if (id) {
          await window.AdminAPI.updateAnnouncement(id, payload);
          showToast('Pengumuman berhasil diperbarui.', 'success');
        } else {
          await window.AdminAPI.createAnnouncement(payload);
          showToast('Pengumuman berhasil dipublikasikan.', 'success');
        }
        closeModal('announcementModal');
        loadAnnouncements();
        loadDashboard();
      } catch (err) {
        showToast('Gagal menyimpan pengumuman: ' + err.message, 'error');
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 10. MODULE 5: KELOLA AGENDA & KEGIATAN (EVENTS CRUD)
  // ---------------------------------------------------------------------------
  let cachedEvents = [];
  const eventsTableBody = document.getElementById('eventsTableBody');
  const eventForm = document.getElementById('eventForm');

  async function loadEvents() {
    if (!eventsTableBody) return;
    eventsTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 24px;"><div class="spinner" style="margin: 0 auto;"></div></td></tr>`;
    try {
      cachedEvents = await window.AdminAPI.getEvents();
      renderEventsTable(cachedEvents);
    } catch (err) {
      eventsTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--admin-danger); padding: 24px;">Gagal memuat agenda: ${escapeHTML(err.message)}</td></tr>`;
    }
  }

  function renderEventsTable(list) {
    if (!eventsTableBody) return;
    if (!list || list.length === 0) {
      eventsTableBody.innerHTML = `
        <tr>
          <td colspan="5">
            <div class="empty-table-state">
              <h4>Belum Ada Agenda Kegiatan</h4>
              <p>Tambahkan agenda kelas menggunakan tombol di atas.</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    eventsTableBody.innerHTML = list
      .map((e) => {
        const statusBadge = e.is_published
          ? '<span class="badge badge-success">Terbit</span>'
          : '<span class="badge badge-muted">Draft</span>';

        return `
          <tr>
            <td>${formatDateID(e.date)}</td>
            <td style="font-weight: 600; color: var(--admin-text-main);">${escapeHTML(e.title)}</td>
            <td>${escapeHTML(e.location || '-')}</td>
            <td>${statusBadge}</td>
            <td>
              <div class="table-actions">
                <button class="btn-icon" data-edit-event="${e.id}" title="Edit Agenda">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                </button>
                <button class="btn-icon danger" data-delete-event="${e.id}" data-event-title="${escapeHTML(e.title)}" title="Hapus Agenda">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            </td>
          </tr>
        `;
      })
      .join('');
  }

  // Tambah Agenda Button
  const btnAddEvent = document.getElementById('btnAddEvent');
  if (btnAddEvent) {
    btnAddEvent.addEventListener('click', () => {
      if (eventForm) {
        eventForm.reset();
        document.getElementById('eventId').value = '';
        document.getElementById('eventDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('eventIsPublished').checked = true;
        document.getElementById('eventModalTitle').textContent = 'Tambah Agenda Kegiatan Baru';
      }
      openModal('eventModal');
    });
  }

  // Edit & Delete on Events Table
  if (eventsTableBody) {
    eventsTableBody.addEventListener('click', (e) => {
      const editBtn = e.target.closest('[data-edit-event]');
      if (editBtn) {
        const id = editBtn.getAttribute('data-edit-event');
        const item = cachedEvents.find((ev) => ev.id === id);
        if (item) {
          document.getElementById('eventId').value = item.id;
          document.getElementById('eventTitle').value = item.title || '';
          document.getElementById('eventLocation').value = item.location || '';
          document.getElementById('eventDescription').value = item.description || '';
          document.getElementById('eventDate').value = item.date ? item.date.split('T')[0] : '';
          document.getElementById('eventIsPublished').checked = item.is_published !== false;
          document.getElementById('eventModalTitle').textContent = 'Edit Agenda Kegiatan';
          openModal('eventModal');
        }
        return;
      }

      const deleteBtn = e.target.closest('[data-delete-event]');
      if (deleteBtn) {
        const id = deleteBtn.getAttribute('data-delete-event');
        const title = deleteBtn.getAttribute('data-event-title') || 'agenda';
        showDeleteConfirm(title, async () => {
          await window.AdminAPI.deleteEvent(id);
          showToast(`Agenda "${title}" berhasil dihapus.`, 'success');
          loadEvents();
          loadDashboard();
        });
      }
    });
  }

  // Submit Event Form
  if (eventForm) {
    eventForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('eventId').value;
      const title = document.getElementById('eventTitle').value.trim();
      const location = document.getElementById('eventLocation').value.trim();
      const description = document.getElementById('eventDescription').value.trim();
      const date = document.getElementById('eventDate').value;
      const isPublished = document.getElementById('eventIsPublished').checked;

      if (!title || !location || !date) {
        showToast('Judul, lokasi, dan tanggal agenda wajib diisi!', 'error');
        return;
      }

      const payload = {
        title,
        location,
        description,
        date: new Date(date).toISOString(),
        is_published: isPublished
      };

      const submitBtn = eventForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      try {
        if (id) {
          await window.AdminAPI.updateEvent(id, payload);
          showToast('Agenda kegiatan berhasil diperbarui.', 'success');
        } else {
          await window.AdminAPI.createEvent(payload);
          showToast('Agenda kegiatan berhasil ditambahkan.', 'success');
        }
        closeModal('eventModal');
        loadEvents();
        loadDashboard();
      } catch (err) {
        showToast('Gagal menyimpan agenda: ' + err.message, 'error');
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 11. MODULE 6: KELOLA GALERI (GALLERY CRUD - TANPA UPLOAD FOTO)
  // ---------------------------------------------------------------------------
  let cachedGallery = [];
  const galleryTableBody = document.getElementById('galleryTableBody');
  const galleryForm = document.getElementById('galleryForm');

  async function loadGallery() {
    if (!galleryTableBody) return;
    galleryTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 24px;"><div class="spinner" style="margin: 0 auto;"></div></td></tr>`;
    try {
      cachedGallery = await window.AdminAPI.getGallery();
      renderGalleryTable(cachedGallery);
    } catch (err) {
      galleryTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--admin-danger); padding: 24px;">Gagal memuat galeri: ${escapeHTML(err.message)}</td></tr>`;
    }
  }

  function renderGalleryTable(list) {
    if (!galleryTableBody) return;
    if (!list || list.length === 0) {
      galleryTableBody.innerHTML = `
        <tr>
          <td colspan="5">
            <div class="empty-table-state">
              <h4>Belum Ada Item Galeri</h4>
              <p>Tambahkan item dokumentasi melalui tombol di atas.</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    galleryTableBody.innerHTML = list
      .map((g) => {
        const statusBadge = g.is_published
          ? '<span class="badge badge-success">Terbit</span>'
          : '<span class="badge badge-muted">Draft</span>';

        return `
          <tr>
            <td><span class="badge badge-red">${escapeHTML(g.category)}</span></td>
            <td style="font-weight: 600; color: var(--admin-text-main);">${escapeHTML(g.title)}</td>
            <td>${escapeHTML(g.date || '-')}</td>
            <td>${statusBadge}</td>
            <td>
              <div class="table-actions">
                <button class="btn-icon" data-edit-gallery="${g.id}" title="Edit Galeri">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                </button>
                <button class="btn-icon danger" data-delete-gallery="${g.id}" data-gallery-title="${escapeHTML(g.title)}" title="Hapus Galeri">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            </td>
          </tr>
        `;
      })
      .join('');
  }

  // Tambah Item Galeri Button
  const btnAddGallery = document.getElementById('btnAddGallery');
  if (btnAddGallery) {
    btnAddGallery.addEventListener('click', () => {
      if (galleryForm) {
        galleryForm.reset();
        document.getElementById('galleryId').value = '';
        document.getElementById('galleryDate').value = 'September 2026';
        document.getElementById('galleryIsPublished').checked = true;
        document.getElementById('galleryModalTitle').textContent = 'Tambah Item Dokumentasi Baru';
      }
      openModal('galleryModal');
    });
  }

  // Edit & Delete on Gallery Table
  if (galleryTableBody) {
    galleryTableBody.addEventListener('click', (e) => {
      const editBtn = e.target.closest('[data-edit-gallery]');
      if (editBtn) {
        const id = editBtn.getAttribute('data-edit-gallery');
        const item = cachedGallery.find((g) => g.id === id);
        if (item) {
          document.getElementById('galleryId').value = item.id;
          document.getElementById('galleryTitle').value = item.title || '';
          document.getElementById('galleryCategory').value = item.category || 'Praktikum';
          document.getElementById('galleryDate').value = item.date || '';
          document.getElementById('galleryDescription').value = item.description || '';
          document.getElementById('galleryIsPublished').checked = item.is_published !== false;
          document.getElementById('galleryModalTitle').textContent = 'Edit Item Galeri';
          openModal('galleryModal');
        }
        return;
      }

      const deleteBtn = e.target.closest('[data-delete-gallery]');
      if (deleteBtn) {
        const id = deleteBtn.getAttribute('data-delete-gallery');
        const title = deleteBtn.getAttribute('data-gallery-title') || 'item galeri';
        showDeleteConfirm(title, async () => {
          await window.AdminAPI.deleteGalleryItem(id);
          showToast(`Item galeri "${title}" berhasil dihapus.`, 'success');
          loadGallery();
          loadDashboard();
        });
      }
    });
  }

  // Submit Gallery Form
  if (galleryForm) {
    galleryForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('galleryId').value;
      const title = document.getElementById('galleryTitle').value.trim();
      const category = document.getElementById('galleryCategory').value;
      const date = document.getElementById('galleryDate').value.trim();
      const description = document.getElementById('galleryDescription').value.trim();
      const isPublished = document.getElementById('galleryIsPublished').checked;

      if (!title || !description) {
        showToast('Judul dan deskripsi galeri wajib diisi!', 'error');
        return;
      }

      const payload = {
        title,
        category,
        date: date || '2026',
        description,
        is_published: isPublished
      };

      const submitBtn = galleryForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      try {
        if (id) {
          await window.AdminAPI.updateGalleryItem(id, payload);
          showToast('Item galeri berhasil diperbarui.', 'success');
        } else {
          await window.AdminAPI.createGalleryItem(payload);
          showToast('Item galeri baru berhasil ditambahkan.', 'success');
        }
        closeModal('galleryModal');
        loadGallery();
        loadDashboard();
      } catch (err) {
        showToast('Gagal menyimpan galeri: ' + err.message, 'error');
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 12. MODULE 7: PENGATURAN WEBSITE (SITE SETTINGS)
  // ---------------------------------------------------------------------------
  const settingsForm = document.getElementById('siteSettingsForm');

  async function loadSettings() {
    if (!settingsForm) return;
    try {
      const data = await window.AdminAPI.getSiteSettings();
      if (!data) return;

      document.getElementById('setSiteName').value = data.site_name || '';
      document.getElementById('setProgramName').value = data.program_name || '';
      document.getElementById('setTagline').value = data.tagline || '';
      document.getElementById('setClassDesc').value = data.class_description || '';
      document.getElementById('setBatchYear').value = data.batch_year || '';
      document.getElementById('setHeroTitle').value = data.hero_title || '';
      document.getElementById('setHeroSubtitle').value = data.hero_subtitle || '';
      document.getElementById('setInstagram').value = data.instagram_url || '';
      document.getElementById('setWhatsapp').value = data.whatsapp_url || '';
      document.getElementById('setEmail').value = data.email || '';
      document.getElementById('setFooterText').value = data.footer_text || '';
    } catch (err) {
      showToast('Gagal memuat pengaturan website: ' + err.message, 'error');
    }
  }

  if (settingsForm) {
    settingsForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const payload = {
        site_name: document.getElementById('setSiteName').value.trim(),
        program_name: document.getElementById('setProgramName').value.trim(),
        tagline: document.getElementById('setTagline').value.trim(),
        class_description: document.getElementById('setClassDesc').value.trim(),
        batch_year: document.getElementById('setBatchYear').value.trim(),
        hero_title: document.getElementById('setHeroTitle').value.trim(),
        hero_subtitle: document.getElementById('setHeroSubtitle').value.trim(),
        instagram_url: document.getElementById('setInstagram').value.trim(),
        whatsapp_url: document.getElementById('setWhatsapp').value.trim(),
        email: document.getElementById('setEmail').value.trim(),
        footer_text: document.getElementById('setFooterText').value.trim()
      };

      const submitBtn = settingsForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      try {
        await window.AdminAPI.updateSiteSettings(payload);
        showToast('Pengaturan website berhasil disimpan!', 'success');
      } catch (err) {
        showToast('Gagal menyimpan pengaturan: ' + err.message, 'error');
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 13. INISIALISASI AWAL DASHBOARD
  // ---------------------------------------------------------------------------
  switchTab('dashboard');
});
