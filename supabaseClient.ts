import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://laxiquhklwllkrpohmdz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxheGlxdWhrbHdsbGtycG9obWR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1OTE1OTcsImV4cCI6MjA3NzE2NzU5N30.ZuYAAeZHHFL9VUUxenJJxkHZJ4nMYp_4wt5SnJjDqV4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
