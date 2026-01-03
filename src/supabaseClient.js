import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oucjpbzhyjonwrrqkycy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91Y2pwYnpoeWpvbndycnFreWN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0NjAwNzQsImV4cCI6MjA4MzAzNjA3NH0.keR5PoIH3YB8nyYl5REY8XFAbi_7UE03jt-hF0DCfLk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
