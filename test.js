import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://fyyilfwujicikshqfcul.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5eWlsZnd1amljaWtzaHFmY3VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4NTI5NDgsImV4cCI6MjA4ODQyODk0OH0.tBOFhir3vOME-Lc_O2KDqmS-w6ksamIviIXYKBZgev4';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    const { data, error } = await supabase
        .from('movement_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    fs.writeFileSync('data2.json', JSON.stringify(data, null, 2), 'utf8');
    if (error) console.error(error);
}

checkData();
