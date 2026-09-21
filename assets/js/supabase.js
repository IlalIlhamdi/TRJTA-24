/**
 * TRJTA 24 - Supabase Service & Helper Module
 * Menyediakan inisialisasi client Supabase, Auth Guard, dan API CRUD untuk Public & Admin.
 */

let _supabaseClient = null;

function getSupabase() {
  if (_supabaseClient) return _supabaseClient;

  if (typeof supabase === 'undefined' || !supabase.createClient) {
    console.warn('Supabase JS SDK belum dimuat di halaman ini.');
    return null;
  }

  if (!isSupabaseConfigured()) {
    console.warn('Kredensial Supabase belum dikonfigurasi di assets/js/config.js. Mode fallback aktif.');
    return null;
  }

  try {
    _supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
    return _supabaseClient;
  } catch (err) {
    console.error('Gagal menginisialisasi Supabase client:', err);
    return null;
  }
}

// ==============================================================================
// 1. AUTHENTICATION & ROLE MANAGEMENT (ADMIN ONLY)
// ==============================================================================

const AuthAPI = {
  /**
   * Login khusus Admin (Email + Password)
   * Memverifikasi kredensial dan memastikan role pada tabel profiles adalah 'admin'
   */
  async login(email, password) {
    const client = getSupabase();
    if (!client) throw new Error('Supabase belum dikonfigurasi dengan benar.');

    // 1. Autentikasi dengan Supabase Auth
    const { data: authData, error: authError } = await client.auth.signInWithPassword({
      email: email.trim(),
      password: password
    });

    if (authError) throw authError;
    if (!authData || !authData.user) throw new Error('Autentikasi gagal.');

    // 2. Verifikasi Role Admin di tabel profiles
    const { data: profile, error: profileError } = await client
      .from('profiles')
      .select('role, email')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      // Jika bukan admin, segera logout untuk keamanan
      await client.auth.signOut();
      throw new Error('Akses ditolak: Akun Anda tidak memiliki hak akses sebagai Administrator!');
    }

    return { user: authData.user, profile };
  },

  /**
   * Logout Admin & bersihkan session
   */
  async logout() {
    const client = getSupabase();
    if (client) {
      await client.auth.signOut();
    }
  },

  /**
   * Mendapatkan sesi user saat ini
   */
  async getSession() {
    const client = getSupabase();
    if (!client) return null;
    const { data: { session } } = await client.auth.getSession();
    return session;
  },

  /**
   * Mendapatkan user Supabase saat ini
   */
  async getUser() {
    const client = getSupabase();
    if (!client) return null;
    const { data: { user } } = await client.auth.getUser();
    return user;
  },

  /**
   * Memeriksa apakah user saat ini memiliki role admin
   */
  async isAdmin() {
    const result = await this.requireAdmin();
    return Boolean(result);
  },

  /**
   * Memeriksa apakah user saat ini login dan benar-benar berstatus Admin
   */
  async requireAdmin() {
    const client = getSupabase();
    if (!client) return null;

    const { data: { session } } = await client.auth.getSession();
    if (!session || !session.user) return null;

    const { data: profile, error } = await client
      .from('profiles')
      .select('id, email, role')
      .eq('id', session.user.id)
      .single();

    if (error || !profile || profile.role !== 'admin') {
      return null;
    }

    return { user: session.user, profile };
  }
};

// ==============================================================================
// 2. PUBLIC READ APIS (READ / SELECT ONLY)
// ==============================================================================

const PublicAPI = {
  /**
   * Mengambil data pengaturan website
   */
  async getSiteSettings() {
    const client = getSupabase();
    if (!client) return null;

    const { data, error } = await client
      .from('site_settings')
      .select('*')
      .eq('id', 'general')
      .single();

    if (error) {
      console.warn('Gagal memuat site_settings dari Supabase:', error.message);
      return null;
    }
    return data;
  },

  /**
   * Mengambil daftar anggota aktif (is_active = true)
   */
  async getMembers() {
    const client = getSupabase();
    if (!client) return null;

    const { data, error } = await client
      .from('members')
      .select('id, nim, name, nickname, description, instagram, github, linkedin, display_order, is_active')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.warn('Gagal memuat members dari Supabase:', error.message);
      return null;
    }
    return data;
  },

  /**
   * Mengambil daftar struktur pengurus kelas
   */
  async getClassRoles() {
    const client = getSupabase();
    if (!client) return null;

    const { data, error } = await client
      .from('class_roles')
      .select('id, role, display_order, member:members(id, name, nim, is_active)')
      .order('display_order', { ascending: true });

    if (error) {
      console.warn('Gagal memuat class_roles dari Supabase:', error.message);
      return null;
    }
    return data;
  },

  /**
   * Mengambil pengumuman terbit (pinned paling atas, lalu terbaru)
   */
  async getAnnouncements(limit = null) {
    const client = getSupabase();
    if (!client) return null;

    let query = client
      .from('announcements')
      .select('id, title, content, date, is_pinned')
      .eq('is_published', true)
      .order('is_pinned', { ascending: false })
      .order('date', { ascending: false });

    if (limit) query = query.limit(limit);

    const { data, error } = await query;
    if (error) {
      console.warn('Gagal memuat announcements dari Supabase:', error.message);
      return null;
    }
    return data;
  },

  /**
   * Mengambil agenda kegiatan kelas terbit
   */
  async getEvents(limit = null) {
    const client = getSupabase();
    if (!client) return null;

    let query = client
      .from('events')
      .select('id, title, description, date, location')
      .eq('is_published', true)
      .order('date', { ascending: true });

    if (limit) query = query.limit(limit);

    const { data, error } = await query;
    if (error) {
      console.warn('Gagal memuat events dari Supabase:', error.message);
      return null;
    }
    return data;
  },

  /**
   * Mengambil item galeri terbit
   */
  async getGallery(category = 'Semua') {
    const client = getSupabase();
    if (!client) return null;

    let query = client
      .from('gallery_items')
      .select('id, title, category, date, description')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (category && category !== 'Semua') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) {
      console.warn('Gagal memuat gallery dari Supabase:', error.message);
      return null;
    }
    return data;
  }
};

// ==============================================================================
// 3. ADMIN CRUD APIS (DILINDUNGI RLS & ADMIN ROLE)
// ==============================================================================

const AdminAPI = {
  // --- STATS OVERVIEW ---
  async getStats() {
    const client = getSupabase();
    if (!client) throw new Error('Client belum siap');

    const [membersRes, announcementsRes, eventsRes, galleryRes] = await Promise.all([
      client.from('members').select('id', { count: 'exact', head: true }).eq('is_active', true),
      client.from('announcements').select('id', { count: 'exact', head: true }),
      client.from('events').select('id', { count: 'exact', head: true }),
      client.from('gallery_items').select('id', { count: 'exact', head: true })
    ]);

    return {
      totalMembers: membersRes.count || 0,
      totalAnnouncements: announcementsRes.count || 0,
      totalEvents: eventsRes.count || 0,
      totalGallery: galleryRes.count || 0
    };
  },

  // --- KELOLA ANGGOTA ---
  async getMembers() {
    const client = getSupabase();
    const { data, error } = await client
      .from('members')
      .select('*')
      .order('display_order', { ascending: true })
      .order('name', { ascending: true });
    if (error) throw error;
    return data;
  },

  async createMember(memberData) {
    const client = getSupabase();
    const { data, error } = await client.from('members').insert([memberData]).select();
    if (error) throw error;
    return data;
  },

  async updateMember(id, memberData) {
    const client = getSupabase();
    const { data, error } = await client.from('members').update(memberData).eq('id', id).select();
    if (error) throw error;
    return data;
  },

  async deleteMember(id) {
    const client = getSupabase();
    const { error } = await client.from('members').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  // --- KELOLA PENGURUS ---
  async getClassRoles() {
    const client = getSupabase();
    const { data, error } = await client
      .from('class_roles')
      .select('id, role, display_order, member_id, member:members(id, name, nim)')
      .order('display_order', { ascending: true });
    if (error) throw error;
    return data;
  },

  async createClassRole(roleData) {
    const client = getSupabase();
    const { data, error } = await client.from('class_roles').insert([roleData]).select();
    if (error) throw error;
    return data;
  },

  async updateClassRole(id, roleData) {
    const client = getSupabase();
    const { data, error } = await client.from('class_roles').update(roleData).eq('id', id).select();
    if (error) throw error;
    return data;
  },

  async deleteClassRole(id) {
    const client = getSupabase();
    const { error } = await client.from('class_roles').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  // --- KELOLA PENGUMUMAN ---
  async getAnnouncements() {
    const client = getSupabase();
    const { data, error } = await client
      .from('announcements')
      .select('*')
      .order('is_pinned', { ascending: false })
      .order('date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async createAnnouncement(announcementData) {
    const client = getSupabase();
    const { data, error } = await client.from('announcements').insert([announcementData]).select();
    if (error) throw error;
    return data;
  },

  async updateAnnouncement(id, announcementData) {
    const client = getSupabase();
    const { data, error } = await client.from('announcements').update(announcementData).eq('id', id).select();
    if (error) throw error;
    return data;
  },

  async deleteAnnouncement(id) {
    const client = getSupabase();
    const { error } = await client.from('announcements').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  // --- KELOLA AGENDA ---
  async getEvents() {
    const client = getSupabase();
    const { data, error } = await client
      .from('events')
      .select('*')
      .order('date', { ascending: true });
    if (error) throw error;
    return data;
  },

  async createEvent(eventData) {
    const client = getSupabase();
    const { data, error } = await client.from('events').insert([eventData]).select();
    if (error) throw error;
    return data;
  },

  async updateEvent(id, eventData) {
    const client = getSupabase();
    const { data, error } = await client.from('events').update(eventData).eq('id', id).select();
    if (error) throw error;
    return data;
  },

  async deleteEvent(id) {
    const client = getSupabase();
    const { error } = await client.from('events').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  // --- KELOLA GALERI ---
  async getGallery() {
    const client = getSupabase();
    const { data, error } = await client
      .from('gallery_items')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async createGalleryItem(itemData) {
    const client = getSupabase();
    const { data, error } = await client.from('gallery_items').insert([itemData]).select();
    if (error) throw error;
    return data;
  },

  async updateGalleryItem(id, itemData) {
    const client = getSupabase();
    const { data, error } = await client.from('gallery_items').update(itemData).eq('id', id).select();
    if (error) throw error;
    return data;
  },

  async deleteGalleryItem(id) {
    const client = getSupabase();
    const { error } = await client.from('gallery_items').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  // --- PENGATURAN WEBSITE ---
  async getSiteSettings() {
    const client = getSupabase();
    const { data, error } = await client
      .from('site_settings')
      .select('*')
      .eq('id', 'general')
      .single();
    if (error) throw error;
    return data;
  },

  async updateSiteSettings(settingsData) {
    const client = getSupabase();
    const { data, error } = await client
      .from('site_settings')
      .update(settingsData)
      .eq('id', 'general')
      .select();
    if (error) throw error;
    return data;
  }
};

// Ekspor ke window global untuk akses di browser
if (typeof window !== 'undefined') {
  window.getSupabase = getSupabase;
  window.AuthAPI = AuthAPI;
  window.PublicAPI = PublicAPI;
  window.AdminAPI = AdminAPI;
}
