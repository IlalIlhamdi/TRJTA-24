/**
 * TRJTA 24 - Supabase Configuration
 * Konfigurasi client Supabase untuk Website Publik & Admin Panel.
 *
 * Kredensial dapat diisi langsung di bawah ini atau disuntikkan via window.__ENV__
 * (misal via Cloudflare Pages Environment Variables / build injection).
 *
 * PERINGATAN KEAMANAN:
 * - HANYA gunakan 'anon' public key di file ini.
 * - JANGAN PERNAH memasukkan 'service_role' key ke frontend!
 */

const SUPABASE_CONFIG = {
  // Masukkan Project URL Supabase Anda (misal: https://xyzcompany.supabase.co)
  url: (typeof window !== 'undefined' && window.__ENV__ && window.__ENV__.SUPABASE_URL) || 'https://zxendvmqadzqrdvnvpqw.supabase.co',

  // Masukkan Project Anon Public Key Supabase Anda (bukan service_role!)
  anonKey: (typeof window !== 'undefined' && window.__ENV__ && window.__ENV__.SUPABASE_ANON_KEY) || 'sb_publishable_du5-3G0bsb-jE_aARC7GEg_0AHOar2v'
};

// Helper untuk memeriksa apakah kredensial Supabase sudah terisi
function isSupabaseConfigured() {
  return Boolean(
    SUPABASE_CONFIG.url && 
    SUPABASE_CONFIG.anonKey && 
    !SUPABASE_CONFIG.url.includes('your-project-id') &&
    !SUPABASE_CONFIG.anonKey.includes('your-anon-key')
  );
}
