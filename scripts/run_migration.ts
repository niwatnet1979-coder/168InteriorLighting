import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = 'https://ulytebnddgcpoyoogigq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVseXRlYm5kZGdjcG95b29naWdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNjg2MjQsImV4cCI6MjA3OTY0NDYyNH0.AbmyjWPJaF3v46DVKeWdmHjua5Qn2jCUNu-NBE4O2BI';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function runSQL() {
    console.log('Running SQL migration...');

    const sqlPath = path.join(__dirname, '..', 'alter_customer_table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
        console.error('Error running SQL:', error);
        console.log('\n⚠️  Note: You may need to run this SQL manually in Supabase SQL Editor:');
        console.log(sql);
    } else {
        console.log('✅ SQL executed successfully!');
    }
}

runSQL();
