// supabaseClient.ts (BACKEND — server-side only)
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SERVICE_ROLE_KEY; // Add this to your .env
if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase environment variables');
}
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
// ✅ Supabase Admin client for backend (can verify JWT, get user info)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
//# sourceMappingURL=supabaseClient.js.map