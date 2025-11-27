import { createClient } from '@supabase/supabase-js';

// Replace with your actual Supabase URL and Key
const SUPABASE_URL = 'https://ulytebnddgcpoyoogigq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVseXRlYm5kZGdjcG95b29naWdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNjg2MjQsImV4cCI6MjA3OTY0NDYyNH0.AbmyjWPJaF3v46DVKeWdmHjua5Qn2jCUNu-NBE4O2BI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Realtime Subscription Helper
export const subscribeToTable = (tableName: string, callback: (payload: any) => void) => {
    return supabase
        .channel(`public:${tableName}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, callback)
        .subscribe();
};
