// lib/supabaseClient.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey: string = process.env.NEXT_PUBLIC_SUPABASE_KEY as string;

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

export default supabase;
