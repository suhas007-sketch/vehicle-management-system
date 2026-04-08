import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://jkxejfgutevcgzaxkcac.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpreGVqZmd1dGV2Y2d6YXhrY2FjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwMjk3OTAsImV4cCI6MjA5MDYwNTc5MH0.wzXeaiWssnrPe5QAH2mIxu7JoEGNl0nUyqg8bWaN50g";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

