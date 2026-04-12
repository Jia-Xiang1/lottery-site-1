import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uhclrilrpbibgdedjlrg.supabase.co';
const supabaseAnonKey = 'sb_publishable_60gSAw07rLwRY6G7nk2QvQ_nnY35AGL';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);