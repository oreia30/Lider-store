// ==== CONFIGURAÇÃO SUPABASE ====
// Chave "anon/publishable" é segura para expor no front-end: o acesso de escrita
// é protegido por Row Level Security (só usuários logados no /admin podem alterar dados).
const SUPABASE_URL = "https://ghglzormbwzvfdjzveln.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdoZ2x6b3JtYnd6dmZkanp2ZWxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyMjM0OTYsImV4cCI6MjEwMTc5OTQ5Nn0.A8RP7oGve63IT5Tvxt2oy1mQ50-qg_fwZN_Z8R3bShg";

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const STORE_IMAGES_BUCKET = "store-images";
